import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { COLOR } from './FabFigs'
import { FIGL } from './data/pcbFab'
import { frameIndex, type FrameId } from './data/pcbFabModel'
import { GEO, SMD, TRACES } from './data/pcbFabRules'

const W = GEO.width
const H = GEO.height
const CY = GEO.centerY
const PAD_Y = 100
const PAD_H = 60
const EXP = GEO.maskExp

function Pattern({ fill, smd, opacity }: { fill: string; smd: boolean; opacity?: number }) {
  return (
    <g fill={fill} opacity={opacity}>
      {TRACES.map(([x, w]) => (
        <rect key={x} x={x} y={0} width={w} height={H} />
      ))}
      <rect x={GEO.viaX - 6} y={0} width={12} height={CY} />
      <circle cx={GEO.viaX} cy={CY} r={GEO.padR} />
      {smd ? (
        <>
          {SMD.map(([x, w]) => (
            <rect key={x} x={x} y={PAD_Y} width={w} height={PAD_H} />
          ))}
          <rect x={SMD[0][0] + 8} y={PAD_Y + PAD_H} width={14} height={H - PAD_Y - PAD_H} />
          <rect x={SMD[1][0] + 8} y={0} width={14} height={PAD_Y} />
        </>
      ) : null}
    </g>
  )
}

function Openings({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <circle cx={GEO.viaX} cy={CY} r={GEO.padR + EXP} />
      {SMD.map(([x, w]) => (
        <rect key={x} x={x - EXP} y={PAD_Y - EXP} width={w + 2 * EXP} height={PAD_H + 2 * EXP} />
      ))}
    </g>
  )
}

export function Chip({ x, y, text, anchor = 'middle' }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }) {
  let width = 8
  for (const ch of text) {
    width += ch.charCodeAt(0) > 255 ? 11 : 6.2
  }
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  return (
    <g>
      <rect x={left} y={y - 12} width={width} height="17" rx="3" fill="var(--well)" opacity="0.85" />
      <text x={left + width / 2} y={y} textAnchor="middle" fill="var(--text-2)" fontSize="11">
        {text}
      </text>
    </g>
  )
}

export function FabTop({ frame }: { frame: FrameId }) {
  const { t } = useLocale()
  const f = frameIndex(frame)
  const at = (id: FrameId) => f === frameIndex(id)
  const from = (id: FrameId) => f >= frameIndex(id)
  const inner = f < frameIndex('layup')
  const sheetOnTop = inner ? f < frameIndex('etch1') : f < frameIndex('etch2')
  const drilled = from('drill')
  const masked = from('maskCoat')
  const padFill = from('enig') ? COLOR.au : COLOR.cu
  const lining = from('enig') ? COLOR.au : from('pattern') && !from('stripSn') ? COLOR.sn : COLOR.cuPlated

  // 孔内壁：沿孔壁一圈镀层
  const hole = drilled ? (
    <g>
      <circle cx={GEO.viaX} cy={CY} r={GEO.holeR} fill="var(--well)" />
      {from('electroless') ? <circle cx={GEO.viaX} cy={CY} r={GEO.holeR - 1.8} fill="none" stroke={lining} strokeWidth="3.6" /> : null}
    </g>
  ) : null

  let body: ReactNode
  if (inner) {
    body = (
      <g>
        <rect width={W} height={H} fill={sheetOnTop ? COLOR.cu : COLOR.core} />
        {!sheetOnTop ? <Pattern fill={at('oxide') ? COLOR.oxide : COLOR.cu} smd={false} /> : null}
        {at('dfLam1') ? <rect width={W} height={H} fill={COLOR.film} opacity="0.8" /> : null}
        {at('exp1') ? <rect width={W} height={H} fill={COLOR.film} opacity="0.8" /> : null}
        {at('exp1') || at('dev1') || at('etch1') ? <Pattern fill={COLOR.filmHard} smd={false} /> : null}
        {at('aoi1') ? <rect x="0" y={H * 0.42} width={W} height="10" fill={COLOR.uv} opacity="0.35" /> : null}
      </g>
    )
  } else {
    const plain = from('electroless') ? COLOR.cuPlated : COLOR.cu
    body = (
      <g>
        <rect width={W} height={H} fill={sheetOnTop ? plain : COLOR.core} />
        {f < frameIndex('desmear') ? <Pattern fill="#000" smd={false} opacity={0.18} /> : null}
        {!sheetOnTop && !masked ? <Pattern fill={from('stripSn') ? COLOR.cu : COLOR.sn} smd /> : null}
        {from('strip2') && sheetOnTop ? <Pattern fill={COLOR.sn} smd /> : null}
        {masked ? <MaskView f={f} padFill={padFill} /> : null}
        {at('dev2') || at('pattern') ? <FilmOpen fill={at('pattern') ? COLOR.sn : plain} /> : null}
        {hole}
        {at('dfLam2') ? <rect width={W} height={H} fill={COLOR.film} opacity="0.8" /> : null}
        {at('exp2') ? <rect width={W} height={H} fill={COLOR.filmHard} opacity="0.95" /> : null}
        {at('exp2') ? <Pattern fill={COLOR.film} smd /> : null}
      </g>
    )
  }

  return (
    <g>
      {body}
      {from('legend') ? <Legend /> : null}
      {from('route') ? <Outline at={at('route')} /> : null}
      {at('test') ? <Probes /> : null}
      {at('final') ? <Lens /> : null}
      <line x1="0" y1={CY} x2={W} y2={CY} stroke="var(--gold)" strokeWidth="1" strokeDasharray="5 3" />
      <text x="6" y={CY - 5} fill="var(--gold)" fontSize="12" fontWeight="700">
        A
      </text>
      <text x={W - 6} y={CY - 5} textAnchor="end" fill="var(--gold)" fontSize="12" fontWeight="700">
        A
      </text>
      {at('drill') ? <Chip x={GEO.viaX} y={CY + 52} text={t(FIGL.ring)} /> : null}
      {at('maskDev') || at('maskCure') ? <Chip x={(SMD[0][0] + SMD[0][1] + SMD[1][0]) / 2 + 2} y={PAD_Y - 14} text={t(FIGL.dam)} /> : null}
    </g>
  )
}

/** 显影后：不要线路的地方有硬膜，线路和孔位露出铜 */
function FilmOpen({ fill }: { fill: string }) {
  return (
    <g>
      <rect width={W} height={H} fill={COLOR.filmHard} />
      <Pattern fill={fill} smd />
    </g>
  )
}

function MaskView({ f, padFill }: { f: number; padFill: string }) {
  const at = (id: FrameId) => f === frameIndex(id)
  const fill = at('maskCoat') ? COLOR.maskSoft : at('maskExp') ? COLOR.maskHard : at('maskDev') ? COLOR.mask : COLOR.maskCured
  const open = !at('maskCoat')
  return (
    <g>
      <Pattern fill={COLOR.cu} smd />
      <rect width={W} height={H} fill={fill} opacity={at('maskCoat') ? 0.82 : 1} />
      <Pattern fill={COLOR.cu} smd opacity={at('maskCoat') ? 0.35 : 0.22} />
      {open ? <Openings fill={at('maskExp') ? COLOR.maskSoft : COLOR.core} /> : null}
      {f >= frameIndex('maskDev') ? <PadsOnly fill={padFill} /> : null}
    </g>
  )
}

function PadsOnly({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <circle cx={GEO.viaX} cy={CY} r={GEO.padR} />
      {SMD.map(([x, w]) => (
        <rect key={x} x={x} y={PAD_Y} width={w} height={PAD_H} />
      ))}
    </g>
  )
}

function Legend() {
  return (
    <g fill={COLOR.ink}>
      <rect x="200" y="85" width="6" height="90" />
      <rect x="200" y="85" width="130" height="6" />
      <rect x="200" y="169" width="130" height="6" />
      <text x="272" y="208" fontSize="14" fontWeight="700" fontFamily="var(--mono)">
        R1
      </text>
    </g>
  )
}

function Outline({ at }: { at: boolean }) {
  return (
    <g>
      <path d={`M0 0H${W}V${H}H0Z M0 8H${GEO.edge}V${H - 8}H0Z`} fillRule="evenodd" fill="#10151b" />
      <rect x="0" y="8" width={GEO.edge} height={H - 16} fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeDasharray={at ? '5 3' : undefined} />
      {at ? <circle cx={GEO.edge} cy="8" r="5" fill="none" stroke={COLOR.steel} strokeWidth="2" /> : null}
    </g>
  )
}

function Probes() {
  const tips = [SMD[0][0] + 15, GEO.viaX + 24]
  return (
    <g stroke={COLOR.steel} strokeWidth="2" fill="none">
      {tips.map((x) => (
        <g key={x}>
          <line x1={x} y1={CY} x2={x + 36} y2={CY - 66} />
          <circle cx={x} cy={CY} r="4" fill="var(--well)" />
        </g>
      ))}
    </g>
  )
}

function Lens() {
  return (
    <g stroke="var(--gold)" strokeWidth="3" fill="none">
      <circle cx="318" cy="224" r="18" />
      <line x1="331" y1="237" x2="346" y2="252" />
    </g>
  )
}
