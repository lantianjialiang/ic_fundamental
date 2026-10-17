/**
 * lot.js — 批量运行与统计
 * 一次跑 N 颗 die，分块产出进度（生成器），汇总良率、Bin 分布、各测试项通过率、
 * 过杀率/漏检率、复测收益、Cpk，以及 CSV 导出。此文件不访问 DOM。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Rng = ATE.Rng || (typeof require !== 'undefined' ? require('./rng.js') : null);
  var DUT = ATE.DUT || (typeof require !== 'undefined' ? require('./dut.js') : null);
  var Instruments = ATE.Instruments || (typeof require !== 'undefined' ? require('./instruments.js') : null);
  var Flow = ATE.Flow || (typeof require !== 'undefined' ? require('./flow.js') : null);

  /** DEFAULT_REQUEST：批量运行的默认参数 */
  var DEFAULT_REQUEST = {
    count: 500,
    seed: 20261017,
    stopOnFirstFail: true,
    retest: 0,
    chunk: 100,
    config: {},
    instrumentConfig: {}
  };

  /**
   * lotSteps：批量执行生成器，每 chunk 颗 yield 一次进度
   * @returns {Generator} 最后 return 汇总对象 {records, stats, request}
   */
  function* lotSteps(request) {
    var req = {};
    Object.keys(DEFAULT_REQUEST).forEach(function (k) {
      req[k] = request[k] === undefined ? DEFAULT_REQUEST[k] : request[k];
    });
    var count = Math.max(1, Math.min(20000, Math.round(req.count)));
    var retest = Math.max(0, Math.min(5, Math.round(req.retest || 0)));
    var chunk = Math.max(10, Math.round(req.chunk || 100));
    var program = request.program;

    var inst = Instruments.createInstruments(req.instrumentConfig, Rng.mixSeed(req.seed, 991));
    var records = [];
    var yieldBeforeRetestCount = 0;

    for (var i = 0; i < count; i++) {
      var die = DUT.generateDie(req.seed, req.config, i);
      inst.beginTouch(i, count);
      var res = Flow.run(die, program, { instruments: inst, stopOnFirstFail: req.stopOnFirstFail });
      var firstBin = res.bin;
      var attempts = 1;
      var retestTime = 0;
      if (firstBin === 1) yieldBeforeRetestCount++;

      while (res.bin !== 1 && attempts <= retest) {
        inst.beginTouch(i, count);
        var again = Flow.run(die, program, { instruments: inst, stopOnFirstFail: req.stopOnFirstFail });
        retestTime += again.timeMs;
        res = again;
        attempts++;
      }

      var values = {};
      var passes = {};
      res.results.forEach(function (r) {
        values[r.id] = r.value;
        passes[r.id] = r.pass;
      });

      records.push({
        index: die.index,
        wafer: die.wafer,
        x: die.x,
        y: die.y,
        bin: res.bin,
        firstBin: firstBin,
        trueGood: die.trueGood,
        process: die.process,
        attempts: attempts,
        timeMs: res.timeMs,
        retestTimeMs: retestTime,
        failItem: res.failItem,
        values: values,
        passes: passes
      });

      if ((i + 1) % chunk === 0 || i === count - 1) {
        yield {
          done: i + 1,
          total: count,
          yieldPct: (yieldBeforeRetestCount / (i + 1)) * 100
        };
      }
    }

    return {
      records: records,
      stats: summarize(records, program, { retest: retest, count: count }),
      request: req
    };
  }

  /** runLot：同步跑完整个 lot（Node 测试用），返回 {records, stats, request} */
  function runLot(request) {
    var gen = lotSteps(request);
    var step = gen.next();
    while (!step.done) step = gen.next();
    return step.value;
  }

  /** summarize：把逐颗记录汇总成统计页需要的全部指标 */
  function summarize(records, program, meta) {
    var m = meta || {};
    var total = records.length || 1;
    var binCounts = {};
    var binByItem = {};
    var good = 0;
    var trueGoodCount = 0;
    var trueBadCount = 0;
    var overkill = 0;
    var underkill = 0;
    var timeSum = 0;
    var retestTimeSum = 0;
    var recovered = 0;
    var firstGood = 0;
    var itemVals = {};
    var itemTested = {};
    var itemFailed = {};
    var wafers = {};

    program.forEach(function (p) {
      itemVals[p.id] = [];
      itemTested[p.id] = 0;
      itemFailed[p.id] = 0;
      binByItem[p.id] = 0;
    });

    records.forEach(function (r) {
      binCounts[r.bin] = (binCounts[r.bin] || 0) + 1;
      if (r.bin === 1) good++;
      if (r.firstBin === 1) firstGood++;
      if (r.trueGood) trueGoodCount++;
      else trueBadCount++;
      if (r.trueGood && r.bin !== 1) overkill++;
      if (!r.trueGood && r.bin === 1) underkill++;
      if (r.firstBin !== 1 && r.bin === 1) recovered++;
      timeSum += r.timeMs;
      retestTimeSum += r.retestTimeMs || 0;

      Object.keys(r.values).forEach(function (id) {
        itemVals[id].push(r.values[id]);
        itemTested[id] = (itemTested[id] || 0) + 1;
        if (r.passes[id] === false) itemFailed[id] = (itemFailed[id] || 0) + 1;
      });
      if (r.firstBin !== 1 && r.failItem) binByItem[r.failItem]++;

      var w = r.wafer || 0;
      if (!wafers[w]) wafers[w] = [];
      wafers[w].push(r);
    });

    var items = program.map(function (p) {
      var vals = itemVals[p.id] || [];
      var s = Rng.summarize(vals);
      return {
        id: p.id,
        name: p.name,
        cname: p.cname,
        unit: p.unit,
        digits: p.digits,
        lsl: p.lsl,
        usl: p.usl,
        lslSI: p.lsl,
        enabled: p.enabled !== false,
        mean: s.mean,
        sigma: s.sd,
        min: s.min,
        max: s.max,
        tested: itemTested[p.id] || 0,
        failed: itemFailed[p.id] || 0,
        passRate: (itemTested[p.id] || 0) ? 1 - (itemFailed[p.id] || 0) / itemTested[p.id] : null,
        cpk: Rng.cpk(s.mean, s.sd, p.lsl, p.usl),
        values: vals
      };
    });

    return {
      total: records.length,
      count: records.length,
      good: good,
      yieldPct: (good / total) * 100,
      firstPassYieldPct: (firstGood / total) * 100,
      retestRecovered: recovered,
      retest: m.retest || 0,
      binCounts: binCounts,
      binPct: Object.keys(binCounts).reduce(function (acc, k) {
        acc[k] = (binCounts[k] / total) * 100;
        return acc;
      }, {}),
      binByItem: binByItem,
      items: items,
      avgTimeMs: timeSum / total,
      retestExtraMs: retestTimeSum,
      totalTimeMs: timeSum + retestTimeSum,
      overkill: overkill,
      overkillPct: trueGoodCount ? (overkill / trueGoodCount) * 100 : 0,
      underkill: underkill,
      underkillPct: trueBadCount ? (underkill / trueBadCount) * 100 : 0,
      trueGoodCount: trueGoodCount,
      trueBadCount: trueBadCount,
      wafers: Object.keys(wafers)
        .map(function (k) { return { wafer: Number(k), dice: wafers[k] }; })
        .sort(function (a, b) { return a.wafer - b.wafer; }),
      records: records
    };
  }

  /** toCSV：把逐颗数据导出成 CSV 文本（首行表头） */
  function toCSV(summary) {
    var cols = ['index', 'wafer', 'x', 'y', 'bin', 'trueGood', 'attempts', 'timeMs'];
    var itemIds = summary.items.map(function (it) { return it.id; });
    var head = cols.concat(itemIds.map(function (id) { return id + '_value'; }))
      .concat(itemIds.map(function (id) { return id + '_pass'; }));
    var lines = [head.join(',')];
    summary.records.forEach(function (r) {
      var row = [
        r.index,
        r.wafer,
        r.x.toFixed(4),
        r.y.toFixed(4),
        r.bin,
        r.trueGood ? 1 : 0,
        r.attempts,
        r.timeMs
      ];
      itemIds.forEach(function (id) {
        row.push(r.values[id] === undefined ? '' : r.values[id].toFixed(5));
      });
      itemIds.forEach(function (id) {
        row.push(r.passes[id] === undefined ? '' : r.passes[id] ? 1 : 0);
      });
      lines.push(row.join(','));
    });
    return lines.join('\n');
  }

  var Lot = {
    DEFAULT_REQUEST: DEFAULT_REQUEST,
    lotSteps: lotSteps,
    runLot: runLot,
    summarize: summarize,
    toCSV: toCSV
  };

  ATE.Lot = Lot;
  if (typeof module !== 'undefined' && module.exports) module.exports = Lot;
})(typeof globalThis !== 'undefined' ? globalThis : this);
