import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('数据手册里的输出电容 Coss 由哪两个寄生电容组成？', 'Which two parasitic capacitors make up the datasheet output capacitance Coss?'),
    options: [
      { id: 'a', text: loc('Cgs + Cgd', 'Cgs + Cgd') },
      { id: 'b', text: loc('Cds + Cgd', 'Cds + Cgd') },
      { id: 'c', text: loc('Cgs + Cds', 'Cgs + Cds') },
    ],
    answer: 'b',
    explain: loc(
      '测 Coss 时栅极对源极交流短路，Cgs 被短掉，从漏极看进去剩下 Cds 和 Cgd 并联。Cgs + Cgd 是输入电容 Ciss。',
      'Coss is measured with the gate AC-shorted to the source, which shorts Cgs out, so from the drain Cds and Cgd remain in parallel. Cgs + Cgd is the input capacitance Ciss.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('开通时示波器上看到：Vgs 稳在约 2.5 V 不动，Vds 从 12 V 一路往下掉，Id 已是 5 A。这时处于哪个阶段？', 'During turn-on the scope shows Vgs sitting at about 2.5 V, Vds falling from 12 V, and Id already at 5 A. Which stage is this?'),
    options: [
      { id: 'a', text: loc('给 Cgs 充电，Vgs 还没到 Vth', 'Charging Cgs, Vgs not yet at Vth') },
      { id: 'b', text: loc('电流上升，Vds 仍约等于 VDD', 'Current rising, Vds still near VDD') },
      { id: 'c', text: loc('米勒平台', 'The Miller plateau') },
    ],
    answer: 'c',
    explain: loc(
      'Id 已经等于负载电流，Vgs 被它定在平台电压；栅极电流全部给 Cgd 充电，Vds 才会下降。前两个阶段 Vds 都还在 VDD。',
      'Id already equals the load current, which pins Vgs at the plateau voltage; all gate current charges Cgd, which is what lets Vds fall. In the first two stages Vds is still at VDD.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('其他条件不变，把栅极电阻 Rg 增大一倍，米勒平台时长大约怎么变？', 'With everything else unchanged, doubling the gate resistor Rg changes the Miller plateau duration by roughly what?'),
    options: [
      { id: 'a', text: loc('缩短一半', 'It halves') },
      { id: 'b', text: loc('增加一倍', 'It doubles') },
      { id: 'c', text: loc('基本不变', 'It stays about the same') },
    ],
    answer: 'b',
    explain: loc(
      '平台上栅极电流约 (Vdrive − Vpl) / Rg，要给 Cgd 充的电荷 Qgd 不变，时间 = Qgd / Ig，Rg 翻倍则 Ig 减半，时间翻倍。',
      'The gate current on the plateau is about (Vdrive − Vpl) / Rg and the charge Qgd to supply is unchanged, so time = Qgd / Ig; doubling Rg halves Ig and doubles the time.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('VDD = 12 V，负载 5 A，tr = 20 ns，tf = 30 ns，f = 100 kHz。按 ½·V·I·(tr+tf)·f 估算开关损耗约是？', 'VDD = 12 V, load 5 A, tr = 20 ns, tf = 30 ns, f = 100 kHz. About how large is the switching loss from ½·V·I·(tr+tf)·f?'),
    options: [
      { id: 'a', text: loc('0.15 W', '0.15 W') },
      { id: 'b', text: loc('0.3 W', '0.3 W') },
      { id: 'c', text: loc('1.5 W', '1.5 W') },
    ],
    answer: 'a',
    explain: loc(
      '½ × 12 V × 5 A × 50 ns = 1.5 µJ 每周期，乘 100 kHz 得 0.15 W。注意系数是 ½：电压下降和电流上升大致是三角形交叠。',
      '½ × 12 V × 5 A × 50 ns = 1.5 µJ per cycle, and times 100 kHz gives 0.15 W. The factor ½ is there because voltage and current cross roughly as a triangle.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('CMOS 输出级 Ron 约 200 Ω，负载电容 10 pF。输出变化的传播延时（50%）约是？', 'A CMOS output stage has Ron of about 200 Ω and a 10 pF load. About what is the 50% propagation delay of the output?'),
    options: [
      { id: 'a', text: loc('0.14 ns', '0.14 ns') },
      { id: 'b', text: loc('1.4 ns', '1.4 ns') },
      { id: 'c', text: loc('14 ns', '14 ns') },
    ],
    answer: 'b',
    explain: loc(
      'τ = Ron · C = 200 Ω × 10 pF = 2 ns，延时 ≈ 0.69 τ ≈ 1.4 ns，因为输出到一半电压的时刻是 ln2 · τ。',
      'τ = Ron · C = 200 Ω × 10 pF = 2 ns, so the delay ≈ 0.69 τ ≈ 1.4 ns, because the output reaches half voltage at ln2 · τ.',
    ),
  },
]
