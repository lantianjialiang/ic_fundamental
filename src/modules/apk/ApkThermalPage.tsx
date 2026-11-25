import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { currentDensityAPerM2, layerStackRth } from './core'
import { After, COMMON, Drill, PackLesson, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const LAYERS = [
  { id: 'si', title: loc('硅', 'Silicon'), k: 150, color: '#65accb', text: loc('硅的导热系数高，温降通常较小。', 'Silicon has high thermal conductivity and typically a small temperature drop.') },
  { id: 'uf', title: loc('填充 / 键合', 'Underfill / bond'), k: 1, color: '#cf9f65', text: loc('填充或键合改变材料和厚度。比较这一层和 TIM 的温降。', 'The underfill or bond changes both material and thickness. Compare its drop with the drop across the TIM.') },
  { id: 'tim', title: loc('TIM', 'TIM'), k: 5, color: '#75bba3', text: loc('导热界面材料把热送到盖板一侧。', 'The thermal interface material carries heat to the lid side.') },
] as const
const AREA_M2 = 1e-4

const QUIZ = [
  { id: 'q1', prompt: loc('50 µm 硅、150 W/(m·K)、100 mm² 的 Rth？', 'Rth of 50 µm Si, 150 W/(m·K), 100 mm²?'), options: [
    { id: 'a', text: loc('3.33 mK/W', '3.33 mK/W') },
    { id: 'b', text: loc('3.33 K/W', '3.33 K/W') },
    { id: 'c', text: loc('150 K/W', '150 K/W') },
  ], answer: 'a', explain: loc('t/(kA)=50e-6/(150×1e-4)=3.33e-3。', 't/(kA)=50e-6/(150×1e-4)=3.33e-3.') },
  { id: 'q2', prompt: loc('20 µm 底部填充、1 W/(m·K)、100 mm²？', '20 µm underfill, 1 W/(m·K), 100 mm²?'), options: [
    { id: 'a', text: loc('0.2 K/W，约硅层的 60 倍', '0.2 K/W, about 60× the silicon layer') },
    { id: 'b', text: loc('和硅一样', 'Same as silicon') },
    { id: 'c', text: loc('可忽略', 'Negligible') },
  ], answer: 'a', explain: loc('20e-6/(1×1e-4)=0.2。硅导热好，堆叠不怕热是错的。', '20e-6/(1×1e-4)=0.2. “Silicon conducts, so stacks stay cool” is wrong.') },
  { id: 'q3', prompt: loc('10 mA 通过直径 25 µm 微凸点的电流密度？', 'Current density of 10 mA through a 25 µm micro-bump?'), options: [
    { id: 'a', text: loc('约 2.04×10⁷ A/m²', 'About 2.04×10⁷ A/m²') },
    { id: 'b', text: loc('10 A/m²', '10 A/m²') },
    { id: 'c', text: loc('0', '0') },
  ], answer: 'a', explain: loc('J=I/(πr²)，呼应电迁移 {@relAccel}。', 'J=I/(πr²); electromigration: {@relAccel}.') },
  { id: 'q4', prompt: loc('硅导热好，堆叠就不怕热吗？', 'Does good silicon conduction make stacks thermally safe?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：键合/底部填充层才是瓶颈', 'No: the bond / underfill layer is the bottleneck') },
    { id: 'c', text: loc('只跟风扇有关', 'Only the fan') },
  ], answer: 'b', explain: loc('混合键合减薄键合层，热会好一些。', 'Hybrid bonding thins the bond layer and helps heat.') },
  { id: 'q5', prompt: loc('翘曲只影响外观吗？', 'Is warpage only cosmetic?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：凸点开裂、分层、共面性失败', 'No: bump cracks, delam, coplanarity fails') },
    { id: 'c', text: loc('只在陶瓷上发生', 'Only on ceramic') },
  ], answer: 'b', explain: loc('CTE 失配是根因。', 'CTE mismatch is the root.') },
  { id: 'q6', prompt: loc('电迁移只发生在芯片内部吗？', 'Is electromigration only inside the die?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：微凸点和 TSV 同样有电流密度限制', 'No: micro-bumps and TSVs have current-density limits too') },
    { id: 'c', text: loc('只在铝线', 'Only aluminum') },
  ], answer: 'b', explain: loc('封装级也要算 J。', 'Package-level J must be counted.') },
  { id: 'q7', prompt: loc('测试时为什么要热控？', 'Why thermal control during test?'), options: [
    { id: 'a', text: loc('功耗高，温度会漂参数和良率判定', 'Power is high; temperature shifts parameters and yield calls') },
    { id: 'b', text: loc('机台怕冷', 'The tester dislikes cold') },
    { id: 'c', text: loc('只为了安静', 'Only for quiet') },
  ], answer: 'a', explain: loc('三温见 {@relAuto}。', 'Three-temperature test: {@relAuto}.') },
  { id: 'q8', prompt: loc('一维热阻网络怎么串？', 'How do 1-D thermal resistances combine?'), options: [
    { id: 'a', text: loc('各层 Rth=t/(kA) 相加', 'Add each layer Rth=t/(kA)') },
    { id: 'b', text: loc('只取最小的一层', 'Keep only the smallest layer') },
    { id: 'c', text: loc('相乘', 'Multiply them') },
  ], answer: 'a', explain: loc('结到环境的温升 ≈ P·ΣRth。', 'Junction-to-ambient rise ≈ P·ΣRth.'),
  },
]

export function ApkThermalPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [layerId, setLayerId] = useState<(typeof LAYERS)[number]['id']>(LAYERS[0].id)
  const [siUm, setSiUm] = useState(80)
  const [tUf, setTUf] = useState(40)
  const [hybrid, setHybrid] = useState(false)
  const [power, setPower] = useState(80)
  const [tamb, setTamb] = useState(25)
  const [cur, setCur] = useState(5)
  const layer = LAYERS.find((item) => item.id === layerId) ?? LAYERS[0]
  const materials = LAYERS.map((item, index) => ({
    ...item,
    thicknessUm: [siUm, hybrid ? 2 : tUf, 100][index],
    kWmK: item.id === 'uf' && hybrid ? 2 : item.k,
  }))
  const stack = layerStackRth(materials.map(({ thicknessUm, kWmK }) => ({ thicknessM: thicknessUm * 1e-6, kWmK, areaM2: AREA_M2 })))
  const tj = tamb + power * stack.total
  const j = currentDensityAPerM2(cur * 1e-3, 12.5e-6)
  const [rSi, rUf] = stack.perLayer
  const selectedIndex = materials.findIndex((item) => item.id === layerId)
  const selected = materials[selectedIndex]
  const selectedRth = stack.perLayer[selectedIndex]
  const siHit = useSticky(siUm === 50)
  const ufHit = useSticky(!hybrid && tUf === 20)
  const pHit = useSticky(power !== 80)
  const hyHit = useSticky(hybrid)
  const jHit = useSticky(cur === 10)
  const taskSi = loc('把硅厚调到 50 µm，读这一层的热阻。', 'Set the silicon thickness to 50 µm and read that layer’s thermal resistance.')
  const taskUf = loc('保持普通底部填充，把厚度调到 20 µm，读它的热阻。', 'Keep ordinary underfill, set the thickness to 20 µm, and read its thermal resistance.')
  const taskP = loc('改一下功率，读结温怎样跟着变。', 'Change the power and read how the junction temperature follows.')
  const taskHy = loc('打开混合键合，读键合层热阻怎样变。', 'Turn on hybrid bonding and read how the bond-layer thermal resistance changes.')
  const taskJ = loc('把微凸点电流调到 10 mA，读电流密度。', 'Set the micro-bump current to 10 mA and read the current density.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkThermal}
      nextId="apkFlow"
      nextLabel={loc('下一课：先进封装测试综合', 'Next: advanced-package test capstone')}
      later={loc('电迁移见 {@relAccel}；封装试验见 {@relStress}；三温见 {@relAuto}。', 'Electromigration: {@relAccel}; package stresses: {@relStress}; three-temp: {@relAuto}.')}
      intro={[
        loc('一维热阻 Rth=t/(kA) 各层相加。硅导热好，真正的瓶颈常常是底部填充或键合层。CTE 失配带来翘曲和凸点疲劳。', '1-D Rth=t/(kA) adds layer by layer. Silicon conducts well; the bottleneck is often underfill or the bond film. CTE mismatch brings warpage and bump fatigue.'),
        loc('电流密度 J=I/A，微凸点同样有电迁移风险。', 'Current density J=I/A; micro-bumps have electromigration risk too.'),
      ]}
      related={['relAccel', 'relStress', 'relAuto']}
      kicker={COMMON.kicker}
      asideTitle={layer.title}
      asideText={layer.text}
      tasks={[
        { id: 't1', text: taskSi, done: siHit.hit },
        { id: 't2', text: taskUf, done: ufHit.hit },
        { id: 't3', text: taskP, done: pHit.hit },
        { id: 't4', text: taskHy, done: hyHit.hit },
        { id: 't5', text: taskJ, done: jHit.hit },
      ]}
      onReset={() => {
        setLayerId(LAYERS[0].id)
        setSiUm(80)
        setTUf(40)
        setHybrid(false)
        setPower(80)
        setTamb(25)
        setCur(5)
        siHit.reset()
        ufHit.reset()
        pHit.reset()
        hyHit.reset()
        jHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('热从结到环境要穿过好几层。点一层，读它厚不厚、导不导热。', 'Heat from the junction to the air crosses several layers. Click one and read whether it is thick and whether it conducts.'))}</p>
          <Cards items={LAYERS} activeId={layerId} cols={3} onPick={(item) => setLayerId(item.id)} />
          <figure className="term-fig">
            <svg className="term-fig__svg" viewBox="0 0 428 249" role="img" aria-label={t(loc('从结到盖板的逐层热流和温降', 'Heat flow and temperature drops from junction to lid'))}>
              <rect width="428" height="249" rx="10" fill="var(--well)" />
              <rect x="43" y="35" width="151" height="17" rx="3" fill="var(--fig-box)" stroke="var(--line-2)" />
              <rect x="43" y="200" width="151" height="14" rx="3" fill="#d96c61" fillOpacity=".65" />
              <g fill="var(--text)" fontSize="14">
                <text x="45" y="25">{t(loc('盖板侧边界', 'Lid-side boundary'))} · {tamb} °C</text>
                <text x="45" y="234">{t(loc('结温', 'Junction'))} · {tj.toFixed(1)} °C</text>
                <text x="246" y="34">{t(loc('各层温降', 'Drop across each layer'))}</text>
              </g>
              {materials.map((item, index) => {
                const y = 151 - index * 48
                const fraction = stack.perLayer[index] / stack.total
                const title = item.id === 'uf' && hybrid ? loc('混合键合', 'Hybrid bond') : item.title
                return <g key={item.id} data-thermal-layer={item.id} data-thermal-selected={layerId === item.id} data-thermal-drop={power * stack.perLayer[index]}>
                  <rect x="43" y={y} width="151" height="45" rx="4" fill={item.color} fillOpacity={layerId === item.id ? '.86' : '.38'}
                    stroke={layerId === item.id ? 'var(--text)' : item.color} strokeWidth={layerId === item.id ? 2 : 1} />
                  <text x="57" y={y + 20} fill={layerId === item.id ? '#112432' : 'var(--text)'} fontSize="14">{t(title)}</text>
                  <text x="57" y={y + 36} fill={layerId === item.id ? '#112432' : 'var(--text)'} fontSize="12">{item.thicknessUm} µm</text>
                  <rect x="246" y={y + 18} width="157" height="9" rx="4" fill="var(--fig-box)" stroke="var(--line-2)" />
                  <rect x="246" y={y + 18} width={fraction * 157} height="9" rx="4" fill={item.color} />
                  <text x="246" y={y + 13} fill="var(--text)" fontSize="14">{(power * stack.perLayer[index]).toFixed(2)} K</text>
                </g>
              })}
              <path d="M213 204 V54 M206 65 L213 54 L220 65" stroke="var(--gold)" strokeWidth="4" fill="none" />
              <text x="221" y="218" fill="var(--gold)" fontSize="13">P = {power} W</text>
            </svg>
            <figcaption>{t(loc('箭头为热流方向。条长表示该层占总温降的比例。材料厚度按示意绘制，模型取一维稳态导热和等面积，并把盖板侧设为环境温度。',
              'The arrow shows heat flow. Bar length is the layer’s share of the total drop. Layer thicknesses are schematic. The model assumes one-dimensional steady conduction, equal areas and a lid-side boundary at ambient temperature.'))}</figcaption>
            <Readout items={[
              { label: selected.title, value: t(selected.text) },
              { label: loc('按 SI 单位代入单层热阻', 'Substitute SI units into layer resistance'),
                value: `Rθ = t/(kA) = (${selected.thicknessUm} × 10⁻⁶ m) / (${selected.kWmK} W/(m·K) × 10⁻⁴ m²) ≈ ${selectedRth.toFixed(4)} K/W` },
              { label: loc('该层承受的温降', 'Temperature drop across this layer'),
                value: `ΔT = P × Rθ ≈ ${power} W × ${selectedRth.toFixed(4)} K/W ≈ ${(power * selectedRth).toFixed(2)} K` },
            ]} />
          </figure>
          <p>{t(loc('一层的热阻 Rth = 厚度 / (导热系数 × 面积)。这一课面积用 1 cm²。各层热阻相加，温升 ≈ 功率 × 总热阻。硅的导热系数按 150 W/(m·K)，底部填充按 1，混合键合那一层按 2，而且更薄。', 'One layer’s thermal resistance Rth = thickness / (conductivity × area). This lesson uses 1 cm². The layers add, and the temperature rise ≈ power × total Rth. Silicon is taken as 150 W/(m·K), underfill as 1, and the hybrid-bond film as 2, and thinner.'))}</p>
          <p>{t(loc('电流密度 J = I / (π r²)。微凸点半径这一课用 12.5 µm。电流挤在这么小的截面里，电迁移和芯片内部是同一类问题。', 'Current density J = I / (π r²). This lesson uses a 12.5 µm bump radius. Current crowded into that small section is the same kind of electromigration problem as inside the chip.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskSi}>
            <Knob label={loc('硅厚', 'Silicon thickness')} value={siUm} unit="µm" min={20} max={80} step={10} onChange={setSiUm} />
            <Readout items={[{ label: loc('你算出的硅热阻', 'Silicon Rth you got'), value: `${(rSi * 1000).toFixed(2)} mK/W` }]} />
            <After show={siHit.hit} text={loc('50 µm / (150 × 1 cm²) = 3.33 mK/W。硅很会导热，这一层往往不是瓶颈。', '50 µm / (150 × 1 cm²) = 3.33 mK/W. Silicon conducts well, so this layer is rarely the bottleneck.')} />
          </Drill>
          <Drill n={2} title={taskUf}>
            <Knob label={loc('填充厚度', 'UF thickness')} value={tUf} unit="µm" min={10} max={40} step={10} onChange={setTUf} />
            <Readout items={[{ label: loc('你算出的填充热阻', 'Underfill Rth you got'), value: `${rUf.toFixed(3)} K/W` }]} />
            <After show={ufHit.hit} text={loc('20 µm、导热系数 1、面积 1 cm²，热阻是 0.2 K/W。硅只有 3.33 mK/W，填充大约是它的 60 倍。热卡在填充，不卡在硅。', '20 µm, conductivity 1, area 1 cm²: the thermal resistance is 0.2 K/W. Silicon is only 3.33 mK/W, so the underfill is about 60× larger. Heat is stuck in the underfill, not in the silicon.')} />
          </Drill>
          <Drill n={3} title={taskP}>
            <div className="knobs">
              <Knob label={loc('功率', 'Power')} value={power} unit="W" min={40} max={160} step={20} onChange={setPower} />
              <Knob label={loc('环境温度', 'Ambient')} value={tamb} unit="°C" min={25} max={85} step={10} onChange={setTamb} />
            </div>
            <Readout items={[
              { label: loc('总热阻', 'Total Rth'), value: `${stack.total.toFixed(3)} K/W` },
              { label: loc('结温', 'Junction'), value: `${tj.toFixed(1)} °C` },
            ]} />
            <After show={pHit.hit} text={loc('结温 = 环境温度 + 功率 × 总热阻。功率翻倍，高出环境的那一段也翻倍。总热阻里大头是填充和界面，不是硅。', 'Junction temperature = ambient + power × total Rth. Double the power and the rise above ambient doubles. Most of the total is underfill and interfaces, not silicon.')} />
          </Drill>
          <Drill n={4} title={taskHy}>
            <label>
              <input type="checkbox" checked={hybrid} onChange={(event) => setHybrid(event.target.checked)} />
              {t(loc('键合层改为混合键合', 'Switch the bond layer to hybrid bonding'))}
            </label>
            <Readout items={[{ label: loc('键合层热阻', 'Bond-layer Rth'), value: `${rUf.toFixed(4)} K/W` }]} />
            <After show={hyHit.hit} text={loc('混合键合把这一层改成更薄、导热更好，热阻掉下来。它同时把节距做细，所以热和密度是一起改善的。', 'Hybrid bonding makes this layer thinner and a better conductor, so its thermal resistance drops. It also shrinks the pitch, so heat and density improve together.')} />
          </Drill>
          <Drill n={5} title={taskJ}>
            <Knob label={loc('微凸点电流', 'Bump current')} value={cur} unit="mA" min={5} max={15} step={5} onChange={setCur} />
            <Readout items={[{ label: loc('你算出的电流密度', 'Current density you got'), value: j.toExponential(2) }]} />
            <After show={jHit.hit} text={loc('10 mA 挤进半径 12.5 µm 的截面，J = 0.01 / (π × (12.5 µm)²) ≈ 2.04×10⁷ A/m²。这个量级已经要按电迁移来看寿命，不能当成“封装上的电流无所谓”。', '10 mA crowded into a 12.5 µm radius gives J = 0.01 / (π × (12.5 µm)²) ≈ 2.04×10⁷ A/m². That magnitude has to be treated as electromigration life, not as “current in the package does not matter”.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('硅导热好所以堆叠不怕热。键合层才是瓶颈。', 'Good silicon conduction does not make a stack thermally safe. The bond layer is the bottleneck.'),
        loc('翘曲只影响外观。它会让凸点开裂。', 'Warpage is not cosmetic. It cracks bumps.'),
        loc('电迁移只发生在芯片内部。微凸点同样有 J 限制。', 'Electromigration is not die-only. Micro-bumps have a J limit too.'),
      ]}
      takeaway={[
        loc('Rth=t/(kA)，各层串联；温升 ≈ P·ΣRth。', 'Rth=t/(kA), layers in series; rise ≈ P·ΣRth.'),
        loc('混合键合减薄键合层，热和节距一起改善。', 'Hybrid bonding thins the bond layer and helps both heat and pitch.'),
      ]}
      quiz={QUIZ}
    />
  )
}
