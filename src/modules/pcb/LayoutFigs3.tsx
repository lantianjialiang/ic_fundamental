import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { DECAP_DIST_MM, MM_PX, type DecapId } from './data/pcbLayoutModel'
import { T } from './FlowFigs'

const L = {
  aria: loc('去耦电容回路的侧视图：电容、芯片引脚、过孔和地平面', 'Side view of the decoupling loop: capacitor, chip pins, via and ground plane'),
  from: loc('3.3 V 来自 LDO', '3.3 V from the LDO'),
  dielectric: loc('介质', 'Dielectric'),
  gnd: loc('地平面', 'Ground plane'),
  dist: loc('电容到引脚', 'Capacitor to pin'),
  behind: loc('虚线：在截面后面', 'Dashed: behind the section'),
  loop: loc('阴影：电流环', 'Shaded: current loop'),
  cap: loc(
    '示意（不按比例）：截面沿电源线切开。电容的地端焊盘在截面后面，它的过孔就在电容正下方。电流从电容出发，经引脚进芯片，从芯片地脚的过孔下到地平面，再贴着走线下方回到电容。',
    'Illustration (not to scale): a section along the supply trace. The capacitor ground pad is behind the section and its via sits right under the capacitor. Current leaves the capacitor, enters the chip at the pin, drops through the chip ground-pin via to the plane, and returns under the trace to the capacitor.',
  ),
}

const COPPER = 'var(--gold-line)'
const PIN_X = 470
const VSS_X = 630
const TOP = 98
const PLANE_Y = 142

type Dir = 'up' | 'down' | 'left' | 'right'

function Arrow({ x, y, dir, color }: { x: number; y: number; dir: Dir; color: string }) {
  const s = 5
  const pts: Record<Dir, string> = {
    right: `${x - s},${y - s} ${x + s},${y} ${x - s},${y + s}`,
    left: `${x + s},${y - s} ${x - s},${y} ${x + s},${y + s}`,
    down: `${x - s},${y - s} ${x},${y + s} ${x + s},${y - s}`,
    up: `${x - s},${y + s} ${x},${y - s} ${x + s},${y + s}`,
  }
  return <polygon points={pts[dir]} fill={color} />
}

const TONE: Record<DecapId, string> = { far: 'var(--red)', mid: 'var(--gold)', near: 'var(--green)' }

export function DecapFig({ id }: { id: DecapId }) {
  const { t } = useLocale()
  const dist = DECAP_DIST_MM[id]
  const xp = PIN_X - dist * MM_PX
  const color = TONE[id]
  const midTop = (xp + PIN_X) / 2
  const midBot = (xp + VSS_X) / 2
  const loop = `${xp},${TOP} ${PIN_X},${TOP} ${PIN_X},78 ${VSS_X},78 ${VSS_X},${PLANE_Y} ${xp},${PLANE_Y}`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img" aria-label={t(L.aria)}>
        <rect width="680" height="250" rx="10" fill="var(--well)" />
        <rect x="20" y="102" width="640" height="40" fill="var(--fig-box-2)" />
        <rect x="20" y="148" width="640" height="34" fill="var(--fig-box)" />
        <rect x="20" y={PLANE_Y} width="640" height="6" fill={COPPER} />
        <rect x="40" y={TOP} width={PIN_X + 7 - 40} height="4" fill={COPPER} />
        <polygon points={loop} fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" strokeDasharray="5 3" />
        <rect x="480" y="52" width="140" height="40" rx="3" fill="var(--card)" stroke="var(--text-2)" strokeWidth="1.6" />
        <T x={512} y={68} color="var(--gold)" bold size={13}>
          U1
        </T>
        <path d={`M480 78 H${PIN_X} V${TOP}`} fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <path d={`M620 78 H${VSS_X} V${TOP}`} fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <rect x={VSS_X - 7} y={TOP} width="14" height="4" fill={COPPER} />
        <rect x={VSS_X - 3} y="102" width="6" height="40" fill={COPPER} />
        <rect x={xp + 7} y="102" width="6" height="40" fill="none" stroke={COPPER} strokeDasharray="3 2" />
        <rect x={xp - 7} y="90" width="14" height="8" fill="var(--card)" stroke="var(--text-2)" strokeWidth="1.2" />
        <T x={xp} y={86} size={10}>
          C
        </T>
        <T x={PIN_X - 12} y={74} anchor="end" size={9} mono>
          VDD
        </T>
        <T x={VSS_X + 12} y={74} anchor="start" size={9} mono>
          VSS
        </T>
        {dist >= 5 ? <Arrow x={midTop} y={TOP - 7} dir="right" color={color} /> : null}
        <Arrow x={PIN_X} y={88} dir="up" color={color} />
        <Arrow x={570} y={78} dir="right" color={color} />
        <Arrow x={VSS_X - 14} y={120} dir="down" color={color} />
        <Arrow x={midBot} y={PLANE_Y - 10} dir="left" color={color} />
        <Arrow x={xp - 12} y={120} dir="up" color={color} />
        <path d={`M${xp} 196 H${PIN_X} M${xp} 190 V202 M${PIN_X} 190 V202`} stroke="var(--text-2)" strokeWidth="1.2" fill="none" />
        <T x={midTop} y={218} size={11} color="var(--text-2)">
          {`${t(L.dist)} ${dist} mm`}
        </T>
        <T x={30} y={67} anchor="start" size={10} color="var(--gold)">
          {t(L.from)}
        </T>
        <T x={30} y={116} anchor="start" size={10}>
          {t(L.dielectric)}
        </T>
        <T x={30} y={137} anchor="start" size={10}>
          {t(L.gnd)}
        </T>
        <T x={650} y={170} anchor="end" size={10} color="var(--dim)">
          {t(L.behind)}
        </T>
        <T x={650} y={186} anchor="end" size={10} color={color}>
          {t(L.loop)}
        </T>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
