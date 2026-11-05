# MFG 制造与封装流程 模块 · 详细规格（11 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 MFG 模块的详细规格，**与主计划冲突时以本文件为准**。通用约定（目录、i18n、schema、DoD、STDF）见主计划，不重复。
> 本模块定位：**流程与概念学习**——让学生看清一颗芯片"从设计到出货"经过哪些制造与测试环节：晶圆制造 → 光罩与 NRE → WAT → CP → 测试硬件（Probe Card / DIB / Socket）→ 封装基板设计与制造（含飞针测试）→ 组装与成品测试 → 良率与量产爬坡。重点是**每一步产生什么数据、在哪里发现问题、成本由谁承担**。

**与数字课程、GEN 的边界（避免重复）**
- 数字课程已讲 **ATE 架构、CP/FT、Handler/Prober、DIB 的基本概念**；GEN 补充 STDF 与 Multi-site。本模块**只链接这些内容**，不重复讲授，而聚焦：制造侧工艺概念、测试硬件的**设计/制造/NRE**、基板的设计/制造/测试、良率与成本。
- 本模块的 WAT/CP 数据分析使用 `GEN-01` 的 STDF 与 `ANA-14` 的统计。

**教学数值政策（重要）**
- 所有**金额、周期、良率、缺陷密度、工艺尺寸**均为**教学示意的相对量级**，界面标注"教学示意"，不得被当作任何公司的成本、报价或工艺数据。
- 不涉及任何代工厂/基板厂的保密工艺、设计规则或价格。`ABF`、`ENIG` 等材料/工艺名只作概念示例；商标性名称首次出现处标注"仅作概念示例"。

---

## 0. 模块设计

**学习主线**
1. **前道与晶圆级**（MFG-01～05）：全流程地图 → 晶圆制造基础 → 光罩/MPW/NRE → WAT → CP 与良率管理。
2. **测试硬件**（MFG-06）：Probe Card、DIB/Loadboard、Socket 的设计、制造与 NRE。
3. **封装基板**（MFG-07～09）：基板设计 → 基板制造工艺 → 基板测试（飞针 vs 治具）。
4. **后道与全局**（MFG-10～11）：组装与成品测试流程 → 良率模型、SPC 与量产爬坡（综合）。

**贯穿案例**：虚拟产品 `VDUT-MFG1`——一颗 100 mm² 的芯片，300 mm 晶圆，8 层积层（build-up）封装基板（50×50 mm，约 5000 个网络）。参数见 §2.3。

**在站点中的位置**
- **学习路径**：导航中排在 `GEN` 之后、各专业模块之前（作为"制造与流程"通识）；**构建顺序**为 Phase 10（见主计划）。
- **回链**：§6 列出需要为现有课程补充的软前置（只改 `meta.yaml`，不改正文）。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| MFG-01 | 芯片全流程总览：从设计到出货 | 总览 | DIG:ate-architecture (软) | 45 | 1 | `FlowMapLab` | 10（试点） |
| MFG-02 | 晶圆制造基础：FEOL/BEOL、光刻与良率 | 前道 | MFG-01 | 55 | 2 | `DiesPerWaferLab` | 10 |
| MFG-03 | 光罩、MPW 与 NRE | 前道 | MFG-01 | 50 | 1 | `NRELab` | 10 |
| MFG-04 | 晶圆验收测试 WAT / PCM | 晶圆级 | MFG-02, ANA-14 (软) | 60 | 2 | `WATLab` | 10（试点） |
| MFG-05 | CP 晶圆测试与良率管理 | 晶圆级 | MFG-04, GEN-01 (软) | 55 | 2 | `WaferSortLab` | 10 |
| MFG-06 | 测试硬件的设计与制造：Probe Card、DIB、Socket | 测试硬件 | MFG-05, DIG:ate-architecture | 55 | 2 | `TestHardwareLab` | 10 |
| MFG-07 | 封装基板基础与设计 | 基板 | MFG-01 | 60 | 2 | `SubstrateDesignLab` | 10 |
| MFG-08 | 封装基板制造工艺 | 基板 | MFG-07 | 55 | 2 | `SubstrateFlowLab` | 10 |
| MFG-09 | 基板测试：飞针测试与治具测试 | 基板 | MFG-08 | 55 | 2 | `FlyingProbeLab` | 10（试点） |
| MFG-10 | 封装组装与成品测试流程 | 后道 | MFG-05, MFG-08 | 55 | 2 | `AssemblyFlowLab` | 10 |
| MFG-11 | 综合：良率模型、SPC 与量产爬坡 | 综合 | MFG-01～10, GEN-01, GEN-02, ANA-14 | 75 | 3 | `ProductRampLab` | 10 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `fab.ts`、`wat.ts`、`sort.ts`、`cost.ts`、`substrate.ts`、`ftest.ts`、`loadboard.ts`、`flow.ts`）
```ts
// fab.ts
function diesPerWafer(waferMm:number, dieW:number, dieH:number, scribeMm:number, edgeExclMm:number): number;  // ≈ π(d/2)²/A − πd/√(2A)，A=(w+s)(h+s)；并提供网格计数版本
function poissonYield(d0PerCm2:number, areaMm2:number): number;               // exp(−D0·A)
function murphyYield(d0PerCm2:number, areaMm2:number): number;                // ((1−e^{−AD})/(AD))²
function negBinomialYield(d0PerCm2:number, areaMm2:number, alpha:number): number; // (1+AD/α)^−α
function rayleighCdNm(k1:number, lambdaNm:number, na:number): number;         // k1·λ/NA
function d0Learning(d00:number, dInf:number, tauMonths:number, t:number): number; // dInf + (d00−dInf)·e^{−t/τ}

// wat.ts
function sheetResistance4pt(vV:number, iA:number): number;                     // (π/ln2)·V/I ≈ 4.532·V/I
function viaChainResistance(n:number, rVia:number): number;
function cpk(mean:number, sigma:number, lsl:number, usl:number): number;
function controlLimits(mean:number, sigma:number, n:number): {lcl:number; ucl:number}; // μ ± 3σ/√n
function runRules(points:number[], mean:number, sigma:number): RuleHit[];     // 超限、连续 7 点同侧等（教学规则集）

// sort.ts
function planTouchdowns(map:WaferMap, pattern:{cols:number; rows:number}): {touchdowns:number; partial:number; efficiency:number};
function waferTestTime(touchdowns:number, tTouchdownS:number, tLoadS:number): number;

// cost.ts
function unitCost(nre:number, volume:number, variable:number): number;         // NRE/V + variable
function breakEvenVolume(nreA:number, varA:number, nreB:number, varB:number): number; // (NREb−NREa)/(varA−varB)
function mpwShare(maskCost:number, nProjects:number): number;
function perInsertionCost(consumableCost:number, lifeInsertions:number): number;

// substrate.ts
function microstripZ0(w:number, h:number, t:number, epsR:number): number;     // 87/√(εr+1.41)·ln(5.98h/(0.8w+t))（IPC 近似，0.1<w/h<2）
function escapeTraces(pitch:number, padDia:number, line:number, space:number): number; // floor((pitch−pad−space)/(line+space))
function layerYield(perLayerYield:number, layers:number): number;
function panelUnits(panelW:number, panelH:number, margin:number, unitW:number, unitH:number, gap:number): {nx:number; ny:number; n:number; utilization:number};

// ftest.ts（飞针/治具）
function allPairsIsolation(nets:number): number;                               // N(N−1)/2
function flyingProbeTimeS(testPoints:number, moveTimeS:number, probes:number): number;
function fixtureBreakEven(nreFixture:number, costFlyingPerUnit:number, costFixturePerUnit:number): number;

// loadboard.ts
function seriesLBandwidthGHz(lNh:number, z0:number): number;                   // 2·Z0/(2π·L)（−3 dB）
function maxSites(testerChannels:number, pinsPerDut:number): number;

// flow.ts —— 良率/成本流程模型（**共享**；PIC-09、APK-09 的 flowYieldCost 改为引用此处）
interface FlowNode { name:string; yield:number; coverage?:number; testCost?:number; stepCost?:number; scrapsValue?:boolean }
function flowYieldCost(nodes:FlowNode[]): {yield:number; costPerGood:number; scrapCost:number; testCost:number};
```
**共享组件**：`ProcessCrossSection`（逐步叠层的晶圆剖面）、`ControlChart`（Xbar/I-MR + 规则命中标注）、`SubstrateStackView`（基板剖面：core + build-up、线路/过孔）、`PanelLayoutView`（面板排版）、`ProbeSchematic`（飞针/治具动画 + 网络高亮）、`NREWaterfall`（NRE 构成与摊销）、`FlowDiagram`（通用流程节点图，与 PIC/APK 共用）、`WaferMap`（复用 REL）。

### 2.2 教学默认参数（均为示意）
300 mm 晶圆；die 10×10 mm；划片道 0.1 mm；D0=0.1 /cm²；Rayleigh 示例：DUV 193 nm、NA 1.35、k1=0.3；EUV 13.5 nm、NA 0.33、k1=0.4；基板：50×50 mm、8 层积层、介质 εr=3.3、线宽/间距 15/15 µm、焊盘 80 µm；面板 500×500 mm。

### 2.3 虚拟产品 `VDUT-MFG1`（`src/data/virtual-duts/vdut-mfg1.json`）
| 阶段 | 教学默认值 |
|------|-----------|
| 晶圆制造 | 线良率 0.95；D0 0.1 /cm²（可调） |
| WAT | 每片 9 个测点；参数 Vth（均值 0.50 V，σ 0.01 V）、薄层电阻、通孔链 |
| CP | 良率由 Poisson 模型 + 参数偏移；覆盖率 0.97 |
| 基板 | 8 层积层，单层良率 0.97；约 5000 个网络 |
| 组装 | 各步良率见 MFG-10（总体≈0.984） |
| 成品测试 | 良率 0.99 |

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。任务卡期望值由仿真运行时计算，下方数字仅用于单元测试。

### MFG-01 芯片全流程总览：从设计到出货
**学习目标**：① 说出从设计到出货的主要阶段及先后顺序；② 区分 Fabless、Foundry、OSAT、IDM 的角色；③ 说出每个阶段的"产出数据"与"主要测试/检验"；④ 解释 lot、wafer、die、MPW 等基本单位；⑤ 估算各阶段累计周期。
**知识点**：流程：设计 → tape-out → 光罩 → 晶圆制造 → WAT → CP → （封装基板制造并行）→ 组装 → 成品测试（FT）/老化/系统级测试 → 出货；测试插入点（CP、FT 等）已在数字课程中出现，此处放回全流程；数据流：WAT 报告、CP 晶圆图/STDF、FT STDF、RMA 反馈；周期与成本的相对量级（教学示意）；谁负责什么、谁为良率买单。
**实验 `FlowMapLab`**：可点击全流程图（`FlowDiagram`）；点击节点显示职责、产出数据、关联测试。
- 任务卡：T1 把 12 项检验/测试（WAT、CP、基板飞针测试、AOI、FT、Burn-in…）拖到所属阶段；T2 把 8 个角色/责任匹配到 Fabless/Foundry/OSAT/IDM；T3 在给定各阶段周期下求总周期；T4 判断"某问题应在哪个阶段发现成本最低"（单选）。
**常见误区**：测试只在最后做；封装是"最后一步小事"；所有公司都自己做全流程。
**ATE 关联**：理解测试在流程中的位置与数据去向。
**单测用例**：阶段—数据—测试映射数据文件完整；周期求和正确。

### MFG-02 晶圆制造基础：FEOL/BEOL、光刻与良率
**学习目标**：① 区分 FEOL、MEOL、BEOL；② 说出光刻、刻蚀、沉积（CVD/PVD/ALD）、离子注入、扩散/退火、CMP、清洗等基本步骤的作用；③ 理解"逐层重复"的制造方式与光罩层数；④ 计算每片晶圆的 die 数与好 die 数；⑤ 用 Rayleigh 公式理解分辨率。
**知识点**：FEOL 形成晶体管，BEOL 形成多层金属互连；单层循环（沉积→光刻→刻蚀→（注入）→CMP→清洗）；缺陷来源：颗粒、图形缺陷、套刻误差；晶圆尺寸（300 mm 主流，200 mm 成熟工艺）；`DPW≈π(d/2)²/A−πd/√(2A)`；缺陷密度与良率 `Y=exp(−D0·A)`（教学简化，见 MFG-11 的其他模型）；`CD=k1·λ/NA`（教学示意）。
**实验 `DiesPerWaferLab`（两个标签页）**
- ① 晶圆版图：控件：晶圆直径、die 宽高、划片道、边缘排除、D0。视图：`WaferMap`（逐格排布）。读数：DPW、好 die 数、边缘不完整 die 数。
- ② 工艺步骤：`ProcessCrossSection` 中把步骤卡片按正确顺序排列，剖面逐层生长（形成一个简化晶体管 + 一层金属）。
- 任务卡：T1 300 mm、10×10 mm 的 DPW（≈640）；T2 D0=0.1 /cm² 时的好 die 数（≈579）；T3 加入 0.1 mm 划片道后 DPW 的变化（≈626）；T4 排列步骤顺序；T5 193 nm、NA=1.35、k1=0.3 的 CD（≈42.9 nm）。
**常见误区**：die 越大成本线性增加（良率同时下降）；光刻只发生一次；BEOL 影响晶体管速度之外的东西（互连延时、可靠性）。
**ATE 关联**：晶圆上 die 数与排布决定 CP 的触点次数（MFG-05）。
**单测用例**：`diesPerWafer(300,10,10,0,0)=640 (±1)`；`poissonYield(0.1,100)=0.9048`；`rayleighCdNm(0.3,193,1.35)=42.9`；`rayleighCdNm(0.4,13.5,0.33)=16.4`。

### MFG-03 光罩、MPW 与 NRE
**学习目标**：① 解释光罩（mask/reticle）与 tape-out；② 解释 MPW（多项目晶圆）如何分摊光罩成本；③ 列出 NRE 的主要组成（光罩、IP、EDA、工程晶圆、基板、测试程序、测试硬件、认证）；④ 计算含 NRE 的单颗成本与盈亏平衡产量；⑤ 解释"重新流片（respin）"的代价。
**知识点**：NRE（Non-Recurring Engineering，一次性工程费用）与可变成本；单颗成本 `= NRE/产量 + 可变成本`；盈亏平衡 `V=(NRE_B−NRE_A)/(var_A−var_B)`；MPW/Shuttle：多个项目共享一套光罩，每项目按面积分摊；工程批（engineering lot）与量产批；**测试相关 NRE**：测试程序开发、Probe Card、DIB/Loadboard、Socket、治具；金额为教学示意。
**实验 `NRELab`**：`NREWaterfall` 展示 NRE 构成；控件：各项 NRE、产量、可变成本、方案 A/B（如 MPW vs 全掩模；高 NRE 低可变成本 vs 低 NRE 高可变成本）。
- 任务卡：T1 NRE=2M、产量 100k、可变成本 5 → 单颗 25（相对单位）；T2 方案 A（NRE 1M、变量 8）vs B（NRE 3M、变量 5）的盈亏平衡产量（≈666,667）；T3 光罩 1M 由 10 个项目分摊的份额（100k）；T4 加入一次 respin 后总成本变化。
**常见误区**：NRE 与产量无关；只看单颗可变成本；测试硬件不算 NRE。
**ATE 关联**：测试开发与硬件的 NRE 要在产量上摊销，决定测试方案选择（飞针 vs 治具，MFG-09）。
**单测用例**：`unitCost(2e6,1e5,5)=25`；`breakEvenVolume(1e6,8,3e6,5)=666666.7`；`mpwShare(1e6,10)=1e5`。

### MFG-04 晶圆验收测试 WAT / PCM
**学习目标**：① 解释 WAT（Wafer Acceptance Test，亦称 PCM/ET）的目的与位置；② 说出测试结构（TEG/PCM）在划片道上的作用；③ 列出典型 WAT 参数（Vth、Idsat、薄层电阻、接触/通孔链电阻、漏电、击穿、电容、环振速度）；④ 用四探针法计算薄层电阻；⑤ 用 Cpk 与控制图判断工艺是否稳定；⑥ 区分 WAT 与 CP。
**知识点**：WAT 在晶圆制造结束后、CP 之前，用参数测试仪测划片道/测试键上的结构，每片抽取若干位置（如 5/9 点）；用于判断晶圆是否合格出货、监控工艺漂移；`Rs=(π/ln2)·V/I≈4.532·V/I`（四探针）；通孔链 `R=N·R_via`；Cpk、`UCL/LCL=μ±3σ/√n`；规则：超限、连续多点同侧（教学规则集）；WAT 判断的是**工艺参数**，CP 判断的是**每个 die 的功能/性能**；WAT 与 CP 良率的相关性；晶圆图径向/边缘图样。
**实验 `WATLab`**
- 控件：测点数（5/9/13）；参数（Vth、Rs、通孔链）及其限值；批次/晶圆序列（含一个渐变漂移与一个突变）；规则开关。
- 视图：晶圆 9 点图（`WaferMap`）、`ControlChart`（逐片）。读数：Cpk、超限点、规则命中、判定（Accept/Hold/Reject）。
- 任务卡：T1 V=1 mV、I=1 mA 的四探针 Rs（4.532 Ω/sq）；T2 10000 个 2 Ω 通孔的链电阻（20 kΩ）；T3 Vth 均值 0.50 V、σ=0.01 V，限值 0.45–0.55 V，求 Cpk（1.667）；T4 在控制图上识别漂移与突变并给出处置；T5 选择测点数，使晶圆均值估计的不确定度 <给定值。
**常见误区**：WAT 通过则每颗 die 都好；WAT 测的是产品电路；控制图只看超限不看趋势。
**ATE 关联**：参数测试仪与 SMU 的 Force/Measure（ANA-02/04）；WAT 数据同样可存为 STDF（GEN-01）。
**单测用例**：`sheetResistance4pt(1e-3,1e-3)=4.532`；`viaChainResistance(1e4,2)=2e4`；`cpk(0.5,0.01,0.45,0.55)=1.667`。

### MFG-05 CP 晶圆测试与良率管理
**学习目标**：① 说出 CP（Chip Probing / 晶圆分选）的流程与产出（晶圆图、Bin、KGD）；② 理解 Prober、Probe Card、touchdown 的关系（概念，详细架构见数字课程）；③ 解释多 die 并行（multi-DUT）在圆形晶圆上的效率问题；④ 区分随机缺陷、系统性缺陷、参数性缺陷；⑤ 读晶圆图并识别典型图样；⑥ 估算晶圆测试时间。
**知识点**：CP 在 WAT 之后、切割之前；触点次数与图样（如 1×1、2×2、4×1）；边缘不完整 touchdown；晶圆测试时间 `T=touchdowns×T_td+T_load`；重测策略；探针痕/打点（inking）与电子晶圆图；良率损失分类；晶圆图图样（边缘、环形、划伤、簇）；CP 筛出 KGD 供封装；存储器的修复（MEM-09）与 PAT（REL-07）在 CP 阶段的位置。
**实验 `WaferSortLab`**
- 控件：晶圆图（含簇缺陷）；触点图样 {1×1, 2×1, 2×2, 4×2}；每次 touchdown 时间、换片时间；重测开关。
- 视图：`WaferMap`（Bin/touchdown 图）。读数：touchdown 数、边缘不完整次数、效率、测试时间、UPH、良率。
- 任务卡：T1 比较 1-site 与 4-site 的 touchdown 数与效率；T2 在给定 T_td 下比较 UPH；T3 识别 3 张预设晶圆图的图样与可能原因（选择）；T4 启用重测，读良率回收与时间代价。
**常见误区**：N-site 就快 N 倍（边缘与共享资源）；CP 良率低一定是工艺问题（也可能是探针/接触）；CP 之后不再需要测试。
**ATE 关联**：多 Site（GEN-02）、接触电阻（ANA-04）、Probe Card（MFG-06）。
**单测用例**：1-site 时 touchdowns = die 数；N-site 时 `touchdowns ≥ ceil(dies/N)`；同 seed 晶圆图可复现。

### MFG-06 测试硬件的设计与制造：Probe Card、DIB、Socket
**学习目标**：① 区分 Probe Card（晶圆级）与 DIB/Loadboard + Socket（成品级）；② 列出它们的设计要素（层数、阻抗控制、电源去耦、继电器、探针/弹簧针、节距、平面度）；③ 说明 PCB 制造对高层数 DIB 的约束；④ 估算 Socket 的带宽限制与每次插拔成本；⑤ 估算在给定测试机通道数下最多可支持的 Site 数；⑥ 解释这些硬件的 NRE 与交期。
**知识点**：Probe Card 类型（悬臂、垂直、MEMS，概念）；探针接触力/过驱动与平面度；DIB/Loadboard：高层数 PCB、阻抗控制、去耦、继电器切换、与测试机资源的映射；Socket：弹簧针（pogo pin）、接触电阻与电感、寿命（插拔次数）；串联电感带宽 `f₋₃dB=2·Z0/(2πL)`；`每次插拔成本 = 耗材成本/寿命次数`；`Site 数 = floor(测试机通道数/每颗 DUT 引脚数)`；硬件 NRE 与交期（教学示意）；维护（清针、更换）。**架构层面的概念链接数字课程。**
**实验 `TestHardwareLab`**
- 控件：测试机通道数；每颗 DUT 所需引脚；Socket 串联电感（nH）；系统阻抗 Z0；Socket 价格与寿命；Probe Card/DIB 的 NRE 与交期；产量。
- 读数：最大 Site 数、Socket 带宽、每次插拔成本、硬件 NRE 摊销。
- 任务卡：T1 512 通道、每颗 64 引脚的最大 Site 数（8）；T2 1 nH、50 Ω 的带宽（≈15.9 GHz）并判断能否测给定速率（呼应 HS-13）；T3 Socket 500 元、寿命 20 万次的每次成本（0.0025 元）；T4 在给定产量下，比较"复用现有 DIB"与"新做 DIB"的总成本。
**常见误区**：Socket 不影响高速信号；Site 数只受测试机通道数限制（还有热、机械、资源共享）；硬件是一次性成本不用维护。
**ATE 关联**：直接衔接 HS-13（夹具损耗）、GEN-02（Multi-site）、PWR-03（Kelvin 接触）。
**单测用例**：`maxSites(512,64)=8`；`seriesLBandwidthGHz(1,50)=15.9`；`perInsertionCost(500,2e5)=0.0025`。

### MFG-07 封装基板基础与设计
**学习目标**：① 说明封装基板的作用（把芯片微小节距扇出到板级节距、供电与信号连接）；② 区分引线框架、有机层压基板（含积层/build-up）、陶瓷基板（概念）；③ 描述基板剖面：core + 积层、线路层、过孔类型（通孔、激光微孔、盲/埋孔、叠孔/错位孔）；④ 理解基板设计流程（引脚分配/ball map、逃逸布线、电源地平面、阻抗控制、设计规则、评审与 NRE）；⑤ 估算微带线阻抗与逃逸布线容量。
**知识点**：基板层数与线宽/间距（越细越贵、良率越低）；有机基板介质（如积层膜类，**概念示例**）；封装设计与芯片设计协同（SI/PI、热、翘曲）；**微带线近似** `Z0≈87/√(εr+1.41)·ln(5.98h/(0.8w+t))`（适用 0.1<w/h<2，教学近似）；逃逸布线：焊盘间可穿过的走线数 `floor((pitch−pad−space)/(line+space))`；设计规则检查（DRC）、网表比对（LVS 类）、版图数据交付（概念）。
**实验 `SubstrateDesignLab`**
- 控件：层叠选择（2-n-2 等示意）；介质厚度 h、εr；线宽 w、线厚 t；焊盘直径、节距、线宽/间距。
- 视图：`SubstrateStackView`（剖面）、Z0 与逃逸容量读数。
- 任务卡：T1 h=50 µm、w=40 µm、t=15 µm、εr=3.3 的 Z0（≈74.2 Ω）；T2 调 w 使 Z0 达到目标（由仿真判定）；T3 节距 150 µm、焊盘 80 µm、线/间距 15/15 µm 的逃逸走线数（1）；T4 判断某 ball map 需要增加层数还是放宽规则（选择）。
**常见误区**：基板只是"小 PCB"（节距、材料、翘曲要求不同）；层数越多越好（成本与良率）；阻抗只与线宽有关。
**ATE 关联**：基板的引脚分配与布线影响 DIB 映射和高速信号完整性（HS-03）。
**单测用例**：`microstripZ0(40,50,15,3.3)=74.2 (±1)`；`escapeTraces(150,80,15,15)=1`。

### MFG-08 封装基板制造工艺
**学习目标**：① 复述基板制造的主要步骤（覆铜板/core、钻孔、镀铜、图形形成、积层、激光钻孔、去钻污、化学铜、干膜光刻、电镀、闪蚀、阻焊、表面处理、外形加工）；② 区分减成法与（改良）半加成法（SAP/mSAP）及其与细线路的关系；③ 计算多层积层的累计良率；④ 计算面板利用率；⑤ 说明表面处理（如 ENIG/ENEPIG/OSP）的作用；⑥ 理解周期与成本驱动因素。
**知识点**：core 的作用（刚性）；PTH 通孔与激光微孔；积层循环：积层介质 → 激光钻孔 → 去钻污 → 化学铜种子层 → 干膜图形 → 电镀 → 去膜 → 闪蚀（SAP 路线），每增加一层重复一次；减成法（蚀刻）难做细线；阻焊开窗；表面处理；翘曲与 CTE；检验：AOI；良率连乘 `Y=y_layer^n`；面板利用率；材料名为**概念示例**。
**实验 `SubstrateFlowLab`**
- 控件：层数 4–14；单层良率；线宽/间距；面板尺寸与边缘余量；单元尺寸与间距；SAP/减成法切换。
- 视图：`SubstrateStackView`（逐层生长）、`PanelLayoutView`。读数：累计良率、面板单元数与利用率、相对成本。
- 任务卡：T1 8 层、单层良率 0.97 的累计良率（0.7837）；T2 面板 500×500 mm、边缘 10 mm、单元 50×50 mm、间距 2 mm 的单元数与利用率（81 个，0.81）；T3 判断线宽 10 µm 需要 SAP 还是减成法；T4 比较层数对成本与良率的影响并给出建议。
**常见误区**：层数只影响电气性能（也影响良率、成本、翘曲）；基板良率总是接近 100%；表面处理只是外观。
**ATE 关联**：基板缺陷（开/短路）要靠基板测试发现（MFG-09），而不是留到封装后。
**单测用例**：`layerYield(0.97,8)=0.7837`；`panelUnits(500,500,10,50,50,2)={nx:9,ny:9,n:81,utilization:0.81}`。

### MFG-09 基板测试：飞针测试与治具测试
**学习目标**：① 说出基板电气测试的目标（开路、短路、高阻、漏电）与判据（连续性/绝缘，**阈值为教学示意**）；② 区分飞针测试（flying probe）与治具/针床测试（fixture）；③ 解释"全对绝缘测试"的组合爆炸与相邻网络策略；④ 估算飞针测试时间；⑤ 计算治具的盈亏平衡产量；⑥ 说明基板测试的覆盖限制与 AOI 的互补。
**知识点**：开路测试（同一网络两端连通，电阻低于阈值，如 <10 Ω，示意）；短路/绝缘测试（不同网络间电阻高于阈值，如 >10 MΩ，示意）；低电阻用四线（Kelvin）；全对绝缘测试对数 `N(N−1)/2`（5000 网络 → 12,497,500 对）；相邻网络策略（只测物理相邻的网络对，数量 ≈ N·k）或电容法；飞针：无治具 NRE、柔性高、速度慢，适合样品/小批量/多品种；治具：NRE 高、速度快，适合大批量；细节距限制；与 AOI（光学检查）互补；测试数据用于良率分析。
**实验 `FlyingProbeLab`**
- 控件：网络数 N、测试点数、每次移动时间、飞针数；治具 NRE、治具单颗测试时间、机时成本；缺陷注入（开路/短路/高阻）与阈值；测试策略 {全对 / 相邻}；产量。
- 视图：`ProbeSchematic`（探针动画与网络高亮）。读数：测试对数、测试时间、覆盖率、漏检、单颗成本、盈亏平衡产量。
- 任务卡：T1 N=5000 的全对绝缘测试对数（12,497,500）；T2 20000 个测试点、每次 0.1 s、4 支飞针的测试时间（500 s）；T3 机时成本 0.01/s、治具 NRE=30000、治具单颗 15 s，求盈亏平衡产量（≈6186）；T4 由给定测试结果定位注入的缺陷类型与位置；T5 采用相邻策略后比较时间与漏检。
**常见误区**：飞针一定比治具好/差；所有网络对都要测；电气测试可以代替 AOI。
**ATE 关联**：与 PWR-03（Kelvin）、GEN-02（成本/UPH）同构；"NRE vs 单颗成本"的典型案例（MFG-03）。
**单测用例**：`allPairsIsolation(5000)=12497500`；`flyingProbeTimeS(20000,0.1,4)=500`；`fixtureBreakEven(30000,5,0.15)=6185.6`。

### MFG-10 封装组装与成品测试流程
**学习目标**：① 复述组装流程（背面减薄、切割、贴片、键合/倒装回流、底部填充、塑封/盖板、植球、打标、分割）；② 区分引线键合与倒装芯片的流程差异；③ 说出成品测试（FT）、老化、系统级测试（SLT）、出货检验在流程中的位置；④ 计算组装累计良率与坏 die 封装的成本损失；⑤ 解释 CP 覆盖率与封装后报废的关系。
**知识点**：各步骤的作用与典型失效（芯片裂纹、键合缺陷、空洞、翘曲、虚焊）；条带/面板级测试；封装后 FT 的 fallout 来源（CP 漏检、组装缺陷、应力）；老化与 SLT；出货检验（OQC）；追溯；先进封装的差异见 APK 模块；`坏 die 被封装的损失 = 该点之后所有已发生的步骤成本`。
**实验 `AssemblyFlowLab`**
- 控件：封装类型 {引线键合 BGA / 倒装 BGA}；各步良率与成本；CP 覆盖率；FT 覆盖率；老化开关。
- 视图：`FlowDiagram`（`flowYieldCost`）。读数：组装累计良率、每颗好品成本、报废成本、FT fallout 构成。
- 任务卡：T1 默认 7 步良率的组装累计良率（0.9841）；T2 CP 覆盖率由 0.97 降到 0.90 时，封装后报废与成本变化；T3 比较引线键合与倒装的成本/良率；T4 加入老化，比较早期失效 ppm 与成本（呼应 REL-05）。
**常见误区**：组装良率≈100% 可以忽略；FT 失败都是封装造成的；CP 越严越好（良率损失）。
**ATE 关联**：Handler、Socket 与 FT 的数据回馈（数字课程、GEN-01）。
**单测用例**：默认 7 步良率（0.999、0.998、0.998、0.995、0.998、0.997、0.999）乘积 = 0.9841；同 seed 可复现。

### MFG-11 综合：良率模型、SPC 与量产爬坡
**学习目标**：① 比较 Poisson、Murphy、负二项良率模型；② 区分线良率、CP 良率、组装良率、FT 良率与总良率；③ 用缺陷密度学习曲线预测爬坡期良率；④ 用 SPC 在 WAT/CP/FT 中监控；⑤ 综合 NRE、良率与产量估算盈亏平衡；⑥ 理解数据闭环（WAT→CP→FT→RMA→反馈）。
**知识点**：`Poisson=exp(−AD)`；`Murphy=((1−e^{−AD})/(AD))²`；`负二项=(1+AD/α)^−α`（α 表示缺陷聚集程度）；系统性/随机/参数性良率损失；`D0(t)=D∞+(D00−D∞)·e^{−t/τ}`；总良率 = 线良率 × CP 良率 × 组装良率 × FT 良率；NPI 流程（工程批、测试程序发布、认证、爬坡）；数据闭环与 DFM/DFT 反馈；STDF/WAT 数据汇总。
**实验 `ProductRampLab`**：虚拟 `VDUT-MFG1` 全流程：每个月产出的 WAT/CP/FT 汇总、`ControlChart`、良率瀑布、累计成本与盈亏平衡；可调 D0 学习曲线、覆盖率、产量爬坡、NRE。
- 任务卡：T1 AD=0.5 时三种模型的良率（0.6065 / 0.6192 / 0.64，α=2）；T2 总良率 `0.95×0.85×0.97×0.99`（0.7754）；T3 D00=0.5、D∞=0.1、τ=6 月，t=6 月的 D0（0.2472）及 Poisson 良率（0.781）；T4 在 SPC 中发现一次 WAT 偏移并追溯到 CP 良率下降；T5 给定 NRE 与产量爬坡，求盈亏平衡月份；T6 导出各阶段 STDF 并在 GEN-01 解析器中核对 Lot/Wafer 追溯。
**常见误区**：良率模型越复杂越准（取决于数据）；爬坡期 D0 恒定；各阶段良率可以孤立优化。
**单测用例**：`poissonYield(0.5,100)=0.6065`、`murphy=0.6192`、`negBinomial(α=2)=0.64`（A=1 cm²）；`d0Learning(0.5,0.1,6,6)=0.2472`；总良率 0.7754；同 seed 可复现。

---

## 4. 小测与完成标准（MFG 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、流程排序/匹配、情景分析；≥20% 多选、≥20% 数值题。
- [ ] §3 单测用例全部实现并通过。
- [ ] 所有金额/周期/良率/工艺尺寸处均标注"教学示意"；不含任何真实公司的工艺、规则或价格。
- [ ] 商标性名称（如积层膜、表面处理品牌名）首次出现处带"仅作概念示例"标注（复用 `vendor-name-notice` 校验）。
- [ ] `ProcessCrossSection`、`SubstrateStackView`、`PanelLayoutView`、`ProbeSchematic`、`ControlChart` 提供读数摘要作为文字替代；步骤排序题支持键盘操作。
- [ ] 与数字课程重叠的内容（ATE 架构、CP/FT、Handler/Prober、DIB 基本概念）仅用链接，不重复讲授。
- [ ] 术语与下表一致。

## 5. 术语表种子
| en | zh |
|----|----|
| Fabless / Foundry / OSAT / IDM | 无晶圆厂 / 晶圆代工厂 / 封测代工厂 / 整合元件制造商 |
| Tape-out | 流片 |
| Mask / Reticle | 光罩 / 掩模版 |
| Multi-project wafer (MPW) / Shuttle | 多项目晶圆 / 班车 |
| Non-recurring engineering (NRE) | 一次性工程费用 |
| Front-end / Back-end of line (FEOL/BEOL) | 前道 / 后道（晶圆制造段） |
| Photolithography / Etch / Deposition / CMP | 光刻 / 刻蚀 / 沉积 / 化学机械抛光 |
| Wafer Acceptance Test (WAT) / PCM | 晶圆验收测试 / 工艺控制监测 |
| Test element group (TEG) / Scribe lane | 测试键 / 划片道 |
| Sheet resistance / Four-point probe | 薄层电阻 / 四探针 |
| Chip probing (CP) / Wafer sort | 晶圆测试 / 晶圆分选 |
| Touchdown / Probe card / Prober | 触点次数 / 探针卡 / 探针台 |
| Device interface board (DIB) / Loadboard / Socket | 器件接口板 / 负载板 / 测试插座 |
| Package substrate / Build-up | 封装基板 / 积层 |
| Semi-additive process (SAP/mSAP) | 半加成法 / 改良半加成法 |
| Microvia / Plated through hole (PTH) | 微孔 / 镀通孔 |
| Solder mask / Surface finish | 阻焊 / 表面处理 |
| Flying probe test / Fixture test | 飞针测试 / 治具（针床）测试 |
| Open / Short / Isolation | 开路 / 短路 / 绝缘 |
| Automated optical inspection (AOI) | 自动光学检查 |
| Die attach / Wire bond / Flip chip | 贴片 / 引线键合 / 倒装 |
| Final test (FT) / System-level test (SLT) | 成品测试 / 系统级测试 |
| Yield learning / Defect density | 良率爬坡 / 缺陷密度 |
| Statistical process control (SPC) | 统计过程控制 |

## 6. 与现有课程的交叉引用（Phase 10 中只改 `meta.yaml` 的 `softPrerequisites`，不改正文）
| 现有课程 | 新增软前置 | 原因 |
|----------|-----------|------|
| GEN-01 | MFG-01 | STDF 数据来自哪些阶段 |
| GEN-02 | MFG-06 | Site 数受测试硬件限制 |
| ANA-14 | MFG-04 | Cpk/控制图在 WAT 中的应用 |
| MEM-12 | MFG-05 | 晶圆图与失效图样 |
| REL-05 | MFG-10 | Burn-in 在组装/成品测试中的位置 |
| REL-07 | MFG-04, MFG-05 | PAT 依赖 WAT/CP 数据与晶圆图 |
| PWR-08 | MFG-05 | 晶圆级功率测试 |
| SNS-09 | MFG-05 | 晶圆级光学测试 |
| PIC-07 | MFG-04 | PCM 测试结构（cut-back） |
| PIC-09 | MFG-11 | 流程成本与良率连乘 |
| APK-01 | MFG-01 | 先进封装在全流程中的位置 |
| APK-02 | MFG-10 | 组装流程基础 |
| APK-05 | MFG-07, MFG-08 | 基板与中介层/基板的关系 |
| APK-09 | MFG-05, MFG-09 | KGD 与基板测试 |
