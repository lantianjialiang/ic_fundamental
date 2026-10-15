import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { type PrepNote } from '../prep/common'
import { S } from './data/mosSelect'
import { cat, fP, solveTj } from './data/mosSelectMath'
import { PKGS, TEMPCO, TJ_LIMIT, type PkgId } from './data/mosSelectParts'
import { ThermalFig } from './SelectFigs5'

const LB = {
  rise: loc('温升 P × RθJA', 'Rise P × RθJA'),
  theta: loc('RθJA（典型）', 'RθJA (typical)'),
}

function describe(pkg: PkgId, i: number, r25: number, ta: number) {
  const item = PKGS.find((p) => p.id === pkg) ?? PKGS[0]
  const th = solveTj(i, r25, item.theta, ta)
  const ok = !th.runaway && th.tj <= TJ_LIMIT
  const text = th.runaway
    ? loc(
        'Rds(on) 随温度升高，发热又让温度更高，这个电流下算不出稳定的 Tj（热失控）：电流减小一点或换 Rds(on) 小得多的管子、散热好的封装。',
        'Rds(on) rises with temperature and the extra heat raises it again, so no stable Tj exists at this current (thermal runaway): reduce the current, or use a much lower Rds(on) and a better-cooled package.',
      )
    : cat(
        loc(
          `热态 Rds(on) = ${r25} × (1 + ${TEMPCO} × (${Math.round(th.tj)} − 25)) = ${Math.round(th.rHot)} mΩ；P = I² × Rds(on) = ${i}² × ${(th.rHot / 1000).toFixed(3)} = ${fP(th.p)} W；Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${item.theta} = ${Math.round(th.tj)} °C。`,
          `Hot Rds(on) = ${r25} × (1 + ${TEMPCO} × (${Math.round(th.tj)} − 25)) = ${Math.round(th.rHot)} mΩ; P = I² × Rds(on) = ${i}² × ${(th.rHot / 1000).toFixed(3)} = ${fP(th.p)} W; Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${item.theta} = ${Math.round(th.tj)} °C. `,
        ),
        ok
          ? loc(`低于 ${TJ_LIMIT} °C 设计上限，还有 ${Math.round(TJ_LIMIT - th.tj)} °C 余量。`, `That is below the ${TJ_LIMIT} °C design limit with ${Math.round(TJ_LIMIT - th.tj)} °C to spare.`)
          : loc(
              `超过 ${TJ_LIMIT} °C 设计上限：这个封装每瓦升 ${item.theta} °C，散不掉这么多热。电流翻倍功耗翻四倍，所以换更小 Rds(on) 或更好散热的封装比硬扛有效。`,
              `Above the ${TJ_LIMIT} °C design limit: this package rises ${item.theta} °C per watt and cannot shed that much heat. Doubling the current quadruples the power, so a lower Rds(on) or better cooling works better than pushing on.`,
            ),
      )
  return { item, th, ok, text }
}

export function SelectThermal({ onNote }: { onNote: (note: PrepNote) => void }) {
  const { t } = useLocale()
  const [pkg, setPkg] = useState<PkgId>(PKGS[0].id)
  const [amps, setAmps] = useState(2)
  const [r25, setR25] = useState(40)
  const [ta, setTa] = useState(40)
  const cur = describe(pkg, amps, r25, ta)

  const push = (p: PkgId, i: number, r: number, a: number) => {
    const d = describe(p, i, r, a)
    onNote({ kicker: S.kickerThermal, title: d.item.label, text: d.text })
  }
  const pickPkg = (id: PkgId) => {
    setPkg(id)
    push(id, amps, r25, ta)
  }

  return (
    <>
      <Seg options={PKGS.map((p) => ({ id: p.id, label: p.label }))} value={pkg} onChange={pickPkg} />
      <div className="knob-row">
        <Knob
          label={S.loadI}
          value={amps}
          unit="A"
          min={0.5}
          max={6}
          step={0.1}
          onChange={(v) => {
            const next = Math.round(v * 10) / 10
            setAmps(next)
            push(pkg, next, r25, ta)
          }}
        />
        <Knob
          label={S.r25}
          value={r25}
          unit="mΩ"
          min={5}
          max={200}
          step={5}
          onChange={(v) => {
            setR25(v)
            push(pkg, amps, v, ta)
          }}
        />
        <Knob
          label={S.ambient}
          value={ta}
          unit="°C"
          min={0}
          max={85}
          step={5}
          onChange={(v) => {
            setTa(v)
            push(pkg, amps, r25, v)
          }}
        />
      </div>
      <ThermalFig active={pkg} onPick={pickPkg} i={amps} r25={r25} ta={ta} />
      <Readout
        items={[
          { label: LB.theta, value: `${cur.item.theta} °C/W` },
          { label: S.rHot, value: Number.isFinite(cur.th.rHot) ? `${Math.round(cur.th.rHot)} mΩ` : '∞' },
          { label: S.loss, value: Number.isFinite(cur.th.p) ? `${fP(cur.th.p)} W` : '∞' },
          { label: LB.rise, value: Number.isFinite(cur.th.tj) ? `${Math.round(cur.th.tj - ta)} °C` : '∞' },
          { label: S.tj, value: Number.isFinite(cur.th.tj) ? `${Math.round(cur.th.tj)} °C` : t(S.runaway), state: cur.ok ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={cur.ok ? 'ok' : 'bad'}>
        <p>{t(cur.text)}</p>
      </Callout>
    </>
  )
}
