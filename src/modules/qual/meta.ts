import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/**
 * 可靠性 / 车规轨道（qual，轨道前缀 Q）中 REL 系列的课程 ID，顺序即课序。
 * 轨道里原有的 latch 排在前面；REL-01…REL-08 依次接在后面。
 */
export const REL_LESSONS = [
  'relBathtub',
  'relAccel',
  'relStress',
  'relWeibull',
  'relBurnIn',
  'relAuto',
  'relPat',
  'relFlow',
] as const

export type RelLessonId = (typeof REL_LESSONS)[number]

export const REL_META: Record<RelLessonId, LessonMeta> = {
  relBathtub: {
    title: loc('可靠性基础与浴盆曲线', 'Reliability basics and the bathtub curve'),
    goal: loc(
      '区分早期、随机、磨损三段失效；由失效率算可靠度 R(t)、MTTF，并互换 FIT 与 MTTF；说出出厂测试、Burn-in、寿命试验各针对浴盆曲线哪一段。',
      'Tell infant, random and wear-out failures apart; compute reliability R(t) and MTTF from a failure rate, convert between FIT and MTTF, and say which part of the bathtub curve production test, burn-in and life test each address.',
    ),
  },
  relAccel: {
    title: loc('失效机理与加速模型', 'Failure mechanisms and acceleration models'),
    goal: loc(
      '说出主要失效机理及诱因；用 Arrhenius、电压、Coffin-Manson、Black 方程算加速因子；理解激活能 Ea 的含义与不确定性。',
      'Name the main failure mechanisms and their causes; compute acceleration factors with the Arrhenius, voltage, Coffin-Manson and Black models; understand what activation energy Ea means and how uncertain it is.',
    ),
  },
  relStress: {
    title: loc('可靠性试验方法与样本量', 'Reliability test methods and sample size'),
    goal: loc(
      '说出 HTOL、HTSL、TC、HAST、ELFR、ESD、闩锁试验的目的；用零失效统计算 FIT 上限；由目标 FIT 反推样本量。',
      'State the purpose of HTOL, HTSL, TC, HAST, ELFR, ESD and latch-up tests; compute the FIT upper bound from zero-failure statistics; work back from a target FIT to a sample size.',
    ),
  },
  relWeibull: {
    title: loc('寿命数据分析：Weibull 与 FIT', 'Life data analysis: Weibull and FIT'),
    goal: loc(
      '用 Weibull 概率图估计 β、η；由 β 判断失效模式；处理右删失数据；把应力结果外推到使用条件并求 B10 寿命。',
      'Estimate β and η from a Weibull probability plot; read the failure mode from β; handle right-censored data; extrapolate stress results to use conditions and find the B10 life.',
    ),
  },
  relBurnIn: {
    title: loc('Burn-in 与早期失效筛选', 'Burn-in and early-failure screening'),
    goal: loc(
      '说明 Burn-in 的目的与几种形式；在 ppm、成本、时间之间权衡；计算 Burn-in 之后的残余早期失效。',
      'Explain the purpose of burn-in and its forms; trade off ppm, cost and time; compute the residual early failures left after burn-in.',
    ),
  },
  relAuto: {
    title: loc('车规基础：AEC-Q100 框架与温度等级', 'Automotive basics: AEC-Q100 framework and temperature grades'),
    goal: loc(
      '说出 AEC-Q100 的温度等级 0–3 与试验分组 A–G；理解三温测试与 DPPM、追溯的意义；分清 AEC-Q100、ISO 26262、IATF 16949 各管什么。',
      'State the AEC-Q100 temperature grades 0–3 and test groups A–G; understand three-temperature testing, DPPM and traceability; tell what AEC-Q100, ISO 26262 and IATF 16949 each cover.',
    ),
  },
  relPat: {
    title: loc('零缺陷测试策略：PAT、SBA 与邻近筛选', 'Zero-defect strategy: PAT, SBA and neighborhood screening'),
    goal: loc(
      '用中位数与 MAD 算动态限值；比较整 Lot 与单晶圆窗口的差异；启用邻近规则，权衡良率损失与漏检。',
      'Compute dynamic limits from the median and MAD; compare whole-lot and single-wafer windows; apply the neighbourhood rule and weigh yield loss against escapes.',
    ),
  },
  relFlow: {
    title: loc('综合：车规产品量产测试流程', 'Capstone: automotive production test flow'),
    goal: loc(
      '为 VDUT-AUTO1 设计从 CP 到 FT 的车规流程；在 DPPM 目标与成本预算之间优化；比较 Burn-in 与 PAT+邻近两种筛选；导出带温度和追溯字段的 STDF。',
      'Design a CP-to-FT automotive flow for VDUT-AUTO1; optimise between the DPPM target and the cost budget; compare burn-in with PAT plus neighbourhood screening; export STDF with temperature and traceability fields.',
    ),
  },
}
