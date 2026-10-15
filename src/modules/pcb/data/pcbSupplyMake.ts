import { loc, type LText } from '../../../i18n/locale'

export type PanelId = 'rail' | 'hole' | 'fid' | 'vscore' | 'bite' | 'util'

export const PANEL_ITEMS: Array<{ id: PanelId; name: LText; text: LText }> = [
  {
    id: 'rail',
    name: loc('工艺边', 'Tooling rails'),
    text: loc(
      '拼板两侧（通常是长边）加的 5–10 mm 空白边。贴片机的导轨夹在这条边上传送板子，所以元件和焊盘不能靠近这里；贴完后把它掰掉。没有工艺边，靠板边的元件就没法贴，因为导轨会压到它们。',
      'A 5–10 mm blank strip added along the panel sides (usually the long ones). The placer’s conveyor rails grip this strip, so no parts or pads may sit there; it is snapped off after assembly. Without rails, parts near the edge cannot be placed because the conveyor would crush them.',
    ),
  },
  {
    id: 'hole',
    name: loc('工艺孔', 'Tooling holes'),
    text: loc(
      '工艺边上不镀铜的定位孔（直径常见约 3 mm），夹具和设备用销钉穿过它定位。孔边留空，不放铜和元件。',
      'Non-plated locating holes in the rails (commonly about 3 mm diameter) that fixtures and machines engage with pins. Keep the area around them clear of copper and parts.',
    ),
  },
  {
    id: 'fid',
    name: loc('Fiducial 标记点', 'Fiducial marks'),
    text: loc(
      '光学定位用的小圆点：一个裸铜圆（常见直径 1 mm），周围阻焊开窗约 2 mm，再留一圈空白，对比才清楚。贴片机摄像头先找到它们，修正板子的位置偏差和涨缩，再贴件。整块拼板放 2–3 个全局点，不对称放置，板子放反时机器能发现；细间距 IC 旁可以再加局部点。',
      'Small dots for optical alignment: a bare copper circle (commonly 1 mm), a solder-mask opening of about 2 mm around it and a clear ring so the contrast is crisp. The placer’s camera finds them first and corrects board position and stretch before placing. Put 2–3 global marks on the panel, asymmetric so a reversed board is detected; add local marks beside fine-pitch ICs.',
    ),
  },
  {
    id: 'vscore',
    name: loc('V-Cut（V 槽）', 'V-score'),
    text: loc(
      '在两块板之间从上下各切一道 V 形槽，中间只留约三分之一板厚相连，贴完后掰开。板与板可以紧挨，省材料；但槽必须是贯穿整张拼板的直线，板边附近的元件要留出避让距离，因为掰板和刀具会碰到它们。',
      'A V-shaped groove cut from both faces between boards, leaving only about a third of the thickness joined; the boards are snapped apart after assembly. Boards can touch, saving material, but the groove must be a straight line across the whole panel and parts near the edge need clearance because snapping and the blade reach them.',
    ),
  },
  {
    id: 'bite',
    name: loc('邮票孔', 'Mouse bites'),
    text: loc(
      '板与板之间留一小条连接桥，桥上钻一排小孔，像邮票的齿孔，贴完后掰断。适合圆角、带凸出部分的不规则外形；代价是断口有毛刺，板间要留约 2–3 mm 间隙，利用率下降。',
      'A small bridge is left between boards and drilled with a row of small holes, like a postage-stamp perforation, then snapped after assembly. It suits rounded or irregular outlines; the price is a rough break and a 2–3 mm gap between boards, which lowers utilisation.',
    ),
  },
  {
    id: 'util',
    name: loc('拼板利用率', 'Panel utilisation'),
    text: loc(
      '所有板子的面积占拼板面积的比例。工艺边、板间隙、邮票孔间隙都占面积；利用率越高，每块板分摊的材料费越低，所以板子尺寸最好能整齐排进工厂的标准大板。',
      'The share of the panel area taken by boards. Rails, board gaps and mouse-bite gaps all use area; the higher the utilisation, the lower the material cost per board, so a board size that tiles neatly into the fab’s standard panel pays off.',
    ),
  },
]

type CostOpt = { id: string; label: LText; f: number }

export const LAYER_OPTS: CostOpt[] = [
  { id: 'l2', label: loc('2 层', '2 layers'), f: 1 },
  { id: 'l4', label: loc('4 层', '4 layers'), f: 1.8 },
  { id: 'l6', label: loc('6 层', '6 layers'), f: 2.8 },
]

export const FINISH_OPTS: CostOpt[] = [
  { id: 'hasl', label: loc('HASL', 'HASL'), f: 1 },
  { id: 'enig', label: loc('ENIG', 'ENIG'), f: 1.25 },
]

export const FEATURE_OPTS: CostOpt[] = [
  { id: 'std', label: loc('常规 6 mil', 'Standard 6 mil'), f: 1 },
  { id: 'fine', label: loc('精细 4 mil', 'Fine 4 mil'), f: 1.3 },
]

export const QTY_OPTS: Array<{ id: string; label: string; n: number }> = [
  { id: 'q5', label: '5', n: 5 },
  { id: 'q50', label: '50', n: 50 },
  { id: 'q500', label: '500', n: 500 },
  { id: 'q5000', label: '5000', n: 5000 },
]

export const COST_MODEL = { areaCm2: 20, materialPerCm2: 0.06, processBase: 1.2, nreBase: 40, nrePerLayer: 20 }

export function costBreakdown(layerF: number, finishF: number, featureF: number, qty: number, util: number) {
  const nre = ((COST_MODEL.nreBase + COST_MODEL.nrePerLayer * layerF) * featureF) / qty
  const material = (COST_MODEL.areaCm2 * COST_MODEL.materialPerCm2 * layerF * finishF) / util
  const process = COST_MODEL.processBase * layerF * featureF
  const total = nre + material + process
  return { nre, material, process, total, nreShare: nre / total }
}

export const PV_COLS: Array<{ id: string; title: LText; rows: Array<{ k: LText; v: LText }> }> = [
  {
    id: 'proto',
    title: loc('打样', 'Prototype'),
    rows: [
      { k: loc('数量', 'Quantity'), v: loc('几块到几十块', 'A few to a few dozen') },
      { k: loc('目的', 'Goal'), v: loc('验证设计能不能用', 'Prove the design works') },
      { k: loc('交期', 'Lead time'), v: loc('快：几天到两周，走工厂的快速线', 'Fast: days to two weeks on the fab’s quick-turn line') },
      { k: loc('单价', 'Unit price'), v: loc('高：工程、制版、测试夹具等一次性费用摊在很少的板上', 'High: engineering, tooling and fixtures are spread over very few boards') },
      { k: loc('工艺', 'Process'), v: loc('单片或简单拼板，手工贴片或小型贴片线', 'Single boards or simple panels; hand or small-line assembly') },
      { k: loc('出错代价', 'Cost of a mistake'), v: loc('低：发现问题就改版', 'Low: just respin the board') },
    ],
  },
  {
    id: 'volume',
    title: loc('量产', 'Volume'),
    rows: [
      { k: loc('数量', 'Quantity'), v: loc('几百到几十万', 'Hundreds to hundreds of thousands') },
      { k: loc('目的', 'Goal'), v: loc('稳定、一致、成本低', 'Stable, consistent, low cost') },
      { k: loc('交期', 'Lead time'), v: loc('较长：备料、做钢网与夹具、首件确认都要时间', 'Longer: kitting parts, making stencils and fixtures and first-article approval all take time') },
      { k: loc('单价', 'Unit price'), v: loc('低：一次性费用被摊薄，拼板利用率高', 'Low: one-off costs are diluted and panel utilisation is high') },
      { k: loc('工艺', 'Process'), v: loc('定型的拼板，专用钢网和测试夹具，全自动线', 'Frozen panel design, dedicated stencil and test fixtures, fully automated line') },
      { k: loc('出错代价', 'Cost of a mistake'), v: loc('高：一个错误会复制成千上万块，所以量产前先小批量试产', 'High: one error is copied onto thousands of boards, so run a pilot build first') },
    ],
  },
]
