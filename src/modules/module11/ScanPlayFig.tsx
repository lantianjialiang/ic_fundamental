import { useLocale } from '../../i18n/LocaleContext'
import { EQUATIONS, EXPECTED, L, N, OUT_FROM, type FaultId, type Frame, type Tok } from './data/content'

const COL = (i: number) => 140 + i * 115
const FF_Y = 180
const FF_W = 70
const FF_H = 56
const SCAN_Y = 120
const LOGIC = { x: 110, y: 16, w: 480, h: 68 }
const SI = { x: 20, y: 100, w: 60, h: 40 }
const SO = { x: 604, y: 186, w: 60, h: 44 }

/** pos：-1 = 等在 SI；0..3 = FF1..FF4；4 = 刚从 SO 出去 */
function tokPos(pos: number) {
  if (pos < 0) return { x: SI.x + SI.w / 2, y: SI.y + SI.h / 2 }
  if (pos >= N) return { x: SO.x + SO.w / 2, y: SO.y + SO.h / 2 }
  return { x: COL(pos) + FF_W / 2, y: FF_Y + 36 }
}

const TOK_STYLE: Record<Tok['kind'], { fill: string; stroke: string; text: string }> = {
  x: { fill: 'var(--fig-box-2)', stroke: 'var(--line-2)', text: 'var(--dim)' },
  stim: { fill: 'var(--gold-bg)', stroke: 'var(--gold-line)', text: 'var(--gold)' },
  cap: { fill: 'var(--green-bg)', stroke: 'var(--green-line)', text: 'var(--green)' },
  next: { fill: 'var(--fig-box)', stroke: 'var(--line-2)', text: 'var(--muted)' },
}

function Token({ tok, pos, faded }: { tok: Tok; pos: number; faded?: boolean }) {
  const p = tokPos(pos)
  const s = TOK_STYLE[tok.kind]
  return (
    <g className="m11-tok" style={{ transform: `translate(${p.x}px, ${p.y}px)` }} opacity={faded ? 0.45 : 1}>
      <g className="m11-tok__body">
        <rect x={-15} y={-13} width={30} height={26} rx={5} fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
        <text x={0} y={5} textAnchor="middle" fill={s.text} fontSize="15" fontFamily="var(--mono)">
          {tok.v === null ? 'X' : tok.v}
        </text>
      </g>
    </g>
  )
}

export function ScanPlayFig({ frame, fault }: { frame: Frame; fault: FaultId }) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const dim = 'var(--line-2)'
  const { phase, scan } = frame
  const shifting = scan && frame.se === 1 && phase !== 'compare'
  const capturing = phase === 'capture'
  const dColor = phase === 'plain' ? 'var(--text-2)' : capturing ? hot : dim
  const scanColor = shifting ? hot : dim
  const fbColor = phase === 'plain' ? 'var(--text-2)' : capturing ? hot : dim
  const showTable = phase === 'capture' || phase === 'shiftOut' || phase === 'compare'

  const tokens: Array<{ tok: Tok; pos: number; faded?: boolean }> = []
  if (frame.si) tokens.push({ tok: frame.si, pos: -1 })
  frame.chain.forEach((tok, i) => tokens.push({ tok, pos: i }))
  if (frame.so) tokens.push({ tok: frame.so, pos: N, faded: frame.so.kind === 'x' })

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 336" className="term-fig__svg" role="img" aria-label={t(frame.caption)}>
        <rect width="680" height="336" rx="10" fill="var(--well)" />

        {/* 组合逻辑 */}
        <rect
          x={LOGIC.x}
          y={LOGIC.y}
          width={LOGIC.w}
          height={LOGIC.h}
          rx="10"
          fill="var(--fig-box)"
          stroke={capturing ? hot : 'var(--line-2)'}
          strokeWidth={capturing ? 2 : 1.5}
        />
        <text x={LOGIC.x + 12} y={LOGIC.y + 18} fill="var(--muted)" fontSize="11">
          {`${t(L.comb)} · ${t(L.combSub)}`}
        </text>
        {EQUATIONS.map((eq, i) => (
          <text
            key={eq}
            x={COL(i) + 50}
            y={LOGIC.y + 50}
            textAnchor="middle"
            fill={fault === 'd2sa0' && i === 1 ? 'var(--red)' : 'var(--text-2)'}
            fontSize="11"
            fontFamily="var(--mono)"
          >
            {eq}
          </text>
        ))}

        {/* SI / SO */}
        {scan ? (
          <>
            <rect x={SI.x} y={SI.y} width={SI.w} height={SI.h} rx="6" fill="var(--fig-box)" stroke={scanColor} />
            <text x={SI.x + SI.w / 2} y={SI.y - 6} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              SI
            </text>
            <line x1={SI.x + SI.w} y1={SCAN_Y} x2={COL(0) + 20} y2={SCAN_Y} stroke={scanColor} strokeWidth="2" />
            <line x1={COL(0) + 20} y1={SCAN_Y} x2={COL(0) + 20} y2={140} stroke={scanColor} strokeWidth="2" />
            <rect x={SO.x} y={SO.y} width={SO.w} height={SO.h} rx="6" fill="var(--fig-box)" stroke={scanColor} />
            <text x={SO.x + SO.w / 2} y={SO.y - 6} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              SO
            </text>
          </>
        ) : null}

        {Array.from({ length: N }, (_, i) => {
          const x0 = COL(i)
          const last = i === N - 1
          const bad = fault === 'd2sa0' && i === 1
          return (
            <g key={i}>
              {/* D：组合逻辑 → MUX 的 0 端（普通 FF 直接进 D） */}
              <line
                x1={scan ? x0 + 50 : x0 + 35}
                y1={LOGIC.y + LOGIC.h}
                x2={scan ? x0 + 50 : x0 + 35}
                y2={scan ? 140 : FF_Y}
                stroke={bad && capturing ? 'var(--red)' : dColor}
                strokeWidth="2"
              />
              {capturing && frame.d ? (
                <text
                  x={x0 + 46}
                  y={104}
                  textAnchor="end"
                  fill={bad ? 'var(--red)' : hot}
                  fontSize="11"
                  fontFamily="var(--mono)"
                >
                  {`D${i + 1}=${frame.d[i]}${bad ? ' SA0' : ''}`}
                </text>
              ) : null}
              {scan ? (
                <>
                  <path
                    d={`M${x0 + 8} 140 L${x0 + 62} 140 L${x0 + 52} 162 L${x0 + 18} 162 Z`}
                    fill="var(--fig-box-2)"
                    stroke={phase === 'scanify' ? hot : 'var(--text-2)'}
                    strokeWidth={phase === 'scanify' ? 2 : 1}
                  />
                  <text x={x0 + 22} y="154" textAnchor="middle" fill={frame.se === 1 ? hot : 'var(--dim)'} fontSize="10" fontFamily="var(--mono)">
                    1
                  </text>
                  <text x={x0 + 48} y="154" textAnchor="middle" fill={frame.se === 0 ? hot : 'var(--dim)'} fontSize="10" fontFamily="var(--mono)">
                    0
                  </text>
                  <line x1={x0 + 35} y1="162" x2={x0 + 35} y2={FF_Y} stroke={capturing || shifting ? hot : dim} strokeWidth="2" />
                </>
              ) : null}
              {/* FF */}
              <rect x={x0} y={FF_Y} width={FF_W} height={FF_H} rx="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="1.5" />
              <text x={x0 + 6} y={FF_Y + 14} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
                {`FF${i + 1}`}
              </text>
              <path d={`M${x0} ${FF_Y + 42} L${x0 + 7} ${FF_Y + 46} L${x0} ${FF_Y + 50}`} fill="none" stroke="var(--muted)" />
              {/* Q：先往右，再往上回到组合逻辑；Scan 时在 SCAN_Y 分一路去下一级 */}
              <line x1={x0 + FF_W} y1={208} x2={x0 + 90} y2={208} stroke={shifting ? hot : fbColor} strokeWidth="2" />
              <line x1={x0 + 90} y1={208} x2={x0 + 90} y2={SCAN_Y} stroke={shifting && !last ? hot : fbColor} strokeWidth="2" />
              <line x1={x0 + 90} y1={SCAN_Y} x2={x0 + 90} y2={LOGIC.y + LOGIC.h} stroke={fbColor} strokeWidth="2" />
              {scan && !last ? (
                <>
                  <line x1={x0 + 90} y1={SCAN_Y} x2={COL(i + 1) + 20} y2={SCAN_Y} stroke={scanColor} strokeWidth="2" />
                  <line x1={COL(i + 1) + 20} y1={SCAN_Y} x2={COL(i + 1) + 20} y2={140} stroke={scanColor} strokeWidth="2" />
                  <circle cx={x0 + 90} cy={SCAN_Y} r="3" fill={scanColor} />
                </>
              ) : null}
              {scan && last ? (
                <>
                  <line x1={x0 + 90} y1={208} x2={SO.x} y2={208} stroke={scanColor} strokeWidth="2" />
                  <circle cx={x0 + 90} cy={208} r="3" fill={fbColor} />
                </>
              ) : null}
            </g>
          )
        })}

        {/* Scan Enable */}
        {scan ? (
          <>
            <line x1="20" y1="171" x2={COL(N - 1) + 62} y2="171" stroke={frame.se ? 'var(--purple)' : 'var(--dim)'} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="20" y="166" fill={frame.se ? 'var(--purple)' : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
              {`SE = ${frame.se}`}
            </text>
          </>
        ) : null}

        {tokens.map(({ tok, pos, faded }) => (
          <Token key={tok.key} tok={tok} pos={pos} faded={faded} />
        ))}

        {phase === 'plain' ? (
          <text x="340" y="272" textAnchor="middle" fill="var(--red)" fontSize="13">
            {t(L.hidden)}
          </text>
        ) : null}

        {/* 比较表 */}
        {showTable ? (
          <g>
            <text x="190" y="266" textAnchor="end" fill="var(--dim)" fontSize="11">
              {t(L.from)}
            </text>
            <text x="190" y="294" textAnchor="end" fill="var(--text-2)" fontSize="12">
              {t(L.exp)}
            </text>
            <text x="190" y="322" textAnchor="end" fill="var(--text-2)" fontSize="12">
              {t(L.act)}
            </text>
            {EXPECTED.map((e, k) => {
              const cx = 230 + k * 64
              const got = frame.outs[k]
              const shown = got !== undefined
              const miss = shown && got !== e
              return (
                <g key={k}>
                  <text x={cx} y="266" textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
                    {OUT_FROM[k]}
                  </text>
                  <rect x={cx - 14} y="276" width="28" height="24" rx="4" fill="var(--fig-box)" stroke="var(--line-soft)" />
                  <text x={cx} y="293" textAnchor="middle" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">
                    {e}
                  </text>
                  <rect
                    x={cx - 14}
                    y="304"
                    width="28"
                    height="24"
                    rx="4"
                    fill={miss ? 'var(--red-bg)' : shown ? 'var(--green-bg)' : 'var(--fig-box)'}
                    stroke={miss ? 'var(--red)' : 'var(--line-soft)'}
                  />
                  <text x={cx} y="321" textAnchor="middle" fill={miss ? 'var(--red)' : 'var(--text)'} fontSize="13" fontFamily="var(--mono)">
                    {shown ? got : ''}
                  </text>
                </g>
              )
            })}
          </g>
        ) : null}
      </svg>
      <figcaption>{t(L.figCap)}</figcaption>
    </figure>
  )
}
