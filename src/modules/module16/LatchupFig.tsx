import type { KeyboardEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type PartId } from './data/content'

const L = {
  nwell: loc('N 阱', 'N-well'),
  psub: loc('P 衬底', 'P-substrate'),
  pType: loc('P 型', 'P-type'),
  nType: loc('N 型', 'N-type'),
  pick: loc('点图里的管子、电阻或通路', 'Click a part in the figure'),
  trig: loc('触发', 'Trig'),
  zero: loc('0 V', '0 V'),
  partCap: loc(
    'CMOS 反相器剖面：左边 PMOS 做在 N 阱里，右边 NMOS 做在 P 衬底上。叠在上面的两只三极管和两个电阻是结构自带的寄生元件。',
    'CMOS inverter cross-section: PMOS in the N-well on the left, NMOS in the P-substrate on the right. The two transistors and two resistors drawn on top are parasitics that come with the structure.',
  ),
  phaseCap: loc('右侧：VDD、触发电流和 IDD 随步骤变化。虚线 IH 是维持电流。', 'Right: VDD, trigger current and IDD over the steps. Dashed IH is the holding current.'),
}

const VDD_ON = [1, 1, 1, 1, 1, 0]
const TRIG = [0, 1, 1, 1, 0, 0]
const IDD = [0.04, 0.16, 0.55, 1, 1, 0]
const IH = 0.3

type Props = {
  part: PartId | null
  phase: number | null
  onPick?: (id: PartId) => void
}

/** 三极管符号：基极竖线在 bx，发射极 / 集电极引线朝左 */
function Bjt({ bx, by, npn, color, width }: { bx: number; by: number; npn: boolean; color: string; width: number }) {
  // 发射极在上：基极点 (bx, by-8) → 引线端 (bx-14, by-22)
  const e0 = { x: bx, y: by - 8 }
  const e1 = { x: bx - 14, y: by - 22 }
  const from = npn ? e0 : e1
  const to = npn ? e1 : e0
  const mx = from.x + (to.x - from.x) * 0.7
  const my = from.y + (to.y - from.y) * 0.7
  const ang = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
  return (
    <g stroke={color} strokeWidth={width} fill="none">
      <line x1={bx} y1={by - 14} x2={bx} y2={by + 14} strokeWidth={width + 1} />
      <line x1={e0.x} y1={e0.y} x2={e1.x} y2={e1.y} />
      <line x1={bx} y1={by + 8} x2={bx - 14} y2={by + 22} />
      <path d="M-5 -4 L2 0 L-5 4 Z" fill={color} transform={`translate(${mx} ${my}) rotate(${ang})`} />
    </g>
  )
}

function zig(x: number, y0: number, y1: number) {
  const h = (y1 - y0) / 6
  let d = `M${x} ${y0}`
  for (let k = 0; k < 6; k += 1) d += ` L${x + (k % 2 === 0 ? 7 : -7)} ${y0 + h * (k + 0.5)}`
  return `${d} L${x} ${y1}`
}

export function LatchupFig({ part, phase, onPick }: Props) {
  const { t } = useLocale()
  const p = phase ?? -1
  const off = p === 5
  const trig = p >= 1 && p <= 3
  const loopOn = p >= 2 && p <= 4
  const latched = p === 3 || p === 4

  const on = (id: PartId) => {
    if (part === id) return true
    if (phase === null) return false
    if (id === 'rsub' || id === 'npn') return p >= 1 && p <= 4
    if (id === 'rwell' || id === 'pnp') return loopOn
    return latched
  }
  const hot = (id: PartId) => (on(id) ? (latched ? 'var(--red)' : 'var(--gold)') : 'var(--muted)')
  const wide = (id: PartId) => (on(id) ? 2.6 : 1.4)
  const pnpnOn = on('pnpn')
  const layerStroke = (ids: PartId[]) => (ids.some((id) => part === id) || (phase !== null && latched) ? 'var(--red)' : undefined)

  const railColor = off ? 'var(--dim)' : 'var(--sky)'
  const hitProps = (id: PartId) =>
    onPick
      ? {
          role: 'button',
          tabIndex: 0,
          style: { cursor: 'pointer' },
          onClick: () => onPick(id),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') onPick(id)
          },
        }
      : {}

  const diff = (x: number, w: number, label: string, kind: 'p' | 'n', strong?: string) => (
    <g>
      <rect
        x={x}
        y="96"
        width={w}
        height="22"
        fill={kind === 'p' ? 'var(--gold-bg-2)' : 'var(--blue-bg-3)'}
        stroke={strong ?? (kind === 'p' ? 'var(--gold-line)' : 'var(--blue-line)')}
        strokeWidth={strong ? 2.2 : 1}
      />
      <text x={x + w / 2} y="111" textAnchor="middle" fill="var(--text)" fontSize="10">
        {label}
      </text>
    </g>
  )

  // 时间线
  const TX0 = 504
  const TX1 = 664
  const colW = (TX1 - TX0) / 6
  const stair = (vals: number[], top: number, bot: number) =>
    vals
      .slice(0, p + 1)
      .map((v, k) => {
        const y = bot - v * (bot - top)
        return `${k === 0 ? 'M' : 'L'}${TX0 + k * colW} ${y} L${TX0 + (k + 1) * colW} ${y}`
      })
      .join(' ')

  return (
    <figure className="term-fig">
      <svg
        viewBox="0 0 680 290"
        className="term-fig__svg"
        role="img"
        aria-label={t(phase === null ? L.partCap : L.phaseCap)}
      >
        <rect width="680" height="290" rx="10" fill="var(--well)" />
        {/* 衬底与阱 */}
        <rect x="20" y="96" width="420" height="180" fill="var(--gold-bg)" stroke={layerStroke(['pnp', 'npn', 'rsub', 'pnpn']) ?? 'var(--gold-line)'} />
        <rect x="40" y="96" width="200" height="114" fill="var(--blue-bg)" stroke={layerStroke(['pnp', 'npn', 'rwell', 'pnpn']) ?? 'var(--blue-line)'} />
        <text x="48" y="202" fill="var(--sky)" fontSize="12">
          {t(L.nwell)}
        </text>
        <text x="28" y="270" fill="var(--gold)" fontSize="12">
          {t(L.psub)}
        </text>
        {/* 扩散区 */}
        {diff(50, 35, 'P+', 'p')}
        {diff(115, 35, 'P+', 'p', part === 'pnp' || part === 'pnpn' || latched ? 'var(--red)' : undefined)}
        {diff(180, 35, 'N+', 'n')}
        {diff(262, 35, 'N+', 'n')}
        {diff(327, 35, 'N+', 'n', part === 'npn' || part === 'pnpn' || latched ? 'var(--red)' : undefined)}
        {diff(385, 35, 'P+', 'p')}
        {/* 栅极 */}
        <rect x="88" y="84" width="24" height="10" rx="2" fill="var(--line-2)" />
        <rect x="300" y="84" width="24" height="10" rx="2" fill="var(--line-2)" />
        {/* 电源轨 */}
        <path d="M132 96 V44 H197 V96" fill="none" stroke={latched ? 'var(--red)' : railColor} strokeWidth={latched ? 3 : 2} />
        <text x="165" y="36" textAnchor="middle" fill={railColor} fontSize="12">
          {off ? `VDD ${t(L.zero)}` : 'VDD'}
        </text>
        <path d="M344 96 V44 H402 V96" fill="none" stroke={latched ? 'var(--red)' : 'var(--muted)'} strokeWidth={latched ? 3 : 2} />
        <text x="373" y="36" textAnchor="middle" fill="var(--muted)" fontSize="12">
          GND
        </text>
        {/* I/O */}
        <path d="M67 96 V20 H279 V96" fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
        <text x="232" y="15" textAnchor="middle" fill="var(--muted)" fontSize="11">
          I/O
        </text>

        {/* PNPN 通路 */}
        <g {...hitProps('pnpn')}>
          <path
            d="M122 118 C 110 262, 352 270, 338 118"
            fill="none"
            stroke={pnpnOn ? 'var(--red)' : 'var(--line)'}
            strokeWidth={pnpnOn ? 7 : 2}
            strokeOpacity={pnpnOn ? 0.45 : 0.8}
            strokeDasharray={pnpnOn ? undefined : '5 5'}
          />
          <path d="M122 118 C 110 262, 352 270, 338 118" fill="none" stroke="transparent" strokeWidth="14" />
        </g>

        {/* 寄生 PNP：发射极 P+ 源，基极 N 阱，集电极 P 衬底 */}
        <g {...hitProps('pnp')}>
          <rect x="96" y="128" width="62" height="64" fill="transparent" />
          <Bjt bx={150} by={160} npn={false} color={hot('pnp')} width={wide('pnp')} />
          <line x1="136" y1="138" x2="136" y2="118" stroke={hot('pnp')} strokeWidth={wide('pnp')} />
          <text x="130" y="164" textAnchor="end" fill={on('pnp') ? hot('pnp') : 'var(--text-2)'} fontSize="11">
            PNP
          </text>
        </g>
        {/* PNP 集电极 → NPN 基极 */}
        <path d="M136 182 V250 H388 V172" fill="none" stroke={on('pnp') ? hot('pnp') : 'var(--muted)'} strokeWidth={wide('pnp')} />

        {/* 寄生 NPN：发射极 N+ 源，基极 P 衬底，集电极 N 阱 */}
        <g {...hitProps('npn')}>
          <rect x="300" y="146" width="66" height="54" fill="transparent" />
          <Bjt bx={360} by={172} npn color={hot('npn')} width={wide('npn')} />
          <line x1="346" y1="150" x2="346" y2="118" stroke={hot('npn')} strokeWidth={wide('npn')} />
          <text x="338" y="186" textAnchor="end" fill={on('npn') ? hot('npn') : 'var(--text-2)'} fontSize="11">
            NPN
          </text>
        </g>
        {/* NPN 集电极 → N 阱（PNP 基极） */}
        <path d="M346 194 V226 H226 V160 H150" fill="none" stroke={on('npn') ? hot('npn') : 'var(--muted)'} strokeWidth={wide('npn')} />

        {/* Rwell：PNP 基极到 N+ 阱接触（VDD） */}
        <g {...hitProps('rwell')}>
          <rect x="186" y="118" width="46" height="44" fill="transparent" />
          <path d={zig(197, 124, 154)} fill="none" stroke={hot('rwell')} strokeWidth={wide('rwell')} />
          <line x1="197" y1="118" x2="197" y2="124" stroke={hot('rwell')} strokeWidth={wide('rwell')} />
          <line x1="197" y1="154" x2="197" y2="160" stroke={hot('rwell')} strokeWidth={wide('rwell')} />
          <text x="208" y="142" fill={on('rwell') ? hot('rwell') : 'var(--text-2)'} fontSize="10">
            Rwell
          </text>
        </g>
        {/* Rsub：NPN 基极到 P+ 衬底接触（GND） */}
        <g {...hitProps('rsub')}>
          <rect x="394" y="118" width="46" height="58" fill="transparent" />
          <line x1="360" y1="172" x2="402" y2="172" stroke={hot('npn')} strokeWidth={wide('npn')} />
          <path d={zig(402, 126, 166)} fill="none" stroke={hot('rsub')} strokeWidth={wide('rsub')} />
          <line x1="402" y1="118" x2="402" y2="126" stroke={hot('rsub')} strokeWidth={wide('rsub')} />
          <line x1="402" y1="166" x2="402" y2="172" stroke={hot('rsub')} strokeWidth={wide('rsub')} />
          <text x="412" y="150" fill={on('rsub') ? hot('rsub') : 'var(--text-2)'} fontSize="10">
            Rsub
          </text>
        </g>

        {/* 触发电流 */}
        {trig ? (
          <g>
            <path d="M279 22 V150" stroke="var(--purple)" strokeWidth="3" />
            <path d="M272 140 L279 154 L286 140" fill="none" stroke="var(--purple)" strokeWidth="3" />
            <text x="286" y="80" fill="var(--purple)" fontSize="11">
              I trig
            </text>
          </g>
        ) : null}

        {/* 右栏 */}
        <line x1="456" y1="16" x2="456" y2="276" stroke="var(--line-soft)" />
        {phase === null ? (
          <g>
            <rect x="472" y="40" width="18" height="14" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
            <text x="498" y="52" fill="var(--text-2)" fontSize="12">
              {t(L.pType)}
            </text>
            <rect x="472" y="66" width="18" height="14" fill="var(--blue-bg-3)" stroke="var(--blue-line)" />
            <text x="498" y="78" fill="var(--text-2)" fontSize="12">
              {t(L.nType)}
            </text>
            <text x="472" y="120" fill="var(--muted)" fontSize="11">
              {t(L.pick)}
            </text>
            <text x="466" y="150" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
              VDD · P+ → N → P → N+ · GND
            </text>
          </g>
        ) : (
          <g>
            {[
              { label: 'VDD', top: 32, bot: 62, vals: VDD_ON, c: 'var(--sky)' },
              { label: t(L.trig), top: 92, bot: 122, vals: TRIG, c: 'var(--purple)' },
              { label: 'IDD', top: 152, bot: 240, vals: IDD, c: 'var(--red)' },
            ].map((row) => (
              <g key={row.top}>
                <text x="466" y={(row.top + row.bot) / 2 + 4} fill="var(--text-2)" fontSize="11">
                  {row.label}
                </text>
                <line x1={TX0} y1={row.bot} x2={TX1} y2={row.bot} stroke="var(--line-2)" />
                {p >= 0 ? <path d={stair(row.vals, row.top, row.bot)} fill="none" stroke={row.c} strokeWidth="2.5" /> : null}
              </g>
            ))}
            <line x1={TX0} y1={240 - IH * 88} x2={TX1} y2={240 - IH * 88} stroke="var(--gold)" strokeDasharray="3 3" />
            <text x={TX1} y={240 - IH * 88 - 4} textAnchor="end" fill="var(--gold)" fontSize="10">
              IH
            </text>
            <rect x={TX0 + Math.max(p, 0) * colW} y="26" width={colW} height="220" fill="var(--gold)" opacity="0.1" />
            {VDD_ON.map((_, k) => (
              <text
                key={k}
                x={TX0 + (k + 0.5) * colW}
                y="262"
                textAnchor="middle"
                fill={k === p ? 'var(--gold)' : 'var(--dim)'}
                fontSize="11"
                fontFamily="var(--mono)"
              >
                {k}
              </text>
            ))}
          </g>
        )}
      </svg>
      <figcaption>{t(phase === null ? L.partCap : L.phaseCap)}</figcaption>
    </figure>
  )
}
