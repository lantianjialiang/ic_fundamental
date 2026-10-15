import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type ComboKind } from './data/mosGatesTg'
import { DIM, HI_DOWN, HI_UP, T } from './GatesNet'
import { type Bit } from './gatesModel'

const MUX_CAP = loc(
  '传输门符号是两个三角形顶点相接（蝴蝶结），上下各有一个控制端，下面带圈的那个接 PMOS 栅极。导通的传输门着绿色，它传过去的那一路按电平着色。',
  'The transmission-gate symbol is two triangles meeting at their tips (a bowtie) with a control pin above and below; the pin with the bubble drives the PMOS gate. A conducting gate is green and the path it passes is coloured by level.',
)

const lvl = (v: Bit) => (v === 1 ? HI_UP : HI_DOWN)

function Inv({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <polygon points={`${x},${y - 10} ${x + 26},${y} ${x},${y + 10}`} fill="var(--card)" stroke={color} strokeWidth="2" />
      <circle cx={x + 30} cy={y} r={3.5} fill="var(--card)" stroke={color} strokeWidth="2" />
    </g>
  )
}

function Tg({ x, y, on, top, bottom }: { x: number; y: number; on: boolean; top: string; bottom: string }) {
  const col = on ? 'var(--green)' : DIM
  return (
    <g>
      <polygon points={`${x},${y - 14} ${x},${y + 14} ${x + 20},${y} ${x + 40},${y + 14} ${x + 40},${y - 14} ${x + 20},${y}`} fill={on ? 'var(--green)' : 'none'} fillOpacity="0.2" stroke={col} strokeWidth="2.2" strokeLinejoin="round" />
      <path d={`M${x + 20} ${y - 26} V${y - 8} M${x + 20} ${y + 8} V${y + 14.5} M${x + 20} ${y + 21.5} V${y + 28}`} stroke={col} strokeWidth="2" />
      <circle cx={x + 20} cy={y + 18} r={3.5} fill="var(--card)" stroke={col} strokeWidth="2" />
      <T x={x + 20} y={y - 30} size={11} color="var(--text)" bold>
        {top}
      </T>
      <T x={x + 20} y={y + 41} size={11} color="var(--text)" bold>
        {bottom}
      </T>
    </g>
  )
}

function Wire({ d, live, v }: { d: string; live: boolean; v: Bit }) {
  return <path d={d} fill="none" stroke={live ? lvl(v) : DIM} strokeWidth={live ? 3.5 : 2} strokeLinecap="round" />
}

function Digit({ x, y, v, live }: { x: number; y: number; v: Bit; live: boolean }): ReactNode {
  return (
    <T x={x} y={y} size={12} color={live ? lvl(v) : DIM} bold mono>
      {`${v}`}
    </T>
  )
}

type Props = { kind: ComboKind; a: Bit; b: Bit; s: Bit }

/** mux：I0 = A、I1 = B、选择 S；xor：I0 = B、I1 = ¬B、选择 A */
export function MuxFig({ kind, a, b, s }: Props) {
  const { t } = useLocale()
  const xor = kind === 'xor'
  const sel = xor ? a : s
  const selName = xor ? 'A' : 'S'
  const v0: Bit = xor ? b : a
  const v1: Bit = xor ? ((1 - b) as Bit) : b
  const y: Bit = sel === 1 ? v1 : v0
  const on0 = sel === 0
  const on1 = sel === 1
  const n0 = xor ? 'B' : 'A'
  const n1 = 'B'
  const Y0 = 80
  const Y1 = 190
  const YO = 135
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 640 300" className="term-fig__svg" role="img" aria-label={t(MUX_CAP)}>
        <rect width="640" height="300" rx="10" fill="var(--well)" />
        <T x={14} y={Y0 + 4} anchor="start" size={12} color="var(--text)" bold mono>
          {`${n0} = ${v0}`}
        </T>
        <T x={14} y={Y1 + 4} anchor="start" size={12} color="var(--text)" bold mono>
          {`${n1} = ${b}`}
        </T>
        <Wire d={`M70 ${Y0} H280`} live={on0} v={v0} />
        <Digit x={215} y={Y0 - 8} v={v0} live={on0} />
        {xor ? (
          <g>
            <Wire d={`M70 ${Y1} H120`} live={on1} v={b} />
            <Inv x={120} y={Y1} color={on1 ? lvl(v1) : DIM} />
            <Wire d={`M154 ${Y1} H280`} live={on1} v={v1} />
            <T x={137} y={Y1 - 18} size={11} color="var(--text-2)" bold>
              {'¬B'}
            </T>
          </g>
        ) : (
          <Wire d={`M70 ${Y1} H280`} live={on1} v={v1} />
        )}
        <Digit x={215} y={Y1 - 8} v={v1} live={on1} />
        <Tg x={280} y={Y0} on={on0} top={`¬${selName}`} bottom={selName} />
        <Tg x={280} y={Y1} on={on1} top={selName} bottom={`¬${selName}`} />
        <T x={332} y={Y0 - 22} anchor="start" size={11} color="var(--muted)">
          TG0
        </T>
        <T x={332} y={Y1 - 22} anchor="start" size={11} color="var(--muted)">
          TG1
        </T>
        <Wire d={`M320 ${Y0} H470 V${YO}`} live={on0} v={v0} />
        <Wire d={`M320 ${Y1} H470 V${YO}`} live={on1} v={v1} />
        <Wire d={`M470 ${YO} H560`} live v={y} />
        <circle cx={470} cy={YO} r={4.5} fill={lvl(y)} />
        <circle cx={560} cy={YO} r={5} fill="var(--card)" stroke={lvl(y)} strokeWidth="2.5" />
        <T x={572} y={YO + 5} anchor="start" size={14} color={lvl(y)} bold mono>
          {`Y = ${y}`}
        </T>
        <T x={14} y={268} anchor="start" size={12} color="var(--text)" bold mono>
          {`${selName} = ${sel}`}
        </T>
        <Wire d="M62 268 H70" live={false} v={0} />
        <Inv x={70} y={268} color="var(--text-2)" />
        <Wire d="M104 268 H114" live={false} v={0} />
        <T x={120} y={273} anchor="start" size={12} color="var(--text)" bold>
          {`¬${selName} = ${1 - sel}`}
        </T>
      </svg>
      <figcaption>{t(MUX_CAP)}</figcaption>
    </figure>
  )
}
