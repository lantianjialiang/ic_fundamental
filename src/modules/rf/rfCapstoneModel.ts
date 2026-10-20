import { gaussian, seededRandom } from '../ana/core/rng'

/**
 * RF-14 综合：虚拟收发器 VDUT-RFT1 的 Tx / Rx 测试模型（纯函数，无 DOM）。规格均为教学取值。
 *
 * 测试顺序（有停止条件）：上电与校准 → Tx 输出功率 → Tx EVM → Rx 增益 → Rx BER（灵敏度）。
 * 任一项失败即停止后续测试（后续项标为“跳过”、不计入结果）；器件按第一次失败的项分到 Tx 失败或 Rx 失败。
 *
 * Tx：输出功率 = 设置值 + 器件偏差 + 仪表噪声；EVM 用 QPSK 符号加高斯噪声，按 EVM = √(平均误差功率 / 参考功率) 计算。
 * Rx：增益 = 器件增益 + 仪表噪声；灵敏度用 BER 判定。
 *   每比特 Eb/N0 = SNR − 实现损耗，SNR = P_in − (底噪 kTB + NF)，带宽取 1 MHz；
 *   QPSK 的 BER = Q(√(2·Eb/N0))。BER 限值 1e-3 所需的 Eb/N0 由 Q 函数解析求出（见 EBN0_REQ_DB）。
 *   测试时发送 BER_BITS 个比特、数误码数，误码数 / 比特数即 BER 估计；误码数不超过 BER_LIMIT × BER_BITS 判 Pass。
 *   解析灵敏度（BER = 1e-3 的输入功率）= 底噪 + NF + SNR_REQ_DB，只用于说明，测试本身只在一个功率点测。
 */

export const DEVICE_NAME = 'VDUT-RFT1'
export const N_DEVICES = 100
const BASE_SEED = 0x7f10
const DEVICE_SEED_STRIDE = 7919

export const TX_SET_DBM = 10
export const POUT_LIMIT_DBM: [number, number] = [8, 12]
export const EVM_LIMIT_PCT = 8
export const EVM_SYMBOLS = 256
export const GAIN_LIMIT_DB: [number, number] = [18, 22]
/** 规格：接收灵敏度应优于（不大于）此值 */
export const SENS_SPEC_DBM = -95
export const BER_LIMIT = 1e-3
export const BER_BITS = 20000

/** 1 MHz 带宽的热噪声底：−174 dBm/Hz + 60 dB */
const NOISE_1MHZ_DBM = -114
/** 实现损耗（dB）：理想 QPSK 之外的各种损失 */
export const IMPL_LOSS_DB = 2.2

/** 教学用的器件分布中心与散布（1σ，乘以散布倍数） */
const RX_NOM_GAIN_DB = 20
const NF_NOM_DB = 8.5
const EVM_NOM_PCT = 5.5
const TX_OFFSET_SIGMA_DB = 1.0
const GAIN_SIGMA_DB = 1.0
const NF_SIGMA_DB = 1.0
const EVM_SIGMA_PCT = 1.5
/** 仪表读数噪声（dB） */
const METER_NOISE_DB = 0.05

/**
 * Q(x) = P(X > x)，标准正态尾部概率。
 * Abramowitz & Stegun 26.2.17，绝对误差约 7.5e-8，对 BER 这种小概率足够用（不依赖其他课的代码）。
 */
export function qFunction(x: number): number {
  if (x < 0) {
    return 1 - qFunction(-x)
  }
  const t = 1 / (1 + 0.2316419 * x)
  const phi = Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI)
  const poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return phi * poly
}

/** Q(x) = p 的解（二分法），p 需在 (0, 0.5) 内 */
export function qInverse(p: number): number {
  let lo = 0
  let hi = 10
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2
    if (qFunction(mid) > p) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

/** BER = 1e-3 时 QPSK 所需的 Eb/N0（dB）：Q(√(2x)) = 1e-3 ⇒ x = Q⁻¹(1e-3)² / 2 */
export const EBN0_REQ_DB = 10 * Math.log10((qInverse(BER_LIMIT) ** 2) / 2)
/** 接收端 SNR 需要达到的值（dB）= Eb/N0 + 实现损耗 */
export const SNR_REQ_DB = EBN0_REQ_DB + IMPL_LOSS_DB

/** 某个 NF 下的解析灵敏度（dBm）：BER = 1e-3 时的输入功率 */
export function analyticSensDbm(nfDb: number): number {
  return NOISE_1MHZ_DBM + nfDb + SNR_REQ_DB
}

/** 理论 BER（解析）：输入功率 pDbm、噪声系数 nfDb 时的 QPSK 误码率 */
export function berTheory(pDbm: number, nfDb: number): number {
  const snr = pDbm - (NOISE_1MHZ_DBM + nfDb)
  const ebn0 = snr - IMPL_LOSS_DB
  return qFunction(Math.sqrt(2 * 10 ** (ebn0 / 10)))
}

export type Bin = 'pass' | 'txFail' | 'rxFail'
export type StopAt = 'none' | 'txPower' | 'txEvm' | 'rxGain' | 'rxBer'

export type DeviceResult = {
  index: number
  seed: number
  nfDb: number
  /** 解析灵敏度（dBm）：仅用于说明 */
  sensDbm: number
  pout: number
  poutPass: boolean
  /** 未运行时为 null */
  evm: number | null
  evmPass: boolean | null
  gain: number | null
  gainPass: boolean | null
  errors: number | null
  ber: number | null
  berPass: boolean | null
  bin: Bin
  stopAt: StopAt
}

export type CapState = {
  /** 工艺散布倍数：放大所有器件参数的散布 */
  spread: number
  /** Rx 测试功率（dBm） */
  rxTest: number
  /** 当前查看的器件编号（1–N_DEVICES） */
  device: number
}

export const DEFAULT_CAP: CapState = { spread: 1, rxTest: SENS_SPEC_DBM, device: 1 }

/**
 * 测试一颗器件。参数与噪声都来自固定种子，同一编号、同一设置每次结果一样。
 * 停止规则：某项不过就直接返回，后面的项不计算。
 */
export function testDevice(index: number, spread: number, rxTestDbm: number): DeviceResult {
  const seed = BASE_SEED + index * DEVICE_SEED_STRIDE
  const rng = seededRandom(seed)

  const txOffset = TX_OFFSET_SIGMA_DB * spread * gaussian(rng)
  const gain = RX_NOM_GAIN_DB + GAIN_SIGMA_DB * spread * gaussian(rng)
  const nfDb = NF_NOM_DB + NF_SIGMA_DB * spread * gaussian(rng)
  const evmTarget = Math.max(0.5, EVM_NOM_PCT + EVM_SIGMA_PCT * spread * gaussian(rng))
  const sensDbm = analyticSensDbm(nfDb)

  // 1. Tx 输出功率
  const pout = TX_SET_DBM + txOffset + METER_NOISE_DB * gaussian(rng)
  const poutPass = pout >= POUT_LIMIT_DBM[0] && pout <= POUT_LIMIT_DBM[1]
  const base = {
    index,
    seed,
    nfDb,
    sensDbm,
    pout,
    poutPass,
    evm: null,
    evmPass: null,
    gain: null,
    gainPass: null,
    errors: null,
    ber: null,
    berPass: null,
  }
  if (!poutPass) {
    return { ...base, bin: 'txFail', stopAt: 'txPower' }
  }

  // 2. Tx EVM：QPSK 符号 s 经过器件后变成 r = s + 噪声；EVM 用 |r − s|² 的平均值对参考功率 1 归一化
  const sigmaDim = evmTarget / (100 * Math.SQRT2)
  let errPower = 0
  for (let k = 0; k < EVM_SYMBOLS; k += 1) {
    const sI = (rng() < 0.5 ? 1 : -1) / Math.SQRT2
    const sQ = (rng() < 0.5 ? 1 : -1) / Math.SQRT2
    const rI = sI + sigmaDim * gaussian(rng)
    const rQ = sQ + sigmaDim * gaussian(rng)
    const dI = rI - sI
    const dQ = rQ - sQ
    errPower += dI * dI + dQ * dQ
  }
  const evm = 100 * Math.sqrt(errPower / EVM_SYMBOLS)
  const evmPass = evm <= EVM_LIMIT_PCT
  if (!evmPass) {
    return { ...base, evm, evmPass, bin: 'txFail', stopAt: 'txEvm' }
  }

  // 3. Rx 增益
  const gainMeas = gain + METER_NOISE_DB * gaussian(rng)
  const gainPass = gainMeas >= GAIN_LIMIT_DB[0] && gainMeas <= GAIN_LIMIT_DB[1]
  if (!gainPass) {
    return { ...base, evm, evmPass, gain: gainMeas, gainPass, bin: 'rxFail', stopAt: 'rxGain' }
  }

  // 4. Rx BER：在测试功率下发送 BER_BITS 个比特，数误码
  const snr = rxTestDbm - (NOISE_1MHZ_DBM + nfDb)
  const ebn0 = snr - IMPL_LOSS_DB
  const amp = Math.sqrt(2 * 10 ** (ebn0 / 10))
  let errors = 0
  for (let b = 0; b < BER_BITS; b += 1) {
    if (amp + gaussian(rng) < 0) {
      errors += 1
    }
  }
  const ber = errors / BER_BITS
  const berPass = ber <= BER_LIMIT
  const rxDone = { ...base, evm, evmPass, gain: gainMeas, gainPass, errors, ber, berPass }
  if (!berPass) {
    return { ...rxDone, bin: 'rxFail', stopAt: 'rxBer' }
  }
  return { ...rxDone, bin: 'pass', stopAt: 'none' }
}

/** 一批器件：编号 1…N_DEVICES */
export function runBatch(spread: number, rxTestDbm: number): DeviceResult[] {
  const out: DeviceResult[] = []
  for (let i = 1; i <= N_DEVICES; i += 1) {
    out.push(testDevice(i, spread, rxTestDbm))
  }
  return out
}

export type Summary = {
  total: number
  pass: number
  txFail: number
  rxFail: number
  yieldPct: number
  /** 按停止项计数 */
  stopCounts: Record<StopAt, number>
}

export function summarize(results: DeviceResult[]): Summary {
  const stopCounts: Record<StopAt, number> = { none: 0, txPower: 0, txEvm: 0, rxGain: 0, rxBer: 0 }
  let pass = 0
  let txFail = 0
  let rxFail = 0
  for (const r of results) {
    stopCounts[r.stopAt] += 1
    if (r.bin === 'pass') {
      pass += 1
    } else if (r.bin === 'txFail') {
      txFail += 1
    } else {
      rxFail += 1
    }
  }
  const total = results.length
  return { total, pass, txFail, rxFail, yieldPct: total === 0 ? 0 : (pass / total) * 100, stopCounts }
}

/** 报告 CSV：全部 ASCII；未运行的项留空 */
export function toCsv(results: DeviceResult[]): string {
  const header = 'device,seed,pout_dbm,pout_pass,evm_pct,evm_pass,rx_gain_db,rx_gain_pass,errors,bits,ber,ber_pass,nf_db,sens_est_dbm,bin,stop_at'
  const flag = (v: boolean | null) => (v === null ? '' : v ? '1' : '0')
  const num = (v: number | null, digits: number) => (v === null ? '' : v.toFixed(digits))
  const rows = results.map((r) =>
    [
      r.index,
      r.seed,
      r.pout.toFixed(2),
      flag(r.poutPass),
      num(r.evm, 2),
      flag(r.evmPass),
      num(r.gain, 2),
      flag(r.gainPass),
      r.errors === null ? '' : r.errors,
      r.errors === null ? '' : BER_BITS,
      r.ber === null ? '' : r.ber.toExponential(2),
      flag(r.berPass),
      r.nfDb.toFixed(2),
      r.sensDbm.toFixed(2),
      r.bin,
      r.stopAt,
    ].join(','),
  )
  return [header, ...rows].join('\n') + '\n'
}

/** 功率扫描：BER（解析）随输入功率的变化，用于画曲线 */
export function berCurve(nfDb: number, fromDbm: number, toDbm: number, stepDb: number): Array<{ p: number; ber: number }> {
  const out: Array<{ p: number; ber: number }> = []
  for (let p = fromDbm; p <= toDbm + 1e-9; p += stepDb) {
    out.push({ p: Number(p.toFixed(2)), ber: Math.max(berTheory(p, nfDb), 1e-7) })
  }
  return out
}
