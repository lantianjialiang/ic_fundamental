/**
 * scenarios.js — 故障场景
 * 每个场景是一份 JSON 配置（改 DUT 分布 / 仪器接触电阻 / 限值 / 漂移），
 * 同时带"根因/处置"选项与讲解，供诊断任务判分。此文件不访问 DOM。
 */
(function (root) {
  'use strict';

  var ATE = (root.ATE = root.ATE || {});
  var Tests = ATE.Tests || (typeof require !== 'undefined' ? require('./tests.js') : null);

  /** 通用选项库：各场景共用同一套根因/处置语义，方便对比 */
  var OPTIONS = {
    rootCause: [
      {
        id: 'contact',
        label: '探针 / 测试座接触电阻过大',
        keys: ['探针', '接触电阻', '接触不良', 'IR 降', '压降', 'socket']
      },
      { id: 'limit-tight', label: '测试限值被设置得过严', keys: ['限值过严', '限值偏严', '收紧限值', '过杀'] },
      { id: 'limit-loose', label: '测试限值被放宽得过多', keys: ['限值过松', '限值偏松', '放宽限值', '漏检'] },
      {
        id: 'process-shift',
        label: '工艺参数整体漂移（如 IDD 整体偏高）',
        keys: ['工艺', '漂移', '平移', '偏移', 'wafer 本身']
      },
      {
        id: 'probe-drift',
        label: '探针随测试次数累积脏污，接触电阻持续上升',
        keys: ['探针脏污', '累积', '越测越差', '清针后恢复', '接触电阻上升']
      }
    ],
    action: [
      {
        id: 'clean',
        label: '清洁 / 更换探针，检查 socket 接触电阻后复测',
        keys: ['清洁', '清针', '更换探针', '检查接触', '复测确认']
      },
      { id: 'restore-limit', label: '对照 datasheet 复核并恢复规格限值', keys: ['恢复规格', '恢复限值', '对照 datasheet', '复核规格'] },
      { id: 'guardband', label: '按规格重新设定限值并加 guardband', keys: ['guardband', '重新设定限值', '按规格', '留余量'] },
      { id: 'stop-line', label: '停线排查工艺机台，调整后重新流片验证', keys: ['停线', '排查工艺', '机台', '重新流片'] },
      { id: 'pm', label: '建立定期清针 / 换针 PM 周期并在线监控接触电阻', keys: ['PM', '定期清针', '换针', '监控接触电阻'] }
    ]
  };

  /** SCENARIOS：5 个预置场景 */
  var SCENARIOS = [
    {
      id: 'contact',
      name: '① 接触不良',
      tag: 'Probe Contact',
      brief:
        '产线反馈：这条测试程序今天 Bin 4（VOH/VOL）明显变多，而且同一颗 die 换一次探针落下有时又能过。IDD 和速度看起来正常。',
      task: '判断这批 die 大量判 Bin 4 的根因，并选出正确的处置方式。',
      hint: '先看各 Bin 占比：失效是否集中在 VOH/VOL？再看 IOH/IOL 通路上串联了什么——4mA 电流经过接触电阻会产生多大压降？',
      setup: {
        instrumentConfig: { contactR: 28, contactVar: 0.35 },
        config: {},
        limits: {},
        describe: '仪器接触电阻标称 28Ω（正常 < 10Ω），每次落下波动 35%'
      },
      correct: { rootCause: 'contact', action: 'clean' },
      explanation:
        'VOH/VOL 测试分别灌 −4mA / +4mA，接触电阻 Rc 直接叠加 IR 降 = 4mA × Rc。VOL 的余量只有 0.4 − 0.25 = 0.15V，Rc 超过约 37Ω 就会假 fail；VOH 余量 0.5V，要 Rc > 125Ω 才出事——所以症状集中在 Bin 4，而且每次落针接触电阻都在波动，同一颗 die 复测有时又能过。连续性测试只灌 100µA，压降不到 5mV，Bin 2 正常；IDD、速度不受影响，说明 die 本身没问题。正确处置：清洁/更换探针、检查 socket 接触电阻（目标 < 10Ω），并用复测确认良率恢复。'
    },
    {
      id: 'limit-tight',
      name: '② 限值过严',
      tag: 'Over-tight Limits',
      brief:
        '工程部为了"确保质量"把 VOH 下限从 2.4V 提到 2.85V、IDD 上限从 15mA 收到 12.6mA、Fmax 下限提到 110MHz。之后良率从 97% 掉到 60% 多，但失效 die 复测仍能通过，客户端也无异常。',
      task: '解释良率骤降的原因，并选出正确处置。',
      hint: '对比测量值分布和你设的限值：分布中心离限值还有几个 σ？过杀率（真良品被判坏）是多少？',
      setup: {
        instrumentConfig: {},
        config: {},
        limits: { voh: { lsl: 2.85 }, idd_dyn: { usl: 12.6 }, speed: { lsl: 110 } },
        describe: 'VOH ≥ 2.85V、IDD ≤ 12.6mA、Fmax ≥ 110MHz（规格应为 2.4V / 15mA / 100MHz）'
      },
      correct: { rootCause: 'limit-tight', action: 'restore-limit' },
      explanation:
        '标称 VOH 2.9V、σ 0.05V，下限抬到 2.85V 只剩 1σ 余量，约 16% 的好品被判 Bin 4；IDD 上限 12.6mA 正好压在中位数附近，约一半好品被判 Bin 5。过杀率飙升而漏检率极低，是典型的"限值过严"。正确处置：按 datasheet/测试规范恢复 2.4V、15mA、100MHz，如需留余量应使用 guardband（按 Cpk 目标收紧到 1.33 对应的位置），而不是拍脑袋改限值。'
    },
    {
      id: 'limit-loose',
      name: '③ 限值过松',
      tag: 'Under-tight Limits',
      brief:
        '为了冲良率，有人把 VOH 下限放到 2.0V、VOL 上限放到 0.65V、IDD 上限放到 18mA、Fmax 下限放到 88MHz。良率一下到 99.9%，但客户陆续反馈上板后时序和功耗异常。',
      task: '判断为什么"良率很高"反而是问题，并选出正确处置。',
      hint: '看漏检率：真实不良里有多少被判成 Bin 1？再把限值竖线和分布对比，看规格外的 die 是否被放行。',
      setup: {
        instrumentConfig: {},
        config: {},
        limits: {
          voh: { lsl: 2.0 },
          vol: { usl: 0.65 },
          idd_dyn: { usl: 18 },
          idd_stdby: { usl: 90 },
          speed: { lsl: 88 }
        },
        describe: 'VOH ≥ 2.0V、VOL ≤ 0.65V、IDD ≤ 18mA、IDDQ ≤ 90µA、Fmax ≥ 88MHz（全部放宽）'
      },
      correct: { rootCause: 'limit-loose', action: 'guardband' },
      explanation:
        '限值放宽后，真正超规格的 die（VOH 只有 2.2V、IDD 17mA、Fmax 92MHz 等）都被判成良品，漏检率显著上升——良率虚高是用客户退货换来的。正确处置：按 datasheet 恢复规格限值，并在量产程序里用 guardband 把测试限值放在规格内侧（通常按 Cpk ≥ 1.33 反推），既保证出货质量又留出测量重复性余量。'
    },
    {
      id: 'process-shift',
      name: '④ 工艺偏移',
      tag: 'Process Shift',
      brief:
        '同一程序、同一测试机，最近两批的 IDD 动态电流分布整体往右移了约 2.6mA，待机电流也偏高，Bin 5 明显增多；VOH/VOL 和速度分布基本没变。',
      task: '判断根因并选出处置方式。',
      hint: '看 IDD 直方图的均值与 Cpk 变化：是限值问题，还是整个分布平移？如果只有 IDD 一族参数偏移、其它参数正常，问题更可能出在哪里？',
      setup: {
        instrumentConfig: {},
        config: { shifts: { iddDyn: 2.6, iddStdby: 14 } },
        limits: {},
        describe: 'DUT 工艺偏移：IDD 动态 +2.6mA，IDD 待机 +14µA'
      },
      correct: { rootCause: 'process-shift', action: 'stop-line' },
      explanation:
        '分布整体平移、Cpk 下降，且只有 IDD 相关参数偏移，说明不是测试系统问题而是 wafer 本身变了（栅氧厚度、掺杂、漏电通路等）。正确处置：停线排查工艺机台与最近的工艺变更，调整后重新流片验证；同时把 IDD 均值/Cpk 纳入 SPC 在线监控，尽早发现漂移。'
    },
    {
      id: 'probe-drift',
      name: '⑤ 探针逐渐脏污',
      tag: 'Probe Drift',
      brief:
        '连续跑一整片 wafer，前面几百颗良率正常，越往后 Bin 4 越多，整批良率比上一批低 4 个点。清洁探针后立刻恢复正常。',
      task: '判断这种"随测试序号变差"的现象根因，并选出长期对策。',
      hint: '看良率随测试序号/wafer 的趋势线，以及 VOH/VOL 的失效是否随时间累积。注意接触电阻是随落针次数增长的。',
      setup: {
        instrumentConfig: { contactR: 6, contactDrift: 150, contactVar: 0.25 },
        config: {},
        limits: {},
        describe: '接触电阻从 6Ω 线性漂移到 156Ω（整个 lot）'
      },
      correct: { rootCause: 'probe-drift', action: 'pm' },
      explanation:
        '接触电阻随落针次数线性上升，IR 降 = 4mA × Rc 逐渐吃掉 VOH/VOL 的余量，于是良率随测试序号持续下降、清针后恢复——这是探针脏污/磨损的典型特征。正确处置：建立定期清针/换针的 PM 周期，并在程序里加接触电阻监控（如连续性测试的压降趋势），超阈值自动报警停测。'
    }
  ];

  /** getScenario：按 id 取场景 */
  function getScenario(id) {
    for (var i = 0; i < SCENARIOS.length; i++) if (SCENARIOS[i].id === id) return SCENARIOS[i];
    return null;
  }

  /** buildSetup：把场景覆盖项应用成一份可运行的测试程序 + DUT/仪器配置 */
  function buildSetup(scenario) {
    var program = Tests.createProgram();
    var setup = (scenario && scenario.setup) || {};
    var limits = setup.limits || {};
    program.forEach(function (item) {
      var ov = limits[item.id];
      if (!ov) return;
      if (ov.lsl !== undefined) item.lsl = ov.lsl;
      if (ov.usl !== undefined) item.usl = ov.usl;
    });
    return {
      program: program,
      config: setup.config || {},
      instrumentConfig: setup.instrumentConfig || {},
      seed: setup.seed || 20261017
    };
  }

  /**
   * grade：对一次诊断提交判分，返回 {rootCorrect, actionCorrect, level, mode}
   * - 预设答案：按选项 id 精确比对（旧调用方式 grade(sc, 'contact', 'clean') 仍可用）
   * - 自定义文字答案：按关键词命中率判分，任一方向命中一半关键词即算答对
   */
  function grade(scenario, rootCause, action) {
    var corr = (scenario && scenario.correct) || {};
    var mode = corr.mode || 'choice';
    var sub = {
      rootCause: rootCause,
      action: action,
      rootCauseText: '',
      actionText: ''
    };
    if (rootCause && typeof rootCause === 'object') {
      sub.rootCause = rootCause.rootCause;
      sub.action = rootCause.action;
      sub.rootCauseText = rootCause.rootCauseText || '';
      sub.actionText = rootCause.actionText || '';
    }

    if (mode === 'text') {
      var r = matchKeys(sub.rootCauseText, corr.rootCauseKeys || []);
      var a = matchKeys(sub.actionText, corr.actionKeys || []);
      // 命中一半关键词即算答对（关键词只有 2 个时命中 1 个即可，3 个时需命中 2 个）
      var rcOk = r.ratio >= 0.5;
      var acOk = a.ratio >= 0.5;
      var anyHit = r.hits > 0 || a.hits > 0;
      return {
        mode: 'text',
        rootCorrect: rcOk,
        actionCorrect: acOk,
        rootHit: r,
        actionHit: a,
        level: rcOk && acOk ? 'full' : anyHit ? 'partial' : 'none'
      };
    }

    var rc = !!corr.rootCause && corr.rootCause === sub.rootCause;
    var ac = !!corr.action && corr.action === sub.action;
    return {
      mode: 'choice',
      rootCorrect: rc,
      actionCorrect: ac,
      rootHit: null,
      actionHit: null,
      level: rc && ac ? 'full' : rc || ac ? 'partial' : 'none'
    };
  }

  /* ------------------------------------------------------------------ */
  /* 自定义故障（2.5 "场景是一份 JSON 配置" 的扩展）                      */
  /* ------------------------------------------------------------------ */

  /** CUSTOM_RANGES：自定义参数的允许范围，用于钳位，避免把模型推到无意义区间 */
  var CUSTOM_RANGES = {
    rate: [0, 0.6],
    iddDyn: [-8, 20],
    iddStdby: [-30, 150],
    fmax: [-40, 40],
    voh: [-0.8, 0.5],
    vol: [-0.3, 0.5],
    leak: [-5, 400],
    continuity: [-0.5, 0.5],
    contactR: [0, 300],
    contactVar: [0, 1.5],
    contactDrift: [0, 300],
    noiseScale: [0.1, 10],
    count: [100, 5000],
    retest: [0, 5]
  };

  /** DUT_DEFAULT_RATES：DUT 模型的默认缺陷率，用于判断"用户是否改过" */
  var DUT_DEFAULT_RATES = { open: 0.015, short: 0.01, leak: 0.02, idd: 0.015, speedTail: 0.03 };

  /** PROGRAM：程序模板，仅用于把 id 翻成中文名、以及取默认限值 */
  var PROGRAM = Tests.createProgram();

  /** numOr：把输入转成有限数字，非法则返回 fallback */
  function numOr(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  /** clamp：把数值夹在区间内 */
  function clamp(v, range) {
    return Math.min(range[1], Math.max(range[0], v));
  }

  /** fmtN：去掉多余小数位的数字文本 */
  function fmtN(v, digits) {
    return Number(v.toFixed(digits === undefined ? 2 : digits)).toString();
  }

  /** pctText：0.015 → "1.5%" */
  function pctText(v) {
    return fmtN(v * 100, 2) + '%';
  }

  /** itemLabel：测试项 id → 中文名称 */
  function itemLabel(id) {
    var it = Tests.findItem(PROGRAM, id);
    return it ? it.name : id;
  }

  /** presetOf：按 kind 取预置选项（找不到返回 null） */
  function presetOf(kind, id) {
    var list = OPTIONS[kind] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /** splitKeys：把 "探针, 接触电阻" 或数组拆成关键词数组（去重、去空） */
  function splitKeys(v) {
    if (v === null || v === undefined) return [];
    var arr = Array.isArray(v) ? v : String(v).split(/[,，、;；\n]+/);
    var out = [];
    arr.forEach(function (s) {
      var t = String(s === null || s === undefined ? '' : s).trim();
      if (t && out.indexOf(t) < 0) out.push(t);
    });
    return out;
  }

  /** normText：去掉空白与中英文标点、统一小写，用于关键词匹配 */
  function normText(s) {
    return String(s === null || s === undefined ? '' : s)
      .toLowerCase()
      .replace(/[\s\u3000]+/g, '')
      .replace(/[，。、；：,.;:!?！？"'“”‘’（）()\[\]【】/\\|~`＋+\-—_]/g, '');
  }

  /** deriveKeys：答案文本留空关键词时，按标点粗切出几个关键词 */
  function deriveKeys(text) {
    var t = String(text || '').trim();
    if (!t) return [];
    var parts = t.split(/[\s\u3000，,。、；;：:（）()【】\[\]→\/\-]+/);
    var out = [];
    parts.forEach(function (p) {
      var q = p.trim();
      if (q.length >= 2 && out.indexOf(q) < 0) out.push(q);
    });
    if (!out.length) out.push(t);
    return out.slice(0, 8);
  }

  /** detectMode：不读 answer.mode，按答案内容推断判分方式 */
  function detectMode(ans) {
    ans = ans || {};
    var hasAny = !!(ans.rootCause || ans.action || ans.rootCauseText || ans.actionText);
    if (!hasAny) return 'none';
    if (ans.rootCause === 'custom' || ans.action === 'custom') return 'text';
    if (presetOf('rootCause', ans.rootCause) && presetOf('action', ans.action)) return 'choice';
    return 'text';
  }

  /** answerMode：answer.mode 显式优先，否则按内容推断 */
  function answerMode(ans) {
    ans = ans || {};
    if (ans.mode === 'text' || ans.mode === 'choice') return ans.mode;
    return detectMode(ans);
  }

  /** answerText：根因 / 处置的标准答案文本 */
  function answerText(ans, kind) {
    ans = ans || {};
    var t = ans[kind + 'Text'];
    if (t) return t;
    var p = presetOf(kind, ans[kind]);
    return p ? p.label : '';
  }

  /** matchKeys：自由文字答案按关键词命中判分，返回命中数与命中率 */
  function matchKeys(input, keys) {
    var s = normText(input);
    var hit = [];
    var totalKeys = 0;
    (keys || []).forEach(function (k) {
      var nk = normText(k);
      if (!nk) return;
      totalKeys++;
      if (s.indexOf(nk) >= 0) {
        hit.push(k);
        return;
      }
      // 长短语（≥4 字）允许字面覆盖，避免学员换种说法就完全不得分
      if (nk.length >= 4) {
        var seen = {};
        var need = 0;
        var i;
        for (i = 0; i < nk.length; i++) {
          if (!seen[nk[i]]) {
            seen[nk[i]] = 1;
            need++;
          }
        }
        var got = 0;
        Object.keys(seen).forEach(function (ch) {
          if (s.indexOf(ch) >= 0) got++;
        });
        if (need && got / need >= 0.7) hit.push(k);
      }
    });
    return {
      hits: hit.length,
      hitKeys: hit,
      total: totalKeys,
      ratio: totalKeys ? hit.length / totalKeys : 0
    };
  }

  /** defaultCustom：一份空白自定义故障定义 */
  function defaultCustom() {
    return {
      id: null,
      name: '我的自定义故障',
      brief: '',
      defectRates: {},
      shift: {},
      instrument: {},
      limits: {},
      answer: {
        mode: '',
        rootCause: '',
        rootCauseText: '',
        rootCauseKeys: '',
        action: '',
        actionText: '',
        actionKeys: '',
        explanation: ''
      },
      batch: { count: 500, retest: 0, seed: 20261017 }
    };
  }

  /** sanitizeCustom：清洗并钳位一份自定义定义，非法项直接丢弃 */
  function sanitizeCustom(def) {
    var src = def || {};
    var out = defaultCustom();
    out.id = src.id || null;
    out.name = String(src.name === undefined || src.name === null ? out.name : src.name).slice(0, 40);
    out.brief = String(src.brief || '').slice(0, 240);

    var rates = src.defectRates || {};
    ['open', 'short', 'leak', 'idd', 'speedTail'].forEach(function (k) {
      var v = numOr(rates[k], null);
      if (v !== null) out.defectRates[k] = clamp(v, CUSTOM_RANGES.rate);
    });

    var shift = src.shift || {};
    ['iddDyn', 'iddStdby', 'fmax', 'voh', 'vol', 'leak', 'continuity'].forEach(function (k) {
      var v = numOr(shift[k], null);
      if (v !== null) out.shift[k] = clamp(v, CUSTOM_RANGES[k]);
    });

    var ins = src.instrument || {};
    out.instrument.contactR = clamp(numOr(ins.contactR, 8), CUSTOM_RANGES.contactR);
    out.instrument.contactVar = clamp(numOr(ins.contactVar, 0.12), CUSTOM_RANGES.contactVar);
    out.instrument.contactDrift = clamp(numOr(ins.contactDrift, 0), CUSTOM_RANGES.contactDrift);
    out.instrument.noiseScale = clamp(numOr(ins.noiseScale, 1), CUSTOM_RANGES.noiseScale);

    var limits = src.limits || {};
    Object.keys(limits).forEach(function (id) {
      if (!Tests.findItem(PROGRAM, id)) return;
      var ov = limits[id] || {};
      var lsl = numOr(ov.lsl, null);
      var usl = numOr(ov.usl, null);
      if (lsl === null && usl === null) return;
      out.limits[id] = { lsl: lsl, usl: usl };
    });

    var ans = src.answer || {};
    out.answer.rootCause = String(ans.rootCause || '').slice(0, 20);
    out.answer.action = String(ans.action || '').slice(0, 20);
    out.answer.rootCauseText = String(ans.rootCauseText || '').slice(0, 300);
    out.answer.actionText = String(ans.actionText || '').slice(0, 300);
    out.answer.rootCauseKeys = splitKeys(ans.rootCauseKeys);
    out.answer.actionKeys = splitKeys(ans.actionKeys);
    out.answer.explanation = String(ans.explanation || '').slice(0, 600);

    // 选了预置项但没写文本/关键词时，用预置项的文案补全，方便统一展示与判分
    out.answer.mode = detectMode(out.answer);
    ['rootCause', 'action'].forEach(function (kind) {
      var preset = presetOf(kind, out.answer[kind]);
      var textKey = kind + 'Text';
      var keysKey = kind + 'Keys';
      if (!out.answer[textKey] && preset) out.answer[textKey] = preset.label;
      if (!out.answer[keysKey].length) {
        if (preset) out.answer[keysKey] = preset.keys.slice();
        else if (out.answer[textKey]) out.answer[keysKey] = deriveKeys(out.answer[textKey]);
      }
    });
    out.answer.mode = detectMode(out.answer);

    var batch = src.batch || {};
    out.batch.count = Math.round(clamp(numOr(batch.count, 500), CUSTOM_RANGES.count));
    out.batch.retest = Math.round(clamp(numOr(batch.retest, 0), CUSTOM_RANGES.retest));
    out.batch.seed = Math.round(numOr(batch.seed, 20261017));
    return out;
  }

  /** summarizeChanges：把自定义定义翻成"改了哪些参数"的中文清单 */
  function summarizeChanges(def) {
    var d = sanitizeCustom(def);
    var parts = [];
    var names = { open: '开路', short: '短路', leak: '高漏电', idd: '高 IDD', speedTail: '速度尾部' };
    Object.keys(names).forEach(function (k) {
      var v = d.defectRates[k];
      if (v === undefined || v === null) return;
      if (Math.abs(v - DUT_DEFAULT_RATES[k]) < 1e-9) return;
      parts.push(names[k] + '缺陷率 ' + pctText(v) + '（默认 ' + pctText(DUT_DEFAULT_RATES[k]) + '）');
    });

    var shiftText = {
      iddDyn: ['IDD 动态', 'mA', 2],
      iddStdby: ['IDD 待机', 'µA', 2],
      fmax: ['Fmax', 'MHz', 1],
      voh: ['VOH', 'V', 3],
      vol: ['VOL', 'V', 3],
      leak: ['输入漏电', 'nA', 1],
      continuity: ['连续性压降', 'V', 3]
    };
    Object.keys(shiftText).forEach(function (k) {
      var v = d.shift[k];
      if (v === undefined || v === null || Math.abs(v) < 1e-9) return;
      var t = shiftText[k];
      parts.push(t[0] + ' 整体偏移 ' + (v > 0 ? '+' : '') + fmtN(v, t[2]) + ' ' + t[1]);
    });

    if (d.instrument.contactR !== 8) parts.push('接触电阻 ' + fmtN(d.instrument.contactR, 1) + ' Ω');
    if (Math.abs(d.instrument.contactVar - 0.12) > 1e-9)
      parts.push('接触电阻波动 ' + pctText(d.instrument.contactVar));
    if (d.instrument.contactDrift > 0)
      parts.push('接触电阻整批漂移 +' + fmtN(d.instrument.contactDrift, 0) + ' Ω');
    if (Math.abs(d.instrument.noiseScale - 1) > 1e-9)
      parts.push('读数噪声 ×' + fmtN(d.instrument.noiseScale, 2));

    Object.keys(d.limits).forEach(function (id) {
      var ov = d.limits[id];
      var txt = [];
      if (ov.lsl !== null && ov.lsl !== undefined) txt.push('LSL ' + fmtN(ov.lsl, 4));
      if (ov.usl !== null && ov.usl !== undefined) txt.push('USL ' + fmtN(ov.usl, 4));
      parts.push(itemLabel(id) + ' 限值改为 ' + txt.join(' / '));
    });
    return parts;
  }

  /** symptomList：根据设置推断"统计页上应该看到什么症状" */
  function symptomList(def) {
    var d = sanitizeCustom(def);
    var out = [];
    var contactBad =
      d.instrument.contactR > 15 ||
      d.instrument.contactDrift > 10 ||
      Math.abs(d.instrument.contactR - 8) > 5;
    if (contactBad) out.push('Bin 4（VOH/VOL）失效增多，同一颗 die 复测有时又能过');
    if (d.instrument.contactDrift > 10) out.push('良率随测试序号下降，后段 wafer 明显更差');
    if (d.shift.iddDyn > 0.5 || d.shift.iddStdby > 20 || (d.defectRates.idd || 0) > 0.015)
      out.push('IDD 分布右移，Bin 5 增多');
    if (d.shift.iddStdby > 3 && d.shift.iddStdby <= 20) out.push('待机电流偏高、Cpk 下降（尚未大面积超限）');
    if (d.shift.voh <= -0.3) out.push('VOH 分布整体下移，Bin 4 增多');
    else if (d.shift.voh < -0.02) out.push('VOH 分布下移、Cpk 下降（余量 0.5V，尚未大面积超限）');
    if (d.shift.vol >= 0.12) out.push('VOL 分布整体上移，Bin 4 增多');
    else if (d.shift.vol > 0.02) out.push('VOL 分布上移、Cpk 下降（余量仅 0.15V，已在临界）');
    if (d.shift.fmax <= -12) out.push('Fmax 分布左移，Bin 6 增多');
    else if (d.shift.fmax < -0.5) out.push('Fmax 分布左移、Cpk 下降（尚未大面积超限）');
    if (d.shift.leak > 5 || (d.defectRates.leak || 0) > 0.02) out.push('输入漏电偏高，Bin 3 增多');
    if ((d.defectRates.open || 0) > 0.015 || (d.defectRates.short || 0) > 0.01)
      out.push('连续性/开路短路失效增多，Bin 2 增多');
    if (Math.abs(d.shift.continuity || 0) > 0.005) out.push('连续性压降整体偏移，Bin 2 失效增多');
    if ((d.defectRates.speedTail || 0) > 0.03) out.push('速度尾部失效率升高，Bin 6 增多');

    var tighter = false;
    var looser = false;
    Object.keys(d.limits).forEach(function (id) {
      var ov = d.limits[id];
      var base = Tests.findItem(PROGRAM, id);
      if (!base) return;
      if (ov.lsl !== null && ov.lsl !== undefined && base.lsl !== null && ov.lsl > base.lsl) tighter = true;
      if (ov.usl !== null && ov.usl !== undefined && base.usl !== null && ov.usl < base.usl) tighter = true;
      if (ov.lsl !== null && ov.lsl !== undefined && base.lsl !== null && ov.lsl < base.lsl) looser = true;
      if (ov.usl !== null && ov.usl !== undefined && base.usl !== null && ov.usl > base.usl) looser = true;
    });
    if (tighter) out.push('过杀率上升（真良品被判坏）');
    if (looser) out.push('漏检率上升（坏品被判良品）');
    if (Math.abs(d.instrument.noiseScale - 1) > 0.5) out.push('同一颗 die 反复测结果跳变，分布变宽、Cpk 下降');
    if (!out.length) out.push('各项统计与基线接近（故障参数太弱或未生效）');
    return out;
  }

  /** autoExplain：没有手写讲解时，按注入参数自动生成一段讲解 */
  function autoExplain(def) {
    var d = sanitizeCustom(def);
    var changes = summarizeChanges(d);
    var symptoms = symptomList(d);
    return (
      '本场景注入了：' +
      (changes.length ? changes.join('；') : '未设置明显故障') +
      '。预期症状：' +
      symptoms.join('；') +
      '。诊断思路：先看失效集中在哪个 Bin，再判断分布是整体平移（工艺/参数偏移）还是离散失效（缺陷/接触问题），最后对照过杀率与漏检率确认限值是否合理。'
    );
  }

  /** autoBrief：没有手写任务描述时，按参数生成一句任务背景 */
  function autoBrief(def) {
    var changes = summarizeChanges(sanitizeCustom(def));
    return (
      '自定义故障批次：' +
      (changes.length ? changes.slice(0, 4).join('，') : '参数未修改') +
      '。请判断根因并选出正确处置。'
    );
  }

  /** answerSummary：给界面用的一句话说明"这道题怎么判分" */
  function answerSummary(def) {
    var d = sanitizeCustom(def);
    if (d.answer.mode === 'none') return '诊断答案：未设置（该场景只用于观察数据，不判分）';
    if (d.answer.mode === 'choice') {
      return (
        '诊断答案：选项判分（根因「' +
        answerText(d.answer, 'rootCause') +
        '」／处置「' +
        answerText(d.answer, 'action') +
        '」）'
      );
    }
    return (
      '诊断答案：文字判分（根因关键词 ' +
      d.answer.rootCauseKeys.join('、') +
      '；处置关键词 ' +
      d.answer.actionKeys.join('、') +
      '，命中一半以上即算答对）'
    );
  }

  /** validateCustom：校验自定义定义，返回 {ok, errors, def} */
  function validateCustom(def) {
    var d = sanitizeCustom(def);
    var errors = [];
    if (!String(d.name || '').trim()) errors.push('场景名称不能为空');
    if (!summarizeChanges(d).length) errors.push('请至少设置一项故障参数（缺陷率、参数偏移、接触电阻或限值）');
    Object.keys(d.limits).forEach(function (id) {
      var ov = d.limits[id];
      if (ov.lsl !== null && ov.lsl !== undefined && ov.usl !== null && ov.usl !== undefined && ov.lsl >= ov.usl)
        errors.push(itemLabel(id) + ' 的下限必须小于上限');
    });
    var rc = d.answer.rootCause;
    var ac = d.answer.action;
    var hasRc = rc === 'custom' ? !!d.answer.rootCauseText : !!rc;
    var hasAc = ac === 'custom' ? !!d.answer.actionText : !!ac;
    if (hasRc !== hasAc) errors.push('诊断答案要么根因与处置都填，要么都留空（留空则该场景不判分）');

    var mode = d.answer.mode;
    if (mode === 'text') {
      if (rc === 'custom' && !d.answer.rootCauseText) errors.push('自定义根因需要填写答案文本');
      if (ac === 'custom' && !d.answer.actionText) errors.push('自定义处置需要填写答案文本');
      if (!d.answer.rootCauseKeys.length) errors.push('自定义根因需要至少一个判分关键词');
      if (!d.answer.actionKeys.length) errors.push('自定义处置需要至少一个判分关键词');
    } else {
      if (rc && !presetOf('rootCause', rc)) errors.push('未知的根因选项');
      if (ac && !presetOf('action', ac)) errors.push('未知的处置选项');
    }
    return { ok: errors.length === 0, errors: errors, def: d };
  }

  /** toScenario：把自定义定义转成与预置场景同构的对象，可直接运行/判分 */
  function toScenario(def) {
    var d = sanitizeCustom(def);
    var config = {};
    var rates = {};
    ['open', 'short', 'leak', 'idd'].forEach(function (k) {
      if (d.defectRates[k] !== undefined) rates[k] = d.defectRates[k];
    });
    if (Object.keys(rates).length) config.defectRates = rates;
    if (d.defectRates.speedTail !== undefined) config.speedTailRate = d.defectRates.speedTail;
    if (Object.keys(d.shift).length) config.shifts = d.shift;

    var instrument = {};
    if (Math.abs(d.instrument.contactR - 8) > 1e-9) instrument.contactR = d.instrument.contactR;
    if (Math.abs(d.instrument.contactVar - 0.12) > 1e-9) instrument.contactVar = d.instrument.contactVar;
    if (d.instrument.contactDrift > 0) instrument.contactDrift = d.instrument.contactDrift;
    if (Math.abs(d.instrument.noiseScale - 1) > 1e-9) instrument.noiseScale = d.instrument.noiseScale;

    var changes = summarizeChanges(d);
    var mode = d.answer.mode || detectMode(d.answer);
    var hasAnswer =
      mode === 'text'
        ? !!(d.answer.rootCauseText && d.answer.actionText)
        : mode === 'choice' && !!presetOf('rootCause', d.answer.rootCause) && !!presetOf('action', d.answer.action);
    return {
      id: d.id || 'custom-preview',
      name: d.name,
      tag: 'CUSTOM · 自定义故障',
      brief: d.brief || autoBrief(d),
      task:
        mode === 'text'
          ? '判断这批 die 异常的根因与处置，用你自己的话写下来（按关键词判分）。'
          : '判断这批 die 异常的根因，并选出正确处置。',
      hint: '对照「批量统计」：失效集中在哪个 Bin？分布是整体平移还是变宽？过杀率和漏检率哪个异常？',
      setup: {
        config: config,
        instrumentConfig: instrument,
        limits: d.limits,
        describe: changes.join('；') || '未设置故障参数',
        seed: d.batch.seed
      },
      correct: {
        mode: hasAnswer ? mode : 'none',
        rootCause: hasAnswer && mode === 'choice' ? d.answer.rootCause : '',
        action: hasAnswer && mode === 'choice' ? d.answer.action : '',
        rootCauseText: hasAnswer ? d.answer.rootCauseText : '',
        rootCauseKeys: hasAnswer ? d.answer.rootCauseKeys : [],
        actionText: hasAnswer ? d.answer.actionText : '',
        actionKeys: hasAnswer ? d.answer.actionKeys : []
      },
      explanation: d.answer.explanation || autoExplain(d),
      isCustom: true,
      def: d,
      batch: { count: d.batch.count, retest: d.batch.retest, seed: d.batch.seed }
    };
  }

  /** CUSTOM_TEMPLATES：3 个自定义故障模板，覆盖预置场景没涉及的失效模式 */
  var CUSTOM_TEMPLATES = [
    {
      id: 'weak-drive',
      label: '弱驱动：VOH 整体偏低',
      def: {
        name: '弱驱动（VOH 偏低）',
        brief: '这条程序今天 Bin 4 变多，看直方图 VOH 整体左移了约 0.45V，VOL、IDD、速度都正常。',
        shift: { voh: -0.45 },
        answer: {
          rootCause: 'process-shift',
          action: 'stop-line',
          explanation:
            'VOH 整体下移而 VOL/IDD/Fmax 正常，说明输出高电平的驱动能力变弱（输出级工艺参数漂移，如驱动管尺寸/阈值变化）。这类"整体平移"通常是 wafer 工艺问题，不是测试系统问题；正确处置是停线排查工艺并重新流片验证。'
        },
        batch: { count: 500, retest: 0, seed: 20261017 }
      }
    },
    {
      id: 'iddq-leak',
      label: '待机漏电：IDDQ 超标',
      def: {
        name: '待机漏电（IDDQ 偏高）',
        brief: '动态 IDD 正常，但待机电流从 20µA 涨到 65µA 左右，Bin 5 变多。',
        shift: { iddStdby: 45 },
        answer: {
          rootCause: 'process-shift',
          action: 'stop-line',
          explanation:
            '只有 IDD 待机（时钟停止时的静态电流）偏移，动态电流与速度正常，典型是栅氧漏电/结漏电变大，属于工艺漂移或来料问题。正确处置是停线排查工艺，并把 IDDQ 纳入 SPC 监控。'
        },
        batch: { count: 500, retest: 0, seed: 20261017 }
      }
    },
    {
      id: 'noisy',
      label: '测量噪声过大（不判分）',
      def: {
        name: '测量噪声过大',
        brief: '同一颗 die 连着测三次结果都不一样，良率忽高忽低，但 die 本身没有问题。',
        instrument: { noiseScale: 6 },
        answer: { rootCause: '', action: '', explanation: '' },
        batch: { count: 500, retest: 0, seed: 20261017 }
      }
    }
  ];

  /** getCustomTemplate：按 id 取模板定义（深拷贝，避免被界面改坏） */
  function getCustomTemplate(id) {
    for (var i = 0; i < CUSTOM_TEMPLATES.length; i++) {
      if (CUSTOM_TEMPLATES[i].id === id) return JSON.parse(JSON.stringify(CUSTOM_TEMPLATES[i].def));
    }
    return null;
  }

  var Scenarios = {
    SCENARIOS: SCENARIOS,
    OPTIONS: OPTIONS,
    CUSTOM_TEMPLATES: CUSTOM_TEMPLATES,
    getScenario: getScenario,
    buildSetup: buildSetup,
    grade: grade,
    presetOf: presetOf,
    answerMode: answerMode,
    answerText: answerText,
    matchKeys: matchKeys,
    deriveKeys: deriveKeys,
    splitKeys: splitKeys,
    defaultCustom: defaultCustom,
    sanitizeCustom: sanitizeCustom,
    validateCustom: validateCustom,
    summarizeChanges: summarizeChanges,
    symptomList: symptomList,
    answerSummary: answerSummary,
    autoExplain: autoExplain,
    autoBrief: autoBrief,
    toScenario: toScenario,
    getCustomTemplate: getCustomTemplate
  };

  ATE.Scenarios = Scenarios;
  if (typeof module !== 'undefined' && module.exports) module.exports = Scenarios;
})(typeof globalThis !== 'undefined' ? globalThis : this);
