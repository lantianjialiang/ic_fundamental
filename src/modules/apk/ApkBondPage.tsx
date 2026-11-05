import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { energyPerBitPj, ioDensityPerMm2 } from './core'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const KINDS = [
  { id: 'wb', title: loc('引线键合', 'Wire bond'), pitch: 120, text: loc('周边、节距大、电感大。', 'Peripheral, coarse pitch, large inductance.') },
  { id: 'c4', title: loc('C4 凸点', 'C4 bump'), pitch: 130, text: loc('面阵倒装，节距约 100–150 µm。', 'Area-array flip-chip, about 100–150 µm pitch.') },
  { id: 'ub', title: loc('微凸点', 'Micro-bump'), pitch: 45, text: loc('中介层/堆叠用，约 25–55 µm。', 'For interposers and stacks, about 25–55 µm.') },
  { id: 'hb', title: loc('混合键合', 'Hybrid bond'), pitch: 10, text: loc('Cu-Cu 直接键合，不是更细的焊料凸点。', 'Cu-Cu direct bond, not a finer solder bump.') },
]

const APPS = [
  { id: 'io', title: loc('普通 I/O', 'Commodity I/O'), want: 'wb' },
  { id: 'hbm', title: loc('HBM 贴中介层', 'HBM on interposer'), want: 'ub' },
  { id: '3d', title: loc('逻辑 3D 堆叠', 'Logic 3D stack'), want: 'hb' },
]

const QUIZ = [
  { id: 'q1', prompt: loc('45 µm 微凸点密度？', 'Micro-bump density at 45 µm?'), options: [
    { id: 'a', text: loc('约 494 /mm²', 'About 494 /mm²') },
    { id: 'b', text: loc('45 /mm²', '45 /mm²') },
    { id: 'c', text: loc('10000 /mm²', '10000 /mm²') },
  ], answer: 'a', explain: loc('(1000/45)²≈493.8。', '(1000/45)²≈493.8.') },
  { id: 'q2', prompt: loc('10 µm 混合键合密度？', 'Hybrid-bond density at 10 µm?'), options: [
    { id: 'a', text: loc('100 /mm²', '100 /mm²') },
    { id: 'b', text: loc('10000 /mm²', '10000 /mm²') },
    { id: 'c', text: loc('10 /mm²', '10 /mm²') },
  ], answer: 'b', explain: loc('(1000/10)²=10000，大约是 45 µm 的 20 倍。', '(1000/10)²=10000, about 20× a 45 µm bump.') },
  { id: 'q3', prompt: loc('C=0.5 pF、V=0.8 V、α=0.5 的 E_bit？', 'E_bit at C=0.5 pF, V=0.8 V, α=0.5?'), options: [
    { id: 'a', text: loc('0.16 pJ/bit', '0.16 pJ/bit') },
    { id: 'b', text: loc('0.5 pJ/bit', '0.5 pJ/bit') },
    { id: 'c', text: loc('1.6 pJ/bit', '1.6 pJ/bit') },
  ], answer: 'a', explain: loc('αCV²=0.5×0.5×0.64=0.16 pJ。教学简化。', 'αCV²=0.5×0.5×0.64=0.16 pJ. Teaching simplification.') },
  { id: 'q4', prompt: loc('混合键合是更细的凸点吗？', 'Is hybrid bonding just a finer bump?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：没有焊料，是 Cu-Cu + 介质键合', 'No: no solder; it is Cu-Cu plus dielectric bond') },
    { id: 'c', text: loc('就是引线键合', 'It is wire bond') },
  ], answer: 'b', explain: loc('对准、平整度和清洁度要求高得多。', 'Alignment, planarity and cleanliness are much tighter.') },
  { id: 'q5', prompt: loc('节距缩小只带来好处吗？', 'Does a finer pitch only help?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：对准、良率和探针接触都更难', 'No: alignment, yield and probe access all get harder') },
    { id: 'c', text: loc('只影响外观', 'Only cosmetics') },
  ], answer: 'b', explain: loc('越细越难直接扎针，要靠测试焊盘。', 'Finer pitch is harder to probe; you need test pads.') },
  { id: 'q6', prompt: loc('能耗只跟距离有关吗？', 'Is energy only a function of distance?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是，还跟 C、V 和活动因子有关', 'No; C, V and activity also matter') },
    { id: 'c', text: loc('只跟材料有关', 'Only the material') },
  ], answer: 'b', explain: loc('E≈αCV²。降电压往往比缩短一点走线更有效。', 'E≈αCV². Voltage often beats a slightly shorter trace.') },
  { id: 'q7', prompt: loc('C4 和微凸点的典型用途？', 'Typical use of C4 vs micro-bump?'), options: [
    { id: 'a', text: loc('C4 上基板，微凸点上中介层/堆叠', 'C4 onto the substrate; micro-bumps onto interposer / stack') },
    { id: 'b', text: loc('完全可互换', 'Fully interchangeable') },
    { id: 'c', text: loc('微凸点只用于引线', 'Micro-bumps are only for wires') },
  ], answer: 'a', explain: loc('节距差了一个数量级。', 'Pitch differs by about an order of magnitude.') },
  { id: 'q8', prompt: loc('HBM 贴中介层该用哪种互连？', 'Which interconnect for HBM on an interposer?'), options: [
    { id: 'a', text: loc('引线键合', 'Wire bond') },
    { id: 'b', text: loc('微凸点', 'Micro-bump') },
    { id: 'c', text: loc('板级连接器', 'A board connector') },
  ], answer: 'b', explain: loc('需要高密度面阵，引线键合做不到。', 'It needs a dense area array; wire bond cannot.'),
  },
]

export function ApkBondPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [tryId, setTryId] = useState('')
  const [cPf, setCPf] = useState(0.8)
  const [v, setV] = useState(1)
  const [act, setAct] = useState(0.3)
  const [picked, setPicked] = useState<Partial<Record<string, string>>>({})
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const tried = KINDS.find((item) => item.id === tryId)
  const dens = ioDensityPerMm2((tried ?? kind).pitch)
  const ebit = energyPerBitPj(cPf, v, act)
  const ubHit = useSticky(tryId === 'ub')
  const hbHit = useSticky(tryId === 'hb')
  const eHit = useSticky(near(cPf, 0.5, 0.01) && near(v, 0.8, 0.01) && near(act, 0.5, 0.01))
  const matchHit = useSticky(APPS.every((app) => picked[app.id] === app.want))
  const taskUb = loc('选出微凸点，读它的面密度。', 'Pick the micro-bump and read its area density.')
  const taskHb = loc('再选出混合键合，读密度，并读它和凸点差在哪。', 'Then pick hybrid bonding, read the density, and read how it differs from a bump.')
  const taskE = loc('把 C 调到 0.5 pF、V 调到 0.8、活动因子调到 0.5，读每位能量。', 'Set C to 0.5 pF, V to 0.8 and activity to 0.5, then read the energy per bit.')
  const taskApp = loc('给三个应用各选一种互连。每一行都留着你的选择。', 'Pick an interconnect for each of the three uses. Every row keeps your choice.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkBond}
      nextId="apkTsv"
      nextLabel={loc('下一课：TSV', 'Next: TSVs')}
      later={loc('组装流程基础见 {@mfgAssembly}；探测难点见 {@apkFlow}。', 'Assembly basics: {@mfgAssembly}; probe limits: {@apkFlow}.')}
      intro={[
        loc('互连从周边焊线走到面阵 C4、微凸点，再到没有焊料的混合键合。密度按 (1000/节距)² 算，能耗按 αCV² 估算。', 'Interconnect moved from peripheral wires to C4, micro-bumps, then solder-less hybrid bonding. Density is (1000/pitch)²; energy is estimated as αCV².'),
        loc('节距越小，带宽密度越高，探针越难扎。', 'Finer pitch raises bandwidth density and makes probing harder.'),
      ]}
      related={['mfgAssembly', 'apkFlow', 'apkTsv']}
      kicker={COMMON.kicker}
      asideTitle={kind.title}
      asideText={kind.text}
      tasks={[
        { id: 't1', text: taskUb, done: ubHit.hit },
        { id: 't2', text: taskHb, done: hbHit.hit },
        { id: 't3', text: taskE, done: eHit.hit },
        { id: 't4', text: taskApp, done: matchHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setTryId('')
        setCPf(0.8)
        setV(1)
        setAct(0.3)
        setPicked({})
        ubHit.reset()
        hbHit.reset()
        eHit.reset()
        matchHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('四种互连。点一种，读它用焊线、焊料还是铜对铜。', 'Four interconnects. Click one and read whether it uses a wire, solder or copper-to-copper.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={4} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <p>{t(loc('面密度 = (1000 / 节距)²，节距用 µm，密度是每平方毫米多少个接点。节距缩小到 1/2，密度变成 4 倍。', 'Area density = (1000 / pitch)², with pitch in µm and density in contacts per square millimetre. Halving the pitch multiplies density by 4.'))}</p>
          <p>{t(loc('每位能量 ≈ α × C × V²。C 是这一位要充的电容，V 是摆幅，α 是它翻转的比例。降电压比把线再缩短一点更有效。', 'Energy per bit ≈ α × C × V². C is the capacitance that bit charges, V is the swing, and α is how often it toggles. Dropping voltage beats shortening the wire a little more.'))}</p>
          <p>{t(loc('混合键合没有焊料，是铜和介质直接贴上。它不是“更细的凸点”。对准、平整和清洁都更苛刻，探针也更难扎。', 'Hybrid bonding has no solder. Copper and dielectric bond directly. It is not a finer bump. Alignment, flatness and cleanliness are tighter, and a probe is harder to land.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskUb}>
            <div className="mfg-assign__picks">
              {KINDS.map((item) => (
                <button key={item.id} type="button" className={tryId === item.id ? 'is-active' : ''} onClick={() => setTryId(item.id)}>{t(item.title)}</button>
              ))}
            </div>
            <Readout items={[{ label: loc('你算出的密度', 'Density you got'), value: tried ? `${dens.toFixed(1)} /mm²` : '—' }]} />
            <After show={ubHit.hit} text={loc('微凸点节距 45 µm。(1000/45)² ≈ 494 /mm²。这是中介层和堆叠用的面阵密度。', 'Micro-bump pitch is 45 µm. (1000/45)² ≈ 494 /mm². That is the area-array density used on an interposer or a stack.')} />
          </Drill>
          <Drill n={2} title={taskHb}>
            <p>{t(loc('用上面同一排按钮改选。', 'Change the choice with the same row of buttons.'))}</p>
            <Readout items={[{ label: loc('你算出的密度', 'Density you got'), value: tried ? `${dens.toFixed(1)} /mm²` : '—' }]} />
            <After show={hbHit.hit} text={loc('混合键合节距 10 µm，(1000/10)² = 10000 /mm²。它没有焊料，密度大约是 45 µm 微凸点的 20 倍，探针更扎不进去。', 'Hybrid-bond pitch is 10 µm, and (1000/10)² = 10000 /mm². There is no solder. Density is about 20× a 45 µm micro-bump, and a probe has even less room to land.')} />
          </Drill>
          <Drill n={3} title={taskE}>
            <div className="knobs">
              <Knob label={loc('C', 'C')} value={cPf} unit="pF" min={0.2} max={1} step={0.1} onChange={setCPf} />
              <Knob label={loc('V', 'V')} value={v} unit="V" min={0.6} max={1.2} step={0.2} onChange={setV} />
              <Knob label={loc('活动因子 α', 'Activity α')} value={act} unit="" min={0.1} max={0.5} step={0.1} onChange={setAct} />
            </div>
            <Readout items={[{ label: loc('你算出的每位能量', 'Energy per bit you got'), value: `${ebit.toFixed(3)} pJ` }]} />
            <After show={eHit.hit} text={loc('0.5 × 0.5 pF × 0.8² = 0.16 pJ/bit。电压在平方里，从 1 V 降到 0.8 V，能量掉得比电容按比例降更多。', '0.5 × 0.5 pF × 0.8² = 0.16 pJ/bit. Voltage is squared, so going from 1 V to 0.8 V cuts energy by more than the same fraction of capacitance.')} />
          </Drill>
          <Drill n={4} title={taskApp}>
            {APPS.map((app) => {
              const choice = picked[app.id]
              const right = choice === app.want
              return (
                <div className="mfg-assign" key={app.id}>
                  <b>{t(app.title)}</b>
                  <div className="mfg-assign__picks">
                    {KINDS.map((item) => (
                      <button key={item.id} type="button" className={choice === item.id ? 'is-active' : ''} onClick={() => setPicked((prev) => ({ ...prev, [app.id]: item.id }))}>
                        {t(item.title)}
                      </button>
                    ))}
                  </div>
                  <p>{t(choice ? (right ? loc('这一行和用途对得上。', 'This row matches the use.') : loc('再看节距。普通 I/O 用焊线，HBM 要面阵微凸点，逻辑堆叠才用到混合键合。', 'Look at the pitch again. Commodity I/O uses wires, HBM wants micro-bumps, and a logic stack is where hybrid bonding shows up.')) : loc('还没选。', 'Not chosen yet.'))}</p>
                </div>
              )
            })}
          </Drill>
        </div>
      }
      misconceptions={[
        loc('节距缩小只带来好处。对准、良率和探针都会更难。', 'A finer pitch is not only upside. Alignment, yield and probing get harder.'),
        loc('混合键合就是更细的凸点。它没有焊料。', 'Hybrid bonding is not a finer bump. There is no solder.'),
        loc('能耗只跟距离有关。C 和 V 往往更关键。', 'Energy is not distance-only. C and V often dominate.'),
      ]}
      takeaway={[
        loc('密度=(1000/pitch)²；E_bit≈αCV²。', 'Density=(1000/pitch)²; E_bit≈αCV².'),
        loc('越细越难直接探测，测试访问要提前设计。', 'Finer pitch is harder to probe; test access must be designed in.'),
      ]}
      quiz={QUIZ}
    />
  )
}
