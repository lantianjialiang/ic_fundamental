import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { keyPick } from '../prep/common'
import { HUNT, HUNT_CAP, type HuntId } from './data/pcbFlow'
import { T } from './FlowFigs'

const L = {
  aria: loc('找错用的原理图，可点击的区域', 'Schematic for the fault hunt, clickable regions'),
  region: loc('原理图区域', 'Schematic region'),
}

type Rect = { x: number; y: number; w: number; h: number }

// 每个可点区域；dupRef / rxLabel 各有两处
const HOT: Array<{ id: HuntId; rects: Rect[] }> = [
  { id: 'decap', rects: [{ x: 172, y: 40, w: 62, h: 82 }] },
  { id: 'boot', rects: [{ x: 196, y: 184, w: 96, h: 32 }] },
  {
    id: 'dupRef',
    rects: [
      { x: 394, y: 76, w: 52, h: 38 },
      { x: 394, y: 176, w: 52, h: 38 },
    ],
  },
  {
    id: 'rxLabel',
    rects: [
      { x: 396, y: 136, w: 50, h: 30 },
      { x: 562, y: 224, w: 84, h: 32 },
    ],
  },
  { id: 'netName', rects: [{ x: 562, y: 154, w: 84, h: 32 }] },
  { id: 'okPullup', rects: [{ x: 104, y: 40, w: 62, h: 120 }] },
  { id: 'okLed', rects: [{ x: 456, y: 78, w: 90, h: 64 }] },
  { id: 'okGnd', rects: [{ x: 190, y: 252, w: 40, h: 36 }] },
  { id: 'okNc', rects: [{ x: 388, y: 232, w: 34, h: 36 }] },
]

const W = 'var(--text)'

function Gnd({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 12} ${y} H${x + 12} M${x - 8} ${y + 5} H${x + 8} M${x - 4} ${y + 10} H${x + 4}`} stroke={W} strokeWidth="1.8" fill="none" />
}

function Res({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  return vertical ? <rect x={x - 7} y={y} width="14" height="34" fill="var(--card)" stroke={W} strokeWidth="1.8" /> : <rect x={x} y={y - 7} width="40" height="14" fill="var(--card)" stroke={W} strokeWidth="1.8" />
}

function Flag({ x, y, w, name, dir }: { x: number; y: number; w: number; name?: string; dir: 'out' | 'in' }) {
  // 网络标号旗：out 的尖头在左（接线在左），in 的尖头在右
  const d = dir === 'out' ? `M${x} ${y} L${x + 8} ${y - 9} H${x + w} V${y + 9} H${x + 8} Z` : `M${x + w} ${y} L${x + w - 8} ${y - 9} H${x} V${y + 9} H${x + w - 8} Z`
  return (
    <g>
      <path d={d} fill="var(--card)" stroke="var(--blue)" strokeWidth="1.4" strokeDasharray={name ? undefined : '3 2'} />
      {name ? (
        <T x={x + w / 2} y={y + 3.5} size={10} color="var(--blue)" mono>
          {name}
        </T>
      ) : null}
    </g>
  )
}

function Circuit() {
  const pinL = [
    { n: '1', name: 'VDD', y: 100 },
    { n: '2', name: 'NRST', y: 150 },
    { n: '3', name: 'BOOT0', y: 200 },
    { n: '4', name: 'VSS', y: 250 },
  ]
  const pinR = [
    { n: '5', name: 'PB0', y: 100 },
    { n: '6', name: 'RX', y: 150 },
    { n: '7', name: 'TX', y: 200 },
    { n: '8', name: 'PA1', y: 250 },
  ]
  const jPins = [
    { n: '1', name: '3V3', y: 170 },
    { n: '2', name: 'TX', y: 205 },
    { n: '3', name: 'RX', y: 240 },
    { n: '4', name: 'GND', y: 275 },
  ]
  return (
    <g>
      <g stroke={W} strokeWidth="1.8" fill="none">
        <rect x="240" y="62" width="130" height="216" fill="var(--card)" />
        <rect x="670" y="150" width="60" height="135" fill="var(--card)" />
        {pinL.map((p) => (
          <path key={p.n} d={`M210 ${p.y} H240`} />
        ))}
        {pinR.map((p) => (
          <path key={p.n} d={`M370 ${p.y} H400`} />
        ))}
        {jPins.map((p) => (
          <path key={p.n} d={`M640 ${p.y} H670`} />
        ))}
        <path d="M210 100 V58 M198 58 H222" />
        <path d="M140 58 V84 M140 118 V150 H210 M128 58 H152" />
        <path d="M210 250 V268" />
        <path d="M440 100 H470 M490 100 H530 V125 M470 90 V110 L490 100 Z M490 90 V110" />
        <path d="M440 200 H470 M640 275 V288" />
      </g>
      <Res x={140} y={84} vertical />
      <Res x={400} y={100} />
      <Res x={400} y={200} />
      <Gnd x={210} y={268} />
      <Gnd x={530} y={125} />
      <Gnd x={640} y={288} />
      <circle cx="210" cy="200" r="3" fill="var(--well)" stroke={W} strokeWidth="1.4" />
      <path d="M394 244 L406 256 M406 244 L394 256" stroke={W} strokeWidth="1.8" />
      <Flag x={400} y={150} w={40} dir="out" />
      <Flag x={470} y={200} w={70} name="UART_TX" dir="out" />
      <Flag x={576} y={170} w={64} name="VCC3V3" dir="in" />
      <Flag x={576} y={205} w={64} name="UART_TX" dir="in" />
      <Flag x={576} y={240} w={64} dir="in" />
      <T x={246} y={82} anchor="start" color="var(--gold)" bold size={13}>
        U1
      </T>
      <T x={700} y={142} color="var(--gold)" bold size={13}>
        J1
      </T>
      {pinL.map((p) => (
        <g key={p.n}>
          <T x={236} y={p.y - 4} anchor="end" color="var(--dim)" size={9} mono>
            {p.n}
          </T>
          <T x={246} y={p.y + 4} anchor="start" mono>
            {p.name}
          </T>
        </g>
      ))}
      {pinR.map((p) => (
        <g key={p.n}>
          <T x={374} y={p.y - 4} anchor="start" color="var(--dim)" size={9} mono>
            {p.n}
          </T>
          <T x={364} y={p.y + 4} anchor="end" mono>
            {p.name}
          </T>
        </g>
      ))}
      {jPins.map((p) => (
        <g key={p.n}>
          <T x={664} y={p.y - 4} anchor="end" color="var(--dim)" size={9} mono>
            {p.n}
          </T>
          <T x={676} y={p.y + 4} anchor="start" size={10} mono>
            {p.name}
          </T>
        </g>
      ))}
      <T x={140} y={48} color="var(--blue)" size={10} mono>
        VCC_3V3
      </T>
      <T x={210} y={48} color="var(--blue)" size={10} mono>
        VCC_3V3
      </T>
      <T x={128} y={98} anchor="end" size={10}>
        R1
      </T>
      <T x={128} y={112} anchor="end" color="var(--dim)" size={10}>
        10k
      </T>
      <T x={420} y={86} size={10}>
        R2
      </T>
      <T x={420} y={186} size={10}>
        R2
      </T>
      <T x={480} y={82} size={10}>
        D1
      </T>
    </g>
  )
}

export function HuntFig({ seen, showAll, last, onPick }: { seen: HuntId[]; showAll: boolean; last: HuntId | null; onPick: (id: HuntId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 330" className="term-fig__svg" role="group" aria-label={t(L.aria)}>
        <rect width="760" height="330" rx="10" fill="var(--well)" />
        <Circuit />
        {HOT.map((spot, idx) => {
          const item = HUNT.find((h) => h.id === spot.id)
          const shown = showAll || seen.includes(spot.id)
          const color = item && item.issue ? 'var(--red)' : 'var(--green)'
          const pick = () => onPick(spot.id)
          return (
            <g key={spot.id} role="button" tabIndex={0} aria-label={`${t(L.region)} ${idx + 1}`} aria-pressed={seen.includes(spot.id)} className="pcbFlow-hot" onClick={pick} onKeyDown={keyPick(pick)}>
              {spot.rects.map((r, k) => (
                <rect
                  key={k}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  rx="6"
                  fill={shown ? color : 'transparent'}
                  fillOpacity={shown ? 0.14 : 1}
                  stroke={shown ? color : 'none'}
                  strokeWidth={last === spot.id ? 3 : 1.6}
                />
              ))}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(HUNT_CAP)}</figcaption>
    </figure>
  )
}
