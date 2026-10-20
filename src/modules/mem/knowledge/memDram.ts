import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-07 DRAM 基础：1T1C 单元、刷新、保持时间、感应放大器与读后回写 */
export const MEM_DRAM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'dram-cell',
      term: '1T1C',
      name: loc('DRAM 单元（1T1C）', 'DRAM cell (1T1C)'),
      def: loc(
        '一个晶体管加一个电容。电容上有没有电荷代表 0 或 1；晶体管只是把电容接到位线上的开关。电容会慢慢漏电，所以需要刷新。见 {@memDram}。',
        'One transistor plus one capacitor. Charge on the capacitor, or its absence, stores a 0 or a 1; the transistor is only a switch that connects the capacitor to the bit line. The capacitor leaks slowly, so it must be refreshed. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
    {
      id: 'dram-refresh',
      term: 'Refresh',
      name: loc('刷新（Refresh）', 'Refresh'),
      def: loc(
        '周期性地把每一行的电荷补回满值。控制器按刷新间隔 tREF 发出 REF 命令，芯片内部用行计数器逐行完成 ACT → PRE。见 {@memDram}。',
        'Periodically restores each row’s charge to full. The controller issues REF every refresh interval tREF, and inside the chip a row counter steps through the rows doing ACT then PRE. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
    {
      id: 'dram-retention',
      term: 'Retention',
      name: loc('保持时间（Retention）', 'Retention time'),
      def: loc(
        '单元电荷降到感应放大器判决门限（V0 / 2）以下所用的时间。同一阵列里每个单元的保持时间不同，最弱的几个单元决定了 tREF 的上限。见 {@memDram}。',
        'The time for a cell’s charge to fall below the sense threshold V0 / 2. Retention varies from cell to cell; the weakest few set the upper limit of tREF. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
    {
      id: 'dram-sense-amp',
      term: 'Sense amplifier',
      name: loc('感应放大器', 'Sense amplifier'),
      def: loc(
        '接在位线上的小型放大电路。读出时把位线上很小的电压差放大成满幅的 0 或 1，并把它写回单元，所以读出后数据能保住。见 {@memDram}。',
        'A small amplifier on each bit line. On a read it amplifies the tiny voltage difference on the bit line to a full 0 or 1 and writes it back into the cell, so the data survives the read. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'mem-dram-why-read-destructive',
      q: loc('为什么 DRAM 读完还要回写？', 'Why must DRAM write back after a read?'),
      a: loc(
        '读出时电荷要经过位线与位线的寄生电容分享，单元电压被拉到中间值，原来的数据已经不完整。感应放大器把它推回满幅并写回单元，读才算完成。不写回，下一次读就会出错。见 {@memDram}。',
        'During a read, charge is shared between the cell and the bit line and its parasitic capacitance, which pulls the cell voltage to the middle; the original data is no longer intact. The sense amplifier drives it back to full and writes it back, and only then is the read complete. Without write-back, the next read would be wrong. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
    {
      id: 'mem-dram-refresh-longer',
      q: loc('刷新间隔能不能一直拉长来省功耗？', 'Can the refresh interval be stretched indefinitely to save power?'),
      a: loc(
        '不能。tREF 越长，保持时间短于它的单元越多，失效数只会增加。刷新功耗省下的部分要和失效的代价比较，所以 tREF 是一个折中值，而不是越大越好。见 {@memDram}。',
        'No. The longer tREF is, the more cells have retention shorter than it, so the failing count can only rise. The refresh power saved has to be weighed against the cost of failures, so tREF is a compromise, not a value to push as high as possible. See {@memDram}.',
      ),
      lessons: ['memDram'],
    },
  ],
}
