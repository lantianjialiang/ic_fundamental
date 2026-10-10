import { useMemo, useState, type ComponentType } from 'react'
import { HomePage } from './home/HomePage'
import { TrackPage } from './home/TrackPage'
import { LabNavProvider } from './lab/LabNavContext'
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
import { Module17Page } from './modules/module17/Module17Page'
import { FundAcPage } from './modules/fund/FundAcPage'
import { FundAtePage } from './modules/fund/FundAtePage'
import { FundBasicsPage } from './modules/fund/FundBasicsPage'
import { FundCharPage } from './modules/fund/FundCharPage'
import { FundCreatePage } from './modules/fund/FundCreatePage'
import { FundDcPage } from './modules/fund/FundDcPage'
import { FundDebugPage } from './modules/fund/FundDebugPage'
import { FundFuncPage } from './modules/fund/FundFuncPage'
import { FundIntroPage } from './modules/fund/FundIntroPage'
import { FundLatchPage } from './modules/fund/FundLatchPage'
import { FundOpensPage } from './modules/fund/FundOpensPage'
import { FundProgramPage } from './modules/fund/FundProgramPage'
import { FundQualifyPage } from './modules/fund/FundQualifyPage'
import { FundScanPage } from './modules/fund/FundScanPage'
import { FundSpecPage } from './modules/fund/FundSpecPage'
import { FundVectorPage } from './modules/fund/FundVectorPage'
import { type ModuleId } from './modules/catalog'
import { type TrackId, trackById, trackOfLesson } from './tracks/catalog'

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
  bench: Module17Page,
  fBasics: FundBasicsPage,
  fAte: FundAtePage,
  fIntro: FundIntroPage,
  fSpec: FundSpecPage,
  fOpens: FundOpensPage,
  fDc: FundDcPage,
  fFunc: FundFuncPage,
  fAc: FundAcPage,
  fChar: FundCharPage,
  fVector: FundVectorPage,
  fProgram: FundProgramPage,
  fCreate: FundCreatePage,
  fDebug: FundDebugPage,
  fQualify: FundQualifyPage,
  fLatch: FundLatchPage,
  fScan: FundScanPage,
}

type Screen =
  | { kind: 'home' }
  | { kind: 'track'; track: TrackId }
  | { kind: 'lesson'; track: TrackId; moduleId: ModuleId }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: 'home' })

  const openLesson = (moduleId: ModuleId, track?: TrackId) => {
    setScreen({ kind: 'lesson', track: trackOfLesson(moduleId, track), moduleId })
  }

  const navValue = useMemo(() => {
    if (screen.kind !== 'lesson') return null
    const track = trackById(screen.track)
    const current = screen.track
    return {
      track: current,
      navIds: track?.lessons ?? [],
      goHome: () => setScreen({ kind: 'home' }),
      goTrack: () => setScreen({ kind: 'track', track: current }),
      openLesson: (id: ModuleId) => openLesson(id, current),
    }
  }, [screen])

  if (screen.kind === 'home') {
    return <HomePage onOpenTrack={(track) => setScreen({ kind: 'track', track })} />
  }

  if (screen.kind === 'track') {
    return (
      <TrackPage
        trackId={screen.track}
        onHome={() => setScreen({ kind: 'home' })}
        onOpenLesson={(id) => openLesson(id, screen.track)}
      />
    )
  }

  const onModuleChange = (id: ModuleId) => openLesson(id, screen.track)
  let page
  if (screen.moduleId === 'intro') {
    page = (
      <Module00Page
        moduleId={screen.moduleId}
        onModuleChange={onModuleChange}
        onOpenConnection={() => openLesson('connection', screen.track)}
      />
    )
  } else {
    const Lesson = LESSONS[screen.moduleId]
    page = Lesson ? (
      <Lesson moduleId={screen.moduleId} onModuleChange={onModuleChange} />
    ) : (
      <Module01Page moduleId={screen.moduleId} onModuleChange={onModuleChange} />
    )
  }

  return navValue ? <LabNavProvider value={navValue}>{page}</LabNavProvider> : page
}
