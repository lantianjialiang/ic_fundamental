import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { conversionGainV, kTcNoiseE } from './core/optics'
import { kElectronsPerDn, quantNoiseE } from './core/sensor'
import {
  CDS_IDS,
  QUANT_IDS,
  READ_E,
  pixelFlags,
  type CdsId,
  type PixelAnalysis,
  type PixelState,
  type QuantId,
} from './snsPixelModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

function join(parts: LText[]): LText {
  return {
    zh: parts.map((part) => part.zh).join(''),
    en: parts.map((part) => part.en ?? part.zh).join(''),
  }
}

const CDS_LABEL: Record<CdsId, LText> = {
  off: loc('CDS 关', 'CDS off'),
  on: loc('CDS 开', 'CDS on'),
}

const QUANT_LABEL: Record<QuantId, LText> = {
  yes: loc('量化主导', 'Quantization dominates'),
  no: loc('量化不主导', 'Quantization does not'),
}

export const CDS_OPTIONS = CDS_IDS.map((id) => ({ id, label: CDS_LABEL[id] }))
export const QUANT_OPTIONS = QUANT_IDS.map((id) => ({ id, label: QUANT_LABEL[id] }))

export const S = {
  teach: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  kickerNow: loc('这一路读出', 'This readout'),
  introTitle: loc('4T 像素怎么读出来', 'How a 4T pixel is read'),
  figAria: loc('4T 像素时序：左栏是 RST、TX、SEL，下方是 FD 电压', '4T pixel timing: RST, TX, and SEL in the left gutter, FD voltage below'),
  coreTitle: loc('练一练：从电子到 DN', 'Practice: from electrons to DN'),
  coreNote: loc(
    'VDUT-CIS1 的像素是 4T：复位 RST、转移 TX、行选 SEL，电荷落到浮空扩散 FD。转换增益 CG = q/C。总增益是 CG 乘源跟随增益再乘列增益。K = Vref / (2^N · 总增益)。模型里固定拿 5 e- 的读出噪声和量化噪声比，CDS 只从噪声和里拿走 kTC。',
    'A VDUT-CIS1 pixel is 4T: reset RST, transfer TX, row select SEL, and the charge lands on the floating diffusion FD. Conversion gain CG = q/C. Total gain is CG times the source-follower gain times the column gain. K = Vref / (2^N * total gain). The model compares quantization noise with a fixed read noise of 5 e-. CDS removes only kTC from the noise sum.',
  ),
  cLabel: loc('FD 电容', 'FD capacitance'),
  sfLabel: loc('源跟随增益', 'Source-follower gain'),
  colLabel: loc('列增益', 'Column gain'),
  bitsLabel: loc('ADC 位数', 'ADC bits'),
  vrefLabel: loc('ADC 参考 Vref', 'ADC reference Vref'),
  photoLabel: loc('光电子', 'Photoelectrons'),
  rowLabel: loc('行时间', 'Row time'),
  rowsLabel: loc('行数', 'Row count'),
  cdsLabel: loc('相关双采样', 'Correlated double sampling'),
  quantLabel: loc('量化噪声是否主导', 'Does quantization dominate'),
  rCg: loc('转换增益', 'Conversion gain'),
  rTotal: loc('总增益', 'Total gain'),
  rKtc: loc('复位 kTC', 'Reset kTC'),
  rK: loc('K', 'K'),
  rQuant: loc('量化噪声', 'Quantization noise'),
  rRes: loc('噪声和（kTC 与量化）', 'Noise sum (kTC and quant.)'),
  rDn: loc('输出', 'Output'),
  rShot: loc('信号散粒', 'Signal shot'),
  rRead: loc('固定读出噪声', 'Fixed read noise'),
  rSkew: loc('卷帘偏斜', 'Rolling skew'),
  rQ: loc('电子电荷 q', 'Electron charge q'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('下一课用 PTC 从图像反推这里的 K，不需要打开像素去量电容。', 'The next lesson recovers this K from images with a PTC, without opening the pixel to measure the capacitor.'),
  next: loc('下一课：光子传递曲线（PTC）与转换增益', 'Next: Photon transfer curve (PTC) and conversion gain'),
  task1: loc(
    '把 FD 电容调到 1 fF，再读转换增益。它按 CG = q/C 算。',
    'Set the FD capacitance to 1 fF, then read the conversion gain. It is CG = q/C.',
  ),
  task2: loc(
    '打开 CDS。噪声和里的 kTC 被减掉，残余只剩量化噪声。CDS 不去掉信号的散粒噪声，也不去掉那 5 e- 读出噪声。',
    'Turn CDS on. kTC leaves the noise sum and the residual equals the quantization noise alone. CDS does not remove shot noise of the signal, and it does not remove the 5 e- read noise.',
  ),
  task3: loc(
    '把 ADC 调到 10 bit、Vref 调到 1 V，并把总增益调到约 100 µV/e-（例如 C = 1 fF、源跟随 0.78、列增益 0.80）。再读 K 和量化噪声，并把“量化是否主导”拨到和 5 e- 读出噪声比较后的正确一侧。',
    'Set the ADC to 10 bits and Vref to 1 V, and set the total gain near 100 uV/e- (for example C = 1 fF, source follower 0.78, column gain 0.80). Then read K and the quantization noise, and set "does quantization dominate" to the side that matches the comparison with the 5 e- read noise.',
  ),
  task4: loc(
    '调节行时间和行数，使卷帘偏斜等于 10 ms。偏斜 = 行时间 × 行数，例如 10 µs 乘 1000 行。',
    'Set the row time and the row count so the rolling-shutter skew is 10 ms. Skew = row time times row count, for example 10 us times 1000 rows.',
  ),
  cdsOff: loc('CDS 关着，复位 kTC 还在噪声和里。', 'CDS is off, so reset kTC is still in the noise sum. '),
  cdsOn: loc('CDS 开着，复位 kTC 已从噪声和里去掉。', 'CDS is on, so reset kTC has been removed from the noise sum. '),
  body: loc(
    '原因：kTC 是复位开关的热噪声，CDS 用信号电平减去复位电平，相关的那一份被消掉。当前 kTC = {ktc} e-，量化噪声 = {quant} e-，噪声和残余 = {res} e-。信号散粒 {shot} e- 和固定读出噪声 {read} e- 不在这个减法里，所以 CDS 去不掉它们。转换增益 {cg} µV/e-，总增益 {tot} µV/e-，K = {k} e-/DN，输出 {dn} DN。卷帘偏斜 = 行时间 × 行数 = {skew} µs。',
    'Reason: kTC is the thermal noise of the reset switch. CDS subtracts the reset level from the signal level, so the correlated part cancels. kTC is {ktc} e- now, quantization noise is {quant} e-, and the residual noise sum is {res} e-. Signal shot {shot} e- and the fixed read noise {read} e- are not in that subtraction, so CDS does not remove them. Conversion gain is {cg} uV/e-, total gain is {tot} uV/e-, K is {k} e-/DN, and the output is {dn} DN. Rolling skew = row time times row count = {skew} us. ',
  ),
  callYes: loc('你对量化是否主导的选择是“主导”。', 'Your call on quantization is "dominates". '),
  callNo: loc('你对量化是否主导的选择是“不主导”。', 'Your call on quantization is "does not dominate". '),
  truthYes: loc(
    '正确判断是主导：量化噪声 {quant} e- 不小于固定读出噪声 {read} e-，量化这一项更大。',
    'The correct call is that it dominates: quantization noise {quant} e- is not below the fixed read noise {read} e-, so the quantization term is the larger one.',
  ),
  truthNo: loc(
    '正确判断是不主导：量化噪声 {quant} e- 小于固定读出噪声 {read} e-，读出噪声更大。',
    'The correct call is that it does not dominate: quantization noise {quant} e- is below the fixed read noise {read} e-, so read noise is larger.',
  ),
}

export function figSummary(state: PixelState, a: PixelAnalysis): LText {
  const base = fill(
    loc(
      'RST、TX、SEL 三条是一行像素的时序，名字只写在左栏，避免和色条重叠。FD 在 TX 之后下降，光电子 {e} 越多降得越多；右侧读数是 {dn} DN。',
      'RST, TX, and SEL are one pixel row, with names only in the left gutter so they do not sit on the bars. FD falls after TX, and more photoelectrons ({e}) make a deeper drop. The readout is {dn} DN. ',
    ),
    { e: state.photoE.toFixed(0), dn: a.dn.toFixed(1) },
  )
  return join([base, figBlurb(state)])
}

export const INTRO = [
  loc(
    '4T 像素里，光电二极管在曝光期间收集电子。RST 把浮空扩散复位到一个高电平，TX 再把电荷转过来，FD 电压下降。SEL 接通源跟随器，这一行才送到列电路。全局快门所有行一起曝光；卷帘快门逐行复位和读出，第一行和最后一行的时刻差就是行时间乘行数。',
    'In a 4T pixel the photodiode collects electrons during exposure. RST resets the floating diffusion to a high level, TX then transfers the charge, and the FD voltage falls. SEL turns on the source follower so that row reaches the column circuit. A global shutter exposes every row together. A rolling shutter resets and reads row by row, and the skew from the first row to the last is row time times the row count.',
  ),
  loc(
    '复位开关有 kTC 噪声。CDS 先采样复位电平，再采样转移后的信号电平，两者相减，复位噪声里相关的那一份被消掉。信号本身的散粒噪声和读出电路的噪声并不相关，减不掉。电子乘总增益变成电压，再除以一个 DN 对应的电压，就是数字码。量化噪声约为 K/√12。',
    'The reset switch has kTC noise. CDS samples the reset level and then the signal level after transfer, and subtracts them, so the correlated part of the reset noise cancels. Shot noise of the signal and noise of the readout circuit are not correlated and do not cancel. Electrons times the total gain become a voltage, and dividing by the volts per DN gives the digital code. Quantization noise is about K/sqrt(12).',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '增益越大越好。总增益变大，每个电子占更多 DN，K 变小，量化更细；但同样的满阱电子会更早顶到 ADC 或电压摆幅，可用的电子数不一定增加。',
    'More gain is always better. A larger total gain gives each electron more DN, K gets smaller, and quantization is finer. The same full-well electron count also hits the ADC or the voltage swing sooner, so the usable electron count does not automatically rise.',
  ),
  loc(
    'CDS 能消掉所有噪声。它消的是复位时刻和信号时刻共有的 kTC。光子散粒噪声在转移时才进来，读出噪声在采样之后还有，两者都还在。',
    'CDS removes every noise. It removes the kTC that is common to the reset sample and the signal sample. Photon shot noise arrives with the transfer, and read noise is still present after the sample. Both remain.',
  ),
  loc(
    'ADC 位数和读出噪声无关。位数和参考电压决定一个 DN 有多宽，量化噪声是 K/√12。位数少到量化噪声超过读出噪声时，多出来的模拟精度被台阶吃掉。',
    'ADC bits have nothing to do with read noise. The bit count and the reference set how wide one DN is, and quantization noise is K/sqrt(12). When the bit count is low enough that quantization noise exceeds read noise, the extra analog precision is lost in the steps.',
  ),
]

export const TAKEAWAY: LText = loc(
  '4T 的顺序是复位、曝光、转移、读出。CG = q/C，1 fF 约 160 µV/e-；kTC 在 1 fF、300 K 约 12.7 e-。CDS 去掉复位 kTC，不去掉散粒噪声和读出噪声。K = Vref / (2^N · 总增益)，量化噪声约 K/√12。卷帘偏斜 = 行时间 × 行数。',
  'The 4T order is reset, integration, transfer, and readout. CG = q/C, about 160 uV/e- at 1 fF. kTC at 1 fF and 300 K is about 12.7 e-. CDS removes reset kTC and does not remove shot noise or read noise. K = Vref / (2^N * total gain), and quantization noise is about K/sqrt(12). Rolling skew = row time times the row count.',
)

const CG = conversionGainV(1e-15) * 1e6
const CG_TXT = CG.toFixed(1)
const CG_LO = (CG * 0.85).toFixed(1)
const CG_HI = (CG * 1.15).toFixed(1)
const KTC = kTcNoiseE(1e-15, 300)
const KTC_TXT = KTC.toFixed(1)
const KTC_LO = (KTC * 0.85).toFixed(1)
const KTC_HI = (KTC * 1.15).toFixed(1)
const KREF = kElectronsPerDn(1, 10, 100e-6)
const K_TXT = KREF.toFixed(2)
const K_LO = (KREF * 0.85).toFixed(2)
const K_HI = (KREF * 1.15).toFixed(2)
const QREF = quantNoiseE(KREF)
const Q_TXT = QREF.toFixed(2)
const Q_LO = (QREF * 0.85).toFixed(2)
const Q_HI = (QREF * 1.15).toFixed(2)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('4T 像素读出一行时，开关的合理顺序是哪一个？', 'When a 4T pixel reads one row, which switch order is the sensible one?'),
    options: [
      { id: 'a', text: loc('先 TX 把电荷转走，再 RST 复位，最后才曝光', 'TX transfers the charge first, then RST resets, and exposure is last') },
      { id: 'b', text: loc('RST 复位 FD，曝光收集电荷，TX 转移，SEL 读出', 'RST resets FD, exposure collects charge, TX transfers, SEL reads out') },
      { id: 'c', text: loc('SEL 一直关着，只靠 TX 直接输出数字码', 'SEL stays off and TX alone outputs a digital code') },
    ],
    answer: 'b',
    explain: loc(
      '要先有一个干净的复位电平，曝光期间电荷待在光电二极管里，TX 再转移到 FD，SEL 才把这一行送到列电路。颠倒复位和转移就没有可减的复位样本。',
      'There has to be a clean reset level first. During exposure the charge waits in the photodiode, TX then transfers it to the FD, and SEL sends that row to the column circuit. Swapping reset and transfer leaves no reset sample to subtract.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 CDS，下列哪些说法正确？(1) 它用信号样本减去复位样本；(2) 它去掉的是复位 kTC 里相关的那一份；(3) 它去掉光子散粒噪声；(4) 它去掉读出电路的全部噪声。',
      'Which statements about CDS are correct? (1) it subtracts the reset sample from the signal sample; (2) it removes the correlated part of reset kTC; (3) it removes photon shot noise; (4) it removes all noise of the readout circuit.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      'CDS 的减法只对两份样本里相同的复位噪声有效。(3) 和 (4) 错：散粒噪声在转移时才出现，读出噪声也不在两份样本里完全相关。',
      'The CDS subtraction works on reset noise that is common to the two samples. (3) and (4) are wrong: shot noise appears at the transfer, and read noise is not fully correlated between the two samples.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('FD 电容为 1 fF 时，转换增益大约是多少 µV/e-？', 'About what is the conversion gain in uV/e- when the FD capacitance is 1 fF?'),
    options: [
      { id: 'a', text: loc(CG_LO, CG_LO) },
      { id: 'b', text: loc(CG_TXT, CG_TXT) },
      { id: 'c', text: loc(CG_HI, CG_HI) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'CG = q/C。C = 1e-15 F 时约 {cg} µV/e-。{lo} 和 {hi} 大约偏了 15%，多半是把 fF 和 pF 换错了。',
        'CG = q/C. At C = 1e-15 F it is about {cg} uV/e-. {lo} and {hi} are about 15% off, usually from mixing fF and pF.',
      ),
      { cg: CG_TXT, lo: CG_LO, hi: CG_HI },
    ),
  },
  {
    id: 'q4',
    prompt: loc('1 fF、300 K 时，复位 kTC 噪声大约是多少 e- rms？', 'About what is the reset kTC noise in e- rms at 1 fF and 300 K?'),
    options: [
      { id: 'a', text: loc(KTC_HI, KTC_HI) },
      { id: 'b', text: loc(KTC_LO, KTC_LO) },
      { id: 'c', text: loc(KTC_TXT, KTC_TXT) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'kTC 噪声 = √(kTC) / q，1 fF、300 K 约 {k} e-。{lo} 和 {hi} 是同一公式附近差了约 15% 的数。',
        'kTC noise = sqrt(k*T*C) / q, about {k} e- at 1 fF and 300 K. {lo} and {hi} sit about 15% away from that result.',
      ),
      { k: KTC_TXT, lo: KTC_LO, hi: KTC_HI },
    ),
  },
  {
    id: 'q5',
    prompt: loc('10 bit ADC、Vref = 1 V、总增益 100 µV/e-。K 大约是多少 e-/DN？', 'A 10-bit ADC, Vref = 1 V, and a total gain of 100 uV/e-. About what is K in e-/DN?'),
    options: [
      { id: 'a', text: loc(K_TXT, K_TXT) },
      { id: 'b', text: loc(K_LO, K_LO) },
      { id: 'c', text: loc(K_HI, K_HI) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'K = 1 / (1024 · 100e-6) = {k} e-/DN。{lo} 和 {hi} 大约偏 15%，常见的错是用 2^10−1 或者把微伏当成毫伏。',
        'K = 1 / (1024 * 100e-6) = {k} e-/DN. {lo} and {hi} are about 15% off. A common slip is to use 2^10-1, or to treat microvolts as millivolts.',
      ),
      { k: K_TXT, lo: K_LO, hi: K_HI },
    ),
  },
  {
    id: 'q6',
    prompt: loc('沿用上一题的 K，量化噪声大约是多少 e- rms？', 'Using K from the previous question, about what is the quantization noise in e- rms?'),
    options: [
      { id: 'a', text: loc(Q_LO, Q_LO) },
      { id: 'b', text: loc(Q_HI, Q_HI) },
      { id: 'c', text: loc(Q_TXT, Q_TXT) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        '量化噪声约 K/√12 = {q} e-。{lo} 和 {hi} 大约偏 15%。和固定的 5 e- 读出噪声比，{q} 更小，所以量化不主导。',
        'Quantization noise is about K/sqrt(12) = {q} e-. {lo} and {hi} are about 15% off. Compared with the fixed 5 e- read noise, {q} is smaller, so quantization does not dominate.',
      ),
      { q: Q_TXT, lo: Q_LO, hi: Q_HI },
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '关于卷帘快门和全局快门，下列哪些说法正确？(1) 卷帘偏斜 = 行时间 × 行数；(2) 全局快门各行同时曝光，没有这项行偏斜；(3) 卷帘偏斜可以用 CDS 消掉；(4) 行数越多，卷帘偏斜越小。',
      'Which statements about rolling and global shutter are correct? (1) rolling skew = row time times row count; (2) a global shutter exposes every row together and does not have this row skew; (3) CDS removes rolling skew; (4) more rows make the rolling skew smaller.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '卷帘是逐行错开复位和读出，总偏斜随行数变大。(3) 错：CDS 减的是同一像素的复位电平和信号电平，不改变行与行的时间差。(4) 反了。',
      'A rolling shutter staggers reset and readout by row, so the total skew grows with the row count. (3) is wrong: CDS subtracts the reset and signal levels of the same pixel and does not change the time gap between rows. (4) is reversed.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('把列增益再提高十倍，满阱电子数一定变成十倍吗？', 'If the column gain is raised by ten, must the full-well electron count become ten times larger?'),
    options: [
      { id: 'a', text: loc('一定，增益和满阱成正比', 'Yes. Gain and full well are proportional') },
      { id: 'b', text: loc('不一定：满阱还受 FD 能装下的电子和电压摆幅限制，增益只改变每个电子占多少 DN', 'Not necessarily. Full well is also limited by how many electrons the FD can hold and by the voltage swing. Gain only changes how many DN one electron occupies') },
      { id: 'c', text: loc('一定变小到原来的十分之一，因为 K 变小', 'It must fall to one tenth, because K gets smaller') },
    ],
    answer: 'b',
    explain: loc(
      'K 确实随总增益变小，量化变细。满阱电子数首先是二极管和 FD 能收多少电荷，电压摆幅不够时 ADC 会先饱和。所以增益变大不等于满阱电子变多。',
      'K does get smaller as the total gain rises, so quantization gets finer. The full-well electron count is first how much charge the diode and the FD can hold. If the voltage swing is too small, the ADC saturates first. A larger gain does not mean more full-well electrons.',
    ),
  },
]

export function taskItems(state: PixelState, a: PixelAnalysis): TaskItem[] {
  const flags = pixelFlags(state, a)
  return [
    { id: 'cg', text: S.task1, done: flags.t1 },
    { id: 'cds', text: S.task2, done: flags.t2 },
    { id: 'quant', text: S.task3, done: flags.t3 },
    { id: 'skew', text: S.task4, done: flags.t4 },
  ]
}

export function verdictOf(state: PixelState, a: PixelAnalysis): { title: LText; text: LText } {
  const nums = {
    ktc: a.ktc.toFixed(2),
    quant: a.quant.toFixed(2),
    res: a.residual.toFixed(2),
    shot: a.shot.toFixed(2),
    read: READ_E.toFixed(0),
    cg: a.cgUv.toFixed(1),
    tot: a.totalUv.toFixed(2),
    k: a.k.toFixed(2),
    dn: a.dn.toFixed(1),
    skew: a.skewUs.toFixed(0),
  }
  const title = state.cds === 'on'
    ? loc('CDS 去掉了复位 kTC', 'CDS removed the reset kTC')
    : loc('复位 kTC 还在噪声里', 'Reset kTC is still in the noise')
  const call = state.quantCall === 'yes' ? S.callYes : S.callNo
  const truth = fill(a.quantAnswer === 'yes' ? S.truthYes : S.truthNo, nums)
  return {
    title,
    text: join([state.cds === 'on' ? S.cdsOn : S.cdsOff, fill(S.body, nums), call, truth]),
  }
}

export function figBlurb(state: PixelState): LText {
  return state.cds === 'on'
    ? loc('图上两个金点就是这两次采样。', 'The two gold dots are those two samples. ')
    : loc('CDS 关着，图上不标采样点。', 'CDS is off, so the figure does not mark sample points. ')
}
