import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  type AutoState,
  type CaseId,
  GRADES,
  type GroupId,
  gradesRight,
  gradeVerdict,
  groupsCorrect,
  needOf,
  type ProductId,
  rightGrade,
  type RoleId,
  rolesCorrect,
  type StdId,
  STANDARDS,
  type TestId,
  tempCoverage,
  TESTS,
  VDUT_GRADE,
} from './relAutoModel'

/** 把 {0}、{1} … 换成数值；中英文译文都替换，数字不拼进 loc 的模板字符串里 */
export function fill(text: LText, ...values: string[]): LText {
  const apply = (source: string) => values.reduce((acc, value, index) => acc.split(`{${index}}`).join(value), source)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

export const PRODUCT_TEXT: Record<ProductId, { title: LText; sub: LText }> = {
  sensor: {
    title: loc('发动机舱传感器接口', 'Engine-bay sensor interface'),
    sub: loc('装在发动机舱，环境上限示例 140 °C', 'Mounted in the engine bay; example ambient max 140 °C'),
  },
  audio: {
    title: loc('座舱音频', 'Cabin audio'),
    sub: loc('装在座舱内，环境上限示例 85 °C', 'Inside the cabin; example ambient max 85 °C'),
  },
  led: {
    title: loc('车身 LED 驱动', 'Body LED driver'),
    sub: loc('靠近车灯，环境上限示例 105 °C', 'Near the lamp; example ambient max 105 °C'),
  },
  vdut: {
    title: loc('VDUT-AUTO1 电源管理 IC', 'VDUT-AUTO1 power-management IC'),
    sub: loc('本课贯穿的虚拟器件，固定为 Grade 1', 'The running virtual part, fixed at Grade 1'),
  },
}

export const TEST_NAME: Record<TestId, LText> = {
  tc: loc('温度循环（TC）', 'Temperature cycling (TC)'),
  hast: loc('高加速温湿度应力（HAST）', 'Highly accelerated temperature and humidity stress (HAST)'),
  htol: loc('高温工作寿命（HTOL）', 'High-temperature operating life (HTOL)'),
  elfr: loc('早期失效率试验（ELFR）', 'Early-life failure rate (ELFR)'),
  bond: loc('键合拉力（Bond pull）', 'Bond pull'),
  em: loc('电迁移（EM）', 'Electromigration (EM)'),
  tddb: loc('经时介质击穿（TDDB）', 'Time-dependent dielectric breakdown (TDDB)'),
  hbm: loc('人体模型 ESD（HBM）', 'Human-body-model ESD (HBM)'),
  pat: loc('零件平均测试（PAT）', 'Part average testing (PAT)'),
  hermetic: loc('腔体密封性（Hermeticity）', 'Hermeticity'),
}

export const GROUP_NAME: Record<GroupId, LText> = {
  A: loc('加速环境应力', 'Accelerated environmental stress'),
  B: loc('加速寿命模拟', 'Accelerated lifetime simulation'),
  C: loc('封装组装完整性', 'Package assembly integrity'),
  D: loc('晶圆制造可靠性', 'Wafer fab reliability'),
  E: loc('电学验证', 'Electrical verification'),
  F: loc('缺陷筛选', 'Defect screening'),
  G: loc('腔体封装完整性', 'Cavity package integrity'),
}

export const CASE_TEXT: Record<CaseId, { title: LText; reason: LText }> = {
  c1: {
    title: loc('冷热循环后焊线断开', 'Bond wire breaks after hot-cold cycling'),
    reason: loc('封装材料与金属线的热膨胀系数不同，反复冷热让焊线颈部疲劳，TC 把这种应力加速到几周内看出来。', 'Package materials and the metal wire expand at different rates; repeated hot and cold fatigues the wire neck, and TC accelerates that stress so it shows within weeks.'),
  },
  c2: {
    title: loc('潮湿环境里引脚腐蚀', 'Pin corrosion in humid conditions'),
    reason: loc('湿气沿封装界面渗入，加上偏置与温度，会加速腐蚀；HAST 用高温高湿把这一过程加快。', 'Moisture seeps along package interfaces; with bias and temperature it accelerates corrosion, and HAST speeds that process up with high heat and humidity.'),
  },
  c3: {
    title: loc('高温加电运行后参数漂移', 'Parameter drift after high-temperature powered operation'),
    reason: loc('长期带偏置工作时，器件内部的缓慢变化会累积成漂移，HTOL 在高温下加电运行来看这种长期行为。', 'Long powered operation lets slow internal changes add up into drift; HTOL runs the part powered at high temperature to watch this long-term behaviour.'),
  },
  c4: {
    title: loc('批量投产初期出现早期失效', 'Early failures in the first weeks of volume production'),
    reason: loc('潜在缺陷集中在早期；ELFR 在较严的应力下抽样运行，估算这一段的失效率，是否要收紧筛选由结果决定。', 'Latent defects cluster early; ELFR runs a sample under harsher stress to estimate this early failure rate, and the result decides whether screening must tighten.'),
  },
  c5: {
    title: loc('装配后焊线脱开', 'Wire lifts off after assembly'),
    reason: loc('键合点的机械强度不够，装配时的拉扯就能把它拉开；键合拉力测的就是这个焊点的强度。', 'If the bond has too little mechanical strength, handling during assembly can pull it off; bond pull measures that bond strength directly.'),
  },
  c6: {
    title: loc('大电流长期工作后金属线断开', 'Metal line opens after long high-current operation'),
    reason: loc('大电流让金属原子沿电子流方向迁移，形成空洞或小丘；EM 测的就是这种随电流而来的金属迁移。', 'High current moves metal atoms along the electron flow, forming voids or hillocks; EM tests exactly this current-driven metal migration.'),
  },
  c7: {
    title: loc('栅氧化层在电压下慢慢击穿', 'Gate oxide slowly breaks down under voltage'),
    reason: loc('电场长期作用会让绝缘层里的缺陷逐渐积累，直到击穿；TDDB 在较高电场与温度下看这种随时间的失效。', 'A long-term electric field lets defects build up in the insulator until it breaks down; TDDB watches this time-dependent failure at higher field and temperature.'),
  },
  c8: {
    title: loc('装配时人体静电打坏输入脚', 'Input pin damaged by human static during assembly'),
    reason: loc('人体携带的静电通过管脚放电，烧坏保护结构；HBM 用人体模型放电来检查这种静电耐受。', 'Static from a human body discharges through a pin and damages the protection structure; HBM uses a human-body model discharge to check that tolerance.'),
  },
  c9: {
    title: loc('单颗参数在规格内，却明显偏离同批', 'A part within spec but far from its lot'),
    reason: loc('规格内不等于好品：离群的参数常与潜在缺陷相关，PAT 用同批的统计分布去抓这些离群件（REL-07 展开）。', 'Within spec does not mean good: outlying parameters often go with latent defects, and PAT uses the lot’s statistical distribution to catch them (expanded in REL-07).'),
  },
  c10: {
    title: loc('腔体漏气，内部受潮', 'Cavity leaks, and the inside gets damp'),
    reason: loc('密封腔体漏气后湿气进入，内部腐蚀或参数漂移；腔体密封性测的就是这个漏气问题。', 'When a sealed cavity leaks, moisture enters and causes internal corrosion or drift; hermeticity testing looks for exactly this leak.'),
  },
  c11: {
    title: loc('同一晶圆的一小块区域集中失效', 'A small cluster of failures on one part of a wafer'),
    reason: loc('同一区域集中出问题，说明可能是局部工艺或设备异常；空间上的聚集用邻近规则和分布去看，PAT 与之配合（REL-07）。', 'A cluster on one part of a wafer points to a local process or equipment issue; spatial clustering is checked with neighbourhood rules and distributions, which PAT works with (REL-07).'),
  },
  c12: {
    title: loc('冬季低温启动失败', 'Winter cold start fails'),
    reason: loc('低温让器件的阈值、电阻和基准电压变化，启动时裕量变小；TC 的低温段覆盖到这样的环境，所以要有低温点。', 'Cold changes thresholds, resistances and reference voltages, shrinking the start-up margin; the cold end of TC covers this environment, so a cold test point is needed.'),
  },
}

export const ROLE_NAME: Record<RoleId, LText> = {
  qual: loc('元器件可靠性认证：试验分组与温度等级', 'Component reliability qualification: test groups and temperature grades'),
  safety: loc('功能安全：随机硬件失效与 ASIL 等级', 'Functional safety: random hardware failures and ASIL levels'),
  qms: loc('质量管理体系：过程控制、追溯与变更通知', 'Quality management system: process control, traceability and change notice'),
}

export const STD_NAME: Record<StdId, string> = {
  aec: 'AEC-Q100',
  iso: 'ISO 26262',
  iatf: 'IATF 16949',
}

export const S = {
  kickerNow: loc('这一次：车规等级与试验', 'This time: automotive grades and tests'),
  introTitle: loc('车规：同一颗芯片，装在不同位置，要的等级不同', 'Automotive: the same chip needs a different grade in a different location'),
  gradeTitle: loc('① 选温度等级：先看装在哪', '① Pick a temperature grade: start from the mounting location'),
  gradeNote: loc(
    '点一张产品卡，再为它选等级。等级数字越小，环境温度上限越高、范围越宽。等级表是教学示例，以现行标准为准。',
    'Pick a product card, then choose its grade. A smaller grade number means a higher ambient limit and a wider range. The grade table is a teaching example; follow the current standard.',
  ),
  gradeSeg: loc('温度等级', 'Temperature grade'),
  rNeed: loc('安装环境上限（示例）', 'Ambient max (example)'),
  rRange: loc('所选等级的温度范围', 'Temperature range of the chosen grade'),
  rVerdict: loc('判定', 'Verdict'),
  vRight: loc('刚好覆盖', 'Just covers it'),
  vOver: loc('覆盖，但超规格', 'Covers, but over-specified'),
  vShort: loc('上限不够', 'Upper limit too low'),
  tableCaption: loc('温度等级表（示例，以现行标准为准）', 'Temperature grade table (example; follow the current standard)'),
  thGrade: loc('等级', 'Grade'),
  thRange: loc('环境工作温度范围', 'Ambient operating range'),
  tempTitle: loc('② VDUT-AUTO1 的三温测试：低温、室温、高温', '② Three-temperature test for VDUT-AUTO1: cold, room, hot'),
  tempNote: loc(
    '设置低温点和高温点（室温固定 25 °C）。测试温度点要覆盖 Grade 1 的两端：−40 °C 与 +125 °C。教学示意，以现行标准为准。',
    'Set the cold and hot points (room is fixed at 25 °C). The test points should cover both ends of Grade 1: −40 °C and +125 °C. Teaching illustration; follow the current standard.',
  ),
  lowLabel: loc('低温点', 'Cold point'),
  highLabel: loc('高温点', 'Hot point'),
  rLow: loc('低温点', 'Cold point'),
  rRoom: loc('室温点（固定）', 'Room point (fixed)'),
  rHigh: loc('高温点', 'Hot point'),
  rCover: loc('覆盖 Grade 1 两端？', 'Covers both ends of Grade 1?'),
  yes: loc('是', 'Yes'),
  no: loc('否', 'No'),
  vdutFixed: loc('VDUT-AUTO1 固定为 Grade 1，本课用它做三温测试。', 'VDUT-AUTO1 is fixed at Grade 1, and this lesson uses it for the three-temperature test.'),
  coldPurpose: loc(
    '低温点的目的：检查冷启动、基准电压和静态电流在最冷时是否仍在规格内，以及上电时序在冷环境下会不会出错。低温点不够低，冬天启动才会暴露的问题就会漏掉。',
    'Purpose of the cold point: check that cold start, reference voltage and quiescent current stay within spec at the coldest end, and that power-up sequencing does not fail in the cold. A cold point that is not low enough lets through faults that only show up in a winter start.',
  ),
  casesTitle: loc('③ 失效案例：每个案例对应哪一项试验', '③ Failure cases: which test catches each'),
  casesNote: loc(
    '点一个案例。卡片副标题是先暴露它的试验，下方是原因。',
    'Pick a case. The line under each card names the test that exposes it first; the explanation below says why.',
  ),
  groupsTitle: loc('④ 把 10 个试验归入分组 A–G', '④ Assign the 10 tests to groups A–G'),
  groupsNote: loc(
    '每个试验选一个分组。分组只说明试验的目的类别，不是标准条款。',
    'Choose one group for each test. The groups name the purpose of each test; they are not standard clauses.',
  ),
  groupsCount: loc('已选对', 'Correct so far'),
  groupPick: loc('分组', 'Group'),
  stdTitle: loc('⑤ 三类标准各管什么', '⑤ What each of the three standards covers'),
  stdNote: loc('为每个标准选一个角色。这里只讲角色，不讲条款。', 'Pick a role for each standard. Only roles are described here, not clauses.'),
  stdPick: loc('角色', 'Role'),
  stdCount: loc('已选对', 'Correct so far'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '三温测试的时间与成本（温控分选、soak 时间）在 REL-08 的量产流程里算；零缺陷的统计筛选在 REL-07。',
    'The time and cost of three-temperature testing (temperature-controlled handler, soak time) are worked out in the REL-08 production flow; zero-defect statistical screening is in REL-07.',
  ),
  next: loc('下一课：零缺陷测试策略：PAT、SBA 与邻近筛选', 'Next: Zero-defect strategy: PAT, SBA and neighbourhood screening'),
  task1: loc('T1 为发动机舱、座舱、车身三个位置选对温度等级。', 'T1 Choose the right grade for the engine-bay, cabin and body locations.'),
  task2: loc('T2 把 10 个试验全部归入正确的分组 A–G。', 'T2 Put all 10 tests into the correct groups A–G.'),
  task3: loc('T3 为 VDUT-AUTO1 设置三温温度点（低温 −40 °C 以下，高温 125 °C 以上），并说明低温的目的。', 'T3 Set the three-temperature points for VDUT-AUTO1 (cold at or below −40 °C, hot at or above 125 °C) and explain the purpose of the cold point.'),
  task4: loc('T4 把 AEC-Q100、ISO 26262、IATF 16949 与各自的角色配对。', 'T4 Match AEC-Q100, ISO 26262 and IATF 16949 with their roles.'),
}

export const INTRO = [
  loc(
    '车规芯片要在汽车的整个使用寿命里、在很宽的温度范围内工作。AEC-Q100 是元器件认证的公开框架：用温度等级说明环境范围，用一组组试验（A–G）说明要验证什么。具体条件与数值以现行标准为准，这里只讲概念。',
    'Automotive chips must work across a wide temperature range over the whole vehicle life. AEC-Q100 is a published framework for component qualification: temperature grades state the ambient range, and groups of tests (A–G) state what must be verified. Conditions and values are set by the current standard; here only the concepts are covered.',
  ),
  loc(
    '同一颗芯片装在发动机舱和座舱，环境温度差很多，选的等级也不同。等级不是质量分数，而是对环境上限的承诺；选得过宽会增加认证与测试的成本。{@relStress} 讲的 HTOL、TC、HAST 等试验，就是在这些分组里。',
    'The same chip may sit in the engine bay or the cabin, where ambient temperatures differ widely, so the grade differs too. A grade is a promise about the ambient limit, not a quality score; choosing one wider than needed adds qualification and test cost. The HTOL, TC and HAST tests in {@relStress} belong to these groups.',
  ),
  loc(
    '车规还要三件事一起看：AEC-Q100 管元器件的认证，ISO 26262 管功能安全，IATF 16949 管质量体系与追溯。这三者互相补充，不能互相替代。本课最后的量产流程见 {@relFlow}。',
    'Automotive also needs three things together: AEC-Q100 for component qualification, ISO 26262 for functional safety, and IATF 16949 for the quality system and traceability. They complement each other and cannot replace one another. The production flow that ties them together is in {@relFlow}.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    'Grade 越高越“好”。等级数字大的，温度范围反而窄：Grade 3 的上限是 85 °C，Grade 0 是 150 °C。等级要按安装位置的环境上限选，不是按数字大小选。',
    'A higher grade is “better”. A larger grade number means a narrower range: Grade 3 tops out at 85 °C and Grade 0 at 150 °C. Pick the grade from the installed location’s ambient limit, not from the size of the number.',
  ),
  loc(
    '通过 AEC-Q100 就满足功能安全。AEC-Q100 是元器件可靠性认证的框架，讲的是试验与温度等级；功能安全（ISO 26262）要分析系统级的故障与 ASIL 等级，是另一套工作，两者都要做。',
    'Passing AEC-Q100 satisfies functional safety. AEC-Q100 is the component reliability framework covering tests and temperature grades; functional safety (ISO 26262) analyses system-level faults and ASIL levels. It is a separate body of work, and both are needed.',
  ),
  loc(
    '三温测试只是把同一个测试做三遍。低温、室温、高温各自暴露不同的问题：冷启动、基准漂移、高温漏电。温度点不覆盖等级的两端，对应的失效就会漏掉。',
    'Three-temperature testing is the same test run three times. Cold, room and hot each expose different problems: cold start, reference drift and hot leakage. If the test points do not cover both ends of the grade, the matching failures slip through.',
  ),
]

export const TAKEAWAY: LText = loc(
  'AEC-Q100 的温度等级按安装位置的环境上限选，数字越小范围越宽；试验分 A–G 七组，各有目的；三温测试的低温点和高温点要覆盖等级两端；AEC-Q100 管元器件认证，ISO 26262 管功能安全，IATF 16949 管质量体系与追溯，三者不能互相替代。',
  'AEC-Q100 temperature grades are chosen from the installed location’s ambient limit, and a smaller number means a wider range. Tests fall into seven groups, A–G, each with a purpose. The cold and hot points of a three-temperature test must cover both ends of the grade. AEC-Q100 covers component qualification, ISO 26262 functional safety and IATF 16949 the quality system and traceability; none replaces another.',
)

/** 四张任务卡：完成与否由当前选择算出，重置后还原 */
export function taskItems(state: AutoState): TaskItem[] {
  return [
    { id: 't1', text: S.task1, done: gradesRight(state.grades) },
    { id: 't2', text: S.task2, done: groupsCorrect(state.groups) === TESTS.length },
    { id: 't3', text: S.task3, done: tempCoverageDone(state) },
    { id: 't4', text: S.task4, done: rolesCorrect(state.roles) === STANDARDS.length },
  ]
}

function tempCoverageDone(state: AutoState): boolean {
  const cover = tempCoverage(state.lowC, state.highC, VDUT_GRADE)
  return cover.low && cover.high
}

/** 右侧说明栏：当前卡是可选等级的产品就说明等级判定，是 VDUT-AUTO1 就说明三温温度点 */
export function verdictOf(state: AutoState): { title: LText; text: LText } {
  const { product } = state
  if (product === 'vdut') {
    const cover = tempCoverage(state.lowC, state.highC, VDUT_GRADE)
    if (cover.low && cover.high) {
      return {
        title: loc('三温覆盖 Grade 1 两端', 'Three-temperature points cover both ends of Grade 1'),
        text: fill(
          loc(
            '低温点 {0} °C、高温点 {1} °C，覆盖 Grade 1 的 −40 ~ +125 °C 两端。原因：车规器件要在两端都保证参数，只测室温无法证明冷启动与高温漏电。',
            'Cold point {0} °C and hot point {1} °C cover both ends of Grade 1’s −40 to +125 °C. Reason: automotive parts must hold parameters at both ends, and a room-only test cannot prove cold start or hot leakage.',
          ),
          String(state.lowC),
          String(state.highC),
        ),
      }
    }
    return {
      title: loc('三温没有覆盖 Grade 1 的两端', 'Three-temperature points miss an end of Grade 1'),
      text: fill(
        loc(
          '低温点 {0} °C、高温点 {1} °C。原因：低温点高于 −40 °C 时，冷启动问题可能漏检；高温点低于 125 °C 时，高温下的漏电与精度漂移可能漏检。',
          'Cold point {0} °C and hot point {1} °C. Reason: a cold point above −40 °C can miss cold-start faults, and a hot point below 125 °C can miss hot leakage and accuracy drift.',
        ),
        String(state.lowC),
        String(state.highC),
      ),
    }
  }
  const need = needOf(product)
  const grade = state.grades[product]
  const verdict = gradeVerdict(grade, need)
  if (verdict === 'short') {
    return {
      title: S.vShort,
      text: fill(
        loc(
          'Grade {0} 的上限是 {1} °C，低于安装环境的 {2} °C。原因：环境温度超过等级上限时，芯片不在保证范围内工作，要换到上限足够的等级。',
          'Grade {0} tops out at {1} °C, below the {2} °C installed environment. Reason: above the grade’s ceiling the chip is outside its guaranteed range, so a grade with a high enough ceiling is needed.',
        ),
        String(grade),
        String(GRADES[grade].maxC),
        String(need),
      ),
    }
  }
  if (verdict === 'over') {
    return {
      title: S.vOver,
      text: fill(
        loc(
          'Grade {0} 的上限 {1} °C 覆盖 {2} °C 的需求，但比需要的更宽，推荐 Grade {3}。原因：等级数字越小范围越宽，要的越多，认证与测试的成本越高，多出的范围不增加安全。',
          'Grade {0} tops out at {1} °C, covering the {2} °C need, but it is wider than needed; Grade {3} is recommended. Reason: a smaller grade number means a wider range, and more range costs more to qualify and test, without adding safety.',
        ),
        String(grade),
        String(GRADES[grade].maxC),
        String(need),
        String(rightGrade(need)),
      ),
    }
  }
  return {
    title: S.vRight,
    text: fill(
      loc(
        'Grade {0} 的上限 {1} °C 刚好覆盖 {2} °C 的需求。原因：这是能覆盖需求的最窄等级（数字最大的那一个），不多花认证与测试的成本。',
        'Grade {0} tops out at {1} °C, just covering the {2} °C need. Reason: it is the narrowest grade that covers the need (the largest number that still works), so no extra qualification or test cost is added.',
      ),
      String(grade),
      String(GRADES[grade].maxC),
      String(need),
    ),
  }
}

/** 测验里的数值与模型一致：Grade 1 跨度、音频余量 */
const SPAN_G1 = GRADES[VDUT_GRADE].maxC - GRADES[VDUT_GRADE].minC
const HEADROOM_AUDIO = GRADES[VDUT_GRADE].maxC - needOf('audio')

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('下面哪一句对车规温度等级的理解是正确的？', 'Which statement about automotive temperature grades is correct?'),
    options: [
      { id: 'a', text: loc('Grade 3 比 Grade 0 更好，因为数字大', 'Grade 3 is better than Grade 0 because its number is larger') },
      { id: 'b', text: loc('Grade 0 的范围最宽，Grade 3 最窄；要按安装位置的环境上限选等级', 'Grade 0 has the widest range and Grade 3 the narrowest; choose the grade from the installed location’s ambient limit') },
      { id: 'c', text: loc('等级越高，温度下限越低', 'The higher the grade, the lower its cold limit') },
    ],
    answer: 'b',
    explain: loc(
      '等级数字越小，上限越高，范围越宽（Grade 0 上限 150 °C，Grade 3 上限 85 °C）。下限在四个等级里都是 −40 °C，差别只在上限。等级是按环境选的，不是质量高低。',
      'A smaller grade number means a higher ceiling and a wider range (Grade 0 tops out at 150 °C, Grade 3 at 85 °C). All four grades share a −40 °C floor, so they differ only at the top. The grade is chosen by the environment, not by quality.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('VDUT-AUTO1 固定为 Grade 1，范围是 −40 ~ +125 °C。这个范围的跨度（上限减下限）是多少 °C？', 'VDUT-AUTO1 is fixed at Grade 1, a range of −40 to +125 °C. What is the span (top minus bottom) in °C?'),
    options: [
      { id: 'a', text: loc('190 °C', '190 °C') },
      { id: 'b', text: loc('125 °C', '125 °C') },
      { id: 'c', text: loc('165 °C', '165 °C') },
    ],
    answer: 'c',
    explain: fill(
      loc('跨度 = 125 − (−40) = {0} °C。注意下限是负数，要用减法的符号规则算。', 'Span = 125 − (−40) = {0} °C. The floor is negative, so apply the rule for subtracting a negative.'),
      String(SPAN_G1),
    ),
  },
  {
    id: 'q3',
    prompt: loc('座舱音频的环境上限示例为 85 °C。选 Grade 1（上限 125 °C）而不是 Grade 3（上限 85 °C），上限多出的余量是多少 °C？', 'Cabin audio has an example ambient max of 85 °C. Choosing Grade 1 (top 125 °C) instead of Grade 3 (top 85 °C), how many °C of extra headroom is that?'),
    options: [
      { id: 'a', text: loc('40 °C', '40 °C') },
      { id: 'b', text: loc('60 °C', '60 °C') },
      { id: 'c', text: loc('20 °C', '20 °C') },
    ],
    answer: 'a',
    explain: fill(
      loc('余量 = 125 − 85 = {0} °C。余量存在，但座舱音频本来只需要 85 °C，多出来的范围并不增加可靠性，反而多花认证与测试的成本。', 'Headroom = 125 − 85 = {0} °C. The headroom exists, but cabin audio only needs 85 °C, so the extra range adds no reliability and costs more to qualify and test.'),
      String(HEADROOM_AUDIO),
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '下面三条，哪几条都正确？\n(i) 通过 AEC-Q100 就等于满足功能安全。\n(ii) ISO 26262 管随机硬件失效与 ASIL 等级。\n(iii) IATF 16949 管质量体系、过程控制与追溯。',
      'Which statements are all correct?\n(i) Passing AEC-Q100 means functional safety is satisfied.\n(ii) ISO 26262 covers random hardware failures and ASIL levels.\n(iii) IATF 16949 covers the quality system, process control and traceability.',
    ),
    options: [
      { id: 'a', text: loc('(i)、(ii) 都对', '(i) and (ii) are correct') },
      { id: 'b', text: loc('(ii)、(iii) 都对', '(ii) and (iii) are correct') },
      { id: 'c', text: loc('(i)、(iii) 都对', '(i) and (iii) are correct') },
    ],
    answer: 'b',
    explain: loc(
      '(i) 错：AEC-Q100 是元器件认证框架，功能安全要另外按 ISO 26262 做系统级的故障分析。(ii) 和 (iii) 分别是功能安全与质量体系的范围，各管一件事。',
      '(i) is wrong: AEC-Q100 is the component qualification framework, and functional safety needs a separate system-level fault analysis under ISO 26262. (ii) and (iii) each describe the scope of functional safety and of the quality system.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('VDUT-AUTO1 的低温测试点为什么要压到 −40 °C 或更低？', 'Why must the cold test point of VDUT-AUTO1 reach −40 °C or lower?'),
    options: [
      { id: 'a', text: loc('低温测试只是为了省时间', 'The cold test only saves time') },
      { id: 'b', text: loc('只有高温才有失效，低温不需要测', 'Only high temperature causes failures, so cold needs no test') },
      { id: 'c', text: loc('覆盖 Grade 1 的下限：冷启动、基准电压与静态电流的低温漂移只有在最冷的点才会暴露', 'To cover the Grade 1 floor: cold start, reference-voltage and quiescent-current drift only show at the coldest point') },
    ],
    answer: 'c',
    explain: loc(
      '三温的低温点要覆盖等级下限，因为冷启动、基准漂移这类问题在最冷的点才最明显。温度点没到下限，就无法证明器件在整个等级范围内都能工作。',
      'The cold point must reach the grade floor, because cold start and reference drift are most visible at the coldest end. Without reaching the floor, the test cannot show the part works across the whole grade range.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('有人说：“选更宽的等级，比如 Grade 0，总是更稳妥。”这句话对吗？', 'Someone says: “Always choose a wider grade such as Grade 0; it is always safer.” Is that right?'),
    options: [
      { id: 'a', text: loc('不对：更宽的范围要付出更高的认证、测试与材料成本，超出需要的范围并不增加安全', 'Not right: a wider range costs more to qualify, test and build, and range beyond the need adds no safety') },
      { id: 'b', text: loc('对：范围越宽越安全，所以都选 Grade 0', 'Right: wider is safer, so pick Grade 0 everywhere') },
      { id: 'c', text: loc('对：Grade 0 的测试项更少', 'Right: Grade 0 has fewer tests') },
    ],
    answer: 'a',
    explain: loc(
      '安全来自器件在它的安装环境里被验证过。选的等级比需要的宽，只会多出成本。Grade 0 测试项并不更少，而是要验证更高的温度上限。',
      'Safety comes from the part being verified in its installed environment. A grade wider than needed only adds cost. Grade 0 does not have fewer tests; it must be verified up to a higher ceiling.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '下面三条，哪几条是三温测试的正确理解？\n(i) 三温测试要用温控分选或探针台，会影响 UPH 与测试成本。\n(ii) 三温测试只是把同一个测试在三个温度做三遍，没有区别。\n(iii) 高温点要覆盖等级上限，否则高温下的漏电与精度漂移可能漏检。',
      'Which statements about three-temperature testing are correct?\n(i) It needs a temperature-controlled handler or prober, which affects UPH and test cost.\n(ii) It is just the same test run at three temperatures, with no difference.\n(iii) The hot point must reach the grade ceiling, or hot leakage and accuracy drift can slip through.',
    ),
    options: [
      { id: 'a', text: loc('(i)、(ii) 都对', '(i) and (ii) are correct') },
      { id: 'b', text: loc('(ii)、(iii) 都对', '(ii) and (iii) are correct') },
      { id: 'c', text: loc('(i)、(iii) 都对', '(i) and (iii) are correct') },
    ],
    answer: 'c',
    explain: loc(
      '(ii) 错：低温、室温、高温各自暴露不同的问题。(i) 是温控带来的成本，(iii) 是高温点覆盖等级上限的理由，两条都对。',
      '(ii) is wrong: cold, room and hot each expose different problems. (i) is the cost that temperature control brings, and (iii) is why the hot point must reach the grade ceiling; both are correct.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('TC（温度循环）应归入哪一个试验分组？', 'Which test group does TC (temperature cycling) belong to?'),
    options: [
      { id: 'a', text: loc('B：加速寿命模拟', 'B: accelerated lifetime simulation') },
      { id: 'b', text: loc('A：加速环境应力', 'A: accelerated environmental stress') },
      { id: 'c', text: loc('E：电学验证', 'E: electrical verification') },
    ],
    answer: 'b',
    explain: loc(
      'TC 通过反复的冷热循环加速环境应力，属于 A 组。B 组关注长期的寿命模拟（如 HTOL、ELFR），E 组关注电学验证（如 ESD、闩锁）。',
      'TC accelerates environmental stress through repeated hot and cold cycles, so it is in group A. Group B covers long-term lifetime simulation (such as HTOL and ELFR), and E covers electrical verification (such as ESD and latch-up).',
    ),
  },
  {
    id: 'q9',
    prompt: loc('车规的追溯（traceability）有什么作用？', 'What is traceability for in automotive?'),
    options: [
      { id: 'a', text: loc('出现现场失效时，能追到批次、晶圆和 die 的加工与测试记录，决定问题的范围', 'When a field failure occurs, it lets you trace back to the lot, wafer and die records for processing and test, and so bound the problem') },
      { id: 'b', text: loc('在产品出货后补记数据，应付审核', 'Record data after shipment to satisfy an audit') },
      { id: 'c', text: loc('只在最终测试（FT）阶段才需要', 'Needed only at final test (FT)') },
    ],
    answer: 'a',
    explain: loc(
      '追溯要在生产过程中同步记录，才能在失效时把问题范围缩到具体批次与晶圆。事后补记的数据不可靠，而且无法缩小召回范围；它贯穿 CP 到 FT 的全流程。',
      'Traceability must be recorded during production so that a failure can be narrowed to a lot and wafer. Data written afterwards is unreliable and cannot narrow a recall; it runs through the whole flow from CP to FT.',
    ),
  },
]