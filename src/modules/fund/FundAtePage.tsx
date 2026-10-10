import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { BondFig, ClockFig, HookupFig, MemPatFig, PkgFig, clockText } from './AteFig'
import { HandlerFig, WaferFig, type BinBox } from './AteWaferFig'
import {
  ATE_LEAD,
  ATE_PARTS,
  BIN_CATS,
  BIN_TEXT,
  BOND_TEXT,
  COST_TEXT,
  DA_LEAD,
  DICE,
  DIE_BINS,
  DIE_NOTE,
  FLOW,
  FLOW_LEAD,
  GRADE_TEMPS,
  HANDLER_TOTAL,
  HOOKUP_TEXT,
  MEM_PATS,
  MIXED,
  MIXED_LEAD,
  PERIPH,
  PKGS,
  PROBE_ORDER,
  QUIZ,
  TAKEAWAY,
  TESTERS,
  TIERS,
  TIER_NOTE,
  WAFER_LEAD,
  makeResults,
  randomCat,
  recommendTier,
  type BinCat,
  type BinMode,
  type Grade,
  type Hookup,
  type MemPat,
  type Res,
  type TierId,
} from './data/ate'
import { Callout, Cards, Explain, Knob, Readout, Seg, type Note } from './parts'
import './ate.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('晶圆与 ATE'),
  later: loc('认识了设备，下一课走进测试机内部：DUT 的管脚、PMU 和管脚电子。'),
  flowTitle: loc('从晶圆到出货：测两次'),
  com: loc('商用级'),
  mil: loc('军用级'),
  tempsLabel: loc('成品测试温度：'),
  waferTitle: loc('动手：晶圆探针测试'),
  start: loc('开始测试'),
  pause: loc('暂停'),
  step: loc('单步'),
  redo: loc('换一片重来'),
  ink: loc('打墨点'),
  map: loc('电子晶圆图'),
  tested: loc('已测'),
  good: loc('好片'),
  bad: loc('坏片'),
  yieldL: loc('良率'),
  binLegend: loc('Bin 号：'),
  done: loc('整片测完。看看坏片是不是更多出现在晶圆边缘——边缘的工艺最难控制。'),
  inkNote: loc('打墨点：坏片上点一个红墨点，划片后直接挑出来扔掉。'),
  mapNote: loc('电子晶圆图：不打墨点，把每颗 die 的 Bin 号存进文件，封装时按图挑片。'),
  pkgTitle: loc('封装'),
  pkgNote: loc('点一种封装，看它的引脚分布。'),
  pins: loc('引脚：'),
  bondTitle: 'bond wire',
  ateTitle: loc('ATE 是什么'),
  hookTitle: loc('测试机怎么接到芯片上'),
  cp: loc('晶圆测试'),
  hand: loc('手测'),
  handler: loc('分选机'),
  daTitle: loc('数字 vs 模拟'),
  sec: loc('真实时间的秒数'),
  resMin: loc('只到分钟'),
  resSec: loc('到秒'),
  resDs: loc('到 0.1 秒'),
  resCs: loc('到 0.01 秒'),
  trueT: loc('真实时间'),
  shownT: loc('数字表显示'),
  lostT: loc('看不到的部分'),
  testerTitle: loc('四类测试机'),
  memTitle: loc('APG 现场生成的 Memory 图形'),
  memStep: loc('下一格'),
  tierTitle: loc('动手：给芯片选一台数字测试机'),
  tierNote: loc('拖动芯片的最高频率和管脚数，看推荐哪一档；再点表里的一行，看“你选的这台”合不合适。'),
  freq: loc('芯片最高频率'),
  pinCount: loc('管脚数'),
  colTier: loc('档位'),
  colRange: loc('能力'),
  colCost: loc('成本'),
  colFit: loc('能测吗'),
  yes: loc('能'),
  no: loc('不能'),
  rec: loc('推荐'),
  noneRec: loc('超出单台测试机的范围'),
  fitOk: loc('刚好合适：性能够用，成本最低。'),
  fitLow: loc('测不了：频率或通道数不够，测试覆盖不足。'),
  fitHigh: loc('能测，但性能过剩，测试成本偏高。'),
  fitNone: loc('这颗芯片超出了三档测试机的能力，需要特殊方案。'),
  periphTitle: loc('周边设备'),
  binTitle: loc('动手：分选机分 Bin'),
  binNote: loc('点“测下一颗”，芯片测完会飞进对应的 Bin。切换 Bin 方案看看同一批芯片怎么归类。'),
  minBins: loc('最少 3 个 Bin'),
  fullBins: loc('细分 Bin'),
  next: loc('测下一颗'),
  auto: loc('连续测'),
  stop: loc('停止'),
  reset: loc('重来'),
  allGood: loc('好品'),
  allBad: loc('坏品'),
  last: loc('上一颗'),
  left: loc('剩余未测'),
  goodRate: loc('良率'),
}

const ZERO: Record<BinCat, number> = { s200: 0, s166: 0, s100: 0, dc: 0, ac: 0, func: 0 }

type Flight = { key: number; cat: BinCat; stage: 'site' | 'bin' }

export function FundAtePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: FLOW[0].title, text: FLOW[0].text })
  const [flow, setFlow] = useState('fab')
  const [grade, setGrade] = useState<Grade>('com')
  // 晶圆
  const [results, setResults] = useState<number[]>(() => makeResults())
  const [idx, setIdx] = useState(0)
  const [probing, setProbing] = useState(false)
  const [mark, setMark] = useState<'ink' | 'map'>('ink')
  const [picked, setPicked] = useState<number | null>(null)
  // 封装 / ATE
  const [pkg, setPkg] = useState('dip')
  const [part, setPart] = useState('inst')
  const [hookup, setHookup] = useState<Hookup>('cp')
  // 数字 vs 模拟
  const [sec, setSec] = useState(37.46)
  const [res, setRes] = useState<Res>('sec')
  const [mixed, setMixed] = useState('bdla')
  // 测试机
  const [tester, setTester] = useState('mem')
  const [memPat, setMemPat] = useState<MemPat>('checker')
  const [memStep, setMemStep] = useState(0)
  const [freq, setFreq] = useState(80)
  const [pins, setPins] = useState(160)
  const [chosen, setChosen] = useState<TierId | null>(null)
  // 周边 / 分选机
  const [periph, setPeriph] = useState('lb')
  const [binMode, setBinMode] = useState<BinMode>('full')
  const [counts, setCounts] = useState<Record<BinCat, number>>(ZERO)
  const [left, setLeft] = useState(HANDLER_TOTAL)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [lastCat, setLastCat] = useState<BinCat | null>(null)
  const [auto, setAuto] = useState(false)

  /* ---- 晶圆探针 ---- */
  const total = PROBE_ORDER.length
  const probeDone = idx >= total
  useEffect(() => {
    if (!probing || probeDone) return
    const id = window.setInterval(() => setIdx((v) => Math.min(total, v + 1)), 90)
    return () => window.clearInterval(id)
  }, [probing, probeDone, total])

  const testedList = PROBE_ORDER.slice(0, idx)
  const tested = new Set(testedList)
  const goodN = testedList.filter((i) => results[i] === 1).length
  const current = idx > 0 && !probeDone ? PROBE_ORDER[idx - 1] : null

  const redoWafer = () => {
    setResults(makeResults())
    setIdx(0)
    setProbing(false)
    setPicked(null)
  }

  /* ---- 分选机 ---- */
  useEffect(() => {
    if (!flight) return
    if (flight.stage === 'site') {
      const id = window.setTimeout(() => setFlight({ ...flight, stage: 'bin' }), 450)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setCounts((c) => ({ ...c, [flight.cat]: c[flight.cat] + 1 }))
      setLastCat(flight.cat)
      setFlight(null)
    }, 650)
    return () => window.clearTimeout(id)
  }, [flight])

  const startOne = () => {
    if (flight || left <= 0) return
    setLeft((l) => l - 1)
    setFlight({ key: HANDLER_TOTAL - left, cat: randomCat(), stage: 'site' })
  }

  useEffect(() => {
    if (!auto || flight || left <= 0) return
    const id = window.setTimeout(() => {
      setLeft((l) => l - 1)
      setFlight({ key: HANDLER_TOTAL - left, cat: randomCat(), stage: 'site' })
    }, 250)
    return () => window.clearTimeout(id)
  }, [auto, flight, left])

  const resetHandler = () => {
    setCounts(ZERO)
    setLeft(HANDLER_TOTAL)
    setFlight(null)
    setLastCat(null)
    setAuto(false)
  }

  const goodCount = BIN_CATS.filter((c) => c.good).reduce((s, c) => s + counts[c.id], 0)
  const badCount = BIN_CATS.filter((c) => !c.good).reduce((s, c) => s + counts[c.id], 0)
  const bins: BinBox[] =
    binMode === 'full'
      ? BIN_CATS.map((c) => ({ id: c.id, label: c.label, count: counts[c.id], good: c.good }))
      : [
          { id: 'good', label: S.allGood, count: goodCount, good: true },
          { id: 'bad', label: S.allBad, count: badCount, good: false },
        ]
  const flightTarget = flight
    ? binMode === 'full'
      ? BIN_CATS.findIndex((c) => c.id === flight.cat)
      : BIN_CATS.find((c) => c.id === flight.cat)?.good
        ? 0
        : 1
    : 0
  const lastItem = BIN_CATS.find((c) => c.id === lastCat)

  /* ---- 测试机分档 ---- */
  const rec = recommendTier(freq, pins)
  const tierIdx = (id: TierId) => TIERS.findIndex((item) => item.id === id)
  let fitText = S.fitNone
  let fitTone: 'ok' | 'bad' | 'warn' = 'bad'
  if (chosen && rec) {
    const d = tierIdx(chosen) - tierIdx(rec)
    fitText = d === 0 ? S.fitOk : d < 0 ? S.fitLow : S.fitHigh
    fitTone = d === 0 ? 'ok' : d < 0 ? 'bad' : 'warn'
  }

  /* ---- 其它 ---- */
  const pkgItem = PKGS.find((p) => p.id === pkg) ?? PKGS[0]
  const clock = clockText(sec, res)
  const memItem = MEM_PATS.find((p) => p.id === memPat) ?? MEM_PATS[0]
  const temps = GRADE_TEMPS[grade]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fAte.title)}
      goal={t(ui.fAte.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fIntro"
      nextLabel={t(ui.fund.next) + t(ui.fIntro.title)}
    >
      {/* 1. 流程 */}
      <Section title={t(S.flowTitle)}>
        {FLOW_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Cards
          items={FLOW}
          activeId={flow}
          onPick={(item) => {
            setFlow(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {(() => {
          const item = FLOW.find((f) => f.id === flow)
          return item ? <Explain paras={item.explain ?? [item.text]} /> : null
        })()}
        {flow === 'final' ? (
          <>
            <Seg
              options={[
                { id: 'com' as const, label: S.com },
                { id: 'mil' as const, label: S.mil },
              ]}
              value={grade}
              onChange={setGrade}
            />
            <p className="intro__note">{t(S.tempsLabel)}</p>
            <div className="ate-temps">
              {temps.map((c) => (
                <span key={c} className={c < 20 ? 'is-cold' : c > 30 ? 'is-hot' : 'is-room'}>
                  {`${c > 0 ? '+' : ''}${c} °C`}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </Section>

      {/* 2. 晶圆探针 */}
      <Section title={t(S.waferTitle)} note={t(WAFER_LEAD)}>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={probeDone}
            onClick={() => setProbing((p) => !p)}
          >
            {t(probing && !probeDone ? S.pause : S.start)}
          </button>
          <button type="button" className="lab__btn" disabled={probeDone} onClick={() => setIdx((v) => Math.min(total, v + 1))}>
            {t(S.step)}
          </button>
          <button type="button" className="lab__btn" onClick={redoWafer}>
            {t(S.redo)}
          </button>
          <Seg
            options={[
              { id: 'ink' as const, label: S.ink },
              { id: 'map' as const, label: S.map },
            ]}
            value={mark}
            onChange={(id) => {
              setMark(id)
              setNote({ kicker: S.kicker, title: id === 'ink' ? S.ink : S.map, text: id === 'ink' ? S.inkNote : S.mapNote })
            }}
          />
        </div>
        <WaferFig
          results={results}
          tested={tested}
          current={current}
          mode={mark}
          picked={picked}
          onPick={(i) => {
            setPicked(i)
            const d = DICE[i]
            setNote({ kicker: S.kicker, title: `Die (${d.col}, ${d.row})`, text: DIE_NOTE[tested.has(i) ? 1 : 0] })
          }}
        />
        <Readout
          items={[
            { label: S.tested, value: `${idx} / ${total}` },
            { label: S.good, value: String(goodN), state: 'pass' },
            { label: S.bad, value: String(idx - goodN), state: idx - goodN > 0 ? 'fail' : undefined },
            { label: S.yieldL, value: idx ? `${((goodN / idx) * 100).toFixed(1)}%` : '—' },
          ]}
        />
        {mark === 'map' ? (
          <p className="intro__note">
            {t(S.binLegend)}
            {DIE_BINS.map((b) => `${b.bin} = ${t(b.label)}`).join('，')}
          </p>
        ) : null}
        <Explain paras={DIE_NOTE} />
        {probeDone ? <Callout tone="ok">{t(S.done)}</Callout> : null}
      </Section>

      {/* 3. 封装 */}
      <Section title={t(S.pkgTitle)} note={t(S.pkgNote)}>
        <Cards
          items={PKGS.map((p) => ({ id: p.id, title: p.name, sub: p.full, text: p.text }))}
          activeId={pkg}
          cols={4}
          onPick={(item) => {
            setPkg(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <PkgFig style={pkgItem.style} pins={pkgItem.pins} name={pkgItem.name} />
        <Callout>
          <p>
            <b>{`${pkgItem.name} · ${t(pkgItem.full)}`}</b>
          </p>
          <p>{t(pkgItem.text)}</p>
          <p>
            {t(S.pins)}
            {t(pkgItem.sides)}
          </p>
        </Callout>
        <h4 className="ate-sub">{S.bondTitle}</h4>
        {BOND_TEXT.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <BondFig />
      </Section>

      {/* 4. ATE */}
      <Section title={t(S.ateTitle)}>
        {ATE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Cards
          items={ATE_PARTS}
          activeId={part}
          cols={4}
          onPick={(item) => {
            setPart(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={[ATE_PARTS.find((p) => p.id === part)?.text ?? '']} />
        <h4 className="ate-sub">{t(S.hookTitle)}</h4>
        <Seg
          options={[
            { id: 'cp' as const, label: S.cp },
            { id: 'hand' as const, label: S.hand },
            { id: 'handler' as const, label: S.handler },
          ]}
          value={hookup}
          onChange={setHookup}
        />
        <HookupFig mode={hookup} />
        <Explain paras={[HOOKUP_TEXT[hookup]]} />
      </Section>

      {/* 5. 数字 vs 模拟 */}
      <Section title={t(S.daTitle)}>
        {DA_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="knob-row">
          <Knob label={S.sec} value={sec} unit="s" min={0} max={59.99} step={0.01} onChange={setSec} />
        </div>
        <Seg
          options={[
            { id: 'min' as const, label: S.resMin },
            { id: 'sec' as const, label: S.resSec },
            { id: 'ds' as const, label: S.resDs },
            { id: 'cs' as const, label: S.resCs },
          ]}
          value={res}
          onChange={setRes}
        />
        <ClockFig sec={sec} res={res} />
        <Readout
          items={[
            { label: S.trueT, value: `10:08:${sec.toFixed(2).padStart(5, '0')}…` },
            { label: S.shownT, value: clock.text },
            { label: S.lostT, value: `${(sec - clock.shown).toFixed(2)} s` },
          ]}
        />
        <p>{t(MIXED_LEAD)}</p>
        <Cards
          items={MIXED}
          activeId={mixed}
          cols={4}
          onPick={(item) => {
            setMixed(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={[MIXED.find((m) => m.id === mixed)?.text ?? '']} />
      </Section>

      {/* 6. 四类测试机 */}
      <Section title={t(S.testerTitle)}>
        <Cards
          items={TESTERS}
          activeId={tester}
          cols={4}
          onPick={(item) => {
            setTester(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={TESTERS.find((item) => item.id === tester)?.explain} />
        <h4 className="ate-sub">{t(S.memTitle)}</h4>
        <div className="row-actions">
          <Seg
            options={MEM_PATS.map((p) => ({ id: p.id, label: p.label }))}
            value={memPat}
            onChange={(id) => {
              setMemPat(id)
              setMemStep(0)
              const p = MEM_PATS.find((item) => item.id === id)
              if (p) setNote({ kicker: S.kicker, title: p.label, text: p.text })
            }}
          />
          {memPat === 'walk1' || memPat === 'walk0' ? (
            <button type="button" className="lab__btn" onClick={() => setMemStep((v) => (v + 1) % 64)}>
              {t(S.memStep)}
            </button>
          ) : null}
        </div>
        <MemPatFig pat={memPat} step={memStep} />
        <Explain paras={[memItem.text]} />

        <h4 className="ate-sub">{t(S.tierTitle)}</h4>
        <p className="intro__note">{t(S.tierNote)}</p>
        <div className="knob-row">
          <Knob label={S.freq} value={freq} unit="MHz" min={1} max={400} step={1} onChange={setFreq} />
          <Knob label={S.pinCount} value={pins} unit="" min={8} max={1024} step={8} onChange={setPins} />
        </div>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colTier)}</th>
              <th>{t(S.colRange)}</th>
              <th>{t(S.colCost)}</th>
              <th>{t(S.colFit)}</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => {
              const can = freq <= tier.maxF && pins <= tier.maxPins
              return (
                <tr
                  key={tier.id}
                  className={`is-click${chosen === tier.id ? ' is-active' : ''} ${can ? 'is-pass' : 'is-fail'}`}
                  onClick={() => setChosen(tier.id)}
                >
                  <td>
                    {t(tier.name)}
                    {rec === tier.id ? <b style={{ marginLeft: 8, color: 'var(--green-2)' }}>{`← ${t(S.rec)}`}</b> : null}
                  </td>
                  <td className="mono-cell">{tier.range}</td>
                  <td>{t(tier.cost)}</td>
                  <td className="verdict">{t(can ? S.yes : S.no)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="intro__note">{t(TIER_NOTE)}</p>
        {rec === null ? <Callout tone="bad">{t(S.noneRec)}</Callout> : null}
        {chosen ? <Callout tone={fitTone}>{t(fitText)}</Callout> : null}
        <Callout tone="warn">{t(COST_TEXT)}</Callout>
      </Section>

      {/* 7. 周边设备 */}
      <Section title={t(S.periphTitle)}>
        <Cards
          items={PERIPH}
          activeId={periph}
          onPick={(item) => {
            setPeriph(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={PERIPH.find((item) => item.id === periph)?.explain} />
      </Section>

      <Section title={t(S.binTitle)} note={t(S.binNote)}>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={!!flight || left <= 0 || auto} onClick={startOne}>
            {t(S.next)}
          </button>
          <button type="button" className="lab__btn" disabled={left <= 0 && !auto} onClick={() => setAuto((a) => !a)}>
            {t(auto ? S.stop : S.auto)}
          </button>
          <button type="button" className="lab__btn" onClick={resetHandler}>
            {t(S.reset)}
          </button>
          <Seg
            options={[
              { id: 'min' as const, label: S.minBins },
              { id: 'full' as const, label: S.fullBins },
            ]}
            value={binMode}
            onChange={(id) => {
              setBinMode(id)
              setNote({ kicker: S.kicker, title: id === 'min' ? S.minBins : S.fullBins, text: BIN_TEXT[id] })
            }}
          />
        </div>
        <HandlerFig bins={bins} untested={left} flight={flight ? { key: flight.key, target: flightTarget, stage: flight.stage } : null} />
        <Readout
          items={[
            { label: S.left, value: String(left) },
            { label: S.last, value: lastItem ? t(lastItem.label) : '—', state: lastItem ? (lastItem.good ? 'pass' : 'fail') : undefined },
            { label: S.goodRate, value: goodCount + badCount ? `${((goodCount / (goodCount + badCount)) * 100).toFixed(0)}%` : '—' },
          ]}
        />
        <Explain paras={[BIN_TEXT[binMode]]} />
      </Section>

      <Section title={t(ui.fund.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.fund.quizTitle)} note={t(ui.fund.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
