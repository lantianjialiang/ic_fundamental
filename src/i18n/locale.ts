export type Locale = 'zh' | 'en'

export type LText = {
  zh: string
  en?: string
}

export const LOCALES: Locale[] = ['zh', 'en']
export const STORAGE_KEY = 'ic-lab-locale'

export function loc(zh: string, en?: string): LText {
  return en === undefined ? { zh } : { zh, en }
}

export function pick(text: LText | string, locale: Locale): string {
  if (typeof text === 'string') return text
  if (locale === 'en' && text.en) return text.en
  return text.zh
}

export function readStoredLocale(): Locale {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'en' || value === 'zh') return value
  } catch {
    /* ignore */
  }
  return 'zh'
}

export function writeStoredLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}
