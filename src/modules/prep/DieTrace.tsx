import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { DIES, type Die } from './SiliconFigs'
import { type DieSizeId } from './data/silicon'

const TRACE_KEY = 'ic-fundamental.prep.die-trace'
const WAFERS = { small: 'W03', large: 'W04' }
let lastSelection: { size: DieSizeId; id: string } | undefined

export function rememberDie(size: DieSizeId, die: Die) {
  lastSelection = { size, id: die.id }
  try {
    sessionStorage.setItem(TRACE_KEY, JSON.stringify(lastSelection))
  } catch {
    // The in-memory selection still works when browser storage is disabled.
  }
}

export function getDieTrace() {
  let selected = lastSelection
  if (!selected) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(TRACE_KEY) ?? 'null')
      if ((stored?.size === 'small' || stored?.size === 'large') && typeof stored.id === 'string') selected = stored
    } catch {
      // A missing or malformed record uses the sample die.
    }
  }
  const size = selected?.size ?? 'small'
  const wafer = DIES[size].dies
  const die = wafer.find(({ id }) => id === selected?.id)
  return die ? { size, die, sample: false } : {
    size: 'small' as const,
    die: DIES.small.dies.find((item) => item.status === 'good')!,
    sample: true,
  }
}

export function dieTraceId(size: DieSizeId, die: Die) {
  return `L07/${WAFERS[size]}/X${die.col}/Y${die.row}`
}

export function DieTrace({ size, die, sample, step }: ReturnType<typeof getDieTrace> & { step: number }) {
  const { t } = useLocale()
  const pass = die.status === 'good'
  const id = dieTraceId(size, die)
  const phase = step === 0 ? 'wafer' : step === 1 ? 'tape' : step < 7 ? 'package' : 'ft'
  const stages = [
    { id: 'wafer', title: loc('CP 晶圆图', 'CP wafer map'), value: pass ? 'PASS' : 'FAIL' },
    { id: 'tape', title: loc('划片胶膜', 'Dicing tape'), value: `X${die.col} / Y${die.row}` },
    { id: 'package', title: loc('封装追溯号', 'Package trace ID'), value: `PK-${WAFERS[size]}-${die.col}-${die.row}` },
    { id: 'ft', title: loc('成品测试', 'Final test'), value: 'PASS · Bin 1' },
  ]
  return (
    <figure className="term-fig">
      <figcaption>
        {t(sample ? loc('默认教学样片', 'Default demonstration die') : loc('从上一课选中的裸片', 'Die selected in the previous lesson'))}
        {' · '}<strong data-trace-id>{id}</strong>
      </figcaption>
      <ol className="prep-role-chain prep-die-trace" data-phase={phase}>
        {stages.map((item, index) => {
          const retained = pass || index < 2
          const current = retained && item.id === phase
          return <li key={item.id} data-cover={current ? 2 : 0} aria-current={current ? 'step' : undefined}>
            <span className="prep-die-trace__icon" data-object={item.id} aria-hidden="true"><i /></span>
            <strong>{t(item.title)}</strong>
            <span>{retained ? item.value : t(loc('未进入', 'Skipped'))}</span>
          </li>
        })}
      </ol>
      <p aria-live="polite">
        {t(pass ? loc('封装追溯号在生产记录中关联原晶圆坐标。本例 FT 通过，记录为 Bin 1。', 'The package ID links to its wafer coordinates in the production record. This example passes final test in Bin 1.')
          : loc('CP 判定失败。划片后仍可在胶膜上定位它，取片时会跳过，因此没有封装追溯号和 FT 记录。', 'This die failed CP. It can still be located on the tape after dicing, but pick-and-place skips it, leaving no package ID or final-test record.'))}
      </p>
    </figure>
  )
}
