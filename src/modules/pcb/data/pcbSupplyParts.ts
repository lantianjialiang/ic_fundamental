import { loc, type LText } from '../../../i18n/locale'

export type FileId = 'gerber' | 'drill' | 'bom' | 'cpl' | 'asm' | 'odb'

export const FILES: Array<{ id: FileId; title: LText; sub: LText; text: LText; used: LText; trap: LText }> = [
  {
    id: 'gerber',
    title: loc('Gerber', 'Gerber'),
    sub: loc('RS-274X / X2', 'RS-274X / X2'),
    text: loc(
      '每层一个矢量图文件：顶层铜、底层铜、阻焊、丝印、锡膏层、板框。RS-274X 把线宽、焊盘形状的定义直接写进文件；X2 再加上层属性（这是哪一层、哪些是焊盘），工厂软件能自动认层，不用靠文件名猜。',
      'One vector file per layer: top copper, bottom copper, solder mask, silkscreen, paste layer and board outline. RS-274X embeds the aperture (line width, pad shape) definitions; X2 adds layer attributes (which layer, which objects are pads) so the fab software identifies layers itself instead of guessing from file names.',
    ),
    used: loc('PCB 厂用它做线路、阻焊、丝印的图形；SMT 厂用锡膏层开钢网。', 'The PCB fab images traces, mask and legend from it; the SMT shop cuts the stencil from the paste layer.'),
    trap: loc('缺板框层，或少交一个铜层；单位与钻孔文件不一致，孔和焊盘就对不上。', 'A missing outline or copper layer; units that differ from the drill file, so holes no longer line up with pads.'),
  },
  {
    id: 'drill',
    title: loc('钻孔文件', 'Drill file'),
    sub: loc('Excellon', 'Excellon'),
    text: loc(
      '记录每个孔的坐标和孔径，Excellon 是通用格式。镀铜孔（PTH）和不镀铜孔（NPTH）分成两份文件，或在同一份里分开标注；槽孔用铣槽指令单独写。',
      'Records the position and diameter of every hole; Excellon is the common format. Plated (PTH) and non-plated (NPTH) holes go in two files or are clearly separated in one; slots use a separate routing command.',
    ),
    used: loc('PCB 厂的数控钻机直接读取。', 'Read directly by the fab’s CNC drill.'),
    trap: loc('单位（英制还是公制）、坐标省零方式和 Gerber 不一致，孔就整体偏位；孔径要写清是成品孔径还是钻头直径。', 'Units (inch or metric) or zero-suppression that differ from Gerber shift every hole; state whether sizes are finished hole or drill-bit diameters.'),
  },
  {
    id: 'bom',
    title: loc('BOM', 'BOM'),
    sub: loc('物料清单', 'Bill of materials'),
    text: loc(
      '一张表：位号（R1、C3…）、值、封装、数量、厂家料号（MPN）、可接受的替代料。值和封装都相同的位号合并成一行。',
      'A table of designators (R1, C3…), value, package, quantity, manufacturer part number (MPN) and acceptable alternates. Designators with the same value and package share one row.',
    ),
    used: loc('采购按它询价下单，SMT 厂按它备料。', 'Purchasing quotes and orders from it; the SMT shop kits parts from it.'),
    trap: loc('位号对不上坐标文件；只写「10k」不写封装和精度，工厂只能停下来问。', 'Designators that do not match the centroid file; “10k” with no package or tolerance, so the factory has to stop and ask.'),
  },
  {
    id: 'cpl',
    title: loc('坐标文件', 'Pick-and-place'),
    sub: loc('Centroid / CPL', 'Centroid / CPL'),
    text: loc(
      '每个贴片元件一行：位号、X、Y（元件中心）、旋转角度、在顶面还是底面。贴片机靠它知道把料放哪里、转多少度。',
      'One row per placed part: designator, X, Y (part centre), rotation and top or bottom side. The placer uses it to know where to put each part and how far to turn it.',
    ),
    used: loc('SMT 厂用它编贴片程序。', 'The SMT shop builds the placement program from it.'),
    trap: loc(
      '各家 EDA 对「0°」的定义不同，库里封装的画法也不同，所以首件要核对；最常转错的是 IC 的 1 脚方向、二极管和钽电容的极性。',
      'EDA tools define “0°” differently and library footprints are drawn differently, so check the first article; the usual errors are IC pin-1 direction and diode or tantalum polarity.',
    ),
  },
  {
    id: 'asm',
    title: loc('装配图', 'Assembly drawing'),
    sub: loc('位号、极性、DNP', 'Designators, polarity, DNP'),
    text: loc(
      '带位号、极性和 1 脚标记的图，通常还标出不贴件（DNP）的位置、要手工焊的元件和特殊工艺说明。',
      'A drawing with designators, polarity and pin-1 marks, usually also marking do-not-populate (DNP) positions, hand-soldered parts and special process notes.',
    ),
    used: loc('产线和检验员对照：首件检查、AOI 编程、手工补焊。', 'Operators and inspectors use it for first-article checks, AOI programming and hand soldering.'),
    trap: loc('没标 DNP，或版本号和 BOM 不一致，工厂会贴多或贴错。', 'DNP not marked or a revision that differs from the BOM, so parts are placed that should not be, or the wrong ones.'),
  },
  {
    id: 'odb',
    title: loc('ODB++ / IPC-2581', 'ODB++ / IPC-2581'),
    sub: loc('一包到位', 'One-package formats'),
    text: loc(
      'Gerber 只描述图形；ODB++ 和 IPC-2581 把各层图形、钻孔、网表、叠层，甚至元件和 BOM 放进同一个数据包。',
      'Gerber only describes graphics; ODB++ and IPC-2581 put the layer graphics, drills, netlist and stack-up, even parts and BOM, into one data package.',
    ),
    used: loc('制造商导入后能对照网表自动查开路、短路，减少人工对文件。', 'The manufacturer imports it and checks opens and shorts against the netlist automatically, with less manual file matching.'),
    trap: loc('不是所有工厂都收，打样小厂多用 Gerber + 钻孔 + BOM；先问工厂要什么格式。', 'Not every shop accepts them; prototype shops mostly take Gerber + drill + BOM. Ask which format the shop wants first.'),
  },
]

export type ChannelId = 'mfr' | 'dist' | 'broker' | 'bom'

export const CHANNELS: Array<{ id: ChannelId; short: LText; tag: LText; title: LText; text: LText }> = [
  {
    id: 'mfr',
    short: loc('原厂', 'Manufacturer'),
    tag: loc('做芯片和元件', 'makes the parts'),
    title: loc('原厂', 'Manufacturer'),
    text: loc(
      '芯片和元件的制造商（例如 TI、ST、村田）。原厂直接服务大客户，小批量用户通常通过分销商买。原厂发布数据手册，也发停产通知（PCN / EOL）。芯片厂在产业里的位置见 {@pIndustry}。',
      'The maker of chips and components (for example TI, ST, Murata). Manufacturers serve large customers directly; small buyers usually go through distributors. They publish datasheets and discontinuation notices (PCN / EOL). Where chip makers sit in the industry is in {@pIndustry}.',
    ),
  },
  {
    id: 'dist',
    short: loc('授权分销商', 'Authorized distributor'),
    tag: loc('货源可追溯', 'traceable stock'),
    title: loc('授权分销商', 'Authorized distributor'),
    text: loc(
      '获得原厂正式授权的渠道（例如 Digi-Key、Mouser、Arrow）。货直接来自原厂，批次可追溯、有原厂质保、价格透明，所以假货风险最低。缺点是它没货就是没货，交期跟着原厂走。',
      'Channels formally authorised by the manufacturer (for example Digi-Key, Mouser, Arrow). Stock comes straight from the maker, lots are traceable, the maker’s warranty applies and prices are open, so counterfeit risk is lowest. The downside: when it has no stock, you wait on the maker’s lead time.',
    ),
  },
  {
    id: 'broker',
    short: loc('代理商 / 现货商', 'Agents / brokers'),
    tag: loc('缺货时的绕路', 'last resort'),
    title: loc('代理商与独立现货商', 'Agents and independent brokers'),
    text: loc(
      '代理商替原厂在某个地区代售，量大时能争取价格和交期；独立现货商（broker）则从库存、余货或二手市场调货，缺货时它能找到，但来源无法追溯，假货、翻新、受潮的风险最高。从这类渠道买货要做来料检验（外观、X 光、电性测试），并保存采购凭证。',
      'Agents sell on a manufacturer’s behalf in a region and can win price and lead-time support at volume; independent brokers pull stock from inventory, surplus or the used market. A broker can find parts when nobody else can, but the source is untraceable, so counterfeit, refurbished and moisture-damaged risk is highest. Parts from them need incoming inspection (visual, X-ray, electrical test) and saved purchase records.',
    ),
  },
  {
    id: 'bom',
    short: loc('BOM 管理', 'BOM management'),
    tag: loc('你 / 工厂的采购', 'your buying side'),
    title: loc('BOM 管理', 'BOM management'),
    text: loc(
      'BOM 管理就是把「设计要什么」和「买得到什么」对齐：每个位号定下厂家料号、封装、数量，写明允许的替代料，标出生命周期和交期；每次改动都升版本号，让采购、SMT 厂和测试用的是同一版，否则会出现采购买的和产线用的不一样。',
      'BOM management aligns what the design needs with what can be bought: every designator gets an MPN, package and quantity, allowed alternates are listed, lifecycle and lead time are flagged, and every change bumps the revision so purchasing, the SMT shop and test all use the same one; otherwise purchasing buys one thing and the line uses another.',
    ),
  },
]
