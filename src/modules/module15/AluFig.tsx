import { loc, type LText } from '../../i18n/locale'

type T = (text: LText | string) => string

export function AluFig({ t }: { t: T }) {
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 240" className="term-fig__svg" role="img">
        <rect width="680" height="240" rx="6" fill="#0d1117" />
        <text x="36" y="58" fill="#79c0ff" fontSize="13">
          A[3:0]
        </text>
        <text x="36" y="98" fill="#79c0ff" fontSize="13">
          B[3:0]
        </text>
        <text x="36" y="138" fill="#e8c45a" fontSize="13">
          OP[2:0]
        </text>
        <line x1="100" y1="54" x2="210" y2="54" stroke="#79c0ff" strokeWidth="2" />
        <line x1="100" y1="94" x2="210" y2="94" stroke="#79c0ff" strokeWidth="2" />
        <line x1="100" y1="134" x2="210" y2="134" stroke="#e8c45a" strokeWidth="2" />
        <rect x="210" y="28" width="220" height="160" rx="6" fill="#191e24" stroke="#58a6ff" />
        <text x="320" y="100" textAnchor="middle" fill="#e6edf3" fontSize="22">
          ALU
        </text>
        <text x="320" y="128" textAnchor="middle" fill="#8b949e" fontSize="12">
          4-bit
        </text>
        <line x1="430" y1="70" x2="540" y2="70" stroke="#3fb950" strokeWidth="2" />
        <line x1="430" y1="130" x2="540" y2="130" stroke="#3fb950" strokeWidth="2" />
        <text x="550" y="74" fill="#3fb950" fontSize="13">
          Y[3:0]
        </text>
        <text x="550" y="134" fill="#3fb950" fontSize="13">
          Carry
        </text>
        <text x="320" y="214" textAnchor="middle" fill="#8b949e" fontSize="12">
          {t(loc('输入：两个操作数 + 操作码。输出：结果和进位。'))}
        </text>
      </svg>
      <figcaption>{t(loc('先认端口。后面每条向量都是给 A / B / OP，比 Y / Carry。'))}</figcaption>
    </figure>
  )
}

export function AluTimingFig({
  period,
  drive,
  tpd,
  strobe,
}: {
  period: number
  drive: number
  tpd: number
  strobe: number
}) {
  const span = Math.max(period + 6, 24)
  const X0 = 70
  const X1 = 660
  const xAt = (ns: number) => X0 + (Math.min(Math.max(ns, 0), span) / span) * (X1 - X0)
  const settle = drive + tpd
  return (
    <svg viewBox="0 0 680 200" className="sim-wave" role="img">
      <rect width="680" height="200" rx="6" fill="#0d1117" />
      <text x="12" y="40" fill="#8b949e" fontSize="11">
        A/B/OP
      </text>
      <text x="12" y="100" fill="#3fb950" fontSize="11">
        Y
      </text>
      <path
        d={`M ${xAt(0)} 52 H ${xAt(drive)} V 28 H ${xAt(span)}`}
        fill="none"
        stroke="#79c0ff"
        strokeWidth="2"
      />
      <path
        d={`M ${xAt(0)} 112 H ${xAt(settle)} V 88 H ${xAt(span)}`}
        fill="none"
        stroke="#3fb950"
        strokeWidth="2"
      />
      <line x1={xAt(drive)} y1="16" x2={xAt(drive)} y2="150" stroke="#79c0ff" strokeDasharray="3 3" />
      <text x={xAt(drive) + 4} y="26" fill="#79c0ff" fontSize="11">
        Drive {drive}
      </text>
      <line x1={xAt(settle)} y1="16" x2={xAt(settle)} y2="150" stroke="#3fb950" strokeDasharray="3 3" />
      <text x={xAt(settle) + 4} y="46" fill="#3fb950" fontSize="11">
        tpd {tpd}
      </text>
      <line x1={xAt(strobe)} y1="16" x2={xAt(strobe)} y2="150" stroke="#e8c45a" strokeWidth="1.8" />
      <text x={xAt(strobe) + 4} y="66" fill="#e8c45a" fontSize="11">
        Strobe {strobe}
      </text>
      <line x1={xAt(period)} y1="16" x2={xAt(period)} y2="150" stroke="#8b949e" strokeDasharray="4 4" />
      <text x={xAt(period) + 4} y="160" fill="#8b949e" fontSize="11">
        Period {period}
      </text>
      <text x={X0} y="188" fill="#6e7681" fontSize="11">
        0 ns
      </text>
    </svg>
  )
}
