import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

/** SNS-01 传感器测试概述 */
export const SNS_OVERVIEW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-chain',
      term: 'Signal chain',
      name: loc('信号链', 'Signal chain'),
      def: loc(
        '传感器从被测量到数字码的路径：敏感元件、模拟前端、ADC、数字校准。少了激励，后面的码对不上物理量。见 {@snsOverview}。',
        'The path from the measurand to a digital code: sensing element, analog front end, ADC, and digital calibration. Without a stimulus, the later codes are not tied to a physical quantity. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-stimulus',
      term: 'Physical stimulus',
      name: loc('物理激励', 'Physical stimulus'),
      def: loc(
        '把光、力、压力或温度真正加到敏感元件上的手段。平场光、振动台、压力和温箱属于这一类；连续性、IDD、读寄存器和电自检只用电，盖不住全部响应。见 {@snsOverview}。',
        'A means of applying light, force, pressure, or temperature to the sensing element itself. Flat-field light, a shaker, pressure, and a chamber are in this class. Continuity, IDD, a register read, and electrical self-test use electricity only and do not cover the whole response. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-transfer',
      term: 'Transfer function',
      name: loc('传递函数', 'Transfer function'),
      def: loc(
        'out = S·x + b，再加上非线性、噪声和温漂。S 是灵敏度，b 是零输入偏移。两点法用两个 x 求 S 和 b；噪声下平均 N 次，斜率标准差按 1/√N 下降。见 {@snsOverview}。',
        'out = S*x + b, plus nonlinearity, noise, and drift. S is sensitivity and b is the zero-input offset. Two-point finds S and b from two values of x. Under noise, averaging N samples shrinks the slope std as 1/sqrt(N). See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-cal-otp',
      term: 'OTP calibration',
      name: loc('OTP 校准', 'OTP calibration'),
      def: loc(
        '测出偏移、灵敏度或温漂，把修正系数写进 OTP，下次上电再加回去。它修的是系统误差，随机噪声每次不同，系数去不掉。见 {@snsOverview}。',
        'Measure offset, sensitivity, or drift, write the correction into OTP, and apply it again at the next power-up. It corrects systematic error. Random noise is a new draw every time, so a coefficient cannot remove it. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-cis',
      term: 'CMOS image sensor',
      name: loc('CMOS 图像传感器（CIS）', 'CMOS image sensor (CIS)'),
      def: loc(
        '每个像素自己做光电转换和读出的图像传感器。本轨以 CIS 为主线：光子、像素、PTC、暗亮场、光学系统，再到量产程序；MEMS 加速度计只作对照。见 {@snsOverview}。',
        'An image sensor in which each pixel does its own photoelectric conversion and readout. This track is built around CIS: photons, pixels, PTC, dark and bright fields, the optical system, then the production program. The MEMS accelerometer is only a contrast. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
  ],
  extraLessons: {
    otp: ['snsOverview' as ModuleId],
    trim: ['snsOverview' as ModuleId],
  },
  faqs: [
    {
      id: 'sns-overview-stimulus',
      q: loc('电自检能不能代替平场光或振动台？', 'Can electrical self-test replace flat-field light or a shaker?'),
      a: loc(
        '不能完全代替。电自检用片内电压或电流走通一部分电路，不把光或力加到敏感元件上，所以归在只用电激励。光响应和真实加速度仍然要物理激励才能看到，见 {@snsOverview}。',
        'Not fully. Electrical self-test uses on-chip voltage or current to exercise part of the circuit and does not apply light or force to the sensing element, so it counts as electrical only. The optical response and a real acceleration still need a physical stimulus. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-overview-cal-noise',
      q: loc('校准写进 OTP 之后，噪声为什么还在？', 'Why is the noise still there after calibration is stored in OTP?'),
      a: loc(
        'OTP 里是偏移、灵敏度或温漂的系数，每次上电加上同一组数。随机噪声每次抽样不同，减不掉。要把斜率估计变稳，得把读数平均 N 次，标准差按 1/√N 下降，见 {@snsOverview}。',
        'OTP holds coefficients for offset, sensitivity, or drift, and every power-up adds the same numbers. Random noise is a different sample every time and cannot be subtracted. To steady the slope estimate, average N readings; the std falls as 1/sqrt(N). See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
    {
      id: 'sns-overview-not-just-adc',
      q: loc('传感器测试是不是把 ADC 读数读出来就够了？', 'Is reading the ADC enough for sensor test?'),
      a: loc(
        '不够。ADC 读的是后面的码，不是敏感元件上的物理量。没有光、力或加速度，测到的只是放大器和数字通路。要把码对上激励，必须加物理激励，再看传递函数和校准。见 {@snsOverview}。',
        'No. The ADC reads a later code, not the physical quantity on the sensing element. Without light, force or acceleration you are testing the amplifier and the digital path. To tie the code to a stimulus you must apply a physical stimulus and then look at the transfer function and the calibration. See {@snsOverview}.',
      ),
      lessons: ['snsOverview' as ModuleId],
    },
  ],
}
