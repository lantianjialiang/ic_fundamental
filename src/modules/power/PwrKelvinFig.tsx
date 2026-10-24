import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type GuardMode, type WireMode } from './pwrKelvinModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const FIG = {
  kelvinAria: loc(
    '开尔文四线连接示意：测试仪的加压线 F+、F−（金色）走电流并经接触电阻 Rc 与引线电阻 R_lead 接到 DUT 两端；感测线 S+、S−（蓝色）接在 DUT 引脚旁边，几乎不走电流',
    'Kelvin four-wire diagram: the force lines F+ and F− (gold) carry the current through contact resistance Rc and lead resistance R_lead to the two ends of the DUT; the sense lines S+ and S− (blue) connect next to the DUT pins and carry almost no current',
  ),
  kelvinCap: loc(
    '加压线走电流，经 Rc 与 R_lead 接到 DUT 两端；感测线接在 DUT 引脚旁，几乎不走电流。2 线时两者合用，接触与引线电阻就进了读数。',
    'Force lines carry the current through Rc and R_lead to the DUT ends; sense lines touch the DUT pins and carry almost no current. In 2-wire they share the leads, so contact and lead resistance enter the reading.',
  ),
  tester: loc('测试仪', 'Tester'),
  force: loc('加压线', 'Force'),
  sense: loc('感测线', 'Sense'),
  twoNote: loc('2 线：感测线与加压线合用', '2-wire: sense shares the force leads'),
  fourNote: loc('4 线：感测线几乎无电流', '4-wire: sense carries ~0 A'),
  hvAria: loc(
    '高压漏电示意：测试电压 Vtest 同时加在 DUT（Idss）和夹具绝缘电阻 R_ins 上，两条漏电都流进电流表；guard 开时夹具这一路改接到保护环，电压与 Vtest 相同',
    'High-voltage leakage schematic: Vtest is applied to both the DUT (Idss) and the fixture insulation R_ins, and both leakages flow into the ammeter; with guard on, the fixture path goes to the guard ring held at the Vtest potential',
  ),
  hvCap: loc(
    '夹具绝缘路径与 DUT 并联，漏电一起进电流表；guard 把这条路径的测量端接到保护环，电位与 Vtest 相同，电流就不再流进电流表。',
    'The fixture insulation path is in parallel with the DUT, so its leakage also enters the ammeter. Guard holds that path’s measuring end at the Vtest potential, so no current reaches the ammeter.',
  ),
  dut: loc('DUT', 'DUT'),
  idss: loc('Idss', 'Idss'),
  rins: loc('R_ins', 'R_ins'),
  guard: loc('guard', 'guard'),
  ifix: loc('I_fix', 'I_fix'),
  imeas: loc('I_meas', 'I_meas'),
  vtest: loc('Vtest', 'Vtest'),
}

/** 四线连接示意：测试仪在左，DUT 在中间；加压线走外侧，感测线接在 DUT 内侧的引脚上 */
export function KelvinDiagram({ mode }: { mode: WireMode }) {
  const { t } = useLocale()
  const two = mode === '2w'
  const senseStroke = two ? MUTED : BLUE
  const senseDash = two ? '4 3' : undefined
  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox="0 0 520 210" role="img" aria-label={t(FIG.kelvinAria)} className="pwr-svg">
        <rect x={0} y={0} width={520} height={210} rx={10} fill={BG} />

        <rect x={20} y={24} width={110} height={170} rx={8} fill={BOX} stroke={EDGE} />
        <text x={75} y={44} textAnchor="middle" fill={TEXT} fontSize={12}>
          {t(FIG.tester)}
        </text>
        <circle cx={130} cy={60} r={3} fill={GOLD} />
        <circle cx={130} cy={130} r={3} fill={senseStroke} />
        <circle cx={130} cy={150} r={3} fill={senseStroke} />
        <circle cx={130} cy={180} r={3} fill={GOLD} />
        <text x={124} y={64} textAnchor="end" fill={TEXT} fontSize={10}>
          F+
        </text>
        <text x={124} y={134} textAnchor="end" fill={TEXT} fontSize={10}>
          S+
        </text>
        <text x={124} y={154} textAnchor="end" fill={TEXT} fontSize={10}>
          S−
        </text>
        <text x={124} y={184} textAnchor="end" fill={TEXT} fontSize={10}>
          F−
        </text>

        <path d="M130,60 H250 V110 H265" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <path d="M335,110 H365 V180 H130" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <path d="M130,130 H275 V120" fill="none" stroke={senseStroke} strokeWidth={2} strokeDasharray={senseDash} />
        <path d="M130,150 H325 V120" fill="none" stroke={senseStroke} strokeWidth={2} strokeDasharray={senseDash} />

        <rect x={270} y={100} width={60} height={20} fill={BOX} stroke={TEXT} />
        <text x={300} y={114} textAnchor="middle" fill={TEXT} fontSize={11}>
          {t(FIG.dut)}
        </text>
        <circle cx={265} cy={110} r={3} fill={GOLD} />
        <circle cx={335} cy={110} r={3} fill={GOLD} />
        <circle cx={275} cy={120} r={3} fill={senseStroke} />
        <circle cx={325} cy={120} r={3} fill={senseStroke} />

        <rect x={244} y={78} width={12} height={14} fill={BOX} stroke={GOLD} />
        <text x={238} y={89} textAnchor="end" fill={TEXT} fontSize={10}>
          Rc
        </text>
        <rect x={359} y={132} width={12} height={14} fill={BOX} stroke={GOLD} />
        <text x={378} y={143} textAnchor="start" fill={TEXT} fontSize={10}>
          Rc
        </text>
        <rect x={180} y={53} width={40} height={14} fill={BOX} stroke={GOLD} />
        <text x={200} y={82} textAnchor="middle" fill={TEXT} fontSize={10}>
          R_lead
        </text>
        <rect x={200} y={173} width={40} height={14} fill={BOX} stroke={GOLD} />
        <text x={220} y={202} textAnchor="middle" fill={TEXT} fontSize={10}>
          R_lead
        </text>

        <text x={140} y={52} textAnchor="start" fill={GOLD} fontSize={10}>
          {t(FIG.force)}
        </text>
        <text x={140} y={122} textAnchor="start" fill={senseStroke} fontSize={10}>
          {t(FIG.sense)}
        </text>
        <text x={280} y={166} textAnchor="start" fill={MUTED} fontSize={10}>
          {t(two ? FIG.twoNote : FIG.fourNote)}
        </text>
      </svg>
      <figcaption>{t(FIG.kelvinCap)}</figcaption>
    </figure>
  )
}

/** 高压漏电示意：Vtest 同时加在 DUT 与夹具绝缘电阻上，两路都进电流表；guard 开时夹具路径改接保护环 */
export function HvDiagram({ guard }: { guard: GuardMode }) {
  const { t } = useLocale()
  const guardOn = guard === 'on'
  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox="0 0 520 200" role="img" aria-label={t(FIG.hvAria)} className="pwr-svg">
        <rect x={0} y={0} width={520} height={200} rx={10} fill={BG} />

        <line x1={55} y1={40} x2={470} y2={40} stroke={GOLD} strokeWidth={2} />
        <line x1={55} y1={64} x2={55} y2={40} stroke={GOLD} strokeWidth={2} />
        <circle cx={55} cy={80} r={16} fill={BOX} stroke={TEXT} />
        <text x={55} y={85} textAnchor="middle" fill={TEXT} fontSize={12}>
          V
        </text>
        <text x={78} y={84} textAnchor="start" fill={TEXT} fontSize={10}>
          {t(FIG.vtest)}
        </text>
        <line x1={55} y1={96} x2={55} y2={185} stroke={MUTED} strokeWidth={2} />
        <line x1={55} y1={185} x2={300} y2={185} stroke={MUTED} strokeWidth={2} />

        <line x1={170} y1={40} x2={170} y2={62} stroke={GOLD} strokeWidth={2} />
        <rect x={150} y={62} width={40} height={30} fill={BOX} stroke={TEXT} />
        <text x={170} y={76} textAnchor="middle" fill={TEXT} fontSize={10}>
          {t(FIG.dut)}
        </text>
        <text x={170} y={87} textAnchor="middle" fill={TEXT} fontSize={10}>
          {t(FIG.idss)}
        </text>
        <line x1={170} y1={92} x2={170} y2={130} stroke={TEXT} strokeWidth={1.5} />
        <line x1={170} y1={130} x2={300} y2={130} stroke={TEXT} strokeWidth={1.5} />

        <line x1={380} y1={40} x2={380} y2={62} stroke={GOLD} strokeWidth={2} />
        <rect x={360} y={62} width={40} height={30} fill={BOX} stroke={GOLD} />
        <text x={380} y={80} textAnchor="middle" fill={TEXT} fontSize={10}>
          {t(FIG.rins)}
        </text>
        <line x1={380} y1={92} x2={380} y2={130} stroke={GOLD} strokeWidth={1.5} />
        {guardOn ? (
          <g>
            <line x1={380} y1={130} x2={440} y2={130} stroke={GOLD} strokeWidth={1.5} strokeDasharray="4 3" />
            <rect x={440} y={118} width={56} height={24} rx={4} fill={BOX} stroke={GOLD} strokeDasharray="4 3" />
            <text x={468} y={134} textAnchor="middle" fill={GOLD} fontSize={10}>
              {t(FIG.guard)}
            </text>
            <line x1={468} y1={118} x2={468} y2={40} stroke={GOLD} strokeWidth={1.5} strokeDasharray="4 3" />
          </g>
        ) : (
          <line x1={380} y1={130} x2={300} y2={130} stroke={GOLD} strokeWidth={1.5} />
        )}
        <text x={388} y={112} textAnchor="start" fill={GOLD} fontSize={10}>
          {t(FIG.ifix)}
        </text>

        <circle cx={300} cy={130} r={3} fill={TEXT} />
        <line x1={300} y1={130} x2={300} y2={150} stroke={TEXT} strokeWidth={1.5} />
        <circle cx={300} cy={160} r={10} fill={BOX} stroke={TEXT} />
        <text x={300} y={164} textAnchor="middle" fill={TEXT} fontSize={11}>
          A
        </text>
        <line x1={300} y1={170} x2={300} y2={185} stroke={TEXT} strokeWidth={1.5} />
        <text x={318} y={164} textAnchor="start" fill={TEXT} fontSize={10}>
          {t(FIG.imeas)}
        </text>
      </svg>
      <figcaption>{t(FIG.hvCap)}</figcaption>
    </figure>
  )
}
