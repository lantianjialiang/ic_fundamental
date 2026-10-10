import { loc, type LText } from '../../i18n/locale'
import { type AdvId } from './data/content'

type T = (text: LText | string) => string

const CAPTION: Record<AdvId, LText> = {
  mux: loc('D 前加 2 选 1。SE 选功能还是扫描。LSSD 是两级锁存的另一路实现。'),
  multi: loc('一条超长链切成许多短链并行 Shift，时间按链数下降。'),
  comp: loc('外面很少 SI/SO，里面很多短链。先解压摊开，再压缩收拢。'),
  speed: loc('两拍：发射 + 快时钟 Capture。LOS 用移位末拍，LOC 用功能第一拍。'),
  bscan: loc('脚旁边一圈单元，走 TDI/TDO。测板级连线，不是片内 AND。'),
  lbist: loc('片上 PRPG 出激励，MISR 收签名。ATE 往往只比最后那个数。'),
  occ: loc('ATE 给慢控制，片上 PLL 打两拍快时钟做 launch / capture。'),
  xmask: loc('不确定的位掩掉，不参与 Compare，避免好芯片被 X 误杀。'),
}

export function ScanKindFig({ id, t }: { id: AdvId; t: T }) {
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 220" className="term-fig__svg" role="img" aria-label={t(CAPTION[id])}>
        <rect width="680" height="220" rx="6" fill="var(--well)" />
        {draw(id, t)}
      </svg>
      <figcaption>{t(CAPTION[id])}</figcaption>
    </figure>
  )
}

function box(x: number, y: number, w: number, h: number, label: string, fill = 'var(--fig-box-2)') {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke="var(--line-2)" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="var(--text)" fontSize="13">
        {label}
      </text>
    </g>
  )
}

function arrow(x1: number, y1: number, x2: number, y2: number) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="1.6" />
      <path d={`M ${x2} ${y2} l -7 -4 v 8 z`} fill="var(--gold)" />
    </g>
  )
}

function draw(id: AdvId, t: T) {
  if (id === 'mux') {
    return (
      <g>
        {box(40, 70, 90, 50, 'D / SI')}
        {arrow(140, 95, 190, 95)}
        {box(198, 60, 110, 70, 'MUX')}
        {arrow(318, 95, 368, 95)}
        {box(376, 60, 110, 70, 'FF')}
        {arrow(496, 95, 546, 95)}
        {box(554, 70, 90, 50, 'Q')}
        <text x="340" y="170" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('Muxed-D。LSSD = 主从锁存 + 两相时钟，思想相同。'))}
        </text>
      </g>
    )
  }
  if (id === 'multi') {
    return (
      <g>
        {box(40, 36, 70, 40, 'SI0')}
        {box(130, 36, 360, 40, 'FF  FF  FF  FF')}
        {box(510, 36, 70, 40, 'SO0')}
        {box(40, 92, 70, 40, 'SI1')}
        {box(130, 92, 360, 40, 'FF  FF  FF  FF')}
        {box(510, 92, 70, 40, 'SO1')}
        {box(40, 148, 70, 40, 'SI2')}
        {box(130, 148, 360, 40, 'FF  FF  FF  FF')}
        {box(510, 148, 70, 40, 'SO2')}
      </g>
    )
  }
  if (id === 'comp') {
    return (
      <g>
        {box(24, 80, 90, 50, '少 SI')}
        {arrow(124, 105, 168, 105)}
        {box(176, 70, 110, 70, t(loc('解压')))}
        {arrow(296, 105, 340, 105)}
        {box(348, 50, 140, 110, t(loc('很多短链')))}
        {arrow(498, 105, 542, 105)}
        {box(550, 70, 110, 70, t(loc('压缩')))}
      </g>
    )
  }
  if (id === 'speed') {
    return (
      <g>
        <text x="50" y="50" fill="var(--muted)" fontSize="12">
          CLK
        </text>
        <path d="M 50 70 H 160 V 40 H 220 V 70 H 400 V 40 H 460 V 70 H 620" fill="none" stroke="var(--gold)" strokeWidth="1.8" />
        <text x="168" y="120" fill="var(--sky)" fontSize="12">
          launch
        </text>
        <text x="408" y="120" fill="var(--green)" fontSize="12">
          Capture
        </text>
        <text x="340" y="170" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('两拍要快。LOS = 移位末拍发射；LOC = 功能拍发射。'))}
        </text>
      </g>
    )
  }
  if (id === 'bscan') {
    return (
      <g>
        {box(240, 60, 200, 80, t(loc('芯片内核')))}
        <rect x="210" y="36" width="260" height="128" fill="none" stroke="var(--gold)" strokeDasharray="4 3" />
        <text x="340" y="28" textAnchor="middle" fill="var(--gold)" fontSize="12">
          Boundary Scan
        </text>
        <text x="80" y="100" fill="var(--sky)" fontSize="12">
          TDI
        </text>
        {arrow(110, 96, 200, 96)}
        {arrow(480, 96, 560, 96)}
        <text x="570" y="100" fill="var(--sky)" fontSize="12">
          TDO
        </text>
        <text x="340" y="190" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('围在封装脚上，查板级虚焊 / 开路。'))}
        </text>
      </g>
    )
  }
  if (id === 'lbist') {
    return (
      <g>
        {box(40, 70, 130, 70, 'PRPG')}
        {arrow(180, 105, 230, 105)}
        {box(238, 70, 160, 70, t(loc('逻辑')))}
        {arrow(408, 105, 458, 105)}
        {box(466, 70, 130, 70, 'MISR')}
        <text x="340" y="180" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('片上自测。ATE 常只比最后的签名。'))}
        </text>
      </g>
    )
  }
  if (id === 'occ') {
    return (
      <g>
        {box(40, 70, 140, 70, 'ATE 慢时钟')}
        {arrow(190, 105, 250, 105)}
        {box(258, 60, 160, 90, 'OCC / PLL', 'var(--gold-bg-2)')}
        {arrow(428, 105, 488, 105)}
        {box(496, 70, 150, 70, t(loc('两拍快时钟')))}
      </g>
    )
  }
  return (
    <g>
      <text x="50" y="70" fill="var(--muted)" fontSize="12">
        SO
      </text>
      <path d="M 50 100 H 200 V 70 H 280 V 100 H 400 V 70 H 620" fill="none" stroke="var(--blue)" strokeWidth="2" />
      <rect x="250" y="55" width="50" height="60" fill="var(--red-bg)" opacity="0.85" />
      <text x="275" y="90" textAnchor="middle" fill="var(--red)" fontSize="12">
        X
      </text>
      <text x="340" y="170" textAnchor="middle" fill="var(--muted)" fontSize="12">
        {t(loc('这一位不确定，掩掉，不拿来判 Pass / Fail。'))}
      </text>
    </g>
  )
}
