import { loc } from '../../../i18n/locale'
import { type AnaKnowledge } from '../../ana/knowledge/types'
import { type ModuleId } from '../../catalog'

const lesson = 'picOverview' as ModuleId

/** PIC-01 硅光与共封装光学：CPO、NPO、外置激光、光纤阵列 */
export const PIC_OVERVIEW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-cpo',
      term: 'Co-packaged optics',
      name: loc('共封装光学（CPO）', 'Co-packaged optics (CPO)'),
      def: loc(
        '把光引擎（PIC 与 EIC）和交换 ASIC 封在一起，电通道只剩很短的一截。短通道损耗更小，均衡功耗因此下降。见 {@picOverview}。',
        'The optical engine (PIC and EIC) shares a package with the switch ASIC, so the electrical channel is only a short trace. A short channel has less loss, and equalizer power falls with it. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-npo',
      term: 'Near-packaged optics',
      name: loc('近封装光学（NPO）', 'Near-packaged optics (NPO)'),
      def: loc(
        '光引擎放在 ASIC 附近的基板上，电通道已经比可插拔模块短，但还没有和 ASIC 封在同一个壳体里。见 {@picOverview}。',
        'The optical engine sits on a substrate near the ASIC. The electrical path is already shorter than a pluggable module, but the engine is not in the same package as the ASIC. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-els',
      term: 'External laser source',
      name: loc('外置激光源（ELS）', 'External laser source (ELS)'),
      def: loc(
        '放在 PIC 外面的激光器，避免在发热的 ASIC 旁边做大功率光源。模块单独测 L-I 和波长，耦合后再在封装级核对功率。见 {@picOverview}。',
        'A laser kept off the PIC, so a high-power source is not built next to the hot ASIC. The module is tested on its own for the L-I curve and wavelength, and the coupled power is checked again at package. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-fau',
      term: 'Fiber array unit',
      name: loc('光纤阵列单元（FAU）', 'Fiber array unit (FAU)'),
      def: loc(
        '按固定间距排成一排的光纤，对准到芯片上的光栅或端面耦合器。主动对准找的是整排的峰，通道一多，对准时间更显眼。光纤在封装阶段贴上，所以耦合在封装级测量。见 {@picOverview} 和 {@picAlign}。',
        'A row of fibers held at a fixed pitch and aligned to the grating or edge couplers on the chip. Active alignment searches for the peak of the whole row, and with more channels the alignment time stands out. The fibers are attached at package, so coupling is measured at package level. See {@picOverview} and {@picAlign}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-silicon-photonics',
      term: 'Silicon photonics',
      name: loc('硅光', 'Silicon photonics'),
      def: loc(
        '在硅晶圆上做光波导、调制器和探测器，用 CMOS 工艺走光。光源常常是贴上去的 III–V，不是硅自己发光。见 {@picOverview}。',
        'Optical waveguides, modulators and detectors built on a silicon wafer with a CMOS-like process. The light source is often a bonded III–V die; silicon itself does not lase. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-pic',
      term: 'Photonic IC',
      name: loc('光子集成电路（PIC）', 'Photonic IC (PIC)'),
      def: loc(
        '集成波导、耦合器、调制器和探测器的光芯片。它处理的是光模式和波长，不是逻辑电平。见 {@picOverview}。',
        'A photonic chip that integrates waveguides, couplers, modulators and detectors. It handles optical modes and wavelength, not logic levels. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-eic',
      term: 'Electronic IC',
      name: loc('电子集成电路（EIC）', 'Electronic IC (EIC)'),
      def: loc(
        '和 PIC 配对的电芯片：驱动调制器、读探测器、锁波长。CPO 里 PIC 与 EIC 组成光引擎，再和交换 ASIC 共封。见 {@picOverview}。',
        'The electrical chip paired with the PIC: it drives the modulator, reads the detector and locks wavelength. In CPO the PIC and EIC form the optical engine, then share a package with the switch ASIC. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'pic-overview-cpo-npo',
      q: loc('CPO 和把可插拔模块做小有什么不同？', 'How is CPO different from a smaller pluggable module?'),
      a: loc(
        '差别是电通道有多长，以及光引擎什么时候和 ASIC 绑在一起。可插拔模块的电通道穿过电路板；NPO 把光引擎放到附近的基板上；CPO 把光引擎和 ASIC 封在一起。外壳变小本身并不缩短那条通道。见 {@picOverview}。',
        'The difference is how long the electrical channel is, and when the optical engine is tied to the ASIC. A pluggable module keeps a path across the board; NPO puts the engine on a nearby substrate; CPO packages the engine with the ASIC. A smaller shell does not by itself shorten that channel. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-overview-test-electrical',
      q: loc('光引擎为什么不能只做电学测试？', 'Why can an optical engine not be tested with electrical instruments only?'),
      a: loc(
        '调制和探测发生在光和电的界面上。没有光纤接触就读不到光功率，没有高速电学就驱动不了 EIC。对准往往比电学项目更花时间，而且缺陷若拖到和 ASIC 共封装之后才发现，报废的是整个昂贵封装。见 {@picOverview}。',
        'Modulation and detection sit on the optical-electrical boundary. Without a fiber contact there is no optical power reading, and without high-speed electrical instruments the EIC cannot be driven. Alignment often takes longer than the electrical items, and a defect found only after co-packaging with the ASIC scraps the whole expensive package. See {@picOverview}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-overview-optical-loss',
      q: loc('光互连是不是没有损耗、只比电通道短？', 'Is an optical interconnect lossless, only a shorter electrical channel?'),
      a: loc(
        '不是。耦合、波导、连接器和封装都有插入损耗，几段 dB 相加就会把到达功率压下去。CPO 缩短的是电通道，不是把光路变成无损。见 {@picOverview}、{@picUnits}。',
        'No. Couplers, waveguides, connectors and the package all add insertion loss, and adding those dB values drops the arriving power. CPO shortens the electrical channel; it does not make the optical path lossless. See {@picOverview} and {@picUnits}.',
      ),
      lessons: [lesson],
    },
  ],
}
