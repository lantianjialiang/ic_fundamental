import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  DROP_WARN,
  HW_NOTE,
  IDDT_PCT,
  IH_MA,
  ILIM_MA,
  MODE_NOTE,
  PARAMS,
  PATTERNS,
  POWER_DOWN,
  POWER_UP,
  PREVENT,
  QUIZ,
  RON,
  SCR_LEAD,
  SCR_NOTE,
  SCR_TEXT,
  STEP_TITLES,
  STIM_LEAD,
  TAKEAWAY,
  TEST_LEAD,
  TRIGGERS,
  TRIG_MA,
  VDDMAX,
  VDDOVR,
  VERDICT_TEXT,
  VON,
  fmtIdd,
  nextMode,
  onCurrent,
  simulate,
  stepDetail,
  trigName,
  vbo,
  type Chip,
  type Pol,
  type ScrMode,
  type TestMode,
} from './data/latch'
import { LatchSeqFig, ScrCircuitFig, ScrIvFig } from './LatchFig'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, type Note } from './parts'
import './latch.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('闩锁'),
  later: loc('闩锁测的是“故意点火”的结果；下一课换一个角度：怎么让芯片里的触发器变得可控、可观察。'),
  scrTitle: loc('寄生 SCR 从哪来'),
  off: loc('未触发'),
  on: loc('触发后（正反馈）'),
  ivTitle: loc('动手：SCR 伏安特性'),
  ivNote: loc('拖滑块改阳极电压、门极电流和外部电阻。SCR 是有记忆的：触发后会一直锁着。'),
  vs: loc('阳极电压 VDD'),
  ig: loc('门极注入电流'),
  r: loc('外部串联电阻'),
  limOn: loc('电源限流 300 mA：开'),
  limOff: loc('电源限流：关'),
  powerOff: loc('掉电（VDD → 0）'),
  power5: loc('上电到 5 V'),
  state: loc('状态'),
  sBlock: loc('阻断'),
  sOn: loc('闩锁'),
  sFizzle: loc('触发后熄灭'),
  curVbo: loc('当前 VBO'),
  cur: loc('电流'),
  pwr: loc('SCR 功耗'),
  vsLim: loc('和 300 mA 限流比'),
  under: loc('未到限流'),
  atLim: loc('被限流卡住'),
  over: loc('超过！'),
  burn: loc('没有限流，{i} 的电流灌过芯片，SCR 自己就要耗掉 {p}。金属线和焊线几秒钟就会烧断——闩锁测试时一定要限流。'),
  trigTitle: loc('三种常见触发源'),
  paramTitle: loc('闩锁测试参数'),
  paramNote: loc('点一行看它在测试里的作用。'),
  colSym: loc('参数'),
  colDef: loc('定义'),
  colTyp: loc('典型值'),
  patTitle: loc('四种测试向量'),
  hwTitle: loc('测试硬件注意'),
  simTitle: loc('动手：闩锁测试流程模拟器'),
  simNote: loc('选测试类型和芯片，单步或自动播放这 11 步。看 VDD 和 IDD 怎么变。'),
  mVbo: loc('VBO 过压测试'),
  mIn: loc('输入脚触发电流'),
  mHiz: loc('高阻脚'),
  mOut: loc('输出脚'),
  pHi: loc('TRIGIH：灌入 +20 mA'),
  pLo: loc('TRIGIL：抽出 −20 mA'),
  oLo: loc('低态 + TRIGIL'),
  oHi: loc('高态 + TRIGIH'),
  cGood: loc('好芯片'),
  cLatch: loc('会被触发的芯片'),
  cLeaky: loc('初始 IDD 就超标的芯片'),
  drop: loc('犯个错：撤触发时掉电'),
  step: loc('下一步'),
  play: loc('自动播放'),
  pause: loc('暂停'),
  reset: loc('重来'),
  nowStep: loc('当前步'),
  vddNow: loc('VDD'),
  iddNow: loc('IDD'),
  window: loc('IDD1 ± 5%'),
  result: loc('结果'),
  notYet: loc('点“下一步”开始。'),
  skipped: loc('跳过'),
  rule: loc('关键：从第 1 步到第 8 步，VDD 一直不低于 VDDMAX。第一次和第二次 IDD 测量之间绝不掉电。'),
  stimTitle: loc('施加激励的顺序'),
  up: loc('上电顺序'),
  down: loc('下电顺序'),
}

type Scr = { vs: number; ig: number; r: number; limit: boolean; mode: ScrMode }

const MODE_LABEL: Record<ScrMode, typeof S.sOn> = { block: S.sBlock, on: S.sOn, fizzle: S.sFizzle }

export function FundLatchPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: S.scrTitle, text: SCR_LEAD[1] })
  const [fired, setFired] = useState(false)
  const [scr, setScr] = useState<Scr>({ vs: 5, ig: 0, r: 10, limit: true, mode: 'block' })
  const [trig, setTrig] = useState('rail')
  const [param, setParam] = useState('VDDMAX')
  // 流程模拟器
  const [mode, setMode] = useState<TestMode>('vbo')
  const [pol, setPol] = useState<Pol>('hi')
  const [chip, setChip] = useState<Chip>('latch')
  const [drop, setDrop] = useState(false)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const sim = simulate(mode, chip, drop)
  const maxStep = sim.abortAt ? sim.abortAt + 1 : 11
  const atEnd = step >= maxStep

  useEffect(() => {
    if (!playing || atEnd) return
    const id = window.setInterval(() => setStep((v) => Math.min(v + 1, maxStep)), 900)
    return () => window.clearInterval(id)
  }, [playing, atEnd, maxStep])

  const resetSim = () => {
    setStep(0)
    setPlaying(false)
  }

  const updScr = (patch: Partial<Omit<Scr, 'mode'>>) => {
    const n = { ...scr, ...patch }
    const m = nextMode(scr.mode, n.vs, n.ig, n.r, n.limit)
    if (m !== scr.mode) setNote({ kicker: S.kicker, title: MODE_LABEL[m], text: SCR_TEXT[m] })
    setScr({ ...n, mode: m })
  }

  /* ---- SCR 读数 ---- */
  const iOn = onCurrent(scr.vs, scr.r, scr.limit)
  const latched = scr.mode === 'on'
  const iNow = latched ? iOn : 0
  const vak = latched ? VON + (iOn * RON) / 1000 : scr.vs
  const pW = (vak * iNow) / 1000
  const fmtI = (ma: number) => (ma >= 1000 ? `${(ma / 1000).toFixed(2)} A` : `${ma.toFixed(ma < 10 ? 2 : 0)} mA`)
  const fmtP = (w: number) => (w >= 1 ? `${w.toFixed(2)} W` : `${(w * 1000).toFixed(0)} mW`)
  const limState = !latched ? S.under : scr.limit && iOn >= ILIM_MA ? S.atLim : iOn > ILIM_MA ? S.over : S.under

  /* ---- 流程模拟 ---- */
  const pt = sim.points[step]
  const aborted = sim.abortAt > 0 && step > sim.abortAt
  const finished = (sim.abortAt > 0 && step >= maxStep) || step >= 11
  const verdictKey = sim.verdict
  const trigLabel = trigName(mode, pol)
  const trigVal = mode === 'vbo' ? `VDDOVR = ${VDDOVR.toFixed(1)} V` : `${trigLabel} = ${pol === 'hi' ? '+' : '−'}${TRIG_MA} mA`
  const outLine = `${verdictKey === 'pass' ? 'NO LATCH-UP · PASS' : verdictKey === 'latch' ? 'LATCH-UP · FAIL' : 'INITIAL IDDQ FAIL'} · VDD = ${VDDMAX} V · IDD1 = ${fmtIdd(sim.idd1)}${verdictKey === 'abort' ? '' : ` · IDD = ${fmtIdd(sim.idd2)} · ${trigVal}${mode === 'vbo' ? '' : ' · PIN A3'}`}`

  const polOptions =
    mode === 'output'
      ? [
          { id: 'lo' as const, label: S.oLo },
          { id: 'hi' as const, label: S.oHi },
        ]
      : [
          { id: 'hi' as const, label: S.pHi },
          { id: 'lo' as const, label: S.pLo },
        ]

  const trigItem = TRIGGERS.find((c) => c.id === trig)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fLatch.title)}
      goal={t(ui.fLatch.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fScan"
      nextLabel={t(ui.fund.next) + t(ui.fScan.title)}
    >
      {/* 1. 寄生 SCR */}
      <Section title={t(S.scrTitle)}>
        {SCR_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'off' as const, label: S.off },
            { id: 'on' as const, label: S.on },
          ]}
          value={fired ? 'on' : 'off'}
          onChange={(id) => setFired(id === 'on')}
        />
        <ScrCircuitFig fired={fired} />
      </Section>

      {/* 2. 伏安特性 */}
      <Section title={t(S.ivTitle)} note={t(S.ivNote)}>
        <div className="knob-row">
          <Knob label={S.vs} value={scr.vs} unit="V" min={0} max={10} step={0.1} onChange={(v) => updScr({ vs: v })} />
          <Knob label={S.ig} value={scr.ig} unit="mA" min={0} max={25} step={0.5} onChange={(v) => updScr({ ig: v })} />
          <Knob label={S.r} value={scr.r} unit="Ω" min={1} max={100} step={1} onChange={(v) => updScr({ r: v })} />
        </div>
        <div className="row-actions">
          <Seg
            options={[
              { id: 'on' as const, label: S.limOn },
              { id: 'off' as const, label: S.limOff },
            ]}
            value={scr.limit ? 'on' : 'off'}
            onChange={(id) => updScr({ limit: id === 'on' })}
          />
          <button type="button" className="lab__btn" onClick={() => updScr({ vs: 0 })}>
            {t(S.powerOff)}
          </button>
          <button type="button" className="lab__btn" onClick={() => updScr({ vs: 5 })}>
            {t(S.power5)}
          </button>
        </div>
        <ScrIvFig vs={scr.vs} ig={scr.ig} r={scr.r} limit={scr.limit} mode={scr.mode} />
        <Readout
          items={[
            { label: S.state, value: t(MODE_LABEL[scr.mode]), state: latched ? 'fail' : 'pass' },
            { label: S.curVbo, value: `${vbo(scr.ig).toFixed(2)} V` },
            { label: S.cur, value: latched ? fmtI(iNow) : '≈ 0' },
            { label: S.pwr, value: latched ? fmtP(pW) : '≈ 0' },
            { label: S.vsLim, value: t(limState), state: latched && iOn > ILIM_MA ? 'fail' : undefined },
          ]}
        />
        <Callout tone={latched ? 'bad' : scr.mode === 'fizzle' ? 'warn' : 'ok'}>{t(SCR_TEXT[scr.mode])}</Callout>
        {latched && !scr.limit && iOn > 1000 ? (
          <Callout tone="bad">{t(S.burn).replace('{i}', fmtI(iOn)).replace('{p}', fmtP(pW))}</Callout>
        ) : null}
        <p className="intro__note">{`IH = ${IH_MA} mA · VON ≈ ${VON.toFixed(1)} V · ${t(SCR_NOTE)}`}</p>
      </Section>

      {/* 3. 触发源 */}
      <Section title={t(S.trigTitle)}>
        <Cards
          items={TRIGGERS}
          activeId={trig}
          onPick={(item) => {
            setTrig(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {trigItem ? <Explain paras={[trigItem.text, ...(trigItem.explain ?? [])]} /> : null}
        <Callout>{t(PREVENT)}</Callout>
      </Section>

      {/* 4. 参数表 */}
      <Section title={t(S.paramTitle)} note={t(S.paramNote)}>
        {TEST_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <table className="dtable latch-params">
          <thead>
            <tr>
              <th>{t(S.colSym)}</th>
              <th>{t(S.colDef)}</th>
              <th>{t(S.colTyp)}</th>
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((p) => (
              <tr
                key={p.sym}
                className={`is-click${p.sym === param ? ' is-active' : ''}`}
                onClick={() => {
                  setParam(p.sym)
                  setNote({ kicker: S.kicker, title: p.sym, text: p.text })
                }}
              >
                <td className="mono-cell">{p.sym}</td>
                <td>{t(p.def)}</td>
                <td className="typ">{t(p.typ)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Explain paras={[PARAMS.find((p) => p.sym === param)?.text ?? '']} />
        <div className="latch-cols">
          <div>
            <h4 className="latch-sub">{t(S.patTitle)}</h4>
            <Steps items={PATTERNS} />
          </div>
          <div>
            <h4 className="latch-sub">{t(S.hwTitle)}</h4>
            <Callout tone="warn">
              {HW_NOTE.map((para) => (
                <p key={para.zh}>{t(para)}</p>
              ))}
            </Callout>
          </div>
        </div>
      </Section>

      {/* 5. 流程模拟器 */}
      <Section title={t(S.simTitle)} note={t(S.simNote)}>
        <div className="row-actions">
          <Seg
            options={[
              { id: 'vbo' as const, label: S.mVbo },
              { id: 'input' as const, label: S.mIn },
              { id: 'hiz' as const, label: S.mHiz },
              { id: 'output' as const, label: S.mOut },
            ]}
            value={mode}
            onChange={(id) => {
              setMode(id)
              resetSim()
              setNote({ kicker: S.kicker, title: id === 'vbo' ? S.mVbo : id === 'input' ? S.mIn : id === 'hiz' ? S.mHiz : S.mOut, text: MODE_NOTE[id] })
            }}
          />
        </div>
        {mode === 'vbo' ? null : (
          <div className="row-actions">
            <Seg
              options={polOptions}
              value={pol}
              onChange={(id) => {
                setPol(id)
                resetSim()
              }}
            />
          </div>
        )}
        <div className="row-actions">
          <Seg
            options={[
              { id: 'good' as const, label: S.cGood },
              { id: 'latch' as const, label: S.cLatch },
              { id: 'leaky' as const, label: S.cLeaky },
            ]}
            value={chip}
            onChange={(id) => {
              setChip(id)
              resetSim()
            }}
          />
          <button
            type="button"
            className={`kind__btn${drop ? ' is-wrong' : ''}`}
            onClick={() => {
              setDrop((v) => !v)
              resetSim()
            }}
          >
            {t(S.drop)}
          </button>
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={atEnd} onClick={() => setStep((v) => Math.min(v + 1, maxStep))}>
            {t(S.step)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (atEnd) setStep(0)
              setPlaying((p) => (atEnd ? true : !p))
            }}
          >
            {t(playing && !atEnd ? S.pause : S.play)}
          </button>
          <button type="button" className="lab__btn" onClick={resetSim}>
            {t(S.reset)}
          </button>
        </div>
        <LatchSeqFig points={sim.points} step={step} />
        <Readout
          items={[
            { label: S.nowStep, value: step === 0 ? '—' : `${step} / 11` },
            { label: S.vddNow, value: `${pt.vdd.toFixed(2)} V`, state: pt.vdd > VDDMAX ? 'fail' : undefined },
            { label: S.iddNow, value: pt.idd === 0 ? '0' : fmtIdd(pt.idd), state: pt.idd > 1000 ? 'fail' : undefined },
            { label: 'IDD1', value: step >= 3 ? fmtIdd(sim.idd1) : '—' },
            {
              label: S.window,
              value: step >= 3 && !sim.abortAt ? `${fmtIdd(sim.idd1 * (1 - IDDT_PCT / 100))} – ${fmtIdd(sim.idd1 * (1 + IDDT_PCT / 100))}` : '—',
            },
            {
              label: S.result,
              value: finished ? (verdictKey === 'pass' ? 'PASS' : verdictKey === 'latch' ? 'FAIL' : 'ABORT') : '…',
              state: finished ? (verdictKey === 'pass' ? 'pass' : 'fail') : undefined,
            },
          ]}
        />
        <ol className="latch-steps">
          {STEP_TITLES.map((title, i) => {
            const n = i + 1
            const skip = sim.abortAt > 0 && n > sim.abortAt
            let cls = ''
            if (skip) cls = 'is-skip'
            else if (sim.abortAt > 0 && n === sim.abortAt && step >= n) cls = 'is-bad'
            else if (n === step) cls = 'is-now'
            else if (n < step) cls = 'is-done'
            const showDetail = !skip && n <= step
            return (
              <li key={title.zh} className={cls}>
                <b>{t(title)}</b>
                {skip ? ` · ${t(S.skipped)}` : null}
                {showDetail ? <span>{t(stepDetail(i, mode, pol))}</span> : null}
              </li>
            )
          })}
        </ol>
        {step === 0 ? <p className="intro__note">{t(S.notYet)}</p> : null}
        {aborted || finished ? (
          <Callout tone={verdictKey === 'pass' ? (drop && chip === 'latch' ? 'bad' : 'ok') : 'bad'}>
            <p>{t(VERDICT_TEXT[verdictKey])}</p>
            <pre className="code" style={{ margin: '8px 0 0' }}>
              {outLine}
            </pre>
          </Callout>
        ) : null}
        {drop ? <Callout tone="bad">{t(DROP_WARN)}</Callout> : <Callout tone="warn">{t(S.rule)}</Callout>}
      </Section>

      {/* 6. 施加激励的顺序 */}
      <Section title={t(S.stimTitle)} note={t(STIM_LEAD)}>
        <div className="latch-cols">
          <div>
            <h4 className="latch-sub">{t(S.up)}</h4>
            <Steps items={POWER_UP} />
          </div>
          <div>
            <h4 className="latch-sub">{t(S.down)}</h4>
            <Steps items={POWER_DOWN} />
          </div>
        </div>
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
