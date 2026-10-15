import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { KN, LAMBDA, VTN, nId, nRegion, rOn } from '../model'

const REGION_OPTIONS: QuizQuestion['options'] = [
  { id: 'cutoff', text: loc('截止区', 'Cutoff') },
  { id: 'linear', text: loc('线性区', 'Linear region') },
  { id: 'sat', text: loc('饱和区', 'Saturation') },
]

// 答案由模型的 nRegion 算出，不手写
const judge = (id: string, vgs: number, vds: number, explain: () => QuizQuestion['explain']): QuizQuestion => ({
  id,
  prompt: loc(
    `NMOS（Vth = ${VTN} V）：Vgs = ${vgs} V，Vds = ${vds} V，工作在哪个区？`,
    `NMOS (Vth = ${VTN} V): Vgs = ${vgs} V, Vds = ${vds} V. Which region is it in?`,
  ),
  options: REGION_OPTIONS,
  answer: nRegion(vgs, vds),
  explain: explain(),
})

const r1 = rOn(VTN + 1)
const i1 = nId(VTN + 1.3, 2)
const i2 = nId(VTN + 1.3, 3)
const rise = ((i2 / i1 - 1) * 100).toFixed(0)
const lamPct = (LAMBDA * 100).toFixed(0)

export const QUIZ: QuizQuestion[] = [
  judge('q1', 0.5, 2, () =>
    loc(
      `Vgs = 0.5 V 小于 Vth = ${VTN} V，Vov < 0，栅下还没有电子沟道，Vds 再大也没有电流，所以是截止区。很多人看到 Vds 很大就以为管子在导通，其实第一步要先看 Vgs。`,
      `Vgs = 0.5 V is below Vth = ${VTN} V, so Vov < 0 and there is no electron channel under the gate; however large Vds is, there is no current, so it is cutoff. Many people see a big Vds and assume it conducts, but the first check is Vgs.`,
    ),
  ),
  judge('q2', 2, 0.5, () =>
    loc(
      `Vov = 2 − ${VTN} = 1.3 V，Vds = 0.5 V 小于 Vov，沟道从源通到漏而没有夹断，是线性区。`,
      `Vov = 2 − ${VTN} = 1.3 V and Vds = 0.5 V is below Vov: the channel runs from source to drain with no pinch-off, so it is the linear region.`,
    ),
  ),
  judge('q3', 2, 2, () =>
    loc(
      `Vov = 2 − ${VTN} = 1.3 V，Vds = 2 V 不小于 Vov，漏端的栅极压差 Vgs − Vds = 0 V 已低于 Vth，沟道在漏端被夹断，是饱和区。夹断不等于没有电流，电子仍被漏极电场扫过去。`,
      `Vov = 2 − ${VTN} = 1.3 V and Vds = 2 V is not below Vov: at the drain end Vgs − Vds = 0 V is below Vth, so the channel pinches off there and it is saturation. Pinch-off does not mean no current; electrons are still swept to the drain.`,
    ),
  ),
  {
    id: 'q4',
    prompt: loc(
      `NMOS 工作在线性区、Vds 很小，Vgs = ${VTN + 1} V（Vov = 1 V），k = ${KN * 1000} mA/V²。它的等效电阻大约是多少？`,
      `An NMOS in the linear region with small Vds, Vgs = ${VTN + 1} V (Vov = 1 V), k = ${KN * 1000} mA/V². About what equivalent resistance does it show?`,
    ),
    options: [
      { id: 'a', text: loc(`${Math.round(r1 / 10)} Ω`, `${Math.round(r1 / 10)} Ω`) },
      { id: 'b', text: loc(`${Math.round(r1)} Ω`, `${Math.round(r1)} Ω`) },
      { id: 'c', text: loc(`${Math.round(r1 * 10)} Ω`, `${Math.round(r1 * 10)} Ω`) },
    ],
    answer: 'b',
    explain: loc(
      `R = 1/(k·Vov) = 1/(${KN * 1000} mA/V² × 1 V) = ${Math.round(r1)} Ω。Vgs 再升高，Vov 变大，沟道变厚，电阻就变小，这就是「受控电阻」。`,
      `R = 1/(k·Vov) = 1/(${KN * 1000} mA/V² × 1 V) = ${Math.round(r1)} Ω. Raising Vgs increases Vov, thickens the channel and lowers R: that is the “controlled resistor”.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `NMOS 已在饱和区（Vov = 1.3 V）。把 Vds 从 2 V 升到 3 V，Id 会怎样？`,
      `An NMOS is already in saturation (Vov = 1.3 V). Raising Vds from 2 V to 3 V, what happens to Id?`,
    ),
    options: [
      { id: 'a', text: loc('几乎不变，只略微增加', 'Almost unchanged, rising only slightly') },
      { id: 'b', text: loc('按比例增加 50%', 'Rises in proportion, by 50%') },
      { id: 'c', text: loc('下降到 0，因为沟道夹断了', 'Drops to 0 because the channel is pinched off') },
    ],
    answer: 'a',
    explain: loc(
      `夹断点处沟道电压固定为 Vov，驱动电流的压差不随 Vds 变，所以 Id 几乎恒定；多出的 Vds 只让夹断点向源极挪一点，沟道略变短，按本课模型（λ = ${LAMBDA}）只增加约 ${rise}%（每伏约 ${lamPct}%）。夹断也不是电流为 0。`,
      `The channel voltage at the pinch-off point is fixed at Vov, so the voltage driving the current does not change with Vds and Id stays almost constant; extra Vds only moves the pinch-off point slightly towards the source and shortens the channel a bit, adding only about ${rise}% in this lesson’s model (λ = ${LAMBDA}, about ${lamPct}% per volt). Pinch-off does not mean zero current either.`,
    ),
  },
]
