import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { microstripZ0, striplineZ0, type LayerKind } from '../../modules/pcb/data/pcbBasicsModel'
import { currentFromTrace, diffImpedance, traceFromCurrent } from '../calc'
import { MM_PER_IN, MM_PER_MIL, MM_PER_OZ, MM_PER_UM, OZ_MIL, UM_PER_OZ, formatMeasure, parseMeasure } from '../convert'
import { Field, Note, Outcome, Seg, type PanelProps } from '../ui'

const LENGTH_UNITS = [
  { id: 'mil', label: loc('mil', 'mil'), toMm: MM_PER_MIL },
  { id: 'mm', label: loc('毫米 mm', 'Millimetres mm'), toMm: 1 },
  { id: 'um', label: loc('微米 µm', 'Micrometres µm'), toMm: MM_PER_UM },
  { id: 'in', label: loc('英寸 inch', 'Inches'), toMm: MM_PER_IN },
]

const LENGTH_PRESETS = [
  { id: 'mil6', unitId: LENGTH_UNITS[0].id, text: '6', label: loc('6 mil 线宽', '6 mil trace') },
  { id: 'mil4', unitId: LENGTH_UNITS[0].id, text: '4', label: loc('4 mil 线宽', '4 mil trace') },
  { id: 'mil8', unitId: LENGTH_UNITS[0].id, text: '8', label: loc('8 mil 线宽', '8 mil trace') },
  { id: 'mil10', unitId: LENGTH_UNITS[0].id, text: '10', label: loc('10 mil 线宽', '10 mil trace') },
  { id: 'mm05', unitId: LENGTH_UNITS[1].id, text: '0.5', label: loc('0.5 mm 线宽', '0.5 mm trace') },
  { id: 'mm127', unitId: LENGTH_UNITS[1].id, text: '1.27', label: loc('1.27 mm 间距', '1.27 mm pitch') },
  { id: 'mm254', unitId: LENGTH_UNITS[1].id, text: '2.54', label: loc('2.54 mm 间距', '2.54 mm pitch') },
]

const OZ_UNITS = [
  { id: 'oz', label: loc('oz/ft²', 'oz/ft²'), toOz: 1 },
  { id: 'um', label: loc('微米 µm', 'Micrometres µm'), toOz: 1 / UM_PER_OZ },
  { id: 'mil', label: loc('mil', 'mil'), toOz: 1 / OZ_MIL },
  { id: 'mm', label: loc('毫米 mm', 'Millimetres mm'), toOz: 1 / MM_PER_OZ },
]

const OZ_PRESETS = [
  { id: 'oz1', text: '1', label: loc('1 oz', '1 oz') },
  { id: 'oz05', text: '0.5', label: loc('0.5 oz', '0.5 oz') },
  { id: 'oz2', text: '2', label: loc('2 oz', '2 oz') },
  { id: 'oz3', text: '3', label: loc('3 oz', '3 oz') },
]

function LinkedMeasure({
  fieldId,
  units,
  presets,
  negativeText,
  resultFor,
  note,
  lessons,
  onOpenLesson,
}: {
  fieldId: string
  units: Array<{ id: string; label: ReturnType<typeof loc>; toCanon: number }>
  presets: Array<{ id: string; unitId: string; text: string; label: ReturnType<typeof loc> }>
  negativeText: ReturnType<typeof loc>
  resultFor: (canon: number) => ReturnType<typeof loc>
  note: ReturnType<typeof loc>
  lessons: PanelProps['onOpenLesson'] extends (id: infer M) => void ? M[] : never
  onOpenLesson: PanelProps['onOpenLesson']
}) {
  const first = presets[0]
  const [sourceId, setSourceId] = useState(first.unitId)
  const [text, setText] = useState(first.text)
  const [presetId, setPresetId] = useState(first.id)
  const source = units.find((unit) => unit.id === sourceId) ?? units[0]
  const parsed = parseMeasure(text)
  const negative = parsed !== null && parsed < 0
  const canon = parsed === null || negative ? null : parsed * source.toCanon
  const match = (unitId: string, value: string) => {
    const number = parseMeasure(value)
    return presets.find((preset) => preset.unitId === unitId && parseMeasure(preset.text) === number)?.id ?? ''
  }
  const problem =
    text.trim() === ''
      ? { tone: 'hint' as const, text: loc('输入一个数。', 'Enter a number.') }
      : parsed === null
        ? { tone: 'bad' as const, text: loc('这里要填数字，例如 6 或 0.15。', 'Enter a number, such as 6 or 0.15.') }
        : negative
          ? { tone: 'bad' as const, text: negativeText }
          : null

  return (
    <>
      <Seg
        label={loc('常用例子', 'Common examples')}
        items={presets}
        activeId={presetId}
        onPick={(id) => {
          const preset = presets.find((item) => item.id === id)
          if (!preset) return
          setPresetId(preset.id)
          setSourceId(preset.unitId)
          setText(preset.text)
        }}
      />
      <div className="tools-fields">
        {units.map((unit) => {
          const active = unit.id === source.id
          const shown = active ? text : canon === null ? '' : formatMeasure(canon / unit.toCanon)
          return (
            <Field
              key={unit.id}
              id={`tools-${fieldId}-${unit.id}`}
              label={unit.label}
              value={shown}
              readOnly={!active}
              bad={active && problem?.tone === 'bad'}
              onFocus={() => {
                if (active) return
                const next = unit
                const shownNext = canon === null ? '' : formatMeasure(canon / next.toCanon)
                setSourceId(unit.id)
                setText(shownNext)
                setPresetId(match(unit.id, shownNext))
              }}
              onChange={
                active
                  ? (value) => {
                      setText(value)
                      setPresetId(match(sourceId, value))
                    }
                  : undefined
              }
            />
          )
        })}
      </div>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? (canon === null ? null : resultFor(canon))} />
      <Note text={note} lessons={lessons} onOpenLesson={onOpenLesson} />
    </>
  )
}

export function LengthTool({ onOpenLesson }: PanelProps) {
  return (
    <LinkedMeasure
      fieldId="length"
      units={LENGTH_UNITS.map((unit) => ({ id: unit.id, label: unit.label, toCanon: unit.toMm }))}
      presets={LENGTH_PRESETS}
      negativeText={loc('长度不能是负数。', 'A length cannot be negative.')}
      onOpenLesson={onOpenLesson}
      lessons={['pcbBasics', 'pcbTools']}
      resultFor={(mm) => {
        const mil = formatMeasure(mm / MM_PER_MIL)
        const inch = formatMeasure(mm / MM_PER_IN)
        return loc(
          `${mil} mil = ${formatMeasure(mm)} mm = ${formatMeasure(mm * 1000)} µm = ${inch} inch。1 mil = 0.001 inch = 0.0254 mm = 25.4 µm，四栏是同一个长度。`,
          `${mil} mil = ${formatMeasure(mm)} mm = ${formatMeasure(mm * 1000)} µm = ${inch} inch. 1 mil = 0.001 inch = 0.0254 mm = 25.4 µm, so the four columns are the same length.`,
        )
      }}
      note={loc(
        '板厂常把 6 mil 写成 0.15 mm，精确值是 0.1524 mm，0.15 是四舍五入。1.27 mm 是 50 mil，2.54 mm 是 100 mil，排针和 DIP 用这个间距。',
        'Fabs often write 6 mil as 0.15 mm. The exact value is 0.1524 mm; 0.15 is rounded. 1.27 mm is 50 mil and 2.54 mm is 100 mil, the pitch of pin headers and DIP packages.',
      )}
    />
  )
}

export function OzTool({ onOpenLesson }: PanelProps) {
  const perOzUm = formatMeasure(UM_PER_OZ)
  return (
    <LinkedMeasure
      fieldId="oz"
      units={OZ_UNITS.map((unit) => ({ id: unit.id, label: unit.label, toCanon: unit.toOz }))}
      presets={OZ_PRESETS.map((preset) => ({ ...preset, unitId: OZ_UNITS[0].id }))}
      negativeText={loc('铜厚不能是负数。', 'Copper weight cannot be negative.')}
      onOpenLesson={onOpenLesson}
      lessons={['pcbBasics', 'pcbTools']}
      resultFor={(oz) =>
        loc(
          `${formatMeasure(oz)} oz = ${formatMeasure(oz * OZ_MIL)} mil = ${formatMeasure(oz * UM_PER_OZ)} µm = ${formatMeasure(oz * MM_PER_OZ)} mm。厚度 = 铜重 × ${OZ_MIL} mil，${OZ_MIL} × 25.4 = ${perOzUm} µm。PCBWay 把 1 oz、2 oz、3 oz 写成 35 µm、70 µm、105 µm，差的是四舍五入。oz 是每平方英尺的铜重，不是这块板的重量；外层还会电镀，成品外层比标称箔更厚。`,
          `${formatMeasure(oz)} oz = ${formatMeasure(oz * OZ_MIL)} mil = ${formatMeasure(oz * UM_PER_OZ)} µm = ${formatMeasure(oz * MM_PER_OZ)} mm. Thickness = weight × ${OZ_MIL} mil, and ${OZ_MIL} × 25.4 = ${perOzUm} µm. PCBWay lists 1 oz, 2 oz and 3 oz as 35 µm, 70 µm and 105 µm; the difference is rounding. oz is ounces of copper per square foot, not the weight of the board. Outer layers are plated, so finished outer copper is thicker than this nominal foil.`,
        )
      }
      note={loc('线宽载流和阻抗用的就是这个标称厚度。0.5 oz 约 17.5 µm，内层常用。', 'Trace-current and impedance estimates use this nominal thickness. 0.5 oz is about 17.5 µm and is common on inner layers.')}
    />
  )
}

const TRACE_MODES = [
  { id: 'width', label: loc('求线宽', 'Find width') },
  { id: 'current', label: loc('求载流', 'Find current') },
]
const LAYERS = [
  { id: 'ext', label: loc('外层', 'Outer') },
  { id: 'int', label: loc('内层', 'Inner') },
]

export function TraceTool({ onOpenLesson }: PanelProps) {
  const [mode, setMode] = useState(TRACE_MODES[0].id)
  const [layer, setLayer] = useState(LAYERS[0].id)
  const [ampText, setAmpText] = useState('1')
  const [ozText, setOzText] = useState('1')
  const [tempText, setTempText] = useState('10')
  const [widthText, setWidthText] = useState('0.5')
  const layerKind = layer as LayerKind
  const oz = parseMeasure(ozText)
  const temp = parseMeasure(tempText)
  const amp = parseMeasure(ampText)
  const width = parseMeasure(widthText)
  const fromCurrent = mode === 'width' && amp && oz && temp ? traceFromCurrent(amp, temp, oz, layerKind) : null
  const fromWidth = mode === 'current' && width && oz && temp ? currentFromTrace(width, temp, oz, layerKind) : null
  const missing = (mode === 'width' ? !ampText.trim() : !widthText.trim()) || !ozText.trim() || !tempText.trim()
  const bad = !missing && (mode === 'width' ? !fromCurrent : !fromWidth)
  const k = layerKind === 'ext' ? 0.048 : 0.024
  const layerName = layerKind === 'ext' ? loc('外层', 'outer') : loc('内层', 'inner')
  const result = fromCurrent
    ? loc(
        `IPC-2221：I = k·ΔT^0.44·A^0.725。外层 k = 0.048，内层 k = 0.024，这里用 ${k}。内层 k 取一半是因为夹在板子中间、散热差，不是铜更薄。${amp} A、${oz} oz、温升 ${temp} °C、${layerName.zh}，截面积约 ${formatMeasure(fromCurrent.area)} mil²，线宽 ${formatMeasure(fromCurrent.widthMil)} mil（${formatMeasure(fromCurrent.widthMm)} mm）。这个式子偏保守，也没算外层电镀加上的铜。`,
        `IPC-2221: I = k·ΔT^0.44·A^0.725. Outer k is 0.048 and inner k is 0.024; this uses ${k}. The inner k is half because the trace is buried and sheds heat poorly, not because the copper is thinner. At ${amp} A, ${oz} oz, ${temp} °C rise, ${layerName.en}, the cross-section is about ${formatMeasure(fromCurrent.area)} mil² and the width is ${formatMeasure(fromCurrent.widthMil)} mil (${formatMeasure(fromCurrent.widthMm)} mm). The formula is conservative and does not include extra plated copper on outer layers.`,
      )
    : fromWidth
      ? loc(
          `同一条 IPC-2221，反过来由线宽求电流。k = ${k}，${formatMeasure(width!)} mm、${oz} oz、温升 ${temp} °C，大约能走 ${formatMeasure(fromWidth.amp)} A。截面积 ${formatMeasure(fromWidth.area)} mil² = 线宽 × 铜厚，铜厚 = oz × ${OZ_MIL} mil。`,
          `The same IPC-2221 formula, solved for current. With k = ${k}, ${formatMeasure(width!)} mm, ${oz} oz and ${temp} °C rise, the trace carries about ${formatMeasure(fromWidth.amp)} A. Cross-section ${formatMeasure(fromWidth.area)} mil² = width × copper thickness, and thickness = oz × ${OZ_MIL} mil.`,
        )
      : null

  return (
    <>
      <Seg label={loc('已知什么', 'What is known')} items={TRACE_MODES} activeId={mode} onPick={setMode} />
      <Seg label={loc('哪一层', 'Which layer')} items={LAYERS} activeId={layer} onPick={setLayer} />
      <div className="tools-fields">
        {mode === 'width' ? <Field id="tools-trace-i" label={loc('电流（A）', 'Current (A)')} value={ampText} onChange={setAmpText} /> : <Field id="tools-trace-w" label={loc('线宽（mm）', 'Width (mm)')} value={widthText} onChange={setWidthText} />}
        <Field id="tools-trace-oz" label={loc('铜厚（oz）', 'Copper (oz)')} value={ozText} onChange={setOzText} />
        <Field id="tools-trace-t" label={loc('温升（°C）', 'Temp rise (°C)')} value={tempText} onChange={setTempText} />
      </div>
      <Outcome
        tone={missing ? 'hint' : bad ? 'bad' : 'ok'}
        text={missing ? loc('填电流或线宽、铜厚和温升。', 'Enter the current or width, the copper weight and the temperature rise.') : bad ? loc('电流、线宽、铜厚和温升都要大于 0。', 'Current, width, copper weight and temperature rise must all be greater than 0.') : result}
      />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('和线宽课用的是同一个 IPC-2221 式子。IPC-2152 更新，内层靠近平面时可以更窄；要打样以板厂能力为准。', 'This is the same IPC-2221 formula as the trace-width lesson. IPC-2152 is newer and allows a narrower inner trace next to a plane. For a real board, the fab’s capability decides.')}
        lessons={['pcbBasics']}
      />
    </>
  )
}

const STACKS = [
  { id: 'micro', label: loc('表层微带', 'Microstrip') },
  { id: 'strip', label: loc('内层带状', 'Stripline') },
]
const COUPLES = [
  { id: 'single', label: loc('单端', 'Single-ended') },
  { id: 'diff', label: loc('差分', 'Differential') },
]

export function ImpTool({ onOpenLesson }: PanelProps) {
  const { t } = useLocale()
  const [stack, setStack] = useState(STACKS[0].id)
  const [couple, setCouple] = useState(COUPLES[0].id)
  const [erText, setErText] = useState('4.5')
  const [hText, setHText] = useState('0.2')
  const [wText, setWText] = useState('0.3')
  const [tText, setTText] = useState('0.035')
  const [sText, setSText] = useState('0.2')
  const er = parseMeasure(erText)
  const h = parseMeasure(hText)
  const w = parseMeasure(wText)
  const thick = parseMeasure(tText)
  const gap = parseMeasure(sText)
  const micro = stack === 'micro'
  const numbersOk = er !== null && h !== null && w !== null && thick !== null && er > 1 && h > 0 && w > 0 && thick > 0
  const z0 = numbersOk ? (micro ? microstripZ0(er, h, w, thick) : striplineZ0(er, h, w, thick)) : 0
  const plane = micro ? h : h !== null && thick !== null ? 2 * h + thick : 0
  const diff = couple === 'diff' && numbersOk && gap !== null ? diffImpedance(z0, gap, plane ?? 0, micro) : null
  const ratio = numbersOk && h ? w / h : 0
  const inRange = ratio > 0.1 && ratio < 2 && er !== null && er < 15
  const missing = !erText.trim() || !hText.trim() || !wText.trim() || !tText.trim() || (couple === 'diff' && !sText.trim())
  const bad = !missing && (!numbersOk || (couple === 'diff' && !diff))

  const stackName = micro ? loc('表层微带', 'Microstrip') : loc('内层带状', 'Stripline')
  const rangeNote = inRange
    ? loc('落在这两个式子常引用的 0.1 < w/h < 2、Er < 15 里。', 'This sits in the usual 0.1 < w/h < 2 and Er < 15 window.')
    : loc('已经超出 0.1 < w/h < 2 或 Er < 15，式子仍给出数字，但误差会变大。', 'This is outside 0.1 < w/h < 2 or Er < 15. The formula still returns a number, but the error grows.')
  const result =
    numbersOk && z0 > 0
      ? couple === 'single'
        ? loc(
            `${stackName.zh} Z0 ≈ ${formatMeasure(z0)} Ω。微带 Z0 = 87 / √(Er+1.41) × ln(5.98·h / (0.8·w+t))；带状 Z0 = 60 / √Er × ln(1.9·(2h+t) / (0.8·w+t))，h 是到一侧平面的厚度。w/h = ${formatMeasure(ratio)}。${rangeNote.zh}这是近似，阻焊和梯形截面都没算，50 Ω 或 90 Ω 最后以板厂叠层为准。`,
            `${stackName.en} Z0 ≈ ${formatMeasure(z0)} Ω. Microstrip is Z0 = 87 / √(Er+1.41) × ln(5.98·h / (0.8·w+t)); stripline is Z0 = 60 / √Er × ln(1.9·(2h+t) / (0.8·w+t)), with h the height to one plane. w/h = ${formatMeasure(ratio)}. ${rangeNote.en} It is an approximation: soldermask and the trapezoid cross-section are omitted. A real 50 Ω or 90 Ω target follows the fab stack-up.`,
          )
        : diff
          ? loc(
              `单端 Z0 ≈ ${formatMeasure(z0)} Ω。差分不是 2×Z0：间距越近，两条线之间的电容越大，Zdiff 越低于 2×Z0。这里用 IPC-2141A 的拟合，Zdiff = 2·Z0·(1 − k) ≈ ${formatMeasure(diff.zDiff)} Ω，k ≈ ${formatMeasure(diff.k)}，不耦合时是 ${formatMeasure(diff.uncoupled)} Ω。微带 k = 0.48·e^(−0.96·s/h)，带状 k = 0.347·e^(−2.9·s/b)，b = 2h+t。KiCad 的耦合线计算器走奇模阻抗，Zdiff = 2·Zodd，和这条拟合不是同一步。误差大约一成，最后仍以板厂为准。`,
              `Single-ended Z0 ≈ ${formatMeasure(z0)} Ω. Differential impedance is not 2×Z0: a closer gap adds capacitance between the traces, so Zdiff falls below 2×Z0. This uses the IPC-2141A fit, Zdiff = 2·Z0·(1 − k) ≈ ${formatMeasure(diff.zDiff)} Ω, with k ≈ ${formatMeasure(diff.k)}. Uncoupled it would be ${formatMeasure(diff.uncoupled)} Ω. For microstrip k = 0.48·e^(−0.96·s/h); for stripline k = 0.347·e^(−2.9·s/b), b = 2h+t. KiCad’s coupled-line calculator uses odd-mode impedance, Zdiff = 2·Zodd, which is not this fit. Expect about 10% error; the fab stack-up still decides.`,
            )
          : null
      : null

  return (
    <>
      <Seg label={loc('叠层', 'Stack-up')} items={STACKS} activeId={stack} onPick={setStack} />
      <Seg label={loc('单端还是差分', 'Single-ended or differential')} items={COUPLES} activeId={couple} onPick={setCouple} />
      <StackFig micro={micro} diff={couple === 'diff'} />
      <p className="tools-hint">{t(loc('图里 w 是线宽，s 是边到边的间距，h 是到参考平面的介质厚度，t 是铜厚。', 'In the figure, w is trace width, s is the edge-to-edge gap, h is the dielectric height to the reference plane, and t is the copper thickness.'))}</p>
      <div className="tools-fields">
        <Field id="tools-z-er" label={loc('介电常数 Er', 'Dielectric Er')} value={erText} onChange={setErText} />
        <Field id="tools-z-h" label={loc('介质厚度 h（mm）', 'Dielectric h (mm)')} value={hText} onChange={setHText} />
        <Field id="tools-z-w" label={loc('线宽 w（mm）', 'Width w (mm)')} value={wText} onChange={setWText} />
        <Field id="tools-z-t" label={loc('铜厚 t（mm）', 'Copper t (mm)')} value={tText} onChange={setTText} />
        {couple === 'diff' ? <Field id="tools-z-s" label={loc('间距 s（mm）', 'Gap s (mm)')} value={sText} onChange={setSText} /> : null}
      </div>
      <Outcome
        tone={missing ? 'hint' : bad || !result ? 'bad' : 'ok'}
        text={
          missing
            ? loc('填 Er、h、w、t。差分再填间距 s。', 'Enter Er, h, w and t. For a differential pair, also enter the gap s.')
            : bad || !result
              ? loc('Er 要大于 1，h、w、t 和间距都要大于 0。几何太极端时对数里的真数会小于 1，这个近似就不再给出正的阻抗。', 'Er must be greater than 1, and h, w, t and the gap must be greater than 0. If the geometry is extreme, the logarithm’s argument drops below 1 and this approximation no longer gives a positive impedance.')
              : result
        }
      />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('单端式子和 {@pcbBasics} 相同。叠层里 h 和 Er 由板厂的芯板决定，见 {@pcbStack}。', 'The single-ended formulas are the same as in {@pcbBasics}. In the stack-up, h and Er come from the fab’s core, see {@pcbStack}.')}
        lessons={['pcbBasics', 'pcbStack']}
      />
    </>
  )
}

function StackFig({ micro, diff }: { micro: boolean; diff: boolean }) {
  const traceY = micro ? 36 : 58
  const traces = diff
    ? [
        { x: 96, w: 40 },
        { x: 184, w: 40 },
      ]
    : [{ x: 132, w: 56 }]
  return (
    <svg className="stack-fig" viewBox="0 0 320 130" role="img">
      <rect x="70" y={micro ? 46 : 28} width="180" height={micro ? 50 : 68} className="stack-fig__dielectric" />
      {micro ? null : <rect x="70" y="18" width="180" height="10" className="stack-fig__plane" />}
      <rect x="70" y="96" width="180" height="12" className="stack-fig__plane" />
      {traces.map((trace) => (
        <rect key={trace.x} x={trace.x} y={traceY} width={trace.w} height="10" className="stack-fig__trace" />
      ))}
      <text x="48" y={micro ? 78 : 48} className="stack-fig__label">h</text>
      <text x={diff ? 116 : 160} y={traceY - 12} className="stack-fig__label">w</text>
      {diff ? <text x="160" y={traceY - 12} className="stack-fig__label">s</text> : null}
      {diff ? <text x="204" y={traceY - 12} className="stack-fig__label">w</text> : null}
    </svg>
  )
}
