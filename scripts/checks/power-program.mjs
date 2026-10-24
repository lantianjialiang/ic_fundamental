// PWR-08 综合测试程序的单测用例，取自 ATE-PWR-module-spec.md §3 PWR-08 的“单测用例”。
export default async function run({ load, check }) {
  const m = await load('modules/power/pwrProgramModel.ts')

  console.log('PWR-08 同 seed 可复现')
  const popA = m.makePopulation(m.SEED, m.N_DUT)
  const popB = m.makePopulation(m.SEED, m.N_DUT)
  check('同一 seed 生成的 1000 颗 DUT 完全相同', JSON.stringify(popA) === JSON.stringify(popB))
  const runA = m.runProgram(m.DEFAULT_PROGRAM, popA)
  const runB = m.runProgram(m.DEFAULT_PROGRAM, popB)
  check('同一 seed、同一流程，统计结果完全相同', JSON.stringify(runA.summary) === JSON.stringify(runB.summary))
  const other = m.makePopulation(m.SEED + 1, m.N_DUT)
  check('换一个 seed，群体不同（确认 seed 确实参与）', JSON.stringify(other) !== JSON.stringify(popA))

  console.log('PWR-08 STDF 往返')
  const def = m.exportCheck(runA)
  check('默认流程导出后读回 1000 颗，Bin 计数与仿真一致', def.partN === m.N_DUT && def.binsMatch, `partN=${def.partN}`)
  check('导出的记录顺序通过校验（issues = 0）', def.issues === 0, `issues=${def.issues}`)
  const tuned = m.exportCheck(m.runProgram({ ...m.DEFAULT_PROGRAM, pat: 'on', uisPct: 85 }, popA))
  check('调整后的流程（PAT 开、UIS 85 %）导出后 Bin 计数仍一致', tuned.binsMatch && tuned.issues === 0)

  console.log('PWR-08 Kelvin 检查与 Site 3')
  const sites = runA.summary.sites
  const site3 = sites[2].kelvinFails
  const others = sites.filter((s) => s.site !== 3).map((s) => s.kelvinFails)
  check(
    'Kelvin 检查把 Site 3 的接触问题挑出的次数多于其他 Site',
    others.every((n) => site3 > n),
    `site3=${site3} others=${others.join(',')}`,
  )
  const rdsFirst = { ...m.DEFAULT_PROGRAM, steps: [m.DEFAULT_PROGRAM.steps[5], ...m.DEFAULT_PROGRAM.steps.filter((_, i) => i !== 5)] }
  const rdsFirstSummary = m.runProgram(rdsFirst, popA).summary
  check(
    'Rds(on) 排在 Kelvin 之前时，Site 3 的 Rds(on) 均值高于其他 Site',
    rdsFirstSummary.sites[2].rdsMean > Math.max(...rdsFirstSummary.sites.filter((s) => s.site !== 3).map((s) => s.rdsMean)),
    rdsFirstSummary.sites.map((s) => s.rdsMean.toFixed(2)).join(' '),
  )

  console.log('PWR-08 脉宽与自热（教学简化）')
  const d = popA[0]
  check('脉宽越长，Rds(on) 读数越高（自热偏差）', m.rdsReading(d, 10000) > m.rdsReading(d, 300))
}
