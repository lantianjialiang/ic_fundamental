import { loc, type LText } from '../../../i18n/locale'

export const Z_S = {
  title: loc('阻抗控制：线宽、介质厚度与介电常数', 'Controlled impedance: width, dielectric height and Er'),
  note: loc(
    '信号边沿很快时，走线像一根传输线，每一点都有特性阻抗 Z0。先选表层微带或内层带状，再拖滑块，看哪些量让 Z0 变大，哪些让它变小。',
    'When edges are fast, a trace behaves as a transmission line with a characteristic impedance Z0 at every point. Pick outer microstrip or inner stripline, then drag the sliders to see what raises Z0 and what lowers it.',
  ),
  kicker: loc('阻抗', 'Impedance'),
  ext: loc('表层微带线', 'Outer microstrip'),
  int: loc('内层带状线', 'Inner stripline'),
  er: loc('介电常数 Er', 'Dielectric constant Er'),
  h: loc('介质厚度 h（线到一侧参考层）', 'Dielectric height h (trace to one plane)'),
  w: loc('线宽 w', 'Trace width w'),
  z0: loc('特性阻抗 Z0', 'Characteristic impedance Z0'),
  ratio: loc('w / h', 'w / h'),
  inRange: loc('在公式适用范围内', 'Inside the formula\'s range'),
  outRange: loc('超出适用范围，结果不可信', 'Outside the range, result unreliable'),
  range: loc('适用范围', 'Valid range'),
  sens: loc('各量放大 20 % 时 Z0 的变化', 'Change in Z0 when each quantity grows 20 %'),
  cap: loc(
    '表层微带线剖面：铜线在上，下面隔着介质（厚度 h）是参考平面（地），上方是空气。铜厚固定为 1 oz = 0.035 mm。电场线从线的两侧和底部连到参考平面；线越宽、离平面越近，电容越大，Z0 越低。',
    'Cross-section of a surface microstrip: copper trace on top, dielectric of height h below it, then the reference plane (ground), air above. Copper is fixed at 1 oz = 0.035 mm. Field lines run from the trace sides and bottom to the plane; a wider trace or a nearer plane gives more capacitance and a lower Z0.',
  ),
  capInner: loc(
    '内层对称带状线剖面：走线夹在上下两个参考平面之间，两侧介质厚度都是 h，上方没有空气。同样的 w 和 h，对地电容大约是微带的两倍，所以 Z0 明显更低。铜厚固定为 1 oz = 0.035 mm。',
    'Cross-section of a centered inner stripline: the trace sits between two reference planes, each a height h away, with no air above. For the same w and h the capacitance to the planes is about twice that of microstrip, so Z0 is clearly lower. Copper is fixed at 1 oz = 0.035 mm.',
  ),
  capH: loc('介质 h', 'Dielectric h'),
  capGnd: loc('参考平面（地）', 'Reference plane (ground)'),
  capTop: loc('上参考平面', 'Upper plane'),
  capBot: loc('下参考平面', 'Lower plane'),
  capAir: loc('空气', 'Air'),
  capW: loc('线宽 w', 'Width w'),
  capT: loc('铜厚 t', 'Copper t'),
}

export const Z_NOTES: LText[] = [
  loc(
    '表层是微带线（IPC-2141）：Z0 = 87 / √(Er + 1.41) × ln(5.98·h / (0.8·w + t))。内层是对称带状线：Z0 = 60 / √Er × ln(1.9·(2h + t) / (0.8·w + t))，h 是线到一侧平面的介质厚度。单位 Ω，h、w、t 用同一单位。常引用的适用范围是 0.1 < w/h < 2.0 且 1 < Er < 15。两式都是近似：误差常有百分之十几，没有考虑阻焊、线的梯形截面和板材 Er 随频率的变化。真正做 50 Ω 或 90 Ω 差分，要用板厂给的叠层和场求解器（或板厂的阻抗计算）核对，板厂还会按公差调线宽。',
    'Outer layers are microstrip (IPC-2141): Z0 = 87 / √(Er + 1.41) × ln(5.98·h / (0.8·w + t)). Inner layers are centered stripline: Z0 = 60 / √Er × ln(1.9·(2h + t) / (0.8·w + t)), with h the dielectric to one plane. Values are in ohms, with h, w and t in the same unit. The range usually quoted is 0.1 < w/h < 2.0 and 1 < Er < 15. Both formulas are approximate: errors of ten-odd percent are common, and they ignore solder mask, the trapezoid trace section and Er varying with frequency. For a real 50 Ω or 90 Ω differential target, check against the fab’s stack-up with a field solver (or the fab’s own calculator); the fab also adjusts width to its tolerance.',
  ),
  loc(
    '定性规律两边一样：介质越厚（h 大），线离参考平面越远，对地电容小，Z0 变大；线越宽（w 大），对地电容大，Z0 变小；Er 越大，电容越大，Z0 变小；铜越厚，Z0 稍微变小。同样的 w、h、Er，带状线夹在两张平面中间，电容大约是微带的两倍，所以 Z0 更低——同样要 50 Ω，内层通常要比表层走得更宽，或者把介质做得更厚。这正是叠层（见 {@pcbStack}）和线宽要一起定的原因。',
    'The qualitative rules are the same on both layers: a thicker dielectric (larger h) puts the trace farther from the plane, so capacitance falls and Z0 rises; a wider trace (larger w) adds capacitance and lowers Z0; a larger Er adds capacitance and lowers Z0; thicker copper lowers Z0 slightly. For the same w, h and Er a stripline sits between two planes, so capacitance is about twice that of microstrip and Z0 is lower — the same 50 Ω target usually needs a wider inner trace or a thicker dielectric. That is why the stack-up (see {@pcbStack}) and the trace width are decided together.',
  ),
]

export const Z_VARS: Array<{ id: 'h' | 'w' | 'er'; label: LText }> = [
  { id: 'h', label: loc('介质厚度 h ↑', 'Height h ↑') },
  { id: 'w', label: loc('线宽 w ↑', 'Width w ↑') },
  { id: 'er', label: loc('介电常数 Er ↑', 'Er ↑') },
]

export const TAKEAWAY: LText[] = [
  loc('网络是「连在一起的引脚」，网表是网络清单，位号全板唯一；封装 = 焊盘 + 轮廓。', 'A net is pins tied together, the netlist lists the nets, and designators are unique on the board; a footprint is pads plus an outline.'),
  loc('线宽按 I = k·ΔT^0.44·A^0.725 估算：内层 k 只有外层一半，散热差所以更宽；厂里电源线常按表层 0.5 mm、内层 1 mm 走，留余量。IPC-2152 更新更准，2221 偏保守。', 'Estimate width from I = k·ΔT^0.44·A^0.725: the internal k is half the external one because heat escapes poorly, so inner traces must be wider; shop power traces are often 0.5 mm outer and 1 mm inner, with margin. IPC-2152 is newer and more accurate, 2221 is conservative.'),
  loc('爬电距离沿表面量，电气间隙在空气里量；开槽只加长爬电，而且槽要够宽，否则灰尘填满就没用。', 'Creepage is measured along the surface and clearance through air; a slot only lengthens creepage, and it must be wide enough or dust fills it and it does nothing.'),
  loc('接地大铜皮上的通孔脚用热焊盘，让焊盘能升温；孤岛要删，否则成了天线。', 'Use thermal reliefs on through-hole pins in a big ground pour so the pad can heat up; remove islands, which act as antennas.'),
  loc('Fiducial：1 mm 铜点加 2–3 mm 阻焊开窗；极性、1 脚要标在装好后看得见的位置；关键网络留测试点。', 'Fiducial: a 1 mm copper dot in a 2–3 mm mask opening; mark polarity and pin 1 where they stay visible once placed; leave test points on key nets.'),
  loc('表层微带、内层带状的 Z0 都随介质厚度变大、随线宽和 Er 变小；同样几何下内层 Z0 更低。公式只是近似，在 0.1 < w/h < 2 内用，以板厂叠层为准。', 'Both outer microstrip and inner stripline Z0 rise with dielectric height and fall with width and Er; for the same geometry the inner Z0 is lower. The formulas are approximate and meant for 0.1 < w/h < 2; the fab stack-up is authoritative.'),
  loc('钢网开口决定焊料量：体积 = 开口面积 × 钢网厚度；散热焊盘用小方块窗格，覆盖约 50–80 %。', 'The stencil aperture sets the solder amount: volume = aperture area × stencil thickness; use a windowpane for the exposed pad at about 50–80 % coverage.'),
]

export const FOOT_S = {
  title: loc('封装与焊盘对照：点焊盘看钢网开口', 'Footprint and land pattern: click a pad to see the stencil aperture'),
  note: loc(
    '先选一个封装，再点任一焊盘。右边是这个焊盘上的钢网开口和锡膏量。',
    'Pick a footprint, then click any pad. The right side shows the stencil aperture and paste volume on that pad.',
  ),
  kicker: loc('封装与焊盘', 'Footprint and pad'),
  modeFull: loc('1:1 开口', '1:1 aperture'),
  modeCut: loc('缩小开口', 'Reduced aperture'),
  modeWin: loc('窗格 windowpane', 'Windowpane'),
  thick: loc('钢网厚度', 'Stencil thickness'),
  ratio: loc('开口面积比', 'Aperture area share'),
  cover: loc('EP 窗格覆盖率', 'EP window coverage'),
  pad: loc('焊盘', 'Pad'),
  padSize: loc('焊盘尺寸', 'Pad size'),
  apSize: loc('开口尺寸', 'Aperture size'),
  area: loc('开口面积', 'Aperture area'),
  vol: loc('锡膏体积 = 面积 × 厚度', 'Paste volume = area × thickness'),
  ar: loc('面积比 AR', 'Area ratio AR'),
  total: loc('整个封装锡膏体积', 'Whole footprint paste'),
  epShare: loc('EP 占比', 'EP share'),
  arOk: loc('≥ 0.66，脱模好', '≥ 0.66, releases well'),
  arBad: loc('< 0.66，脱模差', '< 0.66, releases poorly'),
  cap: loc(
    '左：焊盘图形（金色），虚线是元件外形，金点是 1 脚，蓝框是当前选中的焊盘。右：该焊盘放大，金色是焊盘，蓝色是钢网开口。尺寸是教学用典型值，实际按器件手册推荐焊盘。',
    'Left: the pad pattern (gold), dashed outline is the part body, the gold dot is pin 1, the blue frame is the selected pad. Right: that pad enlarged, gold is the pad, blue is the stencil aperture. Sizes are typical teaching values; use the datasheet\'s recommended land pattern in practice.',
  ),
  capPad: loc('焊盘', 'Pad'),
  capAp: loc('钢网开口', 'Aperture'),
  capBody: loc('元件外形', 'Part body'),
}

export const FOOT_NOTES: LText[] = [
  loc(
    '焊盘图形（land pattern）不等于元件外形：焊盘要向引脚外侧伸出一截形成焊脚，向内也留空间，还要和相邻焊盘留足间隙，这个设计规则来自 IPC-7351。钢网（stencil）是一片不锈钢薄板，开口对着焊盘，刮刀把锡膏刮进开口再留在焊盘上；锡膏体积 = 开口面积 × 钢网厚度，常用厚度 0.10–0.12 mm，细间距元件用更薄的。',
    'The land pattern is not the part outline: pads extend beyond the lead to form a fillet, leave room inside, and keep clearance to neighbouring pads; the rules come from IPC-7351. The stencil is a thin stainless-steel sheet with apertures over the pads; a squeegee wipes paste into the apertures and leaves it on the pads. Paste volume = aperture area × stencil thickness; 0.10–0.12 mm is common and fine-pitch parts use thinner.',
  ),
  loc(
    '开口常取 1:1，也会缩小一点：小片式元件缩小是为了减少锡珠和立碑，细间距焊盘缩小是为了防桥连。EP 大焊盘则开成窗格，窗格间的钢网挡住锡膏：一是少印锡，元件不会浮在一大片熔融焊料上、倾斜或移位；二是窗格间留出通道，助焊剂挥发的气体能跑掉，空洞少。覆盖率约 50–80 %，再低散热不够。',
    'Apertures are often 1:1 but sometimes shrunk: on chip parts to reduce solder balls and tombstoning, on fine-pitch pads to avoid bridging. A large EP gets a windowpane so the stencil between windows holds paste back: less paste, so the part does not float, tilt or shift on a pool of molten solder, and channels between the windows let flux gas escape, so there are fewer voids. About 50–80 % coverage; lower leaves too little heat path.',
  ),
  loc(
    '面积比 AR = 开口面积 / 孔壁面积，经验上要 ≥ 0.66，锡膏才能顺利从孔壁脱开留在焊盘上；窄开口配厚钢网时 AR 会下降，这就是细间距要用薄钢网的原因。回流后焊料体积约为锡膏体积的一半左右（锡膏里一半体积是助焊剂，会挥发）。',
    'Area ratio AR = aperture area / aperture wall area; the rule of thumb is AR ≥ 0.66 so paste releases from the walls and stays on the pad. A narrow aperture with a thick stencil lowers AR, which is why fine pitch needs a thin stencil. After reflow the solder volume is roughly half the paste volume (about half of the paste is flux, which burns off).',
  ),
]
