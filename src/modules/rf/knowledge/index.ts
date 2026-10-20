import { RF_CAL_KNOWLEDGE } from './rfCal'
import { RF_CAPSTONE_KNOWLEDGE } from './rfCapstone'
import { RF_DB_KNOWLEDGE } from './rfDb'
import { RF_EVM_KNOWLEDGE } from './rfEvm'
import { RF_GAIN_KNOWLEDGE } from './rfGain'
import { RF_HARM_KNOWLEDGE } from './rfHarm'
import { RF_IP3_KNOWLEDGE } from './rfIp3'
import { RF_MODULATION_KNOWLEDGE } from './rfModulation'
import { RF_NF_KNOWLEDGE } from './rfNf'
import { RF_OVERVIEW_KNOWLEDGE } from './rfOverview'
import { RF_P1DB_KNOWLEDGE } from './rfP1db'
import { RF_PHASE_NOISE_KNOWLEDGE } from './rfPhaseNoise'
import { RF_SPARAM_KNOWLEDGE } from './rfSparam'
import { RF_SYSTEM_KNOWLEDGE } from './rfSystem'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** 射频测试课程的术语与常见问题，按课序排列（RF-01 … RF-14） */
export const RF_KNOWLEDGE: AnaKnowledge[] = [
  RF_OVERVIEW_KNOWLEDGE,
  RF_DB_KNOWLEDGE,
  RF_SYSTEM_KNOWLEDGE,
  RF_SPARAM_KNOWLEDGE,
  RF_GAIN_KNOWLEDGE,
  RF_P1DB_KNOWLEDGE,
  RF_IP3_KNOWLEDGE,
  RF_NF_KNOWLEDGE,
  RF_HARM_KNOWLEDGE,
  RF_PHASE_NOISE_KNOWLEDGE,
  RF_MODULATION_KNOWLEDGE,
  RF_EVM_KNOWLEDGE,
  RF_CAL_KNOWLEDGE,
  RF_CAPSTONE_KNOWLEDGE,
]
