import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { T } from './FlowFigs'
import { SidePanel } from './ToolsFigs3'

const L = {
  target: loc('目标：出图前全部为 0', 'Target: all 0 before outputs'),
  fabGets: loc('板厂拿：Gerber 和钻孔', 'Board fab gets: Gerber and drill'),
  asmGets: loc('贴片厂拿：BOM 和坐标', 'Assembler gets: BOM and pick-and-place'),
}

const DRC_ROWS = [
  'Clearance Constraint',
  'Short-Circuit Constraint',
  'Un-Routed Net Constraint',
  'Width Constraint',
  'Hole Size Constraint',
  'Minimum Solder Mask Sliver',
  'Silk To Solder Mask Clearance',
]

export function DrcPanel() {
  const { t } = useLocale()
  return (
    <SidePanel title="Design Rule Verification">
      {DRC_ROWS.map((name, i) => (
        <g key={name}>
          <circle cx="346" cy={42 + i * 20} r="4" fill="var(--green)" />
          <T x={358} y={46 + i * 20} anchor="start" size={10} mono>{name}</T>
          <T x={560} y={46 + i * 20} anchor="end" size={10} mono color="var(--green)">0</T>
        </g>
      ))}
      <T x={340} y={206} anchor="start" size={11} bold color="var(--green)">Rule Violations: 0</T>
      <T x={340} y={224} anchor="start" size={11} bold color="var(--text-2)">Warnings: 0</T>
      <T x={340} y={250} anchor="start" size={10} color="var(--gold)">{t(L.target)}</T>
    </SidePanel>
  )
}

const OUT_ROWS = [
  { name: 'Fabrication Outputs', group: true },
  { name: 'Gerber Files', src: 'LED_Sensor.PcbDoc' },
  { name: 'NC Drill Files', src: 'LED_Sensor.PcbDoc' },
  { name: 'Assembly Outputs', group: true },
  { name: 'Generates pick and place files', src: 'LED_Sensor.PcbDoc' },
  { name: 'Report Outputs', group: true },
  { name: 'Bill of Materials', src: 'LED_Sensor.PrjPcb' },
]

const FAB_CHIPS = ['.GTL', '.GBL', '.GTS', '.GBS', '.GTO', '.GBO', '.GTP', '.GBP', '.GM1', '.TXT']
const ASM_CHIPS = ['BOM.xlsx', 'Pick Place.csv']

function Chips({ items, y }: { items: string[]; y: number }) {
  let x = 14
  return (
    <g>
      {items.map((label) => {
        const w = label.length * 6 + 16
        const at = x
        x += w + 6
        return (
          <g key={label}>
            <rect x={at} y={y} width={w} height="20" rx="4" fill="var(--card)" stroke="var(--line)" />
            <T x={at + w / 2} y={y + 14} size={10} mono>{label}</T>
          </g>
        )
      })}
    </g>
  )
}

export function OutJobPanel() {
  const { t } = useLocale()
  return (
    <g>
      <rect x="6" y="4" width="566" height="292" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={14} y={26} anchor="start" bold color="var(--gold)" size={11}>LED_Sensor.OutJob</T>
      <rect x="432" y="10" width="130" height="22" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" strokeWidth="1.8" />
      <T x={497} y={25} size={10} bold color="var(--gold)">Generate Content</T>
      <T x={14} y={50} anchor="start" size={10} mono color="var(--muted)">Outputs</T>
      <T x={230} y={50} anchor="start" size={10} mono color="var(--muted)">Data Source</T>
      <T x={400} y={50} anchor="start" size={10} mono color="var(--muted)">Output Container</T>
      {OUT_ROWS.map((r, i) => {
        const y = 68 + i * 17
        return r.group ? (
          <T key={r.name} x={14} y={y} anchor="start" size={10} bold color="var(--text)">{r.name}</T>
        ) : (
          <g key={r.name}>
            <T x={26} y={y} anchor="start" size={10}>{r.name}</T>
            <T x={230} y={y} anchor="start" size={10} mono>{r.src ?? ''}</T>
            <T x={400} y={y} anchor="start" size={10} mono>Folder Structure</T>
          </g>
        )
      })}
      <T x={14} y={202} anchor="start" size={10} bold color="var(--green)">{t(L.fabGets)}</T>
      <Chips items={FAB_CHIPS} y={210} />
      <T x={14} y={254} anchor="start" size={10} bold color="var(--green)">{t(L.asmGets)}</T>
      <Chips items={ASM_CHIPS} y={262} />
    </g>
  )
}
