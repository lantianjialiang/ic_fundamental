import { loc, type LText } from '../../i18n/locale'

export const PCB_LESSONS = [
  'pcbIntro',
  'pcbMaterial',
  'pcbStack',
  'pcbFab',
  'pcbSupply',
  'pcbFlow',
  'pcbBasics',
  'pcbLayout',
  'pcbTools',
  'pcbDfm',
] as const

export type PcbLessonId = (typeof PCB_LESSONS)[number]

export const PCB_META: Record<PcbLessonId, { title: LText; goal: LText }> = {
  pcbIntro: {
    title: loc('PCB 是什么', 'What a PCB Is'),
    goal: loc(
      '说出 PCB 的四个作用和它在产品里的位置；分清单面、双面、多层、软板、软硬结合和金属基板；建立全课的术语表。',
      'Name the four jobs of a PCB and where it sits in a product; tell single-sided, double-sided, multilayer, flex, rigid-flex and metal-core boards apart; build the glossary for the whole course.',
    ),
  },
  pcbMaterial: {
    title: loc('板材、铜箔与表面处理', 'Laminate, Copper and Surface Finish'),
    goal: loc(
      '看懂 FR-4、芯板、半固化片、铜箔、阻焊和丝印各是什么；会比较 HASL、ENIG、OSP 等表面处理；知道材料怎样影响成本、可靠性和高速性能。',
      'Know what FR-4, core, prepreg, copper foil, solder mask and silkscreen are; compare HASL, ENIG, OSP and other finishes; know how materials affect cost, reliability and high-speed performance.',
    ),
  },
  pcbStack: {
    title: loc('叠层与过孔', 'Stack-up and Vias'),
    goal: loc(
      '说清为什么常见 2、4、6 层；读懂信号层、电源层、地层的排布；分清通孔、盲孔、埋孔、微孔，以及焊盘、孔环、反焊盘。',
      'Explain why 2, 4 and 6 layers are common; read how signal, power and ground layers are arranged; tell through, blind, buried and micro vias apart, along with pads, annular rings and antipads.',
    ),
  },
  pcbFab: {
    title: loc('PCB 制造流程', 'How a PCB Is Made'),
    goal: loc(
      '按顺序走完开料到终检的每道工序：做什么、用什么设备、常见缺陷；说清最小线宽线距、最小孔径这些规则从哪来。',
      'Walk every step from cutting the panel to final inspection: what it does, which equipment, typical defects; explain where minimum trace/space and minimum drill rules come from.',
    ),
  },
  pcbSupply: {
    title: loc('供应链与 SMT 生产', 'Supply Chain and SMT Assembly'),
    goal: loc(
      '说出从 EDA 到出货的每个环节和交付文件；懂交期、MOQ、替代料、EOL 这些采购概念；认识锡膏印刷、贴片、回流、AOI、ICT、FCT。',
      'Name every stage from EDA to shipping and the files handed over; understand lead time, MOQ, alternates and EOL; know solder-paste printing, placement, reflow, AOI, ICT and FCT.',
    ),
  },
  pcbFlow: {
    title: loc('PCB 设计流程', 'The PCB Design Flow'),
    goal: loc(
      '按顺序说出需求到出图的每一步；会按规范画原理图；知道封装从哪来、为什么封装错是最常见的返工原因；会用评审清单。',
      'List each step from requirements to output files; draw schematics to a standard; know where footprints come from and why footprint errors are a top cause of rework; use a review checklist.',
    ),
  },
  pcbBasics: {
    title: loc('基本概念：线宽、铺铜与阻抗', 'Core Concepts: Trace Width, Pours and Impedance'),
    goal: loc(
      '分清网络、网表、位号、焊盘、过孔；会按 IPC-2221 估算线宽载流；懂间距、铺铜、花焊盘、Fiducial、测试点；定性说清阻抗和哪些量有关。',
      'Tell nets, netlists, reference designators, pads and vias apart; estimate current capacity with IPC-2221; understand clearance, copper pours, thermal reliefs, fiducials and test points; say qualitatively what impedance depends on.',
    ),
  },
  pcbLayout: {
    title: loc('布局与布线原则', 'Placement and Routing Principles'),
    goal: loc(
      '按功能分区布局；让电源路径宽而短、地平面完整；把去耦电容放对；用回流路径解释 EMI 和信号完整性问题。',
      'Place by function; keep power paths wide and short and the ground plane intact; place decoupling capacitors correctly; use the return path to explain EMI and signal integrity problems.',
    ),
  },
  pcbTools: {
    title: loc('工具与实操：Altium', 'Tools in Practice: Altium'),
    goal: loc(
      '认识 Altium 的工程结构；按步骤把一个小项目从原理图做到 Gerber；会设 DRC 规则；会下打样单、看报价单。',
      'Know how an Altium project is organized; take a small project from schematic to Gerber step by step; set up DRC rules; place a prototype order and read the quote.',
    ),
  },
  pcbDfm: {
    title: loc('DFM / DFA / DFT 与综合项目', 'DFM / DFA / DFT and the Capstone'),
    goal: loc(
      '用 DFM、DFA、DFT 清单自查；认出新人最常犯的 10 类错误；复盘返工案例；按清单完成一块双层小板的设计自查。',
      'Self-check with DFM, DFA and DFT lists; spot the 10 most common beginner mistakes; review rework cases; complete the capstone check of a small two-layer board.',
    ),
  },
}
