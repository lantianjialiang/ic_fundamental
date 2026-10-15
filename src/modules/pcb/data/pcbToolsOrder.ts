import { loc, type LText } from '../../../i18n/locale'

export const OS = {
  kickerOrder: loc('下单', 'Ordering'),
  stepsTitle: loc('下单的顺序', 'The order of steps'),
  paramsTitle: loc('每个参数怎么选', 'How to pick each parameter'),
  colStep: loc('步骤', 'Step'),
  reasonCol: loc('为什么', 'Why'),
  paramCap: loc(
    '典型选择，针对一块小的双层打样板。具体能选什么、各档怎么收费，以板厂下单页为准。',
    'Typical choices for a small two-layer prototype. What you can pick and how each option is charged is decided by the fab’s order page.',
  ),
}

export const ORDER_STEPS: LText[] = [
  loc(
    '用 OutJob 重新生成 Gerber 和钻孔，打成一个 zip。重新生成是为了保证文件是最新版本，不是上次手动出的旧文件。',
    'Regenerate the Gerber and drill files from the OutJob and zip them. Regenerating makes sure the files are the latest, not an old manual export.',
  ),
  loc(
    '把 zip 上传到板厂的下单页。系统会读出层数、板子尺寸和孔数，并画出各层预览。',
    'Upload the zip to the fab’s order page. The system reads layer count, board size and hole count and draws a preview of each layer.',
  ),
  loc(
    '看预览：板框完整、丝印没有镜像、钻孔和焊盘对得上。预览是你最后一次自己发现错误的机会，之后改动都要重新排队。',
    'Check the preview: the outline is complete, text is not mirrored, drills line up with pads. This is your last chance to catch a mistake yourself; any change afterwards restarts the queue.',
  ),
  loc(
    '选参数（见下表）：没有特殊需求就选默认，每个非默认选项都会在报价单上多出一行或让某一行变贵。',
    'Pick the parameters (table below): take the default unless you have a need, because every non-default option adds a quote line or raises one.',
  ),
  loc(
    '读报价单，确认交期和运费，下单付款。工厂的工程师会做 CAM 审核，有疑问会发邮件问你（称为 EQ），回复慢就会拖交期。',
    'Read the quote, check lead time and shipping, then pay. The fab’s engineers run a CAM review and email questions (called EQs); a slow reply delays delivery.',
  ),
  loc(
    '工厂生产、电测、发货。收货后先目测、量一下板厚和尺寸，再开始贴片或焊接。',
    'The fab builds, electrically tests and ships. On arrival, inspect by eye and check thickness and size before assembly or soldering.',
  ),
]

export type Param = { id: string; name: LText; usual: LText; change: LText }

export const PARAMS: Param[] = [
  {
    id: 'layers',
    name: loc('层数', 'Layers'),
    usual: loc('2 层', '2 layers'),
    change: loc('走线布不通、需要完整地平面或高速信号时改 4 层；层数多一层，铜、压合和测试都更贵。', 'Go to 4 layers when routing will not fit, or a solid ground plane or fast signals are needed; each extra layer adds copper, lamination and test cost.'),
  },
  {
    id: 'thick',
    name: loc('板厚', 'Thickness'),
    usual: loc('1.6 mm', '1.6 mm'),
    change: loc('1.6 mm 是最通用的厚度，库存和夹具都现成；插进 USB 或卡槽的金手指板才需要改成接口规定的厚度。', '1.6 mm is the most common thickness, with stock and fixtures ready; only an edge connector or a slot-in board needs the thickness the connector specifies.'),
  },
  {
    id: 'copper',
    name: loc('铜厚', 'Copper weight'),
    usual: loc('1 oz', '1 oz'),
    change: loc('1 oz 约 35 微米厚。电流大到要加宽走线也不够用时才用 2 oz，但 2 oz 的最小线宽线距会变大。', '1 oz is about 35 micrometres thick. Use 2 oz only when widening traces is not enough for the current, but 2 oz also raises the minimum trace and space.'),
  },
  {
    id: 'finish',
    name: loc('表面处理', 'Surface finish'),
    usual: loc('无铅喷锡（HASL）', 'Lead-free HASL'),
    change: loc('细脚距 QFN、BGA 要平整的焊盘，选 ENIG（镍加薄金）；ENIG 要多收费，喷锡表面不够平。', 'Fine-pitch QFN and BGA need flat pads, so choose ENIG (nickel plus thin gold); ENIG costs more, and HASL is not flat enough.'),
  },
  {
    id: 'mask',
    name: loc('阻焊颜色', 'Mask colour'),
    usual: loc('绿色', 'Green'),
    change: loc('绿色最常用、最便宜、工厂检查最方便；黑色、白色只有外观需求时才选，有的厂会加价或延长交期。', 'Green is the most common, cheapest and easiest for the fab to inspect; pick black or white only for looks, as some fabs charge more or take longer.'),
  },
  {
    id: 'qty',
    name: loc('数量', 'Quantity'),
    usual: loc('5 片', '5 pieces'),
    change: loc('一次性费用（工程费、工具费）不随数量变，所以数量大了每片更便宜。打样先做 5 到 10 片，留备份。', 'One-time fees (engineering, tooling) do not scale with quantity, so each board gets cheaper as quantity grows. For prototypes order 5 to 10 and keep spares.'),
  },
  {
    id: 'track',
    name: loc('最小线宽 / 线距', 'Min track / space'),
    usual: loc('0.15 mm（6 mil）', '0.15 mm (6 mil)'),
    change: loc('设计里最细的线和最小间隙要不小于这一档。选更细的档（如 0.1 mm）要加价、良率更低，所以尽量用设计避开。', 'The finest trace and smallest gap in the design must not be below this tier. A finer tier (for example 0.1 mm) costs more and lowers yield, so avoid it by design.'),
  },
  {
    id: 'hole',
    name: loc('最小孔径', 'Min hole'),
    usual: loc('0.3 mm', '0.3 mm'),
    change: loc('设计里最小的钻孔不得小于这一档。更小的孔要用更细的钻头，容易断，工厂会加价。', 'The smallest drilled hole in the design must not be below this tier. Smaller holes need finer drill bits, which break easily, so fabs charge extra.'),
  },
  {
    id: 'imp',
    name: loc('阻抗控制', 'Impedance control'),
    usual: loc('不需要', 'Not needed'),
    change: loc('USB 2.0 全速以下的小板通常不用。差分对要求 90 欧姆、或者射频线要 50 欧姆时才选，工厂会按叠层调线宽，并多收工程费和测试费（概念见 {@pcbBasics}）。', 'Small boards at USB 2.0 full speed or below usually do not need it. Choose it when a differential pair needs 90 ohms or an RF line 50 ohms; the fab adjusts trace width from the stack-up and adds engineering and test fees (concept in {@pcbBasics}).'),
  },
  {
    id: 'panel',
    name: loc('拼板', 'Panel'),
    usual: loc('单片交付', 'Single pieces'),
    change: loc('小板要上贴片线时拼成阵列，加工艺边和 V 割，机器才夹得住；纯手工焊接的打样不用拼。', 'Small boards going through a pick-and-place line are arrayed with rails and V-cuts so the machine can hold them; hand-soldered prototypes need no panel.'),
  },
]
