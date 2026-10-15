import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { T } from './FlowFigs'
import { C, Cap, Trace, Via, Xtal } from './LayoutFigs'

const L = {
  routeAria: loc('走线规则示意：三种拐角和两种测试点接法', 'Routing rules: three corner styles and two ways to attach a test point'),
  acute: loc('锐角：蚀刻留死角', 'Acute: etchant pocket'),
  right: loc('90°：可以接受', '90 degrees: acceptable'),
  deg45: loc('45°：首选', '45 degrees: preferred'),
  stub: loc('长分支（stub）', 'Long stub'),
  stubWhy: loc('开路末端反射', 'Open end reflects'),
  through: loc('测试点放在线上', 'Test point on the trace'),
  routeCap: loc(
    '示意（不按比例）。锐角处两条边夹出一个窄缝，蚀刻药水会积在里面；分支末端开路，信号会在那里反射；测试点放在线上，线穿过焊盘，就没有分支。',
    'Illustration (not to scale). An acute corner leaves a narrow wedge where etchant collects; a stub ends open and reflects the signal; with the test point on the trace the trace runs through the pad and there is no branch.',
  ),
  xAria: loc('晶振布局：俯视图和截面', 'Crystal placement: top view and cross-section'),
  top: loc('俯视图', 'Top view'),
  sect: loc('截面', 'Cross-section'),
  guard: loc('地铜皮保护', 'GND guard'),
  shortest: loc('尽量短', 'As short as possible'),
  solidGnd: loc('下面是完整的地，不走线', 'Solid ground below, no traces'),
  xCap: loc(
    '示意（不按比例）：晶振和两颗负载电容紧挨 MCU 的 OSC 引脚，四周用地铜皮围住（过孔接到下面的地平面）；截面里晶振正下方只有连续的地。',
    'Illustration (not to scale): the crystal and its two load capacitors sit right by the MCU OSC pins, ringed by ground copper (vias to the plane below); in the section there is only continuous ground directly under the crystal.',
  ),
  sAria: loc('地分割与分区摆放的对比', 'Comparison of a split ground and zoned placement on one ground'),
  analog: loc('模拟地', 'Analog GND'),
  digital: loc('数字地', 'Digital GND'),
  analogZone: loc('模拟区', 'Analog zone'),
  digitalZone: loc('数字区', 'Digital zone'),
  bigLoop: loc('大回路', 'Large loop'),
  smallLoop: loc('小回路', 'Small loop'),
  splitTitle: loc('分割地：回流绕大圈', 'Split ground: long detour'),
  oneTitle: loc('一块地、分区摆放', 'One ground, zoned'),
  sCap: loc(
    '示意（不按比例）：信号线要从 MCU 到 ADC。左边地被切开，只在板子下端相连，回流只能绕过去；右边地是完整的，回流紧贴走线下方。',
    'Illustration (not to scale): a signal runs from the MCU to the ADC. On the left the ground is cut and joined only at the bottom, so the return must go around; on the right the ground is solid and the return flows right under the trace.',
  ),
}

function Mark({ x, y, kind }: { x: number; y: number; kind: 'ok' | 'bad' | 'meh' }) {
  const color = kind === 'ok' ? 'var(--green)' : kind === 'bad' ? 'var(--red)' : 'var(--gold)'
  const d = kind === 'ok' ? `M${x - 6} ${y} L${x - 2} ${y + 5} L${x + 7} ${y - 6}` : kind === 'bad' ? `M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}` : `M${x - 6} ${y} H${x + 6}`
  return <path d={d} stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
}

function Panel({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
      {children}
    </g>
  )
}

export function RoutingFig() {
  const { t } = useLocale()
  const cells = [
    { x: 20, d: 'M40 50 H170 L90 120', label: L.acute, kind: 'bad' as const },
    { x: 240, d: 'M260 50 H390 V120', label: L.right, kind: 'meh' as const },
    { x: 460, d: 'M480 50 H570 L610 90 V120', label: L.deg45, kind: 'ok' as const },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 330" className="term-fig__svg" role="img" aria-label={t(L.routeAria)}>
        <rect width="680" height="330" rx="10" fill="var(--well)" />
        {cells.map((c) => (
          <g key={c.x}>
            <Panel x={c.x} y={14} w={200} h={140} />
            <Trace d={c.d} color={C.sig} w={6} />
            <Mark x={c.x + 180} y={32} kind={c.kind} />
            <T x={c.x + 100} y={146} size={10}>
              {t(c.label)}
            </T>
          </g>
        ))}
        <circle cx="158" cy="57" r="9" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeDasharray="3 2" />
        <Panel x={20} y={170} w={310} h={150} />
        <Trace d="M40 235 H310" color={C.sig} w={6} />
        <Trace d="M150 235 V290" color={C.sig} w={6} />
        <circle cx="150" cy="297" r="7" fill="none" stroke={C.pad} strokeWidth="2.4" />
        <T x={40} y={192} anchor="start" size={11} bold>
          {t(L.stub)}
        </T>
        <T x={168} y={272} anchor="start" size={10} color="var(--red-2)">
          {t(L.stubWhy)}
        </T>
        <Mark x={310} y={190} kind="bad" />
        <Panel x={350} y={170} w={310} h={150} />
        <Trace d="M370 235 H640" color={C.sig} w={6} />
        <circle cx="505" cy="235" r="9" fill="var(--card)" stroke={C.pad} strokeWidth="2.4" />
        <T x={370} y={192} anchor="start" size={11} bold>
          {t(L.through)}
        </T>
        <Mark x={640} y={190} kind="ok" />
      </svg>
      <figcaption>{t(L.routeCap)}</figcaption>
    </figure>
  )
}

export function XtalFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 270" className="term-fig__svg" role="img" aria-label={t(L.xAria)}>
        <rect width="680" height="270" rx="10" fill="var(--well)" />
        <Panel x={20} y={14} w={400} h={240} />
        <T x={32} y={32} anchor="start" size={11} color="var(--muted)">
          {t(L.top)}
        </T>
        <rect x="110" y="60" width="185" height="62" rx="4" fill="var(--green)" fillOpacity="0.08" stroke="var(--green)" strokeDasharray="4 3" />
        <T x={202} y={54} size={10} color="var(--green-2)">
          {t(L.guard)}
        </T>
        <rect x="80" y="150" width="240" height="90" rx="3" fill={C.body} stroke={C.edge} strokeWidth="1.6" />
        <T x={200} y={200} size={12}>
          MCU
        </T>
        <rect x="183.5" y="140" width="3" height="10" fill={C.pad} />
        <rect x="213.5" y="140" width="3" height="10" fill={C.pad} />
        <Trace d="M185 97 V140" color={C.sig} />
        <Trace d="M215 97 V140" color={C.sig} />
        <Trace d="M158 90 H182" color={C.sig} />
        <Trace d="M242 90 H218" color={C.sig} />
        <Trace d="M142 90 H126" color={C.gnd} />
        <Trace d="M258 90 H276" color={C.gnd} />
        <Via x={126} y={90} />
        <Via x={276} y={90} />
        <Xtal x={200} y={90} />
        <Cap x={150} y={90} />
        <Cap x={250} y={90} />
        <T x={200} y={76} size={10}>
          Y1
        </T>
        <T x={300} y={133} anchor="start" size={10}>
          {t(L.shortest)}
        </T>
        <Panel x={440} y={14} w={220} h={240} />
        <T x={452} y={32} anchor="start" size={11} color="var(--muted)">
          {t(L.sect)}
        </T>
        <rect x="450" y="132" width="200" height="34" fill="var(--blue-bg-3)" />
        <rect x="450" y="171" width="200" height="30" fill="var(--fig-box)" />
        <rect x="450" y="166" width="200" height="5" fill="var(--gold-line)" />
        <rect x="520" y="104" width="60" height="24" fill="var(--fig-box-2)" stroke={C.edge} strokeWidth="1.2" />
        <rect x="514" y="128" width="12" height="4" fill="var(--gold-line)" />
        <rect x="574" y="128" width="12" height="4" fill="var(--gold-line)" />
        <T x={550} y={98} size={10}>
          Y1
        </T>
        <T x={550} y={226} size={10} color="var(--green-2)">
          {t(L.solidGnd)}
        </T>
      </svg>
      <figcaption>{t(L.xCap)}</figcaption>
    </figure>
  )
}

function Chip({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={C.body} stroke={C.edge} strokeWidth="1.4" />
      <T x={x + w / 2} y={y + h / 2 + 4} size={11}>
        {label}
      </T>
    </g>
  )
}

export function SplitFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(L.sAria)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        <rect x="36" y="44" width="128" height="190" fill="var(--blue)" fillOpacity="0.12" stroke="var(--line-2)" />
        <rect x="172" y="44" width="140" height="190" fill="var(--purple)" fillOpacity="0.12" stroke="var(--line-2)" />
        <rect x="164" y="190" width="8" height="44" fill="var(--text-2)" fillOpacity="0.35" />
        <rect x="164" y="44" width="8" height="146" fill="var(--red)" fillOpacity="0.15" stroke="var(--red)" strokeDasharray="4 3" />
        <polygon points="95,100 252,100 252,212 95,212" fill="var(--red)" fillOpacity="0.12" />
        <T x={100} y={62} size={10}>
          {t(L.analog)}
        </T>
        <T x={242} y={62} size={10}>
          {t(L.digital)}
        </T>
        <Chip x={70} y={90} w={50} h={40} label="ADC" />
        <Chip x={222} y={90} w={60} h={40} label="MCU" />
        <Trace d="M120 100 H222" color={C.sig} w={3} />
        <path d="M100 130 V212 H252 V130" fill="none" stroke="var(--sky)" strokeWidth="2.4" strokeDasharray="5 3" />
        <T x={210} y={170} size={11} color="var(--red-2)" bold>
          {t(L.bigLoop)}
        </T>
        <T x={36} y={262} anchor="start" size={11} bold>
          {t(L.splitTitle)}
        </T>
        <rect x="366" y="44" width="128" height="190" fill="var(--blue)" fillOpacity="0.12" stroke="var(--line-2)" />
        <rect x="494" y="44" width="148" height="190" fill="var(--purple)" fillOpacity="0.12" stroke="var(--line-2)" />
        <T x={430} y={62} size={10}>
          {t(L.analogZone)}
        </T>
        <T x={568} y={62} size={10}>
          {t(L.digitalZone)}
        </T>
        <Chip x={400} y={90} w={50} h={40} label="ADC" />
        <Chip x={552} y={90} w={60} h={40} label="MCU" />
        <Trace d="M450 100 H552" color={C.sig} w={3} />
        <path d="M450 108 H552" fill="none" stroke="var(--sky)" strokeWidth="2.4" strokeDasharray="5 3" />
        <T x={501} y={150} size={11} color="var(--green-2)" bold>
          {t(L.smallLoop)}
        </T>
        <T x={366} y={262} anchor="start" size={11} bold>
          {t(L.oneTitle)}
        </T>
      </svg>
      <figcaption>{t(L.sCap)}</figcaption>
    </figure>
  )
}
