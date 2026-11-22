import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram } from './FlowVisuals'

const WAFER_SITES = [64, 145, 226, 307]
const BUMP_SITES = [185, 209, 233, 257]
const BALL_SITES = [103, 161, 219, 277, 335]

const STEPS = [
  loc('从背面磨掉一层硅。虚线是减薄前的背面，四颗裸片仍由同一片硅连在一起。', 'Grinding removes silicon from the back. The dashed line marks the original backside. All four dies are still part of one wafer.'),
  loc('晶圆转为有效面朝上，沿切割道划开硅。切割胶带托住分开的裸片，此时可独立取下一颗。', 'The wafer is mounted face-up and cut along the streets. Dicing tape supports the separated dies, which can now be picked individually.'),
  loc('用贴片胶将一颗裸片固定在基板上，有效面朝上。图中两侧焊盘留给下一步接线。', 'Die attach fixes one die face-up on the substrate. The outer pads are ready for wire bonding.'),
  loc('把裸片顶面的焊盘用键合线接到基板两侧。焊线的两端现在都有电气连接。', 'Bond wires connect the top die pads to the outer substrate fingers. Both ends of each wire are now electrically joined.'),
  loc('塑封包住裸片和两侧焊线。看得到的浅色轮廓是模封后的外形。', 'Mold compound encloses the die and the bond wires. The light outline is the new outside profile.'),
  loc('在基板底部球焊盘植球并回流，形成连接系统板的 BGA 端子。', 'Solder balls are placed and reflowed onto the bottom lands to form the BGA terminals.'),
  loc('在封装顶面打上可追溯标识。底部的球阵和内部互连延续上一工序状态。', 'A traceability mark goes on the top. The ball array and internal connections carry over from the previous step.'),
]

const FLIP_STEPS = [
  loc('将裸片翻面并对准基板焊盘。图中凸点下仍有间隙，表示放置完成、焊点尚未回流连接。', 'The die is turned face-down and aligned. The gap below the bumps represents placement before the solder joints are reflowed.'),
  loc('回流形成凸点焊点，把芯片有效面接到基板。横向间隙留给下一步的底部填充。', 'Reflow joins the bumps between the active face and substrate. The gaps between the bumps remain available for underfill.'),
  loc('底填胶进入芯片和基板间隙并包围凸点，以分散热机械应力。图中也示意这条路线的外部保护体。', 'Underfill surrounds the bumps in the die-to-substrate gap to distribute thermomechanical stress. The outer protection shown here is part of this example flow.'),
]

export function AssemblySection({ flip, stage }: { flip: boolean; stage: number }) {
  const { t } = useLocale()
  const wafer = stage < 2
  const separated = stage === 1
  const wired = stage >= 3
  const protectedDie = stage >= 4
  const balled = stage >= 5
  const marked = stage === 6
  const dieY = flip ? 101 : 112
  const dieBottom = dieY + 25
  const caption = flip && stage >= 2 && stage <= 4 ? FLIP_STEPS[stage - 2] : STEPS[stage]
  const gold = '#ffdb83'
  const copper = '#c98b5b'
  return (
    <Diagram title={loc('这一工序改变了哪里', 'What changes in this stage')} caption={caption}>
      <svg className="flow-technical-svg" viewBox="0 0 440 228" role="img" aria-label={t(caption)}
        data-stage={stage} data-assembly={flip ? 'flip' : 'wire'}>
        {wafer ? <>
          <rect x="59" y="165" width="322" height="17" rx="4" fill="#675282" />
          <text x="220" y="205" textAnchor="middle">{t(separated ? loc('切割胶带', 'Dicing tape') : loc('减薄保护胶带', 'Backgrind tape'))}</text>
          {separated ? <>
            {WAFER_SITES.map((x, i) => <rect key={x} x={x} y="127" width="68" height="38" rx="2"
              fill="#88aaf2" stroke={i === 1 ? gold : '#496d97'} strokeWidth="2" />)}
            <path d="M215 84 V161 M208 151 L215 161 L222 151" fill="none" stroke={gold} strokeWidth="3" />
            <text x="215" y="68" textAnchor="middle">{t(loc('切割道贯穿硅', 'Saw street through silicon'))}</text>
          </> : <>
            <rect x="64" y="91" width="311" height="74" fill="none" stroke="#9cb5ce" strokeDasharray="6 5" />
            <rect x="64" y="127" width="311" height="38" rx="2" fill="#88aaf2" />
            <path d="M64 127 H375" stroke={gold} strokeWidth="4" />
            <path d="M219 76 V120 M211 112 L219 120 L227 112" fill="none" stroke={gold} strokeWidth="3" />
            <text x="219" y="57" textAnchor="middle">{t(loc('背面减薄', 'Backside thinning'))}</text>
          </>}
          {WAFER_SITES.map((x) => <rect key={x} x={x + 8} y={separated ? 131 : 157} width="50" height="5" rx="2" fill="#293f72" />)}
        </> : <>
          {protectedDie && <path data-feature="mold" d="M78 148 V96 Q78 78 98 78 H342 Q362 78 362 96 V148Z"
            fill="#334b63" stroke={stage === 4 ? gold : '#6d8eaa'} strokeWidth="2" />}
          <rect x="65" y="148" width="310" height="24" rx="3" fill="#38736f" />
          <text x="220" y="165" textAnchor="middle">{t(loc('封装基板', 'Package substrate'))}</text>
          <rect x="168" y={dieY} width="104" height="25" rx="3" fill="#88aaf2" stroke={stage === 2 ? gold : '#5878ae'} strokeWidth="2" />
          <text x="220" y={dieY + 17} textAnchor="middle" className="flow-die-label">{t(loc('裸片', 'Die'))}</text>
          {flip ? <>
            {protectedDie && <rect data-feature="underfill" x="164" y={dieBottom} width="112" height={148 - dieBottom} rx="4" fill="#977fc6"
              stroke={stage === 4 ? gold : undefined} strokeWidth="2" />}
            {BUMP_SITES.map((x) => <g key={x}>
              <rect x={x - 7} y="144" width="14" height="4" fill={copper} />
              <rect data-feature="bump" x={x - 5} y={dieBottom} width="10" height={wired ? 20 : 10} rx="4" fill={stage === 3 ? gold : copper} />
            </g>)}
          </> : <>
            <rect x="168" y={dieBottom} width="104" height={148 - dieBottom} fill="#977fc6" />
            <path d="M105 146 H121 M319 146 H335 M171 111 H185 M255 111 H269" stroke={copper} strokeWidth="4" />
            {wired && <path data-feature="wires" d="M178 111 Q141 69 113 146 M262 111 Q299 69 327 146"
              fill="none" stroke={stage === 3 ? gold : copper} strokeWidth="4" strokeLinecap="round" />}
          </>}
          {BALL_SITES.map((x) => <g key={x}>
            <rect x={x - 10} y="171" width="20" height="5" rx="2" fill={copper} />
            {balled && <circle data-feature="ball" cx={x} cy="184" r="9" fill={stage === 5 ? gold : copper} />}
          </g>)}
          {marked && <g data-feature="mark">
            <path d="M220 30 V69 M211 64 L220 73 L229 64" stroke={gold} strokeWidth="3" fill="none" />
            <rect x="185" y="72" width="70" height="18" rx="3" fill="#112030" stroke={gold} strokeWidth="2" />
            <text x="220" y="86" textAnchor="middle">A017</text>
          </g>}
        </>}
      </svg>
    </Diagram>
  )
}
