import { loc, type LText } from '../../../i18n/locale'
import { rOn } from '../model'
import { f1 } from './mosSelectMath'
import { PARTS, SUPPLY, VDRIVE } from './mosSelectParts'
import { powerLimit } from './mosSelectSoa'

export type FlowStep = { id: string; short: LText; title: LText; text: LText }

export const FLOW: FlowStep[] = [
  {
    id: 'define',
    short: loc('定义负载', 'Define the load'),
    title: loc('1. 定义负载', '1. Define the load'),
    text: loc(
      '写下电源电压、负载电流（包括启动和堵转的峰值）、负载是阻性还是感性、驱动电压（这里是 3.3 V）和开关频率。后面每一步都拿这几个数去查手册。',
      'Write down the supply voltage, the load current (including start-up and stall peaks), whether the load is resistive or inductive, the drive voltage (3.3 V here) and the switching frequency. Every later step checks the datasheet against these numbers.',
    ),
  },
  {
    id: 'topology',
    short: loc('选拓扑', 'Topology'),
    title: loc('2. 选拓扑', '2. Choose the topology'),
    text: loc(
      '负载另一端接电源时，用低边 NMOS：源极接地，MCU 直接给 Vgs。必须切电源侧（高边）时，用 PMOS 加电平转换，或 NMOS 加自举 / 驱动芯片，见 {@mosSwitch} 和 {@mosApps}。',
      'When the other end of the load goes to the supply, use a low-side NMOS: source at ground, MCU gives Vgs directly. When the supply side must be switched (high-side), use a PMOS with a level shifter, or an NMOS with a bootstrap / driver IC; see {@mosSwitch} and {@mosApps}.',
    ),
  },
  {
    id: 'rating',
    short: loc('Vds / Id 额定', 'Vds / Id rating'),
    title: loc('3. 查 Vds 和 Id 额定', '3. Check the Vds and Id ratings'),
    text: loc(
      'Vds ≥ 1.5 × 电源，Id ≥ 1.5 × 负载电流（含峰值）。Id 额定是壳温 25 °C 的最好情况，在这一步只用来筛掉明显不够的管子。',
      'Vds ≥ 1.5 × supply and Id ≥ 1.5 × load current (peaks included). The Id rating is the best case at a 25 °C case and here only screens out clearly inadequate parts.',
    ),
  },
  {
    id: 'logic',
    short: loc('逻辑电平？', 'Logic level?'),
    title: loc('4. 查 Rds(on) 和 Vth', '4. Check Rds(on) and Vth'),
    text: loc(
      '在手册里找测试 Vgs ≤ 驱动电压的那一行 Rds(on)：有，才能用；没有，就没有保证。再确认驱动电压 − Vth(max) ≥ 1 V，并且不超过 ±Vgs。',
      'In the datasheet find an Rds(on) row whose test Vgs is ≤ the drive voltage: if there is one it can be used; if not there is no guarantee. Then confirm drive voltage − Vth(max) ≥ 1 V and that it stays inside ±Vgs.',
    ),
  },
  {
    id: 'thermal',
    short: loc('算 Tj', 'Tj check'),
    title: loc('5. 算热', '5. Compute the heat'),
    text: loc(
      '用热态 Rds(on) 算 P = I² × Rds(on)，再算 Tj = Ta + P × RθJA，留在 125 °C 以内。超了就换 Rds(on) 更小的管子，或换 RθJA 更小的封装、加大铜面积。',
      'Use the hot Rds(on) to get P = I² × Rds(on), then Tj = Ta + P × RθJA, and stay within 125 °C. If over, use a lower Rds(on), or a package with lower RθJA and more copper.',
    ),
  },
  {
    id: 'dynamic',
    short: loc('开关与 SOA', 'Switching / SOA'),
    title: loc('6. 看开关和 SOA', '6. Check switching and SOA'),
    text: loc(
      '用 Qg 和 Rg 估算开关时间和开关损耗（见 {@mosDynamic}）；有软启动、热插拔或线性区工作时，在对应脉宽的 SOA 线上检查工作点。',
      'Estimate switching time and switching loss from Qg and Rg (see {@mosDynamic}); with soft start, hot-plug or linear-mode operation, check the operating point against the SOA line for the matching pulse width.',
    ),
  },
  {
    id: 'protect',
    short: loc('加保护', 'Protection'),
    title: loc('7. 加保护', '7. Add protection'),
    text: loc(
      '栅极串电阻、栅极到地加下拉、栅极过压钳位；电感负载并联续流二极管；电源侧按需加 TVS 或吸收电路。这几样加起来只要几分钱，不加就是故障复盘里的主角。',
      'A series gate resistor, a gate-to-ground pull-down and gate over-voltage clamping; a flyback diode across inductive loads; a TVS or snubber on the supply side where needed. Together they cost a few cents, and leaving them out creates the failures reviewed below.',
    ),
  },
  {
    id: 'verify',
    short: loc('实测', 'Measure'),
    title: loc('8. 上板实测', '8. Measure on the board'),
    text: loc(
      '最热的环境、最大的负载下测外壳温度，用示波器看 Vgs、Vds 波形和尖峰，高低温各测一次。手册的数字只是起点，RθJA 尤其取决于你的铜面积。',
      'At the hottest ambient and the heaviest load, measure the case temperature, look at the Vgs and Vds waveforms and spikes on a scope, and test once hot and once cold. Datasheet numbers are a starting point; RθJA in particular depends on your copper area.',
    ),
  },
]

export type CaseId = 'logic' | 'float' | 'flyback' | 'vgsmax' | 'soa'
export type CaseItem = { id: CaseId; title: LText; sub: LText; symptom: LText; cause: LText; fix: LText }

/** 标准电平管（DEMO-B）按平方律反推 k，用来算 3.3 V 下的等效电阻 */
const B = PARTS[1]
export const STD_VTH = B.vth.typ
export const STD_K = 1 / ((B.rds[0].mohm / 1000) * (B.rds[0].vgs - STD_VTH))
export const R_STD_3V3 = rOn(VDRIVE, STD_K, STD_VTH)
const P_STD = 2 * 2 * R_STD_3V3
const E_MJ = 0.5 * 1 * 2 * 2

export const CASES: CaseItem[] = [
  {
    id: 'logic',
    title: loc('非逻辑电平管接 3.3 V', 'A non-logic-level part at 3.3 V'),
    sub: loc('发烫', 'Overheats'),
    symptom: loc(
      'MCU 一输出高电平，MOS 管就烫手，负载却只有一半亮度，电机转得很慢。',
      'As soon as the MCU outputs high, the MOSFET gets too hot to touch while the load is only half bright and the motor turns slowly.',
    ),
    cause: loc(
      `用的是标准电平管：Vgs(th) 典型 ${STD_VTH} V，Rds(on) 只在 10 V 下标了。3.3 V 驱动时 Vgs − Vth 只剩 ${f1(VDRIVE - STD_VTH)} V，沟道没有开透，等效电阻按平方律估算约 ${f1(R_STD_3V3)} Ω（示意）而不是几十毫欧，2 A 时 P = I² × R ≈ ${Math.round(P_STD)} W，全部变成热。`,
      `It is a standard-level part: typical Vgs(th) ${STD_VTH} V, and Rds(on) is only specified at 10 V. At 3.3 V drive Vgs − Vth is only ${f1(VDRIVE - STD_VTH)} V, the channel is not fully open, and a square-law estimate gives about ${f1(R_STD_3V3)} Ω (illustrative) instead of tens of milliohms; at 2 A, P = I² × R ≈ ${Math.round(P_STD)} W, all of it heat.`,
    ),
    fix: loc(
      '换逻辑电平管：手册里有 Vgs ≤ 3.3 V 的 Rds(on) 行，且 Vth(max) 比 3.3 V 低 1 V 以上；或者加一级驱动把栅极拉到 10 V。',
      'Use a logic-level part: the datasheet has an Rds(on) row at Vgs ≤ 3.3 V and Vth(max) is at least 1 V below 3.3 V; or add a driver stage that takes the gate to 10 V.',
    ),
  },
  {
    id: 'float',
    title: loc('栅极浮空，管子乱开', 'A floating gate turns on at random'),
    sub: loc('上电或复位时误动作', 'Misfires at power-up or reset'),
    symptom: loc(
      '上电或复位的几百毫秒里，负载会无故动一下；用手靠近板子，甚至会自己开。',
      'During the first hundreds of milliseconds after power-up or reset the load twitches for no reason; bringing a hand near the board can even turn it on.',
    ),
    cause: loc(
      'MCU 复位时引脚是高阻输入，栅极没有任何东西拉着，成了一根天线：漏电和耦合进来的噪声把栅极电压抬过 Vgs(th)，管子半开。栅极本身是个电容，没有放电路径，电荷散不掉。',
      'During reset the MCU pin is a high-impedance input and nothing holds the gate, so it acts as an antenna: leakage and coupled noise lift the gate above Vgs(th) and the transistor half-turns on. The gate is a capacitor with no discharge path, so the charge stays.',
    ),
    fix: loc(
      '栅极到地加 10–100 kΩ 下拉电阻，高阻时把栅极拉回 0 V；100 kΩ × 100 nA 漏电只有 10 mV，远低于 Vth。再串一个 100–330 Ω 栅极电阻，限制 GPIO 的充电尖峰。',
      'Add a 10–100 kΩ pull-down from gate to ground so a high-impedance pin leaves the gate at 0 V; 100 kΩ × 100 nA of leakage is only 10 mV, far below Vth. Also add a 100–330 Ω gate resistor to limit the GPIO charging spike.',
    ),
  },
  {
    id: 'flyback',
    title: loc('没有续流二极管，被雪崩打坏', 'No flyback diode: killed by avalanche'),
    sub: loc('感性负载', 'Inductive load'),
    symptom: loc(
      '带继电器或电机，用了几十到几千次后 MOS 管突然漏源短路；有时一次关断就烧。',
      'Driving a relay or motor, after tens to thousands of cycles the MOSFET suddenly shorts drain to source; sometimes it burns on a single turn-off.',
    ),
    cause: loc(
      `关断时电感电流不能突变，L·di/dt 把漏极电压顶到雪崩击穿，储能 ½·L·I² 全落在管子里：1 mH、2 A 就是 ${f1(E_MJ)} mJ，远超小封装管子的雪崩能量额定，每次都在损伤管芯。`,
      `On turn-off the inductor current cannot jump, so L·di/dt drives the drain into avalanche and the stored ½·L·I² all lands in the transistor: 1 mH at 2 A is ${f1(E_MJ)} mJ, far beyond the avalanche energy rating of a small package, damaging the die each time.`,
    ),
    fix: loc(
      '在负载两端反并联续流二极管（阴极接电源，阳极接漏极），漏极只被钳在电源 + 0.5 V；选反向耐压 ≥ 1.5 × 电源、正向电流 ≥ 负载电流的肖特基，并靠近负载放。',
      'Put a flyback diode across the load (cathode to the supply, anode to the drain) so the drain is clamped at the supply + 0.5 V; choose a Schottky with reverse voltage ≥ 1.5 × supply and forward current ≥ load current, placed close to the load.',
    ),
  },
  {
    id: 'vgsmax',
    title: loc('24 V 驱动超过 Vgs 上限', 'A 24 V drive exceeds the Vgs limit'),
    sub: loc('栅氧击穿', 'Gate-oxide breakdown'),
    symptom: loc(
      '接上 24 V 控制信号的瞬间管子就坏了，之后量栅极对源极只有几欧到几十欧，G 和 S 短路。',
      'The transistor dies the instant a 24 V control signal is connected; afterwards gate to source measures a few to tens of ohms: G and S are shorted.',
    ),
    cause: loc(
      '栅极和沟道之间隔着只有几十纳米厚的氧化层，击穿电压就是手册的 ±Vgs 最大值（常见 ±12 V 或 ±20 V）。24 V 超过上限，氧化层被击穿，是永久短路，断电后也不会恢复。',
      'Between gate and channel lies an oxide only tens of nanometres thick, and its breakdown voltage is the datasheet ±Vgs maximum (commonly ±12 V or ±20 V). 24 V exceeds it, the oxide breaks down, and the short is permanent; it does not heal when power is removed.',
    ),
    fix: loc(
      '按栅极上限设计驱动电平：用电阻分压或稳压管把栅极钳在 ±Vgs 内（例如串电阻再并 12 V 稳压管），或用 5–12 V 的驱动级。换成 ±20 V 的管子也解决不了 24 V。',
      'Design the drive level to the gate limit: clamp the gate inside ±Vgs with a resistor divider or Zener (for example a series resistor plus a 12 V Zener), or use a 5–12 V driver stage. A ±20 V part still cannot take 24 V.',
    ),
  },
  {
    id: 'soa',
    title: loc('热插拔浪涌超出 SOA', 'Hot-plug inrush beyond the SOA'),
    sub: loc('偶发烧毁', 'Occasional burn-out'),
    symptom: loc(
      '板子带电插拔时偶尔坏，MOS 管开裂或漏源短路；常温空载测都正常，多插几次才坏。',
      'The board occasionally fails when hot-plugged: the MOSFET cracks or shorts drain to source; it behaves normally at room temperature without load and only fails after several insertions.',
    ),
    cause: loc(
      `热插拔给输入大电容充电，电流很大，而管子作负载开关时 Vds 还剩着几乎整个 ${SUPPLY} V：${SUPPLY} V × 20 A = ${SUPPLY * 20} W，超过 10 ms 脉宽的功率限制 ${Math.round(powerLimit(0.01))} W，工作点落在 SOA 之外，管芯局部过热，每次都累积损伤。`,
      `Hot-plugging charges the big input capacitor with a large current while the part, as a load switch, still has nearly the whole ${SUPPLY} V across it: ${SUPPLY} V × 20 A = ${SUPPLY * 20} W, above the ${Math.round(powerLimit(0.01))} W power limit for a 10 ms pulse. The operating point is outside the SOA, the die overheats locally, and damage accumulates each time.`,
    ),
    fix: loc(
      '加软启动（栅极接 RC，让 Vgs 缓升，限制 dv/dt 和浪涌电流，见 {@mosApps}），或选 SOA 更宽的管子；在对应脉宽的 SOA 线上检查，不要用 Id 额定值判断。',
      'Add soft start (an RC on the gate so Vgs rises slowly, limiting dv/dt and inrush current, see {@mosApps}), or choose a part with a wider SOA; check against the SOA line for the matching pulse width instead of judging by the Id rating.',
    ),
  },
]

export const CASE_LABEL = {
  symptom: loc('现象：', 'Symptom: '),
  cause: loc('原因：', 'Cause: '),
  fix: loc('解决：', 'Fix: '),
}
