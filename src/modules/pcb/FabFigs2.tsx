import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { COLOR, Half } from './FabFigs'
import { Chip, FabTop } from './FabTop'
import { FIGL, S } from './data/pcbFab'
import { FRAMES, frameIndex, type FrameId, type HotKey } from './data/pcbFabModel'
import { GEO, LEGEND_BAR } from './data/pcbFabRules'

type Tag = { x: number; y: number; text: LText }

// 每帧在横截面上的小标注，位置避开箭头和线路
const TAGS: Partial<Record<FrameId, Tag[]>> = {
  dfLam1: [{ x: 300, y: 124, text: FIGL.film }],
  exp1: [{ x: 300, y: 86, text: FIGL.uv }, { x: 300, y: 106, text: FIGL.art }],
  dev1: [{ x: 300, y: 124, text: FIGL.film }],
  etch1: [{ x: 300, y: 96, text: FIGL.etchant }],
  aoi1: [{ x: 60, y: 50, text: FIGL.aoi }],
  layup: [{ x: 300, y: 68, text: FIGL.foil }, { x: 300, y: 107, text: FIGL.pp }, { x: 300, y: 179, text: FIGL.core }],
  press: [{ x: 180, y: 56, text: FIGL.heat }],
  drill: [{ x: 150, y: 52, text: FIGL.bit }],
  dfLam2: [{ x: 300, y: 86, text: FIGL.film }],
  exp2: [{ x: 70, y: 50, text: FIGL.uv }, { x: 250, y: 50, text: FIGL.art }],
  dev2: [{ x: 322, y: 86, text: FIGL.film }],
  pattern: [{ x: 322, y: 86, text: FIGL.film }],
  etch2: [{ x: 200, y: 56, text: FIGL.etchant }],
  maskCoat: [{ x: 300, y: 84, text: FIGL.maskInk }],
  maskExp: [{ x: 70, y: 50, text: FIGL.uv }, { x: 250, y: 50, text: FIGL.art }],
  maskCure: [{ x: 180, y: 50, text: FIGL.bake }],
  legend: [{ x: 203, y: 76, text: FIGL.ink }],
  enig: [{ x: 247, y: 76, text: FIGL.niAu }],
  route: [{ x: 345, y: 36, text: FIGL.router }],
  test: [{ x: 330, y: 40, text: FIGL.probe }],
}

// 缺陷在横截面上的圈：x, y, 宽, 高；shift 表示压合前（芯板阶段）要下移到内层铜的位置
const HOT: Record<HotKey, { x: number; y: number; w: number; h: number; shift: boolean }> = {
  trace: { x: 8, y: 84, w: 114, h: 42, shift: true },
  gap: { x: 38, y: 86, w: 56, h: 38, shift: true },
  wall: { x: 124, y: 98, w: 52, h: 154, shift: false },
  pad: { x: 112, y: 84, w: 76, h: 44, shift: true },
  smd: { x: 224, y: 80, w: 100, h: 46, shift: false },
  dam: { x: 258, y: 82, w: 30, h: 40, shift: false },
  surface: { x: 4, y: 82, w: 352, h: 44, shift: true },
  legend: { x: 190, y: 76, w: 28, h: 22, shift: false },
  edge: { x: 322, y: 80, w: 38, h: 190, shift: false },
  inner: { x: 4, y: 132, w: 352, h: 86, shift: false },
}

function Tools({ f }: { f: number }) {
  const at = (id: FrameId) => f === frameIndex(id)
  const hx = GEO.viaX
  return (
    <g>
      {at('drill') ? (
        <g>
          <polygon points={`${hx - 13},62 ${hx + 13},62 ${hx + 13},150 ${hx},172 ${hx - 13},150`} fill={COLOR.steel} stroke="var(--text-2)" strokeWidth="1" />
          <path d={`M${hx - 13} 76 L${hx + 13} 88 M${hx - 13} 100 L${hx + 13} 112 M${hx - 13} 124 L${hx + 13} 136`} stroke="#6f7983" strokeWidth="2" />
        </g>
      ) : null}
      {at('aoi1') ? (
        <g>
          <rect x="44" y="58" width="32" height="14" rx="3" fill={COLOR.steel} />
          <rect x="54" y="72" width="12" height="6" fill="#6f7983" />
          <path d="M60 78 L22 136 M60 78 L104 136" stroke={COLOR.uv} strokeWidth="1.2" strokeDasharray="4 3" />
        </g>
      ) : null}
      {at('route') ? (
        <g>
          <rect x={GEO.edge} y="44" width="10" height="48" fill={COLOR.steel} stroke="var(--text-2)" strokeWidth="1" />
          <path d={`M${GEO.edge} 54 L${GEO.edge + 10} 60 M${GEO.edge} 68 L${GEO.edge + 10} 74 M${GEO.edge} 82 L${GEO.edge + 10} 88`} stroke="#6f7983" strokeWidth="1.5" />
        </g>
      ) : null}
      {at('test') ? (
        <g stroke={COLOR.steel} strokeWidth="2" fill="none">
          <path d="M281 44 L247 89 M207 44 L173 89" />
          <circle cx="247" cy="89" r="2.5" fill={COLOR.steel} />
          <circle cx="173" cy="89" r="2.5" fill={COLOR.steel} />
        </g>
      ) : null}
      {at('final') ? (
        <g fill="none" strokeWidth="3">
          <circle cx="200" cy="60" r="13" stroke="var(--gold)" />
          <path d="M209 69 L222 82" stroke="var(--gold)" />
          <path d="M288 62 L296 70 L312 52" stroke="var(--green)" />
        </g>
      ) : null}
    </g>
  )
}

export function FabSection({ frame, hot }: { frame: FrameId; hot: HotKey | null }) {
  const { t } = useLocale()
  const f = frameIndex(frame)
  const core = f < frameIndex('layup')
  const box = hot ? HOT[hot] : null
  return (
    <g>
      <Half f={f} />
      <g transform="translate(0 350) scale(1 -1)">
        <Half f={f} />
      </g>
      {f >= frameIndex('route') ? <rect x={GEO.edge} y="60" width="10" height="230" fill="var(--well)" /> : null}
      {f >= frameIndex('legend') ? <rect x={LEGEND_BAR[0]} y="86" width={LEGEND_BAR[1]} height="4" fill={COLOR.ink} /> : null}
      <Tools f={f} />
      {(TAGS[frame] ?? []).map((tag) => (
        <Chip key={tag.x + tag.y} x={tag.x} y={tag.y} text={t(tag.text)} />
      ))}
      {box ? (
        <rect
          x={box.x}
          y={box.y + (box.shift && core ? 40 : 0)}
          width={box.w}
          height={box.h}
          rx="8"
          fill="none"
          stroke="var(--red)"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      ) : null}
    </g>
  )
}

export function FabBoardFig({ frame, hot }: { frame: FrameId; hot: HotKey | null }) {
  const { t } = useLocale()
  const item = FRAMES[frameIndex(frame)]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 330" className="term-fig__svg" role="img" aria-label={`${t(item.label)}. ${t(item.says)}`}>
        <rect width="760" height="330" rx="10" fill="var(--well)" />
        <text x="14" y="22" fill="var(--text)" fontSize="12" fontWeight="700">
          {t(S.secLabel)}
        </text>
        <text x="396" y="22" fill="var(--text)" fontSize="12" fontWeight="700">
          {t(S.topLabel)}
        </text>
        <g transform="translate(14 0)">
          <FabSection frame={frame} hot={hot} />
        </g>
        <g transform="translate(396 44)">
          <clipPath id="fabTopClip">
            <rect width={GEO.width} height={GEO.height} rx="4" />
          </clipPath>
          <g clipPath="url(#fabTopClip)">
            <FabTop frame={frame} />
          </g>
          <rect width={GEO.width} height={GEO.height} rx="4" fill="none" stroke="var(--line-2)" />
        </g>
      </svg>
      <figcaption>{`${t(item.label)}: ${t(item.says)}`}</figcaption>
    </figure>
  )
}
