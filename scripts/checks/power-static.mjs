// PWR-02 静态参数测试（pwrStatic）的单测用例，取自 ATE-PWR-module-spec.md §3 PWR-02 的“单测用例”。
export default async function run({ load, check, near }) {
  const pw = await load('modules/power/core/power.ts')
  const th = await load('modules/power/core/thermal.ts')
  const model = await load('modules/power/pwrStaticModel.ts')

  console.log('PWR-02 功耗与自热（core）')
  const p = pw.conductionLoss(50, 0.005)
  check('P = I²R：50 A、5 mΩ → 12.5 W', near(p, 12.5, 1e-9), `${p} W`)
  const rth = 1
  const tau = 0.01
  const dt10ms = th.pulseHeating(12.5, 0.01, { stages: [{ rth, tau }] })
  check('ΔTj(10 ms) = 12.5 × 1 × (1 − e⁻¹) ≈ 7.9 K', near(dt10ms, 7.9, 0.01), dt10ms.toFixed(3))
  const err = th.rdsErrorFromRise(0.005, 7.9)
  check('自热引起的 Rds(on) 误差 ≈ 3.95%', near(err, 0.0395, 0.01), `${(err * 100).toFixed(2)}%`)
  const tMax = th.singleStagePulseFor(12.5, rth, tau, 2)
  check('误差 < 1%（ΔT < 2 K）的最大脉宽 ≈ 1.74 ms', near(tMax, 1.744e-3, 0.01), `${(tMax * 1e3).toFixed(3)} ms`)

  console.log('PWR-02 界面模型（pwrStaticModel）')
  const ps = model.initialStatic()
  const dissipated = model.dissipation(50, 25)
  check('界面模型：50 A、25 °C 的功耗 = 12.5 W', near(dissipated, 12.5, 1e-9), `${dissipated} W`)
  const rise = model.peakRise(12.5, 0.01, 0.01)
  check('界面模型：10 ms、D = 1% 时 ΔTj ≈ 7.9 K（周期修正 ≈ 1）', near(rise, 7.9, 0.01), rise.toFixed(3))
  const fromModel = model.rdsErrorAt(50, 25, 0.01, 0.01)
  check('界面模型：10 ms 时误差 ≈ 3.95%', near(fromModel.errPct, 3.95, 0.01), `${fromModel.errPct.toFixed(3)}%`)
  const limitS = model.maxPulseS(12.5)
  check('界面模型：误差 1% 的最大单脉冲 ≈ 1.74 ms', near(limitS, 1.744e-3, 0.01), `${(limitS * 1e3).toFixed(3)} ms`)
  const at100us = model.rdsErrorAt(50, 25, 0.01, 100e-6).errPct
  check('界面模型：100 µs 时误差 < 1%', at100us < 1, `${at100us.toFixed(3)}%`)

  console.log('PWR-02 漏电与 BVdss')
  const idss125 = model.idssAt(125, 'good')
  check('良品 Idss：25 °C 为 10 nA，125 °C 翻 10 次 ≈ 10.24 µA', near(idss125, 10240, 1e-9), `${idss125} nA`)
  const clipBv = model.measureOf({ ...ps, param: 'bvdss', compliance: 99 })
  check('BVdss：compliance 99 V 低于 BV 时读数被截断', clipBv.clipped === true && near(clipBv.value, 99, 1e-9))
  const bvOk = model.measureOf({ ...ps, param: 'bvdss', compliance: 101 })
  check('BVdss：compliance 101 V 时读数为 BV = 100 V', near(bvOk.value, 100, 1e-9) && bvOk.clipped === false)

  console.log('PWR-02 Vth 依赖 Id')
  const v025 = model.vthAt(0.25)
  const v25 = model.vthAt(2.5)
  check('Vth 随 Id 升高（Id 0.25 mA < 2.5 mA）', v25 > v025, `${v025.toFixed(4)} V < ${v25.toFixed(4)} V`)
  check('Vth(0.25 mA) ≈ 3.01 V', near(v025, 3.01, 0.002))
}
