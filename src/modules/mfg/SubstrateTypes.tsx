import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram, DiagramChoices } from './FlowVisuals'

export type SubstrateKind = 'lf' | 'org' | 'cer'

const STEPS = [
  { id: 'die', title: loc('1 裸片焊盘', '1 Die pad') },
  { id: 'route', title: loc('2 封装内布线', '2 Package routing') },
  { id: 'terminal', title: loc('3 外部端子', '3 External terminal') },
] as const
type SignalStep = (typeof STEPS)[number]['id']

const ROUTES = {
  lf: [
    ['M207 106 Q155 64 107 151', 107, 151, loc('芯片有效面朝上。键合线从芯片边缘的焊盘接到引线框架的内脚。', 'The die faces up. A bond wire joins its edge pad to the inner lead finger.')],
    ['M107 151 H66 Q60 151 60 160 L52 197 Q50 202 44 202 H32', 32, 202, loc('引线框架的内脚与外露引脚是一片成形金属。电流沿金属向封装两侧走。', 'The inner finger and external lead are one formed piece of metal. The signal travels along it toward the package edge.')],
    ['M32 202 V212 H22', 22, 212, loc('外露引脚经焊料接到 PCB 表面的焊盘。芯片下的承载台在本例只显示机械支撑。', 'The outer lead is soldered to a PCB land. The die paddle in this example shows the mechanical support.')],
  ],
  org: [
    ['M207 127 V148', 207, 148, loc('裸片有效面朝下。焊盘通过凸点把信号送到基板顶层。', 'The die faces down. A bump takes the signal from the die pad to the top of the substrate.')],
    ['M207 148 H183 V160 H160 V180 H137 V195', 137, 195, loc('顶层铜线向外扇出，微孔连接积层。穿芯孔连接芯板两侧，再由底层铜线走到球焊盘。', 'Top copper fans out. Microvias join the build-up layers, a core via crosses the core, and bottom copper reaches the ball pad.')],
    ['M137 195 V212 H119', 119, 212, loc('球焊盘通过 BGA 焊球接到 PCB。图中封装端子的节距大于裸片凸点节距。', 'The ball pad connects to the PCB through a BGA solder ball. The package terminals are drawn at a coarser pitch than the die bumps.')],
  ],
  cer: [
    ['M207 106 Q160 68 125 146', 125, 146, loc('这款带盖陶瓷封装用键合线把朝上的芯片焊盘接到陶瓷顶层金属。', 'This lidded ceramic package uses a bond wire to join a face-up die pad to top metallization.')],
    ['M125 146 H108 V166 H148 V197', 148, 197, loc('导电通孔和埋入的金属层把信号穿过叠层陶瓷，引到底面金属焊盘。', 'Conductive vias and buried metal route through the ceramic stack to the bottom land.')],
    ['M148 197 V212 H130', 130, 212, loc('这里画的是陶瓷 LGA，底部的平面焊盘通过薄焊点接板。', 'This is a ceramic LGA example. Its flat land reaches the board through a thin solder joint.')],
  ],
} as const

export function SubstrateSignalPath({ kind }: { kind: SubstrateKind }) {
  const { t } = useLocale()
  const [step, setStep] = useState<SignalStep>('die')
  const index = STEPS.findIndex(({ id }) => id === step)
  const route = ROUTES[kind]
  const [, endX, endY, explanation] = route[index]
  const flip = kind === 'org'
  const title = loc('沿一根信号看三类封装', 'Follow one signal through the package')
  const board = kind === 'lf' ? [38, 402] : kind === 'org' ? [137, 220, 303] : [148, 220, 292]

  return (
    <Diagram title={title} caption={loc('三种结构共用裸片、PCB 位置和观察方向。金线标出本步，青线是前一步已走过的连接。截面为结构示意。', 'The die, PCB and viewing direction stay fixed. Gold shows the current step, and teal shows the path already traced. The sections are schematic.')}>
      <DiagramChoices label={loc('追踪信号位置', 'Trace the signal')} items={STEPS} value={step} onPick={setStep} />
      <svg className="flow-technical-svg" viewBox="0 0 440 247" role="img" aria-label={t(explanation)} data-kind={kind}>
        <rect x="18" y="214" width="404" height="22" rx="3" fill="#255d55" />
        {board.map((x) => <rect key={x} x={x - 16} y="209" width="32" height="6" rx="2" fill="#ce9563" />)}
        <text x="220" y="230" textAnchor="middle">PCB</text>
        {kind === 'lf' && <>
          <path d="M73 153 V91 Q73 77 87 77 H353 Q367 77 367 91 V153Z" fill="#2e455d" stroke="#56758f" strokeWidth="2" />
          <rect x="177" y="128" width="86" height="14" rx="2" fill="#be8859" />
          <path d={ROUTES.lf[1][0]} fill="none" stroke="#be8859" strokeWidth="9" />
          <path d="M333 151 H374 Q380 151 380 160 L388 197 Q390 202 396 202 H409" fill="none" stroke="#be8859" strokeWidth="9" />
          {[38, 402].map((x) => <rect key={x} x={x - 14} y="202" width="28" height="8" rx="2" fill="#adbac8" />)}
          <text x="220" y="62" textAnchor="middle">{t(loc('塑封体', 'Mold compound'))}</text>
        </>}
        {kind === 'org' && <>
          <rect x="101" y="150" width="238" height="45" rx="3" fill="#496c91" />
          <path d="M102 160 H338 M102 180 H338" stroke="#9db6cc" strokeWidth="2" />
          {[207, 220, 233, 246].map((x) => <rect key={x} x={x - 5} y="127" width="10" height="24" rx="5" fill="#be8859" />)}
          {[137, 220, 303].map((x) => <rect key={x} x={x - 9} y="193" width="18" height="17" rx="8" fill="#be8859" />)}
          <text x="326" y="106" textAnchor="end">{t(loc('凸点朝下', 'Bumps face down'))}</text>
          <text x="322" y="176" textAnchor="end">{t(loc('积层与芯板', 'Build-up & core'))}</text>
        </>}
        {kind === 'cer' && <>
          <path d="M94 147 V78 H346 V147" fill="none" stroke="#9bb3c9" strokeWidth="8" strokeLinejoin="round" />
          <rect x="97" y="147" width="246" height="48" rx="3" fill="#8b775e" />
          <rect x="188" y="128" width="64" height="19" rx="2" fill="#626779" />
          <path d="M98 163 H342 M98 179 H342" stroke="#cdbb9a" strokeWidth="2" />
          {[148, 220, 292].map((x) => <rect key={x} x={x - 13} y="193" width="26" height="13" rx="2" fill="#be8859" />)}
          <text x="220" y="66" textAnchor="middle">{t(loc('盖板与空腔', 'Lid & cavity'))}</text>
          <text x="328" y="176" textAnchor="end">{t(loc('叠层陶瓷', 'Ceramic stack'))}</text>
        </>}
        <rect x="188" y="107" width="64" height="21" rx="3" fill="#88aaf2" />
        <text x="220" y="122" textAnchor="middle" className="flow-die-label">{t(loc('裸片', 'Die'))}</text>
        <circle cx="207" cy={flip ? 128 : 106} r="4" fill="#ffd38d" />
        {route.map(([path], i) => <path key={path} d={path} fill="none"
          stroke={i === index ? '#ffdb83' : i < index ? '#72dec8' : '#8094aa'}
          strokeWidth={i === index ? 5 : 3} strokeDasharray={i > index ? '5 5' : undefined}
          strokeLinecap="round" strokeLinejoin="round" />)}
        <circle cx={endX} cy={endY} r="6" fill="#ffdb83" stroke="#112030" strokeWidth="2" />
      </svg>
      <p className="flow-diagram-detail" aria-live="polite">{t(explanation)}</p>
    </Diagram>
  )
}
