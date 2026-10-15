import { loc, type LText } from '../../../i18n/locale'

export type NodeId = 'eda' | 'files' | 'fab' | 'parts' | 'smt' | 'test' | 'ship'

export type FlowNode = {
  id: NodeId
  short: LText
  tag: LText
  name: LText
  inputs: LText
  outputs: LText
  delays: LText
  design: LText
}

export const NODES: FlowNode[] = [
  {
    id: 'eda',
    short: loc('EDA 设计', 'EDA'),
    tag: loc('原理图 + 布局', 'sch + layout'),
    name: loc('EDA 设计', 'EDA design'),
    inputs: loc('需求、原理图、封装库、叠层设定。', 'Requirements, schematic, footprint library and stack-up settings.'),
    outputs: loc('布好线、DRC 通过的 PCB 工程，以及由它导出的设计文件。', 'A routed, DRC-clean PCB project and the design files exported from it.'),
    delays: loc(
      '封装画错、DRC 没清、评审没过，只能返工；选了缺货或停产的元器件。',
      'Wrong footprints, unresolved DRC or a failed review force rework; parts chosen that are out of stock or discontinued.',
    ),
    design: loc(
      '选料就决定了后面买不买得到：选生命周期为 Active、有第二来源的型号，板子就不会因一颗料卡住，因为买不到的料再好的设计也没用。设计流程见 {@pcbFlow}。',
      'Part choice decides whether the board can be built later: pick Active parts with a second source, because a part you cannot buy makes even a perfect design useless. The design flow is in {@pcbFlow}.',
    ),
  },
  {
    id: 'files',
    short: loc('设计文件', 'Design files'),
    tag: loc('Gerber · BOM', 'Gerber · BOM'),
    name: loc('导出设计文件', 'Design files'),
    inputs: loc('已完成的 EDA 工程。', 'The finished EDA project.'),
    outputs: loc('Gerber、钻孔文件、BOM、坐标文件、装配图，打成一个压缩包。', 'Gerber, drill file, BOM, centroid file and assembly drawing, zipped together.'),
    delays: loc(
      '层文件命名对不上、钻孔与 Gerber 单位不一致、BOM 位号和坐标文件对不上，工厂要发工程问询（EQ）来回确认。',
      'Layer names that do not match, drill and Gerber units that differ, BOM designators that do not match the centroid file: the factory sends engineering queries (EQ) and waits for answers.',
    ),
    design: loc(
      '出图前自查能省掉一两天往返：按 {@pcbDfm} 的清单检查，写清层顺序，BOM 位号与坐标文件逐一对应。',
      'A self-check before release saves a day or two of back-and-forth: run the {@pcbDfm} checklist, state the layer order and make BOM designators match the centroid file one by one.',
    ),
  },
  {
    id: 'fab',
    short: loc('PCB 厂', 'PCB fab'),
    tag: loc('裸板', 'bare board'),
    name: loc('PCB 制造（PCB 厂）', 'PCB fabrication'),
    inputs: loc('Gerber、钻孔文件、叠层与板材、表面处理、数量。', 'Gerber, drill file, stack-up and laminate, surface finish, quantity.'),
    outputs: loc('通过电测的裸板，按拼板交付。', 'Bare boards that passed electrical test, delivered as panels.'),
    delays: loc(
      '特殊板材或厚铜要备料；线宽线距、孔径逼近极限导致良率低；层数多、压合次数多周期长；EQ 没回复。',
      'Special laminate or heavy copper must be sourced; trace/space or drill near the limit lowers yield; more layers and lamination cycles lengthen the cycle; unanswered EQs.',
    ),
    design: loc(
      '层数越多、孔越小、线越细，工序越多、周期越长、良率越低，所以没必要就不要逼近工厂极限。工序见 {@pcbFab}。',
      'More layers, smaller holes and finer traces mean more steps, longer cycles and lower yield, so do not push the fab limits without need. The steps are in {@pcbFab}.',
    ),
  },
  {
    id: 'parts',
    short: loc('元器件采购', 'Parts sourcing'),
    tag: loc('按 BOM 买料', 'buy per BOM'),
    name: loc('元器件采购', 'Parts sourcing'),
    inputs: loc('BOM：型号、数量、封装，以及可接受的替代料。', 'The BOM: part numbers, quantities, packages and acceptable alternates.'),
    outputs: loc('按 BOM 备齐的元器件，卷带、管装或托盘包装，批次可追溯。', 'Parts kitted per the BOM, on reels, tubes or trays, with traceable lots.'),
    delays: loc(
      '交期长的芯片（几周到半年以上）；MOQ 高于用量；停产（EOL）；缺货涨价；从非授权渠道买到假货被来料检验退回。',
      'Long-lead chips (weeks to over six months); MOQ above the quantity needed; EOL; shortages and price spikes; counterfeits from unauthorised channels rejected at incoming inspection.',
    ),
    design: loc(
      '选型时就看交期、生命周期和第二来源，并在 BOM 里写清替代料；封装越冷门、来源越单一，板子越容易卡在这一站。芯片厂与渠道的关系见 {@pIndustry}。',
      'Check lead time, lifecycle and second source at selection and list alternates in the BOM; an unusual package or a single source makes the board stall here. How chip makers relate to channels is in {@pIndustry}.',
    ),
  },
  {
    id: 'smt',
    short: loc('SMT 贴片', 'SMT'),
    tag: loc('贴装焊接', 'assembly'),
    name: loc('SMT 贴片', 'SMT assembly'),
    inputs: loc('裸板、元器件、钢网、坐标文件、装配图。', 'Bare boards, parts, stencil, centroid file and assembly drawing.'),
    outputs: loc('焊好元器件的板子（PCBA），已过光学检查，BGA 已过 X 光。', 'Boards with soldered parts (PCBA), optically inspected, BGAs X-rayed.'),
    delays: loc(
      '缺料等待；潮敏器件开封超时要烘烤；做钢网、编程、换线需要时间；首件不过要调试。',
      'Waiting for missing parts; moisture-sensitive parts out of the bag too long need baking; stencil making, programming and changeover take time; a failed first article needs debugging.',
    ),
    design: loc(
      '拼板、工艺边和 Fiducial 决定机器能不能夹住并认出板子；焊盘与元件间距决定直通率，见 {@pcbDfm}；BGA 一定要留 X 光检查的条件，封装见 {@pPackage}。',
      'Panel, rails and fiducials decide whether the machines can clamp and find the board; pad design and part spacing decide first-pass yield, see {@pcbDfm}; BGAs need X-ray inspection, packages are in {@pPackage}.',
    ),
  },
  {
    id: 'test',
    short: loc('测试', 'Test'),
    tag: loc('ICT · FCT', 'ICT · FCT'),
    name: loc('板级测试', 'Board-level test'),
    inputs: loc('PCBA、测试夹具、测试程序、固件。', 'PCBA, test fixture, test program and firmware.'),
    outputs: loc('通过与否的记录，不良板的故障位置，以及良品板。', 'Pass/fail records, fault locations on rejected boards and good boards.'),
    delays: loc(
      '夹具制作与调试；板上没有测试点，ICT 的针扎不到；固件没准备好，FCT 跑不起来。',
      'Fixture making and debugging; no test points, so ICT pins cannot reach; firmware not ready, so FCT cannot run.',
    ),
    design: loc(
      '设计时留测试点、编程与调试接口、可上电的测试模式，测试就快而且准。板级 ICT / FCT 和芯片级 ATE 的思路相通，设备见 {@fAte}。',
      'Leave test points, a programming/debug port and a testable power-up mode and test is fast and accurate. Board-level ICT/FCT shares its thinking with chip-level ATE; the equipment is in {@fAte}.',
    ),
  },
  {
    id: 'ship',
    short: loc('出货', 'Ship'),
    tag: loc('包装发运', 'pack + ship'),
    name: loc('包装出货', 'Packing and shipping'),
    inputs: loc('良品板、包装材料、订单与标签。', 'Good boards, packing materials, order and labels.'),
    outputs: loc('防静电包装的成品和出货单据。', 'ESD-safe packed product and shipping documents.'),
    delays: loc(
      '返修和复测占时间；客户要求的标签、序列号、追溯信息不齐；运输与清关。',
      'Rework and retest take time; labels, serial numbers or traceability data the customer requires are incomplete; transport and customs.',
    ),
    design: loc(
      '板上留出序列号或二维码的位置；板边不要有会被包装压坏的凸出元件；静电敏感器件必须用防静电包装，否则到客户手里已经坏了。',
      'Leave room for a serial number or QR code; avoid tall parts at the edge that packing can crush; ESD-sensitive parts need ESD-safe packing, otherwise they arrive already damaged.',
    ),
  },
]
