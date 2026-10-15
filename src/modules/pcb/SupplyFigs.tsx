import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { CHANNELS, type ChannelId } from './data/pcbSupplyParts'
import { NODES, type NodeId } from './data/pcbSupplyFlow'
import { S } from './data/pcbSupply'

const L = {
  chanCap: loc(
    '示意：原厂 → 授权分销商 → 买方是正规路线；独立现货商是缺货时的绕路。',
    'Illustration: manufacturer → authorized distributor → buyer is the normal route; independent brokers are the detour when parts run short.',
  ),
  traceable: loc('可追溯', 'traceable'),
  warranty: loc('有质保', 'warranty'),
  surplus: loc('余货 / 灰色渠道', 'surplus / grey market'),
  risky: loc('价高，假货风险', 'pricey, counterfeit risk'),
  bomLabel: loc('BOM', 'BOM'),
}

const NODE_W = 104
const NODE_H = 56
const NODE_GAP = 20
const NODE_X0 = 18
const NODE_Y = 36
const MAIN: NodeId[] = ['eda', 'files', 'fab', 'smt', 'test', 'ship']
const PARTS_BOX = { x: 310, y: 152, w: 140, h: 52 }

function Arrow({ id }: { id: string }) {
  return (
    <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L8 4 L0 8 Z" fill="var(--text-2)" />
    </marker>
  )
}

function NodeBox({ x, y, w, h, name, tag, on, label, onPick }: { x: number; y: number; w: number; h: number; name: string; tag: string; on: boolean; label: string; onPick: () => void }) {
  return (
    <Hit label={label} active={on} onPick={onPick}>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
      <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
        {name}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fill="var(--muted)" fontSize="10">
        {tag}
      </text>
    </Hit>
  )
}

export function FlowFig({ active, onPick }: { active: NodeId; onPick: (id: NodeId) => void }) {
  const { t } = useLocale()
  const byId = (id: NodeId) => NODES.find((n) => n.id === id) ?? NODES[0]
  const mainX = (i: number) => NODE_X0 + i * (NODE_W + NODE_GAP)
  const filesX = mainX(1) + NODE_W / 2
  const smtX = mainX(3)
  const partsMid = PARTS_BOX.y + PARTS_BOX.h / 2
  const partsNode = byId('parts')
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 230" className="term-fig__svg" role="group" aria-label={t(S.flowCap)}>
        <defs>
          <Arrow id="supplyArrow" />
        </defs>
        <rect width="760" height="230" rx="10" fill="var(--well)" />
        {MAIN.slice(1).map((id, i) => (
          <line key={id} x1={mainX(i) + NODE_W} y1={NODE_Y + NODE_H / 2} x2={mainX(i + 1) - 2} y2={NODE_Y + NODE_H / 2} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#supplyArrow)" />
        ))}
        <path d={`M${filesX} ${NODE_Y + NODE_H} V${partsMid} H${PARTS_BOX.x - 2}`} fill="none" stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#supplyArrow)" />
        <text x={filesX + 8} y={partsMid - 6} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(L.bomLabel)}
        </text>
        <line x1={smtX + 40} y1={PARTS_BOX.y - 2} x2={smtX + 40} y2={NODE_Y + NODE_H + 2} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#supplyArrow)" />
        {MAIN.map((id, i) => {
          const n = byId(id)
          return <NodeBox key={id} x={mainX(i)} y={NODE_Y} w={NODE_W} h={NODE_H} name={t(n.short)} tag={t(n.tag)} on={active === id} label={t(n.name)} onPick={() => onPick(id)} />
        })}
        <NodeBox x={PARTS_BOX.x} y={PARTS_BOX.y} w={PARTS_BOX.w} h={PARTS_BOX.h} name={t(partsNode.short)} tag={t(partsNode.tag)} on={active === 'parts'} label={t(partsNode.name)} onPick={() => onPick('parts')} />
      </svg>
      <figcaption>{t(S.flowCap)}</figcaption>
    </figure>
  )
}

const CH = {
  mfr: { x: 20, y: 30, w: 150, h: 60 },
  dist: { x: 258, y: 30, w: 184, h: 60 },
  bom: { x: 530, y: 30, w: 210, h: 60 },
  broker: { x: 258, y: 144, w: 184, h: 60 },
}

export function ChannelFig({ active, onPick }: { active: ChannelId; onPick: (id: ChannelId) => void }) {
  const { t } = useLocale()
  const item = (id: ChannelId) => CHANNELS.find((c) => c.id === id) ?? CHANNELS[0]
  const row = CH.mfr.y + CH.mfr.h / 2
  const low = CH.broker.y + CH.broker.h / 2
  const dash = { fill: 'none', stroke: 'var(--red)', strokeWidth: 1.6, strokeDasharray: '5 4', markerEnd: 'url(#supplyArrow)' }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 232" className="term-fig__svg" role="group" aria-label={t(L.chanCap)}>
        <defs>
          <Arrow id="supplyArrow" />
        </defs>
        <rect width="760" height="232" rx="10" fill="var(--well)" />
        <line x1={CH.mfr.x + CH.mfr.w} y1={row} x2={CH.dist.x - 2} y2={row} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#supplyArrow)" />
        <line x1={CH.dist.x + CH.dist.w} y1={row} x2={CH.bom.x - 2} y2={row} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#supplyArrow)" />
        <text x={(CH.mfr.x + CH.mfr.w + CH.dist.x) / 2} y={row - 8} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.traceable)}
        </text>
        <text x={(CH.dist.x + CH.dist.w + CH.bom.x) / 2} y={row - 8} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.warranty)}
        </text>
        <path d={`M100 ${CH.mfr.y + CH.mfr.h} V${low} H${CH.broker.x - 2}`} {...dash} />
        <path d={`M${CH.broker.x + CH.broker.w} ${low} H635 V${CH.bom.y + CH.bom.h + 2}`} {...dash} />
        <text x="178" y={low + 18} textAnchor="middle" fill="var(--red)" fontSize="10">
          {t(L.surplus)}
        </text>
        <text x="538" y={low + 18} textAnchor="middle" fill="var(--red)" fontSize="10">
          {t(L.risky)}
        </text>
        {(['mfr', 'dist', 'bom', 'broker'] as ChannelId[]).map((id) => {
          const b = CH[id]
          const c = item(id)
          return <NodeBox key={id} x={b.x} y={b.y} w={b.w} h={b.h} name={t(c.short)} tag={t(c.tag)} on={active === id} label={t(c.title)} onPick={() => onPick(id)} />
        })}
      </svg>
      <figcaption>{t(L.chanCap)}</figcaption>
    </figure>
  )
}
