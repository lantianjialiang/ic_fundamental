import { useLocale } from '../../i18n/LocaleContext'
import { EQS, EXPECTED, FAULT_AT, L, N, OUT_FROM, type FaultId, type Frame, type Tok } from './data/content'

const COL = (i: number) => 140 + i * 115
/** 组合逻辑框：上面一排是 4 个 D 的算式格，下面一段是 Q → 算式格的连线 */
const LOGIC = { x: 110, y: 14, w: 480, h: 100 }
const LOGIC_B = LOGIC.y + LOGIC.h
const CELL_Y = 38
const CELL_H = 38
const CELL_W = 92
const PIN_Y = CELL_Y + CELL_H
/** 线旁标签（D1=0、Q1=1）所在的行 */
const TAG_Y = 130
const SCAN_Y = 140
const MUX_T = 152
const MUX_B = 174
const SE_Y = 183
const FF_Y = 192
const FF_W = 70
const FF_H = 56
const Q_Y = FF_Y + 28
const SI = { x: 20, y: SCAN_Y - 20, w: 60, h: 40 }
const SO = { x: 604, y: Q_Y - 22, w: 60, h: 44 }
const TBL_Y = 284
const H = 356

/** D 从算式格底边中点出来；Q 回到逻辑框的位置 */
const dX = (i: number) => COL(i) + 50
const qX = (i: number) => COL(i) + 90

/** 算式格的输入脚：两个输入分左右，一个输入放右侧，中间留给 D 输出 */
function pinX(eq: number, k: number) {
  const n = EQS[eq].ins.length
  return dX(eq) + (n === 1 ? 26 : k === 0 ? -26 : 26)
}

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
  const red = 'var(--red)'
  const { phase, scan } = frame
  const plain = phase === 'plain'
  const prep = phase === 'capPrep'
  const edge = phase === 'capture'
  const capturing = prep || edge
  const shifting = scan && frame.se === 1 && phase !== 'compare'
  const scanColor = shifting ? hot : dim
  /* Capture 时 Q、D 两类线用蓝 / 橙区分（色盲友好的配对），D 再加虚线，不靠颜色也能分 */
  const qHot = 'var(--blue)'
  const dHot = 'var(--gold)'
  const dDash = capturing ? '6 3' : undefined
  /** Q → 组合逻辑：Capture 准备时这些 Q 正是逻辑的输入 */
  const fbColor = plain ? 'var(--text-2)' : prep ? qHot : dim
  /** 组合逻辑 → D → MUX：Capture 两帧都在用 */
  const dColor = plain ? 'var(--text-2)' : capturing ? dHot : dim
  const showTable = capturing || phase === 'shiftOut' || phase === 'compare'
  const isBad = (i: number) => fault === 'd2sa0' && i === FAULT_AT

  const tokens: Array<{ tok: Tok; pos: number; faded?: boolean }> = []
  if (frame.si) tokens.push({ tok: frame.si, pos: -1 })
  frame.chain.forEach((tok, i) => tokens.push({ tok, pos: i }))
  if (frame.so) tokens.push({ tok: frame.so, pos: N, faded: frame.so.kind === 'x' })

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 680 ${H}`} className="term-fig__svg" role="img" aria-label={t(frame.caption)}>
        <rect width="680" height={H} rx="10" fill="var(--well)" />

        {/* 组合逻辑 */}
        <rect
          x={LOGIC.x}
          y={LOGIC.y}
          width={LOGIC.w}
          height={LOGIC.h}
          rx="10"
          fill="var(--fig-box)"
          stroke={prep ? hot : 'var(--line-2)'}
          strokeWidth={prep ? 2 : 1.5}
        />
        <text x={LOGIC.x + 12} y={LOGIC.y + 16} fill="var(--muted)" fontSize="11">
          {`${t(L.comb)} · ${t(L.combSub)}`}
        </text>
        {capturing ? (
          <g fontSize="11" fontFamily="var(--mono)">
            <line x1={LOGIC.x + LOGIC.w - 150} y1={LOGIC.y + 12} x2={LOGIC.x + LOGIC.w - 128} y2={LOGIC.y + 12} stroke={qHot} strokeWidth="2.5" />
            <text x={LOGIC.x + LOGIC.w - 123} y={LOGIC.y + 16} fill={qHot}>
              {t(L.legQ)}
            </text>
            <line x1={LOGIC.x + LOGIC.w - 76} y1={LOGIC.y + 12} x2={LOGIC.x + LOGIC.w - 54} y2={LOGIC.y + 12} stroke={dHot} strokeWidth="2.5" strokeDasharray="6 3" />
            <text x={LOGIC.x + LOGIC.w - 49} y={LOGIC.y + 16} fill={dHot}>
              {t(L.legD)}
            </text>
          </g>
        ) : null}

        {/* Q → 算式格的连线（画在格子下面，先画） */}
        {EQS.map((eq, e) =>
          eq.ins.map((qi, k) => (
            <line
              key={`${e}-${qi}`}
              x1={qX(qi)}
              y1={LOGIC_B}
              x2={pinX(e, k)}
              y2={PIN_Y}
              stroke={fbColor}
              strokeWidth={prep ? 1.6 : 1.1}
              opacity={prep || plain ? 1 : 0.7}
            />
          )),
        )}

        {/* 4 个算式格：第一行算式，Capture 两帧第二行代入 Q 的值 */}
        {EQS.map((eq, i) => {
          const bad = isBad(i) && capturing
          return (
            <g key={eq.name}>
              <rect
                x={COL(i) + 4}
                y={CELL_Y}
                width={CELL_W}
                height={CELL_H}
                rx="6"
                fill="var(--fig-box-2)"
                stroke={bad ? red : prep ? 'var(--text-2)' : 'var(--line-2)'}
                strokeWidth={prep || bad ? 1.6 : 1}
              />
              <text x={dX(i)} y={CELL_Y + 15} textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
                {`${eq.name} = ${eq.expr}`}
              </text>
              {frame.q ? (
                <text x={dX(i)} y={CELL_Y + 31} textAnchor="middle" fill={prep ? 'var(--text)' : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
                  {`= ${eq.sub(frame.q)} = ${eq.fn(frame.q)}`}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* SI / SO 管脚 */}
        {scan ? (
          <>
            <rect x={SI.x} y={SI.y} width={SI.w} height={SI.h} rx="6" fill="var(--fig-box)" stroke={scanColor} />
            <text x={SI.x + SI.w / 2} y={SI.y - 6} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              SI
            </text>
            <line x1={SI.x + SI.w} y1={SCAN_Y} x2={COL(0) + 20} y2={SCAN_Y} stroke={scanColor} strokeWidth="2" />
            <line x1={COL(0) + 20} y1={SCAN_Y} x2={COL(0) + 20} y2={MUX_T} stroke={scanColor} strokeWidth="2" />
            <rect x={SO.x} y={SO.y} width={SO.w} height={SO.h} rx="6" fill="var(--fig-box)" stroke={scanColor} />
            <text x={SO.x + SO.w / 2} y={SO.y - 6} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              SO
            </text>
          </>
        ) : null}

        {Array.from({ length: N }, (_, i) => {
          const x0 = COL(i)
          const last = i === N - 1
          const bad = isBad(i)
          const dLine = bad && capturing ? red : dColor
          return (
            <g key={i}>
              {/* D：算式格 → MUX 的 0 端（普通 FF 直接进 FF） */}
              <line x1={dX(i)} y1={PIN_Y} x2={dX(i)} y2={scan ? MUX_T : FF_Y} stroke={dLine} strokeWidth="2" strokeDasharray={dDash} />
              <text
                x={dX(i) + 4}
                y={TAG_Y}
                fill={bad && capturing ? red : capturing ? dHot : 'var(--muted)'}
                fontSize="11"
                fontWeight={capturing ? 600 : 400}
                fontFamily="var(--mono)"
              >
                {frame.d ? `D${i + 1}=${frame.d[i]}` : `D${i + 1}`}
              </text>
              {bad ? (
                <text x={dX(i) - 4} y={TAG_Y} textAnchor="end" fill={red} fontSize="10" fontFamily="var(--mono)">
                  s-a-0
                </text>
              ) : null}
              {/* Q 回到组合逻辑处的标签：Capture 准备时写出当前值 */}
              <text x={qX(i) + 4} y={TAG_Y} fill={prep ? qHot : 'var(--muted)'} fontSize="11" fontWeight={prep ? 600 : 400} fontFamily="var(--mono)">
                {prep && frame.q ? `Q${i + 1}=${frame.q[i]}` : `Q${i + 1}`}
              </text>

              {scan ? (
                <>
                  <path
                    d={`M${x0 + 8} ${MUX_T} L${x0 + 62} ${MUX_T} L${x0 + 52} ${MUX_B} L${x0 + 18} ${MUX_B} Z`}
                    fill="var(--fig-box-2)"
                    stroke={phase === 'scanify' ? hot : 'var(--text-2)'}
                    strokeWidth={phase === 'scanify' ? 2 : 1}
                  />
                  <text x={x0 + 22} y={MUX_T + 14} textAnchor="middle" fill={frame.se === 1 ? hot : 'var(--dim)'} fontSize="10" fontFamily="var(--mono)">
                    1
                  </text>
                  <text x={x0 + 48} y={MUX_T + 14} textAnchor="middle" fill={frame.se === 0 ? hot : 'var(--dim)'} fontSize="10" fontFamily="var(--mono)">
                    0
                  </text>
                  <text x={x0 + 16} y={MUX_T - 2} textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
                    SI
                  </text>
                  {/* SE 接到 MUX 的选择端 */}
                  <line x1={x0 + 55} y1={SE_Y} x2={x0 + 55} y2={MUX_B - 6} stroke={frame.se ? 'var(--purple)' : 'var(--dim)'} strokeWidth="1.2" />
                  <line
                    x1={x0 + 35}
                    y1={MUX_B}
                    x2={x0 + 35}
                    y2={FF_Y}
                    stroke={capturing ? dHot : shifting ? hot : dim}
                    strokeWidth="2"
                    strokeDasharray={dDash}
                  />
                </>
              ) : null}

              {/* FF */}
              <rect x={x0} y={FF_Y} width={FF_W} height={FF_H} rx="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="1.5" />
              <text x={x0 + 6} y={FF_Y + 14} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
                {`FF${i + 1}`}
              </text>
              <text x={x0 + FF_W - 4} y={Q_Y + 4} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
                Q
              </text>
              <path d={`M${x0} ${FF_Y + 42} L${x0 + 7} ${FF_Y + 46} L${x0} ${FF_Y + 50}`} fill="none" stroke="var(--muted)" />

              {/* Q：先往右，再往上回到组合逻辑；Scan 时在 SCAN_Y 分一路去下一级的 SI */}
              <line x1={x0 + FF_W} y1={Q_Y} x2={qX(i)} y2={Q_Y} stroke={shifting ? hot : fbColor} strokeWidth="2" />
              <line x1={qX(i)} y1={Q_Y} x2={qX(i)} y2={SCAN_Y} stroke={shifting && !last ? hot : fbColor} strokeWidth="2" />
              <line x1={qX(i)} y1={SCAN_Y} x2={qX(i)} y2={LOGIC_B} stroke={fbColor} strokeWidth="2" />
              {scan && !last ? (
                <>
                  <line x1={qX(i)} y1={SCAN_Y} x2={COL(i + 1) + 20} y2={SCAN_Y} stroke={scanColor} strokeWidth="2" />
                  <line x1={COL(i + 1) + 20} y1={SCAN_Y} x2={COL(i + 1) + 20} y2={MUX_T} stroke={scanColor} strokeWidth="2" />
                  <circle cx={qX(i)} cy={SCAN_Y} r="3" fill={scanColor} />
                </>
              ) : null}
              {scan && last ? (
                <>
                  <line x1={qX(i)} y1={Q_Y} x2={SO.x} y2={Q_Y} stroke={scanColor} strokeWidth="2" />
                  <circle cx={qX(i)} cy={Q_Y} r="3" fill={fbColor} />
                </>
              ) : null}

              {/* Capture 沿：这个 FF 的 Q 从旧值变成刚存下的 D */}
              {edge && frame.q && frame.d ? (
                <text
                  x={x0 + FF_W / 2}
                  y={FF_Y + FF_H + 16}
                  textAnchor="middle"
                  fill={bad ? red : frame.q[i] !== frame.d[i] ? hot : 'var(--muted)'}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--mono)"
                >
                  {`${frame.q[i]}→${frame.d[i]}`}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* Scan Enable */}
        {scan ? (
          <>
            <line x1="20" y1={SE_Y} x2={COL(N - 1) + 62} y2={SE_Y} stroke={frame.se ? 'var(--purple)' : 'var(--dim)'} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="20" y={SE_Y - 5} fill={frame.se ? 'var(--purple)' : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
              {`SE = ${frame.se}`}
            </text>
          </>
        ) : null}

        {tokens.map(({ tok, pos, faded }) => (
          <Token key={tok.key} tok={tok} pos={pos} faded={faded} />
        ))}

        {plain ? (
          <text x="340" y={FF_Y + FF_H + 30} textAnchor="middle" fill="var(--red)" fontSize="13">
            {t(L.hidden)}
          </text>
        ) : null}

        {/* 比较表：读出顺序 FF4 → FF1 */}
        {showTable ? (
          <g>
            <text x="190" y={TBL_Y} textAnchor="end" fill="var(--dim)" fontSize="11">
              {t(L.from)}
            </text>
            <text x="190" y={TBL_Y + 24} textAnchor="end" fill="var(--text-2)" fontSize="12">
              {t(L.exp)}
            </text>
            <text x="190" y={TBL_Y + 52} textAnchor="end" fill="var(--text-2)" fontSize="12">
              {t(L.act)}
            </text>
            {EXPECTED.map((e, k) => {
              const cx = 230 + k * 64
              const got = frame.outs[k]
              const shown = got !== undefined
              const miss = shown && got !== e
              return (
                <g key={k}>
                  <text x={cx} y={TBL_Y} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
                    {OUT_FROM[k]}
                  </text>
                  <rect x={cx - 14} y={TBL_Y + 8} width="28" height="24" rx="4" fill="var(--fig-box)" stroke="var(--line-soft)" />
                  <text x={cx} y={TBL_Y + 25} textAnchor="middle" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">
                    {e}
                  </text>
                  <rect
                    x={cx - 14}
                    y={TBL_Y + 36}
                    width="28"
                    height="24"
                    rx="4"
                    fill={miss ? 'var(--red-bg)' : shown ? 'var(--green-bg)' : 'var(--fig-box)'}
                    stroke={miss ? 'var(--red)' : 'var(--line-soft)'}
                  />
                  <text x={cx} y={TBL_Y + 53} textAnchor="middle" fill={miss ? 'var(--red)' : 'var(--text)'} fontSize="13" fontFamily="var(--mono)">
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
