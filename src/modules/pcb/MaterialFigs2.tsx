import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { COLOR } from './FabFigs'
import { S } from './data/pcbMaterial'
import { BARREL_PPM, FR4_PARTS, GRADES, REFLOW_PEAK, T0, zExpandPpm, type Fr4PartId, type Grade } from './data/pcbMaterialFr4'

const L = {
  topView: loc('玻纤布俯视', 'Glass cloth, top view'),
  section: loc('板子横截面', 'Board cross-section'),
  glass: loc('玻纤布', 'Glass cloth'),
  resin: loc('环氧树脂', 'Epoxy resin'),
  copper: loc('覆铜箔', 'Copper foil'),
  axisY: loc('Z 向累计膨胀（%）', 'Cumulative Z-axis expansion (%)'),
  axisX: loc('温度（°C）', 'Temperature (°C)'),
  reflow: loc('无铅回流峰值 245 °C', 'Lead-free reflow peak 245 °C'),
  glassy: loc('玻璃态', 'Glassy'),
  rubbery: loc('橡胶态', 'Rubbery'),
}

const WARP = '#7f9bb8'
const WEFT = '#a9bdd0'
const COLS = 14
const ROWS = 9
const P = 20
const BW = 14
const LX = 20
const LY = 36
const RX = 340
const RW = 300
const CU_H = 14
const RES_Y = LY + CU_H
const RES_H = 180 - 2 * CU_H
const PLIES = [92, 126, 160]

function cloth(): ReactNode[] {
  const out: ReactNode[] = []
  for (let i = 0; i < COLS; i++) {
    out.push(<rect key={`wa${i}`} x={LX + i * P + 3} y={LY} width={BW} height={ROWS * P} fill={WARP} />)
  }
  for (let j = 0; j < ROWS; j++) {
    out.push(<rect key={`we${j}`} x={LX} y={LY + j * P + 3} width={COLS * P} height={BW} fill={WEFT} />)
  }
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      if ((i + j) % 2 === 0) {
        out.push(<rect key={`ov${i}-${j}`} x={LX + i * P + 3} y={LY + j * P + 3} width={BW} height={BW} fill={WARP} stroke="#5d7893" strokeWidth="0.6" />)
      }
    }
  }
  return out
}

/** 一层玻纤布的横截面：经纱起伏，纬纱是圆截面，交替在经纱上下 */
function ply(cy: number): ReactNode {
  const pts: string[] = []
  for (let x = RX; x <= RX + RW; x += 2) {
    pts.push(`${x},${(cy - 7 * Math.cos((Math.PI * (x - RX - 11)) / 22)).toFixed(1)}`)
  }
  const dots: ReactNode[] = []
  for (let x = RX + 11; x < RX + RW - 6; x += 22) {
    dots.push(<ellipse key={x} cx={x} cy={cy} rx="7" ry="6" fill={WEFT} stroke="#5d7893" strokeWidth="0.6" />)
  }
  return (
    <g key={cy}>
      {dots}
      <polyline points={pts.join(' ')} fill="none" stroke={WARP} strokeWidth="6" strokeLinejoin="round" />
    </g>
  )
}

/** 铜箔朝树脂的粗糙面：一排小牙齿咬进树脂 */
function teeth(top: boolean): string {
  const edge = top ? RES_Y : RES_Y + RES_H
  const far = top ? LY : LY + 180
  const dir = top ? 5 : -5
  const pts = [`${RX},${far}`, `${RX + RW},${far}`, `${RX + RW},${edge}`]
  for (let x = RX + RW - 5; x > RX; x -= 10) {
    pts.push(`${x},${edge + dir}`, `${x - 5},${edge}`)
  }
  return pts.join(' ')
}

export function Fr4Fig({ active, onPick }: { active: Fr4PartId; onPick: (id: Fr4PartId) => void }) {
  const { t } = useLocale()
  const name = (id: Fr4PartId) => t((FR4_PARTS.find((p) => p.id === id) ?? FR4_PARTS[0]).name)
  const part = (id: Fr4PartId, children: ReactNode) => (
    <Hit label={name(id)} active={active === id} onPick={() => onPick(id)}>
      <g opacity={active === id ? 1 : 0.6}>{children}</g>
    </Hit>
  )
  const tag = (x: number, y: number, tx: number, ty: number, text: string) => (
    <g pointerEvents="none">
      <line x1={x} y1={y} x2={tx - 4} y2={ty - 3} stroke="var(--text-2)" strokeWidth="1" />
      <circle cx={x} cy={y} r="2.5" fill="var(--text)" />
      <text x={tx} y={ty} fill="var(--text-2)" fontSize="11">
        {text}
      </text>
    </g>
  )
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 274" className="term-fig__svg" role="group" aria-label={t(S.fr4Cap)}>
        <rect width="760" height="274" rx="10" fill="var(--well)" />
        <text x={LX} y="24" fill="var(--muted)" fontSize="11">
          {t(L.topView)}
        </text>
        <text x={RX} y="24" fill="var(--muted)" fontSize="11">
          {t(L.section)}
        </text>
        {part(
          'resin',
          <>
            <rect x={LX} y={LY} width={COLS * P} height={ROWS * P} fill={COLOR.core} />
            <rect x={RX} y={RES_Y} width={RW} height={RES_H} fill={COLOR.core} />
          </>,
        )}
        {part('glass', <>{cloth()}</>)}
        {part('glass', <>{PLIES.map((cy) => ply(cy))}</>)}
        {part(
          'copper',
          <>
            <polygon points={teeth(true)} fill={COLOR.cuPlated} />
            <polygon points={teeth(false)} fill={COLOR.cuPlated} />
          </>,
        )}
        <rect x={LX} y={LY + ROWS * P + 14} width="12" height="12" fill={WARP} />
        <text x={LX + 18} y={LY + ROWS * P + 24} fill="var(--text-2)" fontSize="11">
          {t(S.warp)}
        </text>
        <rect x={LX + 130} y={LY + ROWS * P + 14} width="12" height="12" fill={WEFT} />
        <text x={LX + 148} y={LY + ROWS * P + 24} fill="var(--text-2)" fontSize="11">
          {t(S.weft)}
        </text>
        {tag(RX + RW - 30, LY + 7, RX + RW + 14, LY + 14, t(L.copper))}
        {tag(RX + RW - 60, RES_Y + 14, RX + RW + 14, RES_Y + 40, t(L.resin))}
        {tag(RX + 11 + 22 * 5, PLIES[1] - 7, RX + RW + 14, PLIES[1] + 20, t(L.glass))}
      </svg>
      <figcaption>{t(S.fr4Cap)}</figcaption>
    </figure>
  )
}

const PX0 = 70
const PX1 = 720
const PY0 = 48
const PY1 = 250
const T1 = 260
const YMAX = 4.5
const xOf = (temp: number) => PX0 + ((temp - T0) / (T1 - T0)) * (PX1 - PX0)
const yOf = (pct: number) => PY1 - (pct / YMAX) * (PY1 - PY0)
const pctAt = (g: Grade, temp: number) => zExpandPpm(g, temp) / 1e4

export function TgChart({ grade, temp }: { grade: Grade; temp: number }) {
  const { t } = useLocale()
  const curve = (g: Grade) => [T0, g.tg, T1].map((tp) => `${xOf(tp).toFixed(1)},${yOf(pctAt(g, tp)).toFixed(1)}`).join(' ')
  const xs = [50, 100, 150, 200, 250]
  const ys = [0, 1, 2, 3, 4]
  const tgX = xOf(grade.tg)
  const barrelEnd = (BARREL_PPM * (T1 - T0)) / 1e4
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 296" className="term-fig__svg" role="group" aria-label={t(S.tgCap)}>
        <rect width="760" height="296" rx="10" fill="var(--well)" />
        {GRADES.map((g, i) => (
          <g key={g.id}>
            <rect x={PX0 + i * 215} y="8" width="12" height="12" fill={g.color} />
            <text x={PX0 + i * 215 + 18} y="18" fill={g.id === grade.id ? 'var(--text)' : 'var(--text-2)'} fontSize="10" fontWeight={g.id === grade.id ? 700 : 400}>
              {t(g.label)}
            </text>
          </g>
        ))}
        <text x={PX0} y="38" fill="var(--muted)" fontSize="10">
          {t(L.axisY)}
        </text>
        <rect x={PX0} y={PY0} width={tgX - PX0} height={PY1 - PY0} fill="#2e9d4f" opacity="0.1" />
        <rect x={tgX} y={PY0} width={PX1 - tgX} height={PY1 - PY0} fill="#d9534f" opacity="0.1" />
        {ys.map((v) => (
          <g key={v}>
            <line x1={PX0} y1={yOf(v)} x2={PX1} y2={yOf(v)} stroke="var(--line)" strokeWidth="0.6" />
            <text x={PX0 - 8} y={yOf(v) + 3} textAnchor="end" fill="var(--muted)" fontSize="10">
              {v}
            </text>
          </g>
        ))}
        {xs.map((v) => (
          <g key={v}>
            <line x1={xOf(v)} y1={PY1} x2={xOf(v)} y2={PY1 + 4} stroke="var(--text-2)" />
            <text x={xOf(v)} y={PY1 + 16} textAnchor="middle" fill="var(--muted)" fontSize="10">
              {v}
            </text>
          </g>
        ))}
        <text x={(PX0 + PX1) / 2} y="286" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.axisX)}
        </text>
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="var(--text-2)" />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke="var(--text-2)" />
        <line x1={xOf(T0)} y1={yOf(0)} x2={xOf(T1)} y2={yOf(barrelEnd)} stroke="var(--muted)" strokeWidth="1.4" strokeDasharray="4 3" />
        {GRADES.filter((g) => g.id !== grade.id).map((g) => (
          <polyline key={g.id} points={curve(g)} fill="none" stroke={g.color} strokeWidth="1.5" opacity="0.5" />
        ))}
        <polyline points={curve(grade)} fill="none" stroke={grade.color} strokeWidth="3.2" strokeLinejoin="round" />
        <line x1={tgX} y1={PY0} x2={tgX} y2={PY1} stroke="var(--text-2)" strokeDasharray="4 3" />
        <text x={tgX + 5} y="62" fill="var(--text)" fontSize="10" fontWeight="700">
          {`Tg ${grade.tg} °C`}
        </text>
        <line x1={xOf(REFLOW_PEAK)} y1={PY0} x2={xOf(REFLOW_PEAK)} y2={PY1} stroke="#d9534f" strokeDasharray="4 3" />
        <text x={xOf(REFLOW_PEAK) - 5} y="76" textAnchor="end" fill="#d9534f" fontSize="10">
          {t(L.reflow)}
        </text>
        <text x={(PX0 + tgX) / 2} y={PY0 + 52} textAnchor="middle" fill="var(--text-2)" fontSize="10">
          {t(L.glassy)}
        </text>
        <text x={(tgX + PX1) / 2 - 40} y={PY0 + 52} textAnchor="middle" fill="var(--text-2)" fontSize="10">
          {t(L.rubbery)}
        </text>
        <line x1={xOf(temp)} y1={PY0} x2={xOf(temp)} y2={PY1} stroke="var(--gold)" strokeWidth="1.2" />
        <circle cx={xOf(temp)} cy={yOf(pctAt(grade, temp))} r="5" fill={grade.color} stroke="var(--text)" strokeWidth="1.5" />
        <text x={PX1 - 4} y={yOf(barrelEnd) - 6} textAnchor="end" fill="var(--muted)" fontSize="10">
          {`Cu barrel ${BARREL_PPM} ppm/°C`}
        </text>
      </svg>
      <figcaption>{t(S.tgCap)}</figcaption>
    </figure>
  )
}
