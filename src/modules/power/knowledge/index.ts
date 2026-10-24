import type { AnaKnowledge } from '../../ana/knowledge/types'
import { PWR_DPT_KNOWLEDGE } from './pwrDpt'
import { PWR_GATE_KNOWLEDGE } from './pwrGate'
import { PWR_KELVIN_KNOWLEDGE } from './pwrKelvin'
import { PWR_PROGRAM_KNOWLEDGE } from './pwrProgram'
import { PWR_SELECTOR_KNOWLEDGE } from './pwrSelector'
import { PWR_STATIC_KNOWLEDGE } from './pwrStatic'
import { PWR_UIS_KNOWLEDGE } from './pwrUis'
import { PWR_WBG_KNOWLEDGE } from './pwrWbg'

/** 按课程顺序排列（PWR-01 … PWR-08） */
export const PWR_KNOWLEDGE: AnaKnowledge[] = [
  PWR_SELECTOR_KNOWLEDGE,
  PWR_STATIC_KNOWLEDGE,
  PWR_KELVIN_KNOWLEDGE,
  PWR_GATE_KNOWLEDGE,
  PWR_DPT_KNOWLEDGE,
  PWR_UIS_KNOWLEDGE,
  PWR_WBG_KNOWLEDGE,
  PWR_PROGRAM_KNOWLEDGE,
]
