import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const asId = (id: string): ModuleId => id as ModuleId

/** SNS-07 颜色与光学系统：拜耳、积分球、光谱、光源非均匀 */
export const SNS_OPTICAL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-bayer',
      term: 'Bayer filter',
      name: loc('拜耳滤色阵列', 'Bayer filter'),
      def: loc(
        '相邻像素戴不同的 R、G、B 滤色片。各通道量子效率不一样，所以颜色测试要分开照。见 {@snsOptical}。',
        'Neighboring pixels wear different R, G and B filters. The channels do not share one quantum efficiency, so a color test lights them separately. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
    {
      id: 'sns-sphere',
      term: 'Integrating sphere',
      name: loc('积分球', 'Integrating sphere'),
      def: loc(
        '把光来回反射，使照到传感器上的场尽量均匀。平场和 PRNU 都靠它把光源自己的花纹压下去。见 {@snsOptical}。',
        'A cavity that bounces light until the field on the sensor is as even as possible. Flat-field and PRNU tests use it to push down the pattern of the source itself. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
    {
      id: 'sns-spectral',
      term: 'Spectral response',
      name: loc('光谱响应', 'Spectral response'),
      def: loc(
        '器件输出随波长的变化。用窄带光源扫描，再除以校准过的参考光电二极管，把光源强弱从结果里除掉。见 {@snsOptical}。',
        'How the device output changes with wavelength. Scan with a narrow-band source and divide by a calibrated reference photodiode, so the source strength is removed from the result. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
    {
      id: 'sns-prnu-source',
      term: 'PRNU with source non-uniformity',
      name: loc('含光源非均匀的 PRNU', 'PRNU with source non-uniformity'),
      def: loc(
        '测得 PRNU = sqrt(真 PRNU^2 + 光源非均匀^2)。把灯调亮不会缩小这项，均匀度和稳定度才会。见 {@snsOptical}。',
        'Measured PRNU = sqrt(true PRNU^2 + source non-uniformity^2). A brighter lamp does not shrink this term. Uniformity and stability do. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-optical-brighter',
      q: loc('光源是不是越亮越好？', 'Is a brighter source always better?'),
      a: loc(
        '不是。亮只提高信号。测得 PRNU 由真值和光源非均匀决定，稳定度和参考二极管的校准误差留在光谱曲线里。目标是均匀和稳定。见 {@snsOptical}。',
        'No. Brightness only raises the signal. Measured PRNU is set by the true value and the source non-uniformity, and stability plus reference-diode calibration error stay on the spectral curve. The goal is uniformity and stability. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
    {
      id: 'sns-optical-multisite',
      q: loc('光学测试为什么很难多工位？', 'Why is optical multi-site hard?'),
      a: loc(
        '几个工位要同时看到同一块又均匀又稳定的光，夹具几何和光源均匀度都会挡住。数据量也大：12 MP、12 bit 的一帧是 18 MB。见 {@snsOptical}。',
        'Several sites have to see one field that is both even and stable. Fixture geometry and source uniformity both get in the way. The data volume is large too: one 12 MP, 12 bit frame is 18 MB. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
    {
      id: 'sns-optical-rgb-three',
      q: loc('颜色传感器是不是只测 R、G、B 三个点就够？', 'Is measuring three R, G and B points enough for a color sensor?'),
      a: loc(
        '不够。拜耳三通道的量子效率曲线不同，滤色片旁瓣和红外泄漏也在曲线上。三个宽谱点只能核对通道比，画不出光谱响应。要扫窄带波长，并用校准过的参考光电二极管除掉光源强弱。见 {@snsOptical}。',
        'No. The three Bayer channels do not share one quantum-efficiency curve, and filter side lobes and infrared leak sit on that curve. Three broadband points only check channel ratios; they do not draw the spectral response. Scan with a narrow-band source and divide by a calibrated reference photodiode so the source strength is removed. See {@snsOptical}.',
      ),
      lessons: [asId('snsOptical')],
    },
  ],
}
