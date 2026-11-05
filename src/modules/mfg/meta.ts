import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

export const MFG_LESSONS = [
  'mfgOverview',
  'mfgFab',
  'mfgNre',
  'mfgWat',
  'mfgCp',
  'mfgHw',
  'mfgSubstrate',
  'mfgSubFab',
  'mfgFlying',
  'mfgAssembly',
  'mfgRamp',
] as const

export type MfgLessonId = (typeof MFG_LESSONS)[number]

export const MFG_META: Record<MfgLessonId, LessonMeta> = {
  mfgOverview: {
    title: loc('芯片全流程总览：从设计到出货', 'Chip flow overview: from design to ship'),
    goal: loc(
      '说出从设计到出货的主要阶段；区分 Fabless、Foundry、OSAT、IDM；说出每阶段产出的数据和主要检验；解释 lot、wafer、die、MPW；估算累计周期。',
      'Name the main stages from design to ship; tell Fabless, Foundry, OSAT and IDM apart; name the data and checks each stage produces; explain lot, wafer, die and MPW; estimate the accumulated cycle time.',
    ),
  },
  mfgFab: {
    title: loc('晶圆制造基础：FEOL/BEOL、光刻与良率', 'Wafer fab basics: FEOL/BEOL, lithography and yield'),
    goal: loc(
      '区分 FEOL、MEOL、BEOL；说出光刻、刻蚀、沉积、注入、CMP 的作用；计算每片 die 数和好 die 数；用 Rayleigh 公式理解分辨率。',
      'Tell FEOL, MEOL and BEOL apart; name what lithography, etch, deposition, implant and CMP do; compute dies per wafer and good dies; use the Rayleigh formula for resolution.',
    ),
  },
  mfgNre: {
    title: loc('光罩、MPW 与 NRE', 'Masks, MPW and NRE'),
    goal: loc(
      '解释光罩与 tape-out；说明 MPW 如何分摊光罩成本；列出 NRE 的主要组成；计算含 NRE 的单颗成本和盈亏平衡产量；解释重新流片的代价。',
      'Explain masks and tape-out; show how MPW shares mask cost; list the main NRE pieces; compute unit cost with NRE and the break-even volume; explain the cost of a respin.',
    ),
  },
  mfgWat: {
    title: loc('晶圆验收测试 WAT / PCM', 'Wafer acceptance test WAT / PCM'),
    goal: loc(
      '解释 WAT 的目的和位置；说出测试键的作用和典型参数；用四探针算薄层电阻；用 Cpk 和控制图判断工艺是否稳定；区分 WAT 与 CP。',
      'Explain what WAT is for and where it sits; name what TEG structures do and typical parameters; compute sheet resistance with a four-point probe; use Cpk and a control chart; tell WAT from CP.',
    ),
  },
  mfgCp: {
    title: loc('CP 晶圆测试与良率管理', 'CP wafer sort and yield management'),
    goal: loc(
      '说出 CP 的流程与产出；理解 Prober、Probe Card、touchdown；解释多 die 并行在圆片上的效率；读晶圆图图样；估算测试时间。',
      'Name the CP flow and what it produces; relate the prober, probe card and touchdowns; explain multi-die efficiency on a round wafer; read wafer-map patterns; estimate test time.',
    ),
  },
  mfgHw: {
    title: loc('测试硬件的设计与制造：Probe Card、DIB、Socket', 'Test hardware: probe card, DIB and socket'),
    goal: loc(
      '区分探针卡与 DIB+Socket；列出设计要素；估算 Socket 带宽和每次插拔成本；估算最大 Site 数；解释这些硬件的 NRE 与交期。',
      'Tell a probe card from a DIB plus socket; list the design items; estimate socket bandwidth and cost per insertion; estimate the maximum site count; explain hardware NRE and lead time.',
    ),
  },
  mfgSubstrate: {
    title: loc('封装基板基础与设计', 'Package substrate basics and design'),
    goal: loc(
      '说明基板如何把芯片节距扇出到板级；区分引线框架、有机积层和陶瓷；描述 core + 积层与过孔类型；估算微带阻抗和逃逸布线容量。',
      'Explain how a substrate fans chip pitch out to board pitch; tell lead-frame, organic build-up and ceramic apart; describe core plus build-up and via types; estimate microstrip impedance and escape capacity.',
    ),
  },
  mfgSubFab: {
    title: loc('封装基板制造工艺', 'Package substrate manufacturing'),
    goal: loc(
      '复述基板制造主步骤；区分减成法与半加成法；计算多层累计良率和面板利用率；说明表面处理的作用。',
      'Recite the main substrate process steps; tell subtractive from semi-additive; compute stacked-layer yield and panel utilization; explain what a surface finish does.',
    ),
  },
  mfgFlying: {
    title: loc('基板测试：飞针测试与治具测试', 'Substrate test: flying probe and fixture'),
    goal: loc(
      '说出开路、短路、绝缘的目标；区分飞针与治具；解释全对绝缘的组合爆炸；估算飞针时间和治具盈亏平衡产量。',
      'Name the goals of open, short and isolation tests; tell flying probe from a fixture; explain the all-pairs isolation explosion; estimate flying-probe time and fixture break-even volume.',
    ),
  },
  mfgAssembly: {
    title: loc('封装组装与成品测试流程', 'Assembly and final-test flow'),
    goal: loc(
      '复述组装主步骤；区分引线键合与倒装；说出 FT、老化、SLT、出货检验的位置；计算组装累计良率与坏 die 被封装的损失。',
      'Recite the main assembly steps; tell wire-bond from flip-chip; place FT, burn-in, SLT and outgoing inspection; compute assembly yield and the cost of packaging a bad die.',
    ),
  },
  mfgRamp: {
    title: loc('综合：良率模型、SPC 与量产爬坡', 'Capstone: yield models, SPC and the production ramp'),
    goal: loc(
      '比较 Poisson、Murphy、负二项模型；区分线、CP、组装、FT 与总良率；用缺陷密度学习曲线预测爬坡；用 SPC 监控；综合 NRE 与产量估算盈亏平衡。',
      'Compare Poisson, Murphy and negative-binomial models; tell line, CP, assembly, FT and total yield apart; predict ramp yield from a D0 learning curve; watch SPC; combine NRE and volume for break-even.',
    ),
  },
}
