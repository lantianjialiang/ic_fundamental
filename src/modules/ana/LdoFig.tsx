import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './ldoData'
import {
  LOAD_LIMIT,
  LOAD_PRESETS_MA,
  PSRR_POINTS,
  loadRegMvPerMa,
  psrrDb,
  type LdoState,
} from './ldoModel'

const HW = 480
const HH = 170

/** 接线示意：DPS 供 VIN，AWG 的纹波叠加到 VIN 上，EN 接 VIN；VOUT 接电子负载，DMM 在 VOUT 端感测 */
export function HookFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${HW} ${HH}`} className="term-fig__svg" role="img" aria-label={t(FIG.hookAria)}>
        <rect width={HW} height={HH} rx="10" fill="var(--well)" />

        <rect x="16" y="22" width="104" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="68" y="40" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          DPS
        </text>
        <text x="68" y="56" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.dpsSub)}
        </text>

        <rect x="16" y="104" width="104" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="68" y="122" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          AWG
        </text>
        <text x="68" y="138" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.awgSub)}
        </text>

        <rect x="190" y="30" width="120" height="110" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="198" y="48" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          VIN
        </text>
        <text x="198" y="76" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          EN
        </text>
        <text x="250" y="100" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="600" fontFamily="var(--mono)">
          VDUT-LDO1
        </text>
        <text x="250" y="130" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          GND
        </text>
        <text x="302" y="48" textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          VOUT
        </text>

        <path d="M120 44 H190" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <path d="M120 126 H150 V44" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="5 3" />
        <path d="M170 44 V 72 H 190" fill="none" stroke="var(--blue)" strokeWidth="2" />

        <path d="M310 44 H366" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <rect x="366" y="22" width="100" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="416" y="48" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          {t(FIG.loadBox)}
        </text>

        <path d="M340 44 V 126 H366" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="366" y="104" width="100" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="416" y="131" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          DMM
        </text>
      </svg>
      <figcaption>{t(FIG.hookCap)}</figcaption>
    </figure>
  )
}

const LW = 480
const LH = 180
const LX0 = 92
const LX1 = 440
const LMAX = 0.14
const LROW0 = 34
const LROW_GAP = 30

const lx = (value: number) => LX0 + (value / LMAX) * (LX1 - LX0)

/** 负载调整率横条：每个负载点一条，从 1 mA 割线斜率；超限标红，当前负载点标 ▶ */
export function LoadFig({ state }: { state: LdoState }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${LW} ${LH}`} className="term-fig__svg" role="img" aria-label={t(FIG.loadAria)}>
        <rect width={LW} height={LH} rx="10" fill="var(--well)" />

        <line
          x1={lx(LOAD_LIMIT)}
          x2={lx(LOAD_LIMIT)}
          y1="22"
          y2={LROW0 + LOAD_PRESETS_MA.length * LROW_GAP - 6}
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text x={lx(LOAD_LIMIT)} y="16" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.loadLimit)}
        </text>

        {LOAD_PRESETS_MA.map((ma, index) => {
          const y = LROW0 + index * LROW_GAP
          const slope = loadRegMvPerMa(state.vin, ma)
          const pass = Math.abs(slope) <= LOAD_LIMIT
          const current = ma === state.iloadMa
          const color = pass ? 'var(--green)' : 'var(--red)'
          return (
            <g key={ma}>
              <text x="10" y={y + 11} fill={current ? 'var(--text)' : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
                {`${current ? '▶ ' : '  '}${ma} mA`}
              </text>
              <rect x={LX0} y={y} width={lx(slope) - LX0} height="14" rx="3" fill={color} fillOpacity="0.75" />
              <text x={lx(slope) + 6} y={y + 11} fill={color} fontSize="10" fontFamily="var(--mono)">
                {slope.toFixed(3)}
              </text>
            </g>
          )
        })}

        <line x1={LX0} x2={LX0} y1="22" y2={LROW0 + LOAD_PRESETS_MA.length * LROW_GAP - 6} stroke="var(--line-2)" />
        <text x={LX1} y={LH - 12} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.loadAxis)}
        </text>
      </svg>
      <figcaption>{t(FIG.loadCap)}</figcaption>
    </figure>
  )
}

const PW = 480
const PH = 180
const PX0 = 44
const PX1 = 456
const PY_TOP = 18
const PY_BOT = 150
const DB_MAX = 80
const DB_TICKS = [0, 20, 40, 60, 80]
const HZ_TICKS: Array<{ hz: number; label: string }> = [
  { hz: 1e2, label: '100 Hz' },
  { hz: 1e3, label: '1 kHz' },
  { hz: 1e4, label: '10 kHz' },
  { hz: 1e5, label: '100 kHz' },
  { hz: 1e6, label: '1 MHz' },
]

/** 对数频率轴：100 Hz 在左，1 MHz 在右 */
const px = (hz: number) => PX0 + ((Math.log10(hz) - 2) / 4) * (PX1 - PX0)
const py = (db: number) => PY_BOT - (db / DB_MAX) * (PY_BOT - PY_TOP)

const CURVE_POINTS = Array.from({ length: 41 }, (_, index) => 10 ** (2 + (index * 4) / 40))

/** PSRR 曲线：当前纹波频率用蓝色竖线和圆点标出，各频率的限值用短横线（绿色达标、红色超限） */
export function PsrrFig({ state }: { state: LdoState }) {
  const { t } = useLocale()
  const curve = CURVE_POINTS.map((hz) => `${px(hz).toFixed(1)},${py(psrrDb(hz)).toFixed(1)}`).join(' ')
  const currentX = px(state.freqHz)
  const currentY = py(psrrDb(state.freqHz))
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${PW} ${PH}`} className="term-fig__svg" role="img" aria-label={t(FIG.psrrAria)}>
        <rect width={PW} height={PH} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY_TOP} width={PX1 - PX0} height={PY_BOT - PY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />

        {DB_TICKS.map((db) => (
          <g key={db}>
            <line x1={PX0} x2={PX1} y1={py(db)} y2={py(db)} stroke="var(--line-2)" strokeDasharray="2 3" />
            <text x={PX0 - 6} y={py(db) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {db}
            </text>
          </g>
        ))}
        <text x={PX0} y="12" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.psrrAxis)}
        </text>

        <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth="2" />

        {PSRR_POINTS.map((p) => {
          const pass = psrrDb(p.hz) >= p.limitDb
          return (
            <line
              key={p.hz}
              x1={px(p.hz) - 14}
              x2={px(p.hz) + 14}
              y1={py(p.limitDb)}
              y2={py(p.limitDb)}
              stroke={pass ? 'var(--green)' : 'var(--red)'}
              strokeWidth="3"
            />
          )
        })}

        <line x1={currentX} x2={currentX} y1={PY_TOP} y2={PY_BOT} stroke="var(--blue)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={currentX} cy={currentY} r="4" fill="var(--blue)" />

        {HZ_TICKS.map((tick) => {
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          if (tick.hz === 1e2) {
            anchor = 'start'
          }
          if (tick.hz === 1e6) {
            anchor = 'end'
          }
          return (
            <text key={tick.hz} x={px(tick.hz)} y="166" textAnchor={anchor} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {tick.label}
            </text>
          )
        })}
      </svg>
      <figcaption>{t(FIG.psrrCap)}</figcaption>
    </figure>
  )
}
