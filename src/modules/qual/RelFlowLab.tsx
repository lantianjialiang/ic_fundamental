import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { NODE_NAME, S } from './relFlowData'
import { type FlowState, type NodeId, type PopParams } from './relFlowModel'

type WinId = FlowState['patWin']
const WIN_OPTIONS: Array<{ id: WinId; label: LText }> = [
  { id: 'lot', label: S.winLot },
  { id: 'wafer', label: S.winWafer },
]

function Slider({
  label,
  shown,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: LText
  shown: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const { t } = useLocale()
  return (
    <label className="rf-slider">
      <span>
        {t(label)} <b>{shown}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

/** 流程节点：每行一个启用开关，上移 / 下移按钮改变执行顺序；第一行不能上移，最后一行不能下移 */
export function FlowEditor({ flow, onFlow }: { flow: FlowState; onFlow: (next: FlowState) => void }) {
  const { t } = useLocale()

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= flow.order.length) {
      return
    }
    const order = [...flow.order]
    const moved = order[index]
    order[index] = order[target]
    order[target] = moved
    onFlow({ ...flow, order })
  }

  const toggle = (id: NodeId, on: boolean) => {
    onFlow({ ...flow, on: { ...flow.on, [id]: on } })
  }

  return (
    <div className="rf-flow">
      <p className="rf-flow__title">{t(S.flowTitle)}</p>
      <p className="intro__note">{t(S.flowNote)}</p>
      <ol className="rf-flow__list">
        {flow.order.map((id, index) => {
          const on = flow.on[id]
          const name = t(NODE_NAME[id])
          return (
            <li key={id} className={`rf-flow__item${on ? '' : ' is-off'}`}>
              <label className="rf-check">
                <input type="checkbox" checked={on} onChange={(event) => toggle(id, event.target.checked)} />
                <span>{name}</span>
              </label>
              <span className="rf-flow__btns">
                <button type="button" className="lab__btn" disabled={index === 0} aria-label={`${t(S.moveUp)} ${name}`} onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="lab__btn"
                  disabled={index === flow.order.length - 1}
                  aria-label={`${t(S.moveDown)} ${name}`}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** 参数控件：soak、BI、PAT、邻近规则，以及虚拟群体中三类问题的比例 */
export function FlowControls({
  flow,
  onFlow,
  pop,
  onPop,
}: {
  flow: FlowState
  onFlow: (next: FlowState) => void
  pop: PopParams
  onPop: (next: PopParams) => void
}) {
  const { t } = useLocale()
  return (
    <div className="rf-controls">
      <Slider label={S.soakLabel} shown={`${flow.soakS} s`} value={flow.soakS} min={0} max={300} step={10} onChange={(soakS) => onFlow({ ...flow, soakS })} />
      <Slider label={S.biLabel} shown={`${flow.biH} h`} value={flow.biH} min={0} max={168} step={2} onChange={(biH) => onFlow({ ...flow, biH })} />
      <div className="rf-field">
        <span className="rf-field__label">{t(S.patWinLabel)}</span>
        <Seg options={WIN_OPTIONS} value={flow.patWin} onChange={(patWin) => onFlow({ ...flow, patWin })} />
      </div>
      <Slider label={S.patKLabel} shown={`k = ${flow.patK}`} value={flow.patK} min={3} max={8} step={0.5} onChange={(patK) => onFlow({ ...flow, patK })} />
      <div className="rf-field">
        <span className="rf-field__label">{t(S.nbrLabel)}</span>
        <label className="rf-check">
          <input type="checkbox" checked={flow.nbrOn} onChange={(event) => onFlow({ ...flow, nbrOn: event.target.checked })} />
          <span>{t(S.nbrOn)}</span>
        </label>
      </div>
      <Slider label={S.nbrRLabel} shown={`${flow.nbrR}`} value={flow.nbrR} min={1} max={3} step={0.5} onChange={(nbrR) => onFlow({ ...flow, nbrR })} />
      <Slider label={S.nbrMLabel} shown={`${flow.nbrM}`} value={flow.nbrM} min={1} max={4} step={1} onChange={(nbrM) => onFlow({ ...flow, nbrM })} />
      <p className="rf-group">{t(S.problemTitle)}</p>
      <Slider label={S.hardLabel} shown={`${pop.hardPct} %`} value={pop.hardPct} min={0} max={5} step={0.5} onChange={(hardPct) => onPop({ ...pop, hardPct })} />
      <Slider label={S.shiftLabel} shown={`${pop.shiftPct} %`} value={pop.shiftPct} min={0} max={2} step={0.5} onChange={(shiftPct) => onPop({ ...pop, shiftPct })} />
      <Slider label={S.latentLabel} shown={`${pop.latentPct.toFixed(1)} %`} value={pop.latentPct} min={0.1} max={1} step={0.1} onChange={(latentPct) => onPop({ ...pop, latentPct })} />
    </div>
  )
}
