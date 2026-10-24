import { useLocale } from '../../i18n/LocaleContext'
import { Knob, Readout } from '../fund/parts'
import { ScopeView, type ScopeTrace } from './ScopeView'
import { GateDiagram } from './PwrGateFig'
import { fill } from './pwrKelvinModel'
import { guessOk, S } from './pwrGateData'
import { analyseGate, type GateState } from './pwrGateModel'

type Props = {
  gate: GateState
  onGate: (patch: Partial<GateState>) => void
  guess: string
  onGuess: (value: string) => void
}

const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

/** 恒流充电实验：左侧示意图，右侧示波器与读数；参数改动后实时重算 */
export function PwrGateLab({ gate, onGate, guess, onGuess }: Props) {
  const { t } = useLocale()
  const a = analyseGate(gate)
  const traces: ScopeTrace[] = [
    { id: 'vgs', label: S.vgsTrace, color: GOLD, values: a.curve.vgs },
    { id: 'vds', label: S.vdsTrace, color: BLUE, values: a.curve.vds },
  ]
  const summary = t(
    fill(S.scopeSummary, {
      v: a.vplat.toFixed(1),
      t: a.tPlUs.toFixed(2),
    }),
  )
  const guessMsg =
    guess.trim() === '' ? t(S.guessEmpty) : guessOk(guess, a.qgd) ? t(S.guessOkMsg) : t(S.guessNoMsg)

  return (
    <>
      <div className="hs-controls">
        <Knob label={S.igLabel} value={gate.igMa} unit="mA" min={1} max={50} step={1} onChange={(igMa) => onGate({ igMa })} />
        <Knob label={S.vddLabel} value={gate.vdd} unit="V" min={10} max={100} step={5} onChange={(vdd) => onGate({ vdd })} />
        <Knob
          label={S.cgsLabel}
          value={gate.cgsNf}
          unit="nF"
          min={1}
          max={5}
          step={0.1}
          onChange={(cgsNf) => onGate({ cgsNf: Number(cgsNf.toFixed(2)) })}
        />
        <Knob
          label={S.cgd0Label}
          value={gate.cgd0Nf}
          unit="nF"
          min={0.2}
          max={2}
          step={0.05}
          onChange={(cgd0Nf) => onGate({ cgd0Nf: Number(cgd0Nf.toFixed(2)) })}
        />
        <Knob
          label={S.vthLabel}
          value={gate.vth}
          unit="V"
          min={2}
          max={4}
          step={0.1}
          onChange={(vth) => onGate({ vth: Number(vth.toFixed(1)) })}
        />
        <Knob label={S.vdriveLabel} value={gate.vdrive} unit="V" min={8} max={15} step={1} onChange={(vdrive) => onGate({ vdrive })} />
        <Knob label={S.fswLabel} value={gate.fswKhz} unit="kHz" min={100} max={1000} step={50} onChange={(fswKhz) => onGate({ fswKhz })} />
      </div>
      <p className="pwr-note">{t(S.teachNote)}</p>
      <p className="pwr-note">{t(S.standardNote)}</p>
      <div className="pwr-grid">
        <GateDiagram />
        <div className="hs-cell">
          <ScopeView
            t={a.curve.t}
            tUnit="µs"
            traces={traces}
            shade={{ from: a.tPlStartUs, to: a.tPlEndUs, label: S.plateauLabel }}
            summary={summary}
            ariaLabel={t(S.scopeAria)}
          />
          <Readout
            items={[
              { label: S.rQgs, value: `${a.qgs.toFixed(1)} nC` },
              { label: S.rQgd, value: `${a.qgd.toFixed(1)} nC` },
              { label: S.rQg, value: `${a.qg.toFixed(1)} nC` },
              { label: S.rVplat, value: `${a.vplat.toFixed(1)} V` },
              { label: S.rTpl, value: `${a.tPlUs.toFixed(2)} µs` },
              { label: S.rPdrive, value: `${a.pDriveW.toFixed(3)} W` },
            ]}
          />
          <label className="pwr-guess">
            <span>{t(S.guessLabel)}</span>
            <input type="number" step={0.1} min={0} value={guess} onChange={(event) => onGuess(event.target.value)} />
            <span className="pwr-note">{guessMsg}</span>
          </label>
        </div>
      </div>
    </>
  )
}
