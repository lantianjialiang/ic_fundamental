import { loc } from '../i18n/locale'
import type { LessonComparisonData } from './LessonComparison'

export const ecosystem: LessonComparisonData = {
  title: loc('半导体供应链里的企业角色', 'Company roles in the semiconductor supply chain'),
  columns: [loc('角色', 'Role'), loc('交付内容', 'What they provide'), loc('例子', 'Examples')],
  rows: [
    ['Fabless', loc('设计芯片，委托晶圆制造与封测', 'Design chips and outsource fabrication, assembly and test'), 'NVIDIA, Qualcomm, AMD, MediaTek'],
    [loc('终端或云平台自研芯片', 'OEM and cloud in-house silicon'), loc('为自家产品或服务定义芯片，并与代工和封测合作', 'Design silicon for their own products or services and partner with manufacturing providers'), 'Apple, Google, Amazon'],
    ['IP / EDA', loc('提供可复用设计模块和设计验证工具', 'Supply reusable design IP and design or verification tools'), 'Arm, Synopsys, Cadence'],
    [loc('晶圆代工', 'Foundry'), loc('按客户设计制造晶圆', 'Fabricate wafers from customer designs'), 'TSMC, UMC, GlobalFoundries'],
    [loc('制造设备', 'Manufacturing equipment'), loc('供应光刻、沉积、刻蚀和检测设备', 'Supply lithography, deposition, etch and inspection equipment'), 'ASML, Applied Materials, Lam Research, KLA'],
    [loc('元件与基板', 'Components and substrates'), loc('提供被动元件或封装基板', 'Supply passives or package substrates'), 'Murata, TDK, Ibiden, Unimicron'],
    ['OSAT', loc('承接外包封装、组装与测试', 'Provide outsourced semiconductor assembly and test'), 'ASE, Amkor, JCET'],
    ['IDM', loc('整合芯片设计与制造，可同时外包部分环节', 'Integrate chip design and manufacturing and may outsource selected stages'), 'Intel, Samsung, Micron, Texas Instruments'],
    ['OEM', loc('将芯片集成到终端系统', 'Integrate chips into end products'), 'Lenovo, HP, Apple'],
  ],
  note: loc('角色按业务划分。同一家企业可以同时承担多种角色，例如终端厂可以自研芯片，IDM 也可以提供代工服务。', 'Roles describe business activities. A company can fill several roles, such as an OEM designing chips or an IDM offering foundry services.'),
}

export const osatRevenue: LessonComparisonData = {
  title: loc('2024 年全球 OSAT 营收前十（十亿美元）', 'Global top 10 OSAT revenue in 2024 (USD billions)'),
  columns: [loc('公司（按 2024 年排名）', 'Company (2024 rank)'), loc('2023 营收', '2023 revenue'), loc('2024 营收', '2024 revenue'), loc('同比', 'YoY'), loc('2023 前十占比', '2023 share of top 10'), loc('2024 前十占比', '2024 share of top 10')],
  rows: [
    ['ASE Holdings', '18.68', '18.54', '−0.7%', '46.3%', '44.6%'],
    ['Amkor', '6.50', '6.32', '−2.8%', '16.1%', '15.2%'],
    ['JCET', '4.19', '5.00', '+19.3%', '10.4%', '12.0%'],
    ['TFME', '3.14', '3.32', '+5.6%', '7.8%', '8.0%'],
    ['PTI', '2.26', '2.28', '+1.0%', '5.6%', '5.5%'],
    ['HT-Tech', '1.59', '2.01', '+26.0%', '4.0%', '4.8%'],
    ['WiseRoad', '1.48', '1.56', '+5.0%', '3.7%', '3.7%'],
    ['Hana Micron', '0.74', '0.92', '+23.7%', '1.8%', '2.2%'],
    ['KYEC', '1.06', '0.91', '−14.5%', '2.6%', '2.2%'],
    ['ChipMOS', '0.69', '0.71', '+3.1%', '1.7%', '1.7%'],
    [loc('前十合计', 'Top 10 total'), '40.34', '41.56', '+3.0%', '100%', '100%'],
  ],
  note: loc('占比分母为榜单前十家合计营收。分项营收和百分比经四舍五入。异构集成与堆叠提高了封装互连、测试设备和良率控制的要求。', 'Shares use the combined revenue of the ten ranked companies as the denominator. Figures are rounded. Heterogeneous integration and stacking raise the demands on interconnects, test equipment and yield control.'),
  source: { label: 'TrendForce · 2025-05-13', href: 'https://www.trendforce.com/presscenter/news/20250513-12577.html' },
}

export const osatRevenue2025: LessonComparisonData = {
  title: loc('2025 年全球 OSAT 营收前十（十亿美元）', 'Global top 10 OSAT revenue in 2025 (USD billions)'),
  columns: [
    loc('公司（按 2025 年排名）', 'Company (2025 rank)'),
    loc('总部所在地', 'Headquarters'),
    loc('2025 营收', '2025 revenue'),
    loc('占前十比重', 'Share of top 10'),
    loc('业务侧重', 'Focus'),
  ],
  rows: [
    ['ASE · ' + loc('日月光投控', 'ASE Technology'), loc('中国台湾', 'Taiwan, China'), '20.69', '44.8%', loc('封测龙头，先进封装与测试', 'Packaging and test leader, advanced packaging and test')],
    ['Amkor · ' + loc('安靠', 'Amkor'), loc('美国', 'United States'), '6.70', '14.5%', loc('全球服务网络，通信与汽车', 'Global footprint, communications and automotive')],
    ['JCET · ' + loc('长电科技', 'JCET'), loc('中国大陆', 'Mainland China'), '5.44', '11.8%', loc('中国大陆第一，多芯片集成', 'No. 1 in mainland China, multi-die integration')],
    ['TFME · ' + loc('通富微电', 'TFME'), loc('中国大陆', 'Mainland China'), '3.91', '8.5%', loc('绑定 AMD，先进封装量产', 'AMD partner, advanced packaging in production')],
    ['HT-Tech · ' + loc('天水华天', 'Tianshui Huatian'), loc('中国大陆', 'Mainland China'), '2.41', '5.2%', loc('存储器与本土订单', 'Memory and domestic orders')],
    ['PTI · ' + loc('力成科技', 'Powertech'), loc('中国台湾', 'Taiwan, China'), '2.40', '5.2%', loc('存储器封测与 FOPLP', 'Memory packaging and FOPLP')],
    ['WiseRoad · ' + loc('智路封测', 'WiseRoad'), loc('中国大陆', 'Mainland China'), '1.56', '3.4%', loc('收购整合封测产能', 'Consolidated packaging capacity through acquisitions')],
    ['KYEC · ' + loc('京元电子', 'KYEC'), loc('中国台湾', 'Taiwan, China'), '1.12', '2.4%', loc('高效能测试（GPU / ASIC）', 'High-performance test (GPU / ASIC)')],
    ['HANA Micron · ' + loc('韩亚微', 'HANA Micron'), loc('韩国', 'South Korea'), '1.02', '2.2%', loc('韩国主要封测厂', 'Leading Korean OSAT')],
    ['SJ SEMI · ' + loc('盛合晶微', 'SJ Semiconductor'), loc('中国大陆', 'Mainland China'), '0.91', '2.0%', loc('首次进入前十', 'New entrant to the top 10')],
    [loc('前十合计', 'Top 10 total'), '—', '46.16', '100%', '—'],
  ],
  note: loc(
    '与前一张 2024 榜单口径不同：本表按 2025 年全年平均汇率折算，占比分母为前十家合计营收（约 461.6 亿美元）。前十中中国大陆五家、中国台湾三家、美国与韩国各一家；2025 年盛合晶微首次进入前十。不同机构的总量口径差异较大，跨表比较请留意统计边界。',
    'Different basis from the 2024 table above: figures are converted at 2025 average exchange rates, and shares use the combined revenue of the ten ranked companies (about USD 46.16 billion) as the denominator. Of the top ten, five are headquartered in mainland China, three in Taiwan, China, and one each in the United States and South Korea. SJ Semiconductor entered the top 10 in 2025. Total-market estimates vary widely by source, so mind the statistical boundary when comparing tables.',
  ),
  source: { label: 'StockFeel · Top 10 OSAT 2025 (IEK data)', href: 'https://www.stockfeel.com.tw/%E4%BB%80%E9%BA%BC%E6%98%AFic%E5%B0%81%E6%B8%AC%EF%BC%9A%E5%B0%81%E8%A3%9D%E8%88%87%E6%B8%AC%E8%A9%A6%E7%9A%84%E6%B5%81%E7%A8%8B%E6%AD%A5%E9%A9%9F/' },
}

export const testFlow: LessonComparisonData = {
  title: loc('从晶圆厂到客户端的质量检查', 'Quality checkpoints from fab to customer'),
  columns: [loc('阶段', 'Stage'), loc('检查与输出', 'Checks and outputs')],
  rows: [
    ['Fab', loc('在线量测膜厚和关键尺寸（CD）。WAT 用专用结构量测电性，判断制程是否在控制范围。', 'Inline metrology checks film thickness and critical dimensions. WAT measures dedicated structures to assess process electrical parameters.')],
    ['CP', loc('进料与外观检查后，探针卡接触裸 die 做电测并输出晶圆图与分 bin。部分旧流程用墨点标记坏 die，现代流程通常交换电子晶圆图。', 'After incoming and visual checks, a probe card contacts bare dies for electrical test. Results go into bins and a wafer map. Some legacy flows mark rejects with ink, while digital maps are common today.')],
    [loc('封装', 'Assembly'), loc('组装后可检查开短路或互连完整性，检查点随封装结构和流程而定。', 'Assembly can be followed by continuity or interconnect checks, depending on the package and flow.')],
    ['FT', loc('核对来料后用 handler、socket 和 ATE 测封装器件。按产品要求安排常温、高温或低温测试，以及可能的 burn-in，再分箱、检验和出货。', 'After incoming checks, the handler, socket and ATE test packaged devices. The product plan sets room, hot or cold testing and any burn-in before binning, inspection and shipment.')],
    [loc('客户端', 'Customer'), loc('分别跟踪装配产线与现场的 DPPM。比较前先对齐分母、缺陷定义、观察窗口和批次。', 'Track assembly-line and field DPPM separately. Align the denominator, defect definition, observation window and lot before comparing them.')],
  ],
}

export const fetStructures: LessonComparisonData = {
  title: loc('从平面栅到环栅', 'From planar gates to gate-all-around'),
  columns: [loc('结构', 'Structure'), loc('栅极怎样控制沟道', 'How the gate controls the channel')],
  rows: [
    ['Planar FET', loc('沟道沿硅表面形成，栅极从上方控制。', 'The channel forms along the silicon surface, with the gate above it.')],
    ['FinFET', loc('沟道立成鳍，栅极包住鳍顶和两侧，加强静电控制。', 'The channel is a fin. The gate wraps the top and both sides for stronger electrostatic control.')],
    ['Nanowire GAAFET', loc('栅极环绕每根悬空纳米线的整个横截面。', 'The gate surrounds the entire cross-section of each suspended nanowire.')],
    ['Nanosheet GAAFET / MBCFET™', loc('栅极环绕多层较宽的纳米片。MBCFET 是三星的纳米片 GAA 技术名称。', 'The gate surrounds stacked, wider nanosheets. MBCFET is Samsung’s nanosheet GAA technology name.')],
  ],
  note: loc('纳米线与纳米片都属于 GAA。包围沟道有助于抑制短沟道效应，器件性能还取决于几何尺寸、材料与工艺。', 'Both nanowires and nanosheets are GAA structures. Wrapping the channel helps suppress short-channel effects. Performance also depends on dimensions, materials and process.'),
  source: { label: 'Samsung Semiconductor · GAA', href: 'https://semiconductor.samsung.com/news-events/tech-blog/gaa-dtco-for-ppa/' },
}

export const reliabilityStages: LessonComparisonData = {
  title: loc('浴缸曲线各阶段怎么应对', 'Engineering responses across the bathtub curve'),
  columns: [loc('阶段', 'Stage'), loc('失效率趋势', 'Failure-rate trend'), loc('工程措施', 'Engineering response')],
  rows: [
    [loc('早期失效', 'Infant mortality'), loc('随时间下降', 'Decreases with time'), loc('追查制造缺陷，必要时用经验证的筛选或 burn-in 找出弱件。', 'Trace manufacturing defects and use validated screening or burn-in where needed.')],
    [loc('有效使用期', 'Useful life'), loc('低且近似平稳', 'Low and roughly constant'), loc('跟踪现场失效，并结合实际负载和环境分析。', 'Monitor field failures and investigate actual loads and environments.')],
    [loc('磨损期', 'Wear-out'), loc('随老化上升', 'Rises as aging accumulates'), loc('用加速试验评估寿命，再优化设计裕量、温度与电流密度规格。', 'Use accelerated tests to assess lifetime, then improve design margin and temperature or current-density limits.')],
  ],
  note: loc('纵轴是仍在工作的器件在该时刻的失效率。实际产品的曲线形状和阶段长度取决于失效机理与使用条件。', 'The vertical axis is the instantaneous failure rate among surviving devices. Actual curves depend on mechanisms and operating conditions.'),
}

export const yieldAndReliability: LessonComparisonData = {
  title: loc('同一类互连缺陷，为什么会在不同时间失效', 'Why similar interconnect defects can fail at different times'),
  columns: [loc('金属线附近的颗粒', 'Particle near metal lines'), loc('可能观察到的结果', 'Possible result')],
  rows: [
    [loc('颗粒未显著缩小绝缘间隙', 'Particle leaves adequate insulation clearance'), loc('在给定工作条件下可能看不到影响。', 'There may be no observable effect under the stated conditions.')],
    [loc('颗粒缩小有效间隙', 'Particle reduces effective clearance'), loc('初始电测可能通过。电场、温度和时间可能促使薄弱处劣化，形成早期失效。', 'Initial electrical tests may pass. Electric field, temperature and time can degrade the weak spot and cause early failure.')],
    [loc('导电颗粒跨接两条线', 'Conductive particle bridges two lines'), loc('可能在 CP 或 FT 就表现为短路，导致初始良率损失。', 'A short can show up during CP or FT, reducing initial yield.')],
  ],
  note: loc('颗粒大小只是示意。位置、导电性、线距和应力也会改变结果。良率看测试时通过的比例，可靠度看规定条件与时间内持续工作的概率。', 'Size is illustrative. Position, conductivity, line spacing and stress also matter. Yield is the fraction passing at test, while reliability is the probability of continued operation over stated conditions and time.'),
}

export const memoryFaults: LessonComparisonData = {
  title: loc('七种存储器故障模型', 'Seven memory fault models'),
  columns: [loc('模型', 'Model'), loc('可观察的症状', 'Observable behavior')],
  rows: [
    ['SAF (SA0 / SA1)', loc('单元始终读回 0 或 1。', 'The cell stays at 0 or 1.')],
    ['TF', loc('单元无法完成某个方向的 0↔1 翻转。', 'The cell cannot make one direction of the 0↔1 transition.')],
    ['CF', loc('对侵扰单元的状态或操作影响受扰单元。', 'An aggressor cell state or operation affects a victim cell.')],
    ['AF', loc('地址译码错误，例如两个逻辑地址选到同一个单元。', 'Address decoding is wrong, such as two logical addresses selecting the same cell.')],
    ['DRF', loc('写入后能立即读对，经过保持时间后读错。', 'Data reads correctly right after writing, then fails after a retention interval.')],
    ['NPSF / NSF', loc('只有邻域形成某种数据图案时，目标单元才表现异常。', 'The target fails only under a particular neighborhood data pattern.')],
    ['DF / RDF', loc('访问操作扰动数据。读扰动中，读取可能改变原先存储的状态。', 'An access disturbs stored data. In read disturb, a read may change the stored state.')],
  ],
}

export const memoryAlgorithms: LessonComparisonData = {
  title: loc('从数据背景到 March 算法', 'From data backgrounds to March algorithms'),
  columns: [loc('方法', 'Method'), loc('怎样组织操作', 'How it organizes operations')],
  rows: [
    ['Zero–One', loc('全写 0 后读回，再全写 1 后读回。', 'Write and verify all zeros, then all ones.')],
    ['Checkerboard', loc('使用相邻位交替的背景和反相背景。', 'Use alternating neighboring bits and the complementary background.')],
    ['Sliding Diagonal', loc('改变阵列中的对角线图案位置。', 'Move a diagonal data pattern across the array.')],
    ['Walking 1/0', loc('让单个 1 或 0 在相反背景中逐位移动。', 'Walk a single one or zero through the opposite background.')],
    ['GALPAT', loc('逐次改变一个基准位置，并反复读它及其余位置。', 'Change one base location at a time and repeatedly read it and other locations.')],
    ['Butterfly', loc('围绕当前地址访问行、列方向的邻近位置。', 'Access neighbors in row and column directions around the current address.')],
    ['MATS', loc('用简短的 March 序列对单元执行写 0、读 0 后写 1、读 1。', 'Use a short March sequence with write zero, read zero then write one, and read one.')],
    ['March A', loc('按升序与降序遍历地址，在每个地址执行一组指定读写。', 'Traverse addresses in both directions and execute a specified group of reads and writes at each address.')],
  ],
  note: loc('选择 MBIST 算法时要一起看故障覆盖、数据背景、地址映射与测试时间。保持故障需要专门的等待条件，邻域故障要考虑物理相邻关系。', 'MBIST algorithm selection balances fault coverage, backgrounds, address mapping and test time. Retention faults need a dwell condition, and neighborhood faults depend on physical adjacency.'),
}

export const interposerComparison: LessonComparisonData = {
  title: loc('硅中介层与有机 RDL 中介层', 'Silicon and organic RDL interposers'),
  columns: [loc('比较项', 'Feature'), loc('硅中介层', 'Silicon interposer'), loc('有机 RDL 中介层', 'Organic RDL interposer')],
  rows: [
    [loc('叠层', 'Stack'), loc('SoC 与 HBM 经中介层接到封装基板', 'SoC and HBM connect to the package substrate through the interposer'), loc('SoC 与 HBM 经聚合物/铜重布线层接到封装基板', 'SoC and HBM connect through polymer and copper redistribution layers')],
    [loc('材料', 'Material'), loc('硅', 'Silicon'), loc('聚合物，例如 PI，配合铜走线', 'Polymer such as PI with copper routing')],
    [loc('截图示例线宽 / 线距', 'Example line / space from the reference'), '0.4 µm / 0.4 µm', '2 µm / 2 µm'],
    [loc('垂直互连', 'Vertical interconnect'), loc('TSV 穿过硅', 'TSVs through silicon'), loc('铜通孔，结构随工艺而异', 'Copper vias, with process-specific structures')],
    [loc('技术示例', 'Example'), 'CoWoS-S', 'CoWoS-R'],
  ],
  note: loc('线宽与线距是参考图中的示例值，选型要按平台设计规则。硅与有机结构还需比较热路径、热膨胀、翘曲、布线密度及制造成本。', 'The dimensions are examples from the reference. Use platform design rules for selection. Also compare thermal paths, expansion, warpage, routing density and manufacturing cost.'),
  source: { label: 'TSMC 3DFabric · CoWoS', href: 'https://3dfabric.tsmc.com/schinese/dedicatedFoundry/technology/cowos.htm' },
}
