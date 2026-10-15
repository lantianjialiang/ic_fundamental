import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { PROBLEMS, type ProblemId } from './data/pcbLayoutBoard'
import { S } from './data/pcbLayout'
import { T } from './FlowFigs'
import { BadBoard, C, Cap, Frame, Ldo, Mcu, Trace, Usb, Via, Xtal } from './LayoutFigs'

export type ViewId = 'bad' | 'good'

const L = {
  aria: loc('同一块小板的布局图，带编号的可点击区域', 'Layout of the same small board with numbered clickable regions'),
  guard: loc('地铜皮保护，下层不走线', 'GND guard, nothing below'),
  copper1: loc('地铜皮', 'GND copper'),
  copper2: loc('+ 过孔', '+ vias'),
  bottomBad: loc('底层：地平面（有一道槽）', 'Bottom layer: ground plane (with a slot)'),
  bottomGood: loc('底层：完整的地平面', 'Bottom layer: solid ground plane'),
}

function Zone({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return <rect x={x} y={y} width={w} height={h} rx="6" fill={color} fillOpacity="0.1" stroke={color} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="5 3" />
}

function Legend() {
  const { t } = useLocale()
  const items = [
    { x: 40, color: 'var(--blue)', label: S.zoneIf },
    { x: 150, color: 'var(--gold)', label: S.zonePw },
    { x: 250, color: 'var(--purple)', label: S.zoneMcu },
  ]
  return (
    <g>
      {items.map((it) => (
        <g key={it.x}>
          <rect x={it.x} y={366} width="12" height="12" rx="2" fill={it.color} fillOpacity="0.25" stroke={it.color} />
          <T x={it.x + 18} y={376} anchor="start" size={11}>
            {t(it.label)}
          </T>
        </g>
      ))}
    </g>
  )
}

/** 好布局：和坏布局同一批器件，位置和走线改正 */
function GoodBoard() {
  const { t } = useLocale()
  return (
    <g>
      <Zone x={20} y={130} w={130} h={94} color="var(--blue)" />
      <Zone x={82} y={226} w={114} h={78} color="var(--gold)" />
      <Zone x={210} y={100} w={200} h={210} color="var(--purple)" />
      <rect x="98" y="256" width="72" height="44" fill="var(--green)" fillOpacity="0.18" stroke="var(--green)" strokeDasharray="4 3" />
      <rect x="268" y="110" width="130" height="40" rx="4" fill="var(--green)" fillOpacity="0.08" stroke="var(--green)" strokeDasharray="4 3" />
      <T x={333} y={121} size={9} color="var(--green-2)">
        {t(L.guard)}
      </T>
      <Usb x={8} y={140} />
      <T x={36} y={134} color="var(--gold)" bold size={12}>
        J1
      </T>
      <Trace d="M74 152 H90" color={C.gnd} />
      <Via x={92} y={152} />
      <Trace d="M74 170 H104 L141 207 H278" color={C.usb} />
      <Trace d="M74 188 H104 L133 217 H278" color={C.usb} />
      <T x={150} y={198} anchor="start" size={9} color={C.usb}>
        D− / D+
      </T>
      <Trace d="M74 206 H92 V229 H110" color={C.pwr} w={5} />
      <Trace d="M92 229 V234" color={C.pwr} w={5} />
      <Trace d="M92 250 V262" color={C.gnd} />
      <Via x={92} y={262} />
      <Trace d="M130 237 H278" color={C.pwr} w={5} />
      <Trace d="M146 237 V249" color={C.pwr} w={4} />
      <Trace d="M250 237 V249" color={C.pwr} w={4} />
      <Trace d="M250 265 V276" color={C.gnd} />
      <Via x={250} y={276} />
      <Trace d="M270 237 V282 H297 V262" color={C.pwr} w={5} />
      <Trace d="M297 282 H310" color={C.pwr} w={4} />
      <Trace d="M326 282 H338" color={C.gnd} />
      <Via x={338} y={282} />
      <Trace d="M110 245 V256" color={C.gnd} w={3} />
      {[
        [110, 270],
        [126, 270],
        [110, 286],
        [126, 286],
      ].map(([x, y]) => (
        <Via key={`${x}-${y}`} x={x} y={y} />
      ))}
      <Trace d="M317 141 V158" color={C.sig} />
      <Trace d="M347 141 V158" color={C.sig} />
      <Trace d="M307 134 H314" color={C.sig} />
      <Trace d="M350 134 H357" color={C.sig} />
      <Trace d="M291 134 H281" color={C.gnd} />
      <Trace d="M373 134 H384" color={C.gnd} />
      <Via x={281} y={134} />
      <Via x={384} y={134} />
      <Trace d="M382 177 H430 L470 217 V280" color={C.sig} />
      <circle cx="470" cy="245" r="5" fill="none" stroke={C.pad} strokeWidth="2" />
      <Via x={470} y={280} />
      <T x={480} y={249} anchor="start" size={10}>
        TP1
      </T>
      <Mcu />
      <Xtal x={332} y={134} />
      <T x={332} y={153} size={10}>
        Y1
      </T>
      <Cap x={299} y={134} />
      <Cap x={365} y={134} />
      <Cap x={146} y={257} vertical />
      <Cap x={92} y={242} vertical />
      <Cap x={250} y={257} vertical />
      <Cap x={318} y={282} />
      <T x={241} y={256} anchor="end" size={10}>
        C3
      </T>
      <Ldo x={120} y={237} rot />
      <T x={120} y={313} size={10}>
        U2 LDO
      </T>
      <T x={176} y={274} anchor="start" size={9} color="var(--green-2)">
        {t(L.copper1)}
      </T>
      <T x={176} y={286} anchor="start" size={9} color="var(--green-2)">
        {t(L.copper2)}
      </T>
      <Legend />
    </g>
  )
}

type Rect = { x: number; y: number; w: number; h: number }
type Spot = { rects: Rect[]; badge: [number, number] }

const BAD: Record<ProblemId, Spot> = {
  conn: { rects: [{ x: 66, y: 130, w: 86, h: 104 }], badge: [66, 130] },
  power: { rects: [{ x: 326, y: 286, w: 248, h: 58 }], badge: [574, 344] },
  heat: { rects: [{ x: 578, y: 138, w: 78, h: 66 }], badge: [656, 138] },
  decap: { rects: [{ x: 228, y: 284, w: 98, h: 32 }], badge: [232, 284] },
  xtal: { rects: [{ x: 330, y: 74, w: 262, h: 60 }], badge: [330, 74] },
  stub: { rects: [{ x: 380, y: 140, w: 100, h: 128 }], badge: [480, 140] },
  diff: { rects: [{ x: 232, y: 160, w: 58, h: 66 }], badge: [238, 150] },
  slot: { rects: [{ x: 196, y: 108, w: 30, h: 192 }], badge: [211, 300] },
}

const GOOD: Record<ProblemId, Spot> = {
  conn: { rects: [{ x: 2, y: 128, w: 78, h: 100 }], badge: [40, 122] },
  power: { rects: [{ x: 84, y: 222, w: 156, h: 30 }], badge: [186, 248] },
  heat: { rects: [{ x: 98, y: 254, w: 138, h: 50 }], badge: [236, 300] },
  decap: {
    rects: [
      { x: 238, y: 246, w: 26, h: 38 },
      { x: 292, y: 266, w: 54, h: 26 },
    ],
    badge: [318, 298],
  },
  xtal: { rects: [{ x: 268, y: 108, w: 130, h: 52 }], badge: [268, 108] },
  stub: { rects: [{ x: 376, y: 166, w: 120, h: 124 }], badge: [496, 166] },
  diff: { rects: [{ x: 96, y: 160, w: 104, h: 62 }], badge: [150, 156] },
  slot: { rects: [{ x: 202, y: 160, w: 82, h: 64 }], badge: [240, 196] },
}

export function BoardFig({ view, active, onPick }: { view: ViewId; active: ProblemId; onPick: (id: ProblemId) => void }) {
  const { t } = useLocale()
  const bad = view === 'bad'
  const color = bad ? 'var(--red)' : 'var(--green)'
  const spots = bad ? BAD : GOOD
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 392" className="term-fig__svg" role="group" aria-label={t(L.aria)}>
        <Frame />
        <T x={400} y={344} size={10} color="var(--text-2)">
          {t(bad ? L.bottomBad : L.bottomGood)}
        </T>
        {bad ? <BadBoard /> : <GoodBoard />}
        {PROBLEMS.map((p, i) => {
          const spot = spots[p.id]
          const on = p.id === active
          return (
            <Hit key={p.id} label={`${i + 1}. ${t(p.title)}`} active={on} onPick={() => onPick(p.id)}>
              {spot.rects.map((r, k) => (
                <rect
                  key={k}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  rx="6"
                  fill={color}
                  fillOpacity={on ? 0.16 : 0.04}
                  stroke={color}
                  strokeWidth={on ? 2.6 : 1.3}
                  strokeDasharray={on ? undefined : '4 3'}
                />
              ))}
              <circle cx={spot.badge[0]} cy={spot.badge[1]} r="9" fill={color} stroke={on ? 'var(--text)' : 'none'} strokeWidth="2" />
              <text x={spot.badge[0]} y={spot.badge[1] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                {i + 1}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(bad ? S.boardCapBad : S.boardCapGood)}</figcaption>
    </figure>
  )
}
