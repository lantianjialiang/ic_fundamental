import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList, type TaskItem } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Seg } from '../fund/parts'
import { PrereqSection } from '../hs/HsPrereq'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ByteViewer } from './ByteViewer'
import { ISSUE_TEXT, INTRO, MISCONCEPTIONS, PARSE_ERROR_TEXT, PREREQ, QUIZ, S, TAKEAWAY, TASKS } from './genStdfData'
import { GEN_META } from './meta'
import { LotStats } from './LotStats'
import { SeqBuilder } from './SeqBuilder'
import {
  LOT_TESTS,
  buildLot,
  dutItems,
  encodeFile,
  parseStdf,
  summarizeStdf,
  validateSequence,
  type DutKey,
  type LotSummary,
  type ParsedField,
  type ParseResult,
  type ValidationIssue,
} from './model/stdf'
import './gen.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

type View = 'bytes' | 'assemble' | 'local'
type Endian = 'le' | 'be'
type LocalFile = { name: string; size: number; parsed: ParseResult; summary: LotSummary }

/** 初始顺序故意打乱，学生需要自己排回标准顺序 */
const INITIAL_ORDER: DutKey[] = ['PRR', 'PTR_VOH', 'MIR', 'MRR', 'PIR', 'PTR_IDD', 'FAR', 'PTR_IIL', 'HBR', 'PCR', 'SBR']
const MAX_BYTES = 20 * 1024 * 1024
const SAMPLE_LOT = { seed: 2026, lotId: 'LOT-DEMO-001', parts: 60, sites: 2, defectRate: 0.15, siteOffsetV: [0, 0] }

const VIEW_OPTIONS: Array<{ id: View; label: LText }> = [
  { id: 'bytes', label: S.viewBytes },
  { id: 'assemble', label: S.viewAssemble },
  { id: 'local', label: S.viewLocal },
]
const ENDIAN_OPTIONS: Array<{ id: Endian; label: LText }> = [
  { id: 'le', label: S.endianLE },
  { id: 'be', label: S.endianBE },
]

export function GenStdfPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [view, setView] = useState<View>('bytes')
  const [endian, setEndian] = useState<Endian>('le')
  const [selected, setSelected] = useState<number | null>(null)
  const [touched, setTouched] = useState<string[]>([])
  const [order, setOrder] = useState<DutKey[]>(INITIAL_ORDER)
  const [prrBin, setPrrBin] = useState(1)
  const [exported, setExported] = useState(false)
  const [local, setLocal] = useState<LocalFile | null>(null)
  const [localError, setLocalError] = useState<'tooLarge' | 'readFail' | null>(null)
  const [statsTest, setStatsTest] = useState<number>(LOT_TESTS[0].num)
  const [statsSeen, setStatsSeen] = useState<number[]>([])

  /* 字节浏览器：DUT 示例文件，字节序可切换（解析结果相同，字节不同） */
  const dutBytes = useMemo(() => encodeFile(dutItems(2).map((item) => item.rec), endian === 'le'), [endian])
  const dutParsed = useMemo(() => parseStdf(dutBytes), [dutBytes])

  /* 示例批次：仿真生成 → 写成 STDF → 读回统计，和本地文件走同一条路径 */
  const sampleSummary = useMemo(() => {
    const lot = buildLot(SAMPLE_LOT)
    return summarizeStdf(parseStdf(encodeFile(lot, true)))
  }, [])

  /* 组装实验：按当前顺序取出记录，校验 */
  const items = useMemo(() => dutItems(prrBin), [prrBin])
  const records = useMemo(
    () =>
      order.flatMap((key) => {
        const hit = items.find((item) => item.key === key)
        return hit ? [hit.rec] : []
      }),
    [order, items],
  )
  const issues: ValidationIssue[] = useMemo(() => validateSequence(records), [records])

  const pick = (field: ParsedField) => {
    setSelected(field.id)
    setTouched((prev) => (prev.includes(field.name) ? prev : [...prev, field.name]))
  }

  const move = (index: number, delta: -1 | 1) => {
    setOrder((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) {
        return prev
      }
      const next = [...prev]
      const current = next[index]
      next[index] = next[target]
      next[target] = current
      return next
    })
  }

  const exportFile = () => {
    if (issues.length > 0) {
      return
    }
    const bytes = encodeFile(records, true)
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dut_demo.stdf'
    link.click()
    URL.revokeObjectURL(url)
    setExported(true)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) {
      return
    }
    if (file.size > MAX_BYTES) {
      setLocal(null)
      setLocalError('tooLarge')
      return
    }
    try {
      const parsed = parseStdf(new Uint8Array(await file.arrayBuffer()))
      setLocal({ name: file.name, size: file.size, parsed, summary: summarizeStdf(parsed) })
      setLocalError(null)
    } catch {
      setLocal(null)
      setLocalError('readFail')
    }
  }

  const pickTest = (num: number) => {
    setStatsTest(num)
    setStatsSeen((prev) => (prev.includes(num) ? prev : [...prev, num]))
  }

  const reset = () => {
    setView('bytes')
    setEndian('le')
    setSelected(null)
    setTouched([])
    setOrder(INITIAL_ORDER)
    setPrrBin(1)
    setExported(false)
    setLocal(null)
    setLocalError(null)
    setStatsTest(LOT_TESTS[0].num)
    setStatsSeen([])
  }

  const tasks: TaskItem[] = [
    { id: 't1', text: TASKS.t1, done: touched.length >= 3 },
    { id: 't2', text: TASKS.t2, done: exported },
    { id: 't3', text: TASKS.t3, done: local !== null },
    { id: 't4', text: TASKS.t4, done: statsSeen.length >= 2 },
  ]

  const firstIssue = issues.length > 0 ? t(S.issueLine).replace('{n}', String(issues[0].index + 1)).replace('{msg}', t(ISSUE_TEXT[issues[0].code])) : ''
  const asideTitle = view === 'bytes' ? t(S.viewBytes) : view === 'assemble' ? (issues.length === 0 ? t(S.validOk) : t(S.validBad)) : t(S.viewLocal)
  const asideText = view === 'bytes' ? t(S.byteHeadNote) : view === 'assemble' ? (issues.length === 0 ? t(S.assembleHint) : firstIssue) : t(S.localHint)
  const summary = local ? local.summary : sampleSummary

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(GEN_META.genStdf.title)}
      goal={t(GEN_META.genStdf.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={asideTitle}
      asideText={asideText}
      asideLater={t(S.asideLater)}
      nextId="genMultisite"
      nextLabel={`${t(S.nextPrefix)}${t(GEN_META.genMultisite.title)}`}
      extra={<TaskList items={tasks} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['ate', 'vate', 'anaStats', 'genMultisite']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Seg options={VIEW_OPTIONS} value={view} onChange={setView} />

        {view === 'bytes' ? (
          <div className="gen-view">
            <div className="gen-row">
              <span className="gen-row__label">{t(S.endianLabel)}</span>
              <Seg options={ENDIAN_OPTIONS} value={endian} onChange={setEndian} />
            </div>
            <p className="intro__note">{t(S.byteHint)}</p>
            <ByteViewer bytes={dutBytes} parsed={dutParsed} selected={selected} onPick={pick} />
          </div>
        ) : null}

        {view === 'assemble' ? (
          <div className="gen-view">
            <p className="intro__note">{t(S.assembleHint)}</p>
            <p className="intro__note">{t(S.assembleMap)}</p>
            <SeqBuilder order={order} prrBin={prrBin} issues={issues} onMove={move} onBin={setPrrBin} />
            <div className="gen-export">
              <button type="button" className="lab__btn lab__btn--primary" disabled={issues.length > 0} onClick={exportFile}>
                {t(S.exportBtn)}
              </button>
              <span className={issues.length === 0 ? 'gen-ok' : 'gen-bad'}>{issues.length === 0 ? t(S.validOk) : t(S.validBad)}</span>
            </div>
            {exported ? <p className="intro__note">{t(S.exported)}</p> : null}
          </div>
        ) : null}

        {view === 'local' ? (
          <div className="gen-view">
            <p className="intro__note">{t(S.localHint)}</p>
            <div className="gen-row">
              <label className="lab__btn lab__btn--primary gen-file">
                {t(S.pickBtn)}
                <input
                  type="file"
                  accept=".stdf"
                  aria-label={t(S.pickAria)}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    void onFile(file)
                    event.target.value = ''
                  }}
                />
              </label>
              {local ? (
                <button type="button" className="lab__btn" onClick={() => setLocal(null)}>
                  {t(S.sourceBack)}
                </button>
              ) : null}
            </div>
            <p className="gen-source">{local ? t(S.sourceLocal).replace('{name}', local.name) : t(S.sourceSample)}</p>
            {local ? (
              <p className="intro__note">
                {t(S.fileInfo).replace('{name}', local.name).replace('{size}', String(local.size)).replace('{records}', String(local.parsed.records.length))}
              </p>
            ) : null}
            {localError ? (
              <Callout tone="bad">
                <p>{t(localError === 'tooLarge' ? S.tooLarge : S.readFail)}</p>
              </Callout>
            ) : null}
            {local && local.parsed.errors.length > 0 ? (
              <Callout tone="bad">
                {local.parsed.errors.map((err, i) => (
                  <p key={i}>{`${t(PARSE_ERROR_TEXT[err.code])} @ ${err.offset}`}</p>
                ))}
              </Callout>
            ) : null}
            <LotStats summary={summary} testNum={statsTest} onPickTest={pickTest} />
          </div>
        ) : null}
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>

      <PrereqSection title={S.prereqTitle} note={S.prereqNote} items={PREREQ} />
    </LessonFrame>
  )
}
