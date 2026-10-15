import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type WalkStep, type StepId, WS } from './data/pcbToolsSteps'
import { T } from './FlowFigs'
import { AnnotateDialog, EcoDialog, MessagesPanel, PartsTable, SchSheet } from './ToolsFigs2'
import { BoardView, LayerList, SidePanel, StackPanel } from './ToolsFigs3'
import { DrcPanel, OutJobPanel } from './ToolsFigs4'

const MENUS = ['File', 'Edit', 'View', 'Project', 'Place', 'Design', 'Tools', 'Reports', 'Window', 'Help']

const TREE_ROWS = [
  { name: 'LED_Sensor.PrjPcb', depth: 0 },
  { name: 'LED_Sensor.SchDoc', depth: 1 },
  { name: 'LED_Sensor.PcbDoc', depth: 1 },
  { name: 'LED_Sensor.SchLib', depth: 1 },
  { name: 'LED_Sensor.PcbLib', depth: 1 },
  { name: 'LED_Sensor.OutJob', depth: 1 },
]

// 每一步当前打开的文档在 Projects 面板里的行号
const ACTIVE_DOC: Record<StepId, number> = {
  sch: 1,
  ann: 1,
  erc: 1,
  eco: 1,
  stack: 2,
  place: 2,
  route: 2,
  pour: 2,
  drc: 2,
  out: 5,
}

function MenuBar({ active }: { active: string }) {
  let x = 10
  return (
    <g>
      <rect x="0" y="22" width="760" height="24" fill="var(--panel-2)" />
      {MENUS.map((m) => {
        const w = m.length * 6.4 + 18
        const at = x
        x += w
        const on = m === active
        return (
          <g key={m}>
            {on ? <rect x={at} y="25" width={w - 4} height="18" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" strokeWidth="1.6" /> : null}
            <T x={at + (w - 4) / 2} y={38} size={11} bold={on} color={on ? 'var(--gold)' : 'var(--text-2)'}>{m}</T>
          </g>
        )
      })}
    </g>
  )
}

function ProjectsPanel({ active }: { active: number }) {
  return (
    <g>
      <rect x="6" y="50" width="164" height="304" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={14} y={66} anchor="start" bold color="var(--gold)" size={11}>Projects</T>
      {TREE_ROWS.map((r, i) => {
        const y = 86 + i * 20
        const on = i === active
        return (
          <g key={r.name}>
            {on ? <rect x="10" y={y - 13} width="156" height="18" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" /> : null}
            <T x={16 + r.depth * 12} y={y} anchor="start" size={10} mono color={on ? 'var(--gold)' : 'var(--text-2)'} bold={on}>{r.name}</T>
          </g>
        )
      })}
    </g>
  )
}

function Canvas({ id }: { id: StepId }): ReactNode {
  if (id === 'sch') {
    return (
      <>
        <SchSheet annotated={false} />
        <PartsTable />
      </>
    )
  }
  if (id === 'ann') {
    return (
      <>
        <SchSheet annotated />
        <AnnotateDialog />
      </>
    )
  }
  if (id === 'erc') {
    return (
      <>
        <SchSheet annotated />
        <MessagesPanel />
      </>
    )
  }
  if (id === 'eco') {
    return <EcoDialog />
  }
  if (id === 'stack') {
    return (
      <>
        <BoardView stage="shape" />
        <StackPanel />
      </>
    )
  }
  if (id === 'place') {
    return (
      <>
        <BoardView stage="place" />
        <SidePanel title="Layers">
          <LayerList active="Top Layer" lines={['Designator: R1', 'Comment: 330R', 'Footprint: 0603']} />
        </SidePanel>
      </>
    )
  }
  if (id === 'route') {
    return (
      <>
        <BoardView stage="route" />
        <SidePanel title="Layers">
          <LayerList active="Top Layer" lines={['Width: 0.25 mm (VBUS 0.5 mm)', 'Via: 0.4 mm hole, 0.8 mm', 'Mode: Walkaround']} />
        </SidePanel>
      </>
    )
  }
  if (id === 'pour') {
    return (
      <>
        <BoardView stage="pour" />
        <SidePanel title="Layers">
          <LayerList active="Bottom Layer" lines={['Net: GND', 'Layer: Bottom Layer', 'Connect: Relief Connect']} />
        </SidePanel>
      </>
    )
  }
  if (id === 'drc') {
    return (
      <>
        <BoardView stage="done" />
        <DrcPanel />
      </>
    )
  }
  return <OutJobPanel />
}

export function WalkFig({ step, index }: { step: WalkStep; index: number }) {
  const { t } = useLocale()
  const top = step.menu.split(' » ')[0]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 360" className="term-fig__svg" role="img" aria-label={`${t(WS.stepsAria)}: ${index + 1}. ${t(step.title)}`}>
        <rect width="760" height="360" rx="10" fill="var(--well)" />
        <rect x="0" y="0" width="760" height="22" rx="10" fill="var(--card)" />
        <T x={380} y={15} size={11} color="var(--muted)">LED_Sensor.PrjPcb - Altium Designer</T>
        <MenuBar active={top} />
        <ProjectsPanel active={ACTIVE_DOC[step.id]} />
        <g transform="translate(176 52)">
          <Canvas id={step.id} />
        </g>
      </svg>
      <figcaption>{t(WS.mockCap)}</figcaption>
    </figure>
  )
}
