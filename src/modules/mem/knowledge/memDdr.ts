import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-08 DDR / LPDDR 读写训练：命令与数据总线、DQ / DQS、读写窗口与训练 */
export const MEM_DDR_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'ddr-dq-dqs',
      term: 'DQ / DQS',
      name: loc('数据线与选通（DQ / DQS）', 'Data line and strobe (DQ / DQS)'),
      def: loc(
        'DQ 是双向数据线；DQS 是与数据同时送出的选通，接收端用它的边沿决定在哪一刻采样 DQ。DQS 与 DQ 的相对延迟不对，采样就会落在数据边沿附近。见 {@memDdr}。',
        'DQ is the bidirectional data line; DQS is a strobe sent alongside the data, and the receiver uses its edges to decide when to sample DQ. If the relative delay between DQS and DQ is wrong, sampling lands near a data edge. See {@memDdr}.',
      ),
      lessons: ['memDdr'],
    },
    {
      id: 'ddr-data-window',
      term: 'Data window',
      name: loc('数据窗口（读写窗口）', 'Data window (read/write window)'),
      def: loc(
        '一位数据在总线上稳定有效的时间段，宽度用 ps 或 UI 表示。窗口越宽，采样时刻的余量越大；它与 {@hsEye} 里的眼宽是同一个概念。见 {@memDdr}。',
        'The time span during which one bit is stably valid on the bus, given in ps or UI. The wider the window, the more room there is for the sampling moment; it is the same idea as the eye width in {@hsEye}. See {@memDdr}.',
      ),
      lessons: ['memDdr'],
    },
    {
      id: 'ddr-training',
      term: 'Training',
      name: loc('读写训练（Training）', 'Read / write training'),
      def: loc(
        '控制器扫描 DQS 延迟，找出所有数据位都能正确采样的范围，并把延迟设到这个范围（交集）的中心。训练后的左右裕量体现了余量的多少。见 {@memDdr}。',
        'The controller sweeps the DQS delay to find the range where every data bit samples correctly, then sets the delay to the centre of that range (the intersection). The left and right margins after training show how much room is left. See {@memDdr}.',
      ),
      lessons: ['memDdr'],
    },
  ],
  extraLessons: {
    margin: ['memDdr'],
  },
  faqs: [
    {
      id: 'mem-ddr-why-per-bit',
      q: loc('为什么每一位（DQ）都要单独扫描？', 'Why scan each DQ bit separately?'),
      a: loc(
        '每一位的走线长度与内部延迟不同，数据窗口的位置也不同。只扫一位，别的位可能已经在窗口外；逐位扫描才能看清每一位窗口的位置，训练结果才可靠。见 {@memDdr}。',
        'Each bit has its own trace length and internal delay, so its data window sits in a different place. Scanning one bit can miss that others are already outside their windows; a per-bit scan shows where each window is, so the result can be trusted. See {@memDdr}.',
      ),
      lessons: ['memDdr'],
    },
    {
      id: 'mem-ddr-window-closed',
      q: loc('窗口闭合（交集为空）了怎么办？', 'What if the window closes (empty intersection)?'),
      a: loc(
        '说明不存在一个 DQS 延迟能让所有位同时通过。要么减小偏斜（布线对称、逐位 deskew 补偿），要么加宽窗口（降低速率、改善信号完整性）。只调 DQS 延迟救不回来。见 {@memDdr}。',
        'It means no DQS delay lets all bits pass together. Either reduce the skew (symmetric routing, per-bit deskew) or widen the window (lower the rate, improve signal integrity). Adjusting the DQS delay alone cannot recover it. See {@memDdr}.',
      ),
      lessons: ['memDdr'],
    },
  ],
}
