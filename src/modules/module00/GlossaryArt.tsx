import { useId, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type TermId } from './data/content'

const L = {
  probeCard: loc('Probe Card', 'Probe Card'),
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

/* ---------- 晶圆 Bin 图（Bin / Yield 共用） ---------- */

type Cell = { x: number; y: number; bin: 1 | 3 | 5 }

function waferCells(cx: number, cy: number, r: number, size: number): Cell[] {
  const cells: Cell[] = []
  const n = Math.ceil(r / size)
  for (let i = -n; i < n; i += 1) {
    for (let j = -n; j < n; j += 1) {
      const x = cx + i * size
      const y = cy + j * size
      const dx = x + size / 2 - cx
      const dy = y + size / 2 - cy
      const d = Math.hypot(dx, dy)
      if (d > r - size * 0.6) continue
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

const BIN_FILL: Record<Cell['bin'], string> = { 1: 'var(--green)', 3: 'var(--gold)', 5: 'var(--red)' }

function WaferMap({ cx, cy, r, size }: { cx: number; cy: number; r: number; size: number }) {
  const cells = waferCells(cx, cy, r, size)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x + 0.8}
          y={c.y + 0.8}
          width={size - 1.6}
          height={size - 1.6}
          rx="1"
          fill={BIN_FILL[c.bin]}
          opacity="0.85"
        />
      ))}
      <path d={`M${cx - 8} ${cy + r - 1} L${cx + 8} ${cy + r - 1}`} stroke="var(--well)" strokeWidth="4" />
    </g>
  )
}

/* ---------- 各术语插图 ---------- */

const ARTS: Record<TermId, (p: ArtProps) => ReactNode> = {
  cp: ({ small, t, uid }) => (
    <g>
      <defs>
        <clipPath id={`${uid}-w`}>
          <ellipse cx="120" cy="114" rx="88" ry="14" />
        </clipPath>
      </defs>
      <rect x="36" y="118" width="168" height="16" rx="3" fill="var(--fig-box-2)" stroke="var(--line-2)" />
      <ellipse cx="120" cy="114" rx="88" ry="14" fill="var(--fig-box)" stroke="var(--line-3)" />
      <g clipPath={`url(#${uid}-w)`} stroke="var(--line-2)" strokeWidth="0.8">
        {range(13).map((i) => (
          <line key={`v${i}`} x1={36 + i * 14} y1="98" x2={36 + i * 14 - 6} y2="130" />
        ))}
        {range(4).map((i) => (
          <line key={`h${i}`} x1="30" y1={104 + i * 6} x2="210" y2={104 + i * 6} />
        ))}
      </g>
      <rect x="110" y="109" width="20" height="7" fill="var(--gold-bg-2)" stroke="var(--gold)" />
      <rect x="60" y="8" width="120" height="16" rx="3" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="28" y="34" width="184" height="16" rx="3" fill="var(--blue-bg)" stroke="var(--blue)" />
      <rect x="100" y="34" width="40" height="16" fill="var(--well)" stroke="var(--blue)" />
      <path d="M120 24 V34" stroke="var(--line-3)" strokeWidth="6" />
      {[
        [96, 113],
        [104, 117],
        [136, 123],
        [144, 127],
      ].map(([x1, x2]) => (
        <line key={x1} x1={x1} y1="48" x2={x2} y2="110" stroke="var(--gold)" strokeWidth="1.6" />
      ))}
      <Lbl small={small} x={196} y={62}>
        {t(L.probeCard)}
      </Lbl>
      <Lbl small={small} x={196} y={102}>
        {t(L.wafer)}
      </Lbl>
      <Lbl small={small} x={120} y={145} color="var(--muted)">
        {t(L.chuck)}
      </Lbl>
      <Lbl small={small} x={120} y={20} color="var(--muted)">
        {t(L.testHead)}
      </Lbl>
    </g>
  ),

  ft: ({ small, t }) => (
    <g>
      <rect x="100" y="22" width="40" height="30" rx="3" fill="var(--blue-bg)" stroke="var(--blue)" />
      <path d="M120 54 V64 M115 59 L120 65 L125 59" fill="none" stroke="var(--blue)" strokeWidth="1.6" />
      <rect x="92" y="68" width="56" height="13" rx="2" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      {range(6).map((i) => (
        <circle key={`b${i}`} cx={98 + i * 9} cy="84" r="2.6" fill="var(--gold)" />
      ))}
      <rect x="72" y="78" width="96" height="30" rx="3" fill="var(--fig-box)" stroke="var(--line-3)" />
      <rect x="88" y="78" width="64" height="9" fill="var(--well)" />
      {range(6).map((i) => (
        <line key={`p${i}`} x1={98 + i * 9} y1="88" x2={98 + i * 9} y2="108" stroke="var(--gold)" strokeWidth="1.4" />
      ))}
      <rect x="28" y="108" width="184" height="10" rx="2" fill="var(--green-bg)" stroke="var(--green-line)" />
      <rect x="18" y="122" width="204" height="18" rx="3" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <Lbl small={small} x={146} y={40} anchor="start">
        {t(L.plunger)}
      </Lbl>
      <Lbl small={small} x={174} y={96} anchor="start">
        {t(L.socket)}
      </Lbl>
      <Lbl small={small} x={66} y={74} anchor="end" color="var(--gold)">
        DUT
      </Lbl>
      <Lbl small={small} x={36} y={104} anchor="start">
        {t(L.loadBoard)}
      </Lbl>
      <Lbl small={small} x={120} y={135} color="var(--muted)">
        {t(L.testHead)}
      </Lbl>
    </g>
  ),

  ate: ({ small, t }) => (
    <g>
      <line x1="10" y1="138" x2="230" y2="138" stroke="var(--line-2)" />
      <rect x="16" y="30" width="74" height="108" rx="4" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {range(9).map((i) => (
        <rect key={i} x="24" y={38 + i * 10} width="58" height="6" rx="1" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="0.6" />
      ))}
      <circle cx="78" cy="132" r="2" fill="var(--green)" />
      <path d="M90 104 C118 104 116 92 132 90" fill="none" stroke="var(--blue)" strokeWidth="4" />
      <rect x="166" y="100" width="16" height="38" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="128" y="64" width="96" height="36" rx="4" fill="var(--blue-bg)" stroke="var(--blue)" />
      <rect x="140" y="58" width="72" height="6" fill="var(--green-bg)" stroke="var(--green-line)" />
      <rect x="168" y="50" width="16" height="8" rx="1" fill="var(--gold)" />
      <Lbl small={small} x={53} y={22}>
        {t(L.mainframe)}
      </Lbl>
      <Lbl small={small} x={176} y={86}>
        {t(L.testHead)}
      </Lbl>
      <Lbl small={small} x={190} y={46} anchor="start" color="var(--gold)">
        DUT
      </Lbl>
      <Lbl small={small} x={112} y={120} color="var(--muted)" size={10}>
        {t(L.cable)}
      </Lbl>
    </g>
  ),

  dut: ({ small }) => {
    const pos = range(8).map((i) => 44 + i * 9)
    return (
      <g>
        {pos.map((p) => (
          <g key={p} fill="var(--text-2)">
            <rect x={p} y="25" width="4" height="10" />
            <rect x={p} y="115" width="4" height="10" />
            <rect x="70" y={p} width="10" height="4" />
            <rect x="160" y={p} width="10" height="4" />
          </g>
        ))}
        <rect x="80" y="35" width="80" height="80" rx="4" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <circle cx="91" cy="46" r="3" fill="var(--muted)" />
        <Lbl small={small} x={120} y={80} color="var(--text)" size={15} mono>
          DUT
        </Lbl>
      </g>
    )
  },

  tester: ({ small, t }) => (
    <g>
      <rect x="30" y="48" width="180" height="84" rx="6" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {range(8).map((i) => (
        <g key={i}>
          <rect x={42 + i * 21} y="58" width="14" height="66" rx="1" fill="var(--blue-bg)" stroke="var(--blue)" />
          <rect x={45 + i * 21} y="70" width="8" height="8" fill="var(--blue)" opacity="0.6" />
          <rect x={45 + i * 21} y="90" width="8" height="8" fill="var(--blue)" opacity="0.6" />
        </g>
      ))}
      <rect x="30" y="36" width="180" height="12" rx="2" fill="var(--fig-box)" stroke="var(--line-3)" />
      {range(24).map((i) => (
        <g key={i}>
          <line x1={38 + i * 7} y1="28" x2={38 + i * 7} y2="36" stroke="var(--gold)" strokeWidth="1.2" />
          <circle cx={38 + i * 7} cy="27" r="1.4" fill="var(--gold)" />
        </g>
      ))}
      <Lbl small={small} x={120} y={18}>
        {t(L.pogo)}
      </Lbl>
      <Lbl small={small} x={120} y={145}>
        {t(L.boards)}
      </Lbl>
    </g>
  ),

  loadboard: ({ small, t }) => {
    const xs = range(8).map((i) => 36 + i * 24)
    const site = { x: 92, y: 48, s: 56 }
    const target = (i: number) => site.x + 7 + i * 6
    return (
      <g>
        <rect x="18" y="12" width="204" height="126" rx="8" fill="var(--green-bg)" stroke="var(--green-line)" />
        {xs.map((x, i) => (
          <g key={x}>
            <rect x={x - 3} y="16" width="6" height="6" fill="var(--gold)" />
            <rect x={x - 3} y="128" width="6" height="6" fill="var(--gold)" />
            <path d={`M${x} 22 L${x} 32 L${target(i)} ${site.y - 2} L${target(i)} ${site.y + 4}`} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
            <path
              d={`M${x} 128 L${x} 118 L${target(i)} ${site.y + site.s + 2} L${target(i)} ${site.y + site.s - 4}`}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.2"
            />
            {i % 3 === 1 ? <circle cx={x} cy="30" r="2.4" fill="var(--blue)" /> : null}
            {i % 3 === 2 ? <circle cx={x} cy="120" r="2.4" fill="var(--blue)" /> : null}
          </g>
        ))}
        <rect x={site.x} y={site.y} width={site.s} height={site.s} rx="3" fill="var(--fig-box)" stroke="var(--text-2)" strokeDasharray="4 3" />
        <Lbl small={small} x={120} y={80} size={10}>
          {t(L.socket)}
        </Lbl>
      </g>
    )
  },

  socket: ({ small, t }) => (
    <g>
      <rect x="50" y="86" width="140" height="44" rx="3" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      <rect x="74" y="86" width="92" height="10" fill="var(--well)" />
      {range(6).map((i) => {
        const x = 85 + i * 14
        return (
          <g key={i}>
            <line x1={x} y1="89" x2={x} y2="97" stroke="var(--gold)" strokeWidth="1.6" />
            <path d={`M${x} 97 l4 3 l-8 4 l8 4 l-8 4 l8 4 l-4 3`} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
            <circle cx={x} cy="85" r="3" fill="var(--gold)" />
          </g>
        )
      })}
      <rect x="76" y="70" width="88" height="12" rx="2" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      <g transform="translate(190 84) rotate(60)">
        <rect x="-84" y="-6" width="84" height="9" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
      </g>
      <circle cx="190" cy="84" r="4" fill="var(--fig-box)" stroke="var(--line-3)" />
      <Lbl small={small} x={120} y={64} color="var(--gold)">
        DUT
      </Lbl>
      <Lbl small={small} x={178} y={20} anchor="start">
        {t(L.lid)}
      </Lbl>
      <Lbl small={small} x={120} y={144}>
        {t(L.springs)}
      </Lbl>
    </g>
  ),

  probecard: ({ small, t }) => {
    const rim = range(24).map((i) => (i / 24) * Math.PI * 2)
    const sides = range(4)
    return (
      <g>
        <circle cx="120" cy="72" r="62" fill="var(--blue-bg)" stroke="var(--blue)" />
        {rim.map((a) => (
          <g key={a}>
            <circle cx={120 + Math.cos(a) * 55} cy={72 + Math.sin(a) * 55} r="2" fill="var(--gold)" />
            <line
              x1={120 + Math.cos(a) * 52}
              y1={72 + Math.sin(a) * 52}
              x2={120 + Math.cos(a) * 34}
              y2={72 + Math.sin(a) * 34}
              stroke="var(--gold-line)"
              strokeWidth="0.8"
            />
          </g>
        ))}
        <rect x="96" y="48" width="48" height="48" fill="var(--well)" stroke="var(--line-3)" />
        <rect x="110" y="62" width="20" height="20" fill="var(--fig-box)" stroke="var(--line-2)" />
        {sides.map((s) =>
          range(4).map((k) => {
            const off = -6 + k * 4
            const tip = 6
            const far = 28
            const pts =
              s === 0
                ? [120 + off * 1.8, 72 - far, 120 + off, 72 - tip - 2]
                : s === 1
                  ? [120 + far, 72 + off * 1.8, 120 + tip + 2, 72 + off]
                  : s === 2
                    ? [120 + off * 1.8, 72 + far, 120 + off, 72 + tip + 2]
                    : [120 - far, 72 + off * 1.8, 120 - tip - 2, 72 + off]
            return <line key={`${s}-${k}`} x1={pts[0]} y1={pts[1]} x2={pts[2]} y2={pts[3]} stroke="var(--gold)" strokeWidth="1.2" />
          }),
        )}
        <Lbl small={small} x={120} y={146}>
          {t(L.probeCard)}
        </Lbl>
      </g>
    )
  },

  handler: ({ small, t }) => (
    <g>
      <rect x="8" y="34" width="224" height="104" rx="6" fill="var(--fig-box)" stroke="var(--line-3)" />
      <line x1="20" y1="48" x2="220" y2="48" stroke="var(--line-3)" strokeWidth="3" />
      <rect x="108" y="44" width="24" height="14" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
      <line x1="120" y1="58" x2="120" y2="80" stroke="var(--blue)" strokeWidth="2" />
      <rect x="112" y="80" width="16" height="6" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      <rect x="18" y="100" width="56" height="24" rx="2" fill="var(--fig-box-2)" stroke="var(--line-2)" />
      {range(3).map((i) =>
        range(2).map((j) => (
          <rect key={`${i}-${j}`} x={23 + i * 17} y={104 + j * 10} width="12" height="6" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" strokeWidth="0.6" />
        )),
      )}
      <rect x="100" y="108" width="40" height="16" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
      {[
        { y: 62, bin: 'Bin 1', c: 'var(--green)' },
        { y: 86, bin: 'Bin 2', c: 'var(--gold)' },
        { y: 110, bin: 'Bin 6', c: 'var(--red)' },
      ].map((b) => (
        <g key={b.bin}>
          <rect x="168" y={b.y} width="56" height="16" rx="2" fill="var(--fig-box-2)" stroke={b.c} />
          <Lbl small={small} x={196} y={b.y + 12} color={b.c} size={10} mono>
            {b.bin}
          </Lbl>
        </g>
      ))}
      <path d="M46 98 C60 70 90 70 112 84 M128 84 C145 70 155 70 166 70" fill="none" stroke="var(--gold)" strokeWidth="1.3" strokeDasharray="4 3" />
      <Lbl small={small} x={46} y={134} size={10}>
        {t(L.input)}
      </Lbl>
      <Lbl small={small} x={120} y={134} size={10}>
        {t(L.site)}
      </Lbl>
      <Lbl small={small} x={120} y={26}>
        Handler
      </Lbl>
    </g>
  ),

  testprogram: ({ small }) => {
    const rows = [
      { n: '1 Continuity', v: '−0.65 V', r: 'PASS' },
      { n: '2 IDDQ', v: '12 µA', r: 'PASS' },
      { n: '3 Functional', v: '—', r: 'PASS' },
      { n: '4 VOH', v: '2.31 V', r: 'FAIL' },
    ]
    return (
      <g>
        <rect x="16" y="14" width="208" height="122" rx="6" fill="var(--fig-box)" stroke="var(--line-3)" />
        <rect x="16" y="14" width="208" height="16" rx="6" fill="var(--fig-box-2)" />
        {range(3).map((i) => (
          <circle key={i} cx={26 + i * 9} cy="22" r="2.6" fill="var(--line-3)" />
        ))}
        {rows.map((row, i) => {
          const y = 50 + i * 18
          const fail = row.r === 'FAIL'
          const color = fail ? 'var(--red)' : 'var(--green)'
          return small ? (
            <g key={row.n}>
              <rect x="26" y={y - 7} width="110" height="6" rx="2" fill="var(--line-2)" />
              <rect x="170" y={y - 7} width="40" height="6" rx="2" fill={color} />
            </g>
          ) : (
            <g key={row.n} fontFamily="var(--mono)" fontSize="11">
              <text x="26" y={y} fill="var(--text-2)">
                {row.n}
              </text>
              <text x="150" y={y} textAnchor="end" fill="var(--text)">
                {row.v}
              </text>
              <text x="212" y={y} textAnchor="end" fill={color}>
                {row.r}
              </text>
            </g>
          )
        })}
        <line x1="26" y1="114" x2="214" y2="114" stroke="var(--line-2)" />
        {small ? (
          <rect x="150" y="120" width="60" height="7" rx="2" fill="var(--red)" />
        ) : (
          <text x="212" y="128" textAnchor="end" fill="var(--red)" fontSize="12" fontFamily="var(--mono)">
            → Bin 4
          </text>
        )}
      </g>
    )
  },

  testpattern: ({ small, t }) => {
    const rows = ['1 0 1 H', '0 0 1 L', '1 1 0 X', '0 1 1 H', '1 1 1 L']
    const cur = 2
    return (
      <g>
        <rect x="30" y={36 + cur * 18} width="180" height="17" rx="3" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        {small
          ? rows.map((_, i) => (
              <g key={i}>
                <rect x="44" y={40 + i * 18} width="90" height="8" rx="2" fill="var(--sky)" opacity="0.6" />
                <rect x="160" y={40 + i * 18} width="24" height="8" rx="2" fill="var(--gold)" opacity="0.7" />
              </g>
            ))
          : null}
        {!small ? (
          <g fontFamily="var(--mono)" fontSize="13">
            <text x="54" y="26" textAnchor="middle" fill="var(--muted)" fontSize="11">
              {t(L.cycle)}
            </text>
            {['A', 'B', 'C'].map((p, k) => (
              <text key={p} x={100 + k * 26} y="26" textAnchor="middle" fill="var(--sky)">
                {p}
              </text>
            ))}
            <text x="184" y="26" textAnchor="middle" fill="var(--gold)">
              Y
            </text>
            {rows.map((row, i) => {
              const cells = row.split(' ')
              const y = 49 + i * 18
              return (
                <g key={i}>
                  <text x="54" y={y} textAnchor="middle" fill="var(--dim)" fontSize="11">
                    {i}
                  </text>
                  {cells.slice(0, 3).map((c, k) => (
                    <text key={k} x={100 + k * 26} y={y} textAnchor="middle" fill="var(--text)">
                      {c}
                    </text>
                  ))}
                  <text x="184" y={y} textAnchor="middle" fill={cells[3] === 'X' ? 'var(--dim)' : 'var(--gold)'}>
                    {cells[3]}
                  </text>
                </g>
              )
            })}
            <text x="126" y="140" textAnchor="middle" fill="var(--sky)" fontSize="10" fontFamily="inherit">
              {t(L.inputs)}
            </text>
            <text x="200" y="140" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="inherit">
              {t(L.output)}
            </text>
          </g>
        ) : null}
      </g>
    )
  },

  bin: ({ small }) => (
    <g>
      <WaferMap cx={small ? 120 : 100} cy={75} r={62} size={11} />
      {!small
        ? [
            { bin: 'Bin 1', c: BIN_FILL[1] },
            { bin: 'Bin 3', c: BIN_FILL[3] },
            { bin: 'Bin 5', c: BIN_FILL[5] },
          ].map((b, i) => (
            <g key={b.bin}>
              <rect x="180" y={52 + i * 20} width="10" height="10" rx="1" fill={b.c} />
              <text x="196" y={61 + i * 20} fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
                {b.bin}
              </text>
            </g>
          ))
        : null}
    </g>
  ),

  yield: ({ small, t }) => {
    const cells = waferCells(90, 75, 60, 11)
    const good = cells.filter((c) => c.bin === 1).length
    const pct = Math.round((good / cells.length) * 100)
    return (
      <g>
        <WaferMap cx={small ? 120 : 90} cy={75} r={60} size={11} />
        {!small ? (
          <g>
            <text x="198" y="70" textAnchor="middle" fill="var(--green)" fontSize="26" fontFamily="var(--mono)">
              {`${pct}%`}
            </text>
            <text x="198" y="92" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
              {`${good} / ${cells.length}`}
            </text>
            <text x="198" y="108" textAnchor="middle" fill="var(--muted)" fontSize="10">
              {`${t(L.good)} / ${t(L.tested)}`}
            </text>
          </g>
        ) : null}
      </g>
    )
  },
}
