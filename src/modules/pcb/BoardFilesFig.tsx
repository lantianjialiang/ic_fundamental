import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type FileId } from './data/pcbSupplyParts'

const SOURCE = {
  gerber: loc('顶层铜图形。金色线路串接 J1、R1 和 D1 的焊盘，外框来自板框文件。', 'Top copper artwork. Gold traces connect the J1, R1 and D1 pads, and the outline comes from the profile file.'),
  drill: loc('钻孔表决定孔中心和孔径。J1 是镀铜焊孔，板角是机械安装孔。', 'The drill file sets hole centers and diameters. J1 uses plated holes and the corners have mounting holes.'),
  bom: loc('BOM 按位号关联采购料。这个例子从 R1 匹配到 330 Ω 电阻，再用相同位号在坐标文件找它。', 'The BOM links reference designators to purchased parts. Here R1 calls for a 330 Ω resistor. The placement file uses the same designator.'),
  cpl: loc('坐标文件给 R1 的中心、面别和旋转。图中坐标以左下板角为原点，X 向右、Y 向上。', 'The placement file supplies R1’s center, side and rotation. The board origin is the lower left, with X right and Y up.'),
  asm: loc('装配图用器件外形和方向标识帮助检查。D1 的 K 标出阴极端。', 'Assembly drawings use component outlines and orientation marks. K marks the cathode end of D1.'),
  odb: loc('集成制造数据把铜层、钻孔、网表和元件信息组织为同一板数据。可同时核对相同的孔、铜与位号。', 'Integrated manufacturing data groups copper, drilling, nets and parts for one board. The same holes, traces and designators can be checked together.'),
}

export function BoardFilesFig({ file }: { file: FileId }) {
  const { t } = useLocale()
  const show = (id: FileId) => file === id || file === 'odb'
  const gold = '#ffdb85'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 500 245" className="term-fig__svg" role="img" aria-label={t(SOURCE[file])} data-board-file={file}>
        <rect width="500" height="245" fill="var(--well)" />
        <rect x="65" y="35" width="370" height="160" rx="9" fill="#214c46" stroke={show('gerber') ? gold : '#709c8b'} strokeWidth="3" />
        <g data-spot="copper" opacity={show('gerber') ? 1 : .4} stroke={gold} fill="none" strokeWidth="6">
          <path d="M118 89 H153 L183 119 H217 M277 119 H344 M373 119 H404 V151 H117" />
          {[217, 277, 344, 373].map((x) => <path key={x} d={`M${x} 111 V127`} strokeWidth="13" />)}
        </g>
        <g data-spot="holes" stroke={show('drill') ? gold : '#9db5bd'} fill="#142736" strokeWidth={show('drill') ? 3 : 1.5}>
          {[[83, 51], [416, 51], [83, 178], [416, 178], [118, 89], [118, 151]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i < 4 ? 7 : 5} />
          ))}
        </g>
        <g fill="none" stroke={show('asm') ? gold : '#b2c6cb'} strokeWidth="1.5">
          <rect x="101" y="72" width="34" height="96" rx="3" />
          <rect x="204" y="102" width="85" height="35" rx="3" />
          <rect x="329" y="102" width="61" height="35" rx="3" />
          <path d="M371 104 V135" />
        </g>
        <g fill="#f1f6fa" fontFamily="monospace" fontSize="17">
          <text x="93" y="69">J1</text><text x="233" y="96">R1</text><text x="349" y="96">D1</text>
          <text x="375" y="126" fill={show('asm') ? gold : '#eef4f7'}>K</text>
        </g>
        {file === 'bom' && <g data-spot="bom">
          <rect x="201" y="100" width="91" height="40" rx="4" fill="none" stroke={gold} strokeWidth="3" />
          <path d="M246.5 141 V166" stroke={gold} strokeWidth="2" />
          <text x="246.5" y="184" fill={gold} textAnchor="middle" fontSize="16">R1 · 330 Ω</text>
        </g>}
        {show('cpl') && <g data-spot="placement" stroke={gold} fill="none" strokeWidth="2">
          <path d="M65 195 H246.5 V119.5 M65 119.5 H246.5" strokeDasharray="4 4" />
          <path d="M232 119.5 H261 M246.5 105 V134 M254 113 L261 119.5 L254 126" />
          <circle cx="65" cy="195" r="3" fill={gold} />
        </g>}
        {show('cpl') && <text x="250" y="224" fill="var(--text)" textAnchor="middle" fontSize="16">R1 · X 9.81 mm · Y 4.08 mm · 0° · TOP</text>}
      </svg>
      <figcaption aria-live="polite">{t(SOURCE[file])}</figcaption>
    </figure>
  )
}
