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

export const APK_KNOWLEDGE: AnaKnowledge[] = [
  k(
    'apkOverview',
    [
      { id: 'apk-adv', term: 'Advanced packaging', name: loc('先进封装', 'Advanced packaging'), def: loc('用中介层、堆叠、扇出等把多颗 die 集成到一个封装里。见 {@apkOverview}。', 'Integrating several dies in one package with interposers, stacks or fan-out. See {@apkOverview}.'), lessons: ['apkOverview'] },
      { id: 'apk-chiplet', term: 'Chiplet', name: loc('芯粒（小芯片）', 'Chiplet'), def: loc('拆出来单独制造、测试再组装的小 die。前提是能测成 KGD。见 {@apkOverview}。', 'A small die built and tested on its own, then assembled. It only helps if it can be tested as KGD. See {@apkOverview}.'), lessons: ['apkOverview'] },
      { id: 'apk-hetero', term: 'Heterogeneous integration', name: loc('异构集成', 'Heterogeneous integration'), def: loc('把不同工艺/功能的 die 封在一起，例如逻辑 + HBM。见 {@apkOverview}。', 'Packaging dies from different processes or functions, such as logic + HBM. See {@apkOverview}.'), lessons: ['apkOverview'] },
      { id: 'apk-reticle', term: 'Reticle limit', name: loc('光罩极限', 'Reticle limit'), def: loc('单次曝光约 26×33 mm = 858 mm²。再大就要拼接或拆 chiplet。见 {@apkOverview}。', 'One exposure is about 26×33 mm = 858 mm². Larger needs stitching or chiplets. See {@apkOverview}.'), lessons: ['apkOverview'] },
      { id: 'apk-25d', term: '2D / 2.5D / 3D integration', name: loc('2D / 2.5D / 3D 集成', '2D / 2.5D / 3D integration'), def: loc('2D 躺在基板上；2.5D 并排走中介层；3D 竖向堆叠。见 {@apkOverview}。', '2D sits on the substrate; 2.5D is side-by-side on an interposer; 3D stacks vertically. See {@apkOverview}.'), lessons: ['apkOverview'] },
      { id: 'apk-fanout', term: 'Fan-out', name: loc('扇出封装', 'Fan-out'), def: loc('用 RDL 把焊盘重新排到更粗的节距，不必用传统基板层。见 {@apkOverview}。', 'RDL moves pads out to a coarser pitch without a conventional substrate stack. See {@apkOverview}.'), lessons: ['apkOverview'] },
    ],
    {},
    [
      { id: 'apk-ov-cheap', q: loc('chiplet 一定更便宜吗？', 'Are chiplets always cheaper?'), a: loc('不一定。硅上省下的面积，可能被组装、测试和互连吃掉。见 {@apkOverview}。', 'Not always. Silicon saved can be eaten by assembly, test and interconnect. See {@apkOverview}.'), lessons: ['apkOverview'] },
    ],
  ),
  k(
    'apkBond',
    [
      { id: 'apk-bump', term: 'Bump / Micro-bump / C4', name: loc('凸点 / 微凸点 / C4 凸点', 'Bump / micro-bump / C4'), def: loc('C4 上基板，微凸点上中介层或堆叠。见 {@apkBond}。', 'C4 onto the substrate; micro-bumps onto an interposer or stack. See {@apkBond}.'), lessons: ['apkBond'] },
      { id: 'apk-uf', term: 'Underfill', name: loc('底部填充', 'Underfill'), def: loc('灌进凸点缝里，分担 CTE 应力。热导率往往很低。见 {@apkBond}、{@apkThermal}。', 'Fills the bump gap and shares CTE stress. Thermal conductivity is often low. See {@apkBond}, {@apkThermal}.'), lessons: ['apkBond', 'apkThermal'] },
      { id: 'apk-hybrid', term: 'Hybrid bonding', name: loc('混合键合', 'Hybrid bonding'), def: loc('Cu-Cu 直接键合加介质键合，没有焊料，节距可到 10 µm 级。见 {@apkBond}。', 'Cu-Cu plus dielectric bond, no solder; pitch can reach the 10 µm class. See {@apkBond}.'), lessons: ['apkBond'] },
    ],
    {},
    [
      { id: 'apk-bond-finer', q: loc('混合键合是更细的凸点吗？', 'Is hybrid bonding just a finer bump?'), a: loc('不是。没有焊料，是铜对铜加介质键合，对准和清洁度更严。见 {@apkBond}。', 'No. There is no solder; it is copper-to-copper plus a dielectric bond, with tighter alignment and cleanliness. See {@apkBond}.'), lessons: ['apkBond'] },
    ],
  ),
  k(
    'apkTsv',
    [
      { id: 'apk-tsv', term: 'Through-silicon via (TSV)', name: loc('硅通孔', 'Through-silicon via (TSV)'), def: loc('打穿硅的铜孔，电阻通常只有几十毫欧。见 {@apkTsv}。', 'A copper via through silicon; resistance is usually tens of milliohms. See {@apkTsv}.'), lessons: ['apkTsv'] },
      { id: 'apk-koz', term: 'Keep-out zone (KOZ)', name: loc('禁布区', 'Keep-out zone (KOZ)'), def: loc('TSV 周围因应力不能放灵敏晶体管的区域。见 {@apkTsv}。', 'A stressed region around a TSV where sensitive transistors cannot sit. See {@apkTsv}.'), lessons: ['apkTsv'] },
      { id: 'apk-thin', term: 'Wafer thinning / Temporary bonding', name: loc('晶圆减薄 / 临时键合', 'Wafer thinning / temporary bonding'), def: loc('减到数十 µm 需要载片撑着，测完还要解键合。见 {@apkTsv}。', 'Tens of µm need a carrier; the wafer must later debond. See {@apkTsv}.'), lessons: ['apkTsv'] },
      { id: 'apk-daisy', term: 'Daisy chain', name: loc('菊花链', 'Daisy chain'), def: loc('把许多 TSV 串起来测电阻。太长会稀释缺陷，要分段。见 {@apkTsv}。', 'Many TSVs in series for a resistance test. A long chain dilutes a defect; segment it. See {@apkTsv}.'), lessons: ['apkTsv'] },
    ],
    {},
    [
      { id: 'apk-tsv-r', q: loc('TSV 电阻很大吗？', 'Is TSV resistance large?'), a: loc('通常很小。难的是抓空洞和针孔，所以要 Kelvin 和分段链。见 {@apkTsv}。', 'Usually small. The hard part is catching voids and pinholes, so use Kelvin and segmented chains. See {@apkTsv}.'), lessons: ['apkTsv'] },
    ],
  ),
  k(
    'apkHbm',
    [
      { id: 'apk-hbm', term: 'High Bandwidth Memory (HBM)', name: loc('高带宽存储器', 'High Bandwidth Memory (HBM)'), def: loc('多层 DRAM + 基底 die 的堆栈，靠很宽的接口换带宽，焊在中介层上。数值以现行规范为准。见 {@apkHbm}。', 'A stack of DRAM plus a base die that buys bandwidth with a very wide interface and is bonded on an interposer. Follow the current spec. See {@apkHbm}.'), lessons: ['apkHbm'] },
      { id: 'apk-base', term: 'Base die', name: loc('基底（逻辑）die', 'Base (logic) die'), def: loc('HBM 堆栈底部的逻辑/接口 die，测试访问通常从这里进去。见 {@apkHbm}。', 'The logic / interface die at the bottom of an HBM stack; test access usually enters here. See {@apkHbm}.'), lessons: ['apkHbm'] },
    ],
    {},
    [
      { id: 'apk-hbm-ddr', q: loc('HBM 每引脚比 DDR 快吗？', 'Is HBM faster per pin than DDR?'), a: loc('通常更慢，靠 1024 位一类的位宽取胜。以现行规范为准。见 {@apkHbm}。', 'Usually slower per pin; it wins on a width such as 1024 bits. Follow the current spec. See {@apkHbm}.'), lessons: ['apkHbm'] },
    ],
  ),
  k(
    'apkInterposer',
    [
      { id: 'apk-intp', term: 'Interposer', name: loc('中介层', 'Interposer'), def: loc('die 下面的高密度布线载体，可以是硅 + TSV、RDL 或局部硅桥。见 {@apkInterposer}。', 'A dense wiring carrier under the dies: silicon + TSV, RDL or a local silicon bridge. See {@apkInterposer}.'), lessons: ['apkInterposer'] },
      { id: 'apk-rdl', term: 'Redistribution layer (RDL)', name: loc('重布线层', 'Redistribution layer (RDL)'), def: loc('把焊盘重新排到新的节距。扇出和中介层都用。见 {@apkInterposer}。', 'Moves pads to a new pitch. Used in fan-out and interposers. See {@apkInterposer}.'), lessons: ['apkInterposer'] },
    ],
    {},
    [
      { id: 'apk-intp-spacer', q: loc('中介层只是垫片吗？', 'Is an interposer just a spacer?'), a: loc('不是。它承载 GPU 与 HBM 之间的高密度布线。见 {@apkInterposer}。', 'No. It carries the dense GPU–HBM wiring. See {@apkInterposer}.'), lessons: ['apkInterposer'] },
    ],
  ),
  k(
    'apkStack',
    [
      { id: 'apk-w2w', term: 'Wafer-to-wafer (W2W) / Die-to-wafer (D2W)', name: loc('晶圆对晶圆 / 裸片对晶圆', 'Wafer-to-wafer (W2W) / die-to-wafer (D2W)'), def: loc('W2W 整片对整片；D2W 先测 KGD 再贴。见 {@apkStack}。', 'W2W bonds whole wafers; D2W places KGD. See {@apkStack}.'), lessons: ['apkStack'] },
    ],
    {},
    [
      { id: 'apk-kgd-100', q: loc('KGD 就是 100% 好吗？', 'Is KGD 100% good?'), a: loc('不是。它只在测试覆盖率范围内“已知”。见 {@apkStack}、{@apkFlow}。', 'No. It is “known” only inside the test coverage. See {@apkStack}, {@apkFlow}.'), lessons: ['apkStack'] },
    ],
  ),
  k(
    'apkD2d',
    [
      { id: 'apk-d2d', term: 'Die-to-die (D2D) interconnect', name: loc('裸片间互连', 'Die-to-die (D2D) interconnect'), def: loc('毫米级、宽并行、低能耗的 chiplet 互连。见 {@apkD2d}。', 'A millimetre-scale, wide, low-energy chiplet link. See {@apkD2d}.'), lessons: ['apkD2d'] },
      { id: 'apk-shore', term: 'Shoreline bandwidth density', name: loc('岸线带宽密度', 'Shoreline bandwidth density'), def: loc('行数×(1000/节距)×每通道速率。见 {@apkD2d}。', 'Rows × (1000/pitch) × lane rate. See {@apkD2d}.'), lessons: ['apkD2d'] },
    ],
    {},
    [
      { id: 'apk-d2d-board', q: loc('D2D 是不是板级互连？', 'Is D2D a board-level link?'), a: loc('不是。它短、宽、几乎不需要重均衡。板级 SerDes 见 {@hsChannel}。', 'No. It is short, wide and needs almost no heavy EQ. Board-level SerDes: {@hsChannel}.'), lessons: ['apkD2d'] },
    ],
  ),
  k(
    'apkThermal',
    [
      { id: 'apk-warp', term: 'Warpage / CTE mismatch', name: loc('翘曲 / 热膨胀系数失配', 'Warpage / CTE mismatch'), def: loc('不同材料热胀不同，导致翘曲、凸点疲劳和分层。见 {@apkThermal}。', 'Different materials expand differently, causing warpage, bump fatigue and delam. See {@apkThermal}.'), lessons: ['apkThermal'] },
    ],
    {},
    [
      { id: 'apk-th-si', q: loc('硅导热好，堆叠就不怕热吗？', 'Does good silicon conduction make stacks thermally safe?'), a: loc('不怕热是错的。底部填充/键合层热导率低，常常主导 Rth。见 {@apkThermal}。', 'No. Underfill / bond films have low k and often dominate Rth. See {@apkThermal}.'), lessons: ['apkThermal'] },
    ],
  ),
  k(
    'apkFlow',
    [
      { id: 'apk-kgd', term: 'Known good die (KGD) / Known good stack (KGS)', name: loc('已知良好裸片 / 已知良好堆栈', 'Known good die (KGD) / known good stack (KGS)'), def: loc('KGD 是测过的单颗 die；KGS 是测过的已堆堆栈。覆盖率决定“已知”有多真。见 {@apkFlow}。', 'KGD is a tested single die; KGS is a tested stacked stack. Coverage sets how true “known” is. See {@apkFlow}.'), lessons: ['apkFlow'] },
      { id: 'apk-access', term: 'Test access', name: loc('测试访问', 'Test access'), def: loc('细节距和堆叠内层不能直接扎针，要靠测试焊盘、环回和 DFT。见 {@apkFlow}。', 'Fine pitch and inner stack layers cannot be probed; use test pads, loopback and DFT. See {@apkFlow}.'), lessons: ['apkFlow'] },
    ],
    { stdf: ['apkFlow'] },
    [
      { id: 'apk-flow-every', q: loc('每一步都测是不是最安全？', 'Is testing at every step the safest cheap option?'), a: loc('测试成本会堆起来，要和晚发现报废 GPU 的成本比。见 {@apkFlow}。', 'Test cost stacks up and must be compared with scrapping a GPU found late. See {@apkFlow}.'), lessons: ['apkFlow'] },
    ],
  ),
]
