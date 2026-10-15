import { loc, type LText } from '../../../i18n/locale'

export const M = {
  progress: loc('进度', 'Progress'),
  clearChecks: loc('清空勾选', 'Clear ticks'),
  groupDone: loc('这张清单全部勾完。', 'This list is fully ticked.'),
  groupTodo: loc('还有没勾的条目；每一条背后都是一次真实的返工。', 'Some items are still open; behind each one is a real rework.'),
  errorIdle: loc('先点板子上你觉得有问题的地方。点错的地方不会有任何提示，找对了才出编号。', 'Click anywhere on the board that looks wrong. A wrong spot gives no hint; a correct one gets a number.'),
  errorTable: loc('10 类错误一览', 'The 10 mistakes at a glance'),
  colNo: loc('编号', 'No.'),
  colError: loc('错误', 'Mistake'),
  colFix: loc('改法', 'Fix'),
  boardAria: loc('找错用的双层板俯视图，可点击的区域', 'Top view of a two-layer board for the error hunt, clickable regions'),
  boardRegion: loc('电路板区域', 'Board region'),
  boardCap: loc('顶视图，示意，尺寸不按比例。绿色是阻焊，金色是铜，白色是丝印。红框 = 已找到的错误，数字对应下表。', 'Top view, illustrative, not to scale. Green is solder mask, gold is copper, white is silkscreen. A red box = a mistake you found; the number matches the table below.'),
  caseSymptomIdle: loc('点上面的案例卡片。', 'Pick a case card above.'),
  mustTitle: loc('这块板要做到：', 'The board has to cover: '),
  layerTitle: loc('点叠层图里的一行，看这个文件是什么', 'Click a row in the stack figure to see what the file is'),
  stack: loc('Gerber 文件与叠层', 'Gerber files and the stack'),
  missingNone: loc('没有缺项。', 'Nothing missing.'),
  missingCount: loc('还缺', 'Missing'),
  tickAll: loc('全部勾上', 'Tick all'),
  probeCap: loc('侧视剖面示意。针床的弹簧探针从下往上顶在板子底面的测试点上；探针头只有几毫米，所以测试点必须够大、开了阻焊窗、位置准。', 'Side-view cross-section, illustrative. The spring probes of a bed-of-nails push up from below onto the bottom-side test pads; the tip is only a couple of millimetres wide, so a pad must be big enough, mask-opened and well placed.'),
  probeAria: loc('针床探针接触测试点的三种情况', 'Three cases of a bed-of-nails probe meeting a test pad'),
  probeBoard: loc('板子，底面朝下', 'Board, bottom side down'),
  probeProbe: loc('弹簧探针', 'Spring probe'),
  probePlate: loc('治具底板', 'Fixture plate'),
  probeGood: loc('可测：1.0 mm 焊盘，阻焊开窗', 'OK: 1.0 mm pad, mask opened'),
  probeMask: loc('不可测：阻焊盖住焊盘', 'Fail: mask covers the pad'),
  probeSmall: loc('不可测：焊盘太小，探针偏了', 'Fail: pad too small, probe off'),
}

/** 把几段 LText 拼成一段，中文直接相连，英文用空格隔开 */
export function joinText(parts: LText[]): LText {
  return loc(
    parts.map((p) => p.zh).join(''),
    parts.map((p) => p.en ?? p.zh).join(' '),
  )
}
