import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import {
  IOH_MA,
  IOL_MA,
  VIH_LV,
  VIL_LV,
  VOH_LV,
  VOL_LV,
  compare,
  loadCurrent,
  type PeMode,
  type PeSwitch,
} from './data/intro'

const L = {
  rvs: loc('VIH / VIL ← RVS', 'VIH / VIL ← RVS'),
  driver: loc('驱动器', 'Driver'),
  cmp: loc('电压比较器', 'Voltage comparator'),
  load: loc('电流负载', 'Current load'),
  pmu: 'PMU',
  icmp1: loc('电流', 'Current'),
  icmp2: loc('比较器', 'comparator'),
  read0: loc('读成 0', 'Reads 0'),
  read1: loc('读成 1', 'Reads 1'),
  readX: loc('中间：三态或坏', 'Between: tri-state or bad'),
  switching: loc('切换中：先断开，再闭合', 'Switching: break, then make'),
  conflict: loc('I/O 冲突！', 'I/O conflict!'),
  cap: loc(
    '一个测试通道（对应教材 Figure 3-5）。金色是当前导通的路径；F1 / F2 是高速 FET 开关，K1 / K2 / K3 是继电器。',
    'One test channel (textbook Figure 3-5). Gold marks the currently conducting path; F1 / F2 are high-speed FET switches and K1 / K2 / K3 are relays.',
  ),
}

function HSw({ x1, x2, y, on, label, color }: { x1: number; x2: number; y: number; on: boolean; label: string; color: string }) {
  const a = x1 + 10
  const b = x2 - 10
  return (
    <g>
      <path d={`M${x1} ${y} H${a} M${b} ${y} H${x2}`} stroke={color} strokeWidth="2.5" />
      <circle cx={a} cy={y} r="3" fill={color} />
      <circle cx={b} cy={y} r="3" fill={color} />
      <line x1={a} y1={y} x2={on ? b : b - 6} y2={on ? y : y - 16} stroke={color} strokeWidth="2.5" />
      <text x={(x1 + x2) / 2} y={y + 20} textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
        {label}
      </text>
    </g>
  )
}

function VSw({ x, y1, y2, on, label, color }: { x: number; y1: number; y2: number; on: boolean; label: string; color: string }) {
  const a = y1 + 10
  const b = y2 - 10
  return (
    <g>
      <path d={`M${x} ${y1} V${a} M${x} ${b} V${y2}`} stroke={color} strokeWidth="2.5" />
      <circle cx={x} cy={a} r="3" fill={color} />
      <circle cx={x} cy={b} r="3" fill={color} />
      <line x1={x} y1={a} x2={on ? x : x + 16} y2={on ? b : b - 6} stroke={color} strokeWidth="2.5" />
      <text x={x - 10} y={(y1 + y2) / 2 + 4} textAnchor="end" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
        {label}
      </text>
    </g>
  )
}

export function PinElecFig({
  mode,
  sw,
  switching,
  fdata,
  vout,
  vref,
  conflict,
}: {
  mode: PeMode
  sw: PeSwitch
  switching: boolean
  fdata: 0 | 1
  vout: number
  vref: number
  conflict: boolean
}) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const idle = 'var(--line-2)'
  const drivePath = sw.f1 && sw.k1
  const cmpPath = sw.k1 && mode === 'compare' && !switching
  const loadPath = sw.f2 && sw.k1
  const pmuPath = sw.k2
  const leakPath = sw.k3
  const ioPath = drivePath || cmpPath || loadPath
  const c = (on: boolean) => (on ? hot : idle)
  const bad = conflict && drivePath
  const pinColor = bad ? 'var(--red)' : c(ioPath || pmuPath || leakPath)
  const read = compare(vout)
  const iLoad = loadCurrent(vout, vref)

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 360" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="720" height="360" rx="10" fill="var(--well)" />

        {/* 驱动器 */}
        <text x="20" y="64" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
          FDATA
        </text>
        <path d="M70 60 H150" stroke={c(drivePath)} strokeWidth="2.5" />
        <text x="175" y="24" textAnchor="middle" fill="var(--sky)" fontSize="11">
          {t(L.rvs)}
        </text>
        <path d="M175 30 V50" stroke="var(--sky)" strokeWidth="1.5" />
        <path d="M150 40 L200 60 L150 80 Z" fill="var(--fig-box)" stroke={c(drivePath)} strokeWidth="2" />
        <text x="172" y="98" textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(L.driver)}
        </text>
        {drivePath ? (
          <text x="40" y="96" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">
            {fdata ? `1 → VIH ${VIH_LV.toFixed(1)} V` : `0 → VIL ${VIL_LV.toFixed(1)} V`}
          </text>
        ) : null}
        <path d="M200 60 H250" stroke={c(drivePath)} strokeWidth="2.5" />
        <HSw x1={250} x2={310} y={60} on={sw.f1} label="F1 FET" color={c(drivePath)} />
        <path d="M310 60 H420" stroke={c(drivePath)} strokeWidth="2.5" />

        {/* 内部节点竖线 */}
        <path d="M420 60 V130" stroke={c(drivePath)} strokeWidth="2.5" />
        <path d="M420 130 V150" stroke={c(drivePath || cmpPath)} strokeWidth="2.5" />
        <path d="M420 150 V175" stroke={c(cmpPath || loadPath)} strokeWidth="2.5" />
        <path d="M420 175 V245" stroke={c(loadPath)} strokeWidth="2.5" />
        <circle cx="420" cy="150" r="4" fill={c(ioPath)} />

        {/* 比较器 */}
        <path d="M420 130 H300 M420 175 H300" stroke={c(cmpPath)} strokeWidth="2" />
        <path d="M300 116 L256 130 L300 144 Z" fill="var(--fig-box)" stroke={c(cmpPath && read === 'high')} strokeWidth="2" />
        <path d="M300 161 L256 175 L300 189 Z" fill="var(--fig-box)" stroke={c(cmpPath && read === 'low')} strokeWidth="2" />
        <text x="306" y="114" fill="var(--sky)" fontSize="10" fontFamily="var(--mono)">
          {`VOH ${VOH_LV} V`}
        </text>
        <text x="306" y="200" fill="var(--sky)" fontSize="10" fontFamily="var(--mono)">
          {`VOL ${VOL_LV} V`}
        </text>
        <path d="M256 130 H226 M256 175 H226" stroke={idle} strokeWidth="1.5" />
        <text x="220" y="156" textAnchor="end" fill="var(--text-2)" fontSize="11">
          {t(L.cmp)}
        </text>
        {cmpPath ? (
          <text x="220" y="176" textAnchor="end" fill={read === 'mid' ? 'var(--red)' : 'var(--gold)'} fontSize="12">
            {t(read === 'low' ? L.read0 : read === 'high' ? L.read1 : L.readX)}
          </text>
        ) : null}

        {/* 电流负载 */}
        <rect x="150" y="218" width="150" height="56" rx="8" fill="var(--fig-box)" stroke={c(loadPath)} strokeWidth={loadPath ? 2 : 1} />
        <text x="225" y="238" textAnchor="middle" fill="var(--text)" fontSize="12">
          {t(L.load)}
        </text>
        <text x="225" y="254" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {`IOL ${IOL_MA} mA / IOH ${IOH_MA} mA`}
        </text>
        <text x="225" y="268" textAnchor="middle" fill="var(--sky)" fontSize="10" fontFamily="var(--mono)">
          {`VREF ${vref.toFixed(1)} V`}
        </text>
        <path d="M300 245 H330" stroke={c(loadPath)} strokeWidth="2.5" />
        <HSw x1={330} x2={390} y={245} on={sw.f2} label="F2 FET" color={c(loadPath)} />
        <path d="M390 245 H420" stroke={c(loadPath)} strokeWidth="2.5" />
        {loadPath ? (
          <text x="150" y="294" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">
            {iLoad > 0 ? `IOL +${IOL_MA} mA → DUT` : iLoad < 0 ? `IOH −${IOH_MA} mA ← DUT` : 'I = 0 (V = VREF)'}
          </text>
        ) : null}

        {/* K1 → DUT */}
        <path d="M420 150 H450" stroke={c(ioPath)} strokeWidth="2.5" />
        <HSw x1={450} x2={510} y={150} on={sw.k1} label="K1" color={c(ioPath)} />
        <path d="M510 150 H552" stroke={bad ? 'var(--red)' : c(ioPath)} strokeWidth="2.5" />
        <path d="M552 150 H665" stroke={bad ? 'var(--red)' : c(ioPath || pmuPath)} strokeWidth="2.5" />
        <path d="M665 150 H684" stroke={pinColor} strokeWidth="2.5" />
        <circle cx="690" cy="150" r="7" fill="var(--card)" stroke={pinColor} strokeWidth="2" />
        <text x="690" y="132" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="var(--mono)">
          DUT
        </text>
        {cmpPath || loadPath ? (
          <text x="690" y="178" textAnchor="middle" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">
            {`${vout.toFixed(1)} V`}
          </text>
        ) : null}
        {bad ? (
          <text x="610" y="128" textAnchor="middle" fill="var(--red)" fontSize="13">
            {t(L.conflict)}
          </text>
        ) : null}

        {/* K2 → PMU，K3 → 电流比较器 */}
        <circle cx="552" cy="150" r="3" fill={c(ioPath || pmuPath)} />
        <path d="M552 150 V200" stroke={c(pmuPath)} strokeWidth="2.5" />
        <VSw x={552} y1={200} y2={256} on={sw.k2} label="K2" color={c(pmuPath)} />
        <path d="M552 256 V290" stroke={c(pmuPath)} strokeWidth="2.5" />
        <rect x="500" y="290" width="105" height="46" rx="8" fill={pmuPath ? 'var(--gold-bg)' : 'var(--blue-bg)'} stroke={pmuPath ? 'var(--gold)' : 'var(--blue)'} />
        <text x="552" y="318" textAnchor="middle" fill="var(--text)" fontSize="13">
          {L.pmu}
        </text>

        <circle cx="665" cy="150" r="3" fill={c(ioPath || pmuPath || leakPath)} />
        <path d="M665 150 V200" stroke={c(leakPath)} strokeWidth="2.5" />
        <VSw x={665} y1={200} y2={256} on={sw.k3} label="K3" color={c(leakPath)} />
        <path d="M665 256 V290" stroke={c(leakPath)} strokeWidth="2.5" />
        <rect x="615" y="290" width="98" height="46" rx="8" fill={leakPath ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={leakPath ? 'var(--gold)' : 'var(--line)'} />
        {/* 框只有 98 px 宽，分两行写 */}
        <text x="664" y="310" textAnchor="middle" fill="var(--text)" fontSize="12">
          {t(L.icmp1)}
        </text>
        <text x="664" y="326" textAnchor="middle" fill="var(--text)" fontSize="12">
          {t(L.icmp2)}
        </text>

        {switching ? (
          <text x="20" y="340" fill="var(--gold)" fontSize="13">
            {t(L.switching)}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
