// 核对「虚拟 ATE 操作系统」课的教学模型数值。
// 用法：node scripts/check-vate.mjs
// 把 src/modules/vate/model 下的纯函数转成 JS 后直接调用，逐条断言关键数值；任何一条不符退出码为 1。
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const dir = mkdtempSync(join(tmpdir(), 'vate-'))

async function load(name) {
  const src = readFileSync(join(root, 'src/modules/vate/model', `${name}.ts`), 'utf8')
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const file = join(dir, `${name}.mjs`)
  writeFileSync(file, js)
  return import(pathToFileURL(file).href)
}

let failed = 0
const check = (label, ok, detail) => {
  if (!ok) failed++
  console.log(`${ok ? '  ok ' : ' FAIL'}  ${label}  ${detail}`)
}

try {
  const iddq = await load('iddq')
  const os = await load('continuity')

  console.log('IDDQ（数值仅为教学示例）')
  const base = { dut: 'good', vdd: 1.8, vector: 'v1', settleMs: 5, range: 'auto', clampUa: 10000, limitUa: 100 }
  const show = (cfg) => {
    const r = iddq.runIddq(cfg)
    const read = r.readingUa === null ? '—' : `${r.readingUa.toFixed(iddq.decimalsFor(r.resolutionUa))} µA`
    return { r, text: `读数 ${read}，真实 ${r.trueUa.toFixed(2)} µA，量程 ${r.rangeUa} µA，${r.status}/${r.reason}` }
  }
  let s = show(base)
  check('正常芯片 1.8 V V1', s.r.status === 'pass' && Math.abs(s.r.readingUa - 24) < 0.5, s.text)
  s = show({ ...base, dut: 'gox' })
  check('栅氧漏电 1.8 V V1', s.r.status === 'fail' && Math.abs(s.r.readingUa - 175) < 1.5, s.text)
  s = show({ ...base, dut: 'bridge', vector: 'v1' })
  check('桥接 V1（A=B，不激活）', s.r.status === 'pass', s.text)
  s = show({ ...base, dut: 'bridge', vector: 'v2' })
  check('桥接 V2（A≠B，激活）', s.r.status === 'fail' && s.r.readingUa > 150, s.text)
  s = show({ ...base, vdd: 0 })
  check('VDD = 0 V', s.r.status === 'invalid' && s.r.reason === 'nopower', s.text)
  s = show({ ...base, vdd: 0.5 })
  check('VDD = 0.5 V', s.r.status === 'invalid' && s.r.reason === 'lowvdd', s.text)
  s = show({ ...base, vdd: 2.2 })
  check('VDD = 2.2 V 超 Abs Max', s.r.status === 'abort' && s.r.reason === 'absmax', s.text)
  s = show({ ...base, range: 'r10u' })
  check('正常芯片 10 µA 量程', s.r.status === 'invalid' && s.r.reason === 'overrange', s.text)
  s = show({ ...base, dut: 'gox', range: 'r100u' })
  check('漏电芯片 100 µA 量程', s.r.status === 'invalid' && s.r.reason === 'overrange', s.text)
  s = show({ ...base, range: 'r10m' })
  check('正常芯片 10 mA 量程（分辨率 10 µA）', s.r.status === 'pass' && s.r.coarse && s.r.readingUa === 20, s.text)
  s = show({ ...base, dut: 'gox', clampUa: 100 })
  check('漏电芯片 DPS 钳位 100 µA', s.r.status === 'invalid' && s.r.reason === 'clamp', s.text)
  s = show({ ...base, settleMs: 1 })
  check('正常芯片等待 1 ms', s.r.status === 'fail' && s.r.unsettled, s.text)
  s = show({ ...base, settleMs: 2 })
  check('正常芯片等待 2 ms', s.r.status === 'pass' && s.r.unsettled, s.text)
  s = show({ ...base, vdd: 1.98 })
  check('正常芯片 1.98 V', s.r.status === 'pass', s.text)

  console.log('\n开短路（数值仅为教学示例）')
  const cfg = { forceUa: -100, clampV: 3, openTh: -1.5, shortTh: -0.2, others: 'gnd', vdd: 'gnd' }
  const d = (kind, a = 'p1', b = 'p2', rc = 1) => ({ kind, a, b, rc })
  const all = ['p1', 'p2', 'p3', 'p5', 'p6', 'p7']
  const row = (defect, c, pin) => os.runOs(defect, c, [pin]).rows[0]
  const fmt = (r) => `${r.vm.toFixed(3)} V${r.clamped ? '（撞钳位）' : ''} → ${r.verdict}`
  let r = row(os.NO_DEFECT, cfg, 'p1')
  check('好片 −100 µA', r.verdict === 'pass' && Math.abs(r.vm + 0.65) < 0.01, fmt(r))
  r = row(os.NO_DEFECT, { ...cfg, forceUa: 100, openTh: 1.5, shortTh: 0.2 }, 'p1')
  check('好片 +100 µA（镜像窗口）', r.verdict === 'pass' && Math.abs(r.vm - 0.65) < 0.01, fmt(r))
  r = row(d('open', 'p3'), cfg, 'p3')
  check('Pin 3 开路', r.verdict === 'open' && r.clamped, fmt(r))
  r = row(d('pinGnd', 'p2'), cfg, 'p2')
  check('Pin 2 对地短路', r.verdict === 'short', fmt(r))
  r = row(d('pinGnd', 'p2'), { ...cfg, others: 'float', vdd: 'float' }, 'p2')
  check('Pin 2 对地短路，其它脚和 VDD 浮空', r.verdict === 'short', fmt(r))
  const pp = d('pinPin', 'p5', 'p6')
  r = row(pp, cfg, 'p5')
  check('Pin 5–6 短路，测 Pin 5', r.verdict === 'short', fmt(r))
  r = row(pp, cfg, 'p6')
  check('Pin 5–6 短路，测 Pin 6', r.verdict === 'short', fmt(r))
  r = row(pp, cfg, 'p7')
  check('Pin 5–6 短路，测 Pin 7', r.verdict === 'pass', fmt(r))
  r = row(pp, { ...cfg, others: 'float' }, 'p5')
  check('Pin 5–6 短路，其它脚浮空测 Pin 5', r.verdict === 'pass' || r.verdict === 'marginal', fmt(r))
  const pv = d('pinVdd', 'p7')
  r = row(pv, cfg, 'p7')
  check('Pin 7 对 VDD 短路（VDD 接 0 V）', r.verdict === 'short', fmt(r))
  r = row(pv, { ...cfg, vdd: 'float' }, 'p7')
  check('Pin 7 对 VDD 短路（VDD 浮空，−I）', r.verdict === 'marginal', fmt(r))
  for (const rc of [500, 2000, 5000, 10000]) {
    r = row(d('contact', 'p1', 'p2', rc), cfg, 'p1')
    console.log(`  ..   Pin 1 接触电阻 ${rc} Ω  ${fmt(r)}`)
  }
  r = row(d('contact', 'p1', 'p2', 2000), cfg, 'p1')
  check('Pin 1 接触电阻 2 kΩ', r.verdict === 'marginal', fmt(r))
  r = row(d('contact', 'p1', 'p2', 10000), cfg, 'p1')
  check('Pin 1 接触电阻 10 kΩ', r.verdict === 'open', fmt(r))
  r = row(os.NO_DEFECT, { ...cfg, forceUa: -5000 }, 'p1')
  check('好片 −5 mA（电流太大）', r.verdict === 'open', fmt(r))
  r = row(os.NO_DEFECT, { ...cfg, forceUa: -2000 }, 'p1')
  console.log(`  ..   好片 −2 mA  ${fmt(r)}`)
  let res = os.runOs(os.NO_DEFECT, { ...cfg, clampV: 0.5 }, all)
  check('钳位 0.5 V（低于二极管压降）', res.rows.every((x) => x.verdict === 'open') && res.clampBelowDiode, fmt(res.rows[0]))
  res = os.runOs(os.NO_DEFECT, { ...cfg, forceUa: 100 }, all)
  check('+100 µA 但窗口仍是负的（极性反）', res.rows.every((x) => x.verdict === 'short') && res.polarityMismatch, fmt(res.rows[0]))
  res = os.runOs(os.NO_DEFECT, { ...cfg, forceUa: 0 }, all)
  check('Force 0 µA', res.rows.every((x) => x.verdict === 'short') && res.zeroForce, fmt(res.rows[0]))
  res = os.runOs(os.NO_DEFECT, { ...cfg, openTh: -0.1 }, all)
  check('窗口无效（|Open| < |Short|）', res.abort === 'window' && res.rows.every((x) => x.verdict === 'abort'), res.abort)
  res = os.runOs(os.NO_DEFECT, { ...cfg, forceUa: 100, openTh: 1.5, shortTh: 0.2, vdd: 'float' }, all)
  check('+100 µA 且 VDD 浮空', res.rows.every((x) => x.verdict === 'open') && res.posWithVddFloat, fmt(res.rows[0]))
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log(failed ? `\n${failed} 条不符。` : '\n模型数值核对通过。')
process.exit(failed ? 1 : 0)
