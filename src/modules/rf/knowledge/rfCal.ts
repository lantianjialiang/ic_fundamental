import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-13 RF 校准与误差：校准参考面、误差因子、去嵌入 */
export const RF_CAL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'reference-plane',
      term: 'Reference plane',
      name: loc('校准参考面', 'Calibration reference plane'),
      def: loc(
        '校准把误差修正到的那个位置。参考面之前的误差能被校准修掉，参考面之后的线缆和夹具修不到。把参考面移到 DUT 接口，线缆与夹具才算进校准。见 {@rfCal}。',
        'The position to which calibration corrects the measurement. Errors before the reference plane can be removed by calibration; the cable and fixture beyond it cannot be reached. Moving the plane to the DUT interface brings the cable and fixture into the calibration. See {@rfCal}.',
      ),
      lessons: ['rfCal'],
    },
    {
      id: 'error-term',
      term: 'Error term',
      name: loc('误差因子', 'Error term'),
      def: loc(
        '测得值与真值之间的乘性因子（复数，取 dB 后变成相加）。测得值 = 真值 × 误差因子。校准就是用已知标准件把它求出来，再用它修正测量值。见 {@rfCal}。',
        'The multiplicative factor (complex; it becomes additive in dB) between the measured and the true value. Measured = true × error term. Calibration measures known standards to find it and then uses it to correct readings. See {@rfCal}.',
      ),
      lessons: ['rfCal'],
    },
  ],
  extraLessons: {
    calibration: ['rfCal'],
    'de-embedding': ['rfCal'],
  },
  faqs: [
    {
      id: 'rf-cal-port-not-enough',
      q: loc('在仪器端口校准过，线缆损耗为什么还在？', 'Why does cable loss remain after a calibration at the instrument port?'),
      a: loc(
        '因为校准的参考面在仪器端口，线缆和夹具在参考面之后。校准只能修掉参考面之前的误差（仪器自身），管不到线缆的损耗和纹波。要修掉它们，要么把直通标准件接到 DUT 接口做校准，要么用夹具模型去嵌入。见 {@rfCal}。',
        'Because the calibration reference plane is at the instrument port, and the cable and fixture lie beyond it. Calibration only removes errors before the plane (the instrument itself) and cannot reach the cable loss or ripple. To remove them, calibrate with the thru standard at the DUT interface, or de-embed with a fixture model. See {@rfCal}.',
      ),
      lessons: ['rfCal'],
    },
    {
      id: 'rf-cal-standard-limit',
      q: loc('直通标准件本身也有误差，校准能准到哪里？', 'The thru standard has error too; how accurate can calibration be?'),
      a: loc(
        '校准后的误差不会比标准件的不确定度更小。误差因子里包含了标准件的偏差，修正时被原样带进测量结果。重复测量只能压掉随机的测量噪声，压不掉标准件固定的偏差。所以标准件要用比被测器件更高等级的标准。见 {@rfCal}。',
        'The compensated error cannot be smaller than the standard’s uncertainty. The error factor includes the standard’s deviation, which goes into every result unchanged. Repeated measurements only reduce random noise, not the standard’s fixed deviation, so the standard must be of higher grade than the device under test. See {@rfCal}.',
      ),
      lessons: ['rfCal'],
    },
    {
      id: 'rf-cal-deembed-vs-cal',
      q: loc('去嵌入和在 DUT 接口校准，该选哪一个？', 'De-embedding or calibrating at the DUT interface: which should I use?'),
      a: loc(
        '看夹具模型准不准、纹波大不大。夹具的损耗平滑、纹波小，去嵌入就够用，还省去每次校准标准件；夹具有明显纹波或模型不准时，要在 DUT 接口直通校准，让纹波进入误差因子一起修掉。见 {@rfCal}。',
        'It depends on how good the fixture model is and how large the ripple is. If the fixture loss is smooth and the ripple is small, de-embedding is enough and saves measuring standards each time; if there is significant ripple or the model is poor, calibrate with a thru at the DUT interface so the ripple enters the error factor and is removed with it. See {@rfCal}.',
      ),
      lessons: ['rfCal'],
    },
  ],
}
