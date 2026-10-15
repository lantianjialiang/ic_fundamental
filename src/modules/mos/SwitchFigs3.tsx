import { useLocale } from '../../i18n/LocaleContext'
import { BOOT_LABEL, type BootPhase } from './data/mosSwitchCases'
import { BOOT, bootCapVoltage } from './data/mosSwitchModel'
import { Gnd, MosSym, T } from './SwitchFigs'

const f1 = (x: number) => x.toFixed(1)

export function BootFig({ phase }: { phase: BootPhase }) {
  const { t } = useLocale()
  const lift = phase === 'lift'
  const vc = bootCapVoltage()
  const sw = lift ? BOOT.vbus : 0
  const vb = sw + vc
  const hsVgs = lift ? vc : 0
  const lsVgs = lift ? 0 : BOOT.vcc
  const gold = 'var(--gold)'
  const idle = 'var(--text-2)'
  const diodeColor = lift ? 'var(--red)' : gold
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 290" className="term-fig__svg" role="img" aria-label={t(BOOT_LABEL.cap)}>
        <rect width="760" height="290" rx="10" fill="var(--well)" />
        <g fill="none" stroke={idle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 40 H92 M112 40 H150 M150 40 H310 V58 M150 40 V82 M150 90 V137 H500 M310 114 V137" />
          <path d="M500 30 V45 M500 105 V170 M500 230 V255 M500 137 H640 V160 M640 200 V255" />
          <path d="M310 86 H400 V75 H448 M448 200 H400" />
          <path d="M410 30 H620" strokeWidth="2.5" />
          <path d="M138 82 H162 M138 90 H162" stroke="var(--text)" strokeWidth="3" />
        </g>
        <g fill="none" stroke={gold} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          {lift ? (
            <path d="M500 30 V45 M500 105 V137 H640 V160 M640 200 V255" />
          ) : (
            <path d="M70 40 H92 M112 40 H150 V82 M150 90 V137 H500 V170 M500 230 V255" />
          )}
        </g>
        <path d="M92 31 V49 L112 40 Z" fill="var(--card)" stroke={diodeColor} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M112 31 V49" stroke={diodeColor} strokeWidth="2.6" />
        <rect x="250" y="58" width="120" height="56" rx="6" fill="var(--card)" stroke="var(--text-2)" strokeWidth="1.8" />
        <rect x="632" y="160" width="16" height="40" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
        <circle cx="150" cy="40" r="3.5" fill="var(--text)" />
        <circle cx="310" cy="137" r="3.5" fill="var(--text)" />
        <circle cx="500" cy="137" r="3.5" fill="var(--text)" />
        <MosSym kind="n" x={478} y={75} color={lift ? gold : 'var(--text)'} />
        <MosSym kind="n" x={478} y={200} color={lift ? 'var(--text)' : gold} />
        <Gnd x={500} y={255} />
        <Gnd x={640} y={255} />
        <T x={310} y={90} size={11} color="var(--text)">
          {t(BOOT_LABEL.driver)}
        </T>
        <T x={64} y={44} anchor="end" size={10} color="var(--text)" mono>
          {`${t(BOOT_LABEL.vcc)} ${BOOT.vcc} V`}
        </T>
        <T x={102} y={22} size={10} color="var(--muted)">
          {t(BOOT_LABEL.diode)}
        </T>
        <T x={102} y={68} size={10} color={diodeColor}>
          {t(lift ? BOOT_LABEL.reverse : BOOT_LABEL.forward)}
        </T>
        <T x={132} y={90} anchor="end" size={10} color="var(--muted)">
          {t(BOOT_LABEL.cboot)}
        </T>
        <T x={168} y={90} anchor="start" size={10} color="var(--text)" mono>
          {`${f1(vc)} V`}
        </T>
        <T x={320} y={36} anchor="start" size={11} color="var(--blue)" mono>
          {`${t(BOOT_LABEL.vb)} = ${f1(vb)} V`}
        </T>
        <T x={630} y={34} anchor="start" size={11} color="var(--text)">
          {`${t(BOOT_LABEL.vbus)} = ${BOOT.vbus} V`}
        </T>
        <circle cx="400" cy="200" r="3.5" fill="var(--text)" />
        <T x={392} y={204} anchor="end" size={10} color="var(--muted)">
          {t(BOOT_LABEL.lsDrive)}
        </T>
        <T x={446} y={62} anchor="end" size={10} color="var(--blue)" mono>
          {`${t(BOOT_LABEL.vgs)} = ${f1(hsVgs)} V`}
        </T>
        <T x={446} y={226} anchor="end" size={10} color="var(--blue)" mono>
          {`${t(BOOT_LABEL.vgs)} = ${f1(lsVgs)} V`}
        </T>
        <T x={516} y={80} anchor="start" size={10} color="var(--muted)">
          {t(BOOT_LABEL.hs)}
        </T>
        <T x={516} y={206} anchor="start" size={10} color="var(--muted)">
          {t(BOOT_LABEL.ls)}
        </T>
        <T x={572} y={128} size={11} color="var(--blue)" mono>
          {`${t(BOOT_LABEL.sw)} = ${f1(sw)} V`}
        </T>
        <T x={660} y={185} anchor="start" size={11} color="var(--text)">
          {t(BOOT_LABEL.load)}
        </T>
      </svg>
      <figcaption>{t(BOOT_LABEL.cap)}</figcaption>
    </figure>
  )
}
