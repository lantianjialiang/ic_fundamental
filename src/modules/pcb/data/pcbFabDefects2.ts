import { loc } from '../../../i18n/locale'
import { type StepId } from './pcbFabModel'
import { type FabDefect } from './pcbFabDefects'

export const DEFECTS_B: Partial<Record<StepId, FabDefect[]>> = {
  outer: [
    {
      id: 'plateUnder',
      title: loc('夹膜、镀层钻到膜下', 'Plating under the film'),
      cause: loc('干膜没贴牢，或膜太薄，镀铜镀锡时金属从膜边缘钻到膜下面。', 'The film is not stuck down well, or too thin, and plated metal creeps under its edge.'),
      effect: loc('线路边上多出一圈铜和锡，蚀刻时被锡保护下来，相邻线路被桥接成短路。', 'An extra rim of copper and tin forms beside the line, survives etching under the tin, and bridges neighbouring traces into a short.'),
      fix: loc('控制贴膜质量；设计守住最小线距。', 'Control film lamination; respect the minimum space in design.'),
      hot: 'gap',
    },
    {
      id: 'tinGap',
      title: loc('锡层有针孔、线路被咬断', 'Pinholes in the tin'),
      cause: loc('镀锡不均，或锡层太薄有针孔，蚀刻液穿过针孔咬到铜。', 'Uneven or thin tin has pinholes, and etchant gets through them to the copper.'),
      effect: loc('线路上出现缺口，严重时断线，孔壁铜也可能被咬穿。', 'The line gets nicks or breaks, and the hole-wall copper can be etched through.'),
      fix: loc('控制锡厚；蚀刻后检查。', 'Control tin thickness; inspect after etching.'),
      hot: 'trace',
    },
  ],
  mask: [
    {
      id: 'shift',
      title: loc('阻焊偏位、上焊盘', 'Mask misregistration'),
      cause: loc('阻焊对位有偏差，开窗没有对准焊盘。', 'Mask registration error leaves the openings off the pads.'),
      effect: loc('油墨盖住焊盘一角，焊接面积变小；偏向另一边则让邻近线路露铜。', 'Ink covers part of a pad and shrinks the solder area; shifted the other way it exposes neighbouring copper.'),
      fix: loc('开窗每边比焊盘大 0.05 mm 左右。', 'Make each opening about 0.05 mm larger per side than the pad.'),
      hot: 'smd',
    },
    {
      id: 'dam',
      title: loc('阻焊坝掉落', 'Solder dam lost'),
      cause: loc('相邻焊盘间距太小，坝比油墨能附着的宽度还窄。', 'Adjacent pads are so close that the dam is narrower than the ink can hold.'),
      effect: loc('坝在显影或焊接时脱落，焊锡在两个焊盘之间桥连成短路。', 'The dam peels off in development or soldering, and solder bridges the two pads into a short.'),
      fix: loc('相邻焊盘边缘间距留够；做不到就接受整体开窗。', 'Leave enough edge-to-edge pad gap; if impossible, accept a gang opening.'),
      hot: 'dam',
    },
  ],
  legend: [
    {
      id: 'onPad',
      title: loc('字符压焊盘', 'Legend on a pad'),
      cause: loc('丝印对位有偏差，或设计里字符本来就放在焊盘上。', 'Print registration error, or the legend was placed on a pad in the design.'),
      effect: loc('焊盘上有白油墨，焊锡浸润不好，造成虚焊；被厂家裁掉的字符还会不完整。', 'White ink on the pad stops solder wetting and causes a poor joint; legend clipped by the fab may also be incomplete.'),
      fix: loc('字符离焊盘 ≥ 0.15 mm；出图前检查丝印压盘。', 'Keep legend ≥ 0.15 mm from pads; run a silkscreen-over-pad check before output.'),
      hot: 'smd',
    },
    {
      id: 'blur',
      title: loc('字符模糊、漏印', 'Blurred or missing legend'),
      cause: loc('线宽或字高太小，油墨会扩散或印不上。', 'Stroke width or text height is too small, and ink spreads or does not print.'),
      effect: loc('位号看不清，装配和维修时容易认错。', 'Designators are unreadable and easy to misread in assembly and repair.'),
      fix: loc('线宽 ≥ 0.15 mm，字高 ≥ 0.8 mm（示意）。', 'Stroke ≥ 0.15 mm and height ≥ 0.8 mm (illustrative).'),
      hot: 'legend',
    },
  ],
  finish: [
    {
      id: 'blackPad',
      title: loc('黑盘', 'Black pad'),
      cause: loc('沉金药水把镍层腐蚀过度，镍表面形成富磷层。', 'The gold bath over-corrodes the nickel and a phosphorus-rich layer forms on it.'),
      effect: loc('焊接时锡和镍结合不牢，焊点脆，用一阵子或受震动后掉点，BGA 特别危险。', 'Solder does not bond to the nickel properly, the joint is brittle and fails after some use or vibration, which is especially dangerous for BGA.'),
      fix: loc('控制沉金工艺；选信誉好的厂；重要产品做切片和拉力验证。', 'Control the gold process, choose a reliable fab, and verify important products by micro-section and pull test.'),
      hot: 'smd',
    },
    {
      id: 'bare',
      title: loc('露铜、沉不上金', 'Bare copper, no finish'),
      cause: loc('焊盘上有残留油墨或氧化，药水没有沉到铜。', 'Residual ink or oxide on the pad keeps the bath from reaching the copper.'),
      effect: loc('这个焊盘会氧化，焊接时不上锡。', 'The pad oxidises and does not take solder.'),
      fix: loc('阻焊显影要干净；表面处理前微蚀。', 'Develop the mask clean and micro-etch before finishing.'),
      hot: 'pad',
    },
  ],
  route: [
    {
      id: 'cutCu',
      title: loc('铣到铜、侧面露铜', 'Router cuts into copper'),
      cause: loc('铜离板边太近，加上铣刀的位置公差。', 'Copper is too close to the edge and the router has position tolerance.'),
      effect: loc('铜皮被带起来翘边，或侧面露出铜，装配时碰到金属外壳就短路。', 'Copper is lifted at the edge, or exposed on the side and shorts against a metal case in the product.'),
      fix: loc('铜到板边 ≥ 0.25 mm（示意）；重要的接地边要用大一点的距离。', 'Copper to edge ≥ 0.25 mm (illustrative); use more clearance for important ground edges.'),
      hot: 'edge',
    },
    {
      id: 'burr',
      title: loc('毛刺、板边分层', 'Burrs and edge delamination'),
      cause: loc('铣刀钝了，或进刀太快。', 'The router bit is dull or fed too fast.'),
      effect: loc('板边起毛、分层，容易吸水，也可能影响装配。', 'The edge fuzzes or delaminates, takes up moisture and can hinder assembly.'),
      fix: loc('控制刀具寿命和进给；重要边做倒角。', 'Control tool life and feed rate; bevel important edges.'),
      hot: 'edge',
    },
  ],
  test: [
    {
      id: 'miss',
      title: loc('漏测（假好品）', 'Escape: test misses a fault'),
      cause: loc('有些网络没有被探针碰到，或者焊盘太小，针尖偏了。', 'Some nets are not reached by a probe, or the pad is so small that the tip lands off it.'),
      effect: loc('这个网络的开路或短路测不出来，坏板被当成好板发出去。', 'An open or short on that net is not detected and the bad board ships as good.'),
      fix: loc('每个网络至少留一个露在表面的焊盘或测试点。', 'Leave at least one exposed pad or test point on every net.'),
      hot: 'smd',
    },
    {
      id: 'false',
      title: loc('误判（真好品被判坏）', 'False fail'),
      cause: loc('探针接触不良，或焊盘上有污染。', 'Poor probe contact, or contamination on the pad.'),
      effect: loc('好板被当成坏板报废，推高成本。', 'Good boards are scrapped as bad, raising cost.'),
      fix: loc('清洁焊盘；复测一次再判。', 'Keep pads clean and retest before rejecting.'),
      hot: 'pad',
    },
  ],
  final: [
    {
      id: 'size',
      title: loc('尺寸、板厚超差', 'Out-of-tolerance size or thickness'),
      cause: loc('铣外形公差、层压厚度公差累积。', 'Tolerances from routing and lamination thickness add up.'),
      effect: loc('板子装不进外壳，或和连接器配合不对。', 'The board does not fit the enclosure or mate properly with a connector.'),
      fix: loc('图纸上写明公差，关键尺寸留余量。', 'State tolerances on the drawing and leave margin on critical dimensions.'),
      hot: 'edge',
    },
    {
      id: 'copper',
      title: loc('切片发现孔铜不足', 'Micro-section finds thin hole copper'),
      cause: loc('电镀时间或电流不够，或纵横比太大。', 'Plating time or current was too low, or the aspect ratio is too big.'),
      effect: loc('整批板的可靠性不够，必须报废或降级使用。', 'Reliability of the whole lot is inadequate, so it must be scrapped or downgraded.'),
      fix: loc('在制造说明写明等级；设计时守住纵横比。', 'State the class in the fab notes and respect the aspect ratio in design.'),
      hot: 'wall',
    },
  ],
}
