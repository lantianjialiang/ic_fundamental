import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-13 Trim 与 OTP：术语、已有词条的课程补充、常见问题 */
export const ANA_TRIM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'trim',
      term: 'Trim',
      name: loc('修调', 'Trim'),
      def: loc(
        '出厂前测一次，再用芯片里一组可编程的调节码把参数拨回目标值，抵消工艺偏差。被修的参数可以是基准电压、振荡频率、电阻值等。修调的前提是偏差在修调范围之内，见 {@anaTrim}。',
        'A one-time adjustment before shipment: a programmable code stored on the chip moves a parameter back to target, cancelling process variation. The parameter can be a reference voltage, an oscillator frequency or a resistance. Trim only works when the offset is within the trim range; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
    {
      id: 'trim-code',
      term: 'Trim code',
      name: loc('修调码', 'Trim code'),
      def: loc(
        '修调时写入芯片的数字码，本课是 5 位（0–31），每码 2 mV。码决定修调电路接入多少调节量；码增大、输出单调增大，所以搜索时可以用二分逼近。码是离散的，修调后的残余误差最大约为半个 LSB（本课为 1 mV），见 {@anaTrim}。',
        'The digital code written to the chip during trim; here it has 5 bits (0–31), 2 mV per code. The code sets how much adjustment is switched in. Output rises monotonically with the code, so binary search can home in on it. The code is discrete, so the residual error after trim is at most about half an LSB (1 mV here); see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
    {
      id: 'otp',
      term: 'OTP',
      name: loc('一次性可编程存储器', 'One-time programmable memory (OTP)'),
      def: loc(
        '靠熔丝（fuse）或反熔丝（anti-fuse）的物理状态存数据的存储器。编程就是烧断或击穿，状态改变后无法恢复，没有擦除操作。所以写错了只能换一颗 die，编程前必须先确认结果，见 {@anaTrim}。',
        'Memory that stores data in the physical state of fuses or anti-fuses. Programming blows or breaks down the element, and the state cannot be restored; there is no erase. A wrong write means a new die, so the result must be confirmed before programming; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
    {
      id: 'readback',
      term: 'Readback',
      name: loc('回读', 'Readback'),
      def: loc(
        '编程之后，把 OTP 里实际存的码读出来，与写入的码比较。它只确认码存进去了，不说明修调后的输出在限值内；那要靠复测。回读失败通常意味着编程没有成功，见 {@anaTrim}。',
        'After programming, the code actually stored in the OTP is read out and compared with the code written. It only confirms the code was stored; it does not show the trimmed output is within limit, which needs a re-test. A failed read-back usually means the program did not succeed; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
  ],
  extraLessons: {
    'binary-search': ['anaTrim'],
    'linear-search': ['anaTrim'],
  },
  faqs: [
    {
      id: 'ana-trim-binary-vs-linear',
      q: loc('修调用二分还是线性搜索？', 'Should trim use binary or linear search?'),
      a: loc(
        '二分的最坏情况固定：5 位码最多 6 次测量，与偏差大小无关。线性搜索的次数取决于偏差，偏差接近起点时很快，偏差大时要走很多码，最坏要测 32 次。两者结果在同一颗 die 上一样，差别只在测量次数。见 {@anaTrim}。',
        'Binary search has a fixed worst case: at most 6 measurements for 5 bits, regardless of the offset. Linear search depends on the offset; it is quick when the code is near the start and walks many codes when the offset is large, up to 32 measurements. On the same die both give the same code; only the count differs; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
    {
      id: 'ana-trim-otp-no-undo',
      q: loc('OTP 写错了能不能再写一次覆盖？', 'If the OTP is written wrong, can it be overwritten?'),
      a: loc(
        '不能。OTP 的每一位是熔丝烧断或反熔丝击穿，状态一旦改变就不能变回去，所以没有擦除。编程前要看预览，确认搜索结果在限值内；写错就只能换一颗 die。见 {@anaTrim}。',
        'No. Each OTP bit is a fuse blown or an anti-fuse broken down, and once it changes it cannot change back, so there is no erase. Check the preview before programming to confirm the search result is within limit; a wrong write means a new die; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
    {
      id: 'ana-trim-out-of-range',
      q: loc('偏差超出修调范围，换搜索方法或加位数能修回来吗？', 'If the offset is beyond the trim range, can a different search method or more bits fix it?'),
      a: loc(
        '不能靠搜索方法修回来。修调范围由码数和每码的 LSB 决定，搜索方法只决定怎么找码。超出范围的 die 应判废或降级；加位数要改芯片设计，不能在测试程序里解决。见 {@anaTrim}。',
        'No search method can fix it. The trim range is set by the number of codes and the LSB per code; the search only decides how the code is found. A die outside the range must be scrapped or downgraded, and adding bits means a chip redesign, which a test program cannot fix; see {@anaTrim}.',
      ),
      lessons: ['anaTrim'],
    },
  ],
}
