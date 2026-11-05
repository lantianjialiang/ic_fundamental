import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Readout } from '../fund/parts'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'
import { MFG_META } from './meta'

type StageId = 'design' | 'mask' | 'fab' | 'wat' | 'cp' | 'sub' | 'asm' | 'ft'
type CheckId = 'wat' | 'cp' | 'fly' | 'aoi' | 'ft' | 'bi'

const STAGES: Array<{ id: StageId; weeks: number; title: ReturnType<typeof loc>; text: ReturnType<typeof loc>; data: ReturnType<typeof loc> }> = [
  { id: 'design', weeks: 12, title: loc('设计', 'Design'), text: loc('RTL / 版图。产出 GDS 和网表。', 'RTL / layout. Produces GDS and a netlist.'), data: loc('设计数据包', 'Design data package') },
  { id: 'mask', weeks: 6, title: loc('光罩 / tape-out', 'Mask / tape-out'), text: loc('把图形转到光罩上。NRE 最大的一块往往在这里。', 'Graphics go onto masks. Often the largest NRE piece.'), data: loc('光罩套', 'Mask set') },
  { id: 'fab', weeks: 12, title: loc('晶圆制造', 'Wafer fab'), text: loc('Foundry 做 FEOL/BEOL。产出晶圆。', 'The foundry runs FEOL/BEOL and ships wafers.'), data: loc('晶圆 lot', 'Wafer lot') },
  { id: 'wat', weeks: 1, title: loc('WAT', 'WAT'), text: loc('测划片道上的测试键，判断工艺是否合格。', 'Measures TEG in the scribe; judges the process.'), data: loc('WAT 报告', 'WAT report') },
  { id: 'cp', weeks: 2, title: loc('CP', 'CP'), text: loc('对每颗 die 做晶圆分选，产出晶圆图和 KGD。设备见数字课，不在这里重讲。', 'Sorts every die; produces a wafer map and KGD. Equipment is in the digital lessons, not repeated here.'), data: loc('CP 晶圆图 / STDF', 'CP wafer map / STDF') },
  { id: 'sub', weeks: 8, title: loc('基板制造', 'Substrate'), text: loc('与晶圆并行：设计、积层、飞针/治具测试。', 'In parallel with wafers: design, build-up, flying-probe or fixture test.'), data: loc('基板测试数据', 'Substrate test data') },
  { id: 'asm', weeks: 3, title: loc('组装', 'Assembly'), text: loc('OSAT 贴片、键合或倒装、塑封、植球。', 'OSAT attaches, bonds or flips, molds and balls.'), data: loc('组装追溯', 'Assembly trace') },
  { id: 'ft', weeks: 2, title: loc('FT / 老化 / 出货', 'FT / burn-in / ship'), text: loc('成品测试、老化、SLT、OQC。Handler 与 Socket 的基本概念见数字课。', 'Final test, burn-in, SLT, OQC. Handler and socket basics are in the digital lessons.'), data: loc('FT STDF / RMA', 'FT STDF / RMA') },
]

const ROLES = [
  { id: 'fabless' as const, title: loc('Fabless', 'Fabless'), text: loc('做设计和测试程序，把晶圆和封装外包。为良率买单。', 'Owns design and the test program; outsources wafers and assembly. Pays for yield.') },
  { id: 'foundry' as const, title: loc('Foundry', 'Foundry'), text: loc('按合同做晶圆和 WAT，对工艺参数负责。', 'Makes wafers and WAT to a contract; owns process parameters.') },
  { id: 'osat' as const, title: loc('OSAT', 'OSAT'), text: loc('封装、组装、成品测试。基板和 FT 常在这里。', 'Packages, assembles and final-tests. Substrates and FT often live here.') },
  { id: 'idm' as const, title: loc('IDM', 'IDM'), text: loc('自己做设计、晶圆和封装的整合制造商。', 'An integrated maker that designs, fabs and packages itself.') },
]

const CHECKS = [
  { id: 'wat' as const, title: loc('WAT', 'WAT'), stage: 'wat' as StageId },
  { id: 'cp' as const, title: loc('CP', 'CP'), stage: 'cp' as StageId },
  { id: 'fly' as const, title: loc('基板飞针', 'Substrate flying probe'), stage: 'sub' as StageId },
  { id: 'aoi' as const, title: loc('AOI', 'AOI'), stage: 'sub' as StageId },
  { id: 'ft' as const, title: loc('FT', 'FT'), stage: 'ft' as StageId },
  { id: 'bi' as const, title: loc('Burn-in', 'Burn-in'), stage: 'ft' as StageId },
]

const INTRO = [
  loc(
    '一颗芯片从设计到出货要经过光罩、晶圆、WAT、CP、基板、组装和成品测试。数字课已经讲过 ATE、CP/FT、Handler 和 DIB（{@ate}、{@connection}）；这一课把它们放回全流程：每一步产出什么数据、谁负责、谁为良率买单。',
    'A chip goes through masks, wafers, WAT, CP, substrate, assembly and final test. The digital lessons already cover ATE, CP/FT, handler and DIB ({@ate}, {@connection}); this lesson puts them back in the full flow: what data each step produces, who owns it, and who pays for yield.',
  ),
  loc(
    '先把阶段、角色和检验读完，再做下面三步。贯穿案例 VDUT-MFG1：100 mm² 的芯片，300 mm 晶圆，8 层积层基板。周数是教学示意，用来比早晚，不是任何公司的排期。',
    'Read the stages, roles and checks first, then do the three steps below. Running example VDUT-MFG1: a 100 mm² chip, 300 mm wafers, an 8-layer build-up substrate. The weeks are a teaching illustration for “earlier vs later”, not anyone’s schedule.',
  ),
]

const CALENDAR: StageId[] = ['design', 'mask', 'fab', 'wat', 'cp', 'asm', 'ft']

const QUIZ = [
  { id: 'q1', prompt: loc('WAT 测的是什么？', 'What does WAT measure?'), options: [
    { id: 'a', text: loc('每颗产品 die 的功能', 'Function of every product die') },
    { id: 'b', text: loc('划片道上测试键的工艺参数', 'Process parameters on scribe-lane TEG') },
    { id: 'c', text: loc('封装后的成品规格', 'Packaged-part spec') },
  ], answer: 'b', explain: loc('WAT 在 CP 之前，测的是工艺，不是产品电路。', 'WAT sits before CP and measures the process, not the product circuit.') },
  { id: 'q2', prompt: loc('Fabless 公司通常自己做哪一段？', 'What does a fabless company usually own?'), options: [
    { id: 'a', text: loc('晶圆制造线', 'The wafer fab line') },
    { id: 'b', text: loc('设计和测试程序', 'Design and the test program') },
    { id: 'c', text: loc('封装车间', 'The assembly floor') },
  ], answer: 'b', explain: loc('晶圆和封装外包给 Foundry 与 OSAT。', 'Wafers and assembly are outsourced to foundry and OSAT.') },
  { id: 'q3', prompt: loc('为什么封装不是“最后一步小事”？', 'Why is packaging not “a small last step”?'), options: [
    { id: 'a', text: loc('基板和组装与晶圆并行，而且有自己的测试和良率', 'Substrate and assembly run in parallel with wafers and have their own test and yield') },
    { id: 'b', text: loc('封装不产生数据', 'Packaging produces no data') },
    { id: 'c', text: loc('所有公司都自己做封装', 'Every company packages in-house') },
  ], answer: 'a', explain: loc('基板制造周期往往和晶圆重叠；飞针、AOI、组装良率都在这里。', 'Substrate cycle time often overlaps the wafer; flying probe, AOI and assembly yield live here.') },
  { id: 'q4', prompt: loc('某个金属开路应在哪一阶段发现成本最低？', 'Where is a metal open cheapest to catch?'), options: [
    { id: 'a', text: loc('FT 出货前', 'At FT, before ship') },
    { id: 'b', text: loc('WAT 或 CP，封装之前', 'At WAT or CP, before assembly') },
    { id: 'c', text: loc('客户退货 RMA', 'At customer RMA') },
  ], answer: 'b', explain: loc('越晚发现，已经花掉的晶圆、基板和组装成本都要报废。', 'The later it is found, the more wafer, substrate and assembly cost is already sunk.') },
  { id: 'q5', prompt: loc('lot、wafer、die 从大到小是？', 'Largest to smallest: lot, wafer, die?'), options: [
    { id: 'a', text: loc('die → wafer → lot', 'die → wafer → lot') },
    { id: 'b', text: loc('lot → wafer → die', 'lot → wafer → die') },
    { id: 'c', text: loc('wafer → lot → die', 'wafer → lot → die') },
  ], answer: 'b', explain: loc('一个 lot 含若干片晶圆，一片晶圆上有许多 die。', 'A lot holds wafers; a wafer holds many dies.') },
  { id: 'q6', prompt: loc('MPW 是什么？', 'What is MPW?'), options: [
    { id: 'a', text: loc('多项目共享一套光罩的工程晶圆', 'An engineering wafer where several projects share one mask set') },
    { id: 'b', text: loc('多站点并行测试', 'Multi-site parallel test') },
    { id: 'c', text: loc('一种封装形式', 'A package style') },
  ], answer: 'a', explain: loc('Shuttle / MPW 按面积分摊光罩 NRE。', 'A shuttle / MPW shares mask NRE by area.') },
  { id: 'q7', prompt: loc('测试是不是只在最后做一次？', 'Is test done only once, at the end?'), options: [
    { id: 'a', text: loc('是，FT 就够了', 'Yes, FT is enough') },
    { id: 'b', text: loc('不是：WAT、CP、基板、FT、老化都是插入点', 'No: WAT, CP, substrate, FT and burn-in are insertions') },
    { id: 'c', text: loc('只在设计阶段仿真', 'Only in design simulation') },
  ], answer: 'b', explain: loc('每个插入点抓不同的缺陷，晚抓更贵。', 'Each insertion catches a different defect; later is more expensive.') },
  { id: 'q8', prompt: loc('CP 的数据通常以什么形式交给后面？', 'How is CP data usually handed on?'), options: [
    { id: 'a', text: loc('只有纸质合格证', 'A paper certificate only') },
    { id: 'b', text: loc('晶圆图和 STDF，见 {@genStdf}', 'A wafer map and STDF, see {@genStdf}') },
    { id: 'c', text: loc('不留数据', 'No data is kept') },
  ], answer: 'b', explain: loc('后面的封装和 PAT 都要能追溯到晶圆坐标。', 'Assembly and PAT both need to trace back to wafer coordinates.') },
]

export function MfgOverviewPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [stageId, setStageId] = useState(STAGES[0].id)
  const [roleId, setRoleId] = useState(ROLES[0].id)
  const [checkStage, setCheckStage] = useState<Partial<Record<CheckId, StageId>>>({})
  const [calendar, setCalendar] = useState<StageId[]>([])
  const [cheapId, setCheapId] = useState<StageId | ''>('')
  const stage = STAGES.find((s) => s.id === stageId) ?? STAGES[0]
  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0]
  const checkOk = CHECKS.every((c) => checkStage[c.id] === c.stage)
  const calendarWeeks = STAGES.filter((s) => calendar.includes(s.id)).reduce((sum, s) => sum + s.weeks, 0)
  const calendarOk = CALENDAR.every((id) => calendar.includes(id)) && calendar.length === CALENDAR.length
  const cheapOk = cheapId === 'wat' || cheapId === 'cp'
  const matched = useSticky(checkOk)
  const added = useSticky(calendarOk)
  const caught = useSticky(cheapOk)
  const taskAssign = loc('把 6 项检验各自归到阶段。每一行都留着你的选择。', 'Assign each of the 6 checks to a stage. Every row keeps your choice.')
  const taskWeeks = loc('勾出会计入出货日历的阶段，读出你加出来的周数。', 'Tick the stages that add to the ship calendar, and read the weeks you added.')
  const taskCheap = loc('判断金属开路最便宜该在哪一阶段发现。', 'Decide where a metal open is cheapest to catch.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgOverview}
      nextId="mfgFab"
      nextLabel={loc('下一课：晶圆制造基础', 'Next: wafer fab basics')}
      later={loc('测试插入点的设备细节见 {@ate}、{@connection}；STDF 见 {@genStdf}。', 'Equipment at the insertions: {@ate}, {@connection}; STDF: {@genStdf}.')}
      intro={INTRO}
      related={['ate', 'connection', 'pIndustry']}
      kicker={COMMON.kicker}
      asideTitle={stage.title}
      asideText={stage.text}
      tasks={[
        { id: 't1', text: taskAssign, done: matched.hit },
        { id: 't2', text: taskWeeks, done: added.hit },
        { id: 't3', text: taskCheap, done: caught.hit },
      ]}
      onReset={() => {
        setStageId(STAGES[0].id)
        setRoleId(ROLES[0].id)
        setCheckStage({})
        setCalendar([])
        setCheapId('')
        matched.reset()
        added.reset()
        caught.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>
            {t(loc(
              '出货要经过这些阶段。点一个阶段，读它产出什么、自己要几周。基板和晶圆是同时做的：日历取较长的那条，不能两边都加。',
              'Ship goes through these stages. Click one and read what it produces and how many weeks it takes on its own. Substrate and wafers run at the same time: the calendar keeps the longer one, and does not add both.',
            ))}
          </p>
          <Cards items={STAGES} activeId={stageId} cols={4} onPick={(item) => setStageId(item.id)} />
          <Readout
            items={[
              { label: loc('这一段自己的周数', 'Weeks for this stage alone'), value: `${stage.weeks}` },
              { label: loc('产出数据', 'Data out'), value: t(stage.data) },
            ]}
          />
          <p>{t(stage.text)}</p>
          <p>
            {t(loc(
              '四个角色。Fabless 自己做设计和测试程序，晶圆交给 Foundry，封装和成品测试交给 OSAT，并为良率买单。IDM 三段都自己做。',
              'Four roles. A fabless company owns design and the test program, sends wafers to a foundry and assembly plus final test to an OSAT, and pays for yield. An IDM does all three itself.',
            ))}
          </p>
          <Cards items={ROLES} activeId={roleId} cols={4} onPick={(item) => setRoleId(item.id)} />
          <Callout>
            <p>
              <b>{t(role.title)}</b>
            </p>
            <p>{t(role.text)}</p>
          </Callout>
          <p>
            {t(loc(
              '单位从大到小是 lot → wafer → die：一个批次里有若干片晶圆，一片上有许多 die。MPW（多项目晶圆）是几个项目共用一套光罩，按面积分摊一次性费用，细节在下一课。',
              'Largest to smallest is lot → wafer → die: a lot holds wafers, a wafer holds dies. An MPW (multi-project wafer) lets several projects share one mask set and split the one-time cost by area; the next lesson goes into that.',
            ))}
          </p>
          <p>
            {t(loc(
              '检验不是只在最后做一次。下表是这一课要记住的对应关系：测的是什么，就归到那一段。',
              'Checks are not done once at the end. This table is the mapping to remember: a check belongs to the stage whose job it measures.',
            ))}
          </p>
          <dl className="mfg-def">
            <div>
              <dt>{t(loc('WAT → 晶圆制造之后', 'WAT → after wafer fab'))}</dt>
              <dd>{t(loc('测划片道上的测试键，判断工艺参数，不测产品电路。', 'Measures scribe-lane TEG and judges process parameters, not the product circuit.'))}</dd>
            </div>
            <div>
              <dt>{t(loc('CP → CP', 'CP → CP'))}</dt>
              <dd>{t(loc('对每颗 die 分选，留下晶圆图。设备细节见数字课。', 'Sorts every die and keeps a wafer map. Equipment detail is in the digital lessons.'))}</dd>
            </div>
            <div>
              <dt>{t(loc('基板飞针、AOI → 基板制造', 'Substrate flying probe and AOI → substrate'))}</dt>
              <dd>{t(loc('飞针查开路短路，AOI 查外形。两者都在基板做完的时候，不留到封装后。', 'Flying probe finds opens and shorts; AOI finds shape defects. Both happen when the substrate is finished, not after assembly.'))}</dd>
            </div>
            <div>
              <dt>{t(loc('FT、Burn-in → 成品测试 / 出货', 'FT and burn-in → final test / ship'))}</dt>
              <dd>{t(loc('封装之后再测功能和早期失效。越晚发现，晶圆、基板和组装的钱都已经花掉。', 'After assembly, function and infant fails are tested again. The later a defect is found, the more wafer, substrate and assembly money is already spent.'))}</dd>
            </div>
          </dl>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskAssign}>
            <p>
              {t(loc(
                '对照上面的表，给每一行选阶段。六行同时看得见，改一行不会把别的选择藏起来。',
                'Use the table above and pick a stage on every row. All six rows stay visible; changing one does not hide the others.',
              ))}
            </p>
            {CHECKS.map((item) => {
              const picked = checkStage[item.id]
              const right = picked === item.stage
              return (
                <div className="mfg-assign" key={item.id}>
                  <b>{t(item.title)}</b>
                  <div className="mfg-assign__picks">
                    {STAGES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={picked === s.id ? 'is-active' : ''}
                        onClick={() => setCheckStage((prev) => ({ ...prev, [item.id]: s.id }))}
                      >
                        {t(s.title)}
                      </button>
                    ))}
                  </div>
                  {picked ? (
                    <p>
                      {t(right
                        ? loc('这一行和上表一致。', 'This row matches the table.')
                        : loc('和上表不一致。看这项检验测的是工艺、裸片、基板还是成品。', 'This row does not match the table. Ask whether the check measures the process, the bare die, the substrate or the finished part.'))}
                    </p>
                  ) : (
                    <p>{t(loc('还没选。', 'Not chosen yet.'))}</p>
                  )}
                </div>
              )
            })}
          </Drill>
          <Drill n={2} title={taskWeeks}>
            <p>
              {t(loc(
                '只勾会拉长出货日期的阶段。哪一段和另一段同时做、而且更短，就不要勾。勾完再读你加出来的周数。',
                'Tick only the stages that push the ship date. Leave out a stage that runs at the same time as another and is the shorter one. Then read the weeks you added.',
              ))}
            </p>
            <div className="mfg-assign__picks">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={calendar.includes(s.id) ? 'is-active' : ''}
                  onClick={() => setCalendar((prev) => (prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]))}
                >
                  {t(s.title)}
                  {` · ${s.weeks}`}
                </button>
              ))}
            </div>
            <Readout items={[{ label: loc('你加出来的周数', 'Weeks you added'), value: `${calendarWeeks}` }]} />
            <After
              show={added.hit}
              text={loc(
                '关键路径是设计 12 + 光罩 6 + 晶圆 12 + WAT 1 + CP 2 + 组装 3 + 出货 2。基板的 8 周落在晶圆的 12 周里面，加进去会把同一段时间算两遍。',
                'The critical path is design 12 + mask 6 + wafer 12 + WAT 1 + CP 2 + assembly 3 + ship 2. The substrate’s 8 weeks sit inside the wafer’s 12, so adding them counts the same time twice.',
              )}
            />
          </Drill>
          <Drill n={3} title={taskCheap}>
            <p>
              {t(loc(
                '金属开路在晶圆上就能测到。先选阶段，再读原因。',
                'A metal open can already be measured on the wafer. Pick a stage, then read why.',
              ))}
            </p>
            <div className="mfg-assign__picks">
              {STAGES.map((s) => (
                <button key={s.id} type="button" className={cheapId === s.id ? 'is-active' : ''} onClick={() => setCheapId(s.id)}>
                  {t(s.title)}
                </button>
              ))}
            </div>
            <After
              show={cheapId !== ''}
              text={cheapOk
                ? loc('WAT 或 CP 在封装之前。这时还没花基板和组装的钱，报废的只是这颗 die 或这片晶圆。', 'WAT or CP is before assembly. Substrate and assembly money is not spent yet, so the scrap is only this die or this wafer.')
                : loc('这一段已经偏晚或偏早。开路是晶圆金属的问题，应在 WAT 或 CP 抓住，不要等到组装和出货。', 'This stage is too late or too early. An open is a wafer-metal problem, so catch it at WAT or CP, not at assembly or ship.')}
            />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('测试只在最后做一次。其实 WAT、CP、基板、FT 都是插入点，越晚越贵。', 'Test is not only at the end. WAT, CP, substrate and FT are insertions; later is more expensive.'),
        loc('封装是最后一步小事。基板往往与晶圆并行，自己有良率和测试。', 'Packaging is not a small last step. Substrates often run in parallel with wafers and have their own yield and test.'),
        loc('所有公司都自己做全流程。Fabless 把晶圆和封装外包。', 'Not every company does the whole flow. Fabless outsources wafers and assembly.'),
      ]}
      takeaway={[
        loc('流程：设计 → 光罩 → 晶圆 → WAT → CP →（基板并行）→ 组装 → FT / 老化 → 出货。', 'Flow: design → mask → wafer → WAT → CP → (substrate in parallel) → assembly → FT / burn-in → ship.'),
        loc('谁负责什么，谁为良率买单，决定数据回馈往哪走。', 'Who owns the step and who pays for yield decides where the data loops back.'),
      ]}
      quiz={QUIZ}
    />
  )
}
