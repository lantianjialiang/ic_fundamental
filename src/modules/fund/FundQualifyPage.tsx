import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  BIN_LEAD,
  DOCS,
  DOC_DONE,
  FAIL_KINDS,
  FIELDS,
  HANDLER_TEXT,
  MARGIN_LEAD,
  MARGIN_MSG,
  MARGIN_PARAMS,
  QUIZ,
  RISK_PCT,
  SAMPLE_LEAD,
  SHMOO_LEAD,
  SHMOO_RIGHT,
  SHMOO_VECS,
  SHMOO_WRONG,
  TAKEAWAY,
  TEMP_RANGES,
  TEMP_TEXT,
  TRACE_QS,
  marginPct,
  pushed,
  type FieldId,
} from './data/qualify'
import { Callout, Explain, Knob, Readout, Seg, type Note } from './parts'
import { MarginFig, ShmooFig } from './QualifyFig'
import './qualify.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('验证与文档', 'Qualification & docs'),
  later: loc('程序交出去以后，还要面对闩锁这类可靠性测试——下一课讲 CMOS 闩锁。', 'After the program is released, it still faces reliability tests such as latch-up. The next lesson covers CMOS latch-up.'),
  sampleTitle: loc('样品：编号、存档、写全 Datalog', 'Samples: serialize, store, full datalogs'),
  sampleNote: loc('勾选 Datalog 抬头里要写的信息，看三个月后出问题时，你能回答哪些问题。', 'Check the information to put in the datalog header, and see which questions you can answer when a problem shows up three months later.'),
  can: loc('能答', 'Can answer'),
  cannot: loc('答不了', "Can't answer"),
  marginTitle: loc('动手：查 Margin', 'Hands-on: check margins'),
  marginNote: loc('拖动“整体拉偏”，每个参数都朝着它更容易 Fail 的方向走 x%。条形长度是这个参数离失效还有多少余量。点一行看说明。', 'Drag "Push all": every parameter moves x% in the direction that makes it more likely to fail. Bar length is how much margin the parameter has before failing. Click a row for details.'),
  pull: loc('整体拉偏', 'Push all'),
  colParam: loc('参数', 'Parameter'),
  colKind: loc('类型', 'Type'),
  colSpec: loc('规格', 'Spec'),
  colFail: loc('失效点 / 实测', 'Fail point / measured'),
  colNow: loc('拉偏后', 'Pushed'),
  colMargin: loc('余量', 'Margin'),
  colState: loc('状态', 'Status'),
  stFail: loc('FAIL', 'FAIL'),
  stRisk: loc('余量小', 'Low margin'),
  stOk: loc('OK', 'OK'),
  nFail: loc('已 Fail', 'Failing'),
  nRisk: loc('余量 < 10%', 'Margin < 10%'),
  shmooTitle: loc('动手：Shmoo 每一个向量', 'Hands-on: Shmoo every vector set'),
  shmooNote: loc('四个向量的 VDD vs. VIL Shmoo（绿 = Pass，红 = Fail，金圈 = 规格点）。点出你认为有问题的那一个。', 'VDD vs. VIL Shmoo plots for four vector sets (green = Pass, red = Fail, gold circle = spec point). Click the one you think has a problem.'),
  binTitle: loc('动手：验证分 Bin 和测试汇总', 'Hands-on: verify binning and test summary'),
  binNote: loc('逐一点“制造”，看程序把这颗芯片放进哪个 Bin、和流程图上应该进的 Bin 对不对得上。有一项故意配错了。', 'Click "Force" on each row, see which bin the program puts the device in, and check it against the bin on the flowchart. One is deliberately misconfigured.'),
  colKindF: loc('制造哪种 Fail', 'Fail to force'),
  colExpect: loc('应进 Bin', 'Expected bin'),
  colProg: loc('程序给的 Bin', 'Program bin'),
  colCheck: loc('核对', 'Check'),
  make: loc('制造', 'Force'),
  notYet: loc('—', '—'),
  match: loc('一致', 'Match'),
  mismatch: loc('配错！', 'Wrong!'),
  sumTitle: loc('测试汇总（程序打出来的）', 'Test summary (printed by the program)'),
  sumMade: loc('你制造的', 'You forced'),
  sumProg: loc('汇总里的', 'In summary'),
  clearBin: loc('清零', 'Clear'),
  sumBad: loc('汇总对不上：你一颗都没放好片，汇总里 Bin 1 却有数——说明有 Fail 漏进了好片 Bin。', "The summary doesn't match: you ran no good devices, yet Bin 1 has a count. A failure leaked into the good bin."),
  tempTitle: loc('温度测试：再扩 10%', 'Temperature test: extend 10%'),
  specRange: loc('规定范围', 'Specified range'),
  extRange: loc('扩展 10% 后', 'Extended 10%'),
  handlerTitle: loc('上探针台 / 分选机验证', 'Verify on prober / handler'),
  docTitle: loc('动手：整理文档包', 'Hands-on: assemble the documentation package'),
  docNote: loc('逐项勾选，点名字展开看为什么需要它。', 'Check each item; click a name to see why it is needed.'),
  docDone: loc('完成度', 'Complete'),
  sep: loc('、', ', '),
}

const fmtNum = (v: number) => (Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2))

export function FundQualifyPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: S.sampleTitle, text: SAMPLE_LEAD[0] })
  // 1. 样品
  const [fields, setFields] = useState<Record<FieldId, boolean>>({ sn: true, rev: false, tester: false, date: false, full: false })
  // 2. Margin
  const [pull, setPull] = useState(0)
  const [param, setParam] = useState(MARGIN_PARAMS[0].id)
  // 3. Shmoo
  const [shPick, setShPick] = useState<string | null>(null)
  // 4. 分 Bin
  const [made, setMade] = useState<Record<string, number>>({})
  const [range, setRange] = useState(TEMP_RANGES[0].id)
  // 5. 文档
  const [docs, setDocs] = useState<Record<string, boolean>>({})
  const [docOpen, setDocOpen] = useState<string | null>(DOCS[0].id)

  /* ---- 样品 ---- */
  const header = ['==== DATALOG ====', ...FIELDS.filter((f) => fields[f.id]).map((f) => f.line)]

  /* ---- Margin ---- */
  const status = (m: number) => (m <= pull ? 'fail' : m < RISK_PCT ? 'risk' : 'ok')
  const failed = MARGIN_PARAMS.filter((p) => status(marginPct(p)) === 'fail')
  const risky = MARGIN_PARAMS.filter((p) => status(marginPct(p)) === 'risk')
  const paramItem = MARGIN_PARAMS.find((p) => p.id === param) ?? MARGIN_PARAMS[0]
  const pickParam = (id: string) => {
    setParam(id)
    const p = MARGIN_PARAMS.find((x) => x.id === id)
    if (p) setNote({ kicker: S.kicker, title: p.name, text: p.text })
  }

  /* ---- Shmoo ---- */
  const pickVec = (id: string) => {
    setShPick(id)
    const v = SHMOO_VECS.find((x) => x.id === id)
    if (!v) return
    setNote({ kicker: S.kicker, title: v.name, text: v.text })
  }
  const shItem = SHMOO_VECS.find((x) => x.id === shPick)
  const shVerdict: Record<string, 'right' | 'wrong'> = shItem ? { [shItem.id]: shItem.holes.length > 0 ? 'right' : 'wrong' } : {}

  /* ---- 分 Bin ---- */
  const progSum: Record<number, number> = {}
  const madeSum: Record<number, number> = {}
  FAIL_KINDS.forEach((k) => {
    const n = made[k.id] ?? 0
    progSum[k.prog] = (progSum[k.prog] ?? 0) + n
    madeSum[k.expect] = (madeSum[k.expect] ?? 0) + n
  })
  const binList = Array.from(new Set(FAIL_KINDS.map((k) => k.expect))).sort((a, b) => a - b)
  const sumWrong = binList.some((b) => (progSum[b] ?? 0) !== (madeSum[b] ?? 0))
  const rangeItem = TEMP_RANGES.find((r) => r.id === range) ?? TEMP_RANGES[0]
  const span = rangeItem.hi - rangeItem.lo
  const ext = Math.round(span) / 10
  const extLo = rangeItem.lo - ext
  const extHi = rangeItem.hi + ext

  /* ---- 文档 ---- */
  const docCount = DOCS.filter((d) => docs[d.id]).length

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fQualify.title)}
      goal={t(ui.fQualify.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fLatch"
      nextLabel={t(ui.fund.next) + t(ui.fLatch.title)}
    >
      {/* 1. 样品 */}
      <Section title={t(S.sampleTitle)} note={t(S.sampleNote)}>
        {SAMPLE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="kind">
          {FIELDS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`kind__btn${fields[f.id] ? ' is-right' : ''}`}
              onClick={() => setFields((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
            >
              {`${fields[f.id] ? '✓ ' : ''}${t(f.label)}`}
            </button>
          ))}
        </div>
        <pre className="code">{header.join('\n')}</pre>
        <div className="qual-trace">
          {TRACE_QS.map((q) => {
            const ok = q.need.every((id) => fields[id])
            return (
              <div key={q.id} className={`qual-trace__row ${ok ? 'is-ok' : 'is-bad'}`}>
                <b>{t(ok ? S.can : S.cannot)}</b>
                <span>{t(q.q)}</span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* 2. Margin */}
      <Section title={t(S.marginTitle)} note={t(S.marginNote)}>
        {MARGIN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="knob-row">
          <Knob label={S.pull} value={pull} unit="%" min={0} max={25} step={0.5} onChange={setPull} />
        </div>
        <Readout
          items={[
            { label: S.pull, value: `±${pull}%` },
            { label: S.nFail, value: String(failed.length), state: failed.length ? 'fail' : 'pass' },
            { label: S.nRisk, value: String(MARGIN_PARAMS.filter((p) => marginPct(p) < RISK_PCT).length) },
            { label: S.stRisk, value: risky.length ? risky.map((p) => p.name).join(' / ') : '—' },
          ]}
        />
        <figure className="term-fig">
          <MarginFig params={MARGIN_PARAMS} x={pull} active={param} onPick={pickParam} />
        </figure>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colParam)}</th>
              <th>{t(S.colKind)}</th>
              <th>{t(S.colSpec)}</th>
              <th>{t(S.colFail)}</th>
              <th>{t(S.colNow)}</th>
              <th>{t(S.colMargin)}</th>
              <th>{t(S.colState)}</th>
            </tr>
          </thead>
          <tbody>
            {MARGIN_PARAMS.map((p) => {
              const m = marginPct(p)
              const st = status(m)
              return (
                <tr
                  key={p.id}
                  className={`is-click${p.id === param ? ' is-active' : ''}${st === 'fail' ? ' is-fail' : st === 'ok' ? ' is-pass' : ''}`}
                  onClick={() => pickParam(p.id)}
                >
                  <td className="mono-cell">{p.name}</td>
                  <td>{t(p.kind)}</td>
                  <td className="mono-cell">{`${fmtNum(p.spec)} ${p.unit}`}</td>
                  <td className="mono-cell">{`${fmtNum(p.fail)} ${p.unit}`}</td>
                  <td className="mono-cell">{`${fmtNum(pushed(p, pull))} ${p.unit}`}</td>
                  <td className="mono-cell">{`${m.toFixed(1)}%`}</td>
                  <td className="verdict">{t(st === 'fail' ? S.stFail : st === 'risk' ? S.stRisk : S.stOk)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Explain paras={[paramItem.text]} />
        <Callout tone={failed.length ? 'bad' : 'ok'}>
          {failed.length ? t(MARGIN_MSG.fail).replace('{x}', failed.map((p) => p.name).join(t(S.sep))) : t(MARGIN_MSG.none)}
        </Callout>
        <Callout tone="warn">
          {t(MARGIN_MSG.risk).replace(
            '{x}',
            MARGIN_PARAMS.filter((p) => marginPct(p) < RISK_PCT)
              .map((p) => p.name)
              .join(t(S.sep)),
          )}
        </Callout>
      </Section>

      {/* 3. Shmoo */}
      <Section title={t(S.shmooTitle)} note={t(S.shmooNote)}>
        {SHMOO_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="kind">
          {SHMOO_VECS.map((v) => {
            const st = shVerdict[v.id]
            return (
              <button
                key={v.id}
                type="button"
                className={`kind__btn${st === 'right' ? ' is-right' : st === 'wrong' ? ' is-wrong' : ''}`}
                onClick={() => pickVec(v.id)}
              >
                {v.name}
              </button>
            )
          })}
        </div>
        <figure className="term-fig">
          <ShmooFig vecs={SHMOO_VECS} picked={shPick} verdict={shVerdict} onPick={pickVec} />
        </figure>
        {shItem ? (
          <Callout tone={shItem.holes.length ? 'ok' : 'warn'}>
            <b>{t(shItem.holes.length ? SHMOO_RIGHT : SHMOO_WRONG)}</b> {t(shItem.text)}
          </Callout>
        ) : null}
      </Section>

      {/* 4. 分 Bin */}
      <Section title={t(S.binTitle)} note={t(S.binNote)}>
        {BIN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colKindF)}</th>
              <th />
              <th>{t(S.colExpect)}</th>
              <th>{t(S.colProg)}</th>
              <th>{t(S.colCheck)}</th>
            </tr>
          </thead>
          <tbody>
            {FAIL_KINDS.map((k) => {
              const done = (made[k.id] ?? 0) > 0
              const ok = k.prog === k.expect
              return (
                <tr key={k.id} className={done ? (ok ? 'is-pass' : 'is-fail') : ''}>
                  <td>{t(k.label)}</td>
                  <td>
                    <button
                      type="button"
                      className="lab__btn"
                      onClick={() => {
                        setMade((prev) => ({ ...prev, [k.id]: (prev[k.id] ?? 0) + 1 }))
                        setNote({ kicker: S.kicker, title: k.label, text: k.text })
                      }}
                    >
                      {t(S.make)}
                    </button>
                  </td>
                  <td className="mono-cell">{`Bin ${k.expect}`}</td>
                  <td className="mono-cell">{done ? `Bin ${k.prog}` : t(S.notYet)}</td>
                  <td className="verdict">{done ? t(ok ? S.match : S.mismatch) : t(S.notYet)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <h4 className="qual-sub">{t(S.sumTitle)}</h4>
        <table className="dtable">
          <thead>
            <tr>
              <th>Bin</th>
              {binList.map((b) => (
                <th key={b} className="mono-cell">
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t(S.sumMade)}</td>
              {binList.map((b) => (
                <td key={b} className="mono-cell">
                  {madeSum[b] ?? 0}
                </td>
              ))}
            </tr>
            <tr className={sumWrong ? 'is-fail' : ''}>
              <td>{t(S.sumProg)}</td>
              {binList.map((b) => (
                <td key={b} className={`mono-cell${(progSum[b] ?? 0) !== (madeSum[b] ?? 0) ? ' verdict' : ''}`}>
                  {progSum[b] ?? 0}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="row-actions">
          <button type="button" className="lab__btn" onClick={() => setMade({})}>
            {t(S.clearBin)}
          </button>
        </div>
        {sumWrong && (madeSum[1] ?? 0) === 0 ? <Callout tone="bad">{t(S.sumBad)}</Callout> : null}
        {sumWrong ? <Callout tone="bad">{t(FAIL_KINDS.find((k) => k.prog !== k.expect)?.text ?? '')}</Callout> : null}

        <h4 className="qual-sub">{t(S.tempTitle)}</h4>
        {TEMP_TEXT.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg options={TEMP_RANGES.map((r) => ({ id: r.id, label: r.label }))} value={range} onChange={setRange} />
        <Readout
          items={[
            { label: S.specRange, value: `${rangeItem.lo} ~ ${rangeItem.hi} °C` },
            { label: S.extRange, value: `${extLo} ~ ${extHi} °C`, state: 'pass' },
          ]}
        />
        <p className="intro__note">{`(${rangeItem.hi} − (${rangeItem.lo})) × 10% = ${ext} °C`}</p>
        <h4 className="qual-sub">{t(S.handlerTitle)}</h4>
        <p>{t(HANDLER_TEXT)}</p>
      </Section>

      {/* 5. 文档包 */}
      <Section title={t(S.docTitle)} note={t(S.docNote)}>
        <Readout items={[{ label: S.docDone, value: `${docCount} / ${DOCS.length}  (${Math.round((docCount / DOCS.length) * 100)}%)`, state: docCount === DOCS.length ? 'pass' : undefined }]} />
        <div className="qual-progress">
          <div style={{ width: `${(docCount / DOCS.length) * 100}%` }} />
        </div>
        <div className="qual-docs">
          {DOCS.map((d) => {
            const open = docOpen === d.id
            return (
              <div key={d.id} className={`qual-docs__item${open ? ' is-open' : ''}`}>
                <div className="qual-docs__head">
                  <input
                    type="checkbox"
                    checked={Boolean(docs[d.id])}
                    onChange={(e) => setDocs((prev) => ({ ...prev, [d.id]: e.target.checked }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDocOpen(open ? null : d.id)
                      setNote({ kicker: S.kicker, title: d.label, text: d.why })
                    }}
                  >
                    {t(d.label)}
                  </button>
                  <i>{open ? '▾' : '▸'}</i>
                </div>
                {open ? <p className="qual-docs__body">{t(d.why)}</p> : null}
              </div>
            )
          })}
        </div>
        {docCount === DOCS.length ? <Callout tone="ok">{t(DOC_DONE)}</Callout> : null}
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
