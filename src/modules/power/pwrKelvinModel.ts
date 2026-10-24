/**
 * PWR-03 开尔文连接与高压漏电的教学模型（纯函数，不含界面文字）。
 * 器件为虚构的教学值（Rds = 2 mΩ），数值只用于教学。
 *
 * 2 线：R_meas = R_dut + 2·(Rc + Rlead)。加压与感测共用一对线，Rc、Rlead 都串进读数。
 * 4 线：感测回路几乎无电流，Rc、Rlead 不进读数，R_meas = R_dut（残余误差教学上忽略）。
 *
 * 高压漏电：I_fix = V / R_eff，R_eff = R_ins × 湿度因子（教学示意）。
 * guard 开时，夹具绝缘路径的测量端被拉到加压电位，I_fix 记为 0（教学简化）。
 * 读数 I_meas = Idss + I_fix，误差 = I_fix / Idss。
 */

/** 教学用 DUT 导通电阻，mΩ */
export const RDUT_MOHM = 2

/** 教学取的误差门槛（%），不是任何标准的数值 */
export const ERR_LIMIT_PCT = 5

/** 接线方式的 id，显示顺序即数组顺序；默认取 [0] */
export const MODE_IDS = ['2w', '4w'] as const
export type WireMode = (typeof MODE_IDS)[number]

/** guard 的 id，显示顺序即数组顺序；默认取 [0]（关） */
export const GUARD_IDS = ['off', 'on'] as const
export type GuardMode = (typeof GUARD_IDS)[number]

/** DUT 漏电 Idss 的选项（nA），显示顺序即数组顺序；默认取 [0] */
export const IDSS_NA_OPTIONS: number[] = [10, 20, 100, 1000, 10000]

/** 湿度低于此值时绝缘电阻不随湿度下降，%RH */
export const HUMID_KNEE_PCT = 40

/** 湿度因子：超过拐点后每升高 50 %RH，绝缘电阻降为十分之一（教学示意） */
export function humidityFactor(rhPct: number): number {
  if (rhPct <= HUMID_KNEE_PCT) {
    return 1
  }
  return Math.pow(10, -(rhPct - HUMID_KNEE_PCT) / 50)
}

/** 2 线测得电阻，mΩ */
export function twoWireMohm(rdutMohm: number, rcMohm: number, rleadMohm: number): number {
  return rdutMohm + 2 * (rcMohm + rleadMohm)
}

/** 4 线测得电阻，mΩ：感测回路几乎无电流，等于 DUT 本身 */
export function fourWireMohm(rdutMohm: number): number {
  return rdutMohm
}

/** 相对真值的误差，%；真值为 0 时无意义，调用方保证 truth > 0 */
export function errorPct(measured: number, truth: number): number {
  return ((measured - truth) / truth) * 100
}

export type ContactState = {
  mode: WireMode
  /** 加压电流，A */
  iA: number
  /** 每个接触的接触电阻，mΩ */
  rcMohm: number
  /** 每根引线的电阻，mΩ */
  rleadMohm: number
}

export const DEFAULT_CONTACT: ContactState = { mode: MODE_IDS[0], iA: 50, rcMohm: 0.2, rleadMohm: 0.3 }

export type ContactAnalysis = {
  r2wMohm: number
  r4wMohm: number
  /** 当前接法下的测得电阻，mΩ */
  rMeasMohm: number
  /** 2 线误差，%（与当前接法无关，用于任务卡） */
  err2wPct: number
  /** 当前接法的误差，% */
  errPct: number
  /** 当前接法下电压读数 I × R_meas，mV */
  vMeasMv: number
}

export function analyseContact(s: ContactState): ContactAnalysis {
  const r2w = twoWireMohm(RDUT_MOHM, s.rcMohm, s.rleadMohm)
  const r4w = fourWireMohm(RDUT_MOHM)
  const rMeas = s.mode === '4w' ? r4w : r2w
  return {
    r2wMohm: r2w,
    r4wMohm: r4w,
    rMeasMohm: rMeas,
    err2wPct: errorPct(r2w, RDUT_MOHM),
    errPct: errorPct(rMeas, RDUT_MOHM),
    vMeasMv: s.iA * rMeas,
  }
}

export type HvState = {
  /** 测试电压 Vtest，V */
  vtest: number
  /** 夹具绝缘电阻的指数 n，R_ins = 10^n Ω */
  rinsExp: number
  /** 相对湿度，%RH */
  rh: number
  guard: GuardMode
  /** DUT 漏电 Idss，nA */
  idssNa: number
}

export const DEFAULT_HV: HvState = {
  vtest: 1000,
  rinsExp: 11,
  rh: 40,
  guard: GUARD_IDS[0],
  idssNa: IDSS_NA_OPTIONS[0],
}

/** 夹具绝缘路径的有效电阻，Ω */
export function insulationEffOhm(rinsExp: number, rhPct: number): number {
  return Math.pow(10, rinsExp) * humidityFactor(rhPct)
}

/** 夹具漏电电流，A；guard 开时分流走，记为 0 */
export function fixtureCurrentA(vtestV: number, rEffOhm: number, guardOn: boolean): number {
  if (guardOn) {
    return 0
  }
  return vtestV / rEffOhm
}

export type HvAnalysis = {
  rEffOhm: number
  ifixA: number
  idssA: number
  iMeasA: number
  /** 测得电流相对 Idss 的误差，% */
  errPct: number
  guardOn: boolean
}

export function analyseHv(s: HvState): HvAnalysis {
  const guardOn = s.guard === 'on'
  const rEff = insulationEffOhm(s.rinsExp, s.rh)
  const ifix = fixtureCurrentA(s.vtest, rEff, guardOn)
  const idss = s.idssNa * 1e-9
  const iMeas = idss + ifix
  return {
    rEffOhm: rEff,
    ifixA: ifix,
    idssA: idss,
    iMeasA: iMeas,
    errPct: (ifix / idss) * 100,
    guardOn,
  }
}

/** 电流显示：µA 或 nA，三位有效数字 */
export function fmtAmp(a: number): string {
  if (Math.abs(a) >= 1e-6) {
    return `${(a * 1e6).toPrecision(3)} µA`
  }
  return `${(a * 1e9).toPrecision(3)} nA`
}

/** 电阻显示：GΩ 或 TΩ，三位有效数字 */
export function fmtOhmHv(r: number): string {
  if (r >= 1e12) {
    return `${(r / 1e12).toPrecision(3)} TΩ`
  }
  return `${(r / 1e9).toPrecision(3)} GΩ`
}

/** 把数值替换进 loc 文本里的 {key} 占位符，中英文都替换 */
export function fill(text: { zh: string; en?: string }, values: Record<string, string>): { zh: string; en?: string } {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: text.en === undefined ? undefined : apply(text.en) }
}
