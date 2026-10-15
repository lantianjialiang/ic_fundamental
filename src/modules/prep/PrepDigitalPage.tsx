import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import { ADDER_TEXT, BITS_TEXT, GATES, INTRO, LEVEL, QUIZ, S, SHIFT_TEXT, TAKEAWAY, evalGate, type GateId } from './data/digital'
import { AdderFig, GateFig, LevelFig, ShiftFig } from './DigitalFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1]

export function PrepDigitalPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0])
  const [gate, setGate] = useState<GateId>(GATES[0].id)
  const [ga, setGa] = useState(0)
  const [gb, setGb] = useState(0)
  const [ha, setHa] = useState(0)
  const [hb, setHb] = useState(0)
  const [din, setDin] = useState(1)
  const [reg, setReg] = useState<number[]>([0, 0, 0, 0])
  const [clocks, setClocks] = useState(0)
  const [vin, setVin] = useState(0.4)
  const [note, setNote] = useState<PrepNote | null>(null)

  const value = bits.reduce((sum, b, i) => sum + b * WEIGHTS[i], 0)
  const gateItem = GATES.find((g) => g.id === gate) ?? GATES[0]
  const single = gate === 'not'
  const rows = single
    ? [
        [0, 0],
        [1, 0],
      ]
    : [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ]
  const levelRead = vin <= LEVEL.vil ? '0' : vin >= LEVEL.vih ? '1' : '?'
  const shown: PrepNote = note ?? { kicker: S.kickerBits, title: S.bitsTitle, text: BITS_TEXT }

  const pickGate = (id: GateId) => {
    setGate(id)
    const item = GATES.find((g) => g.id === id)
    if (item) {
      setNote({ kicker: S.kickerGate, title: { zh: item.name, en: item.name }, text: item.text })
    }
  }

  const clock = () => {
    setReg((prev) => [din, ...prev.slice(0, prev.length - 1)])
    setClocks((n) => n + 1)
    setNote({ kicker: S.kickerShift, title: S.shiftTitle, text: SHIFT_TEXT[0] })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pDigital.title)}
      goal={t(ui.pDigital.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pMeasure"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.bitsTitle)} note={t(S.bitsNote)}>
        <div className="prep-radix">
          <div className="prep-radix__bits">
            {bits.map((b, i) => (
              <button
                key={WEIGHTS[i]}
                type="button"
                className={`prep-bit${b ? ' is-one' : ''}`}
                aria-pressed={b === 1}
                aria-label={`bit ${7 - i} = ${b}`}
                onClick={() => setBits((prev) => prev.map((x, k) => (k === i ? x ^ 1 : x)))}
              >
                {b}
                <small>{WEIGHTS[i]}</small>
              </button>
            ))}
            <button type="button" className="lab__btn" onClick={() => setBits([0, 0, 0, 0, 0, 0, 0, 0])}>
              {t(S.clear)}
            </button>
          </div>
          <Readout
            items={[
              { label: S.bin, value: `${bits.slice(0, 4).join('')} ${bits.slice(4).join('')}` },
              { label: S.dec, value: String(value) },
              { label: S.hex, value: `0x${value.toString(16).toUpperCase().padStart(2, '0')}` },
            ]}
          />
        </div>
        <Callout>
          <p>{t(BITS_TEXT)}</p>
        </Callout>
      </Section>

      <Section title={t(S.gateTitle)} note={t(S.gateNote)}>
        <Seg options={GATES.map((g) => ({ id: g.id, label: g.name }))} value={gate} onChange={pickGate} />
        <GateFig id={gate} a={ga} b={gb} onA={() => setGa((v) => v ^ 1)} onB={() => setGb((v) => v ^ 1)} />
        <div className="prep-gate">
          <table className="prep-truth">
            <thead>
              <tr>
                <th>A</th>
                {single ? null : <th>B</th>}
                <th>Y</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([a, b]) => {
                const on = a === ga && (single || b === gb)
                return (
                  <tr
                    key={`${a}${b}`}
                    className={on ? 'is-active' : undefined}
                    onClick={() => {
                      setGa(a)
                      setGb(b)
                    }}
                  >
                    <td>{a}</td>
                    {single ? null : <td>{b}</td>}
                    <td>{evalGate(gate, a, b)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Callout>
            <p>
              <b>{`${gateItem.name} · ${t(gateItem.rule)}`}</b>
            </p>
            <p>{t(gateItem.text)}</p>
          </Callout>
        </div>
      </Section>

      <Section title={t(S.adderTitle)} note={t(S.adderNote)}>
        <AdderFig a={ha} b={hb} onA={() => setHa((v) => v ^ 1)} onB={() => setHb((v) => v ^ 1)} />
        <Readout
          items={[
            { label: 'A + B', value: `${ha} + ${hb} = ${ha & hb}${ha ^ hb}` },
            { label: 'S', value: String(ha ^ hb) },
            { label: 'C', value: String(ha & hb) },
          ]}
        />
        <Callout>
          <RefP text={ADDER_TEXT} onOpen={onModuleChange} />
        </Callout>
      </Section>

      <Section title={t(S.shiftTitle)} note={t(S.shiftNote)}>
        <ShiftFig din={din} bits={reg} pulse={clocks} onDin={() => setDin((v) => v ^ 1)} />
        <div className="prep-actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={clock}>
            {t(S.clock)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setReg([0, 0, 0, 0])
              setClocks(0)
            }}
          >
            {t(S.reset)}
          </button>
          <span className="prep-muted">{`${t(S.clocks)}: ${clocks}`}</span>
        </div>
        {SHIFT_TEXT.map((p) => (
          <RefP key={p.zh} text={p} onOpen={onModuleChange} />
        ))}
        <Related ids={['scan', 'fScan', 'latch', 'fLatch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.levelTitle)} note={t(S.levelNote)}>
        <div className="knob-row">
          <Knob label={S.vin} value={vin} unit="V" min={0} max={3.3} step={0.05} onChange={setVin} />
        </div>
        <LevelFig v={vin} />
        <Readout items={[{ label: S.reads, value: levelRead === '?' ? t(LEVEL.undefRead) : levelRead, state: levelRead === '?' ? 'fail' : undefined }]} />
        <Callout tone="warn">
          <p>{t(LEVEL.text)}</p>
        </Callout>
        <Related ids={['dc', 'fDc', 'func', 'fBasics', 'mosInverter', 'mosGates']} onOpen={onModuleChange} />
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
