import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { shorelineBandwidthGbpsPerMm } from './core'
import { After, COMMON, Drill, PackLesson, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const LINKS = [
  { id: 'on', title: loc('片内线', 'On-die wire'), text: loc('最短、最密，但过不了光罩、跨不了工艺。', 'Shortest and densest, but cannot leave the reticle or the process.') },
  { id: 'd2d', title: loc('D2D', 'D2D'), text: loc('毫米级、宽并行、低能耗。UCIe 等开放规范以现行文本为准。', 'Millimetre-scale, wide, low energy. Open specs such as UCIe follow the current text.') },
  { id: 'ser', title: loc('长距 SerDes', 'Long-reach SerDes'), text: loc('过板、过连接器。均衡重、能耗高。见高速课。', 'Across a board and a connector. Heavy EQ, higher energy. See the high-speed lessons.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('4 行、45 µm、16 Gbps 的岸线密度？', 'Shoreline density at 4 rows, 45 µm, 16 Gbps?'), options: [
    { id: 'a', text: loc('约 1422 Gbps/mm', 'About 1422 Gbps/mm') },
    { id: 'b', text: loc('16 Gbps/mm', '16 Gbps/mm') },
    { id: 'c', text: loc('45 Gbps/mm', '45 Gbps/mm') },
  ], answer: 'a', explain: loc('4×(1000/45)×16≈1422 Gbps/mm ≈ 178 GB/s/mm。', '4×(1000/45)×16≈1422 Gbps/mm ≈ 178 GB/s/mm.') },
  { id: 'q2', prompt: loc('D2D 是不是板级互连？', 'Is D2D a board-level link?'), options: [
    { id: 'a', text: loc('是，和 PCB 走线一样', 'Yes, same as a PCB trace') },
    { id: 'b', text: loc('不是：它短、宽、低能耗，几乎不需要重均衡', 'No: short, wide, low energy, almost no heavy EQ') },
    { id: 'c', text: loc('就是光模块', 'It is an optical module') },
  ], answer: 'b', explain: loc('板级 SerDes 的对比见 {@hsChannel}。', 'Board-level SerDes comparison: {@hsChannel}.') },
  { id: 'q3', prompt: loc('D2D 是不是速率越高越好？', 'Is a higher D2D rate always better?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：D2D 追求低能耗和高密度', 'No: D2D chases low energy and high density') },
    { id: 'c', text: loc('只看眼图', 'Only the eye') },
  ], answer: 'b', explain: loc('加行、缩节距往往比拉高单通道更划算。', 'More rows or a finer pitch often beat a faster lane.') },
  { id: 'q4', prompt: loc('为什么需要边带 / 测试访问？', 'Why a sideband / test access?'), options: [
    { id: 'a', text: loc('组装后探针扎不到微凸点，要靠环回和内建访问', 'After assembly the micro-bumps cannot be probed; loopback and built-in access are required') },
    { id: 'b', text: loc('只为了好看', 'For looks') },
    { id: 'c', text: loc('可以省略', 'It can be skipped') },
  ], answer: 'a', explain: loc('训练、BER 和诊断都走这条路。', 'Training, BER and diagnosis all use that path.') },
  { id: 'q5', prompt: loc('开放 D2D 规范为什么重要？', 'Why does an open D2D spec matter?'), options: [
    { id: 'a', text: loc('不同厂商的 chiplet 才能互操作并共用测试向量', 'Chiplets from different vendors can interoperate and share test vectors') },
    { id: 'b', text: loc('只是市场口号', 'Only a marketing slogan') },
    { id: 'c', text: loc('取代晶圆厂', 'It replaces the foundry') },
  ], answer: 'a', explain: loc('UCIe 等名称以现行公开规范为准。', 'Names such as UCIe follow the current public spec.') },
  { id: 'q6', prompt: loc('链路训练在 D2D 里做什么？', 'What does link training do on D2D?'), options: [
    { id: 'a', text: loc('对齐时钟与数据，找到采样余量', 'Align clock and data and find sampling margin') },
    { id: 'b', text: loc('提高电压', 'Raise voltage') },
    { id: 'c', text: loc('更换中介层', 'Replace the interposer') },
  ], answer: 'a', explain: loc('和高速课的训练是同一类问题。', 'Same class of problem as training in the high-speed lessons.') },
  { id: 'q7', prompt: loc('能耗公式和互连课一样吗？', 'Is the energy formula the same as the interconnect lesson?'), options: [
    { id: 'a', text: loc('一样：E≈αCV²', 'Yes: E≈αCV²') },
    { id: 'b', text: loc('D2D 不耗能', 'D2D uses no energy') },
    { id: 'c', text: loc('只跟协议有关', 'Protocol only') },
  ], answer: 'a', explain: loc('短距离把 C 做小，所以 pJ/bit 低。', 'The short reach keeps C small, so pJ/bit is low.') },
  { id: 'q8', prompt: loc('组装后怎么测 D2D？', 'How is D2D tested after assembly?'), options: [
    { id: 'a', text: loc('直接扎微凸点', 'Probe the micro-bumps') },
    { id: 'b', text: loc('内建环回、BER 和边带', 'Built-in loopback, BER and sideband') },
    { id: 'c', text: loc('只看直流电阻', 'DC resistance only') },
  ], answer: 'b', explain: loc('探针会损伤细节距凸点。', 'A probe would damage the fine-pitch bumps.'),
  },
]

export function ApkD2dPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [linkId, setLinkId] = useState(LINKS[0].id)
  const [tryId, setTryId] = useState('')
  const [rows, setRows] = useState(2)
  const [pitch, setPitch] = useState(55)
  const [rate, setRate] = useState(8)
  const [strobe, setStrobe] = useState(40)
  const link = LINKS.find((item) => item.id === linkId) ?? LINKS[0]
  const shore = shorelineBandwidthGbpsPerMm(rows, pitch, rate)
  const margin = Math.max(0, 50 - Math.abs(strobe - 50))
  const shoreHit = useSticky(rows === 4 && pitch === 45 && rate === 16)
  const serHit = useSticky(tryId === 'ser')
  const eyeHit = useSticky(strobe === 50)
  const d2dHit = useSticky(tryId === 'd2d')
  const taskShore = loc('把行数调到 4、节距调到 45 µm、每通道调到 16 Gbps，读岸线密度。', 'Set 4 rows, 45 µm pitch and 16 Gbps per lane, then read the shoreline density.')
  const taskSer = loc('选出过板的那种互连，读它为什么能耗高。', 'Pick the link that crosses a board, and read why its energy is high.')
  const taskEye = loc('把采样点调到 50%，读训练余量。', 'Move the sample point to 50% and read the training margin.')
  const taskSide = loc('选出 die 和 die 之间的短互连，读为什么还要一条边带。', 'Pick the short die-to-die link and read why it still needs a sideband.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkD2d}
      nextId="apkThermal"
      nextLabel={loc('下一课：热与可靠性', 'Next: thermal and reliability')}
      later={loc('通道与 BER 见 {@hsChannel}、{@hsEye}。规范以现行文本为准。', 'Channel and BER: {@hsChannel}, {@hsEye}. Follow the current spec text.')}
      intro={[
        loc('Die-to-die 夹在片内线和长距 SerDes 中间：短、宽、低能耗。岸线带宽密度 = 行数 × (1000/节距) × 每通道速率。', 'Die-to-die sits between on-die wires and long-reach SerDes: short, wide, low energy. Shoreline density = rows × (1000/pitch) × lane rate.'),
        loc('UCIe 等开放规范名称以现行公开文本为准；这里的速率是教学示意。', 'Open-spec names such as UCIe follow the current public text; rates here are teaching illustrations.'),
      ]}
      related={['hsChannel', 'hsEye', 'apkBond']}
      kicker={COMMON.kicker}
      asideTitle={link.title}
      asideText={link.text}
      notice={COMMON.specNote}
      tasks={[
        { id: 't1', text: taskShore, done: shoreHit.hit },
        { id: 't2', text: taskSer, done: serHit.hit },
        { id: 't3', text: taskEye, done: eyeHit.hit },
        { id: 't4', text: taskSide, done: d2dHit.hit },
      ]}
      onReset={() => {
        setLinkId(LINKS[0].id)
        setTryId('')
        setRows(2)
        setPitch(55)
        setRate(8)
        setStrobe(40)
        shoreHit.reset()
        serHit.reset()
        eyeHit.reset()
        d2dHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('三种距离。点一种，读它过不过得了芯片边界。', 'Three reaches. Click one and read whether it can leave the chip edge.'))}</p>
          <Cards items={LINKS} activeId={linkId} cols={3} onPick={(item) => setLinkId(item.id)} />
          <p>{t(link.text)}</p>
          <p>{t(loc('岸线密度 = 行数 × (1000 / 节距) × 每通道速率。节距用 µm，结果是沿芯片边每毫米能送多少 Gbps。除以 8 得到大约的 GB/s/mm。', 'Shoreline density = rows × (1000 / pitch) × lane rate. Pitch is in µm. The result is how many Gbps fit along one millimetre of chip edge. Divide by 8 for about GB/s/mm.'))}</p>
          <p>{t(loc('每位能量仍是 αCV²，这一课 α 取 0.5。距离短，C 小，所以 pJ/bit 低。过板的 SerDes 要过连接器和长走线，均衡重，能耗高。', 'Energy per bit is still αCV², and this lesson uses α = 0.5. A short reach keeps C small, so pJ/bit is low. A SerDes that crosses a board also crosses a connector and a long trace, so equalization is heavy and energy is high.'))}</p>
          <p>{t(loc('训练是把采样点挪到眼的中间。余量 = 50 − |采样点 − 50|，采样点用百分数。正中间余量最大。组装之后微凸点扎不到，训练、误码和诊断走边带和环回。', 'Training moves the sample point to the middle of the eye. Margin = 50 − |sample − 50|, with the sample in percent. The middle has the largest margin. After assembly the micro-bumps cannot be probed, so training, errors and diagnosis use a sideband and loopback.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskShore}>
            <div className="knobs">
              <Knob label={loc('行数', 'Rows')} value={rows} unit="" min={1} max={4} step={1} onChange={setRows} />
              <Knob label={loc('节距', 'Pitch')} value={pitch} unit="µm" min={25} max={55} step={10} onChange={setPitch} />
              <Knob label={loc('每通道', 'Gbps / lane')} value={rate} unit="Gbps" min={8} max={16} step={4} onChange={setRate} />
            </div>
            <Readout items={[{ label: loc('你算出的岸线密度', 'Shoreline you got'), value: `${shore.toFixed(1)} Gbps/mm` }]} />
            <After show={shoreHit.hit} text={loc('4 × (1000/45) × 16 ≈ 1422 Gbps/mm，大约 178 GB/s/mm。密度来自行数和节距，不是把单通道再拉高一档。', '4 × (1000/45) × 16 ≈ 1422 Gbps/mm, about 178 GB/s/mm. The density comes from rows and pitch, not from pushing one lane faster.')} />
          </Drill>
          <Drill n={2} title={taskSer}>
            <div className="mfg-assign__picks">
              {LINKS.map((item) => (
                <button key={item.id} type="button" className={tryId === item.id ? 'is-active' : ''} onClick={() => setTryId(item.id)}>{t(item.title)}</button>
              ))}
            </div>
            <After show={tryId !== ''} text={tryId === 'ser'
              ? loc('长距 SerDes 过板、过连接器，均衡重，所以能耗高。片内线出不了这颗芯片，D2D 才是两颗 chiplet 之间那一段短的。', 'Long-reach SerDes crosses the board and a connector. Equalization is heavy, so energy is high. An on-die wire cannot leave this chip. D2D is the short span between two chiplets.')
              : loc('再看它过不过连接器。过板的是长距 SerDes。', 'Ask again whether it crosses a connector. The one that crosses the board is long-reach SerDes.')} />
          </Drill>
          <Drill n={3} title={taskEye}>
            <Knob label={loc('采样点', 'Sample %')} value={strobe} unit="%" min={30} max={70} step={5} onChange={setStrobe} />
            <Readout items={[{ label: loc('你算出的余量', 'Margin you got'), value: `${margin}` }]} />
            <After show={eyeHit.hit} text={loc('采样点在 50% 时，离两边一样远，余量是 50。偏到 40% 或 60%，余量只剩 40。训练就是把采样点挪回中间。', 'At a 50% sample the point is equally far from both edges, so the margin is 50. At 40% or 60% the margin is only 40. Training moves the sample back to the middle.')} />
          </Drill>
          <Drill n={4} title={taskSide}>
            <div className="mfg-assign__picks">
              {LINKS.map((item) => (
                <button key={item.id} type="button" className={tryId === item.id ? 'is-active' : ''} onClick={() => setTryId(item.id)}>{t(item.title)}</button>
              ))}
            </div>
            <After show={d2dHit.hit} text={loc('D2D 的微凸点在组装后扎不到。训练、误码和诊断要走边带和环回，不能等着再扎一次针。', 'D2D micro-bumps cannot be probed after assembly. Training, bit errors and diagnosis go through a sideband and loopback. There is no second chance to land a probe.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('chiplet 之间的互连和板级一样。D2D 短得多、宽得多。', 'Chiplet links are not board links. D2D is much shorter and wider.'),
        loc('速率越高越好。D2D 先要低能耗和高密度。', 'Faster is not always better. D2D wants low energy and high density first.'),
        loc('标准化与测试无关。没有共同规范就没有共同向量。', 'A standard is not unrelated to test. No common spec, no common vectors.'),
      ]}
      takeaway={[
        loc('岸线密度 = 行数 × (1000/节距) × 速率。', 'Shoreline density = rows × (1000/pitch) × rate.'),
        loc('组装后靠环回和边带测，不靠直接扎针。', 'After assembly, test uses loopback and sideband, not a direct probe.'),
      ]}
      quiz={QUIZ}
    />
  )
}
