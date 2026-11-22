import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'

const LABEL = {
  rst: loc('RST', 'RST'),
  tx: loc('TX', 'TX'),
  sel: loc('SEL', 'SEL'),
  fd: loc('FD', 'FD'),
  t: loc('t', 't'),
}

const BG = '#0d1117'
const TRACK = '#21262d'
const TEXT = '#c9d1d9'
const BLUE = '#58a6ff'
const GOLD = '#e8c45a'
const SEL = '#d2a8ff'
const RESET_ON = 0.22
const RESET_OFF = 0.35
const RESET_SAMPLE = 0.43
const TRANSFER_ON = 0.51
const TRANSFER_OFF = 0.66
const SIGNAL_SAMPLE = 0.8
const PHASES = [
  { id: 'expose', label: loc('曝光存电荷', 'Collect charge'), cursor: 0.12,
    detail: loc('TX 关断，光生电子留在钉扎光电二极管 PPD 里。', 'TX is off, so photoelectrons stay in the pinned photodiode (PPD).') },
  { id: 'reset', label: loc('复位 FD', 'Reset FD'), cursor: 0.29,
    detail: loc('RST 导通，把浮动扩散节点 FD 复位。TX 仍关断，PPD 存下的电子还在。', 'RST turns on and resets the floating diffusion (FD). TX remains off and the electrons stay in the PPD.') },
  { id: 'reference', label: loc('取复位样本', 'Sample reset'), cursor: RESET_SAMPLE,
    detail: loc('RST 关断后，列读出经 SF、SEL 取复位电压 Vreset。光生电子仍留在 PPD。', 'After RST turns off, the column samples Vreset through SF and SEL. Photoelectrons are still in the PPD.') },
  { id: 'transfer', label: loc('转移到 FD', 'Transfer to FD'), cursor: 0.58,
    detail: loc('TX 打开，电子从 PPD 转入 FD，FD 电压下降。电荷留在 FD，SF 跟随的是它的电压。', 'TX opens a path for electrons to move from PPD to FD. FD voltage drops. Charge stays at FD and SF follows its voltage.') },
  { id: 'sample', label: loc('取信号样本', 'Sample signal'), cursor: SIGNAL_SAMPLE,
    detail: loc('TX 关断后取 Vsignal。两次取样经过同一条列通路，同一次 FD 复位产生的偏移同时存在于两次读数里。', 'Sample Vsignal after TX turns off. Both measurements use the same column path, and both include the offset from the same FD reset.') },
] as const

function PixelCrossSection({ phase, photoE }: { phase: (typeof PHASES)[number]['id']; photoE: number }) {
  const { t } = useLocale()
  const reset = phase === 'reset'
  const transfer = phase === 'transfer'
  const atFd = phase === 'sample'
  const sampling = phase === 'reference' || atFd
  const markers = photoE === 0 ? 0 : Math.min(9, 2 + Math.ceil(photoE / 1800))
  return (
    <svg viewBox="0 0 500 204" className="sns-svg" role="img"
      aria-label={t(loc('光电二极管、转移门、FD 与列读出通路', 'Photodiode, transfer gate, FD and column readout path'))} data-charge={atFd ? 'fd' : transfer ? 'transfer' : 'ppd'}>
      <rect width="500" height="204" rx="10" fill={BG} />
      <path d="M39 101 H304 V178 H39Z" fill="#28374c" stroke="#658199" strokeWidth="2" />
      <path d="M53 122 Q74 104 109 104 H135 Q159 104 167 125 V152 H53Z" fill="#285e65" stroke="#5baea9" strokeWidth="2" />
      <rect x="169" y="85" width="49" height="16" rx="4" fill={transfer ? GOLD : '#6d7e92'} />
      <rect x="231" y="101" width="55" height="47" rx="4" fill="#395b8d" stroke={atFd || transfer ? GOLD : BLUE} strokeWidth="2" />
      <text x="108" y="142" textAnchor="middle" fill={TEXT} fontSize="18">PPD</text>
      <text x="193" y="78" textAnchor="middle" fill={transfer ? GOLD : TEXT} fontSize="18">TX</text>
      <text x="258" y="130" textAnchor="middle" fill={TEXT} fontSize="18">FD</text>
      <path d="M260 101 V63 H331" fill="none" stroke={sampling || reset ? GOLD : '#8298ac'} strokeWidth="3" />
      <path d="M298 62 V45" fill="none" stroke={reset ? GOLD : '#8298ac'} strokeWidth="3" />
      <rect x="274" y="19" width="49" height="27" rx="4" fill={reset ? '#7b6129' : TRACK} stroke={reset ? GOLD : '#8298ac'} />
      <text x="298" y="38" textAnchor="middle" fill={TEXT} fontSize="16">RST</text>
      <text x="332" y="37" fill={TEXT} fontSize="16">VDD</text>
      <rect x="331" y="48" width="46" height="31" rx="4" fill={TRACK} stroke={sampling ? GOLD : '#8298ac'} />
      <text x="354" y="69" textAnchor="middle" fill={TEXT} fontSize="16">SF</text>
      <path d="M377 63 H397 M444 63 H473 V89" fill="none" stroke={sampling ? GOLD : '#8298ac'} strokeWidth="3" />
      <rect x="397" y="48" width="47" height="31" rx="4" fill={TRACK} stroke={sampling ? GOLD : '#8298ac'} />
      <text x="420" y="69" textAnchor="middle" fill={TEXT} fontSize="16">SEL</text>
      <text x="475" y="108" textAnchor="end" fill={TEXT} fontSize="16">{t(loc('列读出', 'Column'))}</text>
      {phase === 'expose' && <path d="M68 41 L98 85 M90 39 L120 83 M112 41 L142 85" stroke={GOLD} strokeWidth="3" strokeDasharray="4 4" />}
      {transfer && <path d="M153 113 H223 L216 106 M223 113 L216 120" stroke={GOLD} strokeWidth="2" fill="none" />}
      {Array.from({ length: markers }, (_, i) => {
        const positions = atFd ? [240 + 9 * (i % 5), 139 + 6 * Math.floor(i / 5)]
          : transfer ? [144 + 13 * i, 111 + 5 * (i % 2)] : [70 + 10 * (i % 8), 148 + 7 * Math.floor(i / 8)]
        return <circle key={i} cx={positions[0]} cy={positions[1]} r="3" fill={GOLD} />
      })}
      <text x="53" y="194" fill={TEXT} fontSize="15">{t(loc('示意截面', 'Schematic section'))}</text>
    </svg>
  )
}

/**
 * 4T 时序。名字只放在左栏，色条从 x=72 开始，避免文字叠在条上。
 */
export function SnsPixelFig({
  photoE,
  cgUv,
  cds,
  aria,
  summary,
}: {
  photoE: number
  cgUv: number
  cds: boolean
  aria: string
  summary: string
}) {
  const { t } = useLocale()
  const [phaseId, setPhase] = useState<(typeof PHASES)[number]['id']>('expose')
  const phase = PHASES.find(({ id }) => id === phaseId) ?? PHASES[0]
  const W = 640
  const H = 268
  const x0 = 78
  const x1 = 620
  const span = x1 - x0
  const xAt = (p: number) => x0 + p * span
  const dropMv = photoE * cgUv / 1000
  const yReset = 168
  const ySignal = yReset + Math.min(1, dropMv / 600) * 62
  const yStart = 214
  const trace = [
    [0, yStart],
    [RESET_ON, yStart],
    [RESET_OFF, yReset],
    [TRANSFER_ON, yReset],
    [TRANSFER_OFF, ySignal],
    [1, ySignal],
  ]
    .map(([p, y]) => `${xAt(p).toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  const bar = (y: number, a: number, b: number, color: string) => (
    <g key={`${y}-${a}`}>
      <rect x={x0} y={y} width={span} height={16} rx={3} fill={TRACK} />
      <rect x={xAt(a)} y={y} width={Math.max(0, xAt(b) - xAt(a))} height={16} rx={3} fill={color} />
    </g>
  )

  return (
    <figure className="sns-fig sns-pixel-sequence">
      <Seg options={PHASES} value={phaseId} onChange={setPhase} />
      <PixelCrossSection phase={phaseId} photoE={photoE} />
      <p className="sns-summary" aria-live="polite">{t(phase.detail)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg" data-pixel-phase={phaseId}>
        <rect width={W} height={H} rx={10} fill={BG} />
        {bar(36, RESET_ON, RESET_OFF, BLUE)}
        {bar(78, TRANSFER_ON, TRANSFER_OFF, GOLD)}
        {bar(120, 0.39, 0.94, SEL)}
        <line x1={xAt(phase.cursor)} x2={xAt(phase.cursor)} y1="20" y2="240" stroke={TEXT} strokeDasharray="5 4" strokeWidth="2" />
        <text x={10} y={48} fill={TEXT} fontSize={12}>
          {t(LABEL.rst)}
        </text>
        <text x={10} y={90} fill={TEXT} fontSize={12}>
          {t(LABEL.tx)}
        </text>
        <text x={10} y={132} fill={TEXT} fontSize={12}>
          {t(LABEL.sel)}
        </text>
        <text x={10} y={196} fill={TEXT} fontSize={12}>
          {t(LABEL.fd)}
        </text>
        <polyline fill="none" stroke={BLUE} strokeWidth={2} points={trace} />
        <g>
          <circle cx={xAt(RESET_SAMPLE)} cy={yReset} r={5} fill={cds ? GOLD : BG} stroke={GOLD} strokeWidth="2" />
          <text x={xAt(RESET_SAMPLE)} y={yReset + 24} textAnchor="middle" fill={TEXT} fontSize="19">Vreset</text>
          <circle cx={xAt(SIGNAL_SAMPLE)} cy={ySignal} r={5} fill={GOLD} />
          <text x={xAt(SIGNAL_SAMPLE)} y={ySignal + 24} textAnchor="middle" fill={TEXT} fontSize="19">Vsignal</text>
        </g>
        <text x={x1 - 8} y={H - 10} fill={TEXT} fontSize={11} textAnchor="end">
          {t(LABEL.t)}
        </text>
      </svg>
      <figcaption className="sns-summary">
        {t(loc(`${photoE.toLocaleString()} e⁻，理想 Vreset − Vsignal = ${photoE} × ${cgUv.toFixed(1)} µV ≈ ${dropMv.toFixed(1)} mV。时序和电压坐标为示意。`, `${photoE.toLocaleString()} e⁻: ideal Vreset − Vsignal = ${photoE} × ${cgUv.toFixed(1)} µV ≈ ${dropMv.toFixed(1)} mV. Time and voltage axes are schematic.`))}{' '}
        {t(cds ? loc('CDS 用这两次读数相减，以抵消共同的复位偏移。', 'CDS subtracts the readings so the shared reset offset cancels.') : loc('CDS 关闭时，空心的复位点仅供参考，计算采用信号样本。', 'With CDS off, the hollow reset marker is a reference only. The calculation uses the signal sample.'))}{' '}
        {summary}
      </figcaption>
    </figure>
  )
}
