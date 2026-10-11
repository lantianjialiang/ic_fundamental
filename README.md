# IC Test Monk

Locally run semiconductor test teaching software: interactive diagrams, 3D views, and in-lesson quizzes walk you through **spec → test method → instrument setup → program → Pass / Fail**.

Built for test-engineer onboarding, university courses, and internal training. Open it in a browser—no backend, no login.

The main line follows the textbook *The Fundamentals of Digital Semiconductor Testing*, split into multiple tracks by chip type. Digital, analog, memory, and RF need different parameters; the overall flow stays the same.

---

## What you can do

- **Learn by track**: Pick a track on the home page, then open individual lessons. Tracks that are live are ready to study; tracks not yet built show their syllabus first.
- **Interactive visuals**: PMU clamping, Shmoo, Scan flush/shift, latch-up flow, vector pipeline, debug mini-games, and 3D DUT ↔ ATE connections (FT / CP).
- **In-lesson quizzes**: Review questions at the end of each lesson; you get immediate right/wrong feedback and explanations.
- **中文 / English**: Switch in the header; default is Chinese, with full English copy. Choice is stored in `localStorage` under `ic-lab-locale`.
- **Shareable URLs**: Each lesson has its own hash URL; refresh keeps your place, and the browser Back button works.
- **Dark / light**: Switch in the header; choice is stored in `ic-lab-theme`.
- **Glossary** (`#/glossary`): Terms from tracks D and F, browsable by lesson or A–Z, searchable in both languages. Each term is defined once under the earliest lesson that introduces it, with all references listed; each term has its own URL, e.g. `#/glossary/strobe`.
- **FAQ** (`#/faq`): Topic-grouped Q&A, searchable and collapsible; lesson codes in answers link straight to lessons. Each entry has its own URL, e.g. `#/faq/strobe-early`.
- **Feedback**: “Report an issue” beside the footer copyright and at the bottom of the lesson sidebar—GitHub Issue or email, with lesson, URL, locale, theme, and browser info attached automatically.

Technical terms (ATE, DUT, VIH, Scan, etc.) stay in their usual form in both languages.

---

## Course tracks

Lesson codes are generated from track prefix + sequence (e.g. `F01`, `D03`). Inserting or reordering lessons renumbers codes; in copy, reference lessons with `{@lessonId}`, not hard-coded numbers.

### Available now

| Track | Prefix | Lessons | Focus |
|---|---|---|---|
| Foundations / Digital | D | 16 | Industry context, 3D physical hookup, ATE / PMU, specs, DC / functional / timing & AC, vectors, Scan, programs & debug, Shmoo, virtual ALU, latch-up intro, virtual ATE workstation |
| Digital test fundamentals | F | 16 | From Ohm’s law through production order: opens/shorts, DC, functional, AC, characterization, vectors, programming, debug, latch-up, and Scan |
| Interactive labs | X | 2 | Set Period / Drive / Strobe and leakage limits yourself; virtual ATE workstation for IDDQ and opens/shorts, datalog, fault diagnosis |
| Reliability / automotive | Q | 1 | Latch-up entry only for now; full ESD / aging content planned |

**Foundations / Digital (D01–D16)**

| Code | Lesson |
|---|---|
| D01 | What is semiconductor test? |
| D02 | How does the DUT connect to the ATE? (3D: FT test head / load board / socket; CP prober / probe card) |
| D03 | What’s inside an ATE? |
| D04 | Why test is more than 0 and 1 |
| D05 | From datasheet to test specification |
| D06 | DC test |
| D07 | Functional test |
| D08 | Timing and AC parameters |
| D09 | Test vector development |
| D10 | Scan test |
| D11 | Test programs and debug |
| D12 | Yield, characterization, Shmoo |
| D13 | Test program for a virtual 4-bit ALU |
| D14 | Latch-up introduction |
| D15 | Interactive lab (same lesson as X01) |
| D16 | Virtual ATE OS: IDDQ and opens/shorts workstation (same lesson as X02) |

**Digital test fundamentals (F01–F16)**

| Code | Lesson |
|---|---|
| F01 | Electrical and digital logic basics |
| F02 | Wafer, package, and test equipment |
| F03 | Test basics: DUT, PMU, and pin electronics |
| F04 | Device datasheet |
| F05 | Opens and shorts test |
| F06 | DC parametric test |
| F07 | Functional test |
| F08 | AC parametric test |
| F09 | Device characterization |
| F10 | Test vector development |
| F11 | Test program development essentials |
| F12 | Writing a test program |
| F13 | Debug |
| F14 | Program verification and documentation |
| F15 | CMOS latch-up test |
| F16 | Scan test principles |

The two digital tracks complement each other: D establishes vocabulary with animation and 3D; F walks through a production-style program on a 256×4 SRAM. Where D overlaps F, D only summarizes and links to the matching F lesson.

### Syllabus only (lessons not built yet)

Analog ICs, memory, RF, high-speed interfaces, power devices, sensor / CIS, co-packaged silicon photonics. The home page shows what each track will cover.

---

## Tech stack

| | |
|---|---|
| Runtime | Front-end only; Vite 6 dev server |
| UI | React 19, TypeScript |
| 3D | Three.js, React Three Fiber, drei |
| Build | `tsc` + `vite build`, output in `dist/` |

Requires **Node.js 18+** and npm.

---

## Local development

```powershell
git clone <your-repo-url>
cd ic_fundamental
npm install
npm run dev
```

Open the URL shown in the terminal; default is `http://127.0.0.1:5173`.

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on `127.0.0.1:5173` |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run check:i18n` | Fail if English is missing or UI text is hard-coded in one language (exit code 1 on issues) |
| `npm run export:icons` | Regenerate PNG favicons from `public/favicon.svg` |
| `npm run preview` | Preview the production build locally |

URL patterns:

| URL | Page |
|---|---|
| `#/` | Home |
| `#/fund` | Track page |
| `#/fund/fScan` | Single lesson (track ID / lesson ID) |
| `#/glossary`, `#/glossary/strobe` | Glossary; with term ID, scrolls to and highlights that entry |
| `#/faq`, `#/faq/strobe-early` | FAQ; with entry ID, expands and scrolls to that item |

If an ID in the URL does not exist, the app redirects to the nearest valid parent (without adding a history entry).

### Deploy to GitHub Pages

`vite.config.ts` uses relative `base: './'`, so with hash routing you can deploy under any subpath without config changes.

Workflows:

- `.github/workflows/ci.yml` — on every push and PR: `npm ci`, typecheck, `check:i18n`, `build`.
- `.github/workflows/deploy.yml` — on push to `main` (and manual run): same checks, then publish `dist/` to GitHub Pages.

**One-time setup (required):** In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions** (not “Deploy from a branch”). Save, then push to `main` or re-run **Deploy to GitHub Pages**.

**If `deploy-pages` fails with HTTP 404 / “Failed to create deployment”:** GitHub Pages is not enabled for this repo yet, or Source is still set to a branch. Fix the Settings step above. Private repos need a GitHub plan that includes Pages, or make the repo public.

Lessons load on demand; the Three.js stack downloads only when you open D02.

---

## Repository layout

```text
ic_fundamental/
├── .github/workflows/      # ci.yml (checks) + deploy.yml (Pages)
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── scripts/check-i18n.mjs  # i18n lint
├── scripts/check-vate.mjs  # D16 teaching model numeric checks
├── scripts/export-brand-icons.mjs
└── src/
    ├── main.tsx              # Entry: theme, then locale
    ├── App.tsx               # Home → track → lesson; lazy-loaded lessons
    ├── route.ts              # Hash route parsing
    ├── theme.ts              # Dark / light
    ├── index.css             # Global styles and theme tokens
    ├── site.ts               # Repo URL, feedback email
    ├── home/                 # Home, track pages, glossary/FAQ chrome
    ├── lab/                  # Lesson shell, nav, quiz list, feedback link
    ├── glossary/             # Glossary: terms.ts + pages
    ├── faq/                  # FAQ: faq.ts + pages
    ├── i18n/                 # loc() / useT(), UI strings
    ├── tracks/catalog.ts     # Tracks, lesson order, lessonCode()
    ├── modules/
    │   ├── catalog.ts        # Stable lesson IDs (no numeric codes)
    │   ├── titles.ts
    │   ├── module00–17/      # Foundations / digital (module09, module13 merged into neighbors)
    │   ├── vate/             # D16 virtual ATE workstation (model/ = pure functions)
    │   ├── fund/             # Digital test fundamentals
    │   └── timing/           # Shared timing scope
```

All user-visible text goes through `loc()` / `useT()`—do not hard-code a single language in JSX. New strings must include both locales via `loc('中文', 'English')`.

---

## Scope and limits

- **Teaching illustrations only**—not an ATE vendor manual and not a substitute for real production test programs.
- Some numbers are labeled illustrative (e.g. bench tester channel counts, cost exercise amounts); do not treat them as fab data.
- F04 datasheet examples follow the textbook (storage temperature, input ratings, absolute-max entries). On the F-track 256×4 SRAM, VIH is 2.2 V (textbook ch. 4; ch. 7 examples use 2.0 V). The D-track uses a fictional 3.3 V device with VIH 2.0 V; the generic TTL level table also uses 2.0 V.
- No user accounts, no server, no grade upload. Locale and theme live only in local `localStorage`.
- 3D lessons: left-drag rotate, wheel zoom, right-drag pan.

---

## Contributing

Issues and pull requests are welcome. When changing UI or adding lessons:

1. Student-visible copy via `loc()` with both locales; run `npm run check:i18n` before submit—zero issues required.
2. New lessons get a stable ID in `src/modules/catalog.ts`; numeric codes come from `lessonCode()`.
3. Cross-references use `{@lessonId}`, not hard-coded codes like `F03`.
4. Use CSS variables (`--text`, `--muted`, `--gold`, etc.) so dark and light themes stay in sync.

### Adding glossary / FAQ entries

- **Glossary:** Add to `TERMS` in `src/glossary/terms.ts`: `{ id, term, name: loc(...), def: loc(...), lessons: [...] }`. `id` is lowercase letters, digits, and hyphens only—it becomes part of the URL; do not change it after publish. If the term exists, append to `lessons` instead of duplicating; the canonical entry stays under the earliest lesson in sort order.
- **FAQ:** Add to the group’s `items` in `src/faq/faq.ts`: `{ id, q: loc(...), a: loc(...), lessons: [...] }`. Use `{@lessonId}` in answers and keep wording aligned with lessons. Fold useful “my question isn’t listed” feedback back into this file.
- **Feedback targets:** GitHub repo and email are in `src/site.ts`; update that file when the repo moves.

---

## License

[MIT](LICENSE). Use, modify, and redistribute freely; keep copyright and license notices.

---

# IC Test Monk（半导体测试互动课程）

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
- **术语表**（`#/glossary`）：从 D、F 两条轨道汇总的术语，按课程或 A–Z 浏览，中英文搜索。同一个词只完整写一次，放在最早讲到它的那一课下面，并列出所有出处；每个词有自己的地址，如 `#/glossary/strobe`。
- **常见问题**（`#/faq`）：按主题分组的问答，可搜索、可折叠，答案里的课程编号能直接点。每条有自己的地址，如 `#/faq/strobe-early`。
- **问题反馈**：每页底部版权行旁、课程侧栏底部都有「反馈问题」，可选 GitHub Issue 或邮件，自动带上课程、地址、语言、主题和浏览器信息。

技术专有名词（ATE、DUT、VIH、Scan 等）两语都保留原文。

---

## 课程轨道

编号由轨道前缀 + 课序自动生成（如 `F01`、`D03`）。插入或调整课程后编号会重排，课文里用 `{@课程ID}` 引用，不会写死数字。

### 可以上课

| 轨道 | 前缀 | 课数 | 内容 |
|---|---|---|---|
| 基础 / 数字 | D | 16 | 产业位置、3D 物理连接、ATE / PMU、规格、DC / 功能 / 时序与 AC、向量、Scan、程序与排错、Shmoo、虚拟 ALU、闩锁入口、虚拟 ATE 工作站 |
| 数字测试基础 | F | 16 | 从欧姆定律讲起，按量产顺序走完开短路、DC、功能、AC、表征、向量、写程序、排错、闩锁和 Scan |
| 交互实验 | X | 2 | 自己设 Period / Drive / Strobe 和 Leakage 限流；虚拟 ATE 工作站跑 IDDQ 与开短路、读 Datalog、诊断故障 |
| 可靠性 / 车规 | Q | 1 | 目前只有 Latch-up 入口，完整 ESD / 老化后续补 |

**基础 / 数字（D01–D16）**

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
| D16 | 虚拟 ATE 操作系统：IDDQ 与开短路工作站（与 X02 同一课） |

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
| `npm run export:icons` | 从 `public/favicon.svg` 重新生成 PNG 图标 |
| `npm run preview` | 本地预览生产包 |

页面地址格式：

| 地址 | 页面 |
|---|---|
| `#/` | 首页 |
| `#/fund` | 轨道页 |
| `#/fund/fScan` | 单课（轨道 ID / 课程 ID） |
| `#/glossary`、`#/glossary/strobe` | 术语表；带词条 ID 时滚到并高亮该词条 |
| `#/faq`、`#/faq/strobe-early` | 常见问题；带问答 ID 时展开并定位到该条 |

地址里的 ID 不存在时，会自动回到对应的上一级页面（不留历史记录）。

### 部署到 GitHub Pages

`vite.config.ts` 用相对路径 `base: './'`，配合 hash 地址，部署到任意子路径都不用改配置。

工作流：

- `.github/workflows/ci.yml` — 每次 push / PR：`npm ci`、类型检查、`check:i18n`、`build`。
- `.github/workflows/deploy.yml` — 推送到 `main`（或手动运行）：同样检查通过后，把 `dist/` 发布到 GitHub Pages。

**首次必做：** 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）。保存后，再 push 到 `main`，或在 Actions 里重新运行 **Deploy to GitHub Pages**。

**若 `deploy-pages` 报 HTTP 404 / “Failed to create deployment”：** 说明 Pages 还没对该仓库启用，或 Source 仍指向分支部署。按上面 Settings 改好后重试。私有仓库需 GitHub 套餐支持 Pages，或改为公开仓库。

每课按需加载，3D 依赖（three.js）只在 D02 才下载。

---

## 仓库结构

```text
ic_fundamental/
├── .github/workflows/      # ci.yml（检查）+ deploy.yml（Pages）
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── scripts/check-i18n.mjs  # 多语言检查
├── scripts/check-vate.mjs  # D16 教学模型数值核对
├── scripts/export-brand-icons.mjs
└── src/
    ├── main.tsx              # 入口：先套主题，再挂 Locale
    ├── App.tsx               # 首页 → 轨道 → 单课，每课按需加载
    ├── route.ts              # hash 地址解析
    ├── theme.ts              # 深色 / 浅色
    ├── index.css             # 全局样式与主题变量
    ├── site.ts               # 仓库地址、反馈邮箱
    ├── home/                 # 首页、轨道页、术语表 / FAQ 共用外框
    ├── lab/                  # 课程壳、导航、判题列表、反馈链接
    ├── glossary/             # 术语表：terms.ts 数据 + 页面
    ├── faq/                  # 常见问题：faq.ts 数据 + 页面
    ├── i18n/                 # loc() / useT()，界面文案
    ├── tracks/catalog.ts     # 轨道、课序、lessonCode()
    ├── modules/
    │   ├── catalog.ts        # 稳定课程 ID（不含编号）
    │   ├── titles.ts
    │   ├── module00–17/      # 基础 / 数字（module09、module13 已并入相邻课）
    │   ├── vate/             # D16 虚拟 ATE 工作站（model/ 为纯函数模型）
    │   ├── fund/             # 数字测试基础
    │   └── timing/           # 共用时序示波器
```

看到的文字都走 `loc()` / `useT()`，不要在 JSX 里写死一种语言。新文案必须中英文一起写：`loc('中文', 'English')`。

---

## 说明与边界

- 这是**教学示意**，不是某家 ATE 的操作手册，也不替代真实测试程序。
- 部分数字标了「示意」（例如台式测试机通道数、成本练习金额），不要当产线数据用。
- F04 规格书示例按教材对齐（存储温度、输入额定值、绝对最大值条目）；F 轨 256×4 SRAM 的 VIH 按 2.2 V（教材第 4 章；第 7 章例题沿用 2.0 V），D 轨用一颗假想的 3.3 V 芯片，VIH 2.0 V，通用 TTL 电平表也是 2.0 V。
- 没有用户系统、没有服务端、不会上传成绩。语言和主题只存在本机 `localStorage`。
- 3D 课用鼠标：左键旋转、滚轮缩放、右键平移。

---

## 参与

欢迎提 Issue 和 Pull Request。改界面或加课时请：

1. 学生可见的文案用 `loc('中文', 'English')`，提交前跑 `npm run check:i18n`，结果要是 0 条。
2. 新课加稳定 ID（`src/modules/catalog.ts`），编号交给 `lessonCode()`。
3. 引用其他课写成 `{@课程ID}`，不要写死 `F03` 这类编号。
4. 颜色用 CSS 变量（`--text`、`--muted`、`--gold` 等），以便深色 / 浅色一起变。

### 添加术语 / FAQ

- **术语**：在 `src/glossary/terms.ts` 的 `TERMS` 里加一条 `{ id, term, name: loc('中文名', 'English name'), def: loc('解释', 'Definition'), lessons: [...] }`。`id` 只用小写字母、数字、连字符，是地址的一部分，发布后别改。同一个词已经有了就只往 `lessons` 里加课程，不要另起一条；主词条会自动放到课序最靠前的那一课下面。
- **FAQ**：在 `src/faq/faq.ts` 对应分组的 `items` 里加 `{ id, q: loc(...), a: loc(...), lessons: [...] }`。答案里用 `{@课程ID}` 引用课程，口径要和课文一致。「我的问题不在这里」收到的问题，整理后也补到这里。
- **反馈地址**：GitHub 仓库和邮箱在 `src/site.ts`，换仓库时只改这一处。

---

## 许可证

[MIT](LICENSE)。可以自由使用、修改和再分发，保留版权与许可声明即可。
