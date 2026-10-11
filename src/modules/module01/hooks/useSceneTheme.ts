import { useEffect, useState } from 'react'

export type SceneTheme = {
  mode: 'dark' | 'light'
  bg: string
  panel: string
  panel2: string
  line: string
  lineSoft: string
  text: string
  muted: string
  gold: string
}

function readTheme(): SceneTheme {
  const root = document.documentElement
  const cs = getComputedStyle(root)
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  return {
    mode: root.dataset.theme === 'light' ? 'light' : 'dark',
    bg: v('--bg', '#0f1216'),
    panel: v('--panel', '#161b22'),
    panel2: v('--panel-2', '#141920'),
    line: v('--line', '#303844'),
    lineSoft: v('--line-soft', '#242b35'),
    text: v('--text', '#e6edf3'),
    muted: v('--muted', '#8b949e'),
    gold: v('--gold', '#e8c45a'),
  }
}

/** 站点主题不是全局 context，这里监听 <html data-theme> 的变化并读取 CSS 变量 */
export function useSceneTheme(): SceneTheme {
  const [theme, setTheme] = useState<SceneTheme>(readTheme)
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    return () => observer.disconnect()
  }, [])
  return theme
}
