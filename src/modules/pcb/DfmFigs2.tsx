import { PCB } from './DfmFigs'

/* 找错用的双层板俯视图：静态图形。viewBox 760 x 390，板子 20..740 x 20..370。
   所有文字都是位号，不含中英文句子。 */

const TRACE = 3

function Pad({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={PCB.copper} />
}

function Label({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={PCB.silk} fontSize="10" fontFamily="var(--mono)">
      {children}
    </text>
  )
}

function Mount({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="7" fill={PCB.hole} stroke={PCB.silk} strokeWidth="1" strokeDasharray="2 2" />
}

/* U1：QFP，每边 8 脚 */
function Qfp() {
  const ys = Array.from({ length: 8 }, (_, i) => 162 + i * 8)
  const xs = Array.from({ length: 8 }, (_, i) => 336 + i * 8)
  return (
    <g>
      {ys.map((y) => (
        <g key={y}>
          <Pad x={320} y={y - 1.5} w={8} h={3} />
          <Pad x={392} y={y - 1.5} w={8} h={3} />
        </g>
      ))}
      {xs.map((x) => (
        <g key={x}>
          <Pad x={x - 1.5} y={150} w={3} h={8} />
          <Pad x={x - 1.5} y={222} w={3} h={8} />
        </g>
      ))}
      <rect x={328} y={158} width={64} height={64} rx="3" fill={PCB.body} stroke="var(--text-2)" strokeWidth="1" />
      <circle cx={338} cy={168} r="3" fill={PCB.silk} />
      <Label x={360} y={144}>
        U1
      </Label>
    </g>
  )
}

/* U2：SOIC-8，引脚间距 1.27 mm，焊盘却按 1.0 mm 画：外侧引脚偏出焊盘 */
function Soic() {
  const lead = [-22.8, -7.6, 7.6, 22.8]
  const pad = [-18, -6, 6, 18]
  const cx = 560
  return (
    <g>
      {pad.map((p) => (
        <g key={p}>
          <Pad x={cx + p - 3} y={48} w={6} h={12} />
          <Pad x={cx + p - 3} y={100} w={6} h={12} />
        </g>
      ))}
      <rect x={cx - 32} y={62} width={64} height={36} rx="2" fill={PCB.body} stroke="var(--text-2)" strokeWidth="1" />
      {lead.map((p) => (
        <g key={p}>
          <rect x={cx + p - 2.5} y={56} width={5} height={8} fill={PCB.lead} />
          <rect x={cx + p - 2.5} y={96} width={5} height={8} fill={PCB.lead} />
        </g>
      ))}
      <circle cx={cx - 24} cy={70} r="2.5" fill={PCB.silk} />
      <Label x={cx + 52} y={84} anchor="start">
        U2
      </Label>
    </g>
  )
}

/* R1：丝印框和位号压在焊盘上；R2：丝印画在两个焊盘之间，是对照 */
function Resistors() {
  return (
    <g>
      <Pad x={460} y={128} w={12} h={14} />
      <Pad x={488} y={128} w={12} h={14} />
      <rect x={470} y={129} width={20} height={12} fill={PCB.body} />
      <rect x={456} y={124} width={48} height={22} fill="none" stroke={PCB.silk} strokeWidth="1.5" />
      <Label x={480} y={138}>
        R1
      </Label>
      <Pad x={460} y={93} w={12} h={14} />
      <Pad x={488} y={93} w={12} h={14} />
      <rect x={470} y={94} width={20} height={12} fill={PCB.body} />
      <path d="M474 89 H486 M474 111 H486" stroke={PCB.silk} strokeWidth="1.5" />
      <Label x={480} y={84}>
        R2
      </Label>
    </g>
  )
}

/* D1：丝印两头一样；D2：阴极端有粗线，对照 */
function Diodes() {
  return (
    <g>
      {[110, 190].map((cx) => (
        <g key={cx}>
          <Pad x={cx - 20} y={63} w={10} h={14} />
          <Pad x={cx + 10} y={63} w={10} h={14} />
          <rect x={cx - 12} y={64} width={24} height={12} fill={PCB.body} />
          <rect x={cx - 22} y={60} width={44} height={20} fill="none" stroke={PCB.silk} strokeWidth="1" />
        </g>
      ))}
      <rect x={197} y={64} width={4} height={12} fill={PCB.silk} opacity="0.85" />
      <path d="M215 60 V80" stroke={PCB.silk} strokeWidth="3" />
      <Label x={110} y={54}>
        D1
      </Label>
      <Label x={190} y={54}>
        D2
      </Label>
    </g>
  )
}

/* 电源区的两个测试点：板上只有这两个 */
function TestPoints() {
  return (
    <g>
      {[255, 295].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={70} r="7" fill={PCB.gold} />
          <Label x={cx} y={92}>
            {`TP${i + 1}`}
          </Label>
        </g>
      ))}
    </g>
  )
}

/* 两个过孔：左边孔环只剩一点点还偏出焊盘，右边孔很小 */
function Vias() {
  return (
    <g>
      <path d={`M150 130 H100`} stroke={PCB.copper} strokeWidth={TRACE} />
      <path d={`M185 130 H230`} stroke={PCB.copper} strokeWidth={TRACE} />
      <circle cx={150} cy={130} r="8" fill={PCB.copper} />
      <circle cx={152} cy={130} r="6.7" fill={PCB.hole} />
      <circle cx={185} cy={130} r="6" fill={PCB.copper} />
      <circle cx={185} cy={130} r="2" fill={PCB.hole} />
    </g>
  )
}

/* 一根线以约 34° 并进另一根线，夹出窄楔形 */
function AcidTrap() {
  return (
    <g stroke={PCB.copper} strokeWidth={TRACE} fill="none" strokeLinejoin="miter">
      <path d="M60 230 H300 L312 218 H322" />
      <path d="M80 290 L170 230" />
      <circle cx={80} cy={290} r="7" fill={PCB.copper} stroke="none" />
      <circle cx={80} cy={290} r="2.5" fill={PCB.hole} stroke="none" />
      <circle cx={60} cy={230} r="6" fill={PCB.copper} stroke="none" />
    </g>
  )
}

/* SWD / 复位三根线从 U1 一路走到 J2，中间没有任何测试点 */
function SwdTraces() {
  const ys = [170, 186, 202]
  const names = ['SWDIO', 'SWCLK', 'NRST']
  return (
    <g>
      {ys.map((y, i) => (
        <g key={y}>
          <path d={`M400 ${y} H706`} stroke={PCB.copper} strokeWidth={TRACE} />
          <Label x={560} y={y - 4} anchor="start">
            {names[i]}
          </Label>
          <circle cx={706} cy={y} r="5" fill={PCB.copper} />
          <circle cx={706} cy={y} r="2" fill={PCB.hole} />
        </g>
      ))}
      <rect x={696} y={158} width={22} height={56} fill="none" stroke={PCB.silk} strokeWidth="1" />
      <Label x={707} y={152}>
        J2
      </Label>
    </g>
  )
}

/* 底部大 GND 铺铜：C5 右焊盘整块并进铜皮，C6 用带辐条的花焊盘 */
function PourAndCaps() {
  return (
    <g>
      <rect x={470} y={258} width={210} height={94} fill={PCB.copper} fillOpacity="0.5" stroke={PCB.copper} strokeWidth="1" />
      <Label x={640} y={276}>
        GND
      </Label>
      <path d="M410 285 H430" stroke={PCB.copper} strokeWidth="2" />
      <Pad x={430} y={278} w={14} h={14} />
      <Pad x={458} y={278} w={14} h={14} />
      <rect x={442} y={279} width={18} height={12} fill={PCB.body} />
      <Label x={451} y={272}>
        C5
      </Label>
      <rect x={466} y={311} width={66} height={28} fill={PCB.mask} />
      <path d="M410 325 H484" stroke={PCB.copper} strokeWidth="2" />
      <Pad x={482} y={318} w={14} h={14} />
      <Pad x={510} y={318} w={14} h={14} />
      <path d="M517 311 V318 M517 332 V339 M524 325 H532" stroke={PCB.copper} strokeWidth="4" />
      <rect x={494} y={319} width={18} height={12} fill={PCB.body} />
      <Label x={448} y={319}>
        C6
      </Label>
    </g>
  )
}

/* U3：QFN，散热焊盘上 5 个没塞孔的过孔 */
function Qfn() {
  const vias: Array<[number, number]> = [[262, 302], [278, 302], [270, 310], [262, 318], [278, 318]]
  const cx = Array.from({ length: 5 }, (_, i) => 252 + i * 9)
  const cy = Array.from({ length: 5 }, (_, i) => 292 + i * 9)
  return (
    <g>
      {cx.map((p) => (
        <g key={p}>
          <Pad x={p - 1.5} y={276} w={3} h={7} />
          <Pad x={p - 1.5} y={337} w={3} h={7} />
        </g>
      ))}
      {cy.map((p) => (
        <g key={p}>
          <Pad x={238} y={p - 1.5} w={7} h={3} />
          <Pad x={295} y={p - 1.5} w={7} h={3} />
        </g>
      ))}
      <rect x={242} y={282} width={56} height={56} fill={PCB.body} stroke="var(--text-2)" strokeWidth="1" />
      <rect x={255} y={295} width={30} height={30} fill={PCB.lead} />
      {vias.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="3.6" fill={PCB.copper} />
          <circle cx={x} cy={y} r="1.6" fill={PCB.hole} />
        </g>
      ))}
      <circle cx={247} cy={287} r="2" fill={PCB.silk} />
      <Label x={270} y={268}>
        U3
      </Label>
    </g>
  )
}

/* C7、C8：贴着板边（板边 y = 370） */
function EdgeCaps() {
  return (
    <g>
      {[64, 118].map((x, i) => (
        <g key={x}>
          <Pad x={x} y={354} w={12} h={12} />
          <Pad x={x + 26} y={354} w={12} h={12} />
          <rect x={x + 10} y={355} width={18} height={10} fill={PCB.body} />
          <Label x={x + 19} y={348}>
            {`C${i + 7}`}
          </Label>
        </g>
      ))}
    </g>
  )
}

export function BoardArt() {
  return (
    <g>
      <rect x={20} y={20} width={720} height={350} rx="6" fill={PCB.mask} stroke="var(--text-2)" strokeWidth="1.5" />
      {[44, 716].flatMap((x) => [44, 346].map((y) => <Mount key={`${x}-${y}`} x={x} y={y} />))}
      <Diodes />
      <TestPoints />
      <Vias />
      <Resistors />
      <Soic />
      <Qfp />
      <AcidTrap />
      <SwdTraces />
      <PourAndCaps />
      <Qfn />
      <EdgeCaps />
    </g>
  )
}
