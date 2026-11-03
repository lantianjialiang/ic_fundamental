import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 硅光 / 共封装光学轨道（cpo，前缀 C）。顺序即课序。 */
export const PIC_LESSONS = [
  'picOverview',
  'picUnits',
  'picDevice',
  'picMod',
  'picSweep',
  'picAlign',
  'picCutback',
  'picLink',
  'picFlow',
] as const

export type PicLessonId = (typeof PIC_LESSONS)[number]

export const PIC_META: Record<PicLessonId, LessonMeta> = {
  picOverview: {
    title: loc('硅光与共封装光学概述', 'Silicon photonics and co-packaged optics overview'),
    goal: loc(
      '说明电互连在带宽和功耗上的瓶颈；区分可插拔模块、近封装光学和共封装光学；说出 PIC、EIC、外置激光源和光纤阵列各自的角色；计算每比特能耗。',
      'Explain the bandwidth and power limit of electrical interconnect; tell pluggable modules, near-packaged optics and co-packaged optics apart; name the roles of the PIC, EIC, external laser and fiber array; compute energy per bit.',
    ),
  },
  picUnits: {
    title: loc('光学基础：波长、功率、dB 与损耗', 'Optics basics: wavelength, power, dB and loss'),
    goal: loc(
      '在波长和频率、mW 和 dBm 之间换算；用 dB 做光链路预算；区分折射率、有效折射率和群折射率；估算波导传输损耗。',
      'Convert wavelength and frequency, and mW and dBm; build an optical link budget in dB; tell refractive index, effective index and group index apart; estimate waveguide propagation loss.',
    ),
  },
  picDevice: {
    title: loc('硅光基本器件：波导、MZI 与环形谐振器', 'Silicon photonic devices: waveguides, the MZI and the ring'),
    goal: loc(
      '说明波导和耦合器做什么；计算 MZI 和环形谐振器的自由光谱范围；解释临界耦合；从谱线上读消光比和 Q；用热光效应估算温度漂移。',
      'Explain what a waveguide and a coupler do; compute the free spectral range of an MZI and a ring; explain critical coupling; read extinction ratio and Q from a spectrum; estimate the thermal wavelength shift.',
    ),
  },
  picMod: {
    title: loc('光调制器与光探测器', 'Optical modulators and photodetectors'),
    goal: loc(
      '写出马赫-曾德尔调制器的传输曲线和正交点；计算消光比、光调制幅度和插入损耗；比较环形调制器和 MZM；由响应度和暗电流算光电流。',
      'Write the Mach-Zehnder modulator curve and the quadrature bias; compute extinction ratio, optical modulation amplitude and insertion loss; compare a ring modulator with an MZM; compute photocurrent from responsivity and dark current.',
    ),
  },
  picSweep: {
    title: loc('光学测试基础：光源、功率计与波长扫描', 'Optical test basics: source, power meter and wavelength sweep'),
    goal: loc(
      '说明可调谐激光器加功率计怎样扫出传输谱；解释用参考结构做归一化；选择能分辨谐振峰的步长；区分仪器噪声底和器件动态范围。',
      'Explain how a tunable laser and a power meter build a transmission spectrum; explain normalizing to a reference structure; choose a step that resolves a resonance; tell the instrument noise floor from the device dynamic range.',
    ),
  },
  picAlign: {
    title: loc('光纤耦合与对准：光栅、边缘耦合与主动对准', 'Fiber coupling and alignment: grating, edge coupling and active alignment'),
    goal: loc(
      '区分光栅耦合器和边缘耦合器；估算失准带来的附加损耗；比较栅格、螺旋和爬山三种对准的步数与时间；说明对准为什么常常主导光学测试时间。',
      'Tell a grating coupler from an edge coupler; estimate the extra loss from misalignment; compare raster, spiral and hill-climb alignment in steps and time; explain why alignment often dominates optical test time.',
    ),
  },
  picCutback: {
    title: loc('晶圆级光电测试与参数提取', 'Wafer-level photonic test and parameter extraction'),
    goal: loc(
      '列出晶圆级要测的电学项和光学项；用 cut-back 把传输损耗和耦合损耗分开；看测量噪声怎样影响回归；在晶圆图上认出系统性偏差。',
      'List the electrical and optical items in a wafer-level test; separate propagation loss and coupling loss with cut-back; see how measurement noise moves the fit; recognize a systematic pattern on the wafer map.',
    ),
  },
  picLink: {
    title: loc('光链路测试：光眼图、ER/OMA 与 BER', 'Optical link test: optical eye, ER/OMA and BER'),
    goal: loc(
      '说明光眼图来自光电转换后的采样；计算消光比、光调制幅度和平均功率；由 Q 因子得到 BER 和接收灵敏度；把光链路和电眼图、抖动联系起来。',
      'Explain that an optical eye is sampled after optical-to-electrical conversion; compute extinction ratio, optical modulation amplitude and average power; get BER and receiver sensitivity from the Q factor; connect the optical link to the electrical eye and jitter.',
    ),
  },
  picFlow: {
    title: loc('综合：CPO 测试流程与成本', 'Capstone: CPO test flow and cost'),
    goal: loc(
      '画出共封装光学从晶圆到系统的测试插入点；用良率连乘说明测试前移；在测试成本和报废成本之间取舍；估算光学对准把 Multi-site 限制在什么程度。',
      'Draw the test insertions from wafer to system for co-packaged optics; use the yield product to explain shift-left testing; trade test cost against scrap cost; estimate how optical alignment limits multi-site parallelism.',
    ),
  },
}
