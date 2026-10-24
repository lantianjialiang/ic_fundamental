import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-05 Burn-in 与早期失效筛选：动态 / 晶圆级老化、已有术语的课程补充，以及常见问题 */
export const REL_BURNIN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'dynamic-burn-in',
      term: 'Dynamic Burn-in',
      name: loc('动态老化', 'Dynamic burn-in'),
      def: loc(
        '老化时给器件加偏置并让电路持续翻转，覆盖的节点比静态老化多，能暴露与动作相关的潜在缺陷。代价是老化板更复杂、功耗更大。见 {@relBurnIn}。',
        'Burn-in with bias applied and the circuit kept switching, so more nodes are exercised than in static burn-in and activity-related latent defects can surface. The cost is a more complex board and higher power. See {@relBurnIn}.',
      ),
      lessons: ['relBurnIn'],
    },
    {
      id: 'wafer-level-burn-in',
      term: 'Wafer-level Burn-in',
      name: loc('晶圆级老化（WLBI）', 'Wafer-level burn-in (WLBI)'),
      def: loc(
        '在晶圆还没切开时就做老化，靠探针卡或专用夹具给整片加热、加偏置。能提早剔除弱品，省掉封装的钱，但接触与热分布要专门设计。见 {@relBurnIn}。',
        'Burn-in done while the wafer is still uncut, with a probe card or special fixture heating the whole wafer and applying bias. Weak dies are removed before packaging, saving assembly cost, but contact and thermal uniformity need careful design. See {@relBurnIn}.',
      ),
      lessons: ['relBurnIn'],
    },
  ],
  extraLessons: {
    'burn-in': ['relBurnIn'],
    ppm: ['relBurnIn'],
  },
  faqs: [
    {
      id: 'rel-burnin-all-defects',
      q: loc('Burn-in 能不能把所有缺陷都剔掉？', 'Can burn-in remove every defect?'),
      a: loc(
        '不能。BI 只剔除在 h·AF 个现场小时内失效的那部分缺陷子群，残余 p·[1 − F_d(h·AF)] 会留在出货品里，在 T_field 内继续失效。所以 BI 后仍要看现场 ppm，并用统计筛选等手段补充。见 {@relBurnIn}。',
        'No. Burn-in removes only the part of the defect subgroup that fails within h·AF use hours. The residue p·[1 − F_d(h·AF)] ships and keeps failing within T_field, so field ppm must still be checked, and statistical screening can help. See {@relBurnIn}.',
      ),
      lessons: ['relBurnIn'],
    },
    {
      id: 'rel-burnin-longer',
      q: loc('Burn-in 时间是不是越长越好？', 'Is a longer burn-in always better?'),
      a: loc(
        '不是。残余随 h·AF 下降，但是 BI 成本与时间成正比，过了 ppm 目标之后每多一小时省下的现场成本很少。要找的是满足 ppm 目标的最短时间，或成本最低的时间。见 {@relBurnIn}。',
        'No. Residue falls as h·AF grows, but BI cost is proportional to time, and past the ppm target each extra hour saves little field cost. Look for the shortest time that meets the ppm target, or the time with the lowest cost. See {@relBurnIn}.',
      ),
      lessons: ['relBurnIn'],
    },
    {
      id: 'rel-burnin-temp-accel',
      q: loc('为什么提高 Burn-in 温度就能缩短时间？', 'Why does a higher burn-in temperature shorten the time?'),
      a: loc(
        '温度通过 Arrhenius 关系放大失效速度：AF = exp[(Ea/k)(1/T_use − 1/T_BI)]，温度用开尔文计算。同样的 h 小时，AF 越大，等效现场小时 h·AF 越长。前提是 BI 温度下失效机理与现场相同，否则会引入新的失效。见 {@relAccel} 和 {@relBurnIn}。',
        'Temperature speeds up failure through the Arrhenius relation: AF = exp[(Ea/k)(1/T_use − 1/T_BI)], with temperatures in kelvin. For the same h hours, a larger AF gives a longer equivalent field time h·AF. This holds only if the failure mechanism at the BI temperature matches the field; otherwise new failures can appear. See {@relAccel} and {@relBurnIn}.',
      ),
      lessons: ['relBurnIn'],
    },
  ],
}
