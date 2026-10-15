import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related } from '../prep/common'
import { MarksFig, MicrostripFig } from './BasicsFigs3'
import { PourFig } from './BasicsFigs2'
import { type SecProps } from './BasicsSecA'
import { microstripValid, microstripZ0, spokeCurrent, zSensitivity } from './data/pcbBasicsModel'
import { MARKS, MARKS_S, POURS, POUR_S, type MarkId, type PourId } from './data/pcbBasicsText2'
import { Z_NOTES, Z_S, Z_VARS } from './data/pcbBasicsText3'

/* ---------- 铺铜 ---------- */

export function PourSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [mode, setMode] = useState<PourId>(POURS[0].id)
  const [spoke, setSpoke] = useState(0.3)
  const item = POURS.find((p) => p.id === mode) ?? POURS[0]
  const amp = spokeCurrent(spoke, 4)
  return (
    <Section title={t(POUR_S.title)} note={t(POUR_S.note)}>
      <Seg
        options={POURS.map((p) => ({ id: p.id, label: p.title }))}
        value={mode}
        onChange={(id) => {
          const it = POURS.find((p) => p.id === id) ?? POURS[0]
          setMode(id)
          setNote({ kicker: POUR_S.kicker, title: it.title, text: it.text })
        }}
      />
      {mode === 'relief' ? (
        <div className="knob-row">
          <Knob label={POUR_S.spoke} value={spoke} unit="mm" min={0.15} max={1} step={0.05} onChange={setSpoke} />
        </div>
      ) : null}
      <PourFig mode={mode} spokeMm={spoke} />
      {mode === 'relief' ? <Readout items={[{ label: POUR_S.spokeI, value: `${amp.toFixed(1)} A` }]} /> : null}
      <Callout tone={mode === 'relief' ? 'ok' : 'warn'}>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={item.text} onOpen={onOpen} />
        {mode === 'relief' ? <p>{t(POUR_S.assume)}</p> : null}
      </Callout>
      <Related ids={['pcbLayout', 'pcbSupply', 'pcbMaterial', 'pcbStack']} onOpen={onOpen} />
    </Section>
  )
}

/* ---------- 丝印 / 极性 / Fiducial / 测试点 ---------- */

export function MarksSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [mark, setMark] = useState<MarkId>(MARKS[0].id)
  const [open, setOpen] = useState(3)
  const item = MARKS.find((m) => m.id === mark) ?? MARKS[0]
  const pick = (id: MarkId) => {
    const it = MARKS.find((m) => m.id === id) ?? MARKS[0]
    setMark(id)
    setNote({ kicker: MARKS_S.kicker, title: it.title, text: it.text })
  }
  return (
    <Section title={t(MARKS_S.title)} note={t(MARKS_S.note)}>
      <Cards items={MARKS} activeId={mark} cols={4} onPick={(x) => pick(x.id as MarkId)} />
      <div className="knob-row">
        <Knob label={MARKS_S.open} value={open} unit="mm" min={2} max={3} step={0.1} onChange={setOpen} />
      </div>
      <MarksFig active={mark} onPick={pick} open={open} />
      <Readout
        items={[
          { label: MARKS_S.dot, value: '1.0 mm' },
          { label: MARKS_S.open, value: `${open.toFixed(1)} mm` },
          { label: MARKS_S.ring, value: `${((open - 1) / 2).toFixed(2)} mm` },
        ]}
      />
      <Callout>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={item.text} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbSupply', 'pcbDfm', 'pcbFab', 'connection']} onOpen={onOpen} />
    </Section>
  )
}

/* ---------- 阻抗 ---------- */

export function ImpedanceSection({ onOpen, setNote }: SecProps) {
  const { t } = useLocale()
  const [er, setEr] = useState(4.3)
  const [h, setH] = useState(0.2)
  const [w, setW] = useState(0.35)
  const touch = () => setNote({ kicker: Z_S.kicker, title: Z_S.title, text: Z_NOTES[1] })
  const z0 = microstripZ0(er, h, w)
  const valid = microstripValid(er, h, w)
  const ratio = w / h
  const sentence = valid
    ? loc(
        `w/h = ${ratio.toFixed(2)}，在 0.1–2.0 之内，Z0 ≈ ${z0.toFixed(1)} Ω（近似值，误差可达百分之十几）。`,
        `w/h = ${ratio.toFixed(2)}, inside 0.1–2.0, so Z0 ≈ ${z0.toFixed(1)} Ω (approximate, errors of ten-odd percent are possible).`,
      )
    : loc(
        `w/h = ${ratio.toFixed(2)}，不在 0.1–2.0 之内（或 Er 超出 1–15），公式失去依据，Z0 = ${z0.toFixed(1)} Ω 不可信，要用场求解器。`,
        `w/h = ${ratio.toFixed(2)} is outside 0.1–2.0 (or Er is outside 1–15), so the formula has no basis and Z0 = ${z0.toFixed(1)} Ω cannot be trusted; use a field solver.`,
      )
  return (
    <Section title={t(Z_S.title)} note={t(Z_S.note)}>
      <div className="knob-row">
        <Knob label={Z_S.er} value={er} unit="" min={2.2} max={10} step={0.1} onChange={(v) => { setEr(v); touch() }} />
        <Knob label={Z_S.h} value={h} unit="mm" min={0.05} max={0.5} step={0.01} onChange={(v) => { setH(v); touch() }} />
        <Knob label={Z_S.w} value={w} unit="mm" min={0.05} max={1} step={0.01} onChange={(v) => { setW(v); touch() }} />
      </div>
      <MicrostripFig er={er} h={h} w={w} z0={z0} valid={valid} />
      <Readout
        items={[
          { label: Z_S.z0, value: `${z0.toFixed(1)} Ω`, state: valid ? 'pass' : 'fail' },
          { label: Z_S.ratio, value: ratio.toFixed(2) },
          { label: Z_S.range, value: '0.1 < w/h < 2.0 · 1 < Er < 15' },
        ]}
      />
      <Callout tone={valid ? 'ok' : 'bad'}>
        <p>
          <b>{t(sentence)}</b>
        </p>
      </Callout>
      <p className="prep-muted">{t(Z_S.sens)}</p>
      <Readout
        items={Z_VARS.map((v) => {
          const d = zSensitivity(er, h, w, v.id)
          return { label: v.label, value: `${d >= 0 ? '+' : ''}${d.toFixed(1)} % → ${d >= 0 ? '↑' : '↓'}` }
        })}
      />
      <Callout>
        <RefParas paras={Z_NOTES} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbStack', 'pcbMaterial', 'pcbLayout', 'connection']} onOpen={onOpen} />
    </Section>
  )
}
