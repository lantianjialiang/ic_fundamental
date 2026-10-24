// 核对「STDF 与 Datalog」「Multi-site 与测试成本」两课的教学模型。
// 用法：node scripts/check-gen.mjs
// 把 src/modules/gen/model 下的纯函数转成 JS 后直接调用，逐条断言；任何一条不符退出码为 1。
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const dir = mkdtempSync(join(tmpdir(), 'gen-'))

async function load(name) {
  const src = readFileSync(join(root, 'src/modules/gen/model', `${name}.ts`), 'utf8')
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const file = join(dir, `${name}.mjs`)
  writeFileSync(file, js)
  return import(pathToFileURL(file).href)
}

let failed = 0
const check = (label, ok, detail = '') => {
  if (!ok) {
    failed++
  }
  console.log(`${ok ? '  ok ' : ' FAIL'}  ${label}  ${detail}`)
}

try {
  const stdf = await load('stdf')
  const ms = await load('multisite')

  console.log('STDF 写出 / 读取')
  const far = stdf.encodeFile([{ name: 'FAR', fields: { STDF_VER: 4 } }], true)
  check('FAR 小端头 02 00 00 0A，CPU_TYPE=2', [...far].join(' ') === '2 0 0 10 2 4', [...far].join(' '))
  const farBe = stdf.encodeFile([{ name: 'FAR', fields: { STDF_VER: 4 } }], false)
  check('FAR 大端头 00 02 00 0A，CPU_TYPE=1', [...farBe].join(' ') === '0 2 0 10 1 4', [...farBe].join(' '))
  check('字节序识别：小端 / 大端', stdf.detectByteOrder(far) === true && stdf.detectByteOrder(farBe) === false)
  check('非 STDF 字节无法识别', stdf.detectByteOrder(new Uint8Array([1, 2, 3, 4, 5])) === null)

  const dutLE = stdf.encodeFile(stdf.dutItems(2).map((i) => i.rec), true)
  const dutBE = stdf.encodeFile(stdf.dutItems(2).map((i) => i.rec), false)
  check('同一 DUT 的大小端字节不同', dutLE.length === dutBE.length && dutLE.some((b, i) => b !== dutBE[i]))
  const pLE = stdf.parseStdf(dutLE)
  const pBE = stdf.parseStdf(dutBE)
  check('大小端都识别、无错误', pLE.le === true && pBE.le === false && pLE.errors.length === 0 && pBE.errors.length === 0, `le=${pLE.le}/${pBE.le}`)
  const sLE = stdf.summarizeStdf(pLE)
  const sBE = stdf.summarizeStdf(pBE)
  check('大小端解析出相同统计', JSON.stringify(sLE.hardBins) === JSON.stringify(sBE.hardBins) && sLE.tests[0].values[0] === sBE.tests[0].values[0])
  check('DUT：Part 1 颗，Hard Bin 2 = VOH', sLE.partN === 1 && sLE.failN === 1 && sLE.hardBins.length === 1 && sLE.hardBins[0].bin === 2 && sLE.hardBins[0].name === 'VOH', JSON.stringify(sLE.hardBins))
  check('DUT：VOH 测得 2.25 V 且判失效', sLE.tests[0].failN === 1 && Math.abs(sLE.tests[0].values[0] - 2.25) < 1e-6)
  check('DUT：PRR 的 PART_ID 与 SOFT_BIN', sLE.parts[0].partId === 'P0001' && sLE.parts[0].softBin === 21)

  const lot = stdf.buildLot({ seed: 2026, parts: 60, sites: 2, defectRate: 0.15, lotId: 'LOT-DEMO-001', siteOffsetV: [0, 0] })
  const lotBytes = stdf.encodeFile(lot, true)
  const pl = stdf.parseStdf(lotBytes)
  const sl = stdf.summarizeStdf(pl)
  check('批次：读回 60 颗、无解析错误', sl.partN === 60 && pl.errors.length === 0, `parts=${sl.partN} errors=${pl.errors.length}`)
  check('批次：Bin 计数之和 = 颗数', sl.hardBins.reduce((s, b) => s + b.count, 0) === 60)
  check('批次：LOT_ID 与 PART_TYP 从 MIR 读出', sl.lotId === 'LOT-DEMO-001' && sl.partType === 'VDUT-DEMO1', `${sl.lotId} / ${sl.partType}`)
  const ptrVals = lot.filter((r) => r.name === 'PTR').map((r) => Math.fround(r.fields.RESULT))
  const readVals = sl.parts.flatMap((p) => p.results.map((r) => r.value))
  check('批次：PTR 的 RESULT 写读一致（float32）', ptrVals.length === readVals.length && ptrVals.every((v, i) => v === readVals[i]))
  const sites = sl.sites.map((s) => s.site)
  check('批次：按 SITE_NUM 分成 2 组', JSON.stringify(sites) === '[1,2]' && sl.sites.reduce((s, x) => s + x.n, 0) === 60)
  check('批次：大端写出仍可读回相同颗数', stdf.summarizeStdf(stdf.parseStdf(stdf.encodeFile(lot, false))).partN === 60)

  console.log('容错')
  const withWir = new Uint8Array([...far, 3, 0, 2, 10, 1, 2, 3, ...dutLE.subarray(6)])
  const pw = stdf.parseStdf(withWir)
  const unknown = pw.records.find((r) => r.name === 'REC_2_10')
  check('未知记录 WIR 整段跳过、不报错', pw.errors.length === 0 && unknown !== undefined && unknown.known === false && unknown.fields.some((f) => f.name === 'DATA'))
  check('未知记录之后的 PIR…MRR 仍被读取', stdf.summarizeStdf(pw).partN === 1)
  const cut = stdf.parseStdf(dutLE.subarray(0, dutLE.length - 5))
  check('文件截断：报 TRUNCATED_RECORD', cut.errors.some((e) => e.code === 'TRUNCATED_RECORD'), JSON.stringify(cut.errors))
  check('空文件：报 EMPTY', stdf.parseStdf(new Uint8Array(0)).errors[0]?.code === 'EMPTY')
  check('非 FAR 开头：报 NOT_FAR', stdf.parseStdf(new Uint8Array([9, 9, 9, 9])).errors[0]?.code === 'NOT_FAR')

  console.log('统计')
  check('Cpk：均值 2、σ 1，LSL 0、USL 4 → 2/3', Math.abs(stdf.cpkOf([1, 2, 3], 0, 4) - 2 / 3) < 1e-9)
  check('Cpk：只给上限 4 时同样 2/3', Math.abs(stdf.cpkOf([1, 2, 3], null, 4) - 2 / 3) < 1e-9)
  check('Cpk：σ = 0 返回 null', stdf.cpkOf([2, 2, 2], 0, 4) === null)
  check('直方图：值总数不变', stdf.histogram([0, 1, 2, 9], 4, 0, 4).reduce((s, x) => s + x, 0) === 4)

  console.log('组装校验')
  const good = stdf.validateSequence(stdf.dutItems(2).map((i) => i.rec))
  check('正确顺序 + Bin 2：无问题', good.length === 0, JSON.stringify(good))
  const badBin = stdf.validateSequence(stdf.dutItems(1).map((i) => i.rec))
  check('PRR 写 Bin 1 但 VOH 失效：报 BIN_PASS_WITH_FAIL', badBin.some((x) => x.code === 'BIN_PASS_WITH_FAIL'), JSON.stringify(badBin))
  check('PRR 的 Bin 1 不在 HBR 中：报 BIN_NOT_IN_HBR', badBin.some((x) => x.code === 'BIN_NOT_IN_HBR'))
  const items = stdf.dutItems(2)
  const swap = (a, b) => {
    const copy = [...items]
    const t = copy[a]
    copy[a] = copy[b]
    copy[b] = t
    return copy.map((i) => i.rec)
  }
  check('PRR 与 PTR 对调：报 PTR_OUTSIDE_PART 或 PRR_WITHOUT_PIR', stdf.validateSequence(swap(5, 6)).some((x) => x.code === 'PTR_OUTSIDE_PART' || x.code === 'PRR_WITHOUT_PIR'))
  check('MIR 与 FAR 对调：报 FAR_NOT_FIRST', stdf.validateSequence(swap(0, 1)).some((x) => x.code === 'FAR_NOT_FIRST'))
  check('MRR 不在最后：报 MRR_NOT_LAST', stdf.validateSequence(swap(9, 10)).some((x) => x.code === 'MRR_NOT_LAST'))
  check('汇总记录放在器件之前：报 PART_AFTER_SUMMARY', stdf.validateSequence(swap(2, 7)).some((x) => x.code === 'PART_AFTER_SUMMARY'))
  check('导出的文件重新解析后 Bin 不变', stdf.summarizeStdf(stdf.parseStdf(stdf.encodeFile(items.map((i) => i.rec), true))).hardBins[0].bin === 2)

  console.log('Multi-site 与测试成本（默认参数）')
  const p = { indexS: 1.5, parS: 0.8, serS: 0.35, retest: 0, cBase: 150, cPerSite: 8, chTotal: 512, chPerDut: 32 }
  check('Site 上限 = floor(512 / 32) = 16', ms.maxSites(p) === 16)
  check('T_td(1) = 1.5 + 0.8 + 0.35 = 2.65 s', Math.abs(ms.touchdownS(p, 1) - 2.65) < 1e-9)
  check('η(1) = 100%', Math.abs(ms.efficiency(p, 1) - 1) < 1e-9)
  check('T_ser = 0 时 η(16) = 100%', Math.abs(ms.efficiency({ ...p, serS: 0 }, 16) - 1) < 1e-9)
  check('重测 10% 使 UPH 降为 1/1.1', Math.abs(ms.uph({ ...p, retest: 0.1 }, 4) / ms.uph(p, 4) - 1 / 1.1) < 1e-9)
  const table = ms.sweep(p).map((x) => `N=${x.n} UPH=${x.uph.toFixed(0)} η=${(x.eff * 100).toFixed(1)}% COT=${x.cot.toFixed(4)}c`)
  console.log(table.map((line) => `        ${line}`).join('\n'))
  const best = ms.bestSites(p)
  check('默认参数下 COT 最低的 N', best >= 2 && best <= 16, `best N = ${best}, COT = ${ms.cotCents(p, best).toFixed(4)} cents`)
  check('最低点不在通道上限 16（COT 先降后升）', best < 16 && ms.cotCents(p, best) < ms.cotCents(p, 16), `best N = ${best}`)
  check('通道上限 4 时 bestSites 不超过 4', ms.bestSites({ ...p, chTotal: 128 }) <= 4)
} catch (err) {
  failed++
  console.log(` FAIL  脚本异常：${err instanceof Error ? err.stack : String(err)}`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log(failed === 0 ? '\n全部通过。' : `\n${failed} 项未通过。`)
process.exit(failed === 0 ? 0 : 1)
