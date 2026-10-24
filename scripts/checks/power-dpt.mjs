// PWR-05 双脉冲测试的单测用例，取自 ATE-PWR-module-spec.md §3 PWR-05 的“单测用例”。
export default async function run({ load, check, near }) {
  const m = await load('modules/power/pwrDptModel.ts')
  const base = m.DPT_DEFAULT

  console.log('PWR-05 双脉冲：电流与 t1')
  const t1 = m.t1ForCurrent(30, 100e-6, 400)
  check('t1 = 30 × 100e-6 / 400 = 7.5 µs', near(t1, 7.5e-6, 1e-9), `${(t1 * 1e6).toFixed(3)} µs`)
  const iAtT1 = m.loadCurrent({ ...base, vdc: 400, lUh: 100, t1Us: 7.5 })
  check('界面换算：Vdc 400 V、L 100 µH、t1 7.5 µs → I = 30 A', near(iAtT1, 30, 1e-9), iAtT1.toFixed(3))

  console.log('PWR-05 双脉冲：过冲')
  const tim = m.dptTiming({ ...base, rg: 10, lstrayNh: 20 })
  check('di/dt = 2 A/ns（Rg = 10 Ω 时）', near(tim.diDt, 2e9, 1e-9), `${(tim.diDt / 1e9).toFixed(3)} A/ns`)
  check('ΔV = 20 nH × 2 A/ns = 40 V', near(tim.overshoot, 40, 1e-9), `${tim.overshoot.toFixed(3)} V`)
  const slow = m.dptTiming({ ...base, rg: 20, lstrayNh: 20 })
  check('Rg 增大 → 过冲变小（di/dt ∝ 1/Rg）', slow.overshoot < tim.overshoot, `${slow.overshoot.toFixed(1)} V < ${tim.overshoot.toFixed(1)} V`)

  console.log('PWR-05 双脉冲：能量积分与解析值')
  const r = m.simulateDpt(base)
  check('默认参数：Eon 数值积分与解析分段线性值误差 < 2%', near(r.eon, r.eonAnalytic, 0.02), `${r.eon.toExponential(4)} vs ${r.eonAnalytic.toExponential(4)}`)
  check('默认参数：Eoff 数值积分与解析分段线性值误差 < 2%', near(r.eoff, r.eoffAnalytic, 0.02), `${r.eoff.toExponential(4)} vs ${r.eoffAnalytic.toExponential(4)}`)
  const ideal = m.simulateDpt({ ...base, deskewNs: 0, bwMhz: 1000 })
  check('理想测量链：Eon 积分与解析值误差 < 2%', near(ideal.eonIdeal, ideal.eonAnalytic, 0.02))
  check('理想测量链：Eoff 积分与解析值误差 < 2%', near(ideal.eoffIdeal, ideal.eoffAnalytic, 0.02))
  const omitted = r.eonAnalytic - r.eonFormula
  check('Eon 简化公式漏掉的是 Vdc·I·t_rr 段', near(omitted, 400 * r.timing.current * r.timing.tRr, 1e-9), `${(omitted * 1e6).toFixed(2)} µJ`)

  console.log('PWR-05 双脉冲：探头偏斜')
  const skew = m.simulateDpt({ ...base, deskewNs: 5 })
  check('5 ns 偏斜会改变 Eoff 测量误差（|误差| > 1%）', Math.abs(skew.eoffErrPct) > 1, `${skew.eoffErrPct.toFixed(2)} %`)
  check('电流晚到时 Eoff 偏大、Eon 偏小', skew.eoffErrPct > 0 && skew.eonErrPct < 0, `Eoff ${skew.eoffErrPct.toFixed(2)} %，Eon ${skew.eonErrPct.toFixed(2)} %`)
  check('无偏斜时测量误差接近 0', Math.abs(r.eoffErrPct) < 0.5, `${r.eoffErrPct.toFixed(3)} %`)

  console.log('PWR-05 双脉冲：Rg 折中')
  const rgHigh = m.simulateDpt({ ...base, rg: 20 })
  check('Rg 增大 → Eoff 增大（开关损耗↑）', rgHigh.eoff > r.eoff, `${(rgHigh.eoff * 1e6).toFixed(1)} µJ > ${(r.eoff * 1e6).toFixed(1)} µJ`)
}
