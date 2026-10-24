import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 PwrKelvinFig 保持一致） */
const BG = '#0d1117'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'

const FIG = {
  aria: loc(
    '栅极驱动示意：恒流源 Ig 从栅极 G 注入电荷，Cgs 接在 G 与源极 S 之间，Cgd 接在 G 与漏极 D 之间（米勒电容），DUT 的漏极经 Vdd 接电源',
    'Gate-drive schematic: constant-current source Ig injects charge into gate G, Cgs sits between G and source S, Cgd sits between G and drain D (the Miller capacitance), and the drain is fed from Vdd',
  ),
  cap: loc(
    '教学示意：Ig 同时给 Cgs 与 Cgd 充电。Cgd 接在栅极与漏极之间，漏极电压下降时它要吸走大量电荷，这就是米勒平台的来源。',
    'Teaching illustration: Ig charges both Cgs and Cgd. Cgd sits between gate and drain, so when the drain voltage falls it absorbs a large amount of charge; this is the source of the Miller plateau.',
  ),
  ig: loc('恒流 Ig', 'Constant Ig'),
  cgs: loc('Cgs', 'Cgs'),
  cgd: loc('Cgd', 'Cgd'),
  vdd: loc('Vdd', 'Vdd'),
  vdsNote: loc('平台期间 Vds 从 Vdd 降下来', 'Vds falls from Vdd during the plateau'),
  gate: loc('G', 'G'),
  drain: loc('D', 'D'),
  source: loc('S', 'S'),
  ground: loc('源极接地（0 V）', 'Source at ground (0 V)'),
}

/** 栅极驱动示意图：恒流源在左，DUT 在中间，Vdd 在右；Cgd 跨在栅漏之间 */
export function GateDiagram() {
  const { t } = useLocale()
  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox="0 0 520 210" role="img" aria-label={t(FIG.aria)} className="pwr-svg">
        <rect x={0} y={0} width={520} height={210} rx={10} fill={BG} />

        {/* 恒流源 Ig：左侧，正极接栅极，负极接源极（地） */}
        <circle cx={60} cy={110} r={20} fill="none" stroke={GOLD} strokeWidth={1.8} />
        <text x={60} y={115} textAnchor="middle" fill={TEXT} fontSize={12}>
          Ig
        </text>
        <text x={60} y={62} textAnchor="middle" fill={MUTED} fontSize={11}>
          {t(FIG.ig)}
        </text>
        <line x1={80} y1={110} x2={200} y2={110} stroke={GOLD} strokeWidth={1.8} />
        <line x1={60} y1={130} x2={60} y2={190} stroke={EDGE} strokeWidth={1.5} />

        {/* 源极总线（地，0 V） */}
        <line x1={60} y1={190} x2={470} y2={190} stroke={EDGE} strokeWidth={1.5} />
        <text x={300} y={206} textAnchor="middle" fill={MUTED} fontSize={10}>
          {t(FIG.ground)}
        </text>

        {/* 栅极节点与 Cgs：G 到源极之间 */}
        <circle cx={200} cy={110} r={3} fill={TEXT} />
        <text x={196} y={102} textAnchor="end" fill={TEXT} fontSize={11}>
          {t(FIG.gate)}
        </text>
        <line x1={200} y1={110} x2={200} y2={134} stroke={EDGE} strokeWidth={1.5} />
        <line x1={188} y1={134} x2={212} y2={134} stroke={TEXT} strokeWidth={2} />
        <line x1={188} y1={142} x2={212} y2={142} stroke={TEXT} strokeWidth={2} />
        <line x1={200} y1={142} x2={200} y2={190} stroke={EDGE} strokeWidth={1.5} />
        <text x={180} y={142} textAnchor="end" fill={TEXT} fontSize={11}>
          {t(FIG.cgs)}
        </text>

        {/* Cgd：从栅极节点向上跨到漏极轨 */}
        <circle cx={250} cy={110} r={3} fill={TEXT} />
        <line x1={250} y1={110} x2={250} y2={84} stroke={EDGE} strokeWidth={1.5} />
        <line x1={240} y1={84} x2={260} y2={84} stroke={TEXT} strokeWidth={2} />
        <line x1={240} y1={76} x2={260} y2={76} stroke={TEXT} strokeWidth={2} />
        <line x1={250} y1={76} x2={250} y2={40} stroke={EDGE} strokeWidth={1.5} />
        <text x={232} y={84} textAnchor="end" fill={MUTED} fontSize={11}>
          {t(FIG.cgd)}
        </text>

        {/* 漏极轨与 Vdd 源 */}
        <line x1={250} y1={40} x2={470} y2={40} stroke={EDGE} strokeWidth={1.5} />
        <line x1={470} y1={40} x2={470} y2={97} stroke={EDGE} strokeWidth={1.5} />
        <circle cx={470} cy={115} r={18} fill="none" stroke={GOLD} strokeWidth={1.8} />
        <text x={470} y={119} textAnchor="middle" fill={TEXT} fontSize={10}>
          {t(FIG.vdd)}
        </text>
        <line x1={470} y1={133} x2={470} y2={190} stroke={EDGE} strokeWidth={1.5} />
        <text x={300} y={28} textAnchor="middle" fill={MUTED} fontSize={11}>
          {t(FIG.vdsNote)}
        </text>

        {/* 功率 MOSFET 符号：栅板在左，沟道在右，漏极在上，源极在下 */}
        <line x1={250} y1={110} x2={328} y2={110} stroke={TEXT} strokeWidth={1.5} />
        <line x1={328} y1={78} x2={328} y2={142} stroke={TEXT} strokeWidth={2} />
        <line x1={340} y1={70} x2={340} y2={150} stroke={TEXT} strokeWidth={2} />
        <line x1={340} y1={40} x2={340} y2={70} stroke={EDGE} strokeWidth={1.5} />
        <line x1={340} y1={150} x2={340} y2={190} stroke={EDGE} strokeWidth={1.5} />
        <text x={346} y={56} textAnchor="start" fill={TEXT} fontSize={11}>
          {t(FIG.drain)}
        </text>
        <text x={346} y={172} textAnchor="start" fill={TEXT} fontSize={11}>
          {t(FIG.source)}
        </text>
      </svg>
      <figcaption className="pwr-note">{t(FIG.cap)}</figcaption>
    </figure>
  )
}
