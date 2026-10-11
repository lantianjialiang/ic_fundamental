import { loc, type LText } from '../../../i18n/locale'
import {
  IDDQ_SPEC,
  R_BRIDGE,
  R_GOX,
  R_ON_N,
  R_ON_P,
  TAU_MS,
  VECTOR_STATE,
  decimalsFor,
  type IddqConfig,
  type IddqResult,
} from '../model/iddq'
import { MARGIN_V, PINS, type Defect, type OsConfig, type OsResult, type OsRow, type PinId } from '../model/continuity'

/* ---------------- 格式化 ---------------- */

/** 电流（µA）按量级显示 */
export function fmtUa(ua: number, decimals = 1): string {
  if (ua >= 1000) return `${(ua / 1000).toFixed(ua >= 10000 ? 0 : 1)} mA`
  return `${ua.toFixed(decimals)} µA`
}

export function fmtRange(ua: number): string {
  return ua >= 1000 ? `${ua / 1000} mA` : `${ua} µA`
}

/** 带符号电压，三位小数，不显示 −0.000 */
export function fmtV(v: number, digits = 3): string {
  const r = Number(v.toFixed(digits))
  const z = r === 0 ? 0 : r
  return `${z > 0 ? '+' : z < 0 ? '−' : ''}${Math.abs(z).toFixed(digits)} V`
}

export function fmtForce(ua: number): string {
  const s = ua > 0 ? '+' : ua < 0 ? '−' : ''
  const a = Math.abs(ua)
  return a >= 1000 ? `${s}${a / 1000} mA` : `${s}${a} µA`
}

export function fmtOhm(ohm: number): string {
  return ohm >= 1000 ? `${(ohm / 1000).toFixed(ohm % 1000 === 0 ? 0 : 1)} kΩ` : `${Math.round(ohm)} Ω`
}

export function pinName(pin: PinId): string {
  const p = PINS.find((x) => x.id === pin)
  return p ? `Pin ${p.no}` : pin
}

export function iddqReading(r: IddqResult): string | null {
  return r.readingUa === null ? null : `${r.readingUa.toFixed(decimalsFor(r.resolutionUa))} µA`
}

/* ---------------- IDDQ ---------------- */

/** 结果的第一句：结论 + 原因 */
export function iddqHeadline(cfg: IddqConfig, r: IddqResult): LText {
  const v = cfg.vdd.toFixed(2)
  const read = iddqReading(r) ?? ''
  const lim = `${cfg.limitUa} µA`
  switch (r.reason) {
    case 'absmax':
      return loc(
        `测试中止：VDD ${v} V 超过绝对最大额定值 ${IDDQ_SPEC.absMax} V。测试机拒绝施加，以免损坏 DUT。绝对最大值是“不能碰”的线，不是工作条件。`,
        `Test aborted: VDD ${v} V exceeds the ${IDDQ_SPEC.absMax} V absolute maximum. The tester refuses to apply it to avoid damaging the DUT. Absolute maximum is a do-not-cross line, not an operating condition.`,
      )
    case 'nopower':
      return loc(
        '无效：VDD 设为 0 V，芯片根本没上电。读到 0 µA 不代表芯片好——没电当然没电流。IDDQ 必须在规格电压下测。',
        'Invalid: VDD is 0 V, so the chip was never powered. Reading 0 µA does not mean the chip is good: no supply, no current. IDDQ must be measured at the spec voltage.',
      )
    case 'lowvdd':
      return loc(
        `无效：VDD = ${v} V，低于内部逻辑能保持状态的约 ${IDDQ_SPEC.vddLogicMin} V。向量没法把芯片置于确定的静态状态，读数没有意义。`,
        `Invalid: VDD = ${v} V is below the roughly ${IDDQ_SPEC.vddLogicMin} V the logic needs to hold a state. The vector cannot put the chip in a defined static state, so the reading means nothing.`,
      )
    case 'clamp':
      return loc(
        `无效：测量时刻电流 ${fmtUa(r.trueUa)} 超过 DPS 电流钳位 ${fmtRange(cfg.clampUa)}。电源进入限流，实际 VDD 被拉低，读到的不是 ${v} V 下的 IDDQ。放宽钳位后再测（钳位仍要低于会损坏芯片的电流）。`,
        `Invalid: the current at the measurement, ${fmtUa(r.trueUa)}, exceeds the ${fmtRange(cfg.clampUa)} DPS clamp. The supply goes into current limit and VDD sags, so this is not IDDQ at ${v} V. Loosen the clamp and retest (keeping it below a current that could damage the chip).`,
      )
    case 'overrange':
      return loc(
        `无效：OVER RANGE。电流超过 ${fmtRange(r.rangeUa)} 量程，ADC 读不出比满量程更大的值，显示的数字不能用。换大一档量程或用自动量程。`,
        `Invalid: OVER RANGE. The current exceeds the ${fmtRange(r.rangeUa)} range and the ADC cannot read past full scale, so no usable number exists. Use a larger range or auto range.`,
      )
    default:
      return r.status === 'pass'
        ? loc(`PASS：读数 ${read} ≤ 上限 ${lim}。`, `PASS: reading ${read} ≤ limit ${lim}.`)
        : loc(`FAIL：读数 ${read} > 上限 ${lim}。`, `FAIL: reading ${read} > limit ${lim}.`)
  }
}

/** 解释段落：缺陷是否激活、瞬态、量程、规格条件 */
export function iddqWhy(cfg: IddqConfig, r: IddqResult): LText[] {
  const out: LText[] = []
  const v = cfg.vdd.toFixed(2)
  const vec = cfg.vector.toUpperCase()
  const st = VECTOR_STATE[cfg.vector]
  if (r.reason === 'absmax') return out

  if (r.reason !== 'nopower') {
    if (cfg.dut === 'good') {
      out.push(
        loc(
          `这是正常芯片，没有缺陷电流；静态电流只有亚阈值漏电 ${fmtUa(r.normalUa, 2)}，随 VDD 近似按 (VDD/1.8)·exp((VDD−1.8)/0.6) 变化，不同向量只差几个百分点。`,
          `This is a good chip with no defect current; the static current is only ${fmtUa(r.normalUa, 2)} of subthreshold leakage, varying roughly as (VDD/1.8)·exp((VDD−1.8)/0.6) and only a few percent between vectors.`,
        ),
      )
    } else if (cfg.dut === 'gox') {
      out.push(
        loc(
          `栅氧漏电相当于 VDD 到 GND 之间一个约 ${fmtOhm(R_GOX)} 的电阻：缺陷电流 = ${v} V / ${fmtOhm(R_GOX)} = ${fmtUa(r.defectUa)}。它不依赖逻辑状态，所以每个向量都在。`,
          `The gate-oxide leak acts like about ${fmtOhm(R_GOX)} between VDD and GND: defect current = ${v} V / ${fmtOhm(R_GOX)} = ${fmtUa(r.defectUa)}. It does not depend on the logic state, so it is there for every vector.`,
        ),
      )
    } else if (r.defectActive) {
      const rt = fmtOhm(R_ON_P + R_BRIDGE + R_ON_N)
      out.push(
        loc(
          `${vec} 把节点 A 置 ${st.a}、B 置 ${st.b}：桥接两端一高一低，缺陷被激活。缺陷电流 = VDD / (R_on,p + R_bridge + R_on,n) = ${v} V / ${rt} = ${fmtUa(r.defectUa)}。`,
          `${vec} sets node A to ${st.a} and B to ${st.b}: one end of the bridge is high and the other low, so the defect is activated. Defect current = VDD / (R_on,p + R_bridge + R_on,n) = ${v} V / ${rt} = ${fmtUa(r.defectUa)}.`,
        ),
      )
    } else {
      out.push(
        loc(
          `${vec} 把 A、B 都置 ${st.a}：桥接两端没有压差，缺陷不导电，IDDQ 看起来和好片一样。换一个让 A ≠ B 的向量（V2 或 V3）才能暴露它——IDDQ 的结果取决于向量。`,
          `${vec} sets both A and B to ${st.a}: no voltage across the bridge, so the defect carries no current and IDDQ looks like a good chip. Only a vector with A ≠ B (V2 or V3) exposes it: the IDDQ result depends on the vector.`,
        ),
      )
    }
  }

  if (r.unsettled && r.reason !== 'nopower' && r.reason !== 'lowvdd') {
    const n = (cfg.settleMs / TAU_MS).toFixed(1)
    const staticUa = r.normalUa + r.defectUa
    out.push(
      loc(
        `等待时间 ${cfg.settleMs.toFixed(1)} ms 只有 τ = ${TAU_MS} ms 的 ${n} 倍，充电电流还剩 ${fmtUa(r.transientUa)} 混在读数里，读数偏大。`,
        `A ${cfg.settleMs.toFixed(1)} ms settling time is only ${n} × τ (τ = ${TAU_MS} ms), so ${fmtUa(r.transientUa)} of charging current is still in the reading and inflates it.`,
      ),
    )
    if (r.status === 'fail' && staticUa <= cfg.limitUa) {
      out.push(
        loc(
          `芯片本身的静态电流只有 ${fmtUa(staticUa)}，在上限以内——这是误判 FAIL。把等待时间加到 5τ（2.5 ms）以上再测。`,
          `The chip’s own static current is only ${fmtUa(staticUa)}, inside the limit: this FAIL is a false reject. Wait at least 5τ (2.5 ms) and retest.`,
        ),
      )
    }
    if (r.reason === 'overrange' || r.reason === 'clamp') {
      out.push(
        loc(
          '这次无效的根源可能就是瞬态：先把等待时间加长，再决定要不要换量程或放宽钳位。',
          'The transient may be the real cause of this invalid reading: lengthen the settling time first, then decide whether to change the range or the clamp.',
        ),
      )
    }
  }

  if (r.coarse && r.status !== 'abort' && r.reason !== 'overrange') {
    out.push(
      loc(
        `量程 ${fmtRange(r.rangeUa)} 的分辨率是 ${fmtUa(r.resolutionUa, decimalsFor(r.resolutionUa))}，超过上限的 1/20：读数只能精确到这一步，接近限值时判不准。换小一档量程。`,
        `The ${fmtRange(r.rangeUa)} range resolves only ${fmtUa(r.resolutionUa, decimalsFor(r.resolutionUa))}, more than 1/20 of the limit: the reading cannot be finer than that step, so results near the limit are unreliable. Use a smaller range.`,
      ),
    )
  }

  if (r.offSpec && r.reason === 'ok') {
    out.push(
      loc(
        `VDD = ${v} V 不在规格条件 ${IDDQ_SPEC.vddMin}–${IDDQ_SPEC.vddMax} V 内：可以看漏电随电压的趋势，但这个结果不能拿来判这条规格。`,
        `VDD = ${v} V is outside the ${IDDQ_SPEC.vddMin}–${IDDQ_SPEC.vddMax} V spec condition: it shows how leakage trends with voltage, but the result cannot be used to judge this spec.`,
      ),
    )
  }

  if (r.reason === 'ok' && cfg.range === 'auto') {
    out.push(
      loc(
        `自动量程选了 ${fmtRange(r.rangeUa)}：能装下读数的最小一档，分辨率 ${fmtUa(r.resolutionUa, decimalsFor(r.resolutionUa))}。`,
        `Auto range chose ${fmtRange(r.rangeUa)}: the smallest range that holds the reading, with ${fmtUa(r.resolutionUa, decimalsFor(r.resolutionUa))} resolution.`,
      ),
    )
  }
  return out
}

export function iddqBreakdown(r: IddqResult): LText {
  return loc(
    `正常漏电 ${fmtUa(r.normalUa, 2)} + 缺陷电流 ${fmtUa(r.defectUa, 2)} + 未衰减的瞬态 ${fmtUa(r.transientUa, 2)} = ${fmtUa(r.trueUa, 2)}`,
    `Normal leakage ${fmtUa(r.normalUa, 2)} + defect current ${fmtUa(r.defectUa, 2)} + remaining transient ${fmtUa(r.transientUa, 2)} = ${fmtUa(r.trueUa, 2)}`,
  )
}

/* ---------------- 开短路 ---------------- */

export function osWindow(cfg: OsConfig): string {
  return `${fmtV(cfg.openTh, 2)} ~ ${fmtV(cfg.shortTh, 2)}`
}

/** 运行级别的设置问题（与具体管脚无关） */
export function osWarnings(cfg: OsConfig, res: OsResult): LText[] {
  const out: LText[] = []
  if (res.abort === 'window') {
    out.push(
      loc(
        '测试中止：判定窗口无效。两个门限必须同号，且 |Open 门限| > |Short 门限| > 0。程序不会拿无效的窗口去判芯片。',
        'Test aborted: the limit window is invalid. Both thresholds must have the same sign with |open threshold| > |short threshold| > 0. The program will not judge a chip with an invalid window.',
      ),
    )
    return out
  }
  if (res.zeroForce) {
    out.push(
      loc(
        'Force 电流是 0：没有激励，每个脚都读 0 V，全被判 SHORT。这不是芯片短路，是没加电流。',
        'The force current is 0: with no stimulus every pin reads 0 V and is judged SHORT. That is not a short on the chip; no current was applied.',
      ),
    )
  }
  if (res.polarityMismatch) {
    out.push(
      loc(
        `Force 是 ${fmtForce(cfg.forceUa)}，但判定窗口是 ${osWindow(cfg)}，方向相反。好脚读到的二极管压降符号和窗口相反，会被全部误判。按 Force 极性重设门限。`,
        `The force is ${fmtForce(cfg.forceUa)} but the window is ${osWindow(cfg)}, the opposite direction. A good pin’s diode drop has the wrong sign for the window and every pin is misjudged. Reset the thresholds for the force polarity.`,
      ),
    )
  }
  if (res.posWithVddFloat) {
    out.push(
      loc(
        '+I 测的是对 VDD 的上二极管，电流要经 VDD 流回地。VDD 浮空时没有回路，好脚也会撞钳位、被判 OPEN。+I 必须把 VDD 接 0 V。',
        '+I tests the upper diode to VDD, so the current must return to ground through VDD. With VDD floating there is no return path and even good pins clamp and read OPEN. +I needs VDD at 0 V.',
      ),
    )
  }
  if (res.clampBelowDiode) {
    out.push(
      loc(
        `好片在同样条件下也撞钳位：电压钳位 ±${cfg.clampV.toFixed(1)} V 不够让电流流过保护二极管（和串联电阻）。所有脚都会被判 OPEN，这是设置错误。`,
        `A good chip also clamps under these conditions: a ±${cfg.clampV.toFixed(1)} V clamp is not enough to push the current through the protection diode (and series resistance). Every pin reads OPEN; this is a setup error.`,
      ),
    )
  }
  if (res.clampInsideWindow && !res.clampBelowDiode) {
    out.push(
      loc(
        `钳位 ±${cfg.clampV.toFixed(1)} V 比 Open 门限 ${fmtV(cfg.openTh, 2)} 还小：开路脚的读数到不了门限外。本模型把“撞钳位”直接判 OPEN，没有漏判；只看读数不看钳位标志的程序会把开路判成 PASS。钳位要设在门限之外。`,
        `The ±${cfg.clampV.toFixed(1)} V clamp is inside the ${fmtV(cfg.openTh, 2)} open threshold, so an open pin can never read beyond it. This model treats “clamped” as OPEN, so nothing slips; a program that checks only the reading and not the clamp flag would pass an open. Set the clamp beyond the threshold.`,
      ),
    )
  }
  return out
}

/** 单个管脚读数的解释：只根据测得的现象推理，不偷看隐藏故障 */
export function osRowWhy(cfg: OsConfig, res: OsResult, row: OsRow): LText[] {
  const out: LText[] = []
  const vm = fmtV(row.vm)
  const g = fmtV(row.golden.vm)
  const iAbs = Math.abs(cfg.forceUa)
  if (row.verdict === 'abort') return out

  if (row.verdict === 'open') {
    if (row.clamped) {
      out.push(
        loc(
          `读数停在钳位 ${vm}，实际只送进 ${fmtForce(Math.round(row.iUa))}：PMU 把电压推到头也送不进设定的电流——这是开路的特征（探针没扎上、焊线断、Socket 没压到）。`,
          `The reading sits at the ${vm} clamp and only ${fmtForce(Math.round(row.iUa))} got in: the PMU ran out of voltage before delivering the set current, the signature of an open (missed probe, broken bond wire, socket not pressed).`,
        ),
      )
      if (row.golden.clamped) {
        out.push(
          loc(
            '但好片在同样条件下也撞钳位，所以这次 OPEN 不能怪芯片，先改测试条件（见上面的设置提示）。',
            'But a good chip clamps under the same conditions too, so this OPEN is not the chip’s fault: fix the test conditions first (see the setup notes above).',
          ),
        )
      }
    } else if (Math.abs(row.golden.vm) >= Math.abs(cfg.openTh)) {
      out.push(
        loc(
          `读数 ${vm} 越过 Open 门限 ${fmtV(cfg.openTh, 2)}，但好片在同样条件下读 ${g}，也越过了：Force ${fmtForce(cfg.forceUa)} 太大，二极管压降加上串联电阻压降（I × R）已经超出窗口。把电流调回约 100 µA。`,
          `The reading ${vm} is beyond the ${fmtV(cfg.openTh, 2)} open threshold, but a good chip reads ${g} here and is beyond it too: ${fmtForce(cfg.forceUa)} is too much current, and the diode drop plus the series I × R drop leaves the window. Go back to about 100 µA.`,
        ),
      )
    } else {
      const r = iAbs > 0 ? (Math.abs(row.vm - row.golden.vm) / (iAbs * 1e-6)) : 0
      out.push(
        loc(
          `读数 ${vm} 越过 Open 门限 ${fmtV(cfg.openTh, 2)}，比好片的 ${g} 多出 ${fmtV(row.vm - row.golden.vm)}。多出的压降 ÷ 电流 ≈ ${fmtOhm(r)} 串联电阻：接触电阻极大或半开路，按开路处理。`,
          `The reading ${vm} is beyond the ${fmtV(cfg.openTh, 2)} open threshold, ${fmtV(row.vm - row.golden.vm)} more than a good pin’s ${g}. Extra drop ÷ current ≈ ${fmtOhm(r)} of series resistance: huge contact resistance or a partial open; treat it as open.`,
        ),
      )
    }
  } else if (row.verdict === 'short') {
    if (res.zeroForce || res.polarityMismatch) {
      out.push(
        loc(
          `读数 ${vm} 落在 Short 门限 ${fmtV(cfg.shortTh, 2)} 以内，但原因是测试条件（见上面的设置提示），不是芯片短路。`,
          `The reading ${vm} is inside the ${fmtV(cfg.shortTh, 2)} short threshold, but the cause is the test setup (see the setup notes above), not a short on the chip.`,
        ),
      )
    } else {
      out.push(
        loc(
          `读数 ${vm} 落在 Short 门限 ${fmtV(cfg.shortTh, 2)} 以内：电流没走保护二极管，而是从一条低阻路径流走了。可能短到 GND、短到 VDD（VDD 接 0 V 时），或短到另一个接 0 V 的信号脚。`,
          `The reading ${vm} is inside the ${fmtV(cfg.shortTh, 2)} short threshold: the current bypassed the protection diode through a low-resistance path. It may be shorted to GND, to VDD (while VDD is at 0 V), or to another signal pin held at 0 V.`,
        ),
      )
      out.push(
        loc(
          '定位方法：把“其它信号脚”改成浮空再测——变回正常说明是和某个信号脚互短（再看哪个脚也同时 SHORT）；仍是 0 V，再把 VDD 浮空——对 GND 短路依旧 ≈ 0 V，对 VDD 短路会离开 0 V。',
          'To locate it: set the other signal pins to floating and retest. If it recovers, it is shorted to another signal pin (look for the pin that also reads SHORT). If it stays at 0 V, float VDD: a short to GND stays ≈ 0 V, a short to VDD moves away from 0 V.',
        ),
      )
    }
  } else if (row.verdict === 'marginal') {
    const diff = row.vm - row.golden.vm
    out.push(
      loc(
        `读数 ${vm} 在窗口 ${osWindow(cfg)} 内，但和好片参考值 ${g} 差 ${fmtV(diff)}，超过 ${MARGIN_V} V，标为“边缘”。`,
        `The reading ${vm} is inside the ${osWindow(cfg)} window but differs from the good-chip reference ${g} by ${fmtV(diff)}, more than ${MARGIN_V} V, so it is flagged marginal.`,
      ),
    )
    if (Math.abs(row.vm) > Math.abs(row.golden.vm)) {
      const r = iAbs > 0 ? Math.abs(diff) / (iAbs * 1e-6) : 0
      out.push(
        loc(
          `读数比好片“更深”，多出的压降 ÷ 电流 ≈ ${fmtOhm(r)}：路径上多了串联电阻，常见是 Socket / 探针接触电阻高、针尖脏。窗口放它过了，但它是边缘品，清洁后复测。`,
          `The reading is deeper than a good pin; extra drop ÷ current ≈ ${fmtOhm(r)}: extra series resistance in the path, typically high socket / probe contact resistance or dirty tips. The window lets it through, but it is marginal: clean and retest.`,
        ),
      )
    } else {
      out.push(
        loc(
          '读数比好片“更浅”：保护二极管旁边还有一条并联的分流路径，例如这个脚连到了 VDD 网络，电流改经 VDD 上其它二极管流回地。对照 VDD 接 0 V 时的读数一起看。',
          'The reading is shallower than a good pin: there is a parallel path beside the protection diode, for example the pin is tied to the VDD net and current returns to ground through other diodes on VDD. Compare with the reading taken with VDD at 0 V.',
        ),
      )
    }
  } else {
    out.push(
      loc(
        `读数 ${vm} 落在窗口 ${osWindow(cfg)} 内，和好片参考值 ${g} 接近：电流流过了保护二极管，读到一个二极管压降，接触正常。`,
        `The reading ${vm} is inside the ${osWindow(cfg)} window and close to the good-chip reference ${g}: the current flowed through the protection diode and one diode drop is read, so contact is good.`,
      ),
    )
    if (cfg.others === 'float' || cfg.vdd === 'float') {
      out.push(
        loc(
          '注意：其它脚或 VDD 浮空时，和这个脚互短的邻脚不再接地，两脚短路会读成接近正常。量产判定要用全部接 0 V 的那次。',
          'Note: with other pins or VDD floating, a shorted neighbor is no longer grounded, so a pin-to-pin short reads close to normal. Production judging must use the run with everything at 0 V.',
        ),
      )
    }
  }
  return out
}

/** 注入模式下的“幕后”说明 */
export function defectTruth(defect: Defect, pin: PinId): LText {
  const a = pinName(defect.a)
  const b = pinName(defect.b)
  const p = pinName(pin)
  switch (defect.kind) {
    case 'none':
      return loc('芯片没有注入缺陷。', 'No defect is injected.')
    case 'open':
      return defect.a === pin
        ? loc(`${p} 开路：测试机和焊盘之间断开，电流无路可走。`, `${p} is open: the tester and the pad are disconnected, so the current has nowhere to go.`)
        : loc(`开路在 ${a}，不在 ${p}。`, `The open is on ${a}, not on ${p}.`)
    case 'pinPin':
      return defect.a === pin || defect.b === pin
        ? loc(
            `${a} 和 ${b} 短在一起。测其中一个时另一个若接 0 V，电流就从它流走；若浮空，两脚的保护二极管并联。`,
            `${a} and ${b} are shorted together. While one is tested, if the other is at 0 V the current escapes through it; if it floats, the two pins’ protection diodes are in parallel.`,
          )
        : loc(`${a} 和 ${b} 互短，与 ${p} 无关。`, `${a} and ${b} are shorted to each other; ${p} is not involved.`)
    case 'pinGnd':
      return defect.a === pin
        ? loc(`${p} 直接短到 GND，不管其它脚怎么接都读 ≈ 0 V。`, `${p} is shorted straight to GND and reads ≈ 0 V however the other pins are set.`)
        : loc(`对 GND 短路在 ${a}，不在 ${p}。`, `The short to GND is on ${a}, not on ${p}.`)
    case 'pinVdd':
      return defect.a === pin
        ? loc(
            `${p} 短到 VDD。VDD 接 0 V 时它看起来像对地短路；VDD 浮空时电流改经 VDD 网络上的二极管流回，读数离开 0 V。`,
            `${p} is shorted to VDD. With VDD at 0 V it looks like a short to ground; with VDD floating the current returns through the diodes on the VDD net and the reading moves away from 0 V.`,
          )
        : loc(`对 VDD 短路在 ${a}，不在 ${p}。`, `The short to VDD is on ${a}, not on ${p}.`)
    case 'contact':
      return defect.a === pin
        ? loc(
            `${p} 的接触电阻是 ${fmtOhm(defect.rc)}：读数 = 二极管压降 + I × ${fmtOhm(defect.rc)}。`,
            `${p} has ${fmtOhm(defect.rc)} of contact resistance: reading = diode drop + I × ${fmtOhm(defect.rc)}.`,
          )
        : loc(`高接触电阻在 ${a}，不在 ${p}。`, `The high contact resistance is on ${a}, not on ${p}.`)
  }
}
