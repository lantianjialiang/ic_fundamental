import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, fmtOhm } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import {
  BENCH,
  BENCH_HEAD,
  BENCH_TEXT,
  HOOKS,
  INTRO,
  KELVIN_TEXT,
  LOAD_TEXT,
  METERS,
  QUIZ,
  R_VALUES,
  S,
  SCOPE_TEXT,
  TAKEAWAY,
  T_DIVS,
  V_DIVS,
  type HookId,
  type KelvinId,
  type MeterId,
} from './data/measure'
import { HookFig, KelvinFig, LoadFig, OhmFig, ScopeFig } from './MeasureFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const KELVIN_MODES: Array<{ id: KelvinId; label: typeof S.two }> = [
  { id: 'two', label: S.two },
  { id: 'four', label: S.four },
]

const fmtR = (r: number) => fmtOhm(r).replace('.0 ', ' ')

export function PrepMeasurePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [vs, setVs] = useState(5)
  const [rIdx, setRIdx] = useState(R_VALUES.indexOf(1000))
  const [hook, setHook] = useState<HookId>(HOOKS[0].id)
  const [meter, setMeter] = useState<MeterId>(METERS[0].id)
  const [kelvin, setKelvin] = useState<KelvinId>(KELVIN_MODES[0].id)
  const [tIdx, setTIdx] = useState(0)
  const [vIdx, setVIdx] = useState(0)
  const [note, setNote] = useState<PrepNote | null>(null)

  const r = R_VALUES[rIdx]
  const i = vs / r
  const p = vs * i
  const hookItem = HOOKS.find((h) => h.id === hook) ?? HOOKS[0]
  const meterItem = METERS.find((m) => m.id === meter) ?? METERS[0]
  const lower = (10e3 * meterItem.rin) / (10e3 + meterItem.rin)
  const reading = (10 * lower) / (10e3 + lower)
  const tdiv = T_DIVS[tIdx]
  const vdiv = V_DIVS[vIdx]
  const shown: PrepNote = note ?? { kicker: S.kickerOhm, title: S.ohmTitle, text: p > 0.25 ? S.powerBad : S.powerOk }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pMeasure.title)}
      goal={t(ui.pMeasure.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="intro"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.ohmTitle)} note={t(S.ohmNote)}>
        <div className="knob-row">
          <Knob label={S.vs} value={vs} unit="V" min={0} max={12} step={0.5} onChange={setVs} />
          <label>
            <span>
              {t(S.r)} <b>{fmtR(r)}</b>
            </span>
            <input type="range" min={0} max={R_VALUES.length - 1} step={1} value={rIdx} onChange={(e) => setRIdx(Number(e.target.value))} />
          </label>
        </div>
        <OhmFig v={vs} r={r} />
        <Readout
          items={[
            { label: S.current, value: i >= 1e-3 || i === 0 ? `${(i * 1e3).toFixed(2)} mA` : `${(i * 1e6).toFixed(0)} µA` },
            { label: S.power, value: p >= 0.1 ? `${p.toFixed(2)} W` : `${(p * 1e3).toFixed(1)} mW`, state: p > 0.25 ? 'fail' : 'pass' },
          ]}
        />
        <Callout tone={p > 0.25 ? 'bad' : 'ok'}>
          <p>{t(p > 0.25 ? S.powerBad : S.powerOk)}</p>
        </Callout>
      </Section>

      <Section title={t(S.hookTitle)} note={t(S.hookNote)}>
        <Seg
          options={HOOKS.map((h) => ({ id: h.id, label: h.label }))}
          value={hook}
          onChange={(id) => {
            setHook(id)
            const item = HOOKS.find((h) => h.id === id)
            if (item) {
              setNote({ kicker: S.kickerHook, title: item.label, text: item.text })
            }
          }}
        />
        <HookFig id={hook} tone={hookItem.tone} />
        <Readout items={[{ label: S.reading, value: t(hookItem.reading), state: hookItem.tone === 'ok' ? 'pass' : 'fail' }]} />
        <Callout tone={hookItem.tone}>
          <p>{t(hookItem.text)}</p>
        </Callout>
      </Section>

      <Section title={t(S.loadTitle)} note={t(S.loadNote)}>
        <Seg
          options={METERS.map((m) => ({ id: m.id, label: m.label }))}
          value={meter}
          onChange={(id) => {
            setMeter(id)
            setNote({ kicker: S.kickerLoad, title: S.loadTitle, text: LOAD_TEXT })
          }}
        />
        <LoadFig rin={meterItem.rin} reading={reading} />
        <Readout
          items={[
            { label: S.ideal, value: '5.000 V' },
            { label: S.measured, value: `${reading.toFixed(3)} V` },
            { label: S.error, value: `${(((5 - reading) / 5) * 100).toFixed(2)} %`, state: reading > 4.95 ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone="warn">
          <p>{t(LOAD_TEXT)}</p>
        </Callout>
      </Section>

      <Section title={t(S.kelvinTitle)} note={t(S.kelvinNote)}>
        <Seg
          options={KELVIN_MODES}
          value={kelvin}
          onChange={(id) => {
            setKelvin(id)
            setNote({ kicker: S.kickerKelvin, title: id === 'two' ? S.two : S.four, text: KELVIN_TEXT[id] })
          }}
        />
        <KelvinFig mode={kelvin} />
        <Callout tone={kelvin === 'four' ? 'ok' : 'bad'}>
          <RefP text={KELVIN_TEXT[kelvin]} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pmu', 'connection', 'fDc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.scopeTitle)} note={t(S.scopeNote)}>
        <div className="prep-actions">
          <span className="prep-muted">{t(S.tdiv)}</span>
          <Seg options={T_DIVS.map((v, k) => ({ id: String(k), label: `${v} ms` }))} value={String(tIdx)} onChange={(id) => setTIdx(Number(id))} />
        </div>
        <div className="prep-actions">
          <span className="prep-muted">{t(S.vdiv)}</span>
          <Seg options={V_DIVS.map((v, k) => ({ id: String(k), label: `${v} V` }))} value={String(vIdx)} onChange={(id) => setVIdx(Number(id))} />
        </div>
        <ScopeFig tdiv={tdiv} vdiv={vdiv} />
        <Readout
          items={[
            { label: S.periodDiv, value: `${(1 / tdiv).toFixed(1)} ${t(S.divs)}` },
            { label: S.highDiv, value: `${(3.3 / vdiv).toFixed(2)} ${t(S.divs)}` },
          ]}
        />
        <Callout>
          <p>{t(SCOPE_TEXT)}</p>
        </Callout>
        <Related ids={['timing', 'fAc', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.benchTitle)}>
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(BENCH_HEAD.bench)}</th>
                <th>{t(BENCH_HEAD.does)}</th>
                <th>{t(BENCH_HEAD.ate)}</th>
              </tr>
            </thead>
            <tbody>
              {BENCH.map((row) => (
                <tr key={row.bench.zh}>
                  <td>{t(row.bench)}</td>
                  <td>{t(row.does)}</td>
                  <td>
                    <b>{t(row.ate)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RefP text={BENCH_TEXT} onOpen={onModuleChange} />
        <Related ids={['ate', 'pmu', 'fIntro', 'bench']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
