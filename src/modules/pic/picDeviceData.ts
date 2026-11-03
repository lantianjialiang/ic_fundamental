import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { PIC_TEACH, fsrNm, ringLengthUm, thermalShiftPmPerK } from './core/photonics'
import { TAB_IDS, fmtT, type DeviceAnalysis, type DeviceState, type DeviceTab } from './picDeviceModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

export const TAB_LABEL: Record<DeviceTab, LText> = {
  mzi: loc('MZI', 'MZI'),
  ring: loc('环形谐振器', 'Ring resonator'),
}

export const TABS = TAB_IDS.map((id) => ({ id, label: TAB_LABEL[id] }))

export const S = {
  kickerNow: loc('这个器件', 'This device'),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  introTitle: loc('波导、两臂的 MZI、一圈的环', 'A waveguide, a two-arm MZI, a ring'),
  coreTitle: loc('两个标签：先看 MZI，再看环', 'Two tabs: the MZI first, then the ring'),
  coreNote: loc(
    '谱线的纵轴是 10·log10(透射)，低于 -40 dB 的部分画在 -40。相位用一阶色散 φ = 2πL(ng/λ+(neff−ng)/λ0)，所以相邻峰的间距就是 FSR = λ² / (ng·L)。',
    'The spectrum vertical axis is 10 log10(transmission), and anything below -40 dB is drawn at -40. The phase uses first-order dispersion, φ = 2πL(ng/λ+(neff−ng)/λ0), so the spacing of neighboring peaks is the FSR = λ² / (ng·L).',
  ),
  tabAria: loc('器件标签', 'Device tabs'),
  dlLabel: loc('臂长差 ΔL', 'Arm difference dL'),
  neffLabel: loc('有效折射率 neff', 'Effective index neff'),
  ngLabel: loc('群折射率 ng', 'Group index ng'),
  radiusLabel: loc('环半径', 'Ring radius'),
  aLabel: loc('单圈幅度透过率 a', 'Round-trip amplitude a'),
  rLabel: loc('自耦合系数 r', 'Self-coupling r'),
  dTLabel: loc('温升 ΔT', 'Temperature rise dT'),
  rFsr: loc('FSR（用 ng）', 'FSR (uses ng)'),
  rRes: loc('谐振波长', 'Resonance'),
  rFwhm: loc('FWHM', 'FWHM'),
  rQ: loc('Q', 'Q'),
  rEr: loc('消光比', 'Extinction ratio'),
  rPm: loc('热漂移', 'Thermal shift'),
  rShift: loc('当前温升造成的移动', 'Shift at this temperature rise'),
  rT: loc('谐振处透射 T', 'Transmission T at resonance'),
  rDiff: loc('|a - r|', '|a - r|'),
  yLabel: loc('dB', 'dB'),
  xLabel: loc('nm', 'nm'),
  legMzi: loc('MZI', 'MZI'),
  legRing: loc('微环', 'Ring'),
  sum: loc('游标 {wl} nm，传输 {db} dB。', 'Cursor {wl} nm, transmission {db} dB.'),
  plotAria: loc('波长从 1530 nm 到 1570 nm 的传输谱，纵轴为 dB，游标给出当前波长和 dB', 'Transmission from 1530 nm to 1570 nm, vertical axis in dB, with the cursor wavelength and dB'),
  plotCap: loc(
    '图注：相邻峰（或谷）的间距就是 FSR，公式用群折射率 ng，不是 neff。相位里已经加了一阶色散，所以数峰得到的间隔应和读数 FSR 一致。',
    'Caption: the spacing of neighboring peaks (or dips) is the FSR. The formula uses the group index ng, not neff. First-order dispersion is already in the phase, so counting peaks should match the FSR readout.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '谐振有多窄，决定了波长扫描的步长，那是后面光学测试课的题目。温度不稳定时，谐振会漂出扫描窗口。',
    'How narrow the resonance is sets the wavelength-sweep step, which is a later optical-test lesson. If temperature is not stable, the resonance walks out of the sweep window.',
  ),
  next: loc('下一课：调制器与探测器', 'Next: modulators and photodetectors'),
  task1: loc('在 MZI 上把 ΔL 设为 100 µm、ng 设为 4.2，读出 FSR（应为 5.72 nm）。', 'On the MZI, set dL to 100 µm and ng to 4.2, and read the FSR (it should be 5.72 nm).'),
  task2: loc('在环上把半径设为 10 µm、ng 设为 4.2，读出 FSR（应为 9.10 nm）。', 'On the ring, set the radius to 10 µm and ng to 4.2, and read the FSR (it should be 9.10 nm).'),
  task3: loc('调节 a 和 r，使 |a - r| < 0.02，并看到谐振处透射 T < 0.05。', 'Adjust a and r until |a - r| < 0.02, and see the transmission at resonance drop below 0.05.'),
  task4: loc('保持 ng = 4.2，把温升设为 10 K，读出谐振移动（约为 0.66 nm）。', 'Keep ng = 4.2, set the temperature rise to 10 K, and read the resonance shift (about 0.66 nm).'),
  mziEr: loc(
    '理想 MZI 的透射可以到 0，所以消光比是无穷大。谱线上低于 -40 dB 的部分被画在 -40，不能拿图上的谷底去除以峰值来算消光比。',
    'An ideal MZI can transmit 0, so the extinction ratio is infinite. The plot draws anything below -40 dB at -40, so the drawn valley cannot be divided by the peak to get the extinction ratio.',
  ),
  mziTitle: loc('MZI 的 FSR 用 ng', 'The MZI FSR uses ng'),
  mziText: loc(
    'FSR 是 {fsr} nm。原因：FSR = λ² / (ng·ΔL)，用的是群折射率 ng = {ng}，不是有效折射率 neff = {neff}。ΔL = {dl} µm，λ = 1550 nm。相位里加了一阶色散，图上相邻条纹的间距就是这个 FSR。',
    'FSR is {fsr} nm. Reason: FSR = lambda^2 / (ng * dL) uses the group index ng = {ng}, not the effective index neff = {neff}. dL = {dl} µm and lambda = 1550 nm. First-order dispersion is in the phase, so neighboring fringes on the plot are this FSR apart.',
  ),
  ringTitle: loc('环的 FSR 同样用 ng', 'The ring FSR uses ng as well'),
  ringText: loc(
    'FSR 是 {fsr} nm。原因：FSR = λ² / (ng·L)，L = 2πR = {len} µm，ng = {ng}，不用 neff = {neff}。谐振在 {res} nm，谐振处 T = {t}。热漂移是 {pm} pm/K，所以 ΔT = {dt} K 移动 {shift} nm；这个 pm/K 也用 ng。',
    'FSR is {fsr} nm. Reason: FSR = lambda^2 / (ng * L) with L = 2 pi R = {len} µm and ng = {ng}, not neff = {neff}. Resonance is at {res} nm and T at resonance is {t}. The thermal shift is {pm} pm/K, so dT = {dt} K moves it by {shift} nm; that pm/K also uses ng.',
  ),
  critText: loc(
    '这是临界耦合附近：|a - r| = {diff} < 0.02，两路光几乎抵消，所以谐振处 T = {t}，低于 0.05。',
    'This is near critical coupling: |a - r| = {diff} < 0.02, so the two paths nearly cancel and T at resonance is {t}, below 0.05.',
  ),
}

export const INTRO = [
  loc(
    '波导把光限制在硅条里。方向耦合器按比例把光分到两路。MZI 让两路走不同的长度再合上，透射是 T = cos²(Δφ/2)。一阶色散下 Δφ = 2πΔL(ng/λ+(neff−ng)/λ0)，自由光谱范围 FSR = λ² / (ng·ΔL)，分母是群折射率 ng，不是 neff。',
    'A waveguide confines light in a silicon strip. A directional coupler splits it by a set ratio. An MZI sends the two paths along different lengths and combines them again: T = cos^2(dphi/2). With first-order dispersion, dphi = 2π dL (ng/λ + (neff−ng)/λ0). The free spectral range is FSR = lambda^2 / (ng dL). The denominator is the group index ng, not neff.',
  ),
  loc(
    '全通型微环的透射在谐振处变成 T = (a - r)² / (1 - ar)²。a = r 时是临界耦合，谐振处 T = 0。FSR = λ² / (ng·L)，L = 2πR。Q = λ0 / FWHM。',
    'An all-pass ring has T = (a - r)^2 / (1 - ar)^2 at resonance. Critical coupling is a = r, and then T = 0 at resonance. FSR = lambda^2 / (ng L), with L = 2 pi R. Q = lambda0 / FWHM.',
  ),
  loc(
    '热光效应 dλ/dT = (λ/ng)·dneff/dT。教学默认 neff = 2.4，ng = 4.2，λ = 1550 nm，dneff/dT = 1.8×10^-4 /K，大约 66 pm/K。所以加热器能把谐振调回来，测试也要把温度稳住。',
    'The thermo-optic shift is dlambda/dT = (lambda/ng) * dneff/dT. The teaching defaults are neff = 2.4, ng = 4.2, lambda = 1550 nm and dneff/dT = 1.8e-4 /K, about 66 pm/K. A heater can pull the resonance back, and a test has to hold the temperature still.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'FSR 用 neff 计算。相位里出现 neff，但波长间隔由群折射率 ng 决定。ng 通常比 neff 大，FSR 因此更窄。',
    'FSR is computed with neff. The phase contains neff, but the wavelength spacing is set by the group index ng. ng is usually larger than neff, so the FSR is narrower.',
  ),
  loc(
    '耦合越强越好。a 和 r 差得远时，谐振坑很浅，消光比不够；要的是接近临界耦合，而不是一味加大耦合。',
    'Stronger coupling is always better. When a and r are far apart the resonance dip is shallow and the extinction ratio is poor. The aim is to approach critical coupling, not to increase coupling without limit.',
  ),
  loc(
    '谐振波长不随温度变化。dneff/dT 不是零，大约每 K 移动几十 pm，10 K 就是零点几纳米，足够漂出窄线宽。',
    'Resonance wavelength does not move with temperature. dneff/dT is not zero. The shift is tens of pm per K, so 10 K is a fraction of a nanometer, enough to walk out of a narrow line.',
  ),
]

export const TAKEAWAY: LText = loc(
  'MZI 的 T = cos²(Δφ/2)，环在 a = r 时谐振透射为 0。两者的 FSR 都是 λ² / (ng·L)，用 ng 不用 neff。Q = λ / FWHM。热漂移约 66 pm/K，来自 (λ/ng)·dneff/dT。',
  'An MZI has T = cos^2(dphi/2). A ring at a = r transmits nothing at resonance. Both FSRs are lambda^2 / (ng L), using ng rather than neff. Q = lambda / FWHM. The thermal shift is about 66 pm/K, from (lambda/ng) * dneff/dT.',
)

const FSR_MZI = fsrNm(PIC_TEACH.lambdaNm, PIC_TEACH.ng, 100)
const FSR_RING = fsrNm(PIC_TEACH.lambdaNm, PIC_TEACH.ng, ringLengthUm(10))
const SHIFT = (thermalShiftPmPerK(PIC_TEACH.lambdaNm, PIC_TEACH.ng, PIC_TEACH.dneffDt) * 10) / 1000
const PMK = thermalShiftPmPerK(PIC_TEACH.lambdaNm, PIC_TEACH.ng, PIC_TEACH.dneffDt)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('ΔL = 100 µm、ng = 4.2、λ = 1550 nm，MZI 的 FSR 是多少？', 'dL = 100 µm, ng = 4.2, lambda = 1550 nm. What is the MZI FSR?'),
    options: [
      { id: 'a', text: loc(`${FSR_MZI.toFixed(2)} nm`, `${FSR_MZI.toFixed(2)} nm`) },
      { id: 'b', text: loc('10.01 nm', '10.01 nm') },
      { id: 'c', text: loc('57.20 nm', '57.20 nm') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'FSR = λ² / (ng·ΔL) = 1550² / (4.2 · 100 · 1000) = {fsr} nm。10 nm 左右是误用 neff = 2.4 的结果。',
        'FSR = lambda^2 / (ng * dL) = 1550^2 / (4.2 * 100 * 1000) = {fsr} nm. About 10 nm is what you get if you wrongly use neff = 2.4.',
      ),
      { fsr: FSR_MZI.toFixed(2) },
    ),
  },
  {
    id: 'q2',
    prompt: loc('半径 10 µm、ng = 4.2 的环，FSR 是多少？', 'What is the FSR of a ring with radius 10 µm and ng = 4.2?'),
    options: [
      { id: 'a', text: loc(`${FSR_RING.toFixed(2)} nm`, `${FSR_RING.toFixed(2)} nm`) },
      { id: 'b', text: loc('5.72 nm', '5.72 nm') },
      { id: 'c', text: loc('15.93 nm', '15.93 nm') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'L = 2πR，再 FSR = λ² / (ng·L) = {fsr} nm。5.72 nm 是 ΔL = 100 µm 的 MZI，不是这个环。',
        'L = 2 pi R, then FSR = lambda^2 / (ng * L) = {fsr} nm. 5.72 nm is the MZI with dL = 100 µm, not this ring.',
      ),
      { fsr: FSR_RING.toFixed(2) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('教学默认下，温升 10 K 时谐振大约移动多少？', 'With the teaching defaults, about how far does the resonance move for a 10 K rise?'),
    options: [
      { id: 'a', text: loc(`${SHIFT.toFixed(2)} nm`, `${SHIFT.toFixed(2)} nm`) },
      { id: 'b', text: loc('6.64 nm', '6.64 nm') },
      { id: 'c', text: loc('0.066 nm', '0.066 nm') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'dλ/dT = (λ/ng)·dneff/dT = {pm} pm/K。10 K 是 {shift} nm。0.066 nm 是忘了乘 10；6.64 nm 是把 pm 当成了 nm。',
        'dlambda/dT = (lambda/ng) * dneff/dT = {pm} pm/K. Over 10 K that is {shift} nm. 0.066 nm forgets the factor of 10; 6.64 nm treats pm as nm.',
      ),
      { pm: PMK.toFixed(1), shift: SHIFT.toFixed(2) },
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于 FSR，下列哪些说法正确？(1) FSR 的公式用 ng；(2) 把公式里的 ng 换成 neff 才对；(3) 路径更长，FSR 更小；(4) FSR 与长度无关。',
      'Which of these statements about FSR are correct? (1) The FSR formula uses ng; (2) the formula is right only if ng is replaced by neff; (3) a longer path gives a smaller FSR; (4) FSR does not depend on length.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      'FSR = λ² / (ng·L)。ng 在分母里，长度也在分母里，所以更长就更密。(2) 和 (4) 都和这个公式相反。',
      'FSR = lambda^2 / (ng * L). Both ng and the length are in the denominator, so a longer path packs the peaks closer. (2) and (4) say the opposite of that formula.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于环形谐振器，下列哪些说法正确？(1) a = r 是临界耦合，谐振处透射为 0；(2) 耦合越强越好；(3) |a - r| 很小的时候谐振坑很深；(4) 谐振波长不随温度变化。',
      'Which of these statements about the ring are correct? (1) a = r is critical coupling, and the transmission at resonance is 0; (2) stronger coupling is always better; (3) a very small |a - r| makes a deep dip; (4) the resonance wavelength does not move with temperature.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '谐振处 T = (a - r)² / (1 - ar)²，a = r 时分子是 0。(2) 错：过耦合和欠耦合都会让坑变浅。(4) 错：热光系数把谐振按大约 66 pm/K 推走。',
      'At resonance T = (a - r)^2 / (1 - ar)^2, so the numerator is 0 when a = r. (2) is wrong: both over-coupling and under-coupling make the dip shallower. (4) is wrong: the thermo-optic effect pushes the resonance by about 66 pm/K.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('品质因数 Q 怎么从谱线上得到？', 'How is the quality factor Q read from a spectrum?'),
    options: [
      { id: 'a', text: loc('Q = λ0 / FWHM', 'Q = lambda0 / FWHM') },
      { id: 'b', text: loc('Q = FWHM / λ0', 'Q = FWHM / lambda0') },
      { id: 'c', text: loc('Q = ng / neff', 'Q = ng / neff') },
    ],
    answer: 'a',
    explain: loc(
      'Q 是谐振波长除以半高全宽。线越窄，Q 越大。ng/neff 只是两个折射率的比，不是 Q。',
      'Q is the resonance wavelength divided by the full width at half maximum. A narrower line is a larger Q. ng/neff is only a ratio of two indices, not Q.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('加热器为什么能把谐振波长调回来？', 'Why can a heater pull the resonance wavelength back?'),
    options: [
      { id: 'a', text: loc('温度改变 neff，而 dλ/dT = (λ/ng)·dneff/dT', 'Temperature changes neff, and dlambda/dT = (lambda/ng) * dneff/dT') },
      { id: 'b', text: loc('加热改变了环的半径，FSR 公式里没有温度', 'Heat changes the ring radius, and the FSR formula has no temperature') },
      { id: 'c', text: loc('加热只改变耦合损耗，不改变相位', 'Heat changes only the coupling loss, not the phase') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '教学默认 dneff/dT = 1.8×10^-4 /K，再除以 ng，得到约 {pm} pm/K。加热是在用这个系数把谐振挪回目标波长。',
        'The teaching default dneff/dT = 1.8e-4 /K, divided by ng, gives about {pm} pm/K. The heater uses that coefficient to walk the resonance back to the target wavelength.',
      ),
      { pm: PMK.toFixed(1) },
    ),
  },
  {
    id: 'q8',
    prompt: loc('理想 MZI 的功率透射是哪一个？', 'Which expression is the power transmission of an ideal MZI?'),
    options: [
      { id: 'a', text: loc('T = cos²(Δφ/2)', 'T = cos^2(dphi/2)') },
      { id: 'b', text: loc('T = (a - r)² / (1 - ar)²，对所有波长', 'T = (a - r)^2 / (1 - ar)^2 at every wavelength') },
      { id: 'c', text: loc('T 是常数，与波长无关', 'T is constant and does not depend on wavelength') },
    ],
    answer: 'a',
    explain: loc(
      '合束后功率是 cos²(Δφ/2)。一阶色散下 Δφ = 2πΔL(ng/λ+(neff−ng)/λ0)；在 λ = λ0 处它回到 2π·neff·ΔL/λ。(a - r) 那个式子是环在谐振点的透射，不是 MZI 的整条谱。',
      'The combined power is cos^2(dphi/2). With first-order dispersion dphi = 2π dL (ng/λ + (neff−ng)/λ0); at λ = λ0 it returns to 2π neff dL / λ. The (a - r) expression is the ring at one resonance, not the whole MZI spectrum.',
    ),
  },
]

export function taskItems(analysis: DeviceAnalysis): TaskItem[] {
  return [
    { id: 'mzi-fsr', text: S.task1, done: analysis.task1 },
    { id: 'ring-fsr', text: S.task2, done: analysis.task2 },
    { id: 'critical', text: S.task3, done: analysis.task3 },
    { id: 'shift', text: S.task4, done: analysis.task4 },
  ]
}

export function verdictOf(state: DeviceState, analysis: DeviceAnalysis): { title: LText; text: LText } {
  if (state.tab === 'mzi') {
    return {
      title: S.mziTitle,
      text: fill(S.mziText, {
        fsr: analysis.mziFsr.toFixed(2),
        ng: state.ng.toFixed(1),
        neff: state.neff.toFixed(1),
        dl: state.dlUm.toFixed(0),
      }),
    }
  }
  const base = fill(S.ringText, {
    fsr: analysis.ringFsr.toFixed(2),
    len: analysis.lengthUm.toFixed(2),
    ng: state.ng.toFixed(1),
    neff: state.neff.toFixed(1),
    res: analysis.resonanceNm.toFixed(2),
    t: fmtT(analysis.tRes),
    pm: analysis.pmPerK.toFixed(1),
    dt: state.dT.toFixed(0),
    shift: analysis.shiftNm.toFixed(2),
  })
  if (!analysis.task3) return { title: S.ringTitle, text: base }
  const extra = fill(S.critText, { diff: Math.abs(state.a - state.r).toFixed(3), t: fmtT(analysis.tRes) })
  return { title: S.ringTitle, text: { zh: `${base.zh} ${extra.zh}`, en: `${base.en ?? base.zh} ${extra.en ?? extra.zh}` } }
}
