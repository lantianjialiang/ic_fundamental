import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Hookup, type MemPat, type PkgStyle, type Res } from './data/ate'

/* ---------- 封装示意 ---------- */

const PL = {
  top: loc('俯视图'),
  bottom: loc('底视图'),
  lid: loc('金属盖'),
  die: 'die',
}

export function PkgFig({ style, pins, name }: { style: PkgStyle; pins: number; name: string }) {
  const { t } = useLocale()
  const cx = 340
  const cy = 100
  const pinFill = 'var(--line-2)'
  const body = 'var(--fig-box-2)'
  const els: ReactNode[] = []
  const bottomView = style === 'grid' || style === 'ball'

  if (style === 'dual' || style === 'cerdip' || style === 'smd') {
    const smd = style === 'smd'
    const w = smd ? 150 + pins * 3 : 220
    const h = smd ? 60 : 80
    const pitch = (w - 30) / (pins - 1)
    const pinW = smd ? Math.max(4, pitch * 0.45) : 10
    const pinL = smd ? 16 : 14
    for (let i = 0; i < pins; i += 1) {
      const x = cx - w / 2 + 15 + i * pitch - pinW / 2
      els.push(<rect key={`t${i}`} x={x} y={cy - h / 2 - pinL} width={pinW} height={pinL} fill={pinFill} />)
      els.push(<rect key={`b${i}`} x={x} y={cy + h / 2} width={pinW} height={pinL} fill={pinFill} />)
    }
    els.push(<rect key="body" x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="4" fill={body} stroke="var(--line-2)" />)
    els.push(<path key="notch" d={`M${cx - w / 2} ${cy - 10} A10 10 0 0 1 ${cx - w / 2} ${cy + 10}`} fill="var(--well)" stroke="var(--line-2)" />)
    if (style === 'cerdip') {
      els.push(<rect key="lid" x={cx - 45} y={cy - 26} width="90" height="52" rx="4" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />)
      els.push(
        <text key="lidt" x={cx} y={cy + 4} textAnchor="middle" fill="var(--gold)" fontSize="11">
          {t(PL.lid)}
        </text>,
      )
    }
  } else if (style === 'single') {
    const w = 260
    for (let i = 0; i < pins; i += 1) {
      els.push(<rect key={i} x={cx - w / 2 + 16 + i * ((w - 32) / (pins - 1)) - 4} y={cy + 30} width="8" height="26" fill={pinFill} />)
    }
    els.push(<rect key="body" x={cx - w / 2} y={cy - 40} width={w} height="70" rx="4" fill={body} stroke="var(--line-2)" />)
  } else if (style === 'module') {
    const w = 400
    els.push(<rect key="pcb" x={cx - w / 2} y={cy - 55} width={w} height="100" rx="4" fill="var(--green-bg)" stroke="var(--green-line)" />)
    for (let i = 0; i < 4; i += 1) {
      els.push(<rect key={`c${i}`} x={cx - w / 2 + 24 + i * 92} y={cy - 40} width="70" height="48" rx="3" fill={body} stroke="var(--line-2)" />)
    }
    for (let i = 0; i < pins; i += 1) {
      els.push(<rect key={`f${i}`} x={cx - w / 2 + 12 + i * ((w - 24) / pins)} y={cy + 24} width="10" height="18" fill="var(--gold)" opacity="0.8" />)
    }
  } else if (style === 'quad') {
    const s = 130
    const pitch = (s - 24) / (pins - 1)
    for (let i = 0; i < pins; i += 1) {
      const p = cx - s / 2 + 12 + i * pitch - 2.5
      const q = cy - s / 2 + 12 + i * pitch - 2.5
      els.push(<rect key={`t${i}`} x={p} y={cy - s / 2 - 16} width="5" height="16" fill={pinFill} />)
      els.push(<rect key={`b${i}`} x={p} y={cy + s / 2} width="5" height="16" fill={pinFill} />)
      els.push(<rect key={`l${i}`} x={cx - s / 2 - 16} y={q} width="16" height="5" fill={pinFill} />)
      els.push(<rect key={`r${i}`} x={cx + s / 2} y={q} width="16" height="5" fill={pinFill} />)
    }
    els.push(<rect key="body" x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx="4" fill={body} stroke="var(--line-2)" />)
    els.push(<circle key="dot" cx={cx - s / 2 + 14} cy={cy - s / 2 + 14} r="4" fill="var(--line-2)" />)
  } else if (bottomView) {
    const s = 160
    els.push(<rect key="body" x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx="6" fill={body} stroke="var(--line-2)" />)
    const n = 9
    const step = (s - 24) / (n - 1)
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (style === 'grid' && r > 2 && r < 6 && c > 2 && c < 6) continue
        els.push(
          <circle
            key={`${r}-${c}`}
            cx={cx - s / 2 + 12 + c * step}
            cy={cy - s / 2 + 12 + r * step}
            r={style === 'ball' ? 6 : 3}
            fill={style === 'ball' ? 'var(--muted)' : pinFill}
          />,
        )
      }
    }
  } else {
    // MCM：一个封装里多颗 die
    const s = 170
    for (let i = 0; i < pins; i += 1) {
      const p = cx - s / 2 + 14 + i * ((s - 28) / (pins - 1)) - 2.5
      els.push(<rect key={`t${i}`} x={p} y={cy - s / 2 - 14 + 10} width="5" height="14" fill={pinFill} />)
      els.push(<rect key={`b${i}`} x={p} y={cy + s / 2 - 10} width="5" height="14" fill={pinFill} />)
    }
    els.push(<rect key="body" x={cx - s / 2} y={cy - s / 2 + 10} width={s} height={s - 20} rx="4" fill={body} stroke="var(--line-2)" />)
    const dice = [
      { x: cx - 65, y: cy - 50, w: 55, h: 45 },
      { x: cx + 5, y: cy - 50, w: 60, h: 45 },
      { x: cx - 40, y: cy + 8, w: 80, h: 40 },
    ]
    dice.forEach((d, i) => {
      els.push(<rect key={`d${i}`} x={d.x} y={d.y} width={d.w} height={d.h} fill="var(--blue-bg)" stroke="var(--blue)" />)
      els.push(
        <text key={`dt${i}`} x={d.x + d.w / 2} y={d.y + d.h / 2 + 4} textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {PL.die}
        </text>,
      )
    })
  }

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 200" className="term-fig__svg" role="img" aria-label={name}>
        <rect width="680" height="200" rx="10" fill="var(--well)" />
        {els}
        <text x="20" y="28" fill="var(--text)" fontSize="16" fontFamily="var(--mono)">{name}</text>
        <text x="20" y="48" fill="var(--dim)" fontSize="11">{t(bottomView ? PL.bottom : PL.top)}</text>
      </svg>
    </figure>
  )
}

/* ---------- bond wire ---------- */

const BL = {
  cavity: 'die cavity',
  pad: 'bond pad',
  wire: 'bond wire',
  lead: loc('封装引脚'),
  cap: loc('die 粘在 die cavity 中央，bond wire 从每个 bond pad 拉到封装引脚。'),
}

export function BondFig() {
  const { t } = useLocale()
  const cx = 340
  const cy = 125
  const n = 5
  const pads: Array<{ px: number; py: number; lx: number; ly: number }> = []
  for (let i = 0; i < n; i += 1) {
    const o = -32 + i * 16
    pads.push({ px: cx + o, py: cy - 42, lx: cx + o * 2.2, ly: cy - 100 })
    pads.push({ px: cx + o, py: cy + 42, lx: cx + o * 2.2, ly: cy + 100 })
    pads.push({ px: cx - 42, py: cy + o, lx: cx - 150, ly: cy + o * 1.8 })
    pads.push({ px: cx + 42, py: cy + o, lx: cx + 150, ly: cy + o * 1.8 })
  }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img" aria-label={t(BL.cap)}>
        <rect width="680" height="250" rx="10" fill="var(--well)" />
        <rect x={cx - 120} y={cy - 80} width="240" height="160" rx="6" fill="var(--fig-box)" stroke="var(--line)" strokeDasharray="5 4" />
        <text x={cx + 116} y={cy - 66} textAnchor="end" fill="var(--dim)" fontSize="11" fontFamily="var(--mono)">{BL.cavity}</text>
        {pads.map((p, i) => (
          <rect key={`l${i}`} x={p.lx - 6} y={p.ly - 6} width="12" height="12" fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
        ))}
        <rect x={cx - 50} y={cy - 50} width="100" height="100" rx="3" fill="var(--fig-box-2)" stroke="var(--line-2)" strokeWidth="2" />
        {pads.map((p, i) => (
          <g key={`p${i}`}>
            <line x1={p.px} y1={p.py} x2={p.lx} y2={p.ly} stroke="var(--text-2)" strokeWidth="1.2" />
            <rect x={p.px - 4} y={p.py - 4} width="8" height="8" fill="var(--fig-box)" stroke="var(--muted)" />
          </g>
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">die</text>
        <text x="40" y="40" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">{BL.pad}</text>
        <line x1="95" y1="44" x2={cx - 42} y2={cy - 40} stroke="var(--sky)" strokeOpacity="0.6" />
        <text x="560" y="40" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">{BL.wire}</text>
        <line x1="575" y1="44" x2={cx + 46} y2={cy - 20} stroke="var(--sky)" strokeOpacity="0.6" />
        <text x="560" y="225" fill="var(--sky)" fontSize="11">{t(BL.lead)}</text>
        <line x1="575" y1="212" x2={cx + 150} y2={cy + 36} stroke="var(--sky)" strokeOpacity="0.6" />
      </svg>
      <figcaption>{t(BL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 测试系统连接链 ---------- */

const KL = {
  pc: loc('计算机 + 测试程序'),
  tester: loc('测试仪器'),
  head: loc('测试头'),
  lb: loc('负载板'),
  pcard: loc('探针卡'),
  socket: loc('测试座 Socket'),
  handler: loc('分选机接触器'),
  die: loc('晶圆上的 die'),
  pkg: loc('封装好的芯片'),
  cap: loc('黄色框是随测试方式变化的部分，前面四段是同一套测试系统。'),
}

export function HookupFig({ mode }: { mode: Hookup }) {
  const { t } = useLocale()
  const boxes = [
    { id: 'pc', label: KL.pc, hot: false },
    { id: 'tester', label: KL.tester, hot: false },
    { id: 'head', label: KL.head, hot: false },
    { id: 'lb', label: KL.lb, hot: false },
    { id: 'link', label: mode === 'cp' ? KL.pcard : mode === 'hand' ? KL.socket : KL.handler, hot: true },
    { id: 'dut', label: mode === 'cp' ? KL.die : KL.pkg, hot: true },
  ]
  const w = 96
  const gap = 15
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 120" className="term-fig__svg" role="img" aria-label={t(KL.cap)}>
        <rect width="680" height="120" rx="10" fill="var(--well)" />
        {boxes.map((box, i) => {
          const x = 14 + i * (w + gap)
          return (
            <g key={box.id}>
              <rect
                x={x}
                y="36"
                width={w}
                height="48"
                rx="8"
                fill={box.hot ? 'var(--gold-bg)' : 'var(--fig-box)'}
                stroke={box.hot ? 'var(--gold-line)' : 'var(--line)'}
              />
              <foreignObject x={x + 4} y="38" width={w - 8} height="44">
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: 12,
                    lineHeight: 1.25,
                    color: 'var(--text)',
                  }}
                >
                  {t(box.label)}
                </div>
              </foreignObject>
              {i < boxes.length - 1 ? (
                <path d={`M${x + w + 2} 60 L${x + w + gap - 2} 60 M${x + w + gap - 7} 55 L${x + w + gap - 2} 60 L${x + w + gap - 7} 65`} fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
              ) : null}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(KL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 指针表 vs 数字表 ---------- */

const CL = {
  analog: loc('指针表：连续'),
  digital: loc('数字表：按格显示'),
}

export function clockText(sec: number, res: Res) {
  const s = Math.floor(sec)
  const ss = String(s).padStart(2, '0')
  if (res === 'min') return { text: '10:08', shown: 0 }
  if (res === 'sec') return { text: `10:08:${ss}`, shown: s }
  if (res === 'ds') {
    const d = Math.floor(sec * 10) / 10
    return { text: `10:08:${ss}.${Math.floor(sec * 10) % 10}`, shown: d }
  }
  const c = Math.floor(sec * 100) / 100
  return { text: `10:08:${ss}.${String(Math.floor(sec * 100) % 100).padStart(2, '0')}`, shown: c }
}

export function ClockFig({ sec, res }: { sec: number; res: Res }) {
  const { t } = useLocale()
  const cx = 170
  const cy = 120
  const R = 88
  const minute = 8 + sec / 60
  const hour = 10 + minute / 60
  const hand = (deg: number, len: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return { x: cx + Math.cos(a) * len, y: cy + Math.sin(a) * len }
  }
  const hp = hand(hour * 30, 46)
  const mp = hand(minute * 6, 70)
  const sp = hand(sec * 6, 80)
  const { text } = clockText(sec, res)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img" aria-label={text}>
        <rect width="680" height="250" rx="10" fill="var(--well)" />
        <circle cx={cx} cy={cy} r={R} fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="2" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = ((i * 6 - 90) * Math.PI) / 180
          const r1 = i % 5 === 0 ? R - 12 : R - 6
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * (R - 2)}
              y2={cy + Math.sin(a) * (R - 2)}
              stroke="var(--muted)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          )
        })}
        <line x1={cx} y1={cy} x2={hp.x} y2={hp.y} stroke="var(--text)" strokeWidth="5" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mp.x} y2={mp.y} stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={sp.x} y2={sp.y} stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill="var(--gold)" />
        <text x={cx} y="236" textAnchor="middle" fill="var(--text-2)" fontSize="13">{t(CL.analog)}</text>
        <rect x="350" y="80" width="300" height="80" rx="10" fill="var(--fig-box-2)" stroke="var(--line-2)" />
        <text x="500" y="133" textAnchor="middle" fill="var(--green)" fontSize="30" fontFamily="var(--mono)">{text}</text>
        <text x="500" y="236" textAnchor="middle" fill="var(--text-2)" fontSize="13">{t(CL.digital)}</text>
      </svg>
    </figure>
  )
}

/* ---------- Memory 图形 ---------- */

export function memCell(pat: MemPat, r: number, c: number, step: number) {
  const i = r * 8 + c
  if (pat === 'checker') return (r + c) % 2
  if (pat === 'inv') return 1 - ((r + c) % 2)
  if (pat === 'walk1') return i === step ? 1 : 0
  return i === step ? 0 : 1
}

export function MemPatFig({ pat, step }: { pat: MemPat; step: number }) {
  const cell = 26
  const x0 = 340 - cell * 4
  const y0 = 14
  const cells = Array.from({ length: 64 }, (_, i) => i)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 240" className="term-fig__svg" role="img" aria-label={pat}>
        <rect width="680" height="240" rx="10" fill="var(--well)" />
        {cells.map((i) => {
          const r = Math.floor(i / 8)
          const c = i % 8
          const v = memCell(pat, r, c, step)
          const walking = (pat === 'walk1' || pat === 'walk0') && i === step
          return (
            <g key={i}>
              <rect
                x={x0 + c * cell}
                y={y0 + r * cell}
                width={cell - 2}
                height={cell - 2}
                rx="3"
                fill={v ? 'var(--blue-bg)' : 'var(--fig-box)'}
                stroke={walking ? 'var(--gold)' : 'var(--line)'}
                strokeWidth={walking ? 2 : 1}
              />
              <text
                x={x0 + c * cell + (cell - 2) / 2}
                y={y0 + r * cell + 17}
                textAnchor="middle"
                fill={v ? 'var(--text)' : 'var(--dim)'}
                fontSize="11"
                fontFamily="var(--mono)"
              >
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
