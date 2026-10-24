/**
 * REL-06 车规基础的教学模型（纯数据与纯函数，无 UI）。
 * 温度等级、试验分组、安装环境上限都是教学示意值：只保留公开的概念框架，
 * 具体数值以现行标准为准，不复制标准原文，也不声称这些数字是标准规定值。
 */

/** 温度等级 0–3（教学示意）：等级数字越小，环境温度上限越高，范围越宽 */
export const GRADES = [
  { grade: 0, minC: -40, maxC: 150 },
  { grade: 1, minC: -40, maxC: 125 },
  { grade: 2, minC: -40, maxC: 105 },
  { grade: 3, minC: -40, maxC: 85 },
] as const
export type GradeId = (typeof GRADES)[number]['grade']

/** 试验分组 A–G（只列概念，不列标准条款） */
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
export type GroupId = (typeof GROUPS)[number]

/** 10 个试验，每个只属于一个分组 */
export const TESTS = ['tc', 'hast', 'htol', 'elfr', 'bond', 'em', 'tddb', 'hbm', 'pat', 'hermetic'] as const
export type TestId = (typeof TESTS)[number]

/** 试验 → 分组映射：每个试验恰好出现一次，7 个分组都有试验 */
export const TEST_GROUP: Record<TestId, GroupId> = {
  tc: 'A',
  hast: 'A',
  htol: 'B',
  elfr: 'B',
  bond: 'C',
  em: 'D',
  tddb: 'D',
  hbm: 'E',
  pat: 'F',
  hermetic: 'G',
}

/** 四个虚拟产品的安装环境上限（教学示例，以现行标准与实际设计为准） */
export const PRODUCTS = [
  { id: 'sensor', needC: 140 },
  { id: 'audio', needC: 85 },
  { id: 'led', needC: 105 },
  { id: 'vdut', needC: 125 },
] as const
export type ProductId = (typeof PRODUCTS)[number]['id']

/** 可以选等级的三个安装位置；VDUT-AUTO1 固定为 Grade 1 */
export const SELECTABLE = ['sensor', 'audio', 'led'] as const
export type SelectableId = (typeof SELECTABLE)[number]

export function needOf(id: ProductId): number {
  const hit = PRODUCTS.find((product) => product.id === id)
  return hit ? hit.needC : 0
}

/** 能覆盖需求上限的等级里，数字最大（温度范围最窄）的那一个 */
export function rightGrade(needC: number): GradeId {
  for (let g = 3; g >= 0; g -= 1) {
    if (GRADES[g].maxC >= needC) {
      return g as GradeId
    }
  }
  return 0
}

export type GradeVerdict = 'right' | 'over' | 'short'

/** right：刚好覆盖需求；over：覆盖但等级数字更小（范围更宽，超规格、更贵）；short：上限不够 */
export function gradeVerdict(grade: GradeId, needC: number): GradeVerdict {
  if (GRADES[grade].maxC < needC) {
    return 'short'
  }
  return grade === rightGrade(needC) ? 'right' : 'over'
}

/** VDUT-AUTO1 的三温测试温度点：低温、室温、高温；室温固定 25 °C */
export const ROOM_C = 25
export const VDUT_GRADE: GradeId = 1

/** 三温测试温度点是否覆盖某个等级的范围两端 */
export function tempCoverage(lowC: number, highC: number, grade: GradeId): { low: boolean; high: boolean } {
  return { low: lowC <= GRADES[grade].minC, high: highC >= GRADES[grade].maxC }
}

/** 失效案例：每个案例对应一个试验 */
export const CASES = [
  { id: 'c1', test: 'tc' },
  { id: 'c2', test: 'hast' },
  { id: 'c3', test: 'htol' },
  { id: 'c4', test: 'elfr' },
  { id: 'c5', test: 'bond' },
  { id: 'c6', test: 'em' },
  { id: 'c7', test: 'tddb' },
  { id: 'c8', test: 'hbm' },
  { id: 'c9', test: 'pat' },
  { id: 'c10', test: 'hermetic' },
  { id: 'c11', test: 'pat' },
  { id: 'c12', test: 'tc' },
] as const
export type CaseId = (typeof CASES)[number]['id']

/** 三类标准与三种角色（只讲角色，不讲条款） */
export const STANDARDS = ['aec', 'iso', 'iatf'] as const
export type StdId = (typeof STANDARDS)[number]
export const ROLES = ['qual', 'safety', 'qms'] as const
export type RoleId = (typeof ROLES)[number]
export const STANDARD_ROLE: Record<StdId, RoleId> = { aec: 'qual', iso: 'safety', iatf: 'qms' }

export type AutoState = {
  /** 当前在看的产品卡 */
  product: ProductId
  /** 三个可选位置的温度等级 */
  grades: Record<SelectableId, GradeId>
  /** 三温测试的低温点与高温点，°C */
  lowC: number
  highC: number
  /** 失效案例 */
  caseId: CaseId
  /** 每个试验选的分组 */
  groups: Record<TestId, GroupId>
  /** 每个标准选的角色 */
  roles: Record<StdId, RoleId>
}

/** 默认值取每组的第一项（显示顺序），不预先选对答案 */
export const DEFAULT_AUTO: AutoState = {
  product: PRODUCTS[0].id,
  grades: { sensor: GRADES[0].grade, audio: GRADES[0].grade, led: GRADES[0].grade },
  lowC: -20,
  highC: 105,
  caseId: CASES[0].id,
  groups: {
    tc: GROUPS[0],
    hast: GROUPS[0],
    htol: GROUPS[0],
    elfr: GROUPS[0],
    bond: GROUPS[0],
    em: GROUPS[0],
    tddb: GROUPS[0],
    hbm: GROUPS[0],
    pat: GROUPS[0],
    hermetic: GROUPS[0],
  },
  roles: { aec: ROLES[0], iso: ROLES[0], iatf: ROLES[0] },
}

/** 三个位置的等级都选对了 */
export function gradesRight(grades: Record<SelectableId, GradeId>): boolean {
  return SELECTABLE.every((id) => gradeVerdict(grades[id], needOf(id)) === 'right')
}

/** 分组选对的试验数 */
export function groupsCorrect(groups: Record<TestId, GroupId>): number {
  return TESTS.filter((test) => groups[test] === TEST_GROUP[test]).length
}

/** 角色选对的标准数 */
export function rolesCorrect(roles: Record<StdId, RoleId>): number {
  return STANDARDS.filter((std) => roles[std] === STANDARD_ROLE[std]).length
}
