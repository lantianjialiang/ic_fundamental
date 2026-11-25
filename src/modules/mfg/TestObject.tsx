import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram } from './FlowVisuals'

const OBJECTS = {
  wat: { title: loc('WAT · 划片道测试键', 'WAT · Scribe-line test structure'),
    caption: loc('探针落到划片道里的测试键。读数用于监控工艺，例如线宽、电阻或晶体管参数。', 'Probes land on a test structure in the scribe street. The readings monitor process properties such as line width, resistance or transistor parameters.') },
  cp: { title: loc('CP · 晶圆内的产品裸片', 'CP · Product die on wafer'),
    caption: loc('探针落到未切割裸片的产品焊盘，结果按裸片坐标写入晶圆图。', 'Probes touch product pads before dicing. Results are recorded by die coordinates in the wafer map.') },
  ft: { title: loc('FT · 已组装的封装成品', 'FT · Assembled device'),
    caption: loc('测试座触点接封装外部端子。读取的是组装后的器件功能和电气规格。', 'Socket contacts reach the external package terminals. Final test checks the assembled device against functional and electrical specifications.') },
}

export function TestObject({ stage }: { stage: string }) {
  const { t } = useLocale()
  if (stage !== 'wat' && stage !== 'cp' && stage !== 'ft') return null
  const info = OBJECTS[stage]
  const target = stage === 'wat' ? [169, 184, 199] : [222, 240, 258]
  return (
    <Diagram title={info.title} caption={info.caption}>
      <svg viewBox="0 0 470 180" className="flow-technical-svg" role="img" aria-label={t(info.title)} data-test-object={stage}>
        {stage === 'ft' ? <>
          <rect x="133" y="35" width="204" height="55" rx="7" fill="#516880" />
          <rect x="164" y="53" width="142" height="18" rx="3" fill="#83aaf0" />
          <rect x="113" y="115" width="244" height="26" rx="5" fill="#326b66" />
          {[172, 213, 254, 295].map((x) => <g key={x}>
            <circle cx={x} cy="98" r="8" fill="#daab6e" />
            <path d={`M${x} 107 V120`} stroke="#ffda82" strokeWidth="5" />
          </g>)}
          <text x="235" y="134" textAnchor="middle">{t(loc('测试座', 'Test socket'))}</text>
        </> : <>
          <rect x="80" y="82" width="310" height="76" rx="13" fill="#335776" />
          {[[103, 61], [205, 78], [309, 59]].map(([x, w]) => (
            <rect key={x} x={x} y="94" width={w} height="51" rx="4" fill="#427c75" stroke="#70a29b" />
          ))}
          <path d="M164 120 H205" stroke="#c3dbda" strokeDasharray="3 3" />
          {target.map((x) => <g key={x}>
            <rect x={x - 4} y={stage === 'wat' ? 117 : 108} width="8" height="6" rx="1.5" fill="#ffda82" />
            <path d={`M${x - 11} 51 L${x} ${stage === 'wat' ? 117 : 108}`} stroke="#ffda82" strokeWidth="3" />
          </g>)}
          <text x="320" y="70" textAnchor="middle">{t(loc('晶圆局部俯视', 'Wafer detail'))}</text>
        </>}
      </svg>
    </Diagram>
  )
}
