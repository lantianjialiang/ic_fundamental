import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  CONT,
  GROUPS,
  IO,
  QUIZ,
  TAKEAWAY,
  VOH_LIMIT,
  vohAt,
  type GroupId,
  type IoId,
} from './data/content'

type Module06PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'group'; id: GroupId }
  | { kind: 'io'; id: IoId }
  | { kind: 'voh' }
  | { kind: 'takeaway' }

export function Module06Page({ moduleId, onModuleChange }: Module06PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'voh' })
  const [ioh, setIoh] = useState(4)
  const voh = vohAt(ioh)
  const pass = voh >= VOH_LIMIT
  const detail = resolveDetail(focus, t, voh, pass)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m06.title)}
      goal={t(ui.m06.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
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
      </Section>

      <Section title={t(ui.m06.groupsTitle)} note={t(ui.m06.groupsNote)}>
        <div className="pick pick--3">
          {GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'group' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'group', id: item.id })}
            >
              <strong>{t(item.title)}</strong>
              <span>{item.items}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m06.ioTitle)} note={t(ui.m06.ioNote)}>
        <div className="io">
          {IO.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`io__card${focus.kind === 'io' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'io', id: item.id })}
            >
              <strong>{t(item.title)}</strong>
              <span>{item.dir}</span>
              <em>{item.id === 'source' ? '→' : '←'}</em>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m06.vohTitle)} note={t(ui.m06.vohNote)}>
        <div className={`meter${focus.kind === 'voh' ? ' is-active' : ''}`}>
          <label>
            <span>
              {t(ui.m06.ioh)} {ioh.toFixed(1)} mA
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={ioh}
              onChange={(event) => {
                setIoh(Number(event.target.value))
                setFocus({ kind: 'voh' })
              }}
            />
          </label>
          <p>
            {t(ui.m06.voh)} {voh.toFixed(2)} V · {t(ui.m06.limit)} {VOH_LIMIT.toFixed(1)} V ·{' '}
            <b className={pass ? 'is-ok' : 'is-bad'}>{pass ? t(ui.m06.pass) : t(ui.m06.fail)}</b>
          </p>
        </div>
      </Section>

      <Section title={t(ui.m06.contTitle)}>
        <p className="intro__note">{t(CONT)}</p>
      </Section>

      <Section title={t(ui.m06.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m06.quizTitle)} note={t(ui.m06.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m06.yes)} no={t(ui.m06.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(
  focus: Focus,
  t: (text: import('../../i18n/locale').LText | string) => string,
  voh: number,
  pass: boolean,
) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m06.kickerTakeaway), title: t(ui.m06.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'group') {
    const item = GROUPS.find((node) => node.id === focus.id)
    return {
      kicker: t(ui.m06.kickerGroup),
      title: item ? t(item.title) : '',
      text: item ? t(item.text) : '',
    }
  }
  if (focus.kind === 'io') {
    const item = IO.find((node) => node.id === focus.id)
    return {
      kicker: t(ui.m06.kickerIo),
      title: item ? t(item.title) : '',
      text: item ? t(item.text) : '',
    }
  }
  return {
    kicker: t(ui.m06.kickerVoh),
    title: `${t(ui.m06.voh)} ${voh.toFixed(2)} V`,
    text: pass
      ? t(locOk)
      : t(locFail),
  }
}

const locOk = {
  zh: '电流还不大，VOH 仍高于 2.4 V。继续加大 IOH，会看到电压掉过规格。',
}
const locFail = {
  zh: 'IOH 已经把 VOH 拉到规格以下。空载时看起来是 1，带负载就不合格。',
}
