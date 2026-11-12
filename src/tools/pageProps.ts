import type { ModuleId } from '../modules/catalog'

export type ToolsPageProps = {
  toolId?: string
  /** 选中一个工具；replace = true 时不新增历史记录 */
  onSelect: (toolId: string | undefined, replace?: boolean) => void
  onHome: () => void
  onOpenLesson: (id: ModuleId) => void
}
