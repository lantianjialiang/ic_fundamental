import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { COLOR } from './FabFigs'
import { Chip } from './FabTop'
import { ETCH, type EtchLayer, type EtchResult, etchCheck } from './data/pcbFabRules'

const L = {
  cap: loc('蚀刻后线路的横截面，按真实比例画，1 µm = 1 像素。', 'Cross-section of the etched traces at true scale, 1 µm = 1 pixel.'),
  film: loc('干膜轮廓（蚀刻时盖在铜上）', 'Dry-film outline (over the copper while etching)'),
  bridge: loc('红色：线距里残留的铜桥', 'Red: copper bridge left in the gap'),
}

const BASE = 160

export function EtchFig({ layer, w, s, comp }: { layer: EtchLayer; w: number; s: number; comp: boolean }) {
  const { t } = useLocale()
  const r = etchCheck(layer, w, s, comp)
  const filmT = ETCH.film[layer]
  const gap = Math.max(r.sf, 0)
  const total = 2 * r.wf + gap
  const x0 = (760 - total) / 2
  const xs = [x0, x0 + r.wf + gap]
  const fill = r.trace === 'ok' ? COLOR.cu : r.trace === 'weak' ? '#e0903f' : '#d4543f'
  const bridgeH = Math.min(r.t * 0.5, 14)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 240" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="760" height="240" rx="10" fill="var(--well)" />
        <rect x="20" y={BASE} width="720" height="26" fill={COLOR.core} />
        {xs.map((x, i) => (
          <g key={i}>
            <rect x={x} y={BASE - r.t - filmT} width={r.wf} height={filmT} fill="none" stroke={COLOR.film} strokeWidth="1.4" strokeDasharray="5 3" />
            {r.wt > 0 ? (
              <polygon points={`${x},${BASE} ${x + r.wf},${BASE} ${x + r.wf - r.u},${BASE - r.t} ${x + r.u},${BASE - r.t}`} fill={fill} />
            ) : (
              <rect x={x} y={BASE - r.t} width={r.wf} height={r.t} fill="none" stroke="#d4543f" strokeWidth="1.4" strokeDasharray="3 3" />
            )}
            <text x={x + r.wf / 2} y={BASE - r.t - filmT - 8} textAnchor="middle" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
              {i === 0 ? 'W' : "W'"}
            </text>
          </g>
        ))}
        {r.space === 'short' ? <rect x={xs[0] + r.wf - 1} y={BASE - bridgeH} width={gap + 2} height={bridgeH} fill="#d4543f" stroke="#ffa198" /> : null}
        {r.wt > 0 ? (
          <text x={xs[0] - 6} y={BASE - r.t / 2 + 4} textAnchor="end" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
            u
          </text>
        ) : null}
        <g stroke="var(--text-2)" strokeWidth="1.2">
          <line x1={xs[0] + r.wf} y1={BASE + 40} x2={xs[1]} y2={BASE + 40} />
          <line x1={xs[0] + r.wf} y1={BASE + 34} x2={xs[0] + r.wf} y2={BASE + 46} />
          <line x1={xs[1]} y1={BASE + 34} x2={xs[1]} y2={BASE + 46} />
        </g>
        <text x={(xs[0] + r.wf + xs[1]) / 2} y={BASE + 60} textAnchor="middle" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {`S = ${gap.toFixed(0)} µm`}
        </text>
        <rect x="20" y="14" width="22" height="12" fill="none" stroke={COLOR.film} strokeWidth="1.4" strokeDasharray="5 3" />
        <Chip x={52} y={25} text={t(L.film)} anchor="start" />
        {r.space === 'short' ? <Chip x={430} y={25} text={t(L.bridge)} anchor="start" /> : null}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}

const f0 = (n: number) => n.toFixed(0)

type Verdict = { tone: 'ok' | 'warn' | 'bad'; text: LText }

export function etchVerdicts(r: EtchResult, w: number, comp: boolean): Verdict[] {
  const u = f0(r.u)
  const sMin = f0(r.minS - (comp ? 2 * r.u : 0))
  const out: Verdict[] = []
  if (r.trace === 'open') {
    out.push({
      tone: 'bad',
      text: loc(
        `线顶只剩 ${f0(r.wt)} µm，低于 ${ETCH.floor / 2} µm：侧蚀把线吃掉了大半，线路会断开。原因：每边侧蚀 ${u} µm（铜厚 ${r.t} µm ÷ 蚀刻因子 ${ETCH.factor}），线不够宽，经不起这样的损失。`,
        `Only ${f0(r.wt)} µm of trace top is left, under ${ETCH.floor / 2} µm: undercut has eaten most of the line, so it opens. Reason: ${u} µm is lost per side (copper ${r.t} µm ÷ etch factor ${ETCH.factor}) and the line is not wide enough to spare it.`,
      ),
    })
  } else if (r.trace === 'weak') {
    out.push({
      tone: 'warn',
      text: loc(
        `线顶 ${f0(r.wt)} µm，低于能稳定量产的 ${ETCH.floor} µm：容易出现局部断线或线路翘起，良率会下降。原因：每边侧蚀 ${u} µm。`,
        `Trace top is ${f0(r.wt)} µm, below the ${ETCH.floor} µm that runs reliably: local breaks or lifting become likely and yield drops. Reason: ${u} µm lost per side.`,
      ),
    })
  } else {
    out.push({
      tone: 'ok',
      text: loc(
        `线顶 ${f0(r.wt)} µm，不低于 ${ETCH.floor} µm：线路完好，每边 ${u} µm 的侧蚀被线宽吸收了。`,
        `Trace top is ${f0(r.wt)} µm, at least ${ETCH.floor} µm: the trace is sound, and ${u} µm per side of undercut is absorbed by its width.`,
      ),
    })
  }
  if (r.space === 'short') {
    out.push({
      tone: 'bad',
      text: loc(
        `干膜之间的缝只有 ${f0(r.sf)} µm，小于这一层需要的 ${sMin} µm：显影液和蚀刻液都换不进去，底部的铜蚀不掉，留下的铜桥把相邻线路短路。`,
        `The gap in the film is only ${f0(r.sf)} µm, under the ${sMin} µm this layer needs: neither developer nor etchant can exchange in it, copper at the bottom is not cleared, and the bridge shorts the traces.`,
      ),
    })
  } else {
    out.push({
      tone: 'ok',
      text: loc(
        `${f0(r.sf)} µm 的缝足够药液进出，底部的铜能蚀干净。`,
        `A gap of ${f0(r.sf)} µm is wide enough for the chemistry to get in and clear the copper at the bottom.`,
      ),
    })
  }
  out.push({
    tone: 'warn',
    text: comp
      ? loc(
          `工厂把线加宽 ${f0(2 * r.u)} µm 来抵消侧蚀，让线顶回到 ${w} µm；代价是干膜之间的缝同样缩小 ${f0(2 * r.u)} µm，所以最小线距升到 ${f0(r.minS)} µm。`,
          `The fab widens the line by ${f0(2 * r.u)} µm to cancel the undercut, bringing the top back to ${w} µm; the price is that the gap in the film shrinks by the same ${f0(2 * r.u)} µm, which raises the minimum space to ${f0(r.minS)} µm.`,
        )
      : loc(
          `不做补偿时，线顶比设计窄 ${f0(2 * r.u)} µm，线越细损失占比越大；工厂通常提前把线路加宽，代价是线距变紧。`,
          `Without compensation the top is ${f0(2 * r.u)} µm narrower than designed, and the thinner the line the bigger the loss; fabs usually widen the artwork in advance and pay for it in space.`,
        ),
  })
  return out
}
