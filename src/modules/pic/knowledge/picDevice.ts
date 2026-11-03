import { loc } from '../../../i18n/locale'
import { type AnaKnowledge } from '../../ana/knowledge/types'
import { type ModuleId } from '../../catalog'

const lesson = 'picDevice' as ModuleId

/** PIC-03 MZI、微环、自由光谱范围、临界耦合 */
export const PIC_DEVICE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-mzi',
      term: 'Mach-Zehnder interferometer',
      name: loc('马赫-曾德尔干涉仪（MZI）', 'Mach-Zehnder interferometer (MZI)'),
      def: loc(
        '把光分成两路，走不同的长度再合上。功率透射 T = cos²(Δφ/2)，Δφ = 2π·neff·ΔL/λ。FSR = λ² / (ng·ΔL)，用 ng。见 {@picDevice}。',
        'Light is split into two paths of different length and combined again. Power transmission is T = cos^2(dphi/2), with dphi = 2 pi neff dL / lambda. FSR = lambda^2 / (ng dL), using ng. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-ring',
      term: 'Ring resonator',
      name: loc('环形谐振器', 'Ring resonator'),
      def: loc(
        '光在周长 L = 2πR 的环里绕圈。全通型在谐振处 T = (a - r)² / (1 - ar)²。FSR = λ² / (ng·L)。Q = λ0 / FWHM。见 {@picDevice}。',
        'Light circulates around a ring of length L = 2 pi R. An all-pass ring has T = (a - r)^2 / (1 - ar)^2 at resonance. FSR = lambda^2 / (ng L). Q = lambda0 / FWHM. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-fsr',
      term: 'Free spectral range',
      name: loc('自由光谱范围（FSR）', 'Free spectral range (FSR)'),
      def: loc(
        '相邻两个透射峰的波长间隔，FSR = λ² / (ng·L)。分母是群折射率 ng 和路径长度，不是 neff。路径越长，FSR 越小。见 {@picDevice}。',
        'The wavelength spacing between two neighboring transmission peaks, FSR = lambda^2 / (ng L). The denominator is the group index ng and the path length, not neff. A longer path makes a smaller FSR. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-critical',
      term: 'Critical coupling',
      name: loc('临界耦合', 'Critical coupling'),
      def: loc(
        '环的单圈幅度透过率 a 等于自耦合系数 r。谐振处两路光抵消，透射为 0。|a - r| 很小时坑很深；差得远则消光比不够。见 {@picDevice}。',
        'The ring round-trip amplitude a equals the self-coupling r. The two paths cancel at resonance and the transmission is 0. A very small |a - r| makes a deep dip; a large gap leaves a poor extinction ratio. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-resonator-q',
      term: 'Resonator quality factor',
      name: loc('谐振品质因数 Q', 'Resonator quality factor Q'),
      def: loc(
        '谐振有多窄：Q = λ0 / FWHM。它描述环或谐振器的光学线宽，和链路里用 BER 定义的判决 Q 不是同一个量。见 {@picDevice}。',
        'How narrow a resonance is: Q = λ0 / FWHM. It describes the optical linewidth of a ring or resonator, and it is not the decision Q that a link defines from BER. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'pic-device-fsr-ng',
      q: loc('算 FSR 为什么用 ng 而不是 neff？', 'Why does FSR use ng rather than neff?'),
      a: loc(
        '相位公式里出现 neff，但峰与峰的波长间隔还取决于折射率随波长的变化，这一项收进 ng。教学值 ng 约 4.2、neff 约 2.4，用 neff 会把 FSR 算得偏宽。ΔL = 100 µm、ng = 4.2 时 MZI 的 FSR 是 5.72 nm。见 {@picDevice}。',
        'neff appears in the phase, but the wavelength gap between peaks also depends on how the index changes with wavelength, and that part is collected into ng. The teaching values are ng about 4.2 and neff about 2.4, so using neff makes the FSR too wide. At dL = 100 µm and ng = 4.2 the MZI FSR is 5.72 nm. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-device-critical',
      q: loc('怎样看出环接近临界耦合？', 'How can I tell that a ring is near critical coupling?'),
      a: loc(
        '比较单圈幅度透过率 a 和自耦合系数 r。a = r 时谐振处 T = 0。本课里 a 和 r 最高到 0.95，|a - r| < 0.02 时 T 会降到 0.05 以下。耦合更强不等于更好，坑变浅就说明离开了临界点。见 {@picDevice}。',
        'Compare the round-trip amplitude a with the self-coupling r. At a = r the transmission at resonance is 0. In this lesson a and r stop at 0.95, and |a - r| < 0.02 brings T below 0.05. Stronger coupling is not automatically better: a shallower dip means the ring has left the critical point. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-device-temp-drift',
      q: loc('谐振波长会不会随温度漂？', 'Does the resonance wavelength drift with temperature?'),
      a: loc(
        '会。dλ/dT = (λ/ng)·dneff/dT。教学默认大约 66 pm/K，10 K 就是 0.66 nm，足够漂出窄线宽。加热器能把谐振调回来，测试也要把温度稳住。见 {@picDevice}。',
        'Yes. dλ/dT = (λ/ng)·dneff/dT. The teaching default is about 66 pm/K, so 10 K is 0.66 nm, enough to leave a narrow linewidth. A heater can pull the resonance back, and the test must hold the temperature. See {@picDevice}.',
      ),
      lessons: [lesson],
    },
  ],
}
