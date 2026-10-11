import { Fragment } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { TRACKS, type TrackId } from '../tracks/catalog'
import { AppChrome } from './AppChrome'
import { HOME_EXTRA } from './text'

type HomePageProps = {
  onOpenTrack: (id: TrackId) => void
}

export function HomePage({ onOpenTrack }: HomePageProps) {
  const { t } = useLocale()
  const groups = [
    { title: ui.home.readyGroup, tracks: TRACKS.filter((item) => item.ready) },
    { title: ui.home.pendingGroup, tracks: TRACKS.filter((item) => !item.ready) },
  ]

  return (
    <AppChrome title={t(ui.home.title)} goal={t(ui.home.goal)}>
      <section className="intro__section">
        <h2>{t(ui.home.introTitle)}</h2>
        <p>{t(ui.home.introBody)}</p>
        <div className="home__spine">
          {ui.home.spineSteps.map((step, index) => (
            <Fragment key={step}>
              {index > 0 ? <i>→</i> : null}
              <span>{step}</span>
            </Fragment>
          ))}
        </div>
      </section>
      {groups.map((group) => (
        <section key={group.title.zh} className="intro__section">
          <p className="home__group">{t(group.title)}</p>
          <div className="home__grid">
            {group.tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`home__card${track.ready ? ' is-ready' : ''}`}
                onClick={() => onOpenTrack(track.id)}
              >
                <span className="home__card-top">
                  <strong>{t(track.title)}</strong>
                  <span className={`home__badge${track.ready ? ' is-ready' : ''}`}>
                    {track.page ? t(HOME_EXTRA.reference) : track.ready ? t(ui.home.ready) : t(ui.home.pending)}
                  </span>
                </span>
                <p>{t(track.blurb)}</p>
                {track.page ? (
                  <span className="home__card-foot">
                    {t(track.page === 'glossary' ? HOME_EXTRA.openGlossary : HOME_EXTRA.openFaq)}
                  </span>
                ) : track.ready ? (
                  <span className="home__card-foot">
                    {track.lessons.length} {t(ui.home.lessonCount)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      ))}
    </AppChrome>
  )
}
