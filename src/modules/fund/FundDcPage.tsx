import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  BINS,
  FLOWS,
  FLOW_ITEMS,
  IDDQ_BAD,
  IDDQ_GOOD,
  IDDQ_LIMIT,
  IDD_KINDS,
  IN_LEAK,
  IN_LIMIT,
  IN_MEAS_MS,
  IN_METHODS,
  IN_PINS,
  IOS_STEPS,
  IOS_WHY,
  OHMS,
  OHM_LEAD,
  OTHER,
  QUIZ,
  SUMMARY,
  TAKEAWAY,
  VOX_DIAG,
  VOX_STEPS,
  WORDS,
  expectedMs,
  voxReading,
  type InMethod,
} from './data/dc'
import { EQ_ITEMS } from './data/dcEq'
import { DcEqFig } from './DcEqFig'
import { DriverFig } from './DriverFig'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, fmtOhm, fmtV, type Note } from './parts'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  wordTitle: loc('先立四个词', 'Four terms first'),
  binTitle: loc('Bin 表示例', 'Example bin table'),
  binNote: loc('软 Bin 记录“哪一项挂了”，硬 Bin 决定“放进哪个料盒”。', 'Soft bins record "which test failed"; hard bins decide "which tray it goes in".'),
  colSoft: loc('软 Bin', 'Soft bin'),
  colItem: loc('失败项', 'Failing test'),
  colHard: loc('硬 Bin', 'Hard bin'),
  colMeaning: loc('含义', 'Meaning'),
  summaryTitle: loc('测试总结（Test Summary）', 'Test summary'),
  flowTitle: loc('测试顺序影响平均测试时间', 'Test order affects average test time'),
  flowNote: loc('遇到第一项 Fail 就停。坏片越早停下，平均时间越短；良品永远要跑完全程。', 'Stop at the first Fail. The earlier bad parts stop, the shorter the average time; good parts always run the full flow.'),
  flowBook: loc('教科书顺序', 'Textbook order'),
  flowSorted: loc('按失败率重排', 'Sorted by fail rate'),
  flowAvg: loc('平均每颗', 'Average per part'),
  flowGood: loc('良品每颗', 'Per good part'),
  flowFail: loc('失败率', 'fail rate'),
  flowDep: loc('开短路必须第一，粗功能必须在 DC 前——有依赖的项不能为了省时间乱排。', 'Opens/shorts must be first and gross functional must precede DC - dependent tests cannot be reordered just to save time.'),
  ohmTitle: loc('每条规格背后的电阻', 'The resistance behind each spec'),
  ohmCalc: loc('自己算：', 'Try it:'),
  colName: loc('项目', 'Item'),
  colV: loc('电压', 'Voltage'),
  colI: loc('电流', 'Current'),
  colR: loc('R = V / I', 'R = V / I'),
  eqTitle: loc('每一项测试的等效电路', 'The equivalent circuit of each test'),
  eqNote: loc(
    '点一项，看测试时芯片在 PMU / DPS 眼里等效成什么。为什么开短路是二极管、VOL / VOH 是电阻，见「常见问题」。',
    'Pick a test to see what the chip looks like to the PMU / DPS during it. For why opens/shorts sees diodes but VOL / VOH sees resistors, see the FAQ.',
  ),
  eqForce: loc('强加', 'Force'),
  eqMeasure: loc('测量', 'Measure'),
  eqLimit: loc('判定', 'Limit'),
  voxTitle: loc('VOH / VOL：串行静态测法', 'VOH / VOL: serial static method'),
  voxLab: loc('动手：让 VOH / VOL 通过或失败', 'Hands-on: make VOH / VOL pass or fail'),
  voxLabNote: loc('改驱动强度，或者故意让预处理放错状态，看读数和诊断怎么变。', 'Change the drive strength, or deliberately precondition the wrong state, and watch the reading and diagnosis change.'),
  testVol: loc('测 VOL', 'Test VOL'),
  testVoh: loc('测 VOH', 'Test VOH'),
  stateOk: loc('预处理正确', 'Correct precondition'),
  stateBad: loc('预处理放错状态', 'Wrong state'),
  rn: loc('下拉电阻 Rn', 'Pull-down Rn'),
  rp: loc('上拉电阻 Rp', 'Pull-up Rp'),
  read: loc('读数', 'Reading'),
  limit: loc('极限', 'Limit'),
  iddTitle: loc('IDD 的四种测法', 'Four ways to test IDD'),
  iddqLab: loc('IDDQ：在 8 个向量停点量静态电流（纵轴为对数刻度）', 'IDDQ: quiescent current at 8 vector stops (log scale)'),
  iddqGood: loc('良品', 'Good part'),
  iddqBad: loc('有桥接缺陷', 'Bridging defect'),
  iddqLimit: loc('极限', 'Limit'),
  inTitle: loc('IIL / IIH：串行、并行、并联', 'IIL / IIH: serial, parallel, ganged'),
  inNote: loc('12 个输入脚，每脚极限 ±10 µA。每次 PMU 量测约 2 ms，IIL、IIH 各量一次。先看 A5 漏 35 µA 的坏片，再切到良品，比较三种测法的时间。', '12 input pins, each with a ±10 µA limit. Each PMU measurement takes about 2 ms; IIL and IIH are each measured once. Start with a bad part whose A5 leaks 35 µA, then switch to a good part, and compare the test time of the three methods.'),
  inGood: loc('良品', 'Good part'),
  inBad: loc('A5 漏电', 'A5 leaks'),
  inTime: loc('测试时间', 'Test time'),
  inResult: loc('结果', 'Result'),
  inGangLimit: loc('并联极限 = 单脚极限', 'Ganged limit = single-pin limit'),
  inAllPass: loc('全部 PASS', 'All PASS'),
  inFound: loc('找到 A5', 'A5 found'),
  inRetest: loc('并联超限，逐脚串行复测：', 'Ganged limit exceeded; serial retest pin by pin:'),
  inGangPass: loc('总电流没超过单脚极限，所有脚一次判 PASS，不用复测。', 'The total stays under the single-pin limit, so every pin passes in one measurement and no retest is needed.'),
  colPin: loc('管脚', 'Pin'),
  colIih: loc('IIH', 'IIH'),
  colVerdict: loc('判定', 'Verdict'),
  total: loc('总和', 'Total'),
  otherTitle: loc('其他 DC 项', 'Other DC tests'),
  iosTitle: loc('IOS：不热切换的步骤', 'IOS: steps without hot switching'),
  kicker: loc('DC 参数', 'DC parameters'),
  later: loc('DC 都过了，下一课用向量跑功能。', 'With DC passed, the next lesson runs functional vectors.'),
}

export function FundDcPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [word, setWord] = useState(WORDS[0].id)
  const [flow, setFlow] = useState<'book' | 'sorted'>('book')
  const [ohmId, setOhmId] = useState(OHMS[0].id)
  const [calcV, setCalcV] = useState(0.4)
  const [calcI, setCalcI] = useState(8)
  const [test, setTest] = useState<'vol' | 'voh'>('vol')
  const [state, setState] = useState<'ok' | 'bad'>('ok')
  const [rn, setRn] = useState(40)
  const [rp, setRp] = useState(350)
  const [idd, setIdd] = useState(IDD_KINDS[0].id)
  const [iddqBad, setIddqBad] = useState(false)
  const [inMethod, setInMethod] = useState<InMethod>(IN_METHODS[0].id)
  const [inLeaky, setInLeaky] = useState(true)
  const [other, setOther] = useState(OTHER[0].id)
  const [eqId, setEqId] = useState(EQ_ITEMS[0].id)
  const eq = EQ_ITEMS.find((item) => item.id === eqId) ?? EQ_ITEMS[0]
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: WORDS[0].title, text: WORDS[0].text })

  const order = FLOWS[flow]
  const avg = expectedMs(order)
  const goodMs = order.reduce((sum, id) => sum + FLOW_ITEMS[id].ms, 0)

  const wrong = state === 'bad'
  const volt = voxReading(test, rn, rp, wrong)
  const pass = test === 'vol' ? volt <= 0.4 : volt >= 2.4
  const diag = pass ? VOX_DIAG.pass : !wrong ? VOX_DIAG.weak : test === 'vol' ? VOX_DIAG.wrongVol : VOX_DIAG.wrongVoh
  const outHigh = test === 'vol' ? wrong : !wrong

  const iddq = iddqBad ? IDDQ_BAD : IDDQ_GOOD
  const iddqPass = iddq.every((value) => value <= IDDQ_LIMIT)

  const leaks = IN_PINS.map((pin) => (inLeaky ? IN_LEAK[pin] : undefined) ?? 0.05 + (pin.length % 3) * 0.02)
  const gangTotal = leaks.reduce((sum, value) => sum + value, 0)
  const gangFail = gangTotal > IN_LIMIT
  const serialMs = 2 * IN_PINS.length * IN_MEAS_MS
  const inMs =
    inMethod === 'serial' ? serialMs : inMethod === 'parallel' ? 2 * IN_MEAS_MS : 2 * IN_MEAS_MS + (gangFail ? serialMs : 0)
  const showPins = inMethod !== 'gang' || gangFail

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m20.title)}
      goal={t(ui.m20.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fFunc"
      nextLabel={t(ui.fund.next) + t(ui.m21.title)}
    >
      <Section title={t(S.wordTitle)}>
        <Cards
          items={WORDS}
          activeId={word}
          cols={4}
          onPick={(item) => {
            setWord(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={WORDS.find((item) => item.id === word)?.explain} />
      </Section>

      <Section title={t(S.binTitle)} note={t(S.binNote)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colSoft)}</th>
              <th>{t(S.colItem)}</th>
              <th>{t(S.colHard)}</th>
              <th>{t(S.colMeaning)}</th>
            </tr>
          </thead>
          <tbody>
            {BINS.map((row) => (
              <tr key={row.soft}>
                <td className="mono-cell">{row.soft}</td>
                <td>{t(row.item)}</td>
                <td className="mono-cell">{row.hard}</td>
                <td>{t(row.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>{t(S.summaryTitle)}</h3>
        {SUMMARY.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <Seg
          options={[
            { id: 'book' as const, label: S.flowBook },
            { id: 'sorted' as const, label: S.flowSorted },
          ]}
          value={flow}
          onChange={setFlow}
        />
        <ol className="flow-steps">
          {order.map((id) => {
            const item = FLOW_ITEMS[id]
            return (
              <li key={id}>
                <b>{t(item.name)}</b> · {item.ms} ms · {t(S.flowFail)} {(item.fail * 100).toFixed(1)}%
              </li>
            )
          })}
        </ol>
        <Readout
          items={[
            { label: S.flowAvg, value: `${avg.toFixed(1)} ms` },
            { label: S.flowGood, value: `${goodMs} ms` },
          ]}
        />
        <Callout tone="warn">{t(S.flowDep)}</Callout>
      </Section>

      <Section title={t(S.ohmTitle)} note={t(OHM_LEAD)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colName)}</th>
              <th>{t(S.colV)}</th>
              <th>{t(S.colI)}</th>
              <th>{t(S.colR)}</th>
            </tr>
          </thead>
          <tbody>
            {OHMS.map((row) => {
              const r = row.id === 'ios' ? `${fmtOhm(5.25 / 85e-3)} – ${fmtOhm(5.25 / 30e-3)}` : fmtOhm(row.v / row.i)
              return (
                <tr
                  key={row.id}
                  className={`is-click${row.id === ohmId ? ' is-active' : ''}`}
                  onClick={() => {
                    setOhmId(row.id)
                    setNote({ kicker: S.kicker, title: `${row.name} → ${r}`, text: row.text })
                  }}
                >
                  <td className="mono-cell">{row.name}</td>
                  <td className="mono-cell">{row.vText}</td>
                  <td className="mono-cell">{row.iText}</td>
                  <td className="mono-cell">{r}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Explain paras={[OHMS.find((row) => row.id === ohmId)?.text ?? '']} />
        <div className="calc">
          <span>{t(S.ohmCalc)}</span>
          <input type="number" step="0.01" value={calcV} onChange={(e) => setCalcV(Number(e.target.value))} />
          <span>V ÷</span>
          <input type="number" step="0.001" value={calcI} onChange={(e) => setCalcI(Number(e.target.value))} />
          <span>mA =</span>
          <b>{calcI > 0 ? fmtOhm(calcV / (calcI * 1e-3)) : '—'}</b>
        </div>
      </Section>

      <Section title={t(S.eqTitle)} note={t(S.eqNote)}>
        <Cards
          items={EQ_ITEMS}
          activeId={eqId}
          cols={4}
          onPick={(item) => {
            setEqId(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <DcEqFig item={eq} />
        <Readout
          items={[
            { label: S.eqForce, value: t(eq.force) },
            { label: S.eqMeasure, value: t(eq.measure) },
            { label: S.eqLimit, value: t(eq.limit) },
          ]}
        />
        <Explain paras={[eq.text, ...(eq.explain ?? [])]} />
      </Section>
      <Section title={t(S.voxTitle)}>
        <Steps items={VOX_STEPS} />
        <h3>{t(S.voxLab)}</h3>
        <p className="intro__note">{t(S.voxLabNote)}</p>
        <Seg
          options={[
            { id: 'vol' as const, label: S.testVol },
            { id: 'voh' as const, label: S.testVoh },
          ]}
          value={test}
          onChange={setTest}
        />{' '}
        <Seg
          options={[
            { id: 'ok' as const, label: S.stateOk },
            { id: 'bad' as const, label: S.stateBad },
          ]}
          value={state}
          onChange={setState}
        />
        <div className="knob-row">
          <Knob label={S.rn} value={rn} unit="Ω" min={10} max={100} step={2} onChange={setRn} />
          <Knob label={S.rp} value={rp} unit="Ω" min={100} max={700} step={10} onChange={setRp} />
        </div>
        <DriverFig test={test} high={outHigh} rn={rn} rp={rp} volt={volt} />
        <Readout
          items={[
            { label: S.read, value: fmtV(volt), state: pass ? 'pass' : 'fail' },
            { label: S.limit, value: test === 'vol' ? '≤ 0.40 V' : '≥ 2.40 V' },
          ]}
        />
        <Callout tone={pass ? 'ok' : wrong ? 'bad' : 'warn'}>{t(diag)}</Callout>
      </Section>

      <Section title={t(S.iddTitle)}>
        <Cards
          items={IDD_KINDS}
          activeId={idd}
          cols={4}
          onPick={(item) => {
            setIdd(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={IDD_KINDS.find((item) => item.id === idd)?.explain} />
        <h3>{t(S.iddqLab)}</h3>
        <Seg
          options={[
            { id: 'good', label: S.iddqGood },
            { id: 'bad', label: S.iddqBad },
          ]}
          value={iddqBad ? 'bad' : 'good'}
          onChange={(id) => setIddqBad(id === 'bad')}
        />
        <div className="bars">
          <div className="bars__limit" style={{ bottom: `${(Math.log10(IDDQ_LIMIT) / Math.log10(300)) * 100}%` }}>
            <span>
              {t(S.iddqLimit)} {IDDQ_LIMIT} µA
            </span>
          </div>
          {iddq.map((value, index) => (
            <div key={index} className="bars__col">
              <div
                className={`bars__fill${value > IDDQ_LIMIT ? ' is-bad' : ''}`}
                style={{ height: `${(Math.log10(Math.max(value, 1)) / Math.log10(300)) * 100}%` }}
              />
              <span>V{index + 1}</span>
              <em>{value} µA</em>
            </div>
          ))}
        </div>
        <Callout tone={iddqPass ? 'ok' : 'bad'}>
          {iddqPass
            ? t(loc('8 个停点都在几 µA。PASS。', 'All 8 stops are at a few µA. PASS.'))
            : t(loc('V3、V6 两个状态电流跳到 160 µA 以上：某两根线在这两个状态下被驱动成相反电平，桥接点导通。功能可能是对的，但 IDDQ 判 FAIL。', 'In states V3 and V6 the current jumps above 160 µA: two wires are driven to opposite levels in these states and the bridge conducts. Function may be correct, but IDDQ judges FAIL.'))}
        </Callout>
      </Section>

      <Section title={t(S.inTitle)} note={t(S.inNote)}>
        <Seg options={IN_METHODS.map((m) => ({ id: m.id, label: m.label }))} value={inMethod} onChange={setInMethod} />
        <Seg
          options={[
            { id: 'bad', label: S.inBad },
            { id: 'good', label: S.inGood },
          ]}
          value={inLeaky ? 'bad' : 'good'}
          onChange={(id) => setInLeaky(id === 'bad')}
        />
        <p>{t(IN_METHODS.find((m) => m.id === inMethod)?.text ?? '')}</p>
        <Readout
          items={[
            { label: S.inTime, value: `${inMs} ms` },
            {
              label: S.inResult,
              value: t(inLeaky ? S.inFound : S.inAllPass),
              state: inLeaky ? 'fail' : 'pass',
            },
          ]}
        />
        {inMethod === 'gang' ? (
          <table className="dtable">
            <tbody>
              <tr className={gangFail ? 'is-fail' : 'is-pass'}>
                <td>{t(S.total)} IIH</td>
                <td className="mono-cell">{gangTotal.toFixed(1)} µA</td>
                <td className="mono-cell">
                  {t(S.inGangLimit)} = {IN_LIMIT} µA
                </td>
                <td className="verdict">{gangFail ? 'FAIL' : 'PASS'}</td>
              </tr>
            </tbody>
          </table>
        ) : null}
        {inMethod === 'gang' ? <p>{t(gangFail ? S.inRetest : S.inGangPass)}</p> : null}
        {showPins ? (
          <table className="dtable">
            <thead>
              <tr>
                <th>{t(S.colPin)}</th>
                <th>{t(S.colIih)}</th>
                <th>{t(S.colVerdict)}</th>
              </tr>
            </thead>
            <tbody>
              {IN_PINS.map((pin, index) => {
                const bad = leaks[index] > IN_LIMIT
                return (
                  <tr key={pin} className={bad ? 'is-fail' : 'is-pass'}>
                    <td className="mono-cell">{pin}</td>
                    <td className="mono-cell">{leaks[index].toFixed(2)} µA</td>
                    <td className="verdict">{bad ? 'FAIL' : 'PASS'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : null}
      </Section>

      <Section title={t(S.otherTitle)}>
        <Cards
          items={OTHER}
          activeId={other}
          onPick={(item) => {
            setOther(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={OTHER.find((item) => item.id === other)?.explain} />
        <h3>{t(S.iosTitle)}</h3>
        <Steps items={IOS_STEPS} />
        <Callout tone="warn">{t(IOS_WHY)}</Callout>
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
