# 课程审查与动画提案

## 教学图示整改进度

这次实施覆盖「优先重做的交互图与概念解释」和「其余已定位的教学缺口」，按涉及课程拆成 **63 项**。第三张公式表仍可作为相应条目的讲解参考。估算含阅读、实现、浏览器验证与记录，每项通常约 **2,000–3,500 token**，全量约 **130,000–220,000 token**。首批 W09、W11、W12 约 **9,000–15,000 token**；后续按课程逐项更新。估算用于安排批次，客户端实际剩余额度以界面为准。

**恢复位置：** B01 公司模式。下一项 B03/B04 裸片追溯。每项完成后先写入下面的记录，再打开下一项。验收先确认交互实际改变学生要观察的结构、连接、信号或数据，再检查常用宽度及回归。

| 清单 | 进度 | 还需实施的课程 |
|---|---:|---|
| 优先重做 | 14 / 14 | 已全部验收 |
| 其余教学缺口 | 0 / 49 | B01、B03、B04；T05、T06、T08、T11；L04、L05；D01、D11、D16；F02、F07、F15、F16；W01、W05、W13；A06、A07、A09、A10、A11、A12；M02、M04、M05；R04、R07、R08；H02、H08；P05、P07；S07、S08；Q02、Q04、Q07；C05、C08；K04、K06、K07、K08、K09；X02、X03 |

| 已完成 | 课堂验收与验证 |
|---|---|
| W09 三类封装 | 原有三张卡片现在切换引线框架、有机积层 BGA、带盖陶瓷 LGA 的截面。三个追踪按钮共用 PCB 和裸片位置，从焊盘经过内部互连到外部端子；有机层的原有局部观察保留在有机卡片下。浏览器在 1280 与 390 px 逐一走完三类路径，核对阶段、端子说明和图宽。TypeScript 和多语言检查通过。 |
| W11 飞针与针床 | 同一块四网络板可切换移动的双针与四针同时接触的治具，区分「已接触」和「当前选通」。A–D 桥接可开关，全对有低阻读数，相邻计划不执行该对。浏览器在 1280 与 390 px 验证接触数量、落点、短路检出、漏过和无桥接场景。 |
| W12 组装工序 | 引线键合与倒装各有七步截面。减薄显示背面变化和整片硅，切割画出贯穿硅的切割道。倒装依次显示未回流间隙、凸点接通、底填。植球和打标分别标在底面和顶面。浏览器在 1280 与 390 px 逐个检查两条路线的十四个工序状态。 |
| F06 DC 电流测法 | 共用波形显示 Gross、Static、IDDQ、Dynamic 的取样位置。十二脚接线跟随串行、并行或并联切换。并联先读总电流，切换为逐脚复测后才呈现单脚读数；注明同向电流假设。浏览器在 1280 与 390 px 验证四个窗口、三类接线、A5 的 35 µA 和良品筛查。 |
| F08 AC 六类参数 | 在卡片下加上联动波形，游标、差值和判定随滑块变化。传输延迟区分实际输出边与采样 Strobe，输出使能区分关断后的高阻与 VREF 负载。浏览器在 1280 与 390 px 对每类参数跨越示例边界，并检查两种 OE 方向。 |
| P02 功率器件静态接线 | 五类参数共用 G、D、S 位置。图中显示 G–S、D–S 或 G–D 短接，四线 Rds(on) 的独立栅偏置、Force 与 Sense，以及各档的实时 compliance。浏览器在 1280 与 390 px 验证五种连线、四线取样，以及击穿扫描被电压限制截断。 |
| S03 4T 像素 | 同一像素可分五步看电子存入 PPD、复位 FD、取复位样本、经 TX 搬到 FD、取信号样本。截面跟随时序游标，显示光电子数和理想电压差的代入，以及 CDS 用哪两个点相减。浏览器在 1280 与 390 px 验证五阶段和零光电子的电荷及电压响应。 |
| S04 PTC | 曝光点控件联动两张原帧、差帧和 PTC 散点。三张共用同一个 ROI，实时把均值暗场修正和差帧方差除以二代入坐标。单帧模式同位置显示 PRNU 留在方差里的区别，并说明用线性单位拟合斜率。浏览器在 1280 与 390 px 验证两种模式、方差数值、ROI 更新和曝光点范围收缩。 |
| C01 CPO 架构与测试 | 在八个角色中定位器件，可单独追踪高速电数据、连续光载波或低速偏置控制。共封装边界与光纤出口画在同一图。六个测试项各显示仪表、测试对象、连接和读数。浏览器在 1280 与 390 px 验证角色定位、三条路径及六种接线。 |
| C03 MZI 与微环 | 谱图游标联动两臂相位箭头与透射率，定位按钮可跳到当前扫波范围内的相长峰、相消谷。微环图标出直波导、耦合口与环绕相位。浏览器在 1280 与 390 px 验证峰、谷、连续移动游标与微环谐振定位。 |
| C06 光栅与边缘耦合 | 同屏比较表面斜入射和端面入射，位移控件沿各自耦合面移动光纤。模式重叠图跟随位移和半径，把 Δ/w 代入附加损耗。浏览器在 1280 与 390 px 检查两种方向、正负位移及 Δ = w 时的 4.343 dB。 |
| K01 先进封装结构 | 2D、2.5D、3D 和模封扇出共用板端位置和观察方向。可开关信号路径，区分横向中介层、竖向 TSV 和 RDL 扇出。定位焊球练习换成同款 2.5D 截面。浏览器在 1280 与 390 px 检查四种结构及定位练习。 |
| K02 四种互连 | 焊线、C4、铜柱加焊料微凸点和混合键合均有电流路径。混合键合仍可分步播放，只有铜接通后才出现连续金线。面阵模式增加 1 mm 方形视图、节距和密度代入。浏览器在 1280 与 390 px 验证四种截面、三档面密度和三个键合阶段。 |
| K05 中介层 | 固定 GPU、HBM 和 PCB 位置，比较整片硅、整片 RDL 与局部硅桥。芯粒互通或到系统板的目标跨结构选择时保持不变。浏览器在 1280 与 390 px 验证三种中介范围、不同的板级路径及目的端联动。 |

## 2026-11-22 全站教学图示复审 · 待 review

这次以三个问题判断是否要重做：学生能否从图上辨认对象与边界；切换条件后能否看到导致结果改变的路径、结构或过程；能否指着图说出公式的输入、中间量和结果。审阅范围是现行 16 条轨道、169 门课。这轮重新打开全部课程，完成 328 次代表性操作，并结合图注、课文和图组件复核重点缺口。页面未提供适用控件时以现有讲解与示意为依据。每课取代表状态，较复杂的实验只对相关章节定向复点。

可作为参考的现有段落包括 B07 两线与四线的测点对照、W08 三种针型同步初触与抬升、W10 面板与截面联动算例、H05 从时域切片到叠加眼图。它们都让学生操作后能直接指出对象或量怎样变了。

### 一、优先重做的交互图与概念解释

| 课程与位置 | 当前图对学生的帮助停在哪 | 补完后的课堂验收 |
|---|---|---|
| [W09 封装基板基础 · 三类结构](../src/modules/mfg/MfgSubstratePage.tsx#L159) | 三选项能换文字，下方一直是有机积层。学生无法分辨引线框架与陶瓷的导通结构，也容易把三者都想成积层板。 | 在同一尺度上画芯片、封装端子和一根信号。切换类别后，让学生从芯片焊盘一路指到外部端子。 |
| [W11 飞针与治具 · 接触和绝缘测试](../src/modules/mfg/MfgFlyingPage.tsx#L124) | 缺陷图能看开、短、高阻，成本曲线能看交点。中间缺了「为什么飞针要移动、针床如何一次落到多个点」。 | 同一块板切换双针逐点和针床同时接触，标出实际被测的两端。再切全对和相邻，让学生指出一个两种方案检测结论不同的跨网短接。 |
| [W12 组装 · 减薄到打标](../src/modules/mfg/AssemblySection.tsx) | 减薄和切割用同一张图，植球和打标也用同一张图。进度动了，结构的因果变化没出现。 | 每一步显示当步加工的对象，包括厚度、切割道、已分离裸片、连接方式、底填、植球与打标。让学生说明什么时候才能拿起单颗裸片。 |
| [F06 DC · 四种 IDD、三种输入电流测法](../src/modules/fund/FundDcPage.tsx#L329) | IDDQ 有单独读数图，Gross、Static、Dynamic 无共用时间轴。串行、并行、并联能换数字和表格，PMU 接法仍靠读文。 | 在同一波形标出各自在哪个状态或周期读电流；给同一组引脚切换 PMU 接线，让学生预测还能否定位漏电的那一脚。 |
| [F08 AC · 六类参数](../src/modules/fund/FundAcPage.tsx#L159) | 参数卡片换「怎么测、怎么判」，有单独 SRAM 波形，但所选参数不对应到图上具体的边、窗或负载状态。 | 逐项高亮参考边和测量边。加上可拖动的时钟、数据或 Strobe，让学生对比移动哪一条边会首先影响 setup、hold 或 tPD 的判定。 |
| [P02 功率器件静态测试 · 参数选择](../src/modules/power/PwrStaticPage.tsx#L236) | Rds(on) 有温升误差曲线。切到 Vth、BVdss 或漏电，其余状态主要呈现控件和读数，学生看不到仪表换接到了哪里。 | 固定管脚位置，依次标 Force、Measure、短接点与 compliance。把四线 Rds(on)、定电流 Vth、击穿与两种漏电的回路对齐比较。 |
| [S03 4T 像素](../src/modules/sns/SnsPixelPage.tsx) · [S04 PTC](../src/modules/sns/SnsPtcPage.tsx) | S03 的时序能看开关什么时候跳变，缺能跟随的电荷与两次采样。S04 的帧图和散点齐全，差帧、ROI 统计与某个散点之间的关系仍要靠文字拼起来。 | 用一组固定曝光在 4T 截面逐步显示复位、曝光、转移和两次采样。切到 PTC 时保留同一 ROI，把两帧差、方差除以二和一个散点连起来。 |
| [C01 CPO 概览 · 八个角色和测点](../src/modules/pic/PicOverviewFig.tsx#L21) | 角色图由并列方框组成，点选只定位块。学生看不出 ASIC 和 EIC 之间走的是电，光源到 PIC、FAU 到光纤之间走的是光。 | 用不同线型在同一张架构图标出电、光、控制，并跟着一个信号划过封装边界。点一个测试项时同时显示仪器接哪里、实际测什么。 |
| [C03 MZI 与微环](../src/modules/pic/PicDevicePage.tsx) · [C06 光纤耦合](../src/modules/pic/PicAlignPage.tsx) | C03 有扫波长曲线，缺两臂相位如何在输出端合成的图；C06 已能看主动搜索热图，光栅和边缘的入光方向仍只在文字里。 | C03 切到相长或相消时同时指到两臂、输出端、谱线位置；微环显示波导与环的耦合位置。C06 平行对照顶部光栅入射和端面入射，移动光纤时显示偏移方向。 |
| [K01 先进封装结构](../src/modules/apk/ApkOverviewPage.tsx#L130) · [K02 四种互连](../src/modules/apk/ApkBondPage.tsx#L155) · [K05 中介层](../src/modules/apk/ApkInterposerPage.tsx#L143) | K01 公用色条截面没有表达芯粒并排或叠放；K02 仅混合键合有分步图；K05 能列材料参数，但分不出整片细线层和局部硅桥。 | 固定芯粒、基板和互连的观察方向。K01 能指出芯粒放在哪；K02 能指出电流从焊线、焊料或铜界面怎样跨层；K05 能沿两颗芯粒之间的一根线看出硅、RDL 或桥的范围。 |

### 二、其余已定位的教学缺口

| 轨道与复审覆盖 | 课程位置与可执行补法 |
|---|---|
| 预备 B01–B07 | **B01 公司模式**已有产业路径，四类公司可直接高亮其自做、外包的环节。**B03/B04**各有图，保留同一颗编号 die 和追溯数据，从 CP、切割一路走到 FT。 |
| MOS T01–T11 | **T05**用同一高边负载比较自举、电荷泵、PMOS 的栅源参考及供电条件。**T06**用同一反相器区分漏电、短路和充放电路径。**T08**波形有了，切驱动器时把充放电路径与波形对应起来。**T11**综合任务选高边、低边和感性负载时，按选择更新接线和续流路径。 |
| PCB L01–L10 | **L04**工序有步骤图，钻孔、化学铜与镀铜需要保持同一孔壁位置，让学生看见何时真正导通。**L05**文件卡片以同一块板的 Gerber、钻孔、BOM 和坐标件为例，对上板面上的对应对象。 |
| 基础 D01–D16 | **D01**四类芯片换成同一测试链路中的四种激励和期望读数。**D11**排错案例中固定一个 Pin，沿流程序列标首次异常节点和对应波形。**D16**给最低成本点旁边加一次多 Site 测试的分段时间条，区别换位、并行、逐站串行和重测。 |
| 数字测试 F01–F16 | **F02**周边设备定位到 CP 和 FT 的实体链路。**F07**并行向量与 Scan 及四类 DFT，沿输入、存储和比较端从头走一次。**F15**三种触发在已有 PNPN 剖面上高亮注入路径。**F16**以同一组向量并排演示引脚存储与串行移位，标单次移位对应的位。 |
| 制造 W01–W13 | **W01**关键路径时间轴已到位，让 WAT、CP、FT 按阶段标识「测试键、裸片、封装成品」。**W05**把独立的 site 方格叠到同一晶圆图，示例比较完整落针与圆边空槽。**W13**为三种缺陷分布共用一片示意晶圆，再并排读良率。 |
| 模拟 A01–A15 | **A06/A07/A11**统一一份样本，把采样点、加窗、FFT 邻近频点和噪声积分串起来。**A09**在线性调整率、负载调整率、PSRR 切换时点亮实际改变的输入和保持不变的量。**A10**点击一个码就回指其区间、命中数、DNL 和累加 INL。**A12**把锁定曲线与鉴相器、环路滤波器、VCO 及反馈分频器联动。 |
| Memory M01–M13 | **M02**在已有管脚波形基础上同步显示字线、位线、选中单元及感放。**M04/M05**已有覆盖柱和地址步进，补具体哪一次写入让相邻位翻转、哪一次读才查到它；未执行、当前、首 Fail 用稳定图例。 |
| RF R01–R14 | **R04**Smith/反射读数之外，显示同一脉冲入射与反射、开路和短路的符号差别。**R07**在频谱与功率扫描图上指向同一个基波/IM3 测点，再读外推交点。**R08**的级联图可保留，Y 因子小节补热/冷噪声源切换、同一读数端和线性比值。 |
| 高速接口 H01–H08 | **H02**已有波形和数值，补传输线上失配反射的来回位置，帮助区分终端反射和带宽不足。**H08**保持预算矩形的用途，并把它与实际扫描点和眼 mask 对齐，让学生知道哪里是预算、哪里是测得或模型外推。 |
| 功率 P01–P08 | **P05**双脉冲电路与归一化波形分开放，补同一时间轴的回路、VDS、ID 和瞬时功率，区分开通、关断与反向恢复的积分区。**P07**并排展示 SiC 预置/扫栅和 GaN 加应力/延时测量的顺序，和当前两类误差曲线互相标记。 |
| 传感器 S01–S09 | **S07**光源选项主要落在读数。标出均匀光、参考探测器、样品与像素校正路径。**S08**用姿态和重力投影对照翻转、转台和静电自检，让学生分辨物理激励和内部激励的测量意义。 |
| 可靠性 Q01–Q08 | **Q02**切换加速机理时，把应力作用位置连到可观察的失效现象与适用加速项。**Q04**从原始时长、删失、排序到概率点逐步画出。**Q07**在同一晶圆图示范单颗、整批与邻近三种判定，并显示它们各自改变哪个对象。 |
| 硅光 C01–C09 | **C05**把实测功率、空链参考与归一化结果并列，明确扫频时每条线来自哪次测量。**C08**横向对照一个光眼里的高、低和平均光功率，再用同一个点连到接收电流、噪声与 BER。 |
| 先进封装 K01–K09 | **K04**堆叠色条可定位层，接着在同一剖面高亮 BIST、修复、ECC 和测试访问的实际角色。**K06**用同一批 die 对照固定配对与筛选后挑片。**K07**把片内、封装内和过板 SerDes 路径画在同一封装、PCB边界。**K08**为不同热材料层补热流与温降。**K09**给每个测试插入点画当时组装到哪一步、可从哪接触。 |
| 实验 X01–X03 | **X02/X03**已有工作台、单项结果和批量分布。挑一颗固定 DUT，把激励、实测、限值、首次失败与 Bin 用一条线串起来；X03 的晶圆热点能回到该颗数据和失败项。 |

### 三、公式与概念的补讲清单

这里的问题是学生知道公式或看见结果，却仍难以从图和当前输入复算，或无法说明这一项为什么出现。

| 课程与位置 | 当前理解缺口 | 建议用一组输入走完 |
|---|---|---|
| [T02 MOS 通断](../src/modules/mos/MosIntroPage.tsx) · [T04 工作区](../src/modules/mos/MosRegionPage.tsx) | T02 图注有平方律，电流读数还受负载约束。T04 公式、截面和曲线已经齐全，学生需要在同一位置读出公式切换边界。 | T02 画负载线与器件曲线交点，T04 让学生拖 VDS 越过 VGS−Vth，指出沟道状态和为什么换公式。 |
| [L07 线宽](../src/modules/pcb/data/pcbBasicsModel.ts#L13) · [W09 微带](../src/modules/mfg/MfgSubstratePage.tsx#L190) | L07 经验式的截面积到宽度需要换算。W09 虽有截面和变量解释，公式块主要给最终 Ω 值。 | L07 先把宽×厚换为公式所用的 mil²。W09 把截面上 w、h、t 的当前值代入，框出对数中的无量纲比，并观察单独增大 h 的影响。 |
| [D16 多站点](../src/modules/gen/model/multisite.ts#L3) · [W05 落针](../src/modules/mfg/MfgCpPage.tsx) | D16 知道 UPH 却容易混淆 N 倍并行与 N 倍串行时间。W05 用理想装组公式，需要把取整对应到实际最后一组。 | D16 用相同四 Site 画出一轮并行、串行和重测时间；W05 用奇数颗 die 配 2×2 针阵，数完整组、空槽和落针次数。 |
| [F06 DC 漏电](../src/modules/fund/FundDcPage.tsx#L373) · [F08 AC 参数](../src/modules/fund/FundAcPage.tsx#L159) | 并联检测有总电流读数，学生不容易知道求和中已经丢了什么信息。AC 里需分清触发边、测试边、真实门限和采样时刻。 | F06 用 A5 的漏电对照单脚表与并联总读数，解释何时需要逐脚复测。F08 用同一波形画两个游标并显示相减顺序。 |
| [A10 ADC 静态](../src/modules/ana/AnaStaticPage.tsx#L98) · [A11 ADC 动态](../src/modules/ana/dynamicData.ts#L104) | A10 的直方图与 DNL/INL 同屏，缺一档从命中数到累计误差的手算。A11 有 ENOB 公式，实验使用的 0.9 FS 补偿仍藏在说明。 | A10 点某码后显示「观察命中数 ÷ 理想命中数 − 1」及累计到此码；A11 用当前 SINAD 加入 0.92 dB 补偿，和满量程算例并排。 |
| [M11 覆盖率与良率](../src/modules/mem/memCoverageModel.ts#L176) · [K06 KGD 后堆叠](../src/modules/apk/ApkStackPage.tsx) | 缺陷检出、测试通过和通过中仍有坏品的分母不一样，直接读三个百分比容易串。 | 用每 1,000 颗的流向或期望数量展开模型，给每个百分比写分子/分母。先算 KGD 后好件概率，再连乘堆叠与键合。 |
| [R08 噪声系数](../src/modules/rf/RfNfPage.tsx#L88) · [R10 相位噪声](../src/modules/rf/rfPhaseNoiseData.ts#L95) | R08 学生看到热/冷两项 dBm 和线性 Y，中间换算藏起来。R10 曲线是 dBc/Hz，积分先换线性，这个转换应在面积图里可见。 | R08 展示热减冷得到的 dB 差、线性 Y、线性 NF 到 dB。R10 同屏标积分上下限、线性面积、双侧系数及最后的时间规格。 |
| [H04 抖动](../src/modules/hs/hsJitterData.ts#L105) · [H08 综合](../src/modules/hs/HsCapstonePage.tsx) | Q⁻¹、σ 和 DJ 分别进入哪段眼宽，靠分开的文字不容易读。 | 用 DJ 固定时的双尾，移动目标 BER，逐块显示确定性宽度和两侧 RJ 增量，再从 UI 中扣除并核对单位。 |
| [P05/P06 开关与雪崩能量](../src/modules/power/pwrUisData.ts#L151) | 看得到电压、电流和 E 读数，仍难区分开关积分量、初始电感储能、供电额外做功。 | P05 在功率曲线剪切并积分，和简化式各项一一对应。P06 从钳位电压、净降压及三角形电流面积推到 BV/(BV−VDD)。 |
| [S04 差帧](../src/modules/sns/snsPtcData.ts#L32) · [S07 光学校准](../src/modules/sns/snsOpticalData.ts) | S04 为何差帧要除以二、何时斜率倒数才是 K，要在图里对应。S07 的 PRNU 平方和与传输时间有结果，前提和单位链难从读数得到。 | S04 用同一 ROI 两帧证明哪一部分相消，解释独立同方差和拟合区间。S07 单独调光源不均匀与像素噪声，再逐项代入字节和 bit/s。 |
| [Q03 器件小时与 FIT](../src/modules/qual/relStressData.ts#L148) · [Q04 Weibull 拟合](../src/modules/qual/relWeibullModel.ts#L70) | Q03 公式、测试时长和置信水平分散；Q04 结果图已经给拟合线，学生仍未经历原始数据如何变为纵轴概率。 | Q03 把样本×小时×AF 换成等效器件小时，再从零失效事件的置信上限换 FIT。Q04 用少量样本逐行走完秩、调整秩、双对数和斜率。 |
| [C03/C06 硅光](../src/modules/pic/PicDevicePage.tsx) · [C08 光链路](../src/modules/pic/PicLinkPage.tsx) | Δφ、模场半径、OMA 和接收 Q 在不同读数区出现，图中缺关键量的位置。 | C03 给两臂的相位与两谱峰间距同色。C06 把 Δ 与 w 画在重叠截面。C08 从 P1、P0 到 OMA，再换成光电流与噪声比，区分 Q 指标和 Q 函数。 |
| [K02/K03/K05/K08 封装几何与电热](../src/modules/apk/ApkThermalPage.tsx#L134) | 数值能算，pitch、同轴绝缘厚度、分布 RC、面积和材料导热高度仍缺几何对照。 | K02 用 1 mm 方阵读 pitch 与密度；K03 在真实剖面上指出半径和绝缘厚；K05 用 RC 梯形线段解释近似系数；K08 在实际热流层上代入 t、k、A，呈现每层温降。 |

建议先选 W09、F06、S04 三个不同类型的段落评审。它们分别检验结构对照、测法对照和公式从图中产生的过程。下面原课程审查中的裁切、版面和公式书写错误保留在历史复测记录内。

## 2026-11-22 图示改版进度

本轮审查遍历 16 条轨道、169 门课程入口，筛查 438 组选项的代表状态，再核对命中章节的图和源码。下方旧版审查记录保留其原有口径。

| 状态 | 课程 | 已交付 |
|---|---|---|
| 已完成 | [W08 探针卡](../src/modules/mfg/MfgProbePage.tsx) | 三种针型的接触截面并排，统一切换初触和过驱动。针型选择联动下方实训。 |
| 已完成 | [W04 晶圆验收测试](../src/modules/mfg/MfgWatPage.tsx) | 测项选择区直接对照 Vth 晶体管、薄层电阻四探针和串联通孔链，并说明测量端、激励与读数。 |
| 已完成 | [W07 测试座](../src/modules/mfg/MfgSocketPage.tsx) | ATE、SLT、老化、工作台四种设备图随选项切换，可切到运行态看器件就位、信号或偏置路径。 |

W04 和 W07 已在浏览器验证全部测项与工况切换、W07 的运行态和重置，以及英文与 390 px 布局。

### 待继续处理

建议从 W09、W11 开始，同一章的结构图按此前确认的「同一对象、统一视角、切换同步显示」做法推进。

| 课程 | 待补图示 |
|---|---|
| W09 封装基板基础 | 对照引线框架、有机积层、陶瓷基板，切换结构时同步画出扇出路径。 |
| W11 飞针与治具测试 | 在同一块板上对照飞针移动与针床同时落针。 |
| T05 MOS 管作为开关 | 并排画自举、电荷泵和 PMOS 高边，标出栅源参考。 |
| T06 CMOS 反相器 | 对照静态漏电、直通和电容翻转的电流路径。 |
| T11 读数据手册与选型 | 综合选型联动高边、低边接线和负载。 |
| D01 半导体测试概览 | 对照数字、模拟、存储、射频芯片的被测对象和信号。 |
| F02 测试设备 | 在测试链路图里定位探针台、探针卡、负载板和分选机。 |
| F06 DC 参数测试 | 四种 IDD 共用时间轴；串行、并行、并联联动接线。 |
| F08 AC 参数测试 | 六种 AC 参数联动测量边沿、测量方式和窗口。 |
| F07 功能测试 | 并行与 Scan 向量的数据路径，Ad-hoc、Scan、BIST、JTAG 的结构差别。 |
| F15 闩锁测试 | 三种触发源对应的注入或压降路径。 |
| F16 Scan 原理 | 并行存储和串行移位的数据流。 |
| S08 MEMS 加速度计 | 翻转、转台、自检对应的姿态、重力投影和受力。 |
| C06 光纤耦合与对准 | 光栅与边缘耦合的截面和入光方向。 |
| K01 先进封装概述 | 类别切换联动封装截面。 |
| K02 封装互连 | 在同尺度对照引线、C4、微凸点及已有的混合键合。 |
| K05 中介层 | 硅中介层、有机 RDL、局部硅桥截面。 |
| K04 HBM | 在堆叠图内定位 BIST、修复、ECC 和测试访问。 |
| K06 3D 堆叠 | 晶圆对晶圆的固定配对与挑选良品后贴装。 |
| K07 Die-to-Die | 片内、封装内、板级链路及其各自跨越的边界。 |
| K08 热、机械与可靠性 | 组装截面中从芯片到盖板的热路径与材料层。 |
| K09 先进封装测试 | 各测试插入点的封装形态与可接触位置。 |


## 2026-11-22 历史复测记录 · 显示与公式口径

复查覆盖现行目录 **16 条轨道、169 门课程**。在浏览器逐门打开中文桌面 1360 px 和手机 390 px 视口，人工看了 259 张代表截图，结合前轮 438 组选项筛查，进一步复点疑似错位、裁切和图文联动异常。公式从各课正文、图注、读数、例题筛查出 707 段候选，再对下表列项回查正文与模型。优先级「高」表示会导致误算、误读或挡住操作。两种视口均以浏览器模拟为准，状态覆盖为默认态加定向复测。与旧版 167 课索引相比，本次也覆盖 W12、W13。部分课程的图需要先操作才出现，K02 已切换到混合键合复核。

上方 22 课的[既有待办](#待继续处理)继续有效。以下记录本次新增或核实细化的事项。W04、W07、W08 已完成的专题沿用上方交付记录。

### 1. 可复现的图示与交互问题

| 优先级 | 课程与位置 | 复现结果和验收点 |
|---|---|---|
| 高 | F04 器件规格书 · 标准逻辑电平表 | 390 px 视口时页面宽 553 px，VOL 后的列需要整页横移才能读。表格提供自己的滑动区域或窄屏分组，列头与数值保持对应。 |
| 高 | F06 DC 参数测试 · 参数表 | 390 px 时整页宽 470 px。把表内横移限制在表格区域，保证测试条件和限值可同时定位。 |
| 高 | F09 器件表征 · 测试项表、逐脚测量表 | 390 px 时整页宽 497 px，两张表都超出视口。逐脚读数保留管脚与限值的对应关系。 |
| 高 | F13 排错 · Datalog 分类练习 | 390 px 时整页宽 461 px，右侧分类按钮伸到约 448 px，截图中每项之间留下大片空白。手机改用按项展开的判定卡或堆叠按钮，当前读数、限值和操作在同一屏宽内。 |
| 高 | F14 程序验证与文档 · 参数表 | 390 px 时整页宽 466 px。表头、规格与实测值应在可控的表区域内。 |
| 中 | F01 电学与数字逻辑基础、F10 测试向量开发 | 390 px 时页面分别宽 400、405 px。分别检查工程前缀表和 SRAM 向量表，页面底部及导览保持对齐。 |
| 中 | D16 Multi-site 与测试成本 · COT 曲线 | 桌面 1360 px 下，纵轴标题左缘超出 SVG 约 6 px。给旋转标题留绘图区边距，并在窄屏验证完整标题。[图组件](../src/modules/gen/MultisiteFig.tsx#L83) |
| 中 | R10 相位噪声 · 频偏图 | 右端「10 MHz」在桌面超出约 8 px，手机同样裁切。末端刻度右对齐或增加右边距。[图组件](../src/modules/rf/RfPhaseNoiseFig.tsx#L101) |
| 高 | W12 封装组装 · 工序截面 | 点「减薄／切割」和「植球／打标」时，两组对应图形的 DOM 分别完全相同。补齐晶圆厚度与切割道、植球与打标的关键帧。再把倒装的回流、底填和保护层按对应工序呈现。[截面](../src/modules/mfg/ProcessDiagrams.tsx#L70) |
| 中 | K02 封装互连 · 四种互连选择 | 默认引线键合时此区域无截面，切到混合键合才出现一张。保留混合键合分步图，为引线、C4 和微凸点补同方向的截面及接触点。[条件渲染](../src/modules/apk/ApkBondPage.tsx#L156) |
| 中 | K01 先进封装 · 公用封装剖面 | 截面目前是自上而下同宽的色条。补真实相对位置，例如并排芯粒、局部桥和垂直堆叠。选中类别时同步更新结构与高亮层。[公用剖面](../src/modules/mfg/figs.tsx) |

移动端七项预计可先从共用的表格容器处理，F13 的交互分类需要另外验收。L01 的 3D 在首次采图时尚未绘出，等载入后复拍已显示模型。L03 叠层与 D02 物理连接也已拿到浏览器图示。

### 2. 图有了，但动作、标注或视角仍不够清楚

| 优先级 | 课程 | 本次复查后的待办 |
|---|---|---|
| 中 | B03 从硅到芯片、B04 封装与测试 | 两课各有晶圆、工艺、封装图。用同一颗被标记的 die 串起晶圆定位、CP、切割、封装和 FT，保留被测对象与数据的去向。 |
| 中 | T08 MOS 动态特性 | 波形已经分阶段。驱动器、栅阻的对比还主要靠卡片说明。切换方案时同步画 GPIO 或驱动器到栅极的充放电路径，并在同一时间窗叠加关键波形。 |
| 中 | L04 PCB 制造流程 | 已有横截面和俯视图。切到钻孔、化学铜、电镀时，在同一截面固定孔壁位置，用颜色区分薄种子层、镀厚铜和真正导通时点。 |
| 中 | D11 测试程序与排错、X02 虚拟 ATE、X03 ATE 产线模拟器 | D11 流程图可以选首个 Fail，X02 有单项演示，X03 有单颗和批量视图。各自补一条从条件到读数、失败项和 Bin 的可追踪链路。X03 的批量图已支持悬停读数。补触屏点选和持久选中，从该 die 直接定位首次失败项。 |
| 中 | W05 CP 晶圆测试 | 晶圆图和并测 site 方格各自可交互。把选中的针阵落在同一小块晶圆上，演示完整组和圆边空槽，并将实际几何效率与当前理想组数算例标清。桌面晶圆图卡右侧留白可放图例和选中 die 的 Bin。 |
| 中 | A06 ADC 采样、A07 FFT、A11 ADC 动态参数 | 三课已有波形或频谱。用一份可辨认的采样记录串起采样点、时域乘窗、FFT bin、峰值保护区和噪声统计。A07 高频时整屏波形挤成密条，可以显示全记录和局部几个周期两个视图。 |
| 中 | A12 PLL | 锁定曲线能读出锁定时间，需要一张联动的鉴相器、滤波器、VCO 和分频反馈图。调带宽时同时指出环路误差及曲线上的判定窗口。 |
| 中 | M02 存储器读写、M05 March 测试 | M02 已显示读写时序，缺地址命中单元、位线和感放的联动图。M05 有步进和单元板，初始画面几乎全黑。给未执行单元、下一地址和当前读写命令明确图例，播放时高亮首个失败。 |
| 中 | R04 S 参数、R07 IP3 | R04 有反射系数图，补信号沿传输线入射和反射的过程。R07 已有双音频谱，把扫功率时基波、IM3 和外推交点连在同一操作上。 |
| 中 | H07 ATE 带宽、H08 综合链路 | H07 的两个眼图适合并排，保持时间与电压刻度一致并标清哪一个是参考。H08 的眼开口用矩形示意，建议标题明确为「预算示意」，并将 mask 余量连到扫过的时序或电压取样。 |
| 中 | P05 双脉冲测试 | 当前有电路和归一化波形。加同一时间轴的瞬时功率 VDS×ID，标出选中的积分区与未计入区间，切换开通和关断时同步点亮电流回路。 |
| 中 | S03 CIS 像素、S04 光子传递曲线 | S03 有 RST/TX/SEL 时序，缺像素结构里的电荷转移。S04 有样本帧和 PTC，补同一 ROI 的 f1、f2、差帧及对应散点。两课沿用同一曝光流程。 |
| 中 | Q04 Weibull、Q07 PAT/SBA | Q04 已画拟合点和截尾时间竖线，补从原始时长到秩再到概率坐标的逐点过程。Q07 在同一片晶圆上切换单颗 PAT、整批 SBA 和邻近筛选，显示三个判定对象。 |
| 中 | C03 硅光器件、C06 光纤对准 | C03 的 MZI 与微环谱图已有读数，补光在两臂合束及环内耦合的结构示意。C06 已有搜索轨迹热图，新增重点是光栅和边缘耦合的结构与入光方向。 |

### 3. 公式、算例与假设

| 优先级 | 课程与公式 | 本次确认的问题和补法 |
|---|---|---|
| 高 | P08 功率器件量产程序 · UPH | 中文写成「除以基础时间后乘 (1+r)」，英文和模型把 (1+r) 放在分母。用 4 Site、基础时间 0.25 s、重测率 20% 对照，模型是 48,000 颗/小时，按中文现写法会算成 69,120。统一括号与两个语言，并标出各时间项用秒。[中文公式](../src/modules/power/pwrProgramData.ts#L120) · [模型](../src/modules/gen/model/multisite.ts#L40) |
| 高 | C04 光调制器 · ER、OMA 和插入损耗 | P0 同时指入射功率和低电平功率，导致代入歧义。另用课内 MZM 公式复算，在输入 1 mW、Vπ=4 V、Vpp=2 V 时，偏置从 −90° 变为 −135°，OMA 从 0.707 降至 0.500 mW，ER 却从约 7.66 dB 变为理想消光。区分 P_in、P_low、P_high，说明最大 OMA 与 ER 的判据分别是什么，并区分本课按平均功率定义的损耗读数。[课文](../src/modules/pic/picModData.ts#L121) · [模型](../src/modules/pic/core/photonics.ts#L138) |
| 高 | W12 封装组装、K09 先进封装测试 · 每颗好品成本 | 共用模型按阶段从 spent 扣掉报废，再把剩余 spent 除以累计良率。单步成本 10、通过率 50% 时，代码给「每颗好品」10。若 10 是为每颗投入实际支付的成本，则两个投入换一颗好品，成本为 20。明确「仅计良品携带的成本」或「总投入摊到好品」的口径，据此统一标签、模型和算例。[共用代码](../src/modules/mfg/core.ts#L131) |
| 高 | A07 FFT · dBV 基准 | 页面和代码用 1 V 峰值作 0 dBV。给出峰值到 RMS 的转换，或把纵轴明确标为「dB re 1 Vpeak」。一伏峰值正弦在 RMS 参考下约为 −3.01 dBV，和仪器截图对照时尤其容易混。保留采样间隔与窗增益的解释。[页文](../src/modules/ana/fftData.ts#L96) · [参考](https://download.tek.com/manual/070871504.pdf) |
| 高 | R14 RF 综合 · 从 Eb/N0 到灵敏度 | 教学模型把 SNR 门槛设为 Eb/N0 加实现损耗，链路底噪固定为 1 MHz。补出模型约定，给出一般换算中的 10 log₁₀(Rb/B)，并列清比特率、噪声带宽、实现损耗各进入哪一步。[模型](../src/modules/rf/rfCapstoneModel.ts#L80) · [仪器参考](https://www.keysight.com/ml/en/assets/9018-03690/programming-guides/9018-03690.pdf) |
| 中 | W01 全流程 · 关键路径 | 式子显示 max(T_wafer,T_substrate)，即时读数显示任意勾选项目的加总，两个量容易混读。把「当前勾选合计」与「按并行分支算出的工期」并置，在流程图上圈出较长分支。[课程](../src/modules/mfg/MfgOverviewPage.tsx) |
| 中 | T02 MOS 是什么 · 平方律和负载 | 图注给出 k 和 Vth，读数还由负载共同决定。补一条负载线，标出 VGS、VDS 和 ID 如何一起确定工作点，并说明平方律的教学范围。[课程](../src/modules/mos/MosIntroPage.tsx) |
| 中 | L07 线宽与阻抗 · 经验式代入 | 已给层别和适用范围。加一个将铜厚和宽度换为截面积、再代入 I=k·ΔT^0.44·A^0.725 的完整例题，标清 mil² 与 mm²，回指交互曲线上的点。[模型](../src/modules/pcb/data/pcbBasicsModel.ts#L13) |
| 中 | F13 排错、F14 量产验证 · 判定余量 | 说明上下限各用哪一方向的差，双侧限值取哪一边。配一组近上限和近下限的读数，标出同单位下的余量。[F14 页面](../src/modules/fund/FundQualifyPage.tsx) |
| 中 | A11 ADC 动态参数 · ENOB | 当前主课与题目已解释满量程换算。把实验固定 0.9 FS 带来的 0.92 dB 补偿代入当前读数，区别满量程公式与页面的修正输出。注明 1.76 和 6.02 对应的理想满量程正弦模型。[页文](../src/modules/ana/dynamicData.ts#L16) |
| 中 | M11 Memory 覆盖率 · 三个分母 | 教学已给覆盖率和实测良率趋势。补一张「投入 → 检出 → 通过 → 通过中的缺陷」分流图，说明 Poisson 缺陷独立检出的假设，明确 e^(−λc) 与出货漏检 PPM 的分母。[模型](../src/modules/mem/memCoverageModel.ts#L176) |
| 中 | R10 相位噪声 · 积分到时间抖动 | 课文用同一个 L 表示 dBc/Hz 曲线和线性被积项。写出 L_lin=10^(L_dBc/10)，注明积分变量用 Hz、系数 2 的双侧含义，并排显示 rad rms 到 ps 的代入。[课文](../src/modules/rf/rfPhaseNoiseData.ts#L95) · [模型](../src/modules/rf/rfPhaseNoiseModel.ts#L9) |
| 中 | H04 双狄拉克 · Q 与 Q⁻¹ | 课首写 Q(BER)，后文承认这里实际是反函数。统一标题、正文、图注和练习的 Q⁻¹(BER)，把 7.03、σ 和双侧系数 2 对应到浴盆图。[课首](../src/modules/hs/hsJitterData.ts#L86) · [说明](../src/modules/hs/hsJitterData.ts#L109) |
| 中 | P05 双脉冲、P06 雪崩 · 能量 | P05 用积分图对应积分起止、反向恢复和简化公式的漏项。P06 已给 E_AS 和 t_av，补一行从 V_L 与三角形电流积分导出 BV/(BV−VDD)，区别初始电感储能和器件吸收的总能量。[双脉冲](../src/modules/power/pwrDptData.ts#L75) · [雪崩](../src/modules/power/pwrUisData.ts#L151) |
| 中 | S04 PTC、S07 光学测试 · 方差与时间 | S04 补两帧像素噪声独立、曝光一致时差帧方差为两份方差之和，并标出 K 是线性拟合斜率倒数。S07 给出 PRNU 平方和的近似条件，以及像素位宽、帧数、bit/s 的传输代入。[PTC](../src/modules/sns/snsPtcData.ts#L32) · [光学测试](../src/modules/sns/snsOpticalData.ts) |
| 中 | Q03 可靠性样本量、Q04 Weibull · 从原始量到统计值 | Q03 有卡方公式和练习，补 0 失效时置信上限、器件小时和 FIT 的单位链。Q04 有线性化和截尾说明，补一张小样本的排序、调整秩、概率坐标和拟合斜率逐行表。[样本量](../src/modules/qual/relStressData.ts#L148) · [删失模型](../src/modules/qual/relWeibullModel.ts#L70) |
| 中 | C06 光纤耦合、C08 光链路 · 重叠损耗和 Q | C06 用同宽度图形说明模场半径和失准量，并把固定损耗 L0 与失准附加项分开。C08 在同一光眼上标 P1、P0、OMA，再把光功率换成电流噪声与无量纲 Q，区分 Q 指标和高斯尾函数。[对准](../src/modules/pic/picAlignData.ts) · [光链路](../src/modules/pic/picLinkData.ts) |
| 中 | K02 封装互连、K03 TSV、K05 中介层 · 几何到电气 | K02 给出 1000/pitch，对应正方阵沿 1 mm 的排列，并说明布局占空。K03 把半径、绝缘厚度和长度标到同轴近似上。K05 的 0.38RC 补分布式线段和 50% 延迟口径，标明它是特定条件下的近似。[K05 公式](../src/modules/apk/ApkInterposerPage.tsx#L150) · [分布式 RC 参考](https://www-inst.eecs.berkeley.edu/~eecs151/fa24/static/lectures/lec12.pdf) |
| 中 | K06 3D 堆叠、K08 热与可靠性 · 条件概率和热阻 | K06 已有数值算例，补 KGD 分母中的好件、漏网坏件，以及为何假定无过杀。K08 把 t/(kA) 各项贴到截面，显示 μm、cm² 到 SI 的代入和一维等面积假设。[堆叠](../src/modules/apk/ApkStackPage.tsx) · [热](../src/modules/apk/ApkThermalPage.tsx#L134) |

### Review 后的处理顺序

1. 先核对 P08、C04、W12/K09 的公式口径，再处理 A07、R14 的单位和假设。
2. 把 390 px 的表格、F13 操作区、D16/R10 轴标签作为一轮可单独验收的可读性修复。
3. 继续做 W09、W11、W12 和 K01/K02/K05 的同对象对照图，验收时切换每个阶段，检查结构、标注和读数是否同步。

早期记录中 A11 已更新相干采样和窗函数的说明，H05 已改用动态课程引用链接。此次新增的 A11 待办是把实验使用的幅度回退量带入即时算例。

## 早期全站审查

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
