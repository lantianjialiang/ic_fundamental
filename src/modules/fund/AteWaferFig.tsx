import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { DICE, DIE_BINS, WAFER } from './data/ate'

/* ---------- 晶圆探针测试 ---------- */

const WL = {
  notch: loc('缺口', 'Notch'),
  pm: loc('紫色 = process monitor die', 'Purple = process monitor die'),
  pick: loc('点一颗 die 放大看', 'Click a die to magnify'),
  pad: 'bond pad',
  mark: 'probe mark',
  untested: loc('未测', 'Untested'),
  pmDie: loc('process monitor die（工艺监控片）', 'Process monitor die'),
  ink: loc('墨点', 'Ink dot'),
  cap: loc(
    '黄色方框是探针当前的位置。绿色是好片；坏片在“打墨点”模式下点红点，在“电子晶圆图”模式下显示 Bin 号。',
    'The yellow box is the current probe position. Green dice are good; bad dice get a red dot in "Ink dot" mode and show their bin number in "Wafer map" mode.',
  ),
}

export function WaferFig({
  results,
  tested,
  current,
  mode,
  picked,
  onPick,
}: {
  results: number[]
  tested: Set<number>
  current: number | null
  mode: 'ink' | 'map'
  picked: number | null
  onPick: (i: number) => void
}) {
  const { t } = useLocale()
  const { cx, cy, r, size } = WAFER
  const pd = picked === null ? null : DICE[picked]
  const pdTested = picked !== null && tested.has(picked)
  const pdBin = picked !== null ? results[picked] : 0
  const binLabel = DIE_BINS.find((item) => item.bin === pdBin)?.label
  let status: LText | string = WL.untested
  if (pd?.pm) status = WL.pmDie
  else if (pdTested && binLabel) status = `Bin ${pdBin} · ${t(binLabel)}`

  // 放大图里的 bond pad
  const DX = 450
  const DY = 70
  const DS = 190
  const padPos = Array.from({ length: 6 }, (_, i) => 22 + i * 29)
  const pads = [
    ...padPos.map((p) => ({ x: DX + p, y: DY + 6, w: 16, h: 11 })),
    ...padPos.map((p) => ({ x: DX + p, y: DY + DS - 17, w: 16, h: 11 })),
    ...padPos.map((p) => ({ x: DX + 6, y: DY + p, w: 11, h: 16 })),
    ...padPos.map((p) => ({ x: DX + DS - 17, y: DY + p, w: 11, h: 16 })),
  ]

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 380" className="term-fig__svg" role="img" aria-label={t(WL.cap)}>
        <rect width="680" height="380" rx="10" fill="var(--well)" />
        <circle cx={cx} cy={cy} r={r} fill="var(--fig-box-2)" stroke="var(--line-2)" strokeWidth="2" />
        <path d={`M${cx - 9} ${cy - r - 1} L${cx} ${cy - r + 12} L${cx + 9} ${cy - r - 1} Z`} fill="var(--well)" stroke="var(--line-2)" />
        <text x={cx + 16} y={cy - r + 10} fill="var(--dim)" fontSize="11">{t(WL.notch)}</text>
        {DICE.map((d, i) => {
          const isTested = tested.has(i)
          const bin = results[i]
          const bad = isTested && bin !== 1
          let fill = 'var(--fig-box)'
          let stroke = 'var(--line)'
          if (d.pm) {
            fill = 'var(--purple)'
            stroke = 'var(--purple)'
          } else if (isTested && !bad) {
            fill = 'var(--green-bg)'
            stroke = 'var(--green-line)'
          } else if (bad && mode === 'map') {
            fill = 'var(--red-bg)'
            stroke = 'var(--red-line)'
          }
          return (
            <g key={d.id} onClick={() => onPick(i)} style={{ cursor: 'pointer' }}>
              <rect
                x={d.x}
                y={d.y}
                width={size}
                height={size}
                rx="2"
                fill={fill}
                fillOpacity={d.pm ? 0.45 : 1}
                stroke={picked === i ? 'var(--gold)' : stroke}
                strokeWidth={picked === i ? 2 : 1}
              />
              {bad && mode === 'ink' ? <circle cx={d.x + size / 2} cy={d.y + size / 2} r="6" fill="var(--red)" /> : null}
              {isTested && mode === 'map' ? (
                <text
                  x={d.x + size / 2}
                  y={d.y + size / 2 + 4}
                  textAnchor="middle"
                  fill={bad ? 'var(--red-2)' : 'var(--green-2)'}
                  fontSize="10"
                  fontFamily="var(--mono)"
                >
                  {bin}
                </text>
              ) : null}
              {d.pm ? (
                <text x={d.x + size / 2} y={d.y + size / 2 + 3} textAnchor="middle" fill="var(--text)" fontSize="8">
                  PM
                </text>
              ) : null}
            </g>
          )
        })}
        {current !== null ? (
          <g pointerEvents="none">
            <rect x={DICE[current].x - 3} y={DICE[current].y - 3} width={size + 6} height={size + 6} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
            <path
              d={`M${DICE[current].x + size / 2} ${DICE[current].y + 4} l-5 -16 l10 0 Z`}
              fill="var(--gold)"
            />
          </g>
        ) : null}
        <text x="20" y="370" fill="var(--dim)" fontSize="11">{t(WL.pm)}</text>

        {/* 放大的 die */}
        {pd ? (
          <g>
            <text x={DX + DS / 2} y={DY - 14} textAnchor="middle" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">
              {`Die (${pd.col}, ${pd.row})`}
            </text>
            <rect x={DX} y={DY} width={DS} height={DS} rx="4" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="2" />
            <rect x={DX + 40} y={DY + 40} width="50" height="40" fill="var(--fig-box-2)" stroke="var(--line)" />
            <rect x={DX + 100} y={DY + 40} width="50" height="60" fill="var(--fig-box-2)" stroke="var(--line)" />
            <rect x={DX + 40} y={DY + 90} width="50" height="60" fill="var(--fig-box-2)" stroke="var(--line)" />
            <rect x={DX + 100} y={DY + 110} width="50" height="40" fill="var(--fig-box-2)" stroke="var(--line)" />
            {pads.map((p, i) => (
              <g key={i}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="var(--gold-bg-2)" stroke="var(--gold-line)" />
                {pdTested ? <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r="2.2" fill="var(--text)" /> : null}
              </g>
            ))}
            {pdTested && pdBin !== 1 && mode === 'ink' ? (
              <circle cx={DX + DS / 2} cy={DY + DS / 2} r="26" fill="var(--red)" opacity="0.85" />
            ) : null}
            {/* 标注 */}
            <line x1={pads[0].x + 8} y1={pads[0].y} x2={pads[0].x + 8} y2={DY - 30} stroke="var(--sky)" />
            <text x={pads[0].x + 2} y={DY - 34} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">
              {WL.pad}
            </text>
            {pdTested ? (
              <>
                <line x1={pads[11].x + 8} y1={pads[11].y + 6} x2={DX + DS + 20} y2={DY + DS + 30} stroke="var(--sky)" />
                <text x={DX + DS + 16} y={DY + DS + 44} textAnchor="end" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">
                  {WL.mark}
                </text>
              </>
            ) : null}
            <text x={DX + DS / 2} y={DY + DS + 66} textAnchor="middle" fill={pdTested && pdBin !== 1 ? 'var(--red-2)' : 'var(--text-2)'} fontSize="13">
              {t(status)}
            </text>
          </g>
        ) : (
          <text x={DX + DS / 2} y={DY + DS / 2} textAnchor="middle" fill="var(--dim)" fontSize="13">
            {t(WL.pick)}
          </text>
        )}
      </svg>
      <figcaption>{t(WL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 分选机分 Bin ---------- */

const HL = {
  input: loc('未测 Bin', 'Untested bin'),
  site: loc('测试位', 'Test site'),
  contactor: 'contactor',
  cap: loc(
    '分选机从未测 Bin 取一颗芯片送到测试位，测试机判完结果告诉分选机，芯片被放进对应的 Bin。',
    'The handler takes a chip from the untested bin to the test site; the tester judges it and tells the handler, and the chip is placed in the matching bin.',
  ),
}

export type BinBox = { id: string; label: LText; count: number; good: boolean }

export function HandlerFig({
  bins,
  untested,
  flight,
}: {
  bins: BinBox[]
  untested: number
  flight: { key: number; target: number; stage: 'site' | 'bin' } | null
}) {
  const { t } = useLocale()
  const n = bins.length
  const gap = 10
  const w = (620 - (n - 1) * gap) / n
  const binX = (i: number) => 30 + i * (w + gap)
  let pos = { x: 340, y: 62 }
  if (flight && flight.stage === 'bin') pos = { x: binX(flight.target) + w / 2, y: 262 }
  const targetGood = flight ? bins[flight.target]?.good : true
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(HL.cap)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        {/* 未测料仓 */}
        <rect x="30" y="30" width="140" height="66" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="100" y="54" textAnchor="middle" fill="var(--text-2)" fontSize="13">{t(HL.input)}</text>
        <text x="100" y="82" textAnchor="middle" fill="var(--gold)" fontSize="20" fontFamily="var(--mono)">{untested}</text>
        <path d="M172 63 L262 63" stroke="var(--line-2)" strokeWidth="2" />
        <path d="M254 57 L264 63 L254 69" fill="none" stroke="var(--line-2)" strokeWidth="2" />
        {/* 测试位 */}
        <rect x="270" y="30" width="140" height="66" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="340" y="24" textAnchor="middle" fill="var(--text-2)" fontSize="12">{t(HL.site)}</text>
        <text x="340" y="90" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">{HL.contactor}</text>
        <path d="M340 98 L340 190" stroke="var(--line)" strokeDasharray="4 4" />
        {/* Bins */}
        {bins.map((bin, i) => (
          <g key={bin.id}>
            <rect
              x={binX(i)}
              y="196"
              width={w}
              height="88"
              rx="8"
              fill={bin.good ? 'var(--green-bg)' : 'var(--red-bg)'}
              stroke={bin.good ? 'var(--green-line)' : 'var(--red-line)'}
            />
            <text x={binX(i) + w / 2} y="216" textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(bin.label)}
            </text>
            <text x={binX(i) + w / 2} y="246" textAnchor="middle" fill="var(--text)" fontSize="20" fontFamily="var(--mono)">
              {bin.count}
            </text>
          </g>
        ))}
        {flight ? (
          <g key={flight.key} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.55s ease-in-out' }}>
            {[-10, -3, 4, 11].map((dx) => (
              <g key={dx}>
                <line x1={dx} y1="-13" x2={dx} y2="-9" stroke="var(--text-2)" strokeWidth="2" />
                <line x1={dx} y1="9" x2={dx} y2="13" stroke="var(--text-2)" strokeWidth="2" />
              </g>
            ))}
            <rect x="-17" y="-9" width="34" height="18" rx="2" fill="var(--fig-box-2)" stroke={flight.stage === 'bin' ? (targetGood ? 'var(--green)' : 'var(--red)') : 'var(--gold)'} strokeWidth="2" />
          </g>
        ) : null}
      </svg>
      <figcaption>{t(HL.cap)}</figcaption>
    </figure>
  )
}
