import type { AnaKnowledge } from '../../ana/knowledge/types'
import { SNS_ACCEL_KNOWLEDGE } from './snsAccel'
import { SNS_DARK_KNOWLEDGE } from './snsDark'
import { SNS_FLAT_KNOWLEDGE } from './snsFlat'
import { SNS_OPTICAL_KNOWLEDGE } from './snsOptical'
import { SNS_OVERVIEW_KNOWLEDGE } from './snsOverview'
import { SNS_PHOTON_KNOWLEDGE } from './snsPhoton'
import { SNS_PIXEL_KNOWLEDGE } from './snsPixel'
import { SNS_PROGRAM_KNOWLEDGE } from './snsProgram'
import { SNS_PTC_KNOWLEDGE } from './snsPtc'

/** 按课程顺序排列（SNS-01 … SNS-09） */
export const SNS_KNOWLEDGE: AnaKnowledge[] = [
  SNS_OVERVIEW_KNOWLEDGE,
  SNS_PHOTON_KNOWLEDGE,
  SNS_PIXEL_KNOWLEDGE,
  SNS_PTC_KNOWLEDGE,
  SNS_DARK_KNOWLEDGE,
  SNS_FLAT_KNOWLEDGE,
  SNS_OPTICAL_KNOWLEDGE,
  SNS_ACCEL_KNOWLEDGE,
  SNS_PROGRAM_KNOWLEDGE,
]
