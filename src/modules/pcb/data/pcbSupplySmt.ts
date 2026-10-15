import { loc, type LText } from '../../../i18n/locale'

export type SmtId = 'print' | 'spi' | 'place' | 'reflow' | 'aoi' | 'xray' | 'wave' | 'ict' | 'fct'

export const SMT: Array<{ id: SmtId; short: LText; title: LText; text: LText; flaw: LText }> = [
  {
    id: 'print',
    short: loc('印锡膏', 'Print'),
    title: loc('锡膏印刷', 'Solder-paste printing'),
    text: loc(
      '钢网是一张开了孔的薄钢片（厚约 0.1–0.15 mm），盖在板上；刮刀把锡膏推过去，锡膏从开孔漏到焊盘上。开孔大小和钢网厚度决定每个焊盘上有多少锡。',
      'The stencil is a thin steel sheet (about 0.1–0.15 mm) with apertures, laid on the board; a squeegee pushes paste across and it drops through the apertures onto the pads. Aperture size and stencil thickness decide how much solder each pad gets.',
    ),
    flaw: loc(
      '锡太多会桥连，太少会虚焊，钢网和板没对准会偏位。业内常说多数焊接缺陷源头在印刷，所以后面紧跟 SPI。',
      'Too much paste bridges, too little starves the joint, and a misaligned stencil shifts it. The industry saying is that most solder defects start at printing, which is why SPI follows right away.',
    ),
  },
  {
    id: 'spi',
    short: loc('SPI', 'SPI'),
    title: loc('锡膏检查（SPI）', 'Solder-paste inspection (SPI)'),
    text: loc(
      '激光或相机逐点测量每个焊盘上锡膏的体积、高度、面积和偏移，超出范围就报警。图中 BGA 位置的第三个焊盘锡膏明显偏少。',
      'A laser or camera measures the volume, height, area and offset of the paste on every pad and flags anything out of range. In the drawing the third pad at the BGA site has clearly too little paste.',
    ),
    flaw: loc(
      '没过 SPI 的板子不贴件，直接洗板重印，只要几分钟；贴上元件再发现，就得返修，代价高得多。',
      'A board that fails SPI is not populated; it is washed and reprinted in minutes. Finding the fault after placement means rework, which costs far more.',
    ),
  },
  {
    id: 'place',
    short: loc('贴片', 'Place'),
    title: loc('贴片（Pick-and-place）', 'Pick-and-place'),
    text: loc(
      '吸嘴从料带或托盘吸起元件，摄像头检查姿态，再按坐标文件里的 X、Y、角度放进锡膏。贴片机先用板上的 Fiducial 校正位置；锡膏有黏性，能把元件暂时粘住，直到过炉。',
      'A nozzle picks each part from tape or tray, a camera checks its attitude, and it is placed into the paste at the X, Y and angle from the centroid file. The machine first corrects position using the board fiducials; the sticky paste holds the part until the oven.',
    ),
    flaw: loc(
      '抛料、贴反（极性、1 脚方向）、料盘装错料；所以 BOM、坐标文件和上料表必须一致。',
      'Dropped parts, reversed parts (polarity, pin 1) and the wrong reel loaded; that is why the BOM, centroid file and feeder list must agree.',
    ),
  },
  {
    id: 'reflow',
    short: loc('回流焊', 'Reflow'),
    title: loc('回流焊', 'Reflow soldering'),
    text: loc(
      '板子过一条多温区的炉子，按温度曲线升温：助焊剂先清洁焊盘，焊料熔化（SAC305 约 217 °C），浸润焊盘和元件端头，冷却后凝固成焊点。熔化时表面张力会把元件拉正，叫自对中。曲线见下面的图。',
      'The board crosses a multi-zone oven following a temperature profile: flux first cleans the pads, the solder melts (SAC305 near 217 °C), wets pads and terminations and freezes into joints on cooling. Surface tension pulls parts into line as it melts, called self-alignment. The profile is charted below.',
    ),
    flaw: loc(
      '温度不够是冷焊或虚焊；过高烤坏元件和板；两端受热不均，小元件会一头翘起，叫立碑（tombstone）。',
      'Too cool gives cold or dry joints; too hot damages parts and board; uneven heating of the two ends makes a small part stand on one end, called tombstoning.',
    ),
  },
  {
    id: 'aoi',
    short: loc('AOI', 'AOI'),
    title: loc('自动光学检查（AOI）', 'Automated optical inspection (AOI)'),
    text: loc(
      '相机从多个角度拍照，和标准图比对：缺件、偏位、极性反、立碑、桥连、锡量。速度快，但只能看到表面。图中右边那颗电容就是被 AOI 抓到的立碑（示意，抓到后会返修）。',
      'Cameras photograph the board from several angles and compare with a reference: missing, shifted or reversed parts, tombstones, bridges, solder amount. It is fast but sees only the surface. The capacitor on the right is a tombstone caught by AOI (illustrative; it would then be reworked).',
    ),
    flaw: loc(
      'BGA、QFN 底下的焊点它看不到，所以需要 X 光；它也量不出电气上通不通。',
      'It cannot see joints under BGAs and QFNs, which is why X-ray is needed, and it cannot tell whether the circuit conducts electrically.',
    ),
  },
  {
    id: 'xray',
    short: loc('X 光', 'X-ray'),
    title: loc('X 光检查', 'X-ray inspection'),
    text: loc(
      'X 射线能穿过封装和板子，焊料含锡多、吸收得多，在图像里显得更暗，所以能看到 BGA、QFN 底下的焊球：桥连、缺球、空洞（气泡）。封装结构见 {@pPackage}。图中第三个焊球里有一个空洞。',
      'X-rays pass through package and board; solder is rich in tin and absorbs more, so it shows darker, revealing the balls under BGAs and QFNs: bridges, missing balls and voids (bubbles). Package structure is in {@pPackage}. The third ball in the drawing holds a void.',
    ),
    flaw: loc(
      '空洞太大会削弱焊点强度和导热，常见验收限度是焊球面积的 25% 左右（以所用标准为准）。',
      'Oversized voids weaken the joint and its heat path; a common acceptance limit is about 25% of the ball area (follow the standard in use).',
    ),
  },
  {
    id: 'wave',
    short: loc('波峰焊', 'Wave'),
    title: loc('波峰焊（通孔元件）', 'Wave soldering (through-hole parts)'),
    text: loc(
      '连接器、大电解电容这类通孔元件（THT）的引脚穿过孔，板子底面从一道熔化焊料形成的「波」上经过，焊料沿孔壁爬上去，形成焊点。贴片板常见做法是回流焊贴片件，再用波峰焊或手工焊通孔件；小批量的通孔件常用手工焊或选择性波峰焊。',
      'Through-hole parts (THT) such as connectors and large electrolytic capacitors have leads through holes; the underside passes over a wave of molten solder that climbs the hole walls and forms the joint. A common sequence is to reflow the SMD parts, then wave- or hand-solder the through-hole parts; small runs often hand-solder or use selective wave.',
    ),
    flaw: loc(
      '引脚间距小会桥连，孔内上锡不足；所以通孔焊盘和孔径要符合工厂的波峰焊规则。',
      'Fine lead pitch bridges and low hole fill leaves weak joints; so through-hole pads and hole sizes must follow the shop’s wave-solder rules.',
    ),
  },
  {
    id: 'ict',
    short: loc('ICT', 'ICT'),
    title: loc('在线测试（ICT）', 'In-circuit test (ICT)'),
    text: loc(
      '针床夹具上的弹簧针压到板底的测试点上，逐点测电阻、电容、二极管，查开路、短路、错件、反件，通常不上电或只低压上电。',
      'Spring pins in a bed-of-nails fixture press on test pads on the underside and measure resistance, capacitance and diodes point by point, finding opens, shorts and wrong or reversed parts, usually unpowered or at low voltage.',
    ),
    flaw: loc(
      '前提是关键网络都有测试点，没有测试点针就扎不到；针床要专门制作，量小不划算，小批量改用飞针测试。',
      'It requires a test point on every key net, because pins cannot reach what has no pad; a bed of nails is custom-made and not worth it for small runs, which use flying-probe test instead.',
    ),
  },
  {
    id: 'fct',
    short: loc('FCT', 'FCT'),
    title: loc('功能测试（FCT）', 'Functional test (FCT)'),
    text: loc(
      '给板子上电、烧入固件，像真实使用那样跑一遍：电压、通信接口、传感器读数、按键、指示灯，最后给出通过或不通过。',
      'Power the board, load firmware and exercise it like real use: voltages, communication ports, sensor readings, buttons, LEDs, then give pass or fail.',
    ),
    flaw: loc(
      'ICT 只证明「焊对了」，FCT 才证明「板子能用」；固件、时钟、电源时序的问题只有 FCT 能发现。板级测试和芯片 ATE 思路相近，见 {@fAte}。',
      'ICT only proves it was soldered correctly; FCT proves the board works. Firmware, clock and power-sequencing faults only show up in FCT. Board-level test is close in spirit to chip-level ATE, see {@fAte}.',
    ),
  },
]
