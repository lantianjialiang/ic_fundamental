# 课程审查与动画提案

范围为课程目录的 167 门课，覆盖 16 条教学轨道。逐课核对入口、页面源码和默认态标题与交互组件。164 门通过默认态静态渲染。PCB 入门、PCB 叠层和物理连接依赖 3D 库，本次 Node 环境加载失败，列为浏览器复测。正文和题目进行了定向抽查。全题库、所有控件组合和手机真机仍待验证。

## 建议先改的内容

| 优先级 | 课程 | 问题和改法 |
|---|---|---|
| 高 | F05 开短路测试 | [开头说明](../src/modules/fund/FundOpensPage.tsx#L28)将测试顺序和双保护二极管结构写成普遍规则。改成「本课以常见的双钳位 I/O 为例」，说明实际可用路径和测试顺序取决于引脚保护结构与测试流程。课内判断题也应明确采用本课 DUT。 |
| 高 | A11 ADC 动态参数 | [课末总结](../src/modules/ana/dynamicData.ts#L104)写成只有相干采样加 Blackman–Harris 才准确，实验却支持 Hann，并按窗调整保护频点和噪声带宽。应解释相干性与窗函数分别解决什么问题，并说明本课两种窗的取舍。[模型](../src/modules/ana/dynamicModel.ts#L130) |
| 中 | H05 眼图分析 | [上升时间推导](../src/modules/hs/eyeData.ts#L100)写死「HS-01」，目录显示「H01」。用稳定课程引用指向高速信号基础，让编号随目录变化。 |
| 中 | K01、K06 先进封装 | [K01](../src/modules/apk/ApkOverviewPage.tsx#L177)与 [K06](../src/modules/apk/ApkStackPage.tsx#L161)的中文误区提示把错误观点写成断言，英文则明确否定。直接改成条件句，点明哪些成本或良率条件会改变结论。 |

## 各轨道优化建议

| 轨道 | 优先优化与拟加动画 |
|---|---|
| 预备 | B03→B04 用同一颗 die 串起晶圆定位、切割、封装、CP 和 FT。每一步标出被测对象与能看到的缺陷。 |
| MOS 管与数字电路 | T04 与 T06 已有可调互动。把工作区与反相器输入电压对齐，拖动输入时同步显示上下管状态、输出和电流。T09 先选低边开关一例做可逐步追踪的路径。 |
| PCB 入门 | L04 把制造工序切换成同一块板的连续截面，重点显示钻孔后孔壁镀铜、内层如何接通。L08 给回流路径做参考平面连续／开槽对照。 |
| 基础 | D02–D04 串联一个引脚测量例，按测试机、通道、DIB、接触点、DUT 逐段点亮。D15 加记录时间线，把 PIR、PTR、PRR 和站点配对。 |
| 数字测试基础 | F05 做同一测试电流下正常、开路、短路三路对照，展示测量点和读数。F08 把比较器采样沿与数据稳定区放在同一时间轴。 |
| 制造与封装流程 | W01 先用全流程地图标出工艺检查、WAT、CP、FT 的观测对象。W06/W09 用接触点逐步移动说明探针卡、治具和飞针的任务差异。 |
| 模拟芯片 | A06/A07/A11 共用一个采样例，联动时域点、频谱与窗口。A12 让相位误差、控制量和 VCO 输出逐步走完 PLL 闭环。 |
| Memory | M02 连续显示位线预充、字线选通、感放判决和恢复。M05 把 March 指令的地址方向、读写动作、首个失败格放到同一时钟步。 |
| RF | R04 增加阻抗不连续处入射与反射的行进图。R07 扫输入功率时，将基波和 IM3 出现在频谱的位置与 IP3 外推图同步。 |
| 高速接口 | H05 在现有练习上加入「波形分段 → 按 UI 对齐 → 叠加 → mask 判定」四步。H04 把浴盆曲线的采样位置对应到同一条时间轴。 |
| 功率器件 | P03 对照两线与 Kelvin 取样点。P05 在现有曲线上联动回路、VDS、ID 和瞬时功率，显示积分窗移动时 Eon/Eoff 的变化。 |
| 传感器 / CIS | S03 展示曝光、转移、复位读数与差分采样。S04 把两张平场图变成差帧和 PTC 上的一个点，明确方差为何除以二。 |
| 可靠性 / 车规 | Q04 从原始失效与删失时间逐步构建 Weibull 图，保留删失标记；Q07 用同一晶圆图对比单颗 PAT、批次 SBA 和邻近筛选的判定对象。 |
| 硅光共封 | C03 把 MZI 两臂相位、合束端功率与传输曲线联动。C06 展示二维耦合功率地图和主动对准轨迹，比较起始点不同的结果。 |
| 先进封装 | K02/K03 优先做逐层截面，展示对准、键合界面、TSV 露铜与背面连接。K06 在同一批 die 上演示 W2W 和筛选后堆叠的出货数差异。 |
| 交互实验 | X02/X03 跟随一颗 DUT 经过接触检查、单项判定、分 bin 和站点统计。将当前流程阶段和引起失败的参数直接关联。 |

## 已接入课程的演示

| 课程 | 当前演示 |
|---|---|
| H05 | 原始波形、2 UI 切片、叠加和 mask 判定，可单选片段并调整带宽。 |
| F05 | 固定 −100 µA 对比正常、开路和对地短路，实训后有独立读数题。 |
| K03 | 同一截面展示盲孔、衬层、填铜、临时键合、背面减薄、露铜和背面互连。 |
| K02 | 选择混合键合，查看焊盘对齐、介质键合和退火后铜互连。 |
| H04 | 移动采样相位，浴盆图显示对应位置与 BER。 |
| D15 | 单步查看同一站点的 PIR、PTR 和 PRR，追踪单项读数和分箱。 |
| L08 | 已有连续参考平面和开槽对照，支持播放回流路径。 |

上方轨道表里其余提案仍待实现或逐项核对。

## 建议先评审的三段动画

1. **H05 眼图如何形成**。先播放原始比特波形，再暂停并按现有模型切成 2 UI 的波形片段，最后叠加。拖动带宽，比较边沿变化与 mask 命中的位置。验收时，学习者应能指出每条叠加轨迹来自原波形哪一段。
2. **F05 开短路为什么能测出来**。加固定电流，依次查看正常接触、开路到达钳位、短路时的低压降。允许单步观察，并用一个新场景判断读数对应的故障。
3. **K03 TSV 如何露铜**。同一截面从有盲孔的晶圆开始，切到临时键合、背面减薄、露铜、背面互连。标出当前加工面和导通时点，以免把 TSV 画成一开始就贯通的孔。

每段提供单步、暂停和静态关键帧。使用原有模型的课优先做图与参数联动，避免引入另一套判题数据。

## 逐课索引

「静态通过」仅说明默认态可生成页面。SVG 和输入控件数量用于定位内容，SVG 包含图标，输入控件不含按钮。各课的动画建议见上面的轨道表，未点名的课程保留在覆盖清单中供复核。

### 预备

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| B01 · 半导体产业 | 静态通过 | 1 / 0 | [源码](../src/modules/prep/PrepIndustryPage.tsx) |
| B02 · 半导体简史 | 静态通过 | 3 / 1 | [源码](../src/modules/prep/PrepHistoryPage.tsx) |
| B03 · 从硅到芯片 | 静态通过 | 4 / 0 | [源码](../src/modules/prep/PrepSiliconPage.tsx) |
| B04 · 封装与测试 | 静态通过 | 4 / 0 | [源码](../src/modules/prep/PrepPackagePage.tsx) |
| B05 · 电子元器件 | 静态通过 | 2 / 1 | [源码](../src/modules/prep/PrepPartsPage.tsx) |
| B06 · 数字电路基础 | 静态通过 | 4 / 1 | [源码](../src/modules/prep/PrepDigitalPage.tsx) |
| B07 · 基本定律与测量 | 静态通过 | 5 / 2 | [源码](../src/modules/prep/PrepMeasurePage.tsx) |

### MOS 管与数字电路

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| T01 · 预备：半导体与 RC 速览 | 静态通过 | 3 / 3 | [源码](../src/modules/mos/MosPrimerPage.tsx) |
| T02 · MOS 管是什么 | 静态通过 | 4 / 1 | [源码](../src/modules/mos/MosIntroPage.tsx) |
| T03 · 沟道是怎么形成的 | 静态通过 | 5 / 1 | [源码](../src/modules/mos/MosChannelPage.tsx) |
| T04 · 三种工作状态 | 静态通过 | 4 / 2 | [源码](../src/modules/mos/MosRegionPage.tsx) |
| T05 · MOS 管作为开关 | 静态通过 | 5 / 5 | [源码](../src/modules/mos/MosSwitchPage.tsx) |
| T06 · CMOS 反相器 | 静态通过 | 5 / 5 | [源码](../src/modules/mos/MosInverterPage.tsx) |
| T07 · 用 MOS 管搭逻辑门 | 静态通过 | 4 / 1 | [源码](../src/modules/mos/MosGatesPage.tsx) |
| T08 · 动态特性：为什么会有延时 | 静态通过 | 5 / 6 | [源码](../src/modules/mos/MosDynamicPage.tsx) |
| T09 · 典型应用电路 | 静态通过 | 1 / 0 | [源码](../src/modules/mos/MosAppsPage.tsx) |
| T10 · 非理想特性与可靠性 | 静态通过 | 6 / 5 | [源码](../src/modules/mos/MosRealPage.tsx) |
| T11 · 读数据手册与选型 | 静态通过 | 8 / 7 | [源码](../src/modules/mos/MosSelectPage.tsx) |

### PCB 入门

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| L01 · PCB 入门 | 浏览器复测 | — | [源码](../src/modules/pcb/PcbIntroPage.tsx) |
| L02 · 板材、铜箔与表面处理 | 静态通过 | 8 / 1 | [源码](../src/modules/pcb/PcbMaterialPage.tsx) |
| L03 · PCB 叠层 | 浏览器复测 | — | [源码](../src/modules/pcb/PcbStackPage.tsx) |
| L04 · PCB 制造流程 | 静态通过 | 2 / 3 | [源码](../src/modules/pcb/PcbFabPage.tsx) |
| L05 · 供应链与 SMT 生产 | 静态通过 | 6 / 2 | [源码](../src/modules/pcb/PcbSupplyPage.tsx) |
| L06 · PCB 设计流程 | 静态通过 | 4 / 12 | [源码](../src/modules/pcb/PcbFlowPage.tsx) |
| L07 · 基本概念：线宽、铺铜与阻抗 | 静态通过 | 7 / 9 | [源码](../src/modules/pcb/PcbBasicsPage.tsx) |
| L08 · 布局与布线原则 | 静态通过 | 4 / 0 | [源码](../src/modules/pcb/PcbLayoutPage.tsx) |
| L09 · 工具与实操：Altium | 静态通过 | 2 / 4 | [源码](../src/modules/pcb/PcbToolsPage.tsx) |
| L10 · DFM / DFA / DFT 与综合项目 | 静态通过 | 4 / 29 | [源码](../src/modules/pcb/PcbDfmPage.tsx) |

### 基础

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| D01 · 什么是半导体测试？ | 静态通过 | 16 / 0 | [源码](../src/modules/module00/Module00Page.tsx) |
| D02 · 物理连接 | 浏览器复测 | — | [源码](../src/modules/module01/Module01Page.tsx) |
| D03 · ATE 里面有什么？ | 静态通过 | 1 / 0 | [源码](../src/modules/module03/Module03Page.tsx) |
| D04 · 为什么测试不只是 0 和 1 | 静态通过 | 3 / 1 | [源码](../src/modules/module04/Module04Page.tsx) |
| D05 · 从 Datasheet 到 Test Specification | 静态通过 | 1 / 0 | [源码](../src/modules/module05/Module05Page.tsx) |
| D06 · DC Test | 静态通过 | 1 / 1 | [源码](../src/modules/module06/Module06Page.tsx) |
| D07 · Functional Test | 静态通过 | 1 / 0 | [源码](../src/modules/module07/Module07Page.tsx) |
| D08 · Timing 与 AC 参数 | 静态通过 | 2 / 2 | [源码](../src/modules/module08/Module08Page.tsx) |
| D09 · 测试向量开发 | 静态通过 | 4 / 2 | [源码](../src/modules/module10/Module10Page.tsx) |
| D10 · Scan Test | 静态通过 | 2 / 0 | [源码](../src/modules/module11/Module11Page.tsx) |
| D11 · 测试程序与排错 | 静态通过 | 1 / 0 | [源码](../src/modules/module12/Module12Page.tsx) |
| D12 · Yield、Characterization、Shmoo | 静态通过 | 1 / 0 | [源码](../src/modules/module14/Module14Page.tsx) |
| D13 · 虚拟 4-bit ALU 的 Test Program | 静态通过 | 1 / 0 | [源码](../src/modules/module15/Module15Page.tsx) |
| D14 · Latch-up 入口 | 静态通过 | 2 / 0 | [源码](../src/modules/module16/Module16Page.tsx) |
| D15 · STDF 与 Datalog | 静态通过 | 0 / 0 | [源码](../src/modules/gen/GenStdfPage.tsx) |
| D16 · Multi-site 与测试成本 | 静态通过 | 1 / 9 | [源码](../src/modules/gen/GenMultisitePage.tsx) |

### 数字测试基础

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| F01 · 电学与数字逻辑基础 | 静态通过 | 5 / 9 | [源码](../src/modules/fund/FundBasicsPage.tsx) |
| F02 · 晶圆、封装与测试设备 | 静态通过 | 7 / 3 | [源码](../src/modules/fund/FundAtePage.tsx) |
| F03 · 测试入门：DUT、PMU 与管脚电子 | 静态通过 | 12 / 11 | [源码](../src/modules/fund/FundIntroPage.tsx) |
| F04 · 器件规格书 | 静态通过 | 1 / 0 | [源码](../src/modules/fund/FundSpecPage.tsx) |
| F05 · 开短路测试 | 静态通过 | 1 / 1 | [源码](../src/modules/fund/FundOpensPage.tsx) |
| F06 · DC 参数测试 | 静态通过 | 2 / 4 | [源码](../src/modules/fund/FundDcPage.tsx) |
| F07 · 功能测试 | 静态通过 | 3 / 8 | [源码](../src/modules/fund/FundFuncPage.tsx) |
| F08 · AC 参数测试 | 静态通过 | 2 / 0 | [源码](../src/modules/fund/FundAcPage.tsx) |
| F09 · 器件表征 | 静态通过 | 2 / 3 | [源码](../src/modules/fund/FundCharPage.tsx) |
| F10 · 测试向量开发 | 静态通过 | 3 / 5 | [源码](../src/modules/fund/FundVectorPage.tsx) |
| F11 · 测试程序开发要点 | 静态通过 | 1 / 9 | [源码](../src/modules/fund/FundProgramPage.tsx) |
| F12 · 编写测试程序 | 静态通过 | 2 / 14 | [源码](../src/modules/fund/FundCreatePage.tsx) |
| F13 · 排错 | 静态通过 | 2 / 0 | [源码](../src/modules/fund/FundDebugPage.tsx) |
| F14 · 程序验证与文档 | 静态通过 | 2 / 9 | [源码](../src/modules/fund/FundQualifyPage.tsx) |
| F15 · CMOS 闩锁测试 | 静态通过 | 3 / 3 | [源码](../src/modules/fund/FundLatchPage.tsx) |
| F16 · Scan 测试原理 | 静态通过 | 5 / 4 | [源码](../src/modules/fund/FundScanPage.tsx) |

### 制造与封装流程

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| W01 · 芯片全流程总览：从设计到出货 | 静态通过 | 0 / 0 | [源码](../src/modules/mfg/MfgOverviewPage.tsx) |
| W02 · 晶圆制造基础：FEOL/BEOL、光刻与良率 | 静态通过 | 1 / 7 | [源码](../src/modules/mfg/MfgFabPage.tsx) |
| W03 · 光罩、MPW 与 NRE | 静态通过 | 0 / 9 | [源码](../src/modules/mfg/MfgNrePage.tsx) |
| W04 · 晶圆验收测试 WAT / PCM | 静态通过 | 2 / 7 | [源码](../src/modules/mfg/MfgWatPage.tsx) |
| W05 · CP 晶圆测试与良率管理 | 静态通过 | 1 / 4 | [源码](../src/modules/mfg/MfgCpPage.tsx) |
| W06 · 测试硬件的设计与制造：Probe Card、DIB、Socket | 静态通过 | 0 / 8 | [源码](../src/modules/mfg/MfgHwPage.tsx) |
| W07 · 封装基板基础与设计 | 静态通过 | 1 / 7 | [源码](../src/modules/mfg/MfgSubstratePage.tsx) |
| W08 · 封装基板制造工艺 | 静态通过 | 1 / 7 | [源码](../src/modules/mfg/MfgSubFabPage.tsx) |
| W09 · 基板测试：飞针测试与治具测试 | 静态通过 | 0 / 5 | [源码](../src/modules/mfg/MfgFlyingPage.tsx) |
| W10 · 封装组装与成品测试流程 | 静态通过 | 0 / 2 | [源码](../src/modules/mfg/MfgAssemblyPage.tsx) |
| W11 · 综合：良率模型、SPC 与量产爬坡 | 静态通过 | 1 / 10 | [源码](../src/modules/mfg/MfgRampPage.tsx) |

### 模拟芯片

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| A01 · 模拟芯片测试概述 | 静态通过 | 1 / 9 | [源码](../src/modules/ana/AnaOverviewPage.tsx) |
| A02 · 电压、电流与测量基础 | 静态通过 | 2 / 1 | [源码](../src/modules/ana/AnaMeasurePage.tsx) |
| A03 · ATE 模拟资源与负载板 | 静态通过 | 3 / 4 | [源码](../src/modules/ana/AnaResourcesPage.tsx) |
| A04 · PMU / SMU 与 FVMI / FIMV | 静态通过 | 2 / 1 | [源码](../src/modules/ana/AnaSmuPage.tsx) |
| A05 · 连续时间信号与频率 | 静态通过 | 2 / 5 | [源码](../src/modules/ana/AnaSignalPage.tsx) |
| A06 · 采样定理与 ADC 采样 | 静态通过 | 2 / 4 | [源码](../src/modules/ana/AnaSamplingPage.tsx) |
| A07 · 波形采集与 FFT | 静态通过 | 2 / 1 | [源码](../src/modules/ana/AnaFftPage.tsx) |
| A08 · 模拟引脚漏电与静态电流判定 | 静态通过 | 2 / 3 | [源码](../src/modules/ana/AnaLeakPage.tsx) |
| A09 · LDO 测试 | 静态通过 | 3 / 2 | [源码](../src/modules/ana/AnaLdoPage.tsx) |
| A10 · ADC / DAC 静态参数 | 静态通过 | 2 / 1 | [源码](../src/modules/ana/AnaStaticPage.tsx) |
| A11 · ADC 动态参数 | 静态通过 | 1 / 4 | [源码](../src/modules/ana/AnaDynamicPage.tsx) |
| A12 · PLL / 时钟测试 | 静态通过 | 1 / 4 | [源码](../src/modules/ana/AnaPllPage.tsx) |
| A13 · Trim 与 OTP | 静态通过 | 2 / 0 | [源码](../src/modules/ana/AnaTrimPage.tsx) |
| A14 · 测试限值与统计 | 静态通过 | 2 / 5 | [源码](../src/modules/ana/AnaStatsPage.tsx) |
| A15 · 综合：混合信号芯片测试程序 | 静态通过 | 2 / 0 | [源码](../src/modules/ana/AnaCapstonePage.tsx) |

### Memory

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| M01 · 存储器结构 | 静态通过 | 1 / 1 | [源码](../src/modules/mem/MemStructurePage.tsx) |
| M02 · 存储器读写流程 | 静态通过 | 1 / 1 | [源码](../src/modules/mem/MemRwPage.tsx) |
| M03 · 存储器故障模型 | 静态通过 | 1 / 1 | [源码](../src/modules/mem/MemFaultPage.tsx) |
| M04 · Pattern 与数据背景 | 静态通过 | 1 / 0 | [源码](../src/modules/mem/MemPatternPage.tsx) |
| M05 · March 测试 | 静态通过 | 1 / 1 | [源码](../src/modules/mem/MemMarchPage.tsx) |
| M06 · 存储器时序测试 | 静态通过 | 2 / 1 | [源码](../src/modules/mem/MemTimingPage.tsx) |
| M07 · DRAM 基础 | 静态通过 | 3 / 1 | [源码](../src/modules/mem/MemDramPage.tsx) |
| M08 · DDR / LPDDR 读写训练 | 静态通过 | 2 / 3 | [源码](../src/modules/mem/MemDdrPage.tsx) |
| M09 · BIST、冗余修复与 ECC | 静态通过 | 1 / 0 | [源码](../src/modules/mem/MemBistPage.tsx) |
| M10 · 存储器并行测试 | 静态通过 | 1 / 0 | [源码](../src/modules/mem/MemParallelPage.tsx) |
| M11 · 测试覆盖率与良率 | 静态通过 | 1 / 0 | [源码](../src/modules/mem/MemCoveragePage.tsx) |
| M12 · Bin 与失效分析 | 静态通过 | 1 / 0 | [源码](../src/modules/mem/MemBinPage.tsx) |
| M13 · 综合：存储器测试 | 静态通过 | 3 / 1 | [源码](../src/modules/mem/MemCapstonePage.tsx) |

### RF

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| R01 · RF 测试概述 | 静态通过 | 1 / 1 | [源码](../src/modules/rf/RfOverviewPage.tsx) |
| R02 · dB、dBm 与 dBc | 静态通过 | 1 / 7 | [源码](../src/modules/rf/RfDbPage.tsx) |
| R03 · RF 测试系统与链路 | 静态通过 | 1 / 3 | [源码](../src/modules/rf/RfSystemPage.tsx) |
| R04 · 阻抗匹配与 S 参数 | 静态通过 | 1 / 2 | [源码](../src/modules/rf/RfSparamPage.tsx) |
| R05 · 增益与插入损耗 | 静态通过 | 1 / 3 | [源码](../src/modules/rf/RfGainPage.tsx) |
| R06 · 输出功率与 P1dB | 静态通过 | 1 / 4 | [源码](../src/modules/rf/RfP1dbPage.tsx) |
| R07 · 线性度：IP3 与 IMD | 静态通过 | 1 / 4 | [源码](../src/modules/rf/RfIp3Page.tsx) |
| R08 · 噪声系数 | 静态通过 | 2 / 4 | [源码](../src/modules/rf/RfNfPage.tsx) |
| R09 · 谐波与杂散 | 静态通过 | 1 / 3 | [源码](../src/modules/rf/RfHarmPage.tsx) |
| R10 · 相位噪声 | 静态通过 | 1 / 3 | [源码](../src/modules/rf/RfPhaseNoisePage.tsx) |
| R11 · 调制基础：I/Q 与星座图 | 静态通过 | 1 / 2 | [源码](../src/modules/rf/RfModulationPage.tsx) |
| R12 · EVM 与 ACPR | 静态通过 | 3 / 1 | [源码](../src/modules/rf/RfEvmPage.tsx) |
| R13 · RF 校准与误差 | 静态通过 | 2 / 3 | [源码](../src/modules/rf/RfCalPage.tsx) |
| R14 · 综合：RF 收发器测试 | 静态通过 | 1 / 3 | [源码](../src/modules/rf/RfCapstonePage.tsx) |

### 高速接口

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| H01 · 高速信号基础 | 静态通过 | 1 / 1 | [源码](../src/modules/hs/HsBasicsPage.tsx) |
| H02 · 传输与信号完整性 | 静态通过 | 1 / 2 | [源码](../src/modules/hs/HsChannelPage.tsx) |
| H03 · 时钟与数据时序 | 静态通过 | 1 / 4 | [源码](../src/modules/hs/HsTimingPage.tsx) |
| H04 · 抖动与噪声 | 静态通过 | 2 / 2 | [源码](../src/modules/hs/HsJitterPage.tsx) |
| H05 · 眼图分析 | 静态通过 | 0 / 2 | [源码](../src/modules/hs/HsEyePage.tsx) |
| H06 · 高速接口测试 | 静态通过 | 2 / 4 | [源码](../src/modules/hs/HsInterfacePage.tsx) |
| H07 · ATE 高速测试的限制 | 静态通过 | 1 / 3 | [源码](../src/modules/hs/HsAteLimitPage.tsx) |
| H08 · 综合：高速接口测试 | 静态通过 | 2 / 0 | [源码](../src/modules/hs/HsCapstonePage.tsx) |

### 功率器件

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| P01 · 功率器件概述与基础 | 静态通过 | 2 / 14 | [源码](../src/modules/power/PwrSelectorPage.tsx) |
| P02 · 静态参数测试：Vth、Rds(on)、BVdss、漏电 | 静态通过 | 0 / 3 | [源码](../src/modules/power/PwrStaticPage.tsx) |
| P03 · 开尔文连接、大电流与高电压测量 | 静态通过 | 1 / 3 | [源码](../src/modules/power/PwrKelvinPage.tsx) |
| P04 · 动态参数：栅极电荷、电容与开关时间 | 静态通过 | 2 / 8 | [源码](../src/modules/power/PwrGatePage.tsx) |
| P05 · 双脉冲测试与开关能量 | 静态通过 | 2 / 8 | [源码](../src/modules/power/PwrDptPage.tsx) |
| P06 · 雪崩（UIS）、SOA 与热阻 | 静态通过 | 3 / 10 | [源码](../src/modules/power/PwrUisPage.tsx) |
| P07 · 宽禁带器件：SiC 与 GaN 的测试挑战 | 静态通过 | 1 / 0 | [源码](../src/modules/power/PwrWbgPage.tsx) |
| P08 · 综合：功率器件测试程序 | 静态通过 | 2 / 10 | [源码](../src/modules/power/PwrProgramPage.tsx) |

### 传感器 / CIS

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| S01 · 传感器测试概述 | 静态通过 | 1 / 8 | [源码](../src/modules/sns/SnsOverviewPage.tsx) |
| S02 · 光电基础：光子、量子效率与噪声 | 静态通过 | 1 / 8 | [源码](../src/modules/sns/SnsPhotonPage.tsx) |
| S03 · CMOS 图像传感器：像素与读出链 | 静态通过 | 1 / 8 | [源码](../src/modules/sns/SnsPixelPage.tsx) |
| S04 · 光子传递曲线（PTC）与转换增益 | 静态通过 | 1 / 6 | [源码](../src/modules/sns/SnsPtcPage.tsx) |
| S05 · 暗场测试：暗电流、DSNU 与热像素 | 静态通过 | 2 / 7 | [源码](../src/modules/sns/SnsDarkPage.tsx) |
| S06 · 亮场测试：PRNU、线性度与缺陷像素 | 静态通过 | 2 / 9 | [源码](../src/modules/sns/SnsFlatPage.tsx) |
| S07 · 颜色、光谱响应与光学测试系统 | 静态通过 | 0 / 10 | [源码](../src/modules/sns/SnsOpticalPage.tsx) |
| S08 · MEMS 加速度计测试基础 | 静态通过 | 0 / 8 | [源码](../src/modules/sns/SnsAccelPage.tsx) |
| S09 · 综合：CIS 量产测试程序 | 静态通过 | 1 / 9 | [源码](../src/modules/sns/SnsProgramPage.tsx) |

### 可靠性 / 车规

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| Q01 · 可靠性基础与浴盆曲线 | 静态通过 | 3 / 7 | [源码](../src/modules/qual/RelBathtubPage.tsx) |
| Q02 · 失效机理与加速模型 | 静态通过 | 2 / 11 | [源码](../src/modules/qual/RelAccelPage.tsx) |
| Q03 · 可靠性试验方法与样本量 | 静态通过 | 2 / 7 | [源码](../src/modules/qual/RelStressPage.tsx) |
| Q04 · 寿命数据分析：Weibull 与 FIT | 静态通过 | 1 / 6 | [源码](../src/modules/qual/RelWeibullPage.tsx) |
| Q05 · Burn-in 与早期失效筛选 | 静态通过 | 2 / 10 | [源码](../src/modules/qual/RelBurnInPage.tsx) |
| Q06 · 车规基础：AEC-Q100 框架与温度等级 | 静态通过 | 2 / 15 | [源码](../src/modules/qual/RelAutoPage.tsx) |
| Q07 · 零缺陷测试策略：PAT、SBA 与邻近筛选 | 静态通过 | 1 / 10 | [源码](../src/modules/qual/RelPatPage.tsx) |
| Q08 · 综合：车规产品量产测试流程 | 静态通过 | 2 / 17 | [源码](../src/modules/qual/RelFlowPage.tsx) |

### 硅光共封

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| C01 · 硅光与共封装光学概述 | 静态通过 | 1 / 2 | [源码](../src/modules/pic/PicOverviewPage.tsx) |
| C02 · 光学基础：波长、功率、dB 与损耗 | 静态通过 | 1 / 7 | [源码](../src/modules/pic/PicUnitsPage.tsx) |
| C03 · 硅光基本器件：波导、MZI 与环形谐振器 | 静态通过 | 1 / 4 | [源码](../src/modules/pic/PicDevicePage.tsx) |
| C04 · 光调制器与光探测器 | 静态通过 | 1 / 4 | [源码](../src/modules/pic/PicModPage.tsx) |
| C05 · 光学测试基础：光源、功率计与波长扫描 | 静态通过 | 1 / 6 | [源码](../src/modules/pic/PicSweepPage.tsx) |
| C06 · 光纤耦合与对准：光栅、边缘耦合与主动对准 | 静态通过 | 1 / 6 | [源码](../src/modules/pic/PicAlignPage.tsx) |
| C07 · 晶圆级光电测试与参数提取 | 静态通过 | 1 / 6 | [源码](../src/modules/pic/PicCutbackPage.tsx) |
| C08 · 光链路测试：光眼图、ER/OMA 与 BER | 静态通过 | 2 / 7 | [源码](../src/modules/pic/PicLinkPage.tsx) |
| C09 · 综合：CPO 测试流程与成本 | 静态通过 | 1 / 6 | [源码](../src/modules/pic/PicFlowPage.tsx) |

### 先进封装

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| K01 · 先进封装概述：为什么需要 chiplet 与异构集成 | 静态通过 | 2 / 4 | [源码](../src/modules/apk/ApkOverviewPage.tsx) |
| K02 · 封装互连基础：从引线键合到混合键合 | 静态通过 | 0 / 3 | [源码](../src/modules/apk/ApkBondPage.tsx) |
| K03 · TSV 与晶圆减薄 | 静态通过 | 0 / 7 | [源码](../src/modules/apk/ApkTsvPage.tsx) |
| K04 · HBM：堆叠 DRAM 的结构、接口与带宽 | 静态通过 | 1 / 4 | [源码](../src/modules/apk/ApkHbmPage.tsx) |
| K05 · 2.5D 集成：中介层与 CoWoS 类结构 | 静态通过 | 0 / 6 | [源码](../src/modules/apk/ApkInterposerPage.tsx) |
| K06 · 3D 集成：堆叠、混合键合与良率连乘 | 静态通过 | 0 / 6 | [源码](../src/modules/apk/ApkStackPage.tsx) |
| K07 · Chiplet 与 Die-to-Die 互连 | 静态通过 | 0 / 4 | [源码](../src/modules/apk/ApkD2dPage.tsx) |
| K08 · 热、机械与可靠性 | 静态通过 | 0 / 6 | [源码](../src/modules/apk/ApkThermalPage.tsx) |
| K09 · 综合：先进封装测试——KGD/KGS、DFT 与流程成本 | 静态通过 | 0 / 5 | [源码](../src/modules/apk/ApkFlowPage.tsx) |

### 交互实验

| 课程 | 默认态 | 图形 / 输入控件 | 页面源码 |
|---|---|---:|---|
| X01 · 交互实验 | 静态通过 | 1 / 4 | [源码](../src/modules/module17/Module17Page.tsx) |
| X02 · 虚拟 ATE 操作系统 | 静态通过 | 2 / 13 | [源码](../src/modules/vate/VatePage.tsx) |
| X03 · ATE 产线模拟器 | 静态通过 | 0 / 21 | [源码](../src/modules/atesim/AteSimPage.tsx) |


## 技术参考

- [TI：如何解读标准逻辑器件数据手册](https://www.ti.com/lit/an/szza036c/szza036c.pdf)，用于核对 F05 中的钳位路径与 Ioff 条件。
- [Analog Devices AN-835：高速 ADC 测试](https://www.analog.com/en/resources/app-notes/an-835.html)，用于核对 A11 中相干与非相干 FFT 测试以及窗函数的使用。
