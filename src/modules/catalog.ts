/**
 * 课程的稳定 ID。显示编号不写在这里，由所在轨道的顺序算出来（见 tracks/catalog.ts 的 lessonCode），
 * 所以调整、插入课程时不用改编号。
 */
export const MODULE_IDS = [
  'intro',
  'connection',
  'ate',
  'pmu',
  'spec',
  'dc',
  'func',
  'timing',
  'vector',
  'scan',
  'program',
  'shmoo',
  'alu',
  'latch',
  'bench',
  'vate',
  'fBasics',
  'fAte',
  'fIntro',
  'fSpec',
  'fOpens',
  'fDc',
  'fFunc',
  'fAc',
  'fChar',
  'fVector',
  'fProgram',
  'fCreate',
  'fDebug',
  'fQualify',
  'fLatch',
  'fScan',
] as const

export type ModuleId = (typeof MODULE_IDS)[number]
