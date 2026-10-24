import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-03 开尔文连接、大电流与高电压测量：引线电阻、guard、夹具漏电、绝缘电阻、安全互锁、爬电距离 */
export const PWR_KELVIN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'lead-resistance',
      term: 'Lead resistance',
      name: loc('引线电阻', 'Lead resistance'),
      def: loc(
        '测试仪到 DUT 之间导线本身的电阻，常见是毫欧级。2 线测量里每根引线都串进加压回路，读数会多出 2 × R_lead；4 线测量把它排除在感测回路之外。见 {@pwrKelvin}。',
        'The resistance of the wire between the tester and the DUT, typically in the milliohm range. In a 2-wire measurement each lead sits in the force loop and adds to the reading; a 4-wire measurement keeps it out of the sense loop. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
    {
      id: 'guard',
      term: 'Guard',
      name: loc('保护环（guard）', 'Guard ring'),
      def: loc(
        '包在高阻测量路径外的一层导体，驱动到与被测节点相同的电位，使漏电绕开测量端。高压测漏电时，guard 把夹具绝缘路径的测量端拉到加压电位，漏电就不进电流表。见 {@pwrKelvin}。',
        'A conductor wrapped around a high-impedance measurement path and driven to the same potential as the measured node, so leakage bypasses the measuring end. In high-voltage leakage tests, guard holds the fixture insulation path at the forcing potential, so its leakage never reaches the ammeter. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
    {
      id: 'fixture-leakage',
      term: 'Fixture leakage',
      name: loc('夹具漏电', 'Fixture leakage'),
      def: loc(
        '测试座、线缆、负载板等夹具自己的绝缘路径上流过的电流，I_fix = V / R_ins。它与 DUT 并联，会和 Idss 一起被读出来，湿度与污染会让它变大。见 {@pwrKelvin}。',
        'Current through the insulation of the fixture itself (socket, cables, load board): I_fix = V / R_ins. It is in parallel with the DUT, so it is read together with Idss, and humidity or contamination make it larger. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
    {
      id: 'insulation-resistance',
      term: 'Insulation resistance',
      name: loc('绝缘电阻', 'Insulation resistance'),
      def: loc(
        '隔开两个导体的绝缘材料呈现的电阻，常见在 10⁹ Ω 到 10¹³ Ω 之间，随湿度与污染下降。高压测量里，它决定夹具漏电的大小。见 {@pwrKelvin}。',
        'The resistance of insulation separating two conductors, often in the range 10⁹ Ω to 10¹³ Ω, and it falls with humidity and contamination. In high-voltage measurement it sets the size of the fixture leakage. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
    {
      id: 'safety-interlock',
      term: 'Interlock',
      name: loc('安全互锁', 'Safety interlock'),
      def: loc(
        '高压或大电流测试时，门盖、探针座等被打开或断开时，电路自动切断或放电的保护机制。它防止操作员在有高压时接触测试座，见 {@pwrKelvin}。',
        'A protective mechanism that automatically cuts power or discharges the circuit when a door, cover or probe seat is opened during high-voltage or high-current test, so no operator touches a live fixture. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
    {
      id: 'creepage',
      term: 'Creepage / Clearance',
      name: loc('爬电距离 / 电气间隙', 'Creepage / clearance'),
      def: loc(
        '爬电距离是两导体沿绝缘表面的最短路径，电气间隙是空气中的最短直线距离。高压夹具要留足两者，否则电弧或表面漏电会先于设计值出现。见 {@pwrKelvin}。',
        'Creepage is the shortest path along an insulating surface between two conductors; clearance is the shortest straight distance through air. High-voltage fixtures need enough of both, or arcing and surface leakage appear before the design limit. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
  ],
  extraLessons: {
    kelvin: ['pwrKelvin'],
    'contact-resistance': ['pwrKelvin'],
    'two-wire': ['pwrKelvin'],
  },
  faqs: [
    {
      id: 'pwr-kelvin-2wire-error',
      q: loc('2 线和 4 线测毫欧级电阻，差在哪里？', 'What is the difference between 2-wire and 4-wire measurement of milliohm resistance?'),
      a: loc(
        '2 线时加压线和感测线合用一对线，导线与接触电阻串进了读数：R_meas = R_dut + 2(Rc + Rlead)。4 线时感测回路几乎无电流，Rc、Rlead 不进读数，R_meas = R_dut。R_dut 只有 2 mΩ 时，Rc + Rlead 合计 1 mΩ，2 线读数就从 2 mΩ 翻到 4 mΩ。见 {@pwrKelvin} 和 {@anaMeasure}。',
        'In 2-wire, force and sense share one pair of leads, so lead and contact resistance enter the reading: R_meas = R_dut + 2(Rc + Rlead). In 4-wire the sense loop carries almost no current, so Rc and Rlead stay out and R_meas = R_dut. With R_dut at only 2 mΩ, Rc + Rlead totalling 1 mΩ takes the 2-wire reading from 2 mΩ to 4 mΩ. See {@pwrKelvin} and {@anaMeasure}.',
      ),
      lessons: ['pwrKelvin', 'anaMeasure'],
    },
    {
      id: 'pwr-kelvin-guard',
      q: loc('guard 为什么能去掉夹具漏电？', 'Why does guard remove fixture leakage?'),
      a: loc(
        '夹具漏电是高压经过绝缘电阻流向测量端产生的电流。guard 把绝缘路径的测量端驱动到与加压相同的电位，两端没有电位差，电流就不再流进电流表，而是流向保护环。这是教学上的理想化：实际 guard 仍有残余误差。见 {@pwrKelvin} 和 {@anaLeak}。',
        'Fixture leakage is the current that flows from the high voltage through the insulation into the measuring end. Guard drives that measuring end to the same potential as the forcing voltage, so there is no voltage across the path and no current into the ammeter; the leakage goes to the guard instead. This is an idealization: a real guard leaves a residual error. See {@pwrKelvin} and {@anaLeak}.',
      ),
      lessons: ['pwrKelvin', 'anaLeak'],
    },
    {
      id: 'pwr-kelvin-big-current',
      q: loc('测大电流能不能让毫欧测量更准？', 'Does a bigger test current make milliohm measurement more accurate?'),
      a: loc(
        '不能靠这个。欧姆定律是线性的：I 增大，接触与引线的压降也同比增大，误差比例不变。电流大还会让接触发热、线缆的 L·di/dt 成为新问题。正确做法是 4 线测量，把这部分误差排除在感测回路之外。见 {@pwrKelvin}。',
        'It does not help. Ohm’s law is linear: as I grows, the contact and lead drops grow in the same ratio, so the error ratio stays the same. High current also heats the contacts and makes L·di/dt in the cables a new problem. The correct fix is 4-wire sensing, which keeps this error out of the sense loop. See {@pwrKelvin}.',
      ),
      lessons: ['pwrKelvin'],
    },
  ],
}
