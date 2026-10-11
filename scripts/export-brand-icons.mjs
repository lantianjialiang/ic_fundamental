import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')

function exportPng(size, outName) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#1f2630',
  })
  const png = resvg.render().asPng()
  writeFileSync(join(publicDir, outName), png)
  console.log(`wrote ${outName} (${size}px)`)
}

exportPng(32, 'favicon-32.png')
exportPng(180, 'apple-touch-icon.png')
