/**
 * tests.js — 测试项定义与执行
 * 每个测试项包含名称、条件、单位、限值、所属 Bin、测试时间；
 * runTest(item, die, inst) 返回一次测量结果（含 Pass/Fail）。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Rng = ATE.Rng || (typeof require !== 'undefined' ? require('./rng.js') : null);
  var SPEC = ATE.Spec || (typeof require !== 'undefined' ? require('./dut.js').SPEC : null);

  /** ITEM_DEFS：测试项静态定义（顺序即默认执行顺序） */
  var ITEM_DEFS = [
    {
      id: 'continuity',
      name: 'Continuity',
      cname: '连续性',
      condition: '灌入 −100µA，测二极管压降（8 引脚）',
      timeMs: 64,
      kind: 'perPin'
    },
    { id: 'leak', name: 'IIL / IIH', cname: '输入漏电', condition: '施加 0V / 3.3V', timeMs: 12, kind: 'leak' },
    { id: 'voh', name: 'VOH', cname: '输出高电平', condition: 'IOH = −4mA', timeMs: 10, kind: 'voh' },
    { id: 'vol', name: 'VOL', cname: '输出低电平', condition: 'IOL = 4mA', timeMs: 10, kind: 'vol' },
    {
      id: 'idd_dyn',
      name: 'IDD (动态)',
      cname: '动态电流',
      condition: '3.3V，10MHz',
      timeMs: 15,
      kind: 'iddDyn'
    },
    {
      id: 'idd_stdby',
      name: 'IDD (待机)',
      cname: '待机电流',
      condition: '3.3V，时钟停止',
      timeMs: 2,
      kind: 'iddStdby'
    },
    {
      id: 'speed',
      name: 'Functional / Fmax',
      cname: '功能与速度',
      condition: '100MHz Pattern',
      timeMs: 120,
      kind: 'speed'
    }
  ];

  /** createProgram：生成测试程序（限值、Bin、启停均可编辑） */
  function createProgram() {
    return ITEM_DEFS.map(function (def, i) {
      var s = SPEC[def.id];
      return {
        order: i + 1,
        id: def.id,
        name: def.name,
        cname: def.cname,
        condition: def.condition,
        unit: s.unit,
        nominal: s.nominal,
        sigma: s.sigma,
        digits: s.digits,
        lsl: s.lsl,
        usl: s.usl,
        bin: s.bin,
        timeMs: def.timeMs,
        enabled: true,
        kind: def.kind
      };
    });
  }

  /** findItem：按 id 取程序中的测试项 */
  function findItem(program, id) {
    for (var i = 0; i < program.length; i++) if (program[i].id === id) return program[i];
    return null;
  }

  /** judge：按限值判定 Pass/Fail（单边规格只判一侧） */
  function judge(value, lsl, usl) {
    if (lsl !== null && lsl !== undefined && value < lsl) return false;
    if (usl !== null && usl !== undefined && value > usl) return false;
    return true;
  }

  /** margin：距离最近限值的余量（用于挑"最差引脚"） */
  function margin(value, lsl, usl) {
    var m = Infinity;
    if (lsl !== null && lsl !== undefined) m = Math.min(m, value - lsl);
    if (usl !== null && usl !== undefined) m = Math.min(m, usl - value);
    return m;
  }

  /** runContinuity：逐引脚恒流测压，报告最差引脚 */
  function runContinuity(item, die, inst) {
    var pins = die.pins.map(function (pin) {
      var v = inst.forceI(pin.v, -100e-6);
      return { name: pin.name, value: v, pass: judge(v, item.lsl, item.usl) };
    });
    var worst = pins[0];
    var worstMargin = margin(pins[0].value, item.lsl, item.usl);
    pins.forEach(function (p) {
      var m = margin(p.value, item.lsl, item.usl);
      if (m < worstMargin) {
        worstMargin = m;
        worst = p;
      }
    });
    var failPins = pins.filter(function (p) { return !p.pass; }).map(function (p) { return p.name; });
    return {
      value: worst.value,
      pass: failPins.length === 0,
      detail: { pins: pins, worstPin: worst.name, failPins: failPins }
    };
  }

  /** runLeak：两个方向各测一次输入漏电，取绝对值更大的一侧上报 */
  function runLeak(item, die, inst) {
    var iil = inst.forceV(die.true.iil, 2000);
    var iih = inst.forceV(die.true.iih, 2000);
    var p1 = judge(iil, item.lsl, item.usl);
    var p2 = judge(iih, item.lsl, item.usl);
    var worst = Math.abs(iil) >= Math.abs(iih) ? { k: 'IIL', v: iil } : { k: 'IIH', v: iih };
    return {
      value: worst.v,
      pass: p1 && p2,
      detail: { IIL: iil, IIH: iih, worst: worst.k }
    };
  }

  /** runTest：执行单个测试项，返回 {id, value, pass, bin, ...} */
  function runTest(item, die, inst) {
    var raw;
    switch (item.kind) {
      case 'perPin':
        raw = runContinuity(item, die, inst);
        break;
      case 'leak':
        raw = runLeak(item, die, inst);
        break;
      case 'voh':
        // IOH = −4mA：电流从引脚流出，接触电阻把读数往下拉
        raw = { value: inst.forceI(die.true.voh, -4e-3), pass: true, detail: {} };
        break;
      case 'vol':
        // IOL = +4mA：电流灌入引脚，接触电阻把读数往上抬
        raw = { value: inst.forceI(die.true.vol, 4e-3), pass: true, detail: {} };
        break;
      case 'iddDyn':
        raw = { value: inst.measureIdd(die.true.iddDyn, 300), pass: true, detail: {} };
        break;
      case 'iddStdby':
        raw = { value: inst.measureIdd(die.true.iddStdby, 3000), pass: true, detail: {} };
        break;
      case 'speed':
        raw = { value: inst.runPattern(die.true.fmax), pass: true, detail: {} };
        break;
      default:
        throw new Error('未知测试项: ' + item.id);
    }

    var pass = raw.pass && judge(raw.value, item.lsl, item.usl);
    return {
      id: item.id,
      name: item.name,
      cname: item.cname,
      condition: item.condition,
      unit: item.unit,
      digits: item.digits,
      value: raw.value,
      lsl: item.lsl,
      usl: item.usl,
      bin: item.bin,
      pass: pass,
      timeMs: item.timeMs,
      detail: raw.detail || {}
    };
  }

  var Tests = {
    ITEM_DEFS: ITEM_DEFS,
    createProgram: createProgram,
    findItem: findItem,
    judge: judge,
    margin: margin,
    runTest: runTest
  };

  ATE.Tests = Tests;
  if (typeof module !== 'undefined' && module.exports) module.exports = Tests;
})(typeof globalThis !== 'undefined' ? globalThis : this);
