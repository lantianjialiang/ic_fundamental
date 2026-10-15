import { loc, type LText } from '../../../i18n/locale'

export type BuyId = 'lead' | 'moq' | 'alt' | 'life' | 'fake'

export const BUY: Array<{ id: BuyId; title: LText; sub: LText; text: LText; design: LText }> = [
  {
    id: 'lead',
    title: loc('交期', 'Lead time'),
    sub: loc('下单到收货', 'order to delivery'),
    text: loc(
      '从下单到货到的时间。常用阻容现货几天就到，芯片、连接器可能要几周到半年。',
      'The time from order to delivery. Common resistors and capacitors arrive in days; chips and connectors can take weeks to over six months.',
    ),
    design: loc(
      '设计怎么影响它：交期决定最早能投板的日子，所以选型阶段就查，不要等出图以后才发现关键芯片要等半年。',
      'How design affects it: lead time sets the earliest build date, so check it at part selection rather than discovering after layout that a key chip takes six months.',
    ),
  },
  {
    id: 'moq',
    title: loc('MOQ', 'MOQ'),
    sub: loc('最小起订量', 'minimum order quantity'),
    text: loc(
      '供应商最少卖多少，例如一整盘 4000 个。只用 10 个也要买一盘，剩下的就是成本。',
      'The least a supplier will sell, for example a full reel of 4000. Needing only 10 still means buying a reel, and the rest is cost.',
    ),
    design: loc(
      '设计怎么影响它：小批量时少用冷门值和冷门封装，尽量复用库存里已有的通用型号，MOQ 就不会白白吃掉预算。',
      'How design affects it: in small runs avoid unusual values and packages and reuse common parts already in stock, so MOQ does not eat the budget.',
    ),
  },
  {
    id: 'alt',
    title: loc('替代料', 'Alternates'),
    sub: loc('第二来源', 'second source'),
    text: loc(
      '功能、封装、引脚相同的另一个型号或另一家产品。电阻电容容易换；芯片不能随便换，要核对引脚、电气参数、时序和固件。',
      'Another part or another maker’s part with the same function, package and pinout. Resistors and capacitors swap easily; chips do not, because pinout, electrical parameters, timing and firmware must be checked.',
    ),
    design: loc(
      '设计怎么影响它：把已经确认能用的替代料写进 BOM，缺货时才能当天切换；封装焊盘最好兼容两家的产品。',
      'How design affects it: list confirmed alternates in the BOM so you can switch the day a part runs short; a footprint that suits both makers’ parts helps.',
    ),
  },
  {
    id: 'life',
    title: loc('生命周期', 'Lifecycle'),
    sub: loc('Active → Obsolete', 'Active → Obsolete'),
    text: loc(
      '原厂给每颗料标一个状态，见下面的表。新设计应该只选 Active 的料，因为板子要生产好几年，料却可能在中途停产。',
      'The manufacturer marks every part with a state, see the table below. A new design should use only Active parts, because a board is built for years while its parts may be discontinued midway.',
    ),
    design: loc(
      '设计怎么影响它：选型时看状态；如果必须用 NRND 的料，同时规划好替代方案或一次性备货。',
      'How design affects it: check the state at selection; if an NRND part is unavoidable, plan an alternate or a one-time stock buy at the same time.',
    ),
  },
  {
    id: 'fake',
    title: loc('假货风险', 'Counterfeit risk'),
    sub: loc('越缺货越多', 'worst when parts are short'),
    text: loc(
      '常见手法：旧件打磨后重新印字（翻新）、印着对的型号但里面是低规格芯片、受潮过期的料。越缺货越容易遇到，价格明显低于市场就是危险信号。',
      'Common tricks: used parts sanded and re-marked (refurbished), the right marking over a lower-grade die, and moisture-damaged or expired stock. They appear most when parts are short, and a price far below market is a warning sign.',
    ),
    design: loc(
      '设计怎么影响它：优先授权渠道；缺货被迫走现货商时，要做来料检验（外观、X 光、电性），并留好批次记录。',
      'How design affects it: prefer authorised channels; if shortage forces you to a broker, do incoming inspection (visual, X-ray, electrical) and keep lot records.',
    ),
  },
]

export const LIFECYCLE: Array<{ id: string; name: string; meaning: LText; action: LText }> = [
  {
    id: 'active',
    name: 'Active',
    meaning: loc('正常量产供货。', 'In normal production and supply.'),
    action: loc('可放心用于新设计。', 'Safe for new designs.'),
  },
  {
    id: 'nrnd',
    name: 'NRND',
    meaning: loc('Not Recommended for New Designs：还能买，但原厂不建议新设计使用，以后可能停产。', 'Not Recommended for New Designs: still available, but the maker advises against new designs and may discontinue it.'),
    action: loc('新设计不要选；老产品可继续用，但要开始找替代料。', 'Do not pick it for new designs; existing products can keep it but should start looking for an alternate.'),
  },
  {
    id: 'eol',
    name: 'EOL',
    meaning: loc('End of Life：原厂已发停产通知，并给出最后订货日（Last-time buy）。', 'End of Life: the maker has issued a discontinuation notice with a last-time-buy date.'),
    action: loc('在最后订货日前一次性备货，或改用替代料重新验证。', 'Stock up before the last-time-buy date, or switch to an alternate and re-validate.'),
  },
  {
    id: 'obsolete',
    name: 'Obsolete',
    meaning: loc('已停产，原厂不再供货。', 'Discontinued; the maker no longer supplies it.'),
    action: loc('只剩库存和现货商，假货风险最高；应改设计。', 'Only stock and brokers remain, with the highest counterfeit risk; redesign.'),
  },
]
