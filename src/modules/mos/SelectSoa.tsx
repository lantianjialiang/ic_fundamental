import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { Callout, Cards, Readout, Seg } from '../fund/parts'
import { type PrepNote } from '../prep/common'
import { S } from './data/mosSelect'
import { PULSES, SCENES, SOA, judge, powerLimit, soaReason, type PulseId } from './data/mosSelectSoa'
import { SoaFig } from './SelectFigs4'

const num = (x: number) => Number(x.toPrecision(2)).toString()

function LogKnob({ label, unit, value, min, max, onChange }: { label: LText; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const { t } = useLocale()
  return (
    <label>
      <span>
        {t(label)} <b>{`${num(value)} ${unit}`}</b>
      </span>
      <input type="range" min={Math.log10(min)} max={Math.log10(max)} step={0.01} value={Math.log10(value)} onChange={(event) => onChange(Math.pow(10, Number(event.target.value)))} />
    </label>
  )
}

export function SelectSoa({ onNote }: { onNote: (note: PrepNote) => void }) {
  const { t } = useLocale()
  const [scene, setScene] = useState<string | null>(SCENES[0].id)
  const [pulse, setPulse] = useState<PulseId>(SCENES[0].tw)
  const [pt, setPt] = useState({ v: SCENES[0].v, i: SCENES[0].i })

  const pulseItem = PULSES.find((p) => p.id === pulse) ?? PULSES[0]
  const why = judge(pt.v, pt.i, pulseItem.tw)
  const ok = why === 'ok'
  const reason = soaReason(why, pt.v, pt.i, pulseItem.label, pulseItem.tw)
  const sceneItem = SCENES.find((s) => s.id === scene)

  const report = (v: number, i: number, p: PulseId) => {
    const item = PULSES.find((x) => x.id === p) ?? PULSES[0]
    const w = judge(v, i, item.tw)
    onNote({ kicker: S.kickerSoa, title: w === 'ok' ? S.inside : S.outside, text: soaReason(w, v, i, item.label, item.tw) })
  }
  const place = (v: number, i: number) => {
    setScene(null)
    setPt({ v, i })
    report(v, i, pulse)
  }

  return (
    <>
      <Cards
        items={SCENES}
        activeId={scene ?? undefined}
        cols={3}
        onPick={(s) => {
          setScene(s.id)
          setPulse(s.tw)
          setPt({ v: s.v, i: s.i })
          onNote({ kicker: S.kickerSoa, title: s.title, text: s.text })
        }}
      />
      <Seg
        options={PULSES.map((p) => ({ id: p.id, label: p.label }))}
        value={pulse}
        onChange={(id) => {
          setPulse(id)
          report(pt.v, pt.i, id)
        }}
      />
      <SoaFig pulse={pulse} v={pt.v} i={pt.i} onPlace={place} />
      <div className="knob-row">
        <LogKnob label={S.vdsKnob} unit="V" value={pt.v} min={SOA.vminAxis} max={SOA.vmaxAxis} onChange={(v) => place(v, pt.i)} />
        <LogKnob label={S.idKnob} unit="A" value={pt.i} min={SOA.iminAxis} max={SOA.imaxAxis} onChange={(i) => place(pt.v, i)} />
      </div>
      <Readout
        items={[
          { label: S.point, value: `${num(pt.v)} V · ${num(pt.i)} A` },
          { label: S.power, value: `${num(pt.v * pt.i)} W` },
          { label: S.limit, value: `${num(powerLimit(pulseItem.tw))} W` },
          { label: S.verdict, value: t(ok ? S.inside : S.outside), state: ok ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={ok ? 'ok' : 'bad'}>
        {sceneItem ? (
          <p>
            <b>{t(sceneItem.title)}</b>
            {' · '}
            {t(sceneItem.text)}
          </p>
        ) : null}
        <p>{t(reason)}</p>
      </Callout>
    </>
  )
}
