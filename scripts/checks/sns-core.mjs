// SNS 共享模型的单测，取自 ATE-SNS-module-spec.md §3。
export default async function run({ load, check, near }) {
  const op = await load('modules/sns/core/optics.ts')
  const fr = await load('modules/sns/core/frames.ts')
  const sn = await load('modules/sns/core/sensor.ts')

  console.log('SNS-02 响应度与光子')
  check('responsivity(0.6, 550) ≈ 0.266 A/W', near(op.responsivity(0.6, 550), 0.266, 0.005), op.responsivity(0.6, 550).toFixed(4))
  const snr = op.snrDb(1e4, 0, 0)
  check('N=1e4 散粒噪声极限 SNR = 40 dB', near(snr, 40, 0.002), snr.toFixed(3))
  const flux = op.photonFlux(1e-6, 550)
  check('1 µW @ 550 nm ≈ 2.77e12 光子/s', near(flux, 2.77e12, 0.01), flux.toExponential(3))
  check('散粒噪声等于读噪时 S = σr²', near(op.shotEqualsReadE(5), 25, 1e-12))

  console.log('SNS-03 转换增益与 kTC')
  check('q/1 fF ≈ 160.2 µV/e⁻', near(op.conversionGainV(1e-15) * 1e6, 160.2, 0.005), (op.conversionGainV(1e-15) * 1e6).toFixed(2))
  check('kTC(1 fF, 300 K) ≈ 12.7 e⁻', near(op.kTcNoiseE(1e-15, 300), 12.7, 0.01), op.kTcNoiseE(1e-15, 300).toFixed(2))
  const kDn = sn.kElectronsPerDn(1, 10, 100e-6)
  check('10 bit、1 V、100 µV/e⁻ → K ≈ 9.77 e⁻/DN', near(kDn, 9.77, 0.005), kDn.toFixed(3))
  check('量化噪声 ≈ 2.82 e⁻', near(sn.quantNoiseE(kDn), 2.82, 0.01), sn.quantNoiseE(kDn).toFixed(3))

  console.log('SNS-01 两点法与平均')
  const fit = sn.twoPoint(0, 0.2, 10, 5.2)
  check('两点法 S = 0.5、b = 0.2', near(fit.s, 0.5, 1e-9) && near(fit.b, 0.2, 1e-9))
  const trials = 400
  const spread = (nAvg) => {
    const estimates = []
    for (let trial = 0; trial < trials; trial += 1) {
      const rand = sn.mulberry32(1000 + trial * 17 + nAvg)
      let y0 = 0
      let y1 = 0
      for (let k = 0; k < nAvg; k += 1) {
        y0 += sn.sensorSample({ s: 1, b: 0, nl: 0, noise: 1, tco: 0, x: 0, tempC: 25, rand })
        y1 += sn.sensorSample({ s: 1, b: 0, nl: 0, noise: 1, tco: 0, x: 1, tempC: 25, rand })
      }
      estimates.push(sn.twoPoint(0, y0 / nAvg, 1, y1 / nAvg).s)
    }
    const mean = estimates.reduce((a, b) => a + b, 0) / estimates.length
    const v = estimates.reduce((a, b) => a + (b - mean) ** 2, 0) / (estimates.length - 1)
    return Math.sqrt(v)
  }
  const s1 = spread(1)
  const s16 = spread(16)
  check('平均 16 次后斜率标准差约缩小 4 倍', near(s1 / s16, 4, 0.25), `${(s1 / s16).toFixed(2)}×`)

  console.log('SNS-04 PTC')
  check('√(2/(1e4−1)) ≈ 1.41%', near(fr.varRelError(1e4), 0.01414, 0.01), fr.varRelError(1e4).toFixed(5))
  const cis = {
    w: 96,
    h: 96,
    kEperDn: 10,
    readNoiseE: 2,
    fwcE: 40000,
    darkE25PerS: 0,
    darkDoubleC: 7,
    prnu: 0,
    shadingPct: 0,
    defects: { dead: 0, hot: 0, low: 0, clusterProb: 0 },
    blackLevelDn: 0,
    adcBits: 14,
  }
  const roi = { x: 0, y: 0, w: 96, h: 96 }
  const dark = sn.genFrame(cis, { exposureS: 0.01, illumE: 0, tempC: 25, seed: 7 })
  const levels = [2e4, 5e4, 1e5, 2e5, 4e5, 8e5]
  const pairs = levels.map((illumE, index) => ({
    f1: sn.genFrame(cis, { exposureS: 0.01, illumE, tempC: 25, seed: 100 + index * 2 }),
    f2: sn.genFrame(cis, { exposureS: 0.01, illumE, tempC: 25, seed: 101 + index * 2 }),
    roi,
  }))
  const ptc = sn.ptc(pairs, dark, cis.w)
  check('合成帧恢复 K，误差 < 3%', near(ptc.k, 10, 0.03), ptc.k.toFixed(3))

  console.log('SNS-05 暗电流')
  check('25→60 °C、ΔT=7 °C，倍数 = 32', near(op.darkElectronsPerS(1, 60, 7), 32, 1e-9))
  const noiseN = (n) => {
    const samples = []
    for (let trial = 0; trial < 200; trial += 1) {
      const rand = sn.mulberry32(50 + trial + n * 1000)
      let acc = 0
      for (let k = 0; k < n; k += 1) acc += sn.gaussian(rand)
      samples.push(acc / n)
    }
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    return Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / (samples.length - 1))
  }
  check('N 帧平均后时间噪声约缩小 √N', near(noiseN(1) / noiseN(9), 3, 0.2), (noiseN(1) / noiseN(9)).toFixed(2))

  console.log('SNS-06 PRNU 公式与缺陷')
  check('PRNU_meas 公式', near(sn.prnuMeasured(0.01, 0.02, 4), Math.sqrt(0.01 ** 2 + 0.02 ** 2 / 4), 1e-9))
  const small = {
    ...cis,
    w: 32,
    h: 32,
    prnu: 0,
    readNoiseE: 0.3,
    defects: { dead: 3, hot: 3, low: 3, clusterProb: 0 },
  }
  const bright = sn.genFrame(small, { exposureS: 0.02, illumE: 2e5, tempC: 25, seed: 3 })
  const darkSmall = sn.genFrame(small, { exposureS: 0.02, illumE: 0, tempC: 25, seed: 4 })
  const mask = sn.defectMask(small, 1)
  const judged = sn.classifyDefects(bright, darkSmall, small.w, { dead: 0.12, hot: 200, low: 0.5 })
  let agree = 0
  let total = 0
  const name = ['ok', 'dead', 'hot', 'low']
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i] === 0) continue
    total += 1
    if (judged.kind[i] === name[mask[i]]) agree += 1
  }
  check('注入缺陷分类一致', total > 0 && agree === total, `${agree}/${total}`)

  console.log('SNS-07 光源与数据量')
  check('√(0.5²+0.3²) = 0.583', near(sn.prnuWithSource(0.5, 0.3), 0.583, 0.002), sn.prnuWithSource(0.5, 0.3).toFixed(4))
  const bytes = (12e6 * 12) / 8
  check('12 MP × 12 bit = 18 MB', near(bytes, 18e6, 1e-9))
  check('900 MB @ 2.5 Gbps = 2.88 s', near((900e6 * 8) / 2.5e9, 2.88, 0.002))

  console.log('SNS-08 加速度计')
  const cal = sn.flipCal(1.95, 1.35)
  check('offset = 1.65 V、S = 0.3 V/g', near(cal.offsetV, 1.65, 1e-9) && near(cal.sVg, 0.3, 1e-9))
  check('1−cos(2°) = 6.09e-4', near(sn.tiltSensitivityError(2), 6.09e-4, 0.01), sn.tiltSensitivityError(2).toExponential(3))
  check('150 µg/√Hz × √50 ≈ 1.06 mg', near(sn.noiseInBand(150e-6, 50), 1.06e-3, 0.01), sn.noiseInBand(150e-6, 50).toExponential(3))
}
