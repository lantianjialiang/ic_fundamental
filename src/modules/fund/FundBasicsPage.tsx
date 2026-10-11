import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { DffFig, GateFig, LevelFig, OhmFig } from './BasicsFig'
import {
  BASE_LEAD,
  DFF_CYCLES,
  DFF_LEAD,
  DFF_SUB,
  FI_AMP,
  FV_VOLT,
  GATES,
  HEX_TIP,
  INV_CAP,
  INV_TERMS,
  LEVEL_LEAD,
  MATERIALS,
  MAT_NOTE,
  METER_TEXT,
  NOTATION_LEAD,
  OHM_LEAD,
  OHM_MODE_TEXT,
  PERIOD_TEXT,
  PICK_I_TEXT,
  PREFIXES,
  QUIZ,
  R_MAX,
  R_MIN,
  TAKEAWAY,
  TC_COEF,
  TC_TEXT,
  TTL_CMOS,
  UNITS,
  VIH,
  VIL,
  VIR,
  VOH,
  VOL,
  dffQ,
  eng,
  fmtNum,
  gateOut,
  judgeOutput,
  readAsInput,
  sci,
  supNum,
  type GateId,
  type LevelKind,
  type OhmMode,
  type Unit,
} from './data/basics'
import { type Seg as WaveSeg } from './data/func'
import { Callout, Cards, Explain, Knob, Readout, Seg, type Note } from './parts'
import { WaveRows } from './WaveRows'
import './basics.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('基础', 'Basics'),
  later: loc(
    '这些概念在后面每一课都会用到：PMU 就是“加压测流 / 加流测压”，功能测试比的就是 VOL / VOH。',
    'These ideas appear in every later lesson: the PMU is just "force voltage / measure current" and "force current / measure voltage", and functional test compares against VOL / VOH.',
  ),
  notTitle: loc('工程计数法：前缀每 1000 倍一档', 'Engineering notation: one prefix per 1000×'),
  colPrefix: loc('前缀', 'Prefix'),
  colName: loc('名称', 'Name'),
  colPow: loc('10 的幂', 'Power of 10'),
  colComp: loc('计算机写法', 'Computer'),
  colNum: loc('数值', 'Value'),
  convTitle: loc('换算器', 'Converter'),
  convValue: loc('数值', 'Value'),
  sci: loc('科学计数法', 'Scientific'),
  eng: loc('工程写法', 'Engineering'),
  comp: loc('计算机写法', 'Computer'),
  alt: loc(
    '换成其它前缀（绿色是最顺手的写法，数字落在 1–999 之间）：',
    'With other prefixes (green is the most natural form, with the number between 1 and 999):',
  ),
  invalid: loc('请输入一个数字', 'Please enter a number'),
  virTitle: loc('电压、电流、电阻', 'Voltage, current, resistance'),
  matTitle: loc('不同材料的电阻', 'Resistance of different materials'),
  tcTitle: loc('温度系数', 'Temperature coefficient'),
  temp: loc('温度', 'Temperature'),
  cuR: loc('铜（正 TC）', 'Copper (positive TC)'),
  cR: loc('碳（负 TC）', 'Carbon (negative TC)'),
  ohmTitle: loc('动手：用欧姆定律测一个电阻', "Try it: measure a resistor with Ohm's law"),
  ohmNote: loc(
    '规格 2000 Ω ±10%，即 1800–2200 Ω。拖动被测电阻，看测试机读数和判定。',
    'Spec 2000 Ω ±10%, i.e. 1800–2200 Ω. Drag the resistor value and watch the tester reading and verdict.',
  ),
  fv: loc('加压测流（5.0 V）', 'Force V, measure I (5.0 V)'),
  fi: loc('加流测压（2.5 mA）', 'Force I, measure V (2.5 mA)'),
  rKnob: loc('被测电阻', 'Resistor under test'),
  reading: loc('当前读数', 'Reading'),
  limits: loc('上下限', 'Limits'),
  calcR: loc('算出 R = E / I', 'Computed R = E / I'),
  verdict: loc('判定', 'Verdict'),
  pickTitle: loc('小计算：选一个测试电流', 'Quick math: choose a test current'),
  rExp: loc('期望电阻', 'Expected R'),
  vTarget: loc('想要的压降', 'Target drop'),
  iForce: loc('应打电流 I = E / R', 'Force current I = E / R'),
  baseTitle: loc('二进制、十进制、十六进制', 'Binary, decimal, hexadecimal'),
  bitsNote: loc('点每一位切换 0 / 1：', 'Click a bit to toggle 0 / 1:'),
  dec: loc('十进制', 'Decimal'),
  hex: loc('十六进制', 'Hex'),
  bin: loc('二进制', 'Binary'),
  decIn: loc('或者直接输入十进制（0–255）：', 'Or type a decimal value (0–255):'),
  hexDig: loc('十六进制位：', 'Hex digit:'),
  exBD: loc('例子：BD₁₆', 'Example: BD₁₆'),
  clear: loc('清零', 'Clear'),
  levelTitle: loc('逻辑电平与噪声容限', 'Logic levels and noise margin'),
  volt: loc('电压', 'Voltage'),
  noise: loc('叠加噪声', 'Added noise'),
  asIn: loc('作为输入被认成', 'Read as input'),
  asOut: loc('作为输出算', 'Judged as output'),
  lv0: loc('0', '0'),
  lv1: loc('1', '1'),
  lvX: loc('无效', 'Invalid'),
  noise0: loc('最差的 0（0.4 V）+ 噪声', 'Worst 0 (0.4 V) + noise'),
  noise1: loc('最差的 1（2.4 V）− 噪声', 'Worst 1 (2.4 V) − noise'),
  marginSep: loc('；', '; '),
  periodTitle: loc('周期 = 1 / 频率', 'Period = 1 / frequency'),
  freq: loc('频率', 'Frequency'),
  period: loc('周期', 'Period'),
  gateTitle: loc('动手：基本门电路', 'Try it: basic logic gates'),
  gateNote: loc(
    '选一种门，点 A / B 切换输入。真值表里高亮的就是当前这一行，点表格的行也能直接设输入。',
    'Pick a gate and click A / B to toggle the inputs. The highlighted truth-table row is the current one; clicking a row also sets the inputs.',
  ),
  rule: loc('规则：', 'Rule: '),
  out: loc('输出', 'Output'),
  invTitle: loc('反相器的 4 个测试周期', 'Four test cycles for an inverter'),
  invNote: loc(
    '测试机怎么测一个反相器：每个周期加一个输入、比一个期望输出。点下面的名词看解释。',
    'How a tester tests an inverter: each cycle drives one input and compares one expected output. Click a term below for an explanation.',
  ),
  dffTitle: loc('动手：D 触发器', 'Try it: D flip-flop'),
  dffNote: loc(
    '单步或自动播放，看黄色“现在”线走过时钟上升沿时 Q 怎么变。点 D 行的格子改数据。',
    'Step or play, and watch how Q changes as the yellow "now" line passes each rising clock edge. Click cells in the D row to change the data.',
  ),
  step: loc('单步', 'Step'),
  play: loc('自动播放', 'Play'),
  pause: loc('暂停', 'Pause'),
  reset: loc('重来', 'Reset'),
  now: loc('现在', 'Now'),
  cycleUnit: loc('周期', 'cycles'),
  unknown: loc('未知', 'Unknown'),
  sampled: loc('Q 记住的是', 'Q holds'),
  lastEdge: loc('第 {n} 个上升沿采到的 D', 'D sampled at rising edge {n}'),
  noEdge: loc('还没有上升沿', 'No rising edge yet'),
  passTxt: loc('PASS：读数在上下限之内。', 'PASS: the reading is within limits.'),
  failTxt: loc('FAIL：读数超出上下限，电阻不在 1800–2200 Ω 之内。', 'FAIL: the reading is outside the limits; the resistor is not within 1800–2200 Ω.'),
}

const LEVEL_LABEL: Record<string, typeof S.lv0> = { '0': S.lv0, '1': S.lv1, x: S.lvX }
const lvKey = (v: LevelKind) => String(v)

const DFF_MAX = DFF_CYCLES * DFF_SUB

export function FundBasicsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: VIR[0].title, text: VIR[0].text })
  // 工程计数法
  const [numStr, setNumStr] = useState('2.5')
  const [prefix, setPrefix] = useState('m')
  const [unit, setUnit] = useState<Unit>('A')
  // 电压电流电阻
  const [vir, setVir] = useState('v')
  const [mat, setMat] = useState('cu')
  const [temp, setTemp] = useState(25)
  // 欧姆定律
  const [mode, setMode] = useState<OhmMode>('fv')
  const [rOhm, setROhm] = useState(2000)
  const [rExp, setRExp] = useState(5)
  const [vTarget, setVTarget] = useState(5)
  // 进制
  const [bits, setBits] = useState<number[]>([1, 0, 1, 1, 1, 1, 0, 1])
  const [nib, setNib] = useState<'hi' | 'lo'>('hi')
  // 电平
  const [volt, setVolt] = useState(1.5)
  const [noise, setNoise] = useState(0.3)
  const [freq, setFreq] = useState(10)
  // 门
  const [gate, setGate] = useState<GateId>('nand')
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [term, setTerm] = useState('t0')
  // D 触发器
  const [dBits, setDBits] = useState<number[]>([1, 0, 0, 1, 1, 0, 1, 0])
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(false)

  const atEnd = tick >= DFF_MAX
  useEffect(() => {
    if (!playing || atEnd) return
    const id = window.setInterval(() => setTick((v) => (v >= DFF_MAX ? v : v + 1)), 350)
    return () => window.clearInterval(id)
  }, [playing, atEnd])

  /* ---- 计数法 ---- */
  const pre = PREFIXES.find((p) => p.id === prefix) ?? PREFIXES[4]
  const num = Number(numStr)
  const valid = numStr.trim() !== '' && Number.isFinite(num)
  const base = valid ? num * 10 ** pre.exp : 0
  const s1 = sci(base)
  const e1 = eng(base)
  const engPrefix = PREFIXES.find((p) => p.exp === e1.e)

  /* ---- 欧姆定律 ---- */
  const fv = mode === 'fv'
  const iMa = (FV_VOLT / rOhm) * 1000
  const vRead = FI_AMP * rOhm
  const loLim = fv ? (FV_VOLT / R_MAX) * 1000 : FI_AMP * R_MIN
  const hiLim = fv ? (FV_VOLT / R_MIN) * 1000 : FI_AMP * R_MAX
  const readVal = fv ? iMa : vRead
  const ohmPass = readVal >= loLim - 1e-9 && readVal <= hiLim + 1e-9
  const reading = fv ? `${iMa.toFixed(3)} mA` : `${vRead.toFixed(3)} V`
  const rCalc = fv ? FV_VOLT / (iMa / 1000) : vRead / FI_AMP

  /* ---- 进制 ---- */
  const value = bits.reduce((acc, bit) => acc * 2 + bit, 0)
  const hexStr = value.toString(16).toUpperCase().padStart(2, '0')
  const nibVal = nib === 'hi' ? value >> 4 : value & 15
  const setValue = (v: number) => setBits(Array.from({ length: 8 }, (_, i) => (v >> (7 - i)) & 1))

  /* ---- 门 ---- */
  const gateItem = GATES.find((g) => g.id === gate) ?? GATES[0]
  const out = gateOut(gate, a, b)
  const truthRows = gate === 'not' ? [[0, 0], [1, 0]] : [[0, 0], [0, 1], [1, 0], [1, 1]]

  /* ---- 反相器波形 ---- */
  const inBits = [1, 0, 1, 0]
  const inSegs: WaveSeg[] = inBits.map((bit, i) => ({ x0: i * 100, x1: i * 100 + 100, level: bit as 0 | 1 }))
  const outSegs: WaveSeg[] = [
    { x0: 0, x1: 15, level: 'z' },
    ...inBits.map((bit, i) => ({ x0: i * 100 + 15, x1: Math.min(i * 100 + 115, 400), level: (bit ? 0 : 1) as 0 | 1 })),
  ]

  /* ---- D 触发器 ---- */
  const time = tick / DFF_SUB
  const frac = time - Math.floor(time)
  const clkNow = atEnd ? 1 : frac >= 0.5 ? 1 : 0
  const dNow = dBits[Math.min(Math.floor(time), DFF_CYCLES - 1)]
  const qNow = dffQ(dBits, time)
  const edgesPassed = Array.from({ length: DFF_CYCLES }, (_, k) => k).filter((k) => k + 0.5 <= time).length

  const pickGate = (id: GateId) => {
    setGate(id)
    const g = GATES.find((item) => item.id === id)
    if (g) setNote({ kicker: S.kicker, title: g.label, text: g.text })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fBasics.title)}
      goal={t(ui.fBasics.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fAte"
      nextLabel={t(ui.fund.next) + t(ui.fAte.title)}
    >
      {/* 1. 工程计数法 */}
      <Section title={t(S.notTitle)}>
        {NOTATION_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colPrefix)}</th>
              <th>{t(S.colName)}</th>
              <th>{t(S.colPow)}</th>
              <th>{t(S.colComp)}</th>
              <th>{t(S.colNum)}</th>
            </tr>
          </thead>
          <tbody>
            {PREFIXES.map((p) => (
              <tr
                key={p.id}
                className={`is-click${p.id === prefix ? ' is-active' : ''}`}
                onClick={() => {
                  setPrefix(p.id)
                  setNote({ kicker: S.kicker, title: p.name, text: `${p.sym || '—'} = 1 × 10${supNum(p.exp)} = 1E${p.exp >= 0 ? '+' : ''}${p.exp}` })
                }}
              >
                <td className="mono-cell">{p.sym || '—'}</td>
                <td>{t(p.name)}</td>
                <td className="mono-cell">{`1 × 10${supNum(p.exp)}`}</td>
                <td className="mono-cell">{`1E${p.exp >= 0 ? '+' : ''}${p.exp}`}</td>
                <td className="mono-cell">{p.exp >= 0 ? (10 ** p.exp).toLocaleString('en-US') : `0.${'0'.repeat(-p.exp - 1)}1`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 className="basics-sub">{t(S.convTitle)}</h4>
        <div className="calc">
          <span>{t(S.convValue)}</span>
          <input value={numStr} onChange={(e) => setNumStr(e.target.value)} inputMode="decimal" />
          <b>{`${pre.sym}${unit}`}</b>
        </div>
        <div className="row-actions">
          <Seg options={PREFIXES.map((p) => ({ id: p.id, label: p.sym || '1' }))} value={prefix} onChange={setPrefix} />
          <Seg options={UNITS.map((u) => ({ id: u, label: u }))} value={unit} onChange={setUnit} />
        </div>
        {valid ? (
          <>
            <Readout
              items={[
                { label: S.sci, value: `${s1.m} × 10${supNum(s1.e)} ${unit}` },
                { label: S.eng, value: `${e1.m} ${engPrefix ? engPrefix.sym : `×10${supNum(e1.e)} `}${unit}` },
                { label: S.comp, value: `${s1.m}E${s1.e >= 0 ? '+' : ''}${s1.e} ${unit}` },
              ]}
            />
            <p className="intro__note">{t(S.alt)}</p>
            <div className="basics-alt">
              {PREFIXES.map((p) => {
                const v = base / 10 ** p.exp
                const best = Math.abs(v) >= 1 && Math.abs(v) < 1000
                return (
                  <span key={p.id} className={`basics-alt__chip${best ? ' is-best' : ''}`}>
                    {`${fmtNum(v)} ${p.sym}${unit}`}
                  </span>
                )
              })}
            </div>
          </>
        ) : (
          <Callout tone="bad">{t(S.invalid)}</Callout>
        )}
      </Section>

      {/* 2. 电压电流电阻 */}
      <Section title={t(S.virTitle)}>
        <Cards
          items={VIR}
          activeId={vir}
          onPick={(item) => {
            setVir(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={VIR.find((item) => item.id === vir)?.explain} />
        <h4 className="basics-sub">{t(S.matTitle)}</h4>
        <p className="intro__note">{t(MAT_NOTE)}</p>
        <div className="basics-mat">
          {MATERIALS.map((m) => {
            const over = m.ohm > 74
            return (
              <div key={m.id} style={{ display: 'contents' }}>
                <button
                  type="button"
                  className={`basics-mat__name${m.id === mat ? ' is-active' : ''}`}
                  onClick={() => {
                    setMat(m.id)
                    setNote({ kicker: S.kicker, title: m.name, text: m.text })
                  }}
                >
                  {t(m.name)}
                </button>
                <div className="basics-mat__track">
                  <div className={`basics-mat__fill${over ? ' is-over' : ''}`} style={{ width: `${Math.min(m.ohm / 74, 1) * 100}%` }} />
                </div>
                <span className="basics-mat__val">{`${m.ohm.toLocaleString()} · ${(m.ohm / 10.37).toFixed(1)}×Cu`}</span>
              </div>
            )
          })}
        </div>
        <h4 className="basics-sub">{t(S.tcTitle)}</h4>
        {TC_TEXT.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="knob-row">
          <Knob label={S.temp} value={temp} unit="°C" min={-55} max={125} step={5} onChange={setTemp} />
        </div>
        <Readout
          items={[
            { label: S.cuR, value: `${(10.37 * (1 + TC_COEF.cu * (temp - 25))).toFixed(2)} (${temp >= 25 ? '+' : ''}${(TC_COEF.cu * (temp - 25) * 100).toFixed(1)}%)` },
            { label: S.cR, value: `${Math.round(21000 * (1 + TC_COEF.c * (temp - 25))).toLocaleString()} (${temp > 25 ? '' : '+'}${(TC_COEF.c * (temp - 25) * 100).toFixed(1)}%)` },
          ]}
        />
      </Section>

      {/* 3. 欧姆定律测电阻 */}
      <Section title={t(S.ohmTitle)} note={t(S.ohmNote)}>
        {OHM_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'fv' as const, label: S.fv },
            { id: 'fi' as const, label: S.fi },
          ]}
          value={mode}
          onChange={(id) => {
            setMode(id)
            setNote({ kicker: S.kicker, title: id === 'fv' ? S.fv : S.fi, text: METER_TEXT[id] })
          }}
        />
        <div className="knob-row">
          <Knob label={S.rKnob} value={rOhm} unit="Ω" min={1500} max={2600} step={10} onChange={setROhm} />
        </div>
        <OhmFig mode={mode} r={rOhm} reading={reading} pass={ohmPass} />
        <Readout
          items={[
            { label: S.reading, value: reading, state: ohmPass ? 'pass' : 'fail' },
            { label: S.limits, value: fv ? `${loLim.toFixed(2)} – ${hiLim.toFixed(2)} mA` : `${loLim.toFixed(2)} – ${hiLim.toFixed(2)} V` },
            { label: S.calcR, value: `${Math.round(rCalc)} Ω` },
            { label: S.verdict, value: ohmPass ? 'PASS' : 'FAIL', state: ohmPass ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={ohmPass ? 'ok' : 'bad'}>{t(ohmPass ? S.passTxt : S.failTxt)}</Callout>
        <Explain paras={[OHM_MODE_TEXT[mode], METER_TEXT[mode]]} />
        <h4 className="basics-sub">{t(S.pickTitle)}</h4>
        <p>{t(PICK_I_TEXT)}</p>
        <div className="knob-row">
          <Knob label={S.rExp} value={rExp} unit="kΩ" min={1} max={10} step={0.5} onChange={setRExp} />
          <Knob label={S.vTarget} value={vTarget} unit="V" min={3} max={5} step={0.5} onChange={setVTarget} />
        </div>
        <Readout items={[{ label: S.iForce, value: `${fmtNum(vTarget / rExp, 4)} mA` }]} />
      </Section>

      {/* 4. 进制 */}
      <Section title={t(S.baseTitle)}>
        {BASE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <p className="intro__note">{t(S.bitsNote)}</p>
        <div className="basics-bitpos">
          {bits.map((_, i) => (
            <span key={i}>{`2${supNum(7 - i)}`}</span>
          ))}
        </div>
        <div className="bits-edit">
          {bits.map((bit, i) => {
            const inNib = nib === 'hi' ? i < 4 : i >= 4
            return (
              <button
                key={i}
                type="button"
                className={`${bit ? 'is-one' : ''}${inNib ? ' basics-bit--sel' : ''}`}
                onClick={() => setBits((prev) => prev.map((v, j) => (j === i ? 1 - v : v)))}
              >
                {bit}
              </button>
            )
          })}
        </div>
        <Readout
          items={[
            { label: S.bin, value: `${bits.slice(0, 4).join('')} ${bits.slice(4).join('')}₂` },
            { label: S.dec, value: `${value}₁₀` },
            { label: S.hex, value: `${hexStr}₁₆` },
          ]}
        />
        <div className="basics-expand">
          <div>{bits.map((bit, i) => `${bit}×2${supNum(7 - i)}`).join(' + ')}</div>
          <div>{`= ${bits.map((bit, i) => (bit ? 2 ** (7 - i) : 0)).join(' + ')} = ${value}`}</div>
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn" onClick={() => setValue(0xbd)}>
            {t(S.exBD)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setValue(0)}>
            {t(S.clear)}
          </button>
          <span className="intro__note">{t(S.decIn)}</span>
          <div className="calc" style={{ margin: 0 }}>
            <input
              type="number"
              min={0}
              max={255}
              value={value}
              onChange={(e) => {
                const v = Math.max(0, Math.min(255, Math.floor(Number(e.target.value) || 0)))
                setValue(v)
              }}
            />
          </div>
        </div>
        <div className="basics-hexdig">
          <span>{t(S.hexDig)}</span>
          {(['hi', 'lo'] as const).map((which) => (
            <button key={which} type="button" className={nib === which ? 'is-active' : ''} onClick={() => setNib(which)}>
              {which === 'hi' ? hexStr[0] : hexStr[1]}
            </button>
          ))}
        </div>
        <div className="basics-hex">
          {Array.from({ length: 16 }, (_, v) => (
            <button
              key={v}
              type="button"
              className={v === nibVal ? 'is-active' : ''}
              onClick={() => setValue(nib === 'hi' ? (v << 4) | (value & 15) : (value & 0xf0) | v)}
            >
              <b>{v.toString(16).toUpperCase()}</b>
              {v.toString(2).padStart(4, '0')}
              <br />
              {v}
            </button>
          ))}
        </div>
        <Callout>{t(HEX_TIP)}</Callout>
      </Section>

      {/* 5. 逻辑电平 */}
      <Section title={t(S.levelTitle)}>
        {LEVEL_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="knob-row">
          <Knob label={S.volt} value={volt} unit="V" min={0} max={5} step={0.05} onChange={setVolt} />
          <Knob label={S.noise} value={noise} unit="V" min={0} max={1} step={0.05} onChange={setNoise} />
        </div>
        <LevelFig volt={volt} />
        <Readout
          items={[
            { label: S.asIn, value: t(LEVEL_LABEL[lvKey(readAsInput(volt))]), state: readAsInput(volt) === 'x' ? 'fail' : 'pass' },
            { label: S.asOut, value: t(LEVEL_LABEL[lvKey(judgeOutput(volt))]), state: judgeOutput(volt) === 'x' ? 'fail' : 'pass' },
            {
              label: S.noise0,
              value: `${(VOL + noise).toFixed(2)} V → ${t(LEVEL_LABEL[lvKey(readAsInput(VOL + noise))])}`,
              state: readAsInput(VOL + noise) === 0 ? 'pass' : 'fail',
            },
            {
              label: S.noise1,
              value: `${(VOH - noise).toFixed(2)} V → ${t(LEVEL_LABEL[lvKey(readAsInput(VOH - noise))])}`,
              state: readAsInput(VOH - noise) === 1 ? 'pass' : 'fail',
            },
          ]}
        />
        <p className="intro__note">{`VIL − VOL = ${VIL} − ${VOL} = 0.4 V${t(S.marginSep)}VOH − VIH = ${VOH} − ${VIH} = 0.4 V`}</p>
        <h4 className="basics-sub">{t(S.periodTitle)}</h4>
        <p>{t(PERIOD_TEXT)}</p>
        <div className="knob-row">
          <Knob label={S.freq} value={freq} unit="MHz" min={1} max={200} step={1} onChange={setFreq} />
        </div>
        <Readout items={[{ label: S.period, value: `1 / ${freq} MHz = ${fmtNum(1000 / freq, 4)} ns` }]} />
        <Callout>{t(TTL_CMOS)}</Callout>
      </Section>

      {/* 6. 门电路 */}
      <Section title={t(S.gateTitle)} note={t(S.gateNote)}>
        <Seg options={GATES.map((g) => ({ id: g.id, label: g.label }))} value={gate} onChange={pickGate} />
        <GateFig gate={gate} a={a} b={b} out={out} onA={() => setA((v) => 1 - v)} onB={() => setB((v) => 1 - v)} />
        <p>
          <b>{t(S.rule)}</b>
          {t(gateItem.rule)}
        </p>
        <table className="dtable">
          <thead>
            <tr>
              <th>A</th>
              {gate === 'not' ? null : <th>B</th>}
              <th>{t(S.out)}</th>
            </tr>
          </thead>
          <tbody>
            {truthRows.map(([ra, rb]) => {
              const active = gate === 'not' ? ra === a : ra === a && rb === b
              return (
                <tr
                  key={`${ra}${rb}`}
                  className={`is-click${active ? ' is-active' : ''}`}
                  onClick={() => {
                    setA(ra)
                    setB(rb)
                  }}
                >
                  <td className="mono-cell">{ra}</td>
                  {gate === 'not' ? null : <td className="mono-cell">{rb}</td>}
                  <td className="mono-cell">{gateOut(gate, ra, rb)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Explain paras={[gateItem.text]} />
      </Section>

      <Section title={t(S.invTitle)} note={t(S.invNote)}>
        <figure className="term-fig">
          <WaveRows
            span={400}
            period={100}
            strobe={75}
            rows={[
              {
                name: 'IN',
                segs: inSegs,
                labels: inBits.map((bit, i) => ({ t: i * 100 + 20, text: bit ? 'VIH' : 'VIL' })),
              },
              {
                name: 'OUT',
                segs: outSegs,
                color: 'var(--green)',
                labels: inBits.map((bit, i) => ({ t: i * 100 + 20, text: bit ? 'VOL' : 'VOH' })),
              },
            ]}
            ariaLabel="inverter"
          />
          <figcaption>{t(INV_CAP)}</figcaption>
        </figure>
        <div className="kind">
          {INV_TERMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kind__btn${item.id === term ? ' is-right' : ''}`}
              onClick={() => {
                setTerm(item.id)
                setNote({ kicker: S.kicker, title: item.label, text: item.text })
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Explain paras={[INV_TERMS.find((item) => item.id === term)?.text ?? '']} />
      </Section>

      {/* 7. D 触发器 */}
      <Section title={t(S.dffTitle)} note={t(S.dffNote)}>
        {DFF_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={atEnd} onClick={() => setTick((v) => Math.min(DFF_MAX, v + 1))}>
            {t(S.step)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (atEnd) setTick(0)
              setPlaying((p) => (atEnd ? true : !p))
            }}
          >
            {t(playing && !atEnd ? S.pause : S.play)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setTick(0)
              setPlaying(false)
            }}
          >
            {t(S.reset)}
          </button>
        </div>
        <DffFig d={dBits} time={time} onToggle={(k) => setDBits((prev) => prev.map((v, j) => (j === k ? 1 - v : v)))} />
        <Readout
          items={[
            { label: S.now, value: `${time.toFixed(2)} ${t(S.cycleUnit)}` },
            { label: 'CLK', value: String(clkNow) },
            { label: 'D', value: String(dNow) },
            { label: 'Q', value: qNow === 'z' ? t(S.unknown) : String(qNow), state: qNow === 'z' ? undefined : 'pass' },
            {
              label: S.sampled,
              value: edgesPassed === 0 ? t(S.noEdge) : t(S.lastEdge).replace('{n}', String(edgesPassed)),
            },
          ]}
        />
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
