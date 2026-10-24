import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { GRADES, type GradeId, ROOM_C, VDUT_GRADE } from './relAutoModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const GREEN = '#3fb950'
const RED = '#f85149'

const FIG = {
  gradeAria: loc('四个温度等级的范围横条，虚线为所选产品的安装环境上限', 'Temperature range bars for the four grades, with a dashed line at the installed ambient maximum'),
  gradeCap: loc(
    '每条横条是一个等级的温度范围：下限都是 −40 °C，上限随等级数字变大而下降。虚线是安装环境上限：横条要伸到虚线右边才算覆盖，但也不必比需要的宽得多。',
    'Each bar is one grade’s range: all floors are −40 °C, and the ceiling falls as the grade number rises. The dashed line is the installed ambient maximum: a bar must reach past it to cover the need, but it need not be much wider.',
  ),
  needLegend: loc('安装环境上限（虚线）', 'Installed ambient max (dashed)'),
  chosenLegend: loc('所选等级', 'Chosen grade'),
  otherLegend: loc('其他等级', 'Other grades'),
  tempAria: loc('三温测试温度点与 Grade 1 温度范围的对照', 'Three-temperature test points against the Grade 1 temperature range'),
  tempCap: loc(
    '蓝色横条是 Grade 1 的范围（−40 ~ +125 °C）。低温点要落在左虚线的左边或线上，高温点要落在右虚线的右边或线上，两端才被覆盖；室温点固定 25 °C。',
    'The blue band is the Grade 1 range (−40 to +125 °C). The cold point must sit at or left of the left dashed line, and the hot point at or right of the right one, for both ends to be covered; the room point is fixed at 25 °C.',
  ),
  bandLegend: loc('Grade 1 范围', 'Grade 1 range'),
  coldLegend: loc('低温点', 'Cold point'),
  roomLegend: loc('室温点（固定 25 °C）', 'Room point (fixed at 25 °C)'),
  hotLegend: loc('高温点', 'Hot point'),
}

/** 等级图：每个等级一条横条，横条右端是上限；竖虚线是安装环境上限，所选等级用金色 */
const G_W = 480
const G_H = 180
const G_PL = 70
const G_PR = 40
const G_PT = 26
const ROW_H = 30
const G_PLOT_W = G_W - G_PL - G_PR
const AXIS_MIN = -40
const AXIS_MAX = 170
const AXIS_TICKS = [-40, 0, 40, 80, 120, 160]

const xOfGradeC = (c: number) => G_PL + ((c - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * G_PLOT_W

export function GradeFig({ need, grade }: { need: number; grade: GradeId }) {
  const { t } = useLocale()
  const axisY = G_PT + GRADES.length * ROW_H + 4
  return (
    <figure className="term-fig rel-fig">
      <svg viewBox={`0 0 ${G_W} ${G_H}`} role="img" aria-label={t(FIG.gradeAria)} className="rel-svg">
        <rect x={0} y={0} width={G_W} height={G_H} rx={10} fill={BG} />
        <text x={xOfGradeC(need)} y={G_PT - 10} textAnchor="middle" fill={RED} fontSize={11}>{`${need} °C`}</text>
        {GRADES.map((row, i) => {
          const y = G_PT + i * ROW_H
          const on = row.grade === grade
          const x0 = xOfGradeC(row.minC)
          const x1 = xOfGradeC(row.maxC)
          return (
            <g key={row.grade}>
              <text x={G_PL - 8} y={y + 17} textAnchor="end" fill={on ? TEXT : MUTED} fontSize={11}>{`Grade ${row.grade}`}</text>
              <rect x={x0} y={y + 5} width={x1 - x0} height={16} rx={3} fill={on ? GOLD : BLUE} opacity={on ? 1 : 0.45} />
              <text x={x1 + 6} y={y + 17} fill={TEXT} fontSize={11}>{`${row.maxC} °C`}</text>
            </g>
          )
        })}
        <line x1={xOfGradeC(need)} y1={G_PT - 4} x2={xOfGradeC(need)} y2={axisY} stroke={RED} strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={G_PL} y1={axisY} x2={G_W - G_PR} y2={axisY} stroke={EDGE} />
        {AXIS_TICKS.map((c) => (
          <g key={c}>
            <line x1={xOfGradeC(c)} y1={axisY} x2={xOfGradeC(c)} y2={axisY + 4} stroke={EDGE} />
            <text x={xOfGradeC(c)} y={axisY + 16} textAnchor="middle" fill={MUTED} fontSize={11}>{c}</text>
          </g>
        ))}
      </svg>
      <div className="rel-legend" aria-hidden="true">
        <span><i style={{ background: GOLD }} />{t(FIG.chosenLegend)}</span>
        <span><i style={{ background: BLUE, opacity: 0.45 }} />{t(FIG.otherLegend)}</span>
        <span><i style={{ background: RED }} />{t(FIG.needLegend)}</span>
      </div>
      <figcaption>{t(FIG.gradeCap)}</figcaption>
    </figure>
  )
}

/** 三温图：一条温度轴，上方是 Grade 1 的范围横条，两条虚线分别是范围的下限和上限；三个圆点是低温、室温、高温点 */
const T_W = 480
const T_H = 124
const T_PL = 40
const T_PR = 20
const T_PLOT_W = T_W - T_PL - T_PR
const T_MIN = -60
const T_MAX = 160
const T_TICKS = [-60, -40, 0, 25, 50, 100, 125, 150]
const BAND_Y = 52
const AXIS_Y = 96

const xOfT = (c: number) => T_PL + ((c - T_MIN) / (T_MAX - T_MIN)) * T_PLOT_W

export function TempFig({ lowC, highC }: { lowC: number; highC: number }) {
  const { t } = useLocale()
  const g1 = GRADES[VDUT_GRADE]
  return (
    <figure className="term-fig rel-fig">
      <svg viewBox={`0 0 ${T_W} ${T_H}`} role="img" aria-label={t(FIG.tempAria)} className="rel-svg">
        <rect x={0} y={0} width={T_W} height={T_H} rx={10} fill={BG} />
        <rect x={xOfT(g1.minC)} y={BAND_Y - 8} width={xOfT(g1.maxC) - xOfT(g1.minC)} height={16} rx={3} fill={BLUE} opacity={0.4} />
        <line x1={xOfT(g1.minC)} y1={20} x2={xOfT(g1.minC)} y2={AXIS_Y} stroke={BLUE} strokeDasharray="4 3" />
        <line x1={xOfT(g1.maxC)} y1={20} x2={xOfT(g1.maxC)} y2={AXIS_Y} stroke={BLUE} strokeDasharray="4 3" />
        <line x1={T_PL} y1={AXIS_Y} x2={T_W - T_PR} y2={AXIS_Y} stroke={EDGE} />
        {T_TICKS.map((c) => (
          <g key={c}>
            <line x1={xOfT(c)} y1={AXIS_Y} x2={xOfT(c)} y2={AXIS_Y + 4} stroke={EDGE} />
            <text x={xOfT(c)} y={AXIS_Y + 16} textAnchor="middle" fill={MUTED} fontSize={11}>{c}</text>
          </g>
        ))}
        <circle cx={xOfT(lowC)} cy={BAND_Y} r={6} fill={BLUE} stroke={TEXT} strokeWidth={1} />
        <circle cx={xOfT(ROOM_C)} cy={BAND_Y} r={6} fill={GREEN} stroke={TEXT} strokeWidth={1} />
        <circle cx={xOfT(highC)} cy={BAND_Y} r={6} fill={GOLD} stroke={TEXT} strokeWidth={1} />
      </svg>
      <div className="rel-legend" aria-hidden="true">
        <span><i style={{ background: BLUE, opacity: 0.4 }} />{t(FIG.bandLegend)}</span>
        <span><i style={{ background: BLUE }} />{t(FIG.coldLegend)}</span>
        <span><i style={{ background: GREEN }} />{t(FIG.roomLegend)}</span>
        <span><i style={{ background: GOLD }} />{t(FIG.hotLegend)}</span>
      </div>
      <figcaption>{t(FIG.tempCap)}</figcaption>
    </figure>
  )
}
