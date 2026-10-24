// REL-03 可靠性试验方法与样本量：单测用例取自 ATE-REL-module-spec.md §3 REL-03。
export default async function run({ load, check, near }) {
  const rel = await load('modules/qual/core/reliability.ts')
  const model = await load('modules/qual/relStressModel.ts')

  console.log('REL-03 χ² 分位数与样本量')
  check('χ²(0.6, 2) = 1.8326', near(rel.chi2Quantile(0.6, 2), 1.8326, 1e-3), rel.chi2Quantile(0.6, 2).toFixed(4))
  check('χ²(0.9, 2) = 4.6052', near(rel.chi2Quantile(0.9, 2), 4.6052, 1e-3), rel.chi2Quantile(0.9, 2).toFixed(4))

  const base = {
    ...model.DEFAULT_STRESS,
    type: 'htol',
    batches: 3,
    perBatch: 77,
    hours: 1000,
    tStress: 125,
    ea: 0.7,
    r: 0,
    cl: 0.6,
    targetFit: 50,
  }
  const a60 = model.analyseStress(base)
  check('样本 n = 3 批 × 77 片 = 231', a60.n === 231, `n=${a60.n}`)
  check('HTOL 55→125 °C 的 AF ≈ 77.7', near(a60.af, 77.7, 0.01), a60.af.toFixed(2))

  const dh = 231 * 1000 * a60.af
  check('DH = 231×1000×77.7 ≈ 1.795e7', near(dh, 1.795e7, 0.005), dh.toExponential(3))
  check('等效器件小时（模型输出）与 DH 一致', near(a60.equivHours, dh, 1e-9), a60.equivHours.toExponential(3))

  check('零失效 CL 60% 上限 ≈ 51 FIT（1%）', near(a60.fitUpper, 51, 0.01), a60.fitUpper.toFixed(2))
  const a90 = model.analyseStress({ ...base, cl: 0.9 })
  check('零失效 CL 90% 上限 ≈ 128 FIT（1%）', near(a90.fitUpper, 128, 0.01), a90.fitUpper.toFixed(2))

  check('T4：50 FIT@60%、1000 h 的最少样本量在 230–240 之间', a60.minSample >= 230 && a60.minSample <= 240, `n=${a60.minSample}`)
  const minT4 = model.minSampleFor(50, 0.6, 1000, a60.af, 0)
  check('T4：最少样本量 = 236（约）', minT4 === 236, `n=${minT4}`)
  const minR1 = model.minSampleFor(50, 0.6, 1000, a60.af, 1)
  check('失效数 r = 1 时所需样本量大于 r = 0', minR1 > minT4, `n(r=1)=${minR1}`)
  const fitAtMin = rel.fitUpperBound(1, minR1 * 1000, 0.6, a60.af) * 1e9
  const fitBelow = rel.fitUpperBound(1, (minR1 - 1) * 1000, 0.6, a60.af) * 1e9
  check('r = 1 时二分结果恰好是第一个达标的 n', fitAtMin <= 50 && fitBelow > 50, `${fitAtMin.toFixed(2)} / ${fitBelow.toFixed(2)}`)

  console.log('REL-03 Coffin-Manson（温度循环）')
  const tc = model.analyseStress({ ...base, type: 'tc', dtStress: 165 })
  check('温度循环 ΔT 65→165、n=2 的 AF ≈ 6.44', near(tc.af, 6.44, 0.005), tc.af.toFixed(3))
}
