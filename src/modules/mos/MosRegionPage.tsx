import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg, fmtOhm } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, PRESETS, REGIONS, S, TAKEAWAY, VOV_TEXT } from './data/mosRegion'
import { FORMULAS, SMALL_VDS, type FormulaId } from './data/mosRegionFormula'
import { QUIZ } from './data/mosRegionQuiz'
import { MOS_META } from './meta'
import { KN, LAMBDA, VTN, nId, nRegion, rOn } from './model'
import { CrossFig, fmtId, regionName } from './RegionFigs'
import { OutputFig, TransferFig } from './RegionFigs2'
import { FlowFig } from './RegionFigs3'
import './mosRegion.css'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round2 = (v: number) => Math.round(v * 100) / 100

/** 公式值（A）和当前偏置是否落在公式适用范围内 */
function formulaCheck(id: FormulaId, vgs: number, vds: number) {
  const vov = Math.max(vgs - VTN, 0)
  const region = nRegion(vgs, vds)
  if (id === 'cutoff') {
    return { value: 0, applies: region === 'cutoff' }
  }
  if (id === 'linear') {
    return { value: KN * vov * vds, applies: region === 'linear' && vds <= SMALL_VDS * vov }
  }
  if (id === 'sat') {
    return { value: (KN / 2) * vov * vov * (1 + LAMBDA * vds), applies: region === 'sat' }
  }
  return { value: (KN / 2) * vds * vds * (1 + LAMBDA * vds), applies: vov > 0 && Math.abs(vds - vov) < 0.05 }
}

export function MosRegionPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [vgs, setVgs] = useState(PRESETS[0].vgs)
  const [vds, setVds] = useState(PRESETS[0].vds)
  const [formulaId, setFormulaId] = useState<FormulaId>(FORMULAS[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const region = nRegion(vgs, vds)
  const item = REGIONS.find((r) => r.id === region) ?? REGIONS[0]
  const shown: PrepNote = note ?? { kicker: S.kickerRegion, title: item.title, text: item.text }

  const vov = vgs - VTN
  const id = nId(vgs, vds)
  const linear = region === 'linear'
  const formula = FORMULAS.find((f) => f.id === formulaId) ?? FORMULAS[0]
  const check = formulaCheck(formula.id, vgs, vds)

  const setBias = (nextVgs: number, nextVds: number) => {
    setVgs(round2(nextVgs))
    setVds(round2(nextVds))
    setNote(null)
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosRegion.title)}
      goal={t(MOS_META.mosRegion.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosSwitch"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Seg
          options={REGIONS.map((r) => ({ id: r.id, label: r.name }))}
          value={region}
          onChange={(rid) => {
            const preset = PRESETS.find((p) => p.id === rid) ?? PRESETS[0]
            setBias(preset.vgs, preset.vds)
          }}
        />
        <div className="knob-row">
          <Knob label={S.vgs} value={vgs} unit="V" min={0} max={3.3} step={0.05} onChange={(v) => setBias(v, vds)} />
          <Knob label={S.vds} value={vds} unit="V" min={0} max={3.3} step={0.05} onChange={(v) => setBias(vgs, v)} />
        </div>
        <div className="mosRegion-grid">
          <CrossFig vgs={vgs} vds={vds} />
          <OutputFig vgs={vgs} vds={vds} />
          <TransferFig vgs={vgs} vds={vds} />
          <div className="mosRegion-cell">
            <Readout
              items={[
                { label: S.rVov, value: `${vov.toFixed(2)} V` },
                { label: S.rRegion, value: t(item.name) },
                { label: S.rId, value: fmtId(id) },
                { label: S.rReq, value: linear ? fmtOhm(rOn(vgs)) : t(S.noValue) },
                { label: S.rRds, value: linear && vds > 0 ? fmtOhm(vds / id) : t(S.noValue) },
              ]}
            />
            <Callout tone={item.tone}>
              <p>
                <b>{t(item.title)}</b> · {t(item.cond)}
              </p>
              <RefP text={item.detail} onOpen={onModuleChange} />
            </Callout>
          </div>
        </div>
        <Related ids={['mosChannel', 'pParts', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <FlowFig vgs={vgs} vds={vds} />
        <Readout
          items={[
            { label: S.step1, value: `${vgs.toFixed(2)} − ${VTN} = ${vov.toFixed(2)} V` },
            { label: S.step2, value: region === 'cutoff' ? '—' : `${vds.toFixed(2)} ${region === 'linear' ? '<' : '≥'} ${vov.toFixed(2)}` },
            { label: S.rRegion, value: t(regionName(region)) },
          ]}
        />
        <Callout>
          {VOV_TEXT.map((para) => (
            <RefP key={para.zh} text={para} onOpen={onModuleChange} />
          ))}
          {region === 'cutoff' ? <p>{t(S.step2Skip)}</p> : null}
        </Callout>
        <Related ids={['mosChannel', 'dc', 'fDc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.formulaTitle)} note={t(S.formulaNote)}>
        <Cards
          cols={4}
          items={FORMULAS}
          activeId={formulaId}
          onPick={(f) => {
            setFormulaId(f.id)
            setNote({ kicker: S.kickerFormula, title: f.title, text: f.formula })
          }}
        />
        <Callout tone="ok">
          <p>
            <b>{t(formula.title)}</b> · {t(formula.sub)}
          </p>
          <p>{t(formula.formula)}</p>
          <p>{t(formula.why)}</p>
        </Callout>
        <Readout
          items={[
            { label: S.fValue, value: fmtId(check.value) },
            { label: S.fModel, value: fmtId(id) },
            { label: S.fApplies, value: t(check.applies ? S.fYes : S.fNo), state: check.applies ? 'pass' : 'fail' },
          ]}
        />
        <Related ids={['mosSwitch', 'mosInverter', 'pParts', 'fDc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          <RefParas paras={TAKEAWAY} onOpen={onModuleChange} />
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
