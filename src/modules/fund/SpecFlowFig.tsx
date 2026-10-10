import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

type Kind = 'design' | 'test' | 'device' | string

const L = {
  design: loc('设计规格'),
  circuit: loc('电路设计 / 仿真'),
  chip: loc('芯片'),
  device: loc('数据手册'),
  test: loc('测试规格'),
  program: loc('测试程序'),
  ate: loc('ATE 判 Pass / Fail'),
  contract: loc('合同：客户照它设计系统，出货芯片必须满足'),
  cap: loc('设计规格驱动芯片；数据手册是对外承诺；测试规格把承诺翻译成测试程序，在 ATE 上逐颗兑现。'),
}

export function SpecFlowFig({ active }: { active: Kind }) {
  const { t } = useLocale()
  const on = (id: Kind) => active === id
  const box = (x: number, y: number, w: number, text: string, id?: Kind, color = 'var(--blue)') => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={40}
        rx={8}
        fill={id && on(id) ? 'var(--gold-bg)' : 'var(--card)'}
        stroke={id && on(id) ? 'var(--gold)' : color}
        strokeWidth={id && on(id) ? 2 : 1}
      />
      <text x={x + w / 2} y={y + 25} textAnchor="middle" fill="var(--text)" fontSize="13">
        {text}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#sf-arrow)" />
  )
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 230" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <defs>
          <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>
        <rect width="680" height="230" rx="10" fill="var(--well)" />
        {box(30, 30, 130, t(L.design), 'design')}
        {arrow(160, 50, 220, 50)}
        {box(220, 30, 160, t(L.circuit))}
        {arrow(380, 50, 470, 50)}
        {box(470, 30, 170, t(L.chip), undefined, 'var(--green)')}
        {box(30, 150, 130, t(L.device), 'device')}
        {arrow(160, 170, 220, 170)}
        {box(220, 150, 110, t(L.test), 'test')}
        {arrow(330, 170, 360, 170)}
        {box(360, 150, 100, t(L.program))}
        {arrow(460, 170, 490, 170)}
        {box(490, 150, 150, t(L.ate), undefined, 'var(--green)')}
        {arrow(565, 150, 565, 74)}
        <line x1="95" y1="150" x2="95" y2="96" stroke="var(--gold)" strokeDasharray="5 4" />
        <text x="105" y="122" fill="var(--gold)" fontSize="12">
          {t(L.contract)}
        </text>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
