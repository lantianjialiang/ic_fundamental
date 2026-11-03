import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const asId = (id: string): ModuleId => id as ModuleId

/** SNS-06 亮场：PRNU、平场、shading、死点 */
export const SNS_FLAT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-prnu',
      term: 'PRNU',
      name: loc('光响应非均匀性（PRNU）', 'Photo response non-uniformity (PRNU)'),
      def: loc(
        '去掉暗信号和时间噪声之后，空间标准差除以均值。测得值满足 PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N。见 {@snsFlat}。',
        'Spatial standard deviation divided by the mean, after dark signal and temporal noise are removed. The measured value follows PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-flat-field',
      term: 'Flat field',
      name: loc('平场', 'Flat field'),
      def: loc(
        '用一块尽量均匀的光把传感器照到中间信号，用来测 PRNU 和缺陷。帧数不够时，时间噪声会留在 PRNU 里。见 {@snsFlat}。',
        'A field of light, as even as possible, that drives the sensor to a mid-level signal so PRNU and defects can be measured. With too few frames, temporal noise stays inside the PRNU. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-shading',
      term: 'Shading',
      name: loc('阴影渐变（shading）', 'Shading'),
      def: loc(
        '从画面一边到另一边的低阶渐变，常用一个平面把它扣掉。它不是像素级 PRNU。见 {@snsFlat}。',
        'A low-order ramp from one side of the frame to the other. A plane fit takes it out. It is not pixel PRNU. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-dead-pixel',
      term: 'Dead pixel',
      name: loc('死点', 'Dead pixel'),
      def: loc(
        '亮场减暗场之后响应接近 0 的像素。低灵敏是响应偏低但还没有死，热点则看暗场的绝对 DN。相邻缺陷合成一簇。见 {@snsFlat}。',
        'A pixel whose bright-minus-dark response is near 0. Low sensitivity means the response is low but the pixel is not dead. A hot pixel is judged from absolute dark DN. Touching defects form a cluster. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-cluster',
      term: 'Cluster defect',
      name: loc('簇缺陷', 'Cluster defect'),
      def: loc(
        '相邻坏点连成的一块。个数还在，但分级时簇会把器件挡在 A 外面，即使总数不大。低灵敏像素响应偏低但还没死，不要和簇混成一种缺陷。见 {@snsFlat}、{@snsProgram}。',
        'Touching bad pixels that form one patch. The count is still there, but a cluster keeps a part out of grade A even when the total is small. A low-sensitivity pixel has a weak response but is not dead; do not treat it as the same defect as a cluster. See {@snsFlat} and {@snsProgram}.',
      ),
      lessons: [asId('snsFlat'), asId('snsProgram')],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-flat-one-frame',
      q: loc('为什么不能只拍一帧就报 PRNU？', 'Why is one frame not enough to report PRNU?'),
      a: loc(
        '一帧的空间标准差里还有时间噪声。PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N。N 太小的时候，第二项可以和真 PRNU 的平方差不多大。见 {@snsFlat}。',
        'The spatial standard deviation of one frame still contains temporal noise. PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N. When N is small, the second term can be as large as the true PRNU squared. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-flat-shading',
      q: loc('shading 要不要算进 PRNU？', 'Should shading be included in PRNU?'),
      a: loc(
        '不要。shading 是整幅画面的斜坡，像素 PRNU 是把这个斜坡扣掉之后的相对标准差。斜坡常常来自光路或镜头，不该记到像素头上。见 {@snsFlat}。',
        'No. Shading is a slope across the frame. Pixel PRNU is the relative standard deviation after that slope is removed. The slope often comes from the light path or the lens, and it should not be charged to the pixels. See {@snsFlat}.',
      ),
      lessons: [asId('snsFlat')],
    },
    {
      id: 'sns-flat-cluster',
      q: loc('相邻几个死点算几个缺陷？', 'Do a few neighboring dead pixels count as several defects?'),
      a: loc(
        '个数还在，但它们合成一簇。分级时簇会把器件挡在 A 外面，即使总数不大。所以亮场缺陷不能只报一串坐标，还要看它们是否挨在一起。见 {@snsFlat} 和 {@snsProgram}。',
        'The count is still there, but touching defects form a cluster. A cluster keeps a part out of grade A even when the total is small. A bright-field defect list is not just coordinates; it also has to say whether they touch. See {@snsFlat} and {@snsProgram}.',
      ),
      lessons: [asId('snsFlat'), asId('snsProgram')],
    },
  ],
}
