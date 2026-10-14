# 预备轨道大纲（已拍板）

> **状态**：**已实现**（`src/modules/prep/`）。显示课号为 **B01–B07**（前缀 `B`：`power` 轨已占用 `P`）。  
> **讲稿**：[`docs/prep/`](prep/) 仍可作内容校对参考。  
> **轨道 ID**：`prep`  
> **首页标题**：预备 / Prep  
> **定位**：零基础 / 转岗入门，先补产业与电学底子，再进「基础 / 数字」(D) 或「数字测试基础」(F)。

## 已拍板决定

| # | 项 | 决定 |
|---|---|---|
| 1 | 轨道名 | **预备**（英：Prep） |
| 2 | P06 vs F01 | **方案 A**：P06 更短、偏认图；F01 保留完整深度 |
| 3 | 开课范围 | **七课全做** |
| 4 | 首页状态 | **与其它已开课轨道一致**：课做成后 `ready: true`，可直接上课 |
| 5 | 深度 | **每课都要互动图 + 当堂判题** |
| 6 | 历史课 | **保留** P02 |
| 7 | 文案节奏 | **先写中文讲稿**（本目录）；实现进代码时再补 `loc()` 英文 |

## 与现有课程的边界

| 本轨道 | 现有课 | 边界 |
|---|---|---|
| P01 产业 | D01 | D01 侧重测试在链路上的位置；P01 讲整条产业链与角色分工 |
| P02 历史 | （无） | 全新 |
| P03 硅→芯片 | F02 | F02 偏设备与现场；P03 偏 Fab 工艺主线（到划片） |
| P04 封装与测试 | D01 / D02 / F02 | 封装形态 + CP/FT 概念；物理接法留给 D02，本轨不做 3D |
| P05 元器件 | （无） | 全新 |
| P06 数字电路 | F01 | P06 浅、认图；F01 更深 |
| P07 定律与测量 | F01 / F03 | 桌上怎么量；Force/Measure 留给 F/D |

**原则**：预备轨讲「为什么 / 叫什么 / 怎么量（桌上）」；D/F 讲「ATE 上怎么测、程序怎么写」。

## 课表

| 课号 | 稳定 ID（实现用） | 中文标题 | 讲稿 |
|---|---|---|---|
| P01 | `pIndustry` | 半导体产业 | [p01-industry.md](prep/p01-industry.md) |
| P02 | `pHistory` | 半导体简史 | [p02-history.md](prep/p02-history.md) |
| P03 | `pSilicon` | 从硅到芯片 | [p03-silicon.md](prep/p03-silicon.md) |
| P04 | `pPackage` | 封装与测试 | [p04-package.md](prep/p04-package.md) |
| P05 | `pParts` | 电子元器件 | [p05-parts.md](prep/p05-parts.md) |
| P06 | `pDigital` | 数字电路基础 | [p06-digital.md](prep/p06-digital.md) |
| P07 | `pMeasure` | 基本定律与测量 | [p07-measure.md](prep/p07-measure.md) |

## 轨道文案草案

- **blurb**：产业与历史、硅到封装、元器件与数字底子、桌上怎么量——再进 D / F 测法主线。  
- **首页位置**：建议排在「基础 / 数字」之前。

## Review 通过后实现顺序（预告）

1. `TrackId` + `TRACKS` 增加 `prep`  
2. `modules/catalog.ts` 增加稳定 ID  
3. 按讲稿落地 `LessonFrame` + 互动图 + Quiz，文案 `loc('中文', 'English')`  
4. README 补预备轨说明  
5. `npm run check:i18n` + build  
