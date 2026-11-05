import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { breakEvenVolume, mpwShare, unitCost } from './core'
import { YieldBars } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const PIECES = [
  { id: 'mask', title: loc('光罩', 'Masks'), text: loc('先进节点往往是 NRE 最大的一块。', 'Often the largest NRE piece at an advanced node.') },
  { id: 'eda', title: loc('EDA / IP', 'EDA / IP'), text: loc('工具授权和第三方 IP。', 'Tool licenses and third-party IP.') },
  { id: 'eng', title: loc('工程晶圆', 'Engineering wafers'), text: loc('工程批验证设计和工艺窗口。', 'Engineering lots that prove the design and process window.') },
  { id: 'sub', title: loc('基板', 'Substrate'), text: loc('封装基板设计与第一批制造。', 'Substrate design and the first build.') },
  { id: 'test', title: loc('测试程序 + 硬件', 'Test program + hardware'), text: loc('程序、探针卡、DIB、Socket 都算 NRE，不是“测的时候才花钱”。', 'The program, probe card, DIB and socket are NRE, not only a per-test fee.') },
  { id: 'qual', title: loc('认证', 'Qualification'), text: loc('可靠性与客户认证的一次性费用。', 'One-time reliability and customer qualification.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('NRE 是什么？', 'What is NRE?'), options: [
    { id: 'a', text: loc('每颗芯片都要付的可变成本', 'A variable cost paid on every chip') },
    { id: 'b', text: loc('一次性工程费用，用产量摊销', 'One-time engineering cost, amortized over volume') },
    { id: 'c', text: loc('只含光罩', 'Masks only') },
  ], answer: 'b', explain: loc('单颗成本 = NRE/产量 + 可变成本。', 'Unit cost = NRE/volume + variable.') },
  { id: 'q2', prompt: loc('MPW / Shuttle 为什么便宜？', 'Why is MPW / Shuttle cheaper?'), options: [
    { id: 'a', text: loc('不需要光罩', 'It needs no masks') },
    { id: 'b', text: loc('多个项目共享一套光罩，按面积分摊', 'Several projects share one mask set and split the cost by area') },
    { id: 'c', text: loc('Foundry 免单', 'The foundry gives it away') },
  ], answer: 'b', explain: loc('适合工程样片，不适合大规模量产。', 'Fine for engineering samples, not high volume.') },
  { id: 'q3', prompt: loc('测试硬件算不算 NRE？', 'Is test hardware NRE?'), options: [
    { id: 'a', text: loc('不算，只算机时', 'No, only tester time counts') },
    { id: 'b', text: loc('算：程序、探针卡、DIB、Socket、治具', 'Yes: program, probe card, DIB, socket, fixtures') },
    { id: 'c', text: loc('只算 Socket', 'Only the socket') },
  ], answer: 'b', explain: loc('这些都要在产量上摊销，决定飞针还是治具。', 'They amortize over volume and decide flying probe versus fixture.') },
  { id: 'q4', prompt: loc('只看单颗可变成本会漏掉什么？', 'What do you miss if you only look at variable unit cost?'), options: [
    { id: 'a', text: loc('NRE 摊销，小产量时它会主导', 'NRE amortization, which dominates at low volume') },
    { id: 'b', text: loc('硅的颜色', 'The color of the silicon') },
    { id: 'c', text: loc('封装外形', 'The package outline') },
  ], answer: 'a', explain: loc('低产量时 NRE/V 往往比可变成本还大。', 'At low volume NRE/V is often larger than the variable cost.') },
  { id: 'q5', prompt: loc('重新流片（respin）贵在哪？', 'Why is a respin expensive?'), options: [
    { id: 'a', text: loc('只要再付一次光罩和工程批', 'You pay another mask set and engineering lot') },
    { id: 'b', text: loc('只要改一下程序', 'You only edit the program') },
    { id: 'c', text: loc('免费', 'It is free') },
  ], answer: 'a', explain: loc('光罩、工程晶圆、日程都要再来一遍。', 'Masks, engineering wafers and the schedule all restart.') },
  { id: 'q6', prompt: loc('NRE=2M、产量 100k、可变 5，单颗是？', 'NRE=2M, volume 100k, variable 5. Unit cost?'), options: [
    { id: 'a', text: loc('5', '5') },
    { id: 'b', text: loc('25', '25') },
    { id: 'c', text: loc('2M', '2M') },
  ], answer: 'b', explain: loc('2e6/1e5 + 5 = 25。教学示意。', '2e6/1e5 + 5 = 25. Teaching illustration.') },
  { id: 'q7', prompt: loc('方案 A（NRE 1M、变量 8）对 B（3M、5）的盈亏平衡产量？', 'Break-even volume of A (NRE 1M, var 8) vs B (3M, 5)?'), options: [
    { id: 'a', text: loc('约 6.7 万', 'About 67k') },
    { id: 'b', text: loc('约 66.7 万', 'About 667k') },
    { id: 'c', text: loc('100 万', '1M') },
  ], answer: 'b', explain: loc('(3M−1M)/(8−5) ≈ 666,667。', '(3M−1M)/(8−5) ≈ 666,667.') },
  { id: 'q8', prompt: loc('tape-out 是什么？', 'What is tape-out?'), options: [
    { id: 'a', text: loc('把设计数据交给光罩/晶圆厂的时间点', 'The moment design data is released to mask / wafer manufacturing') },
    { id: 'b', text: loc('把芯片装进编带', 'Putting chips into tape-and-reel') },
    { id: 'c', text: loc('FT 出货', 'FT ship') },
  ], answer: 'a', explain: loc('之后改设计就要重新流片。', 'After that, a design change means a respin.') },
]

export function MfgNrePage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [pieceId, setPieceId] = useState(PIECES[0].id)
  const [nre, setNre] = useState(3)
  const [volumeK, setVolumeK] = useState(50)
  const [variable, setVariable] = useState(8)
  const [nreA, setNreA] = useState(2)
  const [varA, setVarA] = useState(6)
  const [nreB, setNreB] = useState(4)
  const [varB, setVarB] = useState(4)
  const [projects, setProjects] = useState(5)
  const [respin, setRespin] = useState(0)
  const piece = PIECES.find((item) => item.id === pieceId) ?? PIECES[0]
  const nreAll = (nre + respin) * 1e6
  const unit = unitCost(nreAll, volumeK * 1000, variable)
  const be = breakEvenVolume(nreA * 1e6, varA, nreB * 1e6, varB)
  const share = mpwShare(1e6, projects)
  const unitHit = useSticky(near(nre, 2, 0.01) && respin === 0 && near(volumeK, 100, 0.1) && near(variable, 5, 0.01))
  const beHit = useSticky(near(nreA, 1, 0.01) && near(varA, 8, 0.01) && near(nreB, 3, 0.01) && near(varB, 5, 0.01))
  const mpwHit = useSticky(projects === 10)
  const respinHit = useSticky(respin >= 1)
  const taskUnit = loc('把 NRE 调到 2（百万）、产量 100k、可变成本 5，读单颗成本。', 'Set NRE to 2 (million), volume to 100k and variable cost to 5, then read the unit cost.')
  const taskBe = loc('把方案 A 调成 NRE 1、可变 8，方案 B 调成 NRE 3、可变 5，读盈亏平衡产量。', 'Set plan A to NRE 1 and variable 8, plan B to NRE 3 and variable 5, then read the break-even volume.')
  const taskMpw = loc('把共享光罩的项目数调到 10，读每个项目分到多少。', 'Set the shared-mask projects to 10 and read each project’s share.')
  const taskRespin = loc('加上一次重新流片，读单颗成本怎样变。', 'Add one respin and read how the unit cost changes.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgNre}
      nextId="mfgWat"
      nextLabel={loc('下一课：WAT / PCM', 'Next: WAT / PCM')}
      later={loc('飞针还是治具，也是同一套 NRE 对单颗的账，见 {@mfgFlying}。', 'Flying probe versus fixture is the same NRE-versus-unit math; see {@mfgFlying}.')}
      intro={[
        loc('NRE 是一次性工程费用：光罩、IP、EDA、工程晶圆、基板、测试程序和硬件、认证。先看这些钱怎么摊到每一颗，再调数字。', 'NRE is the one-time engineering bill: masks, IP, EDA, engineering wafers, substrates, the test program and hardware, qualification. See how that money lands on each unit, then change the numbers.'),
        loc('金额是教学示意的相对单位，不是任何公司的报价。', 'Money here is a relative teaching unit, not anyone’s quote.'),
      ]}
      related={['mfgFlying', 'mfgHw', 'mfgOverview']}
      kicker={COMMON.kicker}
      asideTitle={piece.title}
      asideText={piece.text}
      tasks={[
        { id: 't1', text: taskUnit, done: unitHit.hit },
        { id: 't2', text: taskBe, done: beHit.hit },
        { id: 't3', text: taskMpw, done: mpwHit.hit },
        { id: 't4', text: taskRespin, done: respinHit.hit },
      ]}
      onReset={() => {
        setPieceId(PIECES[0].id)
        setNre(3)
        setVolumeK(50)
        setVariable(8)
        setNreA(2)
        setVarA(6)
        setNreB(4)
        setVarB(4)
        setProjects(5)
        setRespin(0)
        unitHit.reset()
        beHit.reset()
        mpwHit.reset()
        respinHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('这些都是开工前就要付的钱。点一项，看它为什么算一次性费用。', 'These are paid before volume starts. Click one and see why it is a one-time cost.'))}</p>
          <Cards items={PIECES} activeId={pieceId} cols={3} onPick={(item) => setPieceId(item.id)} />
          <p>{t(piece.text)}</p>
          <p>{t(loc('单颗成本 = NRE ÷ 产量 + 可变成本。产量用“颗”计。NRE 不变时，产量越小，摊到每一颗的钱越多。', 'Unit cost = NRE ÷ volume + variable cost. Volume is in units. With NRE fixed, a smaller volume puts more of it on each unit.'))}</p>
          <p>{t(loc('两个方案比的是同一颗芯片。贵方案的一次性费用更高、可变成本更低时，盈亏平衡产量 = (NRE_B − NRE_A) ÷ (可变_A − 可变_B)。产量低于这一点，一次性费用低的方案更便宜。', 'Two plans price the same chip. When the expensive plan has higher NRE and lower variable cost, break-even volume = (NRE_B − NRE_A) ÷ (variable_A − variable_B). Below that volume, the lower-NRE plan is cheaper.'))}</p>
          <p>{t(loc('MPW 是几个项目共用一套光罩，每个项目的光罩份额 = 光罩费 ÷ 项目数。重新流片是再付一次光罩和工程批，等于在 NRE 上再加一块。', 'An MPW lets several projects share one mask set. Each project’s share = mask cost ÷ project count. A respin pays for masks and an engineering lot again, so it adds another block of NRE.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskUnit}>
            <YieldBars
              items={[
                { title: loc('NRE 摊到每颗', 'NRE on each unit'), value: Math.min(1, nreAll / (volumeK * 1000) / 40) },
                { title: loc('可变成本', 'Variable cost'), value: Math.min(1, variable / 40) },
              ]}
            />
            <div className="knobs">
              <Knob label={loc('NRE（百万）', 'NRE (millions)')} value={nre} unit="" min={0.5} max={5} step={0.5} onChange={setNre} />
              <Knob label={loc('产量（千）', 'Volume (k)')} value={volumeK} unit="k" min={10} max={200} step={10} onChange={setVolumeK} />
              <Knob label={loc('可变成本', 'Variable')} value={variable} unit="" min={2} max={12} step={1} onChange={setVariable} />
            </div>
            <Readout items={[{ label: loc('你算出的单颗成本', 'Unit cost you got'), value: unit.toFixed(2) }]} />
            <After show={unitHit.hit} text={loc('2 百万 ÷ 10 万颗 = 20，再加可变成本 5，单颗是 25。产量若只有一半，摊销变成 40，单颗就是 45。', '2 million ÷ 100,000 units = 20, plus variable cost 5, so the unit is 25. At half the volume the amortization becomes 40 and the unit is 45.')} />
          </Drill>
          <Drill n={2} title={taskBe}>
            <div className="knobs">
              <Knob label={loc('方案 A NRE（百万）', 'Plan A NRE (M)')} value={nreA} unit="" min={0.5} max={4} step={0.5} onChange={setNreA} />
              <Knob label={loc('方案 A 可变', 'Plan A variable')} value={varA} unit="" min={3} max={12} step={1} onChange={setVarA} />
              <Knob label={loc('方案 B NRE（百万）', 'Plan B NRE (M)')} value={nreB} unit="" min={1} max={5} step={0.5} onChange={setNreB} />
              <Knob label={loc('方案 B 可变', 'Plan B variable')} value={varB} unit="" min={2} max={10} step={1} onChange={setVarB} />
            </div>
            <Readout items={[{ label: loc('你算出的盈亏平衡产量', 'Break-even volume you got'), value: Number.isFinite(be) ? be.toFixed(0) : '—' }]} />
            <After show={beHit.hit} text={loc('(3−1) 百万 ÷ (8−5) ≈ 666,667 颗。低于这个产量，选一次性费用更低的 A；高于它，选可变成本更低的 B。', '(3−1) million ÷ (8−5) ≈ 666,667 units. Below that volume pick A, the lower one-time bill; above it pick B, the lower variable cost.')} />
          </Drill>
          <Drill n={3} title={taskMpw}>
            <Knob label={loc('MPW 项目数', 'MPW projects')} value={projects} unit="" min={2} max={16} step={1} onChange={setProjects} />
            <Readout items={[{ label: loc('你算出的每个项目份额', 'Share per project you got'), value: share.toFixed(0) }]} />
            <After show={mpwHit.hit} text={loc('光罩按 1 百万计，10 个项目各摊 10 万。项目越少，每一家分到的光罩越贵，所以 MPW 适合样片，不适合自己包下整套光罩的量产。', 'A mask counted as 1 million, shared by 10 projects, is 100,000 each. Fewer projects make each share more expensive, so MPW fits samples, not a production run that buys the whole mask set.')} />
          </Drill>
          <Drill n={4} title={taskRespin}>
            <Knob label={loc('重新流片次数', 'Respin count')} value={respin} unit="" min={0} max={2} step={1} onChange={setRespin} />
            <Readout items={[{ label: loc('加上重新流片后的单颗', 'Unit cost with the respin'), value: unit.toFixed(2) }]} />
            <After show={respinHit.hit} text={loc('一次重新流片按再付一块同样大小的 NRE 来示意。它加在分子上，产量不变时每一颗都变贵，而且日程也要重来。', 'One respin is shown as paying another NRE of the same size. It adds to the numerator, so every unit gets more expensive at the same volume, and the schedule restarts too.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('NRE 与产量无关。产量越小，摊到每颗越贵。', 'NRE is not independent of volume. Lower volume makes each unit carry more of it.'),
        loc('只看单颗可变成本。小批量时 NRE 才是大头。', 'Variable unit cost is not the whole story. At low volume NRE dominates.'),
        loc('测试硬件不算 NRE。程序和夹具都要先付钱。', 'Test hardware is NRE. The program and the fixture are paid up front.'),
      ]}
      takeaway={[
        loc('单颗 = NRE/V + 可变；盈亏平衡 V=(NRE_B−NRE_A)/(var_A−var_B)。', 'Unit = NRE/V + variable; break-even V=(NRE_B−NRE_A)/(var_A−var_B).'),
        loc('MPW 按项目分摊光罩；respin 等于再买一次最大的那几块 NRE。', 'MPW shares the mask; a respin buys the largest NRE pieces again.'),
      ]}
      quiz={QUIZ}
    />
  )
}
