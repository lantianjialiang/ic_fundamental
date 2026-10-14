import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from './common'
import { COVER_TEXT, ROLE_COLS, ROLES, STAGES, SUPPLY, type RoleId, type StageId, type SupplyId } from './data/industry'

const L = {
  test: loc('测试', 'TEST'),
  handoff: loc('交出：', 'Hands over: '),
  supply: loc('给整条链供货', 'Supplies the whole chain'),
  cap: loc(
    '上排是芯片走的路，金框是两道测试；顶上的标签是这一站交给下一站的东西。下排三个行业不直接出芯片，虚线表示它们供货给哪几站。',
    'The top row is the path a chip takes; gold frames are the two test steps, and the tag above shows what each stage hands to the next. The three industries below do not make chips themselves; dashed lines show which stages they supply.',
  ),
  role: loc('公司模式', 'Model'),
}

const BOX_W = 104
const BOX_Y = 36
const BOX_H = 110
const stageX = (i: number) => 70 + i * 124
const SUPPLY_X = [140, 380, 620]
const SUPPLY_Y = 222

function StageIcon({ id, cx, cy }: { id: StageId; cx: number; cy: number }) {
  if (id === 'design') {
    return (
      <g>
        <rect x={cx - 24} y={cy - 17} width="48" height="30" rx="2" fill="var(--fig-box-2)" stroke="var(--line-2)" />
        <rect x={cx - 18} y={cy - 12} width="14" height="8" fill="var(--blue-bg-2)" />
        <rect x={cx - 1} y={cy - 12} width="16" height="5" fill="var(--green-bg)" stroke="var(--green-line)" strokeWidth="0.6" />
        <rect x={cx - 18} y={cy - 1} width="30" height="4" fill="var(--gold-bg-2)" />
        <path d={`M${cx - 6} ${cy + 13} h12 M${cx} ${cy + 13} v5 M${cx - 10} ${cy + 18} h20`} stroke="var(--line-2)" strokeWidth="1.4" fill="none" />
      </g>
    )
  }
  if (id === 'fab') {
    const r = 22
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="var(--fig-box-2)" stroke="var(--line-2)" />
        {[-14, -7, 0, 7, 14].map((d) => {
          const h = Math.sqrt(r * r - d * d) - 1
          return (
            <g key={d} stroke="var(--line-3)" strokeWidth="0.8">
              <line x1={cx + d} y1={cy - h} x2={cx + d} y2={cy + h} />
              <line x1={cx - h} y1={cy + d} x2={cx + h} y2={cy + d} />
            </g>
          )
        })}
        <path d={`M${cx - 3} ${cy + r - 0.5} a3 3 0 0 1 6 0`} fill="var(--card)" stroke="var(--line-2)" />
      </g>
    )
  }
  if (id === 'cp') {
    return (
      <g>
        <rect x={cx - 26} y={cy - 20} width="52" height="7" rx="2" fill="var(--blue-bg)" stroke="var(--blue)" />
        {[-9, -3, 3, 9].map((d) => (
          <line key={d} x1={cx + d * 1.8} y1={cy - 13} x2={cx + d} y2={cy + 9} stroke="var(--gold)" strokeWidth="1.2" />
        ))}
        <ellipse cx={cx} cy={cy + 14} rx="28" ry="6" fill="var(--fig-box-2)" stroke="var(--line-2)" />
      </g>
    )
  }
  if (id === 'assy') {
    return (
      <g>
        {[-10, -3.5, 3, 9.5].map((d) => (
          <g key={d} fill="var(--text-2)">
            <rect x={cx + d - 1} y={cy - 21} width="2" height="5" />
            <rect x={cx + d - 1} y={cy + 16} width="2" height="5" />
            <rect x={cx - 21} y={cy + d - 1} width="5" height="2" />
            <rect x={cx + 16} y={cy + d - 1} width="5" height="2" />
          </g>
        ))}
        <rect x={cx - 16} y={cy - 16} width="32" height="32" rx="2" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <circle cx={cx - 10} cy={cy - 10} r="2" fill="var(--muted)" />
      </g>
    )
  }
  if (id === 'ft') {
    return (
      <g>
        <path d={`M${cx} ${cy - 24} V${cy - 12} M${cx - 4} ${cy - 16} L${cx} ${cy - 11} L${cx + 4} ${cy - 16}`} fill="none" stroke="var(--blue)" strokeWidth="1.5" />
        <rect x={cx - 26} y={cy - 2} width="52" height="18" rx="2" fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x={cx - 15} y={cy - 2} width="30" height="5" fill="var(--well)" />
        <rect x={cx - 13} y={cy - 9} width="26" height="8" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x={cx - 32} y={cy + 16} width="64" height="5" fill="var(--green-bg)" stroke="var(--green-line)" />
      </g>
    )
  }
  return (
    <g>
      <rect x={cx - 28} y={cy - 16} width="56" height="34" rx="3" fill="var(--green-bg)" stroke="var(--green-line)" />
      <rect x={cx - 20} y={cy - 9} width="16" height="16" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      <rect x={cx + 3} y={cy - 7} width="16" height="10" rx="1" fill="var(--neutral-fill)" stroke="var(--text-2)" />
      <path d={`M${cx - 4} ${cy} H${cx + 3} M${cx + 11} ${cy + 3} V${cy + 13}`} stroke="var(--gold)" strokeWidth="1" />
    </g>
  )
}

export function ChainFig({
  step,
  supply,
  onStage,
  onSupply,
}: {
  step: number
  supply: SupplyId | null
  onStage: (index: number) => void
  onSupply: (id: SupplyId) => void
}) {
  const { t } = useLocale()
  const stage = STAGES[step]
  const pillW = 210
  const pillX = Math.min(Math.max(stageX(step) - pillW / 2, 6), 760 - pillW - 6)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="group" aria-label={t(L.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        {SUPPLY.map((item, k) => {
          const on = supply === item.id
          return item.serves.map((sid) => {
            const i = STAGES.findIndex((s) => s.id === sid)
            return (
              <line
                key={`${item.id}-${sid}`}
                x1={SUPPLY_X[k]}
                y1={SUPPLY_Y}
                x2={stageX(i)}
                y2={BOX_Y + BOX_H}
                stroke={on ? 'var(--gold)' : 'var(--line-2)'}
                strokeWidth={on ? 1.6 : 1}
                strokeDasharray="4 4"
              />
            )
          })
        })}
        {STAGES.map((s, i) => {
          const cx = stageX(i)
          const on = i === step
          const done = i < step
          return (
            <g key={s.id}>
              {i > 0 ? (
                <path
                  d={`M${cx - 72} 91 H${cx - 54} M${cx - 60} 86 L${cx - 54} 91 L${cx - 60} 96`}
                  fill="none"
                  stroke={i <= step ? 'var(--gold)' : 'var(--muted)'}
                  strokeWidth="1.6"
                />
              ) : null}
              <Hit label={t(s.title)} active={on} onPick={() => onStage(i)}>
                <rect
                  x={cx - BOX_W / 2}
                  y={BOX_Y}
                  width={BOX_W}
                  height={BOX_H}
                  rx="8"
                  fill={on ? 'var(--gold-bg)' : done ? 'var(--panel-2)' : 'var(--card)'}
                  stroke={on || s.test ? 'var(--gold)' : 'var(--line)'}
                  strokeWidth={s.test || on ? 2 : 1}
                />
                {s.test ? (
                  <text x={cx} y={BOX_Y + 14} textAnchor="middle" fill="var(--gold)" fontSize="10" letterSpacing="1">
                    {t(L.test)}
                  </text>
                ) : null}
                <StageIcon id={s.id} cx={cx} cy={86} />
                <text x={cx} y={BOX_Y + 88} textAnchor="middle" fill="var(--text)" fontSize="13">
                  {t(s.title)}
                </text>
                <text x={cx} y={BOX_Y + 104} textAnchor="middle" fill="var(--muted)" fontSize="10">
                  {t(s.who)}
                </text>
              </Hit>
            </g>
          )
        })}
        <g style={{ transform: `translateX(${pillX}px)`, transition: 'transform 0.45s ease' }}>
          <rect x="0" y="6" width={pillW} height="22" rx="11" fill="var(--gold-bg)" stroke="var(--gold-line)" />
          <text x={pillW / 2} y="21" textAnchor="middle" fill="var(--text)" fontSize="11">
            {t(L.handoff)}
            {t(stage.output)}
          </text>
        </g>
        <text x="380" y={SUPPLY_Y - 8} textAnchor="middle" fill="var(--dim)" fontSize="10" stroke="var(--well)" strokeWidth="5" paintOrder="stroke">
          {t(L.supply)}
        </text>
        {SUPPLY.map((item, k) => {
          const on = supply === item.id
          return (
            <Hit key={item.id} label={t(item.title)} active={on} onPick={() => onSupply(item.id)}>
              <rect
                x={SUPPLY_X[k] - 105}
                y={SUPPLY_Y}
                width="210"
                height="56"
                rx="8"
                fill={on ? 'var(--gold-bg)' : 'var(--panel-2)'}
                stroke={on ? 'var(--gold)' : 'var(--line-2)'}
                strokeDasharray={on ? undefined : '4 3'}
              />
              <text x={SUPPLY_X[k]} y={SUPPLY_Y + 23} textAnchor="middle" fill="var(--text)" fontSize="13">
                {t(item.title)}
              </text>
              <text x={SUPPLY_X[k]} y={SUPPLY_Y + 41} textAnchor="middle" fill="var(--muted)" fontSize="10">
                {t(item.sub)}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}

export function RoleMatrix({ active, onPick }: { active: RoleId; onPick: (id: RoleId) => void }) {
  const { t } = useLocale()
  return (
    <div className="prep-matrix" role="group" aria-label={t(L.role)}>
      <div className="prep-matrix__row prep-matrix__head">
        <span>{t(L.role)}</span>
        {ROLE_COLS.map((col) => (
          <span key={col.zh}>{t(col)}</span>
        ))}
      </div>
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          className={`prep-matrix__row${active === role.id ? ' is-active' : ''}`}
          aria-pressed={active === role.id}
          onClick={() => onPick(role.id)}
        >
          <span className="prep-matrix__name">
            <b>{t(role.title)}</b>
            <small>{t(role.full)}</small>
          </span>
          {role.cover.map((c, k) => (
            <span key={k} className={`prep-matrix__cell is-c${c}`}>
              {t(COVER_TEXT[c])}
            </span>
          ))}
        </button>
      ))}
    </div>
  )
}
