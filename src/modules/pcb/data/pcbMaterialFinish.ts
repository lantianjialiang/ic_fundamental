import { loc, type LText } from '../../../i18n/locale'

export type FinishId = 'hasl' | 'enig' | 'osp' | 'imag' | 'imsn'

export type Finish = {
  id: FinishId
  name: LText
  short: LText
  struct: LText
  thick: LText
  figLines: LText[]
  /** 相对成本（HASL = 1.0），示意参数 */
  cost: number
  solder: number
  flat: number
  /** 保存期（月）[下限, 上限] */
  shelf: [number, number]
  fine: number
  good: LText
  bad: LText
  use: LText
}

export const FINISHES: Finish[] = [
  {
    id: 'hasl',
    name: loc('无铅喷锡（HASL）', 'Lead-free HASL'),
    short: loc('无铅喷锡', 'HASL (Pb-free)'),
    struct: loc(
      '板子浸进熔融的无铅焊料（如 Sn-Cu-Ni），再用热风刀把多余的焊料吹掉，焊盘上留一层焊料。',
      'The board is dipped in molten lead-free solder (for example Sn-Cu-Ni) and hot-air knives blow off the excess, leaving a layer of solder on the pads.',
    ),
    thick: loc('焊料约 1–40 µm，厚薄不均。', 'Solder ≈ 1–40 µm, uneven.'),
    figLines: [loc('焊料 1–40 µm', 'Solder 1–40 µm')],
    cost: 1,
    solder: 5,
    flat: 1,
    shelf: [12, 12],
    fine: 1,
    good: loc('便宜，焊盘上自带焊料，润湿最好，耐多次回流和返修。', 'Cheap, the pad carries its own solder, wets best and tolerates repeated reflow and rework.'),
    bad: loc('表面是圆顶、不平整，细间距焊盘上的焊料会连成桥，BGA 焊盘高低不一；整板要过一次高温焊料。', 'The surface is domed and uneven, solder bridges fine-pitch pads and BGA pads end up at different heights; the whole board also takes a hot solder dip.'),
    use: loc('通孔元件、间距较大的贴片、消费类板。', 'Through-hole parts, coarse-pitch SMD and consumer boards.'),
  },
  {
    id: 'enig',
    name: loc('化学镍金（ENIG）', 'ENIG (electroless nickel immersion gold)'),
    short: loc('化学镍金', 'ENIG'),
    struct: loc(
      '先在铜上化学沉积一层镍，再浸一层很薄的金。镍是真正和焊料形成焊点的那层，也挡住铜向表面扩散；金只是保护镍不被氧化，焊接时溶进焊料。',
      'A layer of nickel is first deposited chemically on the copper, then a very thin gold layer is immersed on top. The nickel forms the actual joint with solder and blocks copper diffusing to the surface; the gold only keeps the nickel from oxidising and dissolves into the solder.',
    ),
    thick: loc('镍约 3–6 µm + 金约 0.05–0.1 µm。', 'Nickel ≈ 3–6 µm + gold ≈ 0.05–0.1 µm.'),
    figLines: [loc('Ni 3–6 µm', 'Ni 3–6 µm'), loc('Au 0.05–0.1 µm', 'Au 0.05–0.1 µm')],
    cost: 1.6,
    solder: 4,
    flat: 5,
    shelf: [12, 12],
    fine: 5,
    good: loc('焊盘非常平整，保存期长，可做按键触点和部分打线；适合 BGA、QFN 和细间距。', 'Very flat pads, long shelf life, usable for keypad contacts and some wire bonding; suits BGA, QFN and fine pitch.'),
    bad: loc('贵；镍腐蚀过度会出现“黑盘”，焊点发脆；镍有磁性，在 GHz 以上会增加损耗。', 'Costly; over-corroded nickel causes “black pad” and brittle joints; nickel is magnetic and adds loss above a few GHz.'),
    use: loc('BGA、QFN、细间距和多次装配的板子。', 'BGA, QFN, fine-pitch and multi-assembly boards.'),
  },
  {
    id: 'osp',
    name: loc('有机保焊膜（OSP）', 'OSP (organic solderability preservative)'),
    short: loc('OSP 保焊膜', 'OSP'),
    struct: loc(
      '在裸铜表面生成一层极薄的有机膜，隔绝空气防止铜氧化；焊接时助焊剂把膜除掉，焊料直接焊在铜上。',
      'A very thin organic film forms on bare copper and keeps air away so it cannot oxidise; during soldering the flux removes the film and solder wets the copper directly.',
    ),
    thick: loc('有机膜约 0.2–0.5 µm。', 'Organic film ≈ 0.2–0.5 µm.'),
    figLines: [loc('有机膜 0.2–0.5 µm', 'Organic 0.2–0.5 µm')],
    cost: 0.9,
    solder: 3,
    flat: 5,
    shelf: [3, 6],
    fine: 4,
    good: loc('最便宜，表面很平，没有金属镀层，工艺简单、环保。', 'Cheapest, very flat, no metal plating, simple and environmentally friendly.'),
    bad: loc('保存期短，开封后要尽快焊；过 2–3 次回流膜就被烤坏；膜是绝缘的，测试探针要刺穿它。', 'Short shelf life, solder soon after opening; the film is cooked off after two or three reflows; the film insulates, so test probes must pierce it.'),
    use: loc('大批量消费类板，一次或两次回流就焊完。', 'High-volume consumer boards soldered in one or two reflows.'),
  },
  {
    id: 'imag',
    name: loc('沉银（Immersion Ag）', 'Immersion silver'),
    short: loc('沉银', 'Imm. silver'),
    struct: loc(
      '把铜浸在银盐溶液里，银置换到铜表面，形成一层薄银，焊接时银溶进焊料，焊在铜上。',
      'Copper is dipped in a silver-salt solution and silver displaces onto its surface as a thin layer; in soldering the silver dissolves into the solder and the joint forms on copper.',
    ),
    thick: loc('银约 0.1–0.4 µm。', 'Silver ≈ 0.1–0.4 µm.'),
    figLines: [loc('Ag 0.1–0.4 µm', 'Ag 0.1–0.4 µm')],
    cost: 1.25,
    solder: 4,
    flat: 4,
    shelf: [6, 12],
    fine: 4,
    good: loc('平整、焊接好；没有镍，高频信号损耗小，适合射频和高速板。', 'Flat and solders well; with no nickel the high-frequency loss is low, suiting RF and high-speed boards.'),
    bad: loc('遇到空气里的硫会变色发黑，要用防硫包装，开封后尽快用；焊点下可能出现微空洞。', 'Sulphur in the air tarnishes it black, so it needs sulphur-free packaging and quick use after opening; micro-voids can appear under joints.'),
    use: loc('射频、高速数字板、屏蔽件。', 'RF, high-speed digital boards and shields.'),
  },
  {
    id: 'imsn',
    name: loc('沉锡（Immersion Sn）', 'Immersion tin'),
    short: loc('沉锡', 'Imm. tin'),
    struct: loc(
      '用置换反应在铜上沉一层纯锡，焊接时锡与焊料融在一起。',
      'A layer of pure tin is deposited on copper by displacement; in soldering the tin merges with the solder.',
    ),
    thick: loc('锡约 0.8–1.2 µm。', 'Tin ≈ 0.8–1.2 µm.'),
    figLines: [loc('Sn 0.8–1.2 µm', 'Sn 0.8–1.2 µm')],
    cost: 1.2,
    solder: 3,
    flat: 4,
    shelf: [3, 6],
    fine: 3,
    good: loc('表面平整，适合压接（press-fit）连接器的针脚，成本中等。', 'Flat surface, suits press-fit connector pins, mid-range cost.'),
    bad: loc('铜锡会慢慢长出金属间化合物，把纯锡层吃掉，所以保存期短；还可能长锡须；怕手印。', 'Copper and tin slowly grow intermetallics that consume the pure tin, so shelf life is short; tin whiskers can grow, and fingerprints hurt it.'),
    use: loc('压接连接器、背板。', 'Press-fit connectors and backplanes.'),
  },
]

export type CritId = 'cost' | 'solder' | 'flat' | 'shelf' | 'fine'

export const shelfMid = (f: Finish): number => (f.shelf[0] + f.shelf[1]) / 2

export const CRITERIA: Array<{ id: CritId; label: LText; better: 'low' | 'high'; value: (f: Finish) => number }> = [
  { id: 'cost', label: loc('成本', 'Cost'), better: 'low', value: (f) => f.cost },
  { id: 'solder', label: loc('焊接性', 'Solderability'), better: 'high', value: (f) => f.solder },
  { id: 'flat', label: loc('平整度', 'Flatness'), better: 'high', value: (f) => f.flat },
  { id: 'shelf', label: loc('保存期', 'Shelf life'), better: 'high', value: shelfMid },
  { id: 'fine', label: loc('细间距 / BGA', 'Fine pitch / BGA'), better: 'high', value: (f) => f.fine },
]

export type FilterId = 'all' | CritId

export const COST_MAX = 1.2
export const SCORE_MIN = 4
export const SHELF_MIN = 12

export const FILTERS: Array<{ id: FilterId; label: LText; test: (f: Finish) => boolean }> = [
  { id: 'all', label: loc('全部', 'All'), test: () => true },
  { id: 'cost', label: loc(`低成本（≤ ${COST_MAX}×）`, `Low cost (≤ ${COST_MAX}×)`), test: (f) => f.cost <= COST_MAX },
  { id: 'solder', label: loc(`焊接性好（≥ ${SCORE_MIN}）`, `Good solderability (≥ ${SCORE_MIN})`), test: (f) => f.solder >= SCORE_MIN },
  { id: 'flat', label: loc(`平整（≥ ${SCORE_MIN}）`, `Flat (≥ ${SCORE_MIN})`), test: (f) => f.flat >= SCORE_MIN },
  { id: 'shelf', label: loc(`保存期 ≥ ${SHELF_MIN} 个月`, `Shelf life ≥ ${SHELF_MIN} months`), test: (f) => f.shelf[0] >= SHELF_MIN },
  { id: 'fine', label: loc(`细间距 / BGA（≥ ${SCORE_MIN}）`, `Fine pitch / BGA (≥ ${SCORE_MIN})`), test: (f) => f.fine >= SCORE_MIN },
]

export const ORDER_OPTS: Array<{ id: 'best' | 'worst'; label: LText }> = [
  { id: 'best', label: loc('最优在前', 'Best first') },
  { id: 'worst', label: loc('最差在前', 'Worst first') },
]

/** 排序 + 筛选：同分按成本、再按 id 保持稳定 */
export function viewFinishes(crit: CritId, filter: FilterId, order: 'best' | 'worst'): Finish[] {
  const c = CRITERIA.find((x) => x.id === crit) ?? CRITERIA[0]
  const flt = FILTERS.find((x) => x.id === filter) ?? FILTERS[0]
  const sign = (c.better === 'low' ? 1 : -1) * (order === 'best' ? 1 : -1)
  return FINISHES.filter(flt.test).sort((a, b) => {
    const d = sign * (c.value(a) - c.value(b))
    if (d !== 0) {
      return d
    }
    return a.cost - b.cost || a.id.localeCompare(b.id)
  })
}
