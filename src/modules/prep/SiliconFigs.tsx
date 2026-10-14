import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from './common'
import { LITHO_LABEL, MAKE, STACK, STACK_CAP, type DieSizeId, type StackId } from './data/silicon'

const L = {
  makeCap: loc('每一格是一道工序的样子；金框是当前这一步。', 'Each panel shows one stage; the gold frame is the current step.'),
  mapCap: loc(
    '300 mm 晶圆俯视图，底部缺口是 Notch。缺陷点的位置两种尺寸下完全相同。',
    '300 mm wafer, top view; the cut at the bottom is the notch. Defect positions are identical for both die sizes.',
  ),
  lgGood: loc('好 Die', 'Good die'),
  lgBad: loc('坏 Die（有缺陷）', 'Bad die (has a defect)'),
  lgEdge: loc('边缘不完整，不测', 'Partial edge die, not tested'),
  lgDefect: loc('缺陷点', 'Defect'),
  lgExcl: loc('边缘 3 mm 不放 Die', 'No dies in the outer 3 mm'),
  dieLabel: loc('Die', 'Die'),
}

/* ---------- 从沙子到晶圆 ---------- */

const PANEL_W = 140
const panelX = (i: number) => 10 + i * 150

function MakeIcon({ i, cx }: { i: number; cx: number }) {
  if (i === 0) {
    const grains = [
      [-30, 128],
      [-18, 116],
      [-6, 104],
      [6, 98],
      [18, 112],
      [30, 126],
      [-10, 124],
      [12, 128],
      [0, 116],
      [-22, 132],
      [24, 134],
    ]
    return (
      <g>
        <path d={`M${cx - 52} 140 Q${cx} 64 ${cx + 52} 140 Z`} fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        {grains.map(([dx, y]) => (
          <circle key={`${dx}-${y}`} cx={cx + dx} cy={y} r="1.8" fill="var(--gold)" opacity="0.7" />
        ))}
      </g>
    )
  }
  if (i === 1) {
    const rocks = [
      `M${cx - 44} 140 l6 -22 l18 -6 l12 14 l-4 14 Z`,
      `M${cx - 14} 140 l2 -26 l16 -10 l16 8 l2 28 Z`,
      `M${cx + 20} 140 l4 -18 l14 -4 l10 12 l-2 10 Z`,
      `M${cx - 30} 116 l8 -18 l16 0 l6 14 l-12 8 Z`,
      `M${cx + 2} 104 l10 -14 l14 4 l0 14 l-14 6 Z`,
    ]
    return (
      <g>
        {rocks.map((d) => (
          <path key={d} d={d} fill="var(--neutral-fill)" stroke="var(--text-2)" strokeWidth="0.8" />
        ))}
      </g>
    )
  }
  if (i === 2) {
    return (
      <g>
        <line x1={cx} y1="20" x2={cx} y2="44" stroke="var(--text-2)" strokeWidth="2" />
        <path d={`M${cx - 10} 30 a10 4 0 1 0 20 0`} fill="none" stroke="var(--blue)" strokeWidth="1.2" />
        <path d={`M${cx + 10} 30 l-4 -3 M${cx + 10} 30 l-1 -4`} stroke="var(--blue)" strokeWidth="1.2" />
        <path d={`M${cx + 24} 66 V40 M${cx + 20} 46 L${cx + 24} 40 L${cx + 28} 46`} fill="none" stroke="var(--blue)" strokeWidth="1.4" />
        <path d={`M${cx - 2} 44 L${cx - 14} 56 V112 H${cx + 14} V56 L${cx + 2} 44 Z`} fill="var(--fig-box-2)" stroke="var(--text-2)" />
        <path d={`M${cx - 40} 108 V132 Q${cx - 40} 146 ${cx - 26} 146 H${cx + 26} Q${cx + 40} 146 ${cx + 40} 132 V108`} fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <path d={`M${cx - 38} 116 H${cx + 38} V132 Q${cx + 38} 144 ${cx + 26} 144 H${cx - 26} Q${cx - 38} 144 ${cx - 38} 132 Z`} fill="var(--red-bg)" stroke="var(--red-line)" strokeWidth="0.8" />
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <rect x={cx - 52} y={104 + k * 11} width="6" height="7" fill="var(--red)" opacity="0.6" />
            <rect x={cx + 46} y={104 + k * 11} width="6" height="7" fill="var(--red)" opacity="0.6" />
          </g>
        ))}
      </g>
    )
  }
  if (i === 3) {
    return (
      <g>
        <path d={`M${cx - 48} 70 H${cx + 22} A8 20 0 0 1 ${cx + 22} 110 H${cx - 48} A8 20 0 0 1 ${cx - 48} 70 Z`} fill="var(--fig-box-2)" stroke="var(--text-2)" />
        <ellipse cx={cx + 22} cy="90" rx="8" ry="20" fill="var(--fig-box)" stroke="var(--text-2)" />
        <path d={`M${cx - 48} 73 H${cx + 22}`} stroke="var(--muted)" strokeDasharray="3 2" />
        {[-36, -24, -12, 0, 12].map((d) => (
          <line key={d} x1={cx + d} y1="56" x2={cx + d} y2="124" stroke="var(--blue)" strokeWidth="1" />
        ))}
        {[36, 46].map((d) => (
          <ellipse key={d} cx={cx + d} cy="96" rx="3" ry="20" fill="var(--fig-box)" stroke="var(--text-2)" />
        ))}
      </g>
    )
  }
  return (
    <g>
      <circle cx={cx} cy="82" r="46" fill="var(--fig-box-2)" stroke="var(--text-2)" />
      <path d={`M${cx - 26} 60 Q${cx - 10} 48 ${cx + 8} 50`} fill="none" stroke="var(--card)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d={`M${cx - 4} 128 L${cx} 122 L${cx + 4} 128 Z`} fill="var(--well)" />
      <rect x={cx - 46} y="140" width="92" height="3" fill="var(--fig-box-2)" stroke="var(--text-2)" strokeWidth="0.6" />
    </g>
  )
}

export function WaferMakeFig({ step, onPick }: { step: number; onPick: (i: number) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 220" className="term-fig__svg" role="group" aria-label={t(L.makeCap)}>
        <rect width="760" height="220" rx="10" fill="var(--well)" />
        {MAKE.map((m, i) => {
          const x = panelX(i)
          const cx = x + PANEL_W / 2
          const on = i === step
          return (
            <Hit key={m.title.zh} label={t(m.title)} active={on} onPick={() => onPick(i)}>
              <g opacity={i > step ? 0.35 : 1} style={{ transition: 'opacity 0.4s' }}>
                <rect x={x} y="10" width={PANEL_W} height="172" rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
                <MakeIcon i={i} cx={cx} />
                <text x={cx} y="168" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
                  {t(m.tag)}
                </text>
                <text x={cx} y="202" textAnchor="middle" fill={on ? 'var(--gold)' : 'var(--text)'} fontSize="11" fontWeight={on ? 700 : 400}>
                  {t(m.title)}
                </text>
              </g>
              {i < MAKE.length - 1 ? (
                <path d={`M${x + PANEL_W + 2} 96 l6 0 m-3 -3 l3 3 l-3 3`} fill="none" stroke={i < step ? 'var(--gold)' : 'var(--muted)'} strokeWidth="1.4" />
              ) : null}
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(L.makeCap)}</figcaption>
    </figure>
  )
}

/* ---------- 晶圆图 ---------- */

const R_MM = 150
const EXCL_MM = 3
const K = 170 / R_MM
const WX = 190
const WY = 190

export type Die = { id: string; x: number; y: number; status: 'good' | 'bad' | 'edge'; col: number; row: number }

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export const DEFECTS: Array<[number, number]> = (() => {
  const rnd = seeded(7)
  const pts: Array<[number, number]> = []
  for (let i = 0; i < 30; i++) {
    const r = R_MM * Math.sqrt(rnd()) * 0.97
    const a = rnd() * Math.PI * 2
    pts.push([r * Math.cos(a), r * Math.sin(a)])
  }
  for (let i = 0; i < 10; i++) {
    const r = 120 + rnd() * 25
    const a = -0.9 + rnd() * 0.7
    pts.push([r * Math.cos(a), r * Math.sin(a)])
  }
  return pts
})()

function buildDies(size: number): Die[] {
  const dies: Die[] = []
  const n = Math.ceil(R_MM / size)
  const inner = R_MM - EXCL_MM
  for (let row = -n; row < n; row++) {
    for (let col = -n; col < n; col++) {
      const x0 = col * size
      const y0 = row * size
      const corners = [
        [x0, y0],
        [x0 + size, y0],
        [x0, y0 + size],
        [x0 + size, y0 + size],
      ]
      const dist = corners.map(([x, y]) => Math.hypot(x, y))
      const nearX = Math.max(x0, Math.min(0, x0 + size))
      const nearY = Math.max(y0, Math.min(0, y0 + size))
      if (Math.hypot(nearX, nearY) >= R_MM) {
        continue
      }
      let status: Die['status'] = 'edge'
      if (Math.max(...dist) <= inner) {
        const hit = DEFECTS.some(([dx, dy]) => dx >= x0 && dx < x0 + size && dy >= y0 && dy < y0 + size)
        status = hit ? 'bad' : 'good'
      }
      dies.push({ id: `${col},${row}`, x: x0, y: y0, status, col, row })
    }
  }
  return dies
}

export const DIES: Record<DieSizeId, { size: number; dies: Die[] }> = {
  small: { size: 10, dies: buildDies(10) },
  large: { size: 20, dies: buildDies(20) },
}

export function firstDie(size: DieSizeId) {
  return DIES[size].dies.find((d) => d.status !== 'edge') ?? DIES[size].dies[0]
}

export function WaferMapFig({ size, active, onPick }: { size: DieSizeId; active: string; onPick: (die: Die) => void }) {
  const { t } = useLocale()
  const { size: mm, dies } = DIES[size]
  const s = mm * K
  const legend = [
    { fill: 'var(--green-bg)', stroke: 'var(--green-line)', label: L.lgGood, op: 1 },
    { fill: 'var(--red-bg)', stroke: 'var(--red-line)', label: L.lgBad, op: 1 },
    { fill: 'var(--neutral-fill)', stroke: 'var(--line-2)', label: L.lgEdge, op: 0.35 },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 380" className="term-fig__svg" role="group" aria-label={t(L.mapCap)}>
        <defs>
          <clipPath id="prep-wafer-clip">
            <circle cx={WX} cy={WY} r={R_MM * K} />
          </clipPath>
        </defs>
        <rect width="760" height="380" rx="10" fill="var(--well)" />
        <circle cx={WX} cy={WY} r={R_MM * K} fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="1.5" />
        <circle cx={WX} cy={WY} r={(R_MM - EXCL_MM) * K} fill="none" stroke="var(--line-3)" strokeDasharray="3 3" />
        <g clipPath="url(#prep-wafer-clip)">
          {dies.map((d) => {
            const x = WX + d.x * K
            const y = WY + d.y * K
            if (d.status === 'edge') {
              return <rect key={d.id} x={x + 0.4} y={y + 0.4} width={s - 0.8} height={s - 0.8} fill="var(--neutral-fill)" stroke="var(--line-2)" strokeWidth="0.5" opacity="0.35" />
            }
            const on = d.id === active
            return (
              <Hit key={d.id} label={`${t(L.dieLabel)} ${d.col},${d.row}`} active={on} onPick={() => onPick(d)}>
                <rect
                  x={x + 0.4}
                  y={y + 0.4}
                  width={s - 0.8}
                  height={s - 0.8}
                  fill={d.status === 'good' ? 'var(--green-bg)' : 'var(--red-bg)'}
                  stroke={d.status === 'good' ? 'var(--green-line)' : 'var(--red-line)'}
                  strokeWidth="0.6"
                />
              </Hit>
            )
          })}
        </g>
        {DEFECTS.map(([dx, dy]) => (
          <circle key={`${dx}-${dy}`} cx={WX + dx * K} cy={WY + dy * K} r="2.2" fill="var(--text)" pointerEvents="none" />
        ))}
        {(() => {
          const d = dies.find((item) => item.id === active)
          if (!d) {
            return null
          }
          return <rect x={WX + d.x * K - 1} y={WY + d.y * K - 1} width={s + 2} height={s + 2} fill="none" stroke="var(--gold)" strokeWidth="2.5" pointerEvents="none" />
        })()}
        <circle cx={WX} cy={WY + R_MM * K} r="5" fill="var(--well)" />

        {legend.map((item, i) => (
          <g key={item.label.zh}>
            <rect x="420" y={70 + i * 34} width="18" height="18" fill={item.fill} stroke={item.stroke} opacity={item.op} />
            <text x="448" y={84 + i * 34} fill="var(--text-2)" fontSize="13">
              {t(item.label)}
            </text>
          </g>
        ))}
        <circle cx="429" cy={79 + 3 * 34} r="3" fill="var(--text)" />
        <text x="448" y={84 + 3 * 34} fill="var(--text-2)" fontSize="13">
          {t(L.lgDefect)}
        </text>
        <line x1="420" y1={79 + 4 * 34} x2="438" y2={79 + 4 * 34} stroke="var(--line-3)" strokeDasharray="3 3" strokeWidth="1.5" />
        <text x="448" y={84 + 4 * 34} fill="var(--text-2)" fontSize="13">
          {t(L.lgExcl)}
        </text>
      </svg>
      <figcaption>{t(L.mapCap)}</figcaption>
    </figure>
  )
}

/* ---------- 光刻剖面 ---------- */

const X0 = 120
const X1 = 600
const W0 = 320
const W1 = 400
const fade = (show: boolean) => ({ opacity: show ? 1 : 0, transition: 'opacity 0.45s' })

function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  return <path d={`M${x} ${y1} V${y2} M${x - 4} ${y2 - 6} L${x} ${y2} L${x + 4} ${y2 - 6}`} fill="none" stroke={color} strokeWidth="1.5" />
}

export function LithoFig({ step }: { step: number }) {
  const { t } = useLocale()
  const uvX = [140, 180, 220, 260, 300, 420, 460, 500, 540, 580]
  const ionX = [140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(LITHO_LABEL.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />

        {/* 衬底 */}
        <rect x={X0} y="180" width={X1 - X0} height="70" fill="var(--fig-box-2)" stroke="var(--line-2)" />
        <text x="612" y="220" fill="var(--text-2)" fontSize="11">
          {t(LITHO_LABEL.sub)}
        </text>

        {/* n+ 区 */}
        <g style={fade(step >= 7)}>
          <path d="M312 180 V196 Q312 207 324 207 H396 Q408 207 408 196 V180 Z" fill="var(--blue-bg-2)" stroke="var(--blue)" />
          <text x="360" y="200" textAnchor="middle" fill="var(--blue)" fontSize="12" fontWeight="700">
            n⁺
          </text>
        </g>

        {/* 氧化层 */}
        <g style={fade(step >= 1)}>
          <rect x={X0} y="162" width={W0 - X0} height="18" fill="var(--sky)" opacity="0.45" stroke="var(--line-2)" />
          <rect x={W1} y="162" width={X1 - W1} height="18" fill="var(--sky)" opacity="0.45" stroke="var(--line-2)" />
          <text x="612" y="175" fill="var(--text-2)" fontSize="11">
            {t(LITHO_LABEL.oxide)}
          </text>
        </g>
        <rect x={W0} y="162" width={W1 - W0} height="18" fill="var(--sky)" opacity={step >= 1 && step < 5 ? 0.45 : 0} stroke="var(--line-2)" strokeOpacity={step >= 1 && step < 5 ? 1 : 0} style={{ transition: 'opacity 0.45s' }} />

        {/* 光刻胶 */}
        <g style={fade(step >= 2 && step <= 5)}>
          <rect x={X0} y="140" width={W0 - X0} height="22" fill="var(--purple)" opacity="0.35" stroke="var(--purple)" />
          <rect x={W1} y="140" width={X1 - W1} height="22" fill="var(--purple)" opacity="0.35" stroke="var(--purple)" />
          <text x="612" y="155" fill="var(--text-2)" fontSize="11">
            {t(LITHO_LABEL.resist)}
          </text>
        </g>
        <g style={fade(step === 2 || step === 3)}>
          <rect x={W0} y="140" width={W1 - W0} height="22" fill={step === 3 ? 'var(--gold-bg-2)' : 'var(--purple)'} opacity={step === 3 ? 1 : 0.35} stroke={step === 3 ? 'var(--gold)' : 'var(--purple)'} />
        </g>
        <g style={fade(step === 3)}>
          <line x1="114" y1="124" x2={W0 + 6} y2="146" stroke="var(--gold)" strokeDasharray="3 2" />
          <text x="110" y="128" textAnchor="end" fill="var(--gold)" fontSize="11">
            {t(LITHO_LABEL.exposed)}
          </text>
        </g>

        {/* 掩模版 + 紫外光 */}
        <g style={fade(step === 3)}>
          <rect x={X0} y="70" width={X1 - X0} height="12" fill="var(--blue-bg)" stroke="var(--line-2)" />
          <rect x={X0} y="78" width={W0 - X0} height="6" fill="var(--text-2)" />
          <rect x={W1} y="78" width={X1 - W1} height="6" fill="var(--text-2)" />
          <text x="612" y="80" fill="var(--text-2)" fontSize="11">
            {t(LITHO_LABEL.mask)}
          </text>
          <text x="612" y="96" fill="var(--muted)" fontSize="10">
            {t(LITHO_LABEL.chrome)}
          </text>
          {uvX.map((x) => (
            <Arrow key={x} x={x} y1={22} y2={66} color="var(--purple)" />
          ))}
          {[336, 360, 384].map((x) => (
            <g key={x}>
              <Arrow x={x} y1={22} y2={66} color="var(--purple)" />
              <Arrow x={x} y1={88} y2={138} color="var(--purple)" />
            </g>
          ))}
          <text x="612" y="40" fill="var(--purple)" fontSize="11">
            {t(LITHO_LABEL.uv)}
          </text>
        </g>

        {/* 离子注入 */}
        <g style={fade(step === 7)}>
          {ionX.map((x) => (
            <Arrow key={x} x={x} y1={40} y2={x > W0 && x < W1 ? 186 : 158} color="var(--blue)" />
          ))}
          <text x="612" y="60" fill="var(--blue)" fontSize="11">
            {t(LITHO_LABEL.ions)}
          </text>
        </g>

        {/* 金属 */}
        <g style={fade(step >= 8)}>
          <path d={`M300 144 H420 V162 H${W1} V180 H${W0} V162 H300 Z`} fill="var(--gold-bg-2)" stroke="var(--gold)" />
          <line x1="422" y1="150" x2="606" y2="140" stroke="var(--gold)" strokeDasharray="3 2" />
          <text x="612" y="143" fill="var(--gold)" fontSize="11">
            {t(LITHO_LABEL.metal)}
          </text>
        </g>
      </svg>
      <figcaption>{t(LITHO_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 金属层剖面 ---------- */

const BANDS: Record<StackId, [number, number]> = {
  pad: [28, 68],
  global: [68, 126],
  local: [126, 182],
  contact: [182, 206],
  feol: [206, 300],
}

const TRANSISTORS = [120, 280, 440]

export function StackFig({ active, onPick }: { active: StackId; onPick: (id: StackId) => void }) {
  const { t } = useLocale()
  const band = BANDS[active]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 320" className="term-fig__svg" role="group" aria-label={t(STACK_CAP)}>
        <rect width="760" height="320" rx="10" fill="var(--well)" />
        {/* 介质 + 衬底 */}
        <rect x="40" y="56" width="480" height="150" fill="var(--panel-2)" stroke="var(--line)" />
        <rect x="40" y="206" width="480" height="94" fill="var(--fig-box-2)" stroke="var(--line-2)" />
        {[200, 360].map((x) => (
          <rect key={x} x={x - 12} y="206" width="24" height="34" fill="var(--panel-2)" stroke="var(--line-2)" />
        ))}

        {/* 晶体管 */}
        {TRANSISTORS.map((x) => (
          <g key={x}>
            <rect x={x - 62} y="206" width="40" height="14" rx="4" fill="var(--blue-bg-2)" stroke="var(--blue)" strokeWidth="0.8" />
            <rect x={x + 22} y="206" width="40" height="14" rx="4" fill="var(--blue-bg-2)" stroke="var(--blue)" strokeWidth="0.8" />
            <rect x={x - 16} y="203" width="32" height="3" fill="var(--sky)" />
            <rect x={x - 16} y="189" width="32" height="14" fill="var(--red-bg)" stroke="var(--red-line)" strokeWidth="0.8" />
            {[x - 42, x + 42].map((cx) => (
              <rect key={cx} x={cx - 4} y="180" width="8" height="26" fill="var(--text-2)" />
            ))}
            <rect x={x - 4} y="180" width="8" height="9" fill="var(--text-2)" />
          </g>
        ))}

        {/* M1–M3 + 通孔 */}
        {[
          { y: 172, h: 8, segs: [[60, 140], [160, 230], [250, 330], [350, 400], [420, 500]] },
          { y: 152, h: 8, segs: [[70, 190], [210, 310], [330, 480]] },
          { y: 132, h: 9, segs: [[60, 250], [280, 500]] },
        ].map((layer) =>
          layer.segs.map(([a, b]) => <rect key={`${layer.y}-${a}`} x={a} y={layer.y} width={b - a} height={layer.h} fill="var(--gold-bg-2)" stroke="var(--gold-line)" strokeWidth="0.8" />),
        )}
        {[
          [100, 160],
          [270, 160],
          [440, 160],
          [180, 141],
          [380, 141],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3} y={y} width="6" height="12" fill="var(--text-2)" />
        ))}

        {/* 上层粗金属 */}
        <rect x="60" y="104" width="160" height="16" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        <rect x="300" y="104" width="200" height="16" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        <rect x="60" y="72" width="440" height="24" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        {[140, 400].map((x) => (
          <rect key={x} x={x - 5} y="96" width="10" height="8" fill="var(--text-2)" />
        ))}
        {[160, 360].map((x) => (
          <rect key={x} x={x - 4} y="120" width="8" height="12" fill="var(--text-2)" />
        ))}

        {/* Pad + 钝化 */}
        <rect x="190" y="50" width="120" height="16" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x="240" y="66" width="20" height="6" fill="var(--text-2)" />
        <path d="M40 38 H206 V54 H40 Z M294 38 H520 V54 H294 Z" fill="var(--green-bg)" stroke="var(--green-line)" />

        {[
          ['Mn', 88],
          ['Mn−1', 116],
          ['M3', 140],
          ['M2', 160],
          ['M1', 180],
        ].map(([name, y]) => (
          <text key={name} x="36" y={Number(y)} textAnchor="end" fill="var(--dim)" fontSize="9" fontFamily="var(--mono)">
            {name}
          </text>
        ))}

        <rect x="40" y={band[0]} width="480" height={band[1] - band[0]} fill="var(--gold)" opacity="0.14" pointerEvents="none" style={{ transition: 'y 0.3s, height 0.3s' }} />
        <rect x="40" y={band[0]} width="480" height={band[1] - band[0]} fill="none" stroke="var(--gold)" strokeWidth="1.5" pointerEvents="none" />

        {STACK.map((item) => {
          const [a, b] = BANDS[item.id]
          const cy = (a + b) / 2
          const on = item.id === active
          return (
            <Hit key={item.id} label={t(item.title)} active={on} onPick={() => onPick(item.id)}>
              <line x1="522" y1={cy} x2="552" y2={cy} stroke={on ? 'var(--gold)' : 'var(--line-2)'} />
              <rect x="554" y={cy - 15} width="196" height="30" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} />
              <text x="652" y={cy + 4} textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="11" fontWeight={on ? 700 : 400}>
                {t(item.title)}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(STACK_CAP)}</figcaption>
    </figure>
  )
}
