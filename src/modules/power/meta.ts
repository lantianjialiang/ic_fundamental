import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 功率器件轨道（power，轨道前缀 P）的课程 ID，顺序即课序 */
export const PWR_LESSONS = [
  'pwrSelector',
  'pwrStatic',
  'pwrKelvin',
  'pwrGate',
  'pwrDpt',
  'pwrUis',
  'pwrWbg',
  'pwrProgram',
] as const

export type PwrLessonId = (typeof PWR_LESSONS)[number]

export const PWR_META: Record<PwrLessonId, LessonMeta> = {
  pwrSelector: {
    title: loc('功率器件概述与基础', 'Power devices: overview and basics'),
    goal: loc(
      '区分二极管、MOSFET、IGBT、SiC、GaN 的适用场景；解释额定电压、电流与导通电阻；估算导通损耗；把参数分为静态、动态、极限、热四类。',
      'Tell where diodes, MOSFETs, IGBTs, SiC and GaN each fit; explain rated voltage, current and on-resistance; estimate conduction loss; sort parameters into static, dynamic, limit and thermal groups.',
    ),
  },
  pwrStatic: {
    title: loc('静态参数测试：Vth、Rds(on)、BVdss、漏电', 'Static tests: Vth, Rds(on), BVdss, leakage'),
    goal: loc(
      '写出各静态参数的 force 与 measure 方式；理解参数依赖测试条件；用脉冲测量避开自热；设置 compliance 与限值。',
      'Write the force and measure setup for each static parameter; understand why parameters depend on test conditions; use pulsed measurement to avoid self-heating; set compliance and limits.',
    ),
  },
  pwrKelvin: {
    title: loc('开尔文连接、大电流与高电压测量', 'Kelvin connection, high current and high voltage measurement'),
    goal: loc(
      '比较 2 线与 4 线（Kelvin）测量的误差；估算接触与引线电阻对毫欧级测量的影响；用 guard 抑制高压夹具漏电；说出互锁与电弧风险。',
      'Compare the error of 2-wire and 4-wire (Kelvin) measurement; estimate how contact and lead resistance affect milliohm readings; use guard to suppress fixture leakage at high voltage; state the interlock and arcing risks.',
    ),
  },
  pwrGate: {
    title: loc('动态参数：栅极电荷、电容与开关时间', 'Dynamic parameters: gate charge, capacitance and switching time'),
    goal: loc(
      '读懂栅极电荷曲线与米勒平台；解释 Ciss、Coss、Crss 与 Qg、Qgs、Qgd 的关系；估算驱动损耗；说明电容随 Vds 变化的测试条件。',
      'Read a gate charge curve and its Miller plateau; explain how Ciss, Coss, Crss relate to Qg, Qgs, Qgd; estimate gate drive loss; explain how capacitance depends on the test Vds.',
    ),
  },
  pwrDpt: {
    title: loc('双脉冲测试与开关能量', 'Double-pulse test and switching energy'),
    goal: loc(
      '说明 DPT 电路与时序；用 I = Vdc·t1/L 设定电流；读 Eon、Eoff、di/dt、dv/dt、过冲与 Qrr；解释杂散电感与探头偏斜对结果的影响。',
      'Explain the DPT circuit and timing; set the current with I = Vdc·t1/L; read Eon, Eoff, di/dt, dv/dt, overshoot and Qrr; explain how stray inductance and probe deskew affect the result.',
    ),
  },
  pwrUis: {
    title: loc('雪崩（UIS）、SOA 与热阻', 'Avalanche (UIS), SOA and thermal resistance'),
    goal: loc(
      '算雪崩能量 E_AS 与雪崩时间；读懂 SOA 的四条边界；用 Zth 求脉冲结温升；说明 TSEP 用体二极管压降估计结温的思路。',
      'Compute avalanche energy E_AS and avalanche time; read the four SOA boundaries; use Zth to find the junction temperature rise of a pulse; explain estimating junction temperature from a body-diode voltage (TSEP).',
    ),
  },
  pwrWbg: {
    title: loc('宽禁带器件：SiC 与 GaN 的测试挑战', 'Wide-bandgap devices: test challenges for SiC and GaN'),
    goal: loc(
      '比较 Si、SiC、GaN 的材料特性与应用；理解 SiC 的 Vth 滞回与漂移，用预置序列固定条件；理解 GaN 的动态 Rds(on) 与测量延时。',
      'Compare Si, SiC and GaN materials and applications; understand SiC Vth hysteresis and drift and fix the conditions with a preconditioning sequence; understand GaN dynamic Rds(on) and the measurement delay.',
    ),
  },
  pwrProgram: {
    title: loc('综合：功率器件测试程序', 'Capstone: power device test program'),
    goal: loc(
      '为 VDUT-MOS1 设计量产测试程序；在测试时间、成本与 UIS 应力风险之间取舍；用统计与离群值筛选；导出 STDF 并按 Site 分析。',
      'Design a production test program for VDUT-MOS1; trade off test time, cost and UIS stress risk; screen with statistics and outliers; export STDF and analyse by site.',
    ),
  },
}
