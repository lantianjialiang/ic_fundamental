# PIC 硅光 / 共封装光学（CPO）模块 · 详细规格（9 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 PIC 模块的详细规格，**与主计划冲突时以本文件为准**。通用约定（目录、i18n、schema、DoD、STDF）见主计划，不重复。
> 本模块定位：**基础知识学习**——先补光学基础与硅光基本器件，再学习"怎样把光测出来"（光源/功率计/波长扫描、光纤耦合与对准、晶圆级参数提取、光链路 BER），最后理解共封装光学（CPO）的测试流程与成本为什么要"前移"。

**教学数值政策**：器件与材料参数均为**虚构的教学模型**（`VDUT-PIC1`），数值（如传输损耗、耦合损耗、折射率）为典型量级示意，界面标注"教学示意"；不对应任何代工厂工艺，也不引用任何标准条款。

---

## 0. 模块设计

**学习主线**
1. **光学与器件基础**（PIC-01～04）：为什么要光互连；波长/功率/dB；波导、耦合器、MZI、环形谐振器；调制器与探测器。
2. **光学测试方法**（PIC-05～08）：光源、功率计与波长扫描；光纤耦合与主动对准；晶圆级光电测试与参数提取（cut-back）；光眼图、ER/OMA 与 BER。
3. **共封装与流程**（PIC-09）：CPO 架构、测试插入点、良率连乘与成本。

**贯穿案例**：`VDUT-PIC1`——一颗虚拟硅光芯片，含 TX（环形调制器 + 加热器、MZM）、RX（锗探测器 PD）、光栅耦合器（GC）对、cut-back 结构与回环结构。参数见 §2.3。

**与其他模块的关系**
- 软前置：`RF-02`（dB/dBm）、`HS-03`（通道损耗类比）、`HS-07/08/11`（TJ/BER、眼图、BERT；PIC-08 复用其组件）、`ANA-14`（统计）。
- 复用：`WaferMap`（REL）、`EyeDiagram`/`BERTLab` 相关内核（HS）、`GEN-02`（成本）、`REL-03`（Burn-in/可靠性概念）。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| PIC-01 | 硅光与共封装光学概述 | 概念 | HS-03 (软) | 45 | 1 | `CPOOverviewLab` | 9 |
| PIC-02 | 光学基础：波长、功率、dB 与损耗 | 基础 | PIC-01, RF-02 (软) | 45 | 1 | `OpticsUnitsLab` | 9（试点） |
| PIC-03 | 硅光基本器件：波导、MZI 与环形谐振器 | 器件 | PIC-02 | 60 | 2 | `DeviceLab` | 9（试点） |
| PIC-04 | 光调制器与光探测器 | 器件 | PIC-03 | 55 | 2 | `ModulatorLab`, `PDLab` | 9 |
| PIC-05 | 光学测试基础：光源、功率计与波长扫描 | 测试 | PIC-03 | 55 | 2 | `SweepLab` | 9 |
| PIC-06 | 光纤耦合与对准：光栅/边缘耦合与主动对准 | 测试 | PIC-02 | 55 | 2 | `AlignLab` | 9 |
| PIC-07 | 晶圆级光电测试与参数提取 | 测试 | PIC-04, PIC-05, PIC-06 | 60 | 3 | `CutbackLab` | 9 |
| PIC-08 | 光链路测试：光眼图、ER/OMA 与 BER | 测试 | PIC-04, HS-07, HS-08 | 60 | 3 | `OpticalLinkLab` | 9 |
| PIC-09 | 综合：CPO 测试流程与成本 | 综合 | PIC-07, PIC-08, GEN-02, REL-03 | 70 | 3 | `CPOFlowLab` | 9 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `photonics.ts`、`align.ts`）
```ts
// photonics.ts
const C = 2.998e8;
function lambdaToTHz(lambdaNm:number): number;                          // c/λ
function dbm(pMw:number): number;  function mw(dbmv:number): number;
function ringAllPass(p:{lambdaNm:number[]; neff:number; ng:number; lengthUm:number; a:number; r:number}): number[]; // T(λ)=(a²−2ar·cosφ+r²)/(1−2ar·cosφ+(ar)²), φ=2π·neff·L/λ
function mziTransmission(p:{lambdaNm:number[]; neff:number; dlUm:number}): number[];     // cos²(Δφ/2), Δφ=2π·neff·ΔL/λ
function fsrNm(lambdaNm:number, ng:number, lengthUm:number): number;                      // λ²/(ng·L)
function thermalShiftPmPerK(lambdaNm:number, ng:number, dneffdT:number): number;          // λ/ng·dneff/dT
function mzmPower(p:{p0:number; v:number; vpi:number; phi0:number}): number;              // P0/2·(1+cos(πV/Vπ+φ0))
function er(p1:number, p0:number): number;  function oma(p1:number, p0:number): number;
function pdCurrent(pW:number, rAW:number, idark:number): number;
function gcLossDb(deltaUm:number, wUm:number, l0Db:number): number;                       // L0 + 4.343·(Δ/w)²

// align.ts
function couplingMap(p:{x0:number; y0:number; wUm:number; peakDb:number; noiseDb:number}): (x:number,y:number)=>number;  // 返回读数 dBm 变化
function alignRaster(map, o:{range:number; step:number; moveTimeS:number}): {x:number; y:number; moves:number; timeS:number; lossDb:number};
function alignSpiral(map, o:{range:number; step:number; moveTimeS:number}): {...};
function alignHillClimb(map, o:{startX:number; startY:number; step0:number; moveTimeS:number}): {...};

// link.ts（可复用 HS 的 eye/bert）
function optLinkBer(p:{pRxOmaMw:number; rAW:number; sigmaA:number}): number;    // Q=R·OMA/(2σ)，BER=Q(Q)
function rxSensitivityOmaMw(q:number, sigmaA:number, rAW:number): number;       // 2·Q·σ/R
function cutbackFit(lengthsCm:number[], lossDb:number[]): {slopeDbPerCm:number; interceptDb:number; r2:number};
```
**共享组件**：`SpectrumSweepPlot`（λ 横轴、dB 纵轴、多曲线、游标、谐振标注）、`CouplingMap`（2D 热图 + 平台运动轨迹 + 计数）、`BlockDiagram`（复用 HS）、`EyeDiagram`、`BERCurvePlot`（BER-功率瀑布曲线）、`CPOFlowDiagram`（流程节点图）、`WaferMap`（复用）。

### 2.2 教学默认参数（SOI 220 nm 条形波导，示意）
`neff≈2.4`、`ng≈4.2`、传输损耗 2.5 dB/cm（±0.5，随晶圆变化）、GC 损耗 3 dB（±0.5）、中心波长 1550 nm、`dneff/dT≈1.8e-4 /K`、Ge PD 响应度 0.8 A/W、PD 暗电流 1–50 nA、MZM `Vπ=4 V`。

### 2.3 虚拟 DUT `VDUT-PIC1`（`src/data/virtual-duts/vdut-pic1.json`）
| 结构 | 内容 |
|------|------|
| TX | 环形调制器（R=10 µm）+ 加热器；MZM（Vπ=4 V、ΔL 可调） |
| RX | Ge PD + TIA 噪声模型（σ 可调） |
| 耦合 | 输入/输出 GC 对；可选边缘耦合器 |
| 测试结构 | cut-back 波导（0.1/0.5/1.0/2.0 cm）、GC 回环、参考结构 |
| 缺陷 | 波导损耗偏高、GC 偏移、PD 暗电流偏大、环谐振偏移（含工艺波动） |

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。任务卡期望值由仿真运行时计算，下方数字仅用于单元测试。

### PIC-01 硅光与共封装光学概述
**学习目标**：① 解释电互连在带宽密度与功耗上的瓶颈，以及光互连的动机；② 区分可插拔光模块、近封装光学（NPO）与共封装光学（CPO）的概念差异；③ 说出硅光芯片（PIC）、电芯片（EIC）、外置激光源（ELS）、光纤阵列单元（FAU）的角色；④ 计算每比特能耗；⑤ 概览测试挑战与测试插入点。
**知识点**：电通道损耗随速率增长（呼应 HS-03）→ 需要更强均衡与更多功耗；光链路：激光 → 调制器 → 光纤 → 探测器 → TIA；CPO 把光引擎靠近交换 ASIC 以缩短电通道；`能耗/bit = 功率/速率`；测试挑战：需要光学激励与光学接触（光纤对准）、测试时间长、组装后返修困难。
**实验 `CPOOverviewLab`**：可点击架构图（交换 ASIC、多个光引擎 = PIC+EIC、ELS、FAU）；点击各块显示其职责与"在哪个阶段、用什么手段测"；能耗计算器。
- 任务卡：T1 10 W、1.6 Tbps 的能耗（6.25 pJ/bit）；T2 把 8 个器件拖到正确角色；T3 把 6 个测试项匹配到测试阶段（晶圆级/KGD/光引擎/封装级）；T4 判断"为何电通道缩短能降低均衡功耗"（单选）。
**常见误区**：光互连没有损耗；CPO 就是把可插拔模块做小；测试只需电学。
**ATE 关联**：光电混合测试需要同时具备光学与高速电学资源。
**单测用例**：`10/1.6e12=6.25e-12 J/bit`；角色/阶段数据文件完整。

### PIC-02 光学基础：波长、功率、dB 与损耗
**学习目标**：① 在波长、频率之间换算；② 在 mW、dBm、dB 之间换算并做光链路预算；③ 解释折射率、有效折射率与群折射率；④ 区分 TE/TM 偏振；⑤ 估算波导传输损耗。
**知识点**：`f=c/λ`（1550 nm ≈ 193.4 THz；常见 1310/1550 nm 波段）；`dBm=10·log10(P/1 mW)`；插入损耗 dB 可相加；3 dB ≈ 功率减半；折射率 n、有效折射率 neff（决定相位）、群折射率 ng（决定 FSR 与群延迟）；SOI 条形波导的偏振依赖（耦合器常只支持 TE）；传输损耗以 dB/cm 计。
**实验 `OpticsUnitsLab`**：控件：激光功率（dBm）；各段损耗（GC、波导长度×dB/cm、调制器、连接器）；波长/频率换算器。读数：各节点功率（dBm 与 mW）、总损耗。
- 任务卡：T1 1550 nm 对应的频率（193.4 THz，±0.1）；T2 激光 10 dBm、GC 3 dB、波导 0.5 cm×2.5 dB/cm、调制器 4 dB、GC 3 dB，求到达功率（−1.25 dBm）；T3 把 −3 dBm 换算为 mW（≈0.5 mW）；T4 判断哪段损耗最值得优化（单选）。
**常见误区**：dB 能直接用 mW 的算术相加；有效折射率就是材料折射率；波长越短损耗越低。
**ATE 关联**：所有光学测量都用 dB/dBm 报告；参考面不同则损耗不同（PIC-05/07）。
**单测用例**：`lambdaToTHz(1550)=193.4`；`10−3−1.25−4−3=−1.25 dBm`。

### PIC-03 硅光基本器件：波导、MZI 与环形谐振器
**学习目标**：① 说明波导与耦合器的作用；② 计算 MZI 的传输谱与 FSR；③ 计算环形谐振器的 FSR 并解释谐振与临界耦合；④ 解释热调谐（加热器）与温度漂移；⑤ 从谱线读出消光比与 Q。
**知识点**：方向耦合器的分光比；MZI：`T=cos²(Δφ/2)`，`Δφ=2π·neff·ΔL/λ`，`FSR=λ²/(ng·ΔL)`；环形谐振器（全通型）`T=(a²−2ar·cosφ+r²)/(1−2ar·cosφ+(ar)²)`，`φ=2π·neff·L/λ`；`a` 为单圈幅度透过率，`r` 为自耦合系数；谐振处 `T=(a−r)²/(1−ar)²`，`a=r` 时为临界耦合（透射为 0）；`FSR=λ²/(ng·L)`；`Q=λ0/FWHM`；热光效应 `dλ/dT=(λ/ng)·dneff/dT`（教学默认约 66 pm/K），故加热器可调谐。
**实验 `DeviceLab`（两个标签页）**
- ① MZI：控件：ΔL 10–500 µm、neff、ng、波长范围。视图：传输谱。读数：FSR、消光比。
- ② 环形谐振器：控件：半径 5–20 µm、ng、a、r、温度变化。视图：传输谱。读数：FSR、谐振波长、FWHM、Q、消光比、热漂移 pm/K。
- 任务卡：T1 ΔL=100 µm、ng=4.2，求 MZI 的 FSR（5.72 nm）；T2 半径 10 µm、ng=4.2，求环的 FSR（9.10 nm）；T3 调节 `r` 到临界耦合，读谐振处透射（≈0）；T4 温升 10 K 的谐振漂移（≈0.66 nm）。
**常见误区**：FSR 用 neff 计算（应为 ng）；耦合越强越好；谐振波长不随温度变化。
**ATE 关联**：谐振波长对温度敏感 → 测试需要稳定温控，并依赖波长扫描读出（PIC-05）。
**单测用例**：`fsrNm(1550,4.2,100)=5.72`；环 `L=2π·10 µm` 的 FSR=9.10 nm；`a=r` 时谐振处 T=0；`thermalShift=66.4 pm/K`。

### PIC-04 光调制器与光探测器
**学习目标**：① 写出 MZM 的传输函数并解释偏置点；② 计算 MZM 的 ER、OMA 与插入损耗；③ 解释环形调制器与 MZM 的取舍；④ 计算探测器光电流并解释响应度与暗电流；⑤ 说明外置激光源的 L-I 曲线概念。
**知识点**：`P=(P0/2)(1+cos(πV/Vπ+φ0))`；正交点（quadrature）偏置在线性区；`ER=10·log10(P1/P0)`、`OMA=P1−P0`；MZM 带宽/驱动电压/长度折中；环调制器：面积小、功耗低、但谐振对温度敏感；PD：`I=R·P+I_dark`；响应度 R（A/W）、暗电流、带宽；激光 L-I 曲线（阈值、斜率效率）。
**实验（两个组件）**
- `ModulatorLab`：控件：P0、Vπ、偏置 φ0、驱动 Vpp、NRZ 码型。视图：光输出波形与传输曲线。读数：P1、P0、ER、OMA、插入损耗。
- `PDLab`：控件：入射功率、R、暗电流。读数：光电流、信噪相关量。
- 任务卡：T1 正交点偏置时 `V=0` 的输出（P0/2）；T2 `Vπ=4 V`、驱动 4 Vpp 于正交点，求 ER 与 OMA；T3 入射 −10 dBm、R=0.8 A/W 的光电流（80 µA）；T4 判断偏置漂移对 ER 的影响（单选）。
**常见误区**：驱动越大越好（超过 Vπ 后非线性）；暗电流可忽略；环调制器与 MZM 可随意互换。
**ATE 关联**：偏置控制与稳定性决定测量重复性；PD 暗电流是电学可测的快速筛选项（PIC-07）。
**单测用例**：正交点 `V=±Vπ/2` 输出为 `P0` 或 `0`；`−10 dBm=0.1 mW → 0.8×0.1 mW=80 µA`。

### PIC-05 光学测试基础：光源、功率计与波长扫描
**学习目标**：① 说明可调谐激光器（TLS）+ 光功率计的扫描原理；② 解释参考归一化的作用；③ 选择扫描步长与分辨率；④ 区分仪器噪声底与器件动态范围；⑤ 识别耦合波动与偏振对测量的影响。
**知识点**：TLS 步进扫描 + 功率计读数 → 传输谱；归一化：器件谱 ÷ 参考结构（回环）谱以去除耦合与光源波动；步长需小于线宽的约 1/5 才能分辨谐振峰；噪声底限制消光比读数；偏振控制；光纤连接器清洁；测量不确定度。
**实验 `SweepLab`**
- 控件：扫描范围、步长；TLS 功率与稳定度；功率计噪声底；归一化开关；耦合波动（dB rms）；DUT 选择 {环 / MZI}。
- 视图：`SpectrumSweepPlot`（原始谱、归一化谱）。读数：谐振波长、消光比、FSR、测量误差。
- 任务卡：T1 选择步长使峰位误差 <FWHM/10；T2 打开归一化消除耦合引入的整体偏移；T3 噪声底限制下读出的最大消光比；T4 步长过大造成漏峰（现象判断）。
**常见误区**：步长越小越好（扫描时间长）；不用归一化也能得到绝对损耗；消光比越大测得越准（受噪声底限制）。
**ATE 关联**：扫描时间直接计入测试时间；参考结构是量产必备。
**单测用例**：步长 > FWHM 时峰位误差显著增大；归一化后 GC 损耗被扣除，误差 <0.05 dB。

### PIC-06 光纤耦合与对准：光栅/边缘耦合与主动对准
**学习目标**：① 区分光栅耦合器（GC）与边缘耦合器的特点；② 估算失准造成的耦合损耗；③ 比较对准算法（栅格、螺旋、爬山）的步数与时间；④ 解释光纤阵列（FA）与多通道对准；⑤ 说明为何对准常主导光学测试时间。
**知识点**：GC：垂直/小角度入射、波长相关（1 dB 带宽数十 nm 量级，示意）、对位置公差较宽；边缘耦合：宽带、对位公差更严；高斯模场失准损耗 `L(Δ)=L0+4.343·(Δ/w)²`（dB，w 为模场半径）；主动对准：以功率读数为目标函数搜索峰值；平台移动与稳定时间；光纤阵列的多通道同时对准；重复性与热漂移。
**实验 `AlignLab`**
- 控件：模场半径 w；峰值耦合损耗 L0；读数噪声（dB）；搜索范围；步长；每步移动+稳定时间；算法 {栅格 / 螺旋 / 爬山}。
- 视图：`CouplingMap`（热图 + 轨迹）。读数：步数、总时间、最终损耗、与最优点偏差。
- 任务卡：T1 Δ=w 时的附加损耗（4.34 dB）；T2 用任一算法对准到距峰值 ≤0.2 dB，步数最少；T3 比较三种算法的步数与时间；T4 读数噪声增大时爬山算法的失效现象。
**常见误区**：对准一次就一直对准；步长越小越好；耦合损耗只由横向偏移决定（还有角度、间隙、偏振）。
**ATE 关联**：对准时间与稳定性是光学 Multi-site 的瓶颈（PIC-09）。
**单测用例**：`gcLossDb(Δ=w)=L0+4.343`；三种算法在无噪声时均能收敛到容差内。

### PIC-07 晶圆级光电测试与参数提取
**学习目标**：① 列出晶圆级光电测试项（电学：加热器电阻、PD 暗电流；光学：传输谱、耦合损耗）；② 用 cut-back 法提取传输损耗与耦合损耗；③ 估计测量噪声与重复性对提取误差的影响；④ 设计 cut-back 长度集合；⑤ 读晶圆图并识别系统性偏差。
**知识点**：E-O 混合测试流程；cut-back：不同长度波导的插入损耗线性回归，`斜率=传输损耗(dB/cm)`，`截距=2×GC 损耗`；回归误差与长度范围、点数、噪声、对准重复性相关；晶圆图/统计；PD 暗电流与 IV 的电学快速筛选；已知良好裸片（KGD）概念。
**实验 `CutbackLab`**
- 控件：长度集合（0.1–2 cm 多点）；真值传输损耗与 GC 损耗；测量噪声与对准重复性（dB rms）；重复测量次数。
- 视图：损耗-长度散点与回归线；`WaferMap`（各 die 的提取值）。读数：斜率、截距、拟合误差。
- 任务卡：T1 提取传输损耗，误差 <0.1 dB/cm；T2 通过增加长度范围/点数降低误差；T3 在晶圆图上识别径向系统性偏差；T4 用暗电流阈值快速筛出异常 PD。
**常见误区**：两个点就够；对准重复性可忽略；GC 损耗等于截距。
**ATE 关联**：晶圆级光学测试慢，必须靠 PCM/测试结构与抽样；电学快速筛选先行。
**单测用例**：无噪声时回归精确恢复斜率与截距；噪声下估计标准差与理论一致（±15%）。

### PIC-08 光链路测试：光眼图、ER/OMA 与 BER
**学习目标**：① 解释光眼图的获取（O/E 转换 + 示波/采样）；② 计算 ER、OMA 与平均功率；③ 由 Q 因子计算 BER 并画 BER-接收功率瀑布曲线；④ 求接收灵敏度；⑤ 把光链路指标与 HS 模块的眼图/抖动/BER 联系起来。
**知识点**：光眼图经光电转换后与电眼图同样分析（HS-08）；`ER`、`OMA`、平均功率；`Q=(I1−I0)/(σ1+σ0)`，热噪声主导时 `σ1≈σ0=σ`，`Q=R·OMA/(2σ)`；`BER=Q函数(Q)`；接收灵敏度 `OMA_min=2·Q·σ/R`（BER=1e-12 → Q≈7.034）；链路代价（ER 有限、抖动、非线性）；光环回测试概念。
**实验 `OpticalLinkLab`**
- 控件：发射 OMA/平均功率、ER；链路损耗；PD 响应度 R；TIA 噪声 σ；速率；抖动。
- 视图：光眼图（复用 `EyeDiagram`）、`BERCurvePlot`（BER 随接收功率）。读数：Q、BER、灵敏度（dBm）、余量。
- 任务卡：T1 σ=10 µA、R=0.8 A/W，BER=1e-12 的最小 OMA（≈175.9 µW，−7.55 dBm）；T2 在 BER 曲线上读 1e-12 对应的接收功率；T3 增大链路损耗至 BER 超标，读余量；T4 ER 降低对灵敏度的影响（选择）。
**常见误区**：平均功率就是灵敏度判据（应看 OMA）；ER 越大越好（受调制器与功耗约束）；光链路 BER 与电链路无关。
**ATE 关联**：光电混合 BERT、光环回；测试时间由 BER 目标决定（HS-11）。
**单测用例**：`2×7.034×10e-6/0.8=175.85 µW=−7.55 dBm`；`Q=7.034 → BER≈1e-12`。

### PIC-09 综合：CPO 测试流程与成本
**学习目标**：① 画出 CPO 的制造与测试插入点；② 计算良率连乘并解释"测试前移"（shift-left）；③ 在测试成本与报废成本之间权衡；④ 理解光学对准、热与可靠性对流程的影响；⑤ 估算 Multi-site 并行的限制。
**知识点**：流程：PIC 晶圆级（光学探针 + 电学）→ EIC 晶圆分选 → KGD → 光引擎组装（PIC+EIC）→ 光引擎测试 → 与交换 ASIC 共封装 → 光纤贴装 → 封装级测试/老化 → 系统级；良率连乘 `Y_total=ΠY_i`；无 KGD 时 `n` 个光引擎的封装良率 `y^n`；越晚发现缺陷，报废成本越高（含昂贵的 ASIC 与基板）；光学测试时间由对准与扫描主导；ASIC 发热使谐振漂移 → 需热管理与重新标定；Burn-in 与可靠性（REL-03/05 概念）。
**实验 `CPOFlowLab`**：`CPOFlowDiagram` 上启用/停用测试插入点；输入各步良率、测试时间、测试成本、报废成本；输出：累计良率、单颗总成本、各类损失、UPH（受光学并行度限制）；优化建议。
- 任务卡：T1 ASIC 良率 0.95、8 个光引擎各 0.98，无 KGD 时封装良率（0.808）；T2 启用 KGD 与光引擎测试后，对比总成本；T3 在对准时间翻倍下重新优化插入点；T4 受光学并行度 N=2 限制时，用 GEN-02 估算 UPH/COT。
**常见误区**：每一步都测最安全（成本）；缺陷晚发现也能返修；光学并行与电学并行一样容易。
**单测用例**：`0.95×0.98^8=0.808`；总成本数值与手算一致（±0.5%）；同 seed 可复现。

---

## 4. 小测与完成标准（PIC 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、情景分析；≥20% 多选、≥20% 数值题。
- [ ] §3 单测用例全部实现并通过。
- [ ] 凡"教学示意"处均有界面标注；不使用任何真实工艺、真实器件型号的参数。
- [ ] `SpectrumSweepPlot`、`CouplingMap`、`CPOFlowDiagram` 提供读数摘要作为文字替代；色盲友好配色。
- [ ] 术语与下表一致。

## 5. 术语表种子
| en | zh |
|----|----|
| Silicon photonics | 硅光 |
| Photonic IC (PIC) / Electronic IC (EIC) | 光子集成电路 / 电子集成电路 |
| Co-packaged optics (CPO) | 共封装光学 |
| Near-packaged optics (NPO) | 近封装光学 |
| External laser source (ELS) | 外置激光源 |
| Fiber array unit (FAU) | 光纤阵列单元 |
| Waveguide / Grating coupler / Edge coupler | 波导 / 光栅耦合器 / 边缘耦合器 |
| Mach-Zehnder interferometer (MZI) / Modulator (MZM) | 马赫-曾德尔干涉仪 / 调制器 |
| Ring resonator | 环形谐振器 |
| Free spectral range (FSR) | 自由光谱范围 |
| Quality factor (Q) | 品质因数 |
| Effective / Group index | 有效 / 群折射率 |
| Insertion loss | 插入损耗 |
| Extinction ratio (ER) | 消光比 |
| Optical modulation amplitude (OMA) | 光调制幅度 |
| Photodetector (PD) / Responsivity | 光探测器 / 响应度 |
| Tunable laser source (TLS) | 可调谐激光器 |
| Active alignment | 主动对准 |
| Cut-back method | 截断法（cut-back） |
| Known good die (KGD) | 已知良好裸片 |
| Shift-left testing | 测试前移 |
