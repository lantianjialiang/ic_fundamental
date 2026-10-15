import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, Steps } from '../fund/parts'
import { Related, type PrepNote } from '../prep/common'
import { S } from './data/pcbTools'
import { ORDER_STEPS, OS, PARAMS } from './data/pcbToolsOrder'
import { LINE_INFO, QS } from './data/pcbToolsQuote'
import { LINE_IDS, SAMPLE, delta, formula, money, quote, type LineId, type Opts } from './data/pcbToolsQuoteModel'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }
type Opt<V> = { v: V; label: LText | string }

export function OrderSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [id, setId] = useState<string | null>(null)
  return (
    <Section title={t(S.orderTitle)} note={t(S.orderNote)}>
      <h3>{t(OS.stepsTitle)}</h3>
      <Steps items={ORDER_STEPS} />
      <h3>{t(OS.paramsTitle)}</h3>
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.colParam)}</th>
              <th>{t(S.colDefault)}</th>
              <th>{t(S.colChange)}</th>
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((p) => (
              <tr key={p.id} className={p.id === id ? 'pcbTools-on' : undefined}>
                <td>
                  <button
                    type="button"
                    className="pcbTools-rowbtn"
                    aria-pressed={p.id === id}
                    onClick={() => {
                      setId(p.id)
                      setNote({ kicker: OS.kickerOrder, title: p.name, text: p.change })
                    }}
                  >
                    {t(p.name)}
                  </button>
                </td>
                <td>{t(p.usual)}</td>
                <td>
                  <LessonRefText text={p.change} onOpenLesson={onOpen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="prep-muted">{t(OS.paramCap)}</p>
      <Related ids={['pcbSupply', 'pcbStack', 'pcbFab']} onOpen={onOpen} />
    </Section>
  )
}

function Pick<V extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: LText
  options: Array<Opt<V>>
  value: V
  onChange: (v: V) => void
}) {
  const { t } = useLocale()
  return (
    <div className="pcbTools-field">
      <span>{t(label)}</span>
      <Seg
        options={options.map((o) => ({ id: String(o.v), label: o.label }))}
        value={String(value)}
        onChange={(sel) => {
          const hit = options.find((o) => String(o.v) === sel)
          if (hit) {
            onChange(hit.v)
          }
        }}
      />
    </div>
  )
}

const LAYERS: Array<Opt<Opts['layers']>> = [
  { v: 2, label: '2' },
  { v: 4, label: '4' },
  { v: 6, label: '6' },
]
const THICK: Array<Opt<Opts['thick']>> = [
  { v: 1.6, label: '1.6 mm' },
  { v: 1, label: '1.0 mm' },
  { v: 2, label: '2.0 mm' },
]
const COPPER: Array<Opt<Opts['copper']>> = [
  { v: 1, label: '1 oz' },
  { v: 2, label: '2 oz' },
]
const FINISH: Array<Opt<Opts['finish']>> = [
  { v: 'hasl', label: QS.hasl },
  { v: 'osp', label: QS.osp },
  { v: 'enig', label: QS.enig },
]
const MASK: Array<Opt<Opts['mask']>> = [
  { v: 'green', label: QS.green },
  { v: 'black', label: QS.black },
  { v: 'white', label: QS.white },
]
const QTY: Array<Opt<Opts['qty']>> = [5, 10, 20, 50, 100].map((v) => ({ v: v as Opts['qty'], label: String(v) }))
const TRACK: Array<Opt<Opts['track']>> = [
  { v: 0.15, label: '0.15 mm' },
  { v: 0.1, label: '0.10 mm' },
]
const HOLE: Array<Opt<Opts['hole']>> = [
  { v: 0.3, label: '0.30 mm' },
  { v: 0.2, label: '0.20 mm' },
]
const YESNO: Array<Opt<boolean>> = [
  { v: false, label: QS.no },
  { v: true, label: QS.yes },
]
const PANEL: Array<Opt<boolean>> = [
  { v: false, label: QS.single },
  { v: true, label: QS.array },
]
const SPEED: Array<Opt<Opts['speed']>> = [
  { v: 'std', label: QS.std },
  { v: 'fast', label: QS.fast },
  { v: 'rush', label: QS.rush },
]
const SHIP: Array<Opt<Opts['ship']>> = [
  { v: 'std', label: QS.std },
  { v: 'express', label: QS.express },
]

export function QuoteSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [o, setO] = useState<Opts>(SAMPLE)
  const [line, setLine] = useState<LineId>(LINE_INFO[0].id)
  const set = <K extends keyof Opts>(k: K, v: Opts[K]) => setO((p) => ({ ...p, [k]: v }))
  const q = quote(o)
  const base = quote(SAMPLE)
  const info = LINE_INFO.find((l) => l.id === line) ?? LINE_INFO[0]
  const diff = (id: LineId) => q.lines[id] - base.lines[id]
  const biggest = LINE_IDS.reduce((a, b) => (Math.abs(diff(b)) > Math.abs(diff(a)) ? b : a), LINE_IDS[0])
  const biggestInfo = LINE_INFO.find((l) => l.id === biggest)
  const cls = (n: number) => (n > 0.004 ? 'pcbTools-up' : n < -0.004 ? 'pcbTools-down' : undefined)
  return (
    <Section title={t(S.quoteTitle)} note={t(S.quoteNote)}>
      <div className="pcbTools-quote">
        <div>
          <h3>{t(QS.params)}</h3>
          <Pick label={QS.lblLayers} options={LAYERS} value={o.layers} onChange={(v) => set('layers', v)} />
          <Pick label={QS.lblThick} options={THICK} value={o.thick} onChange={(v) => set('thick', v)} />
          <Pick label={QS.lblCopper} options={COPPER} value={o.copper} onChange={(v) => set('copper', v)} />
          <Pick label={QS.lblFinish} options={FINISH} value={o.finish} onChange={(v) => set('finish', v)} />
          <Pick label={QS.lblMask} options={MASK} value={o.mask} onChange={(v) => set('mask', v)} />
          <Pick label={QS.lblQty} options={QTY} value={o.qty} onChange={(v) => set('qty', v)} />
          <Pick label={QS.lblTrack} options={TRACK} value={o.track} onChange={(v) => set('track', v)} />
          <Pick label={QS.lblHole} options={HOLE} value={o.hole} onChange={(v) => set('hole', v)} />
          <Pick label={QS.lblImp} options={YESNO} value={o.imp} onChange={(v) => set('imp', v)} />
          <Pick label={QS.lblPanel} options={PANEL} value={o.panel} onChange={(v) => set('panel', v)} />
          <Pick label={QS.lblSpeed} options={SPEED} value={o.speed} onChange={(v) => set('speed', v)} />
          <Pick label={QS.lblShip} options={SHIP} value={o.ship} onChange={(v) => set('ship', v)} />
          <div className="knob-row">
            <Knob label={QS.sizeW} value={o.w} unit="mm" min={10} max={100} step={1} onChange={(v) => set('w', v)} />
            <Knob label={QS.sizeH} value={o.h} unit="mm" min={10} max={100} step={1} onChange={(v) => set('h', v)} />
          </div>
          <button type="button" className="lab__btn" onClick={() => setO(SAMPLE)}>
            {t(QS.sample)}
          </button>
        </div>
        <div>
          <h3>
            {t(QS.lines)}
            <span className="pcbTools-badge">{t(QS.illus)}</span>
          </h3>
          <div className="prep-table-wrap">
            <table className="prep-table">
              <thead>
                <tr>
                  <th>{t(QS.colLine)}</th>
                  <th className="pcbTools-num">{`${t(QS.colAmount)} (USD)`}</th>
                  <th className="pcbTools-num">{t(QS.colDelta)}</th>
                </tr>
              </thead>
              <tbody>
                {LINE_INFO.map((l) => (
                  <tr key={l.id} className={l.id === line ? 'pcbTools-on' : undefined}>
                    <td>
                      <button
                        type="button"
                        className="pcbTools-rowbtn"
                        aria-pressed={l.id === line}
                        onClick={() => {
                          setLine(l.id)
                          setNote({ kicker: S.kickerQuote, title: l.title, text: l.what })
                        }}
                      >
                        {t(l.title)}
                      </button>
                    </td>
                    <td className="pcbTools-num">{money(q.lines[l.id])}</td>
                    <td className={`pcbTools-num ${cls(diff(l.id)) ?? ''}`}>{delta(diff(l.id))}</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <b>{t(S.total)}</b>
                  </td>
                  <td className="pcbTools-num">
                    <b>{money(q.total)}</b>
                  </td>
                  <td className={`pcbTools-num ${cls(q.total - base.total) ?? ''}`}>{delta(q.total - base.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Readout
            items={[
              { label: S.perBoard, value: money(q.perBoard) },
              { label: S.leadTime, value: `${q.days} ${t(S.days)}` },
              { label: S.weight, value: `${q.kg.toFixed(3)} ${QS.kg}` },
              { label: QS.pcsNote, value: `${q.pcs} ${t(QS.pcs)}` },
              { label: QS.area, value: `${q.areaCm2.toFixed(1)} ${QS.cm2}` },
            ]}
          />
          <p className="prep-muted">
            {Math.abs(diff(biggest)) < 0.005 ? t(QS.nothing) : `${t(QS.changed)}${biggestInfo ? t(biggestInfo.title) : ''}`}
          </p>
        </div>
      </div>
      <Callout>
        <p>
          <b>{`${t(info.title)}: ${money(q.lines[line])}`}</b>
        </p>
        <p>{t(info.what)}</p>
        <p>{t(info.why)}</p>
        <p>
          <b>{t(QS.drivers)}</b>
          {t(info.drivers)}
        </p>
        <p className="pcbTools-formula">
          <b>{t(QS.formula)}</b>
          {`${formula(line, o, q)} = ${money(q.lines[line])}`}
        </p>
      </Callout>
      <p className="prep-muted">{t(S.quoteCap)}</p>
      <Related ids={['pcbSupply', 'pcbStack', 'pcbFab']} onOpen={onOpen} />
    </Section>
  )
}
