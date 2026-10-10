import { createContext, useContext, type ReactNode } from 'react'
import { type ModuleId } from '../modules/catalog'
import { type TrackId } from '../tracks/catalog'

export type LabNavValue = {
  goHome: () => void
  goTrack: () => void
  track: TrackId
  navIds: ModuleId[]
  openLesson: (id: ModuleId) => void
}

const LabNavContext = createContext<LabNavValue | null>(null)

export function LabNavProvider({
  value,
  children,
}: {
  value: LabNavValue
  children: ReactNode
}) {
  return <LabNavContext.Provider value={value}>{children}</LabNavContext.Provider>
}

export function useLabNav(): LabNavValue | null {
  return useContext(LabNavContext)
}
