// PWR-01 器件选型（pwrSelector）的单测用例，取自 ATE-PWR-module-spec.md §3 PWR-01 的“单测用例”。
export default async function run({ load, check, near }) {
  const pw = await load('modules/power/core/power.ts')
  const model = await load('modules/power/pwrSelectorModel.ts')

  console.log('PWR-01 导通损耗')
  check('P = I²R：10 A、5 mΩ → 0.5 W', near(pw.conductionLoss(10, 0.005), 0.5, 1e-9))

  console.log('PWR-01 参数分类数据')
  const groups = model.PARAM_GROUPS
  const listed = groups.flatMap((group) => group.params)
  check('参数分类恰好 4 类', groups.length === 4, `${groups.length} 类`)
  check('12 个参数全部列出', listed.length === 12, `${listed.length} 条`)
  check('每个参数只分一次类', new Set(listed).size === listed.length)
  check('每一类至少有一个参数', groups.every((group) => group.params.length > 0))
  check('每个参数的 classOf 与所在组一致', groups.every((group) => group.params.every((id) => model.classOf(id) === group.cls)))
}
