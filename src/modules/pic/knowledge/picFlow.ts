import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const lesson = 'picFlow' as ModuleId

/** PIC-09 CPO 流程、良率连乘与光学并行 */
export const PIC_FLOW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-shift-left',
      term: 'Shift-left testing',
      name: loc('测试前移', 'Shift-left testing'),
      def: loc(
        '把缺陷尽量在贴上昂贵的 ASIC 之前找出来。坏的 PIC 在晶圆或引擎测试报废，ASIC 就不用跟着丢。见 {@picFlow}。',
        'Finding a defect before an expensive ASIC is attached. A bad PIC is scrapped at wafer or engine test, so the ASIC is not thrown away with it. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-yield-product',
      term: 'Yield product',
      name: loc('良率连乘', 'Yield product'),
      def: loc(
        '多颗器件都要是好的时候，总良率是各项良率的乘积。无 KGD 时，封装良率是 y_ASIC × y_engine^n。见 {@picFlow}。',
        'When several devices all have to be good, the total yield is the product of the yields. With no KGD, the package yield is y_ASIC × y_engine^n. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-optical-parallel',
      term: 'Optical parallelism',
      name: loc('光学并行度', 'Optical parallelism'),
      def: loc(
        '同时测的光学通道组数 N。UPH = 3600 / (对准时间/N + 其他时间)。光纤要对准，所以 N 做不到电学多站点那么高。见 {@picFlow}。',
        'The number N of optical channel groups tested at once. UPH = 3600 / (align time/N + other time). Fibers have to be aligned, so N cannot reach an electrical multi-site count. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-oe-test',
      term: 'Opto-electronic test',
      name: loc('光电混合测试', 'Opto-electronic test'),
      def: loc(
        '同一条流程里既有电学插入点，也有光学插入点。电学快，光学慢在对准上。报废成本随阶段升高，晶圆便宜，贴上 ASIC 之后贵。见 {@picFlow}。',
        'A flow that has both electrical and optical insertions. Electrical steps are fast, and optical steps are slow because of alignment. Scrap cost grows by stage: a wafer is cheap, and a scrap after the ASIC is attached is expensive. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    stdf: [lesson],
    'burn-in': [lesson],
  },
  faqs: [
    {
      id: 'pic-flow-kgd',
      q: loc('没有 KGD 时，8 个 0.98 的引擎和 0.95 的 ASIC，封装良率是多少？', 'With no KGD, what is the package yield of eight 0.98 engines and a 0.95 ASIC?'),
      a: loc(
        '0.95 × 0.98^8 ≈ 0.808。坏引擎要到贴上 ASIC 之后才暴露，ASIC 会一起报废。打开 KGD 并把引擎测试留着，坏引擎只按引擎成本报废。见 {@picFlow}。',
        '0.95 × 0.98^8 ≈ 0.808. A bad engine is found only after the ASIC is attached, and the ASIC is scrapped with it. With KGD on and the engine test left enabled, a bad engine is scrapped at the engine cost only. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-flow-uph',
      q: loc('光学并行为什么比电学多站点难？', 'Why is optical parallelism harder than electrical multi-site?'),
      a: loc(
        '电学多站点是多扎探针。光学每一组都要光纤对准，对准时间除以 N 之后仍然占大头。UPH = 3600 / (对准时间/N + 其他时间)。见 {@picFlow}。',
        'Electrical multi-site is more probe needles. Each optical group has to align a fiber, so the align time divided by N still dominates. UPH = 3600 / (align time/N + other time). See {@picFlow}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-flow-not-every-step',
      q: loc('是不是每一步都做完整光学测试最安全？', 'Is a full optical test at every step the safest choice?'),
      a: loc(
        '不是。光学对准慢，每步都扫一遍会把 UPH 压垮，也把便宜阶段的良品成本抬高。测试前移要的是在贴 ASIC 之前抓住会报废引擎的缺陷，不是每站重复同一张谱。晶圆级先用电学暗电流筛，抽样做 cut-back；引擎级再对准和测链路。见 {@picFlow}。',
        'No. Optical alignment is slow. Sweeping at every step crushes UPH and raises the cost of good parts at a cheap stage. Shift-left means catching defects that would scrap the engine before the ASIC is attached, not repeating the same spectrum at every station. Screen dark current electrically at wafer, sample cut-back, then align and measure the link at engine. See {@picFlow}.',
      ),
      lessons: [lesson],
    },
  ],
}
