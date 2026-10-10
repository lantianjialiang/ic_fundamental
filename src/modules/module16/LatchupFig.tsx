import { loc, type LText } from '../../i18n/locale'
import { type WordId } from './data/content'

type T = (text: LText | string) => string

const CAPTION: Record<WordId, LText> = {
  parasitic: loc('彩色这四层不是你画的晶体管，是 CMOS 必然长出来的。'),
  p: loc('暖色是 P：上面 P+ 接 VDD，下面整块是 P 衬底。'),
  n: loc('冷色是 N：中间 N 阱，底部 N+ 接地。'),
  pnp: loc('P+ → N 阱 → P 衬底。这就是寄生 PNP。'),
  npn: loc('N+ → P 衬底 → N 阱。这就是寄生 NPN。'),
  pnpn: loc('从 VDD 的 P+ 走到 GND 的 N+：P–N–P–N 四层。'),
  scr: loc('四层导通 = 晶闸管。电源自己供电流，改输入不一定熄。'),
  fb: loc('PNP 的电流喂 NPN，NPN 再喂 PNP。环路锁住。'),
  hold: loc('触发电流点着；维持电流让它不灭。掉电是为了切断维持。'),
}

export function LatchupFig({ word, t }: { word: WordId; t: T }) {
  const pOn = word === 'p' || word === 'pnp' || word === 'pnpn' || word === 'scr' || word === 'parasitic'
  const nOn = word === 'n' || word === 'npn' || word === 'pnpn' || word === 'scr' || word === 'parasitic'
  const pnpOn = word === 'pnp' || word === 'pnpn' || word === 'scr' || word === 'fb' || word === 'hold'
  const npnOn = word === 'npn' || word === 'pnpn' || word === 'scr' || word === 'fb' || word === 'hold'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 280" className="term-fig__svg" role="img" aria-label={t(CAPTION[word])}>
        <rect width="680" height="280" rx="6" fill="var(--well)" />
        <rect x="40" y="28" width="400" height="28" fill="var(--red-bg)" stroke="var(--red)" />
        <text x="240" y="47" textAnchor="middle" fill="var(--red)" fontSize="13">
          VDD
        </text>
        <rect
          x="40"
          y="56"
          width="120"
          height="40"
          fill={pOn || pnpOn ? 'var(--red-line)' : 'var(--fig-box-2)'}
          stroke="var(--gold)"
        />
        <text x="100" y="81" textAnchor="middle" fill="var(--text)" fontSize="12">
          P+
        </text>
        <rect
          x="40"
          y="96"
          width="400"
          height="56"
          fill={nOn || pnpOn ? 'var(--blue-bg)' : 'var(--fig-box-2)'}
          stroke="var(--blue)"
        />
        <text x="160" y="129" textAnchor="middle" fill="var(--sky)" fontSize="13">
          N 阱
        </text>
        <rect
          x="40"
          y="152"
          width="400"
          height="56"
          fill={pOn || npnOn ? 'var(--orange-bg)' : 'var(--fig-box-2)'}
          stroke="var(--gold)"
        />
        <text x="160" y="185" textAnchor="middle" fill="var(--gold)" fontSize="13">
          P 衬底
        </text>
        <rect
          x="320"
          y="208"
          width="120"
          height="36"
          fill={nOn || npnOn ? 'var(--blue-bg)' : 'var(--fig-box-2)'}
          stroke="var(--blue)"
        />
        <text x="380" y="231" textAnchor="middle" fill="var(--text)" fontSize="12">
          N+
        </text>
        <rect x="40" y="244" width="400" height="22" fill="var(--fig-box)" stroke="var(--muted)" />
        <text x="240" y="260" textAnchor="middle" fill="var(--muted)" fontSize="12">
          GND
        </text>
        <text x="470" y="80" fill={pnpOn ? 'var(--gold)' : 'var(--dim)'} fontSize="13">
          PNP
        </text>
        <path
          d="M 160 76 C 500 70 500 170 200 180"
          fill="none"
          stroke={pnpOn ? 'var(--gold)' : 'var(--line)'}
          strokeWidth="1.8"
        />
        <text x="470" y="210" fill={npnOn ? 'var(--sky)' : 'var(--dim)'} fontSize="13">
          NPN
        </text>
        <path
          d="M 380 226 C 560 220 560 120 240 124"
          fill="none"
          stroke={npnOn ? 'var(--sky)' : 'var(--line)'}
          strokeWidth="1.8"
        />
        <text x="520" y="140" fill="var(--muted)" fontSize="12">
          Rwell
        </text>
        <text x="520" y="168" fill="var(--muted)" fontSize="12">
          Rsub
        </text>
        {word === 'fb' || word === 'hold' || word === 'scr' ? (
          <text x="560" y="40" fill="var(--red)" fontSize="12">
            {t(loc('正反馈锁住'))}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(CAPTION[word])}</figcaption>
    </figure>
  )
}
