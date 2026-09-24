import { useState } from 'react'
import { Module00Page } from './modules/module00/Module00Page'
import { Module01Page } from './modules/module01/Module01Page'
import { type ModuleId } from './modules/catalog'

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

  return <Module01Page moduleId={moduleId} onModuleChange={setModuleId} />
}
