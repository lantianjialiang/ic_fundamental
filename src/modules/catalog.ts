export type ModuleId = 'intro' | 'connection'

export const MODULES: Array<{
  id: ModuleId
  code: string
  title: string
}> = [
  { id: 'intro', code: '01', title: 'What is semiconductor test?' },
  { id: 'connection', code: '02', title: 'How is a DUT connected to an ATE?' },
]
