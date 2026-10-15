import { loc, type LText } from '../../../i18n/locale'
import { type LineId } from './pcbToolsQuoteModel'

export const QS = {
  params: loc('下单参数', 'Order parameters'),
  lines: loc('报价单', 'Quote'),
  colLine: loc('项目', 'Line item'),
  colAmount: loc('金额', 'Amount'),
  colDelta: loc('比示例', 'vs sample'),
  formula: loc('这一行怎么算：', 'How this line is computed: '),
  drivers: loc('哪些参数会改它：', 'Which parameters change it: '),
  pcsNote: loc('实际交付', 'Delivered'),
  pcs: loc('片', 'pcs'),
  sample: loc('回到示例', 'Back to sample'),
  illus: loc('示意', 'Illustrative'),
  usd: 'USD',
  kg: 'kg',
  cm2: 'cm2',
  area: loc('计费面积', 'Billed area'),
  sizeW: loc('板宽', 'Board width'),
  sizeH: loc('板高', 'Board height'),
  lblLayers: loc('层数', 'Layers'),
  lblThick: loc('板厚', 'Thickness'),
  lblCopper: loc('铜厚', 'Copper'),
  lblFinish: loc('表面处理', 'Finish'),
  lblMask: loc('阻焊颜色', 'Mask colour'),
  lblQty: loc('数量', 'Quantity'),
  lblTrack: loc('最小线宽 / 线距', 'Min track / space'),
  lblHole: loc('最小孔径', 'Min hole'),
  lblImp: loc('阻抗控制', 'Impedance control'),
  lblPanel: loc('拼板', 'Panel'),
  lblSpeed: loc('生产速度', 'Build speed'),
  lblShip: loc('运输', 'Shipping'),
  no: loc('否', 'No'),
  yes: loc('是', 'Yes'),
  single: loc('单片', 'Single'),
  array: loc('2×2 拼板', '2×2 array'),
  green: loc('绿', 'Green'),
  black: loc('黑', 'Black'),
  white: loc('白', 'White'),
  hasl: loc('无铅喷锡', 'HASL (lead-free)'),
  osp: 'OSP',
  enig: 'ENIG',
  std: loc('标准', 'Standard'),
  fast: loc('加急', 'Fast'),
  rush: loc('特急', 'Rush'),
  express: loc('快递', 'Express'),
  deltaZero: loc('和示例一样', 'Same as sample'),
  changed: loc('变化最大的是', 'Biggest change: '),
  nothing: loc('参数和示例一致，所有行都没变。', 'The parameters equal the sample, so no line has changed.'),
}

export type LineInfo = { id: LineId; title: LText; what: LText; why: LText; drivers: LText }

export const LINE_INFO: LineInfo[] = [
  {
    id: 'eng',
    title: loc('工程费 Engineering fee', 'Engineering fee'),
    what: loc(
      '工厂工程师审核你的 Gerber、做 CAM（把文件转成生产数据）的一次性费用，不管你做 5 片还是 500 片都只收一次。',
      'A one-time fee for the fab’s engineers to review your Gerbers and run CAM (turning files into production data); it is charged once whether you build 5 boards or 500.',
    ),
    why: loc(
      '层数越多、规格越细、要做阻抗，CAM 要检查和计算的东西越多，所以这一行会涨；数量变化不会影响它。',
      'More layers, finer specs or impedance control mean more to check and calculate in CAM, so this line grows; changing quantity does not move it.',
    ),
    drivers: loc('层数、最小线宽线距、最小孔径、阻抗控制', 'Layers, min track / space, min hole, impedance control'),
  },
  {
    id: 'board',
    title: loc('板费 Board cost', 'Board cost'),
    what: loc(
      '板子本身的钱，按计费面积乘单价，再乘各种系数。拼板时按整个阵列（含工艺边）的面积计费，所以拼板的单片面积比单片交付大。',
      'The cost of the boards themselves: billed area times a rate, times several factors. With a panel, the whole array (rails included) is billed, so each board’s area is larger than when delivered singly.',
    ),
    why: loc(
      '面积、层数、板厚、铜厚、更细的线宽或孔径都会抬高单价；数量大了有批量折扣，所以每片更便宜，但总价仍会上涨。',
      'Area, layers, thickness, copper and finer track or hole tiers all raise the rate; larger quantity earns a volume discount so each board is cheaper, though the total still rises.',
    ),
    drivers: loc('尺寸、层数、板厚、铜厚、线宽线距、孔径、数量、拼板', 'Size, layers, thickness, copper, track / space, hole, quantity, panel'),
  },
  {
    id: 'tool',
    title: loc('工具费 Tooling', 'Tooling'),
    what: loc(
      '一次性的生产准备：每一层要做一张底片或曝光数据，钻孔要编程；拼板还要加一道 V 割的加工程序。',
      'One-time production preparation: each layer needs its film or exposure data and the drilling needs a program; a panel adds a V-cut program.',
    ),
    why: loc(
      '层数越多要准备的图形越多，所以更贵；换成拼板多一道成型工序，也多一点钱。和数量无关。',
      'More layers mean more images to prepare, so it costs more; a panel adds a routing step and a little more money. Quantity does not matter.',
    ),
    drivers: loc('层数、拼板', 'Layers, panel'),
  },
  {
    id: 'etest',
    title: loc('电测费 E-test', 'E-test'),
    what: loc(
      '用飞针或夹具逐片检查开路和短路，每片都要测，这是工厂出货前最后一道电气检查。',
      'Every board is checked for opens and shorts with flying probes or a fixture, the fab’s last electrical check before shipping.',
    ),
    why: loc(
      '按片数收费，层数越多网络越多、测得越久，所以数量和层数都会让它变大。',
      'It is charged per board, and more layers mean more nets to probe, so both quantity and layer count raise it.',
    ),
    drivers: loc('数量、层数、拼板（决定交付片数）', 'Quantity, layers, panel (sets the delivered count)'),
  },
  {
    id: 'finish',
    title: loc('表面处理与特殊阻焊加价', 'Finish and special-mask surcharge'),
    what: loc(
      '选 ENIG 要多沉一层镍和金，所以按面积加价；非绿色的阻焊油墨是固定加价。喷锡和 OSP 在这个示意模型里不加价。',
      'ENIG adds a nickel and gold layer, so it is surcharged by area; a non-green solder-mask ink is a flat surcharge. HASL and OSP add nothing in this illustrative model.',
    ),
    why: loc(
      '只有改了表面处理或阻焊颜色，这一行才不是 0；板越大，ENIG 加价越多。',
      'This line is non-zero only if you change the finish or the mask colour; the larger the board, the bigger the ENIG surcharge.',
    ),
    drivers: loc('表面处理、阻焊颜色、尺寸、数量、拼板', 'Finish, mask colour, size, quantity, panel'),
  },
  {
    id: 'expedite',
    title: loc('加急费 Expedite', 'Expedite'),
    what: loc(
      '要求更快交货时，工厂插队生产要收的费用，按板费的比例算。',
      'The fee for jumping the queue when you want faster delivery, calculated as a share of the board cost.',
    ),
    why: loc(
      '标准速度时是 0；越急比例越高，而且板费越大，加急费绝对值越大。',
      'It is zero at standard speed; the faster you ask, the higher the share, and the bigger the board cost, the bigger the fee in absolute terms.',
    ),
    drivers: loc('生产速度、板费（受尺寸、层数、数量影响）', 'Build speed, board cost (itself driven by size, layers, quantity)'),
  },
  {
    id: 'ship',
    title: loc('运费 Shipping', 'Shipping'),
    what: loc(
      '按重量计的运费：板子重量加包装重量。FR-4 的密度约 1.85 g/cm³，所以板越大越厚、数量越多越重。',
      'Charged by weight: the boards plus packaging. FR-4 has a density of about 1.85 g/cm³, so a larger, thicker or bigger order weighs more.',
    ),
    why: loc(
      '小板的重量大部分是包装，所以数量从 5 变到 50 运费涨得不多；换成快递是基础价和每公斤价都更高。',
      'For small boards most of the weight is packaging, so going from 5 to 50 pieces barely moves shipping; express raises both the base price and the price per kilogram.',
    ),
    drivers: loc('运输方式、尺寸、板厚、数量、拼板', 'Shipping method, size, thickness, quantity, panel'),
  },
]
