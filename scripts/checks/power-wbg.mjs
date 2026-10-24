// PWR-07 宽禁带器件的单测用例，取自 ATE-PWR-module-spec.md §3 PWR-07 的“单测用例”。
export default async function run({ load, check, near }) {
  const w = await load('modules/power/pwrWbgModel.ts')

  console.log('PWR-07 GaN 动态 Rds(on) 恢复模型')
  const k = 0.8
  const inc0 = w.ganIncrease(k, 0)
  const incTau = w.ganIncrease(k, w.GAN_TAU_US)
  check('t = τ 时增幅为初值的 e⁻¹', near(incTau / inc0, Math.exp(-1), 1e-9), (incTau / inc0).toFixed(6))
  check(
    'R(τ) = R0 · (1 + k·e⁻¹)',
    near(w.ganRds(k, w.GAN_TAU_US), w.GAN_R0_MOHM * (1 + k * Math.exp(-1)), 1e-9),
    w.ganRds(k, w.GAN_TAU_US).toFixed(3),
  )
  check('k = 0（无应力）时没有动态增幅', w.ganRds(0, 1) === w.GAN_R0_MOHM)

  console.log('PWR-07 SiC Vth 滞回与预置序列')
  const tpreSteps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 10]
  const diffs = tpreSteps.map((tpre) => w.vthDiff({ rate: 1, vpre: 15, tpre }))
  let monotonic = true
  for (let i = 1; i < diffs.length; i += 1) {
    if (!(diffs[i] < diffs[i - 1])) {
      monotonic = false
    }
  }
  check('预置时间增大时正反扫 Vth 差 Δ 单调下降（vpre = 15 V）', monotonic, diffs.map((d) => d.toFixed(3)).join(' '))

  const flat = [0, 1, 2, 5].map((tpre) => w.vthDiff({ rate: 1, vpre: 0, tpre }))
  check('预置电压为 0 时 Δ 不随时间下降（教学模型的边界）', flat.every((d) => d === flat[0]))

  const res = w.vthAnalysis({ rate: 1, vpre: 15, tpre: 1 })
  check('读数差 = 正扫读数 − 反扫读数 = Δ', near(res.readFwd - res.readRev, res.diff, 1e-9))
  check('默认预置 1 ms 时 Δ 超过 0.1 V（任务 T2 需要加长预置）', w.vthDiff({ rate: 1, vpre: 15, tpre: 1 }) > 0.1)
  check('预置 2.0 ms 仍不达标，2.1 ms 达标（T2 的临界）', w.vthDiff({ rate: 1, vpre: 15, tpre: 2.0 }) > 0.1 && w.vthDiff({ rate: 1, vpre: 15, tpre: 2.1 }) <= 0.1)

  console.log('PWR-07 材料对比（教学简化公式）')
  const ratio = w.relSpecificRon('si', 1200) / w.relSpecificRon('sic', 1200)
  check('1200 V 时 Si/SiC 相对比导通电阻之比 = (Eg_SiC / Eg_Si)³', near(ratio, Math.pow(3.3 / 1.12, 3), 1e-9), ratio.toFixed(2))
  check('同耐压下 GaN 相对比导通电阻低于 SiC', w.relSpecificRon('gan', 650) < w.relSpecificRon('sic', 650))
}
