import { useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { Related, type PrepNote } from '../prep/common'
import { BARREL_PPM, BOARD_UM, CTI_ROWS, FR4_PARTS, GRADES, REFLOW_PEAK, T0, boardGrowthUm, mismatchPpm, zExpandPpm, type Fr4PartId, type Grade, type GradeId } from './data/pcbMaterialFr4'
import { FOIL_OPTS, OZ_OPTS, sheetMohm, traceMohm, type FoilId, type OzId } from './data/pcbMaterialCopper'
import { INNER_CU_UM, LAYER_BY_ID, OUTER_CU_UM, STACK_KINDS, STACK_OPTS, layerNote, ozToUm, totalMm, type LayerKind, type StackId } from './data/pcbMaterialLayers'
import { S } from './data/pcbMaterial'
import { CopperFig } from './MaterialFigs3'
import { Fr4Fig, TgChart } from './MaterialFigs2'
import { StackFig } from './MaterialFigs'

export type PanelProps = { onNote: (n: PrepNote) => void; onOpen: (id: ModuleId) => void }

export const L = {
  mat: loc('材料：', 'Material: '),
  thick: loc('典型厚度：', 'Typical thickness: '),
  role: loc('作用：', 'Role: '),
  make: loc('怎么做的：', 'How it is made: '),
  grain: loc('晶粒：', 'Grains: '),
  bend: loc('弯折：', 'Bending: '),
  cost: loc('成本：', 'Cost: '),
  use: loc('用在哪里：', 'Used for: '),
  why: loc('为什么：', 'Why: '),
  layers: loc('铜层数', 'Copper layers'),
}

export function Group({ label, children }: { label: LText; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <div className="pcbMaterial-group">
      <b>{t(label)}</b>
      {children}
    </div>
  )
}

export function Line({ label, text }: { label: LText; text: LText }) {
  const { t } = useLocale()
  return (
    <p>
      <b>{t(label)}</b>
      {t(text)}
    </p>
  )
}

export function stackNote(stack: StackId, kind: LayerKind): PrepNote {
  const info = LAYER_BY_ID(kind)
  return { kicker: S.kickerStack, title: info.name, text: layerNote(info, stack) }
}

export function StackPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [stack, setStack] = useState<StackId>(STACK_OPTS[0].id)
  const [kind, setKind] = useState<LayerKind>(STACK_KINDS[STACK_OPTS[0].id][0])
  const kinds = STACK_KINDS[stack]
  const active = kinds.includes(kind) ? kind : kinds[0]
  const info = LAYER_BY_ID(active)
  const pick = (s: StackId, k: LayerKind) => {
    setStack(s)
    setKind(k)
    onNote(stackNote(s, k))
  }
  return (
    <>
      <Seg
        options={STACK_OPTS}
        value={stack}
        onChange={(s) => {
          pick(s, STACK_KINDS[s].includes(active) ? active : STACK_KINDS[s][0])
        }}
      />
      <StackFig stack={stack} active={active} onPick={(k) => pick(stack, k)} />
      <Readout
        items={[
          { label: L.layers, value: stack === 'two' ? '2' : '4' },
          { label: S.totalLabel, value: `${totalMm(stack).toFixed(2)} mm` },
          { label: S.copperLabel, value: `${Math.round(OUTER_CU_UM)} µm${stack === 'four' ? ` / ${INNER_CU_UM} µm` : ''}` },
        ]}
      />
      <Callout>
        <p>
          <b>{t(info.name)}</b>
        </p>
        <Line label={L.mat} text={info.mat} />
        <Line label={L.thick} text={info.thick(stack)} />
        <Line label={L.role} text={info.role} />
      </Callout>
      <Related ids={['pcbStack', 'pcbFab']} onOpen={onOpen} />
    </>
  )
}

export function Fr4Panel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [id, setId] = useState<Fr4PartId>(FR4_PARTS[0].id)
  const part = FR4_PARTS.find((p) => p.id === id) ?? FR4_PARTS[0]
  return (
    <>
      <Fr4Fig
        active={id}
        onPick={(pid) => {
          const p = FR4_PARTS.find((x) => x.id === pid) ?? FR4_PARTS[0]
          setId(pid)
          onNote({ kicker: S.kickerFr4, title: p.name, text: p.text })
        }}
      />
      <Callout>
        <p>
          <b>{t(part.name)}</b>
        </p>
        <p>{t(part.text)}</p>
      </Callout>
      <Related ids={['pcbStack', 'pcbFab']} onOpen={onOpen} />
    </>
  )
}

function tgReason(g: Grade, temp: number): LText {
  if (temp <= g.tg) {
    return loc(
      `${temp} °C 不高于 Tg（${g.tg} °C）：树脂还是硬的玻璃态，Z 向只按 α1 ≈ ${g.a1} ppm/°C 慢慢膨胀，和铜孔壁（${BARREL_PPM} ppm/°C）差得不多，所以孔壁受力小。`,
      `${temp} °C is not above Tg (${g.tg} °C): the resin is still hard and glassy and expands in Z only at α1 ≈ ${g.a1} ppm/°C, not far from the copper barrel (${BARREL_PPM} ppm/°C), so the barrel sees little stress.`,
    )
  }
  const extra = mismatchPpm(g, temp) / 1e4
  return loc(
    `${temp} °C 高于 Tg（${g.tg} °C）：树脂变软，Z 向膨胀率跳到 α2 ≈ ${g.a2} ppm/°C，约是铜孔壁（${BARREL_PPM} ppm/°C）的 ${Math.round(g.a2 / BARREL_PPM)} 倍，板子比孔壁多胀 ${extra.toFixed(2)} %，把孔壁往外拉，所以反复受热会拉裂孔壁。`,
    `${temp} °C is above Tg (${g.tg} °C): the resin softens and the Z expansion rate jumps to α2 ≈ ${g.a2} ppm/°C, about ${Math.round(g.a2 / BARREL_PPM)} times the copper barrel (${BARREL_PPM} ppm/°C); the board grows ${extra.toFixed(2)} % more than the barrel and pulls on it, so repeated heating cracks the barrel.`,
  )
}

export function TgPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [gid, setGid] = useState<GradeId>(GRADES[0].id)
  const [temp, setTemp] = useState(REFLOW_PEAK)
  const g = GRADES.find((x) => x.id === gid) ?? GRADES[0]
  const soft = temp > g.tg
  const note = (grade: Grade): PrepNote => ({ kicker: S.kickerTg, title: grade.label, text: grade.text })
  return (
    <>
      <Seg
        options={GRADES.map((x) => ({ id: x.id, label: x.label }))}
        value={gid}
        onChange={(id) => {
          setGid(id)
          onNote(note(GRADES.find((x) => x.id === id) ?? GRADES[0]))
        }}
      />
      <TgChart grade={g} temp={temp} />
      <div className="knob-row">
        <Knob
          label={S.tgTemp}
          value={temp}
          unit="°C"
          min={T0}
          max={260}
          step={5}
          onChange={(v) => {
            setTemp(v)
            onNote(note(g))
          }}
        />
      </div>
      <Readout
        items={[
          { label: S.tgState, value: t(soft ? S.tgRubber : S.tgGlass), state: soft ? 'fail' : 'pass' },
          { label: S.tgExp, value: `${(zExpandPpm(g, temp) / 1e4).toFixed(2)} %` },
          { label: S.tgMismatch, value: `${(mismatchPpm(g, temp) / 1e4).toFixed(2)} %` },
          { label: S.tgThick, value: `${boardGrowthUm(g, temp).toFixed(0)} µm / ${BOARD_UM} µm` },
        ]}
      />
      <Callout tone={soft ? 'warn' : 'ok'}>
        <p>
          <b>{t(g.label)}</b>
        </p>
        <p>{t(g.text)}</p>
        <p>{t(tgReason(g, temp))}</p>
      </Callout>
      <h3>{t(S.ctiTitle)}</h3>
      <p>{t(S.ctiNote)}</p>
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.ctiColGroup)}</th>
              <th>{t(S.ctiColCti)}</th>
              <th>{t(S.ctiColBoard)}</th>
              <th>{t(S.ctiColUse)}</th>
            </tr>
          </thead>
          <tbody>
            {CTI_ROWS.map((row) => (
              <tr key={row.id}>
                <td>
                  <b>{row.group}</b>
                </td>
                <td>{t(row.range)}</td>
                <td>{t(row.board)}</td>
                <td>{t(row.use)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Related ids={['pcbSupply', 'pcbFab']} onOpen={onOpen} />
    </>
  )
}

export function CopperPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [ozId, setOzId] = useState<OzId>(OZ_OPTS[0].id)
  const [foilId, setFoilId] = useState<FoilId>(FOIL_OPTS[0].id)
  const oz = OZ_OPTS.find((o) => o.id === ozId) ?? OZ_OPTS[0]
  const foil = FOIL_OPTS.find((f) => f.id === foilId) ?? FOIL_OPTS[0]
  const noteOz = (o: (typeof OZ_OPTS)[number]): PrepNote => ({ kicker: S.kickerCopper, title: o.label, text: o.why })
  const noteFoil = (f: (typeof FOIL_OPTS)[number]): PrepNote => ({ kicker: S.kickerCopper, title: f.label, text: f.grain })
  const pickOz = (id: OzId) => {
    setOzId(id)
    onNote(noteOz(OZ_OPTS.find((o) => o.id === id) ?? OZ_OPTS[0]))
  }
  const pickFoil = (id: FoilId) => {
    setFoilId(id)
    onNote(noteFoil(FOIL_OPTS.find((f) => f.id === id) ?? FOIL_OPTS[0]))
  }
  return (
    <>
      <Group label={S.ozLabel}>
        <Seg options={OZ_OPTS.map((o) => ({ id: o.id, label: o.label }))} value={ozId} onChange={pickOz} />
      </Group>
      <Group label={S.foilLabel}>
        <Seg options={FOIL_OPTS.map((f) => ({ id: f.id, label: f.label }))} value={foilId} onChange={pickFoil} />
      </Group>
      <CopperFig oz={ozId} foil={foilId} onOz={pickOz} onFoil={pickFoil} />
      <Readout
        items={[
          { label: S.ozThick, value: `${ozToUm(oz.oz)} µm` },
          { label: S.ozSheet, value: `${sheetMohm(oz.oz).toFixed(2)} mΩ/□` },
          { label: S.ozTrace, value: `${traceMohm(oz.oz).toFixed(0)} mΩ` },
          { label: S.ozMin, value: `${oz.minMm} mm (${Math.round(oz.minMm / 0.0254)} mil)` },
        ]}
      />
      <Callout>
        <p>
          <b>{t(oz.label)}</b>
        </p>
        <Line label={L.use} text={oz.use} />
        <Line label={L.why} text={oz.why} />
      </Callout>
      <Callout>
        <p>
          <b>{t(foil.label)}</b>
        </p>
        <Line label={L.make} text={foil.make} />
        <Line label={L.grain} text={foil.grain} />
        <Line label={L.bend} text={foil.bend} />
        <Line label={L.cost} text={foil.cost} />
        <Line label={L.use} text={foil.use} />
      </Callout>
      <p className="prep-muted">{t(loc('方阻 = 电阻率 ÷ 厚度（铜取 1.72×10⁻⁸ Ω·m）；100 mm ÷ 1 mm = 100 个方块，所以走线电阻 = 方阻 × 100。', 'Sheet resistance = resistivity ÷ thickness (copper 1.72×10⁻⁸ Ω·m); 100 mm ÷ 1 mm = 100 squares, so trace resistance = sheet resistance × 100.'))}</p>
      <Related ids={['pcbFab', 'pcbDfm']} onOpen={onOpen} />
    </>
  )
}
