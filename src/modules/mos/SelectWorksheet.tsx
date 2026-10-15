import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefP, type PrepNote } from '../prep/common'
import { S } from './data/mosSelect'
import { evaluate } from './data/mosSelectCalc'
import { cat, f1, fP, type Input } from './data/mosSelectMath'
import {
  DIODES,
  GPIO_MA,
  LOADS,
  PARTS,
  RPD_K,
  TOPOLOGIES,
  rdsRow,
  type DiodeId,
  type LoadId,
  type PartId,
  type TopologyId,
} from './data/mosSelectParts'

type State = { topology: TopologyId; partId: PartId; load: LoadId; diode: DiodeId; current: number; ambient: number }

const HEAD: LText[] = [
  loc('器件', 'Part'),
  loc('封装', 'Package'),
  loc('Vds (V)', 'Vds (V)'),
  loc('Id (A)', 'Id (A)'),
  loc('Rds(on) @ 4.5 V (mΩ)', 'Rds(on) @ 4.5 V (mΩ)'),
  loc('Rds(on) @ 2.5 V (mΩ)', 'Rds(on) @ 2.5 V (mΩ)'),
  loc('Vgs(th) 最大 (V)', 'Vgs(th) max (V)'),
  loc('Qg (nC)', 'Qg (nC)'),
  loc('RθJA (°C/W)', 'RθJA (°C/W)'),
]

const BADGE = { pass: S.pass, fail: S.fail, skip: S.skip }

function toInput(st: State): Input {
  return {
    topology: st.topology,
    part: PARTS.find((p) => p.id === st.partId) ?? PARTS[0],
    load: st.load,
    diode: st.diode,
    current: st.current,
    ambient: st.ambient,
  }
}

function noteOf(st: State): PrepNote {
  const inp = toInput(st)
  const res = evaluate(inp)
  const bad = res.checks.find((c) => c.state === 'fail')
  return {
    kicker: S.kickerCap,
    title: cat(inp.part.name, ' · ', res.pass ? S.pass : S.fail),
    text: bad ? bad.reason : loc('全部检查通过。往下看计算过程，再换一个器件或调高电流，看哪一项先不过。', 'Every check passes. Read the calculation below, then try another part or a higher current to see which check fails first.'),
  }
}

export function SelectWorksheet({ onOpen, onNote }: { onOpen: (id: ModuleId) => void; onNote: (note: PrepNote) => void }) {
  const { t } = useLocale()
  const [st, setSt] = useState<State>({ topology: TOPOLOGIES[0].id, partId: PARTS[0].id, load: LOADS[0].id, diode: DIODES[0].id, current: 2, ambient: 40 })
  const update = (patch: Partial<State>) => {
    const next = { ...st, ...patch }
    setSt(next)
    onNote(noteOf(next))
  }
  const inp = toInput(st)
  const res = evaluate(inp)
  const topo = TOPOLOGIES.find((x) => x.id === st.topology) ?? TOPOLOGIES[0]
  const lowSide = st.topology === 'low'
  const state = (id: string) => {
    const c = res.checks.find((k) => k.id === id)
    return c && c.state !== 'skip' ? (c.state as 'pass' | 'fail') : undefined
  }
  const gateText = cat(
    loc('栅极电阻 Rg = ', 'Gate resistor Rg = '),
    res.rg,
    loc(` Ω（E12 值，把 GPIO 电流限在 ${GPIO_MA} mA 以内）；栅极到地下拉 ${RPD_K} kΩ，MCU 复位或引脚高阻时栅极被拉回 0 V，管子保持关断。`, ` Ω (an E12 value keeping the GPIO current within ${GPIO_MA} mA); a ${RPD_K} kΩ pull-down from gate to ground, so during MCU reset or with a high-impedance pin the gate returns to 0 V and the transistor stays off.`),
    res.needDiode ? loc(' 感性负载：负载两端必须反并联续流二极管。', ' Inductive load: a flyback diode must go across the load.') : '',
  )

  return (
    <>
      <div className="mosSelect-group">
        <b>{t(S.topology)}</b>
        <Seg options={TOPOLOGIES.map((x) => ({ id: x.id, label: x.label }))} value={st.topology} onChange={(id) => update({ topology: id })} />
        <p className="mosSelect-hint">{t(topo.hint)}</p>
      </div>

      <div className="mosSelect-group">
        <b>{t(S.candidate)}</b>
        <Seg options={PARTS.map((p) => ({ id: p.id, label: `${p.name} · ${p.pkg}` }))} value={st.partId} onChange={(id) => update({ partId: id })} />
        <div className="prep-table-wrap">
          <table className="prep-table mosSelect-table">
            <thead>
              <tr>
                {HEAD.map((h) => (
                  <th key={h.zh}>{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARTS.map((p) => (
                <tr key={p.id} className={p.id === st.partId ? 'is-active' : undefined}>
                  <td>
                    <b>{p.name}</b>
                    <small>{t(S.example)}</small>
                  </td>
                  <td>{p.pkg}</td>
                  <td>{p.vds}</td>
                  <td>{p.idA}</td>
                  <td>{rdsRow(p, 4.5) ?? '—'}</td>
                  <td>{rdsRow(p, 2.5) ?? '—'}</td>
                  <td>{p.vth.max}</td>
                  <td>{`${p.qg} @ ${p.qgV} V`}</td>
                  <td>{p.theta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mosSelect-hint">{`${inp.part.name}: `}{t(inp.part.kind)}</p>
      </div>

      <div className="mosSelect-group">
        <b>{t(S.loadKind)}</b>
        <Seg options={LOADS} value={st.load} onChange={(id) => update({ load: id })} />
        {st.load === 'ind' ? (
          <div className="mosSelect-group">
            <b>{t(S.diodeKind)}</b>
            <Seg options={DIODES} value={st.diode} onChange={(id) => update({ diode: id })} />
          </div>
        ) : null}
        <div className="knob-row">
          <Knob label={S.loadI} value={st.current} unit="A" min={0.5} max={6} step={0.1} onChange={(v) => update({ current: Math.round(v * 10) / 10 })} />
          <Knob label={S.ambient} value={st.ambient} unit="°C" min={0} max={85} step={5} onChange={(v) => update({ ambient: v })} />
        </div>
      </div>

      {lowSide ? (
        <Readout
          items={[
            { label: S.margin, value: `${f1(res.margin)} V`, state: state('vth') },
            { label: S.rHot, value: Number.isFinite(res.rHot) ? `${Math.round(res.rHot)} mΩ` : '∞', state: state('rds') },
            { label: S.loss, value: Number.isFinite(res.p) ? `${fP(res.p)} W` : '∞' },
            { label: S.tj, value: Number.isFinite(res.tj) ? `${Math.round(res.tj)} °C` : t(S.runaway), state: state('tj') },
            { label: S.verdict, value: t(res.pass ? S.pass : S.fail), state: res.pass ? 'pass' : 'fail' },
          ]}
        />
      ) : null}

      <div className="mosSelect-group">
        <b>{t(S.checks)}</b>
        <div className="mosSelect-checks">
          {res.checks.map((c) => (
            <div key={c.id} className={`mosSelect-check is-${c.state}`}>
              <div className="mosSelect-check__head">
                {t(c.label)}
                <span>{c.value}</span>
                <em className="mosSelect-check__badge">{t(BADGE[c.state])}</em>
              </div>
              <RefP text={c.reason} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>

      {lowSide ? (
        <Callout tone="ok">
          <p>
            <b>{t(S.suggest)}</b>
          </p>
          <p>{t(gateText)}</p>
        </Callout>
      ) : null}

      <div className="mosSelect-group">
        <b>{t(S.reportTitle)}</b>
        <pre className="mosSelect-report">{res.report.map((line) => t(line)).join('\n')}</pre>
      </div>
    </>
  )
}
