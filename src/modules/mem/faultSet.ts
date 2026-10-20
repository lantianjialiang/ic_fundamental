import { loc, type LText } from '../../i18n/locale'
import type { Fault } from './core/array'

/**
 * MEM-04 与 MEM-05 共用的预设故障集合。
 * 教学阵列为 8 个单元（逻辑地址 0 … 7）；每个故障单独注入、单独运行，互不影响。
 * name 是完整说明（表格的题目），short 是列表里用的短名。
 */
export const ARRAY_SIZE = 8

export type PresetFault = { id: string; name: LText; short: LText; fault: Fault }

export const PRESET_FAULTS: PresetFault[] = [
  {
    id: 'saf0',
    name: loc('SAF0：单元 3 固定为 0', 'SAF0: cell 3 stuck at 0'),
    short: loc('SAF0', 'SAF0'),
    fault: { kind: 'SAF', cell: 3, value: 0 },
  },
  {
    id: 'saf1',
    name: loc('SAF1：单元 5 固定为 1', 'SAF1: cell 5 stuck at 1'),
    short: loc('SAF1', 'SAF1'),
    fault: { kind: 'SAF', cell: 5, value: 1 },
  },
  {
    id: 'tf-up',
    name: loc('TF↑：单元 2 不能 0→1', 'TF↑: cell 2 cannot rise 0→1'),
    short: loc('TF↑', 'TF↑'),
    fault: { kind: 'TF', cell: 2, rising: true },
  },
  {
    id: 'tf-down',
    name: loc('TF↓：单元 6 不能 1→0', 'TF↓: cell 6 cannot fall 1→0'),
    short: loc('TF↓', 'TF↓'),
    fault: { kind: 'TF', cell: 6, rising: false },
  },
  {
    id: 'cfin-fall',
    name: loc('CFin↓：侵害 4 下降沿翻转受害 2', 'CFin↓: aggressor 4 falling edge inverts victim 2'),
    short: loc('CFin↓（4→2）', 'CFin↓ (4→2)'),
    fault: { kind: 'CFIN', aggressor: 4, victim: 2, rising: false },
  },
  {
    id: 'cfid-rise',
    name: loc('CFid↑：侵害 4 上升沿强制受害 2 为 0', 'CFid↑: aggressor 4 rising edge forces victim 2 to 0'),
    short: loc('CFid↑（4→2）', 'CFid↑ (4→2)'),
    fault: { kind: 'CFID', aggressor: 4, victim: 2, rising: true, value: 0 },
  },
  {
    id: 'af-noaccess',
    name: loc('AF：地址 4 不访问任何单元', 'AF: address 4 accesses no cell'),
    short: loc('AF 地址 4 悬空', 'AF addr 4 no cell'),
    fault: { kind: 'AF_NOACCESS', addr: 4 },
  },
  {
    id: 'af-alias',
    name: loc('AF：地址 1 实际访问单元 0', 'AF: address 1 actually accesses cell 0'),
    short: loc('AF 地址 1→0', 'AF addr 1→0'),
    fault: { kind: 'AF_ALIAS', addr: 1, target: 0 },
  },
]
