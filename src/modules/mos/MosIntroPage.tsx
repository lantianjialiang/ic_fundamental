import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { keyPick, RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, MODES, PKG_LINE, PKGS, S, STYLES, SWITCH, TERMS, TYPES, type ChanMode, type MosType, type PkgId, type SymStyle, type TermId } from './data/mosIntro'
import { INTRO_RD, SYM_FIG } from './data/mosIntroFig'
import { CMP, CMP_HEAD, CMP_LINE, QUIZ, TAKEAWAY, type CmpId } from './data/mosIntroQuiz'
import { TermFig } from './IntroFigs'
import { SymPkgFig } from './IntroFigs2'
import { fmtMa, SwitchFig, solveSwitch } from './IntroFigs3'
import { CmpFig } from './IntroFigs4'
import { MOS_META } from './meta'
import '../prep/prep.css'
import './mosIntro.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const plain = (s: string): LText => loc(s, s)

export function MosIntroPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [vgs, setVgs] = useState(0)
  const [term, setTerm] = useState<TermId>(TERMS[0].id)
  const [type, setType] = useState<MosType>(TYPES[0].id)
  const [style, setStyle] = useState<SymStyle>(STYLES[0].id)
  const [mode, setMode] = useState<ChanMode>(MODES[0].id)
  const [pkg, setPkg] = useState<PkgId>(PKGS[0].id)
  const [cmp, setCmp] = useState<CmpId>(CMP[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const shown: PrepNote = note ?? { kicker: S.kickerSwitch, title: SWITCH.title, text: SWITCH.text }

  const sw = solveSwitch(vgs)
  const termItem = TERMS.find((x) => x.id === term) ?? TERMS[0]
  const typeItem = TYPES.find((x) => x.id === type) ?? TYPES[0]
  const styleItem = STYLES.find((x) => x.id === style) ?? STYLES[0]
  const modeItem = MODES.find((x) => x.id === mode) ?? MODES[0]
  const pkgItem = PKGS.find((x) => x.id === pkg) ?? PKGS[0]
  const cmpItem = CMP.find((x) => x.id === cmp) ?? CMP[0]

  const pickType = (next: MosType) => {
    setType(next)
    const item = TYPES.find((x) => x.id === next)
    if (item) {
      setNote({ kicker: S.kickerSym, title: plain(item.label), text: item.text })
    }
  }
  const pickCmp = (id: CmpId) => {
    setCmp(id)
    const item = CMP.find((x) => x.id === id)
    if (item) {
      setNote({ kicker: S.kickerCmp, title: item.k, text: item.why })
    }
  }

  const partText = mode === 'enh' ? pkgItem.parts[type] : t(SYM_FIG.rare)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosIntro.title)}
      goal={t(MOS_META.mosIntro.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosChannel"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.switchTitle)} note={t(S.switchNote)}>
        <div className="knob-row">
          <Knob
            label={S.vgsKnob}
            value={vgs}
            unit="V"
            min={0}
            max={3.3}
            step={0.1}
            onChange={(v) => {
              setVgs(Math.round(v * 10) / 10)
              setNote(null)
            }}
          />
        </div>
        <SwitchFig vgs={vgs} />
        <Readout
          items={[
            { label: S.state, value: t(sw.on ? S.on : S.off), state: sw.on ? 'pass' : 'fail' },
            { label: 'Id', value: fmtMa(sw.id) },
            { label: INTRO_RD.vout, value: `${sw.vds.toFixed(2)} V` },
          ]}
        />
        <Callout>
          <p>
            <b>{t(SWITCH.title)}</b>
          </p>
          <p>{t(SWITCH.text)}</p>
          <RefP text={SWITCH.why} onOpen={onModuleChange} />
        </Callout>
        <Callout tone="warn">
          <p>{t(SWITCH.notBinary)}</p>
          <p>{t(SWITCH.illustr)}</p>
        </Callout>
        <Related ids={['pParts', 'pDigital', 'mosChannel', 'dc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.termTitle)} note={t(S.termNote)}>
        <TermFig
          term={term}
          onPick={(id) => {
            setTerm(id)
            const item = TERMS.find((x) => x.id === id)
            if (item) {
              setNote({ kicker: S.kickerTerm, title: item.title, text: item.text })
            }
          }}
        />
        <Callout>
          <p>
            <b>{t(termItem.title)}</b>
          </p>
          <p>{t(termItem.text)}</p>
          <RefP text={termItem.link} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pParts', 'mosChannel', 'mosSwitch', 'mosReal']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.symTitle)} note={t(S.symNote)}>
        <Seg
          options={STYLES.map((x) => ({ id: x.id, label: x.label }))}
          value={style}
          onChange={(id) => {
            setStyle(id)
            const item = STYLES.find((x) => x.id === id)
            if (item) {
              setNote({ kicker: S.kickerSym, title: item.label, text: item.text })
            }
          }}
        />
        <Seg
          options={MODES.map((x) => ({ id: x.id, label: x.label }))}
          value={mode}
          onChange={(id) => {
            setMode(id)
            const item = MODES.find((x) => x.id === id)
            if (item) {
              setNote({ kicker: S.kickerSym, title: item.label, text: item.text })
            }
          }}
        />
        <Seg
          options={PKGS.map((x) => ({ id: x.id, label: plain(x.name) }))}
          value={pkg}
          onChange={(id) => {
            setPkg(id)
            const item = PKGS.find((x) => x.id === id)
            if (item) {
              setNote({ kicker: S.kickerSym, title: plain(item.name), text: item.text })
            }
          }}
        />
        <SymPkgFig type={type} style={style} mode={mode} pkg={pkg} onToggle={() => pickType(type === 'n' ? 'p' : 'n')} />
        <Readout
          items={[
            { label: INTRO_RD.kind, value: typeItem.label },
            { label: INTRO_RD.style, value: style === 'three' ? '3' : '4' },
            { label: INTRO_RD.part, value: partText },
            { label: INTRO_RD.pins, value: pkgItem.pins.map((p, k) => `${k + 1} ${p}`).join(' · ') },
          ]}
        />
        <Callout>
          <p>
            <b>{typeItem.label}</b> · {t(typeItem.text)}
          </p>
          <p>
            <b>{t(styleItem.label)}</b> · {t(styleItem.text)}
          </p>
          <p>
            <b>{t(modeItem.label)}</b> · {t(modeItem.text)}
          </p>
          <p>
            <b>{pkgItem.name}</b> · {t(pkgItem.text)}
          </p>
          <RefP text={PKG_LINE} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pParts', 'pPackage', 'mosSelect']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.cmpTitle)} note={t(S.cmpNote)}>
        <CmpFig />
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(CMP_HEAD.item)}</th>
                <th>{t(CMP_HEAD.bjt)}</th>
                <th>{t(CMP_HEAD.mos)}</th>
              </tr>
            </thead>
            <tbody>
              {CMP.map((row) => (
                <tr
                  key={row.id}
                  className={`mosIntro-row${cmp === row.id ? ' is-active' : ''}`}
                  tabIndex={0}
                  aria-current={cmp === row.id}
                  onClick={() => pickCmp(row.id)}
                  onKeyDown={keyPick(() => pickCmp(row.id))}
                >
                  <td>
                    <b>{t(row.k)}</b>
                  </td>
                  <td>{t(row.bjt)}</td>
                  <td>{t(row.mos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout>
          <p>
            <b>{t(cmpItem.k)}</b>
          </p>
          <p>{t(cmpItem.why)}</p>
        </Callout>
        <Callout tone="warn">
          <RefP text={CMP_LINE} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pParts', 'mosDynamic', 'mosInverter', 'mosRegion']} onOpen={onModuleChange} />
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
