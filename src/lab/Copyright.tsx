import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { FEEDBACK_TEXT, FeedbackLinks } from './Feedback'

/** page：当前页面名，会带进反馈的标题和正文 */
export function Copyright({ page }: { page?: string }) {
  const { t } = useLocale()
  return (
    <p className="lab__copyright">
      {t(ui.copyright)}
      <span className="fb-report">
        <span className="fb-report__label">
          · {t(FEEDBACK_TEXT.report)}
          {t(FEEDBACK_TEXT.sep)}
        </span>
        <FeedbackLinks page={page ?? t(ui.labName)} compact />
      </span>
    </p>
  )
}
