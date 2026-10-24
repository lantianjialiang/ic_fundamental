// REL-08 量产测试流程（relFlow）的单测，取自 ATE-REL-module-spec.md §3 REL-08 的“单测用例”，并补充 STDF 往返与任务可达性。
// 同 seed、同流程逐位一致；STDF 往返后颗数、Bin 件数、测试温度（MIR.TST_TEMP）与坐标字段一致。
export default async function run({ load, check }) {
  const m = await load('modules/qual/relFlowModel.ts')
  const s = await load('modules/gen/model/stdf.ts')
  const LOT = 'LOT-AUTO-001'
  const bytesEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

  console.log('REL-08 确定性（同 seed、同流程）')
  const popA = m.buildPopulation(m.DEFAULT_POP)
  const popB = m.buildPopulation(m.DEFAULT_POP)
  const runA = m.runFlow(m.DEFAULT_FLOW, popA)
  const runB = m.runFlow(m.DEFAULT_FLOW, popB)
  check('同 seed、同流程：结果逐位相同', JSON.stringify(runA.result) === JSON.stringify(runB.result))
  const expA = m.exportStdf(m.DEFAULT_FLOW, runA, LOT)
  const expB = m.exportStdf(m.DEFAULT_FLOW, runB, LOT)
  check('同 seed、同流程：导出的 STDF 字节相同', bytesEqual(expA.bytes, expB.bytes), `${expA.bytes.length} bytes`)

  console.log('REL-08 STDF 往返（颗数、Bin、温度、坐标）')
  const parsed = s.parseStdf(expA.bytes)
  const sum = s.summarizeStdf(parsed)
  check('解析无错误', parsed.errors.length === 0, `${parsed.errors.length} 个错误`)
  check('颗数往返一致', sum.partN === expA.partN, `${sum.partN} / ${expA.partN}`)
  const binsBack = new Map(sum.hardBins.map((b) => [b.bin, b.count]))
  const binOk = [1, 2, 3, 4, 5, 6, 7].every((b) => (binsBack.get(b) ?? 0) === expA.binCounts[b])
  check('各 Bin 件数往返一致', binOk, JSON.stringify([...binsBack.entries()]))
  const binSum = [1, 2, 3, 4, 5, 6, 7].reduce((acc, b) => acc + expA.binCounts[b], 0)
  check('Bin 件数之和等于颗数', binSum === expA.partN, `${binSum}`)
  const tempBack = m.readTstTemp(expA.bytes, parsed)
  check('MIR.TST_TEMP 往返一致', tempBack === expA.tstTemp, `写入 ${expA.tstTemp}，读回 ${tempBack}`)
  check('TST_TEMP 等于流程实际测试温度', expA.tstTemp === runA.result.tempsUsed.join('/'), expA.tstTemp)
  check('LOT_ID 往返一致', sum.lotId === LOT, sum.lotId)
  const xs = parsed.fields.filter((f) => f.name === 'X_COORD').map((f) => f.value)
  check('每颗器件都有 X_COORD 字段', xs.length === expA.partN, `${xs.length}`)
  check('含 CP 的流程，坐标非零', xs.some((v) => v !== 0))

  const noCp = { ...m.DEFAULT_FLOW, on: { ...m.DEFAULT_FLOW.on, cpRoom: false, cpHot: false } }
  const noCpExp = m.exportStdf(noCp, m.runFlow(noCp, popA), LOT)
  const noCpXs = s.parseStdf(noCpExp.bytes).fields.filter((f) => f.name === 'X_COORD').map((f) => f.value)
  check('不含 CP 的流程，坐标写 0（缺失）', noCpXs.length > 0 && noCpXs.every((v) => v === 0))

  console.log('REL-08 教学目标与趋势')
  const bi52 = { ...m.DEFAULT_FLOW, on: { ...m.DEFAULT_FLOW.on, bi: true }, biH: 52 }
  const r52 = m.runFlow(bi52, popA).result
  check(
    'BI 52 h（默认 soak）同时满足 ppm 目标与成本预算',
    r52.ppm <= m.PPM_TARGET && r52.cot <= m.COT_BUDGET,
    `ppm ${r52.ppm.toFixed(0)}（≤ ${m.PPM_TARGET}），COT ${r52.cot.toFixed(3)}（≤ ${m.COT_BUDGET}）`,
  )
  const rDef = m.runFlow(m.DEFAULT_FLOW, popA).result
  check('默认流程（无 BI、无 PAT）的 ppm 超过目标', rDef.ppm > m.PPM_TARGET, `${rDef.ppm.toFixed(0)} ppm`)
  const noCold = { ...m.DEFAULT_FLOW, on: { ...m.DEFAULT_FLOW.on, ftCold: false } }
  const rNoCold = m.runFlow(noCold, popA).result
  check('去掉 FT 低温站后，温度偏移逃逸增加', rNoCold.escBy.shift > rDef.escBy.shift, `${rNoCold.escBy.shift.toFixed(1)} > ${rDef.escBy.shift.toFixed(1)}`)
  const soakShort = m.runFlow({ ...m.DEFAULT_FLOW, soakS: 20 }, popA).result
  const soakLong = m.runFlow({ ...m.DEFAULT_FLOW, soakS: 180 }, popA).result
  check('soak 变长：UPH 降低、测试成本升高', soakLong.uph < soakShort.uph && soakLong.cot > soakShort.cot, `UPH ${soakShort.uph.toFixed(0)} → ${soakLong.uph.toFixed(0)}`)
  const reordered = { ...m.DEFAULT_FLOW, order: ['cpRoom', 'ftRoom', 'cpHot', 'ftHot', 'ftCold', 'bi', 'pat', 'relSample'] }
  const rReorder = m.runFlow(reordered, popA).result
  check('把室温站排在前面，温度切换减少', rReorder.changes < rDef.changes, `${rDef.changes} → ${rReorder.changes}`)
}
