import { useLocale } from '../../i18n/LocaleContext'
import { type StepPlayerState } from '../../lab/StepPlayer'
import { COLOR } from './FabFigs'
import { FRAMES } from './data/pcbFabModel'
import { MATERIALS, S, SHORT, STEPS } from './data/pcbFab'

export function FabTimeline({ active, onPick }: { active: number; onPick: (stepIndex: number) => void }) {
  const { t } = useLocale()
  return (
    <ol className="pcbFab-timeline" aria-label={t(S.timeline)}>
      {STEPS.map((step, i) => (
        <li key={step.id}>
          <button
            type="button"
            className={`${i === active ? 'is-active' : ''}${i < active ? ' is-done' : ''}`}
            aria-current={i === active ? 'step' : undefined}
            title={t(step.title)}
            onClick={() => onPick(i)}
          >
            <b>{i + 1}</b>
            {t(SHORT[step.id])}
          </button>
        </li>
      ))}
    </ol>
  )
}

export function FabControls({ player, onUse }: { player: StepPlayerState; onUse: () => void }) {
  const { t } = useLocale()
  const run = (fn: () => void) => () => {
    onUse()
    fn()
  }
  return (
    <div className="pcbFab-controls">
      <button type="button" className="lab__btn" disabled={player.step === 0} onClick={run(() => player.goTo(player.step - 1))}>
        {t(S.prev)}
      </button>
      <button type="button" className="lab__btn lab__btn--primary" disabled={player.atEnd} onClick={run(player.next)}>
        {t(S.next)}
      </button>
      <button type="button" className="lab__btn" onClick={run(player.toggle)}>
        {t(player.playing ? S.pause : S.play)}
      </button>
      <button type="button" className="lab__btn" onClick={run(player.reset)}>
        {t(S.reset)}
      </button>
      <input
        type="range"
        min={0}
        max={FRAMES.length - 1}
        step={1}
        value={player.step}
        aria-label={t(S.scrub)}
        onChange={(event) => {
          onUse()
          player.goTo(Number(event.target.value))
        }}
      />
      <span className="pcbFab-controls__pos">{`${player.step + 1} / ${FRAMES.length}`}</span>
    </div>
  )
}

const SWATCH: Record<string, string> = {
  cu: COLOR.cu,
  core: COLOR.core,
  pp: COLOR.pp,
  film: COLOR.film,
  sn: COLOR.sn,
  mask: COLOR.mask,
  ink: COLOR.ink,
  ni: COLOR.ni,
  au: COLOR.au,
}

export function FabLegend() {
  const { t } = useLocale()
  return (
    <ul className="pcbFab-legend">
      {MATERIALS.map((m) => (
        <li key={m.id}>
          <i style={{ background: SWATCH[m.id] }} />
          {t(m.label)}
        </li>
      ))}
    </ul>
  )
}
