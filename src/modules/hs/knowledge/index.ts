import { HS_ATE_LIMIT_KNOWLEDGE } from './hsAteLimit'
import { HS_BASICS_KNOWLEDGE } from './hsBasics'
import { HS_CAPSTONE_KNOWLEDGE } from './hsCapstone'
import { HS_CHANNEL_KNOWLEDGE } from './hsChannel'
import { HS_EYE_KNOWLEDGE } from './hsEye'
import { HS_INTERFACE_KNOWLEDGE } from './hsInterface'
import { HS_JITTER_KNOWLEDGE } from './hsJitter'
import { HS_TIMING_KNOWLEDGE } from './hsTiming'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** 高速接口课程的术语与常见问题，按课序排列（HS-01 … HS-08） */
export const HS_KNOWLEDGE: AnaKnowledge[] = [
  HS_BASICS_KNOWLEDGE,
  HS_CHANNEL_KNOWLEDGE,
  HS_TIMING_KNOWLEDGE,
  HS_JITTER_KNOWLEDGE,
  HS_EYE_KNOWLEDGE,
  HS_INTERFACE_KNOWLEDGE,
  HS_ATE_LIMIT_KNOWLEDGE,
  HS_CAPSTONE_KNOWLEDGE,
]
