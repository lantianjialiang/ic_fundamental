// REL-07 零缺陷测试策略（PAT、稳健限值与邻近规则）的数值核对。
// 用法：node scripts/check-qual.mjs（会运行本文件）。
// 断言取自 ATE-REL-module-spec.md 的 REL-07 单测用例，并检查实验模型的读数与任务卡可达性。
export default async function run({ load, check, near }) {
  const m = await load('modules/qual/relPatModel.ts')

  console.log('REL-07 手算样本与动态限值')
  const s = m.samplePat(6)
  check('数据 [10,11,9,10,10,12,8,10,11,9,50] 的中位数 = 10', s.median === 10, `${s.median}`)
  check('MAD = 1', s.mad === 1, `${s.mad}`)
  check('σ_rob = 1.4826', near(s.sigmaRob, 1.4826, 1e-9), s.sigmaRob.toFixed(4))
  check('k=6 限值 ≈ [1.1, 18.9]', near(s.limits.lo, 1.1, 0.01) && near(s.limits.hi, 18.9, 0.01), `[${s.limits.lo.toFixed(3)}, ${s.limits.hi.toFixed(3)}]`)
  const removed = m.SAMPLE_DATA.filter((v) => v < s.limits.lo || v > s.limits.hi)
  check('50 被剔除，且只剔除它', removed.length === 1 && removed[0] === 50, `剔除 ${removed.join(',')}`)

  console.log('REL-07 实验模型（默认参数）')
  const base = m.DEFAULT_PAT
  const r1 = m.runPat(base)
  const r2 = m.runPat(base)
  const st = r1.stats
  check('同参数同结果（固定种子，可复现）', JSON.stringify(r1.stats) === JSON.stringify(r2.stats))
  check('捕获数 + 漏检数 = 潜在缺陷总数', st.latentCaught + st.escapes === st.latent, `${st.latentCaught} + ${st.escapes} = ${st.latent}`)
  check('潜在缺陷数 ≈ 0.5% × die 数（逐片取整误差 ≤ 片数 × 0.5）', Math.abs(st.latent - 0.005 * st.dies) <= 0.5 * m.LOT_WAFERS, `${st.latent} / ${st.dies}`)
  check('捕获率与良率损失都在 [0, 1] 内', st.capture >= 0 && st.capture <= 1 && st.yieldLoss >= 0 && st.yieldLoss <= 1)
  check('默认窗口为整 Lot，只画一组限值线', r1.applied.length === 1 && r1.applied[0].site === null)
  check('每 Site 窗口画 4 组限值线', m.runPat({ ...base, window: 'site' }).applied.length === m.SITE_IDS.length)

  console.log('REL-07 任务卡可达性')
  let reachableK = null
  for (let k = 3; k <= 8 && reachableK === null; k += 0.5) {
    const rk = m.runPat({ ...base, k }).stats
    if (rk.capture >= 0.8 && rk.yieldLoss <= 0.005) {
      reachableK = k
    }
  }
  check('T2：存在 k ∈ [3, 8] 使捕获 ≥ 80% 且良率损失 ≤ 0.5%', reachableK !== null, reachableK === null ? '无' : `k = ${reachableK}`)
  const nbrOn = m.runPat({ ...base, nbr: 'on' }).stats
  check('T3：开启邻近规则后有额外剔除（良率损失与漏检会变化）', nbrOn.nbrExtra > 0, `额外剔除 ${nbrOn.nbrExtra}`)
  const m1 = m.runPat({ ...base, nbr: 'on', minFails: 1 }).stats
  const m2 = m.runPat({ ...base, nbr: 'on', minFails: 2 }).stats
  check('邻近阈值 m 越小，良率损失越大（权衡）', m1.yieldLoss > m2.yieldLoss, `m=1 ${(m1.yieldLoss * 100).toFixed(2)}%，m=2 ${(m2.yieldLoss * 100).toFixed(2)}%`)
  const shifted = m.WAFER_IDS.map((id) => {
    const r = m.runPat({ ...base, window: 'wafer', wafer: id })
    return (r.waferMedian - r.lotMedian) / r.sigmaRob
  })
  check('T4：存在一片中位数偏离整 Lot ≥ 0.5 σ_rob（批内偏移）', shifted.some((d) => Math.abs(d) >= 0.5), `最大 |Δ| = ${Math.max(...shifted.map(Math.abs)).toFixed(2)}`)
}
