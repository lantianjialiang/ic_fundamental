// 数值核对的公共工具：用 esbuild 把 src 下的 TypeScript 模块打包成临时 ESM 再导入。
// 各 check 文件 export default async function run({ load, check }) 即可接入 check-qual / check-power。
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = resolve(import.meta.dirname, '..', '..')

export function makeHarness() {
  const dir = mkdtempSync(join(tmpdir(), 'chk-'))
  let failed = 0
  let count = 0

  /** 相对 src 的路径，例如 'modules/qual/core/reliability.ts' */
  async function load(relPath) {
    const entry = join(root, 'src', relPath)
    const result = await build({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      platform: 'neutral',
      write: false,
      logLevel: 'silent',
    })
    const out = join(dir, `${count}-${relPath.replace(/[\\/]/g, '_')}.mjs`)
    writeFileSync(out, result.outputFiles[0].text)
    return import(pathToFileURL(out).href)
  }

  function check(label, ok, detail = '') {
    count += 1
    if (!ok) {
      failed += 1
    }
    console.log(`${ok ? '  ok ' : ' FAIL'}  ${label}  ${detail}`)
  }

  /** 相对误差 |a−b|/|b| ≤ tol */
  function near(a, b, tol) {
    return Math.abs(a - b) <= Math.abs(b) * tol
  }

  return {
    load,
    check,
    near,
    summary: () => ({ failed, count }),
  }
}
