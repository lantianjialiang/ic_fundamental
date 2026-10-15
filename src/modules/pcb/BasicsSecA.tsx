import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { TermsFig, WidthFig } from './BasicsFigs'
import { ClearanceFig } from './BasicsFigs2'
import { TERMS, TERMS_S, type TermId } from './data/pcbBasics'
import {
  OZ_MIL,
  clearanceCreepage,
  currentForWidthMil,
  ipcSpacingMm,
  milToMm,
  mmToMil,
  traceResistance,
  widthMilForCurrent,
  GROOVE_DEPTH_MM,
  GROOVE_MIN_MM,
  type LayerKind,
} from './data/pcbBasicsModel'
import { SPACE_NOTES, SPACE_S, WIDTH_NOTES, WIDTH_S } from './data/pcbBasicsText'

export type SecProps = { onOpen: (id: ModuleId) => void; setNote: (note: PrepNote) => void }

const L = {
  pit: loc('常见错误：', 'Common slip: '),
  over: loc(
    '超过 35 A，已在 IPC-2221 的数据范围之外，结果只是外推，不可靠。',
    'Above 35 A the result lies outside the IPC-2221 data and is only an extrapolation.',
  ),
}

/* ---------- 术语 ---------- */

export function TermsSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [id, setId] = useState<TermId>(TERMS[0].id)
  const item = TERMS.find((x) => x.id === id) ?? TERMS[0]
  const pick = (next: TermId) => {
    const it = TERMS.find((x) => x.id === next) ?? TERMS[0]
    setId(next)
    setNote({ kicker: TERMS_S.kicker, title: it.title, text: it.text })
  }
  return (
    <Section title={t(TERMS_S.title)} note={t(TERMS_S.note)}>
      <Cards items={TERMS} activeId={id} cols={3} onPick={(x) => pick(x.id as TermId)} />
      <TermsFig active={id} onPick={pick} />
      <Callout>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={item.text} onOpen={onOpen} />
        <p>
          <b>{t(L.pit)}</b>
        </p>
        <RefP text={item.pit} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbFlow', 'pcbStack', 'connection']} onOpen={onOpen} />
    </Section>
  )
}

/* ---------- 线宽计算器 ---------- */

type CalcMode = 'cur' | 'wid'

const MODES: Array<{ id: CalcMode; label: typeof WIDTH_S.modeA }> = [
  { id: 'cur', label: WIDTH_S.modeA },
  { id: 'wid', label: WIDTH_S.modeB },
]

const LAYERS: Array<{ id: LayerKind; label: typeof WIDTH_S.ext }> = [
  { id: 'ext', label: WIDTH_S.ext },
  { id: 'int', label: WIDTH_S.int },
]

export function WidthSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [mode, setMode] = useState<CalcMode>(MODES[0].id)
  const [layer, setLayer] = useState<LayerKind>(LAYERS[0].id)
  const [amp, setAmp] = useState(1)
  const [dT, setDT] = useState(20)
  const [oz, setOz] = useState(1)
  const [wMm, setWMm] = useState(0.5)
  const touch = () => setNote({ kicker: WIDTH_S.kicker, title: WIDTH_S.kickerTitle, text: WIDTH_NOTES[0] })

  const fromCur = mode === 'cur'
  const widthMil = fromCur ? widthMilForCurrent(amp, dT, oz, layer) : mmToMil(wMm)
  const widthMm = milToMm(widthMil)
  const current = fromCur ? amp : currentForWidthMil(widthMil, dT, oz, layer)
  const areaMil2 = widthMil * oz * OZ_MIL
  const r10 = traceResistance(widthMm, oz, 10)
  const layerName = layer === 'ext' ? loc('外层', 'external') : loc('内层', 'internal')
  const sentence = fromCur
    ? loc(
        `${current.toFixed(2)} A、温升 ${dT} °C、${oz} oz、${layerName.zh}：线宽至少 ${widthMm.toFixed(2)} mm（${widthMil.toFixed(1)} mil）。`,
        `${current.toFixed(2)} A, ${dT} °C rise, ${oz} oz, ${layerName.en}: width at least ${widthMm.toFixed(2)} mm (${widthMil.toFixed(1)} mil).`,
      )
    : loc(
        `线宽 ${widthMm.toFixed(2)} mm、温升 ${dT} °C、${oz} oz、${layerName.zh}：可载电流约 ${current.toFixed(2)} A。`,
        `Width ${widthMm.toFixed(2)} mm, ${dT} °C rise, ${oz} oz, ${layerName.en}: current capacity about ${current.toFixed(2)} A.`,
      )

  return (
    <Section title={t(WIDTH_S.title)} note={t(WIDTH_S.note)}>
      <div className="prep-actions">
        <Seg
          options={MODES}
          value={mode}
          onChange={(m) => {
            setMode(m)
            touch()
          }}
        />
        <Seg
          options={LAYERS}
          value={layer}
          onChange={(l) => {
            setLayer(l)
            touch()
          }}
        />
      </div>
      <div className="knob-row">
        {fromCur ? (
          <Knob label={WIDTH_S.amp} value={amp} unit="A" min={0.1} max={10} step={0.1} onChange={(v) => { setAmp(v); touch() }} />
        ) : (
          <Knob label={WIDTH_S.width} value={wMm} unit="mm" min={0.1} max={5} step={0.05} onChange={(v) => { setWMm(v); touch() }} />
        )}
        <Knob label={WIDTH_S.dT} value={dT} unit="°C" min={5} max={100} step={5} onChange={(v) => { setDT(v); touch() }} />
        <Knob label={WIDTH_S.copper} value={oz} unit="oz" min={0.5} max={3} step={0.5} onChange={(v) => { setOz(v); touch() }} />
      </div>
      <WidthFig amp={current} widthMm={widthMm} dT={dT} oz={oz} layer={layer} />
      <Readout
        items={[
          { label: fromCur ? WIDTH_S.outW : WIDTH_S.outI, value: fromCur ? `${widthMm.toFixed(2)} mm · ${widthMil.toFixed(1)} mil` : `${current.toFixed(2)} A` },
          { label: WIDTH_S.area, value: `${areaMil2.toFixed(1)} mil²` },
          { label: WIDTH_S.thick, value: `${(oz * OZ_MIL).toFixed(2)} mil · ${(oz * OZ_MIL * 25.4).toFixed(0)} µm` },
          { label: WIDTH_S.r10, value: `${(r10 * 1000).toFixed(1)} mΩ` },
          { label: WIDTH_S.drop10, value: `${(r10 * current * 1000).toFixed(1)} mV` },
        ]}
      />
      <Callout tone={current > 35 ? 'bad' : 'ok'}>
        <p>
          <b>{t(sentence)}</b>
        </p>
        {current > 35 ? <p>{t(L.over)}</p> : null}
      </Callout>
      <Callout>
        <RefParas paras={WIDTH_NOTES} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbMaterial', 'pcbStack', 'pcbLayout', 'pMeasure']} onOpen={onOpen} />
    </Section>
  )
}

/* ---------- 间距与爬电 ---------- */

type SlotMode = 'flat' | 'slot'

const SLOTS: Array<{ id: SlotMode; label: typeof SPACE_S.flat }> = [
  { id: 'flat', label: SPACE_S.flat },
  { id: 'slot', label: SPACE_S.slot },
]

export function SpaceSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [slot, setSlot] = useState<SlotMode>(SLOTS[0].id)
  const [gap, setGap] = useState(6)
  const [slotW, setSlotW] = useState(1.5)
  const [volt, setVolt] = useState(250)
  const touch = () => setNote({ kicker: SPACE_S.kicker, title: SPACE_S.kickerTitle, text: SPACE_NOTES[0] })
  const grooved = slot === 'slot'
  const cc = clearanceCreepage(gap, grooved, slotW)
  const req = ipcSpacingMm(volt)
  const enough = cc.clearance >= req
  const verdict = enough ? loc('够', 'enough') : loc('不够，要加大间距', 'not enough; widen the gap')
  const slotWhy = cc.effective
    ? loc(
        `不小于 ${GROOVE_MIN_MM.toFixed(1)} mm，路径要下到槽底再爬上来，爬电距离多出 2 × ${GROOVE_DEPTH_MM.toFixed(1)} mm。`,
        `at least ${GROOVE_MIN_MM.toFixed(1)} mm, so the path must drop to the slot bottom and climb back, adding 2 × ${GROOVE_DEPTH_MM.toFixed(1)} mm of creepage.`,
      )
    : loc(
        `小于 ${GROOVE_MIN_MM.toFixed(1)} mm，灰尘会填满，路径抄近路，爬电距离没有增加。`,
        `under ${GROOVE_MIN_MM.toFixed(1)} mm, so dust fills it, the path takes the shortcut and creepage does not grow.`,
      )
  return (
    <Section title={t(SPACE_S.title)} note={t(SPACE_S.note)}>
      <Seg
        options={SLOTS}
        value={slot}
        onChange={(s) => {
          setSlot(s)
          touch()
        }}
      />
      <div className="knob-row">
        <Knob label={SPACE_S.gap} value={gap} unit="mm" min={3} max={12} step={0.5} onChange={(v) => { setGap(v); touch() }} />
        {grooved ? <Knob label={SPACE_S.slotW} value={slotW} unit="mm" min={0.5} max={2.5} step={0.25} onChange={(v) => { setSlotW(v); touch() }} /> : null}
        <Knob label={SPACE_S.volt} value={volt} unit="V" min={10} max={1000} step={10} onChange={(v) => { setVolt(v); touch() }} />
      </div>
      <ClearanceFig gap={gap} grooved={grooved} slotW={slotW} creepage={cc.creepage} />
      <Readout
        items={[
          { label: SPACE_S.clr, value: `${cc.clearance.toFixed(2)} mm` },
          { label: SPACE_S.crp, value: `${cc.creepage.toFixed(2)} mm` },
          { label: SPACE_S.req, value: `${req.toFixed(2)} mm`, state: enough ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={enough ? 'ok' : 'bad'}>
        <p>
          <b>{t(enough ? SPACE_S.ok : SPACE_S.short)}</b>
          {t(
            loc(
              `：${volt} V 时 IPC-2221 B2 要求至少 ${req.toFixed(2)} mm，现在是 ${gap.toFixed(2)} mm，所以${verdict.zh}。`,
              `: at ${volt} V, IPC-2221 B2 asks for at least ${req.toFixed(2)} mm and the board has ${gap.toFixed(2)} mm, so it is ${verdict.en}.`,
            ),
          )}
        </p>
        {grooved ? (
          <p>
            <b>{t(cc.effective ? SPACE_S.slotOn : SPACE_S.slotOff)}</b>
            {t(
              loc(
                `：槽宽 ${slotW.toFixed(2)} mm，${slotWhy.zh}`,
                `: slot width ${slotW.toFixed(2)} mm, ${slotWhy.en}`,
              ),
            )}
          </p>
        ) : null}
      </Callout>
      <Callout>
        <RefParas paras={SPACE_NOTES} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbMaterial', 'pcbStack', 'pcbDfm', 'connection']} onOpen={onOpen} />
    </Section>
  )
}
