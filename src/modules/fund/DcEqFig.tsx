import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type EqItem, type EqPart } from './data/dcEq'

const COL_X = [120, 220, 320]
const TOP_Y = 66
const NODE_Y = 158
const GND_Y = 250
const PIN_X = 418
const BOX_GND_Y = 236
const ON = 'var(--gold)'
const OFF = 'var(--line-2)'
const WIRE = 'var(--muted)'

const L = {
  chip: loc('芯片内部（等效）', 'Inside the chip (equivalent)'),
  read: loc('读', 'Reads'),
  cap: loc(
    '黄色元件此刻导通，电流从这里流过；灰色元件仍然在芯片里，但在这个偏置条件下不导通，可以当作断开。',
    'Yellow parts conduct and carry the current right now; gray parts are still in the chip but do not conduct under this bias, so they can be treated as open.',
  ),
}

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={WIRE} strokeWidth="2">
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 6} x2={x + 7} y2={y + 6} />
      <line x1={x - 2} y1={y + 12} x2={x + 2} y2={y + 12} />
    </g>
  )
}

function Part({ part, name, sub }: { part: EqPart; name: string; sub: string }) {
  const x = COL_X[part.col]
  const y1 = part.pos === 'up' ? TOP_Y : NODE_Y
  const y2 = part.pos === 'up' ? NODE_Y : GND_Y
  const cy = (y1 + y2) / 2
  const c = part.on ? ON : OFF
  const w = part.on ? 2.5 : 2
  let body
  if (part.kind === 'diode') {
    body = (
      <>
        <line x1={x} y1={cy - 18} x2={x} y2={cy - 9} />
        <path d={`M${x - 9} ${cy + 9} L${x + 9} ${cy + 9} L${x} ${cy - 9} Z`} fill={part.on ? c : 'none'} />
        <line x1={x - 10} y1={cy - 9} x2={x + 10} y2={cy - 9} />
        <line x1={x} y1={cy + 9} x2={x} y2={cy + 18} />
      </>
    )
  } else if (part.kind === 'cap') {
    body = (
      <>
        <line x1={x} y1={cy - 18} x2={x} y2={cy - 4} />
        <line x1={x - 11} y1={cy - 4} x2={x + 11} y2={cy - 4} />
        <line x1={x - 11} y1={cy + 4} x2={x + 11} y2={cy + 4} />
        <line x1={x} y1={cy + 4} x2={x} y2={cy + 18} />
      </>
    )
  } else {
    body = (
      <path
        d={`M${x} ${cy - 18} l0 3 l7 3 l-14 6 l14 6 l-14 6 l14 6 l-7 3 l0 3`}
        fill="none"
        strokeDasharray={part.kind === 'defect' ? '4 3' : undefined}
      />
    )
  }
  return (
    <g>
      <g stroke={c} strokeWidth={w} strokeLinejoin="round">
        <line x1={x} y1={y1} x2={x} y2={cy - 18} />
        {body}
        <line x1={x} y1={cy + 18} x2={x} y2={y2} />
      </g>
      <circle cx={x} cy={NODE_Y} r="3.5" fill={WIRE} />
      <text x={x + 16} y={cy - 2} fontSize="12" fill={part.on ? 'var(--text)' : 'var(--dim)'}>
        {name}
      </text>
      <text x={x + 16} y={cy + 12} fontSize="10" fill={part.on ? 'var(--gold)' : 'var(--dim)'}>
        {sub}
      </text>
    </g>
  )
}

function CurrentSource({ x, y, up }: { x: number; y: number; up: boolean }) {
  const tip = up ? y - 9 : y + 9
  const tail = up ? y + 9 : y - 9
  const head = up ? 5 : -5
  return (
    <g stroke="var(--text)" strokeWidth="1.8" fill="none">
      <circle cx={x} cy={y} r="16" fill="var(--panel)" />
      <line x1={x} y1={tail} x2={x} y2={tip} />
      <path d={`M${x - 5} ${tip + head} L${x} ${tip} L${x + 5} ${tip + head}`} />
    </g>
  )
}

function VoltageSource({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="16" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.8" />
      <g stroke="var(--text)" strokeWidth="1.6">
        <line x1={x - 4} y1={y - 7} x2={x + 4} y2={y - 7} />
        <line x1={x} y1={y - 11} x2={x} y2={y - 3} />
        <line x1={x - 4} y1={y + 7} x2={x + 4} y2={y + 7} />
      </g>
    </g>
  )
}

function Meter({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="14" fill="var(--panel)" stroke="var(--blue)" strokeWidth="1.8" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--blue)">
        {label}
      </text>
    </g>
  )
}

export function DcEqFig({ item }: { item: EqItem }) {
  const { t } = useLocale()
  const xs = item.parts.map((part) => COL_X[part.col])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const live = item.parts.some((part) => part.on)
  const onX = Math.min(...item.parts.filter((part) => part.on).map((part) => COL_X[part.col]))
  const srcX = item.mode === 'V' ? 512 : 612
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(item.title)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        <rect x="16" y="16" width={PIN_X - 16} height="268" rx="10" fill="none" stroke="var(--line-2)" strokeDasharray="6 4" />
        <text x="28" y="36" fontSize="12" fill="var(--muted)">
          {t(L.chip)}
        </text>

        {item.top ? (
          <>
            <line x1={minX - 20} y1={TOP_Y} x2={maxX + 20} y2={TOP_Y} stroke="var(--sky)" strokeWidth="2" />
            <text x="28" y={TOP_Y + 4} fontSize="12" fill="var(--sky)">
              {t(item.top)}
            </text>
          </>
        ) : null}
        {item.twin ? (
          <>
            <line x1="300" y1="24" x2="300" y2={NODE_Y} stroke={WIRE} strokeWidth="2" />
            <circle cx="300" cy={NODE_Y} r="3.5" fill={WIRE} />
            <rect x="292" y="8" width="16" height="16" fill="var(--panel)" stroke="var(--dim)" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="290" y="54" textAnchor="end" fontSize="12" fill="var(--dim)">
              {t(item.twin)}
            </text>
          </>
        ) : null}
        <line x1={minX - 20} y1={GND_Y} x2={maxX + 20} y2={GND_Y} stroke={WIRE} strokeWidth="2" />
        <Ground x={(minX + maxX) / 2} y={GND_Y + 8} />
        <line x1={(minX + maxX) / 2} y1={GND_Y} x2={(minX + maxX) / 2} y2={GND_Y + 8} stroke={WIRE} strokeWidth="2" />
        <text x="28" y={GND_Y + 4} fontSize="12" fill="var(--muted)">
          VSS 0 V
        </text>

        <line x1={minX} y1={NODE_Y} x2={PIN_X} y2={NODE_Y} stroke={WIRE} strokeWidth="2" />
        {live ? <line x1={onX} y1={NODE_Y} x2={PIN_X} y2={NODE_Y} stroke={ON} strokeWidth="2.5" /> : null}
        {item.parts.map((part, index) => (
          <Part key={index} part={part} name={t(part.name)} sub={t(part.sub)} />
        ))}
        <rect x={PIN_X - 8} y={NODE_Y - 8} width="16" height="16" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.5" />
        <text x={PIN_X - 14} y={NODE_Y - 14} textAnchor="end" fontSize="12" fill="var(--text)">
          {t(item.pin)}
        </text>

        <rect x="462" y="60" width="204" height="220" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="564" y="84" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text)">
          {item.inst}
        </text>
        <g stroke={live ? ON : WIRE} strokeWidth="2.5">
          {item.mode === 'V' ? (
            <line x1={PIN_X + 8} y1={NODE_Y} x2="612" y2={NODE_Y} />
          ) : (
            <>
              <line x1={PIN_X + 8} y1={NODE_Y} x2="498" y2={NODE_Y} />
              <line x1="526" y1={NODE_Y} x2="612" y2={NODE_Y} />
            </>
          )}
          <line x1={srcX} y1={NODE_Y} x2={srcX} y2="188" />
        </g>
        <line x1={srcX} y1="220" x2={srcX} y2={BOX_GND_Y} stroke={WIRE} strokeWidth="2" />
        <Ground x={srcX} y={BOX_GND_Y} />
        {item.mode === 'V' ? (
          <>
            <CurrentSource x={srcX} y={204} up={!!item.srcIn} />
            <text x={srcX + 22} y="208" fontSize="12" fontFamily="monospace" fill="var(--gold)">
              {item.src}
            </text>
            <line x1="612" y1={NODE_Y} x2="612" y2="190" stroke={WIRE} strokeWidth="2" />
            <Meter x={612} y={204} label="V" />
            <line x1="612" y1="218" x2="612" y2={BOX_GND_Y} stroke={WIRE} strokeWidth="2" />
            <Ground x={612} y={BOX_GND_Y} />
          </>
        ) : (
          <>
            <Meter x={512} y={NODE_Y} label="A" />
            <VoltageSource x={srcX} y={204} />
            <text x={srcX - 22} y="208" textAnchor="end" fontSize="12" fontFamily="monospace" fill="var(--gold)">
              {item.src}
            </text>
          </>
        )}
        <text x="564" y="270" textAnchor="middle" fontSize="13" fill="var(--gold)">
          {`${t(L.read)} ${t(item.read)}`}
        </text>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
