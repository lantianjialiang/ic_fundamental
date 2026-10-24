import type { AnaKnowledge } from '../../ana/knowledge/types'
import { REL_ACCEL_KNOWLEDGE } from './relAccel'
import { REL_AUTO_KNOWLEDGE } from './relAuto'
import { REL_BATHTUB_KNOWLEDGE } from './relBathtub'
import { REL_BURNIN_KNOWLEDGE } from './relBurnIn'
import { REL_FLOW_KNOWLEDGE } from './relFlow'
import { REL_PAT_KNOWLEDGE } from './relPat'
import { REL_STRESS_KNOWLEDGE } from './relStress'
import { REL_WEIBULL_KNOWLEDGE } from './relWeibull'

/** 按课程顺序排列（REL-01 … REL-08） */
export const REL_KNOWLEDGE: AnaKnowledge[] = [
  REL_BATHTUB_KNOWLEDGE,
  REL_ACCEL_KNOWLEDGE,
  REL_STRESS_KNOWLEDGE,
  REL_WEIBULL_KNOWLEDGE,
  REL_BURNIN_KNOWLEDGE,
  REL_AUTO_KNOWLEDGE,
  REL_PAT_KNOWLEDGE,
  REL_FLOW_KNOWLEDGE,
]
