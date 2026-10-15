import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Pt } from './data/pcbLayoutLanes'
import { T } from './FlowFigs'

// 顶层铜：信号蓝、电源金、USB 紫；焊盘和器件用中性色
export const C = {
  sig: 'var(--blue)',
  pwr: 'var(--gold)',
  usb: 'var(--purple)',
  gnd: 'var(--dim)',
  pad: 'var(--text-2)',
  body: 'var(--card)',
  edge: 'var(--text-2)',
}

export const MCU = { cx: 330, cy: 210 }
export const pinPos = (i: number) => -33 + 10 * i

export function Trace({ d, color, w = 2 }: { d: string; color: string; w?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" />
}

export function Pad({ x, y, w = 6, h = 6 }: { x: number; y: number; w?: number; h?: number }) {
  return <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={C.pad} />
}

export function Via({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.5" fill="var(--well)" stroke={C.gnd} strokeWidth="1.6" />
}

/** 0402 电容，两端焊盘中心距中心 ±5.5 */
export function Cap({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  const w = vertical ? 9 : 16
  const h = vertical ? 16 : 9
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={C.body} stroke={C.edge} strokeWidth="1" />
      {vertical ? (
        <>
          <Pad x={x} y={y - 5.5} w={9} h={5} />
          <Pad x={x} y={y + 5.5} w={9} h={5} />
        </>
      ) : (
        <>
          <Pad x={x - 5.5} y={y} w={5} h={9} />
          <Pad x={x + 5.5} y={y} w={5} h={9} />
        </>
      )}
    </g>
  )
}

export function Mcu({ label = true }: { label?: boolean }) {
  const { cx, cy } = MCU
  const idx = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <g>
      {idx.map((i) => (
        <g key={i}>
          <rect x={cx - 52} y={cy + pinPos(i) - 1.5} width="10" height="3" fill={C.pad} />
          <rect x={cx + 42} y={cy + pinPos(i) - 1.5} width="10" height="3" fill={C.pad} />
          <rect x={cx + pinPos(i) - 1.5} y={cy - 52} width="3" height="10" fill={C.pad} />
          <rect x={cx + pinPos(i) - 1.5} y={cy + 42} width="3" height="10" fill={C.pad} />
        </g>
      ))}
      <rect x={cx - 42} y={cy - 42} width="84" height="84" rx="3" fill={C.body} stroke={C.edge} strokeWidth="1.6" />
      <circle cx={cx - 34} cy={cy - 34} r="2.5" fill={C.edge} />
      {label ? (
        <>
          <T x={cx} y={cy - 2} color="var(--gold)" bold size={13}>
            U1
          </T>
          <T x={cx} y={cy + 14} size={11}>
            MCU
          </T>
        </>
      ) : null}
    </g>
  )
}

/** SOT-23 三脚 LDO。rot 为 true 时两个脚在左、一个脚在右 */
export function ldoPads(x: number, y: number, rot: boolean): { inn: Pt; gnd: Pt; out: Pt } {
  return rot
    ? { inn: [x - 10, y - 8], gnd: [x - 10, y + 8], out: [x + 10, y] }
    : { inn: [x + 8, y + 10], gnd: [x - 8, y + 10], out: [x, y - 10] }
}

export function Ldo({ x, y, rot = false }: { x: number; y: number; rot?: boolean }) {
  const p = ldoPads(x, y, rot)
  return (
    <g>
      <rect x={rot ? x - 7 : x - 11} y={rot ? y - 11 : y - 7} width={rot ? 14 : 22} height={rot ? 22 : 14} fill={C.body} stroke={C.edge} strokeWidth="1.2" />
      <Pad x={p.inn[0]} y={p.inn[1]} />
      <Pad x={p.gnd[0]} y={p.gnd[1]} />
      <Pad x={p.out[0]} y={p.out[1]} />
    </g>
  )
}

/** USB 插座：左面是插口，右面四个焊盘（GND、D−、D+、电源），y 为顶边 */
export function Usb({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="56" height="84" rx="2" fill="var(--fig-box-2)" stroke={C.edge} strokeWidth="1.6" />
      <rect x={x} y={y + 22} width="8" height="40" fill="var(--well)" stroke={C.edge} strokeWidth="1" />
      <rect x={x + 8} y={y + 26} width="28" height="32" fill="none" stroke={C.edge} strokeWidth="1" strokeDasharray="3 2" />
      <circle cx={x + 46} cy={y + 8} r="3" fill="var(--well)" stroke={C.edge} strokeWidth="1.2" />
      <circle cx={x + 46} cy={y + 76} r="3" fill="var(--well)" stroke={C.edge} strokeWidth="1.2" />
      {[12, 30, 48, 66].map((dy) => (
        <Pad key={dy} x={x + 61} y={y + dy} w={10} h={5} />
      ))}
    </g>
  )
}

/** 3225 贴片晶振：两端焊盘，焊盘中心距中心 ±15 */
export function Xtal({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 11} y={y - 10} width="22" height="20" fill="var(--fig-box-2)" stroke={C.edge} strokeWidth="1.2" />
      <Pad x={x - 15} y={y} w={6} h={14} />
      <Pad x={x + 15} y={y} w={6} h={14} />
    </g>
  )
}

export function Frame() {
  return (
    <g>
      <rect width="680" height="392" rx="10" fill="var(--well)" />
      <rect x="20" y="20" width="640" height="330" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="1.6" />
    </g>
  )
}

export const FIG_L = {
  slot: loc('底层地槽', 'GND slot'),
}

/** 坏布局：8 处问题都画在图里 */
export function BadBoard() {
  const { t } = useLocale()
  return (
    <g>
      <rect x="206" y="108" width="10" height="192" fill="var(--red)" fillOpacity="0.12" stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" />
      <T x={211} y={102} size={10} color="var(--red-2)">
        {t(FIG_L.slot)}
      </T>
      <Usb x={76} y={140} />
      <T x={104} y={134} color="var(--gold)" bold size={12}>
        J1
      </T>
      <Trace d="M141 152 H158" color={C.gnd} />
      <Via x={158} y={152} />
      <Trace d="M141 170 H262 V207 H278" color={C.usb} />
      <Trace d="M141 188 H200 L230 217 H278" color={C.usb} />
      <T x={148} y={166} anchor="start" size={9} color={C.usb}>
        D− / D+
      </T>
      <Trace d="M141 206 H190 V330 H598 V180" color={C.pwr} />
      <Trace d="M590 160 V146 H520 V300 H317 V262" color={C.pwr} />
      <Trace d="M545 90 H307 V158" color={C.sig} />
      <Trace d="M575 90 V126 H347 V158" color={C.sig} />
      <Trace d="M382 177 H470 L432 152" color={C.sig} />
      <Trace d="M420 177 V254" color={C.sig} />
      <Trace d="M317 300 H268" color={C.pwr} />
      <Trace d="M251 300 H240" color={C.pwr} />
      <Trace d="M582 180 V194" color={C.gnd} />
      <Via x={582} y={194} />
      <Via x={432} y={152} />
      <Via x={240} y={300} />
      <circle cx="420" cy="258" r="5" fill="none" stroke={C.pad} strokeWidth="2" />
      <T x={430} y={262} anchor="start" size={10}>
        TP1
      </T>
      <Mcu />
      <Cap x={260} y={300} />
      <T x={260} y={288} size={10}>
        C3
      </T>
      <Ldo x={590} y={170} />
      <T x={608} y={168} anchor="start" size={10}>
        U2 LDO
      </T>
      <Xtal x={560} y={90} />
      <T x={560} y={70} size={10}>
        Y1
      </T>
    </g>
  )
}
