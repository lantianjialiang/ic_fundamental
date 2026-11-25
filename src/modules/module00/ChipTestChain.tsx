import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'

const EXAMPLES = {
  digital: {
    input: loc('向量输入 0, 1, 1, 0', 'Input pattern 0, 1, 1, 0'), dut: loc('反相器', 'Inverter'),
    read: '1001', fail: '1011', expected: loc('逐拍比对输出，期望 1, 0, 0, 1', 'Compare each cycle. Expect 1, 0, 0, 1.'),
    pattern: 'M8 44 H54 V15 H145 V44 H193', unit: '0 / 1',
  },
  analog: {
    input: loc('精密源加 1.00 V 直流', 'Precision source applies 1.00 V DC'), dut: loc('增益为 2 的放大器', 'Gain-of-two amplifier'),
    read: '2.00 V', fail: '1.78 V', expected: loc('量输出电压，期望 1.98–2.02 V', 'Measure the output voltage. Expect 1.98–2.02 V.'),
    pattern: 'M8 49 H40 L53 21 H193', unit: 'VIN',
  },
  memory: {
    input: loc('在地址 0x12 写入 0xA5 后读回', 'Write 0xA5 at 0x12, then read'), dut: loc('SRAM 阵列', 'SRAM array'),
    read: '0xA5', fail: '0xA4', expected: loc('比较同一地址的返回数据，期望 0xA5', 'Compare the value returned at the same address. Expect 0xA5.'),
    pattern: 'M8 44 H22 V15 H78 V44 H121 V15 H178 V44 H193', unit: 'W → R',
  },
  rf: {
    input: loc('信号源加 1 GHz、−20 dBm', 'Generator applies 1 GHz at −20 dBm'), dut: loc('射频放大器', 'RF amplifier'),
    read: '−10 dBm', fail: '−14 dBm', expected: loc('功率计读输出，按差值核对约 10 dB 增益', 'Read output power, then subtract input power to check for about 10 dB of gain.'),
    pattern: 'M8 30 Q19 2 31 30 T54 30 T77 30 T100 30 T123 30 T146 30 T169 30 T192 30', unit: 'RF',
  },
}
const SAMPLES = [
  { id: 'ok', label: loc('正常样片', 'Passing sample') },
  { id: 'bad', label: loc('异常样片', 'Failing sample') },
] as const

export function ChipTestChain({ id }: { id: string }) {
  const { t } = useLocale()
  const [sample, setSample] = useState<(typeof SAMPLES)[number]['id']>('ok')
  const kind = Object.hasOwn(EXAMPLES, id) ? id as keyof typeof EXAMPLES : 'digital'
  const test = EXAMPLES[kind]
  const good = sample === 'ok'
  return (
    <figure className="term-fig">
      <Seg options={SAMPLES} value={sample} onChange={setSample} />
      <ol className="intro-chip-chain" data-chip-test={kind}>
        <li>
          <strong>{t(loc('送入激励', 'Apply stimulus'))}</strong>
          <svg viewBox="0 0 202 60" role="img" aria-label={t(test.input)}>
            <path d="M8 49 H193" stroke="var(--muted)" strokeDasharray="4 4" />
            <path d={test.pattern} stroke="var(--blue-strong)" strokeWidth="3" fill="none" />
          </svg>
          <span>{t(test.input)}</span>
        </li>
        <li><strong>DUT</strong><span className="intro-chip-chain__dut">{test.unit}</span><span>{t(test.dut)}</span></li>
        <li>
          <strong>{t(loc('测量与比较', 'Measure and compare'))}</strong>
          <output data-result={good ? 'pass' : 'fail'}>{good ? test.read : test.fail} · {good ? 'PASS' : 'FAIL'}</output>
          <span>{t(test.expected)}</span>
        </li>
      </ol>
    </figure>
  )
}
