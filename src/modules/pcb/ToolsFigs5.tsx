import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type FileId } from './data/pcbTools'
import { T, head } from './FlowFigs'
import { Hit } from '../prep/common'

const L = {
  aria: loc('Altium 工程文件关系图', 'How the Altium project files relate'),
  inBox: loc('虚线框里的文件都属于这个工程', 'The files in the dashed box belong to this project'),
  compile: loc('编译', 'compile'),
  sch: loc('原理图', 'schematic'),
  pcb: loc('电路板', 'board'),
  schlib: loc('符号', 'symbols'),
  pcblib: loc('封装', 'footprints'),
  intlib: loc('符号 + 封装', 'symbols + footprints'),
  outjob: loc('出图清单', 'output list'),
  outputs: loc('生成的文件', 'generated files'),
}

type Box = { id: FileId; x: number; y: number; w: number; ext: string; role: keyof typeof L }

const BW = 130
const BH = 40
const BOXES: Box[] = [
  { id: 'schlib', x: 10, y: 44, w: BW, ext: '.SchLib', role: 'schlib' },
  { id: 'sch', x: 170, y: 44, w: BW, ext: '.SchDoc', role: 'sch' },
  { id: 'pcblib', x: 10, y: 124, w: BW, ext: '.PcbLib', role: 'pcblib' },
  { id: 'pcb', x: 170, y: 124, w: BW, ext: '.PcbDoc', role: 'pcb' },
  { id: 'outjob', x: 330, y: 124, w: BW, ext: '.OutJob', role: 'outjob' },
  { id: 'intlib', x: 10, y: 214, w: BW, ext: '.IntLib', role: 'intlib' },
  { id: 'outputs', x: 330, y: 214, w: BW, ext: 'Project Outputs', role: 'outputs' },
]

export function ToolsMap({ file, onPick }: { file: FileId; onPick: (id: FileId) => void }) {
  const { t } = useLocale()
  const dim = 'var(--dim)'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 470 270" className="term-fig__svg" role="group" aria-label={t(L.aria)}>
        <rect width="470" height="270" rx="10" fill="var(--well)" />
        <rect x="4" y="30" width="462" height="236" rx="8" fill="none" stroke={dim} strokeDasharray="5 4" />
        <g fill="none" stroke={dim} strokeWidth="1.5">
          <path d="M140 64 H169 M140 144 H169 M300 144 H329" />
          <path d="M235 84 V123 M395 164 V213 M75 164 V213" />
        </g>
        {head(170, 64, 'right', dim)}
        {head(170, 144, 'right', dim)}
        {head(330, 144, 'right', dim)}
        {head(235, 124, 'down', dim)}
        {head(395, 214, 'down', dim)}
        {head(75, 214, 'down', dim)}
        <T x={242} y={108} anchor="start" size={10} mono color="var(--text-2)">ECO</T>
        <T x={82} y={194} anchor="start" size={10} color="var(--text-2)">{t(L.compile)}</T>
        <Hit label=".PrjPcb" active={file === 'prj'} onPick={() => onPick('prj')}>
          <rect x="10" y="4" width="110" height="24" rx="6" fill={file === 'prj' ? 'var(--gold-bg)' : 'var(--card)'} stroke={file === 'prj' ? 'var(--gold)' : 'var(--line)'} strokeWidth={file === 'prj' ? 2.5 : 1.2} />
          <T x={65} y={20} size={12} bold color="var(--text)">.PrjPcb</T>
        </Hit>
        <T x={130} y={20} anchor="start" size={10} color="var(--muted)">{t(L.inBox)}</T>
        {BOXES.map((b) => {
          const on = file === b.id
          return (
            <Hit key={b.id} label={b.ext} active={on} onPick={() => onPick(b.id)}>
              <rect x={b.x} y={b.y} width={b.w} height={BH} rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2.5 : 1.2} />
              <T x={b.x + b.w / 2} y={b.y + 17} size={12} bold color={on ? 'var(--gold)' : 'var(--text)'}>{b.ext}</T>
              <T x={b.x + b.w / 2} y={b.y + 32} size={10} color="var(--muted)">{t(L[b.role])}</T>
            </Hit>
          )
        })}
      </svg>
    </figure>
  )
}
