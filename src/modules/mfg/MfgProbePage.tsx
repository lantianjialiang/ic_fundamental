import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Knob, Readout } from '../fund/parts'
import { ProbeMotion, ProbeStack } from './ProbeVisuals'
import { ProbeTypeCompare, type ProbeType } from './ProbeTypes'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

type Zone = 'low' | 'ok' | 'high'

function zoneOf(overdrive: number): Zone {
  if (overdrive < 20) return 'low'
  if (overdrive <= 40) return 'ok'
  return 'high'
}

const TYPES = [
  { id: 'cant', title: loc('悬臂针', 'Cantilever'), text: loc('针从一侧伸到焊盘上方，下压时针尖往前滑，留下一条 scrub。焊盘要留出这段滑程。节距一细，旁边的针会挤在一起，更密的芯片就改用垂直针或 MEMS。', 'The needle reaches in from the side. On the way down the tip slides forward and leaves a scrub mark. The pad has to leave room for that slide. At fine pitch the neighbors crowd each other, so a denser chip moves to vertical or MEMS needles.') },
  { id: 'vert', title: loc('垂直针', 'Vertical'), text: loc('针大致竖直，靠自身压缩产生压力，而不是靠悬臂弯曲。平面度更好控，节距可以更细。针仍然会磨，要清，也要看针尖直径。', 'The needles are roughly vertical. Force comes from the needle compressing, not from a cantilever bending. Planarity is easier to hold, so the pitch can be finer. The tips still wear: they get cleaned, and the tip diameter is watched.') },
  { id: 'mems', title: loc('MEMS', 'MEMS'), text: loc('针用光刻和电镀在晶圆上做出来，同一批的长度和针尖更齐，共面更好。常见叠法是 MEMS 针 + 有机空间转换基板（MLO）+ PCB。密度来自这套工艺。针还是耗材，尖磨了就要保养。', 'Needles are lithographed and plated on a wafer, so length and tip shape match across the batch and the tips sit in one plane. A common stack is MEMS needles, an organic space transformer (MLO) and a PCB. Density comes from that process. The needles are still a consumable: a worn tip gets serviced.') },
] as const

const LAYER_TEXT = {
  probe: loc('只有针碰到焊盘。过驱动让针尖刮开氧化层。针很细，能过的电流比 Socket 里的弹簧针小。', 'Only the needle touches the pad. Overdrive makes the tip scrub through oxide. The needle is thin, so it carries less current than a socket pogo.'),
  st: loc('空间转换基板（MLO / MLC）把几十微米的针距放大到 PCB 能布线的间距。针侧太密，PCB 工艺直接走不了。', 'The space transformer (MLO / MLC) fans a pitch of tens of microns out to a pitch the PCB can route. The needle side is too fine for PCB rules to route directly.'),
  pcb: loc('针卡自己的 PCB 干成品测试里负载板的事：边缘一圈焊盘接测试头的 Pogo，内层走阻抗。加强板让这块圆板在针压下不翘。针并不焊在成品测试那块负载板上。', 'The probe card PCB does the final-test load board job: a ring of pads at the edge meets the test-head pogo, and inner layers carry impedance. A stiffener keeps the round board from bowing under the needles. The needles are not soldered to the final-test load board.'),
  pogo: loc('Pogo 环在测试头上，不在针卡里。它是信号离开针卡 PCB 的地方。换针卡不用焊接。', 'The pogo ring is on the test head, not inside the probe card. It is where the signal leaves the probe-card PCB. Swapping a card does not take solder.'),
}

const ZONE_LABEL: Record<Zone, ReturnType<typeof loc>> = {
  low: loc('偏小', 'Low'),
  ok: loc('窗口内', 'In window'),
  high: loc('偏大', 'High'),
}

const QUIZ = [
  { id: 'q1', prompt: loc('探针卡和成品测试负载板是什么关系？', 'How does a probe card relate to the final-test load board?'), options: [
    { id: 'a', text: loc('针卡自带 PCB，干的是晶圆测试的接口板；针不装在成品测试那块负载板上', 'The card has its own PCB and is the wafer-sort interface; the needles are not on the final-test load board') },
    { id: 'b', text: loc('针焊在成品测试负载板中心', 'The needles are soldered at the center of the final-test load board') },
    { id: 'c', text: loc('两者是同一块板', 'They are the same board') },
  ], answer: 'a', explain: loc('成品测试的负载板上是 Socket，见 {@mfgSocket}。探针卡边缘接 Pogo，中心的针扎裸 die。', 'The final-test load board carries a socket; see {@mfgSocket}. A probe card meets the pogo at the edge, and its center needles land on a bare die.') },
  { id: 'q2', prompt: loc('谁直接碰到焊盘？', 'What actually touches the pad?'), options: [
    { id: 'a', text: loc('只有探针', 'Only the probe') },
    { id: 'b', text: loc('空间转换基板', 'The space transformer') },
    { id: 'c', text: loc('针卡 PCB 的绿油', 'The probe-card solder mask') },
  ], answer: 'a', explain: loc('基板和 PCB 负责把间距放大并接到测试机。碰到铝垫或凸点的只有针尖。', 'The transformer and the PCB fan the pitch out and reach the tester. Only the tip meets the aluminum pad or the bump.') },
  { id: 'q3', prompt: loc('空间转换器做什么？', 'What does the space transformer do?'), options: [
    { id: 'a', text: loc('把几十微米的针距放大到 PCB 能走线的间距', 'Fans a pitch of tens of microns out to a pitch the PCB can route') },
    { id: 'b', text: loc('给芯片供电', 'Powers the chip') },
    { id: 'c', text: loc('代替探针', 'Replaces the probes') },
  ], answer: 'a', explain: loc('针侧太密，PCB 的线宽线距直接走不出来。转换基板在中间把间距拉开。', 'The needle side is too fine for PCB trace and space rules. The transformer opens the pitch in between.') },
  { id: 'q4', prompt: loc('过驱动太小会怎样？', 'What happens when overdrive is too small?'), options: [
    { id: 'a', text: loc('氧化层还在，接触电阻高，读数像开路', 'Oxide remains, contact resistance stays high, and the reading looks like an open') },
    { id: 'b', text: loc('焊盘一定被刨穿', 'The pad is certainly plowed through') },
    { id: 'c', text: loc('没有影响', 'No effect') },
  ], answer: 'a', explain: loc('针尖要刮开氧化才形成低阻接触。刮不到，这一脚就像没扎上。', 'The tip has to scrub through oxide before the contact resistance drops. If it never scrubs, that lead looks unprobed.') },
  { id: 'q5', prompt: loc('过驱动太大会怎样？', 'What happens when overdrive is too large?'), options: [
    { id: 'a', text: loc('针迹过深，焊盘受伤，后面的打线或植球会接在坏表面上', 'The scrub is too deep, the pad is damaged, and later bonding or bumping lands on a hurt surface') },
    { id: 'b', text: loc('接触一定更好，没有代价', 'Contact is always better, at no cost') },
    { id: 'c', text: loc('只影响 Socket', 'It only affects the socket') },
  ], answer: 'a', explain: loc('多出来的行程变成更深的刮痕。接触稳了，焊盘也可能报废。', 'The extra travel becomes a deeper scrub. The contact may be solid and the pad may still be ruined.') },
  { id: 'q6', prompt: loc('MEMS 针为什么更齐？', 'Why do MEMS needles match each other?'), options: [
    { id: 'a', text: loc('同一批用光刻和电镀做出来', 'One batch is lithographed and plated') },
    { id: 'b', text: loc('靠手工把悬臂针磨到一样长', 'Someone grinds cantilever needles to the same length by hand') },
    { id: 'c', text: loc('因为针更粗', 'Because the needles are thicker') },
  ], answer: 'a', explain: loc('一致性来自晶圆上的光刻，不是把悬臂针一根根磨齐。尖磨了仍然要保养。', 'The match comes from lithography on a wafer, not from grinding cantilever needles one by one. A worn tip still needs service.') },
  { id: 'q7', prompt: loc('悬臂针为什么在很细的节距上困难？', 'Why do cantilever needles struggle at very fine pitch?'), options: [
    { id: 'a', text: loc('下压时针尖要往前滑，旁边的针得让开这段滑程', 'The tip slides forward as it lands, so the next needle has to leave room for that scrub') },
    { id: 'b', text: loc('悬臂针不能导电', 'Cantilever needles cannot conduct') },
    { id: 'c', text: loc('悬臂针没有 PCB', 'Cantilever needles have no PCB') },
  ], answer: 'a', explain: loc('滑程是刮开氧化的代价。节距小于这段滑程加针的宽度，针就会打架。', 'The slide is the price of scrubbing oxide. Once the pitch is smaller than that slide plus the needle width, the needles collide.') },
  { id: 'q8', prompt: loc('为什么开短路要放在给晶圆上电之前？', 'Why do opens and shorts run before the wafer is powered?'), options: [
    { id: 'a', text: loc('针很细，电源短路的电流可能把针烧了', 'The needle is thin, and the current of a supply short can burn it') },
    { id: 'b', text: loc('开短路测不了', 'Opens and shorts cannot be measured') },
    { id: 'c', text: loc('上电以后针更准', 'The needle is more accurate after power-up') },
  ], answer: 'a', explain: loc('探针的载流比 Socket 弹簧针小。先确认没有短路，再上电。开短路本身见 {@fOpens}。', 'A probe carries less current than a socket pogo. Confirm there is no short, then apply power. The opens and shorts test itself is in {@fOpens}.') },
]

export function MfgProbePage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [typeId, setTypeId] = useState<ProbeType>(TYPES[0].id)
  const [compareLoad, setCompareLoad] = useState(false)
  const [layerId, setLayerId] = useState('pogo')
  const [approach, setApproach] = useState(false)
  const [overdrive, setOverdrive] = useState(0)
  const kind = TYPES.find((item) => item.id === typeId) ?? TYPES[0]
  const zone = zoneOf(overdrive)
  const moveChuck = (next: number, beforeContact = false) => {
    setOverdrive(next)
    setApproach(beforeContact)
  }
  const memsHit = useSticky(typeId === 'mems')
  const okHit = useSticky(overdrive === 30)
  const highHit = useSticky(overdrive === 70)
  const taskMems = loc('点 MEMS，读针为什么更齐、信号还要经过哪几层。', 'Select MEMS and read why the needles match, and which layers the signal still crosses.')
  const taskOk = loc('把过驱动调到 30 µm，读它落在哪一段。', 'Set overdrive to 30 µm and read which band it lands in.')
  const taskHigh = loc('把过驱动调到 70 µm，读焊盘会怎样。', 'Set overdrive to 70 µm and read what happens to the pad.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgProbe}
      nextId="mfgSubstrate"
      nextLabel={loc('下一课：封装基板基础', 'Next: package substrate basics')}
      later={loc('Socket 在负载板上，见 {@mfgSocket}。开短路见 {@fOpens}。三维位置见 {@connection}。', 'The socket on the load board: {@mfgSocket}. Opens and shorts: {@fOpens}. The 3D layout: {@connection}.')}
      intro={[
        loc('晶圆测试的接口是探针卡，不是把针焊到成品测试的负载板上。针卡自己有一块 PCB：边缘接测试头的 Pogo 环，中心的针扎在裸 die 的焊盘上。有人把这块 PCB 也叫负载板，因为它干的是同一件事，接的却是晶圆，不是封装。', 'The wafer-sort interface is the probe card, not needles soldered onto the final-test load board. The card has its own PCB: the edge meets the test-head pogo ring, and the center needles land on bare-die pads. People sometimes call that PCB a load board too, because it does the same job, but it meets a wafer, not a package.'),
        loc('下面 20–40 µm 是教学窗口，用来练习判断过驱动。真机看焊盘金属厚度和针卡图纸。', 'The 20–40 µm band below is a teaching window for judging overdrive. A real setup follows the pad metal thickness and the probe-card drawing.'),
      ]}
      related={['connection', 'mfgSocket', 'mfgCp', 'fOpens']}
      kicker={COMMON.kicker}
      asideTitle={kind.title}
      asideText={kind.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskMems, done: memsHit.hit },
        { id: 't2', text: taskOk, done: okHit.hit },
        { id: 't3', text: taskHigh, done: highHit.hit },
      ]}
      onReset={() => {
        setTypeId(TYPES[0].id)
        setCompareLoad(false)
        setLayerId('pogo')
        moveChuck(0)
        memsHit.reset()
        okHit.reset()
        highHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <ProbeTypeCompare items={TYPES} selected={typeId} onSelect={setTypeId} loaded={compareLoad} onLoad={setCompareLoad} />
          <p>{t(kind.text)}</p>
          <ProbeStack layer={layerId} onLayer={setLayerId} note={LAYER_TEXT[layerId as keyof typeof LAYER_TEXT]} />
          <p>{t(loc('扎上之后再多走一段，针尖在焊盘上刮出一条痕，把氧化层刮开，接触电阻才下来。这段多走的距离叫过驱动。太短，氧化还在，读数像开路。太长，痕太深，后面打线或植球会接在受伤的表面上。', 'After touchdown the chuck travels a little more. The tip scrubs a mark into the pad, breaks the oxide, and only then does contact resistance fall. That extra travel is overdrive. Too short, and oxide remains, so the reading looks like an open. Too long, and the mark is deep enough that later wire-bond or bumping lands on a damaged surface.'))}</p>
          <p>{t(loc('针很细，载流比 Socket 的弹簧针小。晶圆上如果电源已经短路，先上电跑功能可能把针烧了。所以开短路放在上电之前。', 'The needle is thin and carries less current than a socket pogo. If a supply is already shorted on the wafer, powering up to run a functional test can burn the needle. Opens and shorts therefore run before power is applied.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskMems}>
            <p>{t(loc('点上方的 MEMS 图，再顺着针卡截面追踪信号。', 'Select the MEMS drawing above, then trace the signal through the probe-card cross-section.'))}</p>
            <After show={memsHit.hit} text={loc('MEMS 微加工可重复形成小型针体，便于控制每根针的长度和针尖位置。沿信号通路依次是针、空间转换基板、针卡 PCB、测试头 Pogo。', 'MEMS fabrication can repeat compact probe elements with controlled length and tip position. The signal path runs from the probe through the space transformer and probe-card PCB to the test-head pogo.')} />
          </Drill>
          <Drill n={2} title={taskOk}>
            <div className="knobs">
              <Knob label={loc('过驱动', 'Overdrive')} value={overdrive} unit="µm" min={0} max={80} step={5} onChange={moveChuck} />
            </div>
            <ProbeMotion type={typeId} overdrive={overdrive} approach={approach} onMotion={moveChuck} />
            <Readout items={[{ label: loc('教学窗口 20–40 µm', 'Teaching window 20–40 µm'), value: approach ? t(loc('未接触', 'Gap open')) : t(ZONE_LABEL[zone]) }]} />
            <After show={okHit.hit} text={loc('30 µm 落在 20–40 µm 的教学窗口里。这段行程够把氧化刮开，又还没把示意的铝垫刨穿。真机的窗口看焊盘金属有多厚、针卡图纸写多少，不是这个固定数。', '30 µm sits inside the 20–40 µm teaching window. That travel is enough to scrub oxide and not yet enough to plow through the example aluminum pad. A real window follows how thick the pad metal is and what the probe-card drawing says, not this fixed number.')} />
          </Drill>
          <Drill n={3} title={taskHigh}>
            <p>{t(loc('拖动上面的过驱动滑杆，或点 70 µm，在俯视图里看擦痕。', 'Drag the overdrive slider or select 70 µm and inspect the scrub mark in the top view.'))}</p>
            <Readout items={[{ label: loc('教学窗口 20–40 µm', 'Teaching window 20–40 µm'), value: approach ? t(loc('未接触', 'Gap open')) : t(ZONE_LABEL[zone]) }]} />
            <After show={highHit.hit} text={loc('70 µm 超出教学窗口。多出来的行程变成更深的针迹，焊盘被刨伤，后面的打线或植球会接在受伤的表面上。过驱动不是越大越稳。', '70 µm is outside the teaching window. The extra travel becomes a deeper scrub, the pad is gouged, and later wire-bond or bumping lands on a damaged surface. More overdrive is not automatically a more stable contact.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('针焊在成品测试的负载板上。针卡有自己的 PCB，成品测试那块板上装的是 Socket。', 'Needles are soldered to the final-test load board. The probe card has its own PCB. The final-test board carries a socket.'),
        loc('过驱动越大接触越好。太大时焊盘会被刨伤，后面的键合会接在坏表面上。', 'More overdrive always means better contact. Too much gouges the pad, and later bonding lands on a damaged surface.'),
        loc('MEMS 是把悬臂针磨细。它是光刻做出来的一批针，再叠在空间转换基板和 PCB 上。', 'MEMS means a cantilever needle ground thinner. It is a lithographed batch of needles, stacked on a space transformer and a PCB.'),
      ]}
      takeaway={[
        loc('探针卡 = 针 + 空间转换基板 + 针卡 PCB。针卡 PCB 接测试头，不借用成品测试的负载板。', 'Probe card = needles + space transformer + probe-card PCB. That PCB meets the test head and does not borrow the final-test load board.'),
        loc('悬臂针会滑出针迹；垂直针更密；MEMS 用光刻把针做齐。三者都要保养针尖。', 'Cantilever needles scrub as they slide; vertical needles go finer; MEMS lithography makes the needles match. All three still need tip maintenance.'),
        loc('过驱动太小像开路，太大连焊盘一起伤。开短路放在上电之前，因为针载流小。', 'Too little overdrive looks like an open; too much damages the pad as well. Opens and shorts run before power because the needle carries little current.'),
      ]}
      quiz={QUIZ}
    />
  )
}
