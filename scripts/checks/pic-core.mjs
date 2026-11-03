// PIC 共享模型的单测，取自 ATE-PIC-module-spec.md §3。
export default async function run({ load, check, near }) {
  const ph = await load('modules/pic/core/photonics.ts')
  const al = await load('modules/pic/core/align.ts')
  const link = await load('modules/pic/core/link.ts')

  console.log('PIC-01 能耗')
  check('10 W / 1.6 Tbps = 6.25 pJ/bit', near(ph.energyPerBitJ(10, 1.6e12), 6.25e-12, 1e-9))

  console.log('PIC-02 波长与链路预算')
  check('lambdaToTHz(1550) ≈ 193.4', near(ph.lambdaToTHz(1550), 193.4, 0.001), ph.lambdaToTHz(1550).toFixed(2))
  const arrived = ph.linkBudgetDbm(10, [3, 0.5 * 2.5, 4, 3])
  check('10−3−1.25−4−3 = −1.25 dBm', near(arrived, -1.25, 1e-9), arrived.toFixed(3))
  check('−3 dBm ≈ 0.501 mW', near(ph.mw(-3), 0.501187, 0.002))

  console.log('PIC-03 FSR、临界耦合、热漂移')
  check('MZI FSR(1550, ng=4.2, ΔL=100 µm) ≈ 5.72 nm', near(ph.fsrNm(1550, 4.2, 100), 5.72, 0.002), ph.fsrNm(1550, 4.2, 100).toFixed(3))
  const ringL = ph.ringLengthUm(10)
  check('环 R=10 µm 的 FSR ≈ 9.10 nm', near(ph.fsrNm(1550, 4.2, ringL), 9.1, 0.002), ph.fsrNm(1550, 4.2, ringL).toFixed(3))
  const lambda0 = ph.resonantLambdaNm(2.4, ringL, 1550)
  const t0 = ph.ringAllPass({ lambdaNm: [lambda0], neff: 2.4, lengthUm: ringL, a: 0.9, r: 0.9 })[0]
  check('a = r 时谐振处 T ≈ 0', t0 < 1e-6, t0.toExponential(2))
  check('热漂移 ≈ 66.4 pm/K', near(ph.thermalShiftPmPerK(1550, 4.2, 1.8e-4), 66.4, 0.005), ph.thermalShiftPmPerK(1550, 4.2, 1.8e-4).toFixed(2))
  const grid = ph.linspace(1530, 1570, 8001)
  const ringT = ph.ringAllPass({ lambdaNm: grid, neff: 2.4, ng: 4.2, lambda0Nm: 1550, lengthUm: ringL, a: 0.9, r: 0.9 })
  const dips = []
  for (let i = 1; i < ringT.length - 1; i += 1) {
    if (ringT[i] < ringT[i - 1] && ringT[i] < ringT[i + 1] && ringT[i] < 0.05) dips.push(grid[i])
  }
  const fsrPlot = dips.length >= 2 ? dips[1] - dips[0] : 0
  const fsrNg = ph.fsrNm(dips[0] ?? 1550, 4.2, ringL)
  check('谱线相邻谷间距 ≈ λ²/(ng·L)', dips.length >= 2 && near(fsrPlot, fsrNg, 0.05), `${fsrPlot.toFixed(3)} vs ${fsrNg.toFixed(3)}`)

  console.log('PIC-04 MZM 与 PD')
  check('正交点 V=0 输出 P0/2', near(ph.mzmPower({ p0: 2, v: 0, vpi: 4, phi0: ph.QUADRATURE_PHI }), 1, 1e-9))
  check('正交点 V=+Vπ/2 输出 P0', near(ph.mzmPower({ p0: 2, v: 2, vpi: 4, phi0: ph.QUADRATURE_PHI }), 2, 1e-6))
  check('正交点 V=−Vπ/2 输出 0', near(ph.mzmPower({ p0: 2, v: -2, vpi: 4, phi0: ph.QUADRATURE_PHI }), 0, 1e-6))
  const iA = ph.pdCurrent(ph.dbmToW(-10), 0.8, 0)
  check('−10 dBm、R=0.8 A/W → 80 µA', near(iA, 80e-6, 0.005), (iA * 1e6).toFixed(2))

  console.log('PIC-06 耦合损耗与对准')
  check('Δ = w 时附加损耗 4.343 dB', near(ph.gcLossDb(2, 2, 3) - 3, 4.343, 0.001))
  const map = al.couplingMap({ x0: 0.4, y0: -0.3, wUm: 2, peakDb: -3, noiseDb: 0, seed: 1 })
  const opts = { range: 4, step: 0.4, moveTimeS: 0.05 }
  for (const [name, result] of [
    ['栅格', al.alignRaster(map, opts)],
    ['螺旋', al.alignSpiral(map, opts)],
    ['爬山', al.alignHillClimb(map, { startX: 3, startY: -3, step0: 0.8, moveTimeS: 0.05 })],
  ]) {
    const excess = al.excessLossDb(map, result.x, result.y)
    check(`${name} 无噪声时附加损耗 ≤ 0.2 dB`, excess <= 0.2, `${excess.toFixed(3)} dB @ (${result.x.toFixed(2)}, ${result.y.toFixed(2)})`)
  }

  console.log('PIC-07 cut-back')
  const lengths = [0.1, 0.5, 1, 2]
  const loss = lengths.map((len) => 2.5 * len + 6)
  const fit = link.cutbackFit(lengths, loss)
  check('无噪声斜率 = 2.5 dB/cm', near(fit.slopeDbPerCm, 2.5, 1e-9), fit.slopeDbPerCm.toFixed(4))
  check('无噪声截距 = 6 dB', near(fit.interceptDb, 6, 1e-9), fit.interceptDb.toFixed(4))

  console.log('PIC-08 灵敏度与 BER')
  const omaMw = link.rxSensitivityOmaMw(link.Q_BER_1E12, 10e-6, 0.8)
  check('OMA_min ≈ 0.17585 mW', near(omaMw, 0.17585, 0.005), omaMw.toFixed(5))
  check('OMA_min ≈ −7.55 dBm', near(link.omaDbm(omaMw), -7.55, 0.002), link.omaDbm(omaMw).toFixed(3))
  const ber = link.qfunc(link.Q_BER_1E12)
  check('Q=7.034 → BER ≈ 1e-12', ber > 2e-13 && ber < 5e-12, ber.toExponential(3))

  console.log('PIC-09 良率连乘')
  const y = link.yieldProduct([0.95, ...Array(8).fill(0.98)])
  check('0.95×0.98^8 ≈ 0.808', near(y, 0.808, 0.002), y.toFixed(4))
}
