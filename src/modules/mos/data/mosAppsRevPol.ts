import { loc } from '../../../i18n/locale'
import { fmtA, fmtVolt, fmtW, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：体二极管压降、PMOS 导通电阻、Zener 稳压值、栅极电阻、负载电阻、栅极绝对最大值 */
const VF_BODY = 0.7
const RDS = 0.02
export const VZ = 10
const RG = 100e3
const RLOAD = 6
const VGS_MAX = 20

function solve(sel: Record<string, string>, _num: Record<string, number>, fault: string): Outcome {
  const vbat = sel.vin === '24' ? 24 : 12
  const reversedBat = sel.pol === 'reversed'
  const phaseDiode = sel.phase !== 'channel'
  const noZener = fault === 'noZener'
  const partBack = fault === 'pmosReversed'
  const i = vbat / RLOAD

  if (reversedBat) {
    if (partBack) {
      const iRev = (vbat - VF_BODY) / RLOAD
      return {
        hot: ['gnd', 'load', 'src', 'dio'],
        tags: { vsg: '0.00 V', vs: fmtVolt(vbat - VF_BODY), vbat: `-${vbat} V` },
        reads: [
          { label: loc('负载上的反向电压', 'Reverse voltage on the load'), value: fmtVolt(vbat - VF_BODY), state: 'fail' },
          { label: loc('反向电流', 'Reverse current'), value: fmtA(iRev), state: 'fail' },
          { label: loc('体二极管耗散', 'Body diode loss'), value: fmtW(iRev * VF_BODY), state: 'fail' },
        ],
        tone: 'bad',
        title: loc('PMOS 装反：反接时体二极管变成通路', 'PMOS reversed: in reverse polarity the body diode becomes a path'),
        text: loc(
          '装反后源极接电池端、漏极接负载。反接时电池正极在地一侧，电流从地经负载（反向）、漏极流向体二极管，再回到电池负极。PMOS 体二极管的阳极是漏极、阴极是源极，正好正向导通，保护完全失效，负载还被反向供电。',
          'Mounted backwards, the source goes to the battery pin and the drain to the load. In reverse the battery plus is on the ground side, so current flows from ground through the load (backwards) into the drain, through the body diode and back to the battery minus. The PMOS body diode has its anode at the drain and its cathode at the source, so it is forward biased: protection is gone and the load is powered backwards.',
        ),
      }
    }
    const caution = vbat > VGS_MAX
    return {
      hot: [],
      tags: { vsg: '0.00 V', vs: '0.00 V', vbat: `-${vbat} V` },
      reads: [
        { label: loc('负载电压', 'Load voltage'), value: '0.00 V', state: 'pass' },
        { label: loc('FET 承受反压', 'Reverse voltage across FET'), value: fmtVolt(vbat) },
        { label: loc('栅漏电压', 'Gate-drain voltage'), value: fmtVolt(vbat), state: caution ? 'fail' : 'pass' },
      ],
      tone: caution ? 'warn' : 'ok',
      title: caution ? loc('反接被挡住，但栅漏要承受 24 V', 'Reverse blocked, but gate-drain takes 24 V') : loc('反接：PMOS 不导通，负载电压为 0', 'Reversed battery: the PMOS stays off and the load sees 0 V'),
      text: caution
        ? loc(
            '反接时漏极在 −24 V，栅极经 Rg 在 0 V，Vgs = 0，沟道不会形成，体二极管反偏，负载安全。但栅极和漏极之间的氧化层要承受整个 24 V，已经超过常见的 ±20 V 栅极额定值；Zener 只钳了栅源，保护不了栅漏。24 V 以上的系统要选栅氧耐压更高的管子，或改用栅极分压。',
            'In reverse the drain sits at −24 V while the gate stays at 0 V through Rg, so Vgs = 0, no channel forms, the body diode is reverse biased and the load is safe. But the oxide between gate and drain takes the full 24 V, beyond the usual ±20 V gate rating; the Zener only clamps gate-source and cannot protect gate-drain. Systems above 20 V need a part with a higher gate rating or a divided gate drive.',
          )
        : loc(
            '反接时漏极电压比地低一个电池电压，栅极经 Rg 在 0 V，Vgs = 0，沟道不会形成；体二极管阳极（漏极）电位低于阴极，反偏截止。负载一侧没有电流，反接对电路没有影响。',
            'In reverse the drain sits one battery voltage below ground while the gate stays at 0 V through Rg, so Vgs = 0 and no channel forms; the body diode’s anode (the drain) is below its cathode and blocks. No current reaches the load, so reversal has no effect on the circuit.',
          ),
    }
  }
  // 正接
  const vsOpen = vbat - VF_BODY
  const vsgRaw = phaseDiode ? vsOpen : vbat - i * RDS
  if (noZener && vbat > VGS_MAX) {
    return {
      hot: phaseDiode ? ['bat', 'dio', 'src', 'load', 'gnd'] : ['bat', 'ch', 'src', 'load', 'gnd'],
      tags: { vsg: fmtVolt(vsgRaw), vs: fmtVolt(vsgRaw), vbat: `+${vbat} V` },
      reads: [
        { label: loc('Vsg', 'Vsg'), value: fmtVolt(vsgRaw), state: 'fail' },
        { label: loc('栅极绝对最大值', 'Gate absolute maximum'), value: `±${VGS_MAX} V` },
      ],
      tone: 'bad',
      title: loc('缺 Zener：Vsg 超过栅极绝对最大值', 'No Zener: Vsg exceeds the gate absolute maximum'),
      text: loc(
        '栅极经 Rg 接地，源极随电池升到 24 V，Vsg 就是整个电池电压。栅氧只有几十纳米厚，超过 ±20 V 会被击穿，栅极永久短路，保护管直接损坏。需要在栅源之间并联 Zener 把 Vsg 钳在 10 V。',
        'The gate sits at ground through Rg while the source rises to 24 V with the battery, so Vsg is the whole battery voltage. The gate oxide is only tens of nanometres thick and breaks down above ±20 V, shorting the gate permanently and destroying the protection part. A Zener across gate-source clamps Vsg at 10 V.',
      ),
    }
  }
  const vsg = noZener ? vsgRaw : Math.min(vsgRaw, VZ)
  const iz = noZener ? 0 : Math.max(vsgRaw - VZ, 0) / RG
  if (partBack) {
    return {
      hot: ['bat', 'ch', 'src', 'load', 'gnd'],
      tags: { vsg: fmtVolt(vsg), vs: fmtVolt(vbat - i * RDS), vbat: `+${vbat} V` },
      reads: [
        { label: loc('负载电压', 'Load voltage'), value: fmtVolt(vbat - i * RDS) },
        { label: loc('Vsg', 'Vsg'), value: fmtVolt(vsg) },
      ],
      tone: 'warn',
      title: loc('PMOS 装反：正接时看不出问题', 'PMOS reversed: normal polarity looks fine'),
      text: loc(
        '正接时源极在电池一侧，栅极在地，Vsg 足够，沟道照常导通，沟道电流两个方向都能流，所以通电测试一切正常。装反的后果只在电池反接时出现；把电池切到「反接」看后果。',
        'In normal polarity the source is on the battery side and the gate at ground, so Vsg is large and the channel conducts as usual; the channel carries current both ways, so a power-on test passes. The consequence appears only with a reversed battery; switch the battery to Reversed to see it.',
      ),
    }
  }
  if (phaseDiode) {
    return {
      hot: ['bat', 'dio', 'src', 'load', 'gnd'],
      tags: { vsg: fmtVolt(vsg), vs: fmtVolt(vsOpen), vbat: `+${vbat} V` },
      reads: [
        { label: loc('Vds（二极管压降）', 'Vds (diode drop)'), value: fmtVolt(VF_BODY) },
        { label: loc('此刻损耗', 'Loss right now'), value: fmtW(i * VF_BODY) },
        { label: loc('Zener 电流', 'Zener current'), value: fmtA(iz) },
      ],
      tone: 'ok',
      title: loc('刚接上：体二极管先导通', 'Just connected: the body diode conducts first'),
      text: loc(
        '刚接上电池时，负载侧电压还是 0，沟道还没形成。漏极（电池正）比源极高，体二极管（阳极漏极、阴极源极）正向导通，把源极充到 Vbat − 0.7 V。此刻栅极在地，Vsg 随源极升高；一旦 |Vsg| 超过 |Vth|，沟道就开始增强。如果一直靠二极管，2 A 会耗掉 1.4 W。',
        'At the instant the battery is connected the load side is still at 0 V and no channel exists. The drain (battery plus) is above the source, so the body diode (anode at the drain, cathode at the source) conducts and charges the source to Vbat − 0.7 V. The gate is at ground, so Vsg grows with the source; once |Vsg| exceeds |Vth| the channel starts to enhance. Left on the diode alone, 2 A would burn 1.4 W.',
      ),
    }
  }
  return {
    hot: ['bat', 'ch', 'src', 'load', 'gnd'],
    tags: { vsg: fmtVolt(vsg), vs: fmtVolt(vbat - i * RDS), vbat: `+${vbat} V` },
    reads: [
      { label: loc('Vds（沟道压降）', 'Vds (channel drop)'), value: `${(i * RDS * 1000).toFixed(0)} mV` },
      { label: loc('沟道损耗', 'Channel loss'), value: fmtW(i * i * RDS) },
      { label: loc('Zener 电流', 'Zener current'), value: fmtA(iz) },
    ],
    tone: 'ok',
    title: loc('稳态：沟道增强，压降降到毫伏级', 'Steady state: channel enhanced, drop down to millivolts'),
    text: noZener
      ? loc(
          '源极升高后 Vsg 达到 12 V，沟道完全增强，压降只有 I × Rds(on)，损耗比二极管小一个数量级以上。12 V 系统里 Vsg 没超过 20 V，缺 Zener 暂时没事；切到 24 V 再看。',
          'Once the source has risen Vsg reaches 12 V and the channel is fully enhanced; the drop is only I × Rds(on), more than an order of magnitude below a diode. In a 12 V system Vsg stays under 20 V so a missing Zener is harmless for now; switch to 24 V to see the difference.',
        )
      : loc(
          '源极升高后 |Vsg| 超过 |Vth|，沟道完全增强，体二极管不再导通（Vds 已小于 0.7 V），压降只有 I × Rds(on)。电池电压高于 Vgs 额定值时，栅源之间的 Zener 把 Vsg 钳在 10 V，多出的电压降在 Rg 上，电流 = (Vs − Vz) ÷ Rg。',
          'Once the source has risen |Vsg| exceeds |Vth|, the channel is fully enhanced, the body diode stops conducting (Vds is now below 0.7 V) and the drop is only I × Rds(on). When the battery voltage exceeds the gate rating, the Zener across gate-source clamps Vsg at 10 V and the excess drops across Rg, with current (Vs − Vz) ÷ Rg.',
        ),
  }
}

export const REVPOL_CIRCUIT: CircuitDef = {
  id: 'revPol',
  label: loc('PMOS 防反接', 'PMOS reverse-polarity protection'),
  short: loc('电池防反接', 'Battery reverse protection'),
  func: loc(
    '电池或电源接反时，不让电流流进电路。比串一颗二极管好：二极管有 0.7 V 压降和 I × 0.7 V 的发热，PMOS 的压降只有 I × Rds(on)，毫伏级。',
    'Stop current from entering the circuit when the battery or supply is connected backwards. It beats a series diode: a diode drops 0.7 V and burns I × 0.7 V, while a PMOS drops only I × Rds(on), millivolts.',
  ),
  principle: loc(
    'PMOS 的漏极接电池正，源极接负载，栅极经电阻接地。正接时先是体二极管（阳极漏极、阴极源极）导通，把源极抬到 Vbat − 0.7 V，这时栅极在地，Vsg 已经足够大，沟道随之增强，体二极管被短路。反接时漏极比地还低，栅极在 0 V，Vgs = 0，沟道不形成，体二极管反偏，电流被挡住。电池电压高于 Vgs 绝对最大值时，在栅源之间并联一颗 Zener 钳位。',
    'The PMOS drain goes to the battery plus, the source to the load, and the gate to ground through a resistor. In normal polarity the body diode (anode at the drain, cathode at the source) conducts first and lifts the source to Vbat − 0.7 V; with the gate at ground, Vsg is already large, the channel enhances and shorts out the body diode. In reverse the drain is below ground and the gate is at 0 V, so Vgs = 0, no channel forms, the body diode is reverse biased and the current is blocked. When the battery voltage exceeds the gate absolute maximum, a Zener across gate-source clamps it.',
  ),
  params: loc(
    '|Vgs| 绝对最大值（常见 ±20 V）和 Zener 稳压值；Rds(on) 要看 |Vgs| 约 10 V 时的值；Vds 额定值高于最大电池电压；电流额定值高于负载电流；Rg 取 100 kΩ 左右，Zener 电流 = (Vs − Vz) ÷ Rg。',
    'The |Vgs| absolute maximum (typically ±20 V) and the Zener voltage; read Rds(on) at |Vgs| around 10 V; the Vds rating must exceed the highest battery voltage and the current rating the load current; Rg is around 100 kΩ and Zener current is (Vs − Vz) ÷ Rg.',
  ),
  pitfall: loc(
    'PMOS 装反（源漏对调）：正接看不出问题，反接时体二极管导通，保护失效；高压系统缺 Zener，Vsg 超限击穿栅极；Vth 太高的管子在低电压下增强不足，一直靠体二极管导通并发热；用 NMOS 放在高边做防反接要自举，不如放在地线上。',
    'A reversed PMOS (source and drain swapped): normal polarity looks fine, but in reverse the body diode conducts and protection fails; no Zener in a high-voltage system lets Vsg exceed its limit and break the gate; a high-Vth part enhances poorly at low voltage and keeps conducting and heating through the body diode; an NMOS in the high side needs bootstrapping, so it is easier to put it in the ground leg.',
  ),
  row: {
    part: loc('PMOS（漏极接电池）+ Rg + Zener', 'PMOS (drain to battery) + Rg + Zener'),
    param: loc('|Vgs| 最大值，Rds(on)，Zener 稳压值', '|Vgs| maximum, Rds(on), Zener voltage'),
    pit: loc('PMOS 装反、高压缺 Zener', 'Reversed PMOS, no Zener at high voltage'),
  },
  inputs: [
    {
      id: 'pol',
      label: loc('电池极性', 'Battery polarity'),
      options: [
        { id: 'normal', label: loc('正接', 'Normal') },
        { id: 'reversed', label: loc('反接', 'Reversed') },
      ],
    },
    {
      id: 'vin',
      label: loc('电池电压', 'Battery voltage'),
      options: [
        { id: '12', label: loc('12 V', '12 V') },
        { id: '24', label: loc('24 V', '24 V') },
      ],
    },
    {
      id: 'phase',
      label: loc('阶段', 'Phase'),
      options: [
        { id: 'diode', label: loc('刚接上：体二极管', 'Just connected: body diode') },
        { id: 'channel', label: loc('稳态：沟道增强', 'Steady state: channel on') },
      ],
      when: (sel) => sel.pol !== 'reversed',
    },
  ],
  knobs: [],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'pmosReversed', label: loc('PMOS 装反', 'PMOS reversed') },
    { id: 'noZener', label: loc('缺 Zener', 'No Zener') },
  ],
  solve,
}
