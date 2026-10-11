import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { Callout, Readout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import {
  CELL_TEXT,
  CHIPS,
  FREQS,
  L,
  QUIZ,
  SPEC,
  SPEC_TEXT,
  TAKEAWAY,
  VOLTS,
  cellKind,
  inSpec,
  isPass,
  type ChipId,
  type ChipModel,
} from './data/content'
import { ShmooGridFig, type Cell } from './ShmooGridFig'
import './shmoo.css'

type Module14PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

/** 从 Shmoo 格子里读出的几个数 */
function summarize(chip: ChipModel) {
  let failsInSpec = 0
  VOLTS.forEach((v) =>
    FREQS.forEach((f) => {
      if (inSpec(v, f) && !isPass(cellKind(chip, v, f))) failsInSpec += 1
    }),
  )
  let fmax = 0
  for (const f of FREQS) {
    if (!isPass(cellKind(chip, SPEC.vMin, f))) break
    fmax = f
  }
  const vmin = VOLTS.find((v) => isPass(cellKind(chip, v, FREQS[0])))
  return { failsInSpec, fmax, margin: fmax - SPEC.fMax, vmin }
}

export function Module14Page({ moduleId, onModuleChange }: Module14PageProps) {
  const { t } = useLocale()
  const [chipId, setChipId] = useState<ChipId>(CHIPS[0].id)
  // 格子的「第一个」是图上左上角：最高电压、最低频率；初始侧栏讲芯片，不高亮格子
  const [cell, setCell] = useState<Cell | null>({ v: VOLTS[VOLTS.length - 1], f: FREQS[0] })
  const [focus, setFocus] = useState<'cell' | 'chip'>('chip')
  const chip = CHIPS.find((c) => c.id === chipId) ?? CHIPS[0]
  const sum = summarize(chip)

  let aside = { kicker: t(L.kickerChip), title: t(chip.label), text: t(chip.text) }
  if (focus === 'cell' && cell) {
    const kind = cellKind(chip, cell.v, cell.f)
    const pass = isPass(kind)
    const spec = inSpec(cell.v, cell.f)
    const specText = spec ? (pass ? SPEC_TEXT.inPass : SPEC_TEXT.inFail) : pass ? SPEC_TEXT.outPass : SPEC_TEXT.outFail
    aside = {
      kicker: t(L.kickerCell),
      title: `${cell.v.toFixed(2)} V · ${cell.f} MHz · ${pass ? 'PASS' : 'FAIL'}`,
      text: `${t(CELL_TEXT[kind])} ${t(specText)}`,
    }
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m14.title)}
      goal={t(ui.m14.goal)}
      kicker={aside.kicker}
      asideTitle={aside.title}
      asideText={aside.text}
      asideLater={t(ui.m14.asideLater)}
      nextId="alu"
      nextLabel={t(ui.m14.next) + t(ui.m15.title)}
    >
      <Section title={t(L.introTitle)}>
        <p>{t(L.introBody)}</p>
      </Section>

      <Section title={t(L.gridTitle)} note={t(L.gridNote)}>
        <div className="m14-chips">
          <Seg
            options={CHIPS.map((c) => ({ id: c.id, label: c.label }))}
            value={chipId}
            onChange={(id) => {
              setChipId(id)
              setFocus('chip')
            }}
          />
        </div>
        <ShmooGridFig
          chip={chip}
          active={focus === 'cell' ? cell : null}
          onPick={(c) => {
            setCell(c)
            setFocus('cell')
          }}
        />
        <Readout
          items={[
            { label: L.rdFails, value: `${sum.failsInSpec} ${t(L.cells)}`, state: sum.failsInSpec > 0 ? 'fail' : 'pass' },
            { label: L.rdFmax, value: `${sum.fmax} MHz` },
            { label: L.rdMargin, value: `${sum.margin >= 0 ? '+' : ''}${sum.margin} MHz`, state: sum.margin >= 100 ? 'pass' : 'fail' },
            { label: L.rdVmin, value: sum.vmin === undefined ? '—' : `${sum.vmin.toFixed(2)} V` },
          ]}
        />
        <Callout tone={chip.id === 'good' ? 'ok' : chip.id === 'marginal' ? 'warn' : 'bad'}>
          <p>{t(chip.text)}</p>
        </Callout>
      </Section>

      <Section title={t(L.yieldTitle)}>
        <p>{t(L.yieldBody)}</p>
      </Section>

      <Section title={t(L.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((line) => (
            <p key={line.zh}>{t(line)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(L.quizTitle)} note={t(L.quizNote)}>
        <QuizList questions={QUIZ} yes={t(L.yes)} no={t(L.no)} />
      </Section>
    </LessonFrame>
  )
}
