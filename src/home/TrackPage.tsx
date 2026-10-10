import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { type ModuleId } from '../modules/catalog'
import { LESSON_TITLE } from '../modules/titles'
import { type TrackId, lessonCode, trackById } from '../tracks/catalog'
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
              {track.lessons.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="home__lesson"
                  onClick={() => onOpenLesson(id)}
                >
                  <span>{lessonCode(id)}</span>
                  <strong>{t(LESSON_TITLE[id])}</strong>
                </button>
              ))}
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
