/**
 * 功率器件教学模型（PWR 课共用）。虚构器件，数值只用于教学，不对应任何真实型号。
 * 经验关系（温度系数、趋势）在界面上标注为“教学示意”。
 */

export type MosModel = {
  /** 阈值电压（V） */
  vth: number
  /** 跨导系数 kp（A/V²，25 °C 下） */
  kp: number
  /** 25 °C 导通电阻（Ω） */
  rds25: number
  /** 导通电阻温度系数（1/K），教学默认 0.005 */
  rdsTempco: number
  /** 击穿电压（V） */
  bv: number
  /** 栅源电容（F） */
  cgs: number
  /** 栅漏电容随 Vds 变化（F） */
  cgdAt: (vds: number) => number
  /** 漏源电容随 Vds 变化（F） */
  cds: (vds: number) => number
}

/** 教学用 100 V 硅 MOSFET 参数（VDUT-MOS1 的示意值） */
export function demoMos(): MosModel {
  return {
    vth: 3,
    kp: 2 * 2.5,
    rds25: 0.005,
    rdsTempco: 0.005,
    bv: 100,
    cgs: 3e-9,
    cgdAt: (vds: number) => 0.8e-9 / Math.sqrt(1 + vds / 5),
    cds: (vds: number) => 1.2e-9 / Math.sqrt(1 + vds / 5),
  }
}

/**
 * 简化的平方律漏极电流（教学用，忽略沟道长度调制）。
 * 饱和区 Id = kp/2 · (Vgs−Vth)²；线性区 Id = kp · ((Vgs−Vth)·Vds − Vds²/2)。
 * kp 随温度按 (T/298)^−1.5 变化（迁移率下降）。Vgs ≤ Vth 时 Id = 0。
 */
export function mosId(m: MosModel, vgs: number, vds: number, tC: number): number {
  const vov = vgs - m.vth
  if (vov <= 0 || vds <= 0) {
    return 0
  }
  const tK = tC + 273.15
  const kpT = m.kp * Math.pow(tK / 298.15, -1.5)
  if (vds < vov) {
    return kpT * (vov * vds - (vds * vds) / 2)
  }
  return (kpT / 2) * vov * vov
}

/** 导通电阻随温度变化：R(T) = R25 · [1 + α(T − 25)] */
export function rdsOn(m: MosModel, tC: number): number {
  return m.rds25 * (1 + m.rdsTempco * (tC - 25))
}

/** 导通损耗 P = I² · Rds(on) */
export function conductionLoss(currentA: number, rOhm: number): number {
  return currentA * currentA * rOhm
}

/** 雪崩能量 E_AS = ½ · L · Ipk² · BV / (BV − Vdd) */
export function easJ(l: number, ipk: number, vdd: number, bv: number): number {
  return (0.5 * l * ipk * ipk * bv) / (bv - vdd)
}

/** 雪崩时间 t_av = L · Ipk / (BV − Vdd) */
export function avalancheTime(l: number, ipk: number, vdd: number, bv: number): number {
  return (l * ipk) / (bv - vdd)
}

/** 给定雪崩能量反求 Ipk：Ipk = √(2 · E_AS · (BV − Vdd) / (L · BV)) */
export function ipkForEnergy(eas: number, l: number, vdd: number, bv: number): number {
  return Math.sqrt((2 * eas * (bv - vdd)) / (l * bv))
}

/**
 * UIS 波形（教学理想化）：电感电流从 Ipk 线性降到 0，时间 t_av；
 * 雪崩期间 Vds 钳位在 BV。返回等间隔采样点，便于画图。
 */
export function uisWaveform(
  p: { l: number; ipk: number; vdd: number; bv: number },
  points = 200,
): { eas: number; tav: number; t: number[]; id: number[]; vds: number[] } {
  const tav = avalancheTime(p.l, p.ipk, p.vdd, p.bv)
  const eas = easJ(p.l, p.ipk, p.vdd, p.bv)
  const t: number[] = []
  const id: number[] = []
  const vds: number[] = []
  const span = tav * 1.25
  for (let i = 0; i <= points; i += 1) {
    const ti = (span * i) / points
    t.push(ti)
    if (ti <= tav) {
      id.push(p.ipk * (1 - ti / tav))
      vds.push(p.bv)
    } else {
      id.push(0)
      vds.push(p.vdd)
    }
  }
  return { eas, tav, t, id, vds }
}
