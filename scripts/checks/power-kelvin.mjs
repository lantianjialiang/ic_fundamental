// PWR-03 开尔文连接与高压漏电：对 pwrKelvinModel.ts 的单测用例（规格 §3 PWR-03 单测用例）。
export default async function run({ load, check, near }) {
  const m = await load('modules/power/pwrKelvinModel.ts')

  // 2 线：2 + 2×(0.5+0.5) = 4 mΩ
  const r2w = m.twoWireMohm(2, 0.5, 0.5)
  check('2 线读数 2+2×(0.5+0.5)=4 mΩ', r2w === 4, `得到 ${r2w}`)

  // 4 线：感测回路无电流，读数等于 R_dut
  const r4w = m.fourWireMohm(2)
  check('4 线读数等于 R_dut = 2 mΩ', r4w === 2, `得到 ${r4w}`)

  // 任务卡 T1：Rc = Rlead = 0.5 mΩ 时 2 线误差 100%
  const c1 = m.analyseContact({ mode: '2w', iA: 50, rcMohm: 0.5, rleadMohm: 0.5 })
  check('T1 2 线误差 100%', near(c1.errPct, 100, 1e-9), `得到 ${c1.errPct}%`)

  // 任务卡 T2：2 线误差 5% 的边界是 Rc + Rlead = 0.05 mΩ
  const c2 = m.analyseContact({ mode: '2w', iA: 50, rcMohm: 0.025, rleadMohm: 0.025 })
  check('T2 Rc+Rlead = 0.05 mΩ 时 2 线误差为 5%', near(c2.err2wPct, 5, 1e-9), `得到 ${c2.err2wPct}%`)
  const c3 = m.analyseContact({ mode: '2w', iA: 50, rcMohm: 0.05, rleadMohm: 0.05 })
  check('Rc+Rlead = 0.1 mΩ 时 2 线误差超过 5%', c3.err2wPct > 5, `得到 ${c3.err2wPct}%`)

  // 4 线误差为 0（与 Rc、Rlead 无关）
  const c4 = m.analyseContact({ mode: '4w', iA: 50, rcMohm: 5, rleadMohm: 5 })
  check('4 线误差为 0，与 Rc、Rlead 无关', c4.errPct === 0, `得到 ${c4.errPct}%`)

  // 高压：I_fix = 1000 / 1e11 = 10 nA
  const ifix = m.fixtureCurrentA(1000, m.insulationEffOhm(11, 40), false)
  check('夹具漏电 1000/1e11 = 10 nA', near(ifix, 1e-8, 1e-9), `得到 ${ifix} A`)

  // 任务卡 T3：Idss = 20 nA 时误差 50%，guard 开后恢复
  const hvOff = m.analyseHv({ vtest: 1000, rinsExp: 11, rh: 40, guard: 'off', idssNa: 20 })
  check('Idss 20 nA、夹具 10 nA 时误差 50%', near(hvOff.errPct, 50, 1e-9), `得到 ${hvOff.errPct}%`)
  const hvOn = m.analyseHv({ vtest: 1000, rinsExp: 11, rh: 40, guard: 'on', idssNa: 20 })
  check('guard 开后夹具漏电为 0，误差回到 0', hvOn.ifixA === 0 && hvOn.errPct === 0, `得到 ${hvOn.errPct}%`)

  // 湿度因子：40 %RH 以下为 1，每升高 50 %RH 降为十分之一
  check('湿度 40 %RH 时因子为 1', m.humidityFactor(40) === 1, `得到 ${m.humidityFactor(40)}`)
  check('湿度 90 %RH 时因子为 0.1', near(m.humidityFactor(90), 0.1, 1e-9), `得到 ${m.humidityFactor(90)}`)
}
