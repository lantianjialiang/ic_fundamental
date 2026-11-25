import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const STAGES = {
  drill: loc('钻孔后，绝缘孔壁还裸露，树脂胶渣可能遮住内层铜边。上下焊盘尚未连通。', 'After drilling, the exposed wall is insulating. Resin smear may cover the inner copper edges. Top and bottom pads are still disconnected.'),
  desmear: loc('清掉钻污后能看到内层铜的边缘。两层铜边中间仍是绝缘材料，所以还不导通。', 'Cleaning exposes the inner copper edges. Insulation still separates them, so there is no continuous path.'),
  electroless: loc('化学沉铜形成连续薄膜，第一次把两层铜连起来。这层铜用作后续电镀的导电底层。', 'Electroless copper forms the first continuous path between the pads. This thin film provides a conductive base for electroplating.'),
  panel: loc('电镀让连续铜层加厚，缩小成品孔径，并提高孔壁的载流和机械可靠性。', 'Electroplating thickens the continuous copper, reducing the finished bore and improving current capacity and mechanical reliability.'),
}

export function ViaWallFig({ frame }: { frame: string }) {
  const { t } = useLocale()
  if (!(frame in STAGES)) return null
  const step = frame as keyof typeof STAGES
  const lined = step === 'electroless' || step === 'panel'
  const wall = step === 'panel' ? 11 : 3
  const copper = '#eaa365'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 450 202" className="term-fig__svg" role="img" aria-label={t(STAGES[step])} data-via-stage={step} data-continuity={lined}>
        <rect width="450" height="202" fill="var(--well)" />
        <path d="M55 55 H188 V153 H55Z M252 55 H395 V153 H252Z" fill="#4a7167" />
        <path d="M69 51 H188 M252 51 H380 M69 157 H188 M252 157 H380 M107 105 H188 M252 105 H358"
          stroke={copper} strokeWidth="8" />
        {step === 'drill' && <path d="M188 85 V127 M252 91 V119" stroke="#b991b5" strokeWidth="6" />}
        {lined && <path data-wall-copper d={`M167 51 H${188 + wall / 2} V157 H166 M274 51 H${252 - wall / 2} V157 H274`}
          fill="none" stroke={copper} strokeWidth={wall} strokeLinejoin="round" />}
        <path d="M188 47 V25 M252 47 V25 M188 35 H252" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="220" y="19" textAnchor="middle" fill="var(--text)" fontSize="16">{t(loc('原钻孔边界', 'Original drill span'))}</text>
        <text x="104" y="79" textAnchor="middle" fill="#effaf0" fontSize="16">{t(loc('基材', 'Laminate'))}</text>
        <text x="330" y="95" fill="#effaf0" fontSize="15">{t(loc('内层铜', 'Inner Cu'))}</text>
        <text x="220" y="184" textAnchor="middle" fill="var(--text)" fontSize="17">
          {t(lined ? loc('上下导通', 'Top to bottom conducts') : loc('上下断开', 'Top to bottom open'))}
        </text>
      </svg>
      <figcaption>{t(STAGES[step])} {t(loc('铜厚放大显示。', 'Copper thickness exaggerated.'))}</figcaption>
    </figure>
  )
}
