import { loc } from '../../../i18n/locale'
import { type AnaKnowledge } from '../../ana/knowledge/types'
import { type ModuleId } from '../../catalog'

const lesson = 'picMod' as ModuleId

/** PIC-04 马赫-曾德尔调制器、消光比、OMA、光电探测器 */
export const PIC_MOD_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-mzm',
      term: 'Mach-Zehnder modulator',
      name: loc('马赫-曾德尔调制器（MZM）', 'Mach-Zehnder modulator (MZM)'),
      def: loc(
        '用两臂的相位差调制光功率：P = (P0/2)·(1 + cos(πV/Vπ + φ0))。正交点 φ0 = -π/2，V = 0 时输出为 P0/2。它和更小、但对温度敏感的环调制器不能互换。见 {@picMod}。',
        'Optical power is modulated by the phase difference of two arms: P = (P0/2) * (1 + cos(pi V/Vpi + phi0)). Quadrature is phi0 = -pi/2, and the output at V = 0 is P0/2. It is not interchangeable with a smaller, thermally sensitive ring modulator. See {@picMod}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-er',
      term: 'Extinction ratio',
      name: loc('消光比（ER）', 'Extinction ratio (ER)'),
      def: loc(
        'ER = 10·log10(P1/P0)，P1 和 P0 是驱动高低电平的光功率。低电平为 0 时 ER 为无穷大。偏置离开正交点后，同样的驱动拉开的比值变小，ER 下降。见 {@picMod}。',
        'ER = 10 log10(P1/P0), where P1 and P0 are the optical powers of the high and low drive levels. ER is infinite when the low level is 0. Off quadrature the same drive opens a smaller ratio, so ER falls. See {@picMod}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-oma',
      term: 'Optical modulation amplitude',
      name: loc('光调制幅度（OMA）', 'Optical modulation amplitude (OMA)'),
      def: loc(
        'OMA = P1 − P0，和功率同一单位，不是比值。灵敏度看 OMA。有限消光比抬高的是达到同一 OMA 所需的平均功率。正交点上 Vpp = Vπ 时，电平落到 P0 和 0，OMA 等于输入 P0。见 {@picMod} 和 {@picLink}。',
        'OMA = P1 − P0, in the same unit as power. It is not a ratio. Sensitivity is specified on OMA. A finite extinction ratio raises the average power needed to hold the same OMA. At quadrature with Vpp = Vπ the levels land on P0 and 0, so OMA equals the input P0. See {@picMod} and {@picLink}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-pd',
      term: 'Photodetector',
      name: loc('光电探测器（PD）', 'Photodetector (PD)'),
      def: loc(
        '把光功率变成电流：I = R·P + I_dark。响应度 R 的单位是 A/W。-10 dBm、0.8 A/W 时的光电流是 80 µA，暗电流以 nA 叠加上去。见 {@picMod}。',
        'Turns optical power into current: I = R*P + I_dark. Responsivity R is in A/W. At -10 dBm and 0.8 A/W the photocurrent is 80 µA, and dark current adds on top in nanoamperes. See {@picMod}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    'sns-responsivity': [lesson],
  },
  faqs: [
    {
      id: 'pic-mod-quadrature',
      q: loc('偏置离开正交点后，消光比为什么会变差？', 'Why does the extinction ratio get worse when the bias leaves quadrature?'),
      a: loc(
        '正交点 φ0 = -π/2 落在余弦最陡的地方，同样的 Vpp 能拉开最大的 P1 和 P0。漂向峰值或零点后，两个驱动点的功率差变小，ER = 10·log10(P1/P0) 下降。满摆幅 ±Vπ/2 才走到 0 和 P0，那时 ER 为无穷大。见 {@picMod}。',
        'Quadrature, phi0 = -pi/2, sits where the cosine is steepest, so a given Vpp opens the largest gap between P1 and P0. Drift toward the peak or the null shrinks that gap, and ER = 10 log10(P1/P0) falls. Only a full swing of plus or minus Vpi/2 reaches 0 and P0, where ER is infinite. See {@picMod}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-mod-ring-mzm',
      q: loc('环调制器能不能换掉 MZM？', 'Can a ring modulator replace an MZM?'),
      a: loc(
        '不能直接换。环的面积小、电容小，但谐振跟着温度走，波长和偏置都要锁。MZM 靠两臂干涉，驱动电压往往更高，工作点却宽得多。测试项目、热控和驱动电路都不一样。见 {@picMod}。',
        'Not as a drop-in replacement. The ring is small and has little capacitance, but the resonance follows temperature, so both wavelength and bias have to be locked. The MZM uses interference of two arms. It often needs a higher drive, but the operating point is much wider. The test list, the thermal control and the driver are different. See {@picMod}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-mod-dark-overdrive',
      q: loc('给 PD 加更大的反向偏置，暗电流能不能压下去？', 'Does a larger reverse bias on the PD push the dark current down?'),
      a: loc(
        '压不下去。反向偏置（过驱动）加宽耗尽区，带宽往往上去，暗电流通常也变大。−10 dBm、0.8 A/W 的光电流是 80 µA，暗电流以 nA 叠加上去；偏置是带宽和漏电的折中，不是把暗电流拧小的旋钮。见 {@picMod}。',
        'No. Reverse bias (overdrive) widens the depletion region, so bandwidth usually rises and dark current usually rises with it. At −10 dBm and 0.8 A/W the photocurrent is 80 µA, and dark current adds on top in nanoamperes. Bias trades bandwidth for leakage; it is not a knob that shrinks dark current. See {@picMod}.',
      ),
      lessons: [lesson],
    },
  ],
}
