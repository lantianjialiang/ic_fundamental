import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { maxSites, perInsertionCost, seriesLBandwidthGHz, unitCost } from './core'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

const KINDS = [
  { id: 'pcard', title: loc('探针卡', 'Probe card'), text: loc('晶圆级：针扎在 pad 上。悬臂、垂直、MEMS 是类型概念。', 'Wafer level: needles land on pads. Cantilever, vertical and MEMS are type names.') },
  { id: 'dib', title: loc('DIB / Loadboard', 'DIB / Loadboard'), text: loc('成品级转接板：阻抗、去耦、继电器、和测试机资源映射。', 'The packaged-part board: impedance, decoupling, relays and tester-resource mapping.') },
  { id: 'socket', title: loc('Socket', 'Socket'), text: loc('弹簧针接触封装。寿命按插拔次数算，高速时电感会限带宽。', 'Pogo pins contact the package. Life is insertions; inductance limits bandwidth.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('探针卡和 DIB+Socket 的差别？', 'Probe card vs DIB+socket?'), options: [
    { id: 'a', text: loc('探针卡用于 CP，DIB+Socket 用于 FT', 'Probe card is CP; DIB+socket is FT') },
    { id: 'b', text: loc('完全一样', 'They are the same') },
    { id: 'c', text: loc('Socket 用于晶圆', 'The socket is for wafers') },
  ], answer: 'a', explain: loc('接触对象不同：pad 对封装引脚。架构见数字课。', 'They touch different things: pads versus package pins. Architecture is in the digital lessons.') },
  { id: 'q2', prompt: loc('512 通道、每颗 64 引脚最多几个 Site？', 'Max sites for 512 channels, 64 pins/DUT?'), options: [
    { id: 'a', text: loc('4', '4') },
    { id: 'b', text: loc('8', '8') },
    { id: 'c', text: loc('64', '64') },
  ], answer: 'b', explain: loc('floor(512/64)=8。热和机械还会再限制。', 'floor(512/64)=8. Heat and mechanics can cut that further.') },
  { id: 'q3', prompt: loc('1 nH、50 Ω 的串联电感带宽？', 'Series-L bandwidth at 1 nH, 50 Ω?'), options: [
    { id: 'a', text: loc('约 1.6 GHz', 'About 1.6 GHz') },
    { id: 'b', text: loc('约 15.9 GHz', 'About 15.9 GHz') },
    { id: 'c', text: loc('无限', 'Infinite') },
  ], answer: 'b', explain: loc('f=2·Z0/(2πL)≈15.9 GHz。教学示意。', 'f=2·Z0/(2πL)≈15.9 GHz. Teaching illustration.') },
  { id: 'q4', prompt: loc('Socket 500、寿命 20 万次，每次成本？', 'Socket 500, life 200k; cost per insertion?'), options: [
    { id: 'a', text: loc('0.0025', '0.0025') },
    { id: 'b', text: loc('500', '500') },
    { id: 'c', text: loc('20 万', '200k') },
  ], answer: 'a', explain: loc('耗材/寿命=0.0025。还要算维护。', 'Consumable/life=0.0025. Maintenance is extra.') },
  { id: 'q5', prompt: loc('Site 数只受通道数限制吗？', 'Is site count only limited by channels?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：还有热、机械平面度和共享资源', 'No: heat, planarity and shared resources also limit it') },
    { id: 'c', text: loc('只受 Socket 价格限制', 'Only socket price') },
  ], answer: 'b', explain: loc('通道公式只是上限。', 'The channel formula is only an upper bound.') },
  { id: 'q6', prompt: loc('Socket 对高速信号有影响吗？', 'Does a socket affect high-speed signals?'), options: [
    { id: 'a', text: loc('没有，它只是机械件', 'No, it is only mechanical') },
    { id: 'b', text: loc('有，弹簧针电感会限带宽', 'Yes; pogo inductance limits bandwidth') },
    { id: 'c', text: loc('只影响直流', 'Only DC') },
  ], answer: 'b', explain: loc('呼应高速课的夹具损耗。', 'Same idea as fixture loss in the high-speed lessons.') },
  { id: 'q7', prompt: loc('这些硬件是不是买一次就不用管？', 'Are these boards buy-once, no maintenance?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：要清针、换针、校准平面度', 'No: clean, replace pins, check planarity') },
    { id: 'c', text: loc('只换 Socket', 'Only replace the socket') },
  ], answer: 'b', explain: loc('接触力会磨损，接触电阻会漂。', 'Contact force wears the pins and contact resistance drifts.') },
  { id: 'q8', prompt: loc('为什么硬件交期也要算进 NRE？', 'Why does hardware lead time sit in NRE?'), options: [
    { id: 'a', text: loc('高层数 DIB 和定制探针卡往往要数周到数月', 'A thick DIB or custom probe card often takes weeks to months') },
    { id: 'b', text: loc('当天就能做完', 'They are same-day parts') },
    { id: 'c', text: loc('Foundry 附送', 'The foundry includes them') },
  ], answer: 'a', explain: loc('来不及的硬件会卡住工程批。', 'Late hardware blocks the engineering lot.') },
]

export function MfgHwPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [channels, setChannels] = useState(256)
  const [pins, setPins] = useState(80)
  const [lNh, setLNh] = useState(2)
  const [z0, setZ0] = useState(50)
  const [price, setPrice] = useState(800)
  const [life, setLife] = useState(100000)
  const [nreNew, setNreNew] = useState(80)
  const [volumeK, setVolumeK] = useState(20)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const sites = maxSites(channels, pins)
  const bw = seriesLBandwidthGHz(lNh, z0)
  const per = perInsertionCost(price, life)
  const reuse = unitCost(0, volumeK * 1000, 0.4)
  const fresh = unitCost(nreNew * 1000, volumeK * 1000, 0.15)
  const siteHit = useSticky(channels === 512 && pins === 64)
  const bwHit = useSticky(lNh === 1 && z0 === 50)
  const perHit = useSticky(price === 500 && life === 200000)
  const costHit = useSticky(nreNew === 20 && fresh < reuse)
  const taskSites = loc('把通道调到 512、每颗引脚调到 64，读最多能并行几颗。', 'Set channels to 512 and pins per DUT to 64, then read how many DUTs can run in parallel.')
  const taskBw = loc('把串联电感调到 1 nH、Z0 保持 50 Ω，读带宽。', 'Set series inductance to 1 nH, keep Z0 at 50 Ω, and read the bandwidth.')
  const taskPer = loc('把 Socket 价格调到 500、寿命调到 20 万次，读每次插拔成本。', 'Set the socket price to 500 and life to 200,000 insertions, then read the cost per insertion.')
  const taskCost = loc('把新 DIB 的 NRE 调到最低，再提高产量，直到新做的单颗低于复用。', 'Set the new DIB’s NRE to its lowest, then raise volume until a new board costs less per unit than reuse.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgHw}
      nextId="mfgSubstrate"
      nextLabel={loc('下一课：封装基板基础', 'Next: package substrate basics')}
      later={loc('夹具损耗见 {@hsAteLimit}；Kelvin 接触见 {@pwrKelvin}；多 Site 见 {@genMultisite}。', 'Fixture loss: {@hsAteLimit}; Kelvin: {@pwrKelvin}; multi-site: {@genMultisite}.')}
      intro={[
        loc('探针卡服务晶圆，DIB+Socket 服务封装。这里看设计要素、带宽、每次插拔成本和 Site 上限，不重复数字课里的机台架构。', 'A probe card serves the wafer; a DIB plus socket serves the package. Here we look at design items, bandwidth, cost per insertion and the site cap — not the tester architecture already in the digital lessons.'),
        loc('金额和交期是教学示意。', 'Money and lead time are teaching illustrations.'),
      ]}
      related={['ate', 'connection', 'genMultisite', 'hsAteLimit', 'pwrKelvin']}
      kicker={COMMON.kicker}
      asideTitle={kind.title}
      asideText={kind.text}
      tasks={[
        { id: 't1', text: taskSites, done: siteHit.hit },
        { id: 't2', text: taskBw, done: bwHit.hit },
        { id: 't3', text: taskPer, done: perHit.hit },
        { id: 't4', text: taskCost, done: costHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setChannels(256)
        setPins(80)
        setLNh(2)
        setZ0(50)
        setPrice(800)
        setLife(100000)
        setNreNew(80)
        setVolumeK(20)
        siteHit.reset()
        bwHit.reset()
        perHit.reset()
        costHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('三种硬件接触的对象不同。点一种，读它用在晶圆还是封装。', 'The three fixtures touch different things. Click one and read whether it meets the wafer or the package.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={3} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <p>{t(loc('能并行的颗数上限 = floor(测试机通道 ÷ 每颗引脚)。这只是通道账。热、针的平面度和共享电源还会再把颗数往下砍。', 'The parallel-DUT cap = floor(tester channels ÷ pins per DUT). That is only the channel budget. Heat, pin planarity and shared supplies can cut it further.'))}</p>
          <p>{t(loc('弹簧针可以看成串联电感。带宽 ≈ 2×Z0 / (2πL)，L 用 nH、结果用 GHz。电感越大，带宽越低。', 'A pogo pin behaves as a series inductance. Bandwidth ≈ 2×Z0 / (2πL), with L in nH and the result in GHz. More inductance means less bandwidth.'))}</p>
          <p>{t(loc('每次插拔成本 = 耗材价格 ÷ 寿命次数。复用旧板没有新的一次性费用，单颗只剩可变部分；新做一块板要把 NRE 摊进产量。', 'Cost per insertion = consumable price ÷ life. Reusing an old board has no new one-time bill, so the unit is only the variable part; a new board amortizes its NRE over volume.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskSites}>
            <div className="knobs">
              <Knob label={loc('测试机通道', 'Tester channels')} value={channels} unit="" min={128} max={512} step={128} onChange={setChannels} />
              <Knob label={loc('每颗引脚', 'Pins / DUT')} value={pins} unit="" min={16} max={128} step={16} onChange={setPins} />
            </div>
            <Readout items={[{ label: loc('你算出的并行颗数', 'Parallel DUTs you got'), value: `${sites}` }]} />
            <After show={siteHit.hit} text={loc('512 ÷ 64 = 8，所以通道最多并行 8 颗。热和机械若吃不消，实际还要再少。', '512 ÷ 64 = 8, so the channels allow 8 DUTs in parallel. If heat or mechanics cannot keep up, the real count is lower.')} />
          </Drill>
          <Drill n={2} title={taskBw}>
            <div className="knobs">
              <Knob label={loc('串联电感', 'Series L')} value={lNh} unit="nH" min={1} max={5} step={1} onChange={setLNh} />
              <Knob label={loc('Z0', 'Z0')} value={z0} unit="Ω" min={40} max={60} step={5} onChange={setZ0} />
            </div>
            <Readout items={[{ label: loc('你算出的带宽', 'Bandwidth you got'), value: `${bw.toFixed(1)} GHz` }]} />
            <After show={bwHit.hit} text={loc('2×50 / (2π×1 nH) ≈ 15.9 GHz。电感加到 2 nH，带宽大约减半，所以 Socket 不是“只接触、不影响信号”。', '2×50 / (2π×1 nH) ≈ 15.9 GHz. At 2 nH the bandwidth is about half, so a socket is not “just contact, no effect on the signal”.')} />
          </Drill>
          <Drill n={3} title={taskPer}>
            <div className="knobs">
              <Knob label={loc('Socket 价格', 'Socket price')} value={price} unit="" min={200} max={1000} step={100} onChange={setPrice} />
              <Knob label={loc('寿命次数', 'Life insertions')} value={life} unit="" min={50000} max={200000} step={50000} onChange={setLife} />
            </div>
            <Readout items={[{ label: loc('你算出的每次成本', 'Cost per insertion you got'), value: per.toFixed(4) }]} />
            <After show={perHit.hit} text={loc('500 ÷ 200000 = 0.0025。这只是耗材本身，清针和换针还要另算。', '500 ÷ 200,000 = 0.0025. That is only the consumable; cleaning and replacing pins are extra.')} />
          </Drill>
          <Drill n={4} title={taskCost}>
            <div className="knobs">
              <Knob label={loc('新 DIB NRE（千）', 'New DIB NRE (k)')} value={nreNew} unit="k" min={20} max={120} step={20} onChange={setNreNew} />
              <Knob label={loc('产量（千）', 'Volume (k)')} value={volumeK} unit="k" min={10} max={160} step={10} onChange={setVolumeK} />
            </div>
            <Readout items={[
              { label: loc('复用旧板的单颗', 'Reuse, per unit'), value: reuse.toFixed(3) },
              { label: loc('新做的单颗', 'New board, per unit'), value: fresh.toFixed(3) },
            ]} />
            <After show={costHit.hit} text={loc('复用单颗固定在可变成本 0.4。新板单颗 = NRE ÷ 产量 + 0.15。NRE 调到 2 万、产量够大之后，摊销降下来，新板才比复用便宜。产量不够时，新板更贵。', 'Reuse stays at the variable cost, 0.4. A new board is NRE ÷ volume + 0.15. After NRE is 20,000 and volume is high enough, amortization falls and the new board becomes cheaper. At low volume the new board costs more.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('Socket 不影响高速。弹簧针电感会限带宽。', 'A socket is not invisible at speed. Pogo inductance limits bandwidth.'),
        loc('Site 数只看通道。热、机械和共享资源也会卡住。', 'Site count is not only channels. Heat, mechanics and shared resources also bind.'),
        loc('硬件买一次就不用维护。针和平面度都要管。', 'Hardware is not buy-once. Pins and planarity need care.'),
      ]}
      takeaway={[
        loc('Site ≤ floor(通道/引脚)；f₋₃dB=2·Z0/(2πL)；每次成本=耗材/寿命。', 'Sites ≤ floor(channels/pins); f₋₃dB=2·Z0/(2πL); cost/insert = consumable/life.'),
        loc('探针卡和 DIB 都是 NRE，交期按周到月计。', 'Probe cards and DIBs are NRE with week-to-month lead times.'),
      ]}
      quiz={QUIZ}
    />
  )
}
