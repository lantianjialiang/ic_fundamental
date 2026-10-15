import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { C, T } from './BasicsFigs'
import { GROOVE_DEPTH_MM } from './data/pcbBasicsModel'
import { SPACE_S } from './data/pcbBasicsText'
import { POUR_S, type PourId } from './data/pcbBasicsText2'

/* ---------- 电气间隙 vs 爬电距离（剖面） ---------- */

const PX = 50 // 每 mm 的像素
const SURF = 110
const BOARD_H = 80

export function ClearanceFig({ gap, grooved, slotW, creepage }: { gap: number; grooved: boolean; slotW: number; creepage: number }) {
  const { t } = useLocale()
  const mid = 380
  const xl = mid - gap * (PX / 2)
  const xr = mid + gap * (PX / 2)
  const sl = mid - slotW * (PX / 2)
  const sr = mid + slotW * (PX / 2)
  const bottom = SURF + GROOVE_DEPTH_MM * PX
  const path = grooved
    ? `M${xl} ${SURF} H${sl} V${bottom} H${sr} V${SURF} H${xr}`
    : `M${xl} ${SURF} H${xr}`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(SPACE_S.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <rect x="10" y={SURF} width="740" height={BOARD_H} fill="#c9b77a" />
        {grooved ? <rect x={sl} y={SURF - 1} width={sr - sl} height={GROOVE_DEPTH_MM * PX + 1} fill="var(--well)" /> : null}
        <rect x={xl - 70} y={SURF - 10} width="70" height="10" fill={C.copper} />
        <rect x={xr} y={SURF - 10} width="70" height="10" fill={C.copper} />
        <T x={xl - 35} y={SURF - 18} color="var(--text)" size={12} bold>
          HV
        </T>
        <T x={xr + 35} y={SURF - 18} color="var(--text)" size={12} bold>
          0 V
        </T>
        <T x={22} y={SURF + 66} anchor="start" color="#3a3320" size={11}>
          FR-4
        </T>
        <path d={`M${xl} ${SURF - 5} H${xr}`} stroke="var(--blue)" strokeWidth="2.5" />
        <path d={`M${xl + 8} ${SURF - 11} L${xl} ${SURF - 5} L${xl + 8} ${SURF + 1} M${xr - 8} ${SURF - 11} L${xr} ${SURF - 5} L${xr - 8} ${SURF + 1}`} fill="none" stroke="var(--blue)" strokeWidth="2" />
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray="7 5" strokeLinejoin="round" />
        <T x={mid} y={52} color="var(--blue)" size={13} bold mono>
          {`${gap.toFixed(2)} mm`}
        </T>
        <T x={mid} y={72} color="var(--muted)" size={11}>
          {t(loc('空气中的直线', 'straight through air'))}
        </T>
        <path d="M40 222 H72" stroke="var(--blue)" strokeWidth="2.5" />
        <T x={82} y={226} anchor="start" color="var(--text-2)" size={12}>
          {`${t(SPACE_S.capAir)}: ${gap.toFixed(2)} mm`}
        </T>
        <path d="M40 246 H72" stroke="var(--gold)" strokeWidth="3" strokeDasharray="7 5" />
        <T x={82} y={250} anchor="start" color="var(--text-2)" size={12}>
          {`${t(SPACE_S.capSurf)}: ${creepage.toFixed(2)} mm`}
        </T>
      </svg>
      <figcaption>{t(SPACE_S.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 铺铜：全连接 / 热焊盘 / 孤岛 ---------- */

const PS = 60 // 每 mm 的像素
const CX = 230
const CY = 150
const R_PAD = 0.9 * PS
const R_HOLE = 0.5 * PS
const R_GAP = (0.9 + 0.3) * PS

const SWATCH = { pour: C.copper, gap: C.mask }

export function PourFig({ mode, spokeMm }: { mode: PourId; spokeMm: number }) {
  const { t } = useLocale()
  const sw = spokeMm * PS
  const relief = mode !== 'solid'
  const dirs: Array<[number, number]> = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="img" aria-label={t(POUR_S.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        <rect x="10" y="20" width="450" height="260" rx="6" fill={C.mask} />
        <rect x="20" y="30" width="430" height="240" fill={C.copper} opacity="0.92" />
        {relief ? <circle cx={CX} cy={CY} r={R_GAP} fill={C.mask} /> : null}
        {mode === 'solid' ? <circle cx={CX} cy={CY} r={R_PAD} fill="none" stroke="#7a4f1c" strokeDasharray="4 4" strokeWidth="1.5" /> : <circle cx={CX} cy={CY} r={R_PAD} fill={C.copper} />}
        {relief
          ? dirs.map(([dx, dy]) => {
              const len = R_GAP - R_PAD + 8
              const w = dx === 0 ? sw : len
              const h = dx === 0 ? len : sw
              const x = dx === 0 ? CX - sw / 2 : dx > 0 ? CX + R_PAD - 4 : CX - R_PAD - len + 4
              const y = dx !== 0 ? CY - sw / 2 : dy > 0 ? CY + R_PAD - 4 : CY - R_PAD - len + 4
              return <rect key={`${dx}${dy}`} x={x} y={y} width={w} height={h} fill={C.copper} />
            })
          : null}
        <circle cx={CX} cy={CY} r={R_HOLE} fill={C.hole} />
        {mode === 'island' ? (
          <g>
            <rect x="316" y="182" width="118" height="94" fill="none" stroke={C.mask} strokeWidth="14" />
            <T x={375} y={235} color="#3a2408" size={12} bold>
              {t(loc('孤岛', 'Island'))}
            </T>
          </g>
        ) : null}
        <rect x="486" y="52" width="16" height="16" fill={SWATCH.pour} />
        <T x={512} y={65} anchor="start" color="var(--text-2)" size={12}>
          {t(loc('铜皮 Pour', 'Copper pour'))}
        </T>
        <rect x="486" y="84" width="16" height="16" fill={SWATCH.gap} stroke="var(--line-2)" />
        <T x={512} y={97} anchor="start" color="var(--text-2)" size={12}>
          {t(loc('挖掉的间隙 0.3 mm', 'Cleared gap 0.3 mm'))}
        </T>
        <circle cx="494" cy="124" r="8" fill={C.hole} stroke="var(--line-2)" />
        <T x={512} y={129} anchor="start" color="var(--text-2)" size={12}>
          {t(loc('钻孔 1.0 mm', 'Drill 1.0 mm'))}
        </T>
        {mode === 'relief' ? (
          <T x={486} y={168} anchor="start" color="var(--gold)" size={12} bold>
            {`${t(loc('辐条', 'Spoke'))} ${spokeMm.toFixed(2)} mm × 4`}
          </T>
        ) : null}
        {mode === 'solid' ? (
          <T x={486} y={168} anchor="start" color="var(--gold)" size={12}>
            {t(loc('虚线圆 = 焊盘边界（已融进铜皮）', 'Dashed ring = pad edge (merged)'))}
          </T>
        ) : null}
      </svg>
      <figcaption>{t(POUR_S.cap)}</figcaption>
    </figure>
  )
}
