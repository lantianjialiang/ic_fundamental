import { loc, type LText } from '../../../i18n/locale'
import { type StepId } from './pcbFabModel'
import { ETCH, RULE, minDrill, minRing } from './pcbFabRules'

export type FabRule = { title: LText; text: LText }
export type FabStep = { id: StepId; title: LText; what: LText; equip: LText; rules: FabRule[] }

const mm = (n: number) => n.toFixed(2)
const uEtch = ETCH.copper.inner / ETCH.factor
const uOuter = ETCH.copper.outer / ETCH.factor

export const STEPS_A: FabStep[] = [
  {
    id: 'cut',
    title: loc('开料', 'Panel cutting'),
    what: loc(
      '把大张覆铜板（CCL）切成工作板，一块工作板上拼着很多块小板。铜箔和玻纤树脂在板材厂已经压好；切完要磨边，并烘板去掉湿气和应力。',
      'Large copper-clad laminate (CCL) is cut into working panels, each carrying many small boards. Copper and glass-resin were already laminated at the mill; after cutting the edges are ground and the panel is baked to drive out moisture and stress.',
    ),
    equip: loc('剪板机或数控裁板机、磨边机、烘箱。', 'Panel shear or CNC cutter, edge grinder, bake oven.'),
    rules: [
      {
        title: loc('拼板与工艺边', 'Panelisation and rails'),
        text: loc(
          '小板要排进工作板，四周留出夹持和定位用的工艺边。排得越满越便宜，所以板形和尺寸直接影响单价。详见 {@pcbSupply}。',
          'Small boards must nest into the working panel with rails around it for clamping and registration. The fuller the nesting, the cheaper the board, so outline and size drive unit price. See {@pcbSupply}.',
        ),
      },
    ],
  },
  {
    id: 'inner',
    title: loc('内层图形转移', 'Inner-layer imaging'),
    what: loc(
      '在铜面上贴感光干膜，用 UV 光（底片曝光或 LDI 激光直写）把线路图案“印”到膜上，再显影：要保留的铜被硬化的膜盖住，其余铜露出来。',
      'Photosensitive dry film is laminated onto the copper and UV light (artwork exposure or LDI laser direct imaging) prints the circuit pattern into it; development then leaves the copper to keep covered by hardened film and the rest bare.',
    ),
    equip: loc('贴膜机（热压辊）、曝光机（底片接触式或 LDI）、显影线，在黄光洁净间里操作。', 'Film laminator (hot rollers), exposure unit (contact artwork or LDI), developer line, run in a yellow-light clean room.'),
    rules: [
      {
        title: loc('干膜分辨率决定最小线距', 'Film resolution sets minimum space'),
        text: loc(
          `干膜厚 ${ETCH.film.inner} µm 时，能稳定显出来的缝宽约为膜厚的 2 倍（约 ${2 * ETCH.film.inner} µm）。再窄，显影液进不去，膜连成一片，蚀刻时那里的铜被保护下来，结果就是短路。`,
          `With ${ETCH.film.inner} µm film, the narrowest gap that develops reliably is about twice the film thickness (about ${2 * ETCH.film.inner} µm). Narrower than that the developer cannot get in, the film stays bridged, the copper below is protected from the etchant, and the result is a short.`,
        ),
      },
    ],
  },
  {
    id: 'etch',
    title: loc('蚀刻', 'Etching'),
    what: loc(
      '蚀刻液把裸铜溶掉，再把硬膜褪掉，最后用 AOI 把线路和设计图比对。蚀刻向下也向侧面进行，所以线路剖面是上窄下宽的梯形。',
      'Etchant dissolves the bare copper, the hardened film is stripped, and AOI compares the circuit with the design. Etching proceeds sideways as well as down, so the trace cross-section is a trapezoid, narrower at the top.',
    ),
    equip: loc('水平喷淋蚀刻线（氯化铜等蚀刻液）、褪膜线、AOI 自动光学检查机。', 'Horizontal spray etch line (cupric chloride or similar), film-strip line, AOI automatic optical inspection.'),
    rules: [
      {
        title: loc('侧蚀决定最小线宽和线距', 'Undercut sets minimum trace and space'),
        text: loc(
          `侧蚀量 ≈ 铜厚 ÷ 蚀刻因子（约 ${ETCH.factor}）。${ETCH.copper.inner} µm 内层铜每边约咬掉 ${uEtch.toFixed(0)} µm，线越细，剩下的越少；缝越窄，药水越换不动。所以厂家给出最小线宽 / 线距，低于它就会断线或短路。见下面的小实验。`,
          `Undercut ≈ copper thickness ÷ etch factor (about ${ETCH.factor}). On ${ETCH.copper.inner} µm inner copper about ${uEtch.toFixed(0)} µm is lost per side, so thinner lines keep less metal, and narrower gaps let less fresh etchant in. That is why a fab publishes minimum trace and space: below it you get opens or shorts. See the experiment below.`,
        ),
      },
    ],
  },
  {
    id: 'lam',
    title: loc('层压', 'Lamination'),
    what: loc(
      '内层铜面先棕化变粗糙，再按叠层顺序叠好，真空热压：半固化片熔化、填满线路间隙、固化，把芯板和外层铜箔粘成一整块。',
      'Inner copper is first oxide-treated to roughen it, then the stack is laid up in order and pressed under vacuum and heat: the prepreg melts, fills the gaps between traces, cures, and bonds core and outer foil into one block.',
    ),
    equip: loc('棕化线、叠板台（销钉定位）、真空层压机、X 光打靶机（按内层靶标钻定位孔）。', 'Oxide line, layup table (pin registration), vacuum press, X-ray target drilling machine (drills registration holes from inner-layer targets).'),
    rules: [
      {
        title: loc('叠层对称、铜分布均匀', 'Symmetric stack and balanced copper'),
        text: loc(
          '上下不对称，或某一层铜面积很小，冷却时各层收缩不一样，板子会翘。叠层要对称，各层铜面积接近。半固化片厚度还决定层间介质厚度，也就是阻抗。见 {@pcbStack} 和 {@pcbMaterial}。',
          'If the stack is not symmetric, or one layer has little copper, the layers shrink differently on cooling and the board warps. Keep the stack symmetric and copper area similar on each layer. Prepreg thickness also sets the dielectric height, and so the impedance. See {@pcbStack} and {@pcbMaterial}.',
        ),
      },
    ],
  },
  {
    id: 'drill',
    title: loc('钻孔', 'Drilling'),
    what: loc(
      '数控钻机按钻孔文件，用硬质合金钻头高速钻出所有过孔和插件孔。板上盖铝片、板下垫木板，减少毛刺；钻头打几千个孔就要换。',
      'A CNC drill follows the drill file and cuts every via and component hole with a tungsten-carbide bit. An aluminium entry sheet and a backing board reduce burrs, and bits are changed after a few thousand hits.',
    ),
    equip: loc('多轴数控钻机（主轴 10 万转/分以上）、碳化钨钻头、盖板和垫板、X 光对位。', 'Multi-spindle CNC drill (spindles above 100 000 rpm), carbide bits, entry and backing sheets, X-ray alignment.'),
    rules: [
      {
        title: loc('最小孔径和纵横比', 'Minimum drill and aspect ratio'),
        text: loc(
          `纵横比 = 板厚 ÷ 孔径。板厚 ${RULE.boardMm} mm、纵横比上限 ${RULE.arMax}:1，最小孔径 = ${RULE.boardMm} ÷ ${RULE.arMax} = ${mm(minDrill)} mm。孔又细又深，钻头排屑差、容易断；后面镀铜药水也流不进去，孔中间镀不上。`,
          `Aspect ratio = board thickness ÷ hole diameter. With ${RULE.boardMm} mm board and a ${RULE.arMax}:1 limit, the minimum drill is ${RULE.boardMm} ÷ ${RULE.arMax} = ${mm(minDrill)} mm. A thin, deep hole clears chips badly and the bit snaps; the plating bath also cannot flow in, so the middle of the hole does not plate.`,
        ),
      },
      {
        title: loc('孔环取决于钻孔对位', 'Annular ring comes from drill registration'),
        text: loc(
          `钻头位置有偏差（约 ±${mm(RULE.drillPosTol)} mm），内层图形和钻孔之间又有对位偏差（约 ±${mm(RULE.layerRegTol)} mm）。两个偏差叠加，焊盘必须比孔大一圈：孔环 ≥ ${mm(RULE.drillPosTol)} + ${mm(RULE.layerRegTol)} = ${mm(minRing)} mm。不够就会“破盘”，孔壁铜和焊盘断开。`,
          `The bit position has error (about ±${mm(RULE.drillPosTol)} mm) and inner-layer imaging adds its own registration error (about ±${mm(RULE.layerRegTol)} mm). Stacked together, the pad must be bigger than the hole by a ring: annular ring ≥ ${mm(RULE.drillPosTol)} + ${mm(RULE.layerRegTol)} = ${mm(minRing)} mm. Too small and the drill breaks out of the pad, cutting the wall copper off from it.`,
        ),
      },
    ],
  },
  {
    id: 'plate',
    title: loc('沉铜与电镀', 'Desmear, electroless copper and plating'),
    what: loc(
      '除胶渣，让内层铜的边缘干净；化学沉铜，让绝缘的孔壁能导电；全板电镀，把铜加厚。孔壁这层铜把每一层内层铜串起来，是过孔导通的关键。',
      'Desmear cleans the inner copper edges; electroless copper makes the insulating wall conductive; panel plating thickens the copper. This wall copper ties every inner layer together and is what makes the via conduct.',
    ),
    equip: loc('除胶渣线（高锰酸钾或等离子）、化学沉铜线（钯催化）、垂直连续电镀线 VCP 或龙门电镀线。', 'Desmear line (permanganate or plasma), electroless copper line (palladium catalyst), vertical continuous plating (VCP) or gantry plating line.'),
    rules: [
      {
        title: loc('孔越深越细，孔中间越薄', 'Deeper, thinner holes plate thinner in the middle'),
        text: loc(
          '电流和药水都集中在孔口，孔中间镀得比板面薄（分散能力有限）。孔壁铜要保证最低厚度，所以纵横比必须有上限，这和钻孔那一步的规则是同一个来源。',
          'Current and fresh bath concentrate at the hole mouth, so the middle plates thinner than the surface (limited throwing power). The wall must still reach a minimum thickness, which is why the aspect ratio has an upper limit, the same source as the drilling rule.',
        ),
      },
      {
        title: loc('成品孔比钻孔小', 'Finished hole is smaller than the drill'),
        text: loc(
          '孔壁镀上铜之后，孔径要缩小约 2 × 镀层厚度，再加上后面表面处理的厚度。所以钻孔文件里的钻头直径要比图纸上的成品孔大约 0.1 mm，插件脚才进得去。',
          'Plating on the wall shrinks the hole by about twice the plating thickness, plus the surface finish later. So the drill diameter in the file is about 0.1 mm larger than the finished hole on the drawing, or the component lead will not fit.',
        ),
      },
    ],
  },
  {
    id: 'outer',
    title: loc('外层图形', 'Outer-layer imaging'),
    what: loc(
      '贴膜、曝光（反图形）、显影，只在线路和孔里再镀铜和锡；退膜后把多余的底铜蚀掉，最后退锡。锡是蚀刻时的保护层。',
      'Film, exposure (reverse image) and development; then copper and tin plate only into the circuit and holes. After stripping, the extra base copper is etched away and the tin is removed. Tin is the etch resist.',
    ),
    equip: loc('贴膜机、曝光机、显影线；图形电镀线（镀铜缸、镀锡缸）；蚀刻线、退锡线。', 'Film laminator, exposure unit, developer; pattern-plating line (copper and tin tanks); etch line and tin stripper.'),
    rules: [
      {
        title: loc('外层铜更厚，最小线宽线距更大', 'Thicker outer copper, larger minimum trace and space'),
        text: loc(
          `外层要加上底铜、孔铜和图形电镀，铜厚约 ${ETCH.copper.outer} µm，每边侧蚀约 ${uOuter.toFixed(0)} µm，缝也要 ≥ 1.5 × ${ETCH.copper.outer} = ${1.5 * ETCH.copper.outer} µm。所以同一块板上，内层往往能比外层做得更细。`,
          `The outer layer carries foil, hole copper and pattern plating, about ${ETCH.copper.outer} µm of copper, so about ${uOuter.toFixed(0)} µm is lost per side and the gap must be ≥ 1.5 × ${ETCH.copper.outer} = ${1.5 * ETCH.copper.outer} µm. That is why, on the same board, the inner layers can usually be finer than the outer ones.`,
        ),
      },
    ],
  },
]
