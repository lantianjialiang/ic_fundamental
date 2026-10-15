import { loc, type LText } from '../../../i18n/locale'
import { BOARD, BOOT, CASES, LED_VF, bootCapVoltage, nHighGateNeed, nHighMaxLoad, rdsOn, switchState, type SwitchCase } from './mosSwitchModel'

export type GpioLevel = 'high' | 'low'

export const CASE_LIST: Array<{ id: SwitchCase; label: LText }> = [
  { id: 'nLow', label: loc('NMOS 低边', 'NMOS low-side') },
  { id: 'pHigh', label: loc('PMOS 高边', 'PMOS high-side') },
  { id: 'nHigh', label: loc('NMOS 高边：3.3 V 驱动 12 V', 'NMOS high-side: 3.3 V driving 12 V') },
]

export const LEVELS: Array<{ id: GpioLevel; label: LText }> = [
  { id: 'high', label: loc('GPIO = 高', 'GPIO = high') },
  { id: 'low', label: loc('GPIO = 低', 'GPIO = low') },
]

export const LED_LABEL = {
  vg: loc('栅极电压 Vg', 'Gate voltage Vg'),
  vgs: loc('栅源电压 Vgs', 'Gate-source Vgs'),
  state: loc('管子', 'Switch'),
  current: loc('回路电流 I', 'Loop current I'),
  led: loc('LED', 'LED'),
  on: loc('导通', 'ON'),
  off: loc('截止', 'OFF'),
  lit: loc('亮', 'lit'),
  dark: loc('灭', 'dark'),
  fail: loc('失败', 'FAIL'),
  gpio: loc('MCU GPIO', 'MCU GPIO'),
  hint: loc('点击开关切换', 'Click to toggle'),
  high: loc('高', 'H'),
  low: loc('低', 'L'),
  ledName: loc('红色 LED，Vf ≈ 2 V', 'Red LED, Vf ≈ 2 V'),
  supply: loc('电源', 'Supply'),
  vnodeHigh: loc('Vout', 'Vout'),
  vds: loc('Vds', 'Vds'),
  cap: loc(
    '示意：点 GPIO 开关切换电平。金色粗线是当前电流路径；LED 压降取 2 V；MOS 管是示意的逻辑电平功率管（Vth = 2 V）。',
    'Illustration: click the GPIO switch to toggle the level. The thick gold line is the current path; the LED drop is taken as 2 V; the MOSFET is an illustrative logic-level power part (Vth = 2 V).',
  ),
}

const mv = (x: number) => (x * 1000).toFixed(2)
const f1 = (x: number) => x.toFixed(1)
const f2 = (x: number) => x.toFixed(2)

type CaseNote = { title: LText; text: LText; detail: LText; tone?: 'ok' | 'warn' | 'bad' }

/** 三种接法的说明；数字由模型算出，每条结论带原因 */
export function caseNote(id: SwitchCase): CaseNote {
  const c = CASES[id]
  const on = switchState(id, id === 'pHigh' ? false : true)
  if (id === 'nLow') {
    const text = loc(
      `NMOS 放在负载和地之间，源极接地，所以 Vgs = 栅极电压：GPIO 高 ${c.vHigh} V，Vgs = ${c.vHigh} V，导通；GPIO 低 0 V，Vgs = 0，截止。导通时 I = (${c.vdd} − ${LED_VF}) / (${c.rSeries} + Rds) ≈ ${mv(on.i)} mA，开关本身只掉约 ${mv(on.vds)} mV（Rds(on) ≈ ${f1(rdsOn(c.vHigh) * 1000)} mΩ）。`,
      `The NMOS sits between the load and ground with its source grounded, so Vgs = gate voltage: GPIO high at ${c.vHigh} V gives Vgs = ${c.vHigh} V, on; GPIO low at 0 V gives Vgs = 0, off. When on, I = (${c.vdd} − ${LED_VF}) / (${c.rSeries} + Rds) ≈ ${mv(on.i)} mA, and the switch itself drops only about ${mv(on.vds)} mV (Rds(on) ≈ ${f1(rdsOn(c.vHigh) * 1000)} mΩ).`,
    )
    return {
      title: loc('NMOS 低边：栅极高 = 导通', 'NMOS low-side: gate high = on'),
      text,
      tone: 'ok',
      detail: loc(
        `${text.zh}MCU 的高电平直接就够，所以这是最常用的接法。代价：关断时负载的下端不再接地，对要求负载一端始终共地的场合不方便。`,
        `${text.en} The MCU high level is enough by itself, which is why this is the most common wiring. The cost: when off, the load’s lower end is no longer grounded, which is awkward where one end of the load must stay at ground.`,
      ),
    }
  }
  if (id === 'pHigh') {
    const big = CASES.nHigh
    const text = loc(
      `PMOS 放在电源和负载之间，源极接 ${c.vdd} V，所以 Vgs = Vg − ${c.vdd} V：GPIO 低 0 V，Vgs = −${c.vdd} V，导通；GPIO 高 ${c.vHigh} V，Vgs = 0，截止。逻辑反过来，低电平有效。导通时 I ≈ ${mv(on.i)} mA，和低边一样。`,
      `The PMOS sits between the supply and the load with its source at ${c.vdd} V, so Vgs = Vg − ${c.vdd} V: GPIO low at 0 V gives Vgs = −${c.vdd} V, on; GPIO high at ${c.vHigh} V gives Vgs = 0, off. The logic is inverted: active low. When on, I ≈ ${mv(on.i)} mA, the same as the low-side case.`,
    )
    return {
      title: loc('PMOS 高边：栅极低 = 导通', 'PMOS high-side: gate low = on'),
      text,
      tone: 'ok',
      detail: loc(
        `${text.zh}负载下端一直接地。关断时栅极高电平必须接近源极电压：若电源是 ${big.vdd} V 而 GPIO 只有 ${big.vHigh} V，GPIO 高时 Vsg = ${big.vdd} − ${big.vHigh} = ${f1(big.vdd - big.vHigh)} V，远大于 Vth，管子仍然导通、关不掉，所以要加一级电平移位，见 {@mosApps}。`,
        `${text.en} The load’s lower end stays grounded. To turn off, the gate high level must be close to the source voltage: with a ${big.vdd} V supply and a ${big.vHigh} V GPIO, Vsg = ${big.vdd} − ${big.vHigh} = ${f1(big.vdd - big.vHigh)} V when the GPIO is high, far above Vth, so the part stays on and cannot be turned off; add a level-shifting stage, see {@mosApps}.`,
      ),
    }
  }
  const text = loc(
    `NMOS 放在 ${c.vdd} V 和负载之间，负载接在源极上，GPIO 只有 ${c.vHigh} V。源极升到 Vg − Vth = ${f2(nHighMaxLoad(c.vHigh))} V 时 Vgs 只剩 Vth = ${BOARD.vth} V，管子自己把自己关断，负载上只有约 ${f2(on.vNode)} V，低于 LED 的 Vf = ${LED_VF} V，灯不亮。`,
    `The NMOS sits between ${c.vdd} V and the load, with the load on its source, and the GPIO is only ${c.vHigh} V. When the source rises to Vg − Vth = ${f2(nHighMaxLoad(c.vHigh))} V, Vgs is down to Vth = ${BOARD.vth} V and the device switches itself off; the load sees only about ${f2(on.vNode)} V, below the LED’s Vf = ${LED_VF} V, so the LED stays dark.`,
  )
  return {
    title: loc('NMOS 高边：3.3 V GPIO 驱动 12 V 失败', 'NMOS high-side: a 3.3 V GPIO driving 12 V fails'),
    text,
    tone: 'bad',
    detail: loc(
      `${text.zh}这和 NMOS 传差 1 是同一个机制：源极跟着输出走，Vgs 越来越小。要让负载到 ${c.vdd} V，栅极至少要 ${c.vdd} + ${BOARD.vth} = ${c.vdd + BOARD.vth} V，完全导通要约 ${nHighGateNeed(c.vdd, 10)} V，见下一节。`,
      `${text.en} This is the same mechanism as the NMOS passing a weak 1: the source follows the output and Vgs keeps shrinking. To bring the load to ${c.vdd} V the gate needs at least ${c.vdd} + ${BOARD.vth} = ${c.vdd + BOARD.vth} V, and about ${nHighGateNeed(c.vdd, 10)} V for full turn-on; see the next section.`,
    ),
  }
}

/** 当前电平下管子的一句话判断，带原因 */
export function stateLine(id: SwitchCase, high: boolean): LText {
  const s = switchState(id, high)
  const mag = Math.abs(s.vgs)
  const ma = (s.i * 1000).toFixed(2)
  if (id === 'nHigh' && high) {
    return loc(
      `Vgs 只剩 ${f2(s.vgs)} V，已经降到 Vth = ${BOARD.vth} V 附近，管子自己把自己关断：负载只有 ${f2(s.vNode)} V，电流 ${ma} mA，LED 不亮。`,
      `Vgs has shrunk to ${f2(s.vgs)} V, down to about Vth = ${BOARD.vth} V, so the device switches itself off: the load gets only ${f2(s.vNode)} V, the current is ${ma} mA and the LED stays dark.`,
    )
  }
  if (s.on) {
    return loc(
      `|Vgs| = ${f2(mag)} V，大于 Vth = ${BOARD.vth} V，沟道已形成，管子导通，电流 ${ma} mA，LED 点亮。`,
      `|Vgs| = ${f2(mag)} V, above Vth = ${BOARD.vth} V, so the channel exists, the device conducts, the current is ${ma} mA and the LED lights.`,
    )
  }
  return loc(
    `|Vgs| = ${f2(mag)} V，小于 Vth = ${BOARD.vth} V，没有沟道，管子截止，电流 0，LED 不亮。`,
    `|Vgs| = ${f2(mag)} V, below Vth = ${BOARD.vth} V, so there is no channel, the device is off, the current is 0 and the LED stays dark.`,
  )
}

export const NEED_LABEL = {
  loadKnob: loc('负载电压 Vload', 'Load voltage Vload'),
  vgsKnob: loc('完全导通所需 Vgs', 'Vgs for full turn-on'),
  gpio: loc('MCU GPIO', 'MCU GPIO'),
  tied: loc('栅极直接接电源', 'Gate tied to the supply'),
  need: loc('完全导通所需栅压', 'Gate needed for full turn-on'),
  boot: loc('自举后的栅压', 'Gate after bootstrapping'),
  enough: loc('够', 'enough'),
  short: loc('不够', 'short'),
  vg: loc('栅极电压 (V)', 'Gate voltage (V)'),
  cap: loc(
    '示意：NMOS 高边的源极就是负载端，栅压要高过 Vload + Vth 才开始导通。GPIO 取 3.3 V，示意管 Vth = 2 V，自举数据见下一节。',
    'Illustration: the source of a high-side NMOS is the load end, so the gate must exceed Vload + Vth before it conducts. GPIO taken as 3.3 V, illustrative Vth = 2 V; bootstrap values are in the next section.',
  ),
}

export function needText(vload: number, vgsFull: number): LText {
  const start = vload + BOARD.vth
  const full = nHighGateNeed(vload, vgsFull)
  const gpio = CASES.nHigh.vHigh
  return loc(
    `NMOS 高边的源极就是负载端，Vs = Vload = ${vload} V。要导通必须 Vg − Vs > Vth，即 Vg > ${start} V；要导通得好（Rds(on) 小）还要 Vgs = ${vgsFull} V，即栅极约 ${full} V，比电源还高。GPIO（${gpio} V）最多只能把负载推到 ${f2(nHighMaxLoad(gpio))} V，栅极直接接电源也只能到 ${f2(nHighMaxLoad(vload))} V，所以必须自举或用电荷泵把栅压抬高。`,
    `The source of a high-side NMOS is the load end, Vs = Vload = ${vload} V. To conduct it needs Vg − Vs > Vth, i.e. Vg > ${start} V; to conduct well (low Rds(on)) it also needs Vgs = ${vgsFull} V, i.e. a gate of about ${full} V, higher than the supply. A GPIO (${gpio} V) can push the load only to ${f2(nHighMaxLoad(gpio))} V, and a gate tied to the supply only to ${f2(nHighMaxLoad(vload))} V, so a bootstrap or charge pump must lift the gate.`,
  )
}

export type BootPhase = 'charge' | 'lift'

export const BOOT_PHASES: Array<{ id: BootPhase; label: LText }> = [
  { id: 'charge', label: loc('阶段 1：低边导通，自举电容充电', 'Phase 1: low-side on, bootstrap cap charges') },
  { id: 'lift', label: loc('阶段 2：高边导通，栅压被抬高', 'Phase 2: high-side on, gate is lifted') },
]

export function bootPhaseNote(id: BootPhase): { title: LText; text: LText; tone?: 'ok' | 'warn' } {
  const vb = bootCapVoltage()
  if (id === 'charge') {
    return {
      title: loc('阶段 1：Cboot 被充到 VCC − Vf', 'Phase 1: Cboot charges to VCC − Vf'),
      text: loc(
        `低边导通，开关点 SW 被拉到 0 V。VCC = ${BOOT.vcc} V 经自举二极管给 Cboot 充电，两端电压 = VCC − Vf = ${BOOT.vcc} − ${BOOT.vf} = ${f1(vb)} V。二极管此时正偏，所以能充进去。`,
        `The low-side device is on and the switch node SW is pulled to 0 V. VCC = ${BOOT.vcc} V charges Cboot through the bootstrap diode to VCC − Vf = ${BOOT.vcc} − ${BOOT.vf} = ${f1(vb)} V. The diode is forward-biased, which is why charge can flow in.`,
      ),
      tone: 'ok',
    }
  }
  return {
    title: loc('阶段 2：栅极被抬到母线之上', 'Phase 2: the gate rides above the bus'),
    text: loc(
      `高边导通，SW 升到母线 ${BOOT.vbus} V。电容两端电压不能突变，所以它的正端 = ${BOOT.vbus} + ${f1(vb)} = ${f1(BOOT.vbus + vb)} V，驱动器用它把栅极拉高，Vgs = ${f1(vb)} V，高边完全导通。二极管阳极 ${BOOT.vcc} V 低于阴极 ${f1(BOOT.vbus + vb)} V，反偏，把 VCC 和高电压隔开。`,
      `The high-side device is on and SW rises to the ${BOOT.vbus} V bus. A capacitor’s voltage cannot jump, so its positive end sits at ${BOOT.vbus} + ${f1(vb)} = ${f1(BOOT.vbus + vb)} V, and the driver uses it to pull the gate up: Vgs = ${f1(vb)} V, so the high-side device is fully on. The diode anode at ${BOOT.vcc} V is below the cathode at ${f1(BOOT.vbus + vb)} V, so it is reverse-biased and isolates VCC from the high voltage.`,
    ),
    tone: 'warn',
  }
}

export const BOOT_LABEL = {
  vbus: loc('母线 Vbus', 'Bus Vbus'),
  hs: loc('高边 NMOS', 'High-side NMOS'),
  ls: loc('低边 NMOS', 'Low-side NMOS'),
  load: loc('负载', 'Load'),
  driver: loc('高边驱动', 'HS driver'),
  diode: loc('自举二极管', 'Bootstrap diode'),
  cboot: loc('Cboot', 'Cboot'),
  sw: loc('SW', 'SW'),
  forward: loc('正偏', 'forward'),
  reverse: loc('反偏', 'reverse'),
  lsDrive: loc('低边驱动', 'LS driver'),
  vcc: loc('VCC', 'VCC'),
  vb: loc('Vb', 'Vb'),
  vgs: loc('Vgs', 'Vgs'),
  cap: loc(
    `示意：${BOOT.vbus} V 母线、${BOOT.vcc} V 驱动电源，SW 是开关点（高边的源极，也是低边的漏极）。金色粗线是当前电流路径；Vb 是自举电容的正端，也是高边驱动的供电正端。`,
    `Illustration: a ${BOOT.vbus} V bus and a ${BOOT.vcc} V driver supply; SW is the switch node (the source of the high-side device and the drain of the low-side one). The thick gold line is the current path; Vb is the positive end of the bootstrap capacitor and the positive supply of the high-side driver.`,
  ),
}

export type Approach = { id: string; title: LText; text: LText }

export const APPROACHES: Approach[] = [
  {
    id: 'bootstrap',
    title: loc('自举', 'Bootstrap'),
    text: loc(
      '一个二极管加一个电容，靠开关点自己的摆动把电容的电压垫到母线之上。便宜，半桥驱动芯片里最常见。限制：电容要靠低边导通的时间补电，所以不能 100% 占空比常开；长时间不开关电容会漏掉电。',
      'One diode and one capacitor: the swing of the switch node itself stacks the capacitor voltage on top of the bus. Cheap and the most common choice in half-bridge driver ICs. Limits: the capacitor is refilled only while the low side conducts, so 100% duty (always on) is impossible, and an idle capacitor slowly leaks away.',
    ),
  },
  {
    id: 'pump',
    title: loc('电荷泵', 'Charge pump'),
    text: loc(
      '用一个小振荡器带动二极管和电容，一级一级把电压泵高，和开关状态无关，所以高边可以长期常通。代价：泵出的电流很小，建立需要几十到几百微秒，电路更复杂。很多高边开关芯片内置电荷泵。',
      'A small oscillator drives diodes and capacitors that pump the voltage up stage by stage, independent of the switching state, so the high side can stay on indefinitely. Costs: the pumped current is tiny, start-up takes tens to hundreds of microseconds, and the circuit is more complex. Many high-side switch ICs include a charge pump.',
    ),
  },
  {
    id: 'pmos',
    title: loc('PMOS 高边', 'PMOS high-side'),
    text: loc(
      'PMOS 的源极接电源，栅极拉到电源以下就导通，不需要高于电源的电压，电路最简单。代价：空穴迁移率只有电子的一半到三分之一，同样的 Rds(on) 需要约 2–3 倍的芯片面积，更贵；所以大电流、高效率场合仍然多用 NMOS 加驱动，选型见 {@mosSelect}。',
      'The PMOS source sits on the supply and it conducts when the gate is pulled below the supply, so no voltage above the supply is needed and the circuit is simplest. Cost: hole mobility is only one half to one third of electron mobility, so the same Rds(on) takes about 2–3 times the die area and costs more; high-current, high-efficiency designs therefore still favour NMOS plus a driver, see {@mosSelect}.',
    ),
  },
]
