import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from './parts'
import './vectorDataPath.css'

const PHASES = [
  { id: 'input', label: loc('送入激励', 'Apply stimulus') },
  { id: 'device', label: loc('器件内传播', 'Propagate inside DUT') },
  { id: 'compare', label: loc('读取与比较', 'Read and compare') },
] as const
const ROUTES = {
  app: [
    [loc('ATE 并行管脚', 'ATE parallel pins'), loc('在同一拍把 A、B、WE 等值分别送到对应引脚。', 'Drive A, B, WE and other values on their respective pins in the same cycle.')],
    [loc('功能逻辑', 'Functional logic'), loc('输入经过芯片正常使用的逻辑或存储阵列。', 'The inputs pass through normal operating logic or memory.')],
    [loc('输出脚 → ATE 比较器', 'Outputs → ATE comparator'), loc('Strobe 到来时，从输出脚同时比较期望值。', 'Compare the expected values on the output pins at the strobe.')],
  ],
  scan: [
    [loc('Scan In → 逐拍移入', 'Scan In → shift in'), loc('打开 Scan Enable，每个时钟将一位送进串行链。', 'Assert Scan Enable, shifting one bit into the chain on each clock.')],
    [loc('触发器与组合逻辑', 'Registers and combinational logic'), loc('退出移位模式，打功能时钟，将逻辑响应捕获进触发器。', 'Exit shift mode and pulse the functional clock to capture the logic response into registers.')],
    [loc('Scan Out → ATE 比较器', 'Scan Out → ATE comparator'), loc('重新进入移位模式，逐位读出捕获的响应。', 'Return to shift mode and read out the captured response bit by bit.')],
  ],
  adhoc: [
    [loc('测试模式脚', 'Test mode pin'), loc('测试机打开专用测试模式。', 'The tester enables a dedicated test mode.')],
    [loc('测试点 MUX', 'Test-point mux'), loc('多路选择器把内部节点转接到可访问路径。', 'The mux routes an internal node onto an accessible path.')],
    [loc('观察脚 → ATE', 'Observation pin → ATE'), loc('从指定管脚读该节点的电平。', 'Read the node on the assigned observation pin.')],
  ],
  bist: [
    [loc('ATE 发 START', 'ATE asserts START'), loc('ATE 启动片上测试。', 'The ATE starts the on-chip test.')],
    [loc('片上向量发生器 → 被测块', 'On-chip generator → DUT block'), loc('片内发生器提供激励，内部逻辑比较或压缩响应。', 'An on-chip generator drives the block and on-chip logic compares or compacts the responses.')],
    [loc('STATUS / 签名 → ATE', 'STATUS/signature → ATE'), loc('完成后读状态或签名。', 'Read status or signature when the test finishes.')],
  ],
  jtag: [
    [loc('TDI / TMS / TCK → TAP', 'TDI/TMS/TCK → TAP'), loc('先选边界扫描指令，再从 TDI 移入数据。', 'Select a boundary-scan instruction and shift data through TDI.')],
    [loc('芯片边界单元', 'Boundary cells'), loc('边界单元驱动或采样 I/O，可检查器件与板级连线。', 'Boundary cells drive or sample I/O for chip and board interconnect checks.')],
    [loc('TDO → ATE 比较器', 'TDO → ATE comparator'), loc('串行读出采样结果，再比较预期位序。', 'Shift sampled bits out and compare them in order.')],
  ],
}

export function VectorDataPath({ mode }: { mode: string }) {
  const { t } = useLocale()
  const [phase, setPhase] = useState<(typeof PHASES)[number]['id']>('input')
  const kind = Object.hasOwn(ROUTES, mode) ? mode as keyof typeof ROUTES : 'app'
  const stages = ROUTES[kind]
  const selected = PHASES.findIndex(({ id }) => id === phase)
  return (
    <figure className="term-fig">
      <Seg options={PHASES} value={phase} onChange={setPhase} />
      <ol className="vector-path" data-vector-path={kind} data-phase={phase}>
        {stages.map(([name], index) => (
          <li key={PHASES[index].id} aria-current={index === selected ? 'step' : undefined}>
            <span>{t(PHASES[index].label)}</span><strong>{t(name)}</strong>
          </li>
        ))}
      </ol>
      <figcaption aria-live="polite">{t(stages[selected][1])}</figcaption>
    </figure>
  )
}
