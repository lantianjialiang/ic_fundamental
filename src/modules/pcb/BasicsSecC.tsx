import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import { FootprintFig } from './BasicsFigs4'
import { type SecProps } from './BasicsSecA'
import { AR_MIN, FOOTS, apertureOf, areaRatio, paste, type ApMode, type FootId } from './data/pcbBasicsFoot'
import { FOOT_NOTES, FOOT_S } from './data/pcbBasicsText3'

const THICKS = [
  { id: '0.10', label: '0.10 mm' },
  { id: '0.11', label: '0.11 mm' },
  { id: '0.12', label: '0.12 mm' },
]

export function FootprintSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [footId, setFootId] = useState<FootId>(FOOTS[0].id)
  const [padId, setPadId] = useState(FOOTS[0].pads[0].id)
  const [mode, setMode] = useState<ApMode>('full')
  const [thickId, setThickId] = useState(THICKS[0].id)
  const [sigPct, setSigPct] = useState(90)
  const [epPct, setEpPct] = useState(60)

  const foot = FOOTS.find((f) => f.id === footId) ?? FOOTS[0]
  const pad = foot.pads.find((p) => p.id === padId) ?? foot.pads[0]
  const thick = Number(thickId)
  const ratioOf = (isEp: boolean | undefined) => (isEp ? epPct : sigPct) / 100
  const ap = apertureOf(pad, mode, ratioOf(pad.ep))
  const vol = paste(ap, thick)
  const ar = areaRatio(ap, thick)
  const ok = ar >= AR_MIN
  let total = 0
  let epVol = 0
  for (const p of foot.pads) {
    const v = paste(apertureOf(p, mode, ratioOf(p.ep)), thick)
    total += v
    if (p.ep) {
      epVol = v
    }
  }
  const hasEp = foot.pads.some((p) => p.ep)
  const note = () => setNote({ kicker: FOOT_S.kicker, title: foot.name, text: foot.note })
  const modeOptions: Array<{ id: ApMode; label: typeof FOOT_S.modeFull }> = [
    { id: 'full', label: FOOT_S.modeFull },
    { id: 'cut', label: pad.ep ? FOOT_S.modeWin : FOOT_S.modeCut },
  ]
  const half = vol / 2
  const verdict = ok
    ? loc('不小于 0.66，锡膏容易脱模。', 'at least 0.66, so the paste releases easily.')
    : loc('小于 0.66，锡膏容易卡在孔壁上，要换更薄的钢网或放大开口。', 'below 0.66, so paste sticks in the walls; use a thinner stencil or a larger aperture.')
  const sentence = loc(
    `焊盘 ${pad.id}：开口面积 ${ap.area.toFixed(3)} mm² × 钢网厚 ${thick.toFixed(2)} mm = ${vol.toFixed(4)} mm³ 锡膏，回流后约 ${half.toFixed(4)} mm³ 焊料。面积比 ${ar.toFixed(2)}，${verdict.zh}`,
    `Pad ${pad.id}: aperture area ${ap.area.toFixed(3)} mm² × stencil ${thick.toFixed(2)} mm = ${vol.toFixed(4)} mm³ of paste, about ${half.toFixed(4)} mm³ of solder after reflow. Area ratio ${ar.toFixed(2)}, ${verdict.en}`,
  )

  return (
    <Section title={t(FOOT_S.title)} note={t(FOOT_S.note)}>
      <Seg
        options={FOOTS.map((f) => ({ id: f.id, label: f.name }))}
        value={footId}
        onChange={(id) => {
          const next = FOOTS.find((f) => f.id === id) ?? FOOTS[0]
          setFootId(id)
          setPadId(next.pads[0].id)
          setNote({ kicker: FOOT_S.kicker, title: next.name, text: next.note })
        }}
      />
      <div className="prep-actions">
        <Seg
          options={modeOptions}
          value={mode}
          onChange={(m) => {
            setMode(m)
            note()
          }}
        />
        <Seg
          options={THICKS}
          value={thickId}
          onChange={(id) => {
            setThickId(id)
            note()
          }}
        />
      </div>
      {mode === 'cut' ? (
        <div className="knob-row">
          <Knob label={FOOT_S.ratio} value={sigPct} unit="%" min={70} max={100} step={5} onChange={setSigPct} />
          {hasEp ? <Knob label={FOOT_S.cover} value={epPct} unit="%" min={50} max={80} step={5} onChange={setEpPct} /> : null}
        </div>
      ) : null}
      <FootprintFig
        foot={foot}
        padId={pad.id}
        onPick={(id) => {
          setPadId(id)
          note()
        }}
        mode={mode}
        sigRatio={sigPct / 100}
        epCover={epPct / 100}
      />
      <Readout
        items={[
          { label: FOOT_S.padSize, value: `${pad.w.toFixed(2)} × ${pad.h.toFixed(2)} mm` },
          { label: FOOT_S.area, value: `${ap.area.toFixed(3)} mm²` },
          { label: FOOT_S.vol, value: `${vol.toFixed(4)} mm³` },
          { label: FOOT_S.ar, value: ar.toFixed(2), state: ok ? 'pass' : 'fail' },
          { label: FOOT_S.total, value: `${total.toFixed(3)} mm³` },
          ...(hasEp ? [{ label: FOOT_S.epShare, value: `${((epVol / total) * 100).toFixed(0)} %` }] : []),
        ]}
      />
      <Callout tone={ok ? 'ok' : 'bad'}>
        <p>
          <b>{t(sentence)}</b>
        </p>
        <p>{t(foot.note)}</p>
      </Callout>
      <Callout>
        <RefParas paras={FOOT_NOTES} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbFlow', 'pcbSupply', 'pPackage', 'pcbDfm', 'pcbLayout']} onOpen={onOpen} />
    </Section>
  )
}
