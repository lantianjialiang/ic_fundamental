import { useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { S } from './data/pcbSupply'
import { COST_MODEL, FEATURE_OPTS, FINISH_OPTS, LAYER_OPTS, PV_COLS, QTY_OPTS, costBreakdown } from './data/pcbSupplyMake'
import { REFLOW, VERDICT_TEXT, ZONES, reflowVerdict, timeAboveLiquidus, type ZoneId } from './data/pcbSupplyReflow'
import { CostBar } from './SupplyFigs2'
import { ReflowFig } from './SupplyFigs3'

const SHORT = {
  ok: loc('在窗口内', 'In window'),
  cold: loc('偏冷', 'Too cool'),
  hot: loc('偏热', 'Too hot'),
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="prep-muted" style={{ margin: '8px 0 4px' }}>
      <b>{label}</b>
      {children}
    </div>
  )
}

export function CostPanel() {
  const { t } = useLocale()
  const [layer, setLayer] = useState(LAYER_OPTS[0].id)
  const [finish, setFinish] = useState(FINISH_OPTS[0].id)
  const [feature, setFeature] = useState(FEATURE_OPTS[0].id)
  const [qty, setQty] = useState(QTY_OPTS[0].id)
  const [util, setUtil] = useState(70)
  const pick = <T extends { id: string }>(list: T[], id: string) => list.find((o) => o.id === id) ?? list[0]
  const cost = costBreakdown(pick(LAYER_OPTS, layer).f, pick(FINISH_OPTS, finish).f, pick(FEATURE_OPTS, feature).f, pick(QTY_OPTS, qty).n, util / 100)
  return (
    <>
      <div className="prep-compare">
        {PV_COLS.map((col) => (
          <div key={col.id} className="prep-compare__col">
            <h3>{t(col.title)}</h3>
            <dl>
              {col.rows.map((row) => (
                <div key={row.k.en}>
                  <dt>{t(row.k)}</dt>
                  <dd>{t(row.v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <Group label={t(S.layers)}>
        <Seg options={LAYER_OPTS} value={layer} onChange={setLayer} />
      </Group>
      <Group label={t(S.finish)}>
        <Seg options={FINISH_OPTS} value={finish} onChange={setFinish} />
      </Group>
      <Group label={t(S.feature)}>
        <Seg options={FEATURE_OPTS} value={feature} onChange={setFeature} />
      </Group>
      <Group label={t(S.qty)}>
        <Seg options={QTY_OPTS} value={qty} onChange={setQty} />
      </Group>
      <div className="knob-row">
        <Knob label={S.util} value={util} unit="%" min={50} max={95} step={5} onChange={setUtil} />
      </div>
      <CostBar nre={cost.nre} material={cost.material} process={cost.process} />
      <Readout
        items={[
          { label: S.unit, value: cost.total.toFixed(2) },
          { label: S.nreShare, value: `${(cost.nreShare * 100).toFixed(1)} %` },
          { label: S.util, value: `${util} % · ${COST_MODEL.areaCm2} cm²` },
        ]}
      />
      <p className="prep-muted">{t(S.costCap)}</p>
    </>
  )
}

export function ReflowPanel({ zone, onZone }: { zone: ZoneId; onZone: (id: ZoneId) => void }) {
  const { t } = useLocale()
  const setZone = onZone
  const [peak, setPeak] = useState(245)
  const verdict = reflowVerdict(peak)
  const tal = timeAboveLiquidus(peak)
  const item = ZONES.find((z) => z.id === zone) ?? ZONES[0]
  return (
    <>
      <Seg options={ZONES.map((z) => ({ id: z.id, label: z.name }))} value={zone} onChange={setZone} />
      <ReflowFig peak={peak} zone={zone} onPick={setZone} />
      <div className="knob-row">
        <Knob label={S.peak} value={peak} unit="°C" min={REFLOW.peakMin} max={REFLOW.peakMax} step={5} onChange={setPeak} />
      </div>
      <Readout
        items={[
          { label: S.peak, value: `${peak} °C`, state: verdict === 'ok' ? 'pass' : 'fail' },
          { label: S.tal, value: `${Math.round(tal)} s (${REFLOW.talMin}–${REFLOW.talMax} s)`, state: tal >= REFLOW.talMin ? 'pass' : 'fail' },
          { label: S.verdict, value: t(SHORT[verdict]), state: verdict === 'ok' ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={verdict === 'ok' ? 'ok' : 'bad'}>
        <p>
          <b>{t(item.name)}</b>
        </p>
        <p>{t(item.text)}</p>
        <p>{t(VERDICT_TEXT[verdict])}</p>
      </Callout>
    </>
  )
}
