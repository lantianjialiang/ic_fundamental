# SNS 传感器 / CIS 模块 · 详细规格（9 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 SNS 模块的详细规格，**与主计划冲突时以本文件为准**。通用约定（目录、i18n、schema、DoD、STDF）见主计划，不重复。
> 本模块定位：**基础知识学习**——先建立"传感器 = 敏感元件 + 模拟前端 + ADC + 数字校准"的整体概念，再以 CMOS 图像传感器（CIS）为主线学习光电基础、像素读出链、PTC、暗场/亮场测试、光学测试系统，另以 MEMS 加速度计作为"非光学传感器"的对照，最后做量产测试程序。

**教学数值政策**：传感器参数均为**虚构教学模型**（`VDUT-CIS1`、`VDUT-ACC1`），不对应任何真实型号；经验关系（暗电流翻倍温度等）标注"教学示意"。

---

## 0. 模块设计

**学习主线**
1. **概念与光电基础**（SNS-01～02）：传感器的传递函数、激励难题；光子→电子→噪声。
2. **CIS 读出链与表征**（SNS-03～06）：像素结构、PTC（转换增益/读噪/满阱）、暗场（暗电流/DSNU/热像素）、亮场（PRNU/线性度/缺陷）。
3. **测试系统与对照**（SNS-07～08）：光谱响应与光学测试系统；MEMS 加速度计测试。
4. **综合**（SNS-09）：CIS 量产测试程序（含缺陷图、校准写入、分级）。

**贯穿案例**
- `VDUT-CIS1`：虚拟 CIS（统计模型 + 128×128 代表性帧；整颗用参数抽样与缺陷计数）。
- `VDUT-ACC1`：虚拟三轴 MEMS 加速度计（模拟输出）。

**与其他模块的关系**
- 软前置：`ANA-10`（ADC）、`ANA-13`（Trim/OTP）、`ANA-14`（统计）、`RF-02`（dB）。
- 复用：`REL` 模块的 `WaferMap`；`GEN-01/02` 的 STDF 与 Multi-site 成本。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| SNS-01 | 传感器测试概述 | 概念 | ANA-01 | 40 | 1 | `SensorModelLab` | 8 |
| SNS-02 | 光电基础：光子、量子效率与噪声 | 光电 | SNS-01 | 50 | 2 | `PhotonLab` | 8（试点） |
| SNS-03 | CMOS 图像传感器：像素与读出链 | CIS | SNS-02 | 55 | 2 | `PixelChainLab` | 8 |
| SNS-04 | 光子传递曲线（PTC）与转换增益 | CIS | SNS-03 | 60 | 3 | `PTCLab` | 8（试点） |
| SNS-05 | 暗场测试：暗电流、DSNU 与热像素 | CIS | SNS-04 | 50 | 2 | `DarkLab` | 8 |
| SNS-06 | 亮场测试：PRNU、线性度与缺陷像素 | CIS | SNS-05 | 60 | 2 | `FlatFieldLab` | 8 |
| SNS-07 | 颜色、光谱响应与光学测试系统 | 系统 | SNS-06 | 50 | 2 | `OpticalSetupLab` | 8 |
| SNS-08 | MEMS 加速度计测试基础 | 对照 | SNS-01 | 55 | 2 | `AccelLab` | 8 |
| SNS-09 | 综合：CIS 量产测试程序 | 综合 | SNS-03～07, GEN-01, GEN-02 | 80 | 3 | `CISProgramLab` | 8 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `optics.ts`、`sensor.ts`、`frames.ts`）
```ts
// optics.ts
const H = 6.626e-34, C = 2.998e8, Q = 1.602e-19, KB = 1.381e-23;
function photonEnergyJ(lambdaNm:number): number;                       // hc/λ
function photonFlux(powerW:number, lambdaNm:number): number;           // 光子/s
function responsivity(qe:number, lambdaNm:number): number;             // QE·λ[µm]/1.2398 (A/W)
function kTcNoiseE(cFarad:number, tK:number): number;                  // √(kTC)/q，单位 e⁻

// sensor.ts
interface CisParams { w:number; h:number; kEperDn:number; readNoiseE:number; fwcE:number; darkE25PerS:number; darkDoubleC:number;
   prnu:number; shadingPct:number; defects:{dead:number; hot:number; low:number; clusterProb:number}; blackLevelDn:number; adcBits:number; nonlin?:number; }
function genFrame(p:CisParams, o:{exposureS:number; illumE:number /* e⁻/s/pixel 均值 */; tempC:number; seed:number}): Float32Array;  // 含泊松/高斯/FPN/缺陷
function ptc(frames:{f1:Float32Array; f2:Float32Array; roi:Rect}[], dark:Float32Array|null): {k:number; readNoiseE:number; fwcE:number; dr:number; snrMax:number}; // 差帧法
function prnu(frames:Float32Array[], dark:Float32Array[], removeShading:boolean): number;
function classifyDefects(flat:Float32Array, dark:Float32Array, th:{dead:number; hot:number; low:number}): DefectMap;
function linearity(means:number[], exposures:number[], range:[number,number]): {maxDevPct:number; atIndex:number};
function accelModel(p:AccelParams, o:{aG:number; tiltDeg:number; tempC:number; seed:number}): number;

// frames.ts
function frameMean(f:Float32Array, roi?:Rect): number;  function frameVar(f:Float32Array, roi?:Rect): number;
function diffVar(f1:Float32Array, f2:Float32Array, roi?:Rect): number;   // var(f1−f2)/2，去除 FPN
function average(frames:Float32Array[]): Float32Array;
```
**共享组件**：`FrameView`（灰度/伪彩帧 + 缩放 + 像素读数 + ROI 框选 + 直方图）、`PTCPlot`（对数-对数，斜率 0.5 区域高亮）、`DefectMapView`、`PixelTimingDiagram`、`SpectrumPlot`（复用）、`WaferMap`（复用 REL）。

### 2.2 性能约束
- 帧默认 128×128（16 k 像素），最大 512×512；`FrameView` 用 Canvas `ImageData` 渲染；PTC 扫描的曝光点 ≤ 20、每点 2 帧；超限时分块计算并显示进度。

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。任务卡期望值由仿真运行时计算，下方数字仅用于单元测试。

### SNS-01 传感器测试概述
**学习目标**：① 说出传感器 = 敏感元件 + 模拟前端 + ADC + 数字校准；② 区分 offset、sensitivity、线性度、噪声、温漂等指标；③ 解释"物理激励"为何是传感器测试的核心难点；④ 说明校准/修调与 ATE 测试的关系。
**知识点**：传感器种类（光、惯性、压力、温度、磁、麦克风）；传递函数 `out = S·x + b (+ 非线性 + 噪声 + 温漂)`；两点法求 S、b；激励手段（积分球、翻转/摇床/静电自检、压力腔、温控）；物理激励慢、贵、难并行 → 测试时间与 Multi-site 受限，常用片内自检（电激励）部分替代；校准流程：测量 → 计算校正系数 → 写入 OTP（ANA-13）。
**实验 `SensorModelLab`**：通用传感器模型。控件：S、b、二阶非线性系数、噪声 σ、温漂系数；输入扫描点数。读数：两点法与最小二乘法得到的 S、b、非线性误差。
- 任务卡：T1 用两点法（x=0 与 x=满量程）求 S、b；T2 噪声下两点法误差随平均次数 N 按 `σ/√N` 下降；T3 用两个温度点估计温漂并做补偿；T4 把 8 个测试项标为"需要物理激励 / 只需电激励"。
**常见误区**：传感器测试只是读个 ADC；校准能消除噪声（只能修系统误差）；片内自检可以完全替代物理激励（只能覆盖一部分）。
**ATE 关联**：激励设备成本与并行度决定 COT（GEN-02）。
**单测用例**：两点法公式；平均 N 次后 σ 缩小 √N（统计检验）。

### SNS-02 光电基础：光子、量子效率与噪声
**学习目标**：① 由功率与波长计算光子通量；② 用 QE 与响应度把光转换为电子/电流；③ 区分散粒噪声、暗散粒噪声、读出噪声；④ 计算 SNR 并判断何种噪声主导。
**知识点**：光子能量 `E=hc/λ=1.2398/λ[µm] eV`；`光子/s = P/E`；`QE`（每光子产生的电子数）；响应度 `R=QE·λ[µm]/1.2398 (A/W)`；光子到达服从泊松分布，散粒噪声 `σ=√N`；`SNR = S/√(S + D + σ_r²)`（S 信号电子数、D 暗电子数、σ_r 读噪 e⁻ rms）；低光读噪主导、中高光散粒噪声主导（SNR 随信号 +10 dB/dec → +20 dB/dec 的转变）。
**实验 `PhotonLab`**
- 控件：λ 400–1000 nm；入射功率或辐照度；像素面积 1–10 µm²；曝光 ms；QE；暗电流 e⁻/s；读噪 e⁻。
- 读数：光子数、信号电子数、各噪声分量、SNR(dB)；SNR-信号曲线（对数轴）。
- 任务卡：T1 λ=550 nm、QE=0.6，求响应度（0.266 A/W）；T2 信号 1e4 e⁻ 的散粒噪声极限 SNR（40 dB）；T3 找使散粒噪声等于读噪的信号电子数（=σ_r²）；T4 判断给定信号处的主导噪声（单选）。
**常见误区**：SNR 与光强成正比；QE 越高、噪声就越小；暗电流与读噪是一回事。
**ATE 关联**：为何光源强度/稳定性直接决定测量精度（SNS-07）。
**单测用例**：`responsivity(0.6,550)=0.266 A/W (±0.5%)`；`N=1e4 → SNR=40 dB`；1 µW@550 nm ≈ 2.77e12 光子/s（±1%）。

### SNS-03 CMOS 图像传感器：像素与读出链
**学习目标**：① 说出 4T 像素结构与时序（复位、积分、转移、读出）；② 计算转换增益；③ 解释 CDS 为何降低复位噪声；④ 把"电子→电压→DN"换算串起来；⑤ 区分卷帘与全局快门。
**知识点**：光电二极管（PPD）、转移栅 TX、浮空扩散 FD、复位 RST、源跟随器 SF、行选 SEL；转换增益 `CG=q/C_FD`（C=1 fF → 160 µV/e⁻）；复位 kTC 噪声 `√(kTC)/q`（1 fF、300 K → 12.7 e⁻）；相关双采样（CDS）：读复位电平与信号电平相减；列放大/ADC：`K(e⁻/DN)=V_range/(2^N·CG_total)`；量化噪声 `K/√12` e⁻；Bayer 阵列；卷帘快门的行偏斜。
**实验 `PixelChainLab`**
- 控件：C_FD 0.5–5 fF；SF 增益；列增益；ADC 位数 10–14；Vref；kTC 噪声与 CDS 开关；光电子数。
- 视图：`PixelTimingDiagram`（RST/TX/SEL 与 FD 电压）；信号链各节点读数。
- 任务卡：T1 C=1 fF 的转换增益（160 µV/e⁻）；T2 kTC 噪声 12.7 e⁻，开 CDS 后的变化；T3 ADC 10 bit、1 V 量程、总增益 100 µV/e⁻ 时 K=9.77 e⁻/DN、量化噪声 2.82 e⁻，判断量化是否主导；T4 估算卷帘快门偏斜 = 行时间×行数。
**常见误区**：增益越大越好（满阱受限）；CDS 能消除所有噪声；ADC 位数与读噪无关。
**ATE 关联**：转换增益是 PTC 的核心输出，ATE 要从图像数据反推它（SNS-04）。
**单测用例**：`q/1e-15=160.2 µV`；`kTcNoiseE(1e-15,300)=12.7`；`K=1/1024/100e-6=9.77`。

### SNS-04 光子传递曲线（PTC）与转换增益
**学习目标**：① 说明 PTC 的测量流程；② 由 PTC 提取转换增益 K、读噪、满阱、动态范围；③ 解释差帧法为何能去掉 FPN；④ 估计 ROI 大小对估计精度的影响。
**知识点**：每个曝光点采 2 帧：`mean=(F1+F2)/2 的 ROI 均值 − 暗均值`，`var=var(F1−F2)/2`；散粒噪声区：`σ²_DN = μ_DN/K + σ²_read,DN`，斜率 `1/K` → `K=1/斜率`；暗场方差给出读噪；方差骤降处为饱和 → 满阱 `FWC=μ_sat·K`；`DR=FWC/σ_read(e⁻)`，`SNR_max=√FWC`；方差估计相对误差 ≈ `√(2/(n−1))`（n 为 ROI 像素数）；单帧方差含 FPN 会使斜率偏大、K 偏小。
**实验 `PTCLab`**
- 控件：虚拟传感器参数（K、读噪、FWC、PRNU、FPN、非线性）；曝光点数；每点帧数；ROI 大小；暗场校正开关；差帧法/单帧法切换。
- 视图：`FrameView`、`PTCPlot`（拟合线与区域标注）。读数：K、读噪、FWC、DR、SNR_max 与估计误差。
- 任务卡：T1 估计 K 误差 <3%；T2 改用单帧方差，观察 K 被 FPN 污染并选择原因；T3 找满阱；T4 选 ROI 使 K 估计的相对误差 <2%（n≈1e4 时方差误差≈1.4%）。
**常见误区**：方差/均值直接比就是增益；ROI 越小越好；PTC 只用一个曝光点就够。
**ATE 关联**：PTC 数据量大、耗时长，量产常只测少数点并依赖特性化结果。
**单测用例**：合成帧上恢复 K 误差 <3%；`√(2/(1e4−1))=1.41%`。

### SNS-05 暗场测试：暗电流、DSNU 与热像素
**学习目标**：① 解释暗电流及其对温度、曝光的依赖；② 区分时间噪声与 DSNU（空间固定模式）；③ 用多帧平均分离 FPN；④ 设置热像素阈值并权衡检出率与误判。
**知识点**：暗信号 `= 黑电平 + i_d·t_exp/K`；暗电流随温度指数增长，翻倍温度间隔 ΔT_d（教学示意 7 °C）：`i_d(T)=i_d25·2^((T−25)/ΔT_d)`；DSNU = 逐像素时间平均后的空间标准差；暗电流分布偏态，尾部为热像素；热像素判据（均值 + kσ 或绝对阈值）；多帧平均降低时间噪声 `σ/√N`；暗场测试需避光与温控。
**实验 `DarkLab`**
- 控件：i_d25（e⁻/s）与分布偏度；ΔT_d；温度 −40–125 °C；曝光 1 ms–10 s；读噪；帧平均数 N；热像素阈值。
- 视图：64×64 暗帧、直方图（对数）、热像素标注。读数：平均暗信号、DSNU、热像素数、检出率/误判（已知注入真值）。
- 任务卡：T1 25→60 °C 暗电流倍数（2^5=32）；T2 曝光 1 s 与 100 ms 的暗信号比；T3 找使 DSNU 估计稳定所需的 N；T4 选阈值使热像素检出率 ≥95% 且误判 <0.1%。
**常见误区**：暗电流与温度线性相关；单帧标准差就是 DSNU；阈值越低越安全。
**ATE 关联**：温控与避光；暗场耗时长（长曝光）→ 测试时间。
**单测用例**：`2^((60−25)/7)=32`；N 帧平均后时间噪声缩小 √N。

### SNS-06 亮场测试：PRNU、线性度与缺陷像素
**学习目标**：① 解释 flat-field 测量与 PRNU；② 解释帧平均对 PRNU 估计的影响；③ 区分 shading（低阶渐变）与像素级非均匀；④ 评估线性度；⑤ 对缺陷像素分类并应用簇规则。
**知识点**：`PRNU = 空间标准差/均值`（去暗、去时间噪声后）；测得值含时间噪声贡献：`PRNU_meas² = PRNU² + (σ_t/μ)²/N`；shading 可用低阶曲面拟合去除；线性度：在 10–90% 满阱范围内相对最佳拟合直线的最大偏差%；缺陷类型：死点/卡点、热点、低灵敏点、簇缺陷；规则：单点阈值 + 簇规则（相邻缺陷数）。
**实验 `FlatFieldLab`**
- 控件：帧 128×128；PRNU 0–3%；shading 0–10%；缺陷注入（死/热/低灵敏/簇）；帧平均 N；暗场校正开关；缺陷阈值。
- 视图：`FrameView`（伪彩）、直方图、`DefectMapView`；线性度曲线与偏差。读数：PRNU%、缺陷分类计数、簇数、线性度偏差。
- 任务卡：T1 选 N 使时间噪声对 PRNU 估计的贡献 <10%；T2 去除 shading 前后 PRNU 对比；T3 设阈值使注入缺陷全部检出且误判最少；T4 找线性度偏离 >1% 的曝光点。
**常见误区**：一帧就能测 PRNU；shading 属于 PRNU；缺陷只看单个像素。
**ATE 关联**：亮场是量产分级（缺陷数）的核心输入；光源均匀度会直接叠加（SNS-07）。
**单测用例**：公式 `PRNU_meas²` 数值一致；已知注入缺陷的分类混淆矩阵正确。

### SNS-07 颜色、光谱响应与光学测试系统
**学习目标**：① 解释 Bayer 阵列与各通道 QE；② 说明光谱响应测量方法与参考光电二极管校准；③ 估算光源非均匀与不稳定对测量的影响；④ 估算数据量与传输时间；⑤ 解释光学并行为何困难。
**知识点**：RGGB 与滤色片光谱；各通道 QE(λ)；单色仪/窄带 LED 扫描 + 经校准的参考光电二极管；白平衡比；积分球（均匀光）；光源均匀度、稳定度（闪烁）；`测得 PRNU² = 真值² + 光源非均匀²`；数据量 `像素数×位宽/8`；测试接口接收能力；多 Site 受光学布局限制 → 成本。
**实验 `OpticalSetupLab`**
- 控件：光源类型 {宽谱/RGB LED/IR LED}；光源非均匀度 %；稳定度 %；参考 PD 校准误差；传感器 PRNU 真值；帧数；像素数、位宽、有效带宽。
- 读数：测得 PRNU、光谱响应曲线误差、数据量与传输时间。
- 任务卡：T1 PRNU 真值 0.5%、光源非均匀 0.3% → 测得 0.583%；T2 12 MP×12 bit：18 MB/帧，50 帧 900 MB，有效 2.5 Gbps → 2.88 s；T3 选择 LED 波段完成三通道 QE 测量；T4 判断多 Site 光学并行的限制（多选）。
**常见误区**：光源越亮越好（均匀度与稳定度更重要）；颜色测试只需 RGB 三点；数据传输时间可忽略。
**ATE 关联**：光学系统、接口接收、数据处理共同决定测试时间与成本。
**单测用例**：`√(0.5²+0.3²)=0.583`；`12e6×12/8=18e6 B`；`900e6×8/2.5e9=2.88 s`。

### SNS-08 MEMS 加速度计测试基础
**学习目标**：① 说出主要指标（0 g 偏移、灵敏度、噪声密度、非线性、交叉轴、温漂）；② 用重力翻转法求偏移与灵敏度；③ 估计安装倾斜误差；④ 把噪声密度换算为带宽内噪声；⑤ 比较翻转/转台与静电自检的成本-覆盖。
**知识点**：质量块-弹簧与电容检测（概念）；翻转法：轴向上 `+1 g`、向下 `−1 g`，`offset=(V₊+V₋)/2`，`S=(V₊−V₋)/(2 g)`；倾角 θ 使有效加速度为 `g·cosθ`（1° → 误差 1.5e-4）；噪声 `σ=ND·√BW`；温漂补偿；静电自检（电压激励等效加速度）；校准写入 OTP。
**实验 `AccelLab`**
- 控件：真 S、offset、噪声密度、带宽、非线性、温度、安装倾角、翻转重复性。
- 视图：6 位置读数表、拟合。读数：offset、S 与误差。
- 任务卡：T1 `V₊=1.95 V、V₋=1.35 V` → offset=1.65 V、S=0.3 V/g；T2 θ=2° 的灵敏度误差（0.061%）；T3 ND=150 µg/√Hz、BW=50 Hz → σ=1.06 mg；T4 选择测试方案（翻转/转台/自检）并说明取舍。
**常见误区**：自检能完全代替物理激励；安装倾斜可忽略；噪声密度与带宽无关。
**ATE 关联**：物理激励设备（转台、摇床）昂贵、并行度低；多用自检 + 少量物理标定。
**单测用例**：`1−cos(2°)=6.09e-4`；`150e-6×√50=1.06e-3 g`。

### SNS-09 综合：CIS 量产测试程序
**学习目标**：① 为 `VDUT-CIS1` 设计量产测试程序；② 在测试时间（帧数）与估计精度之间权衡；③ 生成缺陷图并写入 OTP；④ 按缺陷数/簇规则分级；⑤ 导出 STDF。
**测试流程（可增删顺序）**
| 步骤 | 项目 | Bin（失败） |
|------|------|-------------|
| 1 | 上电、连续性、IDD | 2 |
| 2 | 接口与出图检查 | 3 |
| 3 | 黑电平与暗帧（DSNU、热像素） | 4 |
| 4 | 亮帧 2–3 档（PRNU、缺陷、线性度） | 5 |
| 5 | 颜色（可选） | 5 |
| 6 | 缺陷图生成、校准系数计算并写 OTP | 6 |
| 7 | 分级（A/B/C，按缺陷数与簇规则） | 1（等级） |
**实验 `CISProgramLab`**：虚拟群体用"参数抽样 + 缺陷计数（泊松，λ∝面积×缺陷密度，含簇概率）"；每项设条件/帧数/限值；输出：Bin Pareto、等级分布、各参数分布与 Cpk、测试时间（帧数×帧时间 + 光源稳定 + 传输）、UPH/COT（GEN-02）、STDF。
- 任务卡：T1 在时间预算内完成全部必测项；T2 减少帧数并观察 PRNU 估计误差与分级误判；T3 按缺陷数/簇规则给出等级并估计各等级占比；T4 导出 STDF 并在 GEN-01 解析器核对。
**常见误区**：帧数越多越好；缺陷图只是统计；分级只看缺陷总数。
**单测用例**：同 seed 可复现；泊松缺陷计数 CDF 数值与解析一致；STDF 往返后 Bin 计数一致。

---

## 4. 小测与完成标准（SNS 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、情景分析；≥20% 多选、≥20% 数值题。
- [ ] §3 单测用例全部实现并通过。
- [ ] 凡"教学示意"处均有界面标注；不使用任何真实传感器型号的参数。
- [ ] `FrameView`、`PTCPlot`、`DefectMapView` 提供读数摘要作为文字替代；伪彩方案对色盲友好。
- [ ] 帧渲染与 PTC 计算满足 §2.2 性能约束。
- [ ] 术语与下表一致。

## 5. 术语表种子
| en | zh |
|----|----|
| CMOS image sensor (CIS) | CMOS 图像传感器 |
| Quantum efficiency (QE) | 量子效率 |
| Responsivity | 响应度 |
| Shot noise / Read noise | 散粒噪声 / 读出噪声 |
| Dark current | 暗电流 |
| Conversion gain (CG) | 转换增益 |
| Floating diffusion (FD) | 浮空扩散 |
| Correlated double sampling (CDS) | 相关双采样 |
| Rolling / Global shutter | 卷帘 / 全局快门 |
| Photon transfer curve (PTC) | 光子传递曲线 |
| Full well capacity (FWC) | 满阱容量 |
| Dynamic range | 动态范围 |
| Fixed pattern noise (FPN) | 固定模式噪声 |
| DSNU / PRNU | 暗信号非均匀性 / 光响应非均匀性 |
| Hot pixel / Dead pixel | 热像素 / 死像素 |
| Flat-field / Dark frame | 平场 / 暗帧 |
| Integrating sphere | 积分球 |
| Bayer filter | 拜耳滤色阵列 |
| Spectral response | 光谱响应 |
| MEMS accelerometer | MEMS 加速度计 |
| Noise density | 噪声密度 |
| Self-test | 自检 |
