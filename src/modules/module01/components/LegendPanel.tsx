import { type TestFlow } from '../data/layout'
import { ballName, buildSignalPath } from '../data/paths'

type LegendPanelProps = {
  flow: TestFlow
  selectedChannel: number | null
  onSelect: (channel: number | null) => void
}

const FT_LAYERS = ['DUT（封装器件）', 'Socket', 'Load Board', 'ATE']
const CP_LAYERS = ['ATE', 'Probe Card', 'Probe Needles', 'Wafer / Die']

export function LegendPanel({ flow, selectedChannel, onSelect }: LegendPanelProps) {
  const layers = flow === 'FT' ? FT_LAYERS : CP_LAYERS
  const path =
    selectedChannel !== null ? buildSignalPath(flow, selectedChannel, 1) : null

  return (
    <aside className="legend">
      <h2>图例</h2>
      <p className="legend__hint">
        名称在侧栏。Assemble / Explode 都可点通道或铜皮，高亮整条路径。PCB：Top 金 / Inner 红铜 / Bottom 灰蓝，竖柱是 Via。
      </p>
      <ol className="legend__layers">
        {layers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ol>

      <h2>PCB 层</h2>
      <ul className="legend__layers">
        <li>Top（金）：DUT / Socket 侧</li>
        <li>Inner（红铜）：信号走线</li>
        <li>Bottom（灰蓝）：ATE 或 Needle 侧</li>
        <li>Via（竖柱）：层间过孔</li>
      </ul>

      <h2>信号路径</h2>
      {path ? (
        <div className="legend__path">
          <p className="legend__path-title">
            CH{path.channel + 1}
            {flow === 'FT' ? ` → ${ballName(path.channel)}` : ' → Die pad'}
          </p>
          <ol>
            {path.hopNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ol>
          <button type="button" className="lab__btn" onClick={() => onSelect(null)}>
            清除高亮
          </button>
        </div>
      ) : (
        <p className="legend__hint">尚未选择通道。</p>
      )}
    </aside>
  )
}
