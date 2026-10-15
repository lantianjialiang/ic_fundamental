import { loc } from '../../../i18n/locale'
import { fmtA, fmtVolt, fmtW, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：电机电源、绕组电阻、每只开关的 Rds(on)、中速时的反电动势、体二极管压降 */
export const VBAT = 12
const RM = 4
const RDS = 0.02
const EMF = 6
const VF_BODY = 0.7

type Gates = { g1: boolean; g2: boolean; g3: boolean; g4: boolean }
const MODE_GATES: Record<string, Gates> = {
  forward: { g1: true, g2: false, g3: false, g4: true },
  reverse: { g1: false, g2: true, g3: true, g4: false },
  brake: { g1: false, g2: true, g3: false, g4: true },
  coast: { g1: false, g2: false, g3: false, g4: false },
}

const PATHS: Record<string, string[]> = {
  forward: ['bat', 'rA', 'w1', 'q1', 'a1', 'mA', 'motor', 'mB', 'b4', 'q4', 'g4', 'gB', 'gA'],
  reverse: ['bat', 'rA', 'rB', 'w3', 'q3', 'b3', 'mB', 'motor', 'mA', 'a2', 'q2', 'g2', 'gA'],
  brake: ['mA', 'a2', 'q2', 'g2', 'gB', 'g4', 'q4', 'b4', 'mB', 'motor'],
  // 正转后关断：电流方向仍是 A → B，经 Q3、Q2 的体二极管回到电源
  coast: ['mB', 'b3', 'd3', 'w3', 'rB', 'rA', 'bat', 'gA', 'g2', 'd2', 'a2', 'mA', 'motor'],
}

const bit = (b: boolean) => (b ? '1' : '0')

function solve(sel: Record<string, string>, _num: Record<string, number>, fault: string): Outcome {
  const mode = MODE_GATES[sel.mode] ? sel.mode : 'forward'
  const gates = { ...MODE_GATES[mode] }
  const shoot = fault === 'shootThrough'
  if (shoot) {
    gates.g1 = true
    gates.g2 = true
  }
  const tags = { g1: bit(gates.g1), g2: bit(gates.g2), g3: bit(gates.g3), g4: bit(gates.g4) }
  const rLoop = RM + 2 * RDS
  const iStart = VBAT / rLoop
  const iRun = (VBAT - EMF) / rLoop

  if (shoot) {
    const iShoot = VBAT / (2 * RDS)
    return {
      hot: ['bat', 'rA', 'w1', 'q1', 'a1', 'a2', 'q2', 'g2', 'gA'],
      tags,
      reads: [
        { label: loc('直通电流（只受 Rds(on) 限制）', 'Shoot-through current (limited only by Rds(on))'), value: fmtA(iShoot), state: 'fail' },
        { label: loc('两只管子总耗散', 'Total dissipation in the two FETs'), value: fmtW(iShoot * iShoot * 2 * RDS), state: 'fail' },
      ],
      tone: 'bad',
      title: loc('直通：同一桥臂上下管同时导通', 'Shoot-through: high and low switch of one leg on together'),
      text: loc(
        '换向时，如果上管还没完全关断下管就开了，或者控制信号让两个栅极同时为高，电源经 Q1 和 Q2 直接短路到地，电流只被两只管子的 Rds(on) 限制，理论上上百安培，管子在微秒内烧毁，电源也会被拉垮。所以要有死区时间：先关一只管，等它完全关断，再开另一只管；也不要让桥臂的两路输入同时为高。',
        'When reversing, if the low switch turns on before the high switch has fully turned off, or the control signals drive both gates high, the supply is shorted to ground through Q1 and Q2, limited only by their two Rds(on), theoretically hundreds of amps; the transistors burn out in microseconds and the supply collapses. Hence the dead time: turn one switch off, wait until it is fully off, then turn the other on; and never let both inputs of one leg be high.',
      ),
    }
  }
  const hot = PATHS[mode]
  if (mode === 'forward' || mode === 'reverse') {
    const sign = mode === 'forward' ? '+' : '-'
    return {
      hot,
      tags,
      reads: [
        { label: loc('电机端电压', 'Motor terminal voltage'), value: `${sign}${VBAT} V` },
        { label: loc('起动 / 堵转电流', 'Start / stall current'), value: fmtA(iStart) },
        { label: loc('中速运行电流（反电动势 6 V）', 'Running current at mid speed (back-EMF 6 V)'), value: fmtA(iRun) },
      ],
      tone: 'ok',
      title: mode === 'forward' ? loc('正转：Q1 和 Q4 导通', 'Forward: Q1 and Q4 on') : loc('反转：Q3 和 Q2 导通', 'Reverse: Q3 and Q2 on'),
      text: mode === 'forward'
        ? loc(
            '对角两只管子导通：电流从电源经 Q1、电机（A → B）、Q4 回到地，电机两端是 +12 V。换成 Q3 和 Q2，电流改成 B → A，电机反转。转起来以后反电动势抵掉一部分电压，运行电流比起动电流小；上管是 NMOS 时，栅极要比电源高才能导通，需要自举或电荷泵。',
            'Two diagonal transistors conduct: current flows from the supply through Q1, the motor (A to B) and Q4 to ground, with +12 V across the motor. Swapping to Q3 and Q2 sends current B to A and the motor reverses. Once spinning, back-EMF cancels part of the voltage so the running current is below the starting current; with NMOS high-side switches the gate must be above the supply to turn on, which needs a bootstrap or charge pump.',
          )
        : loc(
            '换成另一对对角管：Q3 和 Q2 导通，电流从电源经 Q3、电机（B → A）、Q2 回到地，电机两端变成 −12 V，转向相反。换向前一定要先让正转的那一对管子完全关断，再等死区时间，否则同一桥臂会直通。',
            'The other diagonal pair conducts: Q3 and Q2 carry current from the supply through the motor (B to A) to ground, so the motor sees −12 V and turns the other way. Before reversing, the forward pair must be fully off and a dead time must pass, otherwise one leg shoots through.',
          ),
    }
  }
  if (mode === 'brake') {
    const iBrake = EMF / rLoop
    return {
      hot,
      tags,
      reads: [
        { label: loc('电机端电压', 'Motor terminal voltage'), value: fmtVolt(iBrake * 2 * RDS) },
        { label: loc('反电动势产生的刹车电流', 'Braking current from back-EMF'), value: fmtA(iBrake) },
        { label: loc('电源电流', 'Supply current'), value: fmtA(0), state: 'pass' },
      ],
      tone: 'ok',
      title: loc('刹车：Q2 和 Q4（两个下管）导通', 'Brake: Q2 and Q4 (both low-side) on'),
      text: loc(
        '两个下管同时导通，把电机两端短接到地。转动的电机相当于发电机，反电动势在这个回路里产生电流，电流产生的力矩与转动方向相反，电机很快停下来；这个电流由电机自己发出，不从电源取。短接后电流 = 反电动势 ÷ (绕组电阻 + 2 × Rds(on))，转速越高刹车越猛。',
        'Both low-side transistors conduct and short the motor terminals to ground. A spinning motor is a generator, and its back-EMF drives current round this loop; the torque of that current opposes the rotation, so the motor stops quickly, and the current comes from the motor itself, not the supply. The current = back-EMF ÷ (winding resistance + 2 × Rds(on)), so the faster it spins the harder it brakes.',
      ),
    }
  }
  return {
    hot,
    tags,
    reads: [
      { label: loc('电机端电压（反向）', 'Motor terminal voltage (reversed)'), value: `-${(VBAT + 2 * VF_BODY).toFixed(1)} V` },
      { label: loc('续流路径上的损耗', 'Loss in the freewheel path'), value: fmtW(iRun * 2 * VF_BODY) },
    ],
    tone: 'warn',
    title: loc('滑行：全部关断，电流经体二极管续流', 'Coast: all off, current freewheels through body diodes'),
    text: loc(
      '四只管子都关断后，绕组电感里的电流不能突变，继续从 A 流向 B，只能走 Q3 和 Q2 的体二极管，经过电源（或母线电容）回来。电机两端被钳在 −(Vbat + 2 × 0.7 V)，电流充进电源，会把母线电压抬高；体二极管压降大，电流衰减得慢也发热，所以大功率场合在续流期间会再把对应的管子导通（同步整流）。',
      'With all four transistors off, the current in the winding inductance cannot change; it keeps flowing from A to B and can only use the body diodes of Q3 and Q2 and return through the supply (or bus capacitor). The motor terminals are clamped at −(Vbat + 2 × 0.7 V), the current charges the supply and lifts the bus voltage; the body diodes drop a lot, so the current decays slowly and heats them, which is why high-power designs turn on the matching transistor during freewheeling (synchronous rectification).',
    ),
  }
}

export const HBRIDGE_CIRCUIT: CircuitDef = {
  id: 'hBridge',
  label: loc('H 桥电机驱动', 'H-bridge motor drive'),
  short: loc('四管 H 桥', 'Four-switch H-bridge'),
  func: loc(
    '用四个开关控制直流电机的转向和停止：正转、反转、刹车、滑行，只用一路电源。',
    'Control the direction and stopping of a DC motor with four switches: forward, reverse, brake and coast, from a single supply.',
  ),
  principle: loc(
    '四个开关排成 H 形，电机在中间横杠上。对角两个导通（Q1 + Q4）电流从左到右，电机正转；另一对对角（Q3 + Q2）电流从右到左，电机反转。同一边的两个下管导通（Q2 + Q4），电机两端短接，靠反电动势刹车。全部关断，电机惯性滑行，绕组电流经体二极管续流。同一桥臂的上下管（Q1 和 Q2，或 Q3 和 Q4）绝不能同时导通。',
    'Four switches are arranged in an H with the motor on the crossbar. One diagonal pair on (Q1 + Q4) sends current left to right and the motor turns forward; the other diagonal (Q3 + Q2) sends it right to left and the motor reverses. Both low-side switches on (Q2 + Q4) short the motor terminals and brake using back-EMF. All off, the motor coasts and winding current freewheels through the body diodes. The high and low switch of one leg (Q1 and Q2, or Q3 and Q4) must never conduct together.',
  ),
  params: loc(
    'Vds 额定值高于电源并留出换向尖峰的余量；Rds(on) 和起动 / 堵转电流决定管子耗散；死区时间要大于管子关断时间加驱动延时；上管是 NMOS 时要有自举或电荷泵（{@mosSwitch}）；PWM 频率和栅极电荷 Qg 决定驱动器要多大的电流。',
    'The Vds rating must exceed the supply with margin for commutation spikes; Rds(on) and the start / stall current set transistor dissipation; dead time must exceed turn-off time plus driver delay; NMOS high-side switches need a bootstrap or charge pump ({@mosSwitch}); PWM frequency and gate charge Qg set how much current the driver needs.',
  ),
  pitfall: loc(
    '没有死区或两路输入同时为高，桥臂直通，烧管；上管 NMOS 没有自举，栅极电压不够只开一半；滑行时电流泵升母线电压，没有母线电容或吸收，电源被推高；反转时不等电机停就换向，起动电流叠加反电动势，电流和电压应力都很大。',
    'No dead time, or both inputs of a leg high, shoots through and burns the transistors; NMOS high-side switches with no bootstrap are only half on; during coasting the current pumps the bus voltage up, and without bus capacitance or clamping the supply is pushed higher; reversing before the motor stops stacks the starting current on the back-EMF and stresses both current and voltage.',
  ),
  row: {
    part: loc('四只 NMOS（或 PMOS + NMOS）+ 死区控制', 'Four NMOS (or PMOS + NMOS) + dead-time control'),
    param: loc('死区时间，Rds(on)，起动电流', 'Dead time, Rds(on), start current'),
    pit: loc('直通、上管没有自举', 'Shoot-through, no bootstrap for the high side'),
  },
  inputs: [
    {
      id: 'mode',
      label: loc('桥的状态', 'Bridge state'),
      options: [
        { id: 'forward', label: loc('正转', 'Forward') },
        { id: 'reverse', label: loc('反转', 'Reverse') },
        { id: 'brake', label: loc('刹车', 'Brake') },
        { id: 'coast', label: loc('滑行', 'Coast') },
      ],
    },
  ],
  knobs: [],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'shootThrough', label: loc('直通（无死区）', 'Shoot-through (no dead time)') },
  ],
  solve,
}
