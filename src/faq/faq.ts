import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'

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

export const FAQ_GROUPS: FaqGroup[] = [
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
          '输出级导通的 MOS 管相当于一个导通电阻 R_on。不带负载时没有电流，R_on 上没有压降，哪怕驱动变弱了读数也是 VDD 或 0 V。只有拉出 / 灌入规定的 IOH / IOL，压降 I × R_on 才显现。{@dc} 的例子：VOL @ 8 mA，正常 40 Ω 得 0.32 V Pass，偏弱 70 Ω 得 0.56 V Fail；空载时两颗都读 0 V，分不出来。',
          'The MOS transistor that is on in the output stage acts like an on-resistance R_on. With no load there is no current and no drop across R_on, so even a weak driver reads VDD or 0 V. Only when the specified IOH / IOL is drawn does the I × R_on drop appear. In {@dc}: VOL @ 8 mA gives 0.32 V (pass) with a normal 40 Ω and 0.56 V (fail) with a weak 70 Ω; unloaded, both read 0 V and cannot be told apart.',
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
          '字母是轨道，数字是这一课在轨道里的顺序：D 是“基础 / 数字”轨道（D01–D15），F 是“数字测试基础”轨道（F01–F16）。文中出现的编号都可以点，直接跳到那一课。',
          'The letter is the track and the number is the lesson’s place in it: D is the Basics / Digital track (D01–D15) and F is the Digital Test Fundamentals track (F01–F16). Every code in the text is clickable and jumps to that lesson.',
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

export const FAQ_ITEMS: FaqItem[] = FAQ_GROUPS.flatMap((group) => group.items)
