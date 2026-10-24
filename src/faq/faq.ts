import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'
import { ANA_FAQ_GROUP } from './faqAna'
import { HS_FAQ_GROUP } from './faqHs'
import { MEM_FAQ_GROUP } from './faqMem'
import { RF_FAQ_GROUP } from './faqRf'
import { MOS_FAQ_GROUP } from './faqMos'
import { PCB_FAQ_GROUP } from './faqPcb'
import { PWR_FAQ_GROUP } from './faqPower'
import { QUAL_FAQ_GROUP } from './faqQual'

/**
 * 常见问题。
 * - id：小写字母、数字、连字符，用作地址 #/faq/<id>，发布后不要改
 * - a 里写 {@课程ID}，页面上会变成可点击的课程编号（D04、F06 …）
 * - lessons：“相关课程”，按课序写
 */
export type FaqItem = {
  id: string
  q: LText
  a: LText
  lessons: ModuleId[]
}

export type FaqGroup = {
  id: string
  title: LText
  items: FaqItem[]
}

const BASE_FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'basics',
    title: loc('入门与测试流程', 'Getting started and the test flow'),
    items: [
      {
        id: 'cp-vs-ft',
        q: loc('CP 和 FT 有什么区别？', 'What is the difference between CP and FT?'),
        a: loc(
          'CP（Chip Probing，晶圆测试）在晶圆还没切割时用探针卡扎到每个 die 的焊盘上测，目的是把坏 die 挑出来，不浪费封装钱；FT（Final Test，成品测试）在封装之后，用 Handler 把芯片送进 Socket 再测一遍，确认封装过程没有引入问题，并按 Bin 分档出货。两者用的是同一类 ATE，区别在接触方式（探针卡 / Prober 对 Socket / Handler）和测试目的，见 {@intro} 和 {@connection}。',
          'CP (chip probing, wafer sort) tests each die on the uncut wafer through a probe card touching its pads, to screen out bad dies before paying for packaging. FT (final test) comes after packaging: a handler puts the part into a socket and it is tested again to make sure packaging introduced no defects, then sorted into bins for shipping. Both use the same kind of ATE; they differ in how contact is made (probe card / prober versus socket / handler) and in purpose. See {@intro} and {@connection}.',
        ),
        lessons: ['intro', 'connection', 'fAte'],
      },
      {
        id: 'not-just-01',
        q: loc('为什么说测试“不只是 0 和 1”？', 'Why is test "more than 0 and 1"?'),
        a: loc(
          '芯片管脚上是真实的电压和电流。规格书只保证：输入不高于 VIL（0.8 V）一定认成 0，不低于 VIH（2.0 V）一定认成 1，中间可能认成任何一个；输出则要高于 VOH 或低于 VOL 才算合格，落在中间就是 Fail。所以测试要按电压门限去驱动和比较，还要用 PMU 量电流（漏电、IDD），这些都不是简单的逻辑对错，见 {@pmu}。',
          'A pin carries real voltages and currents. The datasheet only guarantees that an input at or below VIL (0.8 V) is read as 0 and at or above VIH (2.0 V) as 1; in between it may be read either way. An output must be above VOH or below VOL to pass; anything in between fails. So test drives and compares against voltage thresholds, and uses the PMU to measure currents (leakage, IDD). None of this is a plain logic right-or-wrong; see {@pmu}.',
        ),
        lessons: ['pmu', 'fIntro'],
      },
      {
        id: 'opens-first',
        q: loc('为什么开短路总排在测试流程最前面？', 'Why are opens/shorts always first in the flow?'),
        a: loc(
          '管脚没接好，后面每一项结果都不可信：Fail 了分不清是芯片坏还是接触不良。所以先确认每根脚都接上了，再上电测 IDD、功能、DC、AC。{@program} 的流程是 开短路 → 上电 / IDD → 功能 → DC → AC，任何一项 Fail 即停，分到这一项对应的 Bin。',
          'If a pin is not connected, no later result can be trusted: a failure could be the chip or the contact. So first confirm every pin is connected, then power up and test IDD, function, DC and AC. The flow in {@program} is opens/shorts → power-up / IDD → functional → DC → AC; the first failure stops the flow and sorts the part into that test’s bin.',
        ),
        lessons: ['program', 'fOpens'],
      },
      {
        id: 'stdf-what',
        q: loc('ATE 测完的结果存在哪里？STDF 是什么？', 'Where do ATE results go? What is STDF?'),
        a: loc(
          'ATE 把每一步结果写进 STDF（Standard Test Data Format）文件，它是二进制记录流：PTR / FTR 记录每项的测量值与判定，PRR 记录每颗器件的 HARD_BIN、SOFT_BIN，良率统计和失效分析都读它。它是行业通用格式，不同厂家的 ATE 和分析软件都能读写。见 {@intro}。',
          'The ATE writes each step result into an STDF (Standard Test Data Format) file, a binary record stream: PTR / FTR record each item’s measured value and verdict, and PRR records each part’s HARD_BIN and SOFT_BIN. Yield statistics and failure analysis read this file. It is an industry-standard format that ATEs and analysis tools from different vendors can read and write. See {@intro}.',
        ),
        lessons: ['intro', 'genStdf'],
      },
      {
        id: 'multisite-why',
        q: loc('为什么不把 Site 数直接开到最大？', 'Why not just run the maximum number of sites?'),
        a: loc(
          'Site 越多，UPH 通常越高，但 Index、电源等共享资源的串行部分会压低并行效率；通道数也有上限，每小时测试成本还会随 Site 增加。UPH 最高不等于单颗成本最低，要看 COT。见 {@genMultisite}。',
          'More sites usually raise UPH, but the serial part of shared resources such as index and power lowers parallel efficiency; channels cap the count, and the hourly test cost rises with each site. The highest UPH is not the lowest cost per part, so compare COT. See {@genMultisite}.',
        ),
        lessons: ['genMultisite'],
      },
      {
        id: 'fail-stop',
        q: loc('量产为什么 Fail 一项就停，不把后面的也测完？', 'Why does production stop at the first failure instead of finishing?'),
        a: loc(
          '为了省测试时间。测试机按秒计费，一颗已经判坏的芯片再测下去没有意义；Bin 号已经记录了它挂在哪一项。排错、表征时才会关掉 Fail 即停，把所有项都测完看全貌，见 {@program}。',
          'To save test time. Tester time costs money by the second, and testing a part already known to be bad gains nothing; the bin number already records which test it failed. Only for debug or characterization is stop-on-fail turned off to see every result; see {@program}.',
        ),
        lessons: ['program', 'fProgram'],
      },
      {
        id: 'bin',
        q: loc('Bin 是什么？Bin 1 为什么是良品？', 'What is a bin, and why is bin 1 the good one?'),
        a: loc(
          'Bin 是测试结束后给芯片的分类号。习惯上 Bin 1 是全部通过的良品，其它号码对应挂在哪一项（本站 {@program} 用 Bin 6/5/4/3/2 分别对应开短路、IDD、功能、DC、AC）。Handler 或 Prober 按 Bin 号把芯片分到不同料盒，或在晶圆图上打标记。',
          'A bin is the category number a part gets at the end of test. By convention bin 1 is a part that passed everything; other numbers say which test failed (in {@program}, bins 6/5/4/3/2 stand for opens/shorts, IDD, functional, DC and AC). The handler or prober uses the bin number to drop parts into different trays or mark the wafer map.',
        ),
        lessons: ['intro', 'program'],
      },
      {
        id: 'yield',
        q: loc('良率低就一定是芯片设计有问题吗？', 'Does low yield always mean a design problem?'),
        a: loc(
          '不一定。良率低可能来自工艺缺陷、设计裕量不够，也可能是测试本身的问题：接触不良、程序条件设错、极限太严、Strobe 放错位置。排错时先怀疑测试程序、硬件和接触，再下结论说芯片坏，见 {@program} 和 {@fDebug}。',
          'Not necessarily. Low yield can come from process defects or thin design margin, but also from the test itself: poor contact, wrong program conditions, limits that are too tight, a misplaced strobe. In debug, suspect the program, hardware and contact before blaming the chip; see {@program} and {@fDebug}.',
        ),
        lessons: ['program', 'shmoo', 'fDebug'],
      },
    ],
  },
  {
    id: 'levels',
    title: loc('电平与时序', 'Levels and timing'),
    items: [
      {
        id: 'vih-3v-vs-2v',
        q: loc(
          'D03 里驱动用 VIH = 3.0 V，规格书却写 VIH = 2.0 V，哪个对？',
          'D03 drives VIH = 3.0 V but the datasheet says VIH = 2.0 V. Which is right?',
        ),
        a: loc(
          '都对，只是同名不同义。测试机 Level 里的 VIH 是 Driver 真正输出的高电平（{@ate} 用 3.0 V）；规格书的 VIH min = 2.0 V 是芯片保证认成 1 的最低输入（{@pmu}）。驱动电平高于门限，1 才一定被认出。只有专门验证输入门限时，才把驱动电平恰好设成 2.0 V / 0.8 V，见 {@spec}。',
          'Both are right; the names are the same but the meanings differ. The VIH in the tester’s Level block is the high level the driver actually outputs (3.0 V in {@ate}); the datasheet’s VIH min = 2.0 V is the lowest input the chip promises to read as 1 ({@pmu}). Driving above the threshold makes sure a 1 is recognized. Only when the input threshold itself is being verified is the drive level set to exactly 2.0 V / 0.8 V; see {@spec}.',
        ),
        lessons: ['ate', 'pmu', 'spec'],
      },
      {
        id: 'strobe-early',
        q: loc('Strobe 放太早会怎样？', 'What happens if the strobe is too early?'),
        a: loc(
          'Strobe 只在一个时刻采样，必须在 DUT 输出稳定之后。{@ate} 里驱动沿在 5 ns，DUT 延迟 6 ns，输出到 11 ns 才变；Strobe 放在 15 ns 留了 4 ns 余量。如果放到 8 ns，读到的还是旧值或中间电平，好芯片也会被判 Fail。怎么按 tPD 加余量算 Strobe 和周期，见 {@timing}。',
          'The strobe samples one instant and must come after the DUT output settles. In {@ate} the drive edge is at 5 ns and the DUT delay is 6 ns, so the output changes only at 11 ns; a strobe at 15 ns leaves 4 ns of margin. At 8 ns it would read the old value or an in-between level, and a good part would fail. How to place the strobe and period from tPD plus margin: {@timing}.',
        ),
        lessons: ['ate', 'timing', 'fAc'],
      },
      {
        id: 'window-strobe',
        q: loc(
          '窗口 Strobe 是怎么实现的？是在窗口里多次采样吗？毛刺出现时刚好没采到怎么办？',
          'How is a window strobe implemented? Does it sample many times inside the window, and what if a glitch falls between samples?',
        ),
        a: loc(
          '不是多次采样。VOH / VOL 两个电压比较器是模拟电路，输出一直跟着引脚电压连续变化，并不只在某个时刻才工作。窗口 Strobe 是时序电路在窗口开始沿打开一个“失效锁存器”、在结束沿关上：窗口打开期间，比较器结果只要有一瞬和期望值不符，锁存器就被置位并保持住，到窗口结束时再读出 Pass / Fail。所以它没有“两次采样之间”的空档，窗口内的毛刺不靠运气碰。它也会漏，但漏的原因不一样：一是毛刺太窄，比较器来不及翻转（每台测试机都规定比较器能分辨的最小脉宽，一般在亚纳秒到纳秒级）；二是毛刺幅度没越过 VOH / VOL 门槛；三是毛刺落在窗口外面。有些低成本测试机没有真正的窗口比较，只能在一拍里放几个边沿 Strobe（Multi-strobe）来近似，这时确实会漏掉落在两次采样之间的毛刺。对策是把 Strobe 放密一些，或者在不同拍里扫动 Strobe 的位置，并且查清楚这台机器的窗口是硬件锁存还是多点采样。见 {@fFunc}。',
          'No, it does not sample many times. The VOH / VOL comparators are analog circuits whose outputs follow the pin voltage continuously; they do not only work at one instant. A window strobe is timing logic that opens a "fail latch" at the window-open edge and closes it at the window-close edge: while the window is open, if the comparator result disagrees with the expected value even for an instant, the latch is set and stays set, and Pass / Fail is read when the window closes. So there is no gap "between two samples", and a glitch inside the window is not caught by luck. It can still miss, but for different reasons: the glitch is too narrow for the comparator to toggle (every tester specifies the minimum pulse width its comparators can resolve, usually sub-nanosecond to a few nanoseconds); the glitch does not cross the VOH / VOL threshold; or the glitch falls outside the window. Some low-cost testers have no true window compare and approximate it with several edge strobes in one cycle (multi-strobe); then a glitch between two samples really can be missed. The remedy is to place the strobes closer together or sweep the strobe position across cycles, and to find out whether your tester\'s window is a hardware latch or multi-point sampling. See {@fFunc}.',
        ),
        lessons: ['fFunc'],
      },
      {
        id: 'open-drain-source',
        q: loc('什么叫开漏（Open drain）和开源（Open source）？', 'What are open-drain and open-source outputs?'),
        a: loc(
          '普通 CMOS 输出有两只管：PMOS 上拉、NMOS 下拉。开漏输出只保留 NMOS，它的漏极直接接到管脚、上面“开着”不接东西：输出 0 时 NMOS 导通，把管脚拉低；输出 1 时 NMOS 关断，管脚是高阻，高电平要靠外接上拉电阻拉到 VDD。开源反过来，只保留上面那只上拉管，管脚接在它的源极上（类似双极型的射极跟随），只能往外供电流：输出 1 时拉高，输出 0 时是高阻，要靠外接下拉电阻。双极型电路里对应的叫开集电极（Open collector）和开发射极（Open emitter）。这样设计的好处是几个输出可以直接并在一根线上做“线与”，并且上拉可以接到和芯片不同的电压做电平转换，I²C 总线就是开漏。测试时：开漏脚的期望写 L 和 Z（或者接上拉负载后写 L 和 H），一定要有上拉，可以用管脚电子的电流负载把 VREF 设在 VOH 以上来当上拉；VOL / IOL 照常测；没有 VOH 可测，高电平那一态改测关断漏电（IOZH / IOH 漏电）。开源脚全部镜像过来。见 {@fFunc}。',
          'A normal CMOS output has two transistors: a PMOS pull-up and an NMOS pull-down. An open-drain output keeps only the NMOS, with its drain wired straight to the pin and nothing above it: driving 0 turns the NMOS on and pulls the pin low; driving 1 turns it off and the pin is high-Z, so the high level must come from an external pull-up resistor to VDD. Open source is the reverse: only a high-side transistor remains, with the pin on its source terminal (like a bipolar emitter follower), so it can only source current. Driving 1 pulls high, driving 0 leaves the pin high-Z, and an external pull-down is needed. The bipolar equivalents are open collector and open emitter. The benefits: several outputs can share one wire as a "wired-AND", and the pull-up can go to a different voltage than the chip for level shifting; the I²C bus is open-drain. When testing: expect L and Z on an open-drain pin (or L and H with a pull-up load), and a pull-up is mandatory; the pin electronics current load with VREF set above VOH can serve as one. VOL / IOL is tested as usual; there is no VOH to test, so the high state is checked for off-state leakage (IOZH / IOH leakage) instead. Open-source pins are the mirror image. See {@fFunc}.',
        ),
        lessons: ['fFunc', 'fCreate'],
      },
      {
        id: 'in-between-fail',
        q: loc('输出电压在 VOL 和 VOH 之间，为什么直接判 Fail？', 'Why is an output between VOL and VOH a straight fail?'),
        a: loc(
          '因为后级芯片收到这个电压时不保证认成 0 还是 1。Comparator 在 Strobe 时刻把电压和 VOH / VOL 比：高于 VOH 读 H，低于 VOL 读 L，中间既不是 H 也不是 L，期望什么都对不上，所以判 Fail，见 {@ate} 和 {@pmu}。',
          'Because the next chip is not guaranteed to read that voltage as either 0 or 1. At the strobe the comparator checks the voltage against VOH / VOL: above VOH reads H, below VOL reads L, and in between is neither, so it matches no expected value and fails. See {@ate} and {@pmu}.',
        ),
        lessons: ['ate', 'pmu'],
      },
      {
        id: 'period-limit',
        q: loc('一拍的周期最短能设多少？', 'How short can the cycle period be?'),
        a: loc(
          '要让输出在 Strobe 前稳定：周期至少要容纳传输延迟 tPD 加上余量。{@timing} 的例子是 tPD = 8 ns、余量 2 ns，所以周期 ≥ 10 ns，也就是最高 100 MHz。更快就会在输出没稳定时采样，开始出现 Fail，这正是测 fMAX 的思路。',
          'The output must settle before the strobe, so the period must hold the propagation delay tPD plus margin. The example in {@timing} has tPD = 8 ns and 2 ns of margin, so the period must be at least 10 ns, i.e. at most 100 MHz. Any faster and sampling happens before the output settles and failures appear, which is exactly how fMAX is measured.',
        ),
        lessons: ['timing', 'fAc'],
      },
      {
        id: 'go-nogo-vs-search',
        q: loc('AC 参数是直接“量”出来的吗？', 'Are AC parameters measured directly?'),
        a: loc(
          '量产里通常不是。Go/No-Go 只在规格极限上把 Strobe 或周期放好，跑一次功能向量看过不过，最快；要知道实际值（例如延迟到底是多少），就要移动 Strobe 反复跑，用二分或线性搜索找到 Pass / Fail 的边界，这叫读出记录，见 {@fAc} 和 {@fChar}。',
          'Usually not in production. Go/No-Go places the strobe or period at the spec limit and runs the functional vectors once to see if they pass, which is fastest. To learn the actual value (how long the delay really is), the strobe is moved and the vectors rerun, using binary or linear search to find the pass/fail edge; that is read and record. See {@fAc} and {@fChar}.',
        ),
        lessons: ['fAc', 'fChar'],
      },
      {
        id: 'nrz-rz',
        q: loc('信号格式 NRZ、RZ 有什么用？', 'What are signal formats like NRZ and RZ for?'),
        a: loc(
          '信号格式决定一拍里驱动波形的形状。NRZ 在驱动沿变成数据值并保持到下一拍；RZ 只在一段时间内给出 1，之后回到 0，适合做时钟脉冲。同一份向量换个格式，就能得到不同的波形，见 {@fFunc}。',
          'The signal format sets the shape of the drive waveform within a cycle. NRZ changes to the data value at the drive edge and holds it until the next cycle; RZ gives a 1 only for part of the cycle and then returns to 0, which suits clock pulses. The same vectors with a different format produce a different waveform; see {@fFunc}.',
        ),
        lessons: ['fFunc', 'fVector'],
      },
    ],
  },
  {
    id: 'dc',
    title: loc('DC 测试与开短路', 'DC tests and opens/shorts'),
    items: [
      {
        id: 'voh-vddmin',
        q: loc(
          '为什么 VOH 要在 VDDmin 下测，漏电却在 VDDmax 下测？',
          'Why is VOH tested at VDDmin but leakage at VDDmax?',
        ),
        a: loc(
          '每一项都放在它最坏的条件下测。电源越低，输出上拉越弱，VOH 越难达标，所以 VOH 在 VDDmin（例如 4.75 V）测；漏电是电压加在漏电通路上产生的，电压越高电流越大，所以 IIL / IIH、Static IDD 在 VDDmax（例如 5.25 V）测。最坏条件下都过了，规格范围内就都能过，见 {@fDc}。',
          'Each test is run under its own worst case. The lower the supply, the weaker the output pull-up and the harder it is to meet VOH, so VOH is tested at VDDmin (e.g. 4.75 V). Leakage is voltage across a leakage path, so the higher the voltage the larger the current; IIL / IIH and static IDD are tested at VDDmax (e.g. 5.25 V). Pass at the worst case and the part passes across the whole spec range; see {@fDc}.',
        ),
        lessons: ['dc', 'fSpec', 'fDc'],
      },
      {
        id: 'voh-with-current',
        q: loc('输出电压为什么要带电流测？', 'Why must output voltage be measured under current?'),
        a: loc(
          '输出级导通的那个 MOS 管相当于一个导通电阻 R_on。不带负载时没有电流流过 R_on，上面没有压降，输出就是 VDD 或 0 V；哪怕 R_on 变大了（驱动变弱、管子有缺陷、工艺偏差），读数也一模一样。只有拉出 / 灌入规定的 IOH / IOL 电流，压降 I × R_on 才显现：VOH = VDD − |IOH| × R_on，VOL = IOL × R_on。{@dc} 的例子（VDD = 3.0 V）：VOL @ 8 mA，正常下拉 40 Ω → 0.32 V Pass，偏弱 70 Ω → 0.56 V Fail；VOH @ 4 mA，正常上拉 100 Ω → 2.60 V Pass，偏弱 200 Ω → 2.20 V Fail。空载（0 mA）时两颗都读 0 V / 3.00 V，分不出来。',
          'The MOS transistor that is on in the output stage acts like an on-resistance R_on. With no load, no current flows through R_on, so there is no drop across it and the output is simply VDD or 0 V — even if R_on has grown (weaker drive, a defective transistor, process variation), the reading is identical. Only when the specified IOH / IOL is pulled out or pushed in does the drop I × R_on appear: VOH = VDD − |IOH| × R_on, VOL = IOL × R_on. In {@dc} (VDD = 3.0 V): VOL @ 8 mA gives 0.32 V (pass) with a normal 40 Ω pull-down and 0.56 V (fail) with a weak 70 Ω one; VOH @ 4 mA gives 2.60 V (pass) with a normal 100 Ω pull-up and 2.20 V (fail) with a weak 200 Ω one. Unloaded (0 mA), both read 0 V / 3.00 V and cannot be told apart.',
        ),
        lessons: ['dc', 'fDc'],
      },
      {
        id: 'opens-100ua',
        q: loc(
          '开短路为什么加 −100 µA，读到约 −0.65 V 才算正常？',
          'Why does opens/shorts force −100 µA and expect about −0.65 V?',
        ),
        a: loc(
          '每个管脚到地之间都有一只保护二极管。PMU 往管脚抽 −100 µA，电流从地经二极管流出，读到的就是二极管的正向压降，约 −0.65 V，说明管脚接上了、二极管完好。开路时没有电流通路，电压一直冲到钳位（约 −3 V），超过 −1.5 V 判开路；短路到地时压降接近 0，高于 −0.2 V 判短路。见 {@pmu} 和 {@fOpens}。',
          'Every pin has a protection diode to ground. The PMU pulls −100 µA out of the pin; the current flows up from ground through the diode, so the reading is the diode’s forward drop, about −0.65 V, which shows the pin is connected and the diode is intact. With an open there is no current path and the voltage runs to the clamp (about −3 V); beyond −1.5 V means open. A short to ground leaves almost no drop; above −0.2 V means short. See {@pmu} and {@fOpens}.',
        ),
        lessons: ['pmu', 'fIntro', 'fOpens'],
      },
      {
        id: 'opens-current',
        q: loc('开短路的电流是不是越大越好？', 'Is a bigger opens/shorts current always better?'),
        a: loc(
          '不是。电流越大，二极管压降和阻性短路上的压降越混在一起，一个带电阻的短路反而可能读出“正常”的电压混过去；电流太大还可能损伤器件。所以通常用约 100 µA 这一量级，并配合钳位保护，见 {@fOpens}。',
          'No. The larger the current, the more the diode drop blends with the drop across a resistive short, so a short with some resistance can read a "normal" voltage and slip through; too much current can also damage the device. So about 100 µA is typical, together with a clamp; see {@fOpens}.',
        ),
        lessons: ['fOpens'],
      },
      {
        id: 'power-pin-os',
        q: loc('电源管脚（VDD / VSS）怎么做开短路？', 'How do you run opens/shorts on power pins (VDD / VSS)?'),
        a: loc(
          '电源脚后面没有单独的一对保护二极管，测的是 P 衬底（接 VSS）和 N 阱（接 VDD）之间的 PN 结，以及电源 ESD 钳位里的二极管。做法：VSS 和所有信号脚接 0 V，同名的其它 VDD 脚断开 DPS 继电器悬空，PMU 对被测 VDD 脚强加 −100 µA、钳位 −3 V，读约 −0.6 V 为正常，接近 0 V 为 VDD 对 VSS 短路，撞到钳位为这只脚开路。只打负电流：正电流等于从这只脚给芯片上电，读数没有特征值。其它 VDD 脚必须悬空、逐脚测，因为同名脚在芯片里连在同一条总线上，接着 0 V 会把电流引走，读数像短路，也会掩盖真正断开的那只。VSS 脚方向相反：VDD 接 0 V，打 +100 µA，读约 +0.6 V。另一个线索：信号脚的 +100 µA 全部撞钳位、−100 µA 全正常，多半是 VDD 脚没接上。上电后的 Gross IDD 再兜底拦住电源对地的硬短路。见 {@fDc} 的等效电路一节和 {@fOpens}。',
          'A power pin has no dedicated pair of protection diodes behind it; what you test is the PN junction between the P substrate (on VSS) and the N wells (on VDD), plus the diode in the supply ESD clamp. Method: VSS and all signal pins at 0 V, the other VDD pins of the same net disconnected from the DPS and left floating, and the PMU forcing −100 µA into the VDD pin under test with a −3 V clamp. About −0.6 V is good, near 0 V is a VDD-to-VSS short, and hitting the clamp means this pin is open. Force only negative current: positive current would power the chip through this pin, and the reading has no signature value. The other VDD pins must float and each pin is tested on its own, because pins of the same net share one bus inside the chip; holding them at 0 V would steal the current, make the reading look like a short, and mask the pin that is really open. VSS pins are the mirror image: VDD at 0 V, force +100 µA, expect about +0.6 V. Another clue: if every signal pin hits the clamp at +100 µA while every −100 µA result is fine, the VDD pin is most likely not connected. Gross IDD after power-up is the backstop for a hard supply-to-ground short. See the equivalent-circuit section of {@fDc} and {@fOpens}.',
        ),
        lessons: ['fOpens', 'fDc'],
      },
      {
        id: 'diode-vs-resistor',
        q: loc(
          '为什么测开短路时等效电路是两只二极管，测 VOL / VOH 时却是两只电阻？',
          'Why is the equivalent circuit two diodes for opens/shorts but two resistors for VOL / VOH?',
        ),
        a: loc(
          '两只保护二极管和两只输出管一直都在同一只管脚上，等效电路只画“这个偏置条件下真正导通的部分”。开短路时芯片不上电、所有脚接 0 V，输出管没有栅压、沟道不存在，只有 PN 结能导电：ESD 二极管，以及与它并联、方向相同的漏极–衬底结；PMU 把引脚推到 0 V 以外约 0.65 V，其中一只正偏，所以看到的是二极管。测 VOL / VOH 时芯片上电，预处理让一只输出管导通、工作在线性区，电压和电流成正比，就是一只电阻；另一只关断；引脚被钉在 0 V 和 VDD 之间，两只二极管都反偏，不导电，从图里拿掉。反过来，VOL 预处理错了、输出其实是高，PMU 灌电流把引脚顶到 VDD 以上，二极管又导通，读到 VDD + 0.7 V。开短路特意测二极管，是因为不上电最安全，而且约 0.65 V 的压降几乎不随工艺和电流变，开路、短路、正常三种读数离得很远。见 {@fDc}。',
          'The two protection diodes and the two output transistors are always on the same pin; an equivalent circuit only draws what actually conducts under the given bias. In opens/shorts the chip is unpowered with every pin at 0 V, so the output transistors have no gate voltage and no channel; only PN junctions can conduct - the ESD diodes and the drain–body junctions in parallel with them, pointing the same way. The PMU pushes the pin about 0.65 V beyond 0 V, one of them is forward-biased, and you see a diode. In VOL / VOH the chip is powered and preconditioning turns one output transistor on in its linear region, where voltage is proportional to current - a resistor - while the other is off. The pin is held between 0 V and VDD, both diodes are reverse-biased and carry nothing, so they drop out of the picture. Conversely, if VOL preconditioning is wrong and the output is actually high, the PMU pushes the pin above VDD, the diode conducts again, and you read VDD + 0.7 V. Opens/shorts deliberately tests the diode because no power is safest, and its roughly 0.65 V drop hardly varies with process or current, keeping open, short and good readings far apart. See {@fDc}.',
        ),
        lessons: ['fOpens', 'fDc'],
      },
      {
        id: 'ganged-limit',
        q: loc(
          '并联测 IIL / IIH，为什么极限还用单脚的 10 µA？',
          'Why does ganged IIL / IIH testing still use the single-pin 10 µA limit?',
        ),
        a: loc(
          '并联只看总电流。只要总和不超过单脚极限，每只脚自然也不超，一次就能全判 Pass，这对良品最快。超了就改串行逐脚复测，找出是哪只脚。如果把极限放宽到 N × 10 µA，一只漏 35 µA 的坏脚会被淹没。带上拉 / 下拉的脚每只本来就有约 100 µA，不能并联测，见 {@fDc}。',
          'Ganged testing sees only the total. If the total is under the single-pin limit, every pin is under it too, so all pass in one shot, which is fastest for good parts. If it is exceeded, retest serially pin by pin to find the culprit. Loosening the limit to N × 10 µA would bury a single pin leaking 35 µA. Pins with pull-ups / pull-downs already draw about 100 µA each and cannot be ganged; see {@fDc}.',
        ),
        lessons: ['fDc'],
      },
      {
        id: 'fvmi-fimv',
        q: loc('什么时候加电压量电流，什么时候加电流量电压？', 'When do you force voltage and measure current, and when the reverse?'),
        a: loc(
          '看规格写的是什么。规格给的是电流极限（漏电 IIL / IIH、IOZ、IDD），就加电压量电流（FVMI）；规格给的是电压极限（VOH @ IOH、VOL @ IOL、开短路的二极管压降），就加电流量电压（FIMV）。PMU 两种方式都能做，见 {@pmu} 和 {@fIntro}。',
          'It depends on what the spec limits. If the limit is a current (leakage IIL / IIH, IOZ, IDD), force voltage and measure current (FVMI). If the limit is a voltage (VOH @ IOH, VOL @ IOL, the opens/shorts diode drop), force current and measure voltage (FIMV). The PMU can do both; see {@pmu} and {@fIntro}.',
        ),
        lessons: ['pmu', 'dc', 'fIntro'],
      },
    ],
  },
  {
    id: 'pmu-pe',
    title: loc('PMU 与管脚电子', 'PMU and pin electronics'),
    items: [
      {
        id: 'kelvin-compensate',
        q: loc('四线制（Kelvin）连接为什么可以自动补偿电压？', 'Why does a four-wire (Kelvin) connection compensate the voltage automatically?'),
        a: loc(
          'PMU 的施加端是一个带负反馈的运放：它不停地调自己的输出，直到“反馈端看到的电压”等于程序设定值。两线制时反馈取在 PMU 出口，出口准了，导线上的压降 I × R 却落在 DUT 身上。四线制把反馈改成 Sense 线，从 DUT 引脚旁边取电压，导线压降就被包进了反馈环：DUT 上少了多少，运放就把输出抬高多少，电流变了它也跟着变，不用人算。{@fIntro} 的例子：设定 5 V、电流 200 mA、每根 Force 线 0.5 Ω，PMU 出口自动升到 5.2 V，DUT 上正好 5.0 V。前提是 PMU 还有余量把出口抬上去；压降太大，输出顶到量程或电压上限，就补不上了。',
          'The PMU force side is an op-amp with negative feedback: it keeps adjusting its output until the voltage at its feedback input equals the programmed value. In a two-wire connection the feedback is taken at the PMU output, so the output is right but the wire drop I × R lands on the DUT. In a four-wire connection the feedback comes from the Sense line, picked up right next to the DUT pin, so the wire drop is inside the feedback loop: however much the DUT is short, the op-amp raises its output by that much, and it follows when the current changes, with nothing to calculate. Example from {@fIntro}: 5 V programmed, 200 mA, 0.5 Ω per Force line, so the PMU output rises to 5.2 V by itself and the DUT sees exactly 5.0 V. This assumes the PMU has headroom to raise its output; if the drop is too large and the output hits the range or voltage limit, it can no longer compensate.',
        ),
        lessons: ['pmu', 'fIntro'],
      },
      {
        id: 'kelvin-sense-current',
        q: loc('四线制（Kelvin）里，为什么 Sense 线几乎没有电流？', 'In a four-wire (Kelvin) connection, why does almost no current flow in the Sense line?'),
        a: loc(
          'Sense 线的另一头接的是电压测量放大器的输入端，输入阻抗极高（GΩ 级），只吸 pA 到 nA 量级的偏置电流。电流几乎为 0，Sense 线自身的电阻上就几乎没有压降（I × R ≈ 0），所以 Sense 端读到的电压就等于 DUT 引脚上的电压，哪怕 Sense 线也有零点几欧。负载电流全部走 Force 线。这也是 Sense 要尽量靠近 DUT 引脚接（例如接在 Load Board 上 Socket 旁边）的原因：接点以后的那段 Force 线压降才会被量到并补偿。Sense 线断了，反馈环就丢了，PMU 会把输出一路推到钳位，所以很多测试机有 Sense 断线检测。',
          'The far end of the Sense line goes into the input of a voltage-measuring amplifier with extremely high input impedance (GΩ class), which draws only pA to nA of bias current. With almost no current, the Sense line’s own resistance drops almost no voltage (I × R ≈ 0), so the voltage read at the Sense end equals the voltage at the DUT pin even if the Sense line has a few tenths of an ohm. All the load current flows in the Force line. This is also why Sense is connected as close to the DUT pin as possible (for example on the load board next to the socket): only the Force-line drop up to that point is measured and compensated. If the Sense line breaks, the feedback loop is lost and the PMU drives its output all the way to the clamp, which is why many testers have sense-loss detection.',
        ),
        lessons: ['pmu', 'fIntro'],
      },
      {
        id: 'cmos-floating-input',
        q: loc(
          'CMOS 芯片有一个用不到的输入脚，程序里没管它，让它悬空，怎么让它悬空？',
          'A CMOS chip has an input pin that is not used. If the program ignores it and leaves it floating, how does it end up floating?',
        ),
        a: loc(
          '“程序里没管它”本身就是让它悬空的方式：这只脚没写进 Pin List，或者写了但在向量里一直是 Off / 高阻状态，它对应的测试通道 K1 断开、驱动器不输出；Load Board 上这只脚又没有上拉 / 下拉电阻，于是引脚什么都没接，电压由漏电和串扰随便决定，这就是悬空。可这恰恰是守则禁止的（{@fIntro}）：CMOS 输入是 MOS 管的栅极，几乎不吸电流，悬空时电压容易漂到中间电平，上下两只管子同时半导通，产生直通电流，IDD / IDDQ 变大、读数不稳，严重时会振荡甚至触发 Latch-up（{@latch}）。正确做法是给它一个确定电平：在程序里把它加进 Pin List，所有向量都驱动固定的 0 或 1（静态脚）；或者在 Load Board 上用电阻上拉到 VDD 或下拉到 GND。做 IDDQ 时尤其要这样，否则一只悬空脚就能让好芯片 Fail。',
          '"The program ignores it" is exactly how it ends up floating: the pin is not in the pin list, or it is listed but stays Off / high-Z in every vector, so its tester channel has K1 open and the driver off. If the load board has no pull-up or pull-down on that pin either, nothing is connected to it and its voltage is set at random by leakage and crosstalk. That is floating. It is also exactly what the rules forbid ({@fIntro}). A CMOS input is a MOS gate and draws almost no current, so a floating input easily drifts to a middle level where both the upper and lower transistors are half on. That creates shoot-through current, raises IDD / IDDQ and makes readings unstable; in bad cases it oscillates or even triggers latch-up ({@latch}). The right way is to give it a defined level: add it to the pin list and drive a fixed 0 or 1 in every vector (a static pin), or pull it up to VDD or down to GND with a resistor on the load board. This matters most for IDDQ, where one floating pin can make a good chip fail.',
        ),
        lessons: ['fIntro', 'latch', 'fLatch'],
      },
      {
        id: 'range-limit-clamp',
        q: loc(
          '解释一下 Range Settings / Limit Settings / Clamp Settings 的区别',
          'What is the difference between Range Settings, Limit Settings and Clamp Settings?',
        ),
        a: loc(
          '三者管的是三件不同的事。Range（量程）是仪器的刻度：施加量程决定 PMU 最多能加多大，测量量程决定能读到多大、分辨率多细；量程太小读数被截在上限，太大则分辨率不够，它影响的是“量得准不准”。Limit（判定限）是规格换来的 Pass / Fail 门槛（Fail GT / Fail LT），测完以后在软件里比较，不改变任何实际流过的电流或电压，它影响的是“判成什么”。Clamp（钳位）是施加时对另一个量的硬件保护：加压测流时限制最大电流，加流测压时限制最大电压，坏芯片短路或开路时，PMU 最多只给到钳位值，保护 DUT、探针和 Socket，它影响的是“会不会烧东西”。三者的大小关系一般是：Limit < Clamp ≤ Range。Clamp 必须设在 Limit 之外，否则读数永远到不了上限，这条测试永远不会 Fail（{@fIntro} 的 PMU 模拟器可以试）；Clamp 和读数又都要落在 Range 里。例：输入漏电 IIH 上限 10 µA，钳位 100 µA，测量量程选 100 µA 档。',
          'They control three different things. Range is the instrument scale: the force range sets the most the PMU can apply, and the measure range sets the largest value it can read and how fine the resolution is. Too small and the reading is cut off at the top; too large and the resolution is poor. It decides whether the measurement is accurate. Limit is the pass / fail threshold derived from the spec (Fail GT / Fail LT). It is compared in software after the measurement and changes nothing that actually flows; it decides what the result is called. Clamp is hardware protection on the other quantity while forcing: the maximum current when forcing voltage, the maximum voltage when forcing current. With a shorted or open bad part, the PMU delivers no more than the clamp, protecting the DUT, probes and socket; it decides whether anything gets damaged. The usual order is Limit < Clamp ≤ Range. The clamp must be outside the limit, or the reading can never pass the limit and the test can never fail (try it in the PMU simulator in {@fIntro}); and both the clamp and the reading must fit inside the range. Example: input leakage IIH limit 10 µA, clamp 100 µA, measure range 100 µA.',
        ),
        lessons: ['pmu', 'fIntro', 'fDc'],
      },
    ],
  },
  {
    id: 'vectors',
    title: loc('向量与 Scan', 'Vectors and scan'),
    items: [
      {
        id: 'no-exhaustive',
        q: loc('为什么不能把所有输入组合都试一遍？', 'Why not just try every input combination?'),
        a: loc(
          '时间不允许。64 个输入就有 2⁶⁴ 种组合，在 10 MHz 下要约 5.8 万年。带存储的电路更糟：输出还取决于内部 s 个触发器的状态，组合数是 2ⁿ⁺ˢ，例如 20 个输入加 10 个触发器就是 2²⁰ × 2¹⁰ = 2³⁰，而且状态还不能从管脚直接设。所以要靠故障模型和 ATPG 挑出少量有用的向量，见 {@vector}。',
          'There is no time. 64 inputs give 2⁶⁴ combinations, about 58,000 years at 10 MHz. Sequential circuits are worse: the output also depends on the state of s internal flip-flops, so there are 2ⁿ⁺ˢ combinations; 20 inputs and 10 flip-flops already give 2²⁰ × 2¹⁰ = 2³⁰, and the state cannot even be set from the pins. So fault models and ATPG pick a small set of useful vectors; see {@vector}.',
        ),
        lessons: ['vector', 'fVector'],
      },
      {
        id: 'fault-coverage',
        q: loc('故障覆盖率 100% 是不是就说明芯片没问题？', 'Does 100% fault coverage mean the chip is fine?'),
        a: loc(
          '不是。覆盖率只是“在某个故障模型下”能检测到的故障比例，常用的是 Stuck-at（固定为 0 / 1）。模型之外的缺陷（例如要一对前后向量加快时钟才能暴露的 Transition 故障、桥接、参数偏差）不在这个数字里，所以还要配合 At-speed、DC、AC 测试，见 {@vector}。',
          'No. Coverage is the share of faults detected under a particular fault model, usually stuck-at (stuck at 0 / 1). Defects outside the model, such as transition faults that need a specific pair of vectors and a fast clock, bridges or parametric shifts, are not in that number, so at-speed, DC and AC tests are still needed; see {@vector}.',
        ),
        lessons: ['vector', 'scan'],
      },
      {
        id: 'scan-shift-capture',
        q: loc('Scan 的“移位”和“捕获”分别在做什么？', 'What do scan shift and capture each do?'),
        a: loc(
          '每个 Scan FF 前加了一个二选一 MUX。SE = 1 时 FF 存 SI，所有 FF 串成移位寄存器：一拍一拍把激励移进去，同时把上一条的结果移出来，这是移位。SE = 0 时 FF 存 D，也就是组合逻辑的输出：打一拍系统时钟，把组合逻辑对激励的响应存进 FF，这是捕获。之后再移位，把结果从 SO 读出来和期望比，见 {@scan} 和 {@fScan}。',
          'Each scan FF has a 2-to-1 MUX in front. With SE = 1 the FF stores SI and all FFs form a shift register: the stimulus is shifted in clock by clock while the previous result shifts out. That is shift. With SE = 0 the FF stores D, the combinational output: one system clock stores the logic’s response to the stimulus. That is capture. Then shift again to read the result from SO and compare with the expected values; see {@scan} and {@fScan}.',
        ),
        lessons: ['scan', 'fScan'],
      },
      {
        id: 'scan-first-bit',
        q: loc('Scan 移位时为什么最远那一位要最先送进去？', 'Why does the farthest bit go in first when shifting?'),
        a: loc(
          '链是 SI → FF1 → … → FFn → SO。最先送进去的那一位要走最远，在最后一拍正好到达 FFn；最后送的那一位停在 FF1。所以要让 Q1…Q4 = 1 0 1 1，SI 上依次送 Q4、Q3、Q2、Q1，见 {@scan}。',
          'The chain is SI → FF1 → … → FFn → SO. The first bit sent travels farthest and reaches FFn on the last clock; the last bit sent stays in FF1. So to load Q1…Q4 = 1 0 1 1, SI receives Q4, Q3, Q2, Q1 in that order; see {@scan}.',
        ),
        lessons: ['scan'],
      },
      {
        id: 'flush-test',
        q: loc('跑 Scan 图形之前为什么先做 Flush / Shift 测试？', 'Why run flush / shift tests before scan patterns?'),
        a: loc(
          '先确认扫描链本身是通的。Flush 1 把所有 FF 置 0，再送进一个 1，看它能否一路推到 SO；Flush 0 反过来。Shift 测试送 00110011 这样的序列，检查每一位都能正确翻转。链断了，后面的 Scan 图形全都没意义，见 {@fScan}。',
          'To confirm the scan chain itself works. Flush 1 clears every FF to 0, feeds in a single 1 and checks it reaches SO; flush 0 is the reverse. The shift test feeds a sequence such as 00110011 to check every bit toggles correctly. If the chain is broken, every later scan pattern is meaningless; see {@fScan}.',
        ),
        lessons: ['scan', 'fScan'],
      },
      {
        id: 'vector-chars',
        q: loc('向量里的 1、0、H、L、X 分别是什么意思？', 'What do 1, 0, H, L and X mean in a vector?'),
        a: loc(
          '1 / 0 是驱动：Driver 给这根输入脚 VIH / VIL。H / L 是期望：在 Strobe 时刻 Comparator 检查输出是否高于 VOH / 低于 VOL。X 表示这一拍不比较（不关心）。同一行向量就是一拍里所有管脚该做的事，见 {@intro} 和 {@func}。',
          '1 / 0 are drive values: the driver puts VIH / VIL on that input. H / L are expected values: at the strobe the comparator checks the output is above VOH / below VOL. X means do not compare this cycle. One vector row is what every pin does in one cycle; see {@intro} and {@func}.',
        ),
        lessons: ['intro', 'func', 'fVector'],
      },
    ],
  },
  {
    id: 'program',
    title: loc('程序、表征与可靠性', 'Programs, characterization and reliability'),
    items: [
      {
        id: 'shmoo-holes',
        q: loc('Shmoo 图上的“空洞”和“孤岛”说明什么？', 'What do holes and islands on a shmoo plot mean?'),
        a: loc(
          '空洞是四周都 Pass、偏偏这里 Fail 的格子，常见原因是间歇性失效、电源噪声，或程序里某个条件没设对；孤岛是按边界本该 Fail、却 Pass 的格子，说明测量不稳定，不能当作真实裕量。边界不连续要先排查，而且如果量产只测规格框的角，这种芯片会被放过，见 {@shmoo}。',
          'A hole is a cell that fails while everything around it passes, typically from intermittent failure, supply noise, or a wrong condition in the program. An island is a cell that passes where the boundary says it should fail, which means the measurement is unstable and cannot count as real margin. A discontinuous boundary must be investigated first; and if production only tests the corners of the spec box, such a part slips through. See {@shmoo}.',
        ),
        lessons: ['shmoo', 'fChar'],
      },
      {
        id: 'binary-linear',
        q: loc('找参数边界时用二分搜索还是线性搜索？', 'Binary or linear search for a parameter edge?'),
        a: loc(
          '二分搜索步数少、快，但前提是 Pass / Fail 只有一个干净的分界。线性搜索一步步走，慢，但能看到边界附近的反复。带迟滞的施密特输入从两个方向测得的门限不同，必须用线性搜索，见 {@fChar}。',
          'Binary search takes few steps and is fast, but assumes a single clean pass/fail edge. Linear search steps along slowly but shows any back-and-forth near the edge. A Schmitt input with hysteresis has different thresholds from each direction and needs linear search; see {@fChar}.',
        ),
        lessons: ['shmoo', 'fChar'],
      },
      {
        id: 'four-suspects',
        q: loc('程序一跑就 Fail，先查哪里？', 'The program fails right away. Where do I look first?'),
        a: loc(
          'Fail 有四个嫌疑对象：测试程序（条件、极限、时序写错）、测试机、接口硬件（负载板、Socket、针卡）、芯片本身。先查便宜又能一次排除最多的，不要一上来就怪芯片。换一颗已知良品、看 Datalog 里读数的分布，都是快速缩小范围的办法，见 {@program} 和 {@fDebug}。',
          'A failure has four suspects: the test program (wrong conditions, limits or timing), the tester, the interface hardware (load board, socket, probe card) and the chip itself. Check what is cheapest and rules out the most first; do not blame the chip first. Swapping in a known-good part and looking at the spread of readings in the datalog both narrow things down quickly; see {@program} and {@fDebug}.',
        ),
        lessons: ['program', 'fDebug'],
      },
      {
        id: 'empty-socket',
        q: loc('程序交付前为什么要跑一遍“空座”？', 'Why run the program on an empty socket before release?'),
        a: loc(
          '空座时没有芯片，每一项都应该 Fail。如果某一项在空座下也 Pass，说明这一项根本没测到芯片（极限太松、测错脚、程序跳过了），留着它就会放过坏片。漏电和电流读数也要看，判断测试机和负载板自身的背景值，见 {@fQualify}。',
          'With no chip in the socket every test should fail. If a test still passes on an empty socket, it is not really testing the chip (limits too loose, wrong pin, skipped in the program) and would let bad parts through. Leakage and current readings are also reviewed to learn the background of the tester and load board; see {@fQualify}.',
        ),
        lessons: ['fQualify'],
      },
      {
        id: 'latchup-power',
        q: loc('Latch-up 发生后为什么只能掉电才能恢复？', 'Why does latch-up only clear by removing power?'),
        a: loc(
          'CMOS 里寄生的 PNP 和 NPN 构成一个 SCR，一旦被触发就互相提供基极电流，形成正反馈，从电源到地拉出大电流，不再需要外部触发。只有把电源断开（或把电流降到维持电流 IH 以下），正反馈才会停。量产测试要限流，否则芯片可能烧毁，见 {@latch} 和 {@fLatch}。',
          'The parasitic PNP and NPN in CMOS form an SCR. Once triggered, each feeds the other’s base current in positive feedback, drawing a large current from supply to ground with no further trigger needed. Only removing power (or dropping the current below the holding current IH) stops the feedback. Testing must limit current, or the chip may burn out; see {@latch} and {@fLatch}.',
        ),
        lessons: ['latch', 'fLatch'],
      },
      {
        id: 'char-vs-production',
        q: loc('表征（Characterization）和量产测试有什么不同？', 'How is characterization different from production test?'),
        a: loc(
          '量产测试只问“过不过”，在规格极限上 Go/No-Go，越快越好；表征要问“实际值是多少、离规格还有多少裕量”，会扫电压、频率、温度，画 Shmoo 图，测试时间长很多，通常只对少量样品做，见 {@shmoo} 和 {@fChar}。',
          'Production test asks only "pass or fail?" with Go/No-Go at the spec limits, as fast as possible. Characterization asks "what is the real value and how much margin is left?", sweeping voltage, frequency and temperature and drawing shmoo plots; it takes far longer and is usually done on a small sample. See {@shmoo} and {@fChar}.',
        ),
        lessons: ['shmoo', 'fChar'],
      },
    ],
  },
  {
    id: 'site',
    title: loc('网站使用', 'Using this site'),
    items: [
      {
        id: 'language',
        q: loc('怎么切换中文 / English？刷新后还在吗？', 'How do I switch between Chinese and English? Does it stick?'),
        a: loc(
          '点页面右上角的语言按钮即可，默认中文。选择会存在浏览器本地（localStorage），刷新或下次打开都会保持。',
          'Use the language button at the top right; Chinese is the default. Your choice is saved in the browser (localStorage) and kept after a refresh or next visit.',
        ),
        lessons: [],
      },
      {
        id: 'theme',
        q: loc('怎么切换深色 / 浅色主题？', 'How do I switch between dark and light themes?'),
        a: loc(
          '点页面右上角的主题按钮。主题同样存在浏览器本地，刷新后保持。',
          'Use the theme button at the top right. The theme is also saved in the browser and kept after a refresh.',
        ),
        lessons: [],
      },
      {
        id: 'share-link',
        q: loc('怎么把某一课、某个术语或某条问答分享给别人？', 'How do I share a lesson, a term or a FAQ entry?'),
        a: loc(
          '直接复制浏览器地址栏。每一课、每个术语、每条问答都有自己的地址，例如 #/glossary/strobe 打开术语表并定位到 Strobe，#/faq/strobe-early 打开这条问答。浏览器的后退也能正常使用。',
          'Just copy the address bar. Every lesson, term and FAQ entry has its own address; for example #/glossary/strobe opens the glossary at Strobe and #/faq/strobe-early opens that FAQ entry. The browser back button works as usual.',
        ),
        lessons: [],
      },
      {
        id: 'lesson-codes',
        q: loc('课程编号 D04、F06 是什么意思？', 'What do lesson codes like D04 and F06 mean?'),
        a: loc(
          '字母是轨道，数字是这一课在轨道里的顺序：D 是“基础 / 数字”轨道（D01–D17），F 是“数字测试基础”轨道（F01–F16）。文中出现的编号都可以点，直接跳到那一课。',
          'The letter is the track and the number is the lesson’s place in it: D is the Basics / Digital track (D01–D17) and F is the Digital Test Fundamentals track (F01–F16). Every code in the text is clickable and jumps to that lesson.',
        ),
        lessons: ['intro', 'fBasics'],
      },
      {
        id: 'feedback',
        q: loc('发现错误或有建议，怎么反馈？', 'How do I report a mistake or make a suggestion?'),
        a: loc(
          '每页底部版权行旁边、课程侧栏底部都有“反馈问题”链接，可以选 GitHub Issue 或邮件。链接会自动带上当前课程、页面地址、语言、主题和浏览器信息，你只要写清楚问题和期望。',
          'There are "Report a problem" links beside the copyright line at the bottom of every page and at the bottom of each lesson sidebar, by GitHub issue or email. They fill in the current lesson, page address, language, theme and browser for you; just describe the problem and what you expected.',
        ),
        lessons: [],
      },
    ],
  },
]

export const FAQ_GROUPS: FaqGroup[] = [...BASE_FAQ_GROUPS, MOS_FAQ_GROUP, PCB_FAQ_GROUP, ANA_FAQ_GROUP, HS_FAQ_GROUP, RF_FAQ_GROUP, MEM_FAQ_GROUP, QUAL_FAQ_GROUP, PWR_FAQ_GROUP]

export const FAQ_ITEMS: FaqItem[] = FAQ_GROUPS.flatMap((group) => group.items)
