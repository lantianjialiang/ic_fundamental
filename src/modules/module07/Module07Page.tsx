import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { PATTERN, QUIZ, TAKEAWAY, VECTORS, type VecId } from './data/content'

type Module07PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'vec'; id: VecId } | { kind: 'pattern' } | { kind: 'takeaway' }

export function Module07Page({ moduleId, onModuleChange }: Module07PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'vec', id: '00' })
  const [tamper, setTamper] = useState(false)
  const [pulse, setPulse] = useState<VecId | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    let step = 0
    setPulse(VECTORS[0].id)
    setFocus({ kind: 'vec', id: VECTORS[0].id })
    const timer = window.setInterval(() => {
      step += 1
      if (step >= VECTORS.length) {
        window.clearInterval(timer)
        setPlaying(false)
        setPulse(null)
        return
      }
      const id = VECTORS[step].id
      setPulse(id)
      setFocus({ kind: 'vec', id })
    }, 550)
    return () => window.clearInterval(timer)
  }, [playing])

  const expected = (id: VecId, y: 0 | 1) => (tamper && id === '10' ? (y === 1 ? 0 : 1) : y)
  const fails = VECTORS.filter((row) => expected(row.id, row.y) !== row.y).map((row) => row.id)
  const active = focus.kind === 'vec' ? focus.id : pulse
  const current = VECTORS.find((row) => row.id === active) ?? VECTORS[0]
  const detail = resolveDetail(focus, t, fails)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m07.title)}
      goal={t(ui.m07.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m07.asideLater)}
      nextId="timing"
      nextLabel={t(ui.m07.next)}
    >
      <Section title={t(ui.m07.introTitle)}>
        <p>{t(ui.m07.introBody)}</p>
      </Section>

      <Section title={t(ui.m07.tableTitle)} note={t(ui.m07.tableNote)}>
        <div className="truth">
          <div className="truth__head">
            <span>A</span>
            <span>B</span>
            <span>Y</span>
            <span>{t(ui.m07.compare)}</span>
          </div>
          {VECTORS.map((row) => {
            const exp = expected(row.id, row.y)
            const fail = exp !== row.y
            return (
              <button
                key={row.id}
                type="button"
                className={`truth__row${active === row.id ? ' is-active' : ''}${fail ? ' is-bad' : ''}`}
                onClick={() => setFocus({ kind: 'vec', id: row.id })}
              >
                <span>{row.a}</span>
                <span>{row.b}</span>
                <span>{exp}</span>
                <span>{fail ? t(ui.m07.fail) : t(ui.m07.pass)}</span>
              </button>
            )
          })}
        </div>
        <div className="truth__pins">
          <div className={`pin${active ? ' is-drive' : ''}`}>
            <b>{t(ui.m07.drive)}</b>
            <span>
              A={current.a} B={current.b}
            </span>
          </div>
          <div className={`pin${active ? ' is-cmp' : ''}`}>
            <b>{t(ui.m07.compare)}</b>
            <span>
              Y={current.y} → {expected(current.id, current.y)}
            </span>
          </div>
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={playing}
            onClick={() => setPlaying(true)}
          >
            {playing ? t(ui.m07.running) : t(ui.m07.run)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setTamper((v) => !v)}>
            {tamper ? t(ui.m07.restore) : t(ui.m07.tamper)}
          </button>
          <span>
            {t(ui.m07.result)}{' '}
            <b className={fails.length ? 'is-bad' : 'is-ok'}>
              {fails.length ? `${t(ui.m07.fail)} ${fails.join(', ')}` : t(ui.m07.pass)}
            </b>
          </span>
        </div>
      </Section>

      <Section title={t(ui.m07.patternTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'pattern' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'pattern' })}
        >
          {t(PATTERN)}
        </button>
      </Section>

      <Section title={t(ui.m07.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m07.quizTitle)} note={t(ui.m07.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m07.yes)} no={t(ui.m07.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(
  focus: Focus,
  t: (text: import('../../i18n/locale').LText | string) => string,
  fails: VecId[],
) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m07.kickerTakeaway), title: t(ui.m07.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'pattern') {
    return { kicker: t(ui.m07.kickerPat), title: 'Pattern', text: t(PATTERN) }
  }
  const row = VECTORS.find((item) => item.id === focus.id)
  return {
    kicker: t(ui.m07.kickerVec),
    title: row ? `${row.a}${row.b} → Y` : '',
    text:
      fails.length > 0
        ? t({ zh: `当前期望被改过。失败向量：${fails.join('、')}。对照真值表就能看到是哪一行。` })
        : t({ zh: 'Drive 给出 A/B，Compare 在这一拍看 Y。四行都对就是 Pass。' }),
  }
}
