import { useLocale } from '../../i18n/LocaleContext'
import { CLAMP_FACTOR, ESD_LABEL, type EsdState } from './data/mosRealRel'
import { TEMP_LABEL } from './data/mosRealSub'
import { VDD } from './model'
import { Nmos, T } from './RealFigs'
import { idTotal, PAR_TOTAL, rdsAt, shareHot, T_REF, ztc } from './realModel'

/* ---------- 温度：转移特性 + 并联分流 ---------- */

const TP = { x0: 60, x1: 420, y0: 40, y1: 290, vMax: VDD, iMax: 8e-3 }
const tx = (v: number) => TP.x0 + (v / TP.vMax) * (TP.x1 - TP.x0)
const ty = (i: number) => TP.y1 - (i / TP.iMax) * (TP.y1 - TP.y0)

function linPath(c: number) {
  const pts: string[] = []
  for (let v = 0; v <= VDD + 1e-9; v += 0.03) {
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${tx(v).toFixed(1)} ${ty(idTotal(v, VDD, c)).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function TempFig({ temp }: { temp: number }) {
  const { t } = useLocale()
  const z = ztc(temp)
  const zy = ty(idTotal(z, VDD, T_REF))
  const ia = shareHot(temp)
  const ib = PAR_TOTAL - ia
  const barW = (i: number) => (i / PAR_TOTAL) * 200
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 340" className="term-fig__svg" role="img" aria-label={t(TEMP_LABEL.cap)}>
        <rect width="760" height="340" rx="10" fill="var(--well)" />
        <clipPath id="mosRealTempClip">
          <rect x={TP.x0} y={TP.y0} width={TP.x1 - TP.x0} height={TP.y1 - TP.y0} />
        </clipPath>
        <rect x={TP.x0} y={TP.y0} width={TP.x1 - TP.x0} height={TP.y1 - TP.y0} fill="var(--card)" stroke="var(--line)" />
        {[0, 2, 4, 6, 8].map((m) => (
          <g key={m}>
            <path d={`M${TP.x0} ${ty(m * 1e-3)} H${TP.x1}`} stroke="var(--line-3)" />
            <T x={TP.x0 - 6} y={ty(m * 1e-3) + 4} anchor="end" size={10} color="var(--muted)">
              {String(m)}
            </T>
          </g>
        ))}
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <path d={`M${tx(v)} ${TP.y0} V${TP.y1}`} stroke="var(--line-3)" />
            <T x={tx(v)} y={TP.y1 + 16} size={10} color="var(--muted)">
              {String(v)}
            </T>
          </g>
        ))}
        <T x={TP.x0} y={30} anchor="start" size={11}>
          {t(TEMP_LABEL.axisY)}
        </T>
        <T x={TP.x1} y={TP.y1 + 34} anchor="end" size={11}>
          {t(TEMP_LABEL.axisX)}
        </T>
        <g clipPath="url(#mosRealTempClip)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {temp === T_REF ? null : <path d={linPath(T_REF)} stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" />}
          <path d={linPath(temp)} stroke="var(--gold)" strokeWidth="3" />
        </g>
        <T x={TP.x0 + 8} y={TP.y0 + 16} anchor="start" color="var(--blue)">
          {t(TEMP_LABEL.below)}
        </T>
        <T x={TP.x0 + 8} y={TP.y0 + 32} anchor="start" color="var(--blue)">
          {t(TEMP_LABEL.above)}
        </T>
        <circle cx={tx(z)} cy={zy} r="6" fill="var(--blue)" stroke="var(--well)" strokeWidth="2" />
        <T x={tx(z) + 12} y={Math.min(zy + 18, TP.y1 - 6)} anchor="start" color="var(--blue)" bold>
          {t(TEMP_LABEL.ztcTag)}
        </T>
        <path d="M150 17 H178" stroke="var(--gold)" strokeWidth="3" />
        <T x={184} y={21} anchor="start">
          {`${t(TEMP_LABEL.now)} ${temp} °C`}
        </T>
        <path d="M350 17 H378" stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" />
        <T x={384} y={21} anchor="start">
          {t(TEMP_LABEL.ref)}
        </T>
        <rect x="460" y="30" width="290" height="260" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={476} y={54} anchor="start" color="var(--text)" size={12} bold>
          {t(TEMP_LABEL.parTitle)}
        </T>
        <T x={476} y={86} anchor="start">
          {t(TEMP_LABEL.partA)}
        </T>
        <rect x="476" y="94" width={barW(ia)} height="20" fill="var(--gold-bg-2)" stroke="var(--gold)" />
        <T x={476 + barW(ia) + 8} y={109} anchor="start" color="var(--gold)" bold>
          {`${ia.toFixed(1)} A`}
        </T>
        <T x={476} y={132} anchor="start" size={10} color="var(--muted)">
          {`Rds(on) ${(rdsAt(temp) * 1000).toFixed(1)} mΩ`}
        </T>
        <T x={476} y={166} anchor="start">
          {t(TEMP_LABEL.partB)}
        </T>
        <rect x="476" y="174" width={barW(ib)} height="20" fill="var(--blue-bg-2)" stroke="var(--blue)" />
        <T x={476 + barW(ib) + 8} y={189} anchor="start" color="var(--blue)" bold>
          {`${ib.toFixed(1)} A`}
        </T>
        <T x={476} y={212} anchor="start" size={10} color="var(--muted)">
          {`Rds(on) ${(rdsAt(T_REF) * 1000).toFixed(1)} mΩ`}
        </T>
        <path d={`M${476 + barW(PAR_TOTAL / 2)} 70 V220`} stroke="var(--muted)" strokeDasharray="4 3" />
        <T x={476 + barW(PAR_TOTAL / 2)} y={236} size={10} color="var(--muted)">
          {`${PAR_TOTAL / 2} A`}
        </T>
        <T x={476} y={270} anchor="start" size={11}>
          {`${t(TEMP_LABEL.total)} ${PAR_TOTAL} A`}
        </T>
      </svg>
      <figcaption>{t(TEMP_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 栅极 ESD：钳位电路 + Vgs 分区条 ---------- */

const GX = (v: number) => 380 + v * (640 / 60)
const ZONE_COLOR = { ok: 'var(--green-bg)', warn: 'var(--gold-bg-2)', bad: 'var(--red-bg)' }

/** 稳压管，占高 16。up：阴极（带折边的竖线）在上；否则在下。y 是上端 */
function Zener({ x, y, up }: { x: number; y: number; up: boolean }) {
  const bar = up ? y : y + 16
  const tri = up ? `M${x - 6} ${y + 16} H${x + 6} L${x} ${y} Z` : `M${x - 6} ${y} H${x + 6} L${x} ${y + 16} Z`
  return (
    <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinejoin="round">
      <path d={tri} />
      <path d={`M${x - 6} ${bar - 3} V${bar} H${x + 6} V${bar + 3}`} />
    </g>
  )
}

function Diode({ x, y }: { x: number; y: number }) {
  // 阴极在上，y 是阴极竖线位置
  return (
    <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinejoin="round">
      <path d={`M${x - 6} ${y + 16} H${x + 6} L${x} ${y} Z`} />
      <path d={`M${x - 6} ${y} H${x + 6}`} />
    </g>
  )
}

export function EsdFig({ abs, vgs, state }: { abs: number; vgs: number; state: EsdState }) {
  const { t } = useLocale()
  const clampV = abs * CLAMP_FACTOR
  const markColor = state === 'safe' ? 'var(--green)' : state === 'over' ? 'var(--gold)' : 'var(--red)'
  const hot = state !== 'safe'
  const legend = [
    { c: ZONE_COLOR.ok, k: ESD_LABEL.safeZone, x: 60 },
    { c: ZONE_COLOR.warn, k: ESD_LABEL.overZone, x: 200 },
    { c: ZONE_COLOR.bad, k: ESD_LABEL.clampZone, x: 340 },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 400" className="term-fig__svg" role="img" aria-label={t(ESD_LABEL.cap)}>
        <rect width="760" height="400" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="400" height="250" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="430" y="10" width="320" height="250" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={24} y={32} anchor="start" color="var(--text)" size={12} bold>
          {t(ESD_LABEL.discrete)}
        </T>
        <T x={444} y={32} anchor="start" color="var(--text)" size={12} bold>
          {t(ESD_LABEL.pin)}
        </T>
        <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 130 H150 M186 130 H220 M205 130 V148 M205 164 V188 M205 204 V240 M205 240 H300 M260 164 V240 M260 96 V70" />
          <rect x="150" y="122" width="36" height="16" />
        </g>
        <circle cx="205" cy="130" r="3" fill="var(--text-2)" />
        <circle cx="260" cy="240" r="3" fill="var(--text-2)" />
        <Zener x={205} y={148} up />
        <Zener x={205} y={188} up={false} />
        <Nmos cx={250} cy={130} on={false} diode />
        {hot ? <path d="M236 112 V148" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" /> : null}
        {state === 'clamp' ? <path d="M205 130 V240" stroke="var(--red)" strokeWidth="3" strokeDasharray="5 4" /> : null}
        <T x={24} y={124} anchor="start" color="var(--text)" bold>
          {t(ESD_LABEL.gate)}
        </T>
        <T x={168} y={156} color="var(--muted)" size={10}>
          {t(ESD_LABEL.rGate)}
        </T>
        <T x={191} y={178} anchor="end" color="var(--muted)" size={10}>
          {t(ESD_LABEL.zener)}
        </T>
        <T x={232} y={106} anchor="end" color="var(--muted)" size={10}>
          {t(ESD_LABEL.oxide)}
        </T>
        <T x={270} y={82} anchor="start" color="var(--text)" bold>
          D
        </T>
        <T x={310} y={244} anchor="start" color="var(--text)" bold>
          S
        </T>
        <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M478 150 H500 M536 150 H630 M590 150 V116 M590 100 V70 M590 150 V172 M590 188 V240 M560 70 H720 M560 240 H720 M670 184 V240 M670 116 V100" />
          <rect x="500" y="142" width="36" height="16" />
          <rect x="462" y="142" width="16" height="16" />
          <circle cx="670" cy="96" r="3" />
        </g>
        <circle cx="590" cy="150" r="3" fill="var(--text-2)" />
        <Diode x={590} y={100} />
        <Diode x={590} y={172} />
        <Nmos cx={660} cy={150} on={false} diode={false} />
        <T x={470} y={132} color="var(--text)" bold>
          PAD
        </T>
        <T x={518} y={176} color="var(--muted)" size={10}>
          {t(ESD_LABEL.rGate)}
        </T>
        <T x={604} y={112} anchor="start" color="var(--muted)" size={10}>
          {t(ESD_LABEL.d1)}
        </T>
        <T x={604} y={184} anchor="start" color="var(--muted)" size={10}>
          {t(ESD_LABEL.d2)}
        </T>
        <T x={724} y={74} anchor="start" color="var(--text)" bold>
          VDD
        </T>
        <T x={724} y={244} anchor="start" color="var(--text)" bold>
          GND
        </T>
        <rect x={GX(-30)} y="310" width={GX(30) - GX(-30)} height="22" fill={ZONE_COLOR.bad} />
        <rect x={GX(-clampV)} y="310" width={GX(clampV) - GX(-clampV)} height="22" fill={ZONE_COLOR.warn} />
        <rect x={GX(-abs)} y="310" width={GX(abs) - GX(-abs)} height="22" fill={ZONE_COLOR.ok} />
        <rect x={GX(-30)} y="310" width={GX(30) - GX(-30)} height="22" fill="none" stroke="var(--line)" />
        {[-abs, abs].map((v) => (
          <g key={v}>
            <path d={`M${GX(v)} 308 V334`} stroke="var(--text-2)" strokeDasharray="3 2" />
            <T x={GX(v)} y={348} size={10} color="var(--text-2)">
              {`${v > 0 ? '+' : '−'}${abs} V`}
            </T>
          </g>
        ))}
        {[-clampV, clampV].map((v) => (
          <T key={v} x={GX(v)} y={362} size={10} color="var(--muted)">
            {`${v > 0 ? '+' : '−'}${clampV.toFixed(0)} V`}
          </T>
        ))}
        {[-30, 0, 30].map((v) => (
          <T key={v} x={GX(v)} y={348} size={10} color="var(--muted)">
            {v === 0 ? '0' : `${v > 0 ? '+' : '−'}30`}
          </T>
        ))}
        <path d={`M${GX(vgs)} 306 l-7 -12 h14 Z`} fill={markColor} />
        <T x={GX(vgs)} y={286} color={markColor} size={12} bold>
          {`Vgs = ${vgs} V`}
        </T>
        {legend.map((item) => (
          <g key={item.x}>
            <rect x={item.x} y="376" width="14" height="14" fill={item.c} stroke="var(--line)" />
            <T x={item.x + 20} y={388} anchor="start" size={11}>
              {t(item.k)}
            </T>
          </g>
        ))}
      </svg>
      <figcaption>{t(ESD_LABEL.cap)}</figcaption>
    </figure>
  )
}
