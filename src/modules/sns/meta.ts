import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 传感器 / CIS 轨道（sensor，前缀 S）。顺序即课序。 */
export const SNS_LESSONS = [
  'snsOverview',
  'snsPhoton',
  'snsPixel',
  'snsPtc',
  'snsDark',
  'snsFlat',
  'snsOptical',
  'snsAccel',
  'snsProgram',
] as const

export type SnsLessonId = (typeof SNS_LESSONS)[number]

export const SNS_META: Record<SnsLessonId, LessonMeta> = {
  snsOverview: {
    title: loc('传感器测试概述', 'Sensor test overview'),
    goal: loc(
      '把传感器拆成敏感元件、模拟前端、ADC 和数字校准；区分偏移、灵敏度、线性度、噪声和温漂；说明物理激励为什么是测试的难点。',
      'Split a sensor into the sensing element, analog front end, ADC and digital calibration; tell offset, sensitivity, linearity, noise and temperature drift apart; explain why a physical stimulus is the hard part of the test.',
    ),
  },
  snsPhoton: {
    title: loc('光电基础：光子、量子效率与噪声', 'Photo basics: photons, quantum efficiency and noise'),
    goal: loc(
      '由功率和波长算光子通量；用量子效率和响应度把光换成电子；区分光子散粒噪声、暗散粒噪声和读出噪声，并判断哪一种主导。',
      'Compute photon flux from power and wavelength; convert light to electrons with quantum efficiency and responsivity; tell photon shot noise, dark shot noise and read noise apart, and say which one dominates.',
    ),
  },
  snsPixel: {
    title: loc('CMOS 图像传感器：像素与读出链', 'CMOS image sensor: pixel and readout chain'),
    goal: loc(
      '说出 4T 像素的复位、积分、转移和读出；计算转换增益和 kTC 噪声；说明相关双采样去掉的是哪一种噪声；把电子、电压和 DN 串起来。',
      'Name the 4T pixel sequence: reset, integration, transfer and readout; compute conversion gain and kTC noise; explain which noise correlated double sampling removes; connect electrons, voltage and DN.',
    ),
  },
  snsPtc: {
    title: loc('光子传递曲线（PTC）与转换增益', 'Photon transfer curve (PTC) and conversion gain'),
    goal: loc(
      '说明 PTC 怎么测；用差帧法去掉固定模式，从斜率读出转换增益 K、读噪、满阱和动态范围；看 ROI 大小怎样影响估计误差。',
      'Explain how a PTC is measured; remove fixed pattern with the difference of two frames and read conversion gain K, read noise, full well and dynamic range from the slope; see how ROI size changes the estimate.',
    ),
  },
  snsDark: {
    title: loc('暗场测试：暗电流、DSNU 与热像素', 'Dark test: dark current, DSNU and hot pixels'),
    goal: loc(
      '解释暗电流怎样随温度和曝光变；把时间噪声和 DSNU（空间固定模式）分开；用多帧平均压低时间噪声；设置热像素阈值并权衡漏检和误判。',
      'Explain how dark current depends on temperature and exposure; separate temporal noise from DSNU (spatial fixed pattern); average frames to reduce temporal noise; set a hot-pixel threshold and trade misses against false calls.',
    ),
  },
  snsFlat: {
    title: loc('亮场测试：PRNU、线性度与缺陷像素', 'Bright test: PRNU, linearity and defective pixels'),
    goal: loc(
      '用平场测 PRNU；看帧平均怎样影响估计；把 shading 和像素级非均匀分开；评估线性度；按死点、热点、低灵敏点和簇规则给缺陷分类。',
      'Measure PRNU from a flat field; see how frame averaging changes the estimate; separate shading from pixel non-uniformity; assess linearity; classify dead, hot, low-sensitivity and cluster defects.',
    ),
  },
  snsOptical: {
    title: loc('颜色、光谱响应与光学测试系统', 'Color, spectral response and the optical test system'),
    goal: loc(
      '解释拜耳阵列和各通道量子效率；说明光谱响应用参考光电二极管校准；估算光源不均匀和数据传输时间；说出光学并行为什么难。',
      'Explain the Bayer array and per-channel quantum efficiency; describe spectral-response calibration with a reference photodiode; estimate the effect of source non-uniformity and the data-transfer time; say why optical parallelism is hard.',
    ),
  },
  snsAccel: {
    title: loc('MEMS 加速度计测试基础', 'MEMS accelerometer test basics'),
    goal: loc(
      '说出 0 g 偏移、灵敏度、噪声密度、非线性和温漂；用重力翻转求偏移和灵敏度；估算安装倾角和带宽内噪声；比较翻转、转台和静电自检。',
      'Name 0 g offset, sensitivity, noise density, nonlinearity and temperature drift; find offset and sensitivity by flipping in gravity; estimate tilt error and in-band noise; compare a flip, a rate table and electrical self-test.',
    ),
  },
  snsProgram: {
    title: loc('综合：CIS 量产测试程序', 'Capstone: CIS production test program'),
    goal: loc(
      '为 VDUT-CIS1 排一个量产程序；在帧数和估计精度之间取舍；生成缺陷图并写入 OTP；按缺陷数和簇规则分级；导出可复核的结果。',
      'Lay out a production program for VDUT-CIS1; trade frame count against estimate precision; build a defect map and write it to OTP; grade by defect count and cluster rules; export a result that can be checked again.',
    ),
  },
}
