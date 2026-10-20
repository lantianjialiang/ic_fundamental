import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 存储器测试轨道（MEM，轨道前缀 M）的课程 ID，顺序即课序 */
export const MEM_LESSONS = [
  'memStructure',
  'memRw',
  'memFault',
  'memPattern',
  'memMarch',
  'memTiming',
  'memDram',
  'memDdr',
  'memBist',
  'memParallel',
  'memCoverage',
  'memBin',
  'memCapstone',
] as const

export type MemLessonId = (typeof MEM_LESSONS)[number]

export const MEM_META: Record<MemLessonId, LessonMeta> = {
  memStructure: {
    title: loc('存储器结构', 'Memory Array Structure'),
    goal: loc(
      '说清 Cell、Row、Column、Bank 与地址的关系；看懂地址映射如何改变相邻地址在物理上的位置。',
      'Explain how cells, rows, columns, banks and addresses relate; see how address mapping changes where neighbouring addresses sit physically.',
    ),
  },
  memRw: {
    title: loc('存储器读写流程', 'Memory Read and Write Flow'),
    goal: loc('单步执行读写，读懂地址、命令、数据与时序图之间的对应关系。', 'Step through reads and writes; relate address, command, data and the timing diagram.'),
  },
  memFault: {
    title: loc('存储器故障模型', 'Memory Fault Models'),
    goal: loc('注入固定、跳变、耦合与地址故障，观察普通读写如何暴露它们。', 'Inject stuck-at, transition, coupling and address faults; see how ordinary reads and writes expose them.'),
  },
  memPattern: {
    title: loc('Pattern 与数据背景', 'Patterns and Data Backgrounds'),
    goal: loc(
      '比较全 0、全 1、棋盘格和 Walking 的覆盖范围与耗时，理解背景选择对故障覆盖的影响。',
      'Compare the coverage and run time of all-0, all-1, checkerboard and walking patterns; understand how the background choice affects fault coverage.',
    ),
  },
  memMarch: {
    title: loc('March 测试', 'March Test'),
    goal: loc(
      '读懂 March 元素的记法，逐步执行 MATS+ 与 March C-，说清各自能抓住哪类故障。',
      'Read March element notation, step through MATS+ and March C-, and say which fault classes each one catches.',
    ),
  },
  memTiming: {
    title: loc('存储器时序测试', 'Memory Timing Test'),
    goal: loc('调节时序参数，二分找出失效边界，并画出 Shmoo 图。', 'Adjust timing parameters, binary-search the failing boundary, and draw a Shmoo plot.'),
  },
  memDram: {
    title: loc('DRAM 基础', 'DRAM Basics'),
    goal: loc(
      '说清刷新、预充电、激活与感应放大器的作用，理解刷新间隔与保持时间的关系。',
      'Explain the roles of refresh, precharge, activate and the sense amplifier; relate refresh interval to retention time.',
    ),
  },
  memDdr: {
    title: loc('DDR / LPDDR 读写训练', 'DDR / LPDDR Read-Write Training'),
    goal: loc('扫描 DQ-DQS 延迟，找出数据窗口的中心与裕量。', 'Sweep the DQ-DQS delay; find the centre and margin of the data window.'),
  },
  memBist: {
    title: loc('BIST、冗余修复与 ECC', 'BIST, Redundancy Repair and ECC'),
    goal: loc(
      '用 BIST 找出失效位，给出修复方案，并说清 ECC 能纠正与检测什么。',
      'Use BIST to find failing bits, propose a repair, and explain what ECC can correct and detect.',
    ),
  },
  memParallel: {
    title: loc('存储器并行测试', 'Parallel Memory Test'),
    goal: loc('在固定通道数下选择 Site 数，比较吞吐与失效数据占用的存储。', 'With a fixed channel count, choose the number of sites; compare throughput and fail-data storage.'),
  },
  memCoverage: {
    title: loc('测试覆盖率与良率', 'Test Coverage and Yield'),
    goal: loc('对比不同算法的覆盖率与耗时，理解覆盖率并不等于良率。', 'Compare the coverage and run time of different algorithms; understand that coverage is not yield.'),
  },
  memBin: {
    title: loc('Bin 与失效分析', 'Bin and Failure Analysis'),
    goal: loc('读懂失效位图，判断失效类型（单点、整行、整列、簇）并分配 Bin。', 'Read a fail bitmap, classify the failure (single bit, row, column, cluster) and assign a bin.'),
  },
  memCapstone: {
    title: loc('综合：存储器测试', 'Capstone: Memory Test'),
    goal: loc('对 SRAM 与 DRAM 虚拟器件完成测试流程并输出报告。', 'Run the test flow on virtual SRAM and DRAM devices and produce a report.'),
  },
}
