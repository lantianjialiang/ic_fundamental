import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { OPS, hex4, type RunRow } from './data/content'

const L = {
  portLine: loc('输入：两个操作数 + 操作码。输出：结果和进位。', 'Inputs: two operands + an opcode. Outputs: result and carry.'),
  portCap: loc('先认端口。后面每条向量都是给 A / B / OP，比 Y / Carry。', 'Learn the pins first. Every vector drives A / B / OP and compares Y / Carry.'),
  inBus: loc('A / B / OP', 'A / B / OP'),
  outBus: loc('Y / Carry', 'Y / Carry'),
  old: loc('上一拍', 'previous'),
  newIn: loc('本拍输入', 'this cycle'),
  newOut: loc('新结果', 'new result'),
  window: loc('有效窗口', 'valid window'),
  timeCap: loc(
    '输入在 Drive 时刻变；输出再晚 tpd 才稳定。灰色是输出正在变的区间，绿色是能放 Strobe 的窗口。',
    'Inputs change at Drive; the output settles tpd later. Gray: output still changing. Green: where the strobe may go.',
  ),
  tester: loc('Tester 驱动', 'Tester drives'),
  dut: loc('DUT', 'DUT'),
  actual: loc('实际', 'Actual'),
  expect: loc('期望', 'Expected'),
  stale: loc('采到的是上一拍的输出', 'stale: previous cycle'),
  ready: loc('还没开始。点“下一拍”执行第 1 条向量。', 'Not started. Press “Next cycle” to run vector 1.'),
  cycle: loc('拍', 'Cycle'),
  runCap: loc(
    '每一拍：Tester 驱动输入 → DUT 算出结果 → Strobe 时刻比较实际与期望。红色位是不一致的位。',
    'Each cycle: the tester drives inputs → the DUT computes → at the strobe, actual is compared with expected. Red bits differ.',
  ),
}

export function AluFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 240" className="term-fig__svg" role="img" aria-label={t(L.portCap)}>
        <rect width="680" height="240" rx="10" fill="var(--well)" />
        {[
          { y: 54, name: 'A[3:0]', c: 'var(--sky)' },
          { y: 94, name: 'B[3:0]', c: 'var(--sky)' },
          { y: 134, name: 'OP[2:0]', c: 'var(--gold)' },
        ].map((p) => (
          <g key={p.name}>
            <text x="36" y={p.y + 4} fill={p.c} fontSize="13" fontFamily="var(--mono)">
              {p.name}
            </text>
            <line x1="110" y1={p.y} x2="210" y2={p.y} stroke={p.c} strokeWidth="2" />
            <path d={`M202 ${p.y - 5} L210 ${p.y} L202 ${p.y + 5}`} fill="none" stroke={p.c} strokeWidth="2" />
          </g>
        ))}
        <rect x="210" y="28" width="220" height="140" rx="8" fill="var(--fig-box)" stroke="var(--blue)" strokeWidth="1.5" />
        <text x="320" y="96" textAnchor="middle" fill="var(--text)" fontSize="22">
          ALU
        </text>
        <text x="320" y="122" textAnchor="middle" fill="var(--muted)" fontSize="12">
          4-bit
        </text>
        {[
          { y: 70, name: 'Y[3:0]' },
          { y: 130, name: 'Carry' },
        ].map((p) => (
          <g key={p.name}>
            <line x1="430" y1={p.y} x2="530" y2={p.y} stroke="var(--green)" strokeWidth="2" />
            <path d={`M522 ${p.y - 5} L530 ${p.y} L522 ${p.y + 5}`} fill="none" stroke="var(--green)" strokeWidth="2" />
            <text x="540" y={p.y + 4} fill="var(--green)" fontSize="13" fontFamily="var(--mono)">
              {p.name}
            </text>
          </g>
        ))}
        <text x="320" y="206" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(L.portLine)}
        </text>
      </svg>
      <figcaption>{t(L.portCap)}</figcaption>
    </figure>
  )
}

/** 一拍之内的时序：输入在 Drive 变，输出在 Drive + tpd 稳定，Strobe 必须落在稳定之后、周期之内 */
export function AluTimingFig({
  period,
  drive,
  tpd,
  strobe,
}: {
  period: number
  drive: number
  tpd: number
  strobe: number
}) {
  const { t } = useLocale()
  const span = Math.max(period + 4, 28)
  const X0 = 100
  const X1 = 660
  const xAt = (ns: number) => X0 + (Math.min(Math.max(ns, 0), span) / span) * (X1 - X0)
  const settle = drive + tpd
  const ok = strobe >= settle && strobe < period
  const sc = ok ? 'var(--green)' : 'var(--red)'
  const inY = 56
  const outY = 126
  const h = 13
  // 总线画法：两条平行线，在变化点交叉
  const bus = (y: number, from: number, to: number) => {
    const a = xAt(from)
    const b = Math.max(xAt(to), a + 6)
    return `M${X0} ${y - h} H${a} L${b} ${y + h} H${X1} M${X0} ${y + h} H${a} L${b} ${y - h} H${X1}`
  }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 220" className="term-fig__svg" role="img" aria-label={t(L.timeCap)}>
        <rect width="680" height="220" rx="10" fill="var(--well)" />
        {/* 有效窗口 */}
        {settle < period ? (
          <rect x={xAt(settle)} y={outY - h - 4} width={xAt(period) - xAt(settle)} height={2 * h + 8} fill="var(--green-bg)" />
        ) : null}
        {/* 输出变化中 */}
        <path
          d={`M${xAt(drive)} ${outY - h} H${xAt(settle)} V${outY + h} H${xAt(drive)} Z`}
          fill="var(--neutral-fill)"
          stroke="none"
        />
        <text x="14" y={inY + 4} fill="var(--sky)" fontSize="12" fontFamily="var(--mono)">
          {t(L.inBus)}
        </text>
        <text x="14" y={outY + 4} fill="var(--green)" fontSize="12" fontFamily="var(--mono)">
          {t(L.outBus)}
        </text>
        <path d={bus(inY, drive, drive + 0.4)} fill="none" stroke="var(--sky)" strokeWidth="2" />
        <path d={bus(outY, drive, settle)} fill="none" stroke="var(--green)" strokeWidth="2" />
        {drive > 2 ? (
          <text x={(X0 + xAt(drive)) / 2} y={inY + 4} textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(L.old)}
          </text>
        ) : null}
        <text x={(xAt(drive) + X1) / 2} y={inY + 4} textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(L.newIn)}
        </text>
        <text x={(X0 + xAt(drive)) / 2} y={outY + 4} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {drive > 2 ? t(L.old) : ''}
        </text>
        <text x={(xAt(settle) + X1) / 2} y={outY + 4} textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(L.newOut)}
        </text>
        {/* tpd 标尺 */}
        <line x1={xAt(drive)} y1={outY + h + 12} x2={xAt(settle)} y2={outY + h + 12} stroke="var(--muted)" />
        <text x={(xAt(drive) + xAt(settle)) / 2} y={outY + h + 26} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {`tpd ${tpd} ns`}
        </text>
        {/* Drive */}
        <line x1={xAt(drive)} y1="22" x2={xAt(drive)} y2="186" stroke="var(--sky)" strokeDasharray="3 3" />
        <text x={xAt(drive) + 4} y="30" fill="var(--sky)" fontSize="11">
          {`Drive ${drive}`}
        </text>
        {/* Period */}
        <line x1={xAt(period)} y1="22" x2={xAt(period)} y2="186" stroke="var(--muted)" strokeDasharray="5 4" />
        <text x={xAt(period) + 4} y="30" fill="var(--muted)" fontSize="11">
          {`Period ${period}`}
        </text>
        {settle < period ? (
          <text x={(xAt(settle) + xAt(period)) / 2} y={outY - h - 8} textAnchor="middle" fill="var(--green)" fontSize="11">
            {t(L.window)}
          </text>
        ) : null}
        {/* Strobe */}
        <line x1={xAt(strobe)} y1="40" x2={xAt(strobe)} y2="186" stroke={sc} strokeWidth="2" />
        <circle cx={xAt(strobe)} cy={outY} r="5" fill={sc} />
        <text x={xAt(strobe) + 4} y="200" fill={sc} fontSize="11">
          {`Strobe ${strobe}`}
        </text>
        <text x={X0} y="214" fill="var(--dim)" fontSize="11">
          0 ns
        </text>
      </svg>
      <figcaption>{t(L.timeCap)}</figcaption>
    </figure>
  )
}

const bin = (n: number, w = 4) => (n & ((1 << w) - 1)).toString(2).padStart(w, '0')

function Bits({ x, y, value, compare }: { x: number; y: number; value: number; compare?: number }) {
  return (
    <text x={x} y={y} fontSize="14" fontFamily="var(--mono)">
      {[3, 2, 1, 0].map((pos) => {
        const bit = (value >> pos) & 1
        const bad = compare !== undefined && bit !== ((compare >> pos) & 1)
        return (
          <tspan key={pos} fill={bad ? 'var(--red)' : 'var(--text)'} fontWeight={bad ? 700 : 400}>
            {bit}
          </tspan>
        )
      })}
    </text>
  )
}

/** 逐拍运行：上半是当前这一拍的 Drive / 计算 / Compare，下半是所有拍的 P/F 条 */
export function AluRunFig({ rows, cur }: { rows: RunRow[]; cur: number }) {
  const { t } = useLocale()
  const item = cur > 0 ? rows[cur - 1] : null
  const n = rows.length
  const cellW = n > 0 ? Math.min(68, 620 / n) : 68
  const stripX = 340 - (cellW * n) / 2
  const verdict = item ? (item.pass ? 'var(--green)' : 'var(--red)') : 'var(--line-2)'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(L.runCap)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        {/* Tester 驱动 */}
        <rect x="20" y="24" width="190" height="140" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="34" y="46" fill="var(--sky)" fontSize="12">
          {t(L.tester)}
        </text>
        {item ? (
          <>
            <text x="34" y="78" fill="var(--text)" fontSize="14" fontFamily="var(--mono)">
              {`A  = ${bin(item.row.a)}`}
            </text>
            <text x="34" y="106" fill="var(--text)" fontSize="14" fontFamily="var(--mono)">
              {`B  = ${bin(item.row.b)}`}
            </text>
            <text x="34" y="134" fill="var(--gold)" fontSize="14" fontFamily="var(--mono)">
              {`OP = ${OPS[item.row.op].code} ${OPS[item.row.op].name}`}
            </text>
          </>
        ) : null}
        {/* Drive 箭头 */}
        <line x1="210" y1="94" x2="262" y2="94" stroke={item ? 'var(--sky)' : 'var(--line-2)'} strokeWidth="3" />
        <path d="M254 88 L262 94 L254 100" fill="none" stroke={item ? 'var(--sky)' : 'var(--line-2)'} strokeWidth="3" />
        {/* DUT */}
        <rect x="262" y="44" width="110" height="100" rx="8" fill="var(--fig-box)" stroke="var(--blue)" strokeWidth="1.5" />
        <text x="317" y="90" textAnchor="middle" fill="var(--text)" fontSize="16">
          ALU
        </text>
        <text x="317" y="112" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.dut)}
        </text>
        <line x1="372" y1="94" x2="424" y2="94" stroke={item ? 'var(--green)' : 'var(--line-2)'} strokeWidth="3" />
        <path d="M416 88 L424 94 L416 100" fill="none" stroke={item ? 'var(--green)' : 'var(--line-2)'} strokeWidth="3" />
        {/* Compare */}
        <rect x="424" y="24" width="236" height="140" rx="8" fill="var(--fig-box-2)" stroke={verdict} strokeWidth={item ? 2 : 1} />
        <text x="438" y="46" fill="var(--muted)" fontSize="12">
          Compare @ Strobe
        </text>
        {item ? (
          <>
            <text x="438" y="76" fill="var(--muted)" fontSize="12">
              {t(L.expect)}
            </text>
            <text x="512" y="76" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
              Y
            </text>
            <Bits x={526} y={76} value={item.exp.y} />
            <text x="574" y="76" fill="var(--text)" fontSize="14" fontFamily="var(--mono)">
              {`C ${item.exp.carry}`}
            </text>
            <text x="438" y="104" fill="var(--muted)" fontSize="12">
              {t(L.actual)}
            </text>
            <text x="512" y="104" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
              Y
            </text>
            <Bits x={526} y={104} value={item.got.y} compare={item.exp.y} />
            <text
              x="574"
              y="104"
              fill={item.got.carry === item.exp.carry ? 'var(--text)' : 'var(--red)'}
              fontSize="14"
              fontFamily="var(--mono)"
            >
              {`C ${item.got.carry}`}
            </text>
            <text x="438" y="142" fill={verdict} fontSize="18" fontWeight="700">
              {item.pass ? 'PASS' : 'FAIL'}
            </text>
            {item.stale ? (
              <text x="512" y="141" fill="var(--red)" fontSize="11">
                {t(L.stale)}
              </text>
            ) : null}
          </>
        ) : (
          <text x="438" y="96" fill="var(--muted)" fontSize="12">
            —
          </text>
        )}
        {/* 所有拍 */}
        {item ? null : (
          <text x="340" y="194" textAnchor="middle" fill="var(--muted)" fontSize="12">
            {t(L.ready)}
          </text>
        )}
        {rows.map((r, i) => {
          const x = stripX + i * cellW
          const done = i < cur
          const now = i === cur - 1
          const fill = !done ? 'var(--fig-box)' : r.pass ? 'var(--green-bg)' : 'var(--red-bg)'
          const stroke = now ? 'var(--gold)' : !done ? 'var(--line)' : r.pass ? 'var(--green-line)' : 'var(--red-line)'
          return (
            <g key={r.row.id}>
              <rect x={x + 3} y="210" width={cellW - 6} height="66" rx="6" fill={fill} stroke={stroke} strokeWidth={now ? 2 : 1} />
              <text x={x + cellW / 2} y="228" textAnchor="middle" fill="var(--dim)" fontSize="10">
                {`${t(L.cycle)} ${i + 1}`}
              </text>
              <text x={x + cellW / 2} y="248" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
                {OPS[r.row.op].name}
              </text>
              <text
                x={x + cellW / 2}
                y="267"
                textAnchor="middle"
                fill={!done ? 'var(--dim)' : r.pass ? 'var(--green)' : 'var(--red)'}
                fontSize="11"
                fontWeight="700"
              >
                {!done ? '·' : r.pass ? 'P' : 'F'}
              </text>
            </g>
          )
        })}
        {item ? (
          <text x="340" y="196" textAnchor="middle" fill="var(--dim)" fontSize="11" fontFamily="var(--mono)">
            {`${OPS[item.row.op].name} ${hex4(item.row.a)}, ${hex4(item.row.b)}`}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(L.runCap)}</figcaption>
    </figure>
  )
}
