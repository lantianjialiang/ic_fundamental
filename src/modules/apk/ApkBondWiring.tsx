import { useId } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { Diagram } from '../mfg/FlowVisuals'
import { ioDensityPerMm2 } from './core'

export type BondKind = 'wb' | 'c4' | 'ub' | 'hb'

const BOND_STAGES = [
  loc('对齐铜焊盘和介质', 'Align copper pads and dielectric'),
  loc('介质接触', 'Bring dielectric into contact'),
  loc('铜焊盘接通', 'Join the copper pads'),
]
const GOLD = '#ffda82'
const CU = '#d89d63'
const DIE = '#83a7e9'
const SOLDER = '#afbece'
const DETAILS = {
  wb: loc('裸片朝上。金属线跨过裸片边缘，从顶面焊盘接到载体引脚。接点沿周边排布。', 'The die faces up. A wire arches from a top pad to a carrier finger. Contacts sit around the perimeter.'),
  c4: loc('裸片翻面，焊料凸点把裸片下面的焊盘接到基板。金线穿过两侧焊盘和中间焊料。', 'The face-down die joins the substrate through solder bumps. The gold path crosses both pads and the solder.'),
  ub: loc('这里用铜柱加薄焊料的微凸点示例。窄小的接点把芯片接到中介层或下层芯片。', 'This micro-bump example uses a copper pillar and a thin solder layer. The fine joint connects to an interposer or another die.'),
  hb: loc('铜焊盘嵌在介质中。先对齐并让介质表面接触，最终铜对铜形成电连接，无焊料层。', 'Copper pads are embedded in the dielectric. Align and contact the dielectric surfaces, then join the copper to carry current. There is no solder layer.'),
}

export function ApkBondWiring({ kind, pitch }: { kind: BondKind; pitch: number }) {
  const { t } = useLocale()
  const player = useStepPlayer(BOND_STAGES.length, 2200)
  const id = useId()
  const wire = kind === 'wb'
  const hybrid = kind === 'hb'
  const micro = kind === 'ub'
  const join = !hybrid || player.step === 2
  const topY = hybrid ? player.step === 0 ? 33 : 57 : 52
  const upper = hybrid ? topY + 44 : micro ? 123 : 104
  const period = pitch * .16
  const pitchCaption = loc(
    `相邻接点中心距为 ${pitch} µm。若用规则方阵铺满，每边约 1000 / ${pitch}，面密度约 ${ioDensityPerMm2(pitch).toFixed(1)} 个/mm²。`,
    `The pitch is ${pitch} µm center to center. A square array has about 1000 / ${pitch} contacts per side per millimeter, or ${ioDensityPerMm2(pitch).toFixed(1)} per mm².`,
  )
  return (
    <Diagram title={loc('互连截面与接点节距', 'Interconnect cross-section and pitch')} caption={DETAILS[kind]}>
      {hybrid && <StepControls player={player} stepLabels={BOND_STAGES} />}
      <svg className="flow-technical-svg" viewBox="0 0 490 176" role="img" aria-label={t(DETAILS[kind])} data-bond-type={kind} data-bond-joined={join}>
        <rect x="43" y="143" width="405" height="19" rx="3" fill="#336d67" />
        {wire ? <>
          <rect x="179" y="103" width="139" height="40" rx="4" fill={DIE} />
          <text x="249" y="130" textAnchor="middle" className="flow-die-label">Die</text>
          <path d="M193 102 Q141 39 86 138 M304 102 Q353 39 405 138" stroke={CU} strokeWidth="6" fill="none" />
          <path d="M201 101 H190 Q141 39 86 138 H68" stroke={GOLD} strokeWidth="3" fill="none" />
          <path d="M68 139 H99 M391 139 H420 M185 101 H207 M292 101 H314" stroke={CU} strokeWidth="5" />
          <text x="150" y="47" textAnchor="middle">{t(loc('弧形键合线', 'Bond-wire loop'))}</text>
        </> : <>
          <rect x="85" y={topY} width="320" height={upper - topY} rx="4" fill={DIE} />
          {hybrid && <rect x="85" y="102" width="320" height="38" fill="#2d4561" stroke="#7391aa" strokeWidth="1.5" />}
          <text x="245" y={topY + 24} textAnchor="middle" className="flow-die-label">Die</text>
          {[123, 183, 245, 307, 367].map((x) => <g key={x}>
            <rect x={x - 12} y={upper - 4} width="24" height="6" rx="2" fill={CU} />
            <rect x={x - 12} y="139" width="24" height="5" rx="2" fill={CU} />
            {hybrid ? <>
              <rect x={x - 9} y={upper - 11} width="18" height="10" fill={CU} />
              <rect x={x - 9} y={join ? 100 : 104} width="18" height={join ? 39 : 35} fill={CU} />
            </> : micro ? <>
              <rect x={x - 6} y={upper} width="12" height="10" fill={CU} />
              <rect x={x - 6} y={upper + 9} width="12" height="9" rx="4" fill={SOLDER} />
            </> : <ellipse cx={x} cy="123" rx="13" ry="17" fill={SOLDER} />}
          </g>)}
          {join && <path d={`M245 ${upper - 8} V145`} stroke={GOLD} strokeWidth="4" fill="none" />}
          <text x="246" y="20" textAnchor="middle">{t(hybrid ? BOND_STAGES[player.step] : micro ? loc('铜柱 + 薄焊料', 'Cu pillar + thin solder') : loc('焊料面阵凸点', 'Solder bump array'))}</text>
        </>}
      </svg>
      {wire ? <p className="flow-diagram-detail">{t(loc(`沿边缘这排焊盘的示例节距为 ${pitch} µm。每毫米接点随可用周长变化，下面的方阵面密度关系用于面阵互连。`, `The edge row here uses ${pitch} µm pitch. Available perimeter limits the number of pads. The square-array relation below applies to area arrays.`))}</p> :
        <figure className="term-fig">
          <svg className="flow-technical-svg" viewBox="0 0 320 200" role="img" aria-label={t(pitchCaption)}>
            <defs>
              <pattern id={id} width={period} height={period} patternUnits="userSpaceOnUse">
                <circle cx={period / 2} cy={period / 2} r={Math.max(.42, period * .23)} fill="#7de2cc" />
              </pattern>
            </defs>
            <rect x="18" y="14" width="160" height="160" rx="3" fill={`url(#${id})`} stroke="#7991a8" />
            <text x="98" y="192" textAnchor="middle">1 mm × 1 mm</text>
            <circle cx="225" cy="81" r="8" fill={GOLD} /><circle cx="277" cy="81" r="8" fill={GOLD} />
            <path d="M225 93 V112 H277 V93" stroke={GOLD} strokeWidth="2" fill="none" />
            <text x="250" y="136" textAnchor="middle">{pitch} µm</text>
            <text x="250" y="156" textAnchor="middle">{t(loc('局部放大', 'Detail enlarged'))}</text>
          </svg>
          <figcaption>{t(pitchCaption)}</figcaption>
        </figure>}
    </Diagram>
  )
}
