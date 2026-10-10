import { useLocale } from '../i18n/LocaleContext'
import { type LText } from '../i18n/locale'
import { ui } from '../i18n/ui'
import { MODULES, type ModuleId } from '../modules/catalog'
import { type TrackId, trackById } from '../tracks/catalog'
import { AppChrome } from './AppChrome'

type TrackPageProps = {
  trackId: TrackId
  onHome: () => void
  onOpenLesson: (id: ModuleId) => void
}

export function TrackPage({ trackId, onHome, onOpenLesson }: TrackPageProps) {
  const { t } = useLocale()
  const track = trackById(trackId)
  if (!track) return null

  return (
    <AppChrome title={t(track.title)} goal={t(track.blurb)} onHome={onHome}>
      <div className="track-split">
        <section className="intro__section">
          <h2>{t(ui.home.knowledgeTitle)}</h2>
          <div className="home__know">
            {track.knowledge.map((item) => (
              <article key={item.title.zh} className="home__know-item">
                <strong>{t(item.title)}</strong>
                <p>{t(item.text)}</p>
              </article>
            ))}
          </div>
        </section>

        {track.lessons.length > 0 ? (
          <section className="intro__section">
            <h2>{t(ui.home.lessonsTitle)}</h2>
            <div className="home__lessons">
              {track.lessons.map((id) => {
                const lesson = MODULES.find((item) => item.id === id)
                if (!lesson) return null
                return (
                  <button
                    key={id}
                    type="button"
                    className="home__lesson"
                    onClick={() => onOpenLesson(id)}
                  >
                    <span>M{lesson.code}</span>
                    <strong>{shortTitle(t(LESSON_TITLE[id]))}</strong>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="intro__section">
            <h2>{t(ui.home.lessonsTitle)}</h2>
            <p className="home__pending">{t(ui.home.pending)}</p>
          </section>
        )}
      </div>
    </AppChrome>
  )
}

function shortTitle(title: string) {
  return title.replace(/^(第\s*\d+\s*课|Module\s*\d+)\s*[—-]\s*/, '')
}

const LESSON_TITLE: Record<ModuleId, LText> = {
  intro: ui.m01.title,
  connection: ui.m02.title,
  ate: ui.m03.title,
  pmu: ui.m04.title,
  spec: ui.m05.title,
  dc: ui.m06.title,
  func: ui.m07.title,
  timing: ui.m08.title,
  ac: ui.m09.title,
  vector: ui.m10.title,
  scan: ui.m11.title,
  program: ui.m12.title,
  debug: ui.m13.title,
  shmoo: ui.m14.title,
  alu: ui.m15.title,
  latch: ui.m16.title,
  bench: ui.m17.title,
  fSpec: ui.m18.title,
  fOpens: ui.m19.title,
  fDc: ui.m20.title,
  fFunc: ui.m21.title,
  fAc: ui.m22.title,
}
