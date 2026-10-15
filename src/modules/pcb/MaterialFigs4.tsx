import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { COLOR } from './FabFigs'
import { S } from './data/pcbMaterial'
import { FINISHES, type FinishId } from './data/pcbMaterialFinish'
import { MASK_ITEMS, type MaskItemId } from './data/pcbMaterialSpecial'

const L = {
  fineGroup: loc('细间距焊盘（示意 0.5 mm）', 'Fine-pitch pads (0.5 mm, schematic)'),
  bigGroup: loc('较大的焊盘', 'Larger pads'),
  mask: loc('阻焊', 'Mask'),
  cu: loc('铜焊盘', 'Cu pad'),
}

const PADS = 8
const PITCH = 24
const PAD0 = 60
const PAD_Y = 100
const PAD_H = 50
const BIG = [340, 400, 460]
const OPEN_COLOR = '#3b5237'
const PAD_COLOR = '#d9b44a'
const TRACE = '#3fb065'

function Badge({ n, x, y, on }: { n: number; x: number; y: number; on: boolean }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r="8" fill={on ? 'var(--gold)' : 'var(--card)'} stroke="var(--gold)" strokeWidth="1.5" />
      <text x={x} y={y + 4} textAnchor="middle" fill={on ? '#1b1b1b' : 'var(--text)'} fontSize="11" fontWeight="700">
        {n}
      </text>
    </g>
  )
}

export function MaskFig({ active, onPick }: { active: MaskItemId; onPick: (id: MaskItemId) => void }) {
  const { t } = useLocale()
  const item = (id: MaskItemId) => MASK_ITEMS.find((m) => m.id === id) ?? MASK_ITEMS[0]
  const ids = MASK_ITEMS.map((m) => m.id)
  const num = (id: MaskItemId) => ids.indexOf(id) + 1
  const on = (id: MaskItemId) => active === id
  const hit = (id: MaskItemId, children: ReactNode) => (
    <Hit label={t(item(id).name)} active={on(id)} onPick={() => onPick(id)}>
      {children}
    </Hit>
  )
  const left = Array.from({ length: PADS }, (_, i) => PAD0 + i * PITCH)
  const dams = left.slice(0, PADS - 1).map((x) => x + 18)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 280" className="term-fig__svg" role="group" aria-label={t(S.maskCap)}>
        <rect width="760" height="280" rx="10" fill="var(--well)" />
        <rect x="20" y="24" width="520" height="236" rx="8" fill={COLOR.mask} />
        {left.map((x) => (
          <rect key={`t${x}`} x={x + 3} y={PAD_Y + PAD_H} width="6" height="82" fill={TRACE} />
        ))}
        {BIG.map((x) => (
          <rect key={`tb${x}`} x={x + 16} y={PAD_Y + PAD_H} width="8" height="80" fill={TRACE} />
        ))}
        {hit(
          'opening',
          <>
            {left.map((x) => (
              <rect key={`o${x}`} x={x - 3} y={PAD_Y - 3} width="18" height={PAD_H + 6} fill={OPEN_COLOR} stroke={on('opening') ? 'var(--gold)' : 'none'} strokeWidth="2" />
            ))}
            {BIG.map((x) => (
              <rect key={`ob${x}`} x={x - 5} y={PAD_Y - 5} width="50" height={PAD_H + 10} fill={OPEN_COLOR} stroke={on('opening') ? 'var(--gold)' : 'none'} strokeWidth="2" />
            ))}
          </>,
        )}
        {left.map((x) => (
          <rect key={`p${x}`} x={x} y={PAD_Y} width="12" height={PAD_H} fill={PAD_COLOR} pointerEvents="none" />
        ))}
        {BIG.map((x) => (
          <rect key={`pb${x}`} x={x} y={PAD_Y} width="40" height={PAD_H} fill={PAD_COLOR} pointerEvents="none" />
        ))}
        {hit(
          'dam',
          <>
            {dams.map((x) => (
              <rect key={`d${x}`} x={x - 3} y={PAD_Y - 3} width="6" height={PAD_H + 6} fill={on('dam') ? 'var(--gold)' : 'transparent'} opacity={on('dam') ? 0.9 : 1} />
            ))}
          </>,
        )}
        {hit(
          'silkOk',
          <>
            <rect x="48" y="40" width="212" height="32" rx="3" fill="transparent" stroke="var(--gold)" strokeWidth={on('silkOk') ? 6 : 0} opacity="0.5" />
            <rect x="48" y="40" width="212" height="32" rx="3" fill="none" stroke={COLOR.ink} strokeWidth="2" />
            <circle cx="60" cy="50" r="3" fill={COLOR.ink} />
            <text x="80" y="62" fill={COLOR.ink} fontSize="12" fontWeight="700">
              U1
            </text>
          </>,
        )}
        {hit(
          'silkBad',
          <>
            <rect x="404" y="116" width="72" height="22" rx="3" fill="transparent" stroke="var(--gold)" strokeWidth={on('silkBad') ? 6 : 0} opacity="0.5" />
            <rect x="410" y="118" width="60" height="18" rx="2" fill={COLOR.ink} />
            <text x="440" y="131" textAnchor="middle" fill="#222" fontSize="11" fontWeight="700">
              R2
            </text>
          </>,
        )}
        <text x="60" y="248" fill="#eaf7ee" fontSize="11">
          {t(L.fineGroup)}
        </text>
        <text x="340" y="248" fill="#eaf7ee" fontSize="11">
          {t(L.bigGroup)}
        </text>
        <Badge n={num('opening')} x={40} y={PAD_Y + 25} on={on('opening')} />
        <line x1="48" y1={PAD_Y + 25} x2="56" y2={PAD_Y + 25} stroke="var(--gold)" pointerEvents="none" />
        <Badge n={num('dam')} x={dams[3]} y={86} on={on('dam')} />
        <Badge n={num('silkOk')} x={278} y={56} on={on('silkOk')} />
        <line x1="262" y1="56" x2="270" y2="56" stroke="var(--gold)" pointerEvents="none" />
        <Badge n={num('silkBad')} x={440} y={86} on={on('silkBad')} />
        {MASK_ITEMS.map((m, i) => (
          <Hit key={m.id} label={t(m.name)} active={on(m.id)} onPick={() => onPick(m.id)}>
            <rect x="560" y={40 + i * 50} width="190" height="40" rx="6" fill={on(m.id) ? 'var(--gold-bg)' : 'var(--card)'} stroke={on(m.id) ? 'var(--gold)' : 'var(--line)'} strokeWidth={on(m.id) ? 2 : 1} />
            <text x="578" y={40 + i * 50 + 24} textAnchor="middle" fill="var(--gold)" fontSize="13" fontWeight="700">
              {i + 1}
            </text>
            <text x="594" y={40 + i * 50 + 24} fill={on(m.id) ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
              {t(m.name)}
            </text>
          </Hit>
        ))}
      </svg>
      <figcaption>{t(S.maskCap)}</figcaption>
    </figure>
  )
}

const PW = 144
const MASK_FILL = COLOR.mask

function Film({ id, x, y }: { id: FinishId; x: number; y: number }) {
  // y 为铜焊盘上表面；镀层包住焊盘顶面和两侧（厚度夸大）
  const px = x + 30
  const pw = 84
  const wrap = (m: number, top: number, fill: string, key: string) => <rect key={key} x={px - m} y={y - top} width={pw + 2 * m} height={top + 30} fill={fill} />
  if (id === 'hasl') {
    return <path d={`M${px - 3} ${y + 30} V${y} Q${x + 72} ${y - 38} ${px + pw + 3} ${y} V${y + 30} Z`} fill="#b5bcc4" />
  }
  if (id === 'enig') {
    return (
      <>
        {wrap(5, 7, COLOR.au, 'au')}
        {wrap(3, 5, COLOR.ni, 'ni')}
      </>
    )
  }
  if (id === 'osp') {
    return wrap(1.5, 2, '#d9b36c', 'osp')
  }
  if (id === 'imag') {
    return wrap(2, 3, '#e8edf2', 'ag')
  }
  return wrap(2.5, 4, '#aeb8c3', 'sn')
}

export function FinishFig({ active, onPick }: { active: FinishId; onPick: (id: FinishId) => void }) {
  const { t } = useLocale()
  const top = 100
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 224" className="term-fig__svg" role="group" aria-label={t(S.finishCap)}>
        <rect width="760" height="224" rx="10" fill="var(--well)" />
        {FINISHES.map((f, i) => {
          const x = 10 + i * 150
          const on = active === f.id
          return (
            <Hit key={f.id} label={t(f.name)} active={on} onPick={() => onPick(f.id)}>
              <rect x={x} y="10" width={PW} height="206" rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <rect x={x + 6} y={top + 30} width={PW - 12} height="16" fill={COLOR.core} />
              <rect x={x + 6} y={top - 10} width="18" height="40" fill={MASK_FILL} />
              <rect x={x + PW - 24} y={top - 10} width="18" height="40" fill={MASK_FILL} />
              <Film id={f.id} x={x} y={top} />
              <rect x={x + 30} y={top} width="84" height="30" fill={COLOR.cu} />
              <text x={x + 72} y={top + 20} textAnchor="middle" fill="#2b1608" fontSize="11" fontWeight="700">
                {t(L.cu)}
              </text>
              <text x={x + 15} y={top - 16} textAnchor="middle" fill="var(--muted)" fontSize="9">
                {t(L.mask)}
              </text>
              <text x={x + 72} y="168" textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
                {t(f.short)}
              </text>
              {f.figLines.map((line, j) => (
                <text key={j} x={x + 72} y={184 + j * 15} textAnchor="middle" fill="var(--muted)" fontSize="10">
                  {t(line)}
                </text>
              ))}
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.finishCap)}</figcaption>
    </figure>
  )
}
