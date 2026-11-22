import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Knob } from '../fund/parts'
import { SocketSection } from './SocketVisuals'
import { DiagramChoices, Formula, ScaleBars } from './FlowVisuals'
import { SocketUseCompare } from './TestSetupVisuals'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

const CURRENT_MA = 20

const CONTACTS = [
  { id: 'pogo', title: loc('弹簧针', 'Pogo pin'), text: loc('针身里有弹簧，压下去再弹起来。量产插拔多，寿命常按几十万次来提要求，次数以这只座的规格为准。针比较长，寄生电感大，很高的频率上带宽先吃亏。', 'A spring inside the pin compresses and releases. High-volume lines specify life in the hundreds of thousands of insertions; the drawing of that socket sets the number. The pin is long, so its inductance eats bandwidth first at very high frequency.') },
  { id: 'elastomer', title: loc('弹性体', 'Elastomer'), text: loc('导电橡胶把焊球和板焊盘隔开很短的一段。路径短，电感小，高频比长弹簧针干净。橡胶会磨、会老化，更换比弹簧针勤。', 'Conductive rubber leaves only a short gap between the ball and the board pad. The short path has less inductance, so it is cleaner at high frequency than a long pogo. The rubber wears and ages, so it is replaced more often.') },
  { id: 'spring', title: loc('精密弹簧探针', 'Spring probe'), text: loc('针更细、对准更准，适合工作台上把一个参数测准。结构和单价都更高，在分选机里来回插拔通常没有弹簧针耐用。', 'A finer pin that aims more precisely, for a bench measurement that has to be accurate. The mechanism and the price are both higher, and it usually survives fewer handler insertions than a pogo.') },
]

const USES = [
  { id: 'ate', title: loc('ATE 成品测试', 'ATE final test'), text: loc('分选机把封装压进定位腔，接触件顶住焊球或引脚，针尾落在负载板上。测完拔出，按 Bin 分走。', 'The handler presses the package into the pocket. Contacts meet the balls or leads, and the pin tails land on the load board. The part comes back out and is sorted by bin.') },
  { id: 'slt', title: loc('系统级 SLT', 'System-level SLT'), text: loc('插座按更接近真实系统板的接口来做，测的是芯片在板上会走的那条路径，不只是裸的直流参数。', 'The socket follows an interface closer to the real system board, so the path is the one the chip will see on a board, not only a bare DC parameter.') },
  { id: 'burn', title: loc('老化', 'Burn-in'), text: loc('芯片要在高温里停很久。塑料会蠕变，针会氧化，这是时间加温度，不只是插拔次数。老化座按这个工况单做。', 'The chip sits at high temperature for a long time. The plastic creeps and the pins oxidize: time plus temperature, as well as insertion count. A burn-in socket is built for that duty.') },
  { id: 'bench', title: loc('工作台', 'Bench'), text: loc('换芯片要快，同一颗要反复取下再装上。对准和接触电阻比每小时能测多少颗更要紧。', 'Chips are swapped often, and the same part comes off and goes back on. Alignment and contact resistance matter more than parts per hour.') },
]

const PACKS = [
  { id: 'bga', title: loc('BGA 锡球', 'BGA balls'), text: loc('针从下方顶住锡球。球心对不准，就会顶到旁边的球，或者空着。定位腔把球阵对准针阵。', 'Pins push up on the solder balls. Miss the ball center and the pin hits the neighbor, or nothing. The pocket lines the ball array up with the pin array.') },
  { id: 'lead', title: loc('QFP / SOP 引脚', 'QFP / SOP leads'), text: loc('鸥翼引脚在四边。接触在引脚上。引脚被压弯以后，下一次可能就若接若离。', 'Gull-wing leads sit on four sides. Contact is on the lead. Once a lead is bent, the next insertion may only touch sometimes.') },
  { id: 'land', title: loc('QFN / LGA 焊盘', 'QFN / LGA lands'), text: loc('没有球，也没有伸出来的脚，针顶在平面焊盘上。没有球的高度去凑，一根针短了，这一脚就是开路。', 'No balls and no leads sticking out: the pins land on flat pads. There is no ball height to take up the gap, so one short pin makes that lead an open.') },
]

const LAYERS = [
  { id: 'lid', title: loc('压盖', 'Lid'), color: '#8aa4b5' },
  { id: 'dut', title: loc('芯片', 'Device'), color: '#6f8fbf' },
  { id: 'pin', title: loc('接触件', 'Contacts'), color: '#c4a15a' },
  { id: 'body', title: loc('本体', 'Body'), color: '#d8c48a' },
  { id: 'board', title: loc('负载板', 'Load board'), color: '#c4d4b0' },
]

const LAYER_TEXT = {
  lid: loc('压盖把芯片按进腔里。力最后传到负载板上，板太薄会弓，针的压缩量就乱了。', 'The lid pushes the chip into the pocket. The force ends up on the load board. A thin board bows, and the pin compression scatters.'),
  dut: loc('被测的是封装好的芯片。晶圆上的裸 die 不进这只座，那是探针卡的活。', 'The part under test is a packaged chip. A bare die on a wafer does not go in this socket; that is the probe card job.'),
  pin: loc('接触件夹在芯片和负载板中间。它的电阻和电感串在每一脚的测量回路里。', 'The contacts sit between the chip and the load board. Their resistance and inductance are in series with every lead measurement.'),
  body: loc('本体只负责把芯片和针对准，不走信号。信号在针和板的铜里。', 'The body only lines the chip up with the pins. It carries no signal. The signal is in the pins and the board copper.'),
  board: loc('负载板是一块 PCB。针尾焊或压在它的焊盘上，走线再扇出到测试头的 Pogo。阻抗、去耦和继电器做在这块板上。', 'The load board is a PCB. Pin tails are soldered or pressed onto its pads, then traces fan out to the test-head pogo. Impedance, decoupling and relays live on this board.'),
}

const QUIZ = [
  { id: 'q1', prompt: loc('成品测试的 Socket 装在哪？', 'Where does the final-test socket sit?'), options: [
    { id: 'a', text: loc('装在负载板这块 PCB 上', 'On the load board, which is a PCB') },
    { id: 'b', text: loc('焊在晶圆上', 'Soldered to the wafer') },
    { id: 'c', text: loc('装在探针卡中心', 'In the center of the probe card') },
  ], answer: 'a', explain: loc('分选机把封装压进插座，针尾落在负载板上。扎晶圆的针在探针卡上，见 {@mfgProbe}。', 'The handler presses the package into the socket, and the pin tails land on the load board. Wafer needles live on the probe card; see {@mfgProbe}.') },
  { id: 'q2', prompt: loc('Socket 的三件是什么？', 'What are the three pieces of a socket?'), options: [
    { id: 'a', text: loc('本体、接触件、压盖', 'Body, contacts and lid') },
    { id: 'b', text: loc('晶圆、吸盘、探针', 'Wafer, chuck and probes') },
    { id: 'c', text: loc('只有一块塑料', 'Only a piece of plastic') },
  ], answer: 'a', explain: loc('本体对准，接触件导通，压盖把力给稳。少了压盖，这一次和下一次的接触电阻会对不上。', 'The body aligns, the contacts conduct, and the lid holds the force steady. Without the lid, contact resistance will not match from one insertion to the next.') },
  { id: 'q3', prompt: loc('很高的频率上为什么有人改用弹性体？', 'Why switch to elastomer at very high frequency?'), options: [
    { id: 'a', text: loc('路径短，寄生电感比长弹簧针小', 'The path is short, so inductance is lower than a long pogo') },
    { id: 'b', text: loc('弹性体永远更耐插拔', 'Elastomer always survives more insertions') },
    { id: 'c', text: loc('弹性体不需要负载板', 'Elastomer needs no load board') },
  ], answer: 'a', explain: loc('电感小，高频更干净。橡胶磨损更快，量大又要少停机时仍常用弹簧针。带宽的定量账在 {@mfgHw}。', 'Less inductance is cleaner at high frequency. The rubber wears faster, so a high-volume line that cannot stop often still uses pogos. The bandwidth number is in {@mfgHw}.') },
  { id: 'q4', prompt: loc('20 mA 走过 2 Ω 接触电阻，额外压降是多少？', 'Extra drop when 20 mA flows through 2 Ω of contact resistance?'), options: [
    { id: 'a', text: loc('40 mV', '40 mV') },
    { id: 'b', text: loc('2 mV', '2 mV') },
    { id: 'c', text: loc('0', '0') },
  ], answer: 'a', explain: loc('20 mA × 2 Ω = 40 mV。这 40 mV 加在芯片电压上。窗口只有几十毫伏时，脏针会把好芯片判失败。', '20 mA × 2 Ω = 40 mV. Those 40 mV add to the chip voltage. With a window of only tens of millivolts, a dirty pin fails a good chip.') },
  { id: 'q5', prompt: loc('老化座为什么常常不是那只量产座？', 'Why is the burn-in socket often a different part from the production socket?'), options: [
    { id: 'a', text: loc('高温久置，塑料蠕变、针氧化，不只是插拔次数', 'A long hot dwell creeps the plastic and oxidizes the pins; it is not only insertion count') },
    { id: 'b', text: loc('老化不接触芯片', 'Burn-in never touches the chip') },
    { id: 'c', text: loc('老化用探针卡', 'Burn-in uses a probe card') },
  ], answer: 'a', explain: loc('老化的损伤来自时间和温度。量产座按插拔次数来设计，顶不了这个工况。', 'Burn-in damage comes from time and temperature. A production socket is designed around insertion count and will not cover that duty.') },
  { id: 'q6', prompt: loc('探针卡的针焊在这块负载板上吗？', 'Are the probe-card needles soldered to this load board?'), options: [
    { id: 'a', text: loc('不焊。这块板上是 Socket；针在探针卡自己的 PCB 上', 'No. This board carries the socket; the needles are on the probe card PCB') },
    { id: 'b', text: loc('焊在负载板中心', 'Soldered at the center of the load board') },
    { id: 'c', text: loc('焊在芯片上', 'Soldered to the chip') },
  ], answer: 'a', explain: loc('成品测试和晶圆测试各有一块接口板。负载板上是插座，探针卡自己有 PCB。见 {@mfgProbe}。', 'Final test and wafer sort each have their own interface board. The load board carries the socket. The probe card has its own PCB. See {@mfgProbe}.') },
  { id: 'q7', prompt: loc('负载板在插座下面要干什么？', 'What does the load board do under the socket?'), options: [
    { id: 'a', text: loc('把针尾扇出到测试头，并做阻抗、去耦，还要扛压头的力', 'Fan the pin tails out to the test head, set impedance and decoupling, and take the plunger force') },
    { id: 'b', text: loc('只起装饰', 'Decoration only') },
    { id: 'c', text: loc('代替芯片', 'It replaces the chip') },
  ], answer: 'a', explain: loc('塑料座里做不了扇出和去耦。力如果把板压弯，针的压缩量就乱了。', 'The plastic body cannot fan traces out or hold the decoupling. If the force bows the board, pin compression scatters.') },
  { id: 'q8', prompt: loc('接触电阻变高，第一步是什么？', 'Contact resistance has risen. What is the first step?'), options: [
    { id: 'a', text: loc('先清针或换座，再谈改限值', 'Clean or replace the socket before touching the limits') },
    { id: 'b', text: loc('立刻放宽限值', 'Widen the limits immediately') },
    { id: 'c', text: loc('把芯片判废', 'Scrap the chip') },
  ], answer: 'a', explain: loc('多出来的压降是 I × R接触，不是芯片变了。先把接触修好，否则好芯片会被判失败。', 'The extra drop is I × Rcontact, not a change in the chip. Fix the contact first, or good chips fail.') },
]

export function MfgSocketPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [contactId, setContactId] = useState(CONTACTS[0].id)
  const [useId, setUseId] = useState(USES[0].id)
  const [packId, setPackId] = useState(PACKS[0].id)
  const [layerId, setLayerId] = useState(LAYERS[0].id)
  const [stage, setStage] = useState(0)
  const [useRunning, setUseRunning] = useState(false)
  const [rcMilli, setRcMilli] = useState(200)
  const contact = CONTACTS.find((item) => item.id === contactId) ?? CONTACTS[0]
  const pack = PACKS.find((item) => item.id === packId) ?? PACKS[0]
  const dropMv = rcMilli * (CURRENT_MA / 1000)
  const elasHit = useSticky(contactId === 'elastomer')
  const rcHit = useSticky(rcMilli === 2000)
  const burnHit = useSticky(useId === 'burn')
  const taskElas = loc('点弹性体，读它为什么高频更好、为什么更换更勤。', 'Select elastomer and read why it is better at high frequency, and why it is replaced more often.')
  const taskRc = loc('把接触电阻调到 2000 mΩ，读 20 mA 下多出来的压降。', 'Set contact resistance to 2000 mΩ and read the extra drop at 20 mA.')
  const taskBurn = loc('点老化，读它和量产插拔差在哪。', 'Select burn-in and read how it differs from production insertions.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgSocket}
      nextId="mfgProbe"
      nextLabel={loc('下一课：探针卡', 'Next: the probe card')}
      later={loc('带宽和每次插拔成本见 {@mfgHw}。针卡见 {@mfgProbe}。三维位置见 {@connection}。', 'Bandwidth and cost per insertion: {@mfgHw}. The probe card: {@mfgProbe}. The 3D layout: {@connection}.')}
      intro={[
        loc('成品测试里，Socket 装在负载板上。负载板是一块 PCB：针尾落在它的焊盘上，走线再扇出到测试头。芯片不焊死，压进去就能测，拔出来就能换。', 'In final test the socket sits on the load board. The load board is a PCB: pin tails land on its pads, and traces fan out to the test head. The chip is not soldered down, so it can be tested and swapped.'),
        loc('材料牌号和寿命次数是常见量级，以这只座的图纸为准。', 'Material grades and life counts are typical magnitudes. The drawing of that socket wins.'),
      ]}
      related={['connection', 'mfgHw', 'mfgProbe', 'hsAteLimit']}
      kicker={COMMON.kicker}
      asideTitle={contact.title}
      asideText={contact.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskElas, done: elasHit.hit },
        { id: 't2', text: taskRc, done: rcHit.hit },
        { id: 't3', text: taskBurn, done: burnHit.hit },
      ]}
      onReset={() => {
        setContactId(CONTACTS[0].id)
        setUseId(USES[0].id)
        setPackId(PACKS[0].id)
        setLayerId(LAYERS[0].id)
        setStage(0)
        setUseRunning(false)
        setRcMilli(200)
        elasHit.reset()
        rcHit.reset()
        burnHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <div className="hardware-controls">
            <span className="hardware-control-label">{t(loc('封装端子', 'Package terminal'))}</span>
            <DiagramChoices label={loc('封装端子', 'Package terminal')} items={PACKS} value={packId} onPick={setPackId} />
            <span className="hardware-control-label">{t(loc('测试座接触件', 'Socket contact'))}</span>
            <DiagramChoices label={loc('测试座接触件', 'Socket contact')} items={CONTACTS} value={contactId} onPick={setContactId} />
            <span className="hardware-control-label">{t(loc('高亮截面部件', 'Highlight a component'))}</span>
            <DiagramChoices label={loc('高亮截面部件', 'Highlight a component')} items={LAYERS} value={layerId} onPick={setLayerId} />
          </div>
          <SocketSection pack={packId} contact={contactId} focus={layerId}
            focusNote={LAYER_TEXT[layerId as keyof typeof LAYER_TEXT]} stage={stage} onStage={setStage} />
          <p>{t(pack.text)}</p>
          <p>{t(contact.text)}</p>
          <SocketUseCompare items={USES} value={useId} onPick={setUseId} running={useRunning} onRun={setUseRunning} />
          <p>{t(loc('接触电阻串在回路里。额外压降 = 电流 × 接触电阻。20 mA 走过 2 Ω 就是 40 mV。这 40 mV 不是芯片多出来的。', 'Contact resistance is in series with the measurement. Extra drop = current × contact resistance. 20 mA through 2 Ω is 40 mV. Those 40 mV are not extra voltage from the chip.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskElas}>
            <p>{t(loc('切换截面上的接触件，比较接触路径和压合行程。', 'Change the contact in the cross-section and compare its path and compression.'))}</p>
            <After show={elasHit.hit} text={loc('弹性体路径短，寄生电感比长弹簧针小，所以高频更干净。橡胶会磨，更换更勤。又要高频、又要少停机时，两件事要一起看，不能只留一个优点。', 'The elastomer path is short, so its inductance is lower than a long pogo and high frequency stays cleaner. The rubber wears, so replacement is more often. When you need both high frequency and little downtime, both facts stay on the table.')} />
          </Drill>
          <Drill n={2} title={taskRc}>
            <div className="knobs">
              <Knob label={loc('接触电阻', 'Contact R')} value={rcMilli} unit="mΩ" min={50} max={5000} step={50} onChange={setRcMilli} />
            </div>
            <Formula
              rule="ΔV = I × R_contact"
              value={`${CURRENT_MA} mA × ${(rcMilli / 1000).toFixed(2)} Ω = ${dropMv.toFixed(1)} mV`}
              note={loc("先把 mΩ 换成 Ω，电源路径中耗掉的这段电压随接触电阻线性增大。", "Convert mΩ to Ω. The voltage lost across the contact grows linearly with its resistance.")}
            >
              <ScaleBars max={100} items={[
                { title: loc('接触压降（mV）', 'Contact voltage drop (mV)'), value: dropMv, display: `${dropMv.toFixed(1)} mV` },
              ]} />
            </Formula>
            <After show={rcHit.hit} text={loc('2000 mΩ = 2 Ω。20 mA × 2 Ω = 40 mV。限值窗口如果只有几十毫伏，这 40 mV 足够把一颗好芯片推出去。所以先清针或换座，再改限值。', '2000 mΩ = 2 Ω. 20 mA × 2 Ω = 40 mV. If the limit window is only tens of millivolts, 40 mV is enough to push a good chip out. Clean or replace the socket before editing the limit.')} />
          </Drill>
          <Drill n={3} title={taskBurn}>
            <p>{t(loc('用上面的场合卡片。', 'Use the use cards above.'))}</p>
            <After show={burnHit.hit} text={loc('老化要在高温里停很久。塑料蠕变、针氧化，来自时间和温度。量产座按插拔次数设计，所以老化座常常是另一只。', 'Burn-in sits at high temperature for a long time. Plastic creep and pin oxidation come from time and temperature. A production socket is designed around insertion count, so the burn-in socket is often a different part.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('Socket 只是机械件。接触电阻的 I×R 会直接加进电压读数。', 'A socket is only a mechanical piece. The I×R of contact resistance adds straight into the voltage reading.'),
        loc('探针焊在成品测试的负载板上。这块板上是插座；扎晶圆的针在探针卡自己的 PCB 上。', 'Probe needles are soldered to the final-test load board. This board carries the socket; wafer needles are on the probe card PCB.'),
        loc('弹性体处处更好。高频占优，磨损和更换更差。', 'Elastomer is better at everything. It wins at high frequency and loses on wear and replacement.'),
      ]}
      takeaway={[
        loc('负载板是 PCB，Socket 装在上面：本体对准，接触件导通，压盖把力给稳。', 'The load board is a PCB and the socket sits on it: the body aligns, the contacts conduct, the lid holds the force.'),
        loc('量产多用弹簧针；高频看弹性体；精密测量看弹簧探针。老化按高温久置另做一只座。', 'Production mostly uses pogos; high frequency looks at elastomer; a precision measurement looks at a spring probe. Burn-in gets its own socket for a long hot dwell.'),
        loc('额外压降 = I × R接触。先修接触，再怀疑芯片。', 'Extra drop = I × Rcontact. Fix the contact before blaming the chip.'),
      ]}
      quiz={QUIZ}
    />
  )
}
