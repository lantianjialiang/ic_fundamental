import { ANA_CAPSTONE_KNOWLEDGE } from './anaCapstone'
import { ANA_DYNAMIC_KNOWLEDGE } from './anaDynamic'
import { ANA_FFT_KNOWLEDGE } from './anaFft'
import { ANA_LDO_KNOWLEDGE } from './anaLdo'
import { ANA_LEAK_KNOWLEDGE } from './anaLeak'
import { ANA_MEASURE_KNOWLEDGE } from './anaMeasure'
import { ANA_OVERVIEW_KNOWLEDGE } from './anaOverview'
import { ANA_PLL_KNOWLEDGE } from './anaPll'
import { ANA_RESOURCES_KNOWLEDGE } from './anaResources'
import { ANA_SAMPLING_KNOWLEDGE } from './anaSampling'
import { ANA_SIGNAL_KNOWLEDGE } from './anaSignal'
import { ANA_SMU_KNOWLEDGE } from './anaSmu'
import { ANA_STATIC_KNOWLEDGE } from './anaStatic'
import { ANA_STATS_KNOWLEDGE } from './anaStats'
import { ANA_TRIM_KNOWLEDGE } from './anaTrim'
import type { AnaKnowledge } from './types'

/** 模拟课程的术语与常见问题，按课序排列（ANA-01 … ANA-15） */
export const ANA_KNOWLEDGE: AnaKnowledge[] = [
  ANA_OVERVIEW_KNOWLEDGE,
  ANA_MEASURE_KNOWLEDGE,
  ANA_RESOURCES_KNOWLEDGE,
  ANA_SMU_KNOWLEDGE,
  ANA_SIGNAL_KNOWLEDGE,
  ANA_SAMPLING_KNOWLEDGE,
  ANA_FFT_KNOWLEDGE,
  ANA_LEAK_KNOWLEDGE,
  ANA_LDO_KNOWLEDGE,
  ANA_STATIC_KNOWLEDGE,
  ANA_DYNAMIC_KNOWLEDGE,
  ANA_PLL_KNOWLEDGE,
  ANA_TRIM_KNOWLEDGE,
  ANA_STATS_KNOWLEDGE,
  ANA_CAPSTONE_KNOWLEDGE,
]
