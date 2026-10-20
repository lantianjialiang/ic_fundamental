import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  ERR_LIMIT_MV,
  GND_OPEN_MV,
  GND_SHIELD_MV,
  PINS,
  RES_SPEC,
  RESOURCES,
  SETTLE_SLACK_US,
  SIGMA_LIMIT_MV,
  connectedOf,
  minSettleUs,
  requiredSettleUs,
  settleErrMv,
  sigmaMv,
  type PinId,
  type PinResult,
  type ResId,
  type Source,
} from './resourcesModel'

export const S = {
  kickerNow: loc('这一次配置', 'This configuration'),
  introTitle: loc('ATE 上的仪器怎么接到引脚', 'How ATE instruments reach the pins'),
  coreTitle: loc('拨一拨：资源、建立时间与屏蔽', 'Try it: resources, settling time and shielding'),
  coreNote: loc(
    '给 DUT 的每个引脚选一个资源（Off 表示不接）。资源经负载板上的 Relay 接到引脚；建立时间决定误差有没有收敛，接地屏蔽决定读数抖不抖。下面的 DUT 与参数都是示意值。',
    'Pick one resource for each DUT pin (Off means not connected). Resources reach the pin through relays on the load board; settling time decides whether the error has converged, and the ground shield decides whether the reading jitters. The DUT and all parameters are illustrative.',
  ),
  pinResource: loc('资源', 'Resource'),
  settleLabel: loc('建立时间（等待）', 'Settling time (wait)'),
  shieldLabel: loc('接地屏蔽', 'Ground shield'),
  shieldOff: loc('关', 'Off'),
  shieldOn: loc('开', 'On'),
  resample: loc('重新采样', 'Resample'),
  rErr: loc('建立误差', 'Settling error'),
  rSigma: loc('VREF 读数 σ（200 个样本）', 'VREF reading σ (200 samples)'),
  rMinSettle: loc('所需最短建立时间', 'Shortest settling time needed'),
  rVerdict: loc('判定', 'Verdict'),
  notConnected: loc('未接', 'Not connected'),
  incompatible: loc('资源不能胜任', 'Resource cannot do this job'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实仪器的建立时间、噪声底和 Relay 电阻以厂商规格书为准；这里的数字是示意值，只练选资源、读建立时间和判断屏蔽的作用。',
    'Real instrument settling times, noise floors and relay resistances come from vendor datasheets; the numbers here are illustrative and only practise choosing resources, reading settling time and judging what shielding does.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc(`VDD 接 DPS，并把建立时间调到让 VDD 的误差低于 ${ERR_LIMIT_MV} mV。`, `VDD on DPS, with the settling time set so the VDD error is below ${ERR_LIMIT_MV} mV.`),
  task2: loc(
    `所有已接入引脚的误差都低于 ${ERR_LIMIT_MV} mV，并且建立时间比所需最短值多出不超过 ${SETTLE_SLACK_US} µs。`,
    `Every connected pin has an error below ${ERR_LIMIT_MV} mV, and the settling time exceeds the shortest needed value by no more than ${SETTLE_SLACK_US} µs.`,
  ),
  task3: loc(
    `VREF 接一个能测电压的资源，打开接地屏蔽，使 VREF 读数 σ 不超过 ${SIGMA_LIMIT_MV} mV。`,
    `VREF on a voltage-capable resource with the ground shield on, so the VREF reading σ is at most ${SIGMA_LIMIT_MV} mV.`,
  ),
}

export const FIG = {
  loadAria: loc('负载板示意图：ATE 资源经 Relay 接到 DUT 引脚', 'Load board diagram: ATE resources reach the DUT pins through relays'),
  loadCap: loc(
    '每个引脚只接一个资源。资源经负载板上的 Relay 接到引脚，Off 时 Relay 断开。Relay 闭合后，资源到引脚的那段路径就是建立时间要等的东西。金色虚线框是接地屏蔽，框住信号路径，只压接地噪声。',
    'Each pin takes one resource. Resources reach the pin through relays on the load board; with Off the relay stays open. Once a relay closes, the path from resource to pin is what the settling time has to wait for. The gold dashed frame is the ground shield; it encloses the signal path and only reduces ground noise.',
  ),
  resourceHeader: loc('ATE 资源', 'ATE resources'),
  shieldLabel: loc('接地屏蔽（GND 罩）', 'Ground shield (GND)'),
  settleAria: loc('建立误差随等待时间收敛的对数曲线，标出 1 mV 限值与当前建立时间', 'Log plot of the settling error converging over time, with the 1 mV limit and the current settling time marked'),
  settleTitle: loc('建立误差（mV，对数）', 'Settling error (mV, log scale)'),
  settleCap: loc(
    '横轴是建立时间（0 到 200 µs），纵轴是对数刻度的建立误差。误差按 e^(−t/τ) 收敛，在对数纵轴上是一条直线，直线越平，τ 越大。红线是 1 mV 限值，竖虚线是当前建立时间；曲线落到红线以下才算收敛。',
    'The horizontal axis is settling time (0 to 200 µs); the vertical axis is settling error on a log scale. The error falls as e^(−t/τ), which is a straight line on a log axis; the flatter the line, the larger τ. The red line is the 1 mV limit and the dashed vertical line is the current settling time. A curve counts as settled once it drops below the red line.',
  ),
  now: loc('当前', 'Now'),
  limitLabel: loc('限值 1 mV', 'Limit 1 mV'),
  noConnected: loc('还没有引脚接入资源', 'No pin is connected to a resource yet'),
  stripAria: loc('VREF 读数分布：每个点是一次读数相对目标值的偏差', 'VREF reading distribution: each dot is one reading relative to the target'),
  stripCap: loc(
    '每个点是一次读数相对目标值的偏差。整体左右平移是建立误差，横向散布是 σ。开启屏蔽后，散布变窄；资源自身噪声大（如 Digitizer）时，散布还是宽。',
    'Each dot is one reading relative to the target. A sideways shift of the whole cloud is the settling error; its horizontal spread is σ. With the shield on the spread narrows, but a noisy resource such as the digitizer stays wide.',
  ),
  stripAxis: loc('VREF 读数偏差（mV）', 'VREF reading deviation (mV)'),
  limitStrip: loc('±1 mV 限值', '±1 mV limit'),
  noVref: loc('VREF 没有可用的测量资源', 'VREF has no usable measurement resource'),
}

/** 引脚的名称与作用（名称是技术符号，不翻译；作用写两种语言） */
export const PIN_NAME: Record<PinId, string> = { vdd: 'VDD', vref: 'VREF', ain: 'AIN' }
export const PIN_TEXT: Record<PinId, LText> = {
  vdd: loc('VDD · 供电', 'VDD · supply'),
  vref: loc('VREF · 测量', 'VREF · measure'),
  ain: loc('AIN · 激励', 'AIN · stimulus'),
}
export const PIN_NEED: Record<PinId, LText> = {
  vdd: loc('供电必须用能加压的 DPS 或 SMU', 'supply must come from a force-capable DPS or SMU'),
  vref: loc('测量要用能测电压的 DMM、Digitizer 或 SMU', 'measurement needs a voltage-capable DMM, Digitizer or SMU'),
  ain: loc('激励要用能输出波形的 AWG 或 SMU', 'stimulus needs an AWG or SMU that can source a waveform'),
}

export const RES_LABEL: Record<ResId, LText> = {
  off: loc('Off（不接）', 'Off (not connected)'),
  dps: loc('DPS 电源', 'DPS supply'),
  smu: loc('SMU 源表', 'SMU source-measure'),
  awg: loc('AWG 任意波形源', 'AWG waveform source'),
  digitizer: loc('Digitizer 数字化仪', 'Digitizer'),
  dmm: loc('DMM 数字万用表', 'DMM'),
}

/** 图上和判定文字里的资源短名（技术符号，不翻译） */
export const RES_SHORT: Record<ResId, string> = {
  off: 'Off',
  dps: 'DPS',
  smu: 'SMU',
  awg: 'AWG',
  digitizer: 'Digitizer',
  dmm: 'DMM',
}

/** 资源下拉的选项，顺序与 RESOURCES 一致 */
export const RES_OPTIONS: Array<{ id: ResId; label: LText }> = RESOURCES.map((id) => ({ id, label: RES_LABEL[id] }))

export const SHIELD_OPTIONS: Array<{ id: 'off' | 'on'; label: LText }> = [
  { id: 'off', label: S.shieldOff },
  { id: 'on', label: S.shieldOn },
]

/** 逐个引脚判断：先看 off、再看能不能胜任、最后看建立误差；返回第一个问题，全部通过返回 null */
function pinProblem(result: PinResult): { title: LText; text: LText } | null {
  const name = PIN_NAME[result.pin]
  const need = PIN_NEED[result.pin]
  if (result.status === 'off') {
    return {
      title: S.fail,
      text: loc(`${name} 还是 Off，没有接任何资源：${need.zh}。`, `${name} is still Off, with no resource: ${need.en}.`),
    }
  }
  if (result.status === 'incompatible') {
    const short = RES_SHORT[result.res]
    return {
      title: S.fail,
      text: loc(`${name} 接的 ${short} 不能胜任：${need.zh}。`, `${name} is on ${short}, which cannot do this job: ${need.en}.`),
    }
  }
  if (result.status === 'error') {
    return {
      title: S.fail,
      text: loc(
        `${name} 的建立误差是 ${result.errMv.toFixed(2)} mV，超过 ${ERR_LIMIT_MV} mV。误差按指数收敛，要让它落到限值内，建立时间至少要 ${result.reqUs.toFixed(1)} µs；当前的等待时间不够。`,
        `${name} settling error is ${result.errMv.toFixed(2)} mV, above ${ERR_LIMIT_MV} mV. The error decays exponentially, so to bring it inside the limit the settling time must be at least ${result.reqUs.toFixed(1)} µs; the current wait is too short.`,
      ),
    }
  }
  return null
}

/** 右侧说明栏：按 VDD → VREF → AIN 的顺序给出第一个问题；初始全部 Off，对应 VDD 这一项 */
export function verdictOf(
  results: Record<PinId, PinResult>,
  sigma: number | null,
  shield: boolean,
): { title: LText; text: LText } {
  for (const pin of PINS) {
    const problem = pinProblem(results[pin])
    if (problem) {
      return problem
    }
  }
  if (sigma !== null && sigma > SIGMA_LIMIT_MV) {
    const why = shield
      ? loc(
          '屏蔽已经开了，剩下的主要是资源自身的噪声底，要换一个噪声更低的测量资源。',
          'The shield is already on, so what is left is mostly the resource’s own noise floor: switch to a quieter measurement resource.',
        )
      : loc(
          '先打开接地屏蔽：接地噪声是 σ 里能被压下去的那一项。',
          'Turn the ground shield on first: ground noise is the part of σ that the shield can remove.',
        )
    return {
      title: S.fail,
      text: loc(
        `VREF 读数 σ 是 ${sigma.toFixed(2)} mV，超过 ${SIGMA_LIMIT_MV} mV。${why.zh}`,
        `VREF reading σ is ${sigma.toFixed(2)} mV, above ${SIGMA_LIMIT_MV} mV. ${why.en}`,
      ),
    }
  }
  const sigmaText = sigma === null ? '—' : sigma.toFixed(2)
  return {
    title: S.pass,
    text: loc(
      `三个引脚都通过：建立误差都在 ${ERR_LIMIT_MV} mV 以内，VREF 读数 σ 为 ${sigmaText} mV。注意：建立时间只让误差收敛，屏蔽只压接地噪声，两件事各管一件。`,
      `All three pins pass: every settling error is within ${ERR_LIMIT_MV} mV, and the VREF reading σ is ${sigmaText} mV. Note that settling time only lets the error converge, while the shield only reduces ground noise; each does its own job.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和结果直接算出 */
export function taskItems(results: Record<PinId, PinResult>, settleUs: number, sigma: number | null): TaskItem[] {
  const conn = connectedOf(results)
  const allOk = conn.length > 0 && conn.every((result) => result.status === 'ok')
  return [
    {
      id: 'vdd',
      text: S.task1,
      done: results.vdd.res === 'dps' && results.vdd.status === 'ok',
    },
    {
      id: 'settle',
      text: S.task2,
      done: allOk && settleUs - minSettleUs(results) <= SETTLE_SLACK_US,
    },
    {
      id: 'shield',
      text: S.task3,
      done: sigma !== null && sigma <= SIGMA_LIMIT_MV,
    },
  ]
}

export const INTRO: LText[] = [
  loc(
    '{@anaMeasure} 讲的是一台仪器的 Force 与 Measure。ATE 上一块测试板要同时服务很多引脚，所以资源是分开的：DPS 给电，SMU 源表精度高，AWG 出波形，Digitizer 采波形，DMM 测精确电压。它们经负载板上的继电器（Relay）接到 DUT 引脚，中间隔着一段线。',
    '{@anaMeasure} covered Force and Measure on one instrument. An ATE test board serves many pins at once, so the resources are separate: a DPS supplies power, an SMU is precise, an AWG makes waveforms, a digitizer captures waveforms and a DMM measures voltage precisely. They reach the DUT pins through relays on the load board, with a trace in between.',
  ),
  loc(
    '这一课练三件事：给每个引脚选能胜任的资源；理解建立时间为什么让读数按指数收敛，要等多久才够；知道接地噪声怎样让读数抖动，以及接地屏蔽能压掉哪一部分。ATE 的整体结构见 {@ate}，SMU 的原理见 {@anaSmu}。',
    'This lesson practises three things: choosing a capable resource for each pin; understanding why settling time makes the reading converge exponentially and how long to wait; and seeing how ground noise makes the reading jitter and which part the ground shield can remove. The overall ATE structure is in {@ate}; the SMU principle is in {@anaSmu}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '精度高的仪器哪个引脚都能用。DMM 很准，但它只会测量，不能给引脚加电压；VDD 要供电，接到 DMM 上根本加不出电压。资源要先看能不能胜任，再看精度。',
    'A precise instrument works on any pin. A DMM is very accurate, but it can only measure and cannot force a voltage on a pin; VDD needs supply, so a DMM on VDD forces nothing. Check that a resource can do the job before comparing accuracy.',
  ),
  loc(
    '建立时间越长越好。等待能让误差按指数变小，但等待时间直接变成测试时间，乘上每颗芯片和每个引脚就是成本。应该找刚好够用的最短值。',
    'Longer settling is always better. Waiting shrinks the error exponentially, but the wait becomes test time directly, and multiplied by every part and pin it is cost. The right value is the shortest one that is just enough.',
  ),
  loc(
    '读数稳定，就说明读数准。建立误差是偏置，是整体往一边偏；读数抖动是 σ，是散布。开屏蔽只能压 σ，压不掉偏置，也不会让建立误差收敛。',
    'A stable reading means an accurate reading. Settling error is an offset that shifts the whole reading to one side; jitter is σ, the spread. The shield only reduces σ, leaves the offset alone, and does not make the settling error converge.',
  ),
  loc(
    '接地屏蔽能去掉所有噪声。屏蔽只压掉接地回路带进来的那一部分；资源自身的噪声底还在，所以 Digitizer 开了屏蔽，σ 仍然超过 0.5 mV。',
    'Ground shielding removes all noise. The shield only removes the part that comes in through the ground loop; the resource’s own noise floor remains, so a digitizer with the shield on still has σ above 0.5 mV.',
  ),
]

export const TAKEAWAY: LText = loc(
  '给引脚选资源先看能不能胜任：加压选 DPS 或 SMU，测压选 DMM、Digitizer 或 SMU，给激励选 AWG 或 SMU。建立时间按 τ · ln(E0 / 限值) 估算，取刚够用的最短值；屏蔽只压接地噪声，资源自身的噪声要另外选。',
  'Choose resources by capability first: DPS or SMU to force, DMM, Digitizer or SMU to measure, AWG or SMU to stimulate. Estimate settling time as τ · ln(E0 / limit) and take the shortest value that is enough; the shield only reduces ground noise, so a noisy resource must be replaced separately.',
)

/* ---------- 小测：数字全部由模型算出，答案由判定得出 ---------- */

const REQ_DPS = requiredSettleUs('dps')

const Q2_OPTS: Array<{ id: 'a' | 'b' | 'c'; res: Source }> = [
  { id: 'a', res: 'dmm' },
  { id: 'b', res: 'digitizer' },
  { id: 'c', res: 'awg' },
]
const Q2_PICK = Q2_OPTS.find((opt) => sigmaMv(opt.res, true) <= SIGMA_LIMIT_MV) ?? Q2_OPTS[0]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `DPS 给 VDD 加压，建立误差 E0 = ${RES_SPEC.dps.e0Mv} mV，τ = ${RES_SPEC.dps.tauUs} µs。要让误差降到 ${ERR_LIMIT_MV} mV 以内，至少要等多久？`,
      `A DPS forces VDD with a settling error E0 = ${RES_SPEC.dps.e0Mv} mV and τ = ${RES_SPEC.dps.tauUs} µs. At least how long must it wait for the error to fall below ${ERR_LIMIT_MV} mV?`,
    ),
    options: [
      { id: 'a', text: loc('10 µs', '10 µs') },
      { id: 'b', text: loc(`${REQ_DPS.toFixed(0)} µs`, `${REQ_DPS.toFixed(0)} µs`) },
      { id: 'c', text: loc('200 µs', '200 µs') },
    ],
    answer: 'b',
    explain: loc(
      `e^(−t/τ) 满足 E0 · e^(−t/τ) = ${ERR_LIMIT_MV} mV，解得 t = τ · ln(E0 / ${ERR_LIMIT_MV}) = ${RES_SPEC.dps.tauUs} × ln(${RES_SPEC.dps.e0Mv}) ≈ ${REQ_DPS.toFixed(0)} µs。10 µs 时误差还有约 ${settleErrMv('dps', 10).toFixed(1)} mV，远没收敛。`,
      `Solving E0 · e^(−t/τ) = ${ERR_LIMIT_MV} mV gives t = τ · ln(E0 / ${ERR_LIMIT_MV}) = ${RES_SPEC.dps.tauUs} × ln(${RES_SPEC.dps.e0Mv}) ≈ ${REQ_DPS.toFixed(0)} µs. At 10 µs the error is still about ${settleErrMv('dps', 10).toFixed(1)} mV, far from converged.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `开启接地屏蔽，用 VREF 测电压。下列哪一种资源的读数 σ 能落在 ${SIGMA_LIMIT_MV} mV 限值以内（模型计算值）？`,
      `With the ground shield on, measuring VREF voltage, which resource keeps the reading σ within the ${SIGMA_LIMIT_MV} mV limit (model values)?`,
    ),
    options: Q2_OPTS.map((opt) => ({ id: opt.id, text: loc(RES_SHORT[opt.res], RES_SHORT[opt.res]) })),
    answer: Q2_PICK.id,
    explain: loc(
      `开屏蔽后三者的 σ 分别约为 DMM ${sigmaMv('dmm', true).toFixed(2)} mV、Digitizer ${sigmaMv('digitizer', true).toFixed(2)} mV、AWG ${sigmaMv('awg', true).toFixed(2)} mV，只有 ${RES_SHORT[Q2_PICK.res]} 在 ${SIGMA_LIMIT_MV} mV 以内。Digitizer 自身噪声就有 ${RES_SPEC.digitizer.sigmaMv} mV，屏蔽压不掉它。`,
      `With the shield on, σ is about DMM ${sigmaMv('dmm', true).toFixed(2)} mV, Digitizer ${sigmaMv('digitizer', true).toFixed(2)} mV and AWG ${sigmaMv('awg', true).toFixed(2)} mV; only ${RES_SHORT[Q2_PICK.res]} is within ${SIGMA_LIMIT_MV} mV. The digitizer's own noise is already ${RES_SPEC.digitizer.sigmaMv} mV, which the shield cannot remove.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('开启接地屏蔽后，屏蔽压掉的是下面哪一项？', 'When the ground shield is turned on, which of these does it reduce?'),
    options: [
      { id: 'a', text: loc('资源自身的噪声底', 'The resource’s own noise floor') },
      { id: 'b', text: loc('接地噪声（σ 里的接地项）', 'Ground noise (the ground term in σ)') },
      { id: 'c', text: loc('建立误差', 'The settling error') },
    ],
    answer: 'b',
    explain: loc(
      `接地屏蔽只压低接地噪声这一项，σ 里的接地项从 ${GND_OPEN_MV} mV 降到 ${GND_SHIELD_MV} mV。资源自身的噪声底不变，建立误差也不变，所以开屏蔽不能让误差收敛。`,
      `The ground shield only lowers the ground-noise term, which in σ drops from ${GND_OPEN_MV} mV to ${GND_SHIELD_MV} mV. The resource's own noise floor is unchanged and so is the settling error, so the shield cannot make the error converge.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('为什么 VDD 不能直接用 DMM 来接？', 'Why can a DMM not simply be connected to VDD?'),
    options: [
      { id: 'a', text: loc('DMM 精度不够', 'The DMM is not accurate enough') },
      { id: 'b', text: loc('DMM 只能测量，不能对引脚加压供电', 'A DMM can only measure; it cannot force a supply voltage on the pin') },
      { id: 'c', text: loc('DMM 太慢', 'The DMM is too slow') },
    ],
    answer: 'b',
    explain: loc(
      'DMM 是测量仪器，只能读电压，不能在引脚上加一个确定的电压。VDD 需要的是供电，所以要用能加压的 DPS 或 SMU。',
      'A DMM is a measuring instrument: it reads voltage but cannot force a defined voltage onto the pin. VDD needs supply, so a force-capable DPS or SMU must be used.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('建立时间是不是越长越好？', 'Is longer settling time always better?'),
    options: [
      { id: 'a', text: loc('是，等得越久越准', 'Yes, the longer the wait, the more accurate') },
      { id: 'b', text: loc('不是，等待计入测试时间，误差已经收敛后再等只是浪费', 'No, waiting adds test time, and waiting after the error has converged is wasted') },
      { id: 'c', text: loc('不影响误差，只影响功耗', 'It does not affect the error, only the power') },
    ],
    answer: 'b',
    explain: loc(
      '误差收敛到限值以内之后，再等只会增加每颗芯片的测试时间，乘上芯片数量就是成本。应取刚够用的最短值，并留一点余量。',
      'Once the error has converged within the limit, waiting longer only adds test time per part, and multiplied by the part count that is cost. Take the shortest value that is enough, with a small margin.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('把建立误差画在对数纵轴上，指数收敛呈什么形状？', 'Plotted on a log vertical axis, what shape does exponential settling take?'),
    options: [
      { id: 'a', text: loc('直线', 'A straight line') },
      { id: 'b', text: loc('抛物线', 'A parabola') },
      { id: 'c', text: loc('水平线', 'A horizontal line') },
    ],
    answer: 'a',
    explain: loc(
      'e^(−t/τ) 取对数后是 −t/τ 的线性函数，所以在对数纵轴上是一条直线，斜率为 −1/(τ · ln 10)。τ 越大，直线越平缓。',
      'Taking the log of e^(−t/τ) gives a linear function of −t/τ, so on a log vertical axis it is a straight line with slope −1/(τ · ln 10). The larger τ, the flatter the line.',
    ),
  },
]
