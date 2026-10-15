/**
 * 软启动的数值模型（示意参数，非具体型号）：
 * PMOS 高边开关，栅源电容 Cg 经 Rg 充电，Vsg 按指数上升；负载电容 Cl 由 PMOS 充电，
 * 管子用平方律，供电和线缆的串联电阻 Rsrc 限制最大电流。不含米勒反馈，所以只是一阶近似。
 */
export const VIN_SOFT = 12
/** PMOS 开启阈值 |Vth|（V）与跨导参数 k（A/V²） */
export const VTH_SOFT = 2
const K_SOFT = 4
/** 电源 + 线缆 + 连接器的串联电阻 */
export const RSRC = 0.05
/** 栅源上拉电阻，保证关断时栅极回到源极电平 */
export const RGS = 10e6
/** 管子完全导通时的 Rds(on) */
export const RDS_SOFT = 0.03
/** 栅极没有 RC 时，驱动能力和管子输入电容决定的最快 τ */
export const TAU_HARD = 1e-6

export type SoftRun = {
  t: number[]
  vsg: number[]
  vout: number[]
  i: number[]
  tEnd: number
  /** 画曲线用的时间窗：只留输出爬升附近，免得爬升被压成一条竖线 */
  tView: number
  tau: number
  ipeak: number
  /** 输出从 10% 到 90% 的时间，s */
  tRamp: number
  /** C·ΔV/Δt，A */
  iavg: number
}

/** rg Ω，cg F（0 表示没有电容），cl F */
export function softStart(rg: number, cg: number, cl: number): SoftRun {
  const rpar = (rg * RGS) / (rg + RGS)
  const tau = cg > 0 ? rpar * cg : TAU_HARD
  const vinf = (VIN_SOFT * RGS) / (rg + RGS)
  const tEnd = Math.max(8 * tau, 12 * RSRC * cl)
  const n = 3000
  const dt = tEnd / n
  const t: number[] = []
  const vsgArr: number[] = []
  const vout: number[] = []
  const iArr: number[] = []
  let vo = 0
  let ipeak = 0
  let t10 = -1
  let t90 = -1
  for (let k = 0; k <= n; k += 1) {
    const tt = k * dt
    const vsg = vinf * (1 - Math.exp(-tt / tau))
    const vov = vsg - VTH_SOFT
    const vsd = VIN_SOFT - vo
    let ifet = 0
    if (vov > 0) {
      ifet = vsd < vov ? K_SOFT * (vov * vsd - (vsd * vsd) / 2) : (K_SOFT / 2) * vov * vov
    }
    const i = Math.min(ifet, vsd / (RSRC + RDS_SOFT))
    t.push(tt)
    vsgArr.push(vsg)
    vout.push(vo)
    iArr.push(i)
    ipeak = Math.max(ipeak, i)
    if (t10 < 0 && vo >= 0.1 * VIN_SOFT) {
      t10 = tt
    }
    if (t90 < 0 && vo >= 0.9 * VIN_SOFT) {
      t90 = tt
    }
    vo += Math.min((i * dt) / cl, vsd)
  }
  const tRamp = t10 >= 0 && t90 >= 0 ? Math.max(t90 - t10, dt) : tEnd
  const iavg = (cl * 0.8 * VIN_SOFT) / tRamp
  const tView = t90 >= 0 ? Math.min(tEnd, t90 + 3 * tRamp) : tEnd
  return { t, vsg: vsgArr, vout, i: iArr, tEnd, tView, tau, ipeak, tRamp, iavg }
}
