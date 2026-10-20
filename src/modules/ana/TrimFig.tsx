import { useLocale } from '../../i18n/LocaleContext'
import { FIG, S } from './trimData'
import { CODE_CENTER, CODE_MAX, LIMIT_MV, V_NOM_MV, transferMv, type TrimView } from './trimModel'

const W = 480
const H = 220
const PX0 = 60
const PX1 = 462
const PY0 = 26
const PY1 = 186
const PY_MID = (PY0 + PY1) / 2
const DEV_MAX = 70
const DEV_TICKS = [-60, -30, 0, 30, 60]
const CODE_TICKS = [0, 8, 16, 24, CODE_MAX]

const cx = (code: number) => PX0 + (code / CODE_MAX) * (PX1 - PX0)
const cy = (dev: number) => PY_MID - (dev / DEV_MAX) * ((PY1 - PY0) / 2)

/** 修调曲线：横轴是码，纵轴是输出偏差；标出限值带、搜索测过的码、码 16 的未修调点和选中的码 */
export function TrimCurveFig({ view }: { view: TrimView }) {
  const { t } = useLocale()
  const offset = view.die.offsetMv
  const codes = Array.from({ length: CODE_MAX + 1 }, (_, index) => index)
  const curve = codes
    .map((code) => `${cx(code).toFixed(1)},${cy(transferMv(offset, code) - V_NOM_MV).toFixed(1)}`)
    .join(' ')
  const testedFill = view.method === 'binary' ? 'var(--purple)' : 'var(--muted)'
  const chosenStroke = view.ok ? 'var(--green)' : 'var(--red)'
  const bandTop = cy(LIMIT_MV)
  const bandBot = cy(-LIMIT_MV)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.curveAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x={PX0} y={bandTop} width={PX1 - PX0} height={bandBot - bandTop} fill="var(--gold)" fillOpacity="0.25" />
        <line x1={PX0} x2={PX1} y1={bandTop} y2={bandTop} stroke="var(--gold)" strokeDasharray="4 3" />
        <line x1={PX0} x2={PX1} y1={bandBot} y2={bandBot} stroke="var(--gold)" strokeDasharray="4 3" />
        <line x1={PX0} x2={PX1} y1={cy(0)} y2={cy(0)} stroke="var(--line-2)" strokeDasharray="3 3" />

        <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth="2" />

        {view.steps.map((step, index) => (
          <circle key={`${step.code}-${index}`} cx={cx(step.code)} cy={cy(step.mv - V_NOM_MV)} r="3.5" fill={testedFill} />
        ))}

        <circle cx={cx(CODE_CENTER)} cy={cy(offset)} r="4" fill="none" stroke="var(--blue)" strokeWidth="1.5" />

        <circle cx={cx(view.code)} cy={cy(view.err)} r="6" fill="none" stroke={chosenStroke} strokeWidth="2.5" />
        <text x={cx(view.code)} y={cy(view.err) - 10} textAnchor="middle" fill={chosenStroke} fontSize="10" fontFamily="var(--mono)">
          {`${view.code}`}
        </text>

        {DEV_TICKS.map((dev) => (
          <text key={dev} x={PX0 - 6} y={cy(dev) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${dev > 0 ? '+' : ''}${dev}`}
          </text>
        ))}
        {CODE_TICKS.map((code) => (
          <text key={code} x={cx(code)} y={200} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${code}`}
          </text>
        ))}

        <text x={PX0} y={16} fill="var(--muted)" fontSize="10">
          {t(FIG.curveY)}
        </text>
        <text x={PX1} y={216} textAnchor="end" fill="var(--muted)" fontSize="10">
          {t(FIG.curveX)}
        </text>
      </svg>
      <figcaption>{t(FIG.curveCap)}</figcaption>
    </figure>
  )
}

const FLOW_X = [6, 126, 246, 366]
const BOX_W = 108
const BOX_Y = 16
const BOX_H = 56
const FLOW_H = 96

/** 修调流程：搜索 → 编程 → 回读 → 复测；已完成的步骤标绿，下一步标金色 */
export function TrimFlowFig({ view }: { view: TrimView }) {
  const { t } = useLocale()
  const titles = [S.flowSearch, S.flowProgram, S.flowReadback, S.flowRetest]
  const done = [true, view.programmed, view.readback, view.retested]
  const nextIndex = done.indexOf(false)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 480 ${FLOW_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.flowAria)}>
        <rect width="480" height={FLOW_H} rx="10" fill="var(--well)" />
        {titles.map((title, index) => {
          const x = FLOW_X[index]
          const isDone = done[index]
          const isNext = index === nextIndex
          const stroke = isDone ? 'var(--green)' : isNext ? 'var(--gold)' : 'var(--line-2)'
          const statusFill = isDone ? 'var(--green)' : isNext ? 'var(--gold)' : 'var(--muted)'
          const status = isDone ? S.stepDone : isNext ? S.stepNext : S.stepTodo
          return (
            <g key={index}>
              <rect x={x} y={BOX_Y} width={BOX_W} height={BOX_H} rx="6" fill="var(--fig-box)" stroke={stroke} strokeWidth={isDone || isNext ? 2 : 1} />
              <text x={x + BOX_W / 2} y={BOX_Y + 24} textAnchor="middle" fill="var(--text)" fontSize="10">
                {t(title)}
              </text>
              <text x={x + BOX_W / 2} y={BOX_Y + 42} textAnchor="middle" fill={statusFill} fontSize="10">
                {t(status)}
              </text>
            </g>
          )
        })}
        {FLOW_X.slice(0, -1).map((x, index) => (
          <line
            key={`arrow-${index}`}
            x1={x + BOX_W + 2}
            x2={FLOW_X[index + 1] - 2}
            y1={BOX_Y + BOX_H / 2}
            y2={BOX_Y + BOX_H / 2}
            stroke="var(--muted)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <figcaption>{t(FIG.flowCap)}</figcaption>
    </figure>
  )
}
