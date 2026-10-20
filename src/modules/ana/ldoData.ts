import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  ACC_LIMIT_PCT,
  C2,
  IQ_LIMIT_UA,
  IQ_UA,
  I_REF,
  LINE_LIMIT,
  LOAD_LIMIT,
  LOAD_PRESETS_MA,
  PSRR_POINTS,
  R0,
  VIN_LO,
  VIN_MAX,
  VIN_NOM,
  V_NOM,
  lineRegMvPerV,
  loadRegMvPerMa,
  psrrDb,
  voutOf,
  voutRippleV,
  type LdoResult,
  type LdoState,
} from './ldoModel'

/** 纹波频率的显示：1000 Hz 显示成 1 kHz */
export function fmtHz(hz: number): string {
  return hz >= 1e3 ? `${hz / 1e3} kHz` : `${hz} Hz`
}

/** 带符号的百分比，正负都写出来 */
export function fmtSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  next: loc('下一课', 'Next lesson'),
  introTitle: loc('LDO 把 Vin 稳成 Vout：四个指标各测什么', 'An LDO holds Vout steady: what each spec measures'),
  coreTitle: loc('拨一拨：Vin、负载与纹波频率', 'Try it: Vin, load and ripple frequency'),
  coreNote: loc(
    '虚构器件 VDUT-LDO1，标称输出 3.3 V。下面的数字来自教学模型，是示意结果，不对应任何真实器件；限值也是示意值。',
    'Virtual part VDUT-LDO1, nominal output 3.3 V. The numbers come from a teaching model and are illustrative; they do not describe a real part, and the limits are illustrative too.',
  ),
  vinLabel: loc('Vin 输入电压', 'Vin input voltage'),
  loadLabel: loc('负载电流 Iload（与 1 mA 比较）', 'Load current Iload (compared with 1 mA)'),
  freqLabel: loc('纹波频率（叠加在 Vin 上）', 'Ripple frequency (on Vin)'),
  rVoutLo: loc(`Vout @ ${VIN_LO.toFixed(1)} V（1 mA）`, `Vout @ ${VIN_LO.toFixed(1)} V (1 mA)`),
  rVoutVin: loc('Vout @ 当前 Vin（1 mA）', 'Vout @ current Vin (1 mA)'),
  rLine: loc(`线性调整率（限值 ≤ ${LINE_LIMIT} mV/V）`, `Line regulation (limit ≤ ${LINE_LIMIT} mV/V)`),
  rAcc: loc(
    `输出精度，相对 ${V_NOM.toFixed(3)} V（限值 ±${ACC_LIMIT_PCT}%）`,
    `Output accuracy vs ${V_NOM.toFixed(3)} V (limit ±${ACC_LIMIT_PCT}%)`,
  ),
  rLoad: loc(`负载调整率（限值 ≤ ${LOAD_LIMIT} mV/mA）`, `Load regulation (limit ≤ ${LOAD_LIMIT} mV/mA)`),
  rIq: loc(`静态电流 Iq，空载（限值 ≤ ${IQ_LIMIT_UA} µA）`, `Quiescent current Iq, no load (limit ≤ ${IQ_LIMIT_UA} µA)`),
  rPsrr: loc('PSRR @ 纹波频率（限值随频率变）', 'PSRR @ ripple frequency (limit depends on frequency)'),
  rVerdict: loc('判定', 'Verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  predictTitle: loc('先算，再看', 'Calculate first'),
  predictLabel: loc('预测线性调整率 (mV/V)', 'Predicted line regulation (mV/V)'),
  predictHint: loc(
    `提示：线性调整率 = (Vout @ 当前 Vin − Vout @ ${VIN_LO.toFixed(1)} V) ÷ (当前 Vin − ${VIN_LO.toFixed(1)} V)。用上面两个读数算，结果换成 mV/V 填入。`,
    `Hint: line regulation = (Vout @ current Vin − Vout @ ${VIN_LO.toFixed(1)} V) ÷ (current Vin − ${VIN_LO.toFixed(1)} V). Use the two readings above, then enter the result in mV/V.`,
  ),
  predictBad: loc(
    '还不对：先算 Vout 的变化量，再除以 Vin 的变化量，结果乘 1000 换成 mV/V。',
    'Not yet: take the change in Vout, divide by the change in Vin, then multiply by 1000 to get mV/V.',
  ),
  loadTitle: loc('负载调整率：大电流时斜率变陡', 'Load regulation: the slope steepens at high current'),
  loadNote: loc(
    '每根横条是从 1 mA 参考点到该负载点的割线斜率。绿色通过，红色超限；当前负载点用 ◀ 标出。',
    'Each bar is the secant slope from the 1 mA reference to that load point. Green passes, red fails; the current load point is marked ◀.',
  ),
  psrrTitle: loc('PSRR：纹波穿过 LDO 的比例随频率变大', 'PSRR: the share of ripple that gets through grows with frequency'),
  psrrNote: loc(
    '在 Vin 上叠加 50 mV 峰值纹波，测 Vout 上的纹波，再换算成 PSRR。曲线是模型的 PSRR，短横线是各频率的限值。',
    'A 50 mV peak ripple is put on Vin; the ripple on Vout is measured and converted to PSRR. The curve is the model PSRR, and the short bars are the limits at each frequency.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '压差（dropout）、温度漂移、EN 的启动时序和过冲留到后面的课；这里只练 Vin、负载和纹波三件事。',
    'Dropout, temperature drift, EN start-up timing and overshoot are left for later; here we only practise Vin, load and ripple.',
  ),
  task1: loc(
    `线性调整率：用 ${VIN_LO.toFixed(1)} V 与当前 Vin 两个读数算出线性调整率，填进预测框（误差 0.05 mV/V 以内）。`,
    `Line regulation: work it out from the ${VIN_LO.toFixed(1)} V and current-Vin readings, then enter it in the prediction box (within 0.05 mV/V).`,
  ),
  task2: loc(
    '负载调整率：把负载点调到仍然通过限值的最大一档。',
    'Load regulation: move the load to the largest step that still passes the limit.',
  ),
  task3: loc(
    'PSRR：把纹波频率调高，直到 PSRR 低于限值（判为 FAIL）。',
    'PSRR: raise the ripple frequency until PSRR drops below its limit (it reads FAIL).',
  ),
}

export const FIG = {
  hookAria: loc(
    'LDO 接线示意图：DPS、AWG 纹波、LDO 引脚、电子负载与 DMM',
    'LDO hookup diagram: DPS, AWG ripple, LDO pins, electronic load and DMM',
  ),
  hookCap: loc(
    'VIN 接 DPS，并叠加 AWG 的纹波；EN 接到 VIN 上，保持使能。VOUT 接电子负载，DMM 在 VOUT 端感测。引脚编号因厂家而异，要以数据手册为准。',
    'VIN comes from the DPS with AWG ripple added; EN is tied to VIN to stay enabled. VOUT feeds the electronic load and the DMM senses at VOUT. Pin numbers differ by vendor; use the datasheet.',
  ),
  dpsSub: loc('给 VIN 供电', 'Supplies VIN'),
  awgSub: loc('叠加纹波', 'Adds ripple'),
  loadBox: loc('电子负载', 'E-load'),
  loadAria: loc(
    '各负载点的负载调整率横条，超过限值的标红',
    'Load regulation bars for each load point; bars over the limit are red',
  ),
  loadAxis: loc('负载调整率 ΔVout/ΔI（mV/mA，相对 1 mA）', 'Load regulation ΔVout/ΔI (mV/mA, relative to 1 mA)'),
  loadLimit: loc(`限值 ${LOAD_LIMIT}`, `Limit ${LOAD_LIMIT}`),
  loadCap: loc(
    '每根横条是从 1 mA 参考点到该负载点的割线斜率。斜率随负载增大：大电流时输出级的等效电阻变大，所以高负载点的斜率更陡，超过限值。',
    'Each bar is the secant slope from the 1 mA reference to that load point. The slope grows with load: at high current the output stage’s effective resistance rises, so the high-load bars are steeper and can exceed the limit.',
  ),
  psrrAria: loc(
    'PSRR 随纹波频率变化的曲线，标出各频率的限值',
    'PSRR against ripple frequency, with each frequency’s limit marked',
  ),
  psrrAxis: loc('PSRR（dB）', 'PSRR (dB)'),
  psrrCap: loc(
    '曲线是 PSRR 随纹波频率的变化：低频约 70 dB，超过 1 kHz 拐点后，每升高十倍频约下降 20 dB。短横线是各频率的限值，绿色达标、红色超限；蓝色竖线是当前纹波频率。',
    'The curve is PSRR against ripple frequency: about 70 dB at low frequency, falling about 20 dB per decade above the 1 kHz corner. Short bars are the limits at each frequency, green passing and red failing; the blue line marks the current ripple frequency.',
  ),
}

export const LOAD_OPTIONS: Array<{ id: string; label: string }> = LOAD_PRESETS_MA.map((ma) => ({
  id: String(ma),
  label: `${ma} mA`,
}))

export const FREQ_OPTIONS: Array<{ id: string; label: string }> = PSRR_POINTS.map((p) => ({
  id: String(p.hz),
  label: fmtHz(p.hz),
}))

export const INTRO: LText[] = [
  loc(
    '{@anaSmu} 讲过 DPS 和 SMU 怎样给 DUT 加电压、读电流。LDO 是最常见的被测器件之一：内部的反馈环把输出钉在一个标称值上，Vin 的变化、负载的变化和纹波都会扰动它。ATE 用几个数字说清它的稳压能力。',
    '{@anaSmu} covered how a DPS or SMU forces voltage and reads current on a DUT. An LDO is one of the most common DUTs: an internal feedback loop holds its output at a nominal value, while changes in Vin, changes in load and ripple all disturb it. ATE describes its regulation with a few numbers.',
  ),
  loc(
    '这一课只练四件事：线性调整率（Vin 变化的影响）、负载调整率（负载变化的影响）、静态电流 Iq（LDO 自己耗的电）、PSRR（纹波穿过 LDO 的程度）。量程与误差带的思路仍然来自 {@anaMeasure}。',
    'This lesson practises four things: line regulation (the effect of Vin), load regulation (the effect of load), quiescent current Iq (the current the LDO uses itself) and PSRR (how much ripple gets through). The range and error-band thinking still comes from {@anaMeasure}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '线性调整率和负载调整率是一回事，都叫“调整率”。两者响应的输入不同：线性调整率看 Vin，负载调整率看 Iload，一个过了不代表另一个也过。',
    'Line and load regulation are the same thing because both are “regulation”. They respond to different inputs: line regulation to Vin, load regulation to Iload, so passing one says nothing about the other.',
  ),
  loc(
    'PSRR 在直流测一次就够了。PSRR 随频率下降，低频的好数字挡不住开关电源 100 kHz 的纹波，所以要按实际纹波频率测。',
    'One DC or low-frequency PSRR number is enough. PSRR falls with frequency, so a good low-frequency number cannot vouch for 100 kHz switching ripple; test at the real ripple frequency.',
  ),
  loc(
    '带着负载测 Iq 也一样。带载时负载电流也从 Iin 流过，Iin 里混进了负载电流，读数就不再是 Iq；Iq 的定义就是空载下的耗电。',
    'Iq can be read with a load on too. With a load, the load current also flows from Iin, so the reading is no longer Iq; Iq is defined as the current drawn with no load.',
  ),
  loc(
    '输出精度测一个点就代表全部条件。输出会随 Vin 和负载变化（线性、负载调整率），精度必须写明是在哪个 Vin、哪个负载下测的。',
    'One accuracy reading covers every condition. The output moves with Vin and load (line and load regulation), so accuracy must state the Vin and load it was measured at.',
  ),
]

export const TAKEAWAY: LText = loc(
  '线性调整率看 Vin 的影响；负载调整率看 Iload 的影响，是割线斜率，大电流时更陡；Iq 只在空载下测；PSRR 必须写明纹波频率。四项都要在规定条件下测，并各自判限值。',
  'Line regulation tracks Vin; load regulation tracks Iload as a secant slope that steepens at high current; Iq is measured with no load; PSRR must state its ripple frequency. Each is measured at its stated condition and judged against its own limit.',
)

/** 在标称 Vin 下，仍然通过负载调整率限值的最大负载点，mA */
export const MAX_PASS_LOAD_MA = Math.max(
  ...LOAD_PRESETS_MA.filter((ma) => Math.abs(loadRegMvPerMa(VIN_NOM, ma)) <= LOAD_LIMIT),
)

/** 预测框：算对的判定，误差 0.05 mV/V 以内 */
export function isPredictionRight(input: string, lineMv: number): boolean {
  if (input.trim() === '') {
    return false
  }
  const value = Number(input)
  return Number.isFinite(value) && Math.abs(value - lineMv) <= 0.05
}

/** 预测框下方的反馈句：没输入时给提示，答对给出模型的值，答错只说方法 */
export function predictFeedback(input: string, predicted: boolean, lineMv: number): LText {
  if (input.trim() === '') {
    return S.predictHint
  }
  if (predicted) {
    return loc(
      `对了：线性调整率约 ${lineMv.toFixed(2)} mV/V，与模型一致。`,
      `Correct: line regulation is about ${lineMv.toFixed(2)} mV/V, matching the model.`,
    )
  }
  return S.predictBad
}

/** 右侧说明栏：先看负载，再看 PSRR，再看线性；都过了就说明结论的适用条件 */
export function verdictOf(state: LdoState, result: LdoResult): { title: LText; text: LText } {
  if (!result.accPass) {
    return {
      title: S.fail,
      text: loc(
        `相对 ${V_NOM.toFixed(3)} V 的偏差是 ${fmtSigned(result.accPct)}，超过 ±${ACC_LIMIT_PCT}%。精度要写明在哪个 Vin、哪个负载下测，换条件，结果就会变。`,
        `The deviation from ${V_NOM.toFixed(3)} V is ${fmtSigned(result.accPct)}, beyond ±${ACC_LIMIT_PCT}%. Accuracy must state the Vin and load it was measured at, because the result changes with them.`,
      ),
    }
  }
  if (!result.linePass) {
    return {
      title: S.fail,
      text: loc(
        `线性调整率 ${result.lineMvPerV.toFixed(2)} mV/V，超过 ${LINE_LIMIT} mV/V。Vin 的变化几乎原样搬到 Vout 上，说明输入侧的抑制不够。`,
        `Line regulation is ${result.lineMvPerV.toFixed(2)} mV/V, above ${LINE_LIMIT} mV/V. Changes in Vin pass almost unchanged to Vout, so the input-side rejection is too weak.`,
      ),
    }
  }
  if (!result.loadPass) {
    return {
      title: S.fail,
      text: loc(
        `负载 ${state.iloadMa} mA：从 1 mA 升到 ${state.iloadMa} mA，割线斜率是 ${result.loadMvPerMa.toFixed(3)} mV/mA，超过 ${LOAD_LIMIT} mV/mA。输出级的等效电阻随电流增大，大电流点的斜率更陡，把负载点调小一档再看。`,
        `At ${state.iloadMa} mA: going from 1 mA to ${state.iloadMa} mA gives a secant slope of ${result.loadMvPerMa.toFixed(3)} mV/mA, above ${LOAD_LIMIT} mV/mA. The output stage’s effective resistance rises with current, so the slope is steeper at high load; step the load down one preset and check again.`,
      ),
    }
  }
  if (!result.psrrPass) {
    return {
      title: S.fail,
      text: loc(
        `纹波 ${fmtHz(state.freqHz)} 处的 PSRR 是 ${result.psrrDb.toFixed(1)} dB，低于限值 ${result.psrrLimitDb} dB。PSRR 随频率下降：频率越高，反馈环越跟不上，纹波更多地穿过 LDO 出现在 Vout 上。`,
        `PSRR at the ${fmtHz(state.freqHz)} ripple is ${result.psrrDb.toFixed(1)} dB, below the ${result.psrrLimitDb} dB limit. PSRR falls with frequency: the faster the ripple, the less the feedback loop can follow, so more of it reaches Vout.`,
      ),
    }
  }
  if (!result.iqPass) {
    return {
      title: S.fail,
      text: loc(
        `静态电流 ${IQ_UA} µA，超过 ${IQ_LIMIT_UA} µA。Iq 偏大说明 LDO 自己耗的电多。`,
        `Quiescent current is ${IQ_UA} µA, above ${IQ_LIMIT_UA} µA. A high Iq means the LDO itself draws too much current.`,
      ),
    }
  }
  return {
    title: S.pass,
    text: loc(
      `五项都在限值内：线性 ${result.lineMvPerV.toFixed(2)} mV/V，负载 ${result.loadMvPerMa.toFixed(3)} mV/mA，PSRR ${result.psrrDb.toFixed(1)} dB。这些结果只对当前的 Vin、负载和纹波频率成立，因为调整率和 PSRR 都随这三个量变化。`,
      `All five are within limits: line ${result.lineMvPerV.toFixed(2)} mV/V, load ${result.loadMvPerMa.toFixed(3)} mV/mA, PSRR ${result.psrrDb.toFixed(1)} dB. These results hold only for the current Vin, load and ripple frequency, because regulation and PSRR all change with those three.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和预测框内容算出 */
export function taskItems(state: LdoState, result: LdoResult, predicted: boolean): TaskItem[] {
  return [
    { id: 'line', text: S.task1, done: predicted },
    { id: 'load', text: S.task2, done: state.iloadMa === MAX_PASS_LOAD_MA && result.loadPass },
    { id: 'psrr', text: S.task3, done: !result.psrrPass },
  ]
}

/* 小测的数字全部由模型算出：改了模型，题干、选项和解析自动跟着变 */
const Q_DV_MV = (voutOf(VIN_MAX, I_REF) - voutOf(VIN_LO, I_REF)) * 1000
const Q_LINE = lineRegMvPerV(VIN_MAX)
const Q_LOAD_100 = loadRegMvPerMa(VIN_NOM, 100)
const Q_LOAD_200 = loadRegMvPerMa(VIN_NOM, 200)
const Q_PSRR_1K = psrrDb(1e3)
const Q_RIPPLE_1K_UV = voutRippleV(1e3) * 1e6
const Q_DVIN = (VIN_MAX - VIN_LO).toFixed(1)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `Vin 从 ${VIN_LO.toFixed(1)} V 升到 ${VIN_MAX.toFixed(1)} V，1 mA 负载下 Vout 变化约 ${Q_DV_MV.toFixed(1)} mV。线性调整率约是多少？`,
      `Vin steps from ${VIN_LO.toFixed(1)} V to ${VIN_MAX.toFixed(1)} V at 1 mA load, and Vout moves by about ${Q_DV_MV.toFixed(1)} mV. About what is the line regulation?`,
    ),
    options: [
      { id: 'a', text: loc(`${Q_LINE.toFixed(2)} mV/V`, `${Q_LINE.toFixed(2)} mV/V`) },
      { id: 'b', text: loc(`${Q_DV_MV.toFixed(2)} mV/V`, `${Q_DV_MV.toFixed(2)} mV/V`) },
      { id: 'c', text: loc('12 mV/V', '12 mV/V') },
    ],
    answer: 'a',
    explain: loc(
      `ΔVout ÷ ΔVin = ${Q_DV_MV.toFixed(1)} mV ÷ ${Q_DVIN} V = ${Q_LINE.toFixed(2)} mV/V。直接写 ${Q_DV_MV.toFixed(1)} mV/V 是忘了除以 ΔVin。`,
      `ΔVout ÷ ΔVin = ${Q_DV_MV.toFixed(1)} mV ÷ ${Q_DVIN} V = ${Q_LINE.toFixed(2)} mV/V. Writing ${Q_DV_MV.toFixed(1)} mV/V forgets to divide by ΔVin.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '负载电流从 1 mA 升到 100 mA，Vout 随之变化。负载调整率约是多少？',
      'Load current steps from 1 mA to 100 mA and Vout moves with it. About what is the load regulation?',
    ),
    options: [
      { id: 'a', text: loc(`${R0.toFixed(3)} mV/mA`, `${R0.toFixed(3)} mV/mA`) },
      { id: 'b', text: loc(`${Q_LOAD_200.toFixed(3)} mV/mA`, `${Q_LOAD_200.toFixed(3)} mV/mA`) },
      { id: 'c', text: loc(`${Q_LOAD_100.toFixed(3)} mV/mA`, `${Q_LOAD_100.toFixed(3)} mV/mA`) },
    ],
    answer: 'c',
    explain: loc(
      `割线斜率 = R0 + C2 × (I + I_ref) = ${R0.toFixed(3)} + ${C2.toFixed(2)} × (0.100 + 0.001) ≈ ${Q_LOAD_100.toFixed(3)} mV/mA。只取 R0（选项 a）会漏掉大电流段的二次项。`,
      `Secant slope = R0 + C2 × (I + I_ref) = ${R0.toFixed(3)} + ${C2.toFixed(2)} × (0.100 + 0.001) ≈ ${Q_LOAD_100.toFixed(3)} mV/mA. Using R0 alone (option a) drops the squared term that matters at high current.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `Vin 上叠加 50 mV 峰值纹波，1 kHz 处测得 Vout 纹波约 ${Q_RIPPLE_1K_UV.toFixed(1)} µV。PSRR 约是多少 dB？`,
      `A 50 mV peak ripple sits on Vin, and at 1 kHz the ripple on Vout is about ${Q_RIPPLE_1K_UV.toFixed(1)} µV. About how many dB is the PSRR?`,
    ),
    options: [
      { id: 'a', text: loc('40 dB', '40 dB') },
      { id: 'b', text: loc(`${Q_PSRR_1K.toFixed(0)} dB`, `${Q_PSRR_1K.toFixed(0)} dB`) },
      { id: 'c', text: loc('22 dB', '22 dB') },
    ],
    answer: 'b',
    explain: loc(
      `PSRR = 20 × log10(50 mV ÷ ${Q_RIPPLE_1K_UV.toFixed(1)} µV) ≈ ${Q_PSRR_1K.toFixed(0)} dB。PSRR 是 Vin 纹波与 Vout 纹波之比的分贝数，不是 Vout 纹波本身。`,
      `PSRR = 20 × log10(50 mV ÷ ${Q_RIPPLE_1K_UV.toFixed(1)} µV) ≈ ${Q_PSRR_1K.toFixed(0)} dB. PSRR is the decibel ratio of the Vin ripple to the Vout ripple, not the Vout ripple itself.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '同一颗 LDO，PSRR 在 10 kHz 比 1 kHz 低。为什么 PSRR 必须写明频率？',
      'The same LDO has a lower PSRR at 10 kHz than at 1 kHz. Why must PSRR state a frequency?',
    ),
    options: [
      { id: 'a', text: loc('高频时 Iq 变大，耗电抬高了 PSRR', 'At high frequency Iq rises, and the extra power lifts PSRR') },
      { id: 'b', text: loc('输出电容越大，任何频率下 PSRR 都一样', 'A bigger output capacitor makes PSRR the same at any frequency') },
      { id: 'c', text: loc('反馈环的增益随频率下降，高频纹波来不及被修正，更多地穿过去', 'Feedback-loop gain falls with frequency, so fast ripple cannot be corrected and gets through') },
    ],
    answer: 'c',
    explain: loc(
      'PSRR 由反馈环决定：频率低时环路增益大，纹波被压下去；频率超过拐点后增益下降，纹波几乎原样穿过。所以 PSRR 必须写明频率，本页的限值也按频率分开给。',
      'PSRR comes from the feedback loop: at low frequency the loop gain is large and suppresses ripple; past the corner the gain falls and ripple passes almost unchanged. So PSRR must state its frequency, and the limits here are set per frequency.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('测静态电流 Iq 时，负载应该怎么接？', 'How should the load be connected when measuring quiescent current Iq?'),
    options: [
      { id: 'a', text: loc('空载（不接负载），Iq = Iin − Iout', 'No load connected, with Iq = Iin − Iout') },
      { id: 'b', text: loc('满载 200 mA，直接测 Iin', 'Full load at 200 mA, reading Iin directly') },
      { id: 'c', text: loc('只在 Vin 最低时测，不管负载', 'Only at the lowest Vin, ignoring the load') },
    ],
    answer: 'a',
    explain: loc(
      'Iq 是 LDO 自己耗的电。空载时 Iout 接近 0，Iin 几乎全是 Iq；带载时负载电流也从 Iin 流过，就分不清哪一部分是 LDO 的。',
      'Iq is the current the LDO uses itself. With no load Iout is near zero, so Iin is almost all Iq; with a load, the load current also flows from Iin and the LDO’s share can no longer be separated.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '为什么 200 mA 的负载调整率会超限，而 100 mA 还能通过？',
      'Why does load regulation at 200 mA exceed the limit while 100 mA still passes?',
    ),
    options: [
      { id: 'a', text: loc('线性调整率在大电流下变大', 'Line regulation grows at high current') },
      { id: 'b', text: loc('1 mA 参考点在大电流下会偏移', 'The 1 mA reference point shifts at high current') },
      { id: 'c', text: loc('输出级等效电阻随电流增大（二次项 C2·I²），割线斜率变陡', 'The output stage’s effective resistance grows with current (the C2·I² term), so the secant slope steepens') },
    ],
    answer: 'c',
    explain: loc(
      `割线斜率 = R0 + C2 × (I + I_ref)，I 越大斜率越陡：200 mA 时约 ${Q_LOAD_200.toFixed(3)} mV/mA，100 mA 时约 ${Q_LOAD_100.toFixed(3)} mV/mA。负载调整率测的是斜率，不是某一个点的数值。`,
      `Secant slope = R0 + C2 × (I + I_ref), steeper for larger I: about ${Q_LOAD_200.toFixed(3)} mV/mA at 200 mA versus about ${Q_LOAD_100.toFixed(3)} mV/mA at 100 mA. Load regulation measures a slope, not the value at a single point.`,
    ),
  },
]
