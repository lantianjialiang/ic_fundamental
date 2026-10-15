import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, PARAMS, S, TAKEAWAY, type ParamId } from './data/mosSelect'
import { f1 } from './data/mosSelectMath'
import { fmtCurrent, logicVerdict } from './data/mosSelectLogic'
import { PARTS, VTH_MARGIN, rdsAt, type PartId } from './data/mosSelectParts'
import { QUIZ } from './data/mosSelectQuiz'
import { MOS_META } from './meta'
import { CapFig, RdsFig } from './SelectFigs2'
import { DatasheetFig } from './SelectFigs'
import { TransferFig, idTransfer } from './SelectFigs3'
import { SelectCases, SelectFlow } from './SelectFlowCases'
import { SelectSoa } from './SelectSoa'
import { SelectThermal } from './SelectThermal'
import { SelectWorksheet } from './SelectWorksheet'
import '../prep/prep.css'
import './mosSelect.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const DRIVES = [3.3, 5, 10]

const LB = {
  margin: loc('Vgs − Vth(max)', 'Vgs − Vth(max)'),
  idTyp: loc('Id（典型 Vth，估）', 'Id (typical Vth, est.)'),
  idMax: loc('Id（最大 Vth，估）', 'Id (max Vth, est.)'),
  partSeg: loc('器件', 'Part'),
  driveSeg: loc('栅极驱动电压', 'Gate drive voltage'),
  transferNote: loc(
    '转移特性和 Id 是按手册最低 Vgs 的 Rds(on) 反推的平方律估算，只用来比较量级，不是手册曲线。',
    'The transfer curve and Id are a square-law estimate back-computed from the datasheet’s lowest-Vgs Rds(on); they compare orders of magnitude only and are not datasheet curves.',
  ),
}

export function MosSelectPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [param, setParam] = useState<ParamId>(PARAMS[0].id)
  const [logicPart, setLogicPart] = useState<PartId>(PARTS[0].id)
  const [drive, setDrive] = useState(DRIVES[0])
  const [note, setNote] = useState<PrepNote | null>(null)

  const paramItem = PARAMS.find((p) => p.id === param) ?? PARAMS[0]
  const shown: PrepNote = note ?? { kicker: S.kickerParam, title: paramItem.title, text: paramItem.text }

  const pickParam = (id: ParamId) => {
    const item = PARAMS.find((p) => p.id === id) ?? PARAMS[0]
    setParam(id)
    setNote({ kicker: S.kickerParam, title: item.title, text: item.text })
  }

  const lpart = PARTS.find((p) => p.id === logicPart) ?? PARTS[0]
  const verdict = logicVerdict(lpart, drive)
  const rd = rdsAt(lpart, drive)
  const margin = drive - lpart.vth.max
  const pickLogic = (partId: PartId, v: number) => {
    const p = PARTS.find((x) => x.id === partId) ?? PARTS[0]
    const vd = logicVerdict(p, v)
    setNote({ kicker: S.kickerLogic, title: vd.title, text: vd.text })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosSelect.title)}
      goal={t(MOS_META.mosSelect.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbIntro"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.paramTitle)} note={t(S.paramNote)}>
        <Seg options={PARAMS.map((p) => ({ id: p.id, label: p.label }))} value={param} onChange={pickParam} />
        <DatasheetFig part={PARTS[0]} active={param} onPick={pickParam} />
        <Callout>
          <p>
            <b>{t(paramItem.title)}</b>
          </p>
          <RefP text={paramItem.detail} onOpen={onModuleChange} />
        </Callout>
        <CapFig />
        <Related ids={['mosDynamic', 'mosSwitch', 'mosReal', 'spec']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.logicTitle)} note={t(S.logicNote)}>
        <Seg
          options={PARTS.map((p) => ({ id: p.id, label: `${p.name} · ${p.pkg}` }))}
          value={logicPart}
          onChange={(id) => {
            setLogicPart(id)
            pickLogic(id, drive)
          }}
        />
        <Seg
          options={DRIVES.map((v) => ({ id: String(v), label: `${v} V` }))}
          value={String(drive)}
          onChange={(id) => {
            setDrive(Number(id))
            pickLogic(logicPart, Number(id))
          }}
        />
        <TransferFig part={lpart} vdrive={drive} />
        <RdsFig part={lpart} vdrive={drive} />
        <Readout
          items={[
            { label: S.part, value: `${lpart.name} · ${lpart.pkg}` },
            { label: S.vth, value: `${lpart.vth.max} V` },
            { label: LB.margin, value: `${f1(margin)} V`, state: margin >= VTH_MARGIN ? 'pass' : 'fail' },
            { label: S.rdsAt, value: rd.ok ? `${rd.spec.mohm} mΩ @ ${rd.spec.vgs} V` : '—', state: rd.ok ? 'pass' : 'fail' },
            { label: LB.idTyp, value: fmtCurrent(idTransfer(lpart, drive, lpart.vth.typ)) },
            { label: LB.idMax, value: fmtCurrent(idTransfer(lpart, drive, lpart.vth.max)) },
            { label: S.verdict, value: t(verdict.title), state: verdict.ok ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={verdict.ok ? 'ok' : 'bad'}>
          <p>
            <b>{t(verdict.title)}</b>
          </p>
          <p>{t(verdict.text)}</p>
          <p>{t(LB.transferNote)}</p>
        </Callout>
        <Related ids={['mosSwitch', 'mosApps', 'dc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.soaTitle)} note={t(S.soaNote)}>
        <SelectSoa onNote={setNote} />
        <Related ids={['mosApps', 'mosReal', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.thermalTitle)} note={t(S.thermalNote)}>
        <SelectThermal onNote={setNote} />
        <Related ids={['mosSwitch', 'mosReal', 'pPackage']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <SelectFlow onOpen={onModuleChange} onNote={setNote} />
        <Related ids={['mosApps', 'spec', 'fSpec']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.caseTitle)} note={t(S.caseNote)}>
        <SelectCases onOpen={onModuleChange} onNote={setNote} />
        <Related ids={['mosReal', 'mosApps', 'mosDynamic', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.capTitle)} note={t(S.capNote)}>
        <SelectWorksheet onOpen={onModuleChange} onNote={setNote} />
        <Related ids={['mosSwitch', 'mosDynamic', 'mosApps', 'dc', 'fSpec']} onOpen={onModuleChange} />
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
