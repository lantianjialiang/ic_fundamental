import type { AnaKnowledge } from '../../ana/knowledge/types'
import { PIC_ALIGN_KNOWLEDGE } from './picAlign'
import { PIC_CUTBACK_KNOWLEDGE } from './picCutback'
import { PIC_DEVICE_KNOWLEDGE } from './picDevice'
import { PIC_FLOW_KNOWLEDGE } from './picFlow'
import { PIC_LINK_KNOWLEDGE } from './picLink'
import { PIC_MOD_KNOWLEDGE } from './picMod'
import { PIC_OVERVIEW_KNOWLEDGE } from './picOverview'
import { PIC_SWEEP_KNOWLEDGE } from './picSweep'
import { PIC_UNITS_KNOWLEDGE } from './picUnits'

/** 按课程顺序排列（PIC-01 … PIC-09） */
export const PIC_KNOWLEDGE: AnaKnowledge[] = [
  PIC_OVERVIEW_KNOWLEDGE,
  PIC_UNITS_KNOWLEDGE,
  PIC_DEVICE_KNOWLEDGE,
  PIC_MOD_KNOWLEDGE,
  PIC_SWEEP_KNOWLEDGE,
  PIC_ALIGN_KNOWLEDGE,
  PIC_CUTBACK_KNOWLEDGE,
  PIC_LINK_KNOWLEDGE,
  PIC_FLOW_KNOWLEDGE,
]
