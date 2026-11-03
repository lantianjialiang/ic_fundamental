import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DEFAULT_OPTICAL, SOURCE_IDS, analyseOptical, type OpticalAnalysis, type OpticalState, type SourceId } from './snsOpticalModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f2 = (n: number) => n.toFixed(2)
const f3 = (n: number) => n.toFixed(3)

const TARGET = analyseOptical({
  ...DEFAULT_OPTICAL,
  prnuPct: 0.5,
  nonuniformPct: 0.3,
  frames: 50,
  megapixels: 12,
  bits: 12,
  gbps: 2.5,
})

export const SOURCE_OPTIONS = SOURCE_IDS.map((id) => ({
  id,
  label: id === 'broadband' ? loc('宽谱', 'Broadband') : id === 'rgb' ? loc('RGB LED', 'RGB LED') : loc('IR LED', 'IR LED'),
}))

export const S = {
  kickerNow: loc('这一套光路', 'This optical setup'),
  introTitle: loc('颜色、光谱与光学测试系统', 'Color, spectrum and the optical test system'),
  coreTitle: loc('拨一拨：均匀度、校准与传输时间', 'Try it: uniformity, calibration and transfer time'),
  coreNote: loc(
    '测得 PRNU = sqrt(真 PRNU^2 + 光源非均匀^2)。更亮不会缩小这一项。数据量 = 像素数 × 位宽 / 8，传输时间 = 字节 × 帧数 × 8 / 链路速率。',
    'Measured PRNU = sqrt(true PRNU^2 + source non-uniformity^2). Making the source brighter does not shrink that term. Bytes = pixels x bits / 8. Transfer time = bytes x frames x 8 / link rate.',
  ),
  callout: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  sourceLabel: loc('光源', 'Source'),
  nuLabel: loc('光源非均匀', 'Source non-uniformity'),
  stLabel: loc('光源稳定度', 'Source stability'),
  calLabel: loc('参考 PD 校准误差', 'Reference-PD calibration error'),
  prnuLabel: loc('真 PRNU', 'True PRNU'),
  frameLabel: loc('帧数', 'Frames'),
  mpLabel: loc('像素数', 'Megapixels'),
  bitLabel: loc('位宽', 'Bits'),
  linkLabel: loc('链路', 'Link'),
  geoLabel: loc('多工位限制：夹具几何', 'Multi-site limit: fixture geometry'),
  uniLabel: loc('多工位限制：光源均匀度', 'Multi-site limit: source uniformity'),
  rMeas: loc('测得 PRNU', 'Measured PRNU'),
  rBytes: loc('每帧数据量', 'Data per frame'),
  rTime: loc('传输时间', 'Transfer time'),
  rSpec: loc('稳定度与校准误差合成', 'Stability and calibration, combined'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '下一课换成 MEMS 加速度计，看另一种必须靠物理激励的测试。',
    'The next lesson switches to a MEMS accelerometer, another test that needs a physical stimulus.',
  ),
  next: loc('下一课：MEMS 加速度计', 'Next: MEMS accelerometer'),
  task1: loc(
    '把真 PRNU 调到 0.5%、光源非均匀调到 0.3%，读出测得 PRNU（应为 0.583%）。',
    'Set true PRNU to 0.5% and source non-uniformity to 0.3%, and read the measured PRNU (it should be 0.583%).',
  ),
  task2: loc(
    '设成 12 MP、12 bit、50 帧、2.5 Gbps，读出每帧 18 MB 和传输时间 2.88 s。',
    'Set 12 MP, 12 bit, 50 frames and 2.5 Gbps, and read 18 MB per frame and a transfer time of 2.88 s.',
  ),
  task3: loc('把光源换成 RGB LED，用三个波段分开看量子效率。', 'Switch the source to the RGB LED so quantum efficiency can be read on three bands.'),
  task4: loc('勾上光学多工位的两个限制：夹具几何，以及光源均匀度。', 'Turn on both limits of optical multi-site: fixture geometry, and source uniformity.'),
  vBroad: loc('宽谱光要的是均匀，不是更亮', 'A broadband source is judged by uniformity, not by being brighter'),
  vRgb: loc('三个波段才能分开测量子效率', 'Three bands are what split quantum efficiency by channel'),
  vIr: loc('IR 照不到可见光的拜耳通道', 'IR does not sample the visible Bayer channels'),
  vText: loc(
    '测得 PRNU 是 {meas}%，等于 sqrt({true}^2 + {nu}^2)。原因：更亮不会缩小这项，均匀度和稳定度才会。当前稳定度 {st}%，参考光电二极管校准误差 {cal}%，合成的光谱误差约 {spec}%。一帧 {mb} MB，{frames} 帧在 {gbps} Gbps 下要传 {time} s。光学多工位受夹具几何（{geo}）和光源均匀度（{uni}）限制，因为几个工位很难共享同一块又均匀又稳定的光场。',
    'Measured PRNU is {meas}%, which is sqrt({true}^2 + {nu}^2). Reason: a brighter source does not shrink this term. Uniformity and stability do. Stability is {st}% and the reference-photodiode calibration error is {cal}%, so the combined spectral error is about {spec}%. One frame is {mb} MB. {frames} frames on a {gbps} Gbps link take {time} s. Optical multi-site is limited by fixture geometry ({geo}) and source uniformity ({uni}), because several sites rarely share one field that is both even and stable.',
  ),
}

export const INTRO = [
  loc(
    '彩色 CIS 用拜耳阵列把像素分成 R、G、B。各通道的量子效率随波长变，所以光谱响应要用窄带光源扫，并用一只校准过的参考光电二极管做分母。VDUT-CIS1 在这里只提供 PRNU 真值，不对应任何真实滤色片曲线。',
    'A color CIS splits pixels into R, G and B with a Bayer array. Quantum efficiency of each channel changes with wavelength, so a spectral response is scanned with a narrow-band source and divided by a calibrated reference photodiode. VDUT-CIS1 only supplies a true PRNU here. It does not stand in for any real filter curve.',
  ),
  loc(
    '积分球用来把光搅匀。光源自己的非均匀会和器件 PRNU 按平方相加：测得值 = sqrt(真值^2 + 非均匀^2)。稳定度差、参考二极管的校准有误差，光谱曲线会跟着漂。把灯调亮并不能把这些项消掉。',
    'An integrating sphere stirs the light until it is even. Source non-uniformity adds to device PRNU as squares: measured = sqrt(true^2 + non-uniformity^2). Poor stability and calibration error on the reference diode move the spectral curve. Turning the lamp up does not cancel those terms.',
  ),
  loc(
    '一帧的字节数是像素数乘位宽再除以 8。帧数一多，传输时间会变成测试时间的一大块。光学多工位还受夹具几何和光源均匀度限制，很难像电测试那样简单地并排。',
    'Bytes in one frame are pixels times bits, divided by 8. With many frames, transfer time becomes a large piece of test time. Optical multi-site is also limited by fixture geometry and source uniformity, so it does not tile the way an electrical test does.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '光源越亮越好。亮只提高信号。均匀度和稳定度直接加进测得的 PRNU 和光谱误差，灯更亮也不会把它们变小。',
    'Brighter is better. Brightness only raises the signal. Uniformity and stability add directly into the measured PRNU and the spectral error, and a brighter lamp does not make them smaller.',
  ),
  loc(
    '颜色测试有 RGB 三个点就够。量子效率是一条曲线，三个宽 LED 只能给出三个积分，替代不了按波长扫描。',
    'Three RGB points are enough for a color test. Quantum efficiency is a curve. Three wide LEDs only give three integrals. They do not replace a scan in wavelength.',
  ),
  loc(
    '数据传输时间可以忽略。12 MP、12 bit 的一帧是 18 MB，几十帧在几 Gbps 的链路上要花上秒级的时间。',
    'Data-transfer time can be ignored. One 12 MP, 12 bit frame is 18 MB. Tens of frames on a link of a few Gbps take on the order of seconds.',
  ),
]

export const TAKEAWAY: LText = loc(
  '测得 PRNU = sqrt(真 PRNU^2 + 光源非均匀^2)。光谱响应用参考光电二极管做校准，稳定度和校准误差会留在曲线里。字节数 = 像素 × 位宽 / 8，传输时间 = 字节 × 帧数 × 8 / 速率。光学多工位受夹具几何和光源均匀度限制。目标是均匀和稳定，不是把灯调得更亮。',
  'Measured PRNU = sqrt(true PRNU^2 + source non-uniformity^2). Spectral response is calibrated with a reference photodiode, and stability and calibration error stay on the curve. Bytes = pixels x bits / 8. Transfer time = bytes x frames x 8 / rate. Optical multi-site is limited by fixture geometry and source uniformity. The goal is uniformity and stability, not a brighter lamp.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('真 PRNU 0.5%，光源非均匀 0.3%。测得 PRNU 大约是多少？', 'True PRNU is 0.5% and source non-uniformity is 0.3%. About what is the measured PRNU?'),
    options: [
      { id: 'a', text: loc('0.400%', '0.400%') },
      { id: 'b', text: loc(`${f3(TARGET.measuredPct)}%`, `${f3(TARGET.measuredPct)}%`) },
      { id: 'c', text: loc('0.800%', '0.800%') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'sqrt(0.5^2 + 0.3^2) = {v}%。两项按功率相加，不是直接相加，也不是取较大的那个。',
        'sqrt(0.5^2 + 0.3^2) = {v}%. The two terms add in power. They are not added directly, and the result is not just the larger one.',
      ),
      { v: f3(TARGET.measuredPct) },
    ),
  },
  {
    id: 'q2',
    prompt: loc('12 MP、12 bit 的一帧大约是多少 MB？', 'About how many MB is one frame at 12 MP and 12 bit?'),
    options: [
      { id: 'a', text: loc('12 MB', '12 MB') },
      { id: 'b', text: loc(`${f2(TARGET.mbPerFrame)} MB`, `${f2(TARGET.mbPerFrame)} MB`) },
      { id: 'c', text: loc('144 MB', '144 MB') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '12e6 × 12 / 8 = 18e6 字节 = {v} MB。位宽要先换成字节。',
        '12e6 x 12 / 8 = 18e6 bytes = {v} MB. Bits have to be turned into bytes first.',
      ),
      { v: f2(TARGET.mbPerFrame) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('上面这一帧采 50 帧，链路 2.5 Gbps，传输大约要多少秒？', 'How many seconds does the transfer of 50 such frames take on a 2.5 Gbps link?'),
    options: [
      { id: 'a', text: loc('0.58 s', '0.58 s') },
      { id: 'b', text: loc(`${f2(TARGET.transferS)} s`, `${f2(TARGET.transferS)} s`) },
      { id: 'c', text: loc('18 s', '18 s') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '50 帧共 900 MB = 7.2e9 bit。除以 2.5e9 bit/s 得到 {v} s。Gbps 用的是 bit，不是 byte。',
        '50 frames are 900 MB = 7.2e9 bits. Divided by 2.5e9 bit/s that is {v} s. Gbps counts bits, not bytes.',
      ),
      { v: f2(TARGET.transferS) },
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于光学测量，下列哪些说法正确？(1) 更亮不能代替更均匀；(2) 稳定度会进到重复性里；(3) 灯的亮度越高，测得 PRNU 越小；(4) 参考光电二极管用来给光谱响应做校准。',
      'Which statements about an optical measurement are correct? (1) Brighter does not stand in for more uniform; (2) stability shows up in repeatability; (3) a brighter lamp makes the measured PRNU smaller; (4) a reference photodiode calibrates the spectral response.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 反了。测得 PRNU 由真值和光源非均匀决定，亮度不在这个公式里。',
      '(3) is reversed. Measured PRNU is set by the true value and the source non-uniformity. Brightness is not in that formula.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于光学多工位，下列哪些说法正确？(1) 夹具几何限制了几个工位能不能同时看到同一块光；(2) 光源均匀度限制了工位之间的一致性；(3) 只要把灯调亮，多工位就和电测试一样容易；(4) 数据传输时间会随帧数变长。',
      'Which statements about optical multi-site are correct? (1) Fixture geometry limits whether several sites can see the same field at once; (2) source uniformity limits how well the sites match; (3) a brighter lamp makes multi-site as easy as an electrical test; (4) transfer time grows with the frame count.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 把亮度当成了并行度。几个工位要共享均匀且稳定的光场，几何和均匀度才是限制。',
      '(3) treats brightness as parallelism. Several sites have to share a field that is both even and stable. Geometry and uniformity are the limits.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么光谱响应要用参考光电二极管？', 'Why does a spectral-response measurement use a reference photodiode?'),
    options: [
      { id: 'a', text: loc('用它量到的光做分母，把光源本身的强弱从器件响应里除出去', 'The light it measures is the denominator, so the source strength is divided out of the device response') },
      { id: 'b', text: loc('用它代替器件的 PRNU', 'It replaces the PRNU of the device') },
      { id: 'c', text: loc('用它把链路速率提高', 'It raises the link rate') },
    ],
    answer: 'a',
    explain: loc(
      '窄带光源的功率随波长变。参考二极管先量到这份功率，器件信号再除以它，剩下的才是器件自己的光谱响应。校准误差会留在结果里。',
      'A narrow-band source changes power with wavelength. The reference diode measures that power first, and the device signal is divided by it. What remains is the device spectral response. Calibration error stays in the result.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('RGB LED 相对宽谱光源，多做了哪一件事？', 'Compared with a broadband source, what extra job does an RGB LED do?'),
    options: [
      { id: 'a', text: loc('用三个波段分别照 R、G、B，看各通道的量子效率', 'It lights R, G and B on three bands so each channel quantum efficiency can be read') },
      { id: 'b', text: loc('自动去掉光源非均匀', 'It removes source non-uniformity automatically') },
      { id: 'c', text: loc('把一帧的字节数减半', 'It cuts the bytes in one frame in half') },
    ],
    answer: 'a',
    explain: loc(
      '三个波段给出三个通道的响应。它仍然是三个宽积分，不是完整的光谱曲线，也不改变均匀度或数据量。',
      'Three bands give the response of three channels. They are still three wide integrals, not a full spectral curve, and they do not change uniformity or the data volume.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于拜耳阵列，下列哪些说法正确？(1) 相邻像素戴不同的滤色片；(2) 各通道量子效率不一样；(3) IR LED 可以完整测出可见光三个通道；(4) 白平衡比来自各通道对同一光源的响应。',
      'Which statements about a Bayer array are correct? (1) Neighboring pixels wear different color filters; (2) the channels do not share one quantum efficiency; (3) an IR LED fully measures the three visible channels; (4) a white-balance ratio comes from how the channels respond to the same source.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 不成立。IR 落在可见光滤色片的通带外面，给不出 R、G、B 的量子效率。',
      '(3) does not hold. IR falls outside the passband of the visible filters, so it does not give the quantum efficiency of R, G and B.',
    ),
  },
]

export function taskItems(state: OpticalState): TaskItem[] {
  return [
    { id: 'prnu-src', text: S.task1, done: state.prnuPct === 0.5 && state.nonuniformPct === 0.3 },
    { id: 'xfer', text: S.task2, done: state.megapixels === 12 && state.bits === 12 && state.frames === 50 && state.gbps === 2.5 },
    { id: 'rgb', text: S.task3, done: state.source === 'rgb' },
    { id: 'limits', text: S.task4, done: state.limitGeometry && state.limitUniform },
  ]
}

export function verdictOf(state: OpticalState, a: OpticalAnalysis): { title: LText; text: LText } {
  const title: Record<SourceId, LText> = { broadband: S.vBroad, rgb: S.vRgb, ir: S.vIr }
  return {
    title: title[state.source],
    text: fill(S.vText, {
      meas: f3(a.measuredPct),
      true: f1ish(state.prnuPct),
      nu: f1ish(state.nonuniformPct),
      st: f1ish(state.stabilityPct),
      cal: f1ish(state.calErrPct),
      spec: f2(a.spectralPct),
      mb: f2(a.mbPerFrame),
      frames: String(state.frames),
      gbps: f1ish(state.gbps),
      time: f2(a.transferS),
      geo: state.limitGeometry ? 'ON' : 'OFF',
      uni: state.limitUniform ? 'ON' : 'OFF',
    }),
  }
}

function f1ish(n: number): string {
  return Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)
}
