import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Slot } from './rwModel'

export function MemoryCellPath({ slot, address, writeValue, committed }: {
  slot: Slot | null; address: number; writeValue: 0 | 1; committed: boolean
}) {
  const { t } = useLocale()
  const target = slot?.addr ?? address
  const row = Math.floor(target / 8)
  const col = target % 8
  const cellX = 95 + col * 24
  const cellY = 55 + row * 18
  const enabled = slot?.cs === 0
  const reading = slot?.data.kind === 'busy' || slot?.data.kind === 'out'
  const ready = slot?.data.kind === 'out'
  const write = slot?.data.kind === 'drive'
  const highlight = 'var(--gold)'
  const caption = slot === null ? loc('空闲时阵列未选通。先执行一拍，地址会选出一行和一列。', 'The array is idle. Step once to decode the address into a row and column.')
    : !enabled ? loc('地址译码后等待选通，位线准备就绪。总线处于高阻。', 'The address is decoded and bit lines prepare for selection. The bus is high impedance.')
      : write ? loc('写驱动器在位线对上建立互补电平，字线选中单元。按本例时序，写数据在 WE# 回升时锁存。', 'The write driver places complementary levels on the bit-line pair and the word line selects the cell. In this timing example, WE# rising latches the write.')
        : ready ? loc(`感放判决得到 ${slot.data.kind === 'out' ? slot.data.value : '—'}，数据通过输出缓冲送到 DATA。`, `The sense amplifier resolves ${slot.data.kind === 'out' ? slot.data.value : '—'} and the output buffer drives DATA.`)
          : loc('字线打开单元，选中的 BL 和 BL̅ 产生电压差，感放还没完成判决。', 'The word line connects the cell. The selected BL and BL̅ develop a voltage difference before sensing completes.')
  return (
    <figure className="term-fig">
      <svg className="term-fig__svg" viewBox="0 0 440 235" role="img" aria-label={t(caption)}
        data-array-address={target} data-array-stage={slot?.data.kind ?? 'idle'}>
        <rect width="440" height="235" fill="var(--well)" />
        <rect x="82" y="40" width="200" height="151" rx="6" fill="var(--panel)" stroke="var(--line-2)" />
        <path d={`M52 ${cellY} H278`} stroke={enabled ? highlight : 'var(--muted)'} strokeWidth="2.5" strokeDasharray={enabled ? undefined : '3 3'} />
        <path d={`M${cellX - 5} 39 V198 H313 M${cellX + 5} 39 V204 H313`} stroke={enabled ? highlight : 'var(--muted)'} strokeWidth="2" fill="none" />
        {Array.from({ length: 64 }, (_, addr) => <rect key={addr}
          x={87 + (addr % 8) * 24} y={49 + Math.floor(addr / 8) * 18} width="16" height="12" rx="2"
          fill={addr === target && enabled ? 'var(--gold-bg)' : 'var(--fig-box)'}
          stroke={addr === target && enabled ? highlight : 'var(--line-2)'} />)}
        <text x="25" y={cellY + 5} fill="var(--text)" fontSize="13">WL{row}</text>
        <text x={cellX} y="30" textAnchor="middle" fill="var(--text)" fontSize="13">{`BL${col}/BL̅`}</text>
        {enabled && <text x={cellX} y={cellY + 4} textAnchor="middle" fill="var(--text)" fontSize="10">
          {committed && target === address ? writeValue : 0}
        </text>}
        <rect x="313" y="185" width="108" height="33" rx="4" fill={reading || write ? 'var(--gold-bg)' : 'var(--panel)'}
          stroke={reading || write ? highlight : 'var(--line-2)'} />
        <text x="367" y="206" textAnchor="middle" fill="var(--text)" fontSize="14">{t(write ? loc('写驱动器', 'Write driver') : loc('感放', 'Sense amp'))}</text>
        {ready && <><path d="M367 185 V144" fill="none" stroke={highlight} strokeWidth="2.5" />
          <text x="367" y="136" fill="var(--text)" fontSize="14" textAnchor="middle">{`DATA = ${slot.data.kind === 'out' ? slot.data.value : '—'}`}</text></>}
      </svg>
      <figcaption aria-live="polite">{t(caption)}</figcaption>
    </figure>
  )
}
