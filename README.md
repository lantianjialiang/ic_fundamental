# 半导体测试实验室

本地运行的半导体测试教学软件：用互动图、3D 示意和当堂判题，把「规格 → 测法 → 仪器设置 → 程序 → Pass / Fail」走一遍。

面向测试工程师入门、高校课程和内部培训。浏览器打开即可，没有后端、没有登录。

主线来自教材 *The Fundamentals of Digital Semiconductor Testing*，再按芯片类型拆成多条轨道。数字、模拟、Memory、RF 要测的参数不同，主线不变。

---

## 能做什么

- **按轨道上课**：首页选轨道，再进单课。已开课的轨道可以直接学，未开课的轨道先列大纲。
- **互动示意**：PMU 钳位、Shmoo、Scan Flush / Shift、闩锁流程、向量流水线、排错小游戏，以及 DUT ↔ ATE 的 3D 连接（FT / CP）。
- **当堂判题**：每课末尾有复习题，选完立刻出对错和解释。
- **中文 / English**：页头切换，默认中文，全部文案都有英文。选择存在 `localStorage` 的 `ic-lab-locale`。
- **可分享的地址**：每课有自己的 hash 地址，刷新不丢位置，浏览器后退可用。
- **深色 / 浅色**：页头切换，选择存在 `ic-lab-theme`。

技术专有名词（ATE、DUT、VIH、Scan 等）两语都保留原文。

---

## 课程轨道

编号由轨道前缀 + 课序自动生成（如 `F01`、`D03`）。插入或调整课程后编号会重排，课文里用 `{@课程ID}` 引用，不会写死数字。

### 可以上课

| 轨道 | 前缀 | 课数 | 内容 |
|---|---|---|---|
| 数字测试基础 | F | 16 | 从欧姆定律讲起，按量产顺序走完开短路、DC、功能、AC、表征、向量、写程序、排错、闩锁和 Scan |
| 基础 / 数字 | D | 15 | 产业位置、3D 物理连接、ATE / PMU、规格、DC / 功能 / 时序与 AC、向量、Scan、程序与排错、Shmoo、虚拟 ALU、闩锁入口 |
| 交互实验 | X | 1 | 自己设 Period / Drive / Strobe 和 Leakage 限流，立刻看 Pass / Fail |
| 可靠性 / 车规 | Q | 1 | 目前只有 Latch-up 入口，完整 ESD / 老化后续补 |

**数字测试基础（F01–F16）**

| 编号 | 课程 |
|---|---|
| F01 | 电学与数字逻辑基础 |
| F02 | 晶圆、封装与测试设备 |
| F03 | 测试入门：DUT、PMU 与管脚电子 |
| F04 | 器件规格书 |
| F05 | 开短路测试 |
| F06 | DC 参数测试 |
| F07 | 功能测试 |
| F08 | AC 参数测试 |
| F09 | 器件表征 |
| F10 | 测试向量开发 |
| F11 | 测试程序开发要点 |
| F12 | 编写测试程序 |
| F13 | 排错 |
| F14 | 程序验证与文档 |
| F15 | CMOS 闩锁测试 |
| F16 | Scan 测试原理 |

**基础 / 数字（D01–D15）**

| 编号 | 课程 |
|---|---|
| D01 | 什么是半导体测试？ |
| D02 | DUT 如何接到 ATE？（3D：FT 测试头 / Load Board / Socket，CP 探针台 / 针卡） |
| D03 | ATE 里面有什么？ |
| D04 | 为什么测试不只是 0 和 1 |
| D05 | 从 Datasheet 到 Test Specification |
| D06 | DC Test |
| D07 | Functional Test |
| D08 | Timing 与 AC 参数 |
| D09 | 测试向量开发 |
| D10 | Scan Test |
| D11 | 测试程序与排错 |
| D12 | Yield、Characterization、Shmoo |
| D13 | 虚拟 4-bit ALU 的 Test Program |
| D14 | Latch-up 入口 |
| D15 | 交互实验（与 X01 同一课） |

两条数字轨道互补：D 轨先立名词、看动画和 3D 画面，F 轨用一颗 256×4 SRAM 把量产程序走一遍。D 轨里和 F 轨重复的细节只点到为止，并链接到对应的 F 课。

### 大纲已列，课还没做

模拟芯片、Memory、RF、高速接口、功率器件、传感器 / CIS、硅光共封。首页能看到每条轨道要掌握什么。

---

## 技术栈

| | |
|---|---|
| 运行时 | 纯前端，Vite 6 开发服务器 |
| 界面 | React 19、TypeScript |
| 3D | Three.js、React Three Fiber、drei |
| 构建 | `tsc` + `vite build`，产物在 `dist/` |

需要 **Node.js 18+** 和 npm。

---

## 本地运行

```powershell
git clone <你的仓库地址>
cd ic_fundamental
npm install
npm run dev
```

浏览器打开终端提示的地址，默认是 `http://127.0.0.1:5173`。

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器，监听 `127.0.0.1:5173` |
| `npm run build` | 类型检查并打生产包到 `dist/` |
| `npm run typecheck` | 只做 TypeScript 类型检查 |
| `npm run check:i18n` | 检查是否有缺英文、写死中文的文案，有问题时退出码为 1 |
| `npm run preview` | 本地预览生产包 |

页面地址格式：

| 地址 | 页面 |
|---|---|
| `#/` | 首页 |
| `#/fund` | 轨道页 |
| `#/fund/fScan` | 单课（轨道 ID / 课程 ID） |

### 部署到 GitHub Pages

`vite.config.ts` 用相对路径 `base: './'`，配合 hash 地址，部署到任意子路径都不用改配置。

仓库自带 `.github/workflows/deploy.yml`：

- 每次推送和 PR 都会跑 `npm ci`、类型检查、`check:i18n`、`vite build`。
- 推送到 `main` 时，还会把 `dist/` 发布到 GitHub Pages。

第一次使用前，在仓库 **Settings → Pages → Source** 选 **GitHub Actions**。

每课按需加载，3D 依赖（three.js）只在 D02 才下载。

---

## 仓库结构

```text
ic_fundamental/
├── .github/workflows/      # CI：检查 + 部署 Pages
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── scripts/check-i18n.mjs  # 多语言检查
└── src/
    ├── main.tsx              # 入口：先套主题，再挂 Locale
    ├── App.tsx               # 首页 → 轨道 → 单课，每课按需加载
    ├── route.ts              # hash 地址解析
    ├── theme.ts              # 深色 / 浅色
    ├── index.css             # 全局样式与主题变量
    ├── home/                 # 首页、轨道页
    ├── lab/                  # 课程壳、导航、判题列表
    ├── i18n/                 # loc() / useT()，界面文案
    ├── tracks/catalog.ts     # 轨道、课序、lessonCode()
    ├── modules/
    │   ├── catalog.ts        # 稳定课程 ID（不含编号）
    │   ├── titles.ts
    │   ├── module00–17/      # 基础 / 数字（module09、module13 已并入相邻课）
    │   ├── fund/             # 数字测试基础
    │   └── timing/           # 共用时序示波器
```

学生看到的文字都走 `loc()` / `useT()`，不要在 JSX 里写死一种语言。新文案必须中英文一起写：`loc('中文', 'English')`。

---

## 说明与边界

- 这是**教学示意**，不是某家 ATE 的操作手册，也不替代真实测试程序。
- 部分数字标了「示意」（例如台式测试机通道数、成本练习金额），不要当产线数据用。
- F04 规格书示例按教材对齐（存储温度、输入额定值、绝对最大值条目）；全站 VIH 统一按 2.2 V。
- 没有用户系统、没有服务端、不会上传成绩。语言和主题只存在本机 `localStorage`。
- 3D 课用鼠标：左键旋转、滚轮缩放、右键平移。

---

## 参与

欢迎提 Issue 和 Pull Request。改界面或加课时请：

1. 学生可见的文案用 `loc('中文', 'English')`，提交前跑 `npm run check:i18n`，结果要是 0 条。
2. 新课加稳定 ID（`src/modules/catalog.ts`），编号交给 `lessonCode()`。
3. 引用其他课写成 `{@课程ID}`，不要写死 `F03` 这类编号。
4. 颜色用 CSS 变量（`--text`、`--muted`、`--gold` 等），以便深色 / 浅色一起变。

规划草稿见仓库里的 `课程规划.md`、`分类课程大纲.md`（实现以代码为准）。

---

## 许可证

[MIT](LICENSE)。可以自由使用、修改和再分发，保留版权与许可声明即可。
