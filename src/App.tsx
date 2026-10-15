import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from 'react'
import type { FaqPageProps } from './faq/FaqPage'
import type { GlossaryPageProps } from './glossary/GlossaryPage'
import { HomePage } from './home/HomePage'
import { TrackPage } from './home/TrackPage'
import { useLocale } from './i18n/LocaleContext'
import { ui } from './i18n/ui'
import { LabNavProvider } from './lab/LabNavContext'
import { type ModuleId } from './modules/catalog'
import { parseHash, screenHash, type Screen } from './route'
import { type TrackId, trackById, trackOfLesson } from './tracks/catalog'

type LessonProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type IntroProps = LessonProps & { onOpenConnection: () => void }

/** 每课单独打包，进入时才加载；three.js 只跟着 3D 课走 */
function page<P>(load: () => Promise<Record<string, unknown>>, name: string) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType<P> }))
}

const Module00Page = page<IntroProps>(() => import('./modules/module00/Module00Page'), 'Module00Page')
const GlossaryPage = page<GlossaryPageProps>(() => import('./glossary/GlossaryPage'), 'GlossaryPage')
const FaqPage = page<FaqPageProps>(() => import('./faq/FaqPage'), 'FaqPage')

const LESSONS: Record<Exclude<ModuleId, 'intro'>, ComponentType<LessonProps>> = {
  pIndustry: page(() => import('./modules/prep/PrepIndustryPage'), 'PrepIndustryPage'),
  pHistory: page(() => import('./modules/prep/PrepHistoryPage'), 'PrepHistoryPage'),
  pSilicon: page(() => import('./modules/prep/PrepSiliconPage'), 'PrepSiliconPage'),
  pPackage: page(() => import('./modules/prep/PrepPackagePage'), 'PrepPackagePage'),
  pParts: page(() => import('./modules/prep/PrepPartsPage'), 'PrepPartsPage'),
  pDigital: page(() => import('./modules/prep/PrepDigitalPage'), 'PrepDigitalPage'),
  pMeasure: page(() => import('./modules/prep/PrepMeasurePage'), 'PrepMeasurePage'),
  mosPrimer: page(() => import('./modules/mos/MosPrimerPage'), 'MosPrimerPage'),
  mosIntro: page(() => import('./modules/mos/MosIntroPage'), 'MosIntroPage'),
  mosChannel: page(() => import('./modules/mos/MosChannelPage'), 'MosChannelPage'),
  mosRegion: page(() => import('./modules/mos/MosRegionPage'), 'MosRegionPage'),
  mosSwitch: page(() => import('./modules/mos/MosSwitchPage'), 'MosSwitchPage'),
  mosInverter: page(() => import('./modules/mos/MosInverterPage'), 'MosInverterPage'),
  mosGates: page(() => import('./modules/mos/MosGatesPage'), 'MosGatesPage'),
  mosDynamic: page(() => import('./modules/mos/MosDynamicPage'), 'MosDynamicPage'),
  mosApps: page(() => import('./modules/mos/MosAppsPage'), 'MosAppsPage'),
  mosReal: page(() => import('./modules/mos/MosRealPage'), 'MosRealPage'),
  mosSelect: page(() => import('./modules/mos/MosSelectPage'), 'MosSelectPage'),
  pcbIntro: page(() => import('./modules/pcb/PcbIntroPage'), 'PcbIntroPage'),
  pcbMaterial: page(() => import('./modules/pcb/PcbMaterialPage'), 'PcbMaterialPage'),
  pcbStack: page(() => import('./modules/pcb/PcbStackPage'), 'PcbStackPage'),
  pcbFab: page(() => import('./modules/pcb/PcbFabPage'), 'PcbFabPage'),
  pcbSupply: page(() => import('./modules/pcb/PcbSupplyPage'), 'PcbSupplyPage'),
  pcbFlow: page(() => import('./modules/pcb/PcbFlowPage'), 'PcbFlowPage'),
  pcbBasics: page(() => import('./modules/pcb/PcbBasicsPage'), 'PcbBasicsPage'),
  pcbLayout: page(() => import('./modules/pcb/PcbLayoutPage'), 'PcbLayoutPage'),
  pcbTools: page(() => import('./modules/pcb/PcbToolsPage'), 'PcbToolsPage'),
  pcbDfm: page(() => import('./modules/pcb/PcbDfmPage'), 'PcbDfmPage'),
  connection: page(() => import('./modules/module01/Module01Page'), 'Module01Page'),
  ate: page(() => import('./modules/module03/Module03Page'), 'Module03Page'),
  pmu: page(() => import('./modules/module04/Module04Page'), 'Module04Page'),
  spec: page(() => import('./modules/module05/Module05Page'), 'Module05Page'),
  dc: page(() => import('./modules/module06/Module06Page'), 'Module06Page'),
  func: page(() => import('./modules/module07/Module07Page'), 'Module07Page'),
  timing: page(() => import('./modules/module08/Module08Page'), 'Module08Page'),
  vector: page(() => import('./modules/module10/Module10Page'), 'Module10Page'),
  scan: page(() => import('./modules/module11/Module11Page'), 'Module11Page'),
  program: page(() => import('./modules/module12/Module12Page'), 'Module12Page'),
  shmoo: page(() => import('./modules/module14/Module14Page'), 'Module14Page'),
  alu: page(() => import('./modules/module15/Module15Page'), 'Module15Page'),
  latch: page(() => import('./modules/module16/Module16Page'), 'Module16Page'),
  bench: page(() => import('./modules/module17/Module17Page'), 'Module17Page'),
  vate: page(() => import('./modules/vate/VatePage'), 'VatePage'),
  fBasics: page(() => import('./modules/fund/FundBasicsPage'), 'FundBasicsPage'),
  fAte: page(() => import('./modules/fund/FundAtePage'), 'FundAtePage'),
  fIntro: page(() => import('./modules/fund/FundIntroPage'), 'FundIntroPage'),
  fSpec: page(() => import('./modules/fund/FundSpecPage'), 'FundSpecPage'),
  fOpens: page(() => import('./modules/fund/FundOpensPage'), 'FundOpensPage'),
  fDc: page(() => import('./modules/fund/FundDcPage'), 'FundDcPage'),
  fFunc: page(() => import('./modules/fund/FundFuncPage'), 'FundFuncPage'),
  fAc: page(() => import('./modules/fund/FundAcPage'), 'FundAcPage'),
  fChar: page(() => import('./modules/fund/FundCharPage'), 'FundCharPage'),
  fVector: page(() => import('./modules/fund/FundVectorPage'), 'FundVectorPage'),
  fProgram: page(() => import('./modules/fund/FundProgramPage'), 'FundProgramPage'),
  fCreate: page(() => import('./modules/fund/FundCreatePage'), 'FundCreatePage'),
  fDebug: page(() => import('./modules/fund/FundDebugPage'), 'FundDebugPage'),
  fQualify: page(() => import('./modules/fund/FundQualifyPage'), 'FundQualifyPage'),
  fLatch: page(() => import('./modules/fund/FundLatchPage'), 'FundLatchPage'),
  fScan: page(() => import('./modules/fund/FundScanPage'), 'FundScanPage'),
}

function Loading() {
  const { t } = useLocale()
  return <p className="app-loading">{t(ui.loading)}</p>
}

export default function App() {
  const [screen, setScreenState] = useState<Screen>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHash = () => setScreenState(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setScreen = (next: Screen) => {
    const hash = screenHash(next)
    if (window.location.hash === hash) setScreenState(next)
    else window.location.hash = hash
  }

  /** 改地址但不新增历史记录：用于把不存在的术语 / 问题 ID 纠正回列表页 */
  const replaceScreen = (next: Screen) => {
    window.history.replaceState(null, '', screenHash(next))
    setScreenState(next)
  }

  const openLesson = (moduleId: ModuleId, track?: TrackId) => {
    setScreen({ kind: 'lesson', track: trackOfLesson(moduleId, track), moduleId })
  }

  const openTrack = (id: TrackId) => {
    const kind = trackById(id)?.page
    if (kind === 'glossary') setScreen({ kind: 'glossary' })
    else if (kind === 'faq') setScreen({ kind: 'faq' })
    else setScreen({ kind: 'track', track: id })
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
    return <HomePage onOpenTrack={openTrack} />
  }

  if (screen.kind === 'glossary') {
    return (
      <Suspense fallback={<Loading />}>
        <GlossaryPage
          termId={screen.termId}
          onSelect={(termId, replace) => (replace ? replaceScreen : setScreen)({ kind: 'glossary', termId })}
          onHome={() => setScreen({ kind: 'home' })}
          onOpenLesson={(id) => openLesson(id)}
        />
      </Suspense>
    )
  }

  if (screen.kind === 'faq') {
    return (
      <Suspense fallback={<Loading />}>
        <FaqPage
          faqId={screen.faqId}
          onSelect={(faqId, replace) => (replace ? replaceScreen : setScreen)({ kind: 'faq', faqId })}
          onHome={() => setScreen({ kind: 'home' })}
          onOpenLesson={(id) => openLesson(id)}
        />
      </Suspense>
    )
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
  const Lesson = screen.moduleId === 'intro' ? null : LESSONS[screen.moduleId]
  const lesson = Lesson ? (
    <Lesson moduleId={screen.moduleId} onModuleChange={onModuleChange} />
  ) : (
    <Module00Page
      moduleId={screen.moduleId}
      onModuleChange={onModuleChange}
      onOpenConnection={() => openLesson('connection', screen.track)}
    />
  )

  const content = <Suspense fallback={<Loading />}>{lesson}</Suspense>
  return navValue ? <LabNavProvider value={navValue}>{content}</LabNavProvider> : content
}
