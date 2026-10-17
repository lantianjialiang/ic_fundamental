/**
 * instruments.js — 仪器模型
 * 提供恒流测压、恒压测流、IDD 测量、Pattern 测速四类能力。
 * 特征：读数噪声、量程钳位（开路读数钳在 −2V）、接触电阻影响读数、每次接触的随机波动。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Rng = ATE.Rng || (typeof require !== 'undefined' ? require('./rng.js') : null);

  /** DEFAULT_CONFIG：仪器默认参数（场景可覆盖） */
  var DEFAULT_CONFIG = {
    contactR: 8, // 接触电阻 Ω
    contactVar: 0.12, // 每次接触的电阻波动（比例，1σ）
    contactDrift: 0, // 整个 lot 内的接触电阻漂移量 Ω
    gainError: 0.001, // 通道增益误差
    biasV: 0.0012, // 电压通道固定小偏置 V
    biasFrac: 0.001, // 电流/频率通道相对小偏置
    readNoise: 0.005, // 0.5% 读数噪声（1σ）
    noiseScale: 1, // 噪声整体缩放（场景可放大）
    clampVMin: -2.0, // 电压量程下限（开路读数钳位点）
    clampVMax: 3.6 // 电压量程上限
  };

  /** createInstruments：创建一台虚拟测试机 */
  function createInstruments(config, seed) {
    var cfg = {};
    Object.keys(DEFAULT_CONFIG).forEach(function (k) {
      cfg[k] = DEFAULT_CONFIG[k];
    });
    Object.keys(config || {}).forEach(function (k) {
      cfg[k] = config[k];
    });

    var rng = Rng.createRng(seed === undefined ? 1 : seed);
    var touchR = cfg.contactR;

    var inst = {
      config: cfg,
      /** effectiveContactR：当前接触电阻（含漂移与单次接触波动） */
      get contactR() {
        return touchR;
      },
      /** beginTouch：每颗 die 探针重新落下时调用，重新抽一次接触电阻 */
      beginTouch: function (dieIndex, total) {
        var frac = total ? Math.min(1, (dieIndex || 0) / total) : 0;
        var base = cfg.contactR + cfg.contactDrift * frac;
        var jitter = 1 + cfg.contactVar * rng.normal();
        touchR = Math.max(0.2, base * jitter);
        return touchR;
      },
      /** forceI：恒流测压（currentA 为流入引脚的电流，安培） */
      forceI: function (trueV, currentA) {
        return inst.measureV(trueV, currentA);
      },
      /** forceV：恒压测流（返回电流读数，单位与输入一致） */
      forceV: function (trueI, clampMax) {
        return inst.measureI(trueI, clampMax);
      },
      /** measureV：电压读数 = 真值 + 接触电阻 IR 降 + 增益误差 + 噪声，并做量程钳位 */
      measureV: function (trueV, currentA) {
        var irDrop = (currentA || 0) * touchR;
        var v = trueV + irDrop;
        v = v * (1 + cfg.gainError) + cfg.biasV;
        v += Math.abs(v) * cfg.readNoise * cfg.noiseScale * rng.normal();
        if (v < cfg.clampVMin) v = cfg.clampVMin;
        if (v > cfg.clampVMax) v = cfg.clampVMax;
        return v;
      },
      /** measureI：电流读数（相对偏置 + 噪声 + 可选量程上限钳位） */
      measureI: function (trueI, clampMax) {
        var i = trueI * (1 + cfg.gainError + cfg.biasFrac);
        i += Math.abs(i) * cfg.readNoise * cfg.noiseScale * rng.normal();
        if (clampMax !== undefined && clampMax !== null && i > clampMax) i = clampMax;
        if (clampMax !== undefined && clampMax !== null && i < -clampMax) i = -clampMax;
        return i;
      },
      /** measureIdd：电源电流测量（IDD 专用，量程上限由调用方给出） */
      measureIdd: function (trueI, clampMax) {
        return inst.measureI(trueI, clampMax);
      },
      /** runPattern：运行功能 Pattern 并测出 Fmax（频率单位与输入一致） */
      runPattern: function (trueFmax) {
        var f = trueFmax * (1 + cfg.gainError + cfg.biasFrac * 0.2);
        f += Math.abs(f) * cfg.readNoise * cfg.noiseScale * rng.normal();
        return f;
      },
      /** reset：回到初始状态（同一 seed 下序列可复现） */
      reset: function (newSeed) {
        rng = Rng.createRng(newSeed === undefined ? (seed === undefined ? 1 : seed) : newSeed);
        touchR = cfg.contactR;
      }
    };

    return inst;
  }

  var Instruments = { DEFAULT_CONFIG: DEFAULT_CONFIG, createInstruments: createInstruments };
  ATE.Instruments = Instruments;
  if (typeof module !== 'undefined' && module.exports) module.exports = Instruments;
})(typeof globalThis !== 'undefined' ? globalThis : this);
