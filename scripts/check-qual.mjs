// 核对「可靠性 / 车规」轨道（REL-01…REL-08）的数值模型。
// 用法：node scripts/check-qual.mjs
// 依次运行 scripts/checks/qual-*.mjs，每个文件导出 run({ load, check, near })；任何断言失败退出码为 1。
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { makeHarness } from './checks/harness.mjs'

const h = makeHarness()
const dir = resolve(import.meta.dirname, 'checks')
const files = readdirSync(dir).filter((f) => /^qual-.*\.mjs$/.test(f)).sort()

for (const f of files) {
  console.log(`\n== ${f}`)
  const mod = await import(pathToFileURL(resolve(dir, f)).href)
  await mod.default({ load: h.load, check: h.check, near: h.near })
}

const { failed, count } = h.summary()
console.log(`\n共 ${count} 条断言，失败 ${failed} 条。`)
process.exit(failed === 0 ? 0 : 1)
