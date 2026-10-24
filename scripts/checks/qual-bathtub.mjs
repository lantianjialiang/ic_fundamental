// REL-01 浴盆曲线的单测（取自 ATE-REL-module-spec.md §3 REL-01 单测用例）。
// 用法：node scripts/check-qual.mjs（会运行全部 qual-*.mjs）。
export default async function run({ load, check, near }) {
  const rel = await load('modules/qual/core/reliability.ts')
  const bath = await load('modules/qual/relBathtubModel.ts')

  console.log('REL-01 浴盆曲线')
  const r5 = rel.reliabilityFromFit(100, 43800)
  check('R(43800 h | 100 FIT) = 0.99563', near(r5, 0.99563, 1e-4), r5.toFixed(5))

  const years = 1e7 / bath.HOURS_PER_YEAR
  check('1e7 h ≈ 1141 年', near(years, 1141, 1e-3), years.toFixed(1))

  // 只留随机段：早期比例 0、磨损段推到 1e6 h 之后，全群体 R 应等于 exp(−λt)
  const pure = { ...bath.DEFAULT_BATH, earlyFrac: 0, randomFit: 100, etaWear: 1e6 }
  const rModel = bath.reliabilityAt(pure, 43800)
  check('模型：仅随机段时 R(43800 h) ≈ 0.99563', near(rModel, 0.99563, 1e-3), rModel.toFixed(5))

  // 蒙特卡洛失效数与解析 CDF 的偏差应在 3σ 之内（同一 seed 可复现）
  const s = bath.DEFAULT_BATH
  const times = bath.sampleLifetimes(s)
  const n = times.length
  for (const t of [1000, 43800, 1e5]) {
    const failCount = times.filter((x) => x <= t).length
    const p = 1 - bath.reliabilityAt(s, t)
    const expected = n * p
    const sigma = Math.sqrt(n * p * (1 - p))
    check(
      `蒙特卡洛失效数 vs 解析 CDF（t=${t} h）偏差 < 3σ`,
      Math.abs(failCount - expected) < 3 * sigma,
      `count=${failCount}, expect=${expected.toFixed(1)}, 3σ=${(3 * sigma).toFixed(1)}`,
    )
  }

  // 直方图的期望与计数应当一致（总和一致性）
  const hist = bath.histogramOf(s, times)
  const countSum = hist.counts.reduce((a, b) => a + b, 0)
  const inRange = times.filter((x) => x >= bath.T_MIN_H && x < bath.T_MAX_H).length
  check('直方图计数 = 量程内样本数', countSum === inRange, `${countSum} vs ${inRange}`)
}
