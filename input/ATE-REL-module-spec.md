# REL 可靠性 / 车规 模块 · 详细规格（8 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 REL 模块的详细规格，**与主计划冲突时以本文件为准**。目录结构、i18n、schema、DoD、STDF 等通用约定见主计划，不重复。
> 本模块定位：**基础知识学习**——先建立"失效 → 加速 → 试验 → 统计 → 筛选 → 车规"的完整概念链，再落到 ATE 能做的事（三温测试、Burn-in、统计筛选、追溯）。

**标准引用政策（重要）**：涉及 AEC-Q100、ISO 26262、JEDEC 等标准时，只讲**公开的概念性框架**（如温度等级、试验分组及其目的）。具体试验条件、样本量、时间、限值一律标注为"**示例，以现行标准为准**"，**不得复制标准原文**，也不得声称某数值为标准规定值。

---

## 0. 模块设计

**学习主线**
1. **概念**（REL-01～02）：什么叫"可靠"，失效怎样随时间变化，为什么能用高温/高压"加速"。
2. **试验与统计**（REL-03～05）：怎样设计寿命试验、怎样从有限样本推断失效率、Burn-in 如何剔除早期失效。
3. **车规与零缺陷**（REL-06～08）：车规认证框架、统计筛选（PAT）与追溯，最后设计一个车规产品的量产测试流程。

**贯穿案例**：虚拟车规芯片 `VDUT-AUTO1`（Grade 1 的电源管理 IC）。参数见 §2.3。

**与其他模块的关系**
- 软前置：`ANA-14`（Cpk、统计）、`GEN-01`（STDF）、`GEN-02`（成本、UPH）。
- 被依赖：`PIC-09`（CPO 流程的可靠性与 Burn-in 概念）、`PWR-08`（车规功率器件的筛选）。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| REL-01 | 可靠性基础与浴盆曲线 | 概念 | — | 45 | 1 | `BathtubLab` | 6（试点） |
| REL-02 | 失效机理与加速模型 | 概念 | REL-01 | 55 | 2 | `AccelFactorLab` | 6 |
| REL-03 | 可靠性试验方法与样本量 | 试验 | REL-02 | 60 | 2 | `StressPlanLab` | 6 |
| REL-04 | 寿命数据分析：Weibull 与 FIT | 试验 | REL-03 | 55 | 2 | `WeibullLab` | 6 |
| REL-05 | Burn-in 与早期失效筛选 | 试验 | REL-01, REL-03 | 50 | 2 | `BurnInLab` | 6 |
| REL-06 | 车规基础：AEC-Q100 框架与温度等级 | 车规 | REL-03 | 45 | 1 | `AutoQualLab` | 6 |
| REL-07 | 零缺陷测试策略：PAT、SBA 与邻近筛选 | 车规 | REL-06, ANA-14 | 60 | 3 | `PATLab` | 6（试点） |
| REL-08 | 综合：车规产品量产测试流程 | 车规 | REL-01～07, GEN-01, GEN-02 | 75 | 3 | `AutoFlowLab` | 6 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `reliability.ts`、`pat.ts`、`wafer.ts`）
```ts
// reliability.ts
const K_BOLTZ_EV = 8.617e-5;                                   // eV/K
function arrheniusAF(eaEv:number, tUseC:number, tStressC:number): number; // exp[(Ea/k)(1/Tu-1/Ts)]，温度用 K 计算
function voltageAF(gamma:number, vUse:number, vStress:number): number;    // exp[γ(Vs-Vu)]
function coffinMansonAF(dtUse:number, dtStress:number, n:number): number; // (ΔTs/ΔTu)^n
function blackMTTF(a:number, j:number, n:number, eaEv:number, tK:number): number; // A·J^-n·exp(Ea/kT)
function weibullCdf(beta:number, eta:number, t:number): number;
function weibullHazard(beta:number, eta:number, t:number): number;
function fitWeibull(times:number[], censored?:boolean[]): {beta:number; eta:number; r2:number}; // 中位秩回归，Bernard (i-0.3)/(n+0.4)
function chi2Quantile(p:number, dof:number): number;           // 数值实现，dof 为偶数时可用 Poisson 关系校验
function fitUpperBound(r:number, deviceHours:number, cl:number, af:number): number; // χ²(cl,2r+2)/(2·DH·AF)，单位 /h；×1e9 = FIT
function minSampleZeroFail(fitTarget:number, cl:number, hours:number, af:number): number;
function burnInResidual(p:number, beta:number, eta:number, biHours:number, af:number): number;

// pat.ts
function median(x:number[]): number;  function mad(x:number[]): number;
function robustSigma(x:number[]): number;                       // 1.4826 × MAD
function dynamicPatLimits(x:number[], k:number): {lo:number; hi:number};     // median ± k·σ_rob
function neighborRule(map:WaferMap, failed:Set<number>, radius:number, minFails:number): Set<number>; // 邻近规则：返回额外剔除的 die

// wafer.ts
function makeWafer(p:{diameterDie:number; seed:number; clusterProb:number; latentRate:number; paramMean:number; paramSigma:number; latentShiftSigma:number}): WaferMap;
```
**共享组件**：`WaferMap`（die 网格 + 颜色映射，支持点击查看参数；**后续 SNS/PWR/PIC 复用**）、`HazardPlot`（对数时间轴）、`WeibullPlot`（概率坐标）、`StressTable`、`TempProfilePlot`（三温流程时间轴）。

### 2.2 与 STDF 的衔接（依赖 GEN-01）
- `MIR.TST_TEMP` 记录测试温度；`PIR/PRR` 记录 `X_COORD/Y_COORD`（晶圆坐标）与 `PART_ID`；`PTR` 记录参数结果，供 PAT 使用。
- REL-07/REL-08 的数据均可导出为 STDF 并在 GEN-01 的解析器中复核。

### 2.3 虚拟 DUT `VDUT-AUTO1`（教学初始值，`src/data/virtual-duts/vdut-auto1.json`）
| 项目 | 值 | 备注 |
|------|----|------|
| 类型 | 车规电源管理 IC | Grade 1，环境温度 −40～+125 °C |
| 晶圆 | 约 300 个 die 的圆形阵列 | 用于 PAT |
| 关键参数 | 基准电压 Vref、静态电流 Iq、输出精度 | 三温均需测试 |
| 潜在缺陷 | 约 0.5%，参数偏移 +3σ 左右，空间聚簇概率可调 | 用于 REL-05/07/08 |
| 早期失效 | 缺陷子群 Weibull β=0.6，η 可调 | 用于 REL-05/08 |

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。小测与 DoD 见 §4。任务卡的期望值由仿真运行时计算，下方数字仅用于单元测试。

### REL-01 可靠性基础与浴盆曲线
**学习目标**：① 区分早期失效、随机失效、磨损失效；② 计算可靠度 R(t)、失效率 λ、MTTF；③ 互换 FIT 与 MTTF；④ 说明出厂测试、Burn-in、寿命试验分别针对浴盆曲线的哪一段；⑤ 区分"良率""可靠性""质量（DPPM）"。
**知识点**：失效率（风险函数）λ(t)；`R(t)=exp(−∫λdt)`；λ 恒定时为指数分布，`MTTF=1/λ`；`FIT = 每 10⁹ 器件小时的失效数`；浴盆曲线三段与 Weibull 形状参数（β<1 早期、β=1 随机、β>1 磨损）；MTTF 不是"能用多久"，而是平均意义。
**实验 `BathtubLab`**
- 控件：早期失效群体比例 0–5%、β_早 0.3–0.9、η_早；随机段 λ 10–1000 FIT；磨损段 β_磨 2–6、η_磨 1e4–1e6 h；时间轴 0.1 h–1e6 h（对数）；群体 N=1e4 蒙特卡洛。
- 视图：浴盆曲线 h(t)、R(t)、失效数直方图（蒙特卡洛 vs 解析）。读数：各段 FIT、R=0.9 对应时间、随机段 MTTF。
- 任务卡：T1 λ=100 FIT 求 MTTF（1e7 h）；T2 求 5 年（43800 h）可靠度（0.99563）；T3 把"筛选时间"调到刚好越过早期失效段（由仿真判定）；T4 选出 ELFR 试验覆盖的浴盆曲线区段。
**常见误区**：MTTF=寿命；FIT 越大越好（相反）；良率高就是可靠。
**ATE 关联**：出厂测试剔除的是"可测缺陷"，潜在缺陷靠 Burn-in/统计筛选（REL-05/07）。
**单测用例**：`R(43800 h | 100 FIT)=0.99563`；`1e7 h ≈ 1141 年`；蒙特卡洛失效数与解析 CDF 偏差 <3σ。

### REL-02 失效机理与加速模型
**学习目标**：① 概述主要失效机理（电迁移 EM、TDDB、HCI、NBTI/PBTI、热机械疲劳、腐蚀/湿气、ESD/闩锁）及其诱因；② 用 Arrhenius、电压加速、Coffin-Manson、Black 方程计算加速因子；③ 说明为何不同机理需不同应力；④ 理解激活能 Ea 的含义与不确定性。
**知识点**：机理—诱因—表现—典型试验对照表（数据文件 `mechanisms.json`）；`AF_T=exp[(Ea/k)(1/Tu−1/Ts)]`，`k=8.617e-5 eV/K`，温度用开尔文；`AF_V=exp[γ(Vs−Vu)]`；Coffin-Manson `N∝ΔT^(−n)` → `AF=(ΔTs/ΔTu)^n`；Black `MTTF=A·J^(−n)·exp(Ea/kT)`；多应力 AF 相乘；Ea 随机理而异（教学默认 0.7 eV，实际由数据确定），模型只在适用范围内成立。
**实验 `AccelFactorLab`**
- 控件：机理选择；Tuse、Tstress（°C）；Ea；γ；Vuse、Vstress；ΔT_use、ΔT_stress、n；电流密度比 J。
- 读数：各分项 AF 与总 AF；等效使用小时 = 试验小时×AF；换算年数（/8760）。
- 任务卡：T1 Ea=0.7、55→125 °C，求 AF（≈77.7）；T2 热循环 ΔT 65→165、n=2，求 AF（≈6.44）；T3 Black 方程中电流密度加倍、n=2，MTTF 变为原来的 1/4；T4 把 Ea 改为 0.5，AF 变化（≈22.4），说明 Ea 不确定性的影响。
**常见误区**：所有失效都按 Arrhenius；Ea 是常数；加速越狠越好（会引入新机理）。
**ATE 关联**：HTOL/温度循环的应力选择依据；ATE 的温控能力决定能做哪些筛选。
**单测用例**：`arrheniusAF(0.7,55,125)=77.7±1%`；`arrheniusAF(0.5,55,125)=22.4±1%`；`(165/65)^2=6.44`。

### REL-03 可靠性试验方法与样本量
**学习目标**：① 说出 HTOL、HTSL、温度循环（TC）、HAST/uHAST、ELFR、ESD（HBM/CDM）、闩锁试验的目的；② 理解零失效抽样的统计含义；③ 计算给定样本、时间、AF 所能证明的 FIT 上限；④ 为目标 FIT 反推样本量。
**知识点**：各试验目的与对应机理；ESD 模型（人体模型 HBM、器件充电模型 CDM）与闩锁（过压/电流注入）；抽样：批次数×每批样本（示例 3 批×77 片，**以现行标准为准**）；`DH_eq = n × h × AF`；`λ_upper = χ²(CL, 2r+2) / (2·DH_eq)`；常用 CL 60%/90%；χ²(0.6,2)=1.833，χ²(0.9,2)=4.605；"通过"≠"零失效率"，只给出上限。
**实验 `StressPlanLab`**
- 控件：试验类型 {HTOL, HTSL, TC, HAST}；样本量 n；批次数；小时 h；应力条件（调用 REL-02 的 AF）；失效数 r；CL；目标 FIT。
- 视图：等效器件小时；FIT 上限随 r 变化；样本量-时间折中等值线。
- 任务卡：T1 n=231、h=1000、AF=77.7、r=0、CL=60%，求 FIT 上限（≈51）；T2 CL 改为 90%（≈128）；T3 出现 r=1 后重算；T4 目标 50 FIT@60%，固定 1000 h，求最少样本量。
**常见误区**：试验通过就代表 FIT 低于规格；样本量越大越好（需结合时间与成本）；ESD 与闩锁是寿命试验。
**ATE 关联**：试验前后的电学测试（读点）都在 ATE 上完成；应力期间的"带偏置"需要专用板/炉。
**单测用例**：`chi2Quantile(0.6,2)=1.8326`、`(0.9,2)=4.6052`；`DH=231×1000×77.7=1.795e7`；上限 51 FIT / 128 FIT（±1%）。

### REL-04 寿命数据分析：Weibull 与 FIT
**学习目标**：① 用 Weibull 概率图估计 β、η；② 由 β 判断失效模式；③ 把应力条件下的结果外推到使用条件；④ 理解截尾（右删失）数据。
**知识点**：`F(t)=1−exp[−(t/η)^β]`；线性化 `ln(−ln(1−F)) = β·ln t − β·ln η`；中位秩（Bernard）`(i−0.3)/(n+0.4)`；截尾数据（试验结束时未失效）的处理；`t_use = t_stress × AF`；B10 寿命（10% 失效时间）；样本越少估计越不确定。
**实验 `WeibullLab`**
- 控件：真值 β、η；样本量 n；截尾时间；seed；AF（用于外推）。
- 视图：`WeibullPlot` 与拟合线；β、η 估计与误差；外推 B10 与 10 年可靠度。
- 任务卡：T1 n=50，β 估计误差 <15%；T2 n=10，观察误差变大；T3 由 β<1 判断失效模式；T4 外推 B10。
**常见误区**：失效数很少也能精确拟合；忽略截尾数据；直接把应力条件寿命当使用寿命。
**ATE 关联**：试验数据常来自 ATE 读点结果；数据质量决定拟合质量。
**单测用例**：合成 n=1000 时 `fitWeibull` 恢复 β 误差 <5%。

### REL-05 Burn-in 与早期失效筛选
**学习目标**：① 解释 Burn-in 的目的；② 区分静态、动态、监控式 Burn-in 与晶圆级 Burn-in；③ 权衡时间/温度/电压与成本、良率损失；④ 计算 Burn-in 后的残余早期失效。
**知识点**：早期失效来自潜在缺陷；Burn-in 用加速因子"提前"暴露；Burn-in 板与炉的成本与产能；读点（BI 前后测试）；副作用（额外成本、可能损伤）；替代/补充：电压应力筛选、IDDQ、统计筛选（REL-07）；残余 `p·[1−F_d(h·AF)]`。
**实验 `BurnInLab`**
- 控件：群体 N=1e5；缺陷子群比例 0.1–5%；缺陷 Weibull β_d 0.4–0.8、η_d；BI 温度/电压（→ AF，调用 REL-02）；BI 时间 0–168 h；BI 成本；失效品报废成本；现场失效成本；现场窗口 T_field。
- 读数：被剔除比例、残余缺陷比例、出货后 T_field 内失效 ppm、总成本曲线、最优 BI 时间。
- 任务卡：T1 把 ppm 压到目标；T2 在 ppm 约束下求最低总成本；T3 提高 BI 温度使时间缩短，读新 AF；T4 对比"无 BI + 统计筛选"。
**常见误区**：Burn-in 时间越长越好；Burn-in 能剔除所有缺陷；所有产品都需要 Burn-in。
**ATE 关联**：BI 前后读点；高温分选与老化板；成本模型（GEN-02）。
**单测用例**：剔除 + 残余 = 初始；`h=0` 时残余 = p。

### REL-06 车规基础：AEC-Q100 框架与温度等级
**学习目标**：① 说出 AEC-Q100 的温度等级 0–3；② 知道 Q100 试验分 A–G 七组及目的；③ 理解"三温测试"、DPPM 目标、追溯的意义；④ 区分 AEC-Q100（元器件认证）、ISO 26262（功能安全）、IATF 16949（质量体系）的角色。
**知识点**：等级（环境工作温度）：Grade 0：−40～+150 °C；Grade 1：−40～+125 °C；Grade 2：−40～+105 °C；Grade 3：−40～+85 °C。试验分组：A 加速环境应力（如 TC、HAST、HTSL）、B 加速寿命模拟（HTOL、ELFR、NVM 耐久）、C 封装组装完整性、D 晶圆制造可靠性（EM、TDDB、HCI、NBTI）、E 电学验证（测试、ESD、闩锁、特性化）、F 缺陷筛选（PAT、SBA）、G 腔体封装完整性。三温：低温/室温/高温。ASIL A–D 为功能安全等级概念；零缺陷 DPPM 目标；批次/晶圆/die 级追溯与流程变更通知。**所有试验条件仅为示例。**
**实验 `AutoQualLab`**
- 内容：4 个虚拟产品卡（发动机舱传感器接口、座舱音频、车身 LED 驱动、`VDUT-AUTO1`）；12 个失效案例；10 个试验名称。
- 任务卡：T1 为 3 个安装位置选对 Grade；T2 把 10 个试验归入 A–G；T3 为 `VDUT-AUTO1` 设置三温测试温度点并说明低温的目的；T4 把三类标准与其角色匹配。
**常见误区**：Grade 越高越"好"（只是温度范围）；通过 AEC-Q100 就满足功能安全；三温只是多做几次同样的测试。
**ATE 关联**：三温测试需要温控分选/探针台，决定 UPH 与成本（GEN-02）。
**单测用例**：数据文件中 4 个 Grade 的温度范围与上述一致；试验→分组映射无重复无遗漏。

### REL-07 零缺陷测试策略：PAT、SBA 与邻近筛选
**学习目标**：① 解释静态与动态 PAT；② 用稳健统计（中位数、MAD）计算限值；③ 解释统计 Bin 限值/良率限值（SBL/SYL）的概念；④ 用邻近规则筛除失效簇附近的"好 die"；⑤ 权衡良率损失与漏检。
**知识点**：规格内的离群值常与潜在缺陷相关；稳健 σ=`1.4826×MAD`；动态限值 `median ± k·σ_rob`（k=6 为示例）；按晶圆/Lot/Site 分别计算；空间相关性与邻近规则（半径 r 内失效数 ≥ m 则剔除）；数据依赖 STDF 的 PTR 与坐标；**仅讲概念，不引用 AEC-Q001/Q002 条款**。
**实验 `PATLab`**
- 控件：晶圆参数均值/σ；潜在缺陷比例（0.5%）与聚簇概率；缺陷参数偏移；PAT 的 k（3–8）；计算窗口 {整 Lot / 单晶圆 / 每 Site}；邻近规则 r、m。
- 视图：`WaferMap`（参数/Bin）、直方图 + 限值线。读数：PAT 剔除数、捕获潜在缺陷数、良率损失、漏检数。
- 任务卡：T1 手算示例数据的中位数/MAD/σ_rob；T2 选 k 使潜在缺陷捕获率 ≥80% 且良率损失 ≤0.5%；T3 启用邻近规则，读额外良率损失与漏检变化；T4 比较整 Lot 与单晶圆窗口的限值差异（批间偏移）。
**常见误区**：规格内就是好品；k 越小越安全（良率损失）；PAT 能替代 Burn-in（互补）。
**ATE 关联**：PAT 在测试流程末端对 STDF 数据后处理，需保存坐标与追溯信息。
**单测用例**：数据 `[10,11,9,10,10,12,8,10,11,9,50]` → median=10、MAD=1、σ_rob=1.4826；k=6 → 限值 [1.1, 18.9]，50 被剔除。

### REL-08 综合：车规产品量产测试流程
**学习目标**：① 为 `VDUT-AUTO1` 设计从 CP 到 FT 的车规流程；② 在 DPPM 目标与成本预算间优化；③ 比较 Burn-in 与 PAT+邻近两种筛选方案；④ 导出带温度与追溯字段的 STDF。
**知识点**：流程节点（CP 室温/高温、可选 BI、FT 三温、可选 PAT、可靠性监控抽检）；三温的 soak 时间与切换成本；指标：良率、出货后早期失效 ppm、测试成本（GEN-02）、追溯完整度。
**实验 `AutoFlowLab`**
- 界面：流程节点拖拽排序/启用；虚拟群体含三类问题（硬失效、参数偏移、潜在缺陷）；每次温度切换 soak 秒数可调。
- 输出：Bin Pareto、良率、ppm、成本、UPH、报告、STDF。
- 任务卡：T1 达到 ppm 目标且成本 ≤ 预算；T2 比较 BI 与 PAT+邻近方案；T3 分析 soak 时间对 UPH/COT 的影响；T4 导出 STDF，在 GEN-01 解析器核对温度与 Lot/坐标字段。
**常见误区**：测试项越多越安全；三温可以随意省略；追溯是事后补记。
**单测用例**：同 seed 同流程可复现；STDF 往返后颗数/Bin/温度字段一致。

---

## 4. 小测与完成标准（REL 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、情景分析；≥20% 多选、≥20% 数值题。
- [ ] 所有 §3 单测用例已实现并通过。
- [ ] 所有涉及标准数值处均显示"示例，以现行标准为准"标注。
- [ ] `WaferMap` 组件具备文字替代（读数摘要）与键盘可达性。
- [ ] 术语与下表一致（写入 `glossary.json`）。

## 5. 术语表种子
| en | zh |
|----|----|
| Reliability / Failure rate / FIT | 可靠性 / 失效率 / FIT（10⁹ 器件小时失效数） |
| MTTF | 平均失效前时间 |
| Bathtub curve | 浴盆曲线 |
| Infant mortality / Wear-out | 早期失效 / 磨损失效 |
| Acceleration factor (AF) | 加速因子 |
| Activation energy (Ea) | 激活能 |
| Electromigration (EM) | 电迁移 |
| TDDB | 经时介质击穿 |
| HCI / NBTI | 热载流子注入 / 负偏压温度不稳定性 |
| HTOL / HTSL / TC / HAST | 高温工作寿命 / 高温存储寿命 / 温度循环 / 高加速温湿度应力 |
| ELFR | 早期失效率试验 |
| Burn-in | 老化筛选 |
| Weibull distribution | 威布尔分布 |
| Censored data | 截尾数据 |
| AEC-Q100 / ISO 26262 / ASIL | 车规集成电路认证 / 功能安全标准 / 汽车安全完整性等级 |
| Part Average Testing (PAT) | 零件平均测试（统计筛选） |
| Statistical Bin Limit (SBL) | 统计 Bin 限值 |
| Good Die in Bad Neighborhood | 坏邻域中的好 die |
| DPPM | 每百万缺陷件数 |
| Traceability | 可追溯性 |
