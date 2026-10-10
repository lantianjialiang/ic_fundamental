import { loc, type LText } from '../../i18n/locale'

type T = (text: LText | string) => string

export function FfFig({ t }: { t: T }) {
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img">
        <rect width="680" height="250" rx="6" fill="#0d1117" />
        <text x="70" y="70" fill="#8b949e" fontSize="13">
          D
        </text>
        <line x1="88" y1="66" x2="170" y2="66" stroke="#58a6ff" strokeWidth="2" />
        <text x="70" y="150" fill="#8b949e" fontSize="13">
          CLK
        </text>
        <line x1="88" y1="146" x2="170" y2="146" stroke="#e8c45a" strokeWidth="2" />
        <rect x="170" y="36" width="130" height="150" rx="4" fill="#191e24" stroke="#58a6ff" />
        <text x="235" y="100" textAnchor="middle" fill="#e6edf3" fontSize="16">
          FF
        </text>
        <text x="235" y="124" textAnchor="middle" fill="#8b949e" fontSize="12">
          Flip-Flop
        </text>
        <polygon points="170,136 186,146 170,156" fill="none" stroke="#e8c45a" />
        <line x1="300" y1="80" x2="390" y2="80" stroke="#3fb950" strokeWidth="2" />
        <text x="400" y="84" fill="#3fb950" fontSize="13">
          Q
        </text>
        <text x="500" y="56" fill="#8b949e" fontSize="12">
          CLK
        </text>
        <path d="M 460 70 H 500 V 48 H 560" fill="none" stroke="#e8c45a" strokeWidth="1.6" />
        <text x="500" y="120" fill="#8b949e" fontSize="12">
          D
        </text>
        <path d="M 460 150 H 500 V 110 H 560" fill="none" stroke="#58a6ff" strokeWidth="1.6" />
        <text x="500" y="186" fill="#8b949e" fontSize="12">
          Q
        </text>
        <path d="M 460 210 H 520 V 170 H 560" fill="none" stroke="#3fb950" strokeWidth="1.6" />
        <text x="340" y="236" textAnchor="middle" fill="#8b949e" fontSize="12">
          {t(loc('CLK 沿：Q ← D。平时 Q 保持。这就是 1 位状态。'))}
        </text>
      </svg>
      <figcaption>{t(loc('边沿触发，不是组合门。Scan FF 只是在 D 前加一个 2 选 1。'))}</figcaption>
    </figure>
  )
}

export function ScanFfFig({ t }: { t: T }) {
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 220" className="term-fig__svg" role="img">
        <rect width="680" height="220" rx="6" fill="#0d1117" />
        <text x="36" y="58" fill="#8b949e" fontSize="12">
          D
        </text>
        <text x="36" y="118" fill="#79c0ff" fontSize="12">
          SI
        </text>
        <text x="36" y="170" fill="#e8c45a" fontSize="12">
          SE
        </text>
        <line x1="60" y1="54" x2="150" y2="54" stroke="#8b949e" strokeWidth="1.6" />
        <line x1="60" y1="114" x2="150" y2="114" stroke="#79c0ff" strokeWidth="1.6" />
        <line x1="60" y1="166" x2="190" y2="166" stroke="#e8c45a" strokeWidth="1.6" />
        <path d="M 150 30 L 210 54 L 150 78 Z" fill="#191e24" stroke="#58a6ff" />
        <text x="168" y="58" fill="#e6edf3" fontSize="11">
          MUX
        </text>
        <line x1="210" y1="54" x2="270" y2="54" stroke="#58a6ff" strokeWidth="2" />
        <rect x="270" y="24" width="110" height="140" rx="4" fill="#191e24" stroke="#58a6ff" />
        <text x="325" y="90" textAnchor="middle" fill="#e6edf3" fontSize="15">
          FF
        </text>
        <text x="325" y="112" textAnchor="middle" fill="#8b949e" fontSize="11">
          CLK
        </text>
        <line x1="380" y1="70" x2="470" y2="70" stroke="#3fb950" strokeWidth="2" />
        <text x="480" y="74" fill="#3fb950" fontSize="13">
          Q / SO
        </text>
        <text x="500" y="130" fill="#8b949e" fontSize="12">
          {t(loc('SE=0 走功能 D'))}
        </text>
        <text x="500" y="152" fill="#79c0ff" fontSize="12">
          {t(loc('SE=1 走 SI'))}
        </text>
        <text x="340" y="200" textAnchor="middle" fill="#8b949e" fontSize="12">
          {t(loc('Scan FF = MUX + 普通 FF。串起来就是链。'))}
        </text>
      </svg>
      <figcaption>{t(loc('Muxed-D：工业界最常见的扫描触发器。'))}</figcaption>
    </figure>
  )
}
