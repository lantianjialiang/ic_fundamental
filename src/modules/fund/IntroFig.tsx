import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { BIN1_F, BIN2_F, type ArchId, type BlockId, type PinKind } from './data/intro'

/* ---------- 管脚类型小符号 ---------- */

export function PinSymbol({ kind, active }: { kind: PinKind; active: boolean }) {
  const c = active ? 'var(--gold)' : 'var(--text-2)'
  const pad = <rect x="30" y="30" width="10" height="10" fill="var(--fig-box-2)" stroke={c} />
  const core = (y = 22, h = 26) => (
    <rect x="112" y={y} width="40" height={h} rx="3" fill="var(--fig-box)" stroke="var(--line-2)" />
  )
  let body = null
  if (kind === 'input') {
    body = (
      <>
        {pad}
        <path d="M40 35 H62 M90 35 H112" stroke={c} strokeWidth="1.5" />
        <path d="M62 22 L90 35 L62 48 Z" fill="none" stroke={c} strokeWidth="1.5" />
        {core()}
      </>
    )
  } else if (kind === 'output' || kind === 'tri') {
    body = (
      <>
        {pad}
        <path d="M40 35 H62 M90 35 H112" stroke={c} strokeWidth="1.5" />
        <path d="M90 22 L62 35 L90 48 Z" fill="none" stroke={c} strokeWidth="1.5" />
        {kind === 'tri' ? (
          <>
            <path d="M76 8 V28" stroke={c} strokeWidth="1.2" />
            <text x="82" y="13" fill={c} fontSize="9" fontFamily="var(--mono)">
              OE
            </text>
          </>
        ) : null}
        {core()}
      </>
    )
  } else if (kind === 'bidir') {
    body = (
      <>
        {pad}
        <path d="M40 35 H50 M50 18 V52 M50 18 H60 M82 18 H112 M50 52 H60 M82 52 H112" stroke={c} strokeWidth="1.5" fill="none" />
        <path d="M60 10 L82 18 L60 26 Z" fill="none" stroke={c} strokeWidth="1.5" />
        <path d="M82 44 L60 52 L82 60 Z" fill="none" stroke={c} strokeWidth="1.5" />
        <path d="M71 66 V56" stroke={c} strokeWidth="1.2" />
        {core(12, 46)}
      </>
    )
  } else {
    body = (
      <>
        <rect x="30" y="10" width="10" height="10" fill="var(--fig-box-2)" stroke={c} />
        <rect x="30" y="48" width="10" height="10" fill="var(--fig-box-2)" stroke={c} />
        <path d="M40 15 H132 V26 M40 53 H132 V44" stroke={c} strokeWidth="1.5" fill="none" />
        <text x="46" y="11" fill="var(--sky)" fontSize="9" fontFamily="var(--mono)">
          VDD
        </text>
        <text x="46" y="66" fill="var(--sky)" fontSize="9" fontFamily="var(--mono)">
          VSS
        </text>
        {core(26, 18)}
      </>
    )
  }
  return (
    <svg viewBox="0 0 160 70" className="intro-pin__svg" aria-hidden="true">
      <rect x="35" y="3" width="122" height="64" rx="6" fill="none" stroke="var(--line)" strokeDasharray="4 3" />
      {body}
    </svg>
  )
}

/* ---------- 分 Bin 频率轴 ---------- */

const BL = {
  fail: loc('Fail', 'Fail'),
  cap: loc('拖动芯片的最高工作频率，看它落在哪个 Bin。', "Drag the chip's maximum operating frequency to see which bin it lands in."),
}

export function BinFig({ fmax }: { fmax: number }) {
  const { t } = useLocale()
  const f0 = 50
  const f1 = 200
  const x = (f: number) => 40 + ((f - f0) / (f1 - f0)) * 600
  const m = x(fmax)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 120" className="term-fig__svg" role="img" aria-label={t(BL.cap)}>
        <rect width="680" height="120" rx="10" fill="var(--well)" />
        <rect x={x(f0)} y="40" width={x(BIN2_F) - x(f0)} height="30" fill="var(--red-bg)" stroke="var(--red-line)" />
        <rect x={x(BIN2_F)} y="40" width={x(BIN1_F) - x(BIN2_F)} height="30" fill="var(--blue-bg)" stroke="var(--blue-line)" />
        <rect x={x(BIN1_F)} y="40" width={x(f1) - x(BIN1_F)} height="30" fill="var(--green-bg)" stroke="var(--green-line)" />
        <text x={(x(f0) + x(BIN2_F)) / 2} y="60" textAnchor="middle" fill="var(--red)" fontSize="13">
          {t(BL.fail)}
        </text>
        <text x={(x(BIN2_F) + x(BIN1_F)) / 2} y="60" textAnchor="middle" fill="var(--blue)" fontSize="13">
          Bin 2
        </text>
        <text x={(x(BIN1_F) + x(f1)) / 2} y="60" textAnchor="middle" fill="var(--green)" fontSize="13">
          Bin 1
        </text>
        {[50, 100, 150, 200].map((f) => (
          <text key={f} x={x(f)} y="90" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
            {`${f} MHz`}
          </text>
        ))}
        <path d={`M${m} 36 L${m - 7} 22 L${m + 7} 22 Z`} fill="var(--gold)" />
        <line x1={m} y1="36" x2={m} y2="74" stroke="var(--gold)" strokeWidth="2" />
        <text x={m} y="16" textAnchor="middle" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          {`${fmax} MHz`}
        </text>
      </svg>
      <figcaption>{t(BL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 测试系统框图（对应 Figure 3-1） ---------- */

const SL = {
  dc: loc('DC 子系统', 'DC subsystem'),
  bus: loc('系统总线', 'System bus'),
  cpuSub: loc('硬盘 / 网络 / 显示器', 'Disk / network / display'),
  vec: loc('向量存储器', 'Vector memory'),
  timing: loc('时序子系统', 'Timing subsystem'),
  timingSub: 'Format / Mask / Time Set',
  opt: loc('特殊选件', 'Special options'),
  clk: loc('系统时钟', 'System clocks'),
  ext: loc('外部接口', 'External interfaces'),
  head: loc('测试头', 'Test head'),
  card: loc('管脚电子卡', 'Pin electronics card'),
  lb: loc('负载板', 'Load board'),
  handler: loc('分选机 / 探针台', 'Handler / prober'),
  levels: loc('电平 / PMU', 'Levels / PMU'),
  power: loc('DPS → 电源脚', 'DPS → power pins'),
  cap: loc('点任意一块，右侧栏解释它的作用。', 'Click any block and the side panel explains what it does.'),
}

type BoxDef = { id: BlockId; x: number; y: number; w: number; h: number; label: LText | string; sub?: LText | string }

const BOXES: BoxDef[] = [
  { id: 'cpu', x: 20, y: 20, w: 150, h: 70, label: 'CPU', sub: SL.cpuSub },
  { id: 'dps', x: 30, y: 136, w: 130, h: 38, label: 'DPS' },
  { id: 'rvs', x: 30, y: 182, w: 130, h: 38, label: 'RVS' },
  { id: 'pmu', x: 30, y: 228, w: 130, h: 38, label: 'PMU' },
  { id: 'bin', x: 20, y: 300, w: 150, h: 46, label: 'Bin box' },
  { id: 'clk', x: 210, y: 20, w: 170, h: 36, label: SL.clk },
  { id: 'vec', x: 210, y: 64, w: 170, h: 36, label: SL.vec },
  { id: 'timing', x: 210, y: 108, w: 170, h: 50, label: SL.timing, sub: SL.timingSub },
  { id: 'opt', x: 210, y: 166, w: 170, h: 36, label: SL.opt },
  { id: 'ext', x: 210, y: 210, w: 170, h: 36, label: SL.ext, sub: 'GPIB / Serial' },
]

export function SystemFig({ active, onPick }: { active: BlockId; onPick: (id: BlockId) => void }) {
  const { t } = useLocale()
  const wire = 'var(--line-2)'
  const boxFill = (id: BlockId) => (active === id ? 'var(--gold-bg)' : 'var(--fig-box)')
  const boxLine = (id: BlockId) => (active === id ? 'var(--gold)' : 'var(--line)')
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 370" className="term-fig__svg intro-sys" role="img" aria-label={t(SL.cap)}>
        <rect width="720" height="370" rx="10" fill="var(--well)" />
        {/* 总线和连线 */}
        <line x1="190" y1="40" x2="190" y2="330" stroke={wire} strokeWidth="4" />
        <text x="196" y="345" fill="var(--dim)" fontSize="10">
          {t(SL.bus)}
        </text>
        {[55, 155, 201, 247, 323].map((y) => (
          <line key={`l${y}`} x1={y === 55 || y === 323 ? 170 : 160} y1={y} x2="190" y2={y} stroke={wire} strokeWidth="2" />
        ))}
        {[38, 82, 133, 184, 228].map((y) => (
          <line key={`r${y}`} x1="190" y1={y} x2="210" y2={y} stroke={wire} strokeWidth="2" />
        ))}
        {/* 时钟 → 时序，时序 → 测试头 */}
        <path d="M380 38 H396 V120 H380" fill="none" stroke={wire} strokeWidth="1.5" />
        <path d="M295 100 V108" stroke={wire} strokeWidth="2" />
        <path d="M380 140 H420" stroke="var(--gold-line)" strokeWidth="2.5" />
        <text x="384" y="134" fill="var(--dim)" fontSize="9" fontFamily="var(--mono)">
          FDATA
        </text>
        {/* RVS / PMU → 测试头；DPS → 负载板 */}
        <path d="M170 262 H420" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="236" y="258" fill="var(--sky)" fontSize="10">
          {t(SL.levels)}
        </text>
        <path d="M170 284 H650 V230" fill="none" stroke="var(--red-line)" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="236" y="280" fill="var(--red)" fontSize="10">
          {t(SL.power)}
        </text>
        {/* 外部接口 → 分选机 */}
        <path d="M380 228 H404 V325 H420" fill="none" stroke={wire} strokeWidth="1.5" />
        <rect x="420" y="302" width="150" height="46" rx="8" fill="var(--fig-box-2)" stroke="var(--line)" strokeDasharray="4 3" />
        <text x="495" y="330" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(SL.handler)}
        </text>
        {/* 测试头 → 负载板 */}
        <path d="M570 145 H600" stroke="var(--gold-line)" strokeWidth="2.5" />

        {/* DC 子系统外框 */}
        <rect x="20" y="108" width="150" height="182" rx="8" fill="none" stroke="var(--blue-line)" strokeDasharray="5 4" />
        <text x="30" y="126" fill="var(--blue)" fontSize="12">
          {t(SL.dc)}
        </text>

        {BOXES.map((b) => (
          <g key={b.id} className="intro-sys__blk" onClick={() => onPick(b.id)}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="7" fill={boxFill(b.id)} stroke={boxLine(b.id)} strokeWidth={active === b.id ? 2 : 1} />
            <text
              x={b.x + b.w / 2}
              y={b.y + (b.sub ? b.h / 2 - 2 : b.h / 2 + 4)}
              textAnchor="middle"
              fill="var(--text)"
              fontSize="13"
            >
              {t(b.label)}
            </text>
            {b.sub ? (
              <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 14} textAnchor="middle" fill="var(--muted)" fontSize="10">
                {t(b.sub)}
              </text>
            ) : null}
          </g>
        ))}

        {/* 测试头 */}
        <g className="intro-sys__blk" onClick={() => onPick('head')}>
          <rect x="420" y="20" width="150" height="250" rx="8" fill={boxFill('head')} stroke={boxLine('head')} strokeWidth={active === 'head' ? 2 : 1} />
          <text x="495" y="44" textAnchor="middle" fill="var(--text)" fontSize="13">
            {t(SL.head)}
          </text>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="436" y={60 + i * 50} width="118" height="38" rx="4" fill="var(--fig-box-2)" stroke="var(--line-2)" />
              <text x="495" y={84 + i * 50} textAnchor="middle" fill="var(--text-2)" fontSize="10">
                {t(SL.card)}
              </text>
            </g>
          ))}
        </g>

        {/* 负载板 + DUT */}
        <g className="intro-sys__blk" onClick={() => onPick('lb')}>
          <rect x="600" y="60" width="100" height="170" rx="8" fill={boxFill('lb')} stroke={boxLine('lb')} strokeWidth={active === 'lb' ? 2 : 1} />
          <text x="650" y="82" textAnchor="middle" fill="var(--text)" fontSize="13">
            {t(SL.lb)}
          </text>
          <rect x="620" y="120" width="60" height="50" rx="4" fill="var(--blue-bg)" stroke="var(--blue)" />
          <text x="650" y="150" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="var(--mono)">
            DUT
          </text>
        </g>
      </svg>
      <figcaption>{t(SL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 共享资源 vs tester per pin ---------- */

const AL = {
  pin: loc('管脚', 'Pin'),
  own: loc('独立电平 + 时序', 'Own levels + timing'),
  cap: loc('左边是测试机资源，右边是 8 个测试通道。', 'Tester resources on the left, 8 test channels on the right.'),
}

export function ArchFig({ mode }: { mode: ArchId }) {
  const { t } = useLocale()
  const pinY = (i: number) => 22 + i * 22
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 200" className="term-fig__svg" role="img" aria-label={t(AL.cap)}>
        <rect width="680" height="200" rx="10" fill="var(--well)" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <circle cx="560" cy={pinY(i)} r="6" fill="var(--card)" stroke="var(--text-2)" />
            <text x="574" y={pinY(i) + 4} fill="var(--muted)" fontSize="11">
              {`${t(AL.pin)} ${i + 1}`}
            </text>
          </g>
        ))}
        {mode === 'shared'
          ? ['A', 'B'].map((g, k) => {
              const y = 45 + k * 90
              return (
                <g key={g}>
                  <rect x="80" y={y} width="140" height="44" rx="8" fill={k ? 'var(--green-bg)' : 'var(--blue-bg)'} stroke={k ? 'var(--green-line)' : 'var(--blue-line)'} />
                  <text x="150" y={y + 27} textAnchor="middle" fill="var(--text)" fontSize="13">
                    {`RVS ${g}`}
                  </text>
                  {[0, 1, 2, 3].map((j) => (
                    <line
                      key={j}
                      x1="220"
                      y1={y + 22}
                      x2="554"
                      y2={pinY(k * 4 + j)}
                      stroke={k ? 'var(--green)' : 'var(--blue)'}
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              )
            })
          : Array.from({ length: 8 }, (_, i) => (
              <g key={i}>
                <rect x="340" y={pinY(i) - 8} width="140" height="16" rx="3" fill="var(--gold-bg)" stroke="var(--gold-line)" />
                <text x="410" y={pinY(i) + 4} textAnchor="middle" fill="var(--text-2)" fontSize="10">
                  {t(AL.own)}
                </text>
                <line x1="480" y1={pinY(i)} x2="554" y2={pinY(i)} stroke="var(--gold)" strokeWidth="1.5" />
              </g>
            ))}
      </svg>
      <figcaption>{t(AL.cap)}</figcaption>
    </figure>
  )
}
