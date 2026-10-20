/**
 * 抖动与误码率的数学工具。
 * 双狄拉克模型：TJ(BER) = DJ_pp + 2·Q(BER)·σ_RJ，其中 Q(BER) 是 Q(x) = BER 的解，Q(1e-12) ≈ 7.03。
 */

/** 互补误差函数，Numerical Recipes 的 erfcc 近似，相对误差约 1.2e-7，尾部精度足够 Q 函数使用 */
export function erfc(x: number): number {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const poly =
    -z * z -
    1.26551223 +
    t *
      (1.00002368 +
        t *
          (0.37409196 +
            t *
              (0.09678418 +
                t *
                  (-0.18628806 +
                    t *
                      (0.27886807 +
                        t *
                          (-1.13520398 +
                            t *
                              (1.48851587 +
                                t * (-0.82215223 + t * 0.17087277))))))))
  const ans = t * Math.exp(poly)
  if (x >= 0) {
    return ans
  }
  return 2 - ans
}

/** Q 函数：标准正态分布的尾部概率 P(X > x) */
export function qFunction(x: number): number {
  return 0.5 * erfc(x / Math.SQRT2)
}

/** Q(x) = ber 的解（二分法）；ber 需在 (0, 0.5) 内 */
export function qOfBer(ber: number): number {
  let lo = 0
  let hi = 40
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2
    if (qFunction(mid) > ber) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

/** 在给定误码率下的总抖动（ps）：DJ_pp + 2·Q·σ_RJ */
export function tjAtBer(djPp: number, rjRms: number, ber: number): number {
  return djPp + 2 * qOfBer(ber) * rjRms
}
