# PWR 功率器件 模块 · 详细规格（8 课）

> 本文件是主计划 `ATE-learning-site-plan.md` 中 PWR 模块的详细规格，**与主计划冲突时以本文件为准**。通用约定（目录、i18n、schema、DoD、STDF）见主计划，不重复。
> 本模块定位：**基础知识学习**——从"功率器件是什么、参数代表什么"出发，学会静态测量（含 Kelvin 与自热）、动态测量（栅极电荷、双脉冲）、极限能力（UIS、SOA、热阻），再认识 SiC/GaN 的新挑战，最后搭一个量产测试程序。

**教学数值政策**：器件参数均为**虚构的教学模型**（`VDUT-MOS1` 等），不对应任何真实型号；经验关系（如温度系数、Rds(on) 与耐压的趋势）标注"教学示意"。

---

## 0. 模块设计

**学习主线**
1. **认识器件**（PWR-01）：类型、额定值、参数分类。
2. **静态与测量技术**（PWR-02～03）：怎样测 Vth、Rds(on)、BVdss、漏电，怎样避免自热、接触电阻与漏电引入误差。
3. **动态与极限**（PWR-04～06）：栅极电荷、双脉冲开关能量、雪崩（UIS）、安全工作区（SOA）与热阻。
4. **新材料与综合**（PWR-07～08）：SiC/GaN 的测试挑战；量产测试程序。

**贯穿案例**
- `VDUT-MOS1`：100 V 硅 MOSFET（Rds(on)=5 mΩ@Vgs=10 V、25 °C，Qg≈60 nC，Vth≈3 V）。
- `VDUT-SIC1`：1200 V SiC MOSFET；`VDUT-GAN1`：650 V E-mode GaN HEMT（用于 PWR-07）。
- 数值均存 `src/data/virtual-duts/*.json`，可调。

**与其他模块的关系**
- 软前置：`ANA-02/04`（Force/Measure、SMU）、`ANA-14`（Cpk）、`HS-03`（通道损耗，仅作类比）。
- 被依赖：无；`REL-07` 的 PAT 可用于 PWR-08。

---

## 1. 课程总览

| ID | 标题 | 层 | 前置 | 时长 | 难度 | 实验组件 | 阶段 |
|----|------|----|------|------|------|----------|------|
| PWR-01 | 功率器件概述与基础 | 认识 | ANA-02 | 45 | 1 | `DeviceSelectorLab` | 7（试点） |
| PWR-02 | 静态参数测试：Vth、Rds(on)、BVdss、漏电 | 静态 | PWR-01, ANA-04 | 60 | 2 | `StaticParamLab` | 7（试点） |
| PWR-03 | 开尔文连接、大电流与高电压测量 | 静态 | PWR-02 | 50 | 2 | `KelvinLab` | 7 |
| PWR-04 | 动态参数：栅极电荷、电容与开关时间 | 动态 | PWR-02 | 60 | 2 | `GateChargeLab` | 7 |
| PWR-05 | 双脉冲测试与开关能量 | 动态 | PWR-04 | 70 | 3 | `DPTLab` | 7 |
| PWR-06 | 雪崩（UIS）、SOA 与热阻 | 极限 | PWR-02 | 65 | 3 | `UISLab`, `SOAPlot` | 7 |
| PWR-07 | 宽禁带器件：SiC 与 GaN 的测试挑战 | 新材料 | PWR-02, PWR-05 | 55 | 2 | `WBGLab` | 7 |
| PWR-08 | 综合：功率器件测试程序 | 综合 | PWR-01～07, GEN-01, GEN-02 | 75 | 3 | `PowerProgramLab` | 7 |

---

## 2. 共享基础

### 2.1 `sim-core` 模块（新增 `power.ts`、`thermal.ts`）
```ts
// power.ts
interface MosModel { vth:number; kp:number; rds25:number; rdsTempco:number /* 1/K，教学默认 0.005 */; bv:number; cgs:number; cgdAt:(vds:number)=>number; cds:(vds:number)=>number; }
function mosId(m:MosModel, vgs:number, vds:number, tC:number): number;        // 简化平方律 + 线性区
function rdsOn(m:MosModel, tC:number): number;                               // rds25·(1+α(T−25))
function gateChargeCurve(m:MosModel, p:{ig:number; vdd:number; vdrive:number; dt:number}): {t:number[]; vgs:number[]; vds:number[]; q:number[]};
function dpt(p:{vdc:number; l:number; t1:number; rg:number; lstray:number; qrr:number; model:MosModel}): {t:number[]; vds:number[]; id:number[]; eon:number; eoff:number; diDt:number; dvDt:number; overshoot:number};
function uis(p:{l:number; ipk:number; vdd:number; bv:number}): {eas:number; tav:number; t:number[]; id:number[]; vds:number[]};
function easJ(l:number, ipk:number, vdd:number, bv:number): number;          // ½·L·Ipk²·BV/(BV−Vdd)
function soaLimit(p:{tPulse:number; vds:number; model:MosModel; zth:ZthModel; tcase:number; tjMax:number}): number; // 允许 Id

// thermal.ts
interface ZthModel { stages:{rth:number; tau:number}[] }                      // Foster 网络
function zth(m:ZthModel, t:number): number;                                  // Σ Rth_i(1−e^{−t/τ_i})
function pulseHeating(pW:number, tPulse:number, m:ZthModel): number;          // ΔT = P·Zth(t)
```
**共享组件**：`IVCurvePlot`（线性/对数轴、多曲线、扫描方向箭头）、`ScopeView`（多通道波形 + 游标 + 积分区间，用于 DPT/UIS/栅极电荷）、`ZthPlot`、`SOAPlot`（对数-对数坐标，四条边界线）、`KelvinDiagram`（可视化 force/sense 路径与寄生电阻）、`WaferMap`（复用 REL 模块）。

### 2.2 ATE 资源概念（在 PWR-02/03 中讲解，不引用具体机型）
大电流脉冲源、高压 SMU、Force/Sense 双线、保护环（guard）、三轴、安全互锁、绝缘介质（空气/绝缘液）概念。

---

## 3. 各课详细规格

> 每课字段：**学习目标 / 知识点 / 实验（控件→模型→读数→任务卡）/ 常见误区 / ATE 关联 / 单测用例**。任务卡期望值由仿真运行时计算，下方数字仅用于单元测试。

### PWR-01 功率器件概述与基础
**学习目标**：① 区分功率二极管、MOSFET、IGBT、SiC、GaN 及其适用场景；② 解释额定电压、额定电流、导通电阻的含义；③ 估算导通损耗；④ 把测试参数分为静态/动态/极限/热四类；⑤ 说出测试在流程中的位置（晶圆分选、成品测试、特性化、可靠性）。
**知识点**：功率半导体在开关电源/逆变/电机驱动中的角色；垂直结构（VDMOS、沟槽）使耐压与导通电阻折中，比导通电阻随耐压急剧上升（教学示意 `R_on,sp ∝ BV^(2～2.5)`）；IGBT：`Vce(sat)` 拐点 + 少子存储 → 关断拖尾；二极管：`Vf`、`trr/Qrr`；MOSFET 体二极管；参数分类表：静态（BVdss、Rds(on)、Vth、Idss、Igss、Vsd）、动态（Qg、Ciss/Coss/Crss、td/tr、trr、Eon/Eoff）、极限（UIS、SOA、短路耐受）、热（Rth、Zth）；导通损耗 `P=I²·Rds(on)`。
**实验 `DeviceSelectorLab`**：给 4 个应用（12 V→1 V DC-DC、400 V PFC、800 V 车用逆变器、手机快充）选择器件类型与耐压（教学经验：额定耐压留出母线电压的 1.5～2 倍余量）；对比导通损耗与开关损耗的粗估。
- 任务卡：T1 为各应用选合适耐压；T2 I=10 A、Rds=5 mΩ 的导通损耗（0.5 W）；T3 把 12 个参数拖入四类；T4 读图判断 Rds(on) 随耐压的变化趋势。
**常见误区**：Rds(on) 越小越好（Qg、成本、短路耐受会变差）；耐压=工作电压；IGBT 一定比 MOSFET 好。
**ATE 关联**：参数分类决定使用什么仪器（SMU、脉冲源、电容测试、DPT 台架）。
**单测用例**：`P=I²R=0.5 W`；参数分类数据文件完整。

### PWR-02 静态参数测试：Vth、Rds(on)、BVdss、漏电
**学习目标**：① 写出各静态参数的 force/measure 方式；② 解释参数定义依赖测试条件；③ 解释脉冲测量为何能避免自热；④ 估算自热引起的 Rds(on) 误差；⑤ 设置 compliance 与限值。
**知识点**：
| 参数 | Force | Measure | 说明 |
|------|-------|---------|------|
| BVdss | Vgs=0，Id=小电流（如 250 µA，示例） | Vds | 雪崩起点 |
| Idss | Vgs=0，Vds=某比例的 BV | Id | 漏电 |
| Igss | Vds=0，Vgs=±额定 | Ig | 栅漏电 |
| Vth | Vds 固定（或栅漏短接），Id=小电流 | Vgs | **依赖 Id 条件** |
| Rds(on) | Vgs=驱动电压，Id=规定电流 | Vds，`R=Vds/Id` | 需脉冲 |
| Vsd | 源漏电流 Is | Vsd | 体二极管 |
| IGBT 对应 | | `Vce(sat)`、`Vge(th)`、`Ices` | |
自热 `Tj = Ta + P·Zth(t)`；`Rds(on)(T)=R25·(1+α(T−25))`（教学取 α=0.5%/°C）；脉宽越长误差越大；compliance 保护 DUT 与仪器。
**实验 `StaticParamLab`**
- 控件：选择参数；force 电平；compliance；脉宽 10 µs–10 ms；占空比；环境温度；DUT 热模型（教学默认 `Rth=1 K/W、τ=10 ms` 单级 Foster）。
- 读数：测得值、结温升、相对 25 °C 真值的误差%。
- 任务卡：T1 测 BVdss（选 force 电流与 compliance，±1 V）；T2 I=50 A 下测 Rds(on)，比较 10 ms 与 100 µs 脉宽，找使误差 <1% 的最大脉宽（≈1.7 ms）；T3 在不同 Id 条件下读 Vth，说明"Vth 没有唯一值"；T4 设置 Idss/Igss 限值并对故障样品判 Pass/Fail。
**常见误区**：DC 测更准（自热反而更差）；Vth 是器件常数；漏电只与器件有关（夹具也贡献，见 PWR-03）。
**ATE 关联**：SMU 的 force/compliance/脉冲能力；ANA-04 的 FVMI/FIMV 在此落地。
**单测用例**：`P=I²R=12.5 W`；`ΔTj(10 ms)=12.5×1×(1−e^−1)=7.9 K`，误差≈3.95%；`t<τ·(−ln(1−ΔTmax/(P·Rth)))` 得 ≈1.74 ms。

### PWR-03 开尔文连接、大电流与高电压测量
**学习目标**：① 解释 2 线与 4 线（Kelvin）测量的误差差异；② 估算接触与引线电阻对 mΩ 级测量的影响；③ 解释高压测试中夹具漏电与 guard 的作用；④ 理解大电流下 `L·di/dt` 与建立时间；⑤ 说出安全互锁与电弧风险。
**知识点**：2 线 `R_meas = R_dut + 2(R_c + R_lead)`；4 线：sense 路径电流≈0，误差主要来自热电势与 sense 输入阻抗；Kelvin 接触检查（force–sense 开路检测）；大电流线缆电感 `V=L·di/dt`；高压漏电：`I_fix = V/R_ins`（湿度与污染降低 R_ins）；guard 与三轴的概念；爬电距离/电气间隙、气体/绝缘液环境、电弧；互锁。
**实验 `KelvinLab`（两个标签页）**
- ① 接触电阻：Rds=2 mΩ；I 1–100 A；Rc 0–5 mΩ；Rlead 0–5 mΩ；2 线/4 线切换。读数：测得 R 与误差%。
- ② 高压漏电：Vtest 100–1500 V；夹具绝缘电阻 1e9–1e13 Ω；湿度；guard 开/关；DUT Idss 10 nA–10 µA。读数：测得电流与误差。
- 任务卡：T1 Rc=0.5 mΩ、Rlead=0.5 mΩ 时，2 线读数 4 mΩ（误差 100%），4 线 2 mΩ；T2 找使 2 线误差 <5% 的条件（Rc+Rlead ≤ 0.05 mΩ）；T3 V=1000 V、R_ins=1e11 Ω、DUT Idss=20 nA：夹具贡献 10 nA、误差 50%，开 guard 后恢复；T4 选择降压/换环境/加 guard 的恰当措施。
**常见误区**：电流越大越准；接触电阻可以校零一次就忘；高压漏电都是 DUT 的。
**ATE 关联**：DIB/socket 的 Kelvin 设计与接触检查是功率测试的第一步。
**单测用例**：2 线 `2+2×(0.5+0.5)=4 mΩ`；`1000/1e11=10 nA`。

### PWR-04 动态参数：栅极电荷、电容与开关时间
**学习目标**：① 解释 Ciss/Coss/Crss 与 Qg、Qgs、Qgd 的关系；② 读栅极电荷曲线并识别米勒平台；③ 估算驱动损耗与开关时间；④ 解释电容随 Vds 非线性及测试条件的重要性。
**知识点**：`Ciss=Cgs+Cgd`、`Crss=Cgd`、`Coss=Cds+Cgd`；`Cgd` 随 Vds 高度非线性（低压大）；栅极电荷测试：恒定 `Ig` 充电，`Q=Ig·t`；三阶段：充 Cgs（至 Vth）→ 米勒平台（Cgd 充电，Vds 下降）→ 充至驱动电压；驱动损耗 `P=Qg·Vdrive·fsw`；`t≈Q/Ig`；电容测试：小信号 LCR + 直流偏置（偏置隔离概念）。
**实验 `GateChargeLab`**
- 控件：Ig 1–50 mA；Vdd 10–100 V；Cgs 1–5 nF；`Cgd(Vds)` 参数；Vth；Vdrive。
- 视图：`ScopeView`（Vgs、Vds vs Q/t）。读数：Qgs、Qgd、Qg、米勒平台电压。
- 任务卡：T1 读 Qgd（±5%）；T2 Vdd 升高后 Qgd 如何变化并解释；T3 Qg=60 nC、Vdrive=10 V、fsw=500 kHz 的驱动损耗（0.3 W）；T4 判断 Ig 过大/过小导致平台难辨的问题。
**常见误区**：电容是常数；Qg 与测试 Ig 无关（Ig 过大使平台被"抹平"）；Ciss 越小越好（与 Rds(on) 折中）。
**ATE 关联**：栅极电荷与电容通常抽样或特性化测量，不在每颗上做。
**单测用例**：`P=60e-9×10×5e5=0.3 W`；`Q=Ig·t` 数值积分误差 <1%。

### PWR-05 双脉冲测试与开关能量
**学习目标**：① 解释 DPT 电路与时序；② 用 `I=Vdc·t1/L` 设置电流；③ 读 Eon、Eoff、di/dt、dv/dt、过冲与 Qrr；④ 解释杂散电感与测量带宽/偏斜对结果的影响；⑤ 说出 DPT 为何多用于特性化而非量产。
**知识点**：电路：母线 Vdc、电感 L 与续流二极管、下管 DUT、栅极电阻 Rg；第一脉冲 t1 使电感电流达到 `I=Vdc·t1/L`；关断（测 Eoff）；间隔期电流经二极管续流；第二脉冲开通（测 Eon，含二极管反向恢复 Qrr）；`E=∫Vds·Id dt`；过冲 `ΔV=Lstray·di/dt`；`di/dt ≈ gfs·(Vdrive−Vgp)/(Rg·Ciss)`（教学近似）；教学简化能量：`Eon≈½Vdc·I·(t_ri+t_fv)+Qrr·Vdc`、`Eoff≈½Vdc·I·(t_rv+t_fi)`（**教学简化公式**，界面标注）；电压/电流探头的带宽与时间偏斜（deskew）误差。
**实验 `DPTLab`**
- 控件：Vdc 50–800 V（400）；L 10–500 µH（100）；t1；Rg 1–50 Ω；Lstray 1–50 nH（20）；Qrr 0–500 nC；探头带宽；deskew 误差 0–10 ns。
- 视图：`ScopeView`（Vds、Id、Vgs，含积分区间）。读数：Eon、Eoff、di/dt、dv/dt、ΔV、测量误差%。
- 任务卡：T1 目标 I=30 A，求 t1（7.5 µs）；T2 di/dt=2 A/ns、Lstray=20 nH，求过冲（40 V）；T3 加入 5 ns deskew 误差，读 Eoff 误差%；T4 Rg 增大的折中（开关损耗↑、过冲↓）。
**常见误区**：能量只看一个开关沿；探头带宽够就行（偏斜同样重要）；Rg 越大越好。
**ATE 关联**：DPT 多在专用台架；ATE 侧关注"如何用更便宜的参数（Qg、C）做量产替代与相关性"。
**单测用例**：`t1=30×100e-6/400=7.5 µs`；`ΔV=20e-9×2e9=40 V`；Eon/Eoff 数值积分与解析（理想分段线性）误差 <2%。

### PWR-06 雪崩（UIS）、SOA 与热阻
**学习目标**：① 解释 UIS 电路与失效；② 计算雪崩能量与雪崩时间；③ 读 SOA 图的四条边界；④ 用 Zth 计算结温；⑤ 解释用体二极管压降估计结温（TSEP）的概念。
**知识点**：UIS：电感充电至 `Ipk` 后关断，电感能量在器件内以雪崩方式释放，Vds 钳位在 BVdss；`E_AS=½·L·Ipk²·BV/(BV−Vdd)`；`t_av=L·Ipk/(BV−Vdd)`；失效：寄生 BJT 导通/热失效；单次与重复雪崩；SOA 边界：Rds(on) 限制线、最大电流、热限制（短脉冲区近似 `P∝1/√t`）、击穿电压；瞬态热阻 `Zth(t)=Rth(1−e^(−t/τ))`（多级 Foster）；TSEP：体二极管 `Vf` 随温度约 −2 mV/°C 量级（因器件而异，需先校准）。
**实验 `UISLab` 与 `SOAPlot`**
- UIS 控件：L 0.1–10 mH；Ipk 1–100 A；Vdd 0–200 V；BVdss 60–200 V；器件额定 E_AS。读数：E_AS、t_av、波形（Id 线性下降、Vds 平台）、Pass/Fail。
- SOA 控件：脉宽、Vds；读数：允许 Id（各边界）。
- 任务卡：T1 L=1 mH、Ipk=10 A、Vdd=50 V、BV=100 V，求 E_AS（0.1 J）与 t_av（200 µs）；T2 额定 E_AS=0.5 J，求最大 Ipk（≈22.4 A）；T3 在给定脉宽读 SOA 热限制线电流；T4 P=100 W、Rth=0.5 K/W、τ=5 ms，求 1 ms 的结温升（≈9.06 K）。
**常见误区**：UIS 能量只由 L 与 I 决定（还与 BV、Vdd 有关）；SOA 只看电流电压（还看脉宽与壳温）；Rth 是常数（随脉宽变化）。
**ATE 关联**：UIS 耗时与应力大，常抽样或限定条件；全测要权衡成本与潜在损伤。
**单测用例**：`easJ(1e-3,10,50,100)=0.1`；`tav=200 µs`；`Ipk=√500≈22.36 A`；`Zth(1 ms)=0.5(1−e^−0.2)=0.0906`。

### PWR-07 宽禁带器件：SiC 与 GaN 的测试挑战
**学习目标**：① 比较 Si/SiC/GaN 的材料特性与应用；② 解释 SiC Vth 滞回/漂移与测试条件规定；③ 解释 GaN 的动态 Rds(on)；④ 说明高 dv/dt 与寄生参数对测量的要求。
**知识点**：禁带宽度（Si≈1.12 eV，4H-SiC≈3.3 eV，GaN≈3.4 eV）→ 更高临界击穿场强 → 更薄漂移区 → 更低 `Rds(on)·面积`；高温、高频优势；SiC MOSFET 栅氧界面陷阱使 `Vth` 滞回与漂移，测试需**固定预置栅偏序列**；体二极管双极退化（概念）；GaN HEMT：E-mode/D-mode，无体二极管（反向导通经沟道，压降较高）；动态 Rds(on)（关态高压应力后短时升高，随时间恢复）；`dv/dt` 极高 → 共模电流与探头/夹具寄生更突出。
**实验 `WBGLab`（三个标签页）**
- ① 材料对比：选择耐压，显示相对比导通电阻条形图（**教学示意**）。
- ② Vth 滞回：栅压正向/反向扫描 `Id–Vgs`；控件：扫描速度、预置脉冲（幅度/时间）。
- ③ GaN 动态 Rds(on)：关态应力电压、应力时间、恢复延时 → `R(t)=R0·(1+k·e^(−t/τ))`。
- 任务卡：T1 为给定应用选合适材料；T2 设置预置序列使正反扫 Vth 差 ≤0.1 V；T3 读延时 1 µs 与 100 µs 处 Rds(on) 增幅；T4 选择测量延时避免低估。
**常见误区**：SiC/GaN 参数测法与 Si 完全一样；Vth 测一次就稳定；动态 Rds(on) 是静态参数。
**ATE 关联**：预置序列、延时窗口、低电感夹具直接决定测量可重复性。
**单测用例**：恢复模型 `t=τ` 时增幅为初值的 e⁻¹；预置前后 Vth 差随预置时间单调下降。

### PWR-08 综合：功率器件测试程序
**学习目标**：① 为 `VDUT-MOS1` 设计量产测试程序；② 平衡测试时间、成本与应力风险（UIS）；③ 用统计与离群值筛选；④ 导出 STDF 并按 Site 分析。
**测试流程（可由学生增删顺序）**
| 步骤 | 项目 | Bin（失败） |
|------|------|-------------|
| 1 | Kelvin 接触检查 | 2 |
| 2 | Igss | 3 |
| 3 | Vth | 6 |
| 4 | Idss（高压偏置） | 3 |
| 5 | BVdss | 4 |
| 6 | Rds(on)（脉冲） | 5 |
| 7 | Vsd | 5 |
| 8 | 抽样项：Qg / UIS | 7 |
**实验 `PowerProgramLab`**：虚拟群体 1000 颗（含 4 个 Site，Site 3 接触电阻偏大）；每项设置条件/限值/脉宽；输出 Bin Pareto、Rds(on) 与 Vth 的 Cpk、测试时间（UIS 耗时长）、UPH/COT（GEN-02）、潜在缺陷漏检估算（可启用 REL-07 的 PAT）、STDF。
- 任务卡：T1 在时间预算内覆盖全部必测项；T2 由 Site 3 的 Rds(on) 偏高判断为接触问题（Kelvin 检查应能发现）；T3 调 UIS 抽样率，权衡成本与漏检；T4 导出 STDF 并在 GEN-01 解析器核对。
**常见误区**：所有项都全测；接触问题与器件问题难以区分（应先做 Kelvin 检查）；脉宽越长越准。
**单测用例**：同 seed 可复现；STDF 往返后 Bin 计数一致。

---

## 4. 小测与完成标准（PWR 追加）
- 每课 ≥ 8 题，含概念辨析、数值计算（带容差）、情景分析；≥20% 多选、≥20% 数值题。
- [ ] §3 单测用例全部实现并通过。
- [ ] "教学示意""教学简化公式"处均有界面标注。
- [ ] `ScopeView`、`IVCurvePlot`、`SOAPlot` 提供读数摘要作为文字替代。
- [ ] 术语与下表一致。

## 5. 术语表种子
| en | zh |
|----|----|
| Power MOSFET / IGBT / SiC / GaN HEMT | 功率 MOSFET / IGBT / 碳化硅 / 氮化镓 HEMT |
| Breakdown voltage (BVdss) | 击穿电压 |
| On-resistance Rds(on) | 导通电阻 |
| Threshold voltage (Vth) | 阈值电压 |
| Body diode | 体二极管 |
| Gate charge (Qg, Qgs, Qgd) | 栅极电荷 |
| Miller plateau | 米勒平台 |
| Double pulse test (DPT) | 双脉冲测试 |
| Switching energy (Eon, Eoff) | 开关能量 |
| Reverse recovery (Qrr, trr) | 反向恢复 |
| Unclamped inductive switching (UIS) | 非钳位感性开关（雪崩测试） |
| Avalanche energy (EAS) | 雪崩能量 |
| Safe operating area (SOA) | 安全工作区 |
| Thermal impedance (Zth) / resistance (Rth) | 热阻抗 / 热阻 |
| Kelvin connection | 开尔文（四线）连接 |
| Guard / Triax | 保护环 / 三轴 |
| Dynamic Rds(on) | 动态导通电阻 |
| Known good die (KGD) | 已知良好裸片 |
