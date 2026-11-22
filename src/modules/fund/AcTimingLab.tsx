import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type ParamId } from './data/ac'
import { type Seg as WaveSeg } from './data/func'
import { Knob, Readout, Seg } from './parts'
import { WaveRows, type WaveRow } from './WaveRows'

const SPAN = 32
const CLOCK = 16
const LAUNCH = 6
const PROPAGATION = 7
const ENABLE_DELAY = 6
const DISABLE_DELAY = 5

const SETTINGS: Record<ParamId, { label: LText; min: number; max: number; initial: number }> = {
  setup: { label: loc('D 提前于 CLK 的时间', 'Time D leads CLK'), min: 0, max: 10, initial: 6 },
  hold: { label: loc('D 在 CLK 后保留的时间', 'Time D stays after CLK'), min: 0, max: 10, initial: 5 },
  tpd: { label: loc('输入边之后的 Strobe', 'Strobe after input edge'), min: 1, max: 14, initial: 10 },
  pw: { label: loc('移动脉冲下降沿', 'Move the pulse falling edge'), min: 1, max: 12, initial: 8 },
  fmax: { label: loc('连续两次上升沿之间的周期', 'Period between rising edges'), min: 8, max: 22, initial: 18 },
  en: { label: loc('OE 边之后的 Strobe', 'Strobe after OE edge'), min: 1, max: 13, initial: 9 },
}

type TimingExample = {
  rows: WaveRow[]
  window: [number, number]
  strobe?: number
  reading: string
  pass: boolean
  caption: LText
}

function edge(at: number, before: WaveSeg['level'], after: WaveSeg['level']): WaveSeg[] {
  return [{ x0: 0, x1: at, level: before }, { x0: at, x1: SPAN, level: after }]
}

function clockTrain(period: number): WaveSeg[] {
  const segs: WaveSeg[] = [{ x0: 0, x1: 4, level: 0 }]
  for (let x = 4; x < SPAN; x += period) {
    const fall = Math.min(x + period / 2, SPAN)
    segs.push({ x0: x, x1: fall, level: 1 })
    if (fall < SPAN) segs.push({ x0: fall, x1: Math.min(x + period, SPAN), level: 0 })
  }
  return segs
}

function timingExample(param: ParamId, value: number, disable: boolean): TimingExample {
  const clk = { name: 'CLK', segs: edge(CLOCK, 0, 1) }
  switch (param) {
    case 'setup': {
      const data = CLOCK - value
      return {
        rows: [{ name: 'D', segs: edge(data, 0, 1), color: 'var(--green)' }, clk],
        window: [data, CLOCK],
        reading: `tSU = ${CLOCK} − ${data} = ${value} ns`,
        pass: value >= 3,
        caption: loc('窗口从 D 变稳开始，到 CLK 上升沿结束。示例要求至少 3 ns。', 'The window starts when D becomes stable and ends at the CLK rising edge. This example requires at least 3 ns.'),
      }
    }
    case 'hold': {
      const data = CLOCK + value
      return {
        rows: [{ name: 'D', segs: edge(data, 1, 0), color: 'var(--green)' }, clk],
        window: [CLOCK, data],
        reading: `tH = ${data} − ${CLOCK} = ${value} ns`,
        pass: value >= 2,
        caption: loc('窗口从 CLK 上升沿开始，到 D 改变时结束。示例要求至少 2 ns。', 'The window starts at the CLK rising edge and ends when D changes. This example requires at least 2 ns.'),
      }
    }
    case 'tpd': {
      const output = LAUNCH + PROPAGATION
      return {
        rows: [{ name: 'DIN', segs: edge(LAUNCH, 0, 1) }, { name: 'DOUT', segs: edge(output, 0, 1), color: 'var(--green)' }],
        window: [LAUNCH, output],
        strobe: LAUNCH + value,
        reading: `tPD = ${output} − ${LAUNCH} = ${PROPAGATION} ns · Strobe @ ${LAUNCH + value} ns`,
        pass: value >= PROPAGATION,
        caption: loc('输入和输出游标对应各自的判定门限。移动金色 Strobe 只改变采样时刻，器件的 tPD 保持固定。', 'The input and output cursors mark their respective decision thresholds. Moving the gold strobe changes the sample instant. The device tPD stays fixed.'),
      }
    }
    case 'pw': {
      const fall = LAUNCH + value
      return {
        rows: [{ name: 'CLK', segs: [{ x0: 0, x1: LAUNCH, level: 0 }, { x0: LAUNCH, x1: fall, level: 1 }, { x0: fall, x1: SPAN, level: 0 }] }],
        window: [LAUNCH, fall],
        reading: `tPW = ${fall} − ${LAUNCH} = ${value} ns`,
        pass: value >= 5,
        caption: loc('同一根信号上，用下降沿减去上升沿。示例的最小高脉宽是 5 ns。', 'Subtract the rising edge from the falling edge on the same signal. This example requires a high pulse at least 5 ns wide.'),
      }
    }
    case 'fmax':
      return {
        rows: [{ name: 'CLK', segs: clockTrain(value) }],
        window: [4, 4 + value],
        reading: `T = ${value} ns · f = 1/T = ${(1000 / value).toFixed(2)} MHz`,
        pass: value >= 15,
        caption: loc('周期用相邻两个上升沿相减。这里每周期都缩放，示例芯片的最短通过周期为 15 ns。', 'Subtract consecutive rising edges to get the period. All cycles scale together. The example chip passes down to 15 ns.'),
      }
    case 'en': {
      const delay = disable ? DISABLE_DELAY : ENABLE_DELAY
      const transition = LAUNCH + delay
      return {
        rows: [{ name: 'OE', segs: edge(LAUNCH, disable ? 1 : 0, disable ? 0 : 1) },
          { name: 'DOUT', segs: edge(transition, disable ? 1 : 'z', disable ? 'z' : 1), color: 'var(--green)' }],
        window: [LAUNCH, transition],
        strobe: LAUNCH + value,
        reading: `${disable ? 'tHZ' : 'tEN'} = ${transition} − ${LAUNCH} = ${delay} ns · Strobe @ ${LAUNCH + value} ns`,
        pass: value >= delay,
        caption: loc('负载用 DOUT ─ RLOAD ─ VREF。虚线表示输出已是高阻，外部电阻把端子拉向 VREF。Strobe 检查此时是否已进入目标状态。', 'The load is DOUT ─ RLOAD ─ VREF. The dashed trace indicates high-Z, when the external resistor pulls the pin toward VREF. The strobe checks whether the target state has been reached.'),
      }
    }
  }
}

export function AcTimingLab({ param }: { param: ParamId }) {
  const { t } = useLocale()
  const settings = SETTINGS[param]
  const [value, setValue] = useState(settings.initial)
  const [disable, setDisable] = useState(true)
  const diagram = timingExample(param, value, disable)
  return (
    <figure className="term-fig ac-parameter-lab" data-param={param}>
      {param === 'en' && <Seg options={[
        { id: 'en', label: loc('从高阻到驱动', 'High-Z to drive') },
        { id: 'dis', label: loc('从驱动到高阻', 'Drive to high-Z') },
      ]} value={disable ? 'dis' : 'en'} onChange={(value) => setDisable(value === 'dis')} />}
      <div className="knobs">
        <Knob label={settings.label} value={value} min={settings.min} max={settings.max} step={1} unit="ns" onChange={setValue} />
      </div>
      <WaveRows span={SPAN} period={SPAN} rows={diagram.rows} edges={[...new Set(diagram.window)]}
        window={diagram.window} strobe={diagram.strobe} ariaLabel={t(diagram.caption)} />
      <Readout items={[
        { label: loc('两条边之间', 'Between the edges'), value: diagram.reading },
        { label: loc('示例判定', 'Example verdict'), value: diagram.pass ? 'PASS' : 'FAIL', state: diagram.pass ? 'pass' : 'fail' },
      ]} />
      <figcaption>{t(diagram.caption)}</figcaption>
    </figure>
  )
}
