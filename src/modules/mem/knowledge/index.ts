import type { AnaKnowledge } from '../../ana/knowledge/types'
import { MEM_BIN_KNOWLEDGE } from './memBin'
import { MEM_BIST_KNOWLEDGE } from './memBist'
import { MEM_CAPSTONE_KNOWLEDGE } from './memCapstone'
import { MEM_COVERAGE_KNOWLEDGE } from './memCoverage'
import { MEM_DDR_KNOWLEDGE } from './memDdr'
import { MEM_DRAM_KNOWLEDGE } from './memDram'
import { MEM_FAULT_KNOWLEDGE } from './memFault'
import { MEM_MARCH_KNOWLEDGE } from './memMarch'
import { MEM_PARALLEL_KNOWLEDGE } from './memParallel'
import { MEM_PATTERN_KNOWLEDGE } from './memPattern'
import { MEM_RW_KNOWLEDGE } from './memRw'
import { MEM_STRUCTURE_KNOWLEDGE } from './memStructure'
import { MEM_TIMING_KNOWLEDGE } from './memTiming'

/** 按课程顺序排列（MEM-01 … MEM-13） */
export const MEM_KNOWLEDGE: AnaKnowledge[] = [
  MEM_STRUCTURE_KNOWLEDGE,
  MEM_RW_KNOWLEDGE,
  MEM_FAULT_KNOWLEDGE,
  MEM_PATTERN_KNOWLEDGE,
  MEM_MARCH_KNOWLEDGE,
  MEM_TIMING_KNOWLEDGE,
  MEM_DRAM_KNOWLEDGE,
  MEM_DDR_KNOWLEDGE,
  MEM_BIST_KNOWLEDGE,
  MEM_PARALLEL_KNOWLEDGE,
  MEM_COVERAGE_KNOWLEDGE,
  MEM_BIN_KNOWLEDGE,
  MEM_CAPSTONE_KNOWLEDGE,
]
