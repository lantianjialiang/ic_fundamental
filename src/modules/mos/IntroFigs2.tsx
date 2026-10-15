import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { type ChanMode, MODES, type MosType, PKGS, type PkgId, type SymStyle, TYPES } from './data/mosIntro'
import { SYM_FIG } from './data/mosIntroFig'
import { MosSymbol, T } from './IntroFigs'

const PIN_COL: Record<string, string> = { G: 'var(--blue)', D: 'var(--gold)', S: 'var(--green)' }
const CX = 570
const METAL = 'var(--muted)'

/** SOT-23 俯视：1、2 脚在下边左右，3 脚单独在上边中间；体约 2.9 × 1.3 mm，按 60 px/mm 画 */
function Sot23({ pins }: { pins: [string, string, string] }) {
  const lead = (x: number, y: number) => <rect x={x - 12} y={y} width="24" height="27" fill={METAL} />
  const pinLabel = (x: number, y: number, n: number, name: string) => (
    <T x={x} y={y} size={14} bold color={PIN_COL[name]}>
      {`${n} ${name}`}
    </T>
  )
  return (
    <g>
      {lead(CX - 57, 193)}
      {lead(CX + 57, 193)}
      {lead(CX, 88)}
      <rect x={CX - 87} y="115" width="174" height="78" rx="4" fill="var(--fig-box-2)" stroke="var(--line-2)" strokeWidth="1.5" />
      <T x={CX} y={158} size={11} color="var(--muted)">
        2.9 × 1.3 mm
      </T>
      {pinLabel(CX - 57, 242, 1, pins[0])}
      {pinLabel(CX + 57, 242, 2, pins[1])}
      {pinLabel(CX, 80, 3, pins[2])}
    </g>
  )
}

/** TO-220：印字面朝向读者、引脚朝下；上面带孔的金属片接中间脚（D）。引脚长度缩短示意 */
function To220({ pins, part }: { pins: [string, string, string]; part: string | null }) {
  const { t } = useLocale()
  const xs = [CX - 30, CX, CX + 30]
  return (
    <g>
      {xs.map((x) => (
        <rect key={x} x={x - 3} y="215" width="6" height="40" fill={METAL} />
      ))}
      <path d={`M${CX - 60} 130 V76 Q${CX - 60} 68 ${CX - 52} 68 H${CX + 52} Q${CX + 60} 68 ${CX + 60} 76 V130 Z`} fill="var(--line-2)" stroke={METAL} strokeWidth="1.5" />
      <circle cx={CX} cy="94" r="12" fill="var(--card)" stroke={METAL} strokeWidth="1.5" />
      <rect x={CX - 60} y="130" width="120" height="85" rx="3" fill="var(--fig-box-2)" stroke="var(--line-2)" strokeWidth="1.5" />
      {part ? (
        <T x={CX} y={176} size={12} mono color="var(--text)">
          {part}
        </T>
      ) : null}
      <T x={CX + 72} y={98} anchor="start" size={11} bold color={PIN_COL.D}>
        {t(SYM_FIG.tab)}
      </T>
      {xs.map((x, k) => (
        <T key={`l${x}`} x={x} y={276} size={13} bold color={PIN_COL[pins[k]]}>
          {`${k + 1} ${pins[k]}`}
        </T>
      ))}
    </g>
  )
}

type Props = { type: MosType; style: SymStyle; mode: ChanMode; pkg: PkgId; onToggle: () => void }

export function SymPkgFig({ type, style, mode, pkg, onToggle }: Props) {
  const { t } = useLocale()
  const typeItem = TYPES.find((x) => x.id === type) ?? TYPES[0]
  const modeItem = MODES.find((x) => x.id === mode) ?? MODES[0]
  const pkgItem = PKGS.find((x) => x.id === pkg) ?? PKGS[0]
  const part = mode === 'enh' ? pkgItem.parts[type] : null
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 360" className="term-fig__svg" role="img" aria-label={t(SYM_FIG.cap)}>
        <rect width="760" height="360" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="360" height="340" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="390" y="10" width="360" height="340" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={26} y={32} anchor="start" size={12} bold>
          {t(SYM_FIG.symTitle)}
        </T>
        <Hit label={t(SYM_FIG.symAria)} active={type === 'p'} onPick={onToggle}>
          <rect x="90" y="56" width="240" height="214" rx="8" fill="transparent" />
          <g transform="translate(120 96) scale(1.2)">
            <MosSymbol type={type} style={style} mode={mode} />
          </g>
        </Hit>
        <T x={190} y={292} size={13} bold color="var(--gold)">
          {`${typeItem.label} · ${t(modeItem.label)}`}
        </T>
        <T x={190} y={312} size={11} color="var(--muted)">
          {t(style === 'three' ? SYM_FIG.tagThree : SYM_FIG.tagFour)}
        </T>
        <T x={190} y={338} size={11} color="var(--muted)">
          {t(SYM_FIG.hint)}
        </T>
        <T x={406} y={32} anchor="start" size={12} bold>
          {`${pkgItem.name} · ${t(SYM_FIG.pkgTitle)}`}
        </T>
        <T x={406} y={52} anchor="start" size={11} color="var(--muted)">
          {t(pkgItem.view)}
        </T>
        <Hit label={t(SYM_FIG.pkgAria)} active={type === 'p'} onPick={onToggle}>
          <rect x="400" y="60" width="340" height="210" rx="8" fill="transparent" />
          {pkg === 'sot23' ? <Sot23 pins={pkgItem.pins} /> : <To220 pins={pkgItem.pins} part={part} />}
        </Hit>
        <T x={CX} y={296} size={13} bold color="var(--gold)">
          {part ?? t(SYM_FIG.rare)}
        </T>
        <T x={CX} y={316} size={11} color="var(--muted)">
          {t(SYM_FIG.sameBody)}
        </T>
        <T x={CX} y={338} size={11} color="var(--muted)">
          {t(SYM_FIG.typical)}
        </T>
      </svg>
      <figcaption>{t(SYM_FIG.cap)}</figcaption>
    </figure>
  )
}
