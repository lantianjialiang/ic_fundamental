// REL-02 失效机理与加速模型的单测（取自 ATE-REL-module-spec.md §3 REL-02 单测用例）。
// 用法：node scripts/check-qual.mjs（会运行全部 qual-*.mjs）。
export default async function run({ load, check, near }) {
  const rel = await load('modules/qual/core/reliability.ts')
  const acc = await load('modules/qual/relAccelModel.ts')

  console.log('REL-02 失效机理与加速模型')
  const af70 = rel.arrheniusAF(0.7, 55, 125)
  check('arrheniusAF(0.7 eV, 55→125 °C) ≈ 77.7（±1%）', near(af70, 77.7, 0.01), af70.toFixed(2))

  const af50 = rel.arrheniusAF(0.5, 55, 125)
  check('arrheniusAF(0.5 eV, 55→125 °C) ≈ 22.4（±1%）', near(af50, 22.4, 0.01), af50.toFixed(2))

  const cm = rel.coffinMansonAF(65, 165, 2)
  check('Coffin-Manson (165/65)^2 ≈ 6.44', near(cm, 6.44, 0.005), cm.toFixed(3))

  const m1 = rel.blackMTTF(1, 1, 2, 0.7, 398.15)
  const m2 = rel.blackMTTF(1, 2, 2, 0.7, 398.15)
  check('Black：电流密度加倍、n = 2，MTTF 比为 1/4', near(m2 / m1, 0.25, 1e-9), (m2 / m1).toFixed(4))

  // 模型层：页面上的 AF 读数与核心函数一致，并用 Black 方程交叉核对 EM 的 AF_T·AF_J
  const def = acc.DEFAULT_ACCEL
  const a0 = acc.analyseAccel({ ...def, tStress: 125, ea: 0.7 })
  check('模型：默认参数下 AF_T 与 arrheniusAF 一致', near(a0.afT, af70, 1e-12), a0.afT.toFixed(4))
  check('模型：EM 的 Black 比与 AF_T·AF_J 一致（J=2, n=2）', (() => {
    const a = acc.analyseAccel({ ...def, mech: 'em', tStress: 125, ea: 0.7, j: 2, n: 2 })
    return near(a.blackRatio, a.afT * a.afJ, 1e-9)
  })(), 'ok')
  check('模型：TMF 只计入温度循环项', (() => {
    const a = acc.analyseAccel({ ...def, mech: 'tmf', dtStress: 165, n: 2 })
    return a.total === a.afCm && near(a.afCm, 6.44, 0.005)
  })(), 'ok')
  check('模型：ESD 不计入任何寿命分项（总 AF = 1）', acc.analyseAccel({ ...def, mech: 'esd', tStress: 125 }).total === 1)
  const useYears = acc.analyseAccel({ ...def, mech: 'tddb', tStress: 125, ea: 0.7, hours: 1000 }).useYears
  check('模型：等效使用年数 = 1000 h × AF_T / 8760', near(useYears, (1000 * af70) / 8760, 0.01), useYears.toFixed(2))
}
