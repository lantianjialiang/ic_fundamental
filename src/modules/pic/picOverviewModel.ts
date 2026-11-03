import { energyPerBitJ } from './core/photonics'

export const BLOCK_IDS = ['asic', 'engine', 'els', 'fau'] as const
export type BlockId = (typeof BLOCK_IDS)[number]

export const ROLE_IDS = ['pic', 'eic', 'els', 'fau', 'asic', 'fiber', 'gc', 'mod'] as const
export type RoleId = (typeof ROLE_IDS)[number]

/** 每项的第一项都是错的，重置后任务卡保持未完成。 */
export const ROLE_CHOICES: Record<RoleId, readonly [string, string, string]> = {
  pic: ['dc', 'light', 'packets'],
  eic: ['dc', 'drive', 'laser'],
  els: ['dc', 'attach', 'laser'],
  fau: ['dc', 'packets', 'attach'],
  asic: ['dc', 'light', 'packets'],
  fiber: ['dc', 'drive', 'span'],
  gc: ['dc', 'laser', 'couple'],
  mod: ['dc', 'attach', 'encode'],
}

export const ROLE_ANSWER: Record<RoleId, string> = {
  pic: 'light',
  eic: 'drive',
  els: 'laser',
  fau: 'attach',
  asic: 'packets',
  fiber: 'span',
  gc: 'couple',
  mod: 'encode',
}

export const STAGE_IDS = ['wafer', 'kgd', 'engine', 'package'] as const
export type StageId = (typeof STAGE_IDS)[number]

export const TEST_IDS = ['cutback', 'dark', 'kgd', 'loop', 'align', 'sys'] as const
export type TestId = (typeof TEST_IDS)[number]

export const TEST_ANSWER: Record<TestId, StageId> = {
  cutback: 'wafer',
  dark: 'wafer',
  kgd: 'kgd',
  loop: 'engine',
  align: 'package',
  sys: 'package',
}

/** 正确阶段不放在第一项。 */
export function stageChoices(answer: StageId): StageId[] {
  const rest = STAGE_IDS.filter((id) => id !== answer)
  return [rest[0], answer, rest[1], rest[2]]
}

export const BLOCK_STAGE: Record<BlockId, StageId> = {
  asic: 'package',
  engine: 'engine',
  els: 'package',
  fau: 'package',
}

export const WHY_IDS = ['brighter', 'loss', 'fiber'] as const
export type WhyId = (typeof WHY_IDS)[number]
export const WHY_ANSWER: WhyId = 'loss'

export type OverviewState = {
  block: BlockId
  powerW: number
  rateTbps: number
  roleFocus: RoleId
  roles: Record<RoleId, string>
  testFocus: TestId
  stages: Record<TestId, StageId>
  why: WhyId
}

function recordFrom<T extends string, V>(ids: readonly T[], value: (id: T) => V): Record<T, V> {
  const out = {} as Record<T, V>
  for (const id of ids) out[id] = value(id)
  return out
}

export const DEFAULT_OVERVIEW: OverviewState = {
  block: BLOCK_IDS[0],
  powerW: 4,
  rateTbps: 0.8,
  roleFocus: ROLE_IDS[0],
  roles: recordFrom(ROLE_IDS, (id) => ROLE_CHOICES[id][0]),
  testFocus: TEST_IDS[0],
  stages: recordFrom(TEST_IDS, (id) => stageChoices(TEST_ANSWER[id])[0]),
  why: WHY_IDS[0],
}

export function cloneOverview(state: OverviewState = DEFAULT_OVERVIEW): OverviewState {
  return { ...state, roles: { ...state.roles }, stages: { ...state.stages } }
}

export type OverviewAnalysis = {
  pj: number
  rolesOk: boolean
  stagesOk: boolean
  task1: boolean
  task4: boolean
}

export function analyseOverview(state: OverviewState): OverviewAnalysis {
  const pj = energyPerBitJ(state.powerW, state.rateTbps * 1e12) * 1e12
  const rolesOk = ROLE_IDS.every((id) => state.roles[id] === ROLE_ANSWER[id])
  const stagesOk = TEST_IDS.every((id) => state.stages[id] === TEST_ANSWER[id])
  const task1 =
    Math.abs(state.powerW - 10) < 0.01 && Math.abs(state.rateTbps - 1.6) < 0.05 && Math.abs(pj - 6.25) < 0.02
  return { pj, rolesOk, stagesOk, task1, task4: state.why === WHY_ANSWER }
}
