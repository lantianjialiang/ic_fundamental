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
- **Glossary** (`#/glossary`): Terms from tracks D, F, T (MOS), L (PCB), A (analog), H (high-speed), R (RF) and M (memory), browsable by lesson or A–Z, searchable in both languages. Each term is defined once under the earliest lesson that introduces it, with all references listed; each term has its own URL, e.g. `#/glossary/strobe`.
- **FAQ** (`#/faq`): Topic-grouped Q&A for the digital, MOS, PCB, analog, high-speed, RF and memory tracks, searchable and collapsible; lesson codes in answers link straight to lessons. Each entry has its own URL, e.g. `#/faq/strobe-early`.
- **Feedback**: “Report an issue” beside the footer copyright and at the bottom of the lesson sidebar—GitHub Issue or email, with lesson, URL, locale, theme, and browser info attached automatically.

Technical terms (ATE, DUT, VIH, Scan, etc.) stay in their usual form in both languages.

---

## Course tracks

Lesson codes are generated from track prefix + sequence (e.g. `F01`, `D03`). Inserting or reordering lessons renumbers codes; in copy, reference lessons with `{@lessonId}`, not hard-coded numbers.

### Available now

| Track | Prefix | Lessons | Focus |
|---|---|---|---|
| Prep | B | 7 | Industry roles, history, silicon→die, packaging & CP/FT, components, digital diagrams, bench measurement—then enter D / F |
| Foundations / Digital | D | 17 | Industry context, 3D physical hookup, ATE / PMU, specs, DC / functional / timing & AC, vectors, Scan, programs & debug, Shmoo, virtual ALU, latch-up intro, STDF / Datalog, multi-site cost, virtual ATE workstation (timing / leakage / pattern bench included) |
| Digital test fundamentals | F | 16 | From Ohm’s law through production order: opens/shorts, DC, functional, AC, characterization, vectors, programming, debug, latch-up, and Scan |
| Interactive labs | X | 2 | Set Period / Drive / Strobe and leakage limits yourself; virtual ATE workstation for IDDQ and opens/shorts, datalog, fault diagnosis |
| Reliability / automotive | Q | 9 | Latch-up entry, bathtub curve, acceleration models, stress and sample size, Weibull and FIT, burn-in, AEC-Q100 framework, wafer PAT, and a production flow capstone |
| Power devices | P | 8 | Device selection, static parameters, Kelvin, gate charge, double-pulse switching, UIS / SOA / thermal, wide-bandgap test, and a test program capstone |
| MOSFETs and digital circuits | T | 11 | How a MOSFET turns on, which region it works in, how inverters and gates are built, board use and selection |
| PCB basics | L | 10 | How a board is made, the design-to-product flow, reading PCB files, design rules and a self-check |
| Analog | A | 15 | Force / measure, DC and dynamic parameters, ADC / DAC, LDO, PLL, trim, statistics, and a capstone test program |
| High-speed I/O | H | 8 | Signal basics, channel integrity, clock and data timing, jitter and noise, eye diagrams, high-speed interface test, ATE limits, and a capstone |
| RF test | R | 14 | dB / dBm, test system and link, S-parameters and matching, gain, P1dB, IP3, noise figure, harmonics, phase noise, modulation, EVM / ACPR, calibration, and a capstone |
| Memory test | M | 13 | Array structure, read/write, fault models, patterns, March tests, timing and Shmoo, DRAM, DDR training, BIST with repair and ECC, parallel test, coverage and yield, bin analysis, and a capstone |

**Foundations / Digital (D01–D17)**

| Code | Lesson |
|---|---|
| D01 | What is semiconductor test? (incl. STDF result records) |
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
| D15 | STDF and Datalog: byte-level viewer, record assembler with validator, in-browser parsing of your own `.stdf` (never uploaded), Pass/Fail, bin chart, parameter distribution and Cpk |
| D16 | Multi-site and test cost: site count vs. UPH, parallel efficiency and COT; find an injected site offset by grouping on `SITE_NUM` |
| D17 | Virtual ATE OS: timing / leakage / pattern bench (formerly D15, merged in), then the IDDQ and opens/shorts workstation (same lesson as X02) |

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

**Analog (A01–A15)**

| Code | Lesson |
|---|---|
| A01 | Overview of Analog and Mixed-signal Test |
| A02 | Voltage, Current and Measurement Basics |
| A03 | ATE Analog Resources and Load Board |
| A04 | PMU / SMU and FVMI / FIMV |
| A05 | Continuous-time Signals and Frequency |
| A06 | Sampling Theorem and ADC Sampling |
| A07 | Waveform Capture and FFT |
| A08 | Analog Pin Leakage and Quiescent Current Judgement |
| A09 | LDO Test |
| A10 | ADC / DAC Static Parameters |
| A11 | ADC Dynamic Parameters |
| A12 | PLL and Clock Test |
| A13 | Trim and OTP |
| A14 | Test Limits and Statistics |
| A15 | Capstone: Mixed-signal Test Program |

**High-speed I/O (H01–H08)**

| Code | Lesson |
|---|---|
| H01 | High-speed Signal Basics |
| H02 | Transmission and Signal Integrity |
| H03 | Clock and Data Timing |
| H04 | Jitter and Noise |
| H05 | Eye Diagram Analysis |
| H06 | High-speed Interface Test |
| H07 | Limits of ATE for High-speed Test |
| H08 | Capstone: High-speed Interface Test |

**RF test (R01–R14)**

| Code | Lesson |
|---|---|
| R01 | Overview of RF Test |
| R02 | dB, dBm and dBc |
| R03 | RF Test System and Signal Path |
| R04 | Impedance Matching and S-parameters |
| R05 | Gain and Insertion Loss |
| R06 | Output Power and P1dB |
| R07 | Linearity: IP3 and IMD |
| R08 | Noise Figure |
| R09 | Harmonics and Spurious |
| R10 | Phase Noise |
| R11 | Modulation Basics: I/Q and Constellations |
| R12 | EVM and ACPR |
| R13 | RF Calibration and Error |
| R14 | Capstone: RF Transceiver Test |

**Memory test (M01–M13)**

| Code | Lesson |
|---|---|
| M01 | Memory Array Structure |
| M02 | Memory Read and Write Flow |
| M03 | Memory Fault Models |
| M04 | Patterns and Data Backgrounds |
| M05 | March Test |
| M06 | Memory Timing Test |
| M07 | DRAM Basics |
| M08 | DDR / LPDDR Read-Write Training |
| M09 | BIST, Redundancy Repair and ECC |
| M10 | Parallel Memory Test |
| M11 | Test Coverage and Yield |
| M12 | Bin and Failure Analysis |
| M13 | Capstone: Memory Test |

### Syllabus only (lessons not built yet)

Sensor / CIS and co-packaged silicon photonics. The home page shows what each track will cover.

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
├── scripts/check-vate.mjs  # D17 teaching model numeric checks
├── scripts/check-gen.mjs   # D15–D16 STDF / multi-site model numeric checks
├── scripts/check-qual.mjs  # REL-01–08 reliability numeric checks (scripts/checks/qual-*.mjs)
├── scripts/check-power.mjs # PWR-01–08 power device numeric checks (scripts/checks/power-*.mjs)
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
    ├── glossary/             # Glossary: terms.ts merges per-track files (termsMos, termsPcb, termsAna, termsHs, termsRf, termsMem, …) + pages
    ├── faq/                  # FAQ: faq.ts merges per-track groups (faqMos, faqPcb, faqAna, faqHs, faqRf, faqMem, …) + pages
    ├── i18n/                 # loc() / useT(), UI strings
    ├── tracks/catalog.ts     # Tracks, lesson order, lessonCode()
    ├── modules/
    │   ├── catalog.ts        # Stable lesson IDs (no numeric codes)
    │   ├── titles.ts
    │   ├── module00–17/      # Foundations / digital (module09, module13 merged into neighbors)
    │   ├── vate/             # D17 virtual ATE workstation (model/ = pure functions; hosts the timing / leakage / pattern bench from module17/BenchLab.tsx)
    │   ├── gen/              # D15–D16 STDF / Datalog and multi-site (model/ = pure functions)
    │   ├── qual/             # Reliability REL-01–08: core/ (reliability, wafer, pat models), knowledge/ (one file per lesson), *Model / *Data / *Fig / Page per lesson
    │   ├── power/            # Power devices PWR-01–08: core/ (power, thermal models), knowledge/ (one file per lesson), *Model / *Data / *Fig / Page per lesson
    │   ├── fund/             # Digital test fundamentals
    │   ├── mos/              # MOSFET track lessons
    │   ├── pcb/              # PCB track lessons
    │   ├── ana/              # Analog track: core/ (rng, stats, FFT math), knowledge/ (one file per lesson: terms, extraLessons, faqs), *Model / *Data / *Fig / Page per lesson
    │   ├── hs/               # High-speed track: core/ (PRBS, jitter / Q-function math), knowledge/ (one file per lesson: terms, extraLessons, faqs), *Model / *Data / *Fig / Page per lesson
    │   ├── rf/               # RF track: core/ (units, dB and Friis math), knowledge/ (one file per lesson: terms, extraLessons, faqs), *Model / *Data / *Fig / Page per lesson
    │   ├── mem/              # Memory track: core/ (array, March engine), knowledge/ (one file per lesson: terms, extraLessons, faqs), *Model / *Data / *Fig / Page per lesson
    │   └── timing/           # Shared timing scope
```

All user-visible text goes through `loc()` / `useT()`—do not hard-code a single language in JSX. New strings must include both locales via `loc('中文', 'English')`.

---

## Scope and limits

- **Teaching illustrations only**—not an ATE vendor manual and not a substitute for real production test programs.
- Some numbers are labeled illustrative (e.g. bench tester channel counts, cost exercise amounts); do not treat them as fab data.
- Analog lessons (noise, LDO, ADC, PLL, and the capstone yield / Cpk) use simple models in `src/modules/ana/*Model.ts`; their limits and default verdicts are teaching values, not production limits.
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

- **Glossary:** Each track has its own term file (`src/glossary/termsMos.ts`, `termsPcb.ts`, `termsAna.ts`, `termsHs.ts`, `termsRf.ts`, `termsMem.ts`, …), and `src/glossary/terms.ts` merges them into `TERMS`. Add a new term to the file of the track that owns it: `{ id, term, name: loc(...), def: loc(...), lessons: [...] }`. `id` is lowercase letters, digits, and hyphens only—it becomes part of the URL; do not change it after publish. If the term exists, append to `lessons` instead of duplicating; the canonical entry stays under the earliest lesson in sort order.
- **Per-lesson knowledge (analog, high-speed, RF and memory):** Each analog lesson has `src/modules/ana/knowledge/<lessonId>.ts`, typed as `AnaKnowledge = { terms, extraLessons, faqs }` (see `knowledge/types.ts`). `knowledge/index.ts` lists them in lesson order; `src/glossary/termsAna.ts` and `src/faq/faqAna.ts` flatten them. The high-speed and RF lessons follow the same pattern in `src/modules/hs/knowledge/<lessonId>.ts` and `src/modules/rf/knowledge/<lessonId>.ts`, listed by their `index.ts` files and aggregated by `src/glossary/termsHs.ts` / `termsRf.ts` and `src/faq/faqHs.ts` / `faqRf.ts`. Memory lessons follow the same pattern in `src/modules/mem/knowledge/<lessonId>.ts`, listed by `src/modules/mem/knowledge/index.ts` and aggregated by `src/glossary/termsMem.ts` / `src/faq/faqMem.ts`. Put a lesson's terms, FAQs and cross-references in its knowledge file, and register any new file in the aggregator.
- **`extraLessons`:** Maps an existing term ID to extra lesson IDs, e.g. `{ 'measure-range': ['anaMeasure'] }`. `withExtraLessons` in `src/glossary/terms.ts` applies every such map to all terms (base, MOS, PCB, analog, high-speed, RF, memory) and de-duplicates the lesson list, so a lesson can add a cross-reference without editing the file that owns the term. Use this instead of defining the same term twice.
- **FAQ:** Each track has a group file (`src/faq/faqMos.ts`, `faqPcb.ts`, `faqAna.ts`, `faqHs.ts`, `faqRf.ts`, `faqMem.ts`), merged into `FAQ_GROUPS` in `src/faq/faq.ts`. Add `{ id, q: loc(...), a: loc(...), lessons: [...] }` to the right group's `items`; analog, high-speed, RF and memory FAQs live in the lesson's `knowledge/<lessonId>.ts`. Use `{@lessonId}` in answers and keep wording aligned with lessons. Fold useful “my question isn’t listed” feedback back into the same file.
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
- **术语表**（`#/glossary`）：从 D、F、T（MOS 管）、L（PCB）、A（模拟）、H（高速）、R（射频）、M（存储器）几条轨道汇总的术语，按课程或 A–Z 浏览，中英文搜索。同一个词只完整写一次，放在最早讲到它的那一课下面，并列出所有出处；每个词有自己的地址，如 `#/glossary/strobe`。
- **常见问题**（`#/faq`）：按主题分组的问答（覆盖数字、MOS、PCB、模拟、高速、射频与存储器轨道），可搜索、可折叠，答案里的课程编号能直接点。每条有自己的地址，如 `#/faq/strobe-early`。
- **问题反馈**：每页底部版权行旁、课程侧栏底部都有「反馈问题」，可选 GitHub Issue 或邮件，自动带上课程、地址、语言、主题和浏览器信息。

技术专有名词（ATE、DUT、VIH、Scan 等）两语都保留原文。

---

## 课程轨道

编号由轨道前缀 + 课序自动生成（如 `F01`、`D03`）。插入或调整课程后编号会重排，课文里用 `{@课程ID}` 引用，不会写死数字。

### 可以上课

| 轨道 | 前缀 | 课数 | 内容 |
|---|---|---|---|
| 预备 | B | 7 | 产业角色、简史、硅到 Die、封装与 CP/FT、元器件、数字认图、桌上测量——再进 D / F |
| 基础 / 数字 | D | 17 | 产业位置、3D 物理连接、ATE / PMU、规格、DC / 功能 / 时序与 AC、向量、Scan、程序与排错、Shmoo、虚拟 ALU、闩锁入口、STDF / Datalog、多 Site 成本、虚拟 ATE 工作站（含时序 / 漏电 / 图案台） |
| 数字测试基础 | F | 16 | 从欧姆定律讲起，按量产顺序走完开短路、DC、功能、AC、表征、向量、写程序、排错、闩锁和 Scan |
| 交互实验 | X | 2 | 自己设 Period / Drive / Strobe 和 Leakage 限流；虚拟 ATE 工作站跑 IDDQ 与开短路、读 Datalog、诊断故障 |
| 可靠性 / 车规 | Q | 9 | Latch-up 入口、浴盆曲线、加速模型、试验与样本量、Weibull 与 FIT、Burn-in、AEC-Q100 框架、晶圆 PAT，以及量产流程综合课 |
| 功率器件 | P | 8 | 器件选型、静态参数、开尔文连接、栅极电荷、双脉冲开关、UIS / SOA / 热阻、宽禁带测试，以及测试程序综合课 |
| MOS 管与数字电路 | T | 11 | MOS 管怎么导通、工作在哪个区，怎样搭反相器和逻辑门，板上怎么用、怎么选型 |
| PCB 入门 | L | 10 | PCB 怎么造出来、从设计到成品的流程，读懂 PCB 文件，设计规则与自查 |
| 模拟芯片 | A | 15 | Force / Measure、DC 与动态参数、ADC / DAC、LDO、PLL、Trim、统计，以及综合测试程序 |
| 高速接口 | H | 8 | 高速信号基础、传输与信号完整性、时序、抖动与噪声、眼图、接口测试、ATE 限制，以及综合课 |
| 射频测试 | R | 14 | dB / dBm、测试系统与链路、S 参数与匹配、增益、P1dB、IP3、噪声系数、谐波、相位噪声、调制、EVM / ACPR、校准，以及综合课 |
| 存储器测试 | M | 13 | 阵列结构、读写流程、故障模型、Pattern、March 测试、时序与 Shmoo、DRAM、DDR 训练、BIST 与修复 / ECC、并行测试、覆盖率与良率、Bin 分析，以及综合课 |

**基础 / 数字（D01–D17）**

| 编号 | 课程 |
|---|---|
| D01 | 什么是半导体测试？（含 STDF 结果记录） |
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
| D15 | STDF 与 Datalog：字节级浏览器、记录组装与校验、浏览器内解析自己的 `.stdf`（不上传），Pass/Fail、Bin 柱图、参数分布与 Cpk |
| D16 | Multi-site 与测试成本：Site 数与 UPH、并行效率、COT；按 `SITE_NUM` 分组找出注入的 Site 偏移 |
| D17 | 虚拟 ATE 操作系统：时序 / 漏电 / 图案台（原 D15 并入），再到 IDDQ 与开短路工作站（与 X02 同一课） |

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

**模拟（A01–A15）**

| 编号 | 课程 |
|---|---|
| A01 | 模拟芯片测试概述 |
| A02 | 电压、电流与测量基础 |
| A03 | ATE 模拟资源与负载板 |
| A04 | PMU / SMU 与 FVMI / FIMV |
| A05 | 连续时间信号与频率 |
| A06 | 采样定理与 ADC 采样 |
| A07 | 波形采集与 FFT |
| A08 | 模拟引脚漏电与静态电流判定 |
| A09 | LDO 测试 |
| A10 | ADC / DAC 静态参数 |
| A11 | ADC 动态参数 |
| A12 | PLL / 时钟测试 |
| A13 | Trim 与 OTP |
| A14 | 测试限值与统计 |
| A15 | 综合：混合信号芯片测试程序 |

**高速接口（H01–H08）**

| 编号 | 课程 |
|---|---|
| H01 | 高速信号基础 |
| H02 | 传输与信号完整性 |
| H03 | 时钟与数据时序 |
| H04 | 抖动与噪声 |
| H05 | 眼图分析 |
| H06 | 高速接口测试 |
| H07 | ATE 高速测试的限制 |
| H08 | 综合：高速接口测试 |

**射频测试（R01–R14）**

| 编号 | 课程 |
|---|---|
| R01 | RF 测试概述 |
| R02 | dB、dBm 与 dBc |
| R03 | RF 测试系统与链路 |
| R04 | 阻抗匹配与 S 参数 |
| R05 | 增益与插入损耗 |
| R06 | 输出功率与 P1dB |
| R07 | 线性度：IP3 与 IMD |
| R08 | 噪声系数 |
| R09 | 谐波与杂散 |
| R10 | 相位噪声 |
| R11 | 调制基础：I/Q 与星座图 |
| R12 | EVM 与 ACPR |
| R13 | RF 校准与误差 |
| R14 | 综合：RF 收发器测试 |

**存储器测试（M01–M13）**

| 编号 | 课程 |
|---|---|
| M01 | 存储器阵列结构 |
| M02 | 存储器读写流程 |
| M03 | 存储器故障模型 |
| M04 | Pattern 与数据背景 |
| M05 | March 测试 |
| M06 | 存储器时序测试 |
| M07 | DRAM 基础 |
| M08 | DDR / LPDDR 读写训练 |
| M09 | BIST、冗余修复与 ECC |
| M10 | 存储器并行测试 |
| M11 | 测试覆盖率与良率 |
| M12 | Bin 与失效分析 |
| M13 | 综合：存储器测试 |

### 大纲已列，课还没做

传感器 / CIS、硅光共封。首页能看到每条轨道要掌握什么。

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
├── scripts/check-vate.mjs  # D17 教学模型数值核对
├── scripts/check-gen.mjs   # D15–D16 STDF / Multi-site 模型数值核对
├── scripts/check-qual.mjs  # REL-01–08 可靠性数值核对（scripts/checks/qual-*.mjs）
├── scripts/check-power.mjs # PWR-01–08 功率器件数值核对（scripts/checks/power-*.mjs）
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
    ├── glossary/             # 术语表：terms.ts 汇总 termsMos、termsPcb、termsAna、termsHs、termsRf、termsMem 等 + 页面
    ├── faq/                  # 常见问题：faq.ts 汇总 faqMos、faqPcb、faqAna、faqHs、faqRf、faqMem 等 + 页面
    ├── i18n/                 # loc() / useT()，界面文案
    ├── tracks/catalog.ts     # 轨道、课序、lessonCode()
    ├── modules/
    │   ├── catalog.ts        # 稳定课程 ID（不含编号）
    │   ├── titles.ts
    │   ├── module00–17/      # 基础 / 数字（module09、module13 已并入相邻课）
    │   ├── vate/             # D17 虚拟 ATE 工作站（model/ 为纯函数模型；内含 module17/BenchLab.tsx 的时序 / 漏电 / 图案台）
    │   ├── gen/              # D15–D16 STDF 与 Datalog、Multi-site（model/ 为纯函数模型）
    │   ├── qual/             # 可靠性 REL-01–08：core/（可靠性、晶圆、PAT 模型）、knowledge/（每课一个文件），每课另有 *Model / *Data / *Fig / Page
    │   ├── power/            # 功率器件 PWR-01–08：core/（功率、热阻模型）、knowledge/（每课一个文件），每课另有 *Model / *Data / *Fig / Page
    │   ├── fund/             # 数字测试基础
    │   ├── mos/              # MOS 管轨道课程
    │   ├── pcb/              # PCB 轨道课程
    │   ├── ana/              # 模拟轨道：core/（随机数、统计、FFT 数学）、knowledge/（每课一个文件：术语、extraLessons、FAQ），每课另有 *Model / *Data / *Fig / Page
    │   ├── hs/               # 高速轨道：core/（PRBS、抖动 / Q 函数计算）、knowledge/（每课一个文件：术语、extraLessons、FAQ）、每课的 *Model / *Data / *Fig / Page
    │   ├── rf/               # 射频轨道：core/（dB / dBm、Friis 计算）、knowledge/（每课一个文件：术语、extraLessons、FAQ）、每课的 *Model / *Data / *Fig / Page
    │   ├── mem/              # 存储器轨道：core/（阵列、March 引擎）、knowledge/（每课一个文件：术语、extraLessons、FAQ）、每课的 *Model / *Data / *Fig / Page
    │   └── timing/           # 共用时序示波器
```

看到的文字都走 `loc()` / `useT()`，不要在 JSX 里写死一种语言。新文案必须中英文一起写：`loc('中文', 'English')`。

---

## 说明与边界

- 这是**教学示意**，不是某家 ATE 的操作手册，也不替代真实测试程序。
- 部分数字标了「示意」（例如台式测试机通道数、成本练习金额），不要当产线数据用。
- 模拟课里的噪声、LDO、ADC、PLL，以及综合课的良率与 Cpk，用的是 `src/modules/ana/*Model.ts` 里的简化模型；限值和默认判定是教学取值，不是产线限值。
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

- **术语**：每条轨道有自己的术语文件（`src/glossary/termsMos.ts`、`termsPcb.ts`、`termsAna.ts`、`termsHs.ts`、`termsRf.ts`、`termsMem.ts` 等），`src/glossary/terms.ts` 把它们合并成 `TERMS`。新词加在所属轨道的文件里：`{ id, term, name: loc('中文名', 'English name'), def: loc('解释', 'Definition'), lessons: [...] }`。`id` 只用小写字母、数字、连字符，是地址的一部分，发布后别改。同一个词已经有了就只往 `lessons` 里加课程，不要另起一条；主词条会自动放到课序最靠前的那一课下面。
- **模拟 / 高速 / 射频 / 存储器的课内知识**：每课一个文件 `src/modules/ana/knowledge/<课程ID>.ts`，类型是 `AnaKnowledge = { terms, extraLessons, faqs }`（见 `knowledge/types.ts`）。`knowledge/index.ts` 按课序列出它们；`src/glossary/termsAna.ts` 和 `src/faq/faqAna.ts` 把词条与 FAQ 摊平。高速课同样放在 `src/modules/hs/knowledge/<课程ID>.ts`，由 `src/modules/hs/knowledge/index.ts` 按课序列出，再由 `src/glossary/termsHs.ts`、`src/faq/faqHs.ts` 汇总。射频课放在 `src/modules/rf/knowledge/<课程ID>.ts`，由 `src/modules/rf/knowledge/index.ts` 列出，再由 `termsRf.ts`、`faqRf.ts` 汇总。存储器课放在 `src/modules/mem/knowledge/<课程ID>.ts`，由 `src/modules/mem/knowledge/index.ts` 列出，再由 `termsMem.ts`、`faqMem.ts` 汇总。课的术语、FAQ 和交叉引用写在它的 knowledge 文件里；新文件要加进对应的汇总文件。
- **`extraLessons`**：把已有词条的 ID 映射到额外的课程 ID，例如 `{ 'measure-range': ['anaMeasure'] }`。`src/glossary/terms.ts` 里的 `withExtraLessons` 把所有这类映射应用到全部词条（基础、MOS、PCB、模拟、高速、射频、存储器），并对课程列表去重，所以不必改词条所在的文件就能加交叉引用。同一个词不要定义两次，用这个机制代替。
- **FAQ**：每条轨道有自己的分组文件（`src/faq/faqMos.ts`、`faqPcb.ts`、`faqAna.ts`、`faqHs.ts`、`faqRf.ts`、`faqMem.ts`），在 `src/faq/faq.ts` 里合并成 `FAQ_GROUPS`。把 `{ id, q: loc(...), a: loc(...), lessons: [...] }` 加到对应分组的 `items`；模拟、高速、射频和存储器课的问答写在该课的 `knowledge/<课程ID>.ts` 里。答案里用 `{@课程ID}` 引用课程，口径要和课文一致。「我的问题不在这里」收到的问题，整理后也补到同一个文件里。
- **反馈地址**：GitHub 仓库和邮箱在 `src/site.ts`，换仓库时只改这一处。

---

## 许可证

[MIT](LICENSE)。可以自由使用、修改和再分发，保留版权与许可声明即可。
