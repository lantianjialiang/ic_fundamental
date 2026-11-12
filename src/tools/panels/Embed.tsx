import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { formatEng, parseMeasure } from '../convert'
import { timerCalc } from '../calc'
import { Field, Note, Outcome, Seg, type PanelProps } from '../ui'

const PRESETS = [
  { id: 'k25', label: loc('1 kHz，25%', '1 kHz, 25%'), clock: '48000000', pre: '48', count: '1000', high: '250' },
  { id: 'k50', label: loc('1 kHz，50%', '1 kHz, 50%'), clock: '8000000', pre: '8', count: '1000', high: '500' },
]

export function ClockTool({ onOpenLesson }: PanelProps) {
  const first = PRESETS[0]
  const [presetId, setPresetId] = useState(first.id)
  const [clockText, setClockText] = useState(first.clock)
  const [periodText, setPeriodText] = useState('')
  const [periodSource, setPeriodSource] = useState(false)
  const [preText, setPreText] = useState(first.pre)
  const [countText, setCountText] = useState(first.count)
  const [highText, setHighText] = useState(first.high)

  const periodIn = parseMeasure(periodText)
  const hz = periodSource ? (periodIn !== null && periodIn > 0 ? 1 / periodIn : null) : parseMeasure(clockText)
  const pre = parseMeasure(preText)
  const count = parseMeasure(countText)
  const high = parseMeasure(highText)
  const timer = hz && pre && count && high !== null ? timerCalc(hz, pre, count, high) : null
  const periodShown = hz && hz > 0 ? String(Number((1 / hz).toPrecision(8))) : ''

  const apply = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id)
    if (!preset) return
    setPresetId(preset.id)
    setClockText(preset.clock)
    setPeriodSource(false)
    setPreText(preset.pre)
    setCountText(preset.count)
    setHighText(preset.high)
  }

  const problem = !clockText.trim() && !periodSource
    ? { tone: 'hint' as const, text: loc('输入时钟频率。', 'Enter a clock frequency.') }
    : hz === null || !Number.isFinite(hz) || hz <= 0
      ? { tone: 'bad' as const, text: loc('时钟要是正数。周期是频率的倒数，所以频率不能是 0。', 'The clock must be a positive number. Period is the reciprocal of frequency, so the frequency cannot be 0.') }
      : !timer
        ? { tone: 'bad' as const, text: loc('预分频和周期计数须为正整数，高电平计数须为 0 到周期计数之间的整数。', 'Enter positive integers for the prescaler and period count, and an integer from 0 to the period count for the high count.') }
        : null

  const result = timer
    ? loc(
        `频率 ${formatEng(hz!, 'Hz')} 的周期是 ${formatEng(1 / hz!, 's')}。定时周期 = 预分频 × 计数值 / 时钟 = ${pre} × ${count} / ${formatEng(hz!, 'Hz')} = ${formatEng(timer.period, 's')}，也就是 ${formatEng(timer.freq, 'Hz')}。占空比 = 高电平计数 / 周期计数 = ${high} / ${count} = ${formatEng(timer.duty * 100, '%').replace(' %', '%')}。很多芯片的预分频寄存器和自动重装寄存器存的是这个数减 1，写进 PSC、ARR 之前要先减 1。`,
        `A frequency of ${formatEng(hz!, 'Hz')} has period ${formatEng(1 / hz!, 's')}. Timer period = prescaler × count / clock = ${pre} × ${count} / ${formatEng(hz!, 'Hz')} = ${formatEng(timer.period, 's')}, which is ${formatEng(timer.freq, 'Hz')}. Duty = high count / period count = ${high} / ${count} = ${formatEng(timer.duty * 100, '%').replace(' %', '%')}. Many chips store one less than these numbers in the prescaler and auto-reload registers, so subtract 1 before writing PSC and ARR.`,
      )
    : null

  return (
    <>
      <Seg label={loc('常用例子', 'Common examples')} items={PRESETS} activeId={presetId} onPick={apply} />
      <div className="tools-fields">
        <Field
          id="tools-clock-hz"
          label={loc('时钟（Hz）', 'Clock (Hz)')}
          value={periodSource ? (hz ? String(Number(hz.toPrecision(8))) : '') : clockText}
          readOnly={periodSource}
          onFocus={() => {
            if (periodSource) setClockText(hz && Number.isFinite(hz) ? String(hz) : '')
            setPeriodSource(false)
          }}
          onChange={(value) => {
            setPeriodSource(false)
            setClockText(value)
            setPresetId('')
          }}
        />
        <Field
          id="tools-clock-s"
          label={loc('周期（s）', 'Period (s)')}
          value={periodSource ? periodText : periodShown}
          readOnly={!periodSource}
          onFocus={() => {
            setPeriodSource(true)
            if (!periodSource) setPeriodText(hz && hz > 0 ? String(1 / hz) : '')
          }}
          onChange={(value) => {
            setPeriodText(value)
            setPresetId('')
          }}
        />
        <Field id="tools-clock-pre" label={loc('预分频倍数', 'Prescaler')} value={preText} onChange={(value) => { setPreText(value); setPresetId('') }} />
        <Field id="tools-clock-count" label={loc('周期计数', 'Period count')} value={countText} onChange={(value) => { setCountText(value); setPresetId('') }} />
        <Field id="tools-clock-high" label={loc('高电平计数', 'High count')} value={highText} onChange={(value) => { setHighText(value); setPresetId('') }} />
      </div>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('频率和周期互为倒数，和高速课里 UI = 1 / 速率是同一件事。这里的预分频是“时钟被分成几份”，不是寄存器里那个已经减过 1 的值。', 'Frequency and period are reciprocals, the same relationship as UI = 1 / rate in the high-speed lesson. Prescaler here is how many ways the clock is divided, not the register value that has already had 1 subtracted.')}
        lessons={['hsBasics']}
      />
    </>
  )
}
