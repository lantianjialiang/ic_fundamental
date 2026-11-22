import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram, DiagramChoices } from './FlowVisuals'

const NETS = ['A', 'B', 'C', 'D']
const PAIRS = [
  { id: 'A–B', left: 0, right: 1 },
  { id: 'A–C', left: 0, right: 2 },
  { id: 'A–D', left: 0, right: 3 },
  { id: 'B–C', left: 1, right: 2 },
  { id: 'B–D', left: 1, right: 3 },
  { id: 'C–D', left: 2, right: 3 },
] as const
const PAIR_CHOICES = PAIRS.map(({ id }) => ({ id, title: loc(id, id) }))
const METHODS = [
  { id: 'flying', title: loc('两根飞针', 'Two flying probes') },
  { id: 'fixture', title: loc('针床治具', 'Bed of nails') },
] as const
const BOARDS = [
  { id: 'clean', title: loc('无桥接', 'No bridge') },
  { id: 'bridged', title: loc('A–D 意外桥接', 'A–D bridge') },
] as const
const at = (index: number) => 62 + index * 104

export function IsolationDiagram({ strategy, onStrategyChange }: {
  strategy: string
  onStrategyChange: (id: string) => void
}) {
  const { t } = useLocale()
  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('flying')
  const [board, setBoard] = useState<(typeof BOARDS)[number]['id']>('bridged')
  const [pairId, setPairId] = useState<(typeof PAIRS)[number]['id']>('A–B')
  const pair = PAIRS.find(({ id }) => id === pairId)!
  const scheduled = strategy === 'all' || pair.right - pair.left === 1
  const fixture = method === 'fixture'
  const bridged = board === 'bridged'
  const missed = strategy !== 'all' && bridged
  const outcome = !scheduled
    ? loc(`${pairId} 不在本轮计划内，仪表没有读数。`, `${pairId} is unscheduled. The meter takes no reading.`)
    : bridged && pairId === 'A–D'
      ? loc('A–D 实测低阻，绝缘失败。', 'A–D reads low resistance and fails isolation.')
      : loc(`${pairId} 实测高阻，所测网络之间保持绝缘。`, `${pairId} reads high resistance. The measured nets are isolated.`)
  const contact = fixture
    ? loc('四根固定探针同时接触焊盘，仪表每次选通一对。', 'All four fixture pins touch their pads together. The meter switches to one pair at a time.')
    : loc('两根飞针跟随选中的网络对移动。', 'The two flying probes move to each scheduled pair.')
  const result = missed
    ? loc('相邻计划只测 A–B、B–C、C–D。A–D 桥接会漏过。', 'The neighbor plan measures A–B, B–C and C–D. It misses the A–D bridge.')
    : bridged
      ? loc('全对计划包含 A–D。依次测完六对时能发现桥接。', 'The full plan includes A–D. The bridge is found when all six pairs are measured.')
      : loc('这块板上四条网络相互绝缘。', 'The four nets are isolated on this board.')

  return (
    <Diagram title={loc('同一块板上的飞针与针床', 'Flying probes and fixture on the same board')}
      caption={loc('俯视线路示意。四条网络平行排列，故相邻计划只包含三对。橙线是样板上的异常桥接。', 'Top view of four parallel nets. Only three pairs are physical neighbors. Orange shows the example bridge.')}>
      <DiagramChoices label={loc('接触方式', 'Contact method')} items={METHODS} value={method} onPick={setMethod} />
      <DiagramChoices label={loc('绝缘计划', 'Isolation plan')} items={[
        { id: 'all', title: loc('全对绝缘', 'All-pairs isolation') },
        { id: 'near', title: loc('相邻网络', 'Adjacent nets') },
      ]} value={strategy} onPick={onStrategyChange} />
      <DiagramChoices label={loc('样板缺陷', 'Board defect')} items={BOARDS} value={board} onPick={setBoard} />
      <div className="flow-pair-selection">
        <span>{t(loc('选择要检查的网络对', 'Select a net pair to inspect'))}</span>
        <DiagramChoices label={loc('网络对', 'Net pair')} items={PAIR_CHOICES} value={pairId} onPick={setPairId} />
      </div>
      <svg className="flow-technical-svg" viewBox="0 0 438 239" role="img" aria-label={t(contact)} data-method={method}>
        <rect x="28" y="97" width="382" height="121" rx="12" fill="#255d55" stroke="#569681" strokeWidth="2" />
        {fixture && <rect x="39" y="38" width="360" height="28" rx="5" fill="#496785" stroke="#7e9eb8" strokeWidth="2" />}
        <text x="219" y={fixture ? 58 : 37} textAnchor="middle">{t(fixture ? loc('固定针板', 'Fixed pin plate') : loc('飞针移动方向 ↔', 'Probe travel ↔'))}</text>
        {NETS.map((net, i) => <g key={net}>
          <path d={`M${at(i)} 105 V175`} stroke="#d7ac69" strokeWidth="6" />
          <circle cx={at(i)} cy="105" r="10" fill="#e6bc78" stroke="#755836" strokeWidth="2" />
          <circle cx={at(i)} cy="175" r="7" fill="#e6bc78" />
          <text x={at(i)} y="207" textAnchor="middle">{net}</text>
        </g>)}
        {bridged && <path d={`M${at(0)} 175 V191 H${at(3)} V175`} fill="none" stroke="#ff9569" strokeWidth="5" strokeLinejoin="round" />}
        {fixture ? NETS.map((net, i) => {
          const active = scheduled && (i === pair.left || i === pair.right)
          return <g key={net} data-active={active} className="flow-probe">
            <path d={`M${at(i)} 66 V104`} stroke={active ? '#8de5ff' : '#8399ae'} strokeWidth="6" strokeLinecap="round" />
            {active && <circle cx={at(i)} cy="105" r="13" fill="none" stroke="#8de5ff" strokeWidth="2" />}
          </g>
        }) : [pair.left, pair.right].map((i, probe) => <g key={probe} data-active={scheduled} className="flow-probe flow-probe-moving"
          style={{ transform: `translate(${at(i)}px, ${scheduled ? 0 : -14}px)`, opacity: scheduled ? 1 : .45 }}>
          <path d="M0 59 V104" stroke="#8de5ff" strokeWidth="6" strokeLinecap="round" />
          {scheduled && <circle cy="105" r="13" fill="none" stroke="#8de5ff" strokeWidth="2" />}
        </g>)}
      </svg>
      <div className="flow-pair-selection" aria-live="polite">
        <p>{t(contact)}</p>
        <strong>{t(outcome)}</strong>
        <p>{t(result)}</p>
      </div>
    </Diagram>
  )
}
