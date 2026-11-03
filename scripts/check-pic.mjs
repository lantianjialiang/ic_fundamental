// 核对硅光（PIC）与传感器（SNS）的数值模型。
// 用法：node scripts/check-pic.mjs
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { makeHarness } from './checks/harness.mjs'

const h = makeHarness()
const file = resolve(import.meta.dirname, 'checks', 'pic-core.mjs')
console.log('\n== pic-core.mjs')
const mod = await import(pathToFileURL(file).href)
await mod.default({ load: h.load, check: h.check, near: h.near })
const { failed, count } = h.summary()
console.log(`\n共 ${count} 条断言，失败 ${failed} 条。`)
process.exit(failed === 0 ? 0 : 1)
