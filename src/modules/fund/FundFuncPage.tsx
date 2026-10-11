import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  CHARS,
  COVERAGE_LEAD,
  DFT,
  DFT_ATE,
  EQUATION,
  EXEC_STEPS,
  FORMATS,
  GROSS,
  INVERTER_PROGRAM,
  LOAD_LEAD,
  OPEN_DRAIN,
  QUIZ,
  RELAX,
  ROLES,
  SOURCES,
  TAKEAWAY,
  TERMS,
  TIMESET,
  VIH_TEXT,
  WALK_LEAD,
  WALK_PINS,
  WALK_POINTS,
  WORST,
  formatSegments,
  type Fmt,
  type Seg as WaveSeg,
} from './data/func'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, type Note } from './parts'
import { WaveRows } from './WaveRows'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  roleTitle: loc('功能验证 vs 量产功能测试', 'Functional verification vs production functional test'),
  srcTitle: loc('向量从哪来', 'Where vectors come from'),
  covTitle: loc('故障覆盖率', 'Fault coverage'),
  covDetected: loc('检测到的故障数（共 10 000 个）', 'Faults detected (of 10 000)'),
  covValue: loc('覆盖率', 'Coverage'),
  covNote: loc('漏掉的那部分缺陷会变成出货后的失效（DPPM）。量产常要求 Stuck-at 覆盖率 95% 以上；自己注入故障试试看，见 {@bench} 的 Pattern / Stuck 台子。', 'The missed defects become field failures after shipment (DPPM). Production often requires stuck-at coverage above 95%. Try injecting faults yourself on the Pattern / Stuck bench in {@bench}.'),
  dftTitle: loc('DFT：为了好测而改设计', 'DFT: changing the design to make it testable'),
  ctrTitle: loc('Ad-hoc 例子：30 位计数器', 'Ad-hoc example: a 30-bit counter'),
  ctrSeg: loc('拆成几段', 'Segments'),
  ctrWhole: loc('不拆', 'No split'),
  ctrFreq: loc('测试频率', 'Test frequency'),
  ctrCycles: loc('需要的时钟数', 'Clocks needed'),
  ctrTime: loc('测试时间', 'Test time'),
  termTitle: loc('功能测试的词', 'Functional test terms'),
  fmtTitle: loc('信号格式：同一串数据，六种画法', 'Signal formats: one data stream, six waveforms'),
  fmtNote: loc('点数据位翻转 0 / 1，拖边沿 1、边沿 2。上面一行是所选格式，下面一行是 NRZ 作对照。', 'Click a data bit to toggle 0 / 1, and drag edge 1 and edge 2. The top row is the selected format; the bottom row is NRZ for comparison.'),
  edge1: loc('边沿 1', 'Edge 1'),
  edge2: loc('边沿 2', 'Edge 2'),
  edgesCount: loc('这 6 拍的边沿数', 'Edges in these 6 cycles'),
  outTitle: loc('输出怎么比：字符、Strobe、高阻', 'Comparing outputs: characters, strobe, high-Z'),
  colChar: loc('字符', 'Char'),
  colKind: loc('作用', 'Action'),
  colMean: loc('含义', 'Meaning'),
  strobeLab: loc('动手：边沿 Strobe vs 窗口 Strobe', 'Try it: edge strobe vs window strobe'),
  strobeNote: loc('期望输出在这一拍为 H。输出从 L 翻到 H 需要一个延迟；可以再加一个毛刺。', 'The output is expected to be H in this cycle. It takes a delay to switch from L to H; you can also add a glitch.'),
  modeEdge: loc('边沿 Strobe', 'Edge strobe'),
  modeWin: loc('窗口 Strobe', 'Window strobe'),
  glitchOff: loc('无毛刺', 'No glitch'),
  glitchOn: loc('70–74 ns 有毛刺', 'Glitch at 70–74 ns'),
  delay: loc('输出延迟', 'Output delay'),
  strobeAt: loc('Strobe 时刻', 'Strobe time'),
  winWidth: loc('窗口宽度', 'Window width'),
  verdict: loc('判定', 'Result'),
  zTitle: loc('高阻怎么比', 'Comparing high-Z'),
  zText: loc('输出关断时引脚是浮空的。测试机的负载把它拉向 VREF（例如 1.5 V），电压就落在 VOL 和 VOH 之间——比较器两边都不满足，判为 Z。没有负载，浮空电压是随机的，Z 根本没法判。', 'When the output is off, the pin floats. The tester load pulls it toward VREF (e.g. 1.5 V), so the voltage falls between VOL and VOH. Neither comparator is satisfied, so it reads as Z. Without a load the floating voltage is random and Z cannot be judged at all.'),
  setTitle: loc('Time Set、最坏情况和放松参数', 'Time sets, worst case and relaxed parameters'),
  execTitle: loc('执行一次功能测试的 8 步', '8 steps to run a functional test'),
  invTitle: loc('例：10 MHz 时钟反相器', 'Example: 10 MHz clocked inverter'),
  invNote: loc('周期 100 ns。CLK 用 RZ（25–75 ns），DATA 用 SBC（10–30 ns），OUT 在 83 ns Strobe。时钟上升沿采样 DATA，输出取反，延迟约 20 ns。', 'Period 100 ns. CLK uses RZ (25–75 ns), DATA uses SBC (10–30 ns), OUT is strobed at 83 ns. The clock rising edge samples DATA and the output is inverted with about 20 ns delay.'),
  invGross: loc('粗功能版本：周期放到 500 ns，所有输入改 NRZ，Strobe 放在周期末尾附近——只确认逻辑是活的。', 'Gross functional version: period 500 ns, all inputs NRZ, strobe near the end of the cycle. It only confirms the logic is alive.'),
  walkTitle: loc('功能化 DC：Walking-Z 开短路', 'Functional DC: walking-Z opens/shorts'),
  vihTitle: loc('功能化 VIL / VIH', 'Functional VIL / VIH'),
  loadTitle: loc('功能化 VOL / VOH：负载怎么设', 'Functional VOL / VOH: setting the load'),
  vref: loc('VREF', 'VREF'),
  rload: loc('负载电阻 R', 'Load resistor R'),
  atVol: loc('输出 = VOL 0.4 V 时灌入', 'Sunk at output = VOL 0.4 V'),
  atVoh: loc('输出 = VOH 2.4 V 时抽出', 'Sourced at output = VOH 2.4 V'),
  zLevel: loc('高阻时引脚', 'Pin when high-Z'),
  loadOk: loc('一个电阻同时满足 IOL ≥ 8 mA 和 |IOH| ≥ 5.2 mA。VREF 必须夹在 VOL 和 VOH 之间，R 要足够小。', 'One resistor meets both IOL ≥ 8 mA and |IOH| ≥ 5.2 mA. VREF must sit between VOL and VOH, and R must be small enough.'),
  loadBad: loc('不满足：调 VREF 和 R。实际测试机多用可编程电流负载，IOL、IOH 分别设定，VREF 只决定切换点。', 'Not met: adjust VREF and R. Real testers mostly use programmable current loads, setting IOL and IOH separately, with VREF only setting the switch point.'),
  margin: loc('噪声容限：VOH − VIH = 2.4 − 2.0 = 0.4 V，VIL − VOL = 0.8 − 0.4 = 0.4 V。功能测试用 VOL / VOH 比输出，用 VIL / VIH 驱动输入，就同时验证了这 400 mV 余量。', 'Noise margin: VOH − VIH = 2.4 − 2.0 = 0.4 V, VIL − VOL = 0.8 − 0.4 = 0.4 V. Comparing outputs at VOL / VOH and driving inputs at VIL / VIH in the functional test verifies this 400 mV margin at the same time.'),
  kicker: loc('功能测试', 'Functional test'),
  later: loc('功能能跑了，下一课把时间推到极限：AC 参数。', 'Now that the function runs, the next lesson pushes timing to the limit: AC parameters.'),
}

const SPAN = 600
const PERIOD = 100
/** 30 位计数器拆成几段，'1' 表示不拆 */
const CTR_SEGS = ['1', '2', '3', '5']

export function FundFuncPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [role, setRole] = useState(ROLES[0].id)
  const [src, setSrc] = useState(SOURCES[0].id)
  const [detected, setDetected] = useState(9200)
  const [dft, setDft] = useState(DFT[0].id)
  const [segs, setSegs] = useState(CTR_SEGS[0])
  const [freq, setFreq] = useState(10)
  const [term, setTerm] = useState(TERMS[0].id)
  const [fmt, setFmt] = useState<Fmt>(FORMATS[0].id)
  const [bits, setBits] = useState([1, 0, 0, 1, 1, 0])
  const [e1, setE1] = useState(20)
  const [e2, setE2] = useState(60)
  const [mode, setMode] = useState<'edge' | 'win'>('edge')
  const [glitch, setGlitch] = useState<'off' | 'on'>('off')
  const [delay, setDelay] = useState(30)
  const [strobe, setStrobe] = useState(80)
  const [win, setWin] = useState(20)
  const [vref, setVref] = useState(1.6)
  const [rload, setRload] = useState(150)
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: ROLES[0].title, text: ROLES[0].text })

  const pick = (title: Note['title'], text: Note['text']) => setNote({ kicker: S.kicker, title, text })

  // 30 位计数器
  const k = Number(segs)
  const cycles = k * 2 ** (30 / k)
  const seconds = cycles / (freq * 1e6)
  const timeText = seconds >= 1 ? `${seconds.toFixed(1)} s` : seconds >= 1e-3 ? `${(seconds * 1e3).toFixed(2)} ms` : `${(seconds * 1e6).toFixed(1)} µs`

  // 信号格式
  const t2 = Math.max(e2, e1 + 5)
  const fmtSegs = formatSegments(fmt, bits, PERIOD, e1, t2)
  const nrzSegs = formatSegments('NRZ', bits, PERIOD, e1, t2)
  const countEdges = (list: WaveSeg[]) =>
    list.reduce((n, seg, i) => (i > 0 && list[i - 1].level !== seg.level ? n + 1 : n), list[0]?.level === 1 ? 1 : 0)
  const fmtInfo = FORMATS.find((item) => item.id === fmt)

  // 输出 Strobe
  const outSegs: WaveSeg[] =
    glitch === 'on' && delay < 70
      ? [
          { x0: 0, x1: delay, level: 0 },
          { x0: delay, x1: 70, level: 1 },
          { x0: 70, x1: 74, level: 0 },
          { x0: 74, x1: 100, level: 1 },
        ]
      : [
          { x0: 0, x1: delay, level: 0 },
          { x0: delay, x1: 100, level: 1 },
        ]
  const levelAt = (time: number) => outSegs.find((seg) => time >= seg.x0 && time < seg.x1)?.level ?? 1
  const w0 = Math.max(0, strobe - win / 2)
  const w1 = Math.min(100, strobe + win / 2)
  let strobePass: boolean
  if (mode === 'edge') strobePass = levelAt(strobe) === 1
  else strobePass = outSegs.every((seg) => seg.level === 1 || seg.x1 <= w0 || seg.x0 >= w1)

  // 反相器例子
  const inBits = [1, 0, 0, 1, 1]
  const clkSegs = formatSegments('RZ', [1, 1, 1, 1, 1], PERIOD, 25, 75)
  const dataSegs = formatSegments('SBC', inBits, PERIOD, 10, 30)
  const invOut: WaveSeg[] = []
  inBits.forEach((bit, i) => {
    const before = i === 0 ? 'z' : inBits[i - 1] ? 0 : 1
    invOut.push({ x0: i * PERIOD, x1: i * PERIOD + 45, level: before as WaveSeg['level'] })
    invOut.push({ x0: i * PERIOD + 45, x1: (i + 1) * PERIOD, level: bit ? 0 : 1 })
  })

  // 负载
  const iol = ((vref - 0.4) / rload) * 1000
  const ioh = ((2.4 - vref) / rload) * 1000
  const loadOk = iol >= 8 && ioh >= 5.2

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m21.title)}
      goal={t(ui.m21.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fAc"
      nextLabel={t(ui.fund.next) + t(ui.m22.title)}
    >
      <Section title={t(S.roleTitle)}>
        <Cards
          items={ROLES}
          activeId={role}
          cols={2}
          onPick={(item) => {
            setRole(item.id)
            pick(item.title, item.text)
          }}
        />
        <Explain paras={ROLES.find((item) => item.id === role)?.explain} />
      </Section>

      <Section title={t(S.srcTitle)}>
        <Cards
          items={SOURCES}
          activeId={src}
          cols={2}
          onPick={(item) => {
            setSrc(item.id)
            pick(item.title, item.text)
          }}
        />
        <Explain paras={SOURCES.find((item) => item.id === src)?.explain} />
        <h3>{t(S.covTitle)}</h3>
        <p>{t(COVERAGE_LEAD)}</p>
        <div className="knob-row">
          <Knob label={S.covDetected} value={detected} unit="" min={5000} max={10000} step={50} onChange={setDetected} />
        </div>
        <Readout
          items={[
            {
              label: S.covValue,
              value: `${((detected / 10000) * 100).toFixed(1)} %`,
              state: detected >= 9500 ? 'pass' : 'fail',
            },
          ]}
        />
        <p className="intro__note">{t(S.covNote)}</p>
      </Section>

      <Section title={t(S.dftTitle)}>
        <Cards
          items={DFT}
          activeId={dft}
          cols={4}
          onPick={(item) => {
            setDft(item.id)
            pick(item.title, item.text)
          }}
        />
        <Explain paras={DFT.find((item) => item.id === dft)?.explain} />
        <h3>{t(S.ctrTitle)}</h3>
        <div className="knob-row">
          <div>
            <p className="intro__note">{t(S.ctrSeg)}</p>
            <Seg
              options={CTR_SEGS.map((id) => ({ id, label: id === '1' ? S.ctrWhole : `${id} × ${30 / Number(id)} bit` }))}
              value={segs}
              onChange={setSegs}
            />
          </div>
          <Knob label={S.ctrFreq} value={freq} unit="MHz" min={1} max={50} step={1} onChange={setFreq} />
        </div>
        <Readout
          items={[
            { label: S.ctrCycles, value: cycles.toLocaleString('en-US') },
            { label: S.ctrTime, value: timeText, state: seconds < 0.01 ? 'pass' : 'fail' },
          ]}
        />
        <Callout>{t(DFT_ATE)}</Callout>
      </Section>

      <Section title={t(S.termTitle)}>
        <Cards
          items={TERMS}
          activeId={term}
          onPick={(item) => {
            setTerm(item.id)
            pick(item.title, item.text)
          }}
        />
        <Explain paras={[TERMS.find((item) => item.id === term)?.text ?? '']} />
      </Section>

      <Section title={t(S.fmtTitle)} note={t(S.fmtNote)}>
        <Seg
          options={FORMATS.map((item) => ({ id: item.id, label: item.id }))}
          value={fmt}
          onChange={(id) => {
            setFmt(id)
            const item = FORMATS.find((f) => f.id === id)
            if (item) pick(item.name, item.text)
          }}
        />
        <div className="bits-edit">
          {bits.map((bit, i) => (
            <button
              key={i}
              type="button"
              className={bit ? 'is-one' : ''}
              onClick={() => setBits((prev) => prev.map((b, j) => (j === i ? (b ? 0 : 1) : b)))}
            >
              {bit}
            </button>
          ))}
        </div>
        <div className="knob-row">
          <Knob label={S.edge1} value={e1} unit="ns" min={0} max={90} step={5} onChange={setE1} />
          <Knob label={S.edge2} value={t2} unit="ns" min={5} max={100} step={5} onChange={setE2} />
        </div>
        <figure className="term-fig">
          <WaveRows
            span={SPAN}
            period={PERIOD}
            edges={[e1, t2]}
            rows={[
              { name: fmt, segs: fmtSegs, color: 'var(--gold)' },
              { name: 'NRZ', segs: nrzSegs },
            ]}
            ariaLabel={fmt}
          />
        </figure>
        <Readout
          items={[
            { label: `${t(S.edgesCount)} · ${fmt}`, value: String(countEdges(fmtSegs)) },
            { label: `${t(S.edgesCount)} · NRZ`, value: String(countEdges(nrzSegs)) },
          ]}
        />
        {fmtInfo ? (
          <Callout>
            <p>
              <b>{t(fmtInfo.name)}</b>
            </p>
            <p>{t(fmtInfo.text)}</p>
          </Callout>
        ) : null}
      </Section>

      <Section title={t(S.outTitle)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colChar)}</th>
              <th>{t(S.colKind)}</th>
              <th>{t(S.colMean)}</th>
            </tr>
          </thead>
          <tbody>
            {CHARS.map((row) => (
              <tr key={row.ch}>
                <td className="mono-cell">{row.ch}</td>
                <td>{t(row.kind)}</td>
                <td>{t(row.text)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>{t(S.strobeLab)}</h3>
        <p className="intro__note">{t(S.strobeNote)}</p>
        <Seg
          options={[
            { id: 'edge' as const, label: S.modeEdge },
            { id: 'win' as const, label: S.modeWin },
          ]}
          value={mode}
          onChange={setMode}
        />{' '}
        <Seg
          options={[
            { id: 'off' as const, label: S.glitchOff },
            { id: 'on' as const, label: S.glitchOn },
          ]}
          value={glitch}
          onChange={setGlitch}
        />
        <div className="knob-row">
          <Knob label={S.delay} value={delay} unit="ns" min={5} max={95} step={1} onChange={setDelay} />
          <Knob label={S.strobeAt} value={strobe} unit="ns" min={0} max={100} step={1} onChange={setStrobe} />
          {mode === 'win' ? (
            <Knob label={S.winWidth} value={win} unit="ns" min={4} max={60} step={2} onChange={setWin} />
          ) : null}
        </div>
        <figure className="term-fig">
          <WaveRows
            span={100}
            period={100}
            strobe={mode === 'edge' ? strobe : undefined}
            window={mode === 'win' ? [w0, w1] : undefined}
            rows={[
              {
                name: 'OUT',
                segs: outSegs,
                labels: [{ t: mode === 'edge' ? strobe : w0, text: 'H?', bad: !strobePass }],
              },
            ]}
            ariaLabel="strobe"
          />
        </figure>
        <Readout items={[{ label: S.verdict, value: strobePass ? 'PASS' : 'FAIL', state: strobePass ? 'pass' : 'fail' }]} />
        <h3>{t(S.zTitle)}</h3>
        <p>{t(S.zText)}</p>
      </Section>

      <Section title={t(S.setTitle)}>
        <Callout>{t(TIMESET)}</Callout>
        <Callout>{t(WORST)}</Callout>
        <Callout>{t(RELAX)}</Callout>
        <Callout tone="warn">{t(GROSS)}</Callout>
        <Callout>{t(EQUATION)}</Callout>
      </Section>

      <Section title={t(S.execTitle)}>
        <Steps items={EXEC_STEPS} />
      </Section>

      <Section title={t(S.invTitle)} note={t(S.invNote)}>
        <figure className="term-fig">
          <WaveRows
            span={500}
            period={PERIOD}
            strobe={83}
            rows={[
              { name: 'CLK', segs: clkSegs },
              { name: 'DATA', segs: dataSegs },
              {
                name: 'OUT',
                segs: invOut,
                color: 'var(--green)',
                labels: inBits.map((bit, i) => ({ t: i * PERIOD + 83, text: bit ? 'L' : 'H' })),
              },
            ]}
            ariaLabel="inverter"
          />
        </figure>
        <pre className="code">{t(INVERTER_PROGRAM)}</pre>
        <p className="intro__note">{t(S.invGross)}</p>
      </Section>

      <Section title={t(S.walkTitle)} note={t(WALK_LEAD)}>
        <table className="dtable walk-table">
          <thead>
            <tr>
              <th>#</th>
              {WALK_PINS.map((pin) => (
                <th key={pin}>{pin}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WALK_PINS.map((pin, row) => (
              <tr key={pin}>
                <td className="mono-cell">{row}</td>
                {WALK_PINS.map((col, c) => (
                  <td key={col} className={`mono-cell${c === row ? ' is-z' : ''}`}>
                    {c === row ? 'Z' : '0'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Steps items={WALK_POINTS} />
      </Section>

      <Section title={t(S.vihTitle)}>
        {VIH_TEXT.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Callout>{t(S.margin)}</Callout>
      </Section>

      <Section title={t(S.loadTitle)} note={t(LOAD_LEAD)}>
        <div className="knob-row">
          <Knob label={S.vref} value={vref} unit="V" min={0.5} max={3.5} step={0.1} onChange={(v) => setVref(Number(v.toFixed(1)))} />
          <Knob label={S.rload} value={rload} unit="Ω" min={50} max={1000} step={10} onChange={setRload} />
        </div>
        <Readout
          items={[
            { label: S.atVol, value: `${iol.toFixed(2)} mA`, state: iol >= 8 ? 'pass' : 'fail' },
            { label: S.atVoh, value: `${ioh.toFixed(2)} mA`, state: ioh >= 5.2 ? 'pass' : 'fail' },
            { label: S.zLevel, value: `${vref.toFixed(1)} V`, state: vref > 0.4 && vref < 2.4 ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={loadOk ? 'ok' : 'warn'}>{t(loadOk ? S.loadOk : S.loadBad)}</Callout>
        <Callout>{t(OPEN_DRAIN)}</Callout>
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
