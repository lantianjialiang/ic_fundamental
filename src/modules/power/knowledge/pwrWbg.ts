import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-07 宽禁带器件：术语、已有词条的课程补充、常见问题 */
export const PWR_WBG_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'wide-bandgap',
      term: 'Wide bandgap',
      name: loc('宽禁带半导体（SiC、GaN）', 'Wide-bandgap semiconductor (SiC, GaN)'),
      def: loc(
        '禁带宽度明显大于 Si（约 1.12 eV）的半导体，SiC（4H）约 3.3 eV，GaN 约 3.4 eV。禁带越宽，临界击穿场强越高，同耐压的漂移区可以更薄，导通电阻更低；教学上常用 R ∝ BV^2.5 / Ec^3 粗略比较。见 {@pwrWbg}。',
        'A semiconductor whose bandgap is much wider than Si (about 1.12 eV): about 3.3 eV for 4H-SiC and about 3.4 eV for GaN. A wider bandgap gives a higher critical breakdown field, so the drift region can be thinner at the same voltage and on-resistance is lower; teaching often compares them roughly with R ∝ BV^2.5 / Ec^3. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
    {
      id: 'vth-hysteresis',
      term: 'Vth hysteresis',
      name: loc('阈值电压滞回', 'Threshold-voltage hysteresis'),
      def: loc(
        '正向扫描与反向扫描读到的 Vth 不同，差值 Δ 取决于扫描速度与测量历史。SiC MOSFET 栅氧界面陷阱在栅偏下充放电是主要原因；用固定的预置栅压序列可以压低 Δ。见 {@pwrWbg}。',
        'The Vth read on a forward sweep differs from the one read on a reverse sweep, by an amount Δ that depends on sweep rate and measurement history. Charging and discharging of gate-oxide interface traps under gate bias is the main cause in SiC MOSFETs; a fixed preconditioning gate sequence reduces Δ. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
    {
      id: 'dynamic-rds-on',
      term: 'Dynamic Rds(on)',
      name: loc('动态导通电阻', 'Dynamic on-resistance'),
      def: loc(
        '关态高压应力之后，器件的 Rds(on) 比静态值高，并随时间慢慢恢复。GaN HEMT 的陷阱是主要原因。测量时必须规定应力电压、应力时间与测量延时，否则结果不可重复。见 {@pwrWbg}。',
        'After high-voltage off-state stress, a device’s Rds(on) is higher than its static value and recovers slowly over time. Traps are the main cause in GaN HEMTs. The stress voltage, stress time and measurement delay must all be specified, or results will not repeat. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
  ],
  extraLessons: {
    preconditioning: ['pwrWbg'],
  },
  faqs: [
    {
      id: 'pwr-wbg-why-wide-bandgap',
      q: loc('为什么 SiC、GaN 的导通电阻能比 Si 低这么多？', 'Why can SiC and GaN have so much lower on-resistance than Si?'),
      a: loc(
        '禁带更宽，临界击穿场强更高。同样的耐压下，漂移区可以更薄、更高掺杂，导通电阻随之下降。教学上 R ∝ BV^2.5 / Ec^3 只是粗略的趋势，不代表真实器件数值；低压段沟道与封装电阻占比大，优势会被稀释。见 {@pwrWbg}。',
        'A wider bandgap gives a higher critical breakdown field. At the same voltage the drift region can be thinner and more heavily doped, so the on-resistance drops. Teaching uses R ∝ BV^2.5 / Ec^3 only as a rough trend, not as real device numbers; at low voltage the channel and package resistance weigh more and dilute the advantage. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
    {
      id: 'pwr-wbg-vth-once',
      q: loc('能不能测一次 SiC 的 Vth，然后一直用这个数？', 'Can I measure SiC Vth once and use that number from then on?'),
      a: loc(
        '不能。正扫与反扫的 Vth 可能差出一截，差值随扫描速度和预置时间变化。只测一次，就是把某次扫描后的陷阱状态当成了器件常数。应固定预置序列（电压、时间）与扫描速度，并把它写进测试程序。见 {@pwrWbg}。',
        'No. The forward and reverse Vth can differ noticeably, and the gap changes with sweep rate and preconditioning time. One measurement treats one sweep’s trap state as a device constant. Fix the preconditioning sequence (voltage and time) and the sweep rate, and write them into the test program. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
    {
      id: 'pwr-wbg-delay',
      q: loc('GaN 的动态 Rds(on) 应该早测还是晚测？', 'Should GaN dynamic Rds(on) be measured early or late?'),
      a: loc(
        '要在延时远小于恢复时间常数（教学取 τ = 10 µs）的时候测，才能读到接近真实的动态增幅。测得太晚，增幅已经恢复，结果会低估；测得太早，系统还没稳定，也会有误差。延时必须和应力条件一起规定。见 {@pwrWbg}。',
        'Measure while the delay is well below the recovery time constant (τ = 10 µs in teaching), so the reading is close to the true dynamic increase. Measuring too late lets the increase recover, which underestimates it; measuring too early may catch an unsettled system. The delay must be specified together with the stress condition. See {@pwrWbg}.',
      ),
      lessons: ['pwrWbg'],
    },
  ],
}
