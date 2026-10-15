import { loc, type LText } from '../../../i18n/locale'
import { type HotKey, type StepId } from './pcbFabModel'

export type FabDefect = { id: string; title: LText; cause: LText; effect: LText; fix: LText; hot: HotKey }

export const DEFECTS_A: Partial<Record<StepId, FabDefect[]>> = {
  cut: [
    {
      id: 'damp',
      title: loc('板材受潮、翘曲', 'Damp or warped laminate'),
      cause: loc('覆铜板存放时吸了湿气，或开料后没有烘板。', 'The laminate absorbed moisture in storage, or was not baked after cutting.'),
      effect: loc('后面压合、焊接的高温会让水汽冲出来，造成分层爆板；尺寸也会涨缩，层与层对不准。', 'Later lamination and soldering heat drive the water out and cause delamination; dimensions also drift and layers misregister.'),
      fix: loc('开料后烘板，板材按批次和存放期管理。', 'Bake after cutting and manage laminate by batch and shelf life.'),
      hot: 'inner',
    },
    {
      id: 'scratch',
      title: loc('铜面划伤、压痕', 'Scratched or dented copper'),
      cause: loc('搬运时板面互相摩擦，或磨边的碎屑压在铜面上。', 'Panels rub each other in handling, or grinding debris is pressed into the copper.'),
      effect: loc('划伤处的铜变薄，蚀刻后变成线路缺口，严重时开路。', 'The scratched copper is thinner and becomes a nick after etching, or an open if severe.'),
      fix: loc('用插架分隔，磨边后清洗、除屑。', 'Separate panels in racks and clean off debris after edge grinding.'),
      hot: 'surface',
    },
  ],
  inner: [
    {
      id: 'dust',
      title: loc('膜下有杂质或气泡', 'Dust or bubbles under the film'),
      cause: loc('贴膜时铜面或膜上有灰尘，辊压没有排净空气。', 'Dust on the copper or film, or air not rolled out when laminating.'),
      effect: loc('杂质处的膜附着不好，显影后掉膜或缺膜，蚀刻后线路出现缺口或开路。', 'Film does not stick over the particle, falls off or goes missing in development, and etching leaves a nick or an open.'),
      fix: loc('洁净间生产，贴膜前清洁铜面，检查辊压参数。', 'Work in a clean room, clean the copper before lamination and check roller settings.'),
      hot: 'trace',
    },
    {
      id: 'dev',
      title: loc('显影不净、残膜', 'Incomplete development'),
      cause: loc('缝太窄，或显影液浓度和时间不够，缝里的软膜没冲干净。', 'The gap is too narrow, or developer strength or time is short, so soft film stays in the gap.'),
      effect: loc('残膜保护了缝里的铜，蚀刻时蚀不掉，相邻线路被铜桥接起来，成为短路。', 'Leftover film protects the copper in the gap, the etchant cannot remove it, and a copper bridge shorts neighbouring traces.'),
      fix: loc('设计时守住最小线距；制造时监控显影点。', 'Respect the minimum space in design; the fab monitors the development breakpoint.'),
      hot: 'gap',
    },
  ],
  etch: [
    {
      id: 'over',
      title: loc('蚀刻过度、线变细', 'Over-etching'),
      cause: loc('药水太浓、温度太高或走板太慢，铜在侧面蚀掉得太多。', 'Etchant too strong, too hot, or the line speed too slow, so too much copper is lost at the sides.'),
      effect: loc('线宽小于设计值，电阻变大、载流变小；细线甚至整段蚀断，成为开路。', 'The line is narrower than designed, resistance rises and current capacity falls; a fine line may etch through entirely and open.'),
      fix: loc('控制蚀刻速度和药水；设计时不要贴着最小线宽。', 'Control speed and chemistry; do not design right at the minimum trace width.'),
      hot: 'trace',
    },
    {
      id: 'under',
      title: loc('蚀刻不足、铜残留', 'Under-etching'),
      cause: loc('药水老化或走板太快，窄缝里药水换不动，底部的铜没蚀净。', 'Etchant is exhausted or the line is too fast, so in narrow gaps fresh etchant does not arrive and copper at the bottom stays.'),
      effect: loc('线路底部留下铜脚，相邻线路短路或线距变小，绝缘不足。', 'A copper foot remains at the base of the lines, shorting neighbours or shrinking the space and weakening insulation.'),
      fix: loc('窄缝设计留够线距；AOI 检出后返工。', 'Leave enough space in tight gaps; rework what AOI catches.'),
      hot: 'gap',
    },
  ],
  lam: [
    {
      id: 'delam',
      title: loc('分层、白斑', 'Delamination'),
      cause: loc('棕化不良、板子受潮，或压合温度和压力不够，树脂没有咬住铜面。', 'Poor oxide, damp board, or too little press temperature or pressure, so resin does not bond to the copper.'),
      effect: loc('层间出现空隙，焊接过炉时受热鼓起，板子爆开。', 'Voids appear between layers and the board blisters in the reflow oven.'),
      fix: loc('控制棕化质量、烘板、按曲线压合。', 'Control oxide quality, bake panels and press to the profile.'),
      hot: 'inner',
    },
    {
      id: 'shift',
      title: loc('层偏', 'Layer misregistration'),
      cause: loc('压合时各层涨缩不同或在压机里滑动，内层图形和靶标位置偏了。', 'Layers expand differently or slide in the press, so inner patterns move away from their targets.'),
      effect: loc('钻孔对着靶标打，内层焊盘却偏了，孔环变小甚至破盘；内层之间的线也可能错位。', 'The drill follows the targets while the inner pads have shifted, shrinking the ring or breaking out of it; inner traces also misalign.'),
      fix: loc('按涨缩补偿内层图形；设计留够孔环。', 'Compensate inner artwork for scaling; design with enough annular ring.'),
      hot: 'pad',
    },
  ],
  drill: [
    {
      id: 'breakout',
      title: loc('钻偏、破盘', 'Drill wander and breakout'),
      cause: loc('钻头在高速旋转中偏移，加上层偏，孔离焊盘中心太远。', 'The bit wanders at high speed and, with layer shift, the hole lands off the pad centre.'),
      effect: loc('孔壁擦到焊盘边缘之外，孔壁铜和焊盘之间只剩一点点连接，甚至断开，通电时发热或开路。', 'The wall touches outside the pad edge, leaving little or no connection between wall copper and pad, which heats up or opens.'),
      fix: loc('孔环要大于 钻孔公差 + 对位公差。', 'Make the ring larger than drill tolerance plus registration tolerance.'),
      hot: 'pad',
    },
    {
      id: 'smear',
      title: loc('胶渣、毛刺', 'Resin smear and burrs'),
      cause: loc('钻头高速摩擦发热，树脂熔化后糊在内层铜的断面上；钻头钝了也会留毛刺。', 'Friction melts resin onto the cut edges of inner copper; a dull bit also leaves burrs.'),
      effect: loc('如果不除干净，镀铜和内层铜之间隔着一层树脂，连接不牢，热冲击后断开。', 'If not removed, a resin film sits between plating and inner copper, the joint is weak, and it opens after thermal shock.'),
      fix: loc('钻孔后做除胶渣；按孔数换钻头。', 'Desmear after drilling and change bits by hit count.'),
      hot: 'wall',
    },
  ],
  plate: [
    {
      id: 'void',
      title: loc('孔内无铜（镀不上）', 'Plating void in the hole'),
      cause: loc('沉铜时孔里有气泡，或孔壁没有活化好，局部没有沉上铜。', 'An air bubble in the hole, or poor activation of the wall, leaves a spot with no copper.'),
      effect: loc('孔壁局部没有铜，板子出厂时可能还导通，但一经热冲击就开路，是最危险的隐患之一。', 'The wall is missing copper locally; it may still conduct at shipment but opens after thermal shock, one of the most dangerous latent faults.'),
      fix: loc('纵横比不要超限；制造时做背光测试。', 'Keep the aspect ratio within limits; the fab runs a backlight test.'),
      hot: 'wall',
    },
    {
      id: 'thin',
      title: loc('孔铜太薄', 'Thin hole copper'),
      cause: loc('孔又深又细，孔中间分到的电流和药水少，镀得比孔口薄。', 'In a deep, thin hole the middle gets less current and bath, so it plates thinner than the mouth.'),
      effect: loc('孔铜不够厚，热循环时容易疲劳开裂，大电流时发热。', 'Hole copper is too thin, cracks from fatigue in thermal cycling, and heats up under high current.'),
      fix: loc('限制纵横比；切片检查孔铜厚度。', 'Limit the aspect ratio; micro-section to check copper thickness.'),
      hot: 'wall',
    },
  ],
}
