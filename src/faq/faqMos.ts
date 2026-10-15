import { loc } from '../i18n/locale'
import type { FaqGroup } from './faq'

/** MOS 管与数字电路（T 轨）的常见问题 */
export const MOS_FAQ_GROUP: FaqGroup = {
  id: 'mos',
  title: loc('MOS 管与数字电路', 'MOSFETs and digital circuits'),
  items: [
    {
      id: 'nmos-low-pmos-high',
      q: loc('为什么 NMOS 常做低边开关，PMOS 常做高边开关？', 'Why are NMOS usually low-side switches and PMOS high-side?'),
      a: loc(
        'NMOS 源极接地时，栅极电压就是 Vgs，3.3 V 就能充分开启，而且它拉低输出的能力强。PMOS 源极接电源，导通只需把栅极拉到比源极低，放在高边最顺手，它拉高输出的能力强。两者各自传好的电平见 {@mosSwitch}。',
        'With the source at ground, an NMOS sees Vgs equal to the gate voltage, so 3.3 V turns it fully on, and it pulls outputs low well. A PMOS has its source at the supply, so it turns on by pulling the gate below the source, which suits the high side, and it pulls outputs high well. Which level each passes well: {@mosSwitch}.',
      ),
      lessons: ['mosSwitch'],
    },
    {
      id: 'bootstrap-why',
      q: loc('高边 NMOS 为什么要自举？', 'Why does a high-side NMOS need a bootstrap?'),
      a: loc(
        '高边 NMOS 的源极跟着负载电压一起升高，栅极必须比源极高出阈值以上才能导通。自举电容在低边导通时充电，开关节点升高时把它的另一端一起抬起，栅压就能高过电源。见 {@mosSwitch}。',
        'A high-side NMOS source rises with the load, and its gate must sit above the source by more than Vth to conduct. A bootstrap capacitor charges while the low side conducts, then rides up with the switching node so the gate can go above the supply. See {@mosSwitch}.',
      ),
      lessons: ['mosSwitch'],
    },
    {
      id: 'rds-loss',
      q: loc('管子已经完全导通，为什么还会发热？', 'The MOSFET is fully on. Why does it still heat up?'),
      a: loc(
        '导通时仍有 Rds(on) 上的压降，功耗是 I² × Rds(on)，电流越大越热。数据手册给的 Rds(on) 是特定 Vgs 和温度下的值，结温升高时它会变大。热阻的算法见 {@mosSelect}。',
        'Even when fully on, the drop across Rds(on) dissipates I² × Rds(on), so the heat grows with current. The datasheet Rds(on) is for a specific Vgs and temperature, and it rises as the junction heats. How to estimate the temperature rise: {@mosSelect}.',
      ),
      lessons: ['mosSwitch', 'mosSelect'],
    },
    {
      id: 'vtc-steep',
      q: loc('反相器的转移曲线为什么中间那段特别陡？', 'Why is the middle of the inverter transfer curve so steep?'),
      a: loc(
        '输入在阈值附近时两管都在导通，增益很大，输入稍有变化，输出就从高翻到低。这个陡峭的拐点决定了噪声容限有多大。见 {@mosInverter}。',
        'Near the threshold both transistors conduct and the gain is high, so a small change in the input flips the output from high to low. The steep knee sets how large the noise margins are. See {@mosInverter}.',
      ),
      lessons: ['mosInverter'],
    },
    {
      id: 'delay-why',
      q: loc('开关为什么不是瞬间完成的？', 'Why does a MOSFET switch take time?'),
      a: loc(
        '栅极是一个电容，要通过驱动器的电阻充放电，送进去的是 Qg 这份电荷。漏极电压变化时出现的米勒平台占了其中大部分。充放电越慢，开关越慢，开关损耗越大。见 {@mosDynamic}。',
        'The gate is a capacitor charged and discharged through the driver resistance, and the charge involved is Qg. Most of it goes into the Miller plateau, where the drain voltage is swinging. Slower charging means slower switching and more switching loss. See {@mosDynamic}.',
      ),
      lessons: ['mosDynamic'],
    },
    {
      id: 'hbridge-shoot',
      q: loc('H 桥为什么同一桥臂的上下管不能同时导通？', 'Why must the high and low switches of one H-bridge leg never conduct together?'),
      a: loc(
        '同时导通时电源经两管直接对地短路，电流只受导通电阻限制，很快就会烧毁管子。驱动里要加死区时间，让一管完全关断后另一管再开启。见 {@mosApps}。',
        'If both conduct, the supply is shorted to ground through the two devices, limited only by their on-resistance, and they burn out quickly. The drive needs dead time so one device is fully off before the other turns on. See {@mosApps}.',
      ),
      lessons: ['mosApps'],
    },
    {
      id: 'diode-vs-pmos',
      q: loc('防反接为什么用 PMOS，而不是只串一个二极管？', 'Why use a PMOS for reverse-polarity protection instead of a series diode?'),
      a: loc(
        '二极管的正向压降约 0.6 V，大电流时损耗很大。PMOS 导通后的压降只是 I × Rds(on)，可以低到毫伏级。它的代价是要多一个栅极电阻和一个稳压管。见 {@mosApps}。',
        'A diode drops about 0.6 V, which wastes a lot of power at high current. A conducting PMOS drops only I × Rds(on), down to millivolts. The cost is a gate resistor and a Zener clamp. See {@mosApps}.',
      ),
      lessons: ['mosApps'],
    },
    {
      id: 'gate-esd',
      q: loc('MOS 管为什么怕静电？', 'Why are MOSFETs sensitive to static electricity?'),
      a: loc(
        '栅极下面是很薄的氧化层，静电积累后电压很高，可能把它击穿。氧化层是绝缘的，静电进入栅极后只能靠外部电路泄放，所以装配和测试时要做防静电。见 {@mosReal}。',
        'Under the gate is a very thin oxide. Static charge can build a very high voltage across it and break it down. The oxide is an insulator, so once charge reaches the gate it can only leave through external paths; handling and testing need ESD precautions. See {@mosReal}.',
      ),
      lessons: ['mosReal'],
    },
  ],
}
