// 检查学生可见文字是否都有英文。
// 用法：node scripts/check-i18n.mjs [--summary] [路径前缀 ...]
//   不带路径时检查整个 src；带路径时只报这些文件或目录。
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const summary = args.includes('--summary')
const filters = args.filter((a) => !a.startsWith('--')).map((a) => resolve(root, a))

const CJK = /[\u3400-\u9fff\uff00-\uffef\u3000-\u303f]/

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

const textOf = (node) =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined

const isLocCall = (node) =>
  ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'loc'

const propName = (prop) =>
  prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? prop.name.text : undefined

const problems = []

function check(file) {
  const source = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const allowed = new Set()
  const report = (node, msg) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
    problems.push({ file: relative(root, file).replaceAll('\\', '/'), line: line + 1, msg })
  }

  const visit = (node) => {
    if (isLocCall(node)) {
      const [zh, en] = node.arguments
      if (zh) allowed.add(zh)
      const zhText = zh && textOf(zh)
      const enText = en && textOf(en)
      if (!en) report(node, `缺英文：loc('${(zhText ?? '…').slice(0, 30)}')`)
      else if (enText !== undefined) {
        allowed.add(en)
        if (!enText.trim()) report(node, '英文为空')
        else if (CJK.test(enText) && enText !== zhText) report(en, `英文里有中文：${enText.slice(0, 30)}`)
      } else allowed.add(en)
    }

    if (ts.isObjectLiteralExpression(node)) {
      const props = node.properties.filter(ts.isPropertyAssignment)
      const zh = props.find((p) => propName(p) === 'zh')
      const en = props.find((p) => propName(p) === 'en')
      if (zh) {
        allowed.add(zh.initializer)
        if (en) allowed.add(en.initializer)
        else report(node, `缺英文：{ zh: '${(textOf(zh.initializer) ?? '…').slice(0, 30)}' }`)
      }
    }

    const literal = textOf(node)
    if (literal !== undefined && CJK.test(literal) && !allowed.has(node)) {
      report(node, `未走 loc() 的中文：${literal.slice(0, 30)}`)
    }
    if (ts.isTemplateExpression(node)) {
      const parts = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)]
      if (parts.some((p) => CJK.test(p)) && !allowed.has(node)) report(node, `未走 loc() 的中文模板：${parts.join('…').slice(0, 30)}`)
    }
    if (ts.isJsxText(node) && CJK.test(node.text)) report(node, `JSX 里写死的中文：${node.text.trim().slice(0, 30)}`)

    ts.forEachChild(node, visit)
  }
  visit(sf)
}

const files = walk(join(root, 'src')).filter(
  (f) => filters.length === 0 || filters.some((p) => f === p || f.startsWith(p + '\\') || f.startsWith(p + '/')),
)
files.forEach(check)

if (summary) {
  const counts = new Map()
  for (const p of problems) counts.set(p.file, (counts.get(p.file) ?? 0) + 1)
  ;[...counts].sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(`${String(n).padStart(5)}  ${f}`))
} else {
  for (const p of problems) console.log(`${p.file}:${p.line}  ${p.msg}`)
}
console.log(problems.length ? `\n共 ${problems.length} 处缺英文或写死中文。` : '多语言检查通过。')
process.exit(problems.length ? 1 : 0)
