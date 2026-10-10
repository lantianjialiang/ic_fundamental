import { loc, type LText } from '../../i18n/locale'
import { type ConceptId } from './data/content'

type ConceptFigProps = {
  id: ConceptId
  t: (text: LText | string) => string
}

const CAPTION: Record<ConceptId, LText> = {
  func: loc('按真值表一行写成一条向量。XOR 四行就是四条 Functional Pattern。'),
  algo: loc('规则阵列：按地址现场算下一拍。不列每个门的故障。'),
  fault: loc('先假设电路会怎样坏，才能说“测完了”。没有模型就没有覆盖率。'),
  stuck: loc('例子：AND 的 Y 粘在 1。Pattern 10 期望 0；坏了仍是 1。'),
  tran: loc('例子：Y 慢升。V1 放到 0，V2 再打 11 让它升，快时钟 Capture。'),
  atpg: loc('网表 + 故障列表 → 激活 / 传播 / 反推 → Pattern 文件给 ATE。'),
  dft: loc('设计时给 FF 加 Scan。没有结构，ATPG 不是更聪明，是搜不到。'),
  scan: loc('内部触发器串成链：SI 推进去，SO 读出来。下一课拆四步。'),
}

export function ConceptFig({ id, t }: ConceptFigProps) {
  const tall = id === 'stuck' || id === 'tran' || id === 'atpg' || id === 'algo' || id === 'dft'
  const h = tall ? 260 : 220
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 680 ${h}`} className="term-fig__svg" role="img" aria-label={t(CAPTION[id])}>
        <rect width="680" height={h} rx="6" fill="var(--well)" />
        {draw(id, t)}
      </svg>
      <figcaption>{t(CAPTION[id])}</figcaption>
    </figure>
  )
}

export function CompareFig({ t }: { t: (text: LText | string) => string }) {
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 240" className="term-fig__svg" role="img">
        <rect width="680" height="240" rx="6" fill="var(--well)" />
        {box(24, 36, 280, 150, '', 'var(--fig-box)')}
        <text x="164" y="64" textAnchor="middle" fill="var(--sky)" fontSize="14">
          Algorithmic
        </text>
        <text x="164" y="92" textAnchor="middle" fill="var(--text)" fontSize="13">
          {t(loc('规则阵列 / Memory'))}
        </text>
        <text x="164" y="116" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('地址 ++  ·  w0 r0 w1'))}
        </text>
        <text x="164" y="140" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('测试时现场算'))}
        </text>
        <text x="164" y="164" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('不列每个门的 s-a-1'))}
        </text>
        {box(376, 36, 280, 150, '', 'var(--fig-box)')}
        <text x="516" y="64" textAnchor="middle" fill="var(--gold)" fontSize="14">
          ATPG
        </text>
        <text x="516" y="92" textAnchor="middle" fill="var(--text)" fontSize="13">
          {t(loc('不规则门级网表'))}
        </text>
        <text x="516" y="116" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('故障列表 → 搜输入'))}
        </text>
        <text x="516" y="140" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('预先生成文件'))}
        </text>
        <text x="516" y="164" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('依赖 DFT / Scan'))}
        </text>
        <text x="340" y="218" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('都不是手写真值表。对象、时机、依据都不同。'))}
        </text>
      </svg>
      <figcaption>{t(loc('左边走阵列规律，右边走门级故障。不要把 March 叫成 ATPG。'))}</figcaption>
    </figure>
  )
}

function box(x: number, y: number, w: number, h: number, label: string, fill = 'var(--fig-box-2)') {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke="var(--line-2)" />
      {label ? (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="var(--text)" fontSize="13">
          {label}
        </text>
      ) : null}
    </g>
  )
}

function arrow(x1: number, y1: number, x2: number, y2: number, label?: string) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="1.6" />
      <path d={`M ${x2} ${y2} l -7 -4 v 8 z`} fill="var(--gold)" />
      {label ? (
        <text x={(x1 + x2) / 2} y={y1 - 8} textAnchor="middle" fill="var(--gold)" fontSize="12">
          {label}
        </text>
      ) : null}
    </g>
  )
}

function draw(id: ConceptId, t: (text: LText | string) => string) {
  if (id === 'func') {
    return (
      <g>
        {box(40, 36, 90, 32, 'A B = 00')}
        {box(40, 76, 90, 32, 'A B = 01')}
        {box(40, 116, 90, 32, 'A B = 10')}
        {box(40, 156, 90, 32, 'A B = 11')}
        {arrow(140, 110, 210, 110, t(loc('写成向量')))}
        {box(220, 50, 200, 120, '', 'var(--fig-box)')}
        <text x="320" y="88" textAnchor="middle" fill="var(--sky)" fontSize="13">
          00 → Y=0
        </text>
        <text x="320" y="112" textAnchor="middle" fill="var(--sky)" fontSize="13">
          01 → Y=1
        </text>
        <text x="320" y="136" textAnchor="middle" fill="var(--sky)" fontSize="13">
          10 → Y=1
        </text>
        <text x="320" y="160" textAnchor="middle" fill="var(--sky)" fontSize="13">
          11 → Y=0
        </text>
        {arrow(430, 110, 500, 110)}
        {box(510, 80, 130, 60, t(loc('Functional')))}
      </g>
    )
  }
  if (id === 'algo') {
    return (
      <g>
        {box(28, 40, 150, 88, t(loc('地址 / 数据')), 'var(--fig-box)')}
        {arrow(188, 84, 248, 84, t(loc('现场算')))}
        {box(256, 40, 170, 88, '↑ w0 r0 w1')}
        {arrow(436, 84, 496, 84)}
        {box(504, 40, 148, 88, t(loc('下一拍')))}
        <text x="340" y="168" textAnchor="middle" fill="var(--muted)" fontSize="13">
          {t(loc('ATE 算法引擎按地址生成，不预先存 2ⁿ 条'))}
        </text>
        <text x="340" y="196" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('对象是阵列，不是每个 AND 的 s-a-1'))}
        </text>
        <text x="340" y="224" textAnchor="middle" fill="var(--dim)" fontSize="12">
          {t(loc('Memory March 是典型。本阶段记差别，不背算法表。'))}
        </text>
      </g>
    )
  }
  if (id === 'fault') {
    return (
      <g>
        {box(40, 70, 130, 70, t(loc('好电路')))}
        {arrow(180, 105, 250, 105, t(loc('假设')))}
        {box(260, 40, 150, 50, 'Stuck-at')}
        {box(260, 100, 150, 50, 'Transition')}
        {arrow(420, 105, 490, 105)}
        {box(500, 70, 140, 70, t(loc('才能谈覆盖率')), 'var(--gold-bg-2)')}
      </g>
    )
  }
  if (id === 'stuck') {
    return (
      <g>
        <text x="40" y="36" fill="var(--muted)" fontSize="12">
          A=1
        </text>
        <text x="40" y="96" fill="var(--muted)" fontSize="12">
          B=0
        </text>
        <line x1="72" y1="32" x2="168" y2="32" stroke="var(--blue)" strokeWidth="2" />
        <line x1="72" y1="92" x2="168" y2="92" stroke="var(--blue)" strokeWidth="2" />
        <path
          d="M 168 8 V 116 H 224 C 286 116 286 8 224 8 Z"
          fill="var(--fig-box)"
          stroke="var(--blue)"
          strokeWidth="2"
        />
        <text x="206" y="68" fill="var(--text)" fontSize="13">
          AND
        </text>
        <line x1="286" y1="62" x2="360" y2="62" stroke="var(--red)" strokeWidth="2.2" />
        <circle cx="360" cy="62" r="6" fill="var(--red)" />
        <text x="376" y="50" fill="var(--red)" fontSize="13">
          Y stuck-at-1
        </text>
        <text x="376" y="72" fill="var(--muted)" fontSize="12">
          {t(loc('好电路 Y=0，坏了 Y=1'))}
        </text>
        {box(40, 150, 180, 70, '', 'var(--fig-box)')}
        <text x="130" y="178" textAnchor="middle" fill="var(--sky)" fontSize="13">
          Pattern  1 0
        </text>
        <text x="130" y="202" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('期望 Y = 0'))}
        </text>
        {box(250, 150, 180, 70, '', 'var(--red-bg)')}
        <text x="340" y="178" textAnchor="middle" fill="var(--red)" fontSize="13">
          {t(loc('故障时仍是 1'))}
        </text>
        <text x="340" y="202" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('Compare 分出好坏'))}
        </text>
        {box(460, 150, 190, 70, '', 'var(--fig-box)')}
        <text x="555" y="178" textAnchor="middle" fill="var(--gold)" fontSize="12">
          {t(loc('工具：激活 + 传播'))}
        </text>
        <text x="555" y="202" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('再反推侧输入'))}
        </text>
      </g>
    )
  }
  if (id === 'tran') {
    return (
      <g>
        <text x="36" y="40" fill="var(--muted)" fontSize="12">
          V1
        </text>
        <text x="36" y="64" fill="var(--sky)" fontSize="13">
          A=0 B=1 → Y=0
        </text>
        <text x="36" y="108" fill="var(--muted)" fontSize="12">
          V2
        </text>
        <text x="36" y="132" fill="var(--sky)" fontSize="13">
          A=1 B=1 → Y 0→1
        </text>
        <path d="M 280 50 H 380 V 22 H 520" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <text x="530" y="28" fill="var(--blue)" fontSize="12">
          {t(loc('期望升'))}
        </text>
        <path d="M 280 150 H 520" fill="none" stroke="var(--red)" strokeWidth="2.2" />
        <text x="530" y="154" fill="var(--red)" fontSize="12">
          {t(loc('慢了还是 0'))}
        </text>
        <line x1="380" y1="12" x2="380" y2="170" stroke="var(--gold)" strokeDasharray="3 3" />
        <text x="388" y="188" fill="var(--gold)" fontSize="12">
          launch
        </text>
        <line x1="500" y1="12" x2="500" y2="170" stroke="var(--green)" strokeDasharray="3 3" />
        <text x="508" y="188" fill="var(--green)" fontSize="12">
          Capture
        </text>
        <text x="340" y="226" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('一对向量 + 快时钟。一条静态 11 测不到“太慢”。'))}
        </text>
      </g>
    )
  }
  if (id === 'atpg') {
    return (
      <g>
        {box(20, 36, 120, 56, t(loc('门级网表')))}
        {box(20, 110, 120, 56, t(loc('故障列表')))}
        {arrow(150, 102, 210, 102)}
        {box(218, 50, 150, 100, 'ATPG', 'var(--gold-bg-2)')}
        <text x="293" y="132" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(loc('激活 · 传播 · 反推'))}
        </text>
        {arrow(378, 102, 438, 102, t(loc('预先出')))}
        {box(446, 50, 210, 100, '', 'var(--fig-box)')}
        <text x="551" y="88" textAnchor="middle" fill="var(--sky)" fontSize="13">
          Pattern 文件
        </text>
        <text x="551" y="114" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('ATE 回放，不是现场算'))}
        </text>
        <text x="340" y="200" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('对象是不规则逻辑。Memory March 不走这一条。'))}
        </text>
        <text x="340" y="228" textAnchor="middle" fill="var(--dim)" fontSize="12">
          {t(loc('没有 Scan，内部 FF 状态搜爆。'))}
        </text>
      </g>
    )
  }
  if (id === 'dft') {
    return (
      <g>
        {box(28, 40, 150, 80, t(loc('普通 FF')), 'var(--fig-box)')}
        {arrow(188, 80, 250, 80, t(loc('设计时加')))}
        {box(258, 30, 180, 100, '', 'var(--gold-bg-2)')}
        <text x="348" y="72" textAnchor="middle" fill="var(--gold)" fontSize="14">
          Scan FF
        </text>
        <text x="348" y="96" textAnchor="middle" fill="var(--muted)" fontSize="12">
          MUX + SE + SI
        </text>
        {arrow(448, 80, 510, 80)}
        {box(518, 40, 136, 80, t(loc('可移入移出')))}
        <text x="340" y="170" textAnchor="middle" fill="var(--text)" fontSize="13">
          DFT
        </text>
        <text x="340" y="198" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('改电路，不是改 Pattern 格式'))}
        </text>
        <text x="340" y="226" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(loc('ATPG 用改过的网表出向量'))}
        </text>
      </g>
    )
  }
  return (
    <g>
      {box(40, 80, 70, 50, 'SI')}
      {arrow(118, 105, 168, 105)}
      {box(176, 70, 80, 70, 'FF')}
      {arrow(264, 105, 304, 105)}
      {box(312, 70, 80, 70, 'FF')}
      {arrow(400, 105, 440, 105)}
      {box(448, 70, 80, 70, 'FF')}
      {arrow(536, 105, 576, 105)}
      {box(584, 80, 70, 50, 'SO')}
      <text x="340" y="180" textAnchor="middle" fill="var(--muted)" fontSize="12">
        {t(loc('Scan 链：把里面的触发器串到外面'))}
      </text>
    </g>
  )
}
