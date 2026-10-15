import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { T_1OZ_MM } from './data/pcbBasicsModel'
import { DIFF_H } from './data/pcbLayoutModel'
import { T } from './FlowFigs'
import { C, Trace } from './LayoutFigs'

const L = {
  dAria: loc('差分对：俯视图和横截面', 'Differential pair: top view and cross-section'),
  top: loc('俯视图', 'Top view'),
  sect: loc('横截面', 'Cross-section'),
  equal: loc('等宽、等距、等长，一起拐弯', 'Equal width, spacing, length; turn together'),
  plane: loc('地平面', 'Ground plane'),
  dCap: loc(
    '示意：左边是俯视图，两线拐弯时保持间距，长度相等（两条折线的总长相同）。右边是横截面，电场线从一根线的边沿走向另一根，也有一部分落到下面的地平面；横截面按下面的 w、s 和 h 等比例画。',
    'Illustration: on the left the top view, the two lines keep their spacing around the bends and have equal length (both polylines have the same total length). On the right the cross-section: field lines run from one trace to the other and partly down to the plane below; it is drawn to scale from the w, s and h below.',
  ),
  tAria: loc('QFN 裸露焊盘与散热过孔的截面', 'Cross-section of a QFN exposed pad with thermal vias'),
  die: loc('芯片', 'Die'),
  pad: loc('裸露焊盘', 'Exposed pad'),
  solder: loc('焊料', 'Solder'),
  vias: loc('散热过孔', 'Thermal vias'),
  pour: loc('背面铜皮', 'Bottom copper'),
  heat: loc('热量', 'Heat flow'),
  tCap: loc(
    '示意（不按比例，过孔只画了五个代表）：芯片的热量经裸露焊盘、焊料、顶层铜焊盘，由过孔铜筒传到背面的大铜皮，再向四周散开。',
    'Illustration (not to scale; five vias drawn as representatives): heat from the die goes through the exposed pad, solder and top copper pad, down the copper barrels of the vias into the large copper area on the back, and spreads out.',
  ),
}

export function DiffFig({ w, s }: { w: number; s: number }) {
  const { t } = useLocale()
  const k = 160
  const cx = 500
  const hy = 214 - DIFF_H * k
  const th = T_1OZ_MM * k
  const xl2 = cx - (s * k) / 2
  const xl1 = xl2 - w * k
  const xr1 = cx + (s * k) / 2
  const xr2 = xr1 + w * k
  const mid = (a: number, b: number) => (a + b) / 2
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 270" className="term-fig__svg" role="img" aria-label={t(L.dAria)}>
        <rect width="680" height="270" rx="10" fill="var(--well)" />
        <rect x="20" y="14" width="300" height="240" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <T x={32} y={32} anchor="start" size={11} color="var(--muted)">
          {t(L.top)}
        </T>
        <rect x="22" y="88" width="24" height="40" fill="var(--fig-box-2)" stroke={C.edge} />
        <rect x="270" y="90" width="40" height="70" rx="3" fill={C.body} stroke={C.edge} strokeWidth="1.4" />
        <Trace d="M46 100 H110 L140 130 H270" color={C.usb} w={4} />
        <Trace d="M46 118 H102.5 L132.5 148 H270" color={C.usb} w={4} />
        <T x={56} y={92} anchor="start" size={10} color={C.usb}>
          D−
        </T>
        <T x={56} y={134} anchor="start" size={10} color={C.usb}>
          D+
        </T>
        <path d="M200 130 V148 M195 130 H205 M195 148 H205" stroke="var(--text-2)" strokeWidth="1" fill="none" />
        <T x={212} y={143} anchor="start" size={10}>
          s
        </T>
        <T x={170} y={196} size={10}>
          {t(L.equal)}
        </T>
        <rect x="340" y="14" width="320" height="240" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <T x={352} y={32} anchor="start" size={11} color="var(--muted)">
          {t(L.sect)}
        </T>
        <rect x="350" y={hy} width="300" height={DIFF_H * k} fill="var(--blue-bg-3)" />
        <rect x="350" y="214" width="300" height="5" fill="var(--gold-line)" />
        <rect x={xl1} y={hy - th} width={w * k} height={th} fill={C.usb} />
        <rect x={xr1} y={hy - th} width={w * k} height={th} fill={C.usb} />
        <path d={`M${xl2} ${hy - th / 2} H${xr1}`} stroke="var(--sky)" strokeWidth="1.2" fill="none" />
        <path d={`M${xl2} ${hy - th} Q${cx} ${hy - 34} ${xr1} ${hy - th}`} stroke="var(--sky)" strokeWidth="1.2" fill="none" />
        <path d={`M${mid(xl1, xl2)} ${hy} V214 M${mid(xr1, xr2)} ${hy} V214`} stroke="var(--sky)" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        <T x={mid(xl1, xl2)} y={hy - th - 8} size={13} bold color="var(--red-2)">
          +
        </T>
        <T x={mid(xr1, xr2)} y={hy - th - 8} size={13} bold color="var(--blue)">
          −
        </T>
        <T x={352} y={236} anchor="start" size={10}>
          {t(L.plane)}
        </T>
        <T x={500} y={250} size={10} color="var(--text-2)" mono>
          {`w = ${w.toFixed(2)}  s = ${s.toFixed(2)}  h = ${DIFF_H.toFixed(2)} mm`}
        </T>
      </svg>
      <figcaption>{t(L.dCap)}</figcaption>
    </figure>
  )
}

function Arrow({ x, y, dir }: { x: number; y: number; dir: 'down' | 'left' | 'right' }) {
  const pts = {
    down: `${x - 5},${y - 5} ${x},${y + 5} ${x + 5},${y - 5}`,
    left: `${x + 5},${y - 5} ${x - 5},${y} ${x + 5},${y + 5}`,
    right: `${x - 5},${y - 5} ${x + 5},${y} ${x - 5},${y + 5}`,
  }
  return <polygon points={pts[dir]} fill="var(--red-2)" />
}

function Leader({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="var(--dim)" strokeWidth="1" fill="none" />
}

export function ThermalFig({ n }: { n: number }) {
  const { t } = useLocale()
  const viaX = [285, 310, 335, 360, 385]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 290" className="term-fig__svg" role="img" aria-label={t(L.tAria)}>
        <rect width="680" height="290" rx="10" fill="var(--well)" />
        <rect x="60" y="186" width="560" height="40" fill="var(--fig-box-2)" />
        <rect x="60" y="226" width="560" height="5" fill="var(--gold-line)" />
        <rect x="264" y="182" width="152" height="4" fill="var(--gold-line)" />
        <rect x="194" y="182" width="36" height="4" fill="var(--gold-line)" />
        <rect x="450" y="182" width="36" height="4" fill="var(--gold-line)" />
        <rect x="270" y="176" width="140" height="6" fill="var(--text-2)" fillOpacity="0.55" />
        <rect x="200" y="176" width="24" height="6" fill="var(--text-2)" fillOpacity="0.55" />
        <rect x="456" y="176" width="24" height="6" fill="var(--text-2)" fillOpacity="0.55" />
        <rect x="190" y="100" width="300" height="76" rx="3" fill="var(--card)" stroke={C.edge} strokeWidth="1.4" />
        <rect x="270" y="134" width="140" height="42" fill="var(--gold-line)" />
        <rect x="200" y="160" width="24" height="16" fill="var(--gold-line)" />
        <rect x="456" y="160" width="24" height="16" fill="var(--gold-line)" />
        <rect x="295" y="129" width="90" height="5" fill="var(--text-2)" fillOpacity="0.6" />
        <rect x="305" y="115" width="70" height="14" fill="var(--fig-box-2)" stroke={C.edge} />
        <path d="M305 120 Q250 96 212 160 M375 120 Q430 96 468 160" stroke={C.pad} strokeWidth="1.2" fill="none" />
        {viaX.map((x) => (
          <g key={x}>
            <rect x={x - 6} y="182" width="2.6" height="49" fill="var(--gold-line)" />
            <rect x={x + 3.4} y="182" width="2.6" height="49" fill="var(--gold-line)" />
          </g>
        ))}
        <T x={190} y={92} anchor="start" size={11} bold>
          QFN
        </T>
        <Arrow x={340} y={150} dir="down" />
        <Arrow x={297} y={206} dir="down" />
        <Arrow x={347} y={206} dir="down" />
        <Arrow x={225} y={240} dir="left" />
        <Arrow x={455} y={240} dir="right" />
        <T x={510} y={124} anchor="start" size={11}>
          {t(L.die)}
        </T>
        <Leader x1={506} y1={121} x2={376} y2={121} />
        <T x={510} y={160} anchor="start" size={11}>
          {t(L.pad)}
        </T>
        <Leader x1={506} y1={157} x2={411} y2={157} />
        <T x={510} y={182} anchor="start" size={11}>
          {t(L.solder)}
        </T>
        <Leader x1={506} y1={179} x2={411} y2={179} />
        <T x={510} y={208} anchor="start" size={11}>
          {`${t(L.vias)} × ${n}`}
        </T>
        <Leader x1={506} y1={205} x2={392} y2={205} />
        <T x={510} y={250} anchor="start" size={11}>
          {t(L.pour)}
        </T>
        <Leader x1={506} y1={247} x2={500} y2={231} />
        <T x={70} y={212} anchor="start" size={10} color="var(--text-2)">
          FR-4
        </T>
        <Arrow x={76} y={270} dir="right" />
        <T x={90} y={274} anchor="start" size={10} color="var(--red-2)">
          {t(L.heat)}
        </T>
      </svg>
      <figcaption>{t(L.tCap)}</figcaption>
    </figure>
  )
}
