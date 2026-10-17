/**
 * dut.js — 虚拟芯片模型（3.3V I/O 器件，8 个信号引脚）
 * 每颗 die 先抽一个工艺变量 p ~ N(0,1)：快工艺（p 大）→ Idd 高、Fmax 高、漏电大。
 * 所有数值参数来自下方 SPEC（共享规格表），逻辑中不写死参数。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Rng = ATE.Rng || (typeof require !== 'undefined' ? require('./rng.js') : null);

  /** SPEC：共享规格表（单位均按测试项的报告单位：V / nA / mA / µA / MHz） */
  var SPEC = {
    continuity: { nominal: -0.65, sigma: 0.02, lsl: -1.0, usl: -0.2, bin: 2, unit: 'V', digits: 3 },
    leak: { nominal: 5, sigma: 2, lsl: -100, usl: 100, bin: 3, unit: 'nA', digits: 1 },
    voh: { nominal: 2.9, sigma: 0.05, lsl: 2.4, usl: null, bin: 4, unit: 'V', digits: 3 },
    vol: { nominal: 0.25, sigma: 0.03, lsl: null, usl: 0.4, bin: 4, unit: 'V', digits: 3 },
    idd_dyn: { nominal: 12, sigma: 0.8, lsl: null, usl: 15, bin: 5, unit: 'mA', digits: 2 },
    idd_stdby: { nominal: 20, sigma: 4, lsl: null, usl: 50, bin: 5, unit: 'µA', digits: 1 },
    speed: { nominal: 120, sigma: 6, lsl: 100, usl: null, bin: 6, unit: 'MHz', digits: 1 }
  };

  /** DEFAULT_CONFIG：DUT 生成参数，场景可覆盖其中任意字段 */
  var DEFAULT_CONFIG = {
    pins: 8,
    pinNames: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
    defectRates: { open: 0.015, short: 0.01, leak: 0.02, idd: 0.015 },
    speedTailRate: 0.03,
    speedTailShift: -28,
    /** 工艺变量对各个参数的灵敏度（p 大 → 数值大） */
    processSensitivity: { iddDyn: 0.45, iddStdby: 2.4, fmax: 4.2, leak: 0.8 },
    /** 非工艺相关的残差（保证总 σ 落在规格表附近） */
    residualSigma: { iddDyn: 0.66, iddStdby: 3.2, fmax: 4.28, leak: 1.9 },
    /** 缺陷注入的固定偏置（不改规格，只改缺陷 die 的真值） */
    defectShift: {
      openV: -2.0, // 开路：仪表钳位读数
      shortV: -0.05, // 短路到地：二极管压降几乎为 0
      leakMin: 140,
      leakMax: 420,
      iddDynMin: 17,
      iddDynMax: 26,
      iddStdbyMin: 62,
      iddStdbyMax: 130
    },
    waferDies: 400,
    clusterGain: 3.0,
    clusterRadius: 0.24,
    /** 工艺整体偏移（场景 ④ 用）：{ iddDyn: +1.2 } 之类 */
    shifts: {}
  };

  /** mergeConfig：浅合并两层配置，返回新对象 */
  function mergeConfig(cfg) {
    var out = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    if (!cfg) return out;
    Object.keys(cfg).forEach(function (k) {
      var v = cfg[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') {
        Object.keys(v).forEach(function (k2) {
          out[k][k2] = v[k2];
        });
      } else {
        out[k] = v;
      }
    });
    return out;
  }

  var positionCache = {};

  /** waferPositions：生成圆形 wafer 上的等距 die 坐标，数量约等于 target */
  function waferPositions(target) {
    target = Math.max(20, Math.round(target || 400));
    if (positionCache[target]) return positionCache[target];
    var R = 0.94;
    var spacing = Math.sqrt((Math.PI * R * R) / target);
    var pts = [];
    for (var y = -R; y <= R + 1e-9; y += spacing) {
      for (var x = -R; x <= R + 1e-9; x += spacing) {
        if (x * x + y * y <= R * R) pts.push({ x: x, y: y });
      }
    }
    // 数量对齐：多则等间隔剔除，少则保留（规格只要求"约 400 颗"）
    if (pts.length > target) {
      var drop = pts.length - target;
      var acc = 0;
      var kept = [];
      for (var i = 0; i < pts.length; i++) {
        acc += drop / pts.length;
        if (acc >= 1) {
          acc -= 1;
          continue;
        }
        kept.push(pts[i]);
      }
      pts = kept;
    }
    positionCache[target] = pts;
    return pts;
  }

  /** hotspotFor：某片 wafer 上的缺陷聚集中心（固定种子，可复现） */
  function hotspotFor(seed, waferIndex, cfg) {
    var r = Rng.createRng(Rng.mixSeed((seed >>> 0) ^ 0x9e3779b9, waferIndex * 7919 + 13));
    var ang = r.range(0, Math.PI * 2);
    var rad = r.range(0, 0.62);
    return { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, radius: cfg.clusterRadius };
  }

  /** generateDie：按种子 + 序号生成一颗 die（同种子同序号结果完全一致） */
  function generateDie(seed, config, index) {
    var cfg = mergeConfig(config);
    var idx = index >>> 0;
    var positions = waferPositions(cfg.waferDies);
    var perWafer = positions.length;
    var waferIndex = Math.floor(idx / perWafer);
    var pos = positions[idx % perWafer];

    var rng = Rng.createRng(Rng.mixSeed(seed, idx));
    var hs = hotspotFor(seed, waferIndex, cfg);
    var dx = pos.x - hs.x;
    var dy = pos.y - hs.y;
    var inCluster = Math.sqrt(dx * dx + dy * dy) < hs.radius;
    var boost = inCluster ? cfg.clusterGain : 1;

    /** 缺陷概率：聚集区按 clusterGain 放大，概率上限 1 */
    function chance(p) {
      return rng.chance(Math.min(1, p * boost));
    }

    var p = rng.normal();
    var sens = cfg.processSensitivity;
    var res = cfg.residualSigma;
    var shift = cfg.shifts || {};
    var rates = cfg.defectRates;
    var ds = cfg.defectShift;

    var def = {
      open: chance(rates.open),
      short: chance(rates.short),
      leak: chance(rates.leak),
      idd: chance(rates.idd),
      speedTail: rng.chance(cfg.speedTailRate)
    };

    // 引脚二极管压降（连续性）
    var pins = [];
    var openPin = def.open ? rng.int(cfg.pins) : -1;
    var shortPin = def.short ? rng.int(cfg.pins) : -1;
    for (var i = 0; i < cfg.pins; i++) {
      var v = SPEC.continuity.nominal + SPEC.continuity.sigma * rng.normal() + (shift.continuity || 0);
      if (i === openPin) v = ds.openV;
      if (i === shortPin) v = ds.shortV;
      pins.push({ name: cfg.pinNames[i] || 'P' + (i + 1), v: v, open: i === openPin, short: i === shortPin });
    }

    // 输入漏电（IIL / IIH）
    var iil = SPEC.leak.nominal + sens.leak * p + res.leak * rng.normal() + (shift.leak || 0);
    var iih = SPEC.leak.nominal + sens.leak * p + res.leak * rng.normal() + (shift.leak || 0);
    if (def.leak) {
      var mag = rng.range(ds.leakMin, ds.leakMax);
      if (rng.chance(0.5)) iil = mag;
      else iih = mag;
    }

    var voh =
      SPEC.voh.nominal + SPEC.voh.sigma * rng.normal() - 0.008 * Math.max(p, 0) + (shift.voh || 0);
    var vol =
      SPEC.vol.nominal + SPEC.vol.sigma * rng.normal() + 0.006 * Math.max(p, 0) + (shift.vol || 0);

    var iddDyn =
      SPEC.idd_dyn.nominal + sens.iddDyn * p + res.iddDyn * rng.normal() + (shift.iddDyn || 0);
    var iddStdby =
      SPEC.idd_stdby.nominal + sens.iddStdby * p + res.iddStdby * rng.normal() + (shift.iddStdby || 0);
    if (def.short) iddDyn += 1.1;
    if (def.idd) {
      iddDyn = Math.max(iddDyn, rng.range(ds.iddDynMin, ds.iddDynMax));
      iddStdby = Math.max(iddStdby, rng.range(ds.iddStdbyMin, ds.iddStdbyMax));
    }

    var fmax = SPEC.speed.nominal + sens.fmax * p + res.fmax * rng.normal() + (shift.fmax || 0);
    if (def.speedTail) fmax += cfg.speedTailShift;

    var trueGood = !(def.open || def.short || def.leak || def.idd || def.speedTail);

    return {
      index: idx,
      seed: seed,
      wafer: waferIndex,
      x: pos.x,
      y: pos.y,
      inCluster: inCluster,
      process: p,
      defects: def,
      pins: pins,
      true: {
        continuity: Math.min.apply(null, pins.map(function (q) { return q.v; })),
        pinContinuity: pins.map(function (q) { return q.v; }),
        iil: iil,
        iih: iih,
        voh: voh,
        vol: vol,
        iddDyn: iddDyn,
        iddStdby: iddStdby,
        fmax: fmax
      },
      trueGood: trueGood
    };
  }

  /** trueBinOf：按"真值 + 规格限"推出这颗 die 理论上应落的 Bin（用于漏检分析对照） */
  function trueBinOf(die, spec) {
    var s = spec || SPEC;
    var t = die.true;
    var contFail = die.pins.some(function (pin) {
      return pin.v < s.continuity.lsl || pin.v > s.continuity.usl;
    });
    if (contFail) return s.continuity.bin;
    if (t.iil < s.leak.lsl || t.iil > s.leak.usl) return s.leak.bin;
    if (t.iih < s.leak.lsl || t.iih > s.leak.usl) return s.leak.bin;
    if (t.voh < s.voh.lsl) return s.voh.bin;
    if (t.vol > s.vol.usl) return s.vol.bin;
    if (t.iddDyn > s.idd_dyn.usl) return s.idd_dyn.bin;
    if (t.iddStdby > s.idd_stdby.usl) return s.idd_stdby.bin;
    if (t.fmax < s.speed.lsl) return s.speed.bin;
    return 1;
  }

  var DUT = {
    SPEC: SPEC,
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    mergeConfig: mergeConfig,
    waferPositions: waferPositions,
    generateDie: generateDie,
    trueBinOf: trueBinOf
  };

  ATE.Spec = SPEC;
  ATE.DUT = DUT;
  if (typeof module !== 'undefined' && module.exports) module.exports = DUT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
