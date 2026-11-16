import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import {
  bitLength,
  formatBase,
  formatEng,
  parseDigits,
  type RadixBase,
} from '../convert'
import {
  WIDTHS,
  asciiByte,
  bitCalc,
  decodeFloat,
  encodeFloat,
  fitsWidth,
  formatBits,
  formatHexWidth,
  intFromBytes,
  intRange,
  lowBits,
  negateBits,
  parseBytes,
  parseFloatBits,
  signedFromBits,
  splitFloatBits,
  type FloatKind,
} from '../calc'
import { Field, Note, Outcome, Seg, type PanelProps } from '../ui'

const BASES: Array<{ id: string; base: RadixBase; label: ReturnType<typeof loc> }> = [
  { id: 'bin', base: 2, label: loc('二进制', 'Binary') },
  { id: 'oct', base: 8, label: loc('八进制', 'Octal') },
  { id: 'dec', base: 10, label: loc('十进制', 'Decimal') },
  { id: 'hex', base: 16, label: loc('十六进制', 'Hex') },
]

const RADIX_PRESETS = [
  { id: 'nibble', baseId: BASES[0].id, text: '1010', label: loc('1010 二进制', '1010 binary') },
  { id: 'byte', baseId: BASES[2].id, text: '255', label: loc('255 十进制', '255 decimal') },
  { id: 'hex', baseId: BASES[3].id, text: '7F', label: loc('7F 十六进制', '7F hex') },
  { id: 'neg', baseId: BASES[2].id, text: '-42', label: loc('−42 十进制', '−42 decimal') },
  { id: 'prefixed', baseId: BASES[2].id, text: '0x2A', label: loc('0x2A', '0x2A') },
]

function clip(text: string, max = 40): string {
  const compact = text.replace(/ /g, '')
  return compact.length <= max ? text : `${compact.slice(0, max)}…`
}

export function RadixTool({ onOpenLesson }: PanelProps) {
  const { t } = useLocale()
  const first = RADIX_PRESETS[0]
  const [baseId, setBaseId] = useState(first.baseId)
  const [text, setText] = useState(first.text)
  const [presetId, setPresetId] = useState(first.id)
  const base = BASES.find((item) => item.id === baseId) ?? BASES[0]
  const parsed = parseDigits(text, base.base)

  const focusBase = (id: string) => {
    if (id === baseId) return
    const next = BASES.find((item) => item.id === id) ?? BASES[0]
    if (parsed.ok) setText(formatBase(parsed.value, next.base, false))
    setBaseId(id)
    setPresetId('')
  }

  const problem = parsed.ok
    ? null
    : parsed.reason === 'empty'
      ? { tone: 'hint' as const, text: loc('输入一个整数。可以带负号，也可以写 0b、0o、0x 前缀。', 'Enter an integer. A minus sign and a 0b, 0o or 0x prefix are fine.') }
      : {
          tone: 'bad' as const,
          text:
            parsed.reason === 'digit'
              ? loc('这个进制里没有这个数字：二进制只有 0 和 1，八进制到 7，十进制到 9，十六进制再用 A–F。', 'That digit is not in this base: binary is 0 and 1, octal stops at 7, decimal at 9, and hex adds A–F.')
              : loc('超过 256 位，这里只换算到 256 位。', 'That is over 256 bits. This tool stops at 256 bits.'),
        }

  const result = parsed.ok
    ? loc(
        `${clip(formatBase(parsed.value, 2, true))}₂ = ${clip(formatBase(parsed.value, 10, false))}₁₀ = ${clip(formatBase(parsed.value, 8, true))}₈ = ${clip(formatBase(parsed.value, 16, true))}₁₆，去掉符号后 ${bitLength(parsed.value)} 位。十六进制 1 位等于 4 位二进制，八进制 1 位等于 3 位，所以从右往左按这个宽度分组。负号只表示这个值是负的，还不是补码。`,
        `${clip(formatBase(parsed.value, 2, true))}₂ = ${clip(formatBase(parsed.value, 10, false))}₁₀ = ${clip(formatBase(parsed.value, 8, true))}₈ = ${clip(formatBase(parsed.value, 16, true))}₁₆, ${bitLength(parsed.value)} bits ignoring the sign. One hex digit is 4 bits and one octal digit is 3 bits, so digits are grouped from the right. The minus sign only says the value is negative; it is not yet two’s complement.`,
      )
    : null

  return (
    <>
      <Seg
        label={loc('常用例子', 'Common examples')}
        items={RADIX_PRESETS}
        activeId={presetId}
        onPick={(id) => {
          const preset = RADIX_PRESETS.find((item) => item.id === id)
          if (!preset) return
          setPresetId(preset.id)
          setBaseId(preset.baseId)
          setText(preset.text)
        }}
      />
      <div className="tools-fields">
        {BASES.map((item) => {
          const source = item.id === base.id
          const shown = source ? text : parsed.ok ? formatBase(parsed.value, item.base, true) : ''
          return (
            <Field
              key={item.id}
              id={`tools-radix-${item.id}`}
              label={item.label}
              value={shown}
              inputMode={item.base === 10 ? 'numeric' : 'text'}
              readOnly={!source}
              bad={source && !!problem && problem.tone === 'bad'}
              onFocus={() => focusBase(item.id)}
              onChange={source ? (value) => {
                setText(value)
                const preset = RADIX_PRESETS.find((entry) => entry.baseId === baseId && entry.text.toLowerCase() === value.trim().toLowerCase())
                setPresetId(preset?.id ?? '')
              } : undefined}
            />
          )
        })}
      </div>
      <p className="tools-hint">{t(loc('空格可以写。0b、0o、0x 写在哪个框里都按前缀解释。', 'Spaces are fine. 0b, 0o and 0x are read by their prefix in any box.'))}</p>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('地址、修调码和 STDF 的字节都是这四种写法。STDF 是二进制记录，一个字节写成两位十六进制。', 'Addresses, trim codes and STDF bytes use these four writings. STDF is a binary record stream; one byte is two hex digits.')}
        lessons={['memStructure', 'genStdf', 'anaTrim']}
      />
    </>
  )
}

const WIDTH_ITEMS = WIDTHS.map((width) => ({ id: String(width), label: loc(`${width} 位`, `${width}-bit`) }))

export function TwosTool({ onOpenLesson }: PanelProps) {
  const first = WIDTH_ITEMS[0]
  const [widthId, setWidthId] = useState(first.id)
  const [text, setText] = useState('-1')
  const width = Number(widthId)
  const parsed = parseDigits(text, 10)
  const bits = parsed.ok ? lowBits(parsed.value, width) : null
  const range = intRange(width)
  const truncated = parsed.ok && !fitsWidth(parsed.value, width)
  const signed = bits === null ? null : signedFromBits(bits, width)
  const negated = bits === null ? null : negateBits(bits, width)

  const problem = parsed.ok
    ? null
    : parsed.reason === 'empty'
      ? { tone: 'hint' as const, text: loc('输入一个整数，或写 0x、0b 前缀。', 'Enter an integer, or use a 0x or 0b prefix.') }
      : { tone: 'bad' as const, text: loc('这个框只接受整数。十六进制请加 0x，二进制请加 0b。', 'This box accepts integers only. Add 0x for hex or 0b for binary.') }

  const cut =
    truncated && parsed.ok
      ? loc(
          `输入 ${parsed.value.toString()} 放不进这个范围，这里只保留低 ${width} 位。`,
          ` ${parsed.value.toString()} does not fit that range, so only the low ${width} bits are kept.`,
        )
      : null
  const result =
    bits === null || signed === null || negated === null
      ? null
      : loc(
          `${width} 位的这组位是 ${formatBits(bits, width)}。无符号读作 ${bits.toString()}，有符号补码读作 ${signed.toString()}。最高位是符号：同一组全 1，无符号是最大值，补码是 −1。此宽度内取负就是取反再加 1，得到 ${formatBits(negated, width)}（有符号 ${signedFromBits(negated, width).toString()}）。有符号范围 ${range.signedMin.toString()} … ${range.signedMax.toString()}，无符号 0 … ${range.unsignedMax.toString()}。${cut?.zh ?? ''}`,
          `These ${width} bits are ${formatBits(bits, width)}. Unsigned they read ${bits.toString()}; as signed two’s complement they read ${signed.toString()}. The top bit is the sign: all ones is the unsigned maximum and also −1 in two’s complement. Negating inside this width means invert and add 1, which gives ${formatBits(negated, width)} (signed ${signedFromBits(negated, width).toString()}). Signed range ${range.signedMin.toString()} … ${range.signedMax.toString()}, unsigned 0 … ${range.unsignedMax.toString()}.${cut?.en ?? ''}`,
        )

  return (
    <>
      <Seg label={loc('位宽', 'Width')} items={WIDTH_ITEMS} activeId={widthId} onPick={setWidthId} />
      <div className="tools-fields">
        <Field id="tools-twos" label={loc('整数', 'Integer')} value={text} inputMode="text" bad={problem?.tone === 'bad'} onChange={setText} />
      </div>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('修调码和寄存器字段都先约定宽度，再决定最高位是不是符号。', 'Trim codes and register fields agree a width first, and only then is the top bit a sign.')}
        lessons={['anaTrim']}
      />
    </>
  )
}

export function BitTool({ onOpenLesson }: PanelProps) {
  const first = WIDTH_ITEMS[0]
  const [widthId, setWidthId] = useState(first.id)
  const [aText, setAText] = useState('0xF0')
  const [bText, setBText] = useState('0x0F')
  const [shiftText, setShiftText] = useState('1')
  const [hiText, setHiText] = useState('7')
  const [loText, setLoText] = useState('4')
  const width = Number(widthId)
  const a = parseDigits(aText, 16)
  const b = parseDigits(bText, 16)
  const shift = shiftText.trim() ? Number(shiftText) : NaN
  const hi = hiText.trim() ? Number(hiText) : NaN
  const lo = loText.trim() ? Number(loText) : NaN
  const ready = a.ok && b.ok && Number.isInteger(shift) && Number.isInteger(hi) && Number.isInteger(lo)
  const calc = ready ? bitCalc(a.value, b.value, width, shift, hi, lo) : null
  const problem = !aText.trim() || !bText.trim()
    ? { tone: 'hint' as const, text: loc('填 A 和 B。可以用 0x 或 0b。', 'Enter A and B. 0x or 0b is fine.') }
    : !ready
      ? { tone: 'bad' as const, text: loc('A、B 要是整数，移位和位号要是整数。', 'A and B must be integers, and the shift and bit numbers must be integers.') }
      : calc
        ? null
        : { tone: 'bad' as const, text: loc('高位要大于等于低位，并且都落在位宽里面。移位不超过 64。', 'The high bit must be at least the low bit, and both must sit inside the width. The shift stops at 64.') }

  const result = calc
    ? loc(
        `A = 0x${formatHexWidth(calc.a, width)}，B = 0x${formatHexWidth(calc.b, width)}。AND 0x${formatHexWidth(calc.and, width)}，OR 0x${formatHexWidth(calc.or, width)}，XOR 0x${formatHexWidth(calc.xor, width)}，NOT A 0x${formatHexWidth(calc.not, width)}。左移 ${shift} 得 0x${formatHexWidth(calc.shl, width)}，右移得 0x${formatHexWidth(calc.shr, width)}：空出来的位补 0，移出这 ${width} 位的部分丢掉，所以这是寄存器宽度里的移位。字段 [${hi}:${lo}] = (A & 0x${formatHexWidth(calc.fieldMask, width)}) >> ${lo} = 0x${formatHexWidth(calc.field, width)}。掩码是从低位 ${lo} 起、连续 ${hi - lo + 1} 个 1。`,
        `A = 0x${formatHexWidth(calc.a, width)}, B = 0x${formatHexWidth(calc.b, width)}. AND 0x${formatHexWidth(calc.and, width)}, OR 0x${formatHexWidth(calc.or, width)}, XOR 0x${formatHexWidth(calc.xor, width)}, NOT A 0x${formatHexWidth(calc.not, width)}. Shift left ${shift} gives 0x${formatHexWidth(calc.shl, width)} and shift right gives 0x${formatHexWidth(calc.shr, width)}: vacated bits are filled with 0, and bits that leave this ${width}-bit width are dropped. Field [${hi}:${lo}] = (A & 0x${formatHexWidth(calc.fieldMask, width)}) >> ${lo} = 0x${formatHexWidth(calc.field, width)}. The mask is ${hi - lo + 1} ones starting at bit ${lo}.`,
      )
    : null

  return (
    <>
      <Seg label={loc('位宽', 'Width')} items={WIDTH_ITEMS} activeId={widthId} onPick={setWidthId} />
      <div className="tools-fields">
        <Field id="tools-bit-a" label={loc('A', 'A')} value={aText} inputMode="text" onChange={setAText} />
        <Field id="tools-bit-b" label={loc('B', 'B')} value={bText} inputMode="text" onChange={setBText} />
        <Field id="tools-bit-shift" label={loc('移位', 'Shift')} value={shiftText} onChange={setShiftText} />
        <Field id="tools-bit-hi" label={loc('字段高位', 'Field high')} value={hiText} onChange={setHiText} />
        <Field id="tools-bit-lo" label={loc('字段低位', 'Field low')} value={loText} onChange={setLoText} />
      </div>
      <Outcome tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('读寄存器手册时，字段表写的 [7:4] 就是这里的高位和低位。宽度之外的位不参与。', 'A register map’s [7:4] is this high bit and low bit. Bits outside the width do not take part.')}
        lessons={['anaTrim']}
      />
    </>
  )
}

const ENDIAN_MODES = [
  { id: 'big', label: loc('大端', 'Big-endian') },
  { id: 'little', label: loc('小端', 'Little-endian') },
]

export function EndianTool({ onOpenLesson }: PanelProps) {
  const [mode, setMode] = useState(ENDIAN_MODES[0].id)
  const [text, setText] = useState('41 54 45')
  const compact = text.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '')
  const bytes = parseBytes(text)
  const odd = compact.length % 2 === 1
  const tooLong = compact.length / 2 > 16
  const problem = !compact
    ? { tone: 'hint' as const, text: loc('输入十六进制字节，例如 41 54 45。', 'Enter hex bytes, for example 41 54 45.') }
    : odd
      ? { tone: 'bad' as const, text: loc('一个字节是两位十六进制。现在的位数是奇数，补一位或删一位。', 'One byte is two hex digits. This entry has an odd count, so add or remove one digit.') }
      : tooLong
        ? { tone: 'bad' as const, text: loc('这里最多看 16 个字节。', 'This view stops at 16 bytes.') }
        : null
  const big = bytes ? intFromBytes(bytes, false) : null
  const little = bytes ? intFromBytes(bytes, true) : null
  const chosen = mode === 'little' ? little : big
  const ascii = bytes ? bytes.map(asciiByte).join('') : ''
  const endName = mode === 'little' ? loc('小端', 'little-endian') : loc('大端', 'big-endian')
  const placeName = mode === 'little' ? loc('最低', 'least') : loc('最高', 'most')
  const result =
    bytes && big !== null && little !== null && chosen !== null
      ? loc(
          `按书写顺序，大端整数是 0x${big.toString(16).toUpperCase()}（${big.toString()}），小端整数是 0x${little.toString(16).toUpperCase()}（${little.toString()}）。当前按${endName.zh}读，第一个字节 ${bytes[0].toString(16).toUpperCase().padStart(2, '0')} 是${placeName.zh}字节。ASCII 只翻译 32–126 的字节，其余记成 ·，所以是 “${ascii}”。`,
          `In the written order, the big-endian integer is 0x${big.toString(16).toUpperCase()} (${big.toString()}) and the little-endian integer is 0x${little.toString(16).toUpperCase()} (${little.toString()}). Read as ${endName.en}, the first byte ${bytes[0].toString(16).toUpperCase().padStart(2, '0')} is the ${placeName.en} significant byte. ASCII is only bytes 32–126; anything else is shown as ·, so this is “${ascii}”.`,
        )
      : null

  return (
    <>
      <Seg label={loc('按哪种端序读整数', 'Which endianness reads the integer')} items={ENDIAN_MODES} activeId={mode} onPick={setMode} />
      <div className="tools-fields">
        <Field id="tools-endian" errorId="tools-endian-result" label={loc('十六进制字节', 'Hex bytes')} value={text} inputMode="text" bad={problem?.tone === 'bad'} onChange={setText} />
      </div>
      {bytes ? (
        <div className="byte-row">
          {bytes.map((byte, index) => (
            <div key={`${byte}-${index}`} className="byte">
              <span className="byte__hex">{byte.toString(16).toUpperCase().padStart(2, '0')}</span>
              <span className="byte__asc">{asciiByte(byte)}</span>
            </div>
          ))}
        </div>
      ) : null}
      <Outcome id="tools-endian-result" tone={problem?.tone ?? 'ok'} text={problem?.text ?? result} />
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('STDF 的多字节整数按记录里的字节序拼回去。只把十六进制当文本翻转，数值会整个变掉。', 'Multi-byte integers in STDF are joined in the record’s byte order. Reversing the hex text as characters changes the whole value.')}
        lessons={['genStdf']}
      />
    </>
  )
}

const FLOAT_MODES = [
  { id: 'dec', label: loc('十进制', 'Decimal') },
  { id: 'f32', label: loc('Float32 位', 'Float32 bits') },
  { id: 'f64', label: loc('Float64 位', 'Float64 bits') },
]

function floatValue(mode: string, text: string): number | null {
  if (mode === 'dec') {
    const body = text.trim()
    if (/^-?inf(inity)?$/i.test(body)) return body.startsWith('-') ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    if (/^nan$/i.test(body)) return Number.NaN
    if (body === '-0') return -0
    const parsed = Number(body)
    return body && Number.isFinite(Number(body.replace(/[eE].*/, '1'))) && /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(body) ? parsed : null
  }
  const bits = parseFloatBits(text, mode as FloatKind)
  return bits === null ? null : decodeFloat(bits, mode as FloatKind).value
}

export function FloatTool({ onOpenLesson }: PanelProps) {
  const { t } = useLocale()
  const [mode, setMode] = useState(FLOAT_MODES[0].id)
  const [text, setText] = useState('-1.5')
  const value = floatValue(mode, text)
  const empty = !text.trim()
  const bad = !empty && value === null

  const switchMode = (id: string) => {
    if (id === mode) return
    if (value !== null && Number.isFinite(value)) {
      if (id === 'dec') setText(String(value))
      else setText(formatHexWidth(encodeFloat(value, id as FloatKind), id === 'f32' ? 32 : 64))
    }
    setMode(id)
  }

  return (
    <>
      <Seg label={loc('从哪里输入', 'Enter as')} items={FLOAT_MODES} activeId={mode} onPick={switchMode} />
      <div className="tools-fields">
        <Field
          id="tools-float"
          label={mode === 'dec' ? loc('十进制', 'Decimal') : loc('十六进制位', 'Hex bits')}
          value={text}
          inputMode="text"
          bad={bad}
          onChange={setText}
        />
      </div>
      {empty ? <Outcome tone="hint" text={loc('输入一个十进制数，或一串十六进制位。Inf 和 NaN 也可以。', 'Enter a decimal value, or hex bits. Inf and NaN are allowed.')} /> : null}
      {bad ? <Outcome tone="bad" text={loc('十进制用普通数字；位模式用十六进制，Float32 最多 8 位，Float64 最多 16 位。', 'Decimal uses an ordinary number. Bit patterns are hex: at most 8 digits for Float32 and 16 for Float64.')} /> : null}
      {value !== null ? (
        <>
          <FloatCard kind="f32" value={value} source={mode === 'f32'} />
          <FloatCard kind="f64" value={value} source={mode === 'f64'} />
          <FloatExplain mode={mode} value={value} />
        </>
      ) : null}
      <p className="tools-hint">{t(loc('位从上到下是符号、指数、尾数。这是数值的位模式，不是内存里的字节序。', 'Bits run sign, exponent, fraction. This is the numeric pattern, not the bytes in memory.'))}</p>
      <Note
        onOpenLesson={onOpenLesson}
        text={loc('测量和 FFT 里看到的小数在计算机里都是这种编码。Float32 的十进制再存成 Float64 时，先按 23 位尾数舍入。', 'Decimals in measurements and FFTs are stored in this encoding. A decimal written as Float32 is rounded to 23 fraction bits before it can be widened to Float64.')}
        lessons={['anaFft']}
      />
    </>
  )
}

function FloatCard({ kind, value, source }: { kind: FloatKind; value: number; source: boolean }) {
  const { t } = useLocale()
  const bits = encodeFloat(value, kind)
  const parts = splitFloatBits(bits, kind)
  const decoded = decodeFloat(bits, kind)
  const title = kind === 'f32' ? loc('Float32', 'Float32') : loc('Float64', 'Float64')
  return (
    <div className={`float-card${source ? ' is-source' : ''}`}>
      <p className="float-card__title">
        {t(title)} · 0x{formatHexWidth(bits, kind === 'f32' ? 32 : 64)}
      </p>
      <p className="bits">
        <span className="bits__sign">{parts.sign}</span>
        <span className="bits__exp">{parts.exp}</span>
        <span className="bits__man">{parts.man}</span>
      </p>
      <ul className="bits-legend">
        <li className="bits__sign">{t(loc('符号', 'Sign'))} {decoded.sign}</li>
        <li className="bits__exp">{t(loc('指数', 'Exponent'))} {decoded.exp}</li>
        <li className="bits__man">{t(loc('尾数', 'Fraction'))} {decoded.man.toString()}</li>
      </ul>
    </div>
  )
}

function FloatExplain({ mode, value }: { mode: string; value: number }) {
  const kind: FloatKind = mode === 'f64' ? 'f64' : 'f32'
  const decoded = decodeFloat(encodeFloat(value, kind), kind)
  const bias = kind === 'f32' ? 127 : 1023
  const manBits = kind === 'f32' ? 23 : 52
  const shown = Number.isNaN(value) ? 'NaN' : !Number.isFinite(value) ? (value > 0 ? 'Inf' : '−Inf') : Object.is(value, -0) ? '−0' : formatEng(value, '').trim()
  const text =
    decoded.cls === 'nan'
      ? loc(
          `${shown}：指数全 1 且尾数不是 0，这是 NaN，不再表示一个数。`,
          `${shown}: exponent all ones and a non-zero fraction is NaN, which is not a number.`,
        )
      : decoded.cls === 'inf'
        ? loc(
            `${shown}：指数全 1 且尾数是 0，符号位决定正无穷或负无穷。`,
            `${shown}: exponent all ones and a zero fraction is infinity; the sign bit chooses the direction.`,
          )
        : decoded.cls === 'zero'
          ? loc(
              `${shown}：指数和尾数都是 0。符号位仍能分开 +0 和 −0。`,
              `${shown}: exponent and fraction are both 0. The sign bit still separates +0 from −0.`,
            )
          : decoded.cls === 'subnormal'
            ? loc(
                `${shown}：指数位全 0，没有隐藏的 1。数值 = (−1)^${decoded.sign} × 2^(1−${bias}) × (${decoded.man.toString()}/2^${manBits})。`,
                `${shown}: the exponent field is all zeros, so there is no hidden 1. Value = (−1)^${decoded.sign} × 2^(1−${bias}) × (${decoded.man.toString()}/2^${manBits}).`,
              )
            : loc(
                `${shown}：符号 ${decoded.sign}，指数位 ${decoded.exp}，减去偏置 ${bias} 得 ${decoded.unbiased}，尾数 ${decoded.man.toString()}。正常数 = (−1)^符号 × 2^(指数−偏置) × (1 + 尾数/2^${manBits})，所以小数点前有一个没有写出来的 1。`,
                `${shown}: sign ${decoded.sign}, exponent field ${decoded.exp}, minus bias ${bias} is ${decoded.unbiased}, fraction ${decoded.man.toString()}. A normal number is (−1)^sign × 2^(exponent−bias) × (1 + fraction/2^${manBits}), so there is a 1 before the binary point that is not stored.`,
              )
  return <Outcome tone="ok" text={text} />
}
