import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  DEEMBED_MODES,
  UI_PS,
  chainRisePs,
  lossDbAt,
  riseTimePs,
  type AteState,
  type DeembedMode,
  type EyeMetrics,
} from './ateLimitModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const DEEMBED_LABEL: Record<DeembedMode, LText> = {
  none: loc('不去嵌入', 'No de-embedding'),
  fixture: loc('只去夹具（用夹具模型）', 'Fixture only (fixture model)'),
  fixtureAte: loc('去夹具和 ATE（两段模型）', 'Fixture and ATE (two models)'),
}

export const DEEMBED_OPTIONS = DEEMBED_MODES.map((id) => ({ id, label: DEEMBED_LABEL[id] }))

export const S = {
  kickerNow: loc('这一次测试设置', 'This test setup'),
  introTitle: loc('ATE 也是测量路径的一部分', 'The ATE is part of the measurement path'),
  coreTitle: loc('拨一拨：ATE 带宽、夹具损耗与去嵌入', 'Try it: ATE bandwidth, fixture loss and de-embedding'),
  coreNote: loc(
    '左边是器件本身的眼（真实眼）；右边是同一个器件经过 ATE 通道与夹具后测得的眼。两个眼用同一个 PRBS7 码型、同一个 mask。',
    'Left is the device’s own eye (real eye); right is the eye measured after the same device goes through the ATE channel and the fixture. Both use the same PRBS7 pattern and the same mask.',
  ),
  knobAte: loc('ATE 通道带宽 BW (GHz)', 'ATE channel bandwidth BW (GHz)'),
  knobLoss: loc('夹具 / DIB 损耗 @5 GHz (dB)', 'Fixture / DIB loss @5 GHz (dB)'),
  deLabel: loc('去嵌入（de-embed）', 'De-embedding (de-embed)'),
  knobErr: loc('去嵌入模型的带宽误差', 'Bandwidth error of the de-embed model'),
  realAria: loc('真实眼图：器件本身的眼，PRBS7 叠加与 mask', 'Real eye diagram: the device’s own eye, PRBS7 overlay and mask'),
  measAria: loc('测得眼图：经过 ATE 与夹具后的眼，PRBS7 叠加与 mask', 'Measured eye diagram: the eye after the ATE and fixture, PRBS7 overlay and mask'),
  realCap: loc('真实眼：器件本身。金色是 mask，红点是落进 mask 的采样点。', 'Real eye: the device itself. Gold is the mask; red dots are samples inside it.'),
  measCap: loc('测得眼：器件 → ATE 通道 → 夹具。同一个 mask，红点数就是 mask 的违例数。', 'Measured eye: device → ATE channel → fixture. Same mask; the red dots are the mask violations.'),
  respAria: loc('频响图：ATE 通道、夹具和整条测得路径的损耗随频率变化', 'Frequency response: loss of the ATE channel, the fixture and the whole measured path versus frequency'),
  respCap: loc(
    '纵轴是损耗（dB，越往下越差）。虚线是 5 GHz：10 Gb/s 码型的奈奎斯特频率，夹具损耗就按这个点标定。',
    'The vertical axis is loss in dB (lower is worse). The dashed line is 5 GHz, the Nyquist frequency of a 10 Gb/s pattern; the fixture loss is specified at this point.',
  ),
  respAte: loc('ATE 通道', 'ATE channel'),
  respFix: loc('夹具 / DIB', 'Fixture / DIB'),
  respPath: loc('测得路径（合成）', 'Measured path (combined)'),
  rRealEye: loc('真实眼：眼高 / 眼宽', 'Real eye: height / width'),
  rMeasEye: loc('测得眼：眼高 / 眼宽', 'Measured eye: height / width'),
  rHits: loc('测得眼落进 mask 的采样点', 'Measured samples inside the mask'),
  rVerdict: loc('测得眼判定（10 Gb/s）', 'Measured eye verdict (10 Gb/s)'),
  rRise: loc('测得路径上升时间', 'Measured path rise time'),
  rFixBw: loc('夹具等效带宽（由损耗换算）', 'Fixture bandwidth (converted from the loss)'),
  rMaxReal: loc('真实眼能过 mask 的最高速率', 'Highest rate the real eye passes'),
  rMaxMeas: loc('测得眼能过 mask 的最高速率', 'Highest rate the measured eye passes'),
  none: loc('没有速率能通过', 'No rate passes'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  prereqTitle: loc('补充：本课用到的预设知识', 'Supplement: background this lesson assumes'),
  prereqNote: loc(
    '正文里的夹具带宽、级联上升时间与去嵌入都从这一节列出的几条推出。读完正文再回来看。',
    'The fixture bandwidth, cascaded rise time and de-embedding in the body are derived from the items below. Read the body first, then come back here.',
  ),
  asideLater: loc(
    '真实的 ATE 还要考虑时钟抖动、串扰、电源噪声和接触电阻；这里只练带宽、夹具损耗与去嵌入三件事。SerDes 的 BER 与时序扫描见下一课。',
    'Real ATE work also covers clock jitter, crosstalk, supply noise and contact resistance; here we only practise bandwidth, fixture loss and de-embedding. BER and timing sweeps come in the next lesson.',
  ),
  next: loc('下一课：综合：高速接口测试', 'Next: Capstone: High-speed Interface Test'),
  loopTitle: loc('为什么常用 Loopback、Scan 与 BIST', 'Why loopback, scan and BIST are common'),
  loopNote: loc('测试系统的带宽有限时，最好的办法是绕开它。', 'When the test system is band-limited, the best option is to avoid it.'),
  task1: loc('不去嵌入，把 ATE 带宽拉到 20 GHz、夹具损耗降到 0.5 dB，测得眼仍然 FAIL。', 'Without de-embedding, raise ATE bandwidth to 20 GHz and fixture loss down to 0.5 dB; the measured eye still FAILs.'),
  task2: loc('只去夹具、模型误差为 0，测得眼高比不去嵌入时高。', 'Fixture-only de-embedding with zero model error: measured eye height is higher than without de-embedding.'),
  task3: loc('去嵌入模型的带宽误差设到 ±20% 或更多，观察结果怎样偏离。', 'Set the de-embed model bandwidth error to ±20% or more and observe how the result drifts.'),
  task4: loc('去夹具和 ATE、模型误差为 0，测得眼与真实眼一致（眼高相差不到 1 mV）。', 'De-embed both fixture and ATE with zero model error: the measured eye matches the real eye (heights differ by less than 1 mV).'),
  task5: loc('ATE 带宽 ≥ 16 GHz、只去夹具、模型误差为 0，测得眼在 10 Gb/s 下 PASS。', 'ATE bandwidth ≥ 16 GHz, fixture-only de-embedding, zero model error: the measured eye PASSes at 10 Gb/s.'),
}

export const INTRO = [
  loc(
    '{@pmu} 讲的是 ATE 的直流 / 低速仪器，{@hsEye} 讲的是眼图本身。这一课把两件事接起来：眼图是在 ATE 上测出来的，而从器件到 ATE 比较头之间的路径（ATE 通道、夹具，以及 {@fAte} 里讲到的负载板 DIB）本身也有带宽和损耗，测得的眼是器件的眼被这些路径滤过之后的样子。',
    'The {@pmu} lesson covered the DC and low-speed ATE instruments, and {@hsEye} covered the eye diagram itself. This lesson connects them: the eye is measured on the ATE, but the path from the device to the ATE comparator (the ATE channel, the fixture, and the load board / DIB from {@fAte}) also has bandwidth and loss. The measured eye is the device’s eye after that path has filtered it.',
  ),
  loc(
    '这一课只练四件事：说清 ATE 通道带宽与夹具 / DIB 损耗怎样压窄测得眼；用去嵌入（de-embed）做逆补偿，并看它在什么条件下有效；找出测得路径的速率上限；理解为什么高速测试常用环回、Scan 与 BIST 绕开 ATE 的带宽限制。',
    'This lesson practises four things: how ATE channel bandwidth and fixture / DIB loss narrow the measured eye; de-embedding as an inverse compensation, and when it works; finding the rate limit of the measured path; and why loopback, scan and BIST are common ways around the ATE bandwidth limit.',
  ),
]

export const LOOP_PARAS = [
  loc(
    '测试系统的带宽有限时，最直接的办法是把数据留在芯片里判断。SerDes 环回（Loopback）让发射端的数据绕回接收端，ATE 只需要看结果；Scan 把判决移到扫描链上；BIST 由芯片自己产生码型并压缩结果。它们都不需要 ATE 把 10 Gb/s 的边沿完整地送进来，所以不受通道与夹具带宽的限制。Scan 与 BIST 的原理见 {@scan} 与 {@memBist}。',
    'When the test system is band-limited, the most direct fix is to judge the data inside the chip. SerDes loopback sends the transmitter data back to the receiver so the ATE only reads the result; scan moves the decision onto the scan chain; BIST lets the chip generate its own pattern and compress the result. None of them needs the ATE to carry 10 Gb/s edges end to end, so none is limited by channel or fixture bandwidth. For scan and BIST see {@scan} and {@memBist}.',
  ),
  loc(
    '环回与 BIST 也有代价：它们测到的是芯片内部的路径，外部连接器、走线与 DIB 的损耗需要另外评估，方法见 {@hsInterface}，不能只靠内部环回就下结论。',
    'Loopback and BIST have a cost too: they test the internal path, so losses in external connectors, traces and the DIB must be evaluated separately (see {@hsInterface}). An internal loopback alone does not settle the question.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    '测得眼就是器件的眼，测试仪器不影响结果。测得眼是器件的眼经过 ATE 通道与夹具之后的样子，两者的差别就是测试系统造成的误差。',
    'The measured eye is the device’s eye, so the tester does not affect the result. The measured eye is the device eye after the ATE channel and fixture; the difference is the error the test system adds.',
  ),
  loc(
    '去嵌入一定能把夹具去干净，模型不用准。去嵌入只在模型准确时有效；模型偏了，残留误差就留在眼图里，有时还会让眼看起来比真实眼更好。',
    'De-embedding always removes the fixture cleanly, so the model need not be accurate. De-embedding works only when the model is accurate; a wrong model leaves residual error in the eye, and sometimes makes the eye look better than the real one.',
  ),
  loc(
    '夹具去嵌入之后，ATE 的带宽就不再影响结果。去嵌入只去掉已经建模的那一段；ATE 通道若没有被校准，它的带宽限制仍然留在测得眼里。',
    'Once the fixture is de-embedded, ATE bandwidth no longer affects the result. De-embedding removes only the part that has been modelled; if the ATE channel is not calibrated, its bandwidth limit stays in the measured eye.',
  ),
]

/** 课末补充：由损耗反算带宽、级联上升时间的平方和开方、去嵌入的逆运算、模型误差的方向、上升时间占 UI 的比例 */
export const PREREQ: LText[] = [
  loc(
    '由损耗反算带宽：一阶低通在频率 f 的损耗 L = 10·log10(1 + (f/BW)²)（见 HS-02）。反过来 (f/BW)² = 10^(L/10) − 1，所以 BW = f ÷ √(10^(L/10) − 1)。例：f = 5 GHz、L = 3 dB 时 BW = 5 ÷ √(2 − 1) ≈ 5 GHz。',
    'Bandwidth from a loss: for a first-order low-pass, the loss at frequency f is L = 10·log10(1 + (f/BW)²) (see HS-02). Solving gives (f/BW)² = 10^(L/10) − 1, so BW = f ÷ √(10^(L/10) − 1). Example: at f = 5 GHz with L = 3 dB, BW = 5 ÷ √(2 − 1) ≈ 5 GHz.',
  ),
  loc(
    '级联的上升时间：每一段都是一阶低通，串接后总上升时间不是简单相加，而是按平方和开方合成：t_sys ≈ √(t₁² + t₂² + …)。例：8 GHz 与 6 GHz 两段，350 ÷ BW 分别是 43.75 ps 与 58.3 ps；直接相加得 102 ps，平方和开方约 73 ps。这是近似：假定各段独立、边沿形状相近；段数多或某一段特别慢时误差会变大。',
    'Rise time of cascaded stages: each stage is a first-order low-pass, and chained stages combine not by a plain sum but by root-sum-square: t_sys ≈ √(t₁² + t₂² + …). Example: 8 GHz and 6 GHz stages give 350 ÷ BW = 43.75 ps and 58.3 ps; the sum is 102 ps, but the root-sum-square is about 73 ps. This is an approximation: it assumes independent stages with similar edge shapes, and the error grows with many stages or one very slow stage.',
  ),
  loc(
    '去嵌入的逆运算：测得路径是一阶低通的级联。对一阶低通，y[n] = y[n−1] + a·(x[n] − y[n−1])，所以逆运算是 x[n] = y[n−1] + (y[n] − y[n−1]) ÷ a，其中 a 由带宽决定。页面的去嵌入就按这个递推计算，用的是模型带宽。',
    'Inverse operation of de-embedding: the measured path is a cascade of first-order low-passes. For one stage, y[n] = y[n−1] + a·(x[n] − y[n−1]), so the inverse is x[n] = y[n−1] + (y[n] − y[n−1]) ÷ a, where a depends on the bandwidth. The page de-embeds with exactly this recursion, using the model bandwidth.',
  ),
  loc(
    '模型误差为什么会欠补偿或过补偿：逆运算把每个跳变放大 1 ÷ a 倍。模型带宽偏大（modelErr > 0）时 a 偏大，放大倍数偏小，残留的夹具影响还在眼里，是欠补偿；模型带宽偏小时放大过头，相当于给高频加了峰化，眼可能比真实眼还好。两种情况下稳态（直流）都是准确的，差别只在跳变处。',
    'Why model error under- or over-compensates: the inverse boosts each transition by 1 ÷ a. If the model bandwidth is too high (modelErr > 0), a is too large, the boost is too small and some fixture effect remains: under-compensation. If the model bandwidth is too low, the boost is too large, which adds high-frequency peaking and can make the eye look better than the real one. Both cases keep the steady (DC) level correct; only the transitions differ.',
  ),
  loc(
    '上升时间占 UI 的比例：tr ÷ UI = tr × 速率 ÷ 1000（tr 用 ps，速率用 Gb/s）。路径上升时间固定时，速率翻倍，边沿占 UI 的比例也翻倍。例：8 GHz 的 ATE 通道上升时间 43.75 ps，4 Gb/s 时占 17.5%，10 Gb/s 时占 44%。',
    'Share of the UI taken by the edge: tr ÷ UI = tr × rate ÷ 1000 (tr in ps, rate in Gb/s). With a fixed path rise time, doubling the rate doubles the share of the UI the edge takes. Example: an 8 GHz ATE channel has a rise time of 43.75 ps, which is 17.5% of the UI at 4 Gb/s and 44% at 10 Gb/s.',
  ),
]

export const TAKEAWAY: LText = loc(
  '测得眼 = 真实眼经过 ATE 通道与夹具 / DIB 之后的结果；判定要拿测得眼去比规格，所以先算清 ATE 带宽与夹具损耗。去嵌入是用模型做逆补偿，模型准确时才有效，而且只能去掉被建模的那一段。',
  'Measured eye = real eye after the ATE channel and fixture / DIB. Judge against the spec with the measured eye, so work out the ATE bandwidth and fixture loss first. De-embedding is an inverse compensation with a model: it works only when the model is accurate, and it removes only the part that has been modelled.',
)

/** 右侧说明栏：去嵌入的说明，只在有去嵌入时给出，并说明模型误差会带来什么 */
function deembedNote(state: AteState): LText | null {
  const pct = Math.round(Math.abs(state.modelErr) * 100)
  if (state.deembed === 'none') {
    return loc('没有去嵌入：测得眼里包含了 ATE 通道与夹具的全部影响。', 'No de-embedding: the measured eye includes all of the ATE channel and fixture effects.')
  }
  if (state.modelErr > 0) {
    return loc(
      `去嵌入模型的带宽比真实值大 ${pct}%，补偿偏弱，残留的夹具影响还在眼图里。`,
      `The de-embed model bandwidth is ${pct}% above the true value, so the compensation is too weak and some fixture effect remains in the eye.`,
    )
  }
  if (state.modelErr < 0) {
    return loc(
      `去嵌入模型的带宽比真实值小 ${pct}%，补偿过头，相当于给高频加了峰化。这时测得眼可能比真实眼还好，但那是模型偏差造成的假象，不是器件的眼。`,
      `The de-embed model bandwidth is ${pct}% below the true value, so the compensation overshoots and adds high-frequency peaking. The measured eye may then look better than the real one; that is an artefact of the model error, not the device’s eye.`,
    )
  }
  if (state.deembed === 'fixtureAte') {
    return loc('两段模型都准确，测得眼与真实眼一致。去嵌入的前提是模型准确。', 'Both models are accurate, so the measured eye matches the real eye. De-embedding relies on the models being accurate.')
  }
  return loc('夹具模型准确，夹具的影响已经去掉；ATE 通道没有去掉，它仍然把眼压窄。', 'The fixture model is accurate, so the fixture effect is removed; the ATE channel is not removed and still narrows the eye.')
}

/** 右侧说明栏：先判测得眼，再给原因；每一句结论都在同一处写出原因 */
export function verdictOf(state: AteState, real: EyeMetrics, measured: EyeMetrics): { title: LText; text: LText; note: LText | null } {
  const rise = chainRisePs(state)
  const share = f0((rise / UI_PS) * 100)
  const note = deembedNote(state)
  if (measured.pass) {
    return {
      title: S.pass,
      text: loc(
        `测得眼没有采样点落进 mask，眼高 ${f0(measured.height)} mV，眼宽 ${f2(measured.width)} UI。真实眼眼高 ${f0(real.height)} mV，测得眼比真实眼少了 ${f0(real.height - measured.height)} mV，这部分是测试系统造成的。`,
        `No sample falls inside the mask. Measured eye height is ${f0(measured.height)} mV and width ${f2(measured.width)} UI. The real eye height is ${f0(real.height)} mV, so the measured eye is ${f0(real.height - measured.height)} mV lower; that loss comes from the test system.`,
      ),
      note,
    }
  }
  if (real.pass) {
    return {
      title: S.fail,
      text: loc(
        `器件本身的眼通过 mask（真实眼眼高 ${f0(real.height)} mV），但测得眼只剩 ${f0(measured.height)} mV，${measured.hits} 个采样点落进 mask。原因：测试路径的合成上升时间约 ${f0(rise)} ps，占 UI 的 ${share}%，边沿还没走完就进了判决区，中心电平被压低。这颗好器件会被判成坏的。`,
        `The device’s own eye passes the mask (real eye height ${f0(real.height)} mV), but the measured eye is only ${f0(measured.height)} mV with ${measured.hits} samples inside the mask. Reason: the combined rise time of the test path is about ${f0(rise)} ps, ${share}% of the UI, so the edge has not finished before the decision point and the centre level is pulled down. This good device would be judged bad.`,
      ),
      note,
    }
  }
  return {
    title: S.fail,
    text: loc(
      `真实眼也有 ${real.hits} 个采样点落进 mask。这是器件本身的眼，测试系统再好也改不了它，要回到器件的设计或选择。`,
      `The real eye also has ${real.hits} samples inside the mask. This is the device’s own eye; no test setup can change it, so the device design or selection must change.`,
    ),
    note,
  }
}

/** 五张任务卡：完成与否由当前设置和分析结果实时算出；baseline 是同一设置下不去嵌入时的测得眼 */
export function taskItems(state: AteState, real: EyeMetrics, measured: EyeMetrics, baseline: EyeMetrics): TaskItem[] {
  return [
    {
      id: 'limit',
      text: S.task1,
      done: state.deembed === 'none' && state.ateBw >= 20 && state.fixLossDb <= 0.5 && !measured.pass,
    },
    {
      id: 'fixture',
      text: S.task2,
      done: state.deembed === 'fixture' && state.modelErr === 0 && measured.height > baseline.height,
    },
    {
      id: 'model-error',
      text: S.task3,
      done: state.deembed !== 'none' && Math.abs(state.modelErr) >= 0.2,
    },
    {
      id: 'both',
      text: S.task4,
      done: state.deembed === 'fixtureAte' && state.modelErr === 0 && Math.abs(measured.height - real.height) < 1,
    },
    {
      id: 'pass',
      text: S.task5,
      done: state.deembed === 'fixture' && state.modelErr === 0 && state.ateBw >= 16 && measured.pass,
    },
  ]
}

/* ---------- 小测：题干中的数字由模型函数算出，改了模型，题干与解析自动跟着变 ---------- */

const ATE_EX = 8
const FIX_EX = 6
const RISE_ATE = riseTimePs(ATE_EX)
const RISE_FIX = riseTimePs(FIX_EX)
const RISE_SUM = RISE_ATE + RISE_FIX
const RISE_RSS = Math.sqrt(RISE_ATE ** 2 + RISE_FIX ** 2)
const LOSS_AT_BW = lossDbAt(5, 5)
const LOSS_AT_10 = lossDbAt(5, 10)
const UI_4G = 1000 / 4
const SHARE_4G = (riseTimePs(ATE_EX) / UI_4G) * 100
const SHARE_10G = (riseTimePs(ATE_EX) / UI_PS) * 100

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'ATE 夹具的 −3 dB 带宽是 5 GHz。它在 5 GHz（10 Gb/s 的奈奎斯特频率）处的插入损耗约是多少？',
      'The fixture has a −3 dB bandwidth of 5 GHz. About how much insertion loss does it have at 5 GHz, the Nyquist frequency of 10 Gb/s?',
    ),
    options: [
      { id: 'a', text: loc('1.0 dB', '1.0 dB') },
      { id: 'b', text: loc(`${f1(LOSS_AT_BW)} dB`, `${f1(LOSS_AT_BW)} dB`) },
      { id: 'c', text: loc('6.0 dB', '6.0 dB') },
    ],
    answer: 'b',
    explain: loc(
      `−3 dB 带宽就是幅度降到 1/√2 的频率。频率正好等于 −3 dB 带宽时，损耗就是 ${f1(LOSS_AT_BW)} dB。频率再高，损耗还会继续增大：10 GHz 时是 ${f1(LOSS_AT_10)} dB。`,
      `The −3 dB bandwidth is the frequency where the amplitude falls to 1/√2. At exactly that frequency the loss is ${f1(LOSS_AT_BW)} dB. Loss keeps growing above it: at 10 GHz it is ${f1(LOSS_AT_10)} dB.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'ATE 通道带宽 8 GHz，夹具带宽 6 GHz，两段都按一阶低通估算。测得路径的上升时间大约是多少？（各段按 350 ÷ BW 算，再合成）',
      'The ATE channel is 8 GHz and the fixture is 6 GHz, both treated as first-order low-passes. About how long is the rise time of the measured path? (Each stage: 350 ÷ BW, then combine.)',
    ),
    options: [
      { id: 'a', text: loc(`${f0(RISE_SUM)} ps`, `${f0(RISE_SUM)} ps`) },
      { id: 'b', text: loc(`${f0(RISE_RSS)} ps`, `${f0(RISE_RSS)} ps`) },
      { id: 'c', text: loc(`${f0(Math.min(RISE_ATE, RISE_FIX))} ps`, `${f0(Math.min(RISE_ATE, RISE_FIX))} ps`) },
    ],
    answer: 'b',
    explain: loc(
      `单段上升时间：350 ÷ 8 = ${f1(RISE_ATE)} ps，350 ÷ 6 = ${f1(RISE_FIX)} ps。直接相加会得到 ${f0(RISE_SUM)} ps，偏大；各段按平方和开方合成，得到约 ${f0(RISE_RSS)} ps。`,
      `Single stages: 350 ÷ 8 = ${f1(RISE_ATE)} ps and 350 ÷ 6 = ${f1(RISE_FIX)} ps. Adding them gives ${f0(RISE_SUM)} ps, which is too large; combining by root-sum-square gives about ${f0(RISE_RSS)} ps.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('只去夹具之后，测得眼仍然比真实眼窄。下面哪一项最可能是原因？', 'After fixture-only de-embedding, the measured eye is still narrower than the real eye. Which is the most likely cause?'),
    options: [
      { id: 'a', text: loc('夹具模型是准确的，去嵌入不起作用', 'The fixture model is accurate, so de-embedding does nothing') },
      { id: 'b', text: loc('ATE 通道没有被去嵌入，它的带宽限制仍然留在测得路径里', 'The ATE channel was not de-embedded, so its bandwidth limit is still in the measured path') },
      { id: 'c', text: loc('去嵌入会把器件本身的带宽降低', 'De-embedding lowers the device’s own bandwidth') },
    ],
    answer: 'b',
    explain: loc(
      '去嵌入只能去掉已经建模的那一段。这里只去了夹具，ATE 通道仍在测得路径里，所以测得眼仍比真实眼窄。要去掉它，需要对 ATE 通道本身做建模或校准（用已知的标准件测一遍通道）。',
      'De-embedding removes only the part that has been modelled. Here only the fixture was removed, so the ATE channel is still in the measured path and the eye stays narrower than the real one. Removing it needs a model or calibration of the ATE channel too, for example by measuring a known standard through the channel.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '去嵌入用的夹具模型带宽比真实值小 20%（模型以为夹具更慢）。去嵌入之后，测得眼最可能出现什么？',
      'The fixture model bandwidth is 20% below the true value (the model thinks the fixture is slower). After de-embedding, what is the most likely result on the measured eye?',
    ),
    options: [
      { id: 'a', text: loc('补偿不足，眼比不去嵌入时还差', 'Under-compensation: the eye is worse than without de-embedding') },
      { id: 'b', text: loc('过补偿，眼可能看起来比真实眼还好，但那是假象', 'Over-compensation: the eye may look better than the real eye, but that is an artefact') },
      { id: 'c', text: loc('完全不变，模型误差不影响结果', 'No change: model error does not affect the result') },
    ],
    answer: 'b',
    explain: loc(
      '模型带宽偏小，逆补偿的增益偏大，相当于给高频额外加了一段峰化。眼会变“好”，甚至好过真实眼；这是模型误差造成的，不代表器件更好。所以去嵌入的结果必须和模型误差一起报告。',
      'A smaller model bandwidth means the inverse compensation has too much gain, which adds extra high-frequency peaking. The eye can look better, even better than the real one; the model error causes this, not a better device. So a de-embedded result must be reported together with its model error.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '同一条测试路径，速率从 4 Gb/s 提到 10 Gb/s，眼为什么先失败？',
      'On the same test path, the rate goes from 4 Gb/s to 10 Gb/s. Why does the eye fail first?',
    ),
    options: [
      { id: 'a', text: loc('UI 变短，而上升时间由带宽决定、不随速率变，上升时间占 UI 的比例变大', 'The UI gets shorter, while rise time is set by bandwidth and does not change with rate, so rise time takes a larger share of the UI') },
      { id: 'b', text: loc('速率越高，带宽越大，眼越宽', 'A higher rate means more bandwidth and a wider eye') },
      { id: 'c', text: loc('mask 会随速率放大，所以更容易通过', 'The mask grows with the rate, so it is easier to pass') },
    ],
    answer: 'a',
    explain: loc(
      `UI = 1000 ÷ 速率：4 Gb/s 时 ${f0(UI_4G)} ps，10 Gb/s 时 ${f0(UI_PS)} ps。以 ATE 通道 8 GHz 为例，上升时间约 ${f0(RISE_ATE)} ps，占 UI 的比例从 ${f0(SHARE_4G)}% 变成 ${f0(SHARE_10G)}%，边沿越来越早地侵入判决区。`,
      `UI = 1000 ÷ rate: ${f0(UI_4G)} ps at 4 Gb/s and ${f0(UI_PS)} ps at 10 Gb/s. Take the 8 GHz ATE channel: its rise time is about ${f0(RISE_ATE)} ps, which goes from ${f0(SHARE_4G)}% of the UI to ${f0(SHARE_10G)}%, so the edge reaches the decision point sooner.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('高速测试为什么常用 SerDes 环回（Loopback）、Scan 或 BIST？', 'Why is SerDes loopback, scan or BIST often used in high-speed test?'),
    options: [
      { id: 'a', text: loc('判决留在芯片内部完成，ATE 不必把 10 Gb/s 的边沿完整送进来，因此不受通道与夹具带宽限制', 'The decision is made inside the chip, so the ATE does not need to carry 10 Gb/s edges end to end and is not limited by channel or fixture bandwidth') },
      { id: 'b', text: loc('它们能让测试机的通道带宽变大', 'They make the tester channel wider in bandwidth') },
      { id: 'c', text: loc('它们不需要任何判决，直接给出结果', 'They need no decision at all and give the result directly') },
    ],
    answer: 'a',
    explain: loc(
      '环回、Scan 与 BIST 把数据或判决留在芯片内部，绕开了 ATE 通道与夹具的带宽限制。代价是测到的路径不同，外部连接与 DIB 的损耗仍需另外评估，见 {@hsInterface}。',
      'Loopback, scan and BIST keep the data or the decision inside the chip, which avoids the ATE channel and fixture bandwidth limit. The cost is that a different path is tested; losses in external connections and the DIB still need separate evaluation (see {@hsInterface}).',
    ),
  },
]
