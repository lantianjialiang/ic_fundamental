// REL-05 Burn-in 与早期失效筛选：核对 relBurnInModel 的剔除 / 残余拆分、AF 与 ppm 达标曲线。
// 单测用例取自 ATE-REL-module-spec.md §3 REL-05；另加 T2、T3 所依赖的单调性检查。
export default async function run({ load, check, near }) {
  const bi = await load('modules/qual/relBurnInModel.ts')

  console.log('REL-05 Burn-in 剔除与残余')
  const p = 0.005
  const af = bi.biAf(125, 5)
  const split = bi.splitBurnIn(p, 0.6, 1000, 24, af)
  check('剔除 + 残余 = 初始 p', near(split.removed + split.residual, p, 1e-12), (split.removed + split.residual).toExponential(6))
  const h0 = bi.splitBurnIn(p, 0.6, 1000, 0, af)
  check('h = 0 时残余 = p', near(h0.residual, p, 1e-12), h0.residual.toExponential(4))
  const r10 = bi.splitBurnIn(p, 0.6, 1000, 10, af).residual
  const r100 = bi.splitBurnIn(p, 0.6, 1000, 100, af).residual
  check('残余随 BI 时间单调下降（10 h > 100 h）', r10 > r100, `${r10.toExponential(3)} > ${r100.toExponential(3)}`)

  console.log('REL-05 加速因子与达标时间')
  check('BI 温度 125 °C、电压不变：AF ≈ 77.7（Ea 0.7 eV，55 °C 使用）', near(af, 77.7, 0.01), af.toFixed(2))
  check('BI 温度升高，AF 变大', bi.biAf(150, 5) > af, bi.biAf(150, 5).toFixed(1))
  const curve125 = bi.costCurve(bi.DEFAULT_BI)
  const curve150 = bi.costCurve({ ...bi.DEFAULT_BI, tBiC: 150 })
  const h125 = bi.minHForTarget(curve125, bi.TARGET_PPM)
  const h150 = bi.minHForTarget(curve150, bi.TARGET_PPM)
  check('默认参数下 168 h 内能达到 ppm 目标', h125 !== null, `h = ${h125}`)
  check('150 °C 的达标时间短于 125 °C', h125 !== null && h150 !== null && h150 < h125, `${h150} h < ${h125} h`)
  const free = bi.bestUnconstrained(curve125)
  check('无约束最低成本点的 ppm 超过目标（只看成本不够）', free.ppm > bi.TARGET_PPM, `h = ${free.h}, ${free.ppm.toFixed(0)} ppm`)
  const feasible = bi.bestFeasible(curve125, bi.TARGET_PPM)
  check('ppm 约束下的最低成本点在达标区内', feasible !== null && feasible.ppm <= bi.TARGET_PPM && feasible.h >= h125, `h = ${feasible?.h}`)
}
