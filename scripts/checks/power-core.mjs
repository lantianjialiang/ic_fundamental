// PWR 共享模型（core）的单测用例，取自 ATE-PWR-module-spec.md §3 各课的“单测用例”。
export default async function run({ load, check, near }) {
  const pw = await load('modules/power/core/power.ts')
  const th = await load('modules/power/core/thermal.ts')

  console.log('PWR-01 导通损耗')
  check('P = I²R：10 A、5 mΩ → 0.5 W', near(pw.conductionLoss(10, 0.005), 0.5, 1e-9))

  console.log('PWR-02 自热与脉宽')
  const rth = 1
  const tau = 0.01
  const dt10ms = th.pulseHeating(12.5, 0.01, { stages: [{ rth, tau }] })
  check('ΔTj(10 ms) = 12.5 × 1 × (1 − e⁻¹) ≈ 7.9 K', near(dt10ms, 7.9, 0.01), dt10ms.toFixed(3))
  const err = th.rdsErrorFromRise(0.005, 7.9)
  check('自热引起的 Rds(on) 误差 ≈ 3.95%', near(err, 0.0395, 0.01), `${(err * 100).toFixed(2)}%`)
  const tMax = th.singleStagePulseFor(12.5, rth, tau, 2)
  check('误差 < 1%（ΔT < 2 K）的最大脉宽 ≈ 1.74 ms', near(tMax, 1.744e-3, 0.01), `${(tMax * 1e3).toFixed(3)} ms`)

  console.log('PWR-06 雪崩与热阻')
  check('E_AS(1 mH, 10 A, 50 V, 100 V) = 0.1 J', near(pw.easJ(1e-3, 10, 50, 100), 0.1, 1e-9))
  check('t_av = 200 µs', near(pw.avalancheTime(1e-3, 10, 50, 100), 200e-6, 1e-9))
  check('E_AS = 0.5 J 时 Ipk ≈ 22.4 A', near(pw.ipkForEnergy(0.5, 1e-3, 50, 100), 22.36, 0.002), pw.ipkForEnergy(0.5, 1e-3, 50, 100).toFixed(3))
  const z1ms = th.zth({ stages: [{ rth: 0.5, tau: 0.005 }] }, 1e-3)
  check('Zth(1 ms) = 0.5 (1 − e^(−0.2)) ≈ 0.0906', near(z1ms, 0.0906, 0.002), z1ms.toFixed(4))
  const dt = th.pulseHeating(100, 1e-3, { stages: [{ rth: 0.5, tau: 0.005 }] })
  check('P = 100 W、1 ms 的温升 ≈ 9.06 K', near(dt, 9.06, 0.002), dt.toFixed(3))

  console.log('PWR-02 MOSFET 模型')
  const m = pw.demoMos()
  check('Vgs ≤ Vth 时 Id = 0', pw.mosId(m, 2, 10, 25) === 0)
  check('导通电阻随温度增大', pw.rdsOn(m, 125) > pw.rdsOn(m, 25))
}
