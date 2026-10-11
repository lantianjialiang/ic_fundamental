import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { VECTORS, dutOut, type Bit, type FaultId } from './data/content'

const L = {
  aria: loc('真值表的每一行作为一条向量：驱动输入、DUT 计算、在 Strobe 比较输出', 'Each truth-table row as a vector: drive inputs, DUT computes, compare the output at the strobe'),
  result: loc('结果', 'Result'),
  driveA: loc('Drive A', 'Drive A'),
  driveB: loc('Drive B', 'Drive B'),
  actual: loc('实测', 'Actual'),
  expect: loc('期望', 'Expect'),
  flip: loc('点击改期望值', 'Click to change the expected value'),
  tampered: loc('已改', 'edited'),
}

const ROW_Y = (i: number) => 52 + i * 50
const sig = (bit: Bit) => (bit ? 'var(--gold)' : 'var(--blue)')
const hl = (bit: Bit) => (bit ? 'H' : 'L')

export function VectorRunFig({
  step,
  expected,
  flipped,
  fault,
  onPick,
  onFlip,
}: {
  step: number
  expected: Bit[]
  flipped: boolean[]
  fault: FaultId
  onPick: (index: number) => void
  onFlip: (index: number) => void
}) {
  const { t } = useLocale()
  const row = VECTORS[step]
  const out = dutOut(row, fault)
  const ok = out.y === expected[step]

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 270" className="term-fig__svg" role="img" aria-label={t(L.aria)}>
        <rect width="720" height="270" rx="10" fill="var(--well)" />

        {/* 左：向量表 */}
        {['#', 'A', 'B', 'Y', t(L.result)].map((head, i) => (
          <text key={i} x={[40, 92, 132, 180, 248][i]} y="38" textAnchor="middle" fill="var(--muted)" fontSize="12">
            {head}
          </text>
        ))}
        {VECTORS.map((vec, i) => {
          const done = i <= step
          const res = dutOut(vec, fault).y === expected[i]
          const y = ROW_Y(i)
          return (
            <g key={i} className="m07-row" onClick={() => onPick(i)}>
              <rect
                x="20"
                y={y}
                width="270"
                height="40"
                rx="6"
                fill={i === step ? 'var(--gold-bg)' : done ? 'var(--card)' : 'var(--panel-2)'}
                stroke={i === step ? 'var(--gold)' : 'var(--line-soft)'}
              />
              <text x="40" y={y + 25} textAnchor="middle" fill="var(--muted)" fontSize="12">
                {i + 1}
              </text>
              {[vec.a, vec.b].map((bit, k) => (
                <text
                  key={k}
                  x={k ? 132 : 92}
                  y={y + 26}
                  textAnchor="middle"
                  fontFamily="var(--mono)"
                  fontSize="16"
                  fill={done ? 'var(--text)' : 'var(--dim)'}
                >
                  {bit}
                </text>
              ))}
              <g
                className="m07-flip"
                role="button"
                tabIndex={0}
                aria-label={`${t(L.flip)} · ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onFlip(i)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onFlip(i)
                  }
                }}
              >
                <title>{t(L.flip)}</title>
                <rect
                  x="164"
                  y={y + 7}
                  width="32"
                  height="26"
                  rx="4"
                  fill={flipped[i] ? 'var(--orange-bg)' : 'var(--well)'}
                  stroke={flipped[i] ? 'var(--gold)' : 'var(--line-2)'}
                  strokeDasharray={flipped[i] ? undefined : '3 2'}
                />
                <text x="180" y={y + 26} textAnchor="middle" fontFamily="var(--mono)" fontSize="16" fill={flipped[i] ? 'var(--gold)' : 'var(--text)'}>
                  {hl(expected[i])}
                </text>
              </g>
              {flipped[i] ? (
                <text x="200" y={y + 13} fill="var(--gold)" fontSize="10">
                  {t(L.tampered)}
                </text>
              ) : null}
              <text
                x="248"
                y={y + 26}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={!done ? 'var(--dim)' : res ? 'var(--green-2)' : 'var(--red-2)'}
              >
                {!done ? '—' : res ? 'PASS' : 'FAIL'}
              </text>
            </g>
          )
        })}

        {/* 右：当前这一行在硬件上怎么走。key 让每换一行重新播放一次 */}
        <g key={`${step}-${fault}-${expected[step]}`} className="m07-run">
          {/* 第 1 拍：Tester 驱动 */}
          <g className="m07-s1">
            {[
              { label: L.driveA, bit: row.a, y: 70 },
              { label: L.driveB, bit: row.b, y: 170 },
            ].map((d) => (
              <g key={d.y}>
                <rect x="318" y={d.y} width="84" height="40" rx="6" fill="var(--blue-bg)" stroke="var(--blue)" />
                <text x="360" y={d.y + 16} textAnchor="middle" fill="var(--muted)" fontSize="11">
                  {t(d.label)}
                </text>
                <text x="360" y={d.y + 33} textAnchor="middle" fill={sig(d.bit)} fontFamily="var(--mono)" fontSize="15" fontWeight="700">
                  {d.bit}
                </text>
                <line x1="402" y1={d.y + 20} x2="428" y2={d.y + 20} stroke={sig(d.bit)} strokeWidth="3" />
              </g>
            ))}
          </g>

          {/* 第 2 拍：DUT 内部 */}
          <g className="m07-s2">
            <polyline points="428,90 452,90 452,120 494,120" fill="none" stroke={sig(out.aIn)} strokeWidth="3" />
            <polyline points="428,190 452,190 452,160 494,160" fill="none" stroke={sig(row.b)} strokeWidth="3" />
            {fault === 'a0' ? (
              <g>
                <circle cx="440" cy="90" r="9" fill="var(--red-bg)" stroke="var(--red)" />
                <text x="440" y="94" textAnchor="middle" fill="var(--red-2)" fontSize="11" fontWeight="700">
                  ✕
                </text>
                <text x="440" y="74" textAnchor="middle" fill="var(--red-2)" fontSize="10">
                  SA0
                </text>
              </g>
            ) : null}
            <path d="M482 105 Q500 140 482 175" fill="none" stroke="var(--text-2)" strokeWidth="2" />
            <path d="M490 105 Q508 140 490 175 Q532 175 556 140 Q532 105 490 105 Z" fill="var(--card)" stroke="var(--text-2)" strokeWidth="2" />
            <text x="520" y="145" textAnchor="middle" fill="var(--text-2)" fontSize="12">
              XOR
            </text>
            <line x1="556" y1="140" x2="612" y2="140" stroke={sig(out.y)} strokeWidth="3" />
            {fault === 'y0' || fault === 'y1' ? (
              <g>
                <circle cx="574" cy="140" r="9" fill="var(--red-bg)" stroke="var(--red)" />
                <text x="574" y="144" textAnchor="middle" fill="var(--red-2)" fontSize="11" fontWeight="700">
                  ✕
                </text>
                <text x="574" y="124" textAnchor="middle" fill="var(--red-2)" fontSize="10">
                  {fault === 'y0' ? 'SA0' : 'SA1'}
                </text>
              </g>
            ) : null}
          </g>
          <rect x="430" y="52" width="160" height="176" rx="10" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
          <text x="584" y="220" textAnchor="end" fill="var(--muted)" fontSize="12">
            DUT
          </text>

          {/* 第 3 拍：Strobe 比较 */}
          <g className="m07-s3">
            <rect x="612" y="88" width="92" height="104" rx="8" fill="var(--panel-2)" stroke={ok ? 'var(--green)' : 'var(--red)'} strokeWidth="2" />
            <text x="658" y="106" textAnchor="middle" fill="var(--muted)" fontSize="11">
              Compare
            </text>
            <text x="658" y="130" textAnchor="middle" fill="var(--text)" fontSize="13">
              {`${t(L.actual)} ${hl(out.y)}`}
            </text>
            <text x="658" y="152" textAnchor="middle" fill="var(--text)" fontSize="13">
              {`${t(L.expect)} ${hl(expected[step])}`}
            </text>
            <text x="658" y="180" textAnchor="middle" fontSize="14" fontWeight="700" fill={ok ? 'var(--green-2)' : 'var(--red-2)'}>
              {ok ? '✓ PASS' : '✗ FAIL'}
            </text>
          </g>
        </g>
      </svg>
    </figure>
  )
}
