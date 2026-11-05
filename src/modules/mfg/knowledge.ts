import { loc } from '../../i18n/locale'
import { type AnaKnowledge } from '../ana/knowledge/types'
import { type ModuleId } from '../catalog'

function k(
  _lesson: ModuleId,
  terms: AnaKnowledge['terms'],
  extraLessons: AnaKnowledge['extraLessons'],
  faqs: AnaKnowledge['faqs'],
): AnaKnowledge {
  return { terms, extraLessons, faqs }
}

export const MFG_KNOWLEDGE: AnaKnowledge[] = [
  k(
    'mfgOverview',
    [
      { id: 'mfg-fabless', term: 'Fabless', name: loc('无晶圆厂', 'Fabless'), def: loc('做设计和测试程序，把晶圆和封装外包，为良率买单。见 {@mfgOverview}。', 'Owns design and the test program, outsources wafers and assembly, and pays for yield. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
      { id: 'mfg-foundry', term: 'Foundry', name: loc('晶圆代工厂', 'Foundry'), def: loc('按合同做晶圆和 WAT，对工艺参数负责。见 {@mfgOverview}。', 'Makes wafers and WAT to a contract and owns process parameters. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
      { id: 'mfg-osat', term: 'OSAT', name: loc('封测代工厂', 'OSAT'), def: loc('封装、组装和成品测试。基板和 FT 常在这里。见 {@mfgOverview}。', 'Packages, assembles and final-tests. Substrates and FT often live here. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
      { id: 'mfg-idm', term: 'IDM', name: loc('整合元件制造商', 'IDM'), def: loc('自己做设计、晶圆和封装的整合制造商。见 {@mfgOverview}。', 'An integrated maker that designs, fabs and packages itself. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
      { id: 'mfg-tapeout', term: 'Tape-out', name: loc('流片', 'Tape-out'), def: loc('把设计数据交给光罩/晶圆厂的时间点。之后改设计就要重新流片。见 {@mfgNre}。', 'The moment design data is released to mask / wafer manufacturing. A later change is a respin. See {@mfgNre}.'), lessons: ['mfgOverview', 'mfgNre'] },
      { id: 'mfg-lot', term: 'Lot / wafer / die', name: loc('批次 / 晶圆 / 裸片', 'Lot / wafer / die'), def: loc('一个 lot 含若干片晶圆，一片晶圆上有许多 die。见 {@mfgOverview}。', 'A lot holds wafers; a wafer holds many dies. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
    ],
    { cp: ['mfgOverview', 'mfgCp'], ft: ['mfgOverview', 'mfgAssembly'], stdf: ['mfgOverview'] },
    [
      { id: 'mfg-ov-test-end', q: loc('测试是不是只在最后做一次？', 'Is test done only once, at the end?'), a: loc('不是。WAT、CP、基板、FT、老化都是插入点，越晚发现已经花掉的成本越多。见 {@mfgOverview}。', 'No. WAT, CP, substrate, FT and burn-in are insertions; the later a defect is found, the more cost is already sunk. See {@mfgOverview}.'), lessons: ['mfgOverview'] },
      { id: 'mfg-ov-package-small', q: loc('封装是最后一步小事吗？', 'Is packaging a small last step?'), a: loc('不是。基板往往与晶圆并行，自己有飞针、AOI 和组装良率。见 {@mfgOverview}、{@mfgSubstrate}。', 'No. Substrates often run in parallel with wafers and have their own flying probe, AOI and assembly yield. See {@mfgOverview}, {@mfgSubstrate}.'), lessons: ['mfgOverview'] },
    ],
  ),
  k(
    'mfgFab',
    [
      { id: 'mfg-feol', term: 'FEOL / BEOL', name: loc('前道 / 后道（晶圆制造段）', 'Front-end / back-end of line'), def: loc('FEOL 在硅里做晶体管，BEOL 做多层金属互连。见 {@mfgFab}。', 'FEOL builds transistors in silicon; BEOL builds the metal stack. See {@mfgFab}.'), lessons: ['mfgFab'] },
      { id: 'mfg-litho', term: 'Photolithography / Etch / Deposition / CMP', name: loc('光刻 / 刻蚀 / 沉积 / 化学机械抛光', 'Photolithography / etch / deposition / CMP'), def: loc('单层循环的四个主步骤。几乎每一层都要光刻一次。见 {@mfgFab}。', 'The four main steps of a layer loop. Lithography happens on almost every layer. See {@mfgFab}.'), lessons: ['mfgFab'] },
      { id: 'mfg-dpw', term: 'Dies per wafer', name: loc('每片 die 数', 'Dies per wafer'), def: loc('DPW≈π(d/2)²/A−πd/√(2A)，划片道算进 A。见 {@mfgFab}。', 'DPW≈π(d/2)²/A−πd/√(2A); the scribe is part of A. See {@mfgFab}.'), lessons: ['mfgFab'] },
    ],
    { yield: ['mfgFab'] },
    [
      { id: 'mfg-fab-area', q: loc('die 越大成本为什么不是线性涨？', 'Why is a larger die not a linear cost?'), a: loc('每片颗数更少，同时 Y=exp(−D0·A) 随面积下降，好 die 掉得更快。见 {@mfgFab}。', 'You get fewer dies per wafer, and Y=exp(−D0·A) falls with area, so good dies drop faster. See {@mfgFab}.'), lessons: ['mfgFab'] },
    ],
  ),
  k(
    'mfgNre',
    [
      { id: 'mfg-nre', term: 'Non-recurring engineering (NRE)', name: loc('一次性工程费用', 'Non-recurring engineering (NRE)'), def: loc('光罩、IP、EDA、工程晶圆、基板、测试程序和硬件、认证。单颗 = NRE/产量 + 可变成本。见 {@mfgNre}。', 'Masks, IP, EDA, engineering wafers, substrates, the test program and hardware, qualification. Unit = NRE/volume + variable. See {@mfgNre}.'), lessons: ['mfgNre'] },
      { id: 'mfg-mpw', term: 'Multi-project wafer (MPW) / Shuttle', name: loc('多项目晶圆 / 班车', 'Multi-project wafer (MPW) / Shuttle'), def: loc('多个项目共享一套光罩，按面积分摊。适合工程样片。见 {@mfgNre}。', 'Several projects share one mask set and split the cost by area. Fine for engineering samples. See {@mfgNre}.'), lessons: ['mfgNre'] },
      { id: 'mfg-mask', term: 'Mask / Reticle', name: loc('光罩 / 掩模版', 'Mask / reticle'), def: loc('把图形转到晶圆上的模板。先进节点往往是最大的 NRE。见 {@mfgNre}。', 'The template that prints patterns onto the wafer. Often the largest NRE piece at an advanced node. See {@mfgNre}.'), lessons: ['mfgNre'] },
    ],
    {},
    [
      { id: 'mfg-nre-hw', q: loc('测试硬件算不算 NRE？', 'Is test hardware NRE?'), a: loc('算。程序、探针卡、DIB、Socket、治具都要在产量上摊销。见 {@mfgNre}、{@mfgHw}。', 'Yes. The program, probe card, DIB, socket and fixtures amortize over volume. See {@mfgNre}, {@mfgHw}.'), lessons: ['mfgNre'] },
    ],
  ),
  k(
    'mfgWat',
    [
      { id: 'mfg-wat', term: 'Wafer Acceptance Test (WAT) / PCM', name: loc('晶圆验收测试 / 工艺控制监测', 'Wafer acceptance test (WAT) / PCM'), def: loc('在 CP 之前测划片道测试键，判断工艺是否合格，不测产品电路。见 {@mfgWat}。', 'Measures scribe-lane TEG before CP to judge the process, not the product circuit. See {@mfgWat}.'), lessons: ['mfgWat'] },
      { id: 'mfg-teg', term: 'Test element group (TEG) / Scribe lane', name: loc('测试键 / 划片道', 'Test element group (TEG) / scribe lane'), def: loc('放在划片道上的工艺结构，切割时被锯掉。见 {@mfgWat}。', 'Process structures in the scribe, sawn away at dicing. See {@mfgWat}.'), lessons: ['mfgWat'] },
      { id: 'mfg-rs', term: 'Sheet resistance / Four-point probe', name: loc('薄层电阻 / 四探针', 'Sheet resistance / four-point probe'), def: loc('Rs=(π/ln2)·V/I≈4.532·V/I。见 {@mfgWat}。', 'Rs=(π/ln2)·V/I≈4.532·V/I. See {@mfgWat}.'), lessons: ['mfgWat'] },
    ],
    {},
    [
      { id: 'mfg-wat-vs-cp', q: loc('WAT 通过是不是每颗 die 都好？', 'Does a WAT pass mean every die is good?'), a: loc('不是。WAT 抽样工艺，CP 才测每颗电路。见 {@mfgWat}、{@mfgCp}。', 'No. WAT samples the process; CP tests every circuit. See {@mfgWat}, {@mfgCp}.'), lessons: ['mfgWat'] },
    ],
  ),
  k(
    'mfgCp',
    [
      { id: 'mfg-touchdown', term: 'Touchdown', name: loc('触点次数', 'Touchdown'), def: loc('探针卡扎下去测一组 site 的一次接触。T=touchdowns×T_td+T_load。见 {@mfgCp}。', 'One landing of the probe card on a group of sites. T=touchdowns×T_td+T_load. See {@mfgCp}.'), lessons: ['mfgCp'] },
    ],
    { 'probe-card': ['mfgCp', 'mfgHw'], prober: ['mfgCp'], stdf: ['mfgCp'] },
    [
      { id: 'mfg-cp-nsite', q: loc('N-site 是不是一定快 N 倍？', 'Is N-site always N times faster?'), a: loc('不是。圆形晶圆边缘会有不完整 touchdown，还有共享资源。见 {@mfgCp}、{@genMultisite}。', 'No. A round wafer has partial touchdowns, plus shared resources. See {@mfgCp}, {@genMultisite}.'), lessons: ['mfgCp'] },
    ],
  ),
  k(
    'mfgHw',
    [
      { id: 'mfg-dib', term: 'Device interface board (DIB) / Loadboard', name: loc('器件接口板 / 负载板', 'Device interface board (DIB) / loadboard'), def: loc('成品级转接板：阻抗、去耦、继电器和测试机资源映射。见 {@mfgHw}。', 'The packaged-part board: impedance, decoupling, relays and tester-resource mapping. See {@mfgHw}.'), lessons: ['mfgHw'] },
    ],
    { socket: ['mfgHw'], ate: ['mfgHw'] },
    [
      { id: 'mfg-hw-socket', q: loc('Socket 影响高速信号吗？', 'Does a socket affect high-speed signals?'), a: loc('影响。弹簧针电感限带宽，f=2·Z0/(2πL)。见 {@mfgHw}、{@hsAteLimit}。', 'Yes. Pogo inductance limits bandwidth; f=2·Z0/(2πL). See {@mfgHw}, {@hsAteLimit}.'), lessons: ['mfgHw'] },
    ],
  ),
  k(
    'mfgSubstrate',
    [
      { id: 'mfg-substrate', term: 'Package substrate / Build-up', name: loc('封装基板 / 积层', 'Package substrate / build-up'), def: loc('把芯片节距扇出到板级，core 两侧做积层。见 {@mfgSubstrate}。', 'Fans chip pitch out to board pitch; build-up sits on both sides of the core. See {@mfgSubstrate}.'), lessons: ['mfgSubstrate'] },
      { id: 'mfg-microvia', term: 'Microvia / Plated through hole (PTH)', name: loc('微孔 / 镀通孔', 'Microvia / plated through hole (PTH)'), def: loc('微孔连相邻积层，PTH 打穿 core。见 {@mfgSubstrate}。', 'A microvia joins adjacent build-up; a PTH goes through the core. See {@mfgSubstrate}.'), lessons: ['mfgSubstrate'] },
    ],
    {},
    [
      { id: 'mfg-sub-pcb', q: loc('基板是不是就是小 PCB？', 'Is a substrate just a small PCB?'), a: loc('不是。节距、材料和翘曲要求都更严。见 {@mfgSubstrate}。', 'No. Pitch, materials and warpage are tighter. See {@mfgSubstrate}.'), lessons: ['mfgSubstrate'] },
    ],
  ),
  k(
    'mfgSubFab',
    [
      { id: 'mfg-sap', term: 'Semi-additive process (SAP/mSAP)', name: loc('半加成法 / 改良半加成法', 'Semi-additive process (SAP/mSAP)'), def: loc('细线用化学铜种子 + 图形电镀 + 闪蚀，减成法侧蚀做不到 10 µm。见 {@mfgSubFab}。', 'Fine lines use an electroless seed, pattern plate and flash etch; subtractive undercut cannot hold 10 µm. See {@mfgSubFab}.'), lessons: ['mfgSubFab'] },
      { id: 'mfg-mask-finish', term: 'Solder mask / Surface finish', name: loc('阻焊 / 表面处理', 'Solder mask / surface finish'), def: loc('开窗后做可焊表面。ENIG 等名为概念示例。见 {@mfgSubFab}。', 'Openings then a solderable finish. Names such as ENIG are conceptual examples. See {@mfgSubFab}.'), lessons: ['mfgSubFab'] },
    ],
    {},
    [
      { id: 'mfg-subfab-y', q: loc('基板良率是不是总接近 100%？', 'Is substrate yield always near 100%?'), a: loc('不是。Y=y_layer^n，8 层 0.97 已经只有 0.78。见 {@mfgSubFab}。', 'No. Y=y_layer^n; eight layers at 0.97 already sit at 0.78. See {@mfgSubFab}.'), lessons: ['mfgSubFab'] },
    ],
  ),
  k(
    'mfgFlying',
    [
      { id: 'mfg-fly', term: 'Flying probe test / Fixture test', name: loc('飞针测试 / 治具（针床）测试', 'Flying probe test / fixture test'), def: loc('飞针无治具 NRE、慢；针床快但先付钱。见 {@mfgFlying}。', 'Flying probe has no fixture NRE and is slow; a bed-of-nails is fast after you pay. See {@mfgFlying}.'), lessons: ['mfgFlying'] },
      { id: 'mfg-osi', term: 'Open / Short / Isolation', name: loc('开路 / 短路 / 绝缘', 'Open / short / isolation'), def: loc('同一网要通，不同网要隔开。全对绝缘是 N(N−1)/2。见 {@mfgFlying}。', 'The same net must connect; different nets must stay apart. All-pairs isolation is N(N−1)/2. See {@mfgFlying}.'), lessons: ['mfgFlying'] },
      { id: 'mfg-aoi', term: 'Automated optical inspection (AOI)', name: loc('自动光学检查', 'Automated optical inspection (AOI)'), def: loc('看外形缺陷，不能替代电气开短路。见 {@mfgFlying}。', 'Sees shape defects; it does not replace electrical opens/shorts. See {@mfgFlying}.'), lessons: ['mfgFlying'] },
    ],
    {},
    [
      { id: 'mfg-fly-vs-fix', q: loc('飞针一定比治具好吗？', 'Is flying probe always better than a fixture?'), a: loc('不是。小批量飞针灵活，大批量治具摊销后更便宜。见 {@mfgFlying}、{@mfgNre}。', 'No. Flying probe is flexible at low volume; a fixture wins after amortization. See {@mfgFlying}, {@mfgNre}.'), lessons: ['mfgFlying'] },
    ],
  ),
  k(
    'mfgAssembly',
    [
      { id: 'mfg-attach', term: 'Die attach / Wire bond / Flip chip', name: loc('贴片 / 引线键合 / 倒装', 'Die attach / wire bond / flip chip'), def: loc('组装把 KGD 装上封装。倒装是面阵凸点，键合是周边焊线。见 {@mfgAssembly}。', 'Assembly puts KGD into a package. Flip-chip is an area-array bump; wire-bond is a peripheral wire. See {@mfgAssembly}.'), lessons: ['mfgAssembly'] },
      { id: 'mfg-slt', term: 'System-level test (SLT)', name: loc('系统级测试', 'System-level test (SLT)'), def: loc('用接近应用的板子再跑一遍，抓 ATE 覆盖不到的交互。见 {@mfgAssembly}。', 'A board close to the application, to catch interactions ATE misses. See {@mfgAssembly}.'), lessons: ['mfgAssembly'] },
    ],
    { handler: ['mfgAssembly'], ft: ['mfgAssembly'] },
    [
      { id: 'mfg-asm-ft', q: loc('FT 失败都是封装造成的吗？', 'Are FT fails always assembly?'), a: loc('不是。还有 CP 漏检和应力激发的失效。见 {@mfgAssembly}。', 'No. CP escapes and stress-activated fails also show up. See {@mfgAssembly}.'), lessons: ['mfgAssembly'] },
    ],
  ),
  k(
    'mfgRamp',
    [
      { id: 'mfg-d0', term: 'Yield learning / Defect density', name: loc('良率爬坡 / 缺陷密度', 'Yield learning / defect density'), def: loc('D0(t)=D∞+(D00−D∞)e^{−t/τ}。爬坡期不能用量产 D0。见 {@mfgRamp}。', 'D0(t)=D∞+(D00−D∞)e^{−t/τ}. Early months cannot use the mature D0. See {@mfgRamp}.'), lessons: ['mfgRamp'] },
      { id: 'mfg-spc', term: 'Statistical process control (SPC)', name: loc('统计过程控制', 'Statistical process control (SPC)'), def: loc('用控制图看 WAT/CP/FT 是否漂移，不只看月底平均。见 {@mfgRamp}。', 'Control charts watch whether WAT/CP/FT drift, not only the month-end average. See {@mfgRamp}.'), lessons: ['mfgRamp'] },
    ],
    { yield: ['mfgRamp'], stdf: ['mfgRamp'] },
    [
      { id: 'mfg-ramp-model', q: loc('良率模型越复杂越准吗？', 'Is a more complex yield model always more accurate?'), a: loc('不一定。没有聚集数据时，多参数只是更会拟合噪声。见 {@mfgRamp}。', 'Not necessarily. Extra parameters fit noise if you lack clustering data. See {@mfgRamp}.'), lessons: ['mfgRamp'] },
    ],
  ),
]
