import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-08 综合：车规产品量产测试流程（CP / FT 三温、Burn-in、PAT、追溯与 STDF） */
export const REL_FLOW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'dppm',
      term: 'DPPM',
      name: loc('每百万缺陷件数（DPPM）', 'Defective parts per million (DPPM)'),
      def: loc(
        '每一百万颗出货器件中的缺陷（失效）件数，常用于车规量产的质量目标。本课用期望值计算现场 ppm，见 {@relFlow}。',
        'The number of defective (failed) parts per million shipped; a common quality target in automotive production. This lesson computes the expected field ppm; see {@relFlow}.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'field-ppm',
      term: 'Field ppm',
      name: loc('现场 ppm（出货缺陷率）', 'Field ppm (outgoing defect rate)'),
      def: loc(
        '现场或出货后按每百万颗计的缺陷比例，和 DPPM 是同一类量。它不是锁相环、时钟里的频率 ppm。见 {@relFlow}。',
        'Defects per million in the field or at shipment, the same kind of quantity as DPPM. It is not the frequency ppm used for PLLs and clocks. See {@relFlow}.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'traceability',
      term: 'Traceability',
      name: loc('可追溯性', 'Traceability'),
      def: loc(
        '能追回每颗器件属于哪个 Lot、哪片晶圆、哪个坐标、在哪个温度测过、经过了哪些站。信息要在测试时写入 STDF（MIR、PIR/PRR），事后补记既不完整也不可靠。见 {@relFlow}。',
        'Being able to trace each device back to its Lot, wafer, coordinates, the temperatures it was tested at and the stations it passed. The data must be written to the STDF during test (MIR, PIR/PRR); filling it in later is neither complete nor reliable. See {@relFlow}.',
      ),
      lessons: ['relFlow'],
    },
  ],
  extraLessons: {
    'burn-in': ['relFlow'],
    cp: ['relFlow'],
    ft: ['relFlow'],
    stdf: ['relFlow'],
    yield: ['relFlow'],
    'three-temp-test': ['relFlow'],
  },
  faqs: [
    {
      id: 'rel-flow-three-temp',
      q: loc('三温测试为什么不能用常温代替？', 'Why can room-temperature testing not replace the three-temperature test?'),
      a: loc(
        '有些参数只在低温或高温超限，这是温度相关的参数偏移。常温测试通过，这类器件在对应温度下仍会被拒。本课的模拟里，去掉 FT 低温站后，冷端偏移的器件全部漏出，ppm 明显上升。车规对温度等级的要求见 {@relAuto}。',
        'Some parameters only exceed their limits at low or high temperature; this is a temperature-dependent parameter shift. A room test can pass such a device, which then fails at its own temperature. In this lesson’s simulation, removing the FT cold station lets all cold-shift devices escape and clearly raises ppm. The automotive temperature grades are covered in {@relAuto}.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'rel-flow-soak',
      q: loc('soak 时间为什么会拉低 UPH？', 'Why does soak time lower UPH?'),
      a: loc(
        '每次温度切换，测试机都要等温度稳定，这段时间不测器件。soak 按批计：切换次数 × 批数 × soak 秒数，都算进总测试时间 T_td。UPH = 3600 × N / T_td，T_td 变长，UPH 就降，每颗的测试成本随之上升。',
        'Each temperature change makes the tester wait for the temperature to settle, and no devices are tested during that time. Soak is paid per batch: temperature changes × batches × soak seconds all add to the total test time T_td. UPH = 3600 × N / T_td, so a longer T_td lowers UPH and raises the test cost per unit.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'rel-flow-bi-or-pat',
      q: loc('PAT 能不能代替 Burn-in？', 'Can PAT replace burn-in?'),
      a: loc(
        '不能完全代替。PAT 用统计限值找出参数偏离中位数较大的器件，抓的是“参数上的离群”；Burn-in 让弱群体在加速条件下提前失效，抓的是“时间上的早夭”。两者针对的失效不同，应当互补使用。Burn-in 的加速原理见 {@relBurnIn}，PAT 的限值计算见 {@relPat}。',
        'Not completely. PAT uses statistical limits to find devices whose parameters sit far from the median, catching parametric outliers; burn-in brings the weak population’s failures forward under acceleration, catching early-life failures. The two target different failures and should complement each other. The acceleration principle of burn-in is in {@relBurnIn}, and the PAT limit calculation is in {@relPat}.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'rel-flow-more-tests',
      q: loc('测试项是不是越多越安全？', 'Do more test items always make the product safer?'),
      a: loc(
        '不是。多一项就多时间、多夹具、多过杀。覆盖要用失效模式来选：三温抓温度偏移，Burn-in 抓早期，PAT 抓规格内离群，不是把能测的都测一遍。见 {@relFlow}。',
        'No. Each extra item adds time, fixtures and overkill. Coverage is chosen from failure modes: three temperatures for thermal shift, burn-in for early life, PAT for in-spec outliers — not every test you can think of. See {@relFlow}.',
      ),
      lessons: ['relFlow'],
    },
    {
      id: 'rel-flow-trace-later',
      q: loc('追溯信息能不能测试之后再补？', 'Can traceability be filled in after test?'),
      a: loc(
        '不能指望事后补。Lot、晶圆坐标、温度站必须在测试时写入 STDF。事后回忆既对不上当时的站，也补不回已经丢掉的记录。见 {@relFlow}。',
        'Do not count on filling it in later. Lot, wafer coordinates and temperature stations must be written to the STDF during test. Recalling afterwards neither matches the station at the time nor restores a record that was never kept. See {@relFlow}.',
      ),
      lessons: ['relFlow'],
    },
  ],
}
