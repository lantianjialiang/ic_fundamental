import type { MouseEvent } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { loc, pick, type Locale, type LText } from '../i18n/locale'
import { SITE } from '../site'
import { readStoredTheme } from '../theme'
import './feedback.css'

export const FEEDBACK_TEXT = {
  report: loc('反馈问题', 'Report a problem'),
  pageIssue: loc('这一页有问题？反馈', 'Something wrong on this page? Report it'),
  github: loc('在 GitHub 提 Issue', 'Open a GitHub issue'),
  githubShort: loc('GitHub', 'GitHub'),
  githubAria: loc('在 GitHub 提 Issue（新窗口打开）', 'Open a GitHub issue (opens in a new window)'),
  email: loc('发邮件', 'Send an email'),
  emailShort: loc('邮件', 'Email'),
  emailAria: loc('用邮件反馈问题', 'Report the problem by email'),
  sep: loc('：', ': '),
  // 下面是自动填进 Issue / 邮件正文的模板
  descTitle: loc('## 问题描述', '## What is wrong'),
  descHint: loc('（哪一段、哪张图、哪道题，看到了什么）', '(Which paragraph, figure or question, and what you saw)'),
  expectTitle: loc('## 期望', '## What you expected'),
  expectHint: loc('（你认为应该是什么样）', '(What you think it should be)'),
  envTitle: loc('## 环境（自动填写）', '## Environment (filled in automatically)'),
  page: loc('页面', 'Page'),
  url: loc('地址', 'URL'),
  lang: loc('语言', 'Language'),
  theme: loc('主题', 'Theme'),
  browser: loc('浏览器', 'Browser'),
  langZh: loc('中文', 'Chinese'),
  langEn: loc('英文', 'English'),
  themeDark: loc('深色', 'Dark'),
  themeLight: loc('浅色', 'Light'),
}

/** GitHub 的 issue 新建地址太长会被拒，留出余量 */
const MAX_ISSUE_URL = 6000

function shortUA(): string {
  const ua = navigator.userAgent
  const hit = (re: RegExp) => re.exec(ua)?.[1]
  const browser =
    (hit(/Edg\/(\d+)/) && `Edge ${hit(/Edg\/(\d+)/)}`) ||
    (hit(/Firefox\/(\d+)/) && `Firefox ${hit(/Firefox\/(\d+)/)}`) ||
    (hit(/Chrome\/(\d+)/) && `Chrome ${hit(/Chrome\/(\d+)/)}`) ||
    (hit(/Version\/(\d+)[\d.]* .*Safari/) && `Safari ${hit(/Version\/(\d+)[\d.]* .*Safari/)}`) ||
    'Unknown'
  const os = /Windows NT/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(ua)
        ? 'iOS'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Other'
  return `${browser} / ${os} · ${window.innerWidth}×${window.innerHeight}`
}

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

type BuildArgs = { page: string; prefix: string; locale: Locale }

function compose({ page, prefix, locale }: BuildArgs, pageMax: number, urlMax: number) {
  const p = (text: LText) => pick(text, locale)
  const theme = (document.documentElement.dataset.theme ?? readStoredTheme()) === 'light' ? p(FEEDBACK_TEXT.themeLight) : p(FEEDBACK_TEXT.themeDark)
  const shownPage = clip(page, pageMax)
  const title = `${prefix} ${shownPage}`
  const body = [
    p(FEEDBACK_TEXT.descTitle),
    p(FEEDBACK_TEXT.descHint),
    '',
    p(FEEDBACK_TEXT.expectTitle),
    p(FEEDBACK_TEXT.expectHint),
    '',
    p(FEEDBACK_TEXT.envTitle),
    `- ${p(FEEDBACK_TEXT.page)}${p(FEEDBACK_TEXT.sep)}${shownPage}`,
    `- ${p(FEEDBACK_TEXT.url)}${p(FEEDBACK_TEXT.sep)}${clip(window.location.href, urlMax)}`,
    `- ${p(FEEDBACK_TEXT.lang)}${p(FEEDBACK_TEXT.sep)}${locale === 'zh' ? p(FEEDBACK_TEXT.langZh) : p(FEEDBACK_TEXT.langEn)}`,
    `- ${p(FEEDBACK_TEXT.theme)}${p(FEEDBACK_TEXT.sep)}${theme}`,
    `- ${p(FEEDBACK_TEXT.browser)}${p(FEEDBACK_TEXT.sep)}${shortUA()}`,
  ].join('\n')
  return { title, body }
}

/** 生成 GitHub Issue 和 mailto 两个地址；标题、正文都已做 URL 编码 */
export function feedbackLinks(args: BuildArgs) {
  let issue = ''
  let parts = { title: '', body: '' }
  for (const [pageMax, urlMax] of [
    [200, 2000],
    [80, 400],
    [40, 120],
  ]) {
    parts = compose(args, pageMax, urlMax)
    issue = `${SITE.repoUrl}/issues/new?title=${encodeURIComponent(parts.title)}&body=${encodeURIComponent(parts.body)}`
    if (issue.length <= MAX_ISSUE_URL) break
  }
  if (issue.length > MAX_ISSUE_URL) {
    issue = `${SITE.repoUrl}/issues/new?title=${encodeURIComponent(parts.title)}`
  }
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(parts.title)}&body=${encodeURIComponent(parts.body.replace(/\n/g, '\r\n'))}`
  return { issue, mail }
}

type FeedbackLinksProps = {
  /** 当前页面的名字，例如「D04 · 为什么测试不只是 0 和 1」 */
  page: string
  /** 标题前缀，默认 [Feedback]；FAQ 里用 [Question] */
  prefix?: string
  /** compact：版权行里的短写法 */
  compact?: boolean
  className?: string
}

export function FeedbackLinks({ page, prefix = '[Feedback]', compact = false, className = '' }: FeedbackLinksProps) {
  const { locale, t } = useLocale()
  const links = feedbackLinks({ page, prefix, locale })

  /** 点击时再算一次：主题、地址、窗口大小可能在渲染之后变了 */
  const refresh = (kind: 'issue' | 'mail') => (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = feedbackLinks({ page, prefix, locale })[kind]
  }

  return (
    <span className={`fb-links${compact ? ' fb-links--compact' : ''} ${className}`.trim()}>
      <a
        className="fb-link"
        href={links.issue}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t(FEEDBACK_TEXT.githubAria)}
        onClick={refresh('issue')}
      >
        {t(compact ? FEEDBACK_TEXT.githubShort : FEEDBACK_TEXT.github)}
      </a>
      <a className="fb-link" href={links.mail} aria-label={t(FEEDBACK_TEXT.emailAria)} onClick={refresh('mail')}>
        {t(compact ? FEEDBACK_TEXT.emailShort : FEEDBACK_TEXT.email)}
      </a>
    </span>
  )
}

/** 课程侧栏底部的小入口 */
export function PageFeedback({ page }: { page: string }) {
  const { t } = useLocale()
  return (
    <div className="fb-aside">
      <p className="fb-aside__ai">{t(ui.aiDisclaimer)}</p>
      <p className="fb-aside__title">{t(FEEDBACK_TEXT.pageIssue)}</p>
      <FeedbackLinks page={page} />
    </div>
  )
}
