import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { PIPE, STAGES } from './data/vector'

const L = {
  raw: loc('“生”数据', '"Raw" data'),
  exp: loc('期望', 'Exp'),
  act: loc('实际', 'Act'),
  noCmp: loc('不比较', 'no compare'),
  drive: loc('驱动沿', 'Drive edge'),
  logic: loc('逻辑', 'Logic'),
  cap: loc('一行向量依次经过 Time Set、格式、电平变成管脚波形；输出在 Strobe 时刻和存储的期望字符比较。', 'A vector row passes through the time set, format and levels to become a pin waveform; the output is compared with the stored expected character at the strobe.'),
  cbCap: loc('当前 8 个地址在存储阵列里的样子：每行一个地址，每格一位。蓝 = 1，暗 = 0。', 'The current 8 addresses as they sit in the memory array: one address per row, one bit per cell. Blue = 1, dark = 0.'),
  addr: loc('地址', 'Address'),
}

const W0 = 100
const W1 = 650

export function PipeFig({
  stage,
  inp,
  prevIn,
  exp,
  outNow,
  outPrev,
}: {
  stage: number
  inp: 0 | 1
  prevIn: 0 | 1
  exp: 'L' | 'H' | 'X'
  outNow: 0 | 1
  outPrev: 0 | 1
}) {
  const { t } = useLocale()
  const x = (ns: number) => W0 + (ns / PIPE.period) * (W1 - W0)
  const inTop = 136
  const outTop = 216
  const h = 34
  const lvl = (top: number, v: 0 | 1) => (v ? top : top + h)
  const pass = exp === 'X' ? null : (exp === 'H') === (outNow === 1)
  const resColor = pass === null ? 'var(--muted)' : pass ? 'var(--green)' : 'var(--red)'

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 290" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="680" height="290" rx="10" fill="var(--well)" />
        {STAGES.map((s, i) => {
          const bx = 12 + i * 111
          const done = i < stage
          const now = i === stage
          return (
            <g key={s.id}>
              <rect
                x={bx}
                y={14}
                width={100}
                height={52}
                rx={8}
                fill={now ? 'var(--gold-bg)' : done ? 'var(--blue-bg)' : 'var(--fig-box)'}
                stroke={now ? 'var(--gold)' : done ? 'var(--blue-line)' : 'var(--line)'}
                strokeWidth={now ? 2 : 1}
              />
              <text x={bx + 50} y={36} textAnchor="middle" fill="var(--text)" fontSize="12">
                {t(s.name)}
              </text>
              <text x={bx + 50} y={54} textAnchor="middle" fill={now ? 'var(--gold)' : 'var(--muted)'} fontSize="10.5" fontFamily="var(--mono)">
                {i === 0 ? `IN=${inp} OUT=${exp}` : s.sub}
              </text>
              {i < STAGES.length - 1 ? (
                <path d={`M${bx + 101} 40 l9 0 m-4 -4 l4 4 l-4 4`} fill="none" stroke={done || now ? 'var(--gold)' : 'var(--line-2)'} strokeWidth="1.5" />
              ) : null}
            </g>
          )
        })}

        {/* 下方：一个周期的管脚视图 */}
        <rect x={10} y={84} width={660} height={196} rx={8} fill="none" stroke="var(--line-soft)" />
        {stage === 0 ? (
          <>
            <text x={340} y={170} textAnchor="middle" fill="var(--text)" fontSize="22" fontFamily="var(--mono)">
              {`IN = '${inp}'    OUT = '${exp}'`}
            </text>
            <text x={340} y={200} textAnchor="middle" fill="var(--muted)" fontSize="12">
              {t(L.raw)}
            </text>
          </>
        ) : (
          <>
            {[0, 50, 100].map((ns) => (
              <text key={ns} x={x(ns)} y={104} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
                {ns === 0 ? 'T0' : `${ns} ns`}
              </text>
            ))}
            <line x1={x(0)} y1={110} x2={x(0)} y2={270} stroke="var(--line)" />
            <line x1={x(100)} y1={110} x2={x(100)} y2={270} stroke="var(--line)" />
            <line x1={x(PIPE.drive)} y1={110} x2={x(PIPE.drive)} y2={270} stroke="var(--blue)" strokeDasharray="3 4" />
            <text x={x(PIPE.drive) + 4} y={122} fill="var(--blue)" fontSize="10">
              {`${t(L.drive)} ${PIPE.drive} ns`}
            </text>
            <line
              x1={x(PIPE.strobe)}
              y1={110}
              x2={x(PIPE.strobe)}
              y2={270}
              stroke="var(--gold)"
              strokeWidth={stage >= 5 ? 2.5 : 1}
              strokeDasharray={stage >= 5 ? undefined : '3 4'}
            />
            <text x={x(PIPE.strobe) + 4} y={122} fill="var(--gold)" fontSize="10">
              {`Strobe ${PIPE.strobe} ns`}
            </text>

            <text x={20} y={inTop + h / 2 + 4} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
              IN
            </text>
            {stage === 1 ? (
              <text x={x(PIPE.drive) + 8} y={inTop + h / 2 + 6} fill="var(--text)" fontSize="16" fontFamily="var(--mono)">
                {`'${inp}'`}
              </text>
            ) : (
              <path
                d={`M${x(0)} ${lvl(inTop, prevIn)} L${x(PIPE.drive)} ${lvl(inTop, prevIn)} L${x(PIPE.drive)} ${lvl(inTop, inp)} L${x(100)} ${lvl(inTop, inp)}`}
                fill="none"
                stroke="var(--sky)"
                strokeWidth="2"
              />
            )}
            {stage === 2 ? (
              <text x={x(80)} y={lvl(inTop, inp) - 4} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">
                {`${t(L.logic)} ${inp}`}
              </text>
            ) : null}
            {stage >= 3 ? (
              <>
                <text x={x(0) - 6} y={inTop + 4} textAnchor="end" fill="var(--muted)" fontSize="9.5" fontFamily="var(--mono)">
                  {`VIH ${PIPE.vih}`}
                </text>
                <text x={x(0) - 6} y={inTop + h + 4} textAnchor="end" fill="var(--muted)" fontSize="9.5" fontFamily="var(--mono)">
                  {`VIL ${PIPE.vil}`}
                </text>
                <text x={x(80)} y={lvl(inTop, inp) - 4} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">
                  {`${inp ? PIPE.vih : PIPE.vil} V`}
                </text>
              </>
            ) : null}

            <text x={20} y={outTop + h / 2 + 4} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
              OUT
            </text>
            {stage >= 4 ? (
              <path
                d={`M${x(0)} ${lvl(outTop, outPrev)} L${x(PIPE.drive + PIPE.delay)} ${lvl(outTop, outPrev)} L${x(PIPE.drive + PIPE.delay)} ${lvl(
                  outTop,
                  outNow,
                )} L${x(100)} ${lvl(outTop, outNow)}`}
                fill="none"
                stroke="var(--green)"
                strokeWidth="2"
              />
            ) : (
              <line x1={x(0)} y1={outTop + h / 2} x2={x(100)} y2={outTop + h / 2} stroke="var(--line-2)" strokeDasharray="4 4" />
            )}
            {stage >= 5 ? (
              <>
                <text x={x(0) - 6} y={outTop + 4} textAnchor="end" fill="var(--muted)" fontSize="9.5" fontFamily="var(--mono)">
                  VOH
                </text>
                <text x={x(0) - 6} y={outTop + h + 4} textAnchor="end" fill="var(--muted)" fontSize="9.5" fontFamily="var(--mono)">
                  VOL
                </text>
                <circle cx={x(PIPE.strobe)} cy={lvl(outTop, outNow)} r={5} fill={resColor} />
                <text x={x(PIPE.strobe) + 10} y={outTop + h / 2 + 4} fill={resColor} fontSize="12" fontFamily="var(--mono)">
                  {exp === 'X'
                    ? `${t(L.exp)} X → ${t(L.noCmp)}`
                    : `${t(L.exp)} ${exp} · ${t(L.act)} ${outNow ? 'H' : 'L'} → ${pass ? 'PASS' : 'FAIL'}`}
                </text>
              </>
            ) : null}
          </>
        )}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}

export function CheckerFig({ rows }: { rows: Array<{ hex: string; value: number }> }) {
  const { t } = useLocale()
  const cell = 26
  const left = 250
  const top = 26
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 680 ${top + rows.length * cell + 16}`} className="term-fig__svg" role="img" aria-label={t(L.cbCap)}>
        <rect width="680" height={top + rows.length * cell + 16} rx="10" fill="var(--well)" />
        <text x={left - 60} y={18} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.addr)}
        </text>
        {[3, 2, 1, 0].map((b, j) => (
          <text key={b} x={left + j * cell + cell / 2} y={18} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
            {`D${b}`}
          </text>
        ))}
        {rows.map((row, i) => (
          <g key={row.hex}>
            <text x={left - 60} y={top + i * cell + 17} textAnchor="middle" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
              {`${row.hex}h`}
            </text>
            {[3, 2, 1, 0].map((b, j) => {
              const bit = (row.value >> b) & 1
              return (
                <g key={b}>
                  <rect
                    x={left + j * cell + 1}
                    y={top + i * cell + 1}
                    width={cell - 2}
                    height={cell - 2}
                    rx={3}
                    fill={bit ? 'var(--blue)' : 'var(--fig-box-2)'}
                    opacity={bit ? 0.75 : 1}
                  />
                  <text x={left + j * cell + cell / 2} y={top + i * cell + 17} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
                    {bit}
                  </text>
                </g>
              )
            })}
            <text x={left + 4 * cell + 14} y={top + i * cell + 17} fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
              {`= ${row.value.toString(16).toUpperCase()}h`}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(L.cbCap)}</figcaption>
    </figure>
  )
}
