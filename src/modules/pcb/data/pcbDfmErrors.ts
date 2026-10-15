import { loc, type LText } from '../../../i18n/locale'

export type ErrorId = 'pitch' | 'silk' | 'ring' | 'tp' | 'fid' | 'edge' | 'thermal' | 'acid' | 'polar' | 'vip'

export type DfmError = { id: ErrorId; title: LText; cause: LText; effect: LText; fix: LText; caught: LText }

export const ERRORS: DfmError[] = [
  {
    id: 'pitch',
    title: loc('封装间距错 / 镜像', 'Wrong footprint pitch / mirrored'),
    cause: loc('U2 是 SOIC-8，引脚间距 1.27 mm，但封装画成了 1.0 mm；或者把底视图当顶视图画，1 脚跑到了另一边。', 'U2 is an SOIC-8 with 1.27 mm pitch, but the footprint was drawn at 1.0 mm; or a bottom view was drawn as a top view, putting pin 1 on the wrong side.'),
    effect: loc('外侧引脚落在焊盘外面，焊不上或连到隔壁；镜像时每个脚都接错，芯片可能上电即坏。', 'The outer leads land off their pads, so they do not solder or bridge to a neighbour; when mirrored every pin is wrong and the chip may die at power-up.'),
    fix: loc('按数据手册的推荐焊盘图或 IPC-7351 重做封装，确认是顶视图；1:1 打印，把实物放上去比对。', 'Rebuild from the datasheet land pattern or IPC-7351, confirm it is a top view, print 1:1 and lay the real part on it.'),
    caught: loc('只有封装评审和打印比对能发现，DRC 查不出：DRC 只检查你画的东西彼此是否冲突。', 'Only a footprint review and a paper check catch it; DRC cannot, because it only checks your drawing against itself.'),
  },
  {
    id: 'silk',
    title: loc('丝印压焊盘', 'Silkscreen on pads'),
    cause: loc('R1 的丝印框和位号直接画在了焊盘上。', 'R1’s silkscreen outline and designator were drawn right over its pads.'),
    effect: loc('油墨不沾锡，焊盘有效面积变小，焊点虚焊；板厂一般会自动削掉压焊盘的丝印，位号就残缺看不清。', 'Ink does not wet, so the usable pad shrinks and joints are weak; fabs usually clip silk off pads automatically, leaving the designator broken and unreadable.'),
    fix: loc('丝印离焊盘 ≥ 0.15 mm，位号放在元件旁边且贴片后看得见；打开「丝印到阻焊开窗」DRC 规则。', 'Keep silk ≥ 0.15 mm from pads, place designators beside the part where they stay visible, and enable the silk-to-mask-opening DRC rule.'),
    caught: loc('DRC（丝印到焊盘间距规则）和板厂 CAM 工程师。', 'DRC (silk-to-pad clearance rule) and the fab’s CAM engineer.'),
  },
  {
    id: 'ring',
    title: loc('孔太小 / 孔环太薄', 'Drill too small / annular ring too thin'),
    cause: loc('这个过孔焊盘 0.6 mm 却配 0.5 mm 钻孔，孔环单边只剩 0.05 mm；钻头稍偏就钻破焊盘边。旁边另一个过孔是 0.2 mm 小孔，低于常规能力。', 'This via has a 0.6 mm pad with a 0.5 mm drill, leaving only 0.05 mm of ring per side, so a slightly wandering drill breaks out of the pad. The via beside it uses a 0.2 mm drill, below standard capability.'),
    effect: loc('破环处走线和孔壁只连一点点，热循环后开裂成开路；小孔需要激光或精密钻，打样价和交期都上去。', 'At the breakout the trace barely touches the barrel and cracks open after thermal cycling; tiny holes need laser or precision drilling, raising price and lead time.'),
    fix: loc('常规用 0.3 mm 钻孔 + 0.6 mm 焊盘（单边孔环 0.15 mm）；把板厂的最小孔径和孔环填进 DRC。', 'Use a 0.3 mm drill with a 0.6 mm pad (0.15 mm ring per side) as standard, and put the fab’s minimum drill and ring into DRC.'),
    caught: loc('DRC（孔径 / 孔环规则）和板厂 DFM 报告。', 'DRC (hole size / annular ring rules) and the fab’s DFM report.'),
  },
  {
    id: 'tp',
    title: loc('没留测试点', 'No test points'),
    cause: loc('U1 引出的 SWD、复位这几根信号线一路走到底，没有任何测试点；整块板只有电源区留了 TP1、TP2。', 'The SWD and reset lines leaving U1 run end to end with no test point at all; the only test points on the board are TP1 and TP2 in the power section.'),
    effect: loc('ICT / 飞针扎不到这些网络，这几根线开路或短路都测不出来；无法烧录时也只能飞线调试。', 'ICT / flying probe cannot reach these nets, so opens or shorts on them go undetected; when programming fails the only way in is fly wires.'),
    fix: loc('每个关键网络加 ≥ 1.0 mm 的测试焊盘，间距 ≥ 2.54 mm，尽量放底面；编程口做成标准排针或 Tag-Connect 焊盘。', 'Add a ≥ 1.0 mm test pad on each key net, ≥ 2.54 mm apart, preferably on the bottom; make the programming port a standard header or Tag-Connect footprint.'),
    caught: loc('DFT 评审、测试工程师做测试覆盖率分析时。', 'DFT review, or the test engineer’s test-coverage analysis.'),
  },
  {
    id: 'fid',
    title: loc('没有 Fiducial', 'No fiducials'),
    cause: loc('板角只有安装孔，整块板没有一个 Fiducial（全局基准点），0.5 mm 间距的 U1 旁边也没有局部基准点。', 'The corners have only mounting holes; there is no fiducial (global reference mark) on the board, and no local fiducial next to U1’s 0.5 mm pitch leads.'),
    effect: loc('贴片机相机找不到基准，只能靠板边机械定位，误差 0.1 mm 级，细间距器件会贴偏、连锡。', 'The placement camera has no reference and must rely on the board edge, with errors around 0.1 mm, so fine-pitch parts land offset and bridge.'),
    fix: loc('板上放 3 个不对称的全局 Fiducial（1 mm 裸铜圆点 + 2 mm 无阻焊区），QFP / BGA 对角加 2 个局部 Fiducial；拼板的工艺边上也要有。', 'Place 3 asymmetric global fiducials (1 mm bare-copper dot in a 2 mm mask-free area) and 2 local ones diagonally around the QFP / BGA; the panel rails need them too.'),
    caught: loc('SMT 厂的 DFA 审查；DRC 不会报，因为没有 Fiducial 不违反任何电气规则。', 'The SMT house’s DFA review; DRC never flags it because a missing fiducial breaks no electrical rule.'),
  },
  {
    id: 'edge',
    title: loc('元件太靠板边 / 没有工艺边', 'Parts at the board edge / no tooling rail'),
    cause: loc('C7、C8 两颗电容离板边不到 1 mm，板子四周也没有工艺边。', 'C7 and C8 sit less than 1 mm from the edge, and the board has no tooling rail around it.'),
    effect: loc('传送导轨要夹住板边 3–5 mm，这里无处可夹；分板时边缘应力最大，陶瓷电容会微裂，日后变成时好时坏的短路。', 'Conveyor rails need the outer 3–5 mm to grip and there is none; depaneling stresses the edge most, so ceramic capacitors micro-crack and later become intermittent shorts.'),
    fix: loc('元件离板边 ≥ 3–5 mm；做不到就拼板加 5 mm 工艺边；电容长轴平行于 V 割线、远离分板点。', 'Keep parts ≥ 3–5 mm from the edge; if you cannot, panelize with 5 mm rails; orient capacitors parallel to the V-cut and away from break-off tabs.'),
    caught: loc('SMT 厂 DFA 审查；裂纹本身要等可靠性测试或客户退货才暴露。', 'The SMT house’s DFA review; the cracks themselves only show up in reliability test or customer returns.'),
  },
  {
    id: 'thermal',
    title: loc('大铺铜没做花焊盘', 'No thermal relief on a large pour'),
    cause: loc('C5 右焊盘整块连进 GND 大铜皮，左焊盘只接一根细线；对比旁边 C6 用了四根辐条的花焊盘。', 'C5’s right pad is solidly merged into the GND pour while its left pad has a thin trace; compare C6 next to it, which uses a four-spoke thermal relief.'),
    effect: loc('回流时大铜皮吸热，右端焊锡熔化晚，左端先熔的焊锡表面张力把元件拉立起来（立碑）；手工焊也很难焊透，易冷焊。', 'In reflow the pour sinks heat so the right end melts late, and surface tension on the already-molten left end stands the part up (tombstoning); hand soldering struggles too, leaving cold joints.'),
    fix: loc('接铺铜的焊盘用花焊盘（2–4 根辐条），两端走线宽度对称；大电流焊盘可以用更宽的辐条。', 'Use thermal reliefs (2–4 spokes) on pads tied to pours and keep both ends’ copper symmetric; high-current pads can use wider spokes.'),
    caught: loc('铺铜规则设置检查；生产时 AOI 会报立碑，但那时已经焊坏了。', 'Checking the pour connect style rule; AOI flags tombstones in production, but by then the joints are bad.'),
  },
  {
    id: 'acid',
    title: loc('酸角 / 锐角走线', 'Acid trap / acute angle'),
    cause: loc('一根信号线以约 30° 的锐角并进另一根线，形成一个窄楔形夹缝。', 'A signal trace joins another at about 30°, forming a narrow wedge.'),
    effect: loc('蚀刻液困在夹缝里排不走，过蚀刻把线吃细甚至断开；锐角也是阻抗突变点，高速信号会反射。', 'Etchant gets trapped in the wedge and over-etches, thinning or breaking the trace; the sharp corner is also an impedance discontinuity that reflects fast signals.'),
    fix: loc('T 形或 45° 接入，拐角用 45° 或圆弧；开启 EDA 的锐角检查。', 'Join at a T or 45°, use 45° or arcs at corners, and enable the EDA acute-angle check.'),
    caught: loc('DRC 的锐角规则（默认常常是关的）和板厂 CAM。', 'The DRC acute-angle rule (often off by default) and the fab’s CAM.'),
  },
  {
    id: 'polar',
    title: loc('极性标记缺失或含糊', 'Missing or ambiguous polarity mark'),
    cause: loc('D1 的丝印框两头一样，看不出哪边是阴极；对比 D2 在阴极端画了粗线。', 'D1’s silk outline is identical at both ends, so the cathode is unclear; compare D2 with a bar at its cathode end.'),
    effect: loc('人工上料和 AOI 都可能放反：二极管反接不导通或击穿，LED 不亮，电解电容反接会鼓包。', 'Operators and AOI can both get it backwards: a reversed diode blocks or breaks down, an LED stays dark, a reversed electrolytic bulges.'),
    fix: loc('阴极 / 正极 / 1 脚用明确的、元件外面也看得见的标记（粗线、+ 号、圆点），全板统一一种画法。', 'Mark cathode / positive / pin 1 clearly and outside the body (bar, + sign, dot), using one convention across the board.'),
    caught: loc('设计评审和 SMT 首件检查。', 'Design review and the SMT first-article inspection.'),
  },
  {
    id: 'vip',
    title: loc('焊盘上开口过孔（吸锡）', 'Open via-in-pad (solder wicking)'),
    cause: loc('U3（QFN）的散热焊盘上打了 5 个没塞孔的过孔。', 'Five unfilled vias are drilled straight into U3’s (QFN) thermal pad.'),
    effect: loc('回流时熔锡顺着孔流到背面，散热焊盘缺锡、空洞大，芯片散热差；锡量不够时 QFN 还会浮高，周边引脚开路。', 'In reflow molten solder runs down the holes to the back, starving the thermal pad and leaving large voids so the chip runs hot; with too little solder the QFN floats and edge pins open.'),
    fix: loc('要求板厂树脂塞孔 + 电镀盖帽（VIPPO），或用更小的过孔并在底面盖阻焊；钢网开口分成小格控制锡量。', 'Specify resin-filled, cap-plated vias (VIPPO), or use smaller vias tented on the bottom; split the stencil opening into small windows to control paste.'),
    caught: loc('DFA 审查；生产时只能靠 X-ray 看空洞，ICT 查周边开路。', 'DFA review; in production only X-ray shows the voids and ICT finds the open edge pins.'),
  },
]

export type CaseId = 'ldo' | 'crack' | 'qfn' | 'ict'

export type ReworkCase = { id: CaseId; title: LText; sub: LText; tags: [LText, LText, LText, LText]; symptom: LText; root: LText; repair: LText; prevent: LText }

export const CASES: ReworkCase[] = [
  {
    id: 'ldo',
    title: loc('LDO 上电发烫', 'LDO runs hot at power-up'),
    sub: loc('封装引脚定义', 'Footprint pin mapping'),
    tags: [loc('3V3 为 0，LDO 烫手', '3V3 at 0, LDO hot'), loc('SOT-23 引脚顺序错', 'SOT-23 pin order wrong'), loc('割线飞线，再改版', 'Cut, fly wire, re-spin'), loc('按手册核对引脚', 'Check pins vs datasheet')],
    symptom: loc('打样回来一上电，3.3 V 电源输出为 0，LDO 烫手，电流表显示几百 mA。', 'At first power-up of the prototype the 3.3 V output is 0, the LDO is too hot to touch and the supply shows hundreds of mA.'),
    root: loc('同是 SOT-23 封装，不同厂家 LDO 的引脚顺序不同（有的 1 脚是 GND，有的是 IN）。库里拿来的符号和这颗料的手册不一致，输入输出接反。', 'SOT-23 LDOs from different vendors use different pin orders (pin 1 may be GND or IN). The library symbol did not match this part’s datasheet, so input and output were swapped.'),
    repair: loc('样板上割断走线、飞线救急，验证其余电路；正式版修改封装引脚映射后重新投板。', 'Cut traces and fly-wire the samples to verify the rest of the circuit; fix the pin mapping and re-spin for the real build.'),
    prevent: loc('符号和封装的引脚号逐一对照该型号的数据手册；替代料必须核对引脚兼容，而不是只看封装名。见 {@pcbFlow} 的封装三来源。', 'Check every symbol and footprint pin number against that exact part’s datasheet; an alternate must be pin-compatible, not just the same package name. See the three footprint sources in {@pcbFlow}.'),
  },
  {
    id: 'crack',
    title: loc('出货后间歇短路', 'Intermittent shorts after shipping'),
    sub: loc('电容靠近分板边', 'Capacitor near the break edge'),
    tags: [loc('偶发电源短路', 'Random rail short'), loc('MLCC 分板受力微裂', 'MLCC cracked at depanel'), loc('更换电容，改布局', 'Replace caps, re-place'), loc('离边 ≥ 3 mm，加工艺边', '≥ 3 mm from edge, rails')],
    symptom: loc('出厂测试全部通过，客户处却陆续出现电源对地时好时坏的短路，返修件集中在同一位置的电容。', 'Every board passed final test, yet customers report intermittent rail-to-ground shorts; returns point to capacitors at the same location.'),
    root: loc('这几颗陶瓷电容离 V 割线不到 1 mm 且长轴垂直于割线，分板时板弯曲把电容内部掰出微裂纹；受潮或温度变化后裂纹导通。', 'These ceramic capacitors sat under 1 mm from the V-cut with their long axis across it; bending during depaneling cracked them internally, and the cracks conduct with moisture or temperature change.'),
    repair: loc('更换故障电容；改版把电容移到离板边 ≥ 3 mm 处，长轴平行于割线，并改用工艺边 + 邮票孔分板。', 'Replace the failed capacitors; in the new revision move them ≥ 3 mm from the edge, parallel to the cut, and switch to rails with mouse-bite tabs.'),
    prevent: loc('DFA 清单加入「板边禁布区」，分板方式在布局前就和 SMT 厂确认。拼板与工艺边见 {@pcbSupply}。', 'Add an edge keep-out to the DFA list and agree the depaneling method with the SMT house before placement. Panels and rails: {@pcbSupply}.'),
  },
  {
    id: 'qfn',
    title: loc('QFN 芯片过热降频', 'QFN chip overheats and throttles'),
    sub: loc('散热焊盘开口过孔', 'Open vias in the thermal pad'),
    tags: [loc('满载过热，周边脚开路', 'Hot at load, pins open'), loc('过孔吸锡，空洞大', 'Vias wick solder, voids'), loc('塞孔盖帽，钢网分格', 'Fill & cap, split stencil'), loc('焊盘过孔写进 DFA', 'Via-in-pad in DFA list')],
    symptom: loc('电源芯片满载几分钟就过热保护；ICT 偶尔报周边引脚开路，X-ray 显示散热焊盘空洞超过 50%。', 'The power IC hits thermal shutdown after a few minutes at full load; ICT sometimes reports open edge pins and X-ray shows over 50% voiding under the thermal pad.'),
    root: loc('散热焊盘上的 9 个过孔没塞孔，焊锡顺孔流走；锡量不足导致芯片浮高，周边引脚接触不良。', 'The nine vias in the thermal pad were left open and solder drained through them; with too little solder the chip floated and its edge pins made poor contact.'),
    repair: loc('改为树脂塞孔 + 电镀盖帽，钢网开口分成 4 格、覆盖约 60% 面积；复测空洞降到 25% 以下。', 'Switch to resin-filled, cap-plated vias and split the stencil window into four panes covering about 60% of the pad; re-test shows voiding under 25%.'),
    prevent: loc('在制造说明里写明塞孔要求；DFA 清单加「焊盘内过孔」一条。过孔结构见 {@pcbStack}。', 'State the via-fill requirement in the fab notes and add “via in pad” to the DFA list. Via structures: {@pcbStack}.'),
  },
  {
    id: 'ict',
    title: loc('ICT 覆盖率只有 60%', 'ICT coverage only 60%'),
    sub: loc('测试点不够', 'Not enough test points'),
    tags: [loc('坏板流到 FCT', 'Bad boards reach FCT'), loc('40% 网络无测试点', '40% of nets without TP'), loc('补测试点，改治具', 'Add TPs, rebuild fixture'), loc('布局时同步做 DFT', 'DFT during placement')],
    symptom: loc('量产时 ICT 只覆盖 60% 网络，有连锡、漏件的板子一路流到功能测试才失败，定位一块板要半小时。', 'In production ICT covers only 60% of nets; boards with bridges or missing parts get all the way to functional test before failing, and each takes half an hour to diagnose.'),
    root: loc('布局时为了省面积删掉了测试点，剩下的有些盖了阻焊、有些在 BGA 下面，探针扎不到。', 'Test points were removed during placement to save area; some of the rest were under solder mask or beneath the BGA, out of probe reach.'),
    repair: loc('改版在底面补齐 1.0 mm 测试焊盘、间距 2.54 mm，重做针床治具；覆盖率提到 95% 以上。', 'The revision adds 1.0 mm test pads on the bottom at 2.54 mm pitch and a new bed-of-nails fixture; coverage rises above 95%.'),
    prevent: loc('布局阶段就和测试工程师对测试点清单。ICT 的「加流测压」和芯片开短路测试 {@fOpens}、PMU {@pmu} 是同一原理。', 'Agree the test-point list with the test engineer during placement. ICT’s force-current, measure-voltage method is the same as chip opens/shorts {@fOpens} and the PMU {@pmu}.'),
  },
]
