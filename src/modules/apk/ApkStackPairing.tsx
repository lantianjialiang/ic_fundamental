import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Readout } from '../fund/parts'

// 两种工艺复用同一批裸片。上层 3 号检出，7 号漏检；下层 5 号检出。
const UPPER = ['good', 'good', 'reject', 'good', 'good', 'good', 'escape', 'good'] as const
const LOWER = ['good', 'good', 'good', 'good', 'reject', 'good', 'good', 'good'] as const
const DONORS = UPPER.flatMap((status, index) => status === 'reject' ? [] : [index])
const PLACED = LOWER.map((status, index) => status === 'reject' ? -1 : DONORS[index < 4 ? index : index - 1])
const X = (index: number) => 53 + index * 44

export function ApkStackPairing({ pick, coverage, goodGivenPass }: { pick: boolean; coverage: number; goodGivenPass: number }) {
  const { t } = useLocale()
  const [site, setSite] = useState(3)
  const target = site - 1
  const placed = pick ? PLACED : UPPER.map((_, index) => index)
  const donor = placed[target]
  const ready = placed.filter((index) => index >= 0).length
  const good = placed.filter((index, position) => index >= 0 && UPPER[index] === 'good' && LOWER[position] === 'good').length
  const escaped = 100 * (1 - coverage)
  const pass = 900 + escaped
  const color = (status: (typeof UPPER)[number]) => status === 'good' ? '#56bda0' : status === 'reject' ? '#e46a69' : '#ecc066'
  return (
    <figure className="term-fig">
      <Knob label={loc('查看下层位置', 'Inspect lower site')} value={site} unit="" min={1} max={8} step={1} onChange={setSite} />
      <svg className="term-fig__svg" viewBox="0 0 415 195" role="img" aria-label={t(loc('同一批上层与下层 die 的贴合对照', 'Pairing the same upper and lower dies'))}>
        <rect width="415" height="195" rx="10" fill="var(--well)" />
        <g fill="var(--text)" fontSize="14">
          <text x="21" y="21">{t(loc('上层来源', 'Upper-layer source'))}</text>
          <text x="21" y="184">{t(loc('下层贴装位置', 'Lower placement sites'))}</text>
        </g>
        {placed.map((source, index) => source >= 0 && (
          <path key={index} data-pair-target={index + 1} data-pair-source={source + 1}
            d={`M${X(source)} 66 C${X(source)} 89 ${X(index)} 105 ${X(index)} 126`}
            stroke={index === target ? 'var(--blue)' : 'var(--muted)'} strokeWidth={index === target ? 3.5 : 1.5} fill="none" />
        ))}
        {[UPPER, LOWER].map((statuses, row) => statuses.map((status, index) => {
          const y = row === 0 ? 33 : 127
          const active = row === 0 ? index === donor : index === target
          return <g key={`${row}-${index}`}>
            <rect x={X(index) - 16} y={y} width="32" height="31" rx="5" fill={color(status)}
              fillOpacity={pick && status === 'reject' ? '.2' : '.88'} stroke={active ? 'var(--text)' : color(status)} strokeWidth={active ? 2.5 : 1} />
            <text x={X(index)} y={y + 20} textAnchor="middle" fontSize="13" fill={pick && status === 'reject' ? 'var(--text)' : '#10202a'}>
              {pick && status === 'reject' ? '×' : index + 1}
            </text>
          </g>
        }))}
      </svg>
      <figcaption>
        {t(loc('绿为好件，红为可检出的坏件，黄为漏检坏件。真值仅用于教学核对。先测再贴按通过顺序拿片，跳过下层已检出的坏位置。',
          'Green marks good dies, red detectable defects and gold escaped defects. Ground truth is shown for learning. Test-then-place takes passing dies in order and skips known bad lower sites.'))}
      </figcaption>
      <Readout items={[
        { label: loc('当前贴装配对', 'Pair at this site'), value: donor < 0
          ? t(loc('下层坏件已被检出，跳过贴装', 'Lower die failed screening; skip placement'))
          : t(loc(`上层 #${donor + 1} → 下层 #${site}`, `Upper #${donor + 1} → lower #${site}`)) },
        { label: loc('示例中两层都好的配对（假设键合通过）', 'Example pairs with both dies good (assuming bonding passes)'),
          value: `${good} / ${ready}` },
        { label: loc('每 1,000 颗裸片的期望组成（Y = 90%，假设无过杀）', 'Expected mix per 1,000 incoming dies (90% yield, no overkill)'),
          value: t(loc(`好件 900，坏件检出 ${(100 * coverage).toFixed(0)}，坏件漏过 ${escaped.toFixed(0)}`,
            `900 good, ${(100 * coverage).toFixed(0)} bad caught, ${escaped.toFixed(0)} bad escape`)) },
        { label: loc('通过筛选的片中有多少真是好件', 'Fraction of truly good dies among passing dies'),
          value: `P(good | pass) ≈ 900 / ${pass.toFixed(0)} = ${(100 * goodGivenPass).toFixed(3)}%` },
      ]} />
    </figure>
  )
}
