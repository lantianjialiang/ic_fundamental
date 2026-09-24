import { useState, type ComponentType } from 'react'
import { Module00Page } from './modules/module00/Module00Page'
import { Module01Page } from './modules/module01/Module01Page'
import { Module03Page } from './modules/module03/Module03Page'
import { Module04Page } from './modules/module04/Module04Page'
import { Module05Page } from './modules/module05/Module05Page'
import { Module06Page } from './modules/module06/Module06Page'
import { Module07Page } from './modules/module07/Module07Page'
import { Module08Page } from './modules/module08/Module08Page'
import { Module09Page } from './modules/module09/Module09Page'
import { Module10Page } from './modules/module10/Module10Page'
import { Module11Page } from './modules/module11/Module11Page'
import { Module12Page } from './modules/module12/Module12Page'
import { Module13Page } from './modules/module13/Module13Page'
import { Module14Page } from './modules/module14/Module14Page'
import { Module15Page } from './modules/module15/Module15Page'
import { Module16Page } from './modules/module16/Module16Page'
import { type ModuleId } from './modules/catalog'

type LessonProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

const LESSONS: Partial<Record<ModuleId, ComponentType<LessonProps>>> = {
  ate: Module03Page,
  pmu: Module04Page,
  spec: Module05Page,
  dc: Module06Page,
  func: Module07Page,
  timing: Module08Page,
  ac: Module09Page,
  vector: Module10Page,
  scan: Module11Page,
  program: Module12Page,
  debug: Module13Page,
  shmoo: Module14Page,
  alu: Module15Page,
  latch: Module16Page,
}

export default function App() {
  const [moduleId, setModuleId] = useState<ModuleId>('intro')

  if (moduleId === 'intro') {
    return (
      <Module00Page
        moduleId={moduleId}
        onModuleChange={setModuleId}
        onOpenConnection={() => setModuleId('connection')}
      />
    )
  }

  const Lesson = LESSONS[moduleId]
  if (Lesson) {
    return <Lesson moduleId={moduleId} onModuleChange={setModuleId} />
  }

  return <Module01Page moduleId={moduleId} onModuleChange={setModuleId} />
}
