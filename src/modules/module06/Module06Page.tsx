import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import { GROUPS, MODES, QUIZ, TAKEAWAY, isPass, outVolt, type Drive, type Mode } from './data/content'
import { OutputStageFig } from './OutputStageFig'
import './module06.css'

type Module06PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module06Page({ moduleId, onModuleChange }: Module06PageProps) {
  const { t } = useLocale()
  const [mode, setMode] = useState<Mode>('voh')
  const [drive, setDrive] = useState<Drive>('good')
  const [ma, setMa] = useState(MODES.voh.specMa)

  const spec = MODES[mode]
  const ron = spec.ron[drive]
  const volt = outVolt(mode, ma, ron)
  const pass = isPass(mode, volt)
  const specVolt = outVolt(mode, spec.specMa, ron)
  const specPass = isPass(mode, specVolt)
  const atSpec = ma === spec.specMa
  const vName = mode === 'voh' ? 'VOH' : 'VOL'
  const iName = mode === 'voh' ? 'IOH' : 'IOL'

  const fill = (text: string) =>
    text
      .replace('{i}', `${iName} = ${spec.specMa} mA`)
      .replace('{v}', `${vName} = ${specVolt.toFixed(2)} V`)
  const asideText = atSpec
    ? fill(t(specPass ? ui.m06.atSpecPass : ui.m06.atSpecFail))
    : fill(t(ui.m06.offSpec))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m06.title)}
      goal={t(ui.m06.goal)}
      kicker={`${vName} @ ${iName}`}
      asideTitle={`${vName} = ${volt.toFixed(2)} V · ${pass ? 'PASS' : 'FAIL'}`}
      asideText={asideText}
      asideLater={t(ui.m06.asideLater)}
      nextId="func"
      nextLabel={t(ui.m06.next)}
      extra={
        <button type="button" className="linkish" onClick={() => onModuleChange('latch')}>
          {t(ui.m06.latchEntry)}
        </button>
      }
    >
      <Section title={t(ui.m06.introTitle)}>
        <p>{t(ui.m06.introBody)}</p>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(ui.m06.colGroup)}</th>
              <th>{t(ui.m06.colItems)}</th>
              <th>{t(ui.m06.colAsk)}</th>
              <th>{t(ui.m06.colHow)}</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((row) => (
              <tr key={row.id}>
                <td>{t(row.group)}</td>
                <td className="mono-cell">{row.items}</td>
                <td>{t(row.ask)}</td>
                <td>{t(row.how)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="intro__note">{t(ui.m06.moreDc)}</p>
      </Section>

      <Section title={t(ui.m06.vohTitle)} note={t(ui.m06.vohNote)}>
        <div className="m06-ctrl">
          <Seg
            options={[
              { id: 'voh' as const, label: ui.m06.modeVoh },
              { id: 'vol' as const, label: ui.m06.modeVol },
            ]}
            value={mode}
            onChange={(next) => {
              setMode(next)
              setMa(MODES[next].specMa)
            }}
          />
          <Seg
            options={[
              { id: 'good' as const, label: ui.m06.driveGood },
              { id: 'weak' as const, label: ui.m06.driveWeak },
            ]}
            value={drive}
            onChange={setDrive}
          />
        </div>
        <div className="knob-row">
          <Knob label={iName} value={ma} unit="mA" min={0} max={12} step={0.5} onChange={setMa} />
        </div>
        <OutputStageFig mode={mode} ma={ma} ron={ron} volt={volt} pass={pass} />
        <Readout
          items={[
            { label: ui.m06.measured, value: `${volt.toFixed(2)} V`, state: pass ? 'pass' : 'fail' },
            { label: ui.m06.limit, value: mode === 'voh' ? `≥ ${spec.limit.toFixed(1)} V` : `≤ ${spec.limit.toFixed(1)} V` },
            {
              label: ui.m06.atSpecLabel,
              value: `${spec.specMa} mA → ${specPass ? 'PASS' : 'FAIL'}`,
              state: specPass ? 'pass' : 'fail',
            },
          ]}
        />
        <Callout tone={atSpec ? (specPass ? 'ok' : 'bad') : 'warn'}>{asideText}</Callout>
      </Section>

      <Section title={t(ui.m06.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m06.quizTitle)} note={t(ui.m06.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m06.yes)} no={t(ui.m06.no)} />
      </Section>
    </LessonFrame>
  )
}
