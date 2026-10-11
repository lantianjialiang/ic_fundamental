import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  ABILITIES,
  ATPG_NOTE,
  CALC_NOTE,
  CHAIN_CLOCKS,
  CHAIN_FAULT_TIP,
  CHAIN_INIT_NOTE,
  CHAIN_N,
  CHAIN_TEXT,
  COMB_FAULTS,
  LSSD_LEAD,
  MEM_CARDS,
  MODE_TEXT,
  PATH_LEAD,
  PHASES,
  PHASE_TEXT,
  QUIZ,
  TAKEAWAY,
  TESTER_LEAD,
  WHY_LEAD,
  chainStates,
  comb,
  scanCalc,
  scanPhases,
  sdiSeq,
  type Bit,
  type ChainTest,
  type CombFault,
  type StuckFault,
} from './data/scan'
import { type Seg as WaveSeg } from './data/func'
import { Callout, Cards, Explain, Knob, Readout, Seg, type Note } from './parts'
import { ChainFig, ScanModelFig, ScanStepFig } from './ScanFig'
import { WaveRows } from './WaveRows'
import './scan.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('Scan', 'Scan'),
  later: loc('基础单元到这里就学完了。Scan 触发器的电路结构和链的插入方式见 {@scan}；想让测试结果跟着自己的手变，去 {@bench} 动手试试。', 'This completes the fundamentals. For the scan flip-flop circuit and how chains are inserted, see {@scan}; to see test results respond to your own hands, try {@bench}.'),
  whyTitle: loc('同步时序电路为什么难测', 'Why synchronous sequential circuits are hard to test'),
  pathTitle: loc('动手：加入 Scan 路径', 'Hands-on: add the scan path'),
  pathNote: loc('切换 Scan Select，看哪条路径在工作。', 'Toggle Scan Select and see which path is active.'),
  normal: loc('Scan Select 关：正常模式', 'Scan Select off: normal mode'),
  scanOn: loc('Scan Select 开：Scan 模式', 'Scan Select on: scan mode'),
  abilityTitle: loc('Scan 带来的三项测试能力', 'Three test capabilities scan provides'),
  chainTitle: loc('动手：Flush 测试与 Shift 测试', 'Hands-on: flush test and shift test'),
  chainNote: loc('一条 8 个触发器的链。单步或自动打时钟，看数据怎么流过链、SDO 上出来什么。再注入一个 stuck 故障，看能不能从输出推出位置。', 'A chain of 8 flip-flops. Clock it step by step or automatically, and watch data flow through the chain and what comes out on SDO. Then inject a stuck fault and see if you can deduce its location from the output.'),
  fFlush1: loc('Flush 1', 'Flush 1'),
  fFlush0: loc('Flush 0', 'Flush 0'),
  fShift: loc('Shift 00110011', 'Shift 00110011'),
  faultLbl: loc('注入故障：', 'Inject fault:'),
  none: loc('无', 'None'),
  clock: loc('打一拍时钟', 'Clock once'),
  play: loc('自动播放', 'Auto play'),
  pause: loc('暂停', 'Pause'),
  reset: loc('重来', 'Reset'),
  clocks: loc('已打时钟', 'Clocks'),
  sdoNow: loc('SDO 当前值', 'SDO now'),
  mismatch: loc('首次不一致', 'First mismatch'),
  noMis: loc('无', 'None'),
  verdict: loc('诊断', 'Diagnosis'),
  fullTitle: loc('动手：完整测试三步', 'Hands-on: the full three-step test'),
  fullNote: loc('4 个触发器 + 一小块组合逻辑。设好激励，单步走完“移入 → 捕获 → 移出”，再注入组合逻辑故障，看移出的结果哪里不对。', '4 flip-flops + a small block of combinational logic. Set the stimulus, step through "shift in → capture → shift out", then inject a combinational fault and see where the shifted-out result goes wrong.'),
  vecLbl: loc('移入的激励', 'Stimulus to shift in'),
  piLbl: loc('主输入', 'Primary inputs'),
  combFault: loc('组合逻辑故障：', 'Combinational fault:'),
  next: loc('下一步', 'Next step'),
  phase: loc('步骤', 'Step'),
  colFf: loc('触发器', 'Flip-flop'),
  colIn: loc('移入的激励', 'Shifted-in stimulus'),
  colExp: loc('期望捕获', 'Expected capture'),
  colAct: loc('移出的实际值', 'Actual shifted out'),
  detected: loc('检测到故障：移出（或主输出）的值和期望不一致。', 'Fault detected: the shifted-out (or primary output) values do not match the expected values.'),
  passed: loc('全部一致：这个 Pattern 下电路响应正确。', 'All match: the circuit responds correctly to this pattern.'),
  escaped: loc('全部一致，但电路里其实有故障——这组激励没有激活它，或者故障效应没传到触发器/主输出。换一组激励试试；真实流程里 ATPG 会算出能检测每个故障的 Pattern。', 'All match, but the circuit actually has a fault: this stimulus did not activate it, or its effect did not propagate to a flip-flop/primary output. Try another stimulus; in a real flow, ATPG computes patterns that detect every fault.'),
  zLine: loc('主输出 Z：期望 {e}，实际 {a}', 'Primary output Z: expected {e}, actual {a}'),
  lssdTitle: loc('LSSD：两个可直接控制的时钟', 'LSSD: two directly controllable clocks'),
  lssdCap: loc('两相不重叠时钟：A 时钟让数据进入存储元件，B 时钟让存储元件输出。两者之间留有空隙，数据不会一拍冲过两级。', 'Two-phase non-overlapping clocks: clock A lets data into the storage element, clock B lets the storage element output. The gap between them keeps data from racing through two stages in one cycle.'),
  testerTitle: loc('Scan 测试机', 'Scan testers'),
  calcTitle: loc('计算器：链长和测试时间', 'Calculator: chain length and test time'),
  ffs: loc('触发器总数', 'Total flip-flops'),
  chains: loc('链数', 'Chains'),
  pats: loc('Pattern 数', 'Patterns'),
  freq: loc('移位频率', 'Shift frequency'),
  len: loc('每条链长度', 'Chain length'),
  cycles: loc('总移位周期', 'Total shift cycles'),
  time: loc('测试时间', 'Test time'),
  time1: loc('如果只有 1 条链', 'With only 1 chain'),
  bits: loc('每条链的串行存储', 'Serial memory per chain'),
  bitUnit: loc('位', 'bits'),
}

const TEST_LABEL: Record<ChainTest, typeof S.fFlush1> = { flush1: S.fFlush1, flush0: S.fFlush0, shift: S.fShift }

function fmtTime(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`
  if (ms >= 1) return `${ms.toFixed(1)} ms`
  return `${(ms * 1000).toFixed(0)} µs`
}

export function FundScanPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: S.whyTitle, text: WHY_LEAD[2] })
  const [scanMode, setScanMode] = useState<'normal' | 'scan'>('scan')
  const [ability, setAbility] = useState('iso')
  // Flush / Shift
  const [test, setTest] = useState<ChainTest>('flush1')
  const [faultK, setFaultK] = useState(0)
  const [faultV, setFaultV] = useState<Bit>(1)
  const [cStep, setCStep] = useState(0)
  const [cPlay, setCPlay] = useState(false)
  // 完整三步
  const [vec, setVec] = useState<Bit[]>([1, 0, 1, 1])
  const [a, setA] = useState<Bit>(1)
  const [b, setB] = useState<Bit>(1)
  const [cf, setCf] = useState<CombFault>('none')
  const [ph, setPh] = useState(0)
  const [pPlay, setPPlay] = useState(false)
  // 计算器
  const [ffs, setFfs] = useState(20000)
  const [chains, setChains] = useState(8)
  const [pats, setPats] = useState(1000)
  const [mhz, setMhz] = useState(50)
  const [mem, setMem] = useState('par')

  const cEnd = cStep >= CHAIN_CLOCKS
  useEffect(() => {
    if (!cPlay || cEnd) return
    const id = window.setInterval(() => setCStep((v) => Math.min(v + 1, CHAIN_CLOCKS)), 500)
    return () => window.clearInterval(id)
  }, [cPlay, cEnd])

  const pEnd = ph >= PHASES - 1
  useEffect(() => {
    if (!pPlay || pEnd) return
    const id = window.setInterval(() => setPh((v) => Math.min(v + 1, PHASES - 1)), 900)
    return () => window.clearInterval(id)
  }, [pPlay, pEnd])

  /* ---- 链测试 ---- */
  const fault: StuckFault = faultK ? { k: faultK, v: faultV } : null
  const states = chainStates(test, fault)
  const expStates = chainStates(test, null)
  const expected = expStates.map((s) => s[CHAIN_N - 1])
  const actual = states.map((s) => s[CHAIN_N - 1])
  const sdi = sdiSeq(test)
  const firstMis = actual.findIndex((v, c) => c <= cStep && v !== expected[c])
  let tip = ''
  if (firstMis >= 0) {
    if (firstMis < CHAIN_N) {
      tip = t(CHAIN_FAULT_TIP.locate)
        .split('{c}')
        .join(String(firstMis))
        .split('{v}')
        .join(String(actual[firstMis]))
        .replace('{k}', String(CHAIN_N - firstMis))
    } else if (test === 'shift') {
      tip = t(CHAIN_FAULT_TIP.shiftVague)
    } else {
      tip = t(CHAIN_FAULT_TIP.vague).replace('{v}', test === 'flush0' ? '1' : '0')
    }
  } else if (cEnd) {
    tip = t(CHAIN_FAULT_TIP.none)
  }
  const resetChain = () => {
    setCStep(0)
    setCPlay(false)
  }

  /* ---- 完整三步 ---- */
  const phases = scanPhases(vec, cf, a, b)
  const expPhases = scanPhases(vec, 'none', a, b)
  const phase = phases[ph]
  const preQ = ph === 6 ? phases[5].q : phase.q
  const live = comb(preQ, a, b, cf)
  const zAct = comb(phases[5].q, a, b, cf).z
  const zExp = comb(phases[5].q, a, b, 'none').z
  const expCap = expPhases[6].q
  const outBits = [10, 9, 8, 7].map((p) => phases[p].sdo)
  const outShown = (i: number) => ph >= 11 - (i + 1)
  const misOut = outBits.some((v, i) => v !== expCap[i])
  const misZ = zAct !== zExp
  const resetPh = () => {
    setPh(0)
    setPPlay(false)
  }
  const editBit = (i: number) => {
    setVec((prev) => prev.map((v, j) => (j === i ? ((1 - v) as Bit) : v)))
    resetPh()
  }

  /* ---- 计算器 ---- */
  const calc = scanCalc(ffs, chains, pats, mhz)

  /* ---- LSSD 时钟 ---- */
  const clkA: WaveSeg[] = []
  const clkB: WaveSeg[] = []
  for (let i = 0; i < 4; i += 1) {
    const o = i * 100
    clkA.push({ x0: o, x1: o + 10, level: 0 }, { x0: o + 10, x1: o + 35, level: 1 }, { x0: o + 35, x1: o + 100, level: 0 })
    clkB.push({ x0: o, x1: o + 55, level: 0 }, { x0: o + 55, x1: o + 80, level: 1 }, { x0: o + 80, x1: o + 100, level: 0 })
  }

  const abilityItem = ABILITIES.find((c) => c.id === ability)
  const memItem = MEM_CARDS.find((c) => c.id === mem)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fScan.title)}
      goal={t(ui.fScan.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
    >
      {/* 1. 为什么难测 */}
      <Section title={t(S.whyTitle)}>
        {WHY_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <ScanModelFig mode="none" />
      </Section>

      {/* 2. 加入 Scan 路径 */}
      <Section title={t(S.pathTitle)} note={t(S.pathNote)}>
        {PATH_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'normal' as const, label: S.normal },
            { id: 'scan' as const, label: S.scanOn },
          ]}
          value={scanMode}
          onChange={(id) => {
            setScanMode(id)
            setNote({ kicker: S.kicker, title: id === 'scan' ? S.scanOn : S.normal, text: MODE_TEXT[id] })
          }}
        />
        <ScanModelFig mode={scanMode} />
        <Callout>{t(MODE_TEXT[scanMode])}</Callout>
        <h4 className="scan-sub">{t(S.abilityTitle)}</h4>
        <Cards
          items={ABILITIES}
          activeId={ability}
          onPick={(item) => {
            setAbility(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {abilityItem ? <Explain paras={[abilityItem.text]} /> : null}
      </Section>

      {/* 3. Flush / Shift */}
      <Section title={t(S.chainTitle)} note={t(S.chainNote)}>
        <Seg
          options={(['flush1', 'flush0', 'shift'] as ChainTest[]).map((id) => ({ id, label: TEST_LABEL[id] }))}
          value={test}
          onChange={(id) => {
            setTest(id)
            resetChain()
            setNote({ kicker: S.kicker, title: TEST_LABEL[id], text: CHAIN_TEXT[id] })
          }}
        />
        <p className="intro__note">{`${t(CHAIN_TEXT[test])} ${t(CHAIN_INIT_NOTE)}`}</p>
        <div className="row-actions">
          <span className="scan-label">{t(S.faultLbl)}</span>
          <div className="kind">
            {Array.from({ length: CHAIN_N + 1 }, (_, k) => k).map((k) => (
              <button
                key={k}
                type="button"
                className={`kind__btn${faultK === k ? (k ? ' is-wrong' : ' is-right') : ''}`}
                onClick={() => {
                  setFaultK(k)
                  resetChain()
                }}
              >
                {k ? `FF${k}` : t(S.none)}
              </button>
            ))}
          </div>
          {faultK ? (
            <Seg
              options={[
                { id: '0', label: 'stuck-at-0' },
                { id: '1', label: 'stuck-at-1' },
              ]}
              value={String(faultV)}
              onChange={(id) => {
                setFaultV(id === '1' ? 1 : 0)
                resetChain()
              }}
            />
          ) : null}
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={cEnd} onClick={() => setCStep((v) => Math.min(v + 1, CHAIN_CLOCKS))}>
            {t(S.clock)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (cEnd) setCStep(0)
              setCPlay((p) => (cEnd ? true : !p))
            }}
          >
            {t(cPlay && !cEnd ? S.pause : S.play)}
          </button>
          <button type="button" className="lab__btn" onClick={resetChain}>
            {t(S.reset)}
          </button>
        </div>
        <ChainFig
          state={states[cStep]}
          step={cStep}
          nextSdi={cStep < CHAIN_CLOCKS ? sdi[cStep] : null}
          expected={expected}
          actual={actual}
          fault={fault}
        />
        <Readout
          items={[
            { label: S.clocks, value: `${cStep} / ${CHAIN_CLOCKS}` },
            { label: S.sdoNow, value: String(actual[cStep]) },
            { label: S.mismatch, value: firstMis >= 0 ? `#${firstMis}` : t(S.noMis), state: firstMis >= 0 ? 'fail' : cEnd ? 'pass' : undefined },
          ]}
        />
        {tip ? <Callout tone={firstMis >= 0 ? 'bad' : 'ok'}>{tip}</Callout> : null}
      </Section>

      {/* 4. 完整三步 */}
      <Section title={t(S.fullTitle)} note={t(S.fullNote)}>
        <div className="scan-edit">
          <div>
            <span className="scan-label">{t(S.vecLbl)}</span>
            <div className="bits-edit">
              {vec.map((v, i) => (
                <button key={i} type="button" className={v ? 'is-one' : ''} onClick={() => editBit(i)}>
                  {`Q${i + 1}=${v}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="scan-label">{t(S.piLbl)}</span>
            <div className="bits-edit">
              <button
                type="button"
                className={a ? 'is-one' : ''}
                onClick={() => {
                  setA((v) => (1 - v) as Bit)
                  resetPh()
                }}
              >
                {`A=${a}`}
              </button>
              <button
                type="button"
                className={b ? 'is-one' : ''}
                onClick={() => {
                  setB((v) => (1 - v) as Bit)
                  resetPh()
                }}
              >
                {`B=${b}`}
              </button>
            </div>
          </div>
        </div>
        <div className="row-actions">
          <span className="scan-label">{t(S.combFault)}</span>
          <Seg
            options={COMB_FAULTS.map((f) => ({ id: f.id, label: f.label }))}
            value={cf}
            onChange={(id) => {
              setCf(id)
              resetPh()
            }}
          />
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={pEnd} onClick={() => setPh((v) => Math.min(v + 1, PHASES - 1))}>
            {t(S.next)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (pEnd) setPh(0)
              setPPlay((p) => (pEnd ? true : !p))
            }}
          >
            {t(pPlay && !pEnd ? S.pause : S.play)}
          </button>
          <button type="button" className="lab__btn" onClick={resetPh}>
            {t(S.reset)}
          </button>
        </div>
        <div className="scan-phase">
          <b>{`${ph} / ${PHASES - 1}`}</b>
          {t(PHASE_TEXT[ph])}
        </div>
        <ScanStepFig phase={phase} d={live.d} z={live.z} a={a} b={b} fault={cf} />
        <table className="dtable scan-cmp">
          <thead>
            <tr>
              <th>{t(S.colFf)}</th>
              <th>{t(S.colIn)}</th>
              <th>{t(S.colExp)}</th>
              <th>{t(S.colAct)}</th>
            </tr>
          </thead>
          <tbody>
            {vec.map((v, i) => {
              const shown = outShown(i)
              const bad = shown && outBits[i] !== expCap[i]
              return (
                <tr key={i}>
                  <td className="mono-cell">{`Q${i + 1}`}</td>
                  <td className="mono-cell">{v}</td>
                  <td className="mono-cell">{String(expCap[i])}</td>
                  <td className={`mono-cell${shown ? (bad ? ' is-bad' : ' is-ok') : ''}`}>{shown ? String(outBits[i]) : '…'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {ph >= 5 ? (
          <p className="intro__note">
            {t(S.zLine)
              .replace('{e}', String(zExp))
              .replace('{a}', String(zAct))}
          </p>
        ) : null}
        {pEnd ? (
          <Callout tone={misOut || misZ ? 'bad' : cf === 'none' ? 'ok' : 'warn'}>
            {t(misOut || misZ ? S.detected : cf === 'none' ? S.passed : S.escaped)}
          </Callout>
        ) : null}
        <Callout>{t(ATPG_NOTE)}</Callout>
      </Section>

      {/* 5. LSSD */}
      <Section title={t(S.lssdTitle)}>
        {LSSD_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <figure className="term-fig">
          <WaveRows
            span={400}
            period={100}
            rows={[
              { name: 'A CLK', segs: clkA },
              { name: 'B CLK', segs: clkB, color: 'var(--purple)' },
            ]}
            ariaLabel="LSSD clocks"
          />
          <figcaption>{t(S.lssdCap)}</figcaption>
        </figure>
      </Section>

      {/* 6. Scan 测试机 */}
      <Section title={t(S.testerTitle)} note={t(TESTER_LEAD)}>
        <Cards
          items={MEM_CARDS}
          activeId={mem}
          cols={2}
          onPick={(item) => {
            setMem(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {memItem ? <Explain paras={[memItem.text]} /> : null}
        <h4 className="scan-sub">{t(S.calcTitle)}</h4>
        <div className="knob-row">
          <Knob label={S.ffs} value={ffs} unit="" min={1000} max={100000} step={1000} onChange={setFfs} />
          <Knob label={S.chains} value={chains} unit="" min={1} max={32} step={1} onChange={setChains} />
        </div>
        <div className="knob-row">
          <Knob label={S.pats} value={pats} unit="" min={100} max={5000} step={100} onChange={setPats} />
          <Knob label={S.freq} value={mhz} unit="MHz" min={10} max={100} step={5} onChange={setMhz} />
        </div>
        <Readout
          items={[
            { label: S.len, value: calc.len.toLocaleString('en-US') },
            { label: S.cycles, value: calc.cycles.toLocaleString('en-US') },
            { label: S.time, value: fmtTime(calc.ms), state: 'pass' },
            { label: S.time1, value: fmtTime(calc.ms1), state: chains > 1 ? 'fail' : undefined },
            { label: S.bits, value: `${calc.bitsPerChain.toLocaleString('en-US')} ${t(S.bitUnit)}` },
          ]}
        />
        <Callout>{t(CALC_NOTE)}</Callout>
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
