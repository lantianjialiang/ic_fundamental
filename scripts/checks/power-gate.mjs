// PWR-04 动态参数：栅极电荷。对 pwrGateModel.ts 的单测用例（规格 §3 PWR-04 单测用例）。
export default async function run({ load, check, near }) {
  const m = await load('modules/power/pwrGateModel.ts')
  const D = m.DEFAULT_GATE
  const a = m.analyseGate(D)

  // 驱动损耗：P = Qg·Vdrive·fsw，并核对 Qg = 60 nC、10 V、500 kHz 时为 0.3 W
  check(
    '驱动损耗 P = Qg·Vdrive·fsw（默认参数）',
    near(a.pDriveW, a.qg * 1e-9 * D.vdrive * D.fswKhz * 1e3, 1e-9),
    `得到 ${a.pDriveW} W`,
  )
  // 恒流积分：Q = Ig·t，用梯形法对恒定 Ig 积分，与曲线末点的累计电荷比较（1%）
  const { t, q } = a.curve
  let qTrap = 0
  for (let i = 0; i + 1 < t.length; i += 1) {
    qTrap += D.igMa * (t[i + 1] - t[i])
  }
  const qEnd = q[q.length - 1]
  check('恒流积分 Ig·t 与曲线累计电荷一致（1%）', near(qTrap, qEnd, 0.01), `梯形 ${qTrap.toFixed(3)} nC，曲线 ${qEnd.toFixed(3)} nC`)

  // 累计电荷单调不减
  let monotonic = true
  for (let i = 1; i < q.length; i += 1) {
    if (q[i] < q[i - 1]) {
      monotonic = false
    }
  }
  check('累计电荷 Q 随时间单调不减', monotonic, '')

  // 数值积分的 Qgd 与解析式 2·Cgd0·VK·(√(1+Vdd/VK) − √(1+VDS_ON/VK)) 对照（1%）
  for (const vdd of [30, 50, 80]) {
    const r = m.analyseGate({ ...D, vdd })
    check(
      `Vdd = ${vdd} V 时数值 Qgd 与解析式一致（1%）`,
      near(r.qgd, r.qgdAnalyticNc, 0.01),
      `数值 ${r.qgd.toFixed(3)} nC，解析 ${r.qgdAnalyticNc.toFixed(3)} nC`,
    )
  }

  // Qgs = (Cgs + Cgd(Vdd)) · Vplat（平台前充 Cgs 与 Cgd）
  const cgdOff = m.cgdAt(D.cgd0Nf * 1e-9, D.vdd) * 1e9
  check('Qgs = (Cgs + Cgd(Vdd))·Vplat（1%）', near(a.qgs, (D.cgsNf + cgdOff) * a.vplat, 0.01), `得到 ${a.qgs.toFixed(3)} nC`)

  // 平台时间 = Qgd / Ig（nC / mA 即 µs）
  check('平台时间 = Qgd / Ig（1%）', near(a.tPlUs, a.qgd / D.igMa, 0.01), `得到 ${a.tPlUs.toFixed(4)} µs`)

  // Qg = Qgs + Qgd + (Cgs + Cgd(VDS_ON))·(Vdrive − Vplat)（1%）
  const cgdOn = m.cgdAt(D.cgd0Nf * 1e-9, m.VDS_ON) * 1e9
  const qgSum = a.qgs + a.qgd + (D.cgsNf + cgdOn) * (D.vdrive - a.vplat)
  check('Qg = Qgs + Qgd + 平台后电荷（1%）', near(a.qg, qgSum, 0.01), `得到 ${a.qg.toFixed(3)} nC`)

  // 平台段 Vgs 保持 Vplat，Vds 从 Vdd 降到 VDS_ON
  let flat = true
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] > a.tPlStartUs && t[i] < a.tPlEndUs && Math.abs(a.curve.vgs[i] - a.vplat) > 1e-6) {
      flat = false
    }
  }
  check('平台段 Vgs 保持 Vplat 不变', flat, '')
  check('Vds 起点为 Vdd', near(a.curve.vds[0], D.vdd, 1e-9), `得到 ${a.curve.vds[0]} V`)
  check('Vds 终点为 VDS_ON', near(a.curve.vds[a.curve.vds.length - 1], m.VDS_ON, 0.01), `得到 ${a.curve.vds[a.curve.vds.length - 1]} V`)
  check('Vgs 终点达到驱动电压 Vdrive（1%）', near(a.curve.vgs[a.curve.vgs.length - 1], D.vdrive, 0.01), '')

  // 任务卡 T2：Vdd 升高，Qgd 变大（Cgd 随 Vds 下降而增大的积分范围更大）
  const hi = m.analyseGate({ ...D, vdd: 80 })
  check('Vdd 升高，Qgd 变大', hi.qgd > a.qgd, `50 V: ${a.qgd.toFixed(2)} nC，80 V: ${hi.qgd.toFixed(2)} nC`)

  // 线性：Cgd0 加倍，Qgd 加倍
  const big = m.analyseGate({ ...D, cgd0Nf: 1.6 })
  check('Cgd0 加倍，Qgd 加倍（1%）', near(big.qgd, 2 * a.qgd, 0.01), `得到 ${big.qgd.toFixed(3)} nC`)

  // Qg 与 Ig 无关（问答题依据）
  const i5 = m.analyseGate({ ...D, igMa: 5 })
  const i20 = m.analyseGate({ ...D, igMa: 20 })
  check('Qg 与恒流 Ig 无关（1%）', near(i5.qg, i20.qg, 0.01), `5 mA: ${i5.qg.toFixed(3)} nC，20 mA: ${i20.qg.toFixed(3)} nC`)

  // 任务卡 T4：Ig 过大时平台短于 FLAT_MIN_US，示波器难分辨
  const big50 = m.analyseGate({ ...D, igMa: 50 })
  check('Ig = 50 mA 时平台短于 0.5 µs', big50.tPlUs < m.FLAT_MIN_US, `得到 ${big50.tPlUs.toFixed(3)} µs`)
}
