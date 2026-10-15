import { loc, type LText } from '../../../i18n/locale'

// 工序和播放帧：一个工序包含 1 到 7 帧，横截面和俯视图都按帧画
export type StepId = 'cut' | 'inner' | 'etch' | 'lam' | 'drill' | 'plate' | 'outer' | 'mask' | 'legend' | 'finish' | 'route' | 'test' | 'final'

export type FrameId =
  | 'cut' | 'dfLam1' | 'exp1' | 'dev1' | 'etch1' | 'strip1' | 'aoi1'
  | 'oxide' | 'layup' | 'press' | 'drill' | 'desmear' | 'electroless' | 'panel'
  | 'dfLam2' | 'exp2' | 'dev2' | 'pattern' | 'strip2' | 'etch2' | 'stripSn'
  | 'maskCoat' | 'maskExp' | 'maskDev' | 'maskCure' | 'legend' | 'enig' | 'route' | 'test' | 'final'

// 缺陷卡在横截面上圈出的位置
export type HotKey = 'trace' | 'gap' | 'wall' | 'pad' | 'smd' | 'dam' | 'surface' | 'legend' | 'edge' | 'inner'

export const FRAMES: Array<{ id: FrameId; step: StepId; label: LText; says: LText }> = [
  { id: 'cut', step: 'cut', label: loc('开料', 'Cut panel'), says: loc('大张覆铜板（芯板）按工作板尺寸切开，两面各有一整张铜箔，现在还没有线路。', 'A large copper-clad laminate (the core) is sheared to panel size; both faces carry a full copper sheet and there is no circuit yet.') },
  { id: 'dfLam1', step: 'inner', label: loc('贴干膜', 'Laminate dry film'), says: loc('热压辊把感光干膜贴到铜面上，这时膜还是整张的。', 'Hot rollers press photosensitive dry film onto the copper; it is still a plain sheet.') },
  { id: 'exp1', step: 'inner', label: loc('曝光', 'Expose'), says: loc('UV 光（或 LDI 激光直写）透过底片照到膜上：透光处的膜聚合变硬，留下和线路一样的潜影；挡光处的膜保持柔软。', 'UV light (or an LDI laser writing directly) passes through the artwork: film in clear areas polymerises and hardens into a latent image of the circuit, shaded film stays soft.') },
  { id: 'dev1', step: 'inner', label: loc('显影', 'Develop'), says: loc('碱性显影液冲掉没曝光的软膜，硬膜留在要保留的线路上，其余地方露出铜。', 'Alkaline developer washes away the unexposed soft film; hardened film stays over the circuit to keep, and copper is bare elsewhere.') },
  { id: 'etch1', step: 'etch', label: loc('蚀刻', 'Etch'), says: loc('蚀刻液喷到板上溶掉裸铜；膜下的铜保留，但侧面也被咬掉一点（侧蚀），线路变成上窄下宽的梯形。', 'Etchant is sprayed on and dissolves the bare copper; copper under the film survives but is also attacked from the sides (undercut), so traces become trapezoids, narrower at the top.') },
  { id: 'strip1', step: 'etch', label: loc('退膜', 'Strip film'), says: loc('强碱把硬化的干膜褪掉，露出完整的铜线路。', 'Strong alkali strips the hardened film and leaves the bare copper circuit.') },
  { id: 'aoi1', step: 'etch', label: loc('内层 AOI', 'Inner AOI'), says: loc('光学检查机把板拍下来和设计图比对，找开路、短路和缺口。压合后内层就看不见也修不了，所以必须现在查。', 'An optical inspector images the layer and compares it with the design to find opens, shorts and nicks. After lamination the inner layer cannot be seen or repaired, so it must be checked now.') },
  { id: 'oxide', step: 'lam', label: loc('棕化 / 黑化', 'Oxide treatment'), says: loc('铜面被药水处理成粗糙的氧化层，让树脂压合时咬得住铜；否则会分层。', 'Chemistry roughens the copper into an oxide layer so resin can grip it in the press; otherwise the layers delaminate.') },
  { id: 'layup', step: 'lam', label: loc('叠板', 'Layup'), says: loc('按叠层顺序摆好：铜箔、半固化片、芯板、半固化片、铜箔，用销钉定位。此时线路之间还是空的。', 'Parts are stacked in stack-up order: foil, prepreg, core, prepreg, foil, located by pins. The gaps between traces are still empty.') },
  { id: 'press', step: 'lam', label: loc('压合', 'Press'), says: loc('真空热压让半固化片熔化、流进线路间隙，固化后整叠变成一块实心的多层板。', 'Vacuum, heat and pressure melt the prepreg; resin flows into the gaps between traces and cures, and the stack becomes one solid multilayer board.') },
  { id: 'drill', step: 'drill', label: loc('钻孔', 'Drill'), says: loc('数控钻机用高速钻头钻出通孔。孔壁是绝缘的树脂和玻纤，只有内层铜的边缘露出来，还沾着钻污。', 'A CNC drill cuts the through hole. The wall is insulating resin and glass; only the edges of inner copper show, smeared with drill debris.') },
  { id: 'desmear', step: 'plate', label: loc('除胶渣', 'Desmear'), says: loc('药水（或等离子）去掉孔壁的树脂胶渣，让内层铜的边缘露出来，后面镀的铜才能接上它。', 'Permanganate (or plasma) removes the resin smear from the wall so the inner copper edges are clean and the plating can connect to them.') },
  { id: 'electroless', step: 'plate', label: loc('化学沉铜', 'Electroless Cu'), says: loc('孔壁不导电，没法直接电镀，先用化学反应在孔壁和板面沉一层约 0.5 µm 的薄铜，让它导电。', 'The wall is an insulator and cannot be electroplated directly, so a chemical reaction deposits a thin copper film (about 0.5 µm) on the wall and surface to make it conductive.') },
  { id: 'panel', step: 'plate', label: loc('全板电镀', 'Panel plating'), says: loc('整块板通电，在薄铜上继续加厚，孔壁铜厚到约 20 µm，才扛得住电流和热冲击。图中厚度夸张。', 'The whole panel is powered and copper builds up on the thin film until the wall reaches about 20 µm, enough to survive current and thermal shock. Thickness is exaggerated.') },
  { id: 'dfLam2', step: 'outer', label: loc('贴干膜', 'Laminate dry film'), says: loc('外层再贴一次干膜，这次是为“图形电镀”准备的；膜把孔口盖住。', 'Dry film goes on again for the outer layer, this time prepared for pattern plating; the film tents over the hole mouth.') },
  { id: 'exp2', step: 'outer', label: loc('曝光', 'Expose'), says: loc('和内层相反：让“不要线路”的地方曝光变硬，线路和孔位处的膜保持未曝光。', 'The opposite of the inner layer: areas without circuit are exposed and harden, while film over traces, pads and holes stays unexposed.') },
  { id: 'dev2', step: 'outer', label: loc('显影', 'Develop'), says: loc('线路、焊盘和孔位的膜被冲掉，露出铜；硬膜留在不要线路的地方，成为电镀的“模子”。', 'Film over traces, pads and holes washes off and exposes copper; hardened film stays elsewhere and forms a mould for plating.') },
  { id: 'pattern', step: 'outer', label: loc('图形电镀铜锡', 'Pattern plate Cu + Sn'), says: loc('只在露出的线路和孔壁上再镀一层铜，加到总厚度，再镀一层薄锡，当后面蚀刻的保护层。', 'Only the exposed circuit and hole wall get more copper, up to full thickness, then a thin tin layer as the etch resist for the next step.') },
  { id: 'strip2', step: 'outer', label: loc('退膜', 'Strip film'), says: loc('硬膜褪掉，之前被膜盖住的底铜露出来。', 'The hardened film is stripped and the base copper it covered is exposed.') },
  { id: 'etch2', step: 'outer', label: loc('蚀刻', 'Etch'), says: loc('药水蚀掉没有锡保护的底铜；锡不怕这种药水，所以线路和孔壁被保护下来。线路同样会有侧蚀。', 'Etchant removes the base copper that is not covered by tin; tin resists this etchant, so traces and hole walls survive. The traces suffer undercut too.') },
  { id: 'stripSn', step: 'outer', label: loc('退锡', 'Strip tin'), says: loc('退锡水把锡去掉，留下干净的铜线路和铜孔壁。', 'Tin stripper removes the tin and leaves clean copper traces and plated hole walls.') },
  { id: 'maskCoat', step: 'mask', label: loc('涂阻焊', 'Coat mask'), says: loc('液态感光阻焊油墨（LPI）涂满整个板面，盖住所有线路。', 'Liquid photoimageable (LPI) solder-mask ink is coated over the whole surface and covers every trace.') },
  { id: 'maskExp', step: 'mask', label: loc('曝光', 'Expose'), says: loc('底片挡住要开窗的焊盘处，其他地方曝光变硬；两个焊盘之间的窄条也被曝光，成为阻焊坝。', 'The artwork shades the pad openings and everything else hardens. The narrow strip between two pads is exposed too and becomes the solder dam.') },
  { id: 'maskDev', step: 'mask', label: loc('显影', 'Develop'), says: loc('没曝光的油墨被冲掉，焊盘露出铜；焊盘之间留下阻焊坝。', 'Unexposed ink washes away and the pads show copper; the dam remains between the pads.') },
  { id: 'maskCure', step: 'mask', label: loc('固化', 'Cure'), says: loc('烘到约 150 °C，让油墨彻底固化，才耐得住焊接的高温。', 'Baking at about 150 °C fully cures the ink so it survives soldering heat.') },
  { id: 'legend', step: 'legend', label: loc('印字符', 'Print legend'), says: loc('白色油墨印位号、极性和外框，只印在阻焊上，避开所有焊盘。', 'White ink prints designators, polarity marks and outlines on top of the mask, kept clear of every pad.') },
  { id: 'enig', step: 'finish', label: loc('化镍金 ENIG', 'ENIG plating'), says: loc('板子浸入药水，只有裸铜上先沉一层镍（约 3–6 µm），再沉一层很薄的金（约 0.05–0.1 µm），防止铜氧化并保持平整。', 'The board is dipped in baths; only bare copper gets nickel first (about 3–6 µm) and then a very thin gold layer (about 0.05–0.1 µm) that keeps the copper from oxidising and flat.') },
  { id: 'route', step: 'route', label: loc('铣外形', 'Route outline'), says: loc('铣刀沿外形线把板子从工作板上切下来（也可以用 V 割）。铣刀有位置公差，所以铜要离板边留足距离。', 'A router cuts the board out of the panel along the outline (V-cut is the alternative). The router has position tolerance, so copper must stay clear of the edge.') },
  { id: 'test', step: 'test', label: loc('飞针测试', 'Flying probe'), says: loc('飞针（或测试架）按网表逐个检查：每个网络通不通，相邻网络有没有短路。', 'Flying probes (or a bed of nails) check against the netlist: every net for continuity, and neighbouring nets for shorts.') },
  { id: 'final', step: 'final', label: loc('终检', 'Final inspection'), says: loc('目检加量测：尺寸、板厚、外观、孔，对照验收标准；合格才包装出货。', 'Visual and dimensional checks, covering size, thickness, appearance and holes, against the acceptance standard; only good boards are packed and shipped.') },
]

export const STEP_ORDER: StepId[] = FRAMES.reduce<StepId[]>((acc, f) => (acc.includes(f.step) ? acc : [...acc, f.step]), [])

export function frameIndex(id: FrameId) {
  return FRAMES.findIndex((f) => f.id === id)
}

export function stepOfFrame(index: number) {
  return STEP_ORDER.indexOf(FRAMES[index].step)
}

export function firstFrameOfStep(stepIndex: number) {
  return FRAMES.findIndex((f) => f.step === STEP_ORDER[stepIndex])
}

export function framesOfStep(stepIndex: number) {
  return FRAMES.map((f, i) => ({ f, i })).filter((x) => x.f.step === STEP_ORDER[stepIndex])
}
