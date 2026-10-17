/**
 * rng.js — 随机数与统计工具
 * 固定种子可复现：mulberry32 + Box-Muller 正态分布。
 * 同一份代码在浏览器（挂 ATE.Rng）和 Node（module.exports）下均可运行。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});

  /** mulberry32：32 位种子伪随机数发生器，返回 [0,1) 均匀分布函数 */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** hashSeed：把任意字符串/数字种子混成 32 位整数，保证同输入同输出 */
  function hashSeed(seed) {
    var s = String(seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    return h >>> 0;
  }

  /** mixSeed：把基础种子与序号混成一个新种子（每颗 die、每片 wafer 用） */
  function mixSeed(seed, index) {
    var h = (seed >>> 0) ^ Math.imul((index + 1) >>> 0, 2654435761);
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  /** createRng：创建一个带正态/均匀/整数/取样能力的随机数对象 */
  function createRng(seed) {
    var s = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    var next = mulberry32(s);
    var spare = null;

    return {
      seed: s,
      /** uniform：返回 [0,1) 均匀随机数 */
      uniform: function () {
        return next();
      },
      /** normal：标准正态随机数（Box-Muller，带缓存极性） */
      normal: function () {
        if (spare !== null) {
          var v = spare;
          spare = null;
          return v;
        }
        var u1 = 0;
        while (u1 === 0) u1 = next();
        var u2 = next();
        var mag = Math.sqrt(-2 * Math.log(u1));
        spare = mag * Math.sin(2 * Math.PI * u2);
        return mag * Math.cos(2 * Math.PI * u2);
      },
      /** range：返回 [min,max) 均匀随机数 */
      range: function (min, max) {
        return min + (max - min) * next();
      },
      /** int：返回 [0,n) 的整数 */
      int: function (n) {
        return Math.floor(next() * n) % n;
      },
      /** chance：以 p 概率返回 true */
      chance: function (p) {
        return next() < p;
      },
      /** pick：从数组中等概率取一个元素 */
      pick: function (arr) {
        return arr[Math.floor(next() * arr.length) % arr.length];
      }
    };
  }

  /** mean：算术平均 */
  function mean(arr) {
    if (!arr.length) return NaN;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  /** sd：总体标准差（除以 n） */
  function sd(arr) {
    if (arr.length < 1) return NaN;
    var m = mean(arr);
    var s = 0;
    for (var i = 0; i < arr.length; i++) {
      var d = arr[i] - m;
      s += d * d;
    }
    return Math.sqrt(s / arr.length);
  }

  /** quantile：线性插值分位数，p ∈ [0,1] */
  function quantile(sortedArr, p) {
    if (!sortedArr.length) return NaN;
    var pos = (sortedArr.length - 1) * p;
    var lo = Math.floor(pos);
    var hi = Math.ceil(pos);
    if (lo === hi) return sortedArr[lo];
    return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (pos - lo);
  }

  /** summarize：一次性给出 count/mean/sd/min/max/p1/p50/p99 */
  function summarize(arr) {
    if (!arr.length) {
      return { count: 0, mean: NaN, sd: NaN, min: NaN, max: NaN, p1: NaN, p50: NaN, p99: NaN };
    }
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    return {
      count: arr.length,
      mean: mean(arr),
      sd: sd(arr),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p1: quantile(sorted, 0.01),
      p50: quantile(sorted, 0.5),
      p99: quantile(sorted, 0.99)
    };
  }

  /** cpk：Cpk = min((USL−μ)/3σ, (μ−LSL)/3σ)，单边规格只用对应一侧 */
  function cpk(mu, sigma, lsl, usl) {
    if (!isFinite(mu) || !isFinite(sigma) || sigma <= 0) return NaN;
    var upper = usl === null || usl === undefined ? Infinity : (usl - mu) / (3 * sigma);
    var lower = lsl === null || lsl === undefined ? Infinity : (mu - lsl) / (3 * sigma);
    return Math.min(upper, lower);
  }

  /** histogram：等宽分箱，返回 {edges, counts, centers, binWidth, max} */
  function histogram(values, bins, min, max) {
    var n = values.length;
    if (!n) return { edges: [], counts: [], centers: [], binWidth: 0, max: 0 };
    var lo = min === undefined || min === null ? Math.min.apply(null, values) : min;
    var hi = max === undefined || max === null ? Math.max.apply(null, values) : max;
    if (hi === lo) {
      hi = lo + 1;
      lo = lo - 1;
    }
    var count = bins || 30;
    var width = (hi - lo) / count;
    var counts = new Array(count).fill(0);
    for (var i = 0; i < n; i++) {
      var idx = Math.floor((values[i] - lo) / width);
      if (idx < 0) idx = 0;
      if (idx >= count) idx = count - 1;
      counts[idx]++;
    }
    var edges = [];
    var centers = [];
    for (var j = 0; j <= count; j++) edges.push(lo + j * width);
    for (var k = 0; k < count; k++) centers.push(lo + (k + 0.5) * width);
    return {
      edges: edges,
      counts: counts,
      centers: centers,
      binWidth: width,
      max: Math.max.apply(null, counts)
    };
  }

  /** fmt：把数字格式化成带单位的紧凑字符串 */
  function fmt(v, digits) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    var d = digits === undefined ? 3 : digits;
    if (v !== 0 && Math.abs(v) < 0.001) return v.toExponential(2);
    return Number(v.toFixed(d)).toString();
  }

  var Rng = {
    mulberry32: mulberry32,
    hashSeed: hashSeed,
    mixSeed: mixSeed,
    createRng: createRng,
    mean: mean,
    sd: sd,
    quantile: quantile,
    summarize: summarize,
    cpk: cpk,
    histogram: histogram,
    fmt: fmt
  };

  ATE.Rng = Rng;
  if (typeof module !== 'undefined' && module.exports) module.exports = Rng;
})(typeof globalThis !== 'undefined' ? globalThis : this);
