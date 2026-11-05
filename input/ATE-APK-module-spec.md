# APK 先进封装 模块 · 详细规格（9 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 APK 模块的详细规格，**与主计划冲突时以本文件为准**。通用约定（目录、i18n、schema、DoD、STDF）见主计划，不重复。
> 本模块定位：**概念学习为主**——让学生看懂"先进封装"里的名词和结构（chiplet、中介层、TSV、HBM、CoWoS 类 2.5D、3D 堆叠、混合键合、die-to-die 互连），理解它们为什么出现、带来什么新约束，再落到**测试视角**：已知良好裸片/堆栈（KGD/KGS）、探测与测试访问、良率连乘、热与功耗、流程成本。

**命名与引用政策（重要）**
- CoWoS、EMIB、Foveros、InFO 等是**厂商的产品/技术名**，本模块只把它们当作"某一类结构的代表"做**概念性分类**，不描述任何厂商的具体工艺参数、设计规则或路线图，也不暗示认证或授权关系。界面上首次出现时标注"厂商技术名，仅作概念示例"。
- HBM、UCIe 等规范以**现行公开规范**为准；本模块的数值（位宽、速率、层数、pJ/bit 等）均为**教学示意量级**，标注"教学示意，以现行规范为准"，不得作为规格依据。
- 所有虚拟对象（`VDUT-APK1`）均为虚构教学模型。

---

## 0. 模块设计

**学习主线**
1. **为什么与是什么**（APK-01～02）：单片大芯片的极限 → chiplet 与异构集成；互连从引线键合演进到混合键合。
2. **三大结构件**（APK-03～05）：TSV（竖向互连）、HBM（TSV 堆叠的 DRAM）、中介层与 CoWoS 类 2.5D（把 GPU/ASIC 与 HBM 放在一起）。
3. **扩展与约束**（APK-06～08）：3D 堆叠与混合键合（良率连乘）、chiplet 间互连、热/机械/可靠性。
4. **测试**（APK-09）：KGD/KGS、测试访问与探测、流程成本，综合设计一个 GPU+HBM 封装的测试流程。

**贯穿案例**：`VDUT-APK1`——一个虚拟的"GPU/ASIC + 4 个 HBM 堆栈 + 中介层 + 基板"的 2.5D 封装；每个 HBM 堆栈为 8 层 DRAM + 1 个基底（base）die。参数见 §2.3。

**与其他模块的关系**
- 软前置：`MEM-01/07`（存储器与 DRAM 基础）、`MEM-09`（BIST/修复）、`HS-03`（通道损耗）、`HS-07/08`（BER/眼图）、`REL-02`（电迁移/加速）、`REL-07`（PAT）、`PIC-09`（CPO 流程，良率连乘思想相同）、`GEN-01/02`（STDF、成本）。
- 被依赖：无。`PIC-09` 与本模块共用"良率-成本流程模型"，见 §2.1。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| APK-01 | 先进封装概述：为什么需要 chiplet 与异构集成 | 概念 | — | 45 | 1 | `PackageTaxonomyLab` | 10（试点） |
| APK-02 | 封装互连基础：从引线键合到混合键合 | 概念 | APK-01 | 50 | 1 | `InterconnectDensityLab` | 10（试点） |
| APK-03 | TSV 与晶圆减薄 | 结构件 | APK-02 | 55 | 2 | `TSVLab` | 10 |
| APK-04 | HBM：堆叠 DRAM 的结构、接口与带宽 | 结构件 | APK-03, MEM-01 (软) | 55 | 2 | `HBMStackLab` | 10 |
| APK-05 | 2.5D 集成：中介层与 CoWoS 类结构 | 结构件 | APK-02, APK-04 | 55 | 2 | `InterposerLab` | 10 |
| APK-06 | 3D 集成：堆叠、混合键合与良率连乘 | 扩展 | APK-03, APK-05 | 55 | 2 | `StackYieldLab` | 10 |
| APK-07 | Chiplet 与 Die-to-Die 互连 | 扩展 | APK-05, HS-03 (软) | 50 | 2 | `D2DLinkLab` | 10 |
| APK-08 | 热、机械与可靠性 | 约束 | APK-05, APK-06 | 55 | 2 | `StackThermalLab` | 10 |
| APK-09 | 综合：先进封装测试——KGD/KGS、DFT 与流程成本 | 测试 | APK-03～08, GEN-01, GEN-02 | 75 | 3 | `APKFlowLab` | 10 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `packaging.ts`、`tsv.ts`、`d2d.ts`、`interposer.ts`；复用 `thermal.ts`）
```ts
// packaging.ts —— 良率/成本流程模型（PIC-09 同样使用；若 PIC 先实现，则把其模型重构到此处并共享）
function poissonYield(d0PerCm2:number, areaMm2:number): number;               // exp(−D0·A)，A 换算为 cm²（教学模型；真实常用 Murphy/负二项）
function siliconPerGoodMm2(d0:number, areaMm2:number): number;                // area / yield
function knownGoodProb(yieldDie:number, coverage:number): number;             // P(good|pass) = Y / (Y + (1−Y)(1−c))
function stackYieldW2W(dieYields:number[], bondYield:number): number;         // ΠYi × bond^(n−1)
function stackYieldD2W(dieYields:number[], coverage:number, bondYield:number): number; // Π P(good|pass) × bond^(n−1)
function flowYieldCost(nodes:FlowNode[]): {yield:number; costPerGood:number; scrapCost:number; testCost:number}; // 节点含：良率、测试覆盖、测试成本、已累计价值

// tsv.ts
function tsvResistance(rhoOhmM:number, lengthM:number, radiusM:number): number;                 // ρL/(πr²)
function tsvLinerCapacitance(epsR:number, lengthM:number, rM:number, toxM:number): number;      // 2π ε0 εr L / ln((r+tox)/r)
function daisyChainResistance(n:number, rTsv:number, rBump:number, defects?:{index:number; factor:number}[]): number;

// d2d.ts
function shorelineBandwidthGbpsPerMm(rows:number, pitchUm:number, gbpsPerLane:number): number;  // rows·(1000/pitch)·rate
function energyPerBitPj(cPf:number, vV:number, activity:number): number;                        // α·C·V²（教学简化）

// interposer.ts
const RETICLE_MM2 = 26*33;                                                                      // 858 mm²
function floorplanArea(dies:{w:number;h:number}[], spacingMm:number, marginMm:number): {w:number; h:number; area:number; needsStitching:boolean};
function rcDelayPs(rOhm:number, cF:number): number;                                              // 0.38·R·C（分布式 RC，50% 延时）

// thermal.ts（PWR 已有，新增）
function layerStackRth(layers:{name:string; thicknessM:number; kWmK:number; areaM2:number}[]): {perLayer:number[]; total:number};  // Σ t/(k·A)
```
**共享组件**：`PackageCrossSection`（分层剖面 SVG：基板、C4 凸点、中介层/TSV、微凸点、die、HBM 堆栈、塑封、盖板；**可点击高亮并弹出该结构件的作用与测试关注点**，是本模块的核心可视化）、`FloorplanCanvas`（拖拽 die 与 HBM 的版图）、`LayerStackThermalPlot`、`FlowDiagram`（通用流程节点图；由 PIC 的 `CPOFlowDiagram` 泛化而来）、`YieldWaterfall`（良率瀑布图）。

### 2.2 教学默认参数（均为示意）
Cu 电阻率 `1.68e-8 Ω·m`；SiO₂ 相对介电常数 3.9；硅热导率 150 W/(m·K)；底部填充/键合介质热导率 1 W/(m·K)；`ε0=8.854e-12 F/m`；RDL 线宽 2 µm、厚 1 µm、`C'≈0.2 pF/mm`；微凸点节距 45 µm、混合键合节距 10 µm；光罩极限 26×33 mm。

### 2.3 虚拟对象 `VDUT-APK1`（`src/data/virtual-duts/vdut-apk1.json`）
| 组件 | 教学默认值 |
|------|-----------|
| GPU/ASIC 大 die | 面积 600 mm²，良率 0.85，成本 300（相对单位） |
| DRAM die | 良率 0.90，成本 20，8 层 |
| HBM 基底（base）die | 良率 0.95，成本 15 |
| HBM 堆栈组装 | 键合良率 0.97 |
| 中介层 | 良率 0.95，成本 100 |
| chip-on-wafer 贴装 | 每次 0.995 |
| 基板与最终组装 | 成本 80，良率 0.98 |
| 测试覆盖率 | 各测试点可调（默认 0.9～0.99） |

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。任务卡期望值由仿真运行时计算，下方数字仅用于单元测试。

### APK-01 先进封装概述：为什么需要 chiplet 与异构集成
**学习目标**：① 说出先进封装出现的动因（光罩极限、良率、带宽与功耗、异构工艺）；② 区分 2D / 2.5D / 3D 与扇出（fan-out）、SiP 等层次；③ 解释 chiplet 如何用"小芯片 + 测试 + 组装"改善良率与成本；④ 认识关键名词：die、chiplet、interposer、substrate、bump、underfill、RDL、TSV。
**知识点**：单片芯片面积受光罩极限（26×33 mm = 858 mm²）限制；大面积芯片良率下降（Poisson 模型 `Y=exp(−D0·A)`，教学简化）；chiplet 把大 die 拆成小 die，分别测试挑选后再集成；异构集成（不同工艺节点/功能的 die 组合）；封装层次：2D（引线键合/倒装）→ 2.5D（中介层并排）→ 3D（竖向堆叠）；扇出封装用 RDL 重新布线；术语表（见 §5）。
**实验 `PackageTaxonomyLab`**
- ① 分类拖拽：把 12 个结构图（引线键合、倒装、中介层 2.5D、TSV 3D 堆叠、扇出等）放入正确层次；点击 `PackageCrossSection` 的各结构件查看作用。
- ② 良率比较器：控件：缺陷密度 D0 0.05–0.5 /cm²；总面积 200–800 mm²；拆分为 1/2/4/8 个 chiplet。读数：单个 die 良率、每颗"好硅"消耗的面积。
- 任务卡：T1 D0=0.1/cm²，800 mm² 单片良率（0.449）；T2 拆成 4 个 200 mm² 的良率（0.819）；T3 两种方案每颗好硅消耗面积（1780 vs 977 mm²，约 1.82×）并说明条件（已知良好裸片、忽略组装成本）；T4 把 8 个名词匹配到剖面图中的位置。
**常见误区**：chiplet 一定更便宜（组装、测试、互连开销会抵消）；2.5D 与 3D 只是叫法不同；先进封装只为性能。
**ATE 关联**：chiplet 的前提是"拆开后能单独测准"——KGD 概念从此引入（APK-09）。
**单测用例**：`poissonYield(0.1,800)=0.4493`、`(0.1,200)=0.8187`；`800/0.4493=1780.5`，`4×200/0.8187=977.1`；`RETICLE_MM2=858`。

### APK-02 封装互连基础：从引线键合到混合键合
**学习目标**：① 说出引线键合、倒装（C4 凸点）、微凸点（micro-bump）、混合键合（hybrid bonding）的差异；② 计算给定节距下的互连密度；③ 估算互连的电容与每比特能耗；④ 解释节距缩小对带宽密度、功耗、测试接触的影响。
**知识点**：引线键合（周边，节距大、电感大）→ 倒装（面阵，C4 凸点）→ 微凸点（更细节距，用于堆叠/中介层）→ 混合键合（Cu-Cu 直接键合 + 介质键合，节距可缩至更小）；面阵密度 `(1000/pitch[µm])²` 个/mm²；互连寄生 R/L/C；能耗 `E_bit≈α·C·V²`（教学简化）；节距越小，对准精度、表面平整度、清洁度要求越高；也越难用探针接触。
**实验 `InterconnectDensityLab`**
- 控件：互连类型/节距（引线键合 ≥100 µm、C4 100–150 µm、微凸点 25–55 µm、混合键合 3–10 µm）；每个互连的电容 C；电压 V；活动因子 α；die 面积。
- 读数：I/O 密度（/mm²）、die 上可放置的互连总数、每比特能耗、相对带宽密度。
- 任务卡：T1 微凸点 45 µm 的密度（≈494/mm²）；T2 混合键合 10 µm 的密度（10000/mm²，约 20×）；T3 C=0.5 pF、V=0.8 V、α=0.5 的 E_bit（0.16 pJ/bit）；T4 判断 3 个应用各该用哪种互连。
**常见误区**：节距缩小只带来好处（对准、良率、测试接触更难）；混合键合就是更细的凸点（无焊料、直接键合）；能耗只与距离有关（还与 C、V 有关）。
**ATE 关联**：越细的节距越难直接探针接触，需要专用测试焊盘/测试访问结构（APK-09）。
**单测用例**：`(1000/45)^2=493.8`；`(1000/10)^2=10000`；`0.5×0.5e-12×0.64=1.6e-13 J`。

### APK-03 TSV 与晶圆减薄
**学习目标**：① 描述 TSV 的结构（硅通孔、绝缘层、阻挡/种子层、铜填充）与主要工艺步骤（刻蚀、绝缘、填充、减薄、背面露出、临时键合/解键合）；② 计算 TSV 的电阻与电容；③ 解释 TSV 带来的应力与禁布区（KOZ）；④ 列出 TSV 典型缺陷与对应的电学测试（连续性、漏电、电容）。
**知识点**：via-first / via-middle / via-last 概念；`R=ρL/(πr²)`；绝缘层电容（同轴近似）`C=2π·ε0·εr·L/ln((r+tox)/r)`（上限，实际受耗尽区影响）；晶圆减薄至数十 µm，需载片支撑；缺陷：空洞（电阻升高）、针孔（对衬底漏电）、开路、错位；测试：菊花链（daisy chain）电阻、对衬底漏电、电容；单个 TSV 的缺陷在长链中被稀释，需要**分段链**提高灵敏度；TSV 冗余与修复（概念）。
**实验 `TSVLab`（两个标签页）**
- ① 几何→电学：控件：直径 2–10 µm、长度 30–100 µm、绝缘层厚度。读数：R、C、RC 时间常数。
- ② 菊花链：控件：TSV 数量 N、每个凸点电阻、注入缺陷（空洞×10 电阻、开路、针孔漏电）、分段数。读数：链电阻、与基线偏差、能否检出。
- 任务卡：T1 直径 5 µm、长 50 µm 的 R（≈42.8 mΩ）；T2 `tox=0.2 µm` 时的绝缘层电容（≈141 fF）；T3 N=1000 且 1 个 TSV 电阻×10 时，整链电阻偏差（约 +0.9%×(R_tsv/(R_tsv+R_bump)) 随凸点电阻变化）并判断是否可检出；T4 选择分段数，使缺陷检出灵敏度达到给定目标。
**常见误区**：TSV 电阻很大（通常很小，难测的是缺陷）；一条超长链足够；TSV 只是电学问题（还有应力与可靠性）。
**ATE 关联**：TSV 测试是"高灵敏度小电阻测量 + 漏电"，要求 Kelvin 与分段设计（呼应 PWR-03、ANA-02）。
**单测用例**：`tsvResistance(1.68e-8,50e-6,2.5e-6)=0.0428 Ω`；`tsvLinerCapacitance(3.9,50e-6,2.5e-6,0.2e-6)=1.41e-13 F（±2%）`；无缺陷时链电阻 = `N×(R_tsv+R_bump)`。

### APK-04 HBM：堆叠 DRAM 的结构、接口与带宽
**学习目标**：① 描述 HBM 堆栈结构（多层 DRAM + base die，TSV 与微凸点垂直互连）；② 计算堆栈容量与带宽；③ 比较 HBM 与普通 DDR 的带宽、功耗与封装特点；④ 解释为何 HBM 需要 2.5D 中介层；⑤ 概述 HBM 的测试访问与修复思路。
**知识点**：每个堆栈 = N 层 DRAM（如 4/8/12/16 层，教学示意）+ 基底 die；宽接口（每堆栈 1024 位，教学示意，新一代规范可更宽）+ 中等速率 → 高带宽；`带宽(GB/s)=位宽×每引脚速率(Gbps)/8`；容量 `= 单 die 容量 × 层数`；DDR 对比：64 位通道、速率更高但位宽窄；HBM 靠近处理器，经中介层短距离宽互连 → 能耗/bit 更低；热：多层 DRAM 叠在一起，散热受限；测试访问：基底 die 通常集成测试访问机制/内置自检与修复（TSV 冗余、行列修复、ECC，概念，**以现行规范为准**）。
**实验 `HBMStackLab`**
- 控件：层数 4–16；单 die 容量；接口位宽；每引脚速率；DDR 对比通道数；能耗 pJ/bit（教学示意）。
- 视图：堆栈剖面（`PackageCrossSection`）+ 容量/带宽/功耗条形对比。读数：容量、带宽、功耗、相对 DDR 倍数。
- 任务卡：T1 8 层×16 Gb 的容量（16 GB）；T2 1024 位×6.4 Gbps 的带宽（819.2 GB/s）；T3 与 64 位、6.4 Gbps 的 DDR 通道（51.2 GB/s）比较（16×）；T4 为目标带宽 3.2 TB/s 选堆栈数；T5 把测试/修复机制匹配到对应结构。
**常见误区**：HBM 速率比 DDR 高（通常每引脚更低，靠位宽取胜）；HBM 可以像 DIMM 一样插拔；层数越多越好（热、良率、高度）。
**ATE 关联**：堆栈组装后底层 DRAM 无法直接探测，只能经基底 die 测试访问（APK-09，呼应 MEM-09）。
**单测用例**：`8×16 Gb=128 Gb=16 GB`；`1024×6.4/8=819.2`；`6.4×64/8=51.2`。

### APK-05 2.5D 集成：中介层与 CoWoS 类结构
**学习目标**：① 说明中介层的作用（高密度布线、承载多个 die）；② 区分硅中介层、RDL（有机/重布线）中介层、局部硅桥三类概念；③ 复述"先把 die 贴到中介层晶圆（chip-on-wafer），再贴到基板（on-substrate）"的流程逻辑；④ 估算 die 版图面积与光罩极限的关系；⑤ 估算中介层走线的延时。
**知识点**：中介层（interposer）：含 TSV 的硅中介层 + 多层细线 RDL，连接 GPU/ASIC 与 HBM；类别（**概念性，厂商技术名仅作示例**）：硅中介层型（如 CoWoS-S 类）、RDL 中介层型（如 CoWoS-R 类）、局部硅桥型（如 CoWoS-L、EMIB 类）；流程：die 经微凸点贴到中介层晶圆 → 底部填充/塑封/减薄 → 中介层上基板（C4 凸点）→ 基板组装；中介层面积可超过一个光罩，需拼接（stitching）；CTE 失配与翘曲；信号完整性：短距离、细线 → 分布式 RC 延时 `≈0.38·R·C`。
**实验 `InterposerLab`**
- 控件：`FloorplanCanvas` 中放置 GPU/ASIC（可设宽高）与 N 个 HBM 堆栈（可设尺寸）；die 间距、边缘余量；线宽、厚度、长度。
- 读数：所需中介层面积、是否超过光罩极限（需拼接）、最短/最长 die-HBM 走线长度、R、C、RC 延时。
- 任务卡：T1 给定版图，求中介层面积并判断是否需要拼接；T2 在 858 mm² 光罩内，求最多可放几个 HBM；T3 5 mm 长、2 µm 宽、1 µm 厚的走线的 R（42 Ω）与延时（≈16 ps）；T4 把 6 个流程步骤按正确顺序排列并说明为什么 chip-on-wafer 在前。
**常见误区**：中介层只是"垫片"（承载大量高密度布线）；中介层越大越好（成本、翘曲、拼接）；所有 2.5D 都用硅中介层。
**ATE 关联**：中介层是无源布线载体，测试重点是开路/短路/漏电与组装后的互连；组装后互连的可测性依赖 DFT（APK-09）。
**单测用例**：`RETICLE_MM2=858`；`R=1.68e-8×1e-3×5/(2e-6×1e-6)=42 Ω`；`C=0.2e-12×5=1 pF`；`rcDelayPs(42,1e-12)=15.96`。

### APK-06 3D 集成：堆叠、混合键合与良率连乘
**学习目标**：① 区分 face-to-face / face-to-back、W2W（晶圆对晶圆）/ D2W（裸片对晶圆）；② 计算堆叠良率并解释"良率连乘"；③ 解释 KGD 如何提高 D2W 的良率；④ 理解混合键合对节距、热与良率的影响；⑤ 计算测试覆盖率不足造成的漏检（escape）。
**知识点**：堆叠方式：微凸点堆叠 vs 混合键合；W2W：两片晶圆整体键合，堆叠良率 `ΠYi × bond^(n−1)`，对位后好 die 可能对上坏 die；D2W：先测试挑选 KGD，再逐个贴装，`P(good|pass)=Y/(Y+(1−Y)(1−c))`；混合键合对平整度、洁净度与对准要求极高；3D 堆叠的热与测试访问问题；KGD 的"已知良好"只在测试覆盖范围内成立。
**实验 `StackYieldLab`**
- 控件：层数与各层 die 良率；键合良率；方式 {W2W / D2W+KGD}；测试覆盖率 c；各层成本与测试成本。
- 视图：`YieldWaterfall`。读数：堆叠良率、每颗好堆栈成本、漏检率。
- 任务卡：T1 Y1=0.9、Y2=0.85、bond=0.98 的 W2W 良率（0.7497）；T2 D2W 下 `P(good|pass)`（Y=0.9、c=0.99 → 0.99889）；T3 在 8 层 DRAM 下比较 W2W 与 D2W 的良率与成本；T4 找使 D2W 优于 W2W 的最小测试覆盖率（由仿真判定）。
**常见误区**：KGD 就是 100% 好（取决于覆盖率）；W2W 一定更便宜（良率连乘）；键合良率可忽略。
**ATE 关联**：KGD 测试的覆盖率/成本决定整个流程（APK-09）。
**单测用例**：`0.9×0.85×0.98=0.7497`；`knownGoodProb(0.9,0.99)=0.99889`；c=1 时 `knownGoodProb=1`。

### APK-07 Chiplet 与 Die-to-Die 互连
**学习目标**：① 解释 die-to-die（D2D）互连与片内互连/长距离 SerDes 的位置；② 计算岸线（shoreline）带宽密度；③ 估算 D2D 能耗；④ 说明链路训练、环回与 BER 测试在 D2D 中的角色；⑤ 认识开放的 D2D 规范（如 UCIe，**以现行规范为准**）为何重要。
**知识点**：D2D：短距离（毫米级）、宽并行、低速率/低能耗；岸线带宽密度 `=行数×(1000/节距)×每通道速率`；能耗 `E≈α·C·V²`（教学简化）；与长距离 SerDes 的对比（HS 模块）：D2D 更少均衡、更低功耗、更高密度；链路训练/校准（时钟与数据对齐，呼应 HS-05）；D2D 测试：内建环回、BER、边带（sideband）与测试访问；标准化让不同厂商的 chiplet 互操作。
**实验 `D2DLinkLab`**
- 控件：行数、微凸点节距、每通道速率、链路长度、C、V、α；错误注入（偏斜、噪声）。
- 视图：带宽密度条形图（D2D vs SerDes 教学示意）；简化"眼窗/训练扫描"（复用 `ShmooPlot`）。读数：岸线带宽密度、能耗、训练后的时序余量。
- 任务卡：T1 4 行、45 µm、16 Gbps 的岸线带宽密度（≈1422 Gbps/mm ≈ 178 GB/s/mm）；T2 比较 D2D 与长距离 SerDes 的能耗/带宽密度（选择）；T3 在训练扫描中找到最佳采样点并读余量；T4 说明为何需要"边带/测试访问"。
**常见误区**：chiplet 之间的互连与板级互连一样；速率越高越好（D2D 追求低能耗/高密度）；标准化与测试无关。
**ATE 关联**：D2D 链路的组装后测试依赖环回与内建自检；探针难以直接接触（APK-09）。
**单测用例**：`4×(1000/45)×16=1422.2`；能耗公式与 APK-02 一致。

### APK-08 热、机械与可靠性
**学习目标**：① 用一维热阻网络估算结温；② 判断堆叠中哪一层热阻占主导；③ 解释 CTE 失配、翘曲与凸点疲劳；④ 估算微凸点的电流密度并联系电迁移；⑤ 列出封装级可靠性试验与失效模式。
**知识点**：`R_th=t/(k·A)`，各层串联求和；低热导率的键合/底部填充层往往主导热阻（硅层很小）；混合键合与更薄的键合层改善热传导；热点与功率密度；CTE 失配 → 翘曲、凸点开裂、分层；底部填充的作用；微凸点电流密度 `J=I/A`，电迁移（呼应 REL-02 的 Black 方程）；封装级试验：温度循环、HAST、HTOL（概念，呼应 REL-03）；供电：经 TSV/凸点的 IR drop。
**实验 `StackThermalLab`**
- 控件：层表（热源 die、键合层、DRAM 层×N、基底 die、TIM、盖板）每层厚度与热导率、截面积；功率；环境温度；"键合层换为混合键合"开关。
- 视图：`LayerStackThermalPlot`（每层热阻条 + 温度阶梯）。读数：各层 R、总 R、结温。
- 任务卡：T1 50 µm 硅、150 W/(m·K)、100 mm² 的 R（3.33 mK/W）；T2 20 µm 底部填充、1 W/(m·K)、100 mm² 的 R（0.2 K/W），指出其约为硅层的 60×；T3 8 层堆叠的总热阻与给定功率下的温升；T4 改用混合键合后的变化；T5 10 mA 通过直径 25 µm 微凸点的电流密度（≈2.04×10³ A/cm²）。
**常见误区**：硅导热好所以堆叠不怕热（键合层才是瓶颈）；翘曲只影响外观；电迁移只发生在芯片内部。
**ATE 关联**：测试时功耗高、需要热控；温度影响参数与良率判定（呼应 REL-06 三温）。
**单测用例**：`50e-6/(150×1e-4)=3.33e-3`；`20e-6/(1×1e-4)=0.2`；`J=0.01/(π(12.5e-6)²)=2.04e7 A/m²`。

### APK-09 综合：先进封装测试——KGD/KGS、DFT 与流程成本
**学习目标**：① 画出 2.5D/3D 封装的测试插入点；② 解释 KGD 与 KGS（已知良好堆栈）的区别；③ 解释探测与测试访问的难点（细节距、堆栈内不可达）与 DFT 的对策；④ 在测试成本与报废成本间优化；⑤ 导出 STDF 并按层/Site 分析。
**知识点**：测试插入点：die 级分选（GPU/ASIC、DRAM）→ TSV 与中介层测试 → 堆叠后测试（经基底 die，KGS）→ 贴装后互连测试 → 封装级/系统级测试（SLT）与老化；探测：微凸点节距小，直接探针会损伤，常用**专用测试焊盘/较大节距的测试访问口**；DFT：堆叠测试访问架构（如 IEEE 1838 一类思想）、边界扫描（1149.1）、嵌入式测试包装（1500）、BIST、TSV/行列冗余与修复（**标准名仅作概念，以现行标准为准**）；良率连乘与"晚发现成本高"（缺陷在贴装 GPU 之后才暴露会报废昂贵的 GPU 与中介层）；测试覆盖率—成本折中；高功耗与热控；PAT（REL-07）在先进封装中的应用。
**实验 `APKFlowLab`**
- 界面：`FlowDiagram` 上启用/停用测试插入点；每点设覆盖率与测试成本；虚拟 `VDUT-APK1` 群体；输出：累计良率、每颗好封装成本、报废成本、测试成本、各层 Bin 分布、STDF。
- 任务卡：
  - T1 无 KGD 时 HBM 堆栈良率：`0.9^8×0.95×0.97≈0.397`；
  - T2 启用 DRAM KGD（c=0.99）后的堆栈良率（≈0.913）；
  - T3 在 GPU 贴装前增设 KGS 测试，比较总成本（晚发现的报废成本下降）；
  - T4 在测试预算内选择插入点组合，使每颗好封装成本最低；
  - T5 导出 STDF（含层/Site 信息），在 GEN-01 解析器核对；
  - T6 由"HBM 堆栈第 3 层 Fail 集中"判断问题来自 DRAM die 还是键合（选择并说明依据）。
**常见误区**：每一步都测最安全（成本）；堆栈组装后仍可对每层直接探测；KGD 通过就不会在封装后失效（覆盖率与键合缺陷）。
**单测用例**：`0.9^8×0.95×0.97=0.3967`；`knownGoodProb(0.9,0.99)^8×0.95×0.97=0.9133`；同 seed 同流程可复现；STDF 往返后 Bin 计数一致。

---

## 4. 小测与完成标准（APK 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、剖面图/结构识别（由 `PackageCrossSection` 实时渲染，不用位图）、情景分析；≥20% 多选、≥20% 数值题。
- [ ] §3 单测用例全部实现并通过。
- [ ] 凡厂商技术名（CoWoS/EMIB/Foveros/InFO 等）首次出现处标注"厂商技术名，仅作概念示例"；不含任何厂商保密或具体工艺参数。
- [ ] 凡"教学示意"数值处均有界面标注；规范类内容标注"以现行规范为准"。
- [ ] `PackageCrossSection`、`FloorplanCanvas`、`LayerStackThermalPlot`、`YieldWaterfall` 提供读数摘要作为文字替代；剖面图的每个可点击结构件可键盘聚焦。
- [ ] 术语与下表一致（写入 `glossary.json`）。

## 5. 术语表种子
| en | zh |
|----|----|
| Advanced packaging | 先进封装 |
| Chiplet | 芯粒（小芯片） |
| Heterogeneous integration | 异构集成 |
| Reticle limit | 光罩极限 |
| 2D / 2.5D / 3D integration | 2D / 2.5D / 3D 集成 |
| Interposer | 中介层 |
| Redistribution layer (RDL) | 重布线层 |
| Fan-out | 扇出封装 |
| Through-silicon via (TSV) | 硅通孔 |
| Keep-out zone (KOZ) | 禁布区 |
| Wafer thinning / Temporary bonding | 晶圆减薄 / 临时键合 |
| Bump / Micro-bump / C4 | 凸点 / 微凸点 / C4 凸点 |
| Underfill | 底部填充 |
| Hybrid bonding | 混合键合 |
| Wafer-to-wafer (W2W) / Die-to-wafer (D2W) | 晶圆对晶圆 / 裸片对晶圆 |
| High Bandwidth Memory (HBM) | 高带宽存储器 |
| Base die | 基底（逻辑）die |
| Die-to-die (D2D) interconnect | 裸片间互连 |
| Shoreline bandwidth density | 岸线带宽密度 |
| Known good die (KGD) / Known good stack (KGS) | 已知良好裸片 / 已知良好堆栈 |
| Daisy chain | 菊花链 |
| Test access | 测试访问 |
| Warpage / CTE mismatch | 翘曲 / 热膨胀系数失配 |
| System-level test (SLT) | 系统级测试 |
