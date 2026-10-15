import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefP, Related, type PrepNote } from '../prep/common'
import { PRINCIPLES, S } from './data/pcbLayout'
import { PROBLEMS, type Problem, type ProblemId } from './data/pcbLayoutBoard'
import {
  CHECK_HZ,
  DECAP_DIST_MM,
  USB_TOL,
  USB_ZDIFF,
  diffInSpec,
  diffZ,
  dipVolt,
  impedanceOhm,
  loopNh,
  viaArrayTheta,
  viaTheta,
  type DecapId,
} from './data/pcbLayoutModel'
import { CARDS, DECAP_OPTS, DECAP_RULES, type CardId } from './data/pcbLayoutRules'
import { BoardFig, type ViewId } from './LayoutFigs2'
import { DecapFig } from './LayoutFigs3'
import { RoutingFig, SplitFig, XtalFig } from './LayoutFigs4'
import { DiffFig, ThermalFig } from './LayoutFigs5'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

const join = (a: LText, b: LText): LText => ({ zh: `${a.zh}${b.zh}`, en: `${a.en ?? a.zh} ${b.en ?? b.zh}` })

const VIEWS: Array<{ id: ViewId; label: LText }> = [
  { id: 'bad', label: S.viewBad },
  { id: 'good', label: S.viewGood },
]

/** 侧栏默认说明：第一个互动（坏布局）的第一个问题 */
export function boardNote(view: ViewId, p: Problem): PrepNote {
  return { kicker: S.kickerBoard, title: p.title, text: view === 'bad' ? join(p.problem, p.reason) : join(p.good, p.reason) }
}

export function BoardSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [view, setView] = useState<ViewId>(VIEWS[0].id)
  const [active, setActive] = useState<ProblemId>(PROBLEMS[0].id)
  const item = PROBLEMS.find((p) => p.id === active) ?? PROBLEMS[0]
  const bad = view === 'bad'
  return (
    <Section title={t(S.boardTitle)} note={t(S.boardNote)}>
      <Seg
        options={VIEWS}
        value={view}
        onChange={(id) => {
          setView(id)
          setNote(boardNote(id, item))
        }}
      />
      <BoardFig
        view={view}
        active={active}
        onPick={(id) => {
          setActive(id)
          const p = PROBLEMS.find((x) => x.id === id)
          if (p) {
            setNote(boardNote(view, p))
          }
        }}
      />
      <Callout tone={bad ? 'bad' : 'ok'}>
        <p>
          <b>{`${PROBLEMS.indexOf(item) + 1}. ${t(item.title)}`}</b>
        </p>
        {bad ? (
          <>
            <p>
              <b>{t(S.lblProblem)}</b>
              {t(item.problem)}
            </p>
            <p>
              <b>{t(S.lblReason)}</b>
              {t(item.reason)}
            </p>
            <RefP text={join(S.lblFix, item.fix)} onOpen={onOpen} />
          </>
        ) : (
          <>
            <p>
              <b>{t(S.lblGood)}</b>
              {t(item.good)}
            </p>
            <p>
              <b>{t(S.lblReason)}</b>
              {t(item.reason)}
            </p>
          </>
        )}
      </Callout>
      <Callout>
        <p>
          <b>{t(S.principleTitle)}</b>
        </p>
        <ul>
          {PRINCIPLES.map((line) => (
            <li key={line.zh}>
              <RefP text={line} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </Callout>
      <Related ids={['pcbStack', 'pcbBasics', 'pcbFlow']} onOpen={onOpen} />
    </Section>
  )
}

export function DecapSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [id, setId] = useState<DecapId>(DECAP_OPTS[0].id)
  const opt = DECAP_OPTS.find((o) => o.id === id) ?? DECAP_OPTS[0]
  const nh = loopNh(DECAP_DIST_MM[id])
  const dip = dipVolt(nh)
  const state = id === 'near' ? 'pass' : id === 'far' ? 'fail' : undefined
  return (
    <Section title={t(S.decapTitle)} note={t(S.decapNote)}>
      <Seg
        options={DECAP_OPTS.map((o) => ({ id: o.id, label: o.label }))}
        value={id}
        onChange={(next) => {
          setId(next)
          const o = DECAP_OPTS.find((x) => x.id === next)
          if (o) {
            setNote({ kicker: S.kickerDecap, title: o.label, text: o.text })
          }
        }}
      />
      <DecapFig id={id} />
      <Readout
        items={[
          { label: S.rdLoop, value: `${nh.toFixed(1)} nH`, state },
          { label: S.rdZ, value: `${impedanceOhm(nh, CHECK_HZ).toFixed(1)} Ω`, state },
          { label: S.rdDip, value: `${dip.toFixed(2)} V`, state },
        ]}
      />
      <Callout tone={state === 'pass' ? 'ok' : state === 'fail' ? 'bad' : undefined}>
        <p>
          <b>{t(opt.label)}</b>
        </p>
        <p>{t(opt.text)}</p>
        <ul>
          {DECAP_RULES.map((line) => (
            <li key={line.zh}>
              <RefP text={line} onOpen={onOpen} />
            </li>
          ))}
        </ul>
        <p className="prep-muted">{t(S.decapModel)}</p>
      </Callout>
      <Related ids={['mosDynamic', 'fProgram', 'pMeasure']} onOpen={onOpen} />
    </Section>
  )
}

const DL = {
  w: loc('线宽 w', 'Trace width w'),
  s: loc('线间距 s', 'Spacing s'),
  z: loc('差分阻抗 Zdiff', 'Differential impedance Zdiff'),
  spec: loc('USB 要求', 'USB requirement'),
  verdict: loc('是否在范围内', 'Within range'),
  yes: loc('是', 'Yes'),
  no: loc('否', 'No'),
  nVia: loc('过孔数量', 'Number of vias'),
  power: loc('芯片功耗', 'Chip power'),
  pcs: loc('个', 'pcs'),
  one: loc('单个过孔热阻', 'One via'),
  all: loc('并联后热阻', 'All vias in parallel'),
  rise: loc('过孔上的温差', 'Temperature drop across vias'),
  thNote: loc(
    '示意参数：板厚 1.6 mm，孔径 0.3 mm，孔壁镀铜 25 µm，铜热导率 385 W/(m·K)，热阻 = 板厚 / (热导率 × 铜环截面积)；只算过孔筒本身，不含焊料和芯片内部。',
    'Illustrative parameters: board 1.6 mm, drill 0.3 mm, 25 um plating, copper 385 W/(m K), thermal resistance = thickness / (conductivity x copper ring area); the via barrels only, not solder or the package itself.',
  ),
  dfNote: loc(
    '近似式：Z0 取微带线 IPC-2141，Zdiff = 2·Z0·(1 − 0.48·e^(−0.96·s/h))；εr = 4.3，h = 0.2 mm，铜厚 1 oz。适用范围有限，结果只用来看趋势，实际以板厚、叠层和板厂的阻抗表为准。',
    'Approximation: Z0 from the IPC-2141 microstrip formula, Zdiff = 2 Z0 (1 - 0.48 e^(-0.96 s/h)); er = 4.3, h = 0.2 mm, 1 oz copper. The valid range is limited, so use the result for trends only; the real board is set by the stack-up and the fab impedance table.',
  ),
}

function DiffBlock() {
  const { t } = useLocale()
  const [w, setW] = useState(0.3)
  const [s, setS] = useState(0.2)
  const z = diffZ(w, s)
  const ok = diffInSpec(z)
  return (
    <>
      <DiffFig w={w} s={s} />
      <div className="knob-row">
        <Knob label={DL.w} value={w} unit="mm" min={0.15} max={0.5} step={0.01} onChange={setW} />
        <Knob label={DL.s} value={s} unit="mm" min={0.1} max={0.6} step={0.01} onChange={setS} />
      </div>
      <Readout
        items={[
          { label: DL.z, value: `${z.toFixed(1)} Ω`, state: ok ? 'pass' : 'fail' },
          { label: DL.spec, value: `${USB_ZDIFF} Ω ± ${Math.round(USB_TOL * 100)} %` },
          { label: DL.verdict, value: t(ok ? DL.yes : DL.no), state: ok ? 'pass' : 'fail' },
        ]}
      />
      <p className="prep-muted">{t(DL.dfNote)}</p>
    </>
  )
}

function ThermalBlock() {
  const { t } = useLocale()
  const [n, setN] = useState(9)
  const [p, setP] = useState(1)
  const theta = viaArrayTheta(n)
  return (
    <>
      <ThermalFig n={n} />
      <div className="knob-row">
        <Knob label={DL.nVia} value={n} unit={t(DL.pcs)} min={1} max={25} step={1} onChange={setN} />
        <Knob label={DL.power} value={p} unit="W" min={0.5} max={3} step={0.5} onChange={setP} />
      </div>
      <Readout
        items={[
          { label: DL.one, value: `${viaTheta().toFixed(0)} K/W` },
          { label: DL.all, value: `${theta.toFixed(1)} K/W` },
          { label: DL.rise, value: `${(p * theta).toFixed(1)} K` },
        ]}
      />
      <p className="prep-muted">{t(DL.thNote)}</p>
    </>
  )
}

function CardFig({ id }: { id: CardId }) {
  if (id === 'routing') {
    return <RoutingFig />
  }
  if (id === 'xtal') {
    return <XtalFig />
  }
  if (id === 'split') {
    return <SplitFig />
  }
  if (id === 'diff') {
    return <DiffBlock />
  }
  return <ThermalBlock />
}

export function RulesSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [id, setId] = useState<CardId>(CARDS[0].id)
  const card = CARDS.find((c) => c.id === id) ?? CARDS[0]
  return (
    <Section title={t(S.rulesTitle)} note={t(S.rulesNote)}>
      <Cards
        items={CARDS}
        activeId={id}
        cols={3}
        onPick={(c) => {
          setId(c.id)
          setNote({ kicker: S.kickerRules, title: c.title, text: c.text })
        }}
      />
      <CardFig id={id} />
      <Callout>
        <p>
          <b>{t(card.title)}</b>
        </p>
        <RefP text={card.text} onOpen={onOpen} />
        <ul>
          {card.points.map((line) => (
            <li key={line.zh}>
              <RefP text={line} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </Callout>
      <Related ids={['pcbBasics', 'pcbStack', 'pcbFab']} onOpen={onOpen} />
    </Section>
  )
}
