import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { resolveLessonRefs } from '../tracks/catalog'
import { loc, pick, readStoredLocale, writeStoredLocale, type Locale, type LText } from './locale'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (text: LText | string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = pick(loc('IC Test Monk · 半导体测试互动课程', 'IC Test Monk · Interactive semiconductor test lessons'), locale)
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (text) => resolveLessonRefs(pick(text, locale)),
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
