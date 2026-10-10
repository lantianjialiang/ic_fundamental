import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  APPROACH,
  COMPROMISE,
  PARAMS,
  QUIZ,
  READ_ROWS,
  READ_SPANS,
  SEARCH_FORMULA,
  SEARCH_HI,
  SEARCH_LEAD,
  SEARCH_LO,
  SEARCH_RES,
  TAKEAWAY,
  WRITE_ROWS,
  WRITE_SPANS,
  type TimingKind,
} from './data/ac'
import { type Seg as WaveSeg } from './data/func'
import { Callout, Cards, Explain, Readout, Seg, type Note } from './parts'
import { SramTimingFig } from './SramTimingFig'
import { WaveRows } from './WaveRows'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  approachTitle: loc('两组选择：一起测还是单测，判一次还是搜出来'),
  compTitle: loc('测试机不够快怎么办'),
  muxNote: loc('A、B 两路各 20 ns 一拍（50 MHz），轮流接到同一管脚，管脚上 10 ns 一拍（100 MHz）。'),
  paramTitle: loc('六类 AC 参数怎么测'),
  howLabel: loc('怎么测：'),
  passLabel: loc('怎么判：'),
  searchTitle: loc('动手：二分搜索 tPD'),
  chipGood: loc('芯片 A'),
  chipSlow: loc('芯片 B'),
  chipRandom: loc('随机换一颗'),
  step: loc('跑一次'),
  runAll: loc('跑到底'),
  reset: loc('重来'),
  range: loc('当前范围'),
  runs: loc('已跑次数'),
  result: loc('搜索结果'),
  gonogo: loc('Go/No-Go @ 15 ns'),
  colRun: loc('#'),
  colStrobe: loc('Strobe'),
  colRes: loc('结果'),
  colRange: loc('新范围'),
  done: loc('分辨率已到 0.25 ns，停止。'),
  sramTitle: loc('256×4 SRAM：写周期和读周期怎么排'),
  sramNote: loc('点参数名，图上会画出它对应的那一段，并解释为什么边沿放在这里。'),
  write: loc('写周期（WE 控制）'),
  read: loc('读周期（OE 控制）'),
  kicker: loc('AC 参数'),
  later: loc('能测出 Pass / Fail，就能搜出边界。下一课把搜索和 Shmoo 用到所有参数上。'),
}

type Run = { strobe: number; pass: boolean; lo: number; hi: number }

export function FundAcPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [approach, setApproach] = useState('worst')
  const [param, setParam] = useState('tpd')
  const [actual, setActual] = useState(11.3)
  const [runs, setRuns] = useState<Run[]>([])
  const [kind, setKind] = useState<TimingKind>('write')
  const [span, setSpan] = useState('tAW')
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: APPROACH[0].title, text: APPROACH[0].text })

  const last = runs[runs.length - 1]
  const lo = last ? last.lo : SEARCH_LO
  const hi = last ? last.hi : SEARCH_HI
  const done = hi - lo <= SEARCH_RES

  const stepOnce = (list: Run[]) => {
    const prev = list[list.length - 1]
    const l = prev ? prev.lo : SEARCH_LO
    const h = prev ? prev.hi : SEARCH_HI
    if (h - l <= SEARCH_RES) return list
    const strobe = (l + h) / 2
    const pass = strobe >= actual
    return [...list, { strobe, pass, lo: pass ? l : strobe, hi: pass ? strobe : h }]
  }

  const runAll = () => {
    let list = runs
    for (let i = 0; i < 20; i += 1) list = stepOnce(list)
    setRuns(list)
  }

  const newChip = (value: number) => {
    setActual(value)
    setRuns([])
  }

  const paramItem = PARAMS.find((item) => item.id === param)
  const spans = kind === 'write' ? WRITE_SPANS : READ_SPANS
  const spanItem = spans.find((item) => item.id === span)

  // 多路复用示意
  const muxBits = [1, 0, 1, 1, 0, 1, 0, 0]
  const chA: WaveSeg[] = muxBits.map((bit, j) => ({ x0: j * 10, x1: j * 10 + 10, level: j % 2 === 0 ? ((bit ? 1 : 0) as 0 | 1) : 'z' }))
  const chB: WaveSeg[] = muxBits.map((bit, j) => ({ x0: j * 10, x1: j * 10 + 10, level: j % 2 === 1 ? ((bit ? 1 : 0) as 0 | 1) : 'z' }))
  const pin: WaveSeg[] = muxBits.map((bit, j) => ({ x0: j * 10, x1: j * 10 + 10, level: (bit ? 1 : 0) as 0 | 1 }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m22.title)}
      goal={t(ui.m22.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fChar"
      nextLabel={t(ui.fund.next) + t(ui.fChar.title)}
    >
      <Section title={t(S.approachTitle)}>
        <Cards
          items={APPROACH}
          activeId={approach}
          cols={4}
          onPick={(item) => {
            setApproach(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={APPROACH.find((item) => item.id === approach)?.explain} />
      </Section>

      <Section title={t(S.compTitle)}>
        {COMPROMISE.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <figure className="term-fig">
          <WaveRows
            span={80}
            period={10}
            rows={[
              { name: 'CH A', segs: chA },
              { name: 'CH B', segs: chB, color: 'var(--purple)' },
              { name: 'PIN', segs: pin, color: 'var(--green)' },
            ]}
            ariaLabel="multiplex"
          />
          <figcaption>{t(S.muxNote)}</figcaption>
        </figure>
      </Section>

      <Section title={t(S.paramTitle)}>
        <Cards
          items={PARAMS}
          activeId={param}
          onPick={(item) => {
            setParam(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {paramItem ? (
          <Callout>
            <p>{t(paramItem.text)}</p>
            <p>
              <b>{t(S.howLabel)}</b>
              {t(paramItem.how)}
            </p>
            <p>
              <b>{t(S.passLabel)}</b>
              {t(paramItem.pass)}
            </p>
          </Callout>
        ) : null}
      </Section>

      <Section title={t(S.searchTitle)} note={t(SEARCH_LEAD)}>
        <div className="row-actions">
          <Seg
            options={[
              { id: '11.3', label: S.chipGood },
              { id: '16.4', label: S.chipSlow },
            ]}
            value={String(actual)}
            onChange={(id) => newChip(Number(id))}
          />
          <button type="button" className="lab__btn" onClick={() => newChip(Math.round((8 + Math.random() * 12) * 10) / 10)}>
            {t(S.chipRandom)}
          </button>
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={done} onClick={() => setRuns(stepOnce(runs))}>
            {t(S.step)}
          </button>
          <button type="button" className="lab__btn" disabled={done} onClick={runAll}>
            {t(S.runAll)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setRuns([])}>
            {t(S.reset)}
          </button>
        </div>
        <div className="search-bar">
          <div className="search-bar__range" style={{ left: `${(lo / SEARCH_HI) * 100}%`, width: `${((hi - lo) / SEARCH_HI) * 100}%` }} />
          {runs.map((run, i) => (
            <i
              key={i}
              className={run.pass ? 'is-pass' : 'is-fail'}
              style={{ left: `${(run.strobe / SEARCH_HI) * 100}%` }}
              title={`${run.strobe} ns`}
            />
          ))}
          {done ? <b style={{ left: `${(actual / SEARCH_HI) * 100}%` }} /> : null}
          <span className="search-bar__lo">0 ns</span>
          <span className="search-bar__hi">{SEARCH_HI} ns</span>
        </div>
        <Readout
          items={[
            { label: S.range, value: `${lo.toFixed(2)} – ${hi.toFixed(2)} ns` },
            { label: S.runs, value: String(runs.length) },
            { label: S.result, value: done ? `tPD ≈ ${hi.toFixed(2)} ns` : '…', state: done ? 'pass' : undefined },
            { label: S.gonogo, value: actual <= 15 ? 'PASS' : 'FAIL', state: actual <= 15 ? 'pass' : 'fail' },
          ]}
        />
        {runs.length > 0 ? (
          <table className="dtable">
            <thead>
              <tr>
                <th>{t(S.colRun)}</th>
                <th>{t(S.colStrobe)}</th>
                <th>{t(S.colRes)}</th>
                <th>{t(S.colRange)}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => (
                <tr key={i} className={run.pass ? 'is-pass' : 'is-fail'}>
                  <td className="mono-cell">{i + 1}</td>
                  <td className="mono-cell">{run.strobe.toFixed(2)} ns</td>
                  <td className="verdict">{run.pass ? 'PASS' : 'FAIL'}</td>
                  <td className="mono-cell">
                    {run.lo.toFixed(2)} – {run.hi.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {done ? <p className="intro__note">{t(S.done)}</p> : null}
        <Callout>{t(SEARCH_FORMULA)}</Callout>
      </Section>

      <Section title={t(S.sramTitle)} note={t(S.sramNote)}>
        <Seg
          options={[
            { id: 'write' as const, label: S.write },
            { id: 'read' as const, label: S.read },
          ]}
          value={kind}
          onChange={(id) => {
            setKind(id)
            setSpan(id === 'write' ? 'tAW' : 'tDOE')
          }}
        />
        <div className="kind" style={{ marginBottom: 10 }}>
          {spans.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kind__btn${item.id === span ? ' is-right' : ''}`}
              onClick={() => {
                setSpan(item.id)
                setNote({ kicker: S.kicker, title: item.label, text: item.text })
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <figure className="term-fig">
          <SramTimingFig
            rows={kind === 'write' ? WRITE_ROWS : READ_ROWS}
            spans={spans}
            active={span}
            onPick={setSpan}
            ariaLabel={kind}
          />
        </figure>
        {spanItem ? <Explain paras={[spanItem.text]} /> : null}
      </Section>

      <Section title={t(ui.fund.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.fund.quizTitle)} note={t(ui.fund.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
