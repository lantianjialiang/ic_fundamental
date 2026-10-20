import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { formatSi } from './rfFormat'
import { BANDS, C_LIGHT, type OverviewAnalysis, analyseFreq } from './rfOverviewModel'

export const S = {
  kickerNow: loc('这一个频率', 'This frequency'),
  introTitle: loc('射频测试与直流测试有什么不同', 'How RF test differs from DC test'),
  coreTitle: loc('滑动频率：看波长与频段', 'Slide the frequency: read the wavelength and band'),
  coreNote: loc(
    '横轴是对数刻度，每一格差 10 倍。上面的按钮跳到典型场景的频率；拖动滑块可以停在任意频率。',
    'The axis is logarithmic, each step is ten times the last. The buttons jump to typical scenarios; the slider stops at any frequency.',
  ),
  assume: loc(
    '假设：自由空间（真空），c = 3×10⁸ m/s；不考虑介质。在 PCB 等介质里，同一频率的波长会变短。',
    'Assumption: free space (vacuum), c = 3×10⁸ m/s; the dielectric is ignored. In a dielectric such as PCB material, the wavelength at the same frequency gets shorter.',
  ),
  scenarioLabel: loc('典型场景', 'Typical scenarios'),
  freqLabel: loc('频率 f（对数滑块）', 'Frequency f (log slider)'),
  rFreq: loc('频率 f', 'Frequency f'),
  rLambda: loc('自由空间波长 λ = c / f', 'Free-space wavelength λ = c / f'),
  rBand: loc('所在频段', 'Band'),
  rTenth: loc('λ / 10（经验长度）', 'λ / 10 (rule-of-thumb length)'),
  noBand: loc('表外频率', 'Outside the table'),
  scenTitle: loc('测试场景：射频测试到底测什么', 'Test scenarios: what RF test actually measures'),
  scenarios: [
    loc(
      '收发器（Tx / Rx）：输出功率、邻道泄漏、接收灵敏度',
      'Transceivers (Tx / Rx): output power, adjacent-channel leakage, receive sensitivity',
    ),
    loc('功放与低噪声放大器：增益、线性度、噪声系数', 'Power and low-noise amplifiers: gain, linearity, noise figure'),
    loc('滤波器、天线与线缆：S 参数、插入损耗、回波损耗', 'Filters, antennas and cables: S-parameters, insertion loss, return loss'),
    loc('振荡器与锁相环：频谱纯度、谐波、相位噪声', 'Oscillators and PLLs: spectral purity, harmonics, phase noise'),
  ],
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的射频系统还要考虑调制、噪声、非线性和校准；这一课只练频率、波长和频段三件事。',
    'Real RF systems also involve modulation, noise, nonlinearity and calibration; this lesson practises only frequency, wavelength and band.',
  ),
  next: loc('下一课：dB、dBm 与 dBc', 'Next: dB, dBm and dBc'),
  task1: loc('把频率拨到 1 GHz 以上（λ 不超过 300 mm）。', 'Slide the frequency to 1 GHz or above (λ no more than 300 mm).'),
  task2: loc('选 Wi-Fi 2.4 GHz 场景，读出 λ ≈ 125 mm。', 'Pick the Wi-Fi 2.4 GHz scenario and read λ ≈ 125 mm.'),
  task3: loc('把频率拨到 SHF 频段（3–30 GHz）。', 'Slide the frequency into the SHF band (3–30 GHz).'),
  task4: loc('把频率拨到 100 MHz 以下，λ 超过 3 m。', 'Slide the frequency below 100 MHz so that λ exceeds 3 m.'),
}

export const INTRO: LText[] = [
  loc(
    '{@pmu} 和 {@hsEye} 讲的是直流与高速数字信号：电压、电流、边沿。射频（RF）信号是连续的正弦载波，频率高到电压读数和时间窗口都不够用，要看的是功率、频谱和反射。',
    'The {@pmu} and {@hsEye} lessons dealt with DC and high-speed digital signals: voltage, current and edges. An RF signal is a continuous sine carrier at a frequency so high that voltage readings and time windows are not enough; you look at power, spectrum and reflection instead.',
  ),
  loc(
    '这一课只练三件事：算出频率对应的自由空间波长（λ = c / f）；认出一个频率属于哪个频段；列出射频测试常见的几个场景。后面的 {@rfDb} 与 {@rfSparam} 都从这里出发。',
    'This lesson practises three things: compute the free-space wavelength for a frequency (λ = c / f); name the band a frequency falls in; and list the usual RF test scenarios. The {@rfDb} and {@rfSparam} lessons both start here.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '频率越高，信号就传得越远。高频在线缆、夹具和 PCB 走线上的损耗通常更大，能传的距离反而更短。',
    'Higher frequency travels farther. Loss in cables, fixtures and PCB traces is usually larger at high frequency, so the usable reach gets shorter.',
  ),
  loc(
    '波长只由频率决定，在哪里测都一样。λ = c / f 只在自由空间里成立；在 PCB 等介质里波长会变短，夹具和走线的电长度也随之变化。',
    'Wavelength depends only on frequency, so it is the same everywhere. λ = c / f holds in free space; in a dielectric such as PCB material the wavelength gets shorter, and the electrical length of traces and fixtures changes with it.',
  ),
  loc(
    '射频测试就是测一个电压。射频关心的是功率、频谱和反射。同一个电压加在不同阻抗上，功率 P = V² / R 不一样，只读电压说明不了什么。',
    'RF test measures a voltage. RF cares about power, spectrum and reflection. The same voltage across different impedances gives a different power, P = V² / R, so a voltage reading alone says little.',
  ),
]

export const TAKEAWAY: LText = loc(
  'λ = c / f，自由空间取 c ≈ 3×10⁸ m/s；频率决定波长，波长决定线缆、走线多长就要按射频处理；射频测试看的是功率、频谱与反射。',
  'λ = c / f, with c ≈ 3×10⁸ m/s in free space; frequency sets the wavelength, and the wavelength sets how long a cable or trace must be before it has to be treated as RF; RF test looks at power, spectrum and reflection.',
)

/** 右侧说明栏：频段名、λ 与 λ/10 的经验长度 */
export function verdictOf(freqHz: number, a: OverviewAnalysis): { title: LText; text: LText; note: LText } {
  const fText = formatSi(freqHz, 'Hz')
  const lambdaText = formatSi(a.lambdaM, 'm')
  const tenthText = formatSi(a.tenthM, 'm')
  const note = loc(
    `经验上，走线或线缆超过 λ/10（这里约 ${tenthText}）就要按传输线处理，不能再当成一根理想导线。`,
    `As a rule of thumb, a trace or cable longer than λ/10 (about ${tenthText} here) must be treated as a transmission line, not an ideal wire.`,
  )
  const band = a.band
  if (band === null) {
    return {
      title: S.noBand,
      text: loc(
        `${fText} 不在本课的频段表内（表的范围约 0.3 MHz–300 GHz）。自由空间波长 λ = c / f = ${lambdaText}。`,
        `${fText} is outside the band table on this page (roughly 0.3 MHz to 300 GHz). Free-space wavelength λ = c / f = ${lambdaText}.`,
      ),
      note,
    }
  }
  return {
    title: band.name,
    text: loc(
      `${fText} 属于 ${band.code} 频段，典型用途：${band.uses.zh}。自由空间波长 λ = c / f = ${lambdaText}。`,
      `${fText} is in the ${band.code} band; typical uses: ${band.uses.en ?? band.uses.zh}. Free-space wavelength λ = c / f = ${lambdaText}.`,
    ),
    note,
  }
}

/** 四张任务卡：完成与否由当前频率算出，重置即还原 */
export function taskItems(freqHz: number): TaskItem[] {
  const band = analyseFreq(freqHz).band
  return [
    { id: 'above1g', text: S.task1, done: freqHz >= 1e9 },
    { id: 'wifi24', text: S.task2, done: Math.abs(freqHz - 2.4e9) < 1 },
    { id: 'shf', text: S.task3, done: band !== null && band.code === 'SHF' },
    { id: 'below100m', text: S.task4, done: freqHz < 100e6 },
  ]
}

/** 小测题干与选项里的数字都由 C_LIGHT 与频段表算出 */
const L_24 = C_LIGHT / 2.4e9
const L_1G = C_LIGHT / 1e9
const L_10G = C_LIGHT / 10e9

/** 数字选项中西文相同，直接两语都写同一串 */
function same(text: string): LText {
  return loc(text, text)
}

function bandNamed(code: string): LText {
  const hit = BANDS.find((band) => band.code === code)
  return hit === undefined ? same(code) : hit.name
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('2.4 GHz 的自由空间波长 λ 约是多少？', 'What is the free-space wavelength of 2.4 GHz?'),
    options: [
      { id: 'a', text: same(formatSi(L_24 * 10, 'm')) },
      { id: 'b', text: same(formatSi(L_24, 'm')) },
      { id: 'c', text: same(formatSi(L_24 / 10, 'm')) },
    ],
    answer: 'b',
    explain: loc(
      `λ = c / f = 3×10⁸ / 2.4×10⁹ = ${formatSi(L_24, 'm')}。频率每高 10 倍，波长缩到 1/10。`,
      `λ = c / f = 3×10⁸ / 2.4×10⁹ = ${formatSi(L_24, 'm')}. Each tenfold rise in frequency shrinks the wavelength tenfold.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('1 GHz 的自由空间波长是多少？', 'What is the free-space wavelength at 1 GHz?'),
    options: [
      { id: 'a', text: same(formatSi(L_1G * 10, 'm')) },
      { id: 'b', text: same(formatSi(L_1G, 'm')) },
      { id: 'c', text: same(formatSi(L_1G / 1000, 'm')) },
    ],
    answer: 'b',
    explain: loc(
      `λ = 3×10⁸ / 1×10⁹ = ${formatSi(L_1G, 'm')}。1 GHz 的波长正好是 300 mm，这是一个方便记的数。`,
      `λ = 3×10⁸ / 1×10⁹ = ${formatSi(L_1G, 'm')}. At 1 GHz the wavelength is exactly 300 mm, an easy number to remember.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('1.5 GHz 属于下面哪个频段？', 'Which band does 1.5 GHz belong to?'),
    options: [
      { id: 'a', text: bandNamed('VHF') },
      { id: 'b', text: bandNamed('UHF') },
      { id: 'c', text: bandNamed('SHF') },
    ],
    answer: 'b',
    explain: loc(
      '1.5 GHz 落在 0.3–3 GHz 之间，属于 UHF（特高频）。GPS L1（1.575 GHz）也在这个频段。',
      '1.5 GHz lies between 0.3 and 3 GHz, so it is UHF (ultra high frequency). GPS L1 at 1.575 GHz is in the same band.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('频率从 1 GHz 提高到 10 GHz，波长会变成多少？', 'Frequency rises from 1 GHz to 10 GHz. What is the wavelength now?'),
    options: [
      { id: 'a', text: same(formatSi(L_10G, 'm')) },
      { id: 'b', text: same(formatSi(L_1G, 'm')) },
      { id: 'c', text: same(formatSi(L_10G / 10, 'm')) },
    ],
    answer: 'a',
    explain: loc(
      `频率乘 10，波长除以 10：${formatSi(L_1G, 'm')} → ${formatSi(L_10G, 'm')}。`,
      `Frequency times 10 means wavelength divided by 10: ${formatSi(L_1G, 'm')} → ${formatSi(L_10G, 'm')}.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('同一频率下，PCB 介质里的波长和真空相比怎样？', 'At the same frequency, how does the wavelength in PCB material compare with vacuum?'),
    options: [
      { id: 'a', text: loc('变长', 'Longer') },
      { id: 'b', text: loc('不变', 'Unchanged') },
      { id: 'c', text: loc('变短', 'Shorter') },
    ],
    answer: 'c',
    explain: loc(
      '介质的介电常数大于 1，电磁波在其中传播变慢，同一频率的波长变短（约为真空值除以 √εr）。本课假设自由空间，这里只做定性说明。',
      'A dielectric has permittivity above 1, so the wave travels slower in it and the wavelength at the same frequency is shorter (about the vacuum value divided by √εr). This lesson assumes free space, so this is only a qualitative point.',
    ),
  },
]
