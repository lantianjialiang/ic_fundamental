import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerCheck: loc('自查清单', 'Checklist'),
  kickerError: loc('常见错误', 'Common mistake'),
  kickerCase: loc('返工复盘', 'Rework review'),
  kickerCap: loc('综合项目', 'Capstone'),
  kickerLayer: loc('Gerber 文件', 'Gerber file'),
  introTitle: loc('为什么出图前要再查一遍', 'Why check once more before releasing files'),
  checkTitle: loc('DFM / DFA / DFT 三张清单', 'The DFM / DFA / DFT checklists'),
  checkNote: loc('点图里的三个环节切换清单；逐条勾选，进度会实时更新。每条后面都写了「为什么」。', 'Click a stage in the figure to switch lists; tick each item and the progress updates. Every item says why it matters.'),
  checkDone: loc('已完成', 'Done'),
  total: loc('三张清单合计', 'All three lists'),
  errorTitle: loc('找错：新人最常犯的 10 类错误', 'Spot the error: the 10 most common beginner mistakes'),
  errorNote: loc('这块双层板上藏了 10 处错误。点你觉得有问题的地方（键盘可用 Tab + 回车），找到后会标出编号。', 'This two-layer board hides 10 mistakes. Click wherever you think something is wrong (Tab + Enter works too); found ones get a number.'),
  found: loc('已找到', 'Found'),
  reveal: loc('显示全部', 'Reveal all'),
  reset: loc('重来', 'Start over'),
  allFound: loc('10 处全部找到。出图前把这 10 项当作最后一遍目检清单。', 'All 10 found. Use these 10 as your final visual check before releasing files.'),
  cause: loc('原因：', 'Cause: '),
  effect: loc('后果：', 'Consequence: '),
  fix: loc('改法：', 'Fix: '),
  caught: loc('谁能发现：', 'Who catches it: '),
  caseTitle: loc('返工案例复盘', 'Rework case reviews'),
  caseNote: loc('选一个案例，按「现象 → 根因 → 修复 → 预防」四步看它是怎么被解决的。', 'Pick a case and follow it through symptom → root cause → fix → prevention.'),
  symptom: loc('现象', 'Symptom'),
  root: loc('根因', 'Root cause'),
  repair: loc('修复', 'Fix'),
  prevent: loc('预防', 'Prevention'),
  capTitle: loc('综合项目：一块双层小板', 'Capstone: a small two-layer board'),
  capNote: loc('先选题目，再按工作表逐项自查。点叠层图里的某一层，看这个 Gerber 文件是什么。', 'Pick a project, then work through the worksheet. Click a layer in the stack figure to see what that Gerber file is.'),
  capMust: loc('这块板必须包含：', 'The board must include: '),
  sheetTitle: loc('自查工作表', 'Self-check worksheet'),
  missingTitle: loc('还缺这些：', 'Still missing: '),
  allDone: loc('全部勾完：可以把 Gerber 压缩包、钻孔文件、BOM 和坐标文件一起发给板厂和贴片厂了。', 'Everything ticked: zip the Gerbers and drill file and send them with the BOM and pick-and-place file to the fab and the assembler.'),
  layerIs: loc('这层是：', 'This layer is: '),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '测试点和 ATE 的关系：ICT / 飞针测板子和 ATE 测芯片用的是同一套「加电流、量电压」思路，见数字主线的 PMU 与开短路测试两课。',
    'Test points and the ATE: ICT / flying probe test a board with the same force-current, measure-voltage idea that the ATE uses on a chip; see the PMU and opens/shorts lessons in the main track.',
  ),
  next: loc('下一课：回到主线第一课「什么是半导体测试」', 'Next: the ATE main track, lesson 1 “What semiconductor test is”'),
}

export const INTRO: LText[] = [
  loc(
    'DRC 通过只说明「没违反你设的规则」，不说明板厂做得出、贴片厂贴得上、测试工位测得到。DFM（Design for Manufacturing，可制造性）看板厂 {@pcbFab}，DFA（Design for Assembly，可装配性）看 SMT 产线 {@pcbSupply}，DFT（Design for Test，可测试性）看 ICT / 飞针和功能测试。',
    'Passing DRC only means “no rule you set was broken”; it does not mean the fab can build it, the SMT line can assemble it, or the test station can reach it. DFM (Design for Manufacturing) looks at the fab {@pcbFab}, DFA (Design for Assembly) at the SMT line {@pcbSupply}, and DFT (Design for Test) at ICT / flying probe and functional test.',
  ),
  loc(
    '这三类问题越晚发现越贵：设计阶段改一根线几分钟，打样后改要重新投板一两周，量产后改还要报废库存。所以要在出图前 {@pcbTools} 用清单自查，而不是等板子回来再说。',
    'These problems get more expensive the later they are found: moving a trace at design time takes minutes, after prototyping it means a one-to-two-week re-spin, and in production it also scraps stock. That is why you self-check with a list before releasing files {@pcbTools}, not after the boards come back.',
  ),
  loc(
    '本课最后是全课的综合项目：按 {@pcbFlow} 的流程做一块双层小板，用 {@pcbBasics} 的线宽、铺铜、测试点知识，再用这里的清单和 Gerber 工作表自查。',
    'The lesson ends with the course capstone: build a small two-layer board following the flow in {@pcbFlow}, apply the trace-width, pour and test-point ideas from {@pcbBasics}, then self-check with the lists and the Gerber worksheet here.',
  ),
]

export type GroupId = 'dfm' | 'dfa' | 'dft'

export type CheckItem = { id: string; text: LText; why: LText }

export type CheckGroup = { id: GroupId; title: LText; stage: LText; who: LText; text: LText; link: LText; items: CheckItem[] }

export const GROUPS: CheckGroup[] = [
  {
    id: 'dfm',
    title: loc('DFM 可制造性', 'DFM: manufacturability'),
    stage: loc('PCB 厂', 'PCB fab'),
    who: loc('光板', 'Bare board'),
    text: loc(
      'DFM 问的是：板厂能不能按图把光板做出来、良率高不高。规则来自蚀刻、钻孔、层压这些工序的精度极限，所以要先拿到板厂的工艺能力表，再把数字填进 DRC。',
      'DFM asks whether the fab can build the bare board as drawn, and at what yield. The rules come from the precision limits of etching, drilling and lamination, so get the fab’s capability table first and put its numbers into DRC.',
    ),
    link: loc('每条规则背后的工序见 {@pcbFab}；叠层与孔环见 {@pcbStack}。', 'The process behind each rule: {@pcbFab}; stack-up and annular rings: {@pcbStack}.'),
    items: [
      {
        id: 'm1',
        text: loc('线宽 / 线距 ≥ 板厂能力（常见 0.15 mm / 0.15 mm，即 6/6 mil）', 'Trace / space ≥ fab capability (typically 0.15 / 0.15 mm, i.e. 6/6 mil)'),
        why: loc('蚀刻会侧向吃掉铜（侧蚀），线太细会断、太近会连；低于能力还要加价走精密工艺。', 'Etching also eats copper sideways (undercut): too thin breaks, too close bridges, and going below capability costs extra.'),
      },
      {
        id: 'm2',
        text: loc('最小钻孔 ≥ 0.3 mm，孔环单边 ≥ 0.15 mm', 'Minimum drill ≥ 0.3 mm, annular ring ≥ 0.15 mm per side'),
        why: loc('钻头会偏、层间对位有误差；孔环太窄时孔会钻破焊盘边（破环），连接变弱甚至断开。', 'Drills wander and layers misregister; with a thin ring the hole breaks out of the pad edge, weakening or breaking the connection.'),
      },
      {
        id: 'm3',
        text: loc('铜到板边 ≥ 0.3 mm（V-cut 边 ≥ 0.5 mm）', 'Copper to board edge ≥ 0.3 mm (≥ 0.5 mm at a V-cut)'),
        why: loc('铣边和 V 割有公差，铜太靠边会被切到，露铜毛刺可能和外壳短路。', 'Routing and V-scoring have tolerance; copper too close gets cut, and the exposed burr can short to the enclosure.'),
      },
      {
        id: 'm4',
        text: loc('没有酸角（锐角走线），拐角用 45° 或圆弧', 'No acid traps (acute trace angles); use 45° or arcs at corners'),
        why: loc('锐角夹缝里蚀刻液排不走，会过蚀刻把线吃细；同时也容易藏残留物。', 'Etchant cannot drain from a sharp wedge, so it over-etches and thins the trace; residue also collects there.'),
      },
      {
        id: 'm5',
        text: loc('细间距焊盘之间保留阻焊桥（≥ 0.1 mm）', 'Keep a solder-mask dam (≥ 0.1 mm) between fine-pitch pads'),
        why: loc('阻焊桥太窄会剥落，回流时焊锡就能在两个焊盘之间连桥短路。', 'A too-narrow dam flakes off, and solder can then bridge the two pads during reflow.'),
      },
      {
        id: 'm6',
        text: loc('铺铜分布大致均衡，删除孤岛铜', 'Roughly balanced copper; remove isolated copper islands'),
        why: loc('两面铜量差太多，层压和回流时板会翘；孤岛不接任何网络，像天线一样耦合噪声。', 'Very uneven copper warps the board in lamination and reflow; an island tied to no net couples noise like an antenna.'),
      },
      {
        id: 'm7',
        text: loc('丝印不压焊盘，线宽 ≥ 0.15 mm，字高 ≥ 0.8 mm', 'Silkscreen off pads, line width ≥ 0.15 mm, text height ≥ 0.8 mm'),
        why: loc('油墨落在焊盘上会挡住焊锡；太细太小的字印出来糊成一团，读不出位号。', 'Ink on a pad blocks the solder; lines and text that are too small print as a blur and the reference designators become unreadable.'),
      },
    ],
  },
  {
    id: 'dfa',
    title: loc('DFA 可装配性', 'DFA: assembly'),
    stage: loc('SMT 贴片', 'SMT assembly'),
    who: loc('贴片焊接', 'Placement & solder'),
    text: loc(
      'DFA 问的是：元件能不能被机器贴准、焊好、检查到。问题多半出在封装、定位基准、板边空间和焊盘受热是否均匀。',
      'DFA asks whether parts can be placed accurately, soldered well and inspected. Problems usually come from footprints, alignment references, edge clearance and whether pads heat evenly.',
    ),
    link: loc('锡膏印刷、回流、AOI 见 {@pcbSupply}；封装来源见 {@pcbFlow}；封装外形见 {@pPackage}。', 'Paste printing, reflow and AOI: {@pcbSupply}; where footprints come from: {@pcbFlow}; package outlines: {@pPackage}.'),
    items: [
      {
        id: 'a1',
        text: loc('封装按数据手册或 IPC-7351 做，1:1 打印后把实物放上去比对', 'Footprints from the datasheet or IPC-7351; print 1:1 and lay the real part on it'),
        why: loc('间距错或镜像的封装根本焊不上；纸上比对几分钟就能发现，打样后才发现要重新投板。', 'A wrong-pitch or mirrored footprint cannot be soldered; a paper check finds it in minutes, a prototype finds it with a re-spin.'),
      },
      {
        id: 'a2',
        text: loc('至少 3 个全局 Fiducial（不对称），细间距器件旁加局部 Fiducial', 'At least 3 global fiducials (asymmetric), plus local ones beside fine-pitch parts'),
        why: loc('贴片机相机靠 Fiducial 校正板子的位置和旋转；不对称布置可以防止板子转 180° 放反还被认成对的。', 'The placement camera uses fiducials to correct board position and rotation; an asymmetric layout stops a board loaded 180° from being accepted.'),
      },
      {
        id: 'a3',
        text: loc('元件离板边 ≥ 3–5 mm，否则加 5 mm 工艺边', 'Parts ≥ 3–5 mm from the edge, otherwise add 5 mm tooling rails'),
        why: loc('传送导轨要夹住板边 3–5 mm；分板时板边受力最大，靠边的陶瓷电容容易被掰裂。', 'Conveyor rails grip the outer 3–5 mm; depaneling stresses the edge most, so ceramic capacitors there crack easily.'),
      },
      {
        id: 'a4',
        text: loc('接大铺铜的焊盘用花焊盘（热焊盘）', 'Use thermal reliefs on pads tied to large pours'),
        why: loc('大铜皮把热量吸走，这一端焊锡熔化晚，表面张力把小元件拉立起来（立碑），或形成冷焊。', 'A big pour sinks heat, so that end melts late; surface tension pulls a small part upright (tombstoning) or leaves a cold joint.'),
      },
      {
        id: 'a5',
        text: loc('极性和 1 脚标记清楚，且贴片后仍能看到', 'Clear polarity and pin-1 marks that stay visible after placement'),
        why: loc('标记被元件本体盖住时，AOI 和人工目检就无法判断方向；二极管、电解电容、IC 反了会直接损坏。', 'If the body covers the mark, AOI and visual inspection cannot judge orientation; a reversed diode, electrolytic or IC is damaged outright.'),
      },
      {
        id: 'a6',
        text: loc('过孔不放在焊盘上；必须放时做树脂塞孔 + 电镀盖帽', 'No vias in pads; if unavoidable, resin-fill and cap-plate them'),
        why: loc('开口的过孔像吸管，回流时把焊锡吸到背面，焊点缺锡、空洞，背面还会冒锡珠。', 'An open via acts like a straw: during reflow it wicks solder to the other side, leaving starved, voided joints and solder balls on the back.'),
      },
      {
        id: 'a7',
        text: loc('元件间留返修和 AOI 空间，同类元件方向一致', 'Leave room for rework and AOI; orient similar parts the same way'),
        why: loc('高元件会挡住 AOI 斜射光、挡住烙铁；方向统一能减少贴错和目检时间。', 'Tall parts shadow AOI lighting and block the iron; consistent orientation cuts placement errors and inspection time.'),
      },
    ],
  },
  {
    id: 'dft',
    title: loc('DFT 可测试性', 'DFT: testability'),
    stage: loc('ICT / 飞针 / FCT', 'ICT / flying probe / FCT'),
    who: loc('电测', 'Electrical test'),
    text: loc(
      'DFT 问的是：焊好的板子能不能被测到。ICT 针床或飞针要扎在测试点上，给网络加电流、量电压，查开路、短路、错件；没有落针点的网络就测不到，坏板会流到客户手里。',
      'DFT asks whether the assembled board can be tested. An ICT bed of nails or flying probe lands on test points, forces current and measures voltage on each net to find opens, shorts and wrong parts; a net with no landing point cannot be tested, and bad boards reach the customer.',
    ),
    link: loc(
      '这和 ATE 测芯片是同一个思路：开短路测试 {@fOpens}，PMU 加流测压 {@pmu}；ATE 的负载板本身也是 PCB，同样要留测试点 {@connection}，测试程序会先自检负载板 {@fProgram}。',
      'This is the same idea as testing a chip on an ATE: opens/shorts test {@fOpens}, PMU force-current measure-voltage {@pmu}; the ATE load board is itself a PCB that needs test points {@connection}, and the test program checks the load board first {@fProgram}.',
    ),
    items: [
      {
        id: 't1',
        text: loc('电源、地和关键信号网络各有测试点', 'Test points on every power rail, ground and key signal'),
        why: loc('ICT 只能测针扎得到的网络；电源短路、复位脚开路这类致命故障必须能直接测到。', 'ICT can only test nets a probe can reach; fatal faults like a shorted rail or an open reset pin must be directly measurable.'),
      },
      {
        id: 't2',
        text: loc('测试点直径 ≥ 1.0 mm（飞针可到 0.6 mm），中心距 ≥ 2.54 mm', 'Test pads ≥ 1.0 mm diameter (0.6 mm for flying probe), ≥ 2.54 mm apart'),
        why: loc('针床的探针有位置公差，焊盘太小会扎偏；针距太密，探针粗细放不下。', 'Bed-of-nails probes have position tolerance, so small pads get missed; probes cannot physically fit closer than their own size.'),
      },
      {
        id: 't3',
        text: loc('测试点尽量放在同一面（通常是底面），离高元件 ≥ 3 mm', 'Test points on one side (usually the bottom), ≥ 3 mm from tall parts'),
        why: loc('单面针床比双面便宜很多；高元件会挡住探针，或被治具压坏。', 'A single-sided fixture costs far less than a double-sided one; tall parts block probes or get crushed by the fixture.'),
      },
      {
        id: 't4',
        text: loc('测试点开阻焊窗，不放在 BGA 下面，不拿细间距引脚当测试点', 'Mask-free test pads, none under BGAs, never a fine-pitch pin as a test point'),
        why: loc('阻焊盖住的焊盘探针接触不到；BGA 下面扎不到；直接扎引脚会压坏焊点、扎滑短路。', 'A probe cannot contact a masked pad; nothing under a BGA is reachable; probing a pin damages the joint and can slip into a short.'),
      },
      {
        id: 't5',
        text: loc('留编程 / 调试口（SWD、JTAG、UART）', 'Provide a programming / debug port (SWD, JTAG, UART)'),
        why: loc('功能测试前要先烧录固件，没有接口就只能飞线；这和 ATE 先加载测试程序再测是一个道理。', 'Firmware must be loaded before functional test; without a port you fly wires. It mirrors loading the test program before an ATE run.'),
      },
      {
        id: 't6',
        text: loc('电源支路留 0 Ω 电阻或跳线，方便单独测电流', 'Put a 0 Ω resistor or jumper in each supply branch to measure its current'),
        why: loc('断开 0 Ω 串入电流表就能量出这一路的电流，像 PMU 测 IDD 一样定位漏电或短路的那一块。', 'Removing the 0 Ω and inserting a meter gives that branch’s current, locating a leaky or shorted block the way a PMU IDD test does.'),
      },
    ],
  },
]
