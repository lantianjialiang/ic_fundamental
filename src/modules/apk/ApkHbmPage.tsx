import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { hbmBandwidthGBps } from './core'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const PARTS = [
  { id: 'dram', label: loc('DRAM 层', 'DRAM layers') },
  { id: 'base', label: loc('基底 die', 'Base die') },
  { id: 'ubump', label: loc('微凸点', 'Micro-bumps') },
  { id: 'intp', label: loc('中介层', 'Interposer') },
] as const

const FIX = [
  { id: 'bist', title: loc('BIST 自检', 'BIST'), text: loc('自检逻辑向选中的 DRAM 层写入图样，再读回比较。图中蓝色去程和虚线回程共用垂直互连。', 'Self-test writes a pattern into the selected DRAM layer and compares the readback. The solid blue command path and dashed return share vertical interconnects.') },
  { id: 'repair', title: loc('冗余修复', 'Redundancy repair'), text: loc('定位到坏行后，把地址重映射到同层备用行。这里画的是行冗余示例。', 'Once a bad row is located, remap its address to a spare row on the same die. The diagram shows row redundancy.') },
  { id: 'ecc', title: loc('ECC', 'ECC'), text: loc('运行中读出数据与校验位，解码后修正可纠正的错误。图中以主机侧 ECC 为例；具体实现会有差异。', 'During operation, read data with its check bits and decode to correct recoverable errors. This example shows host-side ECC. Implementations vary.') },
  { id: 'access', title: loc('测试访问', 'Test access'), text: loc('堆叠完成后，从外部可接触端子，经中介层、基底 die 和垂直互连访问被覆盖的 DRAM 层。', 'After stacking, start at accessible external contacts and reach buried DRAM through the interposer, base die and vertical interconnects.') },
] as const

type HbmPart = (typeof PARTS)[number]['id']
type HbmRole = (typeof FIX)[number]['id']

function HbmCut({ part, role }: { part: HbmPart; role: HbmRole }) {
  const { t } = useLocale()
  return (
    <svg className="term-fig__svg" viewBox="0 0 440 231" role="img" aria-label={t(loc('HBM 堆叠与测试路径示意', 'HBM cross-section and test paths'))}>
      <rect width="440" height="231" rx="10" fill="var(--well)" />
      <g fontSize="14" fill="var(--text)">
        <text x="15" y="64">{t(PARTS[0].label)}</text>
        <text x="15" y="142">{t(PARTS[1].label)}</text>
        <text x="15" y="166">{t(PARTS[2].label)}</text>
        <text x="15" y="186">{t(PARTS[3].label)}</text>
      </g>
      {[31, 54, 77, 100].map((y) => (
        <rect key={y} x="119" y={y} width="161" height="18" rx="3" fill="#67aebc" fillOpacity={part === 'dram' ? .64 : .27} stroke="#67aebc" />
      ))}
      <rect x="113" y="124" width="173" height="24" rx="4" fill="#81b067" fillOpacity={part === 'base' ? .65 : .32} stroke="#81b067" />
      {[131, 162, 193, 224, 255, 271].map((x) => <circle key={x} cx={x} cy="160" r="4" fill="#e1b253" opacity={part === 'ubump' ? 1 : .5} />)}
      <rect x="101" y="171" width="316" height="21" rx="4" fill="#cb9b59" fillOpacity={part === 'intp' ? .65 : .27} stroke="#cb9b59" />
      <rect x="310" y="120" width="100" height="32" rx="5" fill="var(--fig-box)" stroke="var(--line-2)" />
      <text x="360" y="141" textAnchor="middle" fontSize="14" fill="var(--text)">{t(loc('主机逻辑', 'Host logic'))}</text>
      <path d="M173 35 V136 M198 35 V136 M222 35 V136" stroke="var(--muted)" opacity=".65" strokeWidth="2" />
      <path d="M218 42 H250" stroke="var(--text)" />
      <text x="254" y="45" fontSize="12" fill="var(--text)">TSV</text>
      <g data-hbm-path={role} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeWidth="3">
        {role === 'bist' && <>
          <path d="M148 137 H173 V62 H254 M246 57 L254 62 L246 67" stroke="var(--blue)" />
          <path d="M254 67 H198 V143 H148" stroke="var(--blue)" strokeDasharray="4 4" />
          <text x="290" y="65" fill="var(--text)" fontSize="14">BIST</text>
        </>}
        {role === 'repair' && <>
          <path d="M157 81 L166 92 M166 81 L157 92" stroke="var(--red)" />
          <path d="M173 87 H244 M236 82 L244 87 L236 92" stroke="var(--gold)" />
          <rect x="248" y="79" width="20" height="15" rx="3" stroke="var(--gold)" />
          <text x="287" y="91" fill="var(--text)" fontSize="14">{t(loc('备用行', 'Spare row'))}</text>
        </>}
        {role === 'ecc' && <>
          <path d="M249 63 H222 V181 H360 V150 M355 158 L360 150 L365 158" stroke="var(--green)" />
          <text x="360" y="100" textAnchor="middle" fill="var(--green)" fontSize="14">{t(loc('数据 + 校验位', 'Data + check bits'))}</text>
        </>}
        {role === 'access' && <>
          <path d="M117 218 L143 192 H178 V181 H198 V106 H257 M250 101 L257 106 L250 111" stroke="var(--gold)" />
          <text x="152" y="219" fill="var(--text)" fontSize="14">{t(loc('外部测试端子', 'External test contact'))}</text>
        </>}
      </g>
    </svg>
  )
}

const QUIZ = [
  { id: 'q1', prompt: loc('8 层 × 16 Gb 的容量？', 'Capacity of 8 × 16 Gb?'), options: [
    { id: 'a', text: loc('16 GB', '16 GB') },
    { id: 'b', text: loc('8 GB', '8 GB') },
    { id: 'c', text: loc('128 GB', '128 GB') },
  ], answer: 'a', explain: loc('128 Gb = 16 GB。教学示意。', '128 Gb = 16 GB. Teaching illustration.') },
  { id: 'q2', prompt: loc('1024 位 × 6.4 Gbps 的带宽？', 'Bandwidth at 1024 bits × 6.4 Gbps?'), options: [
    { id: 'a', text: loc('51.2 GB/s', '51.2 GB/s') },
    { id: 'b', text: loc('819.2 GB/s', '819.2 GB/s') },
    { id: 'c', text: loc('6.4 GB/s', '6.4 GB/s') },
  ], answer: 'b', explain: loc('位宽×速率/8=819.2。', 'width×rate/8=819.2.') },
  { id: 'q3', prompt: loc('64 位、6.4 Gbps 的 DDR 通道？', 'A 64-bit 6.4 Gbps DDR channel?'), options: [
    { id: 'a', text: loc('51.2 GB/s', '51.2 GB/s') },
    { id: 'b', text: loc('819 GB/s', '819 GB/s') },
    { id: 'c', text: loc('6.4 GB/s', '6.4 GB/s') },
  ], answer: 'a', explain: loc('HBM 靠位宽，不是靠更高的每引脚速率。', 'HBM wins on width, not on a faster pin.') },
  { id: 'q4', prompt: loc('HBM 速率比 DDR 高吗？', 'Is HBM faster per pin than DDR?'), options: [
    { id: 'a', text: loc('通常每引脚更低，靠 1024 位取胜', 'Usually slower per pin; it wins on 1024-bit width') },
    { id: 'b', text: loc('每引脚一定更快', 'Always faster per pin') },
    { id: 'c', text: loc('一样', 'The same') },
  ], answer: 'a', explain: loc('以现行公开规范为准，这里的 6.4 是教学示意。', 'Follow the current public spec; 6.4 here is a teaching number.') },
  { id: 'q5', prompt: loc('HBM 能像 DIMM 一样插拔吗？', 'Can HBM plug in like a DIMM?'), options: [
    { id: 'a', text: loc('能', 'Yes') },
    { id: 'b', text: loc('不能，它焊在中介层上', 'No; it is bonded onto an interposer') },
    { id: 'c', text: loc('只在实验室可以', 'Only in the lab') },
  ], answer: 'b', explain: loc('所以需要 2.5D。', 'That is why 2.5D is required.') },
  { id: 'q6', prompt: loc('层数越多越好吗？', 'Are more layers always better?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：热、良率和高度都会变差', 'No: heat, yield and height all get worse') },
    { id: 'c', text: loc('只影响价格标签', 'Only the price tag') },
  ], answer: 'b', explain: loc('堆叠良率见 {@apkStack}。', 'Stack yield is in {@apkStack}.') },
  { id: 'q7', prompt: loc('3.2 TB/s 需要几个 819.2 GB/s 堆栈？', 'How many 819.2 GB/s stacks for 3.2 TB/s?'), options: [
    { id: 'a', text: loc('2', '2') },
    { id: 'b', text: loc('4', '4') },
    { id: 'c', text: loc('8', '8') },
  ], answer: 'b', explain: loc('3200/819.2≈3.9，所以 4 个。这是 VDUT-APK1 的默认。', '3200/819.2≈3.9, so 4. That is the VDUT-APK1 default.') },
  { id: 'q8', prompt: loc('堆好后怎么测底层 DRAM？', 'How is lower DRAM tested after stacking?'), options: [
    { id: 'a', text: loc('直接扎微凸点', 'Probe the micro-bumps') },
    { id: 'b', text: loc('经基底 die 的测试访问 / BIST', 'Through base-die test access / BIST') },
    { id: 'c', text: loc('不用测', 'Skip it') },
  ], answer: 'b', explain: loc('呼应存储器 BIST 课 {@memBist}。', 'See the memory BIST lesson {@memBist}.'),
  },
]

export function ApkHbmPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [partId, setPartId] = useState<HbmPart>(PARTS[0].id)
  const [fixId, setFixId] = useState<HbmRole>(FIX[0].id)
  const [layers, setLayers] = useState(4)
  const [dieGb, setDieGb] = useState(8)
  const [width, setWidth] = useState(512)
  const [rate, setRate] = useState(3.2)
  const fix = FIX.find((item) => item.id === fixId) ?? FIX[0]
  const capGb = layers * dieGb
  const capGB = capGb / 8
  const bw = hbmBandwidthGBps(width, rate)
  const ddr = hbmBandwidthGBps(64, rate)
  const stacks = Math.ceil(3200 / bw)
  const capHit = useSticky(layers === 8 && dieGb === 16)
  const bwHit = useSticky(width === 1024 && near(rate, 6.4, 0.01))
  const ddrHit = useSticky(bwHit.hit)
  const stackHit = useSticky(bwHit.hit && stacks === 4)
  const [accessId, setAccessId] = useState('')
  const accessHit = useSticky(accessId === 'access')
  const taskCap = loc('把层数调到 8、单 die 调到 16 Gb，读总容量。', 'Set 8 layers and 16 Gb per die, then read the capacity.')
  const taskBw = loc('把位宽调到 1024、每引脚速率调到 6.4 Gbps，读带宽。', 'Set the width to 1024 and the per-pin rate to 6.4 Gbps, then read the bandwidth.')
  const taskDdr = loc('用同一个每引脚速率，读 64 位 DDR 的带宽，再和 HBM 比。', 'At the same per-pin rate, read a 64-bit DDR bandwidth and compare it with HBM.')
  const taskStacks = loc('沿用这条 HBM 带宽，读要几叠才到 3.2 TB/s。', 'Using that HBM bandwidth, read how many stacks reach 3.2 TB/s.')
  const taskFix = loc('堆好之后，下层 DRAM 还能怎么测？选出对应的机制。', 'After the stack is built, how can the lower DRAM still be tested? Pick the mechanism.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkHbm}
      nextId="apkInterposer"
      nextLabel={loc('下一课：中介层', 'Next: interposer')}
      later={loc('DRAM 基础见 {@memDram}；BIST 见 {@memBist}。数值以现行规范为准。', 'DRAM basics: {@memDram}; BIST: {@memBist}. Follow the current public spec.')}
      intro={[
        loc('HBM 把多层 DRAM 和一颗基底 die 叠在一起，用很宽的接口换带宽。它不能插拔，必须经中介层靠近处理器。', 'HBM stacks several DRAM dies on a base die and buys bandwidth with a very wide interface. It is not pluggable; it sits next to the processor on an interposer.'),
        loc('位宽、速率和层数都是教学示意，以现行公开规范为准。', 'Width, rate and layer count are teaching illustrations; follow the current public spec.'),
      ]}
      related={['memDram', 'memBist', 'apkInterposer']}
      kicker={COMMON.kicker}
      asideTitle={fix.title}
      asideText={fix.text}
      notice={COMMON.specNote}
      tasks={[
        { id: 't1', text: taskCap, done: capHit.hit },
        { id: 't2', text: taskBw, done: bwHit.hit },
        { id: 't3', text: taskDdr, done: ddrHit.hit },
        { id: 't4', text: taskStacks, done: stackHit.hit },
        { id: 't5', text: taskFix, done: accessHit.hit },
      ]}
      onReset={() => {
        setPartId(PARTS[0].id)
        setFixId(FIX[0].id)
        setAccessId('')
        setLayers(4)
        setDieGb(8)
        setWidth(512)
        setRate(3.2)
        capHit.reset()
        bwHit.reset()
        ddrHit.reset()
        stackHit.reset()
        accessHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('HBM 是多层 DRAM 叠在一颗基底 die 上，再经微凸点贴到中介层。点一层，看信号从哪进出。', 'HBM is DRAM dies stacked on a base die, then micro-bumped onto an interposer. Click a layer and see where the signals enter.'))}</p>
          <p>{t(loc('容量先按比特加：层数 × 单 die 的 Gb，再除以 8 得到 GB。带宽 (GB/s) = 位宽 × 每引脚 Gbps / 8。HBM 的位宽到 1024，所以同样的每引脚速率，带宽远高于 64 位 DDR。', 'Capacity adds in bits: layers × Gb per die, then divide by 8 for GB. Bandwidth (GB/s) = width × Gbps per pin / 8. HBM’s width reaches 1024, so at the same per-pin rate the bandwidth is far above a 64-bit DDR channel.'))}</p>
          <p>{t(loc('3.2 TB/s = 3200 GB/s。需要的叠数 = 向上取整(3200 / 单叠带宽)。叠数变多，热和良率都会变差。', '3.2 TB/s = 3200 GB/s. Stacks needed = ceil(3200 / one stack’s bandwidth). More stacks make heat and yield worse.'))}</p>
          <p>{t(loc('点一种测试机制。堆好之后，下面的 DRAM 焊盘被盖住，不能再直接扎针。', 'Click a test mechanism. After stacking, the lower DRAM pads are covered and cannot be probed directly.'))}</p>
          <Cards items={FIX} activeId={fixId} cols={4} onPick={(item) => setFixId(item.id)} />
          <Seg options={PARTS} value={partId} onChange={setPartId} />
          <HbmCut part={partId} role={fixId} />
          <p>{t(fix.text)}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskCap}>
            <div className="knobs">
              <Knob label={loc('层数', 'Layers')} value={layers} unit="" min={4} max={16} step={4} onChange={setLayers} />
              <Knob label={loc('单 die 容量', 'Gb / die')} value={dieGb} unit="Gb" min={8} max={16} step={8} onChange={setDieGb} />
            </div>
            <Readout items={[{ label: loc('你算出的容量', 'Capacity you got'), value: `${capGB.toFixed(0)} GB` }]} />
            <After show={capHit.hit} text={loc('8 × 16 Gb = 128 Gb = 16 GB。比特除以 8 才是字节，少除这一步会把容量看成 128 GB。', '8 × 16 Gb = 128 Gb = 16 GB. Divide bits by 8 to get bytes. Skipping that step reads the capacity as 128 GB.')} />
          </Drill>
          <Drill n={2} title={taskBw}>
            <div className="knobs">
              <Knob label={loc('位宽', 'Width')} value={width} unit="bit" min={512} max={1024} step={512} onChange={setWidth} />
              <Knob label={loc('每引脚速率', 'Gbps / pin')} value={rate} unit="Gbps" min={3.2} max={6.4} step={3.2} onChange={setRate} />
            </div>
            <Readout items={[{ label: loc('你算出的带宽', 'Bandwidth you got'), value: `${bw.toFixed(1)} GB/s` }]} />
            <After show={bwHit.hit} text={loc('1024 × 6.4 / 8 = 819.2 GB/s。除以 8 是因为带宽习惯用字节每秒，而引脚速率是比特。', '1024 × 6.4 / 8 = 819.2 GB/s. The divide-by-8 is because bandwidth is quoted in bytes per second, while the pin rate is in bits.')} />
          </Drill>
          <Drill n={3} title={taskDdr}>
            <Readout items={[
              { label: loc('64 位、同一速率', '64-bit at the same rate'), value: `${ddr.toFixed(1)} GB/s` },
              { label: loc('HBM / DDR', 'HBM / DDR'), value: ddr > 0 ? (bw / ddr).toFixed(1) : '—' },
            ]} />
            <After show={ddrHit.hit} text={loc('64 × 6.4 / 8 = 51.2 GB/s。1024/64 = 16，所以同样的每引脚速率，HBM 大约是这条 DDR 的 16 倍。快的是位宽，不是单根引脚。', '64 × 6.4 / 8 = 51.2 GB/s. 1024/64 = 16, so at the same per-pin rate HBM is about 16× that DDR channel. The speed is the width, not the single pin.')} />
          </Drill>
          <Drill n={4} title={taskStacks}>
            <Readout items={[{ label: loc('你算出的叠数', 'Stacks you got'), value: `${stacks}` }]} />
            <After show={stackHit.hit} text={loc('3200 / 819.2 ≈ 3.9，向上取整是 4 叠。少一叠到不了 3.2 TB/s，多一叠则热和良率都要再付一次。', '3200 / 819.2 ≈ 3.9, which rounds up to 4 stacks. One fewer misses 3.2 TB/s. One more pays for heat and yield again.')} />
          </Drill>
          <Drill n={5} title={taskFix}>
            <div className="mfg-assign__picks">
              {FIX.map((item) => (
                <button key={item.id} type="button" className={accessId === item.id ? 'is-active' : ''} onClick={() => setAccessId(item.id)}>{t(item.title)}</button>
              ))}
            </div>
            <After show={accessId !== ''} text={accessId === 'access'
              ? loc('堆好之后下层焊盘被盖住，只能经基底 die 的测试访问进去。BIST 和 ECC 是自检和纠错，不能代替这条访问路径。', 'After stacking, the lower pads are covered. Test gets in only through the base die’s access path. BIST and ECC are self-test and correction; they do not replace that path.')
              : loc('再看“堆好之后针还扎不扎得到”。BIST 和 ECC 不解决扎针，测试访问才是。', 'Ask again whether a probe can still land after stacking. BIST and ECC do not solve that. Test access does.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('HBM 每引脚比 DDR 快。通常更慢，靠位宽取胜。', 'HBM is not faster per pin than DDR. It is usually slower and wins on width.'),
        loc('HBM 可以像 DIMM 一样插拔。它焊在中介层上。', 'HBM is not a DIMM. It is bonded on an interposer.'),
        loc('层数越多越好。热和良率会一起变差。', 'More layers are not always better. Heat and yield get worse together.'),
      ]}
      takeaway={[
        loc('带宽(GB/s)=位宽×Gbps/8；容量=单 die×层数。', 'BW (GB/s)=width×Gbps/8; capacity = die × layers.'),
        loc('堆好后只能经基底 die 测试，所以 KGS 很关键。', 'After stacking, test goes through the base die, so KGS matters.'),
      ]}
      quiz={QUIZ}
    />
  )
}
