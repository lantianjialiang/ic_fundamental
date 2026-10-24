import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { Knob, Readout, Seg } from '../fund/parts'
import { HvDiagram, KelvinDiagram } from './PwrKelvinFig'
import {
  analyseContact,
  analyseHv,
  ERR_LIMIT_PCT,
  fmtAmp,
  fmtOhmHv,
  type ContactState,
  type HvState,
} from './pwrKelvinModel'
import { GUARD_SEG, IDSS_SEG, MODE_SEG, S } from './pwrKelvinData'

/** 实验的两个标签页；默认取第一个（接触电阻） */
export const LAB_TAB_IDS = ['contact', 'hv'] as const
export type LabTab = (typeof LAB_TAB_IDS)[number]

export const LAB_TAB_SEG: Array<{ id: LabTab; label: LText }> = [
  { id: LAB_TAB_IDS[0], label: S.tabContact },
  { id: LAB_TAB_IDS[1], label: S.tabHv },
]

type Props = {
  tab: LabTab
  onTab: (tab: LabTab) => void
  contact: ContactState
  onContact: (patch: Partial<ContactState>) => void
  hv: HvState
  onHv: (patch: Partial<HvState>) => void
}

/** 绝缘电阻用 10 的幂滑条：R = 10^n Ω */
function ExpKnob({ label, exp, onChange }: { label: LText; exp: number; onChange: (n: number) => void }) {
  const { t } = useLocale()
  return (
    <label>
      <span>
        {t(label)} <b>{`1e${exp} Ω`}</b>
      </span>
      <input type="range" min={9} max={13} step={1} value={exp} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function PwrKelvinLab({ tab, onTab, contact, onContact, hv, onHv }: Props) {
  const { t } = useLocale()
  const ca = analyseContact(contact)
  const ha = analyseHv(hv)

  return (
    <>
      <div className="hs-controls">
        <Seg options={LAB_TAB_SEG} value={tab} onChange={onTab} />
      </div>

      {tab === 'contact' ? (
        <>
          <div className="hs-controls">
            <div className="hs-field">
              <span className="hs-field__label">{t(S.modeLabel)}</span>
              <Seg options={MODE_SEG} value={contact.mode} onChange={(mode) => onContact({ mode })} />
            </div>
            <Knob label={S.iLabel} value={contact.iA} unit="A" min={1} max={100} step={1} onChange={(iA) => onContact({ iA })} />
            <Knob
              label={S.rcLabel}
              value={contact.rcMohm}
              unit="mΩ"
              min={0}
              max={5}
              step={0.05}
              onChange={(rcMohm) => onContact({ rcMohm: Number(rcMohm.toFixed(2)) })}
            />
            <Knob
              label={S.rleadLabel}
              value={contact.rleadMohm}
              unit="mΩ"
              min={0}
              max={5}
              step={0.05}
              onChange={(rleadMohm) => onContact({ rleadMohm: Number(rleadMohm.toFixed(2)) })}
            />
          </div>
          <div className="pwr-grid">
            <KelvinDiagram mode={contact.mode} />
            <div className="hs-cell">
              <Readout
                items={[
                  { label: S.rMeas, value: `${ca.rMeasMohm.toFixed(2)} mΩ` },
                  {
                    label: S.rErr,
                    value: `${ca.errPct.toFixed(1)} %`,
                    state: ca.errPct <= ERR_LIMIT_PCT ? 'pass' : 'fail',
                  },
                  { label: S.r2w, value: `${ca.r2wMohm.toFixed(2)} mΩ` },
                  { label: S.r4w, value: `${ca.r4wMohm.toFixed(2)} mΩ` },
                  { label: S.vMeas, value: `${ca.vMeasMv.toFixed(1)} mV` },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="hs-controls">
            <Knob label={S.vtestLabel} value={hv.vtest} unit="V" min={100} max={1500} step={50} onChange={(vtest) => onHv({ vtest })} />
            <div className="hs-field">
              <ExpKnob label={S.rinsLabel} exp={hv.rinsExp} onChange={(rinsExp) => onHv({ rinsExp })} />
            </div>
            <Knob label={S.rhLabel} value={hv.rh} unit="%RH" min={0} max={100} step={5} onChange={(rh) => onHv({ rh })} />
            <div className="hs-field">
              <span className="hs-field__label">{t(S.guardLabel)}</span>
              <Seg options={GUARD_SEG} value={hv.guard} onChange={(guard) => onHv({ guard })} />
            </div>
            <div className="hs-field">
              <span className="hs-field__label">{t(S.idssLabel)}</span>
              <Seg options={IDSS_SEG} value={String(hv.idssNa)} onChange={(id) => onHv({ idssNa: Number(id) })} />
            </div>
          </div>
          <p className="pwr-note">{t(S.humidityNote)}</p>
          <p className="pwr-note">{t(S.standardNote)}</p>
          <div className="pwr-grid">
            <HvDiagram guard={hv.guard} />
            <div className="hs-cell">
              <Readout
                items={[
                  { label: S.rIMeas, value: fmtAmp(ha.iMeasA) },
                  {
                    label: S.rHvErr,
                    value: `${ha.errPct.toFixed(1)} %`,
                    state: ha.errPct <= ERR_LIMIT_PCT ? 'pass' : 'fail',
                  },
                  { label: S.rIfix, value: fmtAmp(ha.ifixA) },
                  { label: S.rIdss, value: fmtAmp(ha.idssA) },
                  { label: S.rReff, value: fmtOhmHv(ha.rEffOhm) },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
