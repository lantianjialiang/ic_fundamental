// REL 共享模型（core）的单测用例，取自 ATE-REL-module-spec.md §3 各课的“单测用例”。
export default async function run({ load, check, near }) {
  const rel = await load('modules/qual/core/reliability.ts')
  const pat = await load('modules/qual/core/pat.ts')
  const wf = await load('modules/qual/core/wafer.ts')

  console.log('REL-01 可靠度与 MTTF')
  check('R(43800 h | 100 FIT) = 0.99563', near(rel.reliabilityFromFit(100, 43800), 0.99563, 1e-4), rel.reliabilityFromFit(100, 43800).toFixed(5))
  check('1e7 h ≈ 1141 年', near(1e7 / 8760, 1141.6, 1e-3), (1e7 / 8760).toFixed(1))
  check('MTTF(100 FIT) = 1e7 h', near(rel.mttfFromFit(100), 1e7, 1e-9))

  console.log('REL-02 加速因子')
  check('Arrhenius AF(0.7 eV, 55→125 °C) ≈ 77.7', near(rel.arrheniusAF(0.7, 55, 125), 77.7, 0.01), rel.arrheniusAF(0.7, 55, 125).toFixed(2))
  check('Arrhenius AF(0.5 eV, 55→125 °C) ≈ 22.4', near(rel.arrheniusAF(0.5, 55, 125), 22.4, 0.01), rel.arrheniusAF(0.5, 55, 125).toFixed(2))
  check('Coffin-Manson (165/65)^2 ≈ 6.44', near(rel.coffinMansonAF(65, 165, 2), 6.44, 0.005), rel.coffinMansonAF(65, 165, 2).toFixed(3))
  const m1 = rel.blackMTTF(1, 1, 2, 0.7, 398.15)
  const m2 = rel.blackMTTF(1, 2, 2, 0.7, 398.15)
  check('Black：电流密度加倍、n=2，MTTF 变为 1/4', near(m2 / m1, 0.25, 1e-9), (m2 / m1).toFixed(4))

  console.log('REL-03 样本量与 FIT 上限')
  check('χ²(0.6, 2) = 1.8326', near(rel.chi2Quantile(0.6, 2), 1.8326, 1e-3), rel.chi2Quantile(0.6, 2).toFixed(4))
  check('χ²(0.9, 2) = 4.6052', near(rel.chi2Quantile(0.9, 2), 4.6052, 1e-3), rel.chi2Quantile(0.9, 2).toFixed(4))
  const af = rel.arrheniusAF(0.7, 55, 125)
  const dh = 231 * 1000 * af
  check('DH = 231×1000×77.7 ≈ 1.795e7', near(dh, 1.795e7, 0.005), dh.toExponential(3))
  const up60 = rel.fitUpperBound(0, 231 * 1000, 0.6, af) * 1e9
  const up90 = rel.fitUpperBound(0, 231 * 1000, 0.9, af) * 1e9
  check('零失效 CL 60% 上限 ≈ 51 FIT', near(up60, 51, 0.01), up60.toFixed(2))
  check('零失效 CL 90% 上限 ≈ 128 FIT', near(up90, 128, 0.01), up90.toFixed(2))
  const minN = rel.minSampleZeroFail(50, 0.6, 1000, af)
  check('目标 50 FIT@60%、1000 h 的最少样本量 ≥ 230', minN >= 230 && minN <= 240, `n=${minN}`)

  console.log('REL-04 Weibull 拟合')
  const rand = wf.mulberry32(42)
  const beta = 2
  const eta = 1000
  const times = []
  for (let i = 0; i < 1000; i += 1) {
    const u = rand()
    times.push(eta * Math.pow(-Math.log(1 - u), 1 / beta))
  }
  const fit = rel.fitWeibull(times)
  check('n=1000 时 β 误差 < 5%', near(fit.beta, beta, 0.05), `β=${fit.beta.toFixed(3)}`)
  check('n=1000 时 η 误差 < 5%', near(fit.eta, eta, 0.05), `η=${fit.eta.toFixed(1)}`)
  const cens = times.map((t) => t > 1200)
  const fitC = rel.fitWeibull(times, cens)
  check('右删失数据仍能拟合 β（误差 < 10%）', near(fitC.beta, beta, 0.1), `β=${fitC.beta.toFixed(3)}`)

  console.log('REL-05 Burn-in')
  check('h=0 时残余 = p', near(rel.burnInResidual(0.01, 0.5, 100, 0, af), 0.01, 1e-12))
  check('残余随 BI 时间单调下降', rel.burnInResidual(0.01, 0.5, 100, 10, af) > rel.burnInResidual(0.01, 0.5, 100, 100, af))

  console.log('REL-07 PAT 限值')
  const x = [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50]
  check('中位数 = 10', pat.median(x) === 10)
  check('MAD = 1', pat.mad(x) === 1)
  check('σ_rob = 1.4826', near(pat.robustSigma(x), 1.4826, 1e-9))
  const lim = pat.dynamicPatLimits(x, 6)
  check('k=6 限值 ≈ [1.1, 18.9]', near(lim.lo, 1.1, 0.02) && near(lim.hi, 18.9, 0.02), `[${lim.lo.toFixed(3)}, ${lim.hi.toFixed(3)}]`)
  check('50 被剔除', x.filter((v) => v < lim.lo || v > lim.hi).length === 1)

  console.log('晶圆模型')
  const p = {
    diameterDie: 20,
    seed: 2026,
    latentRate: 0.005,
    clusterProb: 0.6,
    paramMean: 1,
    paramSigma: 0.05,
    latentShiftSigma: 3,
  }
  const w1 = wf.makeWafer(p)
  const w2 = wf.makeWafer(p)
  check('晶圆约 300 颗 die', w1.dies.length >= 280 && w1.dies.length <= 330, `${w1.dies.length}`)
  check('同 seed 同结果（可复现）', JSON.stringify(w1.dies.map((d) => d.param)) === JSON.stringify(w2.dies.map((d) => d.param)))
  const nLatent = w1.dies.filter((d) => d.latent).length
  check('潜在缺陷数 ≈ latentRate × die 数', Math.abs(nLatent - Math.round(0.005 * w1.dies.length)) <= 1, `${nLatent}`)

  const failed = new Set(w1.dies.filter((d) => d.latent).slice(0, 3).map((d) => d.id))
  const extra = pat.neighborRule(w1, failed, 1.5, 1)
  check('邻近规则只剔除好 die，不剔除已失效的', [...extra].every((id) => !failed.has(id)))
}
