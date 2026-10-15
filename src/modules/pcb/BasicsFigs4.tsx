import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { C, T } from './BasicsFigs'
import { WINDOW_N, apertureOf, type ApMode, type Foot } from './data/pcbBasicsFoot'
import { FOOT_S } from './data/pcbBasicsText3'

type Props = {
  foot: Foot
  padId: string
  onPick: (id: string) => void
  mode: ApMode
  sigRatio: number
  epCover: number
}

const AP = 'var(--blue)'

export function FootprintFig({ foot, padId, onPick, mode, sigRatio, epCover }: Props) {
  const { t } = useLocale()
  const k = foot.scale
  const cx = 190
  const cy = 155
  const pad = foot.pads.find((p) => p.id === padId) ?? foot.pads[0]
  const ap = apertureOf(pad, mode, pad.ep ? epCover : sigRatio)
  const z = Math.min(300 / pad.w, 150 / pad.h)
  const zx = 570
  const zy = 120
  const ordered = [...foot.pads].sort((a, b) => Number(Boolean(b.ep)) - Number(Boolean(a.ep)))
  const windows: Array<[number, number]> = []
  if (pad.ep && mode === 'cut') {
    const cell = pad.w / WINDOW_N
    for (let i = 0; i < WINDOW_N; i++) {
      for (let j = 0; j < WINDOW_N; j++) {
        windows.push([(i - (WINDOW_N - 1) / 2) * cell, (j - (WINDOW_N - 1) / 2) * cell])
      }
    }
  }
  const apText = pad.ep && mode === 'cut' ? `${ap.windows} × ${ap.w.toFixed(2)} × ${ap.h.toFixed(2)} mm` : `${ap.w.toFixed(2)} × ${ap.h.toFixed(2)} mm`
  const pin1 = foot.id === 'qfn' ? { x: -1.2, y: -1.2 } : foot.id === 'sot23' ? { x: -1.2, y: 0.4 } : null
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="group" aria-label={t(FOOT_S.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="370" height="280" rx="8" fill={C.mask} stroke="var(--line-2)" />
        <rect x="390" y="10" width="360" height="280" rx="8" fill="var(--card)" stroke="var(--line)" />
        {ordered.map((p) => {
          const on = p.id === pad.id
          const big = p.w * k > 22 && p.h * k > 22
          return (
            <Hit key={p.id} label={`${t(FOOT_S.pad)} ${p.id}`} active={on} onPick={() => onPick(p.id)}>
              <rect x={cx + (p.x - p.w / 2) * k} y={cy + (p.y - p.h / 2) * k} width={p.w * k} height={p.h * k} rx="1.5" fill={on ? C.hot : C.copper} stroke={on ? AP : 'none'} strokeWidth="3" />
              {big ? (
                <T x={cx + p.x * k} y={cy + p.y * k + 4} color="#3a2408" size={11} bold>
                  {p.id}
                </T>
              ) : null}
            </Hit>
          )
        })}
        <rect x={cx - (foot.body.w / 2) * k} y={cy - (foot.body.h / 2) * k} width={foot.body.w * k} height={foot.body.h * k} fill="none" stroke={C.silk} strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />
        {pin1 ? <circle cx={cx + pin1.x * k} cy={cy + pin1.y * k} r="4" fill="var(--gold)" pointerEvents="none" /> : null}
        <path d="M24 30 H48" stroke={C.silk} strokeDasharray="5 4" />
        <T x={56} y={34} anchor="start" color={C.silk} size={11}>
          {t(FOOT_S.capBody)}
        </T>
        <T x={570} y={34} color="var(--text)" size={13} bold>
          {`${t(FOOT_S.pad)} ${pad.id}`}
        </T>
        <rect x={zx - (pad.w * z) / 2} y={zy - (pad.h * z) / 2} width={pad.w * z} height={pad.h * z} fill={C.copper} />
        {windows.length > 0 ? (
          windows.map(([dx, dy]) => (
            <rect key={`${dx}${dy}`} x={zx + dx * z - (ap.w * z) / 2} y={zy + dy * z - (ap.h * z) / 2} width={ap.w * z} height={ap.h * z} fill={AP} fillOpacity="0.6" stroke={AP} strokeWidth="1.5" />
          ))
        ) : (
          <rect x={zx - (ap.w * z) / 2} y={zy - (ap.h * z) / 2} width={ap.w * z} height={ap.h * z} fill={AP} fillOpacity="0.6" stroke={AP} strokeWidth="1.5" />
        )}
        <rect x="406" y="232" width="12" height="12" fill={C.copper} />
        <T x={426} y={243} anchor="start" color="var(--text-2)" size={12} mono>
          {`${t(FOOT_S.capPad)} ${pad.w.toFixed(2)} × ${pad.h.toFixed(2)} mm`}
        </T>
        <rect x="406" y="258" width="12" height="12" fill={AP} fillOpacity="0.6" stroke={AP} />
        <T x={426} y={269} anchor="start" color="var(--text-2)" size={12} mono>
          {`${t(FOOT_S.capAp)} ${apText}`}
        </T>
      </svg>
      <figcaption>{t(FOOT_S.cap)}</figcaption>
    </figure>
  )
}
