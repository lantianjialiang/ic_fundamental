import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { GROUPS, S, type GroupId } from './data/pcbDfm'
import { GERBER, type LayerId } from './data/pcbDfmCap'
import { type ReworkCase } from './data/pcbDfmErrors'

const L = {
  stageCap: loc('板子从左到右经过三道关：板厂做光板，SMT 线贴片焊接，测试工位电测。每道关对应一张清单，条形是你的勾选进度。', 'A board passes three gates from left to right: the fab builds it bare, the SMT line assembles it, the test station checks it electrically. Each gate has one checklist; the bar shows your progress.'),
  caseCap: loc('复盘四步：先描述现象，再找到根因，然后修复，最后把预防措施写进清单。', 'Four review steps: describe the symptom, find the root cause, fix it, then write the prevention into the checklist.'),
  gerberCap: loc('剖面示意，厚度不按比例。丝印印在阻焊上面，阻焊在焊盘处开窗；两层锡膏文件是做钢网用的，不是板子上的层。绿点 = 工作表里已勾选。', 'Cross-section, thickness not to scale. Silk is printed on the mask, the mask opens over pads; the two paste files are for the stencil, not layers of the board. Green dot = ticked in the worksheet.'),
  core: loc('FR-4 芯板（无单独文件）', 'FR-4 core (no file of its own)'),
}

export const PCB = {
  mask: '#1f6b41',
  maskLight: '#2f8a52',
  copper: '#c8893b',
  gold: '#d8b45a',
  silk: '#f2f2f2',
  core: '#c9b77a',
  steel: '#9aa3ad',
  hole: '#0d1117',
  body: '#2b2d30',
  lead: '#b9c0c8',
}

/* ---------- 三道关 ---------- */

export function StageFig({ active, done, onPick }: { active: GroupId; done: Record<GroupId, number>; onPick: (id: GroupId) => void }) {
  const { t } = useLocale()
  const w = 220
  const gap = 30
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 190" className="term-fig__svg" role="img" aria-label={t(L.stageCap)}>
        <rect width="760" height="190" rx="10" fill="var(--well)" />
        {GROUPS.map((g, i) => {
          const x = 20 + i * (w + gap)
          const total = g.items.length
          const n = done[g.id]
          const on = g.id === active
          const full = n === total
          return (
            <g key={g.id}>
              {i > 0 ? <path d={`M${x - gap + 6} 95 H${x - 8} M${x - 14} 89 L${x - 8} 95 L${x - 14} 101`} fill="none" stroke="var(--muted)" strokeWidth="2" /> : null}
              <Hit label={t(g.title)} active={on} onPick={() => onPick(g.id)}>
                <rect x={x} y={30} width={w} height={130} rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line-2)'} strokeWidth={on ? 2 : 1} />
                <text x={x + 16} y={62} fill={on ? 'var(--gold)' : 'var(--text)'} fontSize="20" fontWeight="700" fontFamily="var(--mono)">
                  {g.id.toUpperCase()}
                </text>
                <text x={x + w - 16} y={62} textAnchor="end" fill={full ? 'var(--green)' : 'var(--text-2)'} fontSize="13" fontFamily="var(--mono)">
                  {`${n} / ${total}`}
                </text>
                <text x={x + 16} y={90} fill="var(--text)" fontSize="13" fontWeight="600">
                  {t(g.stage)}
                </text>
                <text x={x + 16} y={110} fill="var(--muted)" fontSize="12">
                  {t(g.who)}
                </text>
                <rect x={x + 16} y={130} width={w - 32} height={8} rx="4" fill="var(--fig-box-2)" />
                <rect x={x + 16} y={130} width={((w - 32) * n) / total} height={8} rx="4" fill={full ? 'var(--green)' : 'var(--gold)'} />
              </Hit>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.stageCap)}</figcaption>
    </figure>
  )
}

/* ---------- 返工四步 ---------- */

export function CaseFig({ item }: { item: ReworkCase }) {
  const { t } = useLocale()
  const heads = [S.symptom, S.root, S.repair, S.prevent]
  const w = 168
  const gap = 22
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 140" className="term-fig__svg" role="img" aria-label={t(item.title)}>
        <rect width="760" height="140" rx="10" fill="var(--well)" />
        {heads.map((head, i) => {
          const x = 14 + i * (w + gap)
          const last = i === heads.length - 1
          return (
            <g key={head.zh}>
              <rect x={x} y={30} width={w} height={80} rx="8" fill={last ? 'var(--green-bg)' : 'var(--card)'} stroke={last ? 'var(--green-line)' : 'var(--line-2)'} />
              <text x={x + w / 2} y={58} textAnchor="middle" fill={i === 1 ? 'var(--red)' : last ? 'var(--green)' : 'var(--gold)'} fontSize="12" fontWeight="700">
                {t(head)}
              </text>
              <text x={x + w / 2} y={86} textAnchor="middle" fill="var(--text)" fontSize="11">
                {t(item.tags[i])}
              </text>
              {last ? null : <path d={`M${x + w + 3} 70 H${x + w + gap - 4} M${x + w + gap - 9} 65 L${x + w + gap - 4} 70 L${x + w + gap - 9} 75`} fill="none" stroke="var(--muted)" strokeWidth="2" />}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.caseCap)}</figcaption>
    </figure>
  )
}

/* ---------- Gerber 叠层剖面 ---------- */

const BX = 150
const BW = 320
const ROW: Record<LayerId, number> = { gtp: 20, gto: 50, gts: 72, gtl: 94, gbl: 156, gbs: 178, gbo: 200, gbp: 230, gko: 266, drl: 294 }
const RH = 18
const CORE_Y = 116
const CORE_H = 36
/* 顶面两个焊盘、底面一个测试点、一个过孔，各层开口都对着它们 */
const TOP_PADS = [190, 290]
const PAD_W = 40
const VIA_X = 400
const TP_X = 250

function segs(y: number, h: number, ranges: Array<[number, number]>, fill: string): ReactNode[] {
  return ranges.map(([a, b]) => <rect key={`${y}-${a}`} x={a} y={y} width={b - a} height={h} fill={fill} />)
}

function gaps(cuts: Array<[number, number]>): Array<[number, number]> {
  const out: Array<[number, number]> = []
  let x = BX
  for (const [a, b] of cuts) {
    out.push([x, a])
    x = b
  }
  out.push([x, BX + BW])
  return out
}

function LayerArt({ id }: { id: LayerId }) {
  const y = ROW[id]
  const topCuts: Array<[number, number]> = TOP_PADS.map((p) => [p, p + PAD_W])
  const botCut: Array<[number, number]> = [[TP_X, TP_X + PAD_W]]
  if (id === 'gtp' || id === 'gbp') {
    const cuts = id === 'gtp' ? topCuts : []
    return <g>{segs(y + 4, RH - 8, gaps(cuts), PCB.steel)}</g>
  }
  if (id === 'gto') {
    return <g>{segs(y + 10, RH - 10, [[160, 180], [340, 372]], PCB.silk)}</g>
  }
  if (id === 'gbo') {
    return <g>{segs(y, RH - 10, [[300, 330]], PCB.silk)}</g>
  }
  if (id === 'gts') {
    return <g>{segs(y, RH, gaps(topCuts), PCB.mask)}</g>
  }
  if (id === 'gbs') {
    return <g>{segs(y, RH, gaps(botCut), PCB.mask)}</g>
  }
  if (id === 'gtl') {
    return <g>{segs(y, RH, [...topCuts, [VIA_X - 10, VIA_X + 10], [340, 372]], PCB.copper)}</g>
  }
  if (id === 'gbl') {
    return <g>{segs(y, RH, gaps([[TP_X - 6, TP_X], [TP_X + PAD_W, TP_X + PAD_W + 6]]), PCB.copper)}</g>
  }
  if (id === 'gko') {
    return <rect x={BX} y={y + 2} width={BW} height={RH - 4} fill="none" stroke="var(--text-2)" strokeWidth="1.5" strokeDasharray="6 4" />
  }
  // 钻孔行只画剖面里真有的那个过孔（金属化孔，孔壁有铜）
  return (
    <g>
      <circle cx={VIA_X} cy={y + RH / 2} r={5} fill={PCB.hole} stroke={PCB.copper} strokeWidth="2" />
    </g>
  )
}

export function GerberFig({ active, ticked, onPick }: { active: LayerId; ticked: Set<string>; onPick: (id: LayerId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 326" className="term-fig__svg" role="img" aria-label={t(L.gerberCap)}>
        <rect width="760" height="326" rx="10" fill="var(--well)" />
        <rect x={BX} y={CORE_Y} width={BW} height={CORE_H} fill={PCB.core} />
        <text x={490} y={CORE_Y + 22} fill="var(--muted)" fontSize="12">
          {t(L.core)}
        </text>
        <path d={`M${BX} ${ROW.gto - 4} V${ROW.gbo + RH + 4} M${BX + BW} ${ROW.gto - 4} V${ROW.gbo + RH + 4}`} stroke="var(--text-2)" strokeWidth="1" strokeDasharray="4 3" />
        {GERBER.map((g) => {
          const y = ROW[g.id]
          const on = g.id === active
          const ok = ticked.has(g.id)
          return (
            <Hit key={g.id} label={t(g.name)} active={on} onPick={() => onPick(g.id)}>
              <rect x={14} y={y - 2} width={732} height={RH + 4} rx="4" fill={on ? 'var(--gold-bg)' : 'rgba(0,0,0,0)'} fillOpacity={on ? 0.55 : 1} stroke={on ? 'var(--gold)' : 'none'} />
              <circle cx={28} cy={y + RH / 2} r="5" fill={ok ? 'var(--green)' : 'none'} stroke={ok ? 'var(--green)' : 'var(--muted)'} strokeWidth="1.5" />
              <text x={42} y={y + 13} fill={on ? 'var(--gold)' : 'var(--text)'} fontSize="12" fontWeight="700" fontFamily="var(--mono)">
                {g.ext}
              </text>
              <LayerArt id={g.id} />
              <text x={490} y={y + 13} fill={on ? 'var(--gold)' : 'var(--text-2)'} fontSize="12">
                {t(g.name)}
              </text>
            </Hit>
          )
        })}
        <rect x={VIA_X - 5} y={ROW.gtl} width={10} height={ROW.gbl + RH - ROW.gtl} fill={PCB.copper} />
        <rect x={VIA_X - 3} y={ROW.gtl} width={6} height={ROW.gbl + RH - ROW.gtl} fill={PCB.hole} />
      </svg>
      <figcaption>{t(L.gerberCap)}</figcaption>
    </figure>
  )
}
