/**
 * VDUT-PIC1：虚拟硅光芯片。参数是教学示意，不对应任何代工厂或商用器件。
 * 规格里的 json 与此文件同一组数；页面只引用这里，避免再开 JSON 模块解析。
 */
export const VDUT_PIC1 = {
  id: 'VDUT-PIC1',
  note: 'teaching illustration',
  tx: {
    ringRadiusUm: 10,
    heater: true,
    mzmVpiV: 4,
  },
  rx: {
    kind: 'Ge PD',
    responsivityAW: 0.8,
    darkCurrentA: 10e-9,
    tiaSigmaA: 10e-6,
  },
  coupling: {
    gcLossDb: 3,
    gcBandwidthNm: 40,
    edgeCoupler: false,
  },
  cutbackCm: [0.1, 0.5, 1.0, 2.0],
  waveguide: {
    neff: 2.4,
    ng: 4.2,
    lossDbPerCm: 2.5,
    dneffDt: 1.8e-4,
    lambdaNm: 1550,
  },
} as const
