import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Rig, type SuspectId } from './data/debug'

const L = {
  prog: loc('测试程序', 'Test program'),
  progSub: loc('存在测试机内存里', 'Stored in tester memory'),
  tester: loc('测试机', 'Tester'),
  pe: loc('Pin Electronics / PMU', 'Pin Electronics / PMU'),
  iface: loc('接口硬件', 'Interface hardware'),
  board: loc('负载板', 'Load board'),
  socket: loc('插座', 'Socket'),
  empty: loc('空座', 'Empty'),
  std: loc('标准品', 'Std'),
  removed: loc('已拆下', 'removed'),
  cap: loc('四个嫌疑对象，从测试程序到芯片排成一条链。点任意一块看它的解释。', 'The four suspects form a chain from the test program to the device. Click any block to see its explanation.'),
  capRig: loc('当前这次实验的配置：灰色虚线表示被拿掉的部分。', 'Setup for the current experiment: gray dashed lines mark removed parts.'),
}

export function DebugFig({
  active,
  rig,
  onPick,
}: {
  active?: SuspectId
  rig?: Rig
  onPick?: (id: SuspectId) => void
}) {
  const { t } = useLocale()
  const on = (id: SuspectId) => active === id
  const stroke = (id: SuspectId) => (on(id) ? 'var(--gold)' : 'var(--line-2)')
  const ifaceOn = rig ? rig.iface : true
  const dutState = rig ? (rig.iface ? rig.dut : 'none') : 'bad'
  const click = (id: SuspectId) => (onPick ? { onClick: () => onPick(id), style: { cursor: 'pointer' } } : {})
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 230" className="term-fig__svg" role="img" aria-label={t(rig ? L.capRig : L.cap)}>
        <rect width="680" height="230" rx="10" fill="var(--well)" />
        {/* 测试程序 */}
        <g {...click('prog')}>
          <rect x="24" y="18" width="170" height="54" rx="8" fill={on('prog') ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={stroke('prog')} strokeWidth="2" />
          <text x="109" y="41" textAnchor="middle" fill="var(--text)" fontSize="14">
            {t(L.prog)}
          </text>
          <text x="109" y="60" textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(L.progSub)}
          </text>
        </g>
        <line x1="109" y1="72" x2="109" y2="104" stroke="var(--line-2)" strokeWidth="2" />
        <path d="M103 98 L109 106 L115 98" fill="none" stroke="var(--line-2)" strokeWidth="2" />
        {/* 测试机 */}
        <g {...click('tester')}>
          <rect x="24" y="108" width="170" height="90" rx="8" fill={on('tester') ? 'var(--gold-bg)' : 'var(--blue-bg)'} stroke={on('tester') ? 'var(--gold)' : 'var(--blue)'} strokeWidth="2" />
          <text x="109" y="138" textAnchor="middle" fill="var(--text)" fontSize="14">
            {`${t(L.tester)}${rig ? ` ${rig.tester}` : ''}`}
          </text>
          <text x="109" y="160" textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(L.pe)}
          </text>
        </g>
        {/* 接口硬件 */}
        <g {...click('iface')} opacity={ifaceOn ? 1 : 0.45}>
          <rect
            x="214"
            y="92"
            width="330"
            height="122"
            rx="10"
            fill="none"
            stroke={stroke('iface')}
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text x="226" y="208" fill={on('iface') ? 'var(--gold)' : 'var(--muted)'} fontSize="12">
            {ifaceOn ? t(L.iface) : `${t(L.iface)} · ${t(L.removed)}`}
          </text>
          {/* Pogo */}
          {[128, 146, 164, 182].map((y) => (
            <line key={y} x1="194" y1={y} x2="240" y2={y} stroke={ifaceOn ? 'var(--text-2)' : 'var(--dim)'} strokeWidth="2" strokeDasharray={ifaceOn ? undefined : '4 4'} />
          ))}
          <text x="217" y="120" textAnchor="middle" fill="var(--muted)" fontSize="11">
            Pogo
          </text>
          <rect x="240" y="118" width="190" height="74" rx="6" fill={ifaceOn ? 'var(--green-bg)' : 'none'} stroke={ifaceOn ? 'var(--green-line)' : 'var(--dim)'} strokeDasharray={ifaceOn ? undefined : '4 4'} />
          <text x="335" y="160" textAnchor="middle" fill="var(--text-2)" fontSize="13">
            {t(L.board)}
          </text>
          <rect x="440" y="110" width="94" height="90" rx="6" fill={ifaceOn ? 'var(--fig-box-2)' : 'none'} stroke={ifaceOn ? 'var(--line-2)' : 'var(--dim)'} strokeDasharray={ifaceOn ? undefined : '4 4'} />
          <text x="487" y="126" textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(L.socket)}
          </text>
        </g>
        {/* DUT */}
        <g {...click('dut')}>
          {dutState === 'none' ? (
            <>
              <rect x="458" y="136" width="58" height="50" rx="4" fill="none" stroke="var(--dim)" strokeDasharray="4 4" />
              <text x="487" y="166" textAnchor="middle" fill="var(--dim)" fontSize="11">
                {t(L.empty)}
              </text>
            </>
          ) : (
            <>
              <rect
                x="458"
                y="136"
                width="58"
                height="50"
                rx="4"
                fill={on('dut') ? 'var(--gold-bg)' : dutState === 'std' ? 'var(--green-bg)' : 'var(--fig-box)'}
                stroke={on('dut') ? 'var(--gold)' : dutState === 'std' ? 'var(--green)' : 'var(--text-2)'}
                strokeWidth="2"
              />
              <text x="487" y="166" textAnchor="middle" fill="var(--text)" fontSize="12">
                {dutState === 'std' ? t(L.std) : 'DUT'}
              </text>
            </>
          )}
        </g>
        <line x1="534" y1="161" x2="600" y2="161" stroke="var(--line)" strokeDasharray="3 4" />
        <text x="604" y="165" fill="var(--muted)" fontSize="11">
          {`IIH ≤ 1 µA`}
        </text>
      </svg>
      <figcaption>{t(rig ? L.capRig : L.cap)}</figcaption>
    </figure>
  )
}
