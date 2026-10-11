import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { BITS, LAYERS, VIH_SPEC, VIL_SPEC } from './data/content'

const L = {
  aria: loc('五层主线：VIH 规格在每一层变成什么', 'Five layers: what the VIH spec becomes at each layer'),
  sheetHead: loc('Datasheet · DC 电气特性（节选）', 'Datasheet · DC electrical characteristics (excerpt)'),
  colParam: loc('参数', 'Parameter'),
  colSym: loc('符号', 'Symbol'),
  colMin: loc('最小', 'Min'),
  colMax: loc('最大', 'Max'),
  colUnit: loc('单位', 'Unit'),
  vihName: loc('输入高电平', 'Input high voltage'),
  vilName: loc('输入低电平', 'Input low voltage'),
  promise: loc('承诺：输入 ≥ 2.0 V，一定认成 1', 'Promise: any input ≥ 2.0 V is read as 1'),
  condHead: loc('测试条件', 'Test conditions'),
  cond1: loc('VDD = 3.6 V（最高工作电压，VIH 最难过）', 'VDD = 3.6 V (max supply, hardest for VIH)'),
  cond2: loc('输入 1 = 2.0 V，输入 0 = 0.8 V', 'Input 1 = 2.0 V, input 0 = 0.8 V'),
  cond3: loc('跑全部功能向量', 'Run all functional vectors'),
  limHead: loc('测试极限', 'Test limit'),
  lim1: loc('每个 Strobe：输出 = 期望', 'Every strobe: output = expected'),
  lim2: loc('任一拍不对 → Fail', 'Any wrong cycle → Fail'),
  inA: loc('输入 A', 'Input A'),
  seen: loc('芯片认成', 'Part reads'),
  vih: loc('VIH = 2.0 V（规格）', 'VIH = 2.0 V (spec)'),
  real: loc('芯片实际门限', 'Actual threshold'),
  levelHead: loc('Level 表', 'Level table'),
  progHead: loc('测试程序', 'Test program'),
  expect: loc('期望', 'Expected'),
  actual: loc('实际', 'Actual'),
  cmp: loc('比较', 'Compare'),
  pass: loc('PASS · 8 个 Strobe 全部对上', 'PASS · all 8 strobes match'),
  fail: loc('FAIL · {n} 个 Strobe 不对 → Bin 5', 'FAIL · {n} strobes wrong → Bin 5'),
}

const BOX_W = 125
const BOX_GAP = 14
const boxX = (i: number) => 20 + i * (BOX_W + BOX_GAP)
const SHORT: Record<string, string> = { setup: 'Setup / Program' }

/** 波形区：0–3.3 V 映射到 y 270–120 */
const vy = (v: number) => 270 - (v / 3.3) * 150
const CELL = 72
const X0 = 90

export function SpecPipeFig({
  step,
  threshold,
  onPick,
}: {
  step: number
  threshold: number
  onPick: (index: number) => void
}) {
  const { t } = useLocale()
  const seen = BITS.map((bit) => ((bit ? VIH_SPEC : VIL_SPEC) >= threshold ? 1 : 0))
  const wrong = seen.filter((bit, i) => bit !== BITS[i]).length
  const ok = threshold <= VIH_SPEC
  const cx = boxX(step) + BOX_W / 2

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 340" className="term-fig__svg" role="img" aria-label={t(L.aria)}>
        <defs>
          <marker id="m05-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="var(--muted)" />
          </marker>
        </defs>
        <rect width="720" height="340" rx="10" fill="var(--well)" />

        {/* 五层方块 */}
        {LAYERS.map((layer, i) => {
          const state = i < step ? 'done' : i === step ? 'on' : 'todo'
          const x = boxX(i)
          return (
            <g
              key={layer.id}
              className="m05-box"
              role="button"
              tabIndex={0}
              aria-label={`${layer.name} · ${t(layer.sub)}`}
              onClick={() => onPick(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onPick(i)
              }}
            >
              <rect
                x={x}
                y="16"
                width={BOX_W}
                height="56"
                rx="8"
                fill={state === 'on' ? 'var(--gold-bg)' : state === 'done' ? 'var(--blue-bg)' : 'var(--card)'}
                stroke={state === 'on' ? 'var(--gold)' : state === 'done' ? 'var(--blue)' : 'var(--line)'}
                strokeWidth={state === 'on' ? 2 : 1}
              />
              <text x={x + BOX_W / 2} y="40" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="600">
                {SHORT[layer.id] ?? layer.name}
              </text>
              <text x={x + BOX_W / 2} y="60" textAnchor="middle" fill="var(--muted)" fontSize="11">
                {t(layer.sub)}
              </text>
              {i < LAYERS.length - 1 ? (
                <line
                  x1={x + BOX_W + 1}
                  y1="44"
                  x2={x + BOX_W + BOX_GAP - 1}
                  y2="44"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  markerEnd="url(#m05-arrow)"
                />
              ) : null}
            </g>
          )
        })}

        {/* 当前层 → 下方面板 */}
        <line x1={cx} y1="72" x2={cx} y2="96" stroke="var(--gold)" strokeWidth="2" />
        <rect x="20" y="96" width="680" height="232" rx="8" fill="var(--panel-2)" stroke="var(--gold-line)" />

        {step === 0 ? (
          <g>
            <text x="40" y="124" fill="var(--muted)" fontSize="12">
              {t(L.sheetHead)}
            </text>
            {[t(L.colParam), t(L.colSym), t(L.colMin), t(L.colMax), t(L.colUnit)].map((head, i) => (
              <text key={i} x={[48, 250, 360, 450, 540][i]} y="156" fill="var(--muted)" fontSize="12">
                {head}
              </text>
            ))}
            <line x1="40" y1="164" x2="600" y2="164" stroke="var(--line)" />
            <rect x="40" y="170" width="560" height="30" rx="4" fill="var(--gold-bg)" stroke="var(--gold)" />
            {[t(L.vihName), 'VIH', '2.0', '—', 'V'].map((cell, i) => (
              <text key={i} x={[48, 250, 360, 450, 540][i]} y="190" fill="var(--text)" fontSize="13" fontWeight={i === 2 ? 700 : 400}>
                {cell}
              </text>
            ))}
            {[t(L.vilName), 'VIL', '—', '0.8', 'V'].map((cell, i) => (
              <text key={i} x={[48, 250, 360, 450, 540][i]} y="224" fill="var(--dim)" fontSize="13">
                {cell}
              </text>
            ))}
            <text x="40" y="282" fill="var(--gold)" fontSize="15" fontWeight="600">
              {t(L.promise)}
            </text>
          </g>
        ) : null}

        {step === 1 ? (
          <g>
            <rect x="40" y="116" width="310" height="190" rx="8" fill="var(--card)" stroke="var(--line)" />
            <text x="56" y="144" fill="var(--sky)" fontSize="13" fontWeight="600">
              {t(L.condHead)}
            </text>
            {[L.cond1, L.cond2, L.cond3].map((line, i) => (
              <text key={i} x="56" y={180 + i * 32} fill={i === 1 ? 'var(--gold)' : 'var(--text)'} fontSize="13">
                {t(line)}
              </text>
            ))}
            <rect x="370" y="116" width="310" height="190" rx="8" fill="var(--card)" stroke="var(--line)" />
            <text x="386" y="144" fill="var(--sky)" fontSize="13" fontWeight="600">
              {t(L.limHead)}
            </text>
            {[L.lim1, L.lim2].map((line, i) => (
              <text key={i} x="386" y={180 + i * 32} fill="var(--text)" fontSize="13">
                {t(line)}
              </text>
            ))}
          </g>
        ) : null}

        {step === 2 ? (
          <g>
            {/* 规格线与芯片实际门限 */}
            <line x1={X0} y1={vy(VIH_SPEC)} x2={X0 + CELL * 8} y2={vy(VIH_SPEC)} stroke="var(--gold)" strokeDasharray="6 4" />
            <line
              x1={X0}
              y1={vy(threshold)}
              x2={X0 + CELL * 8}
              y2={vy(threshold)}
              stroke={ok ? 'var(--green)' : 'var(--red)'}
              strokeDasharray="2 4"
              strokeWidth="2"
            />
            {/* 图例放在波形上方的空白行，避免文字压在波形跳变沿上 */}
            <line x1={X0} y1="114" x2={X0 + 24} y2="114" stroke="var(--gold)" strokeDasharray="6 4" />
            <text x={X0 + 30} y="118" fill="var(--gold)" fontSize="12">
              {t(L.vih)}
            </text>
            <line x1={X0 + 300} y1="114" x2={X0 + 324} y2="114" stroke={ok ? 'var(--green)' : 'var(--red)'} strokeDasharray="2 4" strokeWidth="2" />
            <text x={X0 + 330} y="118" fill={ok ? 'var(--green-2)' : 'var(--red-2)'} fontSize="12">
              {`${t(L.real)} ${threshold.toFixed(2)} V`}
            </text>
            <line x1={X0} y1={vy(0)} x2={X0 + CELL * 8} y2={vy(0)} stroke="var(--line)" />
            <text x={X0 - 8} y={vy(1.4)} textAnchor="end" fill="var(--muted)" fontSize="12">
              {t(L.inA)}
            </text>
            {/* 输入波形：1 = 2.0 V，0 = 0.8 V */}
            <polyline
              fill="none"
              stroke="var(--sky)"
              strokeWidth="2.5"
              points={BITS.flatMap((bit, i) => {
                const y = vy(bit ? VIH_SPEC : VIL_SPEC)
                return [`${X0 + i * CELL},${y}`, `${X0 + (i + 1) * CELL},${y}`]
              }).join(' ')}
            />
            <text x={X0 - 8} y="304" textAnchor="end" fill="var(--muted)" fontSize="12">
              {t(L.seen)}
            </text>
            {seen.map((bit, i) => (
              <text
                key={i}
                x={X0 + i * CELL + CELL / 2}
                y="304"
                textAnchor="middle"
                fontFamily="var(--mono)"
                fontSize="15"
                fontWeight="600"
                fill={bit === BITS[i] ? 'var(--text)' : 'var(--red-2)'}
              >
                {bit}
              </text>
            ))}
          </g>
        ) : null}

        {step === 3 ? (
          <g>
            <rect x="40" y="116" width="270" height="190" rx="8" fill="var(--card)" stroke="var(--line)" />
            <text x="56" y="142" fill="var(--sky)" fontSize="13" fontWeight="600">
              {t(L.levelHead)}
            </text>
            {[
              ['VIH', '2.0 V'],
              ['VIL', '0.8 V'],
              ['VOH', '2.4 V'],
              ['VOL', '0.4 V'],
              ['VDD', '3.6 V'],
            ].map(([name, value], i) => (
              <g key={name}>
                {i === 0 ? <rect x="50" y="152" width="250" height="26" rx="4" fill="var(--gold-bg)" stroke="var(--gold)" /> : null}
                <text x="62" y={170 + i * 28} fill={i === 0 ? 'var(--text)' : 'var(--muted)'} fontSize="13" fontFamily="var(--mono)">
                  {name}
                </text>
                <text x="290" y={170 + i * 28} textAnchor="end" fill={i === 0 ? 'var(--gold)' : 'var(--muted)'} fontSize="13" fontFamily="var(--mono)">
                  {value}
                </text>
              </g>
            ))}
            <rect x="330" y="116" width="350" height="190" rx="8" fill="var(--card)" stroke="var(--line)" />
            <text x="346" y="142" fill="var(--sky)" fontSize="13" fontWeight="600">
              {t(L.progHead)}
            </text>
            {['set_vdd    3.6 V', 'set_level  VIH=2.0 VIL=0.8', 'run        pat_func', 'if fail -> bin 5'].map((line, i) => (
              <text key={i} x="346" y={176 + i * 28} fill={i === 1 ? 'var(--gold)' : 'var(--text-2)'} fontSize="13" fontFamily="var(--mono)">
                {line}
              </text>
            ))}
          </g>
        ) : null}

        {step === 4 ? (
          <g>
            {[L.expect, L.actual, L.cmp].map((label, r) => (
              <text key={r} x={X0 - 8} y={156 + r * 40} textAnchor="end" fill="var(--muted)" fontSize="12">
                {t(label)}
              </text>
            ))}
            {BITS.map((bit, i) => {
              const x = X0 + i * CELL + CELL / 2
              const good = seen[i] === bit
              return (
                <g key={i}>
                  <line x1={x} y1="128" x2={x} y2="256" stroke="var(--line-soft)" strokeDasharray="3 3" />
                  <text x={x} y="156" textAnchor="middle" fontFamily="var(--mono)" fontSize="15" fill="var(--text)">
                    {bit ? 'H' : 'L'}
                  </text>
                  <text x={x} y="196" textAnchor="middle" fontFamily="var(--mono)" fontSize="15" fill={good ? 'var(--text)' : 'var(--red-2)'}>
                    {seen[i] ? 'H' : 'L'}
                  </text>
                  <circle cx={x} cy="231" r="11" fill={good ? 'var(--green-bg)' : 'var(--red-bg)'} stroke={good ? 'var(--green)' : 'var(--red)'} />
                  <text x={x} y="236" textAnchor="middle" fontSize="13" fill={good ? 'var(--green-2)' : 'var(--red-2)'}>
                    {good ? '✓' : '✗'}
                  </text>
                </g>
              )
            })}
            <text x="360" y="294" textAnchor="middle" fontSize="16" fontWeight="700" fill={wrong ? 'var(--red-2)' : 'var(--green-2)'}>
              {wrong ? t(L.fail).replace('{n}', String(wrong)) : t(L.pass)}
            </text>
          </g>
        ) : null}
      </svg>
      <figcaption>{t(LAYERS[step].text)}</figcaption>
    </figure>
  )
}
