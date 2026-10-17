/**
 * flow.js — 流程引擎
 * 按程序顺序执行测试项，支持"首个失败即停止"（stop on first fail），输出 Bin、各项结果、总测试时间。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Tests = ATE.Tests || (typeof require !== 'undefined' ? require('./tests.js') : null);

  /**
   * run：对一颗 die 跑完整个测试程序
   * @param {object} die 虚拟芯片
   * @param {array} program 测试程序
   * @param {object} options { instruments, stopOnFirstFail, onResult }
   * @returns {{bin:number, pass:boolean, results:array, timeMs:number, failItem:string|null}}
   */
  function run(die, program, options) {
    var opts = options || {};
    var inst = opts.instruments;
    var stop = opts.stopOnFirstFail !== false; // 默认开启
    var results = [];
    var timeMs = 0;
    var bin = 1;
    var failItem = null;

    for (var i = 0; i < program.length; i++) {
      var item = program[i];
      if (item.enabled === false) continue;
      var r = Tests.runTest(item, die, inst);
      results.push(r);
      timeMs += item.timeMs;
      if (typeof opts.onResult === 'function') opts.onResult(r);
      if (!r.pass) {
        // Bin 取"第一个失败项"的分类，后续失败不再覆盖（与真实 ATE 一致）
        if (bin === 1) {
          bin = item.bin;
          failItem = item.id;
        }
        if (stop) break;
      }
    }

    return {
      dieIndex: die.index,
      bin: bin,
      pass: bin === 1,
      results: results,
      timeMs: timeMs,
      failItem: failItem,
      testedItems: results.length
    };
  }

  /** binLabel：Bin 编号 → 中文说明 */
  function binLabel(bin) {
    var map = {
      1: 'Bin 1 · 良品',
      2: 'Bin 2 · 连续性/开路短路',
      3: 'Bin 3 · 输入漏电',
      4: 'Bin 4 · VOH/VOL',
      5: 'Bin 5 · IDD 超标',
      6: 'Bin 6 · 速度不足'
    };
    return map[bin] || 'Bin ' + bin;
  }

  var Flow = { run: run, binLabel: binLabel };
  ATE.Flow = Flow;
  if (typeof module !== 'undefined' && module.exports) module.exports = Flow;
})(typeof globalThis !== 'undefined' ? globalThis : this);
