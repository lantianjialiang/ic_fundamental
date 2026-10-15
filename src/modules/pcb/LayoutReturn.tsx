import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { useReducedMotion } from '../module01/hooks/useReducedMotion'
import { RefP, Related, type PrepNote } from '../prep/common'
import { S } from './data/pcbLayout'
import {
  CUT_X,
  PLANE,
  REF_AREA,
  REF_LEN,
  SLOT,
  TRACE_Y,
  X_LOAD,
  X_SRC,
  buildLanes,
  densityAt,
  laneLength,
  pathD,
  pointAt,
  underShare,
  weightedArea,
  weightedLength,
  type Lane,
} from './data/pcbLayoutLanes'
import { FREQS, PLANES, RETURN_TEXT, RET_LBL, type FreqId, type PlaneId } from './data/pcbLayoutReturn'
import { T } from './FlowFigs'

const SPEED = 80 // 动画速度，像素 / 秒
const COPPER = 'var(--gold-line)'
const BASE = 436
const K_DENSITY = 990 // 密度 → 像素
const sx = (y: number) => CUT_X + (y - TRACE_Y) * 3

function Dots({ pts, n, r, color, animate, dur }: { pts: Array<[number, number]>; n: number; r: number; color: string; animate: boolean; dur: number }) {
  const d = pathD(pts)
  return (
    <g fill={color}>
      {Array.from({ length: n }, (_, i) => {
        if (!animate) {
          const p = pointAt(pts, (i + 0.5) / n)
          return <circle key={i} cx={p[0]} cy={p[1]} r={r} />
        }
        return (
          <circle key={i} r={r}>
            <animateMotion dur={`${dur}s`} begin={`${-(i * dur) / n}s`} repeatCount="indefinite" path={d} calcMode="linear" />
          </circle>
        )
      })}
    </g>
  )
}

function LaneDots({ lane, animate }: { lane: Lane; animate: boolean }) {
  const dur = laneLength(lane) / SPEED
  return (
    <g>
      <path d={pathD(lane.pts)} fill="none" stroke="var(--blue)" strokeOpacity="0.22" strokeWidth="1" />
      <Dots pts={lane.pts} n={4} r={Math.min(3.4, 1.5 + 5 * lane.w)} color="var(--sky)" animate={animate} dur={dur} />
    </g>
  )
}

function densityPath(lanes: Lane[], sigma: number) {
  const pts: string[] = []
  for (let y = PLANE.y; y <= PLANE.y + PLANE.h; y += 2) {
    pts.push(`L${sx(y).toFixed(1)} ${(BASE - K_DENSITY * densityAt(lanes, y, sigma)).toFixed(1)}`)
  }
  return `M${sx(PLANE.y)} ${BASE} ${pts.join(' ')} L${sx(PLANE.y + PLANE.h)} ${BASE} Z`
}

function ReturnFig({ plane, freq, animate }: { plane: PlaneId; freq: FreqId; animate: boolean }) {
  const { t } = useLocale()
  const slot = plane === 'slot'
  const lanes = buildLanes(plane, freq)
  const sigma = slot ? 5 : freq === 'high' ? 3.5 : 10
  const gapA = sx(SLOT.y)
  const gapB = sx(SLOT.y + SLOT.h)
  const traceDur = (X_LOAD - X_SRC) / SPEED
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 470" className="term-fig__svg" role="img" aria-label={t(RET_LBL.ariaFig)}>
        <rect width="680" height="470" rx="10" fill="var(--well)" />
        <T x={8} y={14} anchor="start" size={11} color="var(--muted)">
          {t(RET_LBL.top)}
        </T>
        <rect x={PLANE.x} y={PLANE.y} width={PLANE.w} height={PLANE.h} rx="4" fill="var(--fig-box)" stroke="var(--line-2)" />
        <T x={PLANE.x + 6} y={PLANE.y + PLANE.h - 6} anchor="start" size={10} color="var(--dim)">
          {t(RET_LBL.plane)}
        </T>
        <path d={`M${CUT_X} 32 V206`} stroke="var(--text-2)" strokeWidth="1" strokeDasharray="4 3" />
        <T x={CUT_X} y={28} size={11} bold>
          A
        </T>
        <T x={CUT_X} y={216} size={11} bold>
          A
        </T>
        {slot ? (
          <g>
            <rect x={SLOT.x} y={SLOT.y} width={SLOT.w} height={SLOT.h} fill="var(--well)" stroke="var(--red)" strokeWidth="1.4" strokeDasharray="4 3" />
            <T x={SLOT.x + SLOT.w / 2} y={SLOT.y + SLOT.h - 12} size={10} color="var(--red-2)">
              {t(RET_LBL.slot)}
            </T>
          </g>
        ) : null}
        <g key={`${plane}-${freq}-${animate}`}>
          {lanes.map((lane, i) => (
            <LaneDots key={i} lane={lane} animate={animate} />
          ))}
        </g>
        <path d={`M${X_SRC} ${TRACE_Y} H${X_LOAD}`} stroke={COPPER} strokeWidth="6" />
        <Dots
          key={`sig-${animate}`}
          pts={[
            [X_SRC, TRACE_Y],
            [X_LOAD, TRACE_Y],
          ]}
          n={6}
          r={2.6}
          color="var(--text)"
          animate={animate}
          dur={traceDur}
        />
        <circle cx={X_SRC} cy={TRACE_Y} r="7" fill={COPPER} />
        <rect x={X_LOAD - 7} y={TRACE_Y - 7} width="14" height="14" fill={COPPER} />
        <T x={X_SRC} y={30} size={11}>
          {t(RET_LBL.driver)}
        </T>
        <T x={X_LOAD} y={30} size={11}>
          {t(RET_LBL.receiver)}
        </T>
        <path d="M40 222 H58" stroke={COPPER} strokeWidth="6" />
        <T x={64} y={226} anchor="start" size={10}>
          {t(RET_LBL.trace)}
        </T>
        <circle cx={126} cy={222} r="3.5" fill="var(--text)" stroke={COPPER} strokeWidth="1.4" />
        <T x={134} y={226} anchor="start" size={10}>
          {t(RET_LBL.signal)}
        </T>
        <circle cx={232} cy={222} r="3.5" fill="var(--sky)" />
        <T x={240} y={226} anchor="start" size={10}>
          {t(RET_LBL.ret)}
        </T>
        <T x={8} y={250} anchor="start" size={11} color="var(--muted)">
          {t(RET_LBL.section)}
        </T>
        <rect x={sx(PLANE.y)} y="345" width={PLANE.h * 3} height="15" fill="var(--blue-bg-3)" />
        <rect x={sx(PLANE.y)} y="364" width={PLANE.h * 3} height="20" fill="var(--fig-box)" />
        {slot ? (
          <g>
            <rect x={sx(PLANE.y)} y="360" width={gapA - sx(PLANE.y)} height="4" fill={COPPER} />
            <rect x={gapB} y="360" width={sx(PLANE.y + PLANE.h) - gapB} height="4" fill={COPPER} />
            <rect x={gapA} y="357" width={gapB - gapA} height="10" fill="none" stroke="var(--red)" strokeDasharray="4 3" />
            <T x={CUT_X} y={379} size={10} color="var(--red-2)">
              {t(RET_LBL.slot)}
            </T>
          </g>
        ) : (
          <rect x={sx(PLANE.y)} y="360" width={PLANE.h * 3} height="4" fill={COPPER} />
        )}
        <rect x={CUT_X - 9} y="341" width="18" height="4" fill={COPPER} />
        <circle cx={CUT_X} cy={331} r="5" fill="none" stroke="var(--text)" strokeWidth="1.4" />
        <circle cx={CUT_X} cy={331} r="1.6" fill="var(--text)" />
        <T x={CUT_X + 12} y={334} anchor="start" size={10}>
          {t(RET_LBL.signal)}
        </T>
        <path d={`M${CUT_X + 28} 345 V360 M${CUT_X + 24} 345 H${CUT_X + 32} M${CUT_X + 24} 360 H${CUT_X + 32}`} stroke="var(--text-2)" strokeWidth="1" fill="none" />
        <T x={CUT_X + 36} y={356} anchor="start" size={10} color="var(--text-2)">
          h
        </T>
        <T x={sx(PLANE.y) + 6} y={356} anchor="start" size={9} color="var(--text-2)">
          {t(RET_LBL.dielectric)}
        </T>
        <T x={sx(PLANE.y) + 6} y={377} anchor="start" size={9} color="var(--text-2)">
          {t(RET_LBL.gnd)}
        </T>
        <path d={densityPath(lanes, sigma)} fill="var(--sky)" fillOpacity="0.35" stroke="var(--sky)" strokeWidth="1.4" />
        <path d={`M${sx(PLANE.y)} ${BASE} H${sx(PLANE.y + PLANE.h)}`} stroke="var(--dim)" strokeWidth="1" />
        <T x={CUT_X} y={458} size={10} color="var(--text-2)">
          {t(RET_LBL.density)}
        </T>
      </svg>
      <figcaption>{t(RET_LBL.cap)}</figcaption>
    </figure>
  )
}

type Props = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

export function ReturnSection({ onOpen, setNote }: Props) {
  const { t } = useLocale()
  const reduced = useReducedMotion()
  const [plane, setPlane] = useState<PlaneId>(PLANES[0].id)
  const [freq, setFreq] = useState<FreqId>(FREQS[0].id)
  const [paused, setPaused] = useState(false)
  const lanes = buildLanes(plane, freq)
  const text = RETURN_TEXT[`${plane}-${freq}`]
  const report = (p: PlaneId, f: FreqId) => {
    const next = RETURN_TEXT[`${p}-${f}`]
    setNote({ kicker: S.kickerReturn, title: next.title, text: next.text })
  }
  const state = plane === 'slot' && freq === 'high' ? 'fail' : plane === 'solid' && freq === 'high' ? 'pass' : undefined
  return (
    <Section title={t(S.returnTitle)} note={t(S.returnNote)}>
      <div className="pcbLayout-ctrl">
        <Seg
          options={PLANES}
          value={plane}
          onChange={(id) => {
            setPlane(id)
            report(id, freq)
          }}
        />
        <Seg
          options={FREQS}
          value={freq}
          onChange={(id) => {
            setFreq(id)
            report(plane, id)
          }}
        />
        {reduced ? null : (
          <button type="button" className="lab__btn" onClick={() => setPaused((v) => !v)}>
            {t(paused ? RET_LBL.play : RET_LBL.pause)}
          </button>
        )}
      </div>
      <ReturnFig plane={plane} freq={freq} animate={!reduced && !paused} />
      <Readout
        items={[
          { label: RET_LBL.rdArea, value: `${(weightedArea(lanes) / REF_AREA).toFixed(1)} ×`, state },
          { label: RET_LBL.rdLen, value: `${(weightedLength(lanes) / REF_LEN).toFixed(2)} ×`, state },
          { label: RET_LBL.rdUnder, value: `${Math.round(underShare(lanes) * 100)} %`, state },
        ]}
      />
      <Callout tone={text.tone}>
        <p>
          <b>{t(text.title)}</b>
        </p>
        <RefP text={text.text} onOpen={onOpen} />
      </Callout>
      <Related ids={['pcbStack', 'pcbBasics', 'pMeasure']} onOpen={onOpen} />
    </Section>
  )
}
