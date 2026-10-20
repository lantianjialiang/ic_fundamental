import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  F_OUT_OPTIONS_MHZ,
  F_REF_OPTIONS_MHZ,
  JITTER_SAMPLES,
  JITTER_SPEC_PS,
  LOCK_SPEC_US,
  MEASURE_WINDOW_US,
  PPM_SPEC,
  UNSTABLE_DIV,
  VCO_JITTER_PS,
  lockTimeUs,
  type PllResult,
  type PllState,
} from './pllModel'

/** 出题用的固定数字：f_ref 10 MHz，f_out 800 MHz，N = 80，参考偏差 +20 ppm */
const Q_FREF = 10
const Q_FOUT = 800
const Q_N = Q_FOUT / Q_FREF
const Q_REF_PPM = 20
const Q_BW_A = 50
const Q_BW_B = 200
const Q_REF_JITTER = 1
const JITTER_RSS = Math.sqrt(Q_REF_JITTER ** 2 + VCO_JITTER_PS ** 2)

export const S = {
  kickerNow: loc('这一次测试', 'This test run'),
  introTitle: loc('PLL 时钟测试：要测的四个量', 'PLL clock test: four quantities to measure'),
  coreTitle: loc('拨一拨：参考、带宽与抖动', 'Try it: reference, bandwidth and jitter'),
  coreNote: loc(
    '虚拟 PLL（VDUT-PLL1）把参考晶振倍频成输出时钟。f_ref 与 f_out 的组合决定整数分频比 N。BW 拨大锁得快，但超过 f_ref / 10 就不稳定。参考的 ppm 误差与抖动会直接传到输出。所有数值都是模型生成的示意结果。',
    'The virtual PLL (VDUT-PLL1) multiplies a reference crystal into the output clock. The f_ref and f_out pair sets the integer divider N. A wider BW locks faster, but above f_ref / 10 the loop is unstable. The reference ppm error and jitter pass straight through to the output. All values are illustrative model output.',
  ),
  fRefLabel: loc('参考频率 f_ref', 'Reference frequency f_ref'),
  fOutLabel: loc('输出频率 f_out', 'Output frequency f_out'),
  bwLabel: loc('环路带宽 BW', 'Loop bandwidth BW'),
  refPpmLabel: loc('参考晶振偏差', 'Reference crystal offset'),
  refJitterLabel: loc('参考抖动（rms）', 'Reference jitter (rms)'),
  seedLabel: loc('随机种子（抖动抽样）', 'Random seed (jitter sampling)'),
  rDivider: loc('分频比 N = f_out / f_ref', 'Divider N = f_out / f_ref'),
  rTau: loc('时间常数 τ = 1 / (2π·BW)', 'Time constant τ = 1 / (2π·BW)'),
  rLock: loc('锁定时间（进入 ±10 ppm）· 规格 10 µs', 'Lock time (into ±10 ppm) · spec 10 µs'),
  rStatus: loc('锁定状态', 'Lock status'),
  rPpm: loc('输出频率误差 · 规格 ±50 ppm', 'Output frequency error · spec ±50 ppm'),
  rHz: loc('频率误差（Hz）', 'Frequency error (Hz)'),
  rJitter: loc('周期抖动（rms）· 规格 2 ps', 'Period jitter (rms) · spec 2 ps'),
  statusOk: loc('正常锁定', 'Locked normally'),
  statusSlow: loc('锁定太慢', 'Locks too slowly'),
  statusNone: loc('测试窗内未锁定', 'Not locked in test window'),
  statusUnstable: loc('环路不稳定', 'Loop unstable'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  asideLater: loc(
    '这一课只看锁定、频率误差与周期抖动；修正参考 ppm 误差的修调（trim）放在下一课。',
    'This lesson covers only lock, frequency error and period jitter; correcting the reference ppm error by trim comes in the next lesson.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc('把锁定时间压到 10 µs 规格以内（BW 约 130 kHz 以上，且环路稳定）。', 'Bring the lock time within the 10 µs spec (BW about 130 kHz or more, with a stable loop).'),
  task2: loc(
    '让频率误差超过 ±50 ppm 规格，同时 PLL 仍然正常锁定（它不会修正参考的误差）。',
    'Push the output frequency error beyond the ±50 ppm spec while the PLL still locks normally (it does not correct the reference error).',
  ),
  task3: loc('让环路不稳定（BW 超过 f_ref / 10）。', 'Make the loop unstable (BW above f_ref / 10).'),
  task4: loc('让周期抖动超过 2 ps 规格。', 'Push the period jitter above the 2 ps spec.'),
}

export const FIG = {
  specAria: loc(
    '锁定曲线：频率误差对数刻度随时间下降，标出 ±10 ppm 锁定窗与 10 µs 规格',
    'Lock curve: frequency error on a log scale falls over time, with the ±10 ppm lock window and the 10 µs spec marked',
  ),
  figCap: loc(
    '横轴是时间（0–40 µs，即测试窗口），纵轴是输出频率相对锁定终值的误差，对数刻度（ppm）。上电时 VCO 偏离 2%，误差按 e^(−t/τ) 下降；进入 ±10 ppm 锁定窗即判为锁定。τ 越大（BW 越小），曲线下降越慢。',
    'Horizontal axis: time (0–40 µs, the test window). Vertical axis: output frequency error from the final locked value, log scale in ppm. At power-up the VCO is 2% off, and the error falls as e^(−t/τ); it counts as locked once inside the ±10 ppm window. A larger τ (smaller BW) means a slower fall.',
  ),
  lockWin: loc('锁定窗 ±10 ppm', 'Lock ±10 ppm'),
  specLbl: loc('10 µs 规格', '10 µs spec'),
  lockLbl: loc('锁定', 'Locked'),
  noLock: loc('测试窗内未进入锁定窗', 'Not inside the lock window in the test window'),
  unstable: loc('环路不稳定：不画锁定曲线', 'Loop unstable: no lock curve drawn'),
}

export const REF_OPTIONS: Array<{ id: string; label: LText }> = F_REF_OPTIONS_MHZ.map((f) => ({
  id: String(f),
  label: loc(`${f} MHz`, `${f} MHz`),
}))

export const OUT_OPTIONS: Array<{ id: string; label: LText }> = F_OUT_OPTIONS_MHZ.map((f) => ({
  id: String(f),
  label: loc(`${f} MHz`, `${f} MHz`),
}))

export const INTRO: LText[] = [
  loc(
    '{@anaFft} 讲的是从波形看频谱；{@anaDynamic} 讲的是 ADC 的动态参数。时钟是两者的共同前提：采样时钟不准或抖动大，ADC 的 SNR 也会跟着掉。这一课看时钟本身，用 PLL 生成的时钟来测。',
    'In {@anaFft} we read spectra from waveforms, and {@anaDynamic} covered ADC dynamic parameters. The clock underlies both: an inaccurate or jittery sampling clock drags the ADC’s SNR down too. This lesson looks at the clock itself, measuring a PLL-generated clock.',
  ),
  loc(
    '一个 PLL 时钟要测四件事：锁定没有（会不会锁住）、锁多快（锁定时间）、准不准（ppm 频率误差）、抖不抖（周期抖动）。前三个看时间与频率，最后一个看随机的相位误差。',
    'A PLL clock is tested on four points: does it lock, how fast (lock time), how accurate (ppm frequency error), and how much jitter (period jitter). The first three are about time and frequency; the last is about random timing error.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'BW 越大越好。BW 大能锁得快，但超过 f_ref / 10 就不稳定；而且 BW 越宽，参考自身的噪声越容易传到输出。',
    'A wider BW is always better. It locks faster, but above f_ref / 10 the loop is unstable, and a wider BW also lets more of the reference’s own noise reach the output.',
  ),
  loc(
    'PLL 能修正参考晶振的 ppm 误差。锁定后 f_out = N·f_ref，两边比值不变，参考的 ppm 误差原样传到输出，PLL 不会把它拉回标称值。',
    'A PLL corrects the reference’s ppm error. Once locked, f_out = N·f_ref keeps the ratio, so the reference’s ppm error passes to the output unchanged; the PLL does not pull it back to nominal.',
  ),
  loc(
    '锁定时间跟参考频率有关。在一阶模型里，锁定时间只由 BW 决定（τ = 1 / (2π·BW)），与 f_ref 无关；f_ref 只决定不稳定的上限。',
    'Lock time depends on the reference frequency. In the first-order model lock time is set only by BW through τ = 1 / (2π·BW), not by f_ref; f_ref only sets the instability limit.',
  ),
]

export const TAKEAWAY: LText = loc(
  '锁定后 f_out = N·f_ref，参考的 ppm 误差原样传到输出，PLL 不会修正它。BW 决定锁定时间（τ = 1 / (2π·BW)，从 2% 锁到 ±10 ppm 约需 τ·ln(2000)），但 BW 超过 f_ref / 10 就不稳定。周期抖动按平方和合成参考抖动与 VCO 抖动。',
  'Once locked, f_out = N·f_ref, so the reference’s ppm error passes to the output and the PLL does not correct it. BW sets the lock time (τ = 1 / (2π·BW); going from 2% to ±10 ppm takes about τ·ln(2000)), but above f_ref / 10 the loop is unstable. Period jitter adds the reference and VCO jitter in root-sum-square.',
)

/** 右侧说明栏：按锁定状态、ppm 与抖动给出结论，并写出原因 */
export function verdictOf(state: PllState, result: PllResult): { title: LText; text: LText } {
  const lock = result.lockUs.toFixed(1)
  const ppm = result.outPpm.toFixed(0)
  const jitter = result.jitterPs.toFixed(2)
  if (result.lockStatus === 'unstable') {
    const limitKhz = state.fRefMhz * 100
    return {
      title: S.fail,
      text: loc(
        `BW ${state.bwKhz} kHz 超过了 f_ref / ${UNSTABLE_DIV}（${state.fRefMhz} MHz 参考的上限是 ${limitKhz} kHz）。环路相位裕度不够，会振荡，锁不住。把 BW 降到上限以下。`,
        `BW of ${state.bwKhz} kHz is above f_ref / ${UNSTABLE_DIV} (a ${state.fRefMhz} MHz reference gives a limit of ${limitKhz} kHz). The loop lacks phase margin and oscillates, so it cannot lock. Lower BW below that limit.`,
      ),
    }
  }
  if (result.lockStatus === 'no-lock') {
    return {
      title: S.fail,
      text: loc(
        `锁定时间约 ${lock} µs，超过 ${MEASURE_WINDOW_US} µs 测试窗，测试时判为未锁定。BW 越小，τ 越大，锁定越慢。`,
        `Lock time is about ${lock} µs, longer than the ${MEASURE_WINDOW_US} µs test window, so the test reports not locked. A smaller BW means a larger τ and slower lock.`,
      ),
    }
  }
  if (result.lockStatus === 'slow') {
    return {
      title: S.fail,
      text: loc(
        `锁定时间约 ${lock} µs，超过 ${LOCK_SPEC_US} µs 规格。锁定时间与 BW 成反比（τ = 1 / (2π·BW)），提高 BW 才能加快锁定。`,
        `Lock time is about ${lock} µs, above the ${LOCK_SPEC_US} µs spec. Lock time is inversely proportional to BW (τ = 1 / (2π·BW)), so raising BW is what speeds it up.`,
      ),
    }
  }
  if (!result.ppmOk) {
    return {
      title: S.fail,
      text: loc(
        `输出频率误差 ${ppm} ppm 超过 ±${PPM_SPEC} ppm。锁定后输出的 ppm 误差就是参考的误差（f_out = N·f_ref，比值不变），PLL 不会修正它；要靠更准的参考或修调。`,
        `Output frequency error ${ppm} ppm exceeds ±${PPM_SPEC} ppm. Once locked, the output ppm error equals the reference’s (f_out = N·f_ref keeps the ratio), and the PLL does not correct it; use a more accurate reference or trim it.`,
      ),
    }
  }
  if (!result.jitterOk) {
    return {
      title: S.fail,
      text: loc(
        `周期抖动 ${jitter} ps 超过 ${JITTER_SPEC_PS} ps 规格。参考抖动 ${state.refJitterPs.toFixed(1)} ps 与 VCO 自身的 ${VCO_JITTER_PS} ps 按平方和合成，参考抖动越大，合成后的抖动就越大。`,
        `Period jitter ${jitter} ps exceeds the ${JITTER_SPEC_PS} ps spec. The reference jitter of ${state.refJitterPs.toFixed(1)} ps and the VCO’s own ${VCO_JITTER_PS} ps add in root-sum-square, so a larger reference jitter gives a larger total.`,
      ),
    }
  }
  return {
    title: S.pass,
    text: loc(
      `锁定时间 ${lock} µs ≤ ${LOCK_SPEC_US} µs，频率误差 ${ppm} ppm 在 ±${PPM_SPEC} ppm 内，周期抖动 ${jitter} ps ≤ ${JITTER_SPEC_PS} ps。三项都在规格内，判 PASS。`,
      `Lock time ${lock} µs ≤ ${LOCK_SPEC_US} µs, frequency error ${ppm} ppm is within ±${PPM_SPEC} ppm, and period jitter ${jitter} ps ≤ ${JITTER_SPEC_PS} ps. All three meet spec, so the verdict is PASS.`,
    ),
  }
}

/** 四张任务卡：完成与否由当前设置和结果算出 */
export function taskItems(result: PllResult): TaskItem[] {
  return [
    { id: 'lock', text: S.task1, done: result.stable && result.lockUs <= LOCK_SPEC_US },
    { id: 'ppm', text: S.task2, done: !result.ppmOk && result.lockStatus === 'ok' },
    { id: 'unstable', text: S.task3, done: !result.stable },
    { id: 'jitter', text: S.task4, done: !result.jitterOk },
  ]
}

/** 小测题干和选项里的数字由模型常数算出，改了模型，小测和解析自动跟着变 */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `参考晶振偏差 +${Q_REF_PPM} ppm，f_ref = ${Q_FREF} MHz，f_out = ${Q_FOUT} MHz。PLL 锁定后，输出的频率误差大约是多少？`,
      `The reference crystal is +${Q_REF_PPM} ppm off, f_ref = ${Q_FREF} MHz and f_out = ${Q_FOUT} MHz. Once the PLL is locked, about how large is the output frequency error?`,
    ),
    options: [
      {
        id: 'a',
        text: loc(
          `${Q_REF_PPM} ppm，约 ${((Q_REF_PPM * Q_FOUT) / 1000).toFixed(0)} kHz`,
          `${Q_REF_PPM} ppm, about ${((Q_REF_PPM * Q_FOUT) / 1000).toFixed(0)} kHz`,
        ),
      },
      {
        id: 'b',
        text: loc(
          `${Q_REF_PPM * Q_N} ppm（ppm 乘以 N），约 ${((Q_REF_PPM * Q_N * Q_FOUT) / 1e6).toFixed(2)} MHz`,
          `${Q_REF_PPM * Q_N} ppm (ppm times N), about ${((Q_REF_PPM * Q_N * Q_FOUT) / 1e6).toFixed(2)} MHz`,
        ),
      },
      {
        id: 'c',
        text: loc(
          `${(Q_REF_PPM / Q_N).toFixed(2)} ppm（ppm 除以 N），约 ${((Q_REF_PPM / Q_N) * Q_FOUT / 1000).toFixed(1)} kHz`,
          `${(Q_REF_PPM / Q_N).toFixed(2)} ppm (ppm divided by N), about ${((Q_REF_PPM / Q_N) * Q_FOUT / 1000).toFixed(1)} kHz`,
        ),
      },
    ],
    answer: 'a',
    explain: loc(
      `PLL 锁定时 f_out = N·f_ref，ppm 是比值，倍频前后不变，所以输出的 ppm 误差与参考相同。${Q_REF_PPM} ppm 乘 ${Q_FOUT} MHz 得到 ${((Q_REF_PPM * Q_FOUT) / 1000).toFixed(0)} kHz。乘以或除以 N 都是错的。`,
      `When locked, f_out = N·f_ref. ppm is a ratio that does not change through multiplication, so the output ppm error equals the reference’s. ${Q_REF_PPM} ppm times ${Q_FOUT} MHz gives ${((Q_REF_PPM * Q_FOUT) / 1000).toFixed(0)} kHz. Multiplying or dividing by N is wrong.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `在一阶模型里，环路带宽从 ${Q_BW_A} kHz 提到 ${Q_BW_B} kHz，锁定时间大约怎样变化？`,
      `In the first-order model, the loop bandwidth goes from ${Q_BW_A} kHz to ${Q_BW_B} kHz. How does the lock time change, roughly?`,
    ),
    options: [
      { id: 'a', text: loc('不变，锁定时间只取决于参考频率', 'Unchanged; lock time depends only on the reference frequency') },
      {
        id: 'b',
        text: loc(
          `约为 1/4：${lockTimeUs(Q_BW_A).toFixed(1)} µs → ${lockTimeUs(Q_BW_B).toFixed(1)} µs`,
          `About 1/4: ${lockTimeUs(Q_BW_A).toFixed(1)} µs → ${lockTimeUs(Q_BW_B).toFixed(1)} µs`,
        ),
      },
      { id: 'c', text: loc('约为 4 倍，BW 越大锁得越慢', 'About 4 times; a wider BW locks more slowly') },
    ],
    answer: 'b',
    explain: loc(
      `τ = 1 / (2π·BW)，BW 变为 4 倍，τ 就变为 1/4；锁定时间 τ·ln(2000) 也随之变为 1/4，从 ${lockTimeUs(Q_BW_A).toFixed(1)} µs 降到 ${lockTimeUs(Q_BW_B).toFixed(1)} µs。BW 越大锁得越快，只要还没超过 f_ref / 10 的稳定上限。`,
      `τ = 1 / (2π·BW). Four times the BW makes τ one quarter, so the lock time τ·ln(2000) also falls to one quarter, from ${lockTimeUs(Q_BW_A).toFixed(1)} µs to ${lockTimeUs(Q_BW_B).toFixed(1)} µs. A wider BW locks faster, as long as it stays below the f_ref / 10 stability limit.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(`f_ref = ${Q_FREF} MHz 时，下面哪个环路带宽会使环路不稳定？`, `With f_ref = ${Q_FREF} MHz, which loop bandwidth makes the loop unstable?`),
    options: [
      { id: 'a', text: loc('50 kHz', '50 kHz') },
      { id: 'b', text: loc('2 MHz', '2 MHz') },
      { id: 'c', text: loc('500 kHz', '500 kHz') },
    ],
    answer: 'b',
    explain: loc(
      `经验规则 BW ≤ f_ref / ${UNSTABLE_DIV}，${Q_FREF} MHz 的上限是 ${(Q_FREF * 1000) / UNSTABLE_DIV} kHz（即 1 MHz）。50 kHz 与 500 kHz 都在上限以内，2 MHz 超过上限，环路会振荡，锁不住。`,
      `The rule of thumb is BW ≤ f_ref / ${UNSTABLE_DIV}; for ${Q_FREF} MHz the limit is ${(Q_FREF * 1000) / UNSTABLE_DIV} kHz (1 MHz). 50 kHz and 500 kHz are within it, while 2 MHz is above it, so the loop oscillates and cannot lock.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '参考晶振偏差 +80 ppm，PLL 锁定后，能不能靠环路把输出拉回 ±50 ppm 规格以内？',
      'The reference crystal is +80 ppm off. Once the PLL is locked, can the loop pull the output back within the ±50 ppm spec?',
    ),
    options: [
      { id: 'a', text: loc('不能：输出继承参考的 ppm 误差，PLL 只是复制它', 'No: the output inherits the reference ppm error; the PLL only copies it') },
      { id: 'b', text: loc('能：环路会把 f_out 拉回标称值', 'Yes: the loop pulls f_out back to nominal') },
      { id: 'c', text: loc('能：只要把 BW 调到 1 kHz 以下', 'Yes: just lower the BW below 1 kHz') },
    ],
    answer: 'a',
    explain: loc(
      'PLL 锁定时 f_out = N·f_ref，环路只保证分频比 N 正确，参考本身的误差原样传到输出。要满足 ±50 ppm，只能换更准的参考，或在别处用修调（trim）校正。BW 只影响锁定快慢，不改变 ppm。',
      'When locked, f_out = N·f_ref: the loop only guarantees the divider ratio N, and the reference’s own error passes to the output unchanged. To meet ±50 ppm you need a more accurate reference, or a correction elsewhere such as trim. BW changes only how fast it locks, not the ppm.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `参考抖动 ${Q_REF_JITTER} ps（rms），VCO 自身抖动 ${VCO_JITTER_PS} ps（rms）。输出周期抖动（rms）大约是多少？`,
      `Reference jitter is ${Q_REF_JITTER} ps (rms) and the VCO's own jitter is ${VCO_JITTER_PS} ps (rms). About how large is the output period jitter (rms)?`,
    ),
    options: [
      { id: 'a', text: loc(`${(Q_REF_JITTER + VCO_JITTER_PS).toFixed(2)} ps（直接相加）`, `${(Q_REF_JITTER + VCO_JITTER_PS).toFixed(2)} ps (added directly)`) },
      { id: 'b', text: loc(`${JITTER_RSS.toFixed(2)} ps（平方和再开根）`, `${JITTER_RSS.toFixed(2)} ps (root-sum-square)`) },
      { id: 'c', text: loc(`${VCO_JITTER_PS.toFixed(2)} ps（取较大的那一个）`, `${VCO_JITTER_PS.toFixed(2)} ps (take the larger one)`) },
    ],
    answer: 'b',
    explain: loc(
      `两个独立的随机源按功率相加：σ = √(${Q_REF_JITTER}² + ${VCO_JITTER_PS}²) = ${JITTER_RSS.toFixed(2)} ps。直接相加得到 ${(Q_REF_JITTER + VCO_JITTER_PS).toFixed(2)} ps，会高估；只取较大的一个，又漏掉了另一个的贡献。`,
      `Two independent random sources add in power: σ = √(${Q_REF_JITTER}² + ${VCO_JITTER_PS}²) = ${JITTER_RSS.toFixed(2)} ps. Adding them directly gives ${(Q_REF_JITTER + VCO_JITTER_PS).toFixed(2)} ps, which overestimates; taking only the larger one drops the other source's contribution.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '同样的参数下，测得的周期抖动通常与理论值略有差别。主要原因是什么？',
      'With the same parameters, the measured period jitter usually differs a little from the theoretical value. What is the main reason?',
    ),
    options: [
      { id: 'a', text: loc('测量仪器有固定的正偏差，每次都偏大', 'The instrument has a fixed positive bias and always reads high') },
      {
        id: 'b',
        text: loc(
          `有限样本（${JITTER_SAMPLES} 个周期）的统计波动，σ 的相对起伏约 ${(100 / Math.sqrt(2 * JITTER_SAMPLES)).toFixed(1)}%`,
          `Statistical scatter from a finite sample (${JITTER_SAMPLES} periods); σ fluctuates by about ${(100 / Math.sqrt(2 * JITTER_SAMPLES)).toFixed(1)}%`,
        ),
      },
      { id: 'c', text: loc('种子固定后，测得值一定等于理论值', 'Once the seed is fixed, the result always equals the theoretical value') },
    ],
    answer: 'b',
    explain: loc(
      `σ 估计的相对标准差约为 1/√(2N)，N = ${JITTER_SAMPLES} 时约 ${(100 / Math.sqrt(2 * JITTER_SAMPLES)).toFixed(1)}%。固定种子只保证结果可复现，并不保证它等于理论值；换一个种子，测得值会在理论值附近上下浮动。`,
      `The relative standard deviation of an σ estimate is about 1/√(2N); for N = ${JITTER_SAMPLES} that is about ${(100 / Math.sqrt(2 * JITTER_SAMPLES)).toFixed(1)}%. A fixed seed only makes the result reproducible and does not make it equal the theory; with another seed the reading moves up and down around the theoretical value.`,
    ),
  },
]
