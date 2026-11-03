/** VDUT-CIS1：虚拟 CMOS 图像传感器。统计模型，不对应任何真实型号。 */
export const VDUT_CIS1 = {
  id: 'VDUT-CIS1',
  note: 'teaching illustration',
  w: 128,
  h: 128,
  kEperDn: 8,
  readNoiseE: 3,
  fwcE: 20000,
  darkE25PerS: 20,
  darkDoubleC: 7,
  prnu: 0.01,
  shadingPct: 0.04,
  defects: { dead: 4, hot: 6, low: 5, clusterProb: 0.15 },
  blackLevelDn: 64,
  adcBits: 12,
} as const

/** VDUT-ACC1：虚拟三轴 MEMS 加速度计（模拟输出），教学示意。 */
export const VDUT_ACC1 = {
  id: 'VDUT-ACC1',
  note: 'teaching illustration',
  sVg: 0.3,
  offsetV: 1.65,
  ndGPerRtHz: 150e-6,
  bwHz: 50,
  nonlin: 0.002,
  tcoVPerC: 0.0004,
} as const
