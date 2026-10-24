import { loc, type LText } from '../../i18n/locale'
import type { QuizQuestion } from '../../lab/QuizList'
import type { DutKey, IssueCode, ParseErrorCode } from './model/stdf'

export const S = {
  nextPrefix: loc('下一课：', 'Next: '),
  kickerNow: loc('这一次的判断', 'Current check'),
  introTitle: loc('STDF：ATE 测试结果的标准文件', 'STDF: the standard file for ATE results'),
  coreTitle: loc('拨一拨：字节、记录与统计', 'Try it: bytes, records and statistics'),
  coreNote: loc(
    '三个视图用的是同一套记录：字节浏览器看“字节怎么排”，组装看“记录该按什么顺序排”，本地解析看“统计从哪里来”。示例批次由仿真生成，不含任何真实客户数据。',
    'The three views use the same records: the byte browser shows how bytes are laid out, the assembler shows the required record order, and local parsing shows where the statistics come from. The sample lot is simulated and contains no real customer data.',
  ),
  viewBytes: loc('字节浏览器', 'Byte browser'),
  viewAssemble: loc('组装并导出', 'Assemble and export'),
  viewLocal: loc('本地解析与统计', 'Local parse and statistics'),
  endianLabel: loc('写出的字节序', 'Written byte order'),
  endianLE: loc('小端（CPU_TYPE 2）', 'Little-endian (CPU_TYPE 2)'),
  endianBE: loc('大端（CPU_TYPE 1）', 'Big-endian (CPU_TYPE 1)'),
  byteHint: loc(
    '点任一字节，右侧表里对应的字段高亮；点字段，它占用的字节高亮。同一条记录里其它字段用浅色标出。',
    'Click any byte to highlight its field in the table; click a field to highlight the bytes it uses. Other fields of the same record are shaded lightly.',
  ),
  byteHeadNote: loc(
    'FAR 的 REC_LEN 恒为 2：小端写成 02 00，大端写成 00 02。读取端只看文件开头两个字节就能判断字节序；换成大端，同一份数据的字节完全不同，但解析结果一样。',
    'FAR’s REC_LEN is always 2: little-endian writes 02 00 and big-endian writes 00 02. A reader only needs the first two bytes to decide the byte order. Switching to big-endian changes every multi-byte value on disk, yet the parsed result is the same.',
  ),
  detectLabel: loc('识别到的字节序', 'Detected byte order'),
  detectLE: loc('小端', 'Little-endian'),
  detectBE: loc('大端', 'Big-endian'),
  detectNone: loc('无法识别', 'Not recognised'),
  colOffset: loc('偏移', 'Offset'),
  colField: loc('字段', 'Field'),
  colType: loc('类型', 'Type'),
  colValue: loc('值', 'Value'),
  recordHead: loc('记录', 'Record'),
  selectedTitle: loc('当前选中', 'Selected'),
  assembleHint: loc(
    '按标准顺序排好 11 条记录，并把 PRR 的 HARD_BIN 改成 VOH 失效对应的 Bin，校验通过后才能导出。可以用“上移 / 下移”调顺序。',
    'Order the 11 records into the standard sequence and set the PRR HARD_BIN to the bin for the VOH failure. Export is only allowed after validation passes. Use “Move up / Move down” to reorder.',
  ),
  assembleMap: loc(
    '失效到 Bin 的对应表：VOH → Hard Bin 2 / Soft Bin 21；IDD → 3 / 31；IIL → 4 / 41；全部通过 → Bin 1。PRR 的 HARD_BIN 必须和这里对得上。',
    'Failure-to-bin map: VOH → hard bin 2 / soft bin 21; IDD → 3 / 31; IIL → 4 / 41; all pass → bin 1. The PRR HARD_BIN must match this table.',
  ),
  moveUp: loc('上移', 'Move up'),
  moveDown: loc('下移', 'Move down'),
  binLabel: loc('PRR 的 HARD_BIN', 'PRR HARD_BIN'),
  validOk: loc('校验通过，可以导出。', 'Validation passed; ready to export.'),
  validBad: loc('校验未通过，先修正下面的问题。', 'Validation failed; fix the issues below first.'),
  issueLine: loc('第 {n} 条：{msg}', 'Record {n}: {msg}'),
  exportBtn: loc('导出 .stdf', 'Export .stdf'),
  exported: loc(
    '已导出。导出前用同一解析器重新读回：颗数与 Hard Bin 都和组装的内容一致。',
    'Exported. Before the download, the same parser read the file back: part count and hard bin match what you assembled.',
  ),
  localHint: loc(
    '选择一个 .stdf 文件，浏览器直接在本页读取并解析。文件不会上传到任何服务器，关闭页面后数据即消失。',
    'Choose a .stdf file and the browser reads and parses it on this page. The file is never uploaded to any server; it is gone once the page is closed.',
  ),
  pickBtn: loc('选择 .stdf 文件', 'Choose .stdf file'),
  pickAria: loc('选择本地 STDF 文件', 'Choose a local STDF file'),
  sourceSample: loc('当前数据：示例批次（仿真生成后写成 STDF，再读回统计）', 'Current data: sample lot (simulated, written to STDF, then read back)'),
  sourceLocal: loc('当前数据：本地文件 {name}', 'Current data: local file {name}'),
  sourceBack: loc('恢复示例批次', 'Back to sample lot'),
  tooLarge: loc('文件超过 20 MB，本页不解析大文件。', 'Files over 20 MB are not parsed on this page.'),
  readFail: loc('读取文件失败，请换一个文件再试。', 'Could not read the file; try another one.'),
  fileInfo: loc('文件 {name}，{size} 字节，{records} 条记录', 'File {name}, {size} bytes, {records} records'),
  statParts: loc('颗数', 'Parts'),
  statYield: loc('良率（Hard Bin 1）', 'Yield (hard bin 1)'),
  statPass: loc('通过', 'Pass'),
  statFail: loc('失效', 'Fail'),
  statLot: loc('批次 LOT_ID', 'Lot LOT_ID'),
  statType: loc('产品 PART_TYP', 'Part PART_TYP'),
  statOrder: loc('字节序', 'Byte order'),
  statBins: loc('Hard Bin 柱图', 'Hard bin chart'),
  statParam: loc('参数分布与 Cpk', 'Parameter distribution and Cpk'),
  statMean: loc('均值 μ', 'Mean μ'),
  statSd: loc('标准差 σ', 'Std dev σ'),
  statLimits: loc('限值', 'Limits'),
  statNoLimit: loc('无限值', 'no limit'),
  statCpk: loc('Cpk', 'Cpk'),
  statFails: loc('失效数', 'Fail count'),
  statBinNote: loc(
    'Bin 柱图：每根柱是一个 Hard Bin 的颗数。Bin 1 是通过，其余柱对应失效项；每颗器件只进一个 Bin，由第一个失效项决定。',
    'Bin chart: each bar is the part count of one hard bin. Bin 1 is pass; the other bars map to failing items. Each part lands in one bin, decided by its first failing item.',
  ),
  statParamNote: loc(
    '参数分布：灰柱是测得值的频数，红虚线是 LO_LIMIT / HI_LIMIT。限值外的颗数就是该参数的失效数。Cpk 直接用本批的 RESULT 与限值算：min(USL−μ, μ−LSL)/(3σ)；计算方法与判读见 {@anaStats}。',
    'Parameter distribution: grey bars count measured values; red dashed lines are LO_LIMIT / HI_LIMIT. Parts outside the limits are this parameter’s fails. Cpk is computed directly from this batch’s RESULT and limits: min(USL−μ, μ−LSL)/(3σ); see {@anaStats} for the method and how to read it.',
  ),
  statBinAria: loc('Hard Bin 柱图，显示每个 Bin 的颗数', 'Hard bin bar chart showing the part count in each bin'),
  statHistAria: loc('参数测得值直方图，虚线为限值', 'Histogram of measured values; dashed lines are the limits'),
  statNoData: loc('没有可统计的颗数。', 'No parts to summarise.'),
  taskTitleNote: loc('完成情况由当前操作自动判定。', 'Judged automatically from your actions.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  prereqTitle: loc('补充：本课用到的预设知识', 'Supplement: background used in this lesson'),
  prereqNote: loc('正文里的字节、字段宽度和统计公式都从这里推出。', 'The byte layouts, field widths and statistics formulas in the lesson are built from these.'),
  asideLater: loc(
    '这里只实现 STDF V4 的教学子集：FAR、MIR、PIR、PTR、PRR、PCR、HBR、SBR、MRR。WIR / WRR（晶圆级）、FTR、MPR 等记录读取时整段跳过。规范字段以 STDF V4 为准。',
    'This lesson implements a teaching subset of STDF V4: FAR, MIR, PIR, PTR, PRR, PCR, HBR, SBR and MRR. WIR / WRR (wafer level), FTR and MPR are skipped as whole records when read. Field layouts follow STDF V4.',
  ),
}

export const INTRO: LText[] = [
  loc(
    'ATE 每测完一颗器件，都要把结果留下来：每个测试项测得多少、判了 Pass 还是 Fail、最后进了哪个 Bin。这些结果写成 STDF（Standard Test Data Format）文件，它就是 Datalog 的标准形式。良率统计、失效分析和跨机台比对都读它；测试流程的结构见 {@ate}。',
    'After each DUT is tested, the ATE keeps the results: how much each item measured, Pass or Fail, and the final bin. Written as an STDF (Standard Test Data Format) file, this is the standard form of a datalog. Yield statistics, failure analysis and cross-tester comparison all read it; the test-flow structure is in {@ate}.',
  ),
  loc(
    'Datalog 分两层：Part 级（器件编号、Site、Hard Bin 与 Soft Bin）和 Test 级（每个测试项的测得值、限值与判定）。STDF 也分两层：一颗器件对应一组 PTR，最后用一条 PRR 收尾。',
    'A datalog has two levels: part level (device ID, site, hard bin and soft bin) and test level (each item’s measured value, limits and verdict). STDF mirrors both: one device is a group of PTR records, closed by one PRR.',
  ),
  loc(
    '读懂 STDF 不需要背字段表。先认字节序，再认记录头，最后认几条核心记录。下面三个视图按这个顺序走：看字节、组装一颗器件的记录、解析一个文件并算统计。',
    'You do not need to memorise every field. Learn the byte order first, then the record header, then a few core records. The three views below follow that order: look at the bytes, assemble one device’s records, then parse a file and compute statistics.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'STDF 是文本文件，用记事本打开改个数字就行。STDF 是二进制记录流：数字按 U1 / U2 / U4 / R4 的固定字节宽度和字节序存放，改一个字节就可能让后面所有记录错位，还会把 REC_LEN 算错。',
    'STDF is a text file; you can edit a number in a notepad. STDF is a binary record stream: numbers are stored with fixed widths (U1 / U2 / U4 / R4) and a byte order, so changing one byte can shift every record after it and break the REC_LEN values.',
  ),
  loc(
    'PRR 的 Bin 写成 1，就不用再看 PTR 了。PRR 的 HARD_BIN 是测试程序的结论，应当和失效的 PTR 对得上；两者矛盾说明文件或程序有问题，组装时的校验器就会报 BIN_PASS_WITH_FAIL。',
    'If PRR says bin 1, there is no need to look at the PTRs. PRR’s HARD_BIN is the test program’s conclusion and must agree with the failing PTRs; a contradiction means the file or the program is wrong. The assembly validator reports it as BIN_PASS_WITH_FAIL.',
  ),
  loc(
    '字节序只是实现细节，随便按一种读就行。FAR 的 REC_LEN 恒为 2：按小端读是 02 00，按大端读是 00 02。读错字节序，每条记录的长度都会错，解析直接失败。',
    'Byte order is an implementation detail; either reading works. FAR’s REC_LEN is always 2: read little-endian it is 02 00, big-endian it is 00 02. Read with the wrong order, every record length is wrong and parsing fails outright.',
  ),
]

export const TAKEAWAY: LText = loc(
  '记录头 REC_LEN / REC_TYP / REC_SUB 决定每条记录怎么切，FAR 的 REC_LEN 恒为 2，用它判断字节序。Datalog 的层次是 PIR → PTR… → PRR：PTR 是 Test 级，PRR 是 Part 级，HARD_BIN 决定料盘，SOFT_BIN 记录程序里的细分类。统计（Pass / Fail、Bin 柱图、参数分布、Cpk）都由这些记录算出，没有任何结果是凭空来的。',
  'The record header (REC_LEN, REC_TYP, REC_SUB) decides where each record starts and ends; FAR’s REC_LEN is always 2, which tells you the byte order. The datalog runs PIR → PTR… → PRR: PTR is test level, PRR is part level, HARD_BIN decides the tray and SOFT_BIN is the finer category inside the program. Every statistic (Pass / Fail, bin chart, distribution, Cpk) is computed from these records.',
)

/** 组装实验里每条记录的中文 / 英文名称 */
export const DUT_LABEL: Record<DutKey, LText> = {
  FAR: loc('FAR · 文件头（CPU_TYPE、STDF_VER）', 'FAR · file header (CPU_TYPE, STDF_VER)'),
  MIR: loc('MIR · 批次信息（LOT_ID、PART_TYP）', 'MIR · lot info (LOT_ID, PART_TYP)'),
  PIR: loc('PIR · 器件开始（HEAD_NUM、SITE_NUM）', 'PIR · part start (HEAD_NUM, SITE_NUM)'),
  PTR_VOH: loc('PTR · 测试项 1001 VOH', 'PTR · test 1001 VOH'),
  PTR_IDD: loc('PTR · 测试项 1002 IDD', 'PTR · test 1002 IDD'),
  PTR_IIL: loc('PTR · 测试项 1003 IIL', 'PTR · test 1003 IIL'),
  PRR: loc('PRR · 器件结束（HARD_BIN、SOFT_BIN）', 'PRR · part end (HARD_BIN, SOFT_BIN)'),
  PCR: loc('PCR · 颗数计数（PART_CNT、GOOD_CNT）', 'PCR · part counts (PART_CNT, GOOD_CNT)'),
  HBR: loc('HBR · 硬 Bin 计数', 'HBR · hard bin count'),
  SBR: loc('SBR · 软 Bin 计数', 'SBR · soft bin count'),
  MRR: loc('MRR · 批次结束（最后一条）', 'MRR · lot end (last record)'),
}

export const ISSUE_TEXT: Record<IssueCode, LText> = {
  EMPTY: loc('记录为空。', 'No records.'),
  FAR_NOT_FIRST: loc('第一条必须是 FAR：它告诉读取端字节序和版本。', 'The first record must be FAR: it tells the reader the byte order and version.'),
  MIR_NOT_SECOND: loc('MIR 必须紧跟 FAR，它是批次级信息。', 'MIR must directly follow FAR; it is lot-level information.'),
  PTR_OUTSIDE_PART: loc('PTR 只能夹在 PIR 与 PRR 之间，它属于某一颗器件。', 'PTR must sit between PIR and PRR; it belongs to one device.'),
  PART_NOT_CLOSED: loc('PIR 之后没有 PRR 收尾，这颗器件的记录不完整。', 'The PIR is not closed by a PRR; this device’s records are incomplete.'),
  PRR_WITHOUT_PIR: loc('PRR 前面没有对应的 PIR。', 'This PRR has no matching PIR before it.'),
  PART_AFTER_SUMMARY: loc('器件记录不能放在汇总记录（PCR / HBR / SBR）之后。', 'Device records cannot come after the summary records (PCR / HBR / SBR).'),
  NO_PART: loc('没有任何器件记录（PIR…PRR）。', 'There are no device records (PIR…PRR).'),
  MISSING_PCR: loc('缺少 PCR（颗数计数）。', 'Missing PCR (part counts).'),
  BIN_PASS_WITH_FAIL: loc('PRR 的 HARD_BIN 写了 1（通过），但这颗器件有失效的 PTR。', 'PRR HARD_BIN is 1 (pass), but this device has a failing PTR.'),
  BIN_FAIL_WITHOUT_TEST: loc('PRR 的 HARD_BIN 不是 1，但没有失效的 PTR。', 'PRR HARD_BIN is not 1, but no PTR failed.'),
  BIN_NOT_IN_HBR: loc('PRR 的 HARD_BIN 在 HBR 里找不到对应的计数。', 'The PRR HARD_BIN has no matching count in HBR.'),
  MRR_NOT_LAST: loc('MRR 必须是最后一条。', 'MRR must be the last record.'),
  MISSING_MRR: loc('最后一条必须是 MRR。', 'The last record must be MRR.'),
}

export const PARSE_ERROR_TEXT: Record<ParseErrorCode, LText> = {
  EMPTY: loc('文件为空。', 'The file is empty.'),
  NOT_FAR: loc('文件开头不是 FAR 记录，不是 STDF V4 文件。', 'The file does not start with a FAR record; it is not an STDF V4 file.'),
  TRUNCATED_HEADER: loc('记录头被截断，文件不完整。', 'A record header is truncated; the file is incomplete.'),
  TRUNCATED_RECORD: loc('某条记录的数据被截断，文件不完整。', 'A record’s data is truncated; the file is incomplete.'),
  FIELD_OVERRUN: loc('某个字段超出了记录长度，字节可能损坏。', 'A field runs past its record length; the bytes may be corrupted.'),
}

export const TASKS = {
  t1: loc(
    '在字节浏览器里点选至少 3 种不同的字段，并说出 REC_LEN 为什么能判断字节序。',
    'In the byte browser, click at least 3 different fields and explain how REC_LEN tells the byte order.',
  ),
  t2: loc(
    '把 11 条记录排成标准顺序，把 PRR 的 HARD_BIN 改成 2，校验通过后导出一个 .stdf。',
    'Order the 11 records into the standard sequence, set the PRR HARD_BIN to 2, and export a .stdf once validation passes.',
  ),
  t3: loc(
    '选择一个 .stdf 文件在本页解析（可以用上一步导出的文件）。文件不会上传。',
    'Choose a .stdf file and parse it on this page (you can use the file from the previous step). It is not uploaded.',
  ),
  t4: loc('在统计面板里切换过至少两个参数，读出各自的 Cpk 与失效数。', 'In the statistics panel, switch between at least two parameters and read each Cpk and fail count.'),
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么说 FAR 的 REC_LEN 恒为 2 可以用来判断字节序？', 'Why does FAR’s REC_LEN being always 2 let a reader tell the byte order?'),
    options: [
      { id: 'a', text: loc('FAR 的 REC_LEN 永远是 0，靠它区分大小端。', 'FAR’s REC_LEN is always 0, so it can tell the two orders apart.') },
      {
        id: 'b',
        text: loc(
          '文件开头是 02 00 就是小端，00 02 就是大端；只有一种读法得到 2。',
          'If the file starts with 02 00 it is little-endian; 00 02 means big-endian. Only one reading gives 2.',
        ),
      },
      { id: 'c', text: loc('CPU_TYPE 决定 REC_LEN 的长度。', 'CPU_TYPE decides the length of REC_LEN.') },
      { id: 'd', text: loc('REC_LEN 是 U4，所以总是能判断。', 'REC_LEN is U4, so it always works.') },
    ],
    answer: 'b',
    explain: loc(
      'FAR 只有 CPU_TYPE 与 STDF_VER 两个 U1 字段，数据长度恒为 2。文件开头 02 00 按小端读出 2，00 02 按大端读出 2；读取端据此决定整个文件怎么解码。',
      'FAR has only two U1 fields, so its data length is always 2. The first bytes 02 00 read as 2 in little-endian; 00 02 reads as 2 in big-endian. The reader uses this to decode the whole file.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('PTR 与 PRR 的关系是什么？', 'What is the relationship between PTR and PRR?'),
    options: [
      { id: 'a', text: loc('PTR 是 Part 级汇总，PRR 是 Test 级明细。', 'PTR is part-level summary; PRR is test-level detail.') },
      {
        id: 'b',
        text: loc(
          'PRR 收尾一颗器件，它前面的每条 PTR 是这颗器件某一测试项的测得值与判定。',
          'PRR closes one device; each PTR before it is that device’s measured value and verdict for one test item.',
        ),
      },
      { id: 'c', text: loc('PRR 只在晶圆测试里出现。', 'PRR only appears in wafer test.') },
      { id: 'd', text: loc('两者没有关系，各自独立。', 'They are unrelated and independent.') },
    ],
    answer: 'b',
    explain: loc(
      'Test 级数据（PTR，每项一条）归属于 Part 级的一颗器件；PRR 给出这颗器件的 HARD_BIN 与 SOFT_BIN。',
      'Test-level data (one PTR per item) belongs to one part; the PRR gives that part’s HARD_BIN and SOFT_BIN.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('Hard Bin 与 Soft Bin 有什么不同？', 'How do hard bins differ from soft bins?'),
    options: [
      { id: 'a', text: loc('Hard Bin 是测试程序里的细分类，Soft Bin 决定料盘。', 'Hard bin is a fine category in the test program; soft bin decides the tray.') },
      {
        id: 'b',
        text: loc(
          'Hard Bin 决定料盘与分拣（物理分类）；Soft Bin 是测试程序的逻辑分类，可以比 Hard Bin 更细。',
          'Hard bin decides the tray and sorting (physical category); soft bin is the program’s logical category and can be finer than hard bin.',
        ),
      },
      { id: 'c', text: loc('二者完全相同，只是命名不同。', 'They are identical; only the names differ.') },
      { id: 'd', text: loc('Soft Bin 只出现在 CP 中。', 'Soft bin only appears in CP.') },
    ],
    answer: 'b',
    explain: loc(
      'HARD_BIN 驱动 Handler / Prober 的分拣，SOFT_BIN 记录程序里的分类；同一个 Hard Bin 可以包含多个 Soft Bin。',
      'HARD_BIN drives handler or prober sorting; SOFT_BIN records the program’s categories. One hard bin can contain several soft bins.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('PTR 的 TEST_FLG 设置 bit 7（值 0x80 = 128）表示什么？', 'What does setting bit 7 (0x80 = 128) in a PTR’s TEST_FLG mean?'),
    options: [
      { id: 'a', text: loc('测试失败。', 'The test failed.') },
      { id: 'b', text: loc('使用了备用限值。', 'Alternate limits were used.') },
      { id: 'c', text: loc('测试超时。', 'The test timed out.') },
      { id: 'd', text: loc('这一项没有执行。', 'The item was not executed.') },
    ],
    answer: 'a',
    explain: loc(
      '规范里 TEST_FLG 的 bit 7 为 1 表示 Test failed；bit 6 为 0 表示 pass / fail 位有效。本页写出的失效 PTR 用的就是这一位。',
      'In the spec, TEST_FLG bit 7 set to 1 means the test failed, and bit 6 at 0 means the pass / fail bit is valid. The failing PTRs written on this page use this bit.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('用本页的本地解析时，浏览器做了什么？', 'What does the browser do when you parse a local file on this page?'),
    options: [
      { id: 'a', text: loc('把文件上传到服务器，由服务器解析后返回结果。', 'Uploads the file to a server, which parses it and returns results.') },
      {
        id: 'b',
        text: loc(
          '在浏览器里用 File 读成 ArrayBuffer 再解析，文件不离开本机。',
          'Reads the file into an ArrayBuffer inside the browser and parses it there; the file never leaves the machine.',
        ),
      },
      { id: 'c', text: loc('只能读取 CSV 格式。', 'Can only read CSV.') },
      { id: 'd', text: loc('需要安装专门的插件。', 'Requires a special plug-in.') },
    ],
    answer: 'b',
    explain: loc(
      '解析器是纯前端代码（见 model/stdf.ts 的 parseStdf），输入是 File.arrayBuffer() 得到的字节，没有任何网络请求。',
      'The parser is plain front-end code (parseStdf in model/stdf.ts) that takes the bytes from File.arrayBuffer(); there is no network request.',
    ),
  },
]

export const PREREQ: LText[] = [
  loc(
    '十六进制：一个字节是 0–255，写成两位十六进制 00–FF。0x80 = 128，0x40 = 64，0x0A = 10。',
    'Hexadecimal: one byte is 0–255, written as two hex digits 00–FF. 0x80 = 128, 0x40 = 64, 0x0A = 10.',
  ),
  loc(
    '小端与大端：多字节整数的字节排列。0x1234 小端写成 34 12，大端写成 12 34。读错顺序，数值就完全变了。',
    'Little-endian and big-endian: the byte order of a multi-byte integer. 0x1234 is stored as 34 12 in little-endian and 12 34 in big-endian. Reading with the wrong order changes the value completely.',
  ),
  loc(
    '定长与变长字段：U1 占 1 字节，U2 占 2 字节，U4 占 4 字节；Cn 是 1 字节长度加 n 个字符，最长 255。PIR 只有两个 U1，长度固定；PTR 里的字符串是变长的。',
    'Fixed and variable fields: U1 takes 1 byte, U2 2 bytes, U4 4 bytes; Cn is a 1-byte length followed by n characters, up to 255. PIR is two U1 fields with a fixed length; strings inside PTR are variable length.',
  ),
  loc(
    'IEEE 754 单精度（R4）占 4 字节：1 位符号、8 位指数、23 位尾数。3.3 不能精确表示，读回的是 3.2999999…，显示时要取有效位数。',
    'IEEE 754 single precision (R4) takes 4 bytes: 1 sign bit, 8 exponent bits and 23 mantissa bits. 3.3 has no exact binary form, so it reads back as 3.2999999…; display it with a sensible number of digits.',
  ),
  loc(
    '位域（B1）：一个字节的 8 个位各表示一个标志，例如 TEST_FLG 的 bit 7 = 测试失败、bit 6 = pass / fail 位无效。用“与”运算取位：flag & 0x80。',
    'Bit field (B1): each of the 8 bits of a byte is a flag; for example TEST_FLG bit 7 = test failed, bit 6 = pass / fail bit invalid. Read a bit with AND: flag & 0x80.',
  ),
  loc(
    '统计：均值 μ 是平均，样本标准差 σ 用 n−1 作分母。Cpk = min(USL − μ, μ − LSL) / (3σ)，它只取离限值较近的一侧。',
    'Statistics: the mean μ is the average; the sample standard deviation σ uses n−1 as its denominator. Cpk = min(USL − μ, μ − LSL) / (3σ), which takes the side closer to a limit.',
  ),
]
