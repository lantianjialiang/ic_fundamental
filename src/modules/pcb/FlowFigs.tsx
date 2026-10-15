import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { FLOW_CAP, LOOPS, STEPS } from './data/pcbFlow'

const L = {
  flowAria: loc('设计流程图：十个步骤', 'Design flow chart: ten steps'),
  symAria: loc('原理图符号画法示意', 'Schematic symbol conventions'),
  sigFlow: loc('信号从左到右，电源在上，地在下', 'Signals left → right, power up, ground down'),
  dot: loc('有圆点：相连', 'Dot: connected'),
  cross: loc('没圆点：只是交叉', 'No dot: just crossing'),
  junction: loc('连接点', 'Junctions'),
  refVal: loc('位号 + 值', 'Designator + value'),
  symCap: loc(
    '示意：一颗虚构的缓冲器 U1。引脚号标在引脚外侧，名字写在框内；T 形相交加圆点才算连接。',
    'Illustration: a made-up buffer U1. Pin numbers sit outside the pins, names inside the box; only a T-junction with a dot counts as connected.',
  ),
}

type Dir = 'right' | 'down' | 'up'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

export function head(x: number, y: number, dir: Dir, color: string) {
  const s = 6
  const pts =
    dir === 'right'
      ? `${x - s},${y - s / 2 - 1} ${x},${y} ${x - s},${y + s / 2 + 1}`
      : dir === 'down'
        ? `${x - s / 2 - 1},${y - s} ${x},${y} ${x + s / 2 + 1},${y - s}`
        : `${x - s / 2 - 1},${y + s} ${x},${y} ${x + s / 2 + 1},${y + s}`
  return <polygon points={pts} fill={color} />
}

const BW = 128
const BH = 52
const GAP = 148
const ROW_Y = [24, 124]

function boxPos(i: number) {
  return { x: 20 + (i % 5) * GAP, y: ROW_Y[i < 5 ? 0 : 1] }
}

export function FlowFig({ step, onPick }: { step: number; onPick: (i: number) => void }) {
  const { t } = useLocale()
  const dim = 'var(--dim)'
  const drcOn = STEPS[step].id === 'drc'
  const revOn = STEPS[step].id === 'review'
  const loop1 = drcOn ? 'var(--gold)' : 'var(--blue-line)'
  const loop2 = revOn ? 'var(--gold)' : 'var(--blue-line)'
  const cx = (i: number) => boxPos(i).x + BW / 2
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 262" className="term-fig__svg" role="group" aria-label={t(L.flowAria)}>
        <rect width="760" height="262" rx="10" fill="var(--well)" />
        {STEPS.slice(0, 9).map((_, i) => {
          if (i === 4) {
            return null
          }
          const p = boxPos(i)
          return (
            <g key={`a${i}`}>
              <path d={`M${p.x + BW} ${p.y + BH / 2} H${p.x + GAP - 1}`} stroke={dim} strokeWidth="1.5" fill="none" />
              {head(p.x + GAP, p.y + BH / 2, 'right', dim)}
            </g>
          )
        })}
        <path d={`M${cx(4)} ${ROW_Y[0] + BH} V100 H${cx(5)} V${ROW_Y[1] - 2}`} stroke={dim} strokeWidth="1.5" fill="none" />
        {head(cx(5), ROW_Y[1], 'down', dim)}
        <g fill="none" strokeWidth={drcOn ? 3 : 1.5} stroke={loop1} strokeDasharray={drcOn ? undefined : '5 4'}>
          <path d={`M${cx(7)} ${ROW_Y[1] + BH} V200 H${cx(6)} V${ROW_Y[1] + BH + 4}`} />
        </g>
        {head(cx(6), ROW_Y[1] + BH + 1, 'up', loop1)}
        <g fill="none" strokeWidth={revOn ? 3 : 1.5} stroke={loop2} strokeDasharray={revOn ? undefined : '5 4'}>
          <path d={`M${cx(8)} ${ROW_Y[1] + BH} V232 H${cx(5)} V${ROW_Y[1] + BH + 4}`} />
        </g>
        {head(cx(5), ROW_Y[1] + BH + 1, 'up', loop2)}
        <T x={306} y={217} color={drcOn ? 'var(--gold)' : 'var(--text-2)'} bold={drcOn}>
          {t(LOOPS.drc)}
        </T>
        <T x={306} y={249} color={revOn ? 'var(--gold)' : 'var(--text-2)'} bold={revOn}>
          {t(LOOPS.review)}
        </T>
        {STEPS.map((s, i) => {
          const p = boxPos(i)
          const on = i === step
          const done = i < step
          return (
            <Hit key={s.id} label={`${i + 1}. ${t(s.title)}`} active={on} onPick={() => onPick(i)}>
              <rect
                x={p.x}
                y={p.y}
                width={BW}
                height={BH}
                rx="8"
                fill={on ? 'var(--gold-bg)' : done ? 'var(--green-bg)' : 'var(--card)'}
                stroke={on ? 'var(--gold)' : done ? 'var(--green-line)' : 'var(--line)'}
                strokeWidth={on ? 2.5 : 1.2}
              />
              <T x={p.x + BW / 2} y={p.y + 19} color={on ? 'var(--gold)' : 'var(--muted)'} size={11} bold>
                {String(i + 1)}
              </T>
              <T x={p.x + BW / 2} y={p.y + 39} color="var(--text)" size={12} bold={on}>
                {t(s.title)}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(FLOW_CAP)}</figcaption>
    </figure>
  )
}

/** 一颗虚构缓冲器 U1：左入右出，电源上地下 */
export function SymbolFig() {
  const { t } = useLocale()
  const line = 'var(--text)'
  const pins: Array<{ n: string; name: string; net: string; x: number; y: number }> = [
    { n: '1', name: 'IN', net: 'SIG_IN', x: 110, y: 110 },
    { n: '2', name: 'EN#', net: 'EN_N', x: 110, y: 150 },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(L.symAria)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <g stroke={line} strokeWidth="1.8" fill="none">
          <rect x="170" y="62" width="120" height="120" fill="var(--card)" />
          <path d="M110 110 H170 M110 150 H170 M290 130 H350 M230 62 V32 M230 182 V204" />
          <path d="M214 204 H246 M220 210 H240 M226 216 H234" />
        </g>
        <T x={176} y={84} anchor="start" color="var(--gold)" bold size={13}>
          U1
        </T>
        {pins.map((p) => (
          <g key={p.n}>
            <T x={p.x - 6} y={p.y + 4} anchor="end" color="var(--blue)" mono>
              {p.net}
            </T>
            <T x={164} y={p.y - 4} anchor="end" color="var(--dim)" size={10} mono>
              {p.n}
            </T>
            <T x={176} y={p.y + 4} anchor="start" mono>
              {p.name}
            </T>
          </g>
        ))}
        <T x={284} y={134} anchor="end" mono>
          OUT
        </T>
        <T x={296} y={126} anchor="start" color="var(--dim)" size={10} mono>
          4
        </T>
        <T x={356} y={134} anchor="start" color="var(--blue)" mono>
          SIG_OUT
        </T>
        <T x={230} y={82} mono>
          VCC
        </T>
        <T x={236} y={50} anchor="start" color="var(--dim)" size={10} mono>
          5
        </T>
        <T x={230} y={26} color="var(--blue)" mono>
          VCC_3V3
        </T>
        <T x={230} y={170} mono>
          GND
        </T>
        <T x={236} y={198} anchor="start" color="var(--dim)" size={10} mono>
          3
        </T>
        <T x={20} y={246} anchor="start" color="var(--text-2)">
          {t(L.sigFlow)}
        </T>
        <T x={590} y={28} bold size={12} color="var(--text)">
          {t(L.junction)}
        </T>
        <g stroke={line} strokeWidth="1.8" fill="none">
          <path d="M460 70 H580 M520 70 V110" />
          <path d="M600 70 H720 M660 50 V110" />
          <path d="M450 209 H480 M540 209 H570" />
          <rect x="480" y="200" width="60" height="18" />
        </g>
        <circle cx="520" cy="70" r="4.5" fill={line} />
        <T x={520} y={135} color="var(--green)">
          {t(L.dot)}
        </T>
        <T x={660} y={135} color="var(--red)">
          {t(L.cross)}
        </T>
        <T x={510} y={194}>
          R1
        </T>
        <T x={510} y={236} color="var(--text-2)">
          10 kΩ
        </T>
        <T x={586} y={213} anchor="start" color="var(--text-2)">
          {t(L.refVal)}
        </T>
      </svg>
      <figcaption>{t(L.symCap)}</figcaption>
    </figure>
  )
}
