import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

export const APK_LESSONS = [
  'apkOverview',
  'apkBond',
  'apkTsv',
  'apkHbm',
  'apkInterposer',
  'apkStack',
  'apkD2d',
  'apkThermal',
  'apkFlow',
] as const

export type ApkLessonId = (typeof APK_LESSONS)[number]

export const APK_META: Record<ApkLessonId, LessonMeta> = {
  apkOverview: {
    title: loc('先进封装概述：为什么需要 chiplet 与异构集成', 'Advanced packaging: why chiplets and heterogeneous integration'),
    goal: loc(
      '说出先进封装的动因；区分 2D / 2.5D / 3D 与扇出、SiP；解释 chiplet 如何改善良率与成本；认识 die、中介层、凸点、RDL、TSV。',
      'Name why advanced packaging appeared; tell 2D, 2.5D, 3D, fan-out and SiP apart; explain how chiplets improve yield and cost; know die, interposer, bump, RDL and TSV.',
    ),
  },
  apkBond: {
    title: loc('封装互连基础：从引线键合到混合键合', 'Package interconnect: from wire bond to hybrid bonding'),
    goal: loc(
      '说出引线键合、C4、微凸点、混合键合的差异；计算给定节距的互连密度；估算每比特能耗；解释节距缩小对带宽、功耗和测试接触的影响。',
      'Tell wire bond, C4, micro-bump and hybrid bonding apart; compute interconnect density from pitch; estimate energy per bit; explain how a finer pitch hits bandwidth, power and probe access.',
    ),
  },
  apkTsv: {
    title: loc('TSV 与晶圆减薄', 'TSVs and wafer thinning'),
    goal: loc(
      '描述 TSV 结构和主要工艺；计算电阻与电容；解释应力与禁布区；列出典型缺陷和对应的电学测试。',
      'Describe TSV structure and the main process; compute resistance and capacitance; explain stress and the keep-out zone; list typical defects and the electrical tests that catch them.',
    ),
  },
  apkHbm: {
    title: loc('HBM：堆叠 DRAM 的结构、接口与带宽', 'HBM: stacked DRAM structure, interface and bandwidth'),
    goal: loc(
      '描述 HBM 堆栈；计算容量与带宽；比较 HBM 与 DDR；解释为何需要 2.5D 中介层；概述测试访问与修复思路。',
      'Describe an HBM stack; compute capacity and bandwidth; compare HBM with DDR; explain why a 2.5D interposer is needed; outline test access and repair.',
    ),
  },
  apkInterposer: {
    title: loc('2.5D 集成：中介层与 CoWoS 类结构', '2.5D integration: interposers and CoWoS-class structures'),
    goal: loc(
      '说明中介层的作用；区分硅中介层、RDL 中介层和局部硅桥；复述 chip-on-wafer 再上基板的顺序；估算版图面积与走线延时。',
      'Explain what an interposer does; tell silicon, RDL and local-silicon-bridge interposers apart; recite chip-on-wafer then on-substrate; estimate floorplan area and trace delay.',
    ),
  },
  apkStack: {
    title: loc('3D 集成：堆叠、混合键合与良率连乘', '3D integration: stacking, hybrid bonding and yield product'),
    goal: loc(
      '区分 W2W 与 D2W；计算堆叠良率；解释 KGD 如何提高 D2W 良率；理解混合键合对节距和热的影响；计算覆盖率不足造成的漏检。',
      'Tell W2W from D2W; compute stack yield; explain how KGD raises D2W yield; see how hybrid bonding hits pitch and heat; compute escapes from incomplete coverage.',
    ),
  },
  apkD2d: {
    title: loc('Chiplet 与 Die-to-Die 互连', 'Chiplets and die-to-die interconnect'),
    goal: loc(
      '解释 D2D 与片内互连、长距离 SerDes 的位置；计算岸线带宽密度；估算 D2D 能耗；说明链路训练、环回与 BER；认识开放 D2D 规范为何重要。',
      'Place D2D against on-die wires and long-reach SerDes; compute shoreline bandwidth density; estimate D2D energy; explain training, loopback and BER; see why an open D2D spec matters.',
    ),
  },
  apkThermal: {
    title: loc('热、机械与可靠性', 'Thermal, mechanical and reliability'),
    goal: loc(
      '用一维热阻网络估算结温；判断哪一层热阻占主导；解释 CTE 失配与翘曲；估算微凸点电流密度；列出封装级可靠性试验。',
      'Estimate junction temperature with a 1-D thermal network; see which layer dominates Rth; explain CTE mismatch and warpage; estimate micro-bump current density; list package-level reliability tests.',
    ),
  },
  apkFlow: {
    title: loc('综合：先进封装测试——KGD/KGS、DFT 与流程成本', 'Capstone: advanced-package test — KGD/KGS, DFT and flow cost'),
    goal: loc(
      '画出 2.5D/3D 的测试插入点；解释 KGD 与 KGS；说明探测难点与 DFT 对策；在测试成本与报废成本之间取舍。',
      'Draw the 2.5D/3D test insertions; tell KGD from KGS; explain probe limits and DFT answers; trade test cost against scrap cost.',
    ),
  },
}
