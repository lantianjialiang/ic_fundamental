import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { photonFlux, responsivity, shotEqualsReadE, snrDb } from './core/optics'
import { DOM_IDS, photonFlags, type DomId, type PhotonAnalysis, type PhotonState } from './snsPhotonModel'

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

const DOM_LABEL: Record<DomId, LText> = {
  read: loc('读出噪声', 'Read noise'),
  shot: loc('光子散粒', 'Photon shot'),
  dark: loc('暗散粒', 'Dark shot'),
}

export const DOM_OPTIONS = DOM_IDS.map((id) => ({ id, label: DOM_LABEL[id] }))

const TITLE_OK: Record<DomId, LText> = {
  read: loc('读出噪声确实主导', 'Read noise does dominate'),
  shot: loc('光子散粒噪声确实主导', 'Photon shot noise does dominate'),
  dark: loc('暗散粒噪声确实主导', 'Dark shot noise does dominate'),
}

const TITLE_BAD: Record<DomId, LText> = {
  read: loc('读出噪声此刻不主导', 'Read noise does not dominate now'),
  shot: loc('光子散粒噪声此刻不主导', 'Photon shot noise does not dominate now'),
  dark: loc('暗散粒噪声此刻不主导', 'Dark shot noise does not dominate now'),
}

export const S = {
  teach: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  kickerNow: loc('这一档噪声', 'This noise term'),
  introTitle: loc('从光子到电子', 'From photons to electrons'),
  coreTitle: loc('拨一拨：响应度与信噪比', 'Try it: responsivity and SNR'),
  coreNote: loc(
    '功率、面积、曝光和量子效率用来算光子与光生电子。SNR 用单独的信号电子旋钮，方便对到 10000 或读噪的平方，不必反推光功率。蓝线是当前暗电子和读噪下的 SNR，金线是只剩散粒噪声的极限。',
    'Power, area, exposure, and quantum efficiency compute photons and photoelectrons. SNR uses a separate signal-electron knob so you can land on 10000 or on the square of the read noise without backing out an optical power. The blue line is SNR with the current dark electrons and read noise. The gold line is the shot-noise limit.',
  ),
  lambdaLabel: loc('波长', 'Wavelength'),
  powerLabel: loc('像素入射功率', 'Power on the pixel'),
  areaLabel: loc('像素面积', 'Pixel area'),
  expLabel: loc('曝光时间', 'Exposure'),
  qeLabel: loc('量子效率 QE', 'Quantum efficiency QE'),
  darkLabel: loc('暗电流', 'Dark current'),
  readLabel: loc('读出噪声', 'Read noise'),
  signalLabel: loc('SNR 工作点信号', 'SNR working-point signal'),
  domLabel: loc('哪一种噪声主导', 'Which noise dominates'),
  rEnergy: loc('光子能量', 'Photon energy'),
  rFlux: loc('光子通量', 'Photon flux'),
  rPhotons: loc('曝光内光子', 'Photons in the exposure'),
  rOptical: loc('光生电子', 'Photoelectrons'),
  rResp: loc('响应度', 'Responsivity'),
  rIrr: loc('辐照度', 'Irradiance'),
  rDarkE: loc('暗电子', 'Dark electrons'),
  rShot: loc('散粒噪声 rms', 'Shot noise rms'),
  rDarkRms: loc('暗散粒 rms', 'Dark-shot rms'),
  rRead: loc('读出噪声 rms', 'Read noise rms'),
  rSnr: loc('SNR', 'SNR'),
  rLin: loc('SNR（线性）', 'SNR (linear)'),
  rCross: loc('散粒等于读噪的信号', 'Signal where shot equals read'),
  plotAria: loc('SNR 对信号电子的对数曲线，蓝线含读噪与暗电流，金线是散粒极限', 'Log plot of SNR versus signal electrons; blue includes read noise and dark current, gold is the shot limit'),
  plotX: loc('信号', 'signal'),
  plotY: loc('dB', 'dB'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('下一课把这些电子放进 4T 像素，看复位、转移和 ADC 怎样变成 DN。', 'The next lesson puts these electrons into a 4T pixel and follows reset, transfer, and the ADC into DN.'),
  next: loc('下一课：CMOS 图像传感器：像素与读出链', 'Next: CMOS image sensor: pixel and readout chain'),
  task1: loc(
    '把波长调到 550 nm、量子效率调到 0.6。响应度应约为 0.266 A/W，因为 R = QE·λ(µm) / 1.2398。',
    'Set the wavelength to 550 nm and the quantum efficiency to 0.6. Responsivity should be about 0.266 A/W, because R = QE * lambda(um) / 1.2398.',
  ),
  task2: loc(
    '把信号电子调到 10000，暗电流和读出噪声都调到 0。散粒噪声极限 SNR 是 40 dB，因为 √10000 = 100，20·log10(100) = 40。',
    'Set the signal to 10000 electrons and set both dark current and read noise to 0. The shot-noise-limited SNR is 40 dB, because sqrt(10000) = 100 and 20*log10(100) = 40.',
  ),
  task3: loc(
    '把信号电子调到读出噪声的平方，误差在 5% 以内。例如读噪 20 e- 时信号约 400，因为散粒噪声等于读噪的位置是 σr²。',
    'Set the signal electrons to the square of the read noise, within 5%. For example, with read noise 20 e- the signal is about 400, because shot noise equals read noise at sigma_r squared.',
  ),
  task4: loc(
    '看当前数字：读出噪声主导的条件是 σr² 大于信号电子加暗电子。把选择拨到真正主导的那一项。',
    'Read the current numbers. Read noise dominates when sigma_r squared is greater than signal electrons plus dark electrons. Set the choice to whichever term actually dominates.',
  ),
  agree: loc('这个选择和当前数字一致。', 'This choice matches the current numbers. '),
  disagree: loc('这个选择和当前数字不一致。', 'This choice does not match the current numbers. '),
  whyRead: loc(
    '原因：读出噪声方差 σr² = {rv}，大于信号加暗电子 {sd}，所以读出噪声主导。当前 SNR = {snr} dB，响应度 = {resp} A/W，散粒等于读噪的信号是 {cross} e-。',
    'Reason: the read-noise variance sigma_r^2 = {rv}, which is greater than signal plus dark electrons {sd}, so read noise dominates. SNR is {snr} dB now, responsivity is {resp} A/W, and shot equals read at {cross} e-. ',
  ),
  whyShot: loc(
    '原因：σr² = {rv} 并没有大于信号加暗电子 {sd}，而信号 {sig} 不小于暗电子 {dark}，所以光子散粒噪声主导。当前 SNR = {snr} dB，响应度 = {resp} A/W。',
    'Reason: sigma_r^2 = {rv} is not greater than signal plus dark electrons {sd}, and the signal {sig} is not below the dark electrons {dark}, so photon shot noise dominates. SNR is {snr} dB now, and responsivity is {resp} A/W. ',
  ),
  whyDark: loc(
    '原因：σr² = {rv} 并没有大于信号加暗电子 {sd}，而暗电子 {dark} 大于信号 {sig}，所以暗散粒噪声主导。当前 SNR = {snr} dB，响应度 = {resp} A/W。',
    'Reason: sigma_r^2 = {rv} is not greater than signal plus dark electrons {sd}, and dark electrons {dark} exceed the signal {sig}, so dark shot noise dominates. SNR is {snr} dB now, and responsivity is {resp} A/W. ',
  ),
}

export function plotSummary(state: PhotonState, a: PhotonAnalysis): LText {
  return fill(
    loc(
      '横轴是信号电子的对数，纵轴是 SNR（dB）。蓝线用当前暗电子 {dark} 和读噪 {read} e-，金线把这两项设为 0。工作点信号 {sig} e- 处的 SNR 是 {snr} dB。',
      'The horizontal axis is the log of signal electrons and the vertical axis is SNR in dB. The blue line uses the current dark electrons {dark} and read noise {read} e-. The gold line sets both to 0. At the working point of {sig} e-, SNR is {snr} dB.',
    ),
    {
      dark: a.darkE.toFixed(2),
      read: state.read.toFixed(0),
      sig: state.signal.toFixed(0),
      snr: a.snr.toFixed(2),
    },
  )
}

export const INTRO = [
  loc(
    '一个光子的能量是 hc/λ。功率除以这个能量就是每秒光子数。量子效率 QE 是每个光子平均产生的电子数。响应度把同一件事写成电流对功率：R = QE·λ(µm) / 1.2398，单位 A/W。',
    'One photon carries energy hc/lambda. Power divided by that energy is photons per second. Quantum efficiency QE is the average number of electrons per photon. Responsivity writes the same fact as current over power: R = QE * lambda(um) / 1.2398, in A/W.',
  ),
  loc(
    '光子到达是泊松过程，散粒噪声的标准差是 √N。暗电流在曝光里也积累电子，带来暗散粒噪声。读出噪声是后面电路加上的，不随信号变。SNR = S / √(S + D + σr²)。低光时 σr² 最大，读出噪声主导；信号超过 σr² 以后，散粒噪声主导。VDUT-CIS1 的像素课会接着用这些电子。',
    'Photon arrival is a Poisson process, so the shot-noise std is sqrt(N). Dark current also collects electrons during the exposure and adds dark shot noise. Read noise is added by later circuits and does not grow with the signal. SNR = S / sqrt(S + D + sigma_r^2). In dim light sigma_r^2 is the largest term and read noise dominates. After the signal passes sigma_r^2, shot noise dominates. The VDUT-CIS1 pixel lesson continues from these electrons.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'SNR 和光强成正比。读噪主导时 SNR ≈ S/σr，光强每增加 10 倍，SNR 增加 20 dB；只剩散粒噪声时 SNR = √S，同样 10 倍光强只增加 10 dB。两段斜率不同，整条曲线不是一条比例直线。',
    'SNR is proportional to light level. In the read-noise limit SNR ≈ S/σr, so ten times more light adds 20 dB. With shot noise alone SNR = sqrt(S), and the same tenfold light adds only 10 dB. The two slopes differ, so the whole curve is not one straight proportion.',
  ),
  loc(
    'QE 越高，噪声就越小。QE 提高的是每个光子变成的电子，也就是信号。读出噪声是电路加上的，QE 改不动它。',
    'A higher QE means less noise. QE raises how many electrons each photon makes, which is the signal. Read noise is added by the circuit, and QE does not change it.',
  ),
  loc(
    '暗电流和读出噪声是一回事。暗电流随曝光时间积累电子，噪声是 √(暗电子)；读出噪声以 e- rms 计，不随曝光变长。',
    'Dark current and read noise are the same thing. Dark current collects electrons over the exposure, and its noise is the square root of those electrons. Read noise is an rms electron count and does not grow with exposure.',
  ),
]

export const TAKEAWAY: LText = loc(
  '光子/秒 = 功率 / (hc/λ)。R = QE·λ(µm) / 1.2398。SNR = S / √(S + D + σr²)，只剩散粒噪声时 10000 电子对应 40 dB。散粒噪声等于读噪的信号电子数是 σr²。σr² 大于 S + D 时读出噪声主导。',
  'Photons per second = power / (hc/lambda). R = QE * lambda(um) / 1.2398. SNR = S / sqrt(S + D + sigma_r^2). With shot noise alone, 10000 electrons give 40 dB. Shot noise equals read noise at sigma_r squared signal electrons. Read noise dominates when sigma_r squared is greater than S + D.',
)

const RESP = responsivity(0.6, 550)
const RESP_TXT = RESP.toFixed(3)
const RESP_LO = (RESP * 0.85).toFixed(3)
const RESP_HI = (RESP * 1.15).toFixed(3)
const SNR40 = snrDb(10000, 0, 0)
const SNR_TXT = SNR40.toFixed(1)
const SNR_LO = (SNR40 - 4).toFixed(1)
const SNR_HI = (SNR40 + 4).toFixed(1)
const CROSS = shotEqualsReadE(10)
const CROSS_TXT = CROSS.toFixed(0)
const CROSS_LO = (CROSS * 0.8).toFixed(0)
const CROSS_HI = (CROSS * 1.2).toFixed(0)
const FLUX = photonFlux(1e-6, 550)
const FLUX_TXT = FLUX.toExponential(2)
const FLUX_LO = (FLUX * 0.9).toExponential(2)
const FLUX_HI = (FLUX * 1.1).toExponential(2)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('波长变长、功率不变时，每秒光子数怎样变？', 'If the wavelength gets longer and the power stays the same, what happens to photons per second?'),
    options: [
      { id: 'a', text: loc('变少，因为每个光子能量更高', 'They decrease, because each photon has more energy') },
      { id: 'b', text: loc('变多，因为每个光子能量更低，同样的功率要更多光子', 'They increase, because each photon has less energy, so the same power needs more photons') },
      { id: 'c', text: loc('不变，光子数只跟功率有关', 'They stay the same; photon count depends only on power') },
    ],
    answer: 'b',
    explain: loc(
      '光子能量是 hc/λ，波长越长能量越低。光子/秒 = 功率 / 能量，所以同样的功率在更长的波长上对应更多光子。',
      'Photon energy is hc/lambda, so a longer wavelength means less energy per photon. Photons per second = power / energy, so the same power corresponds to more photons at a longer wavelength.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于三种噪声，下列哪些说法正确？(1) 光子散粒噪声的标准差是 √S；(2) 暗散粒噪声来自曝光内积累的暗电子；(3) 读出噪声随信号成比例变大；(4) QE 越高，读出噪声越小。',
      'Which statements about the three noise terms are correct? (1) the std of photon shot noise is sqrt(S); (2) dark shot noise comes from dark electrons collected during the exposure; (3) read noise grows in proportion to the signal; (4) a higher QE makes read noise smaller.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (2) 是散粒噪声的定义。(3) 错：读出噪声是电路加上的标准差，不跟信号走。(4) 错：QE 改变的是信号电子，不是读出噪声。',
      '(1) and (2) are the definition of shot noise. (3) is wrong: read noise is an rms added by the circuit and does not follow the signal. (4) is wrong: QE changes the signal electrons, not the read noise.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('λ = 550 nm、QE = 0.6 时，响应度大约是多少 A/W？', 'About what is the responsivity in A/W at lambda = 550 nm and QE = 0.6?'),
    options: [
      { id: 'a', text: loc(RESP_LO, RESP_LO) },
      { id: 'b', text: loc(RESP_HI, RESP_HI) },
      { id: 'c', text: loc(RESP_TXT, RESP_TXT) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'R = 0.6 · 0.550 / 1.2398 = {r} A/W。{lo} 和 {hi} 大约差了 15%，多半是把波长单位或 QE 乘错了。',
        'R = 0.6 * 0.550 / 1.2398 = {r} A/W. {lo} and {hi} are about 15% off, usually from a wrong wavelength unit or a wrong factor on QE.',
      ),
      { r: RESP_TXT, lo: RESP_LO, hi: RESP_HI },
    ),
  },
  {
    id: 'q4',
    prompt: loc('信号 10000 电子，暗电子和读出噪声都是 0。SNR 是多少 dB？', 'The signal is 10000 electrons, and both dark electrons and read noise are 0. What is the SNR in dB?'),
    options: [
      { id: 'a', text: loc(SNR_TXT, SNR_TXT) },
      { id: 'b', text: loc(SNR_LO, SNR_LO) },
      { id: 'c', text: loc(SNR_HI, SNR_HI) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'SNR = √10000 = 100，20·log10(100) = {snr} dB。{lo} 和 {hi} 是少算或多算了大约 4 dB。',
        'SNR = sqrt(10000) = 100, and 20*log10(100) = {snr} dB. {lo} and {hi} are about 4 dB low or high.',
      ),
      { snr: SNR_TXT, lo: SNR_LO, hi: SNR_HI },
    ),
  },
  {
    id: 'q5',
    prompt: loc('读出噪声是 10 e- rms。散粒噪声等于读噪时，信号电子大约是多少？', 'Read noise is 10 e- rms. About how many signal electrons make shot noise equal the read noise?'),
    options: [
      { id: 'a', text: loc(CROSS_LO, CROSS_LO) },
      { id: 'b', text: loc(CROSS_TXT, CROSS_TXT) },
      { id: 'c', text: loc(CROSS_HI, CROSS_HI) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '√S = σr 时 S = σr² = 10² = {n}。{lo} 和 {hi} 是同一个平方附近差了 20% 的数，不是 σr 本身，也不是 σr³。',
        'When sqrt(S) = sigma_r, S = sigma_r^2 = 10^2 = {n}. {lo} and {hi} sit about 20% away from that square. The answer is not sigma_r itself and not sigma_r cubed.',
      ),
      { n: CROSS_TXT, lo: CROSS_LO, hi: CROSS_HI },
    ),
  },
  {
    id: 'q6',
    prompt: loc('1 µW、550 nm 时，光子通量大约是每秒多少？', 'About what is the photon flux per second at 1 uW and 550 nm?'),
    options: [
      { id: 'a', text: loc(FLUX_LO, FLUX_LO) },
      { id: 'b', text: loc(FLUX_HI, FLUX_HI) },
      { id: 'c', text: loc(FLUX_TXT, FLUX_TXT) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        '光子/秒 = 功率 / (hc/λ)。1e-6 W 在 550 nm 给出 {flux} /s。{lo} 和 {hi} 大约偏了 10%。',
        'Photons per second = power / (hc/lambda). 1e-6 W at 550 nm gives {flux} per second. {lo} and {hi} are about 10% off.',
      ),
      { flux: FLUX_TXT, lo: FLUX_LO, hi: FLUX_HI },
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '判断主导噪声时，下列哪些说法正确？(1) σr² > S + D 时读出噪声主导；(2) 读噪不主导且 S ≥ D 时光子散粒主导；(3) 信号越大读出噪声一定主导；(4) 暗电子为 0 时暗散粒仍可能主导。',
      'Which statements about the dominant noise are correct? (1) read noise dominates when sigma_r^2 > S + D; (2) when read noise does not dominate and S is at least D, photon shot dominates; (3) a larger signal always makes read noise dominate; (4) dark shot can still dominate when dark electrons are 0.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(3)、(4)', '(3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '分母里三项是 S、D 和 σr²。σr² 最大时读出噪声主导；否则谁的电子数大，谁的散粒噪声主导。(3) 反了：信号变大是散粒噪声起来。(4) 错：暗电子为 0 时暗散粒是 0。',
      'The three terms under the square root are S, D, and sigma_r^2. Read noise dominates when sigma_r^2 is the largest. Otherwise the larger electron count owns the shot noise. (3) is reversed: a larger signal is when shot noise takes over. (4) is wrong: zero dark electrons means zero dark shot noise.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('只提高 QE、不改读出电路，低光 SNR 一定明显变好吗？', 'If you raise only QE and leave the readout circuit alone, must the low-light SNR improve a lot?'),
    options: [
      { id: 'a', text: loc('一定，因为噪声和 QE 成反比', 'Yes, because noise is inversely proportional to QE') },
      { id: 'b', text: loc('不一定：低光若由读出噪声主导，QE 只放大信号，读噪不动，但信号变大仍会提高 SNR', 'Not always by the same factor: if read noise dominates in dim light, QE scales the signal and the read noise stays put, so SNR still rises with the signal') },
      { id: 'c', text: loc('不会变，SNR 与 QE 无关', 'It does not change; SNR does not depend on QE') },
    ],
    answer: 'b',
    explain: loc(
      'QE 把光子变成更多电子，S 变大，SNR = S / √(S + D + σr²) 会提高。但读噪 σr 不变，所以不是“噪声变小”，低光段的改善来自信号变大，而不是读噪被 QE 除掉。',
      'QE turns photons into more electrons, S grows, and SNR = S / sqrt(S + D + sigma_r^2) rises. The read noise sigma_r does not change, so this is not "the noise got smaller". The dim-end improvement comes from a larger signal, not from QE removing read noise.',
    ),
  },
]

export function taskItems(state: PhotonState, a: PhotonAnalysis): TaskItem[] {
  const flags = photonFlags(state, a)
  return [
    { id: 'resp', text: S.task1, done: flags.t1 },
    { id: 'snr40', text: S.task2, done: flags.t2 },
    { id: 'cross', text: S.task3, done: flags.t3 },
    { id: 'dominate', text: S.task4, done: flags.t4 },
  ]
}

export function verdictOf(state: PhotonState, a: PhotonAnalysis): { title: LText; text: LText } {
  const nums = {
    rv: (state.read * state.read).toFixed(1),
    sd: (state.signal + a.darkE).toFixed(1),
    sig: state.signal.toFixed(0),
    dark: a.darkE.toFixed(2),
    snr: a.snr.toFixed(2),
    resp: a.resp.toFixed(3),
    cross: a.crossE.toFixed(1),
  }
  const why = a.dominant === 'read' ? S.whyRead : a.dominant === 'shot' ? S.whyShot : S.whyDark
  const title = state.dom === a.dominant ? TITLE_OK[state.dom] : TITLE_BAD[state.dom]
  const head = state.dom === a.dominant ? S.agree : S.disagree
  return { title, text: join([head, fill(why, nums)]) }
}
