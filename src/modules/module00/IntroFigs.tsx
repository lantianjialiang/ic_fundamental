import { type KeyboardEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { CHAIN, SYS, SYS_ORDER, type ChainId, type SysId } from './data/content'

const L = {
  test: loc('测试', 'TEST'),
  chainCap: loc(
    '芯片的一生：两个金框是测试站。CP 在封装前测 die，FT 在封装后测成品。',
    'A chip’s life: the two gold frames are test steps. CP tests dies before packaging; FT tests finished parts after.',
  ),
  sysCap: loc(
    '信号从程序一路走到 DUT，结果再回到工作站变成 Bin。点任意方块看它的位置和作用。',
    'Signals travel from the program down to the DUT; results return to the workstation as a Bin. Click any box to see where it sits and what it does.',
  ),
  cable: loc('电缆', 'Cables'),
  result: loc('结果', 'Results'),
}

function keyPick(fn: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fn()
    }
  }
}

/* ---------------- 产业链 ---------------- */

function ChainIcon({ id, cx, cy }: { id: ChainId; cx: number; cy: number }) {
  if (id === 'wafer') {
    return (
      <g>
        <circle cx={cx} cy={cy} r="22" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        {[-12, -4, 4, 12].map((d) => {
          // 网格线只画到圆内
          const h = Math.sqrt(22 * 22 - d * d) - 1
          return (
            <g key={d} stroke="var(--line-2)" strokeWidth="0.8">
              <line x1={cx + d} y1={cy - h} x2={cx + d} y2={cy + h} />
              <line x1={cx - h} y1={cy + d} x2={cx + h} y2={cy + d} />
            </g>
          )
        })}
      </g>
    )
  }
  if (id === 'cp') {
    return (
      <g>
        <ellipse cx={cx} cy={cy + 14} rx="30" ry="7" fill="var(--fig-box-2)" stroke="var(--line-3)" />
        <rect x={cx - 26} y={cy - 22} width="52" height="8" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
        {[-6, -2, 2, 6].map((d) => (
          <line key={d} x1={cx + d * 2} y1={cy - 14} x2={cx + d} y2={cy + 12} stroke="var(--gold)" strokeWidth="1.4" />
        ))}
      </g>
    )
  }
  if (id === 'pkg') {
    return (
      <g>
        {[-12, -4, 4, 12].map((d) => (
          <g key={d} fill="var(--text-2)">
            <rect x={cx + d - 1.5} y={cy - 22} width="3" height="6" />
            <rect x={cx + d - 1.5} y={cy + 16} width="3" height="6" />
            <rect x={cx - 22} y={cy + d - 1.5} width="6" height="3" />
            <rect x={cx + 16} y={cy + d - 1.5} width="6" height="3" />
          </g>
        ))}
        <rect x={cx - 16} y={cy - 16} width="32" height="32" rx="3" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <circle cx={cx - 10} cy={cy - 10} r="2" fill="var(--muted)" />
      </g>
    )
  }
  if (id === 'ft') {
    return (
      <g>
        <rect x={cx - 28} y={cy + 2} width="56" height="16" rx="2" fill="var(--fig-box)" stroke="var(--line-3)" />
        <rect x={cx - 18} y={cy + 2} width="36" height="5" fill="var(--well)" />
        <rect x={cx - 16} y={cy - 6} width="32" height="8" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x={cx - 34} y={cy + 18} width="68" height="5" fill="var(--green-bg)" stroke="var(--green-line)" />
        <path d={`M${cx} ${cy - 24} V${cy - 10} M${cx - 4} ${cy - 14} L${cx} ${cy - 9} L${cx + 4} ${cy - 14}`} fill="none" stroke="var(--blue)" strokeWidth="1.5" />
      </g>
    )
  }
  return (
    <g>
      <rect x={cx - 30} y={cy - 12} width="60" height="30" rx="3" fill="var(--fig-box-2)" stroke="var(--line-3)" />
      {[0, 1, 2].map((i) =>
        [0, 1].map((j) => (
          <rect key={`${i}-${j}`} x={cx - 25 + i * 18} y={cy - 7 + j * 12} width="14" height="8" rx="1" fill="var(--neutral-fill)" stroke="var(--green)" strokeWidth="0.8" />
        )),
      )}
      <text x={cx} y={cy - 18} textAnchor="middle" fill="var(--green)" fontSize="10" fontFamily="var(--mono)">
        Bin 1
      </text>
    </g>
  )
}

export function ChainFig({ active, onPick }: { active: ChainId; onPick: (id: ChainId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 160" className="term-fig__svg" role="group" aria-label={t(L.chainCap)}>
        <rect width="680" height="160" rx="10" fill="var(--well)" />
        {CHAIN.map((step, i) => {
          const cx = 72 + i * 134
          const on = active === step.id
          return (
            <g key={step.id}>
              {i > 0 ? (
                <path d={`M${cx - 76} 72 H${cx - 62} M${cx - 68} 67 L${cx - 62} 72 L${cx - 68} 77`} fill="none" stroke="var(--muted)" strokeWidth="1.6" />
              ) : null}
              <g
                role="button"
                tabIndex={0}
                aria-label={t(step.title)}
                aria-pressed={on}
                className="m00-hit"
                onClick={() => onPick(step.id)}
                onKeyDown={keyPick(() => onPick(step.id))}
              >
                <rect
                  x={cx - 56}
                  y="18"
                  width="112"
                  height="124"
                  rx="8"
                  fill={on ? 'var(--gold-bg)' : 'var(--card)'}
                  stroke={on || step.test ? 'var(--gold)' : 'var(--line)'}
                  strokeWidth={step.test ? 2 : 1}
                />
                {step.test ? (
                  <text x={cx} y="14" textAnchor="middle" fill="var(--gold)" fontSize="11">
                    {t(L.test)}
                  </text>
                ) : null}
                <ChainIcon id={step.id} cx={cx} cy={62} />
                <text x={cx} y="110" textAnchor="middle" fill="var(--text)" fontSize="14">
                  {t(step.title)}
                </text>
                <text x={cx} y="128" textAnchor="middle" fill="var(--muted)" fontSize="11">
                  {t(step.sub)}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.chainCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 系统框图 ---------------- */

function Arrow({ d, head, tail, color = 'var(--muted)' }: { d: string; head: [number, number, number]; tail?: [number, number, number]; color?: string }) {
  const tri = ([x, y, deg]: [number, number, number]) => (
    <path d="M0 0 L-8 -4 L-8 4 Z" fill={color} transform={`translate(${x} ${y}) rotate(${deg})`} />
  )
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      {tri(head)}
      {tail ? tri(tail) : null}
    </g>
  )
}

const BOX: Record<SysId, { x: number; y: number; w: number; h: number }> = {
  program: { x: 16, y: 28, w: 118, h: 46 },
  controller: { x: 170, y: 28, w: 128, h: 46 },
  ate: { x: 334, y: 14, w: 330, h: 116 },
  pe: { x: 346, y: 50, w: 108, h: 66 },
  pmu: { x: 464, y: 50, w: 90, h: 66 },
  dps: { x: 564, y: 50, w: 88, h: 66 },
  head: { x: 534, y: 196, w: 130, h: 50 },
  loadboard: { x: 390, y: 196, w: 120, h: 50 },
  socket: { x: 230, y: 196, w: 136, h: 50 },
  dut: { x: 136, y: 196, w: 70, h: 50 },
  result: { x: 12, y: 196, w: 108, h: 50 },
}

export function SysFig({ active, onPick }: { active: SysId; onPick: (id: SysId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 270" className="term-fig__svg" role="group" aria-label={t(L.sysCap)}>
        <rect width="680" height="270" rx="10" fill="var(--well)" />
        <Arrow d="M134 51 H168" head={[170, 51, 0]} />
        {/* 工作站发命令给主机，测量结果再从主机传回工作站，所以是双向 */}
        <Arrow d="M298 51 H332" head={[334, 51, 0]} tail={[298, 51, 180]} />
        <Arrow d="M604 130 V194" head={[604, 196, 90]} tail={[604, 130, -90]} color="var(--blue)" />
        <text x="612" y="168" fill="var(--blue)" fontSize="11">
          {t(L.cable)}
        </text>
        <Arrow d="M534 221 H510" head={[510, 221, 180]} tail={[534, 221, 0]} color="var(--gold)" />
        <Arrow d="M390 221 H366" head={[366, 221, 180]} tail={[390, 221, 0]} color="var(--gold)" />
        <Arrow d="M230 221 H206" head={[206, 221, 180]} tail={[230, 221, 0]} color="var(--gold)" />
        <Arrow d="M234 74 V150 H66 V194" head={[66, 196, 90]} color="var(--green)" />
        <text x="148" y="144" textAnchor="middle" fill="var(--green)" fontSize="11">
          {t(L.result)}
        </text>
        {SYS_ORDER.map((id) => {
          const b = BOX[id]
          const on = active === id
          const isAte = id === 'ate'
          const fill = on ? 'var(--gold-bg)' : isAte ? 'var(--panel-2)' : id === 'dut' ? 'var(--fig-box-2)' : 'var(--card)'
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={t(SYS[id].title)}
              aria-pressed={on}
              className="m00-hit"
              onClick={(event) => {
                event.stopPropagation()
                onPick(id)
              }}
              onKeyDown={keyPick(() => onPick(id))}
            >
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="8"
                fill={fill}
                stroke={on ? 'var(--gold)' : isAte ? 'var(--blue)' : 'var(--line-2)'}
                strokeWidth={on ? 2 : 1.2}
              />
              <text
                x={b.x + b.w / 2}
                y={isAte ? b.y + 22 : b.y + b.h / 2 + 5}
                textAnchor="middle"
                fill={id === 'result' ? 'var(--green)' : 'var(--text)'}
                fontSize={id === 'result' || id === 'pe' || id === 'socket' ? 12 : 13}
              >
                {t(SYS[id].title)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.sysCap)}</figcaption>
    </figure>
  )
}