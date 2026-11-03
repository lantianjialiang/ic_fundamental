import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const lesson = 'picCutback' as ModuleId

/** PIC-07 晶圆级光电测试与 cut-back */
export const PIC_CUTBACK_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-cutback',
      term: 'Cut-back',
      name: loc('截断法（cut-back）', 'Cut-back'),
      def: loc(
        '用不同长度的波导做插入损耗对长度的直线回归。斜率是传输损耗（dB/cm），截距是两端耦合之和，所以 GC 损耗是截距的一半。见 {@picCutback}。',
        'A straight-line fit of insertion loss against length for several waveguide lengths. The slope is propagation loss (dB/cm), the intercept is the sum of the two couplers, and the GC loss is half the intercept. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-kgd',
      term: 'Known-good die',
      name: loc('已知良好裸片（KGD）', 'Known-good die (KGD)'),
      def: loc(
        '在送去昂贵组装之前就已经测过、判定为好的裸片。坏片留在晶圆级报废，不把后面的 ASIC 一起丢掉。见 {@picCutback}。',
        'A die that has already been tested and judged good before it is sent into an expensive assembly. A bad die is scrapped at wafer level instead of taking an ASIC with it. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-wafer-optic',
      term: 'Wafer-level photonic test',
      name: loc('晶圆级光电测试', 'Wafer-level photonic test'),
      def: loc(
        '在晶圆上同时做电学项（加热器、PD 暗电流）和光学项（传输谱、耦合）。光学要对准，所以慢，量产靠测试结构和抽样。见 {@picCutback}。',
        'Electrical items (heaters, PD dark current) and optical items (a spectrum, coupling) measured on the wafer. Optics needs alignment, so it is slow, and production relies on test structures and sampling. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-dark-screen',
      term: 'Dark-current screen',
      name: loc('暗电流筛选', 'Dark-current screen'),
      def: loc(
        '用 PD 暗电流做的电学快速筛选。它比光学扫描快，应排在光学测试之前，坏的探测器不必再上光学台。见 {@picCutback}。',
        'A fast electrical screen that uses PD dark current. It is quicker than an optical sweep and should run first, so a bad detector never reaches the optical bench. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    'sns-dark-current': [lesson],
    'insertion-loss': [lesson],
    wafer: [lesson],
  },
  faqs: [
    {
      id: 'pic-cutback-intercept',
      q: loc('GC 损耗为什么不是截距？', 'Why is the GC loss not the intercept?'),
      a: loc(
        '截距是长度为零时剩下的损耗，也就是两端耦合之和。一边一个光栅时，一个 GC 的损耗是截距的一半。见 {@picCutback}。',
        'The intercept is the loss left at zero length, which is the sum of the two couplers. With one grating at each end, one GC is half the intercept. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-cutback-dark',
      q: loc('暗电流筛选为什么要排在光学前面？', 'Why does the dark-current screen run before the optical test?'),
      a: loc(
        '暗电流是电学量，一次就能读完。光学要移动光纤并对准，慢得多。先用电学把坏的 PD 筛掉，就不必再花光学时间。见 {@picCutback}。',
        'Dark current is electrical and is read in one shot. Optics moves a fiber and aligns it, which is much slower. Screening out a bad PD electrically first saves that optical time. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-cutback-two-point',
      q: loc('两个长度做回归够不够？', 'Are two lengths enough for the regression?'),
      a: loc(
        '两点一定能画出一条直线，但对准噪声和耦合重复性会整段抬高或压低某一点，斜率和截距都会偏。教学上至少要用三个以上长度，才能看出哪一点离群。截距是两端耦合之和，不是单个 GC。见 {@picCutback}。',
        'Two points always make a line, but alignment noise and coupling repeatability lift or drop one point and bias both slope and intercept. Teaching uses at least three lengths so an outlier shows. The intercept is the sum of the two couplers, not one GC. See {@picCutback}.',
      ),
      lessons: [lesson],
    },
  ],
}
