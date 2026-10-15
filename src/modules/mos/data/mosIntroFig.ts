import { loc, type LText } from '../../../i18n/locale'
import { type TermId } from './mosIntro'

/** 图里的文字（SVG 标注、图注、aria-label） */

export const SW_FIG = {
  cap: loc(
    '同一个电路：VDD 经 RL 接到 D（或开关），S 接地。左边是理想开关（闭合时压降为 0），右边是真实 NMOS（导通后像一个电阻，所以 Vout 到不了 0）。',
    'The same circuit: VDD through RL to D (or the switch), S to ground. Left is an ideal switch (0 V drop when closed); right is the real NMOS (a resistor when on, so Vout does not reach 0).',
  ),
  analogy: loc('开关类比', 'Switch analogy'),
  real: loc('真实 NMOS', 'Real NMOS'),
  closed: loc('闭合', 'Closed'),
  open: loc('断开', 'Open'),
  rail: 'VDD',
  vout: 'Vout',
}

export const TERM_FIG = {
  title: loc('NMOS 4 端符号', 'NMOS 4-terminal symbol'),
  cap: loc('点击符号上的 G、D、S、B；高亮的引线就是被选中的端子。', 'Click G, D, S or B on the symbol; the highlighted lead is the selected terminal.'),
  brief: {
    g: loc('控制端，直流几乎不取电流', 'Control, almost no DC current'),
    d: loc('电流出口，接负载', 'Current path, to the load'),
    s: loc('电流入口，Vgs 的参考点', 'Current path, Vgs reference'),
    b: loc('衬底，接最低电位', 'Substrate, at the lowest potential'),
  } as Record<TermId, LText>,
}

export const SYM_FIG = {
  cap: loc(
    '左边是电路符号，右边是对应的实物封装；点击任意一边的元件，NMOS / PMOS 同时切换。引脚为典型排列，不同型号可能不同。',
    'Left is the circuit symbol, right the matching real package; click either one and NMOS / PMOS switch together. Pinouts are typical and may differ between parts.',
  ),
  symTitle: loc('电路符号', 'Circuit symbol'),
  pkgTitle: loc('实物封装', 'Real package'),
  hint: loc('点击切换 NMOS / PMOS', 'Click to switch NMOS / PMOS'),
  typical: loc('典型引脚，以数据手册为准', 'Typical pinout, check the datasheet'),
  tab: loc('金属片 = D', 'Metal tab = D'),
  sameBody: loc('NMOS 与 PMOS 外形相同', 'NMOS and PMOS look the same'),
  rare: loc('耗尽型少见，查数据手册', 'Depletion parts are rare; see datasheet'),
  symAria: loc('电路符号，点击切换 NMOS / PMOS', 'Circuit symbol, click to switch NMOS / PMOS'),
  pkgAria: loc('实物封装，点击切换 NMOS / PMOS', 'Real package, click to switch NMOS / PMOS'),
  tagThree: loc('B 接 S', 'B tied to S'),
  tagFour: loc('B 单独引出', 'B separate'),
}

export const INTRO_RD = {
  kind: loc('类型', 'Type'),
  style: loc('端数', 'Terminals'),
  part: loc('举例型号', 'Example part'),
  pins: loc('引脚 1 / 2 / 3', 'Pins 1 / 2 / 3'),
  vout: 'Vout',
}

export const TERM_ARIA = (name: string) => loc(`端子 ${name}`, `Terminal ${name}`)
