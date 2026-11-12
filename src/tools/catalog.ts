import { loc, type LText } from '../i18n/locale'
import type { ComponentType } from 'react'
import type { PanelProps } from './ui'
import { BitTool, EndianTool, FloatTool, RadixTool, TwosTool } from './panels/Digital'
import { ClockTool } from './panels/Embed'
import { ImpTool, LengthTool, OzTool, TraceTool } from './panels/Pcb'
import { DividerTool, OhmTool, RcTool, ResistorTool } from './panels/Circuit'
import { SourcesTool } from './panels/Sources'

export type ToolCat = 'digital' | 'embed' | 'pcb' | 'circuit'

export const CATS: Array<{ id: ToolCat; title: LText }> = [
  { id: 'digital', title: loc('数字', 'Digital') },
  { id: 'embed', title: loc('嵌入式', 'Embedded') },
  { id: 'pcb', title: loc('PCB', 'PCB') },
  { id: 'circuit', title: loc('电路', 'Circuits') },
]

export const TOOLS: Array<{ id: string; cat: ToolCat; title: LText; panel: ComponentType<PanelProps> }> = [
  { id: 'radix', cat: 'digital', title: loc('进制转换', 'Radix'), panel: RadixTool },
  { id: 'twos', cat: 'digital', title: loc('补码与范围', 'Two’s complement'), panel: TwosTool },
  { id: 'bits', cat: 'digital', title: loc('位运算与字段', 'Bit fields'), panel: BitTool },
  { id: 'endian', cat: 'digital', title: loc('字节序', 'Endianness'), panel: EndianTool },
  { id: 'float', cat: 'digital', title: loc('IEEE 754', 'IEEE 754'), panel: FloatTool },
  { id: 'clock', cat: 'embed', title: loc('时钟与定时器', 'Clock and timer'), panel: ClockTool },
  { id: 'length', cat: 'pcb', title: loc('尺寸单位', 'Dimensions'), panel: LengthTool },
  { id: 'oz', cat: 'pcb', title: loc('铜厚', 'Copper'), panel: OzTool },
  { id: 'trace', cat: 'pcb', title: loc('线宽与载流', 'Trace current'), panel: TraceTool },
  { id: 'imp', cat: 'pcb', title: loc('阻抗估算', 'Impedance'), panel: ImpTool },
  { id: 'ohm', cat: 'circuit', title: loc('欧姆定律', 'Ohm’s law'), panel: OhmTool },
  { id: 'divider', cat: 'circuit', title: loc('分压与 LED', 'Divider and LED'), panel: DividerTool },
  { id: 'sources', cat: 'circuit', title: loc('电源串联与并联', 'Series and parallel sources'), panel: SourcesTool },
  { id: 'rc', cat: 'circuit', title: loc('RC 滤波', 'RC filter'), panel: RcTool },
  { id: 'resistor', cat: 'circuit', title: loc('电阻识别', 'Resistors'), panel: ResistorTool },
]
