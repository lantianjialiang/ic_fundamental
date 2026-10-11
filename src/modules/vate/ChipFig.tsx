import type { KeyboardEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { PINS, type Defect, type OsVerdict, type PinId } from './model/continuity'
import { S, VERDICT_LABEL } from './data/content'

/** 俯视图几何：左侧 1–4 自上而下，右侧 5–8 自下而上（逆时针编号） */
const BODY = { x: 200, y: 30, w: 120, h: 240 }
const PIN_W = 32
const PIN_H = 20
const ROWS = [70, 123, 177, 230]

function pinGeom(no: number) {
  const left = no <= 4
  const yc = left ? ROWS[no - 1] : ROWS[8 - no]
  const x = left ? BODY.x - PIN_W : BODY.x + BODY.w
  return { left, yc, x, inner: left ? BODY.x : BODY.x + BODY.w, outer: left ? BODY.x - PIN_W : BODY.x + BODY.w + PIN_W }
}

const VERDICT_COLOR: Record<OsVerdict, string> = {
  pass: 'var(--green)',
  marginal: 'var(--gold)',
  open: 'var(--red)',
  short: 'var(--red)',
  abort: 'var(--muted)',
}

type ChipFigProps = {
  selected: PinId[]
  onToggle: (pin: PinId) => void
  verdicts: Partial<Record<PinId, OsVerdict>>
  /** 只在注入模式传入；诊断练习时不画缺陷 */
  defect?: Defect
}

export function ChipFig({ selected, onToggle, verdicts, defect }: ChipFigProps) {
  const { t } = useLocale()
  const pinOf = (id: PinId) => PINS.find((p) => p.id === id)!
  const innerPoint = (id: PinId) => {
    const g = pinGeom(pinOf(id).no)
    return { x: g.inner + (g.left ? 4 : -4), y: g.yc }
  }

  const defectLine = (() => {
    if (!defect) return null
    const to =
      defect.kind === 'pinPin' ? defect.b : defect.kind === 'pinGnd' ? 'p4' : defect.kind === 'pinVdd' ? 'p8' : null
    if (!to || to === defect.a) return null
    const a = innerPoint(defect.a)
    const b = innerPoint(to)
    const mx = (a.x + b.x) / 2 + (a.x === b.x ? (a.x < 260 ? 34 : -34) : 0)
    const my = (a.y + b.y) / 2
    return <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeDasharray="6 4" />
  })()

  return (
    <figure className="vchip">
      <svg viewBox="0 0 520 300" role="group" aria-label={t(S.chipAria)}>
        <rect width="520" height="300" rx="10" fill="var(--well)" />
        {/* 封装本体 + 顶部缺口 + Pin 1 圆点 */}
        <path
          d={`M ${BODY.x} ${BODY.y} H 248 A 12 12 0 0 0 272 ${BODY.y} H ${BODY.x + BODY.w} V ${BODY.y + BODY.h} H ${BODY.x} Z`}
          fill="var(--fig-box-2)"
          stroke="var(--line-2)"
          strokeWidth="1.5"
        />
        <circle cx="236" cy="52" r="5" fill="var(--muted)" />
        <text x="260" y="146" textAnchor="middle" fill="var(--text-2)" fontSize="15" fontWeight="600">
          VT8
        </text>
        <text x="260" y="166" textAnchor="middle" fill="var(--muted)" fontSize="11">
          VDD 1.8 V
        </text>
        {defectLine}
        {PINS.map((p) => {
          const g = pinGeom(p.no)
          const sig = p.kind === 'sig'
          const on = selected.includes(p.id)
          const v = verdicts[p.id]
          const open = defect?.kind === 'open' && defect.a === p.id
          const contact = defect?.kind === 'contact' && defect.a === p.id
          const labelX = g.left ? g.outer - 16 : g.outer + 16
          const anchor = g.left ? 'end' : 'start'
          const toggle = () => sig && onToggle(p.id)
          const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggle()
            }
          }
          const aria = sig
            ? t(
                on
                  ? loc(`Pin ${p.no} ${p.name}，已勾选`, `Pin ${p.no} ${p.name}, selected`)
                  : loc(`Pin ${p.no} ${p.name}，未勾选`, `Pin ${p.no} ${p.name}, not selected`),
              )
            : t(loc(`Pin ${p.no} ${p.name}，电源脚，不做此项`, `Pin ${p.no} ${p.name}, supply pin, not tested here`))
          return (
            <g
              key={p.id}
              className={sig ? 'vchip__pin' : undefined}
              role={sig ? 'checkbox' : 'img'}
              aria-checked={sig ? on : undefined}
              aria-label={aria}
              tabIndex={sig ? 0 : undefined}
              onClick={toggle}
              onKeyDown={sig ? onKey : undefined}
            >
              <rect
                x={g.x}
                y={g.yc - PIN_H / 2}
                width={PIN_W}
                height={PIN_H}
                rx="2"
                fill={on ? 'var(--gold-bg)' : sig ? 'var(--card)' : 'var(--neutral-fill)'}
                stroke={contact ? 'var(--red)' : on ? 'var(--gold)' : 'var(--line-2)'}
                strokeWidth={on || contact ? 2.5 : 1.2}
                strokeDasharray={contact ? '4 3' : undefined}
              />
              {open ? (
                <text x={g.outer + (g.left ? 2 : -2)} y={g.yc + 5} textAnchor={g.left ? 'end' : 'start'} fill="var(--red)" fontSize="16" fontWeight="700">
                  ×
                </text>
              ) : null}
              <text
                x={g.left ? g.inner + 8 : g.inner - 8}
                y={g.yc + 4}
                textAnchor={g.left ? 'start' : 'end'}
                fill="var(--muted)"
                fontSize="11"
              >
                {p.no}
              </text>
              <text x={labelX} y={g.yc - 2} textAnchor={anchor} fill={sig ? 'var(--text)' : 'var(--muted)'} fontSize="13" fontWeight="600">
                {p.name}
              </text>
              {v ? (
                <text x={labelX} y={g.yc + 14} textAnchor={anchor} fill={VERDICT_COLOR[v]} fontSize="11" fontWeight="600">
                  {t(VERDICT_LABEL[v])}
                </text>
              ) : !sig ? (
                <text x={labelX} y={g.yc + 14} textAnchor={anchor} fill="var(--dim)" fontSize="10">
                  {p.kind === 'gnd' ? '0 V' : t(loc('电源', 'supply'))}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      <figcaption>
        {t(S.chipCap)}
        {defect ? ` ${t(loc('红色虚线 / × = 注入的缺陷。', 'Red dashes / × = injected defect.'))}` : ''}
      </figcaption>
    </figure>
  )
}
