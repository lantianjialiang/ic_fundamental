import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { C, T } from './BasicsFigs'
import { MARKS, MARKS_S, type MarkId } from './data/pcbBasicsText2'
import { T_1OZ_MM, type LayerKind } from './data/pcbBasicsModel'
import { Z_S } from './data/pcbBasicsText3'

const LAMINATE = '#c9b77a'

function Fid({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="12" fill={LAMINATE} stroke={on ? 'var(--gold)' : 'none'} strokeWidth="2" />
      <circle cx={x} cy={y} r="4" fill={on ? C.hot : C.copper} />
    </g>
  )
}

export function MarksFig({ active, onPick, open }: { active: MarkId; onPick: (id: MarkId) => void; open: number }) {
  const { t } = useLocale()
  const lab = (id: MarkId) => t((MARKS.find((m) => m.id === id) ?? MARKS[0]).title)
  const silk = active === 'silk' ? C.hot : C.silk
  const pol = active === 'polar' ? C.hot : C.silk
  const ru = 60 // 放大图每 mm 的像素
  const leads: number[] = []
  for (let i = 0; i < 8; i++) {
    leads.push(149 + i * 9)
  }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="group" aria-label={t(MARKS_S.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        <rect x="10" y="20" width="460" height="260" rx="8" fill={C.mask} stroke="var(--line-2)" />
        <g fill={C.copper}>
          {leads.map((x) => (
            <g key={x}>
              <rect x={x} y="98" width="5" height="12" />
              <rect x={x} y="200" width="5" height="12" />
            </g>
          ))}
          {leads.map((x) => (
            <g key={`s${x}`}>
              <rect x="124" y={x - 30} width="12" height="5" />
              <rect x="234" y={x - 30} width="12" height="5" />
            </g>
          ))}
        </g>
        <rect x="140" y="110" width="90" height="90" fill={C.body} />
        <Hit label={lab('polar')} active={active === 'polar'} onPick={() => onPick('polar')}>
          <circle cx="130" cy="102" r="3.5" fill={pol} />
        </Hit>
        <Hit label={lab('silk')} active={active === 'silk'} onPick={() => onPick('silk')}>
          <rect x="168" y="76" width="34" height="18" fill="transparent" />
          <T x={185} y={90} color={silk} size={13} bold>
            U2
          </T>
        </Hit>
        <Hit label={lab('fid')} active={active === 'fid'} onPick={() => onPick('fid')}>
          <Fid x={34} y={44} on={active === 'fid'} />
          <Fid x={446} y={44} on={active === 'fid'} />
          <Fid x={34} y={256} on={active === 'fid'} />
          <Fid x={104} y={80} on={active === 'fid'} />
          <Fid x={268} y={228} on={active === 'fid'} />
        </Hit>
        <T x={52} y={36} anchor="start" color={C.silk} size={10}>
          {t(loc('全局', 'Global'))}
        </T>
        <T x={104} y={62} color={C.silk} size={10}>
          {t(loc('局部', 'Local'))}
        </T>
        <rect x="318" y="104" width="22" height="22" rx="1" fill={C.copper} />
        <rect x="372" y="104" width="22" height="22" rx="1" fill={C.copper} />
        <rect x="326" y="106" width="60" height="18" fill={C.body} />
        <Hit label={lab('polar')} active={active === 'polar'} onPick={() => onPick('polar')}>
          <rect x="366" y="104" width="4" height="22" fill={pol} />
        </Hit>
        <Hit label={lab('silk')} active={active === 'silk'} onPick={() => onPick('silk')}>
          <rect x="342" y="78" width="28" height="18" fill="transparent" />
          <T x={356} y={92} color={silk} size={13} bold>
            D1
          </T>
        </Hit>
        <rect x="314" y="170" width="24" height="24" rx="1" fill={C.copper} />
        <rect x="378" y="170" width="24" height="24" rx="1" fill={C.copper} />
        <circle cx="358" cy="182" r="26" fill={C.body} />
        <Hit label={lab('polar')} active={active === 'polar'} onPick={() => onPick('polar')}>
          <rect x="300" y="152" width="18" height="16" fill="transparent" />
          <T x={309} y={166} color={pol} size={15} bold>
            +
          </T>
        </Hit>
        <Hit label={lab('silk')} active={active === 'silk'} onPick={() => onPick('silk')}>
          <rect x="342" y="212" width="28" height="18" fill="transparent" />
          <T x={356} y={226} color={silk} size={13} bold>
            C7
          </T>
        </Hit>
        <Hit label={lab('tp')} active={active === 'tp'} onPick={() => onPick('tp')}>
          <circle cx="430" cy="236" r="10" fill={active === 'tp' ? C.hot : C.copper} stroke={C.silk} strokeWidth="1" />
        </Hit>
        <T x={430} y={216} color={silk} size={11} bold>
          TP1
        </T>
        <T x={620} y={36} color="var(--text-2)" size={12} bold>
          {t(loc('Fiducial 放大', 'Fiducial enlarged'))}
        </T>
        <rect x="490" y="44" width="260" height="236" rx="8" fill={C.mask} stroke={active === 'fid' ? 'var(--gold)' : 'var(--line-2)'} strokeWidth={active === 'fid' ? 2 : 1} />
        <circle cx="620" cy="150" r={(open * ru) / 2} fill={LAMINATE} stroke={C.silk} strokeDasharray="5 4" />
        <circle cx="620" cy="150" r={ru / 2} fill={C.copper} />
        <T x={620} y={264} color={C.silk} size={11}>
          {`${t(loc('铜点', 'Dot'))} Ø1.0 mm · ${t(loc('开窗', 'opening'))} Ø${open.toFixed(1)} mm`}
        </T>
      </svg>
      <figcaption>{t(MARKS_S.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 微带线剖面 + Z0 标尺 ---------- */

const ZS_EXT = 200
const ZS_INT = 140

export function MicrostripFig({
  layer,
  er,
  h,
  w,
  z0,
  valid,
}: {
  layer: LayerKind
  er: number
  h: number
  w: number
  z0: number
  valid: boolean
}) {
  const { t } = useLocale()
  const inner = layer === 'int'
  const zs = inner ? ZS_INT : ZS_EXT
  const tw = T_1OZ_MM * zs
  const die = h * zs
  const cx = 250
  const half = (w * zs) / 2
  const xl = cx - half
  const xr = cx + half
  const gnd = 206
  const top = gnd - die
  const mid = 122
  const trTop = inner ? mid - tw / 2 : top - tw
  const trBot = trTop + tw
  const topPlane = mid - tw / 2 - die
  const botPlane = mid + tw / 2 + die
  const gx = (z: number) => 510 + (Math.min(z, 120) / 120) * 230
  const rows = [`Er = ${er.toFixed(1)}`, `h = ${h.toFixed(2)} mm`, `w = ${w.toFixed(2)} mm`, `t = ${T_1OZ_MM.toFixed(3)} mm`]
  const caption = inner ? Z_S.capInner : Z_S.cap
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(caption)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        {inner ? (
          <>
            <rect x="30" y={topPlane} width="440" height={botPlane - topPlane} fill={LAMINATE} />
            <rect x="30" y={topPlane - tw} width="440" height={tw} fill={C.copper} />
            <rect x="30" y={botPlane} width="440" height={tw} fill={C.copper} />
            <rect x={xl} y={trTop} width={xr - xl} height={tw} fill={C.copper} />
            <g fill="none" stroke="var(--blue)" strokeWidth="1.3" strokeDasharray="4 3">
              <path d={`M${cx} ${trTop} V${topPlane}`} />
              <path d={`M${cx} ${trBot} V${botPlane}`} />
              <path d={`M${xl + 6} ${trTop} V${topPlane}`} />
              <path d={`M${xl + 6} ${trBot} V${botPlane}`} />
              <path d={`M${xr - 6} ${trTop} V${topPlane}`} />
              <path d={`M${xr - 6} ${trBot} V${botPlane}`} />
            </g>
            <T x={44} y={topPlane - tw - 6} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capTop)}
            </T>
            <T x={44} y={botPlane + tw + 14} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capBot)}
            </T>
            <T x={Math.min(xr + 70, 430)} y={mid + 4} color="var(--text-2)" size={11}>
              {`${t(Z_S.capW)} · ${t(Z_S.capT)}`}
            </T>
            <rect x="42" y={mid + 16} width="12" height="12" fill={LAMINATE} />
            <T x={60} y={mid + 26} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capH)}
            </T>
          </>
        ) : (
          <>
            <rect x="30" y={top} width="440" height={die} fill={LAMINATE} />
            <rect x="30" y={gnd} width="440" height={tw} fill={C.copper} />
            <rect x={xl} y={trTop} width={xr - xl} height={tw} fill={C.copper} />
            <g fill="none" stroke="var(--blue)" strokeWidth="1.3" strokeDasharray="4 3">
              <path d={`M${cx} ${top} V${gnd}`} />
              <path d={`M${xl + 6} ${top} V${gnd}`} />
              <path d={`M${xr - 6} ${top} V${gnd}`} />
              <path d={`M${xl} ${trTop} Q${xl - die * 0.7 - 12} ${top - 30} ${xl - die * 0.9 - 14} ${gnd}`} />
              <path d={`M${xr} ${trTop} Q${xr + die * 0.7 + 12} ${top - 30} ${xr + die * 0.9 + 14} ${gnd}`} />
            </g>
            <T x={60} y={36} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capAir)}
            </T>
            <T x={44} y={gnd + 26} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capGnd)}
            </T>
            <T x={cx} y={trTop - 8} color="var(--text-2)" size={11}>
              {`${t(Z_S.capW)} · ${t(Z_S.capT)}`}
            </T>
            <rect x="330" y={gnd + 17} width="12" height="12" fill={LAMINATE} />
            <T x={348} y={gnd + 27} anchor="start" color="var(--muted)" size={11}>
              {t(Z_S.capH)}
            </T>
          </>
        )}
        {rows.map((r, i) => (
          <T key={r} x={510} y={30 + i * 18} anchor="start" color="var(--text-2)" size={12} mono>
            {r}
          </T>
        ))}
        <T x={510} y={128} anchor="start" color={valid ? 'var(--green)' : 'var(--red)'} size={20} bold mono>
          {`Z0 = ${z0.toFixed(1)} Ω`}
        </T>
        <T x={510} y={150} anchor="start" color={valid ? 'var(--green)' : 'var(--red)'} size={11}>
          {t(valid ? Z_S.inRange : Z_S.outRange)}
        </T>
        <rect x="510" y="176" width="230" height="12" rx="3" fill="var(--panel)" stroke="var(--line)" />
        <rect x={gx(45)} y="176" width={gx(55) - gx(45)} height="12" fill="var(--green-bg)" stroke="var(--green-line)" />
        <circle cx={gx(z0)} cy="182" r="7" fill="var(--gold)" />
        <T x={gx(0)} y={208} anchor="start" color="var(--dim)" size={10}>
          0
        </T>
        <T x={gx(50)} y={208} color="var(--green)" size={10}>
          50
        </T>
        <T x={gx(120)} y={208} anchor="end" color="var(--dim)" size={10}>
          120 Ω
        </T>
      </svg>
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}
