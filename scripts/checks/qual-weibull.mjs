// REL-04 寿命数据分析：单测用例取自 ATE-REL-module-spec.md §3 REL-04。
export default async function run({ load, check, near }) {
  const rel = await load('modules/qual/core/reliability.ts')
  const model = await load('modules/qual/relWeibullModel.ts')

  console.log('REL-04 Weibull 拟合（n = 1000）')
  const beta = 2
  const eta = 1000
  const big = model.sampleLifetimes(beta, eta, 1000, 42, Infinity)
  const fitBig = rel.fitWeibull(
    big.map((s) => s.t),
    big.map((s) => s.censored),
  )
  check('n=1000 时 β 误差 < 5%', near(fitBig.beta, beta, 0.05), `β=${fitBig.beta.toFixed(3)}`)
  check('n=1000 时 η 误差 < 5%', near(fitBig.eta, eta, 0.05), `η=${fitBig.eta.toFixed(1)}`)

  console.log('REL-04 样本量影响（同一组 30 个种子取平均）')
  const errSmall = model.meanBetaError(beta, eta, 10, 30)
  const errLarge = model.meanBetaError(beta, eta, 1000, 30)
  check('n=10 的平均 β 误差大于 n=1000', errSmall > errLarge, `n=10: ${(errSmall * 100).toFixed(1)}%, n=1000: ${(errLarge * 100).toFixed(1)}%`)

  console.log('REL-04 右删失数据')
  const cens = model.sampleLifetimes(beta, eta, 1000, 42, 1200)
  const censCount = cens.filter((s) => s.censored).length
  const fitC = rel.fitWeibull(
    cens.map((s) => s.t),
    cens.map((s) => s.censored),
  )
  check('截尾时间 1200 h 时仍有截尾点', censCount > 0, `截尾 ${censCount} 颗`)
  check('右删失数据仍能拟合 β（误差 < 10%）', near(fitC.beta, beta, 0.1), `β=${fitC.beta.toFixed(3)}`)

  console.log('REL-04 页面默认设置的分析结果')
  const a = model.analyseWeibull(model.DEFAULT_WEIBULL)
  check('默认设置下拟合成功（β、η 为有限数）', a.finite, `β=${a.fit.beta.toFixed(3)}`)
  check('外推 B10 为正且有限', Number.isFinite(a.b10Use) && a.b10Use > 0, a.b10Use.toFixed(0))
}
