import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import {
  IOH_MA,
  IOL_MA,
  LOAD_CODE,
  VIH_LV,
  VIL_LV,
  VOH_LV,
  VOL_LV,
  bridge,
  compare,
  type LoadBranch,
  type PeMode,
  type PeSwitch,
} from './data/intro'

const L = {
  driver: loc('驱动器', 'Driver'),
  forIn: loc('（输入脚用）', '(for inputs)'),
  load: loc('电流负载', 'Current load'),
  forOut: loc('（输出脚用）', '(for outputs)'),
  recv: loc('电压比较器', 'Voltage receiver'),
  pmuConn: loc('PMU 接入', 'PMU connection'),
  ioSw: loc('高速 I/O 切换', 'High-speed I/O switch'),
  icmp: loc('高速电流比较器', 'Hi-speed I comparator'),
  optional: loc('可选', 'optional'),
  read0: loc('读成 0', 'Reads 0'),
  read1: loc('读成 1', 'Reads 1'),
  readX: loc('中间：三态或坏', 'Between: Z or bad'),
  switching: loc('切换中：先断开，再闭合', 'Switching: break, then make'),
  conflict: loc('I/O 冲突！', 'I/O conflict!'),
  cap: loc(
    '一个测试通道（按教材 Figure 3-5 重画）。金色是 IOL 和驱动信号走的路，蓝色是 IOH 走的路。F1 / F2 是高速 FET 开关，由同一根 I/O 切换信号控制，F2 前有反相器，所以总是一开一关；K1 / K2 / K3 是继电器。电流负载是四只二极管组成的桥，D1–D4 哪只导通由 DUT 电压和 VREF 谁高决定。',
    'One test channel (redrawn from textbook Figure 3-5). Gold is the path of IOL and the drive signal; blue is the path of IOH. F1 / F2 are high-speed FET switches driven by one I/O switch signal, with an inverter in front of F2, so one is always on and the other off. K1 / K2 / K3 are relays. The current load is a bridge of four diodes; which of D1–D4 conducts depends on whether the DUT voltage is above or below VREF.',
  ),
  codeTitle: loc('把二极管桥写成程序', 'The diode bridge as a program'),
}

const HOT = 'var(--gold)'
const IOH_C = 'var(--sky)'
const IDLE = 'var(--line-2)'
const MONO = 'var(--mono)'

function HSw({ x1, x2, y, on, label, color }: { x1: number; x2: number; y: number; on: boolean; label: string; color: string }) {
  const a = x1 + 10
  const b = x2 - 10
  return (
    <g>
      <path d={`M${x1} ${y} H${a} M${b} ${y} H${x2}`} stroke={color} strokeWidth="2.5" />
      <circle cx={a} cy={y} r="3" fill={color} />
      <circle cx={b} cy={y} r="3" fill={color} />
      <line x1={a} y1={y} x2={on ? b : b - 6} y2={on ? y : y - 16} stroke={color} strokeWidth="2.5" />
      <text x={(x1 + x2) / 2} y={y + 20} textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily={MONO}>
        {label}
      </text>
    </g>
  )
}

function VSw({ x, y1, y2, on, label, color }: { x: number; y1: number; y2: number; on: boolean; label?: string; color: string }) {
  const a = y1 + 10
  const b = y2 - 10
  return (
    <g>
      <path d={`M${x} ${y1} V${a} M${x} ${b} V${y2}`} stroke={color} strokeWidth="2.5" />
      <circle cx={x} cy={a} r="3" fill={color} />
      <circle cx={x} cy={b} r="3" fill={color} />
      <line x1={x} y1={a} x2={on ? x : x + 14} y2={on ? b : b - 6} stroke={color} strokeWidth="2.5" />
      {label ? (
        <text x={x - 10} y={(y1 + y2) / 2 + 4} textAnchor="end" fill="var(--text-2)" fontSize="11" fontFamily={MONO}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

/** 教材里的 FET 开关画成 ⊗ */
function Fet({ cx, cy, on, color, label }: { cx: number; cy: number; on: boolean; color: string; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill={on ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={color} strokeWidth="2" />
      <path d={`M${cx - 7} ${cy - 7} L${cx + 7} ${cy + 7} M${cx + 7} ${cy - 7} L${cx - 7} ${cy + 7}`} stroke={color} strokeWidth="1.6" />
      <text x={cx + 16} y={cy - 10} fill="var(--text-2)" fontSize="11" fontFamily={MONO}>
        {label}
      </text>
    </g>
  )
}

/** 二极管：从 (x1,y1) 阳极指向 (x2,y2) 阴极，符号画在线段中点 */
function Diode({ x1, y1, x2, y2, color, label, lx, ly, anchor }: {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  label: string
  lx: number
  ly: number
  anchor: 'start' | 'end'
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
      <g transform={`translate(${mx} ${my}) rotate(${deg})`}>
        <path d="M-5 -6 L5 0 L-5 6 Z" fill={color} />
        <path d="M5 -6 V6" stroke={color} strokeWidth="2" />
      </g>
      <text x={lx} y={ly} textAnchor={anchor} fill="var(--text-2)" fontSize="10" fontFamily={MONO}>
        {label}
      </text>
    </g>
  )
}

/** 恒流源：圆圈 + 向下箭头；上下各一段引线 */
function ISrc({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill="var(--fig-box)" stroke={color} strokeWidth="1.8" />
      <path d={`M${cx} ${cy - 6} V${cy + 5}`} stroke={color} strokeWidth="1.6" />
      <path d={`M${cx - 4} ${cy + 1} L${cx} ${cy + 6} L${cx + 4} ${cy + 1}`} fill="none" stroke={color} strokeWidth="1.6" />
    </g>
  )
}

const fmtI = (ma: number) => (Math.abs(ma) < 0.005 ? '0.00 mA' : `${ma > 0 ? '+' : '−'}${Math.abs(ma).toFixed(2)} mA`)

export function PinElecFig({
  mode,
  sw,
  switching,
  fdata,
  vout,
  vref,
  conflict,
}: {
  mode: PeMode
  sw: PeSwitch
  switching: boolean
  fdata: 0 | 1
  vout: number
  vref: number
  conflict: boolean
}) {
  const { t } = useLocale()
  const c = (on: boolean) => (on ? HOT : IDLE)
  const drivePath = sw.f1 && sw.k1
  const cmpPath = sw.k1 && mode === 'compare' && !switching
  const loadPath = sw.f2 && sw.k1 && !switching
  const pmuPath = sw.k2
  const leakPath = sw.k3
  const ioPath = drivePath || cmpPath || loadPath
  const bad = conflict && drivePath
  const pinColor = bad ? 'var(--red)' : c(ioPath || pmuPath || leakPath)
  const read = compare(vout)

  /* 二极管桥：DUT 侧没接上（F2 断或 K1 断）时，IOL 全部经 D2 进 VREF，IOH 全部经 D3 由 VREF 提供 */
  const live = bridge(vout, vref)
  const br = loadPath ? live : { d1: 0, d2: IOL_MA, d3: IOH_MA, d4: 0, iDut: 0 }
  const lit = (i: number, full: number) => i > full * 0.05
  const powered = sw.f2
  const dc = (i: number, full: number, col: string) => (powered && lit(i, full) ? col : IDLE)
  const ctrl = mode === 'drive' ? 1 : 0

  /* 桥的四个节点 */
  const A = { x: 220, y: 176 }
  const C = { x: 186, y: 210 }
  const D = { x: 254, y: 210 }
  const B = { x: 220, y: 244 }

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 500" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="760" height="500" rx="10" fill="var(--well)" />

        {/* 左侧分区名 */}
        <g fontSize="12" fill="var(--text)">
          <text x="16" y="56">{t(L.driver)}</text>
          <text x="16" y="172">{t(L.load)}</text>
          <text x="16" y="336">{t(L.recv)}</text>
          <text x="16" y="414">{t(L.pmuConn)}</text>
        </g>
        <g fontSize="10" fill="var(--muted)">
          <text x="16" y="72">{t(L.forIn)}</text>
          <text x="16" y="188">{t(L.forOut)}</text>
          <text x="16" y="352">{t(L.forOut)}</text>
        </g>

        {/* ---------- 驱动器 ---------- */}
        <text x="146" y="54" fill="var(--muted)" fontSize="11" fontFamily={MONO}>
          FDATA
        </text>
        <path d="M146 60 H190" stroke={c(drivePath)} strokeWidth="2.5" />
        <path d="M190 40 L240 60 L190 80 Z" fill="var(--fig-box)" stroke={c(drivePath)} strokeWidth="2" />
        <text x="215" y="30" textAnchor="middle" fill="var(--sky)" fontSize="10" fontFamily={MONO}>
          {`VIH ${VIH_LV.toFixed(1)} V`}
        </text>
        <text x="215" y="96" textAnchor="middle" fill="var(--sky)" fontSize="10" fontFamily={MONO}>
          {`VIL ${VIL_LV.toFixed(1)} V`}
        </text>
        <path d="M240 60 H289" stroke={c(drivePath)} strokeWidth="2.5" />
        <Fet cx={300} cy={60} on={sw.f1} color={c(drivePath)} label="F1" />
        <path d="M311 60 H430" stroke={c(drivePath)} strokeWidth="2.5" />
        {drivePath ? (
          <text x="326" y="52" fill={HOT} fontSize="11" fontFamily={MONO}>
            {fdata ? `1 → VIH ${VIH_LV.toFixed(1)} V` : `0 → VIL ${VIL_LV.toFixed(1)} V`}
          </text>
        ) : null}

        {/* ---------- 高速 I/O 切换：同一根信号，F2 前反相 ---------- */}
        <text x="150" y="114" fill="var(--text-2)" fontSize="10">
          {`${t(L.ioSw)} = ${ctrl}`}
        </text>
        <path d="M150 122 H300 M300 122 V71 M300 122 V132" stroke="var(--purple)" strokeWidth="1.4" />
        <circle cx="300" cy="122" r="2.5" fill="var(--purple)" />
        <path d="M292 132 H308 L300 148 Z" fill="var(--fig-box)" stroke="var(--purple)" strokeWidth="1.4" />
        <circle cx="300" cy="152" r="3" fill="var(--fig-box)" stroke="var(--purple)" strokeWidth="1.4" />
        <path d="M300 155 V199" stroke="var(--purple)" strokeWidth="1.4" />

        {/* ---------- 电流负载：二极管桥 ---------- */}
        <path d={`M220 130 V140 M212 130 H228`} stroke={powered ? HOT : IDLE} strokeWidth="1.6" />
        <ISrc cx={220} cy={150} color={powered ? HOT : IDLE} />
        <path d={`M220 160 V${A.y}`} stroke={powered ? HOT : IDLE} strokeWidth="2" />
        <text x="204" y="154" textAnchor="end" fill={HOT} fontSize="10" fontFamily={MONO}>
          {`IOL ${IOL_MA} mA`}
        </text>
        <Diode x1={A.x} y1={A.y} x2={D.x} y2={D.y} color={dc(br.d1, IOL_MA, HOT)} label="D1" lx={248} ly={186} anchor="start" />
        <Diode x1={A.x} y1={A.y} x2={C.x} y2={C.y} color={dc(br.d2, IOL_MA, HOT)} label="D2" lx={192} ly={186} anchor="end" />
        <Diode x1={C.x} y1={C.y} x2={B.x} y2={B.y} color={dc(br.d3, IOH_MA, IOH_C)} label="D3" lx={192} ly={242} anchor="end" />
        <Diode x1={D.x} y1={D.y} x2={B.x} y2={B.y} color={dc(br.d4, IOH_MA, IOH_C)} label="D4" lx={248} ly={242} anchor="start" />
        {[A, B, C, D].map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="3" fill="var(--text-2)" />
        ))}
        <path d={`M220 ${B.y} V260`} stroke={powered ? IOH_C : IDLE} strokeWidth="2" />
        <ISrc cx={220} cy={270} color={powered ? IOH_C : IDLE} />
        <path d="M220 280 V290 M212 290 H228" stroke={powered ? IOH_C : IDLE} strokeWidth="1.6" />
        <text x="204" y="274" textAnchor="end" fill={IOH_C} fontSize="10" fontFamily={MONO}>
          {`IOH ${IOH_MA} mA`}
        </text>
        <path d={`M${C.x} ${C.y} H158`} stroke={powered ? 'var(--text-2)' : IDLE} strokeWidth="2" />
        <text x="154" y="214" textAnchor="end" fill="var(--sky)" fontSize="10" fontFamily={MONO}>
          {`VREF ${vref.toFixed(1)} V`}
        </text>
        <path d={`M${D.x} ${D.y} H289`} stroke={c(loadPath && Math.abs(br.iDut) > 0.01)} strokeWidth="2.5" />
        <Fet cx={300} cy={210} on={sw.f2} color={c(loadPath)} label="F2" />
        <path d="M311 210 H430" stroke={c(loadPath)} strokeWidth="2.5" />
        {loadPath ? (
          <text x="320" y="232" fill={br.iDut >= 0 ? HOT : IOH_C} fontSize="11" fontFamily={MONO}>
            {`I = ${fmtI(br.iDut)}`}
          </text>
        ) : null}

        {/* ---------- 内部总线 ---------- */}
        <path d="M430 60 V210" stroke={c(ioPath)} strokeWidth="2.5" />
        <path d="M430 210 V370" stroke={c(cmpPath)} strokeWidth="2.5" />
        <circle cx="430" cy="60" r="3.5" fill={c(ioPath)} />
        <circle cx="430" cy="210" r="3.5" fill={c(ioPath)} />

        {/* ---------- 电压比较器 ---------- */}
        <path d="M430 308 H300 M430 370 H300" stroke={c(cmpPath)} strokeWidth="2" />
        <circle cx="430" cy="308" r="3" fill={c(cmpPath)} />
        <path d="M300 324 H340 M300 354 H340" stroke="var(--sky)" strokeWidth="1.5" />
        <text x="344" y="328" fill="var(--sky)" fontSize="10" fontFamily={MONO}>{`VOH ${VOH_LV} V`}</text>
        <text x="344" y="358" fill="var(--sky)" fontSize="10" fontFamily={MONO}>{`VOL ${VOL_LV} V`}</text>
        <path d="M300 300 L250 316 L300 332 Z" fill="var(--fig-box)" stroke={c(cmpPath && read === 'high')} strokeWidth="2" />
        <path d="M300 346 L250 362 L300 378 Z" fill="var(--fig-box)" stroke={c(cmpPath && read === 'low')} strokeWidth="2" />
        <g fill="var(--text-2)" fontSize="11" fontFamily={MONO}>
          <text x="288" y="312">+</text>
          <text x="288" y="328">−</text>
          <text x="288" y="358">+</text>
          <text x="288" y="374">−</text>
        </g>
        <path d="M250 316 H232 M250 362 H232" stroke={IDLE} strokeWidth="1.5" />
        {cmpPath ? (
          <text x="228" y="343" textAnchor="end" fill={read === 'mid' ? 'var(--red)' : HOT} fontSize="12">
            {t(read === 'low' ? L.read0 : read === 'high' ? L.read1 : L.readX)}
          </text>
        ) : null}

        {/* ---------- PMU：Force / Sense 两根线经 K2 ---------- */}
        <text x="146" y="414" textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily={MONO}>
          Force
        </text>
        <text x="146" y="430" textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily={MONO}>
          Sense
        </text>
        <path d="M150 410 H576 V176 M150 426 H586 V176" stroke={c(pmuPath)} strokeWidth="2" fill="none" />
        <VSw x={576} y1={120} y2={176} on={sw.k2} label="K2" color={c(pmuPath)} />
        <VSw x={586} y1={120} y2={176} on={sw.k2} color={c(pmuPath)} />
        <path d="M576 120 L580 104 L586 120 M580 104 V60" stroke={c(pmuPath)} strokeWidth="2" fill="none" />

        {/* ---------- K1 → DUT ---------- */}
        <path d="M430 60 H460" stroke={c(ioPath)} strokeWidth="2.5" />
        <HSw x1={460} x2={520} y={60} on={sw.k1} label="K1" color={c(ioPath)} />
        <path d="M520 60 H580" stroke={bad ? 'var(--red)' : c(ioPath)} strokeWidth="2.5" />
        <path d="M580 60 H640" stroke={bad ? 'var(--red)' : c(ioPath || pmuPath)} strokeWidth="2.5" />
        <path d="M640 60 H690" stroke={pinColor} strokeWidth="2.5" />
        <circle cx="580" cy="60" r="3" fill={c(ioPath || pmuPath)} />
        <circle cx="640" cy="60" r="3" fill={c(ioPath || pmuPath || leakPath)} />
        <rect x="690" y="34" width="54" height="52" rx="6" fill="var(--neutral-fill)" stroke={pinColor} strokeWidth="2" />
        <text x="717" y="64" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily={MONO}>
          DUT
        </text>
        {cmpPath || loadPath ? (
          <text x="717" y="104" textAnchor="middle" fill={HOT} fontSize="11" fontFamily={MONO}>
            {`${vout.toFixed(2)} V`}
          </text>
        ) : null}
        {bad ? (
          <text x="610" y="40" textAnchor="middle" fill="var(--red)" fontSize="13">
            {t(L.conflict)}
          </text>
        ) : null}

        {/* ---------- K3 → 可选的高速电流比较器 / PMU per pin ---------- */}
        <path d="M640 60 V120" stroke={c(leakPath)} strokeWidth="2.5" />
        <VSw x={640} y1={120} y2={176} on={sw.k3} label="K3" color={c(leakPath)} />
        <path d="M640 176 V446 M640 438 H535 V446" stroke={c(leakPath)} strokeWidth="2.5" fill="none" />
        <circle cx="640" cy="438" r="3" fill={c(leakPath)} />
        <rect x="470" y="446" width="130" height="44" rx="8" fill={leakPath ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={leakPath ? HOT : 'var(--line)'} strokeDasharray="5 3" />
        <rect x="614" y="446" width="130" height="44" rx="8" fill="var(--fig-box)" stroke="var(--line)" strokeDasharray="5 3" />
        <text x="535" y="465" textAnchor="middle" fill="var(--text)" fontSize="11">
          {t(L.icmp)}
        </text>
        <text x="679" y="465" textAnchor="middle" fill="var(--text)" fontSize="11">
          PMU per pin
        </text>
        <text x="535" y="481" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.optional)}
        </text>
        <text x="679" y="481" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.optional)}
        </text>

        {switching ? (
          <text x="16" y="476" fill={HOT} fontSize="13">
            {t(L.switching)}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}

/** 代码面板：当前生效的分支高亮，三个设定值随旋钮变化 */
export function LoadCode({ vref, branch, active }: { vref: number; branch: LoadBranch; active: boolean }) {
  const { t } = useLocale()
  const fills = { iol: `${IOL_MA.toFixed(1)}   // mA`, ioh: `${IOH_MA.toFixed(1)}   // mA`, vref: `${vref.toFixed(1)}   // V` }
  return (
    <figure className="term-fig">
      <pre className="pe-code" aria-label={t(L.codeTitle)}>
        {LOAD_CODE.map((line, i) => {
          const on = active && line.on === branch
          const cls = `pe-code__line${on ? ' is-on' : ''}${line.on && !on ? ' is-off' : ''}`
          const comment = line.cm ? `${line.code ? '  ' : ''}// ${t(line.cm)}` : ''
          return (
            <span key={i} className={cls}>
              {line.code}
              {line.fill ? fills[line.fill] : null}
              {line.cm && !line.fill ? <span className="pe-code__cm">{comment}</span> : null}
              {line.cm && line.fill ? <span className="pe-code__cm">{`  ${t(line.cm)}`}</span> : null}
              {'\n'}
            </span>
          )
        })}
      </pre>
      <figcaption>{t(L.codeTitle)}</figcaption>
    </figure>
  )
}
