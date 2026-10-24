// REL-06 车规基础：核对温度等级范围与试验 → 分组映射（取自 ATE-REL-module-spec.md §3 REL-06 的单测用例）。
export default async function run({ load, check }) {
  const auto = await load('modules/qual/relAutoModel.ts')

  console.log('REL-06 温度等级范围')
  const expected = [
    [0, -40, 150],
    [1, -40, 125],
    [2, -40, 105],
    [3, -40, 85],
  ]
  for (const [grade, minC, maxC] of expected) {
    const hit = auto.GRADES.find((g) => g.grade === grade)
    check(`Grade ${grade} 温度范围 ${minC} ~ +${maxC} °C`, hit !== undefined && hit.minC === minC && hit.maxC === maxC, hit ? `${hit.minC} ~ ${hit.maxC}` : '缺失')
  }
  check('四个等级数量恰为 4', auto.GRADES.length === 4, `${auto.GRADES.length}`)

  console.log('REL-06 试验 → 分组映射')
  const keys = Object.keys(auto.TEST_GROUP)
  check('映射覆盖全部 10 个试验（无遗漏）', auto.TESTS.every((test) => keys.includes(test)), `${keys.length} 个键`)
  check('映射中没有多余的试验（无重复 / 无多余键）', keys.length === auto.TESTS.length && keys.every((key) => auto.TESTS.includes(key)))
  const used = new Set(Object.values(auto.TEST_GROUP))
  check('A–G 七个分组都有试验', auto.GROUPS.every((g) => used.has(g)), [...used].sort().join(''))
  check('每个试验只归入一个分组（值为 A–G 之一）', keys.every((key) => auto.GROUPS.includes(auto.TEST_GROUP[key])))
  check('CASES 指向的试验都存在', auto.CASES.every((c) => auto.TESTS.includes(c.test)))

  console.log('REL-06 等级选择（教学计算）')
  check('需求 140 °C → Grade 0', auto.rightGrade(140) === 0)
  check('需求 105 °C → Grade 2', auto.rightGrade(105) === 2)
  check('需求 85 °C → Grade 3', auto.rightGrade(85) === 3)
  check('需求 125 °C → Grade 1（VDUT-AUTO1）', auto.rightGrade(125) === 1)
  check('Grade 1 对 85 °C 需求：覆盖但超规格', auto.gradeVerdict(1, 85) === 'over')
  check('Grade 3 对 140 °C 需求：上限不够', auto.gradeVerdict(3, 140) === 'short')
}
