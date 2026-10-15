import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { PIN_LABEL, S, type PinCase, type PinView } from './data/pcbFlow'
import { T } from './FlowFigs'
import { BODY, allLandings, chipPins, pads, type Box, type ChipPin } from './flowPinModel'

const L = {
  aria: loc('符号引脚与封装焊盘对照图', 'Symbol pin versus footprint pad comparison'),
}

const METAL = '#a7afb8'
const CY = 175
const DS_X = 190
const FP_X = 570

function Tr({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <g transform={`translate(${x} ${y})`}>{children}</g>
}

/** QFN 编号放在焊端外侧：0 左、1 下、2 右、3 上 */
function qfnNum(n: number, b: Box) {
  const side = Math.floor((n - 1) / 4)
  if (side === 0) {
    return { x: -94, y: b.cy + 3, anchor: 'end' as const }
  }
  if (side === 1) {
    return { x: b.cx, y: 102, anchor: 'middle' as const }
  }
  if (side === 2) {
    return { x: 94, y: b.cy + 3, anchor: 'start' as const }
  }
  return { x: b.cx, y: -94, anchor: 'middle' as const }
}

function ChipLead({ kase, p, sel, dashed, onPick, showNum }: { kase: PinCase; p: ChipPin; sel: boolean; dashed: boolean; onPick: (n: number) => void; showNum: boolean }) {
  const { t } = useLocale()
  const qfn = kase === 'qfn'
  const under = qfn || dashed
  const stroke = sel ? 'var(--gold)' : dashed ? 'var(--blue)' : 'var(--text-2)'
  const num = qfn ? qfnNum(p.n, p) : null
  return (
    <Hit label={`${t(S.chipPin)} ${p.n}`} active={sel} onPick={() => onPick(p.n)}>
      <rect
        x={p.cx - p.w / 2}
        y={p.cy - p.h / 2}
        width={p.w}
        height={p.h}
        fill={sel ? 'var(--gold)' : under ? 'transparent' : METAL}
        fillOpacity={sel && under ? 0.55 : 1}
        stroke={stroke}
        strokeWidth={sel ? 2.4 : 1.2}
        strokeDasharray={under ? '4 3' : undefined}
      />
      {showNum && !qfn ? (
        <T x={p.cx} y={p.cy + 3.5} size={9} color="var(--well)" bold mono>
          {String(p.n)}
        </T>
      ) : null}
      {showNum && num ? (
        <T x={num.x} y={num.y} anchor={num.anchor} size={9} color={sel ? 'var(--gold)' : 'var(--text-2)'} bold={sel} mono>
          {String(p.n)}
        </T>
      ) : null}
    </Hit>
  )
}

function Dot({ x, y, filled, color }: { x: number; y: number; filled: boolean; color: string }) {
  return <circle cx={x} cy={y} r={4.5} fill={filled ? color : 'none'} stroke={color} strokeWidth="1.4" strokeDasharray={filled ? undefined : '2 2'} />
}

function dotPos(kase: PinCase, mirrored: boolean) {
  if (kase === 'soic') {
    return { x: mirrored ? 30 : -30, y: -56 }
  }
  if (kase === 'qfn') {
    return { x: -66, y: -66 }
  }
  return null
}

export function PinFig({ kase, view, pin, onPick }: { kase: PinCase; view: PinView; pin: number; onPick: (n: number) => void }) {
  const { t } = useLocale()
  const body = BODY[kase]
  const chip = chipPins(kase)
  const fp = pads(kase, view)
  const lands = allLandings(kase, view)
  const sel = lands[pin - 1]
  const dot = dotPos(kase, false)
  const silk = dotPos(kase, kase === 'soic' && view === 'lib')
  const qfn = kase === 'qfn'
  const sot = kase === 'sot23'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 340" className="term-fig__svg" role="group" aria-label={t(L.aria)}>
        <rect width="760" height="340" rx="10" fill="var(--well)" />
        <path d="M380 40 V300" stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4" />
        <T x={DS_X} y={26} bold size={12} color="var(--text)">
          {t(PIN_LABEL.datasheet)}
        </T>
        <T x={FP_X} y={26} bold size={12} color="var(--text)">
          {t(PIN_LABEL.footprint)}
        </T>
        <Tr x={DS_X} y={CY}>
          {chip.map((p) => (
            <g key={`n${p.n}`}>
              {sot ? (
                <T x={p.cx} y={p.cy + (p.cy > 0 ? 28 : -18)} size={10} mono color={p.n === pin ? 'var(--gold)' : 'var(--text-2)'}>
                  {`${p.n} · ${p.name}`}
                </T>
              ) : null}
              {kase === 'soic' ? (
                <T x={p.cx + (p.cx < 0 ? -26 : 26)} y={p.cy + 4} anchor={p.cx < 0 ? 'end' : 'start'} size={10} mono color={p.n === pin ? 'var(--gold)' : 'var(--text-2)'}>
                  {p.name}
                </T>
              ) : null}
            </g>
          ))}
          <rect x={-body.w / 2} y={-body.h / 2} width={body.w} height={body.h} rx="3" fill="var(--neutral-fill)" stroke="var(--text-2)" strokeWidth="1.2" />
          {dot ? <Dot x={dot.x} y={dot.y} filled color="var(--gold)" /> : null}
          {chip.map((p) => (
            <ChipLead key={p.n} kase={kase} p={p} sel={p.n === pin} dashed={false} onPick={onPick} showNum />
          ))}
        </Tr>
        <Tr x={FP_X} y={CY}>
          <rect x={-body.w / 2 - 4} y={-body.h / 2 - 4} width={body.w + 8} height={body.h + 8} rx="3" fill="none" stroke="var(--dim)" strokeWidth="1.2" />
          {silk ? <Dot x={silk.x} y={silk.y} filled color="var(--gold)" /> : null}
          {fp.map((pd) => {
            const l = lands.find((x) => x.pad.num === pd.num)
            const ok = l ? l.ok : true
            const hot = sel.pad.num === pd.num
            return (
              <g key={`p${pd.num}`}>
                <rect
                  x={pd.cx - pd.w / 2}
                  y={pd.cy - pd.h / 2}
                  width={pd.w}
                  height={pd.h}
                  rx="2"
                  fill={ok ? 'var(--green-bg)' : 'var(--red-bg)'}
                  stroke={hot ? 'var(--gold)' : ok ? 'var(--green)' : 'var(--red)'}
                  strokeWidth={hot ? 3 : 1.4}
                />
                {qfn ? (
                  (() => {
                    const num = qfnNum(pd.num, pd)
                    return (
                      <T x={num.x} y={num.y} anchor={num.anchor} size={9} mono color={hot ? 'var(--gold)' : 'var(--text-2)'} bold={hot}>
                        {String(pd.num)}
                      </T>
                    )
                  })()
                ) : (
                  <T x={pd.cx} y={pd.cy + 4} size={11} bold color="var(--text)" mono>
                    {String(pd.num)}
                  </T>
                )}
                {sot ? (
                  <T x={pd.cx} y={pd.cy + (pd.cy > 0 ? 34 : -26)} size={10} mono color={ok ? 'var(--green)' : 'var(--red)'}>
                    {pd.name}
                  </T>
                ) : null}
                {kase === 'soic' ? (
                  <T x={pd.cx + (pd.cx < 0 ? -25 : 25)} y={pd.cy + 4} anchor={pd.cx < 0 ? 'end' : 'start'} size={10} mono color={ok ? 'var(--green)' : 'var(--red)'}>
                    {pd.name}
                  </T>
                ) : null}
              </g>
            )
          })}
          <rect x={-body.w / 2} y={-body.h / 2} width={body.w} height={body.h} rx="3" fill="none" stroke="var(--blue)" strokeWidth="1.2" strokeDasharray="5 3" pointerEvents="none" />
          {dot ? <Dot x={dot.x} y={dot.y} filled={false} color="var(--blue)" /> : null}
          {chip.map((p) => (
            <ChipLead key={`o${p.n}`} kase={kase} p={p} sel={p.n === pin} dashed onPick={onPick} showNum={false} />
          ))}
        </Tr>
        <circle cx="414" cy="304" r="4.5" fill="var(--gold)" />
        <T x={424} y={308} anchor="start" size={10}>
          {t(PIN_LABEL.libDot)}
        </T>
        <T x={408} y={326} anchor="start" size={10} color="var(--blue)">
          {t(PIN_LABEL.chip)}
        </T>
        {qfn ? (
          <T x={DS_X} y={326} size={10}>
            {t(PIN_LABEL.under)}
          </T>
        ) : null}
      </svg>
      <figcaption>{t(PIN_LABEL.cap)}</figcaption>
    </figure>
  )
}
