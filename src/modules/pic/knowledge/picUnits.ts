import { loc } from '../../../i18n/locale'
import { type AnaKnowledge } from '../../ana/knowledge/types'
import { type ModuleId } from '../../catalog'

const lesson = 'picUnits' as ModuleId

/** PIC-02 波长、dBm、有效折射率与群折射率、TE/TM */
export const PIC_UNITS_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-waveguide',
      term: 'Waveguide',
      name: loc('光波导', 'Optical waveguide'),
      def: loc(
        '把光约束在截面里传播的介质通道。教学用 SOI 条波导，neff 约 2.4、ng 约 4.2。相位用 neff，FSR 和热漂移用 ng。见 {@picUnits}。',
        'A dielectric channel that confines light in its cross-section. The teaching SOI strip uses neff about 2.4 and ng about 4.2. Phase uses neff; FSR and thermal shift use ng. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-neff',
      term: 'Effective index',
      name: loc('有效折射率 neff', 'Effective index neff'),
      def: loc(
        '光在波导里感受到的折射率，由截面决定，教学值约 2.4，不是体硅的折射率。它出现在相位 Δφ = 2π·neff·L/λ 里。见 {@picUnits}。',
        'The index the light actually sees in a waveguide. It depends on the cross-section. The teaching value is about 2.4, not the index of bulk silicon. It appears in the phase dphi = 2 pi neff L / lambda. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-ng',
      term: 'Group index',
      name: loc('群折射率 ng', 'Group index ng'),
      def: loc(
        '描述光包络走多快的折射率，教学值约 4.2。自由光谱范围 FSR = λ² / (ng·L) 和热漂移公式用的都是 ng，不是 neff。见 {@picUnits}。',
        'The index that describes how fast the envelope of the light travels. The teaching value is about 4.2. Free spectral range FSR = lambda^2 / (ng L) and the thermal-shift formula both use ng, not neff. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-te-tm',
      term: 'TE and TM',
      name: loc('TE 与 TM 偏振', 'TE and TM polarization'),
      def: loc(
        '波导里两种正交的偏振。SOI 条波导上它们的 neff 不同，光栅耦合器常常只按 TE 设计，换一种偏振损耗会明显变大。见 {@picUnits}。',
        'Two orthogonal polarizations in a waveguide. On an SOI strip their neff differs, and a grating coupler is often designed for TE only, so the other polarization has a much larger loss. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    dbm: [lesson],
    'insertion-loss': [lesson],
  },
  faqs: [
    {
      id: 'pic-units-db-add',
      q: loc('为什么损耗用 dB 相加，不用 mW 相减？', 'Why do losses add in dB instead of subtracting milliwatts?'),
      a: loc(
        'dB 是对数，相加对应功率相乘。两段 3 dB 是 6 dB，功率变成四分之一。3 dB 本身约为减半：-3 dBm 约 0.501 mW。把 dB 当成 mW 去减，会得到错误的到达功率。见 {@picUnits}。',
        'dB is a logarithm, so adding dB multiplies power. Two sections of 3 dB are 6 dB, which is one quarter of the power. 3 dB itself is about half: -3 dBm is about 0.501 mW. Subtracting dB as if it were milliwatts gives the wrong arrival power. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-units-neff-ng',
      q: loc('neff 和 ng 为什么不是同一个数？', 'Why are neff and ng not the same number?'),
      a: loc(
        'neff 决定某一波长上的相位，ng 还计入折射率随波长的变化，所以它决定脉冲走多快、以及两个谐振之间隔多远。教学条波导上 neff 约 2.4、ng 约 4.2。用 neff 去算 FSR 会偏宽。见 {@picUnits}。',
        'neff sets the phase at one wavelength. ng also counts how the index changes with wavelength, so it sets how fast a pulse travels and how far apart two resonances are. On the teaching strip waveguide neff is about 2.4 and ng is about 4.2. Using neff for FSR makes the spacing too wide. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-units-shorter-not-lower',
      q: loc('波长越短，波导损耗是不是越低？', 'Does a shorter wavelength always mean lower waveguide loss?'),
      a: loc(
        '不是。硅条波导在更短波长上散射和材料吸收往往会变大，损耗不单调下降。损耗还跟截面、粗糙度和偏振有关，不能只拿波长推断。见 {@picUnits}。',
        'No. On a silicon strip, scattering and material absorption often grow at shorter wavelengths, so loss does not fall monotonically. Loss also depends on the cross-section, roughness and polarization; wavelength alone does not tell you. See {@picUnits}.',
      ),
      lessons: [lesson],
    },
  ],
}
