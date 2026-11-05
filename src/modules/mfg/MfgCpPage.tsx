import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { planTouchdowns, waferTestTime } from './core'
import { WaferDisk } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

const PATTERNS = [
  { id: '1x1', title: loc('1×1', '1×1'), cols: 1, rows: 1 },
  { id: '2x1', title: loc('2×1', '2×1'), cols: 2, rows: 1 },
  { id: '2x2', title: loc('2×2', '2×2'), cols: 2, rows: 2 },
  { id: '4x2', title: loc('4×2', '4×2'), cols: 4, rows: 2 },
]

const MAPS = [
  { id: 'edge', title: loc('边缘环', 'Edge ring'), text: loc('边缘良率低：常见于膜厚、应力或切割边缘。', 'Low yield at the edge: films, stress or the exclusion ring.') },
  { id: 'scratch', title: loc('划伤带', 'Scratch band'), text: loc('一条斜带：搬运或探针划伤。', 'A diagonal band: handling or probe scratch.') },
  { id: 'cluster', title: loc('簇缺陷', 'Cluster'), text: loc('局部一团：颗粒或工艺喷溅。', 'A local clump: particles or a process splash.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('CP 的产出是什么？', 'What does CP produce?'), options: [
    { id: 'a', text: loc('只有一张合格证', 'A certificate only') },
    { id: 'b', text: loc('晶圆图、Bin 和 KGD 名单', 'A wafer map, bins and a KGD list') },
    { id: 'c', text: loc('封装外形图', 'A package outline') },
  ], answer: 'b', explain: loc('后面的组装和 PAT 都要能追溯到晶圆坐标。', 'Assembly and PAT both need wafer coordinates.') },
  { id: 'q2', prompt: loc('N-site 是否一定快 N 倍？', 'Is N-site always N times faster?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：圆形晶圆边缘会有不完整 touchdown，还有共享资源', 'No: a round wafer has partial touchdowns, plus shared resources') },
    { id: 'c', text: loc('只取决于 Handler', 'It depends only on the handler') },
  ], answer: 'b', explain: loc('效率 = die 数 / (touchdown×site 数) < 1。', 'Efficiency = dies / (touchdowns × sites) < 1.') },
  { id: 'q3', prompt: loc('CP 良率低一定是工艺问题吗？', 'Is low CP yield always a process problem?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不一定，也可能是探针接触或程序', 'Not always; probe contact or the program can do it') },
    { id: 'c', text: loc('一定是封装', 'It is always assembly') },
  ], answer: 'b', explain: loc('接触电阻、针压、程序限值都会杀良率。', 'Contact resistance, overdrive and limits can kill yield.') },
  { id: 'q4', prompt: loc('CP 之后还要不要测？', 'Is test finished after CP?'), options: [
    { id: 'a', text: loc('不要，KGD 封装后直接出货', 'No; KGD ships after assembly') },
    { id: 'b', text: loc('要。封装会引入缺陷，FT / 老化仍在后面', 'Yes. Assembly adds defects; FT / burn-in still follow') },
    { id: 'c', text: loc('只测基板', 'Only the substrate') },
  ], answer: 'b', explain: loc('CP 筛的是裸片，不是成品。', 'CP screens the bare die, not the finished part.') },
  { id: 'q5', prompt: loc('touchdown 是什么？', 'What is a touchdown?'), options: [
    { id: 'a', text: loc('探针卡扎下去测一组 site 的一次接触', 'One landing of the probe card on a group of sites') },
    { id: 'b', text: loc('换一片晶圆', 'A wafer load') },
    { id: 'c', text: loc('FT 插拔', 'An FT insertion') },
  ], answer: 'a', explain: loc('时间 T = touchdowns×T_td + T_load。', 'Time T = touchdowns×T_td + T_load.') },
  { id: 'q6', prompt: loc('随机缺陷和系统性缺陷在晶圆图上有何不同？', 'How do random and systematic defects look on a map?'), options: [
    { id: 'a', text: loc('随机分散，系统常成环、成簇或成带', 'Random is scattered; systematic is a ring, cluster or band') },
    { id: 'b', text: loc('完全一样', 'They look the same') },
    { id: 'c', text: loc('系统一定在中心', 'Systematic is always in the center') },
  ], answer: 'a', explain: loc('图样指向原因：边缘、划伤、颗粒。', 'The pattern points at the cause: edge, scratch, particles.') },
  { id: 'q7', prompt: loc('1-site 时 touchdown 数等于？', 'For 1-site, touchdowns equal?'), options: [
    { id: 'a', text: loc('die 数', 'The die count') },
    { id: 'b', text: loc('晶圆数', 'The wafer count') },
    { id: 'c', text: loc('永远是 1', 'Always 1') },
  ], answer: 'a', explain: loc('每个 die 一次接触。', 'One contact per die.') },
  { id: 'q8', prompt: loc('电子晶圆图相对打点的好处？', 'Why an electronic map instead of inking?'), options: [
    { id: 'a', text: loc('可追溯、可重测、可给 PAT 用', 'Traceable, retestable, usable by PAT') },
    { id: 'b', text: loc('更好看', 'It looks nicer') },
    { id: 'c', text: loc('不需要 Prober', 'No prober needed') },
  ], answer: 'a', explain: loc('墨点会污染，也难回放。', 'Ink contaminates and is hard to replay.') },
]

export function MfgCpPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [patternId, setPatternId] = useState(PATTERNS[0].id)
  const [mapId, setMapId] = useState(MAPS[0].id)
  const [causeId, setCauseId] = useState('')
  const [dies, setDies] = useState(640)
  const [tTd, setTTd] = useState(2)
  const [tLoad, setTLoad] = useState(20)
  const [retest, setRetest] = useState(false)
  const pattern = PATTERNS.find((item) => item.id === patternId) ?? PATTERNS[0]
  const map = MAPS.find((item) => item.id === mapId) ?? MAPS[0]
  const plan = planTouchdowns(dies, pattern.cols, pattern.rows)
  const time = waferTestTime(plan.touchdowns, tTd, tLoad) * (retest ? 1.15 : 1)
  const uph = 3600 / time
  const yieldNow = mapId === 'cluster' ? 0.88 : mapId === 'scratch' ? 0.9 : 0.86
  const patternHit = useSticky(patternId === '2x2')
  const timeHit = useSticky(tTd === 1)
  const causeHit = useSticky(causeId === 'scratch')
  const retestHit = useSticky(retest)
  const taskPattern = loc('从 1×1 换到 2×2，读触点次数和效率。', 'Switch from 1×1 to 2×2 and read touchdowns and efficiency.')
  const taskTime = loc('把每次触点时间调到 1 秒，读每小时片数怎样变。', 'Set the time per touchdown to 1 s and read how wafers per hour change.')
  const taskMap = loc('一条斜着穿过晶圆的带，判断它最像哪种图样。', 'A band running diagonally across the wafer: decide which pattern it matches.')
  const taskRetest = loc('打开重测，读整片时间怎样变。', 'Turn on retest and read how wafer time changes.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgCp}
      nextId="mfgHw"
      nextLabel={loc('下一课：测试硬件', 'Next: test hardware')}
      later={loc('多 Site 见 {@genMultisite}；探针卡设计见 {@mfgHw}。设备架构见 {@connection}。', 'Multi-site: {@genMultisite}; probe-card design: {@mfgHw}. Equipment: {@connection}.')}
      intro={[
        loc('CP 在 WAT 之后、切割之前，对每颗 die 做分选，产出晶圆图和 KGD。探针卡和 Handler 的机台结构见数字课；这一课看触点次数、效率和晶圆图图样。', 'CP sits after WAT and before saw. It sorts every die and produces a wafer map and KGD. Probe-card and handler architecture are in the digital lessons; this lesson is touchdowns, efficiency and wafer-map patterns.'),
        loc('先读触点时间和图样各代表什么，再改排布和参数。', 'Read what touchdown time and a map pattern mean, then change the layout and the settings.'),
      ]}
      related={['connection', 'genMultisite', 'mfgHw', 'relPat']}
      kicker={COMMON.kicker}
      asideTitle={map.title}
      asideText={map.text}
      tasks={[
        { id: 't1', text: taskPattern, done: patternHit.hit },
        { id: 't2', text: taskTime, done: timeHit.hit },
        { id: 't3', text: taskMap, done: causeHit.hit },
        { id: 't4', text: taskRetest, done: retestHit.hit },
      ]}
      onReset={() => {
        setPatternId(PATTERNS[0].id)
        setMapId(MAPS[0].id)
        setCauseId('')
        setDies(640)
        setTTd(2)
        setTLoad(20)
        setRetest(false)
        patternHit.reset()
        timeHit.reset()
        causeHit.reset()
        retestHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('一次 touchdown 是探针卡扎下去、同时测一组 site。整片时间 = 触点次数 × 每次时间 + 换片时间。每小时片数 = 3600 ÷ 整片时间。', 'One touchdown is the probe card landing and testing one group of sites. Wafer time = touchdowns × time each + load time. Wafers per hour = 3600 ÷ wafer time.'))}</p>
          <p>{t(loc('效率 = die 数 ÷ (触点次数 × 一次扎下的 site 数)。圆片边上经常凑不齐一整组，所以 4 个 site 不会正好快 4 倍。', 'Efficiency = dies ÷ (touchdowns × sites per landing). The round edge often cannot fill a whole group, so 4 sites are not exactly 4× faster.'))}</p>
          <p>{t(loc('晶圆图上的形状指向原因。点一张图，读它通常是什么造成的。', 'The shape on a wafer map points at a cause. Click a map and read what usually makes it.'))}</p>
          <Cards items={MAPS} activeId={mapId} cols={3} onPick={(item) => setMapId(item.id)} />
          <WaferDisk dies={dies} good={Math.round(dies * yieldNow)} label={map.title} />
          <p>{t(map.text)}</p>
          <p>{t(loc('重测是把可疑 die 再测一遍。这一课用 ×1.15 表示多出来的时间，是示意，不是某条产线的系数。', 'Retest measures suspicious dies again. This lesson uses ×1.15 for the extra time. That factor is an illustration, not a line’s coefficient.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskPattern}>
            <Seg options={PATTERNS.map((item) => ({ id: item.id, label: item.title }))} value={patternId} onChange={setPatternId} />
            <Knob label={loc('die 数', 'Die count')} value={dies} unit="" min={200} max={800} step={20} onChange={setDies} />
            <Readout items={[
              { label: loc('触点次数', 'Touchdowns'), value: `${plan.touchdowns}` },
              { label: loc('凑不齐的次数', 'Partial landings'), value: `${plan.partial}` },
              { label: loc('效率', 'Efficiency'), value: plan.efficiency.toFixed(3) },
            ]} />
            <After show={patternHit.hit} text={loc('2×2 一次扎 4 颗，触点次数下降，但圆边凑不齐，效率低于 1。所以时间不是简单变成四分之一。', '2×2 lands on 4 dies at once, so touchdowns fall, but the round edge leaves partial landings and efficiency stays below 1. Time does not become a simple quarter.')} />
          </Drill>
          <Drill n={2} title={taskTime}>
            <div className="knobs">
              <Knob label={loc('每次触点', 'Time / touchdown')} value={tTd} unit="s" min={1} max={5} step={1} onChange={setTTd} />
              <Knob label={loc('换片', 'Load time')} value={tLoad} unit="s" min={10} max={40} step={5} onChange={setTLoad} />
            </div>
            <Readout items={[{ label: loc('你算出的每小时片数', 'Wafers per hour you got'), value: uph.toFixed(1) }]} />
            <After show={timeHit.hit} text={loc('每次触点从 2 秒改成 1 秒，触点那一项时间减半。换片时间不动，所以每小时片数上升，但不是正好翻倍。', 'Cutting each touchdown from 2 s to 1 s halves the touchdown term. Load time stays, so wafers per hour rise, but not by a clean 2×.')} />
          </Drill>
          <Drill n={3} title={taskMap}>
            <p>{t(loc('先选一个图样。选完再看原因是否对得上。', 'Pick a pattern. The reason shows after you pick.'))}</p>
            <div className="mfg-assign__picks">
              {MAPS.map((item) => (
                <button key={item.id} type="button" className={causeId === item.id ? 'is-active' : ''} onClick={() => setCauseId(item.id)}>
                  {t(item.title)}
                </button>
              ))}
            </div>
            <After show={causeId !== ''} text={causeId === 'scratch'
              ? loc('斜带对应划伤：搬运或探针沿一个方向刮过去。边缘环贴着圆周，簇缺陷是局部一团。', 'A diagonal band is a scratch: handling or a probe dragged in one direction. An edge ring follows the rim; a cluster is a local clump.')
              : loc('再看形状。斜着的一条带是划伤；贴着圆周的是边缘环；挤在一处的是簇缺陷。', 'Look at the shape again. A diagonal band is a scratch; a ring on the rim is the edge; a clump in one place is a cluster.')} />
          </Drill>
          <Drill n={4} title={taskRetest}>
            <label>
              <input type="checkbox" checked={retest} onChange={(event) => setRetest(event.target.checked)} />
              {t(loc('启用重测', 'Enable retest'))}
            </label>
            <Readout items={[{ label: loc('你算出的整片时间', 'Wafer time you got'), value: `${time.toFixed(1)} s` }]} />
            <After show={retestHit.hit} text={loc('重测把整片时间乘 1.15，大约多出 15%。多出来的是再扎一次可疑 die，不是工艺本身变慢。', 'Retest multiplies wafer time by 1.15, about 15% more. The extra is another landing on suspicious dies, not a slower process.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('N-site 就快 N 倍。圆形边缘和共享通道会吃掉效率。', 'N-site is not an N× shortcut. The round edge and shared channels eat efficiency.'),
        loc('CP 良率低一定是工艺。先排除探针和程序。', 'Low CP yield is not automatically process. Check probes and the program first.'),
        loc('CP 之后不用再测。封装和老化仍会引入失效。', 'CP is not the last test. Assembly and burn-in still add fails.'),
      ]}
      takeaway={[
        loc('T = touchdowns×T_td + T_load；效率 = die / (touchdown×site)。', 'T = touchdowns×T_td + T_load; efficiency = dies / (touchdowns×sites).'),
        loc('晶圆图图样（边缘、划伤、簇）指向不同原因。', 'Map patterns (edge, scratch, cluster) point at different causes.'),
      ]}
      quiz={QUIZ}
    />
  )
}
