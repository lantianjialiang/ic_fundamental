import { useState } from 'react'
import { loc, type LText } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import {
  COLOR_HEX,
  DIGIT_COLORS,
  E24,
  E96,
  bandsFromValue,
  capacitanceFor,
  dividerOut,
  dividerR1,
  dividerR2,
  ledLimit,
  nearestSeries,
  rcForward,
  resistanceFor,
  solveOhm,
  valueFromBands,
  type BandCount,
  type OhmKey,
} from '../calc'
import { formatEng, formatMeasure, parseMeasure } from '../convert'
import { CheckField, Field, Note, Outcome, Seg, type PanelProps } from '../ui'

const OHM_ROWS: Array<{ id: OhmKey; label: LText; units: Array<{ id: string; mul: number; label: LText }> }> = [
  {
    id: 'v',
    label: loc('电压', 'Voltage'),
    units: [
      { id: 'V', mul: 1, label: loc('V', 'V') },
      { id: 'mV', mul: 1e-3, label: loc('mV', 'mV') },
    ],
  },
  {
    id: 'i',
    label: loc('电流', 'Current'),
    units: [
      { id: 'mA', mul: 1e-3, label: loc('mA', 'mA') },
      { id: 'uA', mul: 1e-6, label: loc('µA', 'µA') },
      { id: 'A', mul: 1, label: loc('A', 'A') },
    ],
  },
  {
    id: 'r',
    label: loc('电阻', 'Resistance'),
    units: [
      { id: 'ohm', mul: 1, label: loc('Ω', 'Ω') },
      { id: 'kohm', mul: 1e3, label: loc('kΩ', 'kΩ') },
      { id: 'Mohm', mul: 1e6, label: loc('MΩ', 'MΩ') },
    ],
  },
  {
    id: 'p',
    label: loc('功率', 'Power'),
    units: [
      { id: 'mW', mul: 1e-3, label: loc('mW', 'mW') },
      { id: 'W', mul: 1, label: loc('W', 'W') },
    ],
  },
]

const PAIR_REASON = {
  vi: loc('已知电压和电流：R = V/I，P = V×I。先把毫安化成安、毫伏化成伏，再相乘或相除。', 'Known voltage and current: R = V/I and P = V×I. Convert milliamps to amps and millivolts to volts before multiplying or dividing.'),
  vr: loc('已知电压和电阻：I = V/R，P = V²/R。', 'Known voltage and resistance: I = V/R and P = V²/R.'),
  vp: loc('已知电压和功率：I = P/V，R = V²/P。电压为 0 时除不开。', 'Known voltage and power: I = P/V and R = V²/P. A voltage of 0 cannot be divided into.'),
  ir: loc('已知电流和电阻：V = I×R，P = I²×R。', 'Known current and resistance: V = I×R and P = I²×R.'),
  ip: loc('已知电流和功率：V = P/I，R = P/I²。电流为 0 时除不开。', 'Known current and power: V = P/I and R = P/I². A current of 0 cannot be divided into.'),
  rp: loc('已知电阻和功率：V = √(P×R)，I = √(P/R)。P 和 R 要同号才能开方，开出来的电压和电流取正值。', 'Known resistance and power: V = √(P×R) and I = √(P/R). P and R must have the same sign before the square root, and the voltage and current come out positive.'),
}

function UnitPick({ id, units, value, onChange }: { id: string; units: Array<{ id: string; label: LText }>; value: string; onChange: (id: string) => void }) {
  const { t } = useLocale()
  return (
    <select id={id} aria-label={t(loc('单位', 'Unit'))} value={value} onChange={(event) => onChange(event.target.value)}>
      {units.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {t(unit.label)}
        </option>
      ))}
    </select>
  )
}

export function OhmTool({ onOpenLesson }: PanelProps) {
  const [rows, setRows] = useState(() =>
    OHM_ROWS.map((row, index) => ({
      id: row.id,
      text: index === 0 ? '3.3' : index === 1 ? '10' : '',
      unit: row.units[0].id,
      known: index < 2,
    })),
  )
  const known: Partial<Record<OhmKey, number>> = {}
  let bad = false
  for (const row of rows) {
    if (!row.known) continue
    const number = parseMeasure(row.text)
    const mul = OHM_ROWS.find((item) => item.id === row.id)?.units.find((unit) => unit.id === row.unit)?.mul ?? 1
    if (number === null) {
      if (row.text.trim() !== '') bad = true
    } else known[row.id] = number * mul
  }
  const solved = bad ? null : solveOhm(known)
  const shown = (id: OhmKey, mul: number) => {
    if (!solved || !solved.ok) return ''
    return formatMeasure(solved[id] / mul)
  }
  const update = (id: OhmKey, patch: Partial<(typeof rows)[number]>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const problem = bad
    ? { tone: 'bad' as const, text: loc('勾上的格子里要是数字。', 'Checked boxes need a number.') }
    : !solved
      ? null
      : solved.ok
        ? null
        : solved.reason === 'count'
          ? { tone: 'hint' as const, text: loc('勾两个已知量。多勾或少勾都定不出其余两个。', 'Check exactly two known quantities. More or fewer does not determine the other two.') }
          : solved.reason === 'zero'
            ? { tone: 'bad' as const, text: loc('这个组合要做除法，除数是 0，算不出来。', 'This pair needs a division, and the divisor is 0, so there is no result.') }
            : { tone: 'bad' as const, text: loc('电阻和功率异号时，根号里面是负数，电压和电流不是实数。', 'When resistance and power have opposite signs, the square root is negative and voltage and current are not real.') }

  const result = solved && solved.ok
    ? loc(
        `${formatEng(solved.v, 'V')}，${formatEng(solved.i, 'A')}，${formatEng(solved.r, 'Ω')}，${formatEng(solved.p, 'W')}。${PAIR_REASON[solved.pair].zh}`,
        `${formatEng(solved.v, 'V')}, ${formatEng(solved.i, 'A')}, ${formatEng(solved.r, 'Ω')}, ${formatEng(solved.p, 'W')}. ${PAIR_REASON[solved.pair].en}`,
      )
    : null

  return (
    <>
      <div className="tools-fields">
        {OHM_ROWS.map((spec) => {
          const row = rows.find((item) => item.id === spec.id) ?? rows[0]
          const mul = spec.units.find((unit) => unit.id === row.unit)?.mul ?? 1
          return (
            <CheckField
              key={spec.id}
              id={`tools-ohm-${spec.id}`}
              label={spec.label}
              checked={row.known}
              value={row.known ? row.text : shown(spec.id, mul)}
              onChange={(value) => update(spec.id, { text: value })}
              onChecked={(checked) => update(spec.id, { known: checked, text: checked ? shown(spec.id, mul) || row.text : row.text })}
              after={<UnitPick id={`tools-ohm-${spec.id}-unit`} units={spec.units} value={row.unit} onChange={(unit) => update(spec.id, { unit })} />}
            />
          )
        })}
      </div>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('桌上测电压、电流时，电阻和功率都从这两个数来。单位不统一是最常见的算错。', 'On the bench, resistance and power both come from voltage and current. Mixing units is the usual way to get the wrong number.')}
        lessons={['pMeasure']}
      />
    </>
  )
}

const DIV_MODES = [
  { id: 'vout', label: loc('求输出', 'Find output') },
  { id: 'r1', label: loc('求上电阻', 'Find top resistor') },
  { id: 'r2', label: loc('求下电阻', 'Find bottom resistor') },
]

export function DividerTool({ onOpenLesson }: PanelProps) {
  const { t } = useLocale()
  const [mode, setMode] = useState(DIV_MODES[0].id)
  const [vinText, setVinText] = useState('5')
  const [r1Text, setR1Text] = useState('10000')
  const [r2Text, setR2Text] = useState('10000')
  const [voutText, setVoutText] = useState('2.5')
  const [vsText, setVsText] = useState('5')
  const [vfText, setVfText] = useState('2')
  const [iText, setIText] = useState('10')
  const vin = parseMeasure(vinText)
  const r1 = parseMeasure(r1Text)
  const r2 = parseMeasure(r2Text)
  const voutIn = parseMeasure(voutText)
  const vs = parseMeasure(vsText)
  const vf = parseMeasure(vfText)
  const iMa = parseMeasure(iText)
  const forward = mode === 'vout' && vin !== null && r1 !== null && r2 !== null ? dividerOut(vin, r1, r2) : null
  const solvedR1 = mode === 'r1' && vin !== null && voutIn !== null && r2 !== null ? dividerR1(vin, voutIn, r2) : null
  const solvedR2 = mode === 'r2' && vin !== null && voutIn !== null && r1 !== null ? dividerR2(vin, voutIn, r1) : null
  const led = vs !== null && vf !== null && iMa !== null ? ledLimit(vs, vf, iMa / 1000) : null
  const nearest = led && led.ok ? nearestSeries(led.r, E24, 10) : null

  const divResult = forward
    ? loc(
        `Vout = Vin × R2 / (R1+R2) = ${formatEng(forward.vout, 'V')}。R1 在上面，从电源到输出；R2 在下面，从输出到地。空载电流 = Vin / (R1+R2) = ${formatEng(forward.current, 'A')}。接上负载后输出会被拉低，这个电压只对空载成立。`,
        `Vout = Vin × R2 / (R1+R2) = ${formatEng(forward.vout, 'V')}. R1 is on top, from the supply to the output; R2 is on the bottom, from the output to ground. Unloaded current = Vin / (R1+R2) = ${formatEng(forward.current, 'A')}. A load pulls the output down, so this voltage holds only with no load.`,
      )
    : solvedR1
      ? loc(
          `R1 = R2 × (Vin−Vout) / Vout = ${formatEng(solvedR1, 'Ω')}。输出比是 R2 / (R1+R2)，所以要的输出越接近电源，上电阻越小。`,
          `R1 = R2 × (Vin−Vout) / Vout = ${formatEng(solvedR1, 'Ω')}. The output ratio is R2 / (R1+R2), so an output closer to the supply needs a smaller top resistor.`,
        )
      : solvedR2
        ? loc(
            `R2 = R1 × Vout / (Vin−Vout) = ${formatEng(solvedR2, 'Ω')}。Vout 不能等于或超过 Vin，否则下电阻不是正的。`,
            `R2 = R1 × Vout / (Vin−Vout) = ${formatEng(solvedR2, 'Ω')}. Vout cannot equal or pass Vin, or the bottom resistor is not positive.`,
          )
        : null

  const ledResult = led && led.ok && nearest
    ? loc(
        `R = (Vs−Vf) / I = ${formatMeasure(led.drop)} V / ${formatEng(iMa! / 1000, 'A')} = ${formatEng(led.r, 'Ω')}。电阻上只有电源减去正向压降，不是整个电源电压。电阻功耗 P = (Vs−Vf)×I = ${formatEng(led.p, 'W')}。最近的 E24 是 ${formatEng(nearest.value, 'Ω')}，偏差 ${formatMeasure(nearest.errorPct)}%。`,
        `R = (Vs−Vf) / I = ${formatMeasure(led.drop)} V / ${formatEng(iMa! / 1000, 'A')} = ${formatEng(led.r, 'Ω')}. The resistor sees the supply minus the forward drop, not the whole supply. Resistor power P = (Vs−Vf)×I = ${formatEng(led.p, 'W')}. The nearest E24 value is ${formatEng(nearest.value, 'Ω')}, off by ${formatMeasure(nearest.errorPct)}%.`,
      )
    : null

  const divBad = !divResult && ((mode === 'vout' && vinText.trim() && r1Text.trim() && r2Text.trim()) || (mode !== 'vout' && vinText.trim() && voutText.trim() && (mode === 'r1' ? r2Text.trim() : r1Text.trim())))
  const ledBad = vsText.trim() && vfText.trim() && iText.trim() && led && !led.ok

  return (
    <>
      <h3>{t(loc('分压', 'Divider'))}</h3>
      <Seg label={loc('分压求什么', 'What the divider solves')} items={DIV_MODES} activeId={mode} onPick={setMode} />
      <div className="tools-circuit-layout">
        <svg className="tools-schematic" viewBox="0 0 224 180" role="img" aria-label={t(loc('Vin 经 R1 接到 Vout，Vout 再经 R2 接地。', 'Vin connects through R1 to Vout, which connects through R2 to ground.'))}>
          <path d="M68 25v15m0 36v18h72M68 94v12m0 36v14m-13 0h26m-21 5h16m-11 5h6" />
          <circle cx="68" cy="22" r="3" />
          <circle cx="143" cy="94" r="3" />
          <circle cx="68" cy="94" r="3" className="tools-schematic__junction" />
          <g className={mode === 'r1' ? 'tools-schematic__target' : undefined}>
            <rect x="59" y="40" width="18" height="36" />
            <text x="88" y="58">R1</text>
          </g>
          <g className={mode === 'r2' ? 'tools-schematic__target' : undefined}>
            <rect x="59" y="106" width="18" height="36" />
            <text x="88" y="124">R2</text>
          </g>
          <text x="81" y="22">Vin</text>
          <text x="154" y="94" className={mode === 'vout' ? 'tools-schematic__target' : undefined}>Vout</text>
          <text x="88" y="156">GND</text>
        </svg>
        <div className="tools-fields">
          <Field id="tools-div-vin" label={loc('Vin（V）', 'Vin (V)')} value={vinText} onChange={setVinText} />
          {mode !== 'r1' ? <Field id="tools-div-r1" label={loc('R1 上电阻（Ω）', 'R1 top (Ω)')} value={r1Text} onChange={setR1Text} /> : null}
          {mode !== 'r2' ? <Field id="tools-div-r2" label={loc('R2 下电阻（Ω）', 'R2 bottom (Ω)')} value={r2Text} onChange={setR2Text} /> : null}
          {mode !== 'vout' ? <Field id="tools-div-vout" label={loc('Vout（V）', 'Vout (V)')} value={voutText} onChange={setVoutText} /> : null}
        </div>
      </div>
      <Outcome tone={divResult ? 'ok' : divBad ? 'bad' : 'hint'} text={divResult ?? (divBad ? loc('电阻要大于 0，而且输出要落在 0 和 Vin 之间，否则求不出正电阻。', 'The resistors must be greater than 0, and the output must sit between 0 and Vin, or there is no positive resistor.') : loc('填电源和两只电阻，或改成反求其中一只。', 'Enter the supply and both resistors, or switch to solving for one of them.'))} />
      <h3 className="tools-subhead">{t(loc('LED 限流', 'LED current limit'))}</h3>
      <div className="tools-circuit-layout">
        <svg className="tools-schematic" viewBox="0 0 224 180" role="img" aria-label={t(loc('电流 I 从电源 Vs 流经限流电阻 R，再流过 LED 到地。LED 正向压降为 Vf。', 'Current I flows from supply Vs through resistor R and the LED to ground. The LED forward drop is Vf.'))}>
          <path d="M68 25v15m0 36v28m0 23v29m-13 0h26m-21 5h16m-11 5h6" />
          <circle cx="68" cy="22" r="3" />
          <g className="tools-schematic__target">
            <rect x="59" y="40" width="18" height="36" />
            <text x="88" y="58">R</text>
          </g>
          <path d="M56 104h24l-12 23zM56 127h24M83 109l10-10m-6 0h6v6m-5 10 10-10m-6 0h6v6" />
          <path d="M41 48v32m-4-6 4 6 4-6" />
          <text x="23" y="64">I</text>
          <text x="81" y="22">Vs</text>
          <text x="108" y="119">LED (Vf)</text>
          <text x="88" y="156">GND</text>
        </svg>
        <div className="tools-fields">
          <Field id="tools-led-vs" label={loc('电源 Vs（V）', 'Supply Vs (V)')} value={vsText} onChange={setVsText} />
          <Field id="tools-led-vf" label={loc('正向压降 Vf（V）', 'Forward drop Vf (V)')} value={vfText} onChange={setVfText} />
          <Field id="tools-led-i" label={loc('目标电流（mA）', 'Target current (mA)')} value={iText} onChange={setIText} />
        </div>
      </div>
      <Outcome
        tone={ledResult ? 'ok' : ledBad ? 'bad' : 'hint'}
        text={
          ledResult ??
          (led && !led.ok
            ? led.reason === 'drop'
              ? loc('正向压降不低于电源，电阻上没有正电压，限流电阻算不出来。', 'The forward drop is not below the supply, so there is no positive voltage left for a current-limit resistor.')
              : loc('目标电流要大于 0。', 'The target current must be greater than 0.')
            : loc('填电源、正向压降和目标电流。', 'Enter the supply, the forward drop and the target current.'))
        }
      />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('分压和限流都是欧姆定律。元件认图里的电阻、LED 就是这两只。', 'Dividers and current limits are Ohm’s law. The resistor and LED in the component-literacy lesson are these two parts.')}
        lessons={['pMeasure', 'pParts']}
      />
    </>
  )
}

const RC_MODES = [
  { id: 'rc', label: loc('已知 R、C', 'Known R, C') },
  { id: 'c', label: loc('已知 fc、R', 'Known fc, R') },
  { id: 'r', label: loc('已知 fc、C', 'Known fc, C') },
]

export function RcTool({ onOpenLesson }: PanelProps) {
  const [mode, setMode] = useState(RC_MODES[0].id)
  const [rText, setRText] = useState('10')
  const [cText, setCText] = useState('100')
  const [fText, setFText] = useState('159.15')
  const resistance = (parseMeasure(rText) ?? NaN) * 1e3
  const capacitance = (parseMeasure(cText) ?? NaN) * 1e-9
  const fcIn = parseMeasure(fText)
  const forward = mode === 'rc' && resistance > 0 && capacitance > 0 ? rcForward(resistance, capacitance) : null
  const solvedC = mode === 'c' && fcIn && resistance > 0 ? capacitanceFor(fcIn, resistance) : null
  const solvedR = mode === 'r' && fcIn && capacitance > 0 ? resistanceFor(fcIn, capacitance) : null
  const result = forward
    ? loc(
        `τ = R×C = ${formatEng(forward.tau, 's')}。一阶低通或高通的 −3 dB 点 fc = 1/(2πRC) = ${formatEng(forward.fc, 'Hz')}，因为这时 ωRC = 1，输出幅度是输入的 1/√2。这不是二阶或更高阶的滤波器。`,
        `τ = R×C = ${formatEng(forward.tau, 's')}. The −3 dB point of a first-order low-pass or high-pass is fc = 1/(2πRC) = ${formatEng(forward.fc, 'Hz')}, because ωRC = 1 there and the output amplitude is 1/√2 of the input. This is not a second-order or higher filter.`,
      )
    : solvedC
      ? loc(
          `C = 1/(2π·R·fc) = ${formatEng(solvedC, 'F')}。先选定电阻，再用目标截止频率把电容求出来；τ = R×C 仍是同一时间常数。`,
          `C = 1/(2π·R·fc) = ${formatEng(solvedC, 'F')}. Pick the resistor first, then the target cutoff gives the capacitor. τ = R×C is still the same time constant.`,
        )
      : solvedR
        ? loc(
            `R = 1/(2π·fc·C) = ${formatEng(solvedR, 'Ω')}。电容先定，再用目标截止频率反求电阻。`,
            `R = 1/(2π·fc·C) = ${formatEng(solvedR, 'Ω')}. The capacitor is chosen first, and the target cutoff solves for the resistor.`,
          )
        : null

  return (
    <>
      <Seg label={loc('已知什么', 'What is known')} items={RC_MODES} activeId={mode} onPick={setMode} />
      <div className="tools-fields">
        {mode !== 'r' ? <Field id="tools-rc-r" label={loc('R（kΩ）', 'R (kΩ)')} value={rText} onChange={setRText} /> : null}
        {mode !== 'c' ? <Field id="tools-rc-c" label={loc('C（nF）', 'C (nF)')} value={cText} onChange={setCText} /> : null}
        {mode !== 'rc' ? <Field id="tools-rc-f" label={loc('fc（Hz）', 'fc (Hz)')} value={fText} onChange={setFText} /> : null}
      </div>
      <Outcome tone={result ? 'ok' : 'bad'} text={result ?? loc('R、C 和 fc 都要大于 0。', 'R, C and fc must all be greater than 0.')} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('预备课里的 RC 就是这个时间常数。截止频率按一阶滤波器的 −3 dB 定义。', 'The RC in the primer lesson is this time constant. Cutoff uses the first-order filter’s −3 dB definition.')}
        lessons={['mosPrimer']}
      />
    </>
  )
}

const COLOR_NAME: Record<string, LText> = {
  black: loc('黑', 'Black'),
  brown: loc('棕', 'Brown'),
  red: loc('红', 'Red'),
  orange: loc('橙', 'Orange'),
  yellow: loc('黄', 'Yellow'),
  green: loc('绿', 'Green'),
  blue: loc('蓝', 'Blue'),
  violet: loc('紫', 'Violet'),
  grey: loc('灰', 'Grey'),
  white: loc('白', 'White'),
  gold: loc('金', 'Gold'),
  silver: loc('银', 'Silver'),
}

const TOLERANCES = [
  { id: 'gold', pct: 5 },
  { id: 'silver', pct: 10 },
  { id: 'brown', pct: 1 },
  { id: 'red', pct: 2 },
  { id: 'green', pct: 0.5 },
  { id: 'blue', pct: 0.25 },
  { id: 'violet', pct: 0.1 },
]

const BAND_COUNTS = [
  { id: '4', label: loc('四环', '4-band') },
  { id: '5', label: loc('五环', '5-band') },
]

const COLOR_PRESETS = [
  { id: '1k', text: '1000', label: loc('1 kΩ', '1 kΩ') },
  { id: '10k', text: '10000', label: loc('10 kΩ', '10 kΩ') },
  { id: '4k7', text: '4700', label: loc('4.7 kΩ', '4.7 kΩ') },
  { id: '330', text: '330', label: loc('330 Ω', '330 Ω') },
]

const SERIES = [
  { id: 'e24', label: loc('E24', 'E24'), values: E24, base: 10 },
  { id: 'e96', label: loc('E96', 'E96'), values: E96, base: 100 },
]

const MULT_COLORS = [...DIGIT_COLORS, 'gold', 'silver'] as const

export function ResistorTool({ onOpenLesson }: PanelProps) {
  const { t } = useLocale()
  const [countId, setCountId] = useState(BAND_COUNTS[0].id)
  const [ohmsText, setOhmsText] = useState(COLOR_PRESETS[0].text)
  const [presetId, setPresetId] = useState(COLOR_PRESETS[0].id)
  const [tolId, setTolId] = useState(TOLERANCES[0].id)
  const [seriesId, setSeriesId] = useState(SERIES[0].id)
  const [matchText, setMatchText] = useState('260')
  const count = Number(countId) as BandCount
  const ohms = parseMeasure(ohmsText)
  const bands = ohms && ohms > 0 ? bandsFromValue(ohms, count) : null
  const tol = TOLERANCES.find((item) => item.id === tolId) ?? TOLERANCES[0]
  const series = SERIES.find((item) => item.id === seriesId) ?? SERIES[0]
  const match = parseMeasure(matchText)
  const nearest = match && match > 0 ? nearestSeries(match, series.values, series.base) : null
  const figures = count === 4 ? 2 : 3

  const setDigit = (index: number, color: string) => {
    if (!bands) return
    const digits = [...bands.digits]
    digits[index] = DIGIT_COLORS.indexOf(color as (typeof DIGIT_COLORS)[number])
    const value = valueFromBands(digits, bands.exp)
    setOhmsText(formatMeasure(value))
    setPresetId('')
  }

  const setExp = (color: string) => {
    if (!bands) return
    const exp = color === 'gold' ? -1 : color === 'silver' ? -2 : DIGIT_COLORS.indexOf(color as (typeof DIGIT_COLORS)[number])
    setOhmsText(formatMeasure(valueFromBands(bands.digits, exp)))
    setPresetId('')
  }

  const bandKind =
    count === 4
      ? loc('四环是两位有效数字加乘数', 'A 4-band code is two significant digits plus a multiplier')
      : loc('五环是三位有效数字加乘数', 'A 5-band code is three significant digits plus a multiplier')
  const inexact =
    bands && !bands.exact
      ? loc(
          `输入的 ${ohmsText} Ω 不能刚好用 ${figures} 位有效数字表示，色环取最近的这一挡。`,
          ` ${ohmsText} Ω cannot be written with exactly ${figures} significant digits, so the bands use the nearest code.`,
        )
      : null
  const nominal = bands ? valueFromBands(bands.digits, bands.exp) : 0
  const colorResult = bands
    ? loc(
        `${formatEng(nominal, 'Ω')}，容差 ±${tol.pct}%，大约 ${formatEng(nominal * (1 - tol.pct / 100), 'Ω')} 到 ${formatEng(nominal * (1 + tol.pct / 100), 'Ω')}。${bandKind.zh}，最后一环是容差，和前面的数字环分开。${inexact?.zh ?? ''}`,
        `${formatEng(nominal, 'Ω')}, tolerance ±${tol.pct}%, about ${formatEng(nominal * (1 - tol.pct / 100), 'Ω')} to ${formatEng(nominal * (1 + tol.pct / 100), 'Ω')}. ${bandKind.en}; the last band is the tolerance and sits apart from the digit bands.${inexact?.en ?? ''}`,
      )
    : null

  const matchResult = nearest
    ? loc(
        `${formatEng(match!, 'Ω')} 最近的 ${series.id.toUpperCase()} 是 ${formatEng(nearest.value, 'Ω')}，偏差 ${formatMeasure(nearest.errorPct)}%。低一挡 ${formatEng(nearest.low, 'Ω')}，高一挡 ${formatEng(nearest.high, 'Ω')}。偏差 = (标准值 − 计算值) / 计算值。E24 大约每十倍程 24 个值，E96 更密，容差通常也更紧。`,
        `${formatEng(match!, 'Ω')} is nearest to ${series.id.toUpperCase()} ${formatEng(nearest.value, 'Ω')}, off by ${formatMeasure(nearest.errorPct)}%. The next lower value is ${formatEng(nearest.low, 'Ω')} and the next higher is ${formatEng(nearest.high, 'Ω')}. Error = (standard − calculated) / calculated. E24 has about 24 values per decade; E96 is denser and usually has a tighter tolerance.`,
      )
    : null

  const expColor = bands ? (bands.exp === -1 ? 'gold' : bands.exp === -2 ? 'silver' : DIGIT_COLORS[bands.exp]) : 'black'

  return (
    <>
      <Seg label={loc('色环数', 'Band count')} items={BAND_COUNTS} activeId={countId} onPick={setCountId} />
      <Seg
        label={loc('常用阻值', 'Common values')}
        items={COLOR_PRESETS}
        activeId={presetId}
        onPick={(id) => {
          const preset = COLOR_PRESETS.find((item) => item.id === id)
          if (!preset) return
          setPresetId(preset.id)
          setOhmsText(preset.text)
        }}
      />
      {bands ? (
        <div className="resistor" aria-hidden="true">
          <span className="resistor__lead" />
          <span className="resistor__body">
            {bands.digits.map((digit, index) => (
              <i key={index} style={{ background: COLOR_HEX[DIGIT_COLORS[digit]] }} />
            ))}
            <i style={{ background: COLOR_HEX[expColor] }} />
            <i className="is-tol" style={{ background: COLOR_HEX[tol.id as keyof typeof COLOR_HEX] }} />
          </span>
          <span className="resistor__lead" />
        </div>
      ) : null}
      <div className="tools-fields">
        <Field
          id="tools-res-ohm"
          label={loc('阻值（Ω）', 'Resistance (Ω)')}
          value={ohmsText}
          bad={!!ohmsText.trim() && !bands}
          onChange={(value) => {
            setOhmsText(value)
            setPresetId(COLOR_PRESETS.find((item) => item.text === value.trim())?.id ?? '')
          }}
        />
        {bands
          ? bands.digits.map((digit, index) => (
              <div key={index} className="tools-field">
                <label htmlFor={`tools-band-${index}`}>{t(loc(`数字环 ${index + 1}`, `Digit band ${index + 1}`))}</label>
                <select
                  id={`tools-band-${index}`}
                  value={DIGIT_COLORS[digit]}
                  onChange={(event) => setDigit(index, event.target.value)}
                >
                  {DIGIT_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {t(COLOR_NAME[color])}
                    </option>
                  ))}
                </select>
              </div>
            ))
          : null}
        {bands ? (
          <div className="tools-field">
            <label htmlFor="tools-band-mult">{t(loc('乘数环', 'Multiplier band'))}</label>
            <select id="tools-band-mult" value={expColor} onChange={(event) => setExp(event.target.value)}>
              {MULT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {t(COLOR_NAME[color])}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="tools-field">
          <label htmlFor="tools-band-tol">{t(loc('容差环', 'Tolerance band'))}</label>
          <select id="tools-band-tol" value={tolId} onChange={(event) => setTolId(event.target.value)}>
            {TOLERANCES.map((item) => (
              <option key={item.id} value={item.id}>
                {t(COLOR_NAME[item.id])} ±{item.pct}%
              </option>
            ))}
          </select>
        </div>
      </div>
      <Outcome tone={colorResult ? 'ok' : 'bad'} text={colorResult ?? loc('阻值要大于 0。', 'Resistance must be greater than 0.')} />
      <h3 className="tools-subhead">{t(loc('标准阻值', 'Standard values'))}</h3>
      <Seg label={loc('系列', 'Series')} items={SERIES} activeId={seriesId} onPick={setSeriesId} />
      <div className="tools-fields">
        <Field id="tools-res-match" label={loc('计算值（Ω）', 'Calculated value (Ω)')} value={matchText} onChange={setMatchText} />
      </div>
      <Outcome tone={matchResult ? 'ok' : 'bad'} text={matchResult ?? loc('计算值要大于 0。', 'The calculated value must be greater than 0.')} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('色环从离端头较近的一端读起，容差环通常更靠边。算出来的电阻还要落到 E24 或 E96 上才能买到。', 'Read the bands from the end where they sit closer together; the tolerance band is usually the one on its own. A calculated resistor still has to land on E24 or E96 before you can buy it.')}
        lessons={['pParts']}
      />
    </>
  )
}
