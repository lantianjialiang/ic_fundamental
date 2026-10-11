import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'

export function Copyright() {
  const { t } = useLocale()
  return <p className="lab__copyright">{t(ui.copyright)}</p>
}
