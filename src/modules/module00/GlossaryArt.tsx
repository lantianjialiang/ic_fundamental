import { useId, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type TermId } from './data/content'

const L = {
  probeCard: loc('Probe Card', 'Probe card'),
  wafer: loc('晶圆', 'Wafer'),
  chuck: loc('Chuck', 'Chuck'),
  testHead: loc('测试头', 'Test head'),
  loadBoard: loc('Load Board', 'Load board'),
  socket: loc('Socket', 'Socket'),
  plunger: loc('Handler 压头', 'Handler plunger'),
  mainframe: loc('主机柜', 'Mainframe'),
  cable: loc('电缆', 'Cables'),
  pogo: loc('弹簧针', 'Pogo pins'),
  boards: loc('通道板', 'Channel boards'),
  lid: loc('盖子', 'Lid'),
  springs: loc('弹簧针', 'Spring pins'),
  input: loc('进料盘', 'Input tray'),
  site: loc('测试位', 'Test site'),
  cycle: loc('拍', 'Cycle'),
  inputs: loc('输入：驱动', 'Inputs: drive'),
  output: loc('输出：期望', 'Output: expect'),
  good: loc('好品', 'Good'),
  tested: loc('测试数', 'Tested'),
  topView: loc('俯视', 'Top view'),
  sideView: loc('侧视', 'Side view'),
  gullWing: loc('鸥翼脚', 'Gull-wing leads'),
  colTest: loc('测试项', 'Test'),
  colValue: loc('测量值', 'Value'),
  colLimit: loc('限值', 'Limit'),
  colResult: loc('结果', 'Result'),
  bin1: loc('好品', 'Pass'),
  bin3: loc('DC 失败', 'DC fail'),
  bin5: loc('功能失败', 'Func fail'),
}

type ArtProps = { small: boolean; t: (text: LText | string) => string; uid: string }

/** 术语插图：全部用 CSS 变量绘制，跟随深浅主题。small 时去掉文字，当缩略图用。 */
export function GlossaryArt({ id, small = false, label }: { id: TermId; small?: boolean; label?: string }) {
  const { t } = useLocale()
  const uid = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const Art = ARTS[id]
  return (
    <svg
      viewBox="0 0 240 150"
      className={small ? 'm00-thumb' : 'term-fig__svg'}
      role={small ? undefined : 'img'}
      aria-hidden={small ? true : undefined}
      aria-label={small ? undefined : label}
    >
      <rect width="240" height="150" rx="8" fill="var(--well)" />
      <Art small={small} t={t} uid={uid} />
    </svg>
  )
}

function Lbl({
  small,
  x,
  y,
  anchor = 'middle',
  color = 'var(--text-2)',
  size = 11,
  mono = false,
  children,
}: {
  small: boolean
  x: number
  y: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  mono?: boolean
  children: ReactNode
}) {
  if (small) return null
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** 实心小三角箭头，尖端在 (x, y)，deg 为指向角（0 = 向右） */
function Tri({ x, y, deg, color }: { x: number; y: number; deg: number; color: string }) {
  return <path d="M0 0 L-6 -3 L-6 3 Z" fill={color} transform={`translate(${x} ${y}) rotate(${deg})`} />
}

/* ---------- 晶圆 Bin 图（Bin / Yield 共用同一张） ---------- */

type Cell = { x: number; y: number; bin: 1 | 3 | 5 }

const WAFER_R = 62
const DIE = 11

/** 以晶圆圆心为原点的 die 格子；四个角都在圆内才算完整 die，边缘残缺的不画 */
function waferCells(r: number, size: number): Cell[] {
  const cells: Cell[] = []
  const n = Math.ceil(r / size)
  for (let i = -n; i < n; i += 1) {
    for (let j = -n; j < n; j += 1) {
      const x = i * size
      const y = j * size
      const far = Math.max(
        Math.hypot(x, y),
        Math.hypot(x + size, y),
        Math.hypot(x, y + size),
        Math.hypot(x + size, y + size),
      )
      if (far > r - 1.5) continue
      const d = Math.hypot(x + size / 2, y + size / 2)
      const f = Math.abs(i * 7 + j * 13 + i * j) % 23
      const edge = d > r - size * 1.8
      let bin: Cell['bin'] = 1
      if (f === 0 || f === 5 || (edge && f % 4 === 0)) bin = 5
      else if (f === 11 || f === 17) bin = 3
      cells.push({ x, y, bin })
    }
  }
  return cells
}

const CELLS = waferCells(WAFER_R, DIE)
const GOOD = CELLS.filter((c) => c.bin === 1).length

const BIN_FILL: Record<Cell['bin'], string> = { 1: 'var(--green)', 3: 'var(--gold)', 5: 'var(--red)' }

function WaferMap({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={WAFER_R} fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {CELLS.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={cx + c.x + 0.8}
          y={cy + c.y + 0.8}
          width={DIE - 1.6}
          height={DIE - 1.6}
          rx="1"
          fill={BIN_FILL[c.bin]}
          opacity="0.85"
        />
      ))}
      {/* 定位缺口（notch） */}
      <circle cx={cx} cy={cy + WAFER_R} r="3.5" fill="var(--well)" stroke="var(--line-3)" />
    </g>
  )
}

/* ---------- QFP 俯视（DUT 用）：四边引脚数相同，居中均匀分布 ---------- */

function QfpTop({ cx, cy, body, n, pitch, lead }: { cx: number; cy: number; body: number; n: number; pitch: number; lead: number }) {
  const h = body / 2
  const w = pitch * 0.5
  const offs = range(n).map((i) => (i - (n - 1) / 2) * pitch)
  return (
    <g>
      <g fill="var(--text-2)">
        {offs.map((o) => (
          <g key={o}>
            <rect x={cx + o - w / 2} y={cy - h - lead} width={w} height={lead} />
            <rect x={cx + o - w / 2} y={cy + h} width={w} height={lead} />
            <rect x={cx - h - lead} y={cy + o - w / 2} width={lead} height={w} />
            <rect x={cx + h} y={cy + o - w / 2} width={lead} height={w} />
          </g>
        ))}
      </g>
      <rect x={cx - h} y={cy - h} width={body} height={body} rx="3" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      <circle cx={cx - h + body * 0.15} cy={cy - h + body * 0.15} r={body * 0.045} fill="var(--muted)" />
    </g>
  )
}

/* ---------- 各术语插图 ---------- */

const ARTS: Record<TermId, (p: ArtProps) => ReactNode> = {
  /* 侧视：测试头 → 弹簧针 → 探针卡 → 探针扎在晶圆上一颗 die 的 pad → 晶圆在 chuck 上 */
  cp: ({ small, t, uid }) => {
    const W = { cx: 120, cy: 106, rx: 84, ry: 17 }
    return (
      <g>
        <defs>
          <clipPath id={`${uid}-w`}>
            <ellipse cx={W.cx} cy={W.cy} rx={W.rx} ry={W.ry} />
          </clipPath>
        </defs>
        {/* chuck：圆柱，先画底面和侧面，再画顶面 */}
        <ellipse cx="120" cy="118" rx="94" ry="20" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        <rect x="26" y="108" width="188" height="10" fill="var(--fig-box-2)" />
        <path d="M26 108 V118 M214 108 V118" stroke="var(--line-3)" />
        <ellipse cx="120" cy="108" rx="94" ry="20" fill="var(--fig-box)" stroke="var(--line-3)" />
        {/* 晶圆：未切割，上面是一格一格的 die */}
        <ellipse cx={W.cx} cy={W.cy} rx={W.rx} ry={W.ry} fill="var(--fig-box-2)" stroke="var(--line-2)" />
        <g clipPath={`url(#${uid}-w)`} stroke="var(--line-2)" strokeWidth="0.7">
          {range(15).map((k) => (
            <line key={`v${k}`} x1={30 + k * 12} y1="86" x2={30 + k * 12} y2="126" />
          ))}
          {range(9).map((m) => (
            <line key={`h${m}`} x1="30" y1={90 + m * 4} x2="210" y2={90 + m * 4} />
          ))}
        </g>
        <rect x="114" y="102" width="12" height="4" fill="var(--gold-bg-2)" stroke="var(--gold)" strokeWidth="1" />
        {/* 测试头：弹簧针压在探针卡外圈焊盘上 */}
        <rect x="20" y="6" width="200" height="16" rx="2" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        {[30, 38, 46, 54, 186, 194, 202, 210].map((x) => (
          <line key={x} x1={x} y1="22" x2={x} y2="40" stroke="var(--gold)" strokeWidth="1.4" />
        ))}
        {/* 探针卡：一整块圆形 PCB（侧视为一条），顶面中央是金属加强板，底面中央是固定探针的环氧环 */}
        <rect x="18" y="40" width="204" height="10" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
        <rect x="88" y="34" width="64" height="6" rx="1" fill="var(--line-2)" stroke="var(--line-3)" strokeWidth="0.6" />
        <path d="M92 50 H148 L140 60 H100 Z" fill="var(--fig-box)" stroke="var(--line-3)" strokeWidth="0.8" />
        {/* 悬臂探针：从环氧环内沿斜伸向中心，针尖落在被测 die 的 pad 上 */}
        {[
          'M102 58 L114 98 L115 103',
          'M106 58 L116 98 L117 103',
          'M138 58 L126 98 L125 103',
          'M134 58 L124 98 L123 103',
        ].map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--gold)" strokeWidth="1.3" />
        ))}
        <Lbl small={small} x={120} y={18} color="var(--muted)" size={10}>
          {t(L.testHead)}
        </Lbl>
        <Lbl small={small} x={220} y={64} anchor="end">
          {t(L.probeCard)}
        </Lbl>
        <Lbl small={small} x={220} y={88} anchor="end">
          {t(L.wafer)}
        </Lbl>
        <Lbl small={small} x={14} y={146} anchor="start" color="var(--muted)" size={10}>
          {t(L.chuck)}
        </Lbl>
      </g>
    )
  },

  /* 侧视：Handler 压头把封装好的 BGA 芯片压进 Socket，Socket 装在 Load Board 上，下面是测试头 */
  ft: ({ small, t }) => {
    const balls = range(6).map((i) => 120 + (i - 2.5) * 10)
    return (
      <g>
        <rect x="100" y="6" width="40" height="12" rx="2" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        <rect x="116" y="18" width="8" height="22" fill="var(--blue-bg)" stroke="var(--blue)" />
        <rect x="94" y="40" width="52" height="10" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
        {[106, 134].map((x) => (
          <g key={x}>
            <line x1={x} y1="22" x2={x} y2="32" stroke="var(--blue)" strokeWidth="1.6" />
            <Tri x={x} y={37} deg={90} color="var(--blue)" />
          </g>
        ))}
        {/* 封装芯片：塑封体 + 基板 + 焊球 */}
        <rect x="96" y="50" width="48" height="10" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x="90" y="60" width="60" height="5" fill="var(--fig-box-2)" stroke="var(--text-2)" />
        {balls.map((x) => (
          <circle key={`b${x}`} cx={x} cy="67.5" r="2.5" fill="var(--gold)" />
        ))}
        {/* Socket：两侧导向壁 + 底座，弹簧针从焊球一直通到 Load Board */}
        <path d="M72 52 H84 V70 H156 V52 H168 V108 H72 Z" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        {balls.map((x) => (
          <path
            key={`p${x}`}
            d={`M${x} 70 V76 l2.5 2 l-5 4 l5 4 l-5 4 l5 4 l-5 4 l2.5 2 V108`}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.2"
          />
        ))}
        <rect x="20" y="108" width="200" height="8" rx="2" fill="var(--green-bg)" stroke="var(--green-line)" />
        <rect x="14" y="120" width="212" height="20" rx="3" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        <Lbl small={small} x={150} y={30} anchor="start">
          {t(L.plunger)}
        </Lbl>
        <Lbl small={small} x={66} y={60} anchor="end" color="var(--gold)">
          DUT
        </Lbl>
        <Lbl small={small} x={174} y={88} anchor="start">
          {t(L.socket)}
        </Lbl>
        <Lbl small={small} x={174} y={104} anchor="start" size={10}>
          {t(L.loadBoard)}
        </Lbl>
        <Lbl small={small} x={120} y={134} color="var(--muted)" size={10}>
          {t(L.testHead)}
        </Lbl>
      </g>
    )
  },

  /* 主机柜 + 电缆 + 测试头（架在支架上），测试头顶上是 Load Board 和 DUT */
  ate: ({ small, t }) => (
    <g>
      <line x1="8" y1="138" x2="232" y2="138" stroke="var(--line-2)" />
      <rect x="14" y="30" width="74" height="108" rx="4" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {range(9).map((i) => (
        <rect key={i} x="22" y={38 + i * 10} width="58" height="6" rx="1" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="0.6" />
      ))}
      <circle cx="76" cy="132" r="2" fill="var(--green)" />
      <path d="M88 102 C112 102 108 82 128 82" fill="none" stroke="var(--blue)" strokeWidth="4" />
      <rect x="168" y="100" width="16" height="34" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="150" y="134" width="52" height="4" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="128" y="64" width="96" height="36" rx="4" fill="var(--blue-bg)" stroke="var(--blue)" />
      <rect x="140" y="58" width="72" height="6" fill="var(--green-bg)" stroke="var(--green-line)" />
      <rect x="166" y="52" width="20" height="6" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="170" y="47" width="12" height="5" rx="1" fill="var(--gold)" />
      <Lbl small={small} x={51} y={22}>
        {t(L.mainframe)}
      </Lbl>
      <Lbl small={small} x={176} y={86}>
        {t(L.testHead)}
      </Lbl>
      <Lbl small={small} x={192} y={50} anchor="start" color="var(--gold)">
        DUT
      </Lbl>
      <Lbl small={small} x={110} y={120} color="var(--muted)" size={10}>
        {t(L.cable)}
      </Lbl>
    </g>
  ),

  /* QFP：四边各 8 根鸥翼脚，左上角圆点是 1 号脚；右边补一个侧视看引脚形状 */
  dut: ({ small, t }) =>
    small ? (
      <QfpTop cx={120} cy={75} body={80} n={8} pitch={9} lead={14} />
    ) : (
      <g>
        <QfpTop cx={84} cy={72} body={70} n={8} pitch={7.5} lead={10} />
        <Lbl small={small} x={84} y={77} color="var(--text)" size={15} mono>
          DUT
        </Lbl>
        <line x1="144" y1="81" x2="236" y2="81" stroke="var(--line-2)" />
        <rect x="160" y="64" width="60" height="12" rx="2" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <path d="M160 70 H156 L153 80 H147 M220 70 H224 L227 80 H233" fill="none" stroke="var(--text-2)" strokeWidth="1.8" />
        <Lbl small={small} x={84} y={136} color="var(--muted)" size={10}>
          {t(L.topView)}
        </Lbl>
        <Lbl small={small} x={190} y={100} color="var(--muted)" size={10}>
          {t(L.sideView)}
        </Lbl>
        <Lbl small={small} x={190} y={113} color="var(--muted)" size={10}>
          {t(L.gullWing)}
        </Lbl>
      </g>
    ),

  /* 测试头剖面：一排竖插的通道板，每块板对应顶面一组弹簧针 */
  tester: ({ small, t }) => (
    <g>
      <rect x="30" y="48" width="180" height="84" rx="6" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {range(8).map((i) => {
        const c = 49 + i * 21
        return (
          <g key={i}>
            <rect x={c - 7} y="48" width="14" height="76" rx="1" fill="var(--blue-bg)" stroke="var(--blue)" />
            <rect x={c - 4} y="66" width="8" height="8" fill="var(--blue)" opacity="0.6" />
            <rect x={c - 4} y="88" width="8" height="8" fill="var(--blue)" opacity="0.6" />
            {[-4, 0, 4].map((d) => (
              <g key={d}>
                <line x1={c + d} y1="28" x2={c + d} y2="36" stroke="var(--gold)" strokeWidth="1.2" />
                <circle cx={c + d} cy="27" r="1.4" fill="var(--gold)" />
              </g>
            ))}
          </g>
        )
      })}
      <rect x="30" y="36" width="180" height="12" rx="2" fill="var(--fig-box)" stroke="var(--line-3)" />
      <Lbl small={small} x={120} y={18}>
        {t(L.pogo)}
      </Lbl>
      <Lbl small={small} x={120} y={145}>
        {t(L.boards)}
      </Lbl>
    </g>
  ),

  /* 俯视：四边是接测试头弹簧针的焊盘，走线汇到中间 Socket 的四边焊盘 */
  loadboard: ({ small, t }) => {
    const fp = [-12, -4, 4, 12]
    const top = [72, 100, 140, 168]
    const side = [50, 68, 86, 104]
    const trace = { fill: 'none', stroke: 'var(--gold)', strokeWidth: 1.2 }
    return (
      <g>
        <rect x="18" y="10" width="204" height="130" rx="8" fill="var(--green-bg)" stroke="var(--green-line)" />
        <rect x="98" y="53" width="44" height="44" rx="3" fill="var(--fig-box)" stroke="var(--text-2)" strokeDasharray="4 3" />
        {fp.map((o, i) => {
          const fx = 120 + o
          const fy = 75 + o
          return (
            <g key={o}>
              {/* 上、下两边 */}
              <rect x={top[i] - 3} y="14" width="6" height="6" fill="var(--gold)" />
              <rect x={top[i] - 3} y="130" width="6" height="6" fill="var(--gold)" />
              <path d={`M${top[i]} 20 V30 L${fx} 43 V54`} {...trace} />
              <path d={`M${top[i]} 130 V120 L${fx} 107 V96`} {...trace} />
              {/* 左、右两边 */}
              <rect x="22" y={side[i] - 3} width="6" height="6" fill="var(--gold)" />
              <rect x="212" y={side[i] - 3} width="6" height="6" fill="var(--gold)" />
              <path d={`M28 ${side[i]} H64 L87 ${fy} H99`} {...trace} />
              <path d={`M212 ${side[i]} H176 L153 ${fy} H141`} {...trace} />
              {/* Socket 焊盘 */}
              <rect x={fx - 1.5} y="54" width="3" height="5" fill="var(--gold)" />
              <rect x={fx - 1.5} y="91" width="3" height="5" fill="var(--gold)" />
              <rect x="99" y={fy - 1.5} width="5" height="3" fill="var(--gold)" />
              <rect x="136" y={fy - 1.5} width="5" height="3" fill="var(--gold)" />
              {i % 2 === 1 ? (
                <g fill="var(--blue)">
                  <circle cx={top[i]} cy="25" r="2.4" />
                  <circle cx={top[i]} cy="125" r="2.4" />
                  <circle cx="46" cy={side[i]} r="2.4" />
                  <circle cx="194" cy={side[i]} r="2.4" />
                </g>
              ) : null}
            </g>
          )
        })}
        <Lbl small={small} x={120} y={79} size={10}>
          {t(L.socket)}
        </Lbl>
      </g>
    )
  },

  /* 翻盖式 Socket 剖面：焊球压在弹簧针上，针下端接 Load Board，盖子带压块 */
  socket: ({ small, t }) => {
    const pins = range(6).map((i) => 90 + i * 12)
    return (
      <g>
        <rect x="12" y="128" width="216" height="8" rx="2" fill="var(--green-bg)" stroke="var(--green-line)" />
        <path d="M70 62 H80 V84 H160 V62 H170 V128 H70 Z" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        {pins.map((x) => (
          <path
            key={x}
            d={`M${x} 84 V90 l3 2.5 l-6 5 l6 5 l-6 5 l6 5 l-6 5 l3 2.5 V128`}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.2"
          />
        ))}
        <rect x="88" y="62" width="64" height="10" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x="82" y="72" width="76" height="6" fill="var(--fig-box)" stroke="var(--text-2)" />
        {pins.map((x) => (
          <circle key={`b${x}`} cx={x} cy="81" r="3" fill="var(--gold)" />
        ))}
        <g transform="rotate(28 170 58)">
          <rect x="66" y="52" width="104" height="6" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
          <rect x="92" y="58" width="56" height="4" fill="var(--blue-bg)" stroke="var(--blue)" />
        </g>
        <circle cx="170" cy="58" r="4" fill="var(--fig-box)" stroke="var(--line-3)" />
        <Lbl small={small} x={64} y={70} anchor="end" color="var(--gold)">
          DUT
        </Lbl>
        <Lbl small={small} x={182} y={40} anchor="start">
          {t(L.lid)}
        </Lbl>
        <Lbl small={small} x={176} y={110} anchor="start">
          {t(L.socket)}
        </Lbl>
        <Lbl small={small} x={64} y={108} anchor="end" size={10}>
          {t(L.springs)}
        </Lbl>
        <Lbl small={small} x={120} y={147} color="var(--muted)" size={10}>
          {t(L.loadBoard)}
        </Lbl>
      </g>
    )
  },

  /* 俯视：圆形 PCB，边缘一圈接测试头的焊盘；中间窗口里探针指向 die 的 pad */
  probecard: ({ small, t }) => {
    const rim = range(24).map((i) => (i / 24) * Math.PI * 2)
    const offs = [-6, -2, 2, 6]
    const tip = 8
    const far = 26
    return (
      <g>
        <circle cx="120" cy="72" r="62" fill="var(--blue-bg)" stroke="var(--blue)" />
        {rim.map((a) => (
          <g key={a}>
            <circle cx={120 + Math.cos(a) * 55} cy={72 + Math.sin(a) * 55} r="2" fill="var(--gold)" />
            <line
              x1={120 + Math.cos(a) * 52}
              y1={72 + Math.sin(a) * 52}
              x2={120 + Math.cos(a) * 36}
              y2={72 + Math.sin(a) * 36}
              stroke="var(--gold-line)"
              strokeWidth="0.8"
            />
          </g>
        ))}
        <rect x="96" y="48" width="48" height="48" fill="var(--well)" stroke="var(--line-3)" />
        <rect x="110" y="62" width="20" height="20" fill="var(--fig-box)" stroke="var(--line-2)" />
        {offs.map((o) => (
          <g key={o} fill="var(--gold-bg-2)" stroke="var(--gold)" strokeWidth="0.5">
            <rect x={120 + o - 1.2} y={72 - tip - 1.2} width="2.4" height="2.4" />
            <rect x={120 + o - 1.2} y={72 + tip - 1.2} width="2.4" height="2.4" />
            <rect x={120 - tip - 1.2} y={72 + o - 1.2} width="2.4" height="2.4" />
            <rect x={120 + tip - 1.2} y={72 + o - 1.2} width="2.4" height="2.4" />
          </g>
        ))}
        {offs.map((o) => (
          <g key={`n${o}`} stroke="var(--gold)" strokeWidth="1.2">
            <line x1={120 + o * 1.8} y1={72 - far} x2={120 + o} y2={72 - tip} />
            <line x1={120 + o * 1.8} y1={72 + far} x2={120 + o} y2={72 + tip} />
            <line x1={120 - far} y1={72 + o * 1.8} x2={120 - tip} y2={72 + o} />
            <line x1={120 + far} y1={72 + o * 1.8} x2={120 + tip} y2={72 + o} />
          </g>
        ))}
        <Lbl small={small} x={120} y={146}>
          {t(L.probeCard)}
        </Lbl>
      </g>
    )
  },

  /* 俯视：进料盘 → 测试位（Socket）→ 按 Bin 放进三个出料盘 */
  handler: ({ small, t }) => {
    const trays = [
      { y: 40, bin: 1 as const },
      { y: 72, bin: 3 as const },
      { y: 104, bin: 5 as const },
    ]
    const chip = { fill: 'var(--neutral-fill)', stroke: 'var(--text-2)', strokeWidth: 0.6 }
    return (
      <g>
        <rect x="8" y="30" width="224" height="112" rx="6" fill="var(--fig-box)" stroke="var(--line-3)" />
        <rect x="16" y="50" width="56" height="62" rx="2" fill="var(--fig-box-2)" stroke="var(--line-2)" />
        {range(3).map((i) => range(4).map((j) => <rect key={`${i}-${j}`} x={21 + i * 17} y={55 + j * 14} width="12" height="10" rx="1" {...chip} />))}
        <rect x="96" y="62" width="48" height="48" rx="3" fill="var(--blue-bg)" stroke="var(--blue)" />
        <rect x="108" y="74" width="24" height="24" rx="1" {...chip} />
        {trays.map((tr) => (
          <g key={tr.bin}>
            <rect x="164" y={tr.y} width="62" height="26" rx="2" fill="var(--fig-box-2)" stroke={BIN_FILL[tr.bin]} />
            <rect x="203" y={tr.y + 9} width="8" height="8" rx="1" {...chip} />
            <rect x="214" y={tr.y + 9} width="8" height="8" rx="1" {...chip} />
            <path d={`M146 86 C155 86 152 ${tr.y + 13} 158 ${tr.y + 13}`} fill="none" stroke="var(--gold)" strokeWidth="1.3" strokeDasharray="3 2" />
            <Tri x={163} y={tr.y + 13} deg={0} color="var(--gold)" />
            <Lbl small={small} x={169} y={tr.y + 17} anchor="start" color={BIN_FILL[tr.bin]} size={10} mono>
              {`Bin ${tr.bin}`}
            </Lbl>
          </g>
        ))}
        <path d="M74 86 H89" fill="none" stroke="var(--gold)" strokeWidth="1.3" strokeDasharray="3 2" />
        <Tri x={95} y={86} deg={0} color="var(--gold)" />
        <Lbl small={small} x={44} y={128} size={10}>
          {t(L.input)}
        </Lbl>
        <Lbl small={small} x={120} y={124} size={10}>
          {t(L.site)}
        </Lbl>
        <Lbl small={small} x={120} y={22}>
          Handler
        </Lbl>
      </g>
    )
  },

  /* 测试程序：按顺序跑，每项和限值比较；VOH 失败 → Bin 3（DC 失败） */
  testprogram: ({ small, t }) => {
    const rows = [
      { n: 'Continuity', v: '−0.62 V', lim: '−1~−0.2', r: 'PASS' },
      { n: 'IDDQ', v: '12 µA', lim: '≤50 µA', r: 'PASS' },
      { n: 'Functional', v: '0 fail', lim: '0 fail', r: 'PASS' },
      { n: 'VOH', v: '2.31 V', lim: '≥2.4 V', r: 'FAIL' },
    ]
    return (
      <g>
        <rect x="12" y="12" width="216" height="126" rx="6" fill="var(--fig-box)" stroke="var(--line-3)" />
        <rect x="12" y="12" width="216" height="16" rx="6" fill="var(--fig-box-2)" />
        {range(3).map((i) => (
          <circle key={i} cx={22 + i * 9} cy="20" r="2.6" fill="var(--line-3)" />
        ))}
        {!small ? (
          <g fontSize="9" fill="var(--muted)">
            <text x="24" y="42">
              {t(L.colTest)}
            </text>
            <text x="132" y="42" textAnchor="end">
              {t(L.colValue)}
            </text>
            <text x="190" y="42" textAnchor="end">
              {t(L.colLimit)}
            </text>
            <text x="222" y="42" textAnchor="end">
              {t(L.colResult)}
            </text>
          </g>
        ) : null}
        {rows.map((row, i) => {
          const y = 60 + i * 18
          const fail = row.r === 'FAIL'
          const color = fail ? 'var(--red)' : 'var(--green)'
          return small ? (
            <g key={row.n}>
              <rect x="24" y={y - 7} width="110" height="6" rx="2" fill="var(--line-2)" />
              <rect x="176" y={y - 7} width="40" height="6" rx="2" fill={color} />
            </g>
          ) : (
            <g key={row.n} fontFamily="var(--mono)" fontSize="10">
              {fail ? <rect x="18" y={y - 11} width="208" height="15" rx="2" fill="var(--red-bg)" /> : null}
              <text x="24" y={y} fill="var(--text-2)">
                {row.n}
              </text>
              <text x="132" y={y} textAnchor="end" fill="var(--text)">
                {row.v}
              </text>
              <text x="190" y={y} textAnchor="end" fill="var(--muted)">
                {row.lim}
              </text>
              <text x="222" y={y} textAnchor="end" fill={color}>
                {row.r}
              </text>
            </g>
          )
        })}
        <line x1="20" y1="122" x2="220" y2="122" stroke="var(--line-2)" />
        {small ? (
          <rect x="156" y="127" width="60" height="7" rx="2" fill={BIN_FILL[3]} />
        ) : (
          <text x="222" y="134" textAnchor="end" fill={BIN_FILL[3]} fontSize="12" fontFamily="var(--mono)">
            → Bin 3
          </text>
        )}
      </g>
    )
  },

  /* Pattern：Y = A·B + C，每一行都按这个逻辑写期望值 */
  testpattern: ({ small, t }) => {
    const rows = ['1 0 1 H', '0 0 0 L', '1 1 0 X', '0 1 1 H', '0 1 0 L']
    const cur = 3
    const colX = [88, 114, 140]
    return (
      <g>
        <rect x="24" y={36 + cur * 18} width="192" height="17" rx="3" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        <line x1="166" y1="14" x2="166" y2="128" stroke="var(--line-2)" strokeDasharray="3 3" />
        {small
          ? rows.map((_, i) => (
              <g key={i}>
                <rect x="76" y={40 + i * 18} width="76" height="8" rx="2" fill="var(--sky)" opacity="0.6" />
                <rect x="180" y={40 + i * 18} width="24" height="8" rx="2" fill="var(--gold)" opacity="0.7" />
              </g>
            ))
          : null}
        {!small ? (
          <g fontFamily="var(--mono)" fontSize="13">
            <text x="44" y="26" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="inherit">
              {t(L.cycle)}
            </text>
            {['A', 'B', 'C'].map((p, k) => (
              <text key={p} x={colX[k]} y="26" textAnchor="middle" fill="var(--sky)">
                {p}
              </text>
            ))}
            <text x="192" y="26" textAnchor="middle" fill="var(--gold)">
              Y
            </text>
            {rows.map((row, i) => {
              const cells = row.split(' ')
              const y = 49 + i * 18
              return (
                <g key={i}>
                  <text x="44" y={y} textAnchor="middle" fill="var(--dim)" fontSize="11">
                    {i}
                  </text>
                  {cells.slice(0, 3).map((c, k) => (
                    <text key={k} x={colX[k]} y={y} textAnchor="middle" fill="var(--text)">
                      {c}
                    </text>
                  ))}
                  <text x="192" y={y} textAnchor="middle" fill={cells[3] === 'X' ? 'var(--dim)' : 'var(--gold)'}>
                    {cells[3]}
                  </text>
                </g>
              )
            })}
            <text x="114" y="142" textAnchor="middle" fill="var(--sky)" fontSize="10" fontFamily="inherit">
              {t(L.inputs)}
            </text>
            <text x="194" y="142" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="inherit">
              {t(L.output)}
            </text>
          </g>
        ) : null}
      </g>
    )
  },

  bin: ({ small, t }) => (
    <g>
      <WaferMap cx={small ? 120 : 78} cy={75} />
      {!small
        ? [
            { bin: 1 as const, text: L.bin1 },
            { bin: 3 as const, text: L.bin3 },
            { bin: 5 as const, text: L.bin5 },
          ].map((b, i) => {
            const y = 44 + i * 34
            return (
              <g key={b.bin}>
                <rect x="158" y={y - 9} width="10" height="10" rx="1" fill={BIN_FILL[b.bin]} />
                <text x="174" y={y} fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
                  {`Bin ${b.bin}`}
                </text>
                <text x="174" y={y + 14} fill="var(--muted)" fontSize="10">
                  {t(b.text)}
                </text>
              </g>
            )
          })
        : null}
    </g>
  ),

  yield: ({ small, t }) => {
    const pct = Math.round((GOOD / CELLS.length) * 100)
    return (
      <g>
        <WaferMap cx={small ? 120 : 78} cy={75} />
        {!small ? (
          <g>
            <text x="194" y="68" textAnchor="middle" fill="var(--green)" fontSize="26" fontFamily="var(--mono)">
              {`${pct}%`}
            </text>
            <text x="194" y="90" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
              {`${GOOD} / ${CELLS.length}`}
            </text>
            <text x="194" y="106" textAnchor="middle" fill="var(--muted)" fontSize="10">
              {`${t(L.good)} / ${t(L.tested)}`}
            </text>
          </g>
        ) : null}
      </g>
    )
  },
}
