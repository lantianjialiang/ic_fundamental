import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { type ParamId } from './data/mosSelect'
import { rdsRow, type Part } from './data/mosSelectParts'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

type Row = { key: string; param: ParamId; name: LText; sym: string; cond: string; min?: string; typ?: string; max?: string; unit: string }

const L = {
  tag: loc('示例器件（虚构数据）', 'Example part (fictional data)'),
  name: loc('参数', 'Parameter'),
  sym: loc('符号', 'Symbol'),
  cond: loc('测试条件', 'Test conditions'),
  min: loc('最小', 'Min'),
  typ: loc('典型', 'Typ'),
  max: loc('最大', 'Max'),
  unit: loc('单位', 'Unit'),
  abs: loc('绝对最大额定值', 'Absolute maximum ratings'),
  elec: loc('电气特性（25 °C）', 'Electrical characteristics (25 °C)'),
  cap: loc(
    '数据手册摘录（示意）：每个数字右边的「测试条件」才决定这个数字的意思；「—」表示手册没有给这一行。',
    'Datasheet excerpt (illustrative): the test conditions beside each number give it its meaning; “—” means the datasheet gives no such row.',
  ),
}

function rowsOf(part: Part): { abs: Row[]; elec: Row[] } {
  const idTest = Math.max(1, Math.round(part.idA / 2))
  const rds = (v: number): Row => {
    const m = rdsRow(part, v)
    return { key: `rds${v}`, param: 'rds', name: loc('导通电阻', 'Static on-resistance'), sym: 'Rds(on)', cond: `Vgs = ${v} V, Id = ${idTest} A`, max: m === null ? '—' : String(m), unit: 'mΩ' }
  }
  const capCond = 'Vds = 15 V, Vgs = 0, 1 MHz'
  return {
    abs: [
      { key: 'vds', param: 'vds', name: loc('漏源电压', 'Drain-source voltage'), sym: 'Vds', cond: 'Vgs = 0 V', max: String(part.vds), unit: 'V' },
      { key: 'id', param: 'id', name: loc('连续漏极电流', 'Continuous drain current'), sym: 'Id', cond: 'Tc = 25 °C', max: String(part.idA), unit: 'A' },
      { key: 'vgs', param: 'vgsmax', name: loc('栅源电压', 'Gate-source voltage'), sym: 'Vgs', cond: '', max: `±${part.vgsMax}`, unit: 'V' },
    ],
    elec: [
      rds(10),
      rds(4.5),
      rds(2.5),
      { key: 'vth', param: 'vth', name: loc('栅极阈值电压', 'Gate threshold voltage'), sym: 'Vgs(th)', cond: 'Vds = Vgs, Id = 250 µA', min: String(part.vth.min), typ: String(part.vth.typ), max: String(part.vth.max), unit: 'V' },
      { key: 'qg', param: 'qg', name: loc('栅极总电荷', 'Total gate charge'), sym: 'Qg', cond: `Vgs = ${part.qgV} V, Vds = 15 V`, typ: String(part.qg), unit: 'nC' },
      { key: 'ciss', param: 'caps', name: loc('输入电容', 'Input capacitance'), sym: 'Ciss', cond: capCond, typ: String(part.ciss), unit: 'pF' },
      { key: 'coss', param: 'caps', name: loc('输出电容', 'Output capacitance'), sym: 'Coss', cond: capCond, typ: String(part.coss), unit: 'pF' },
      { key: 'crss', param: 'caps', name: loc('反向传输电容', 'Reverse transfer capacitance'), sym: 'Crss', cond: capCond, typ: String(part.crss), unit: 'pF' },
      { key: 'rth', param: 'rth', name: loc('热阻，结到环境', 'Thermal resistance, J-A'), sym: 'RθJA', cond: `${part.pkg}, FR-4 board`, typ: String(part.theta), unit: '°C/W' },
    ],
  }
}

const COL = { name: 18, sym: 262, cond: 372, min: 596, typ: 646, max: 696, unit: 704 }

export function DatasheetFig({ part, active, onPick }: { part: Part; active: ParamId; onPick: (id: ParamId) => void }) {
  const { t } = useLocale()
  const { abs, elec } = rowsOf(part)
  const items: Array<{ group?: LText; row?: Row; y: number }> = []
  let y = 58
  for (const [label, rows] of [[L.abs, abs], [L.elec, elec]] as Array<[LText, Row[]]>) {
    items.push({ group: label, y })
    y += 22
    for (const row of rows) {
      items.push({ row, y })
      y += 25
    }
  }
  const height = y + 10
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 760 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="760" height={height} rx="10" fill="var(--well)" />
        <T x={COL.name} y={24} anchor="start" size={13} color="var(--text)">
          {`${part.name} · N-channel MOSFET · ${part.pkg}`}
        </T>
        <T x={742} y={24} anchor="end" size={10.5} color="var(--gold)">
          {t(L.tag)}
        </T>
        <T x={COL.name} y={46} anchor="start" size={10.5} color="var(--muted)">
          {t(L.name)}
        </T>
        <T x={COL.sym} y={46} anchor="start" size={10.5} color="var(--muted)">
          {t(L.sym)}
        </T>
        <T x={COL.cond} y={46} anchor="start" size={10.5} color="var(--muted)">
          {t(L.cond)}
        </T>
        <T x={COL.min} y={46} anchor="end" size={10.5} color="var(--muted)">
          {t(L.min)}
        </T>
        <T x={COL.typ} y={46} anchor="end" size={10.5} color="var(--muted)">
          {t(L.typ)}
        </T>
        <T x={COL.max} y={46} anchor="end" size={10.5} color="var(--muted)">
          {t(L.max)}
        </T>
        <T x={COL.unit} y={46} anchor="start" size={10.5} color="var(--muted)">
          {t(L.unit)}
        </T>
        <line x1="10" y1="52" x2="750" y2="52" stroke="var(--line-2)" />
        {items.map((item) => {
          if (item.group) {
            return (
              <T key={item.group.zh} x={COL.name} y={item.y + 15} anchor="start" size={11} color="var(--blue)">
                {t(item.group)}
              </T>
            )
          }
          const r = item.row as Row
          const on = r.param === active
          const dim = r.max === '—'
          return (
            <Hit key={r.key} label={`${t(r.name)} ${r.sym}`} active={on} onPick={() => onPick(r.param)}>
              <rect x="8" y={item.y} width="744" height="23" rx="4" fill={on ? 'var(--gold)' : 'var(--card)'} fillOpacity={on ? 0.16 : 1} stroke={on ? 'var(--gold)' : 'none'} />
              <T x={COL.name} y={item.y + 16} anchor="start" size={11.5} color="var(--text)">
                {t(r.name)}
              </T>
              <T x={COL.sym} y={item.y + 16} anchor="start" size={11} color="var(--gold)" mono>
                {r.sym}
              </T>
              <T x={COL.cond} y={item.y + 16} anchor="start" size={10} color="var(--muted)" mono>
                {r.cond}
              </T>
              {r.min ? (
                <T x={COL.min} y={item.y + 16} anchor="end" size={11} color="var(--text)" mono>
                  {r.min}
                </T>
              ) : null}
              {r.typ ? (
                <T x={COL.typ} y={item.y + 16} anchor="end" size={11} color="var(--text)" mono>
                  {r.typ}
                </T>
              ) : null}
              {r.max ? (
                <T x={COL.max} y={item.y + 16} anchor="end" size={11} color={dim ? 'var(--dim)' : 'var(--text)'} mono>
                  {r.max}
                </T>
              ) : null}
              <T x={COL.unit} y={item.y + 16} anchor="start" size={11} color="var(--muted)" mono>
                {r.unit}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
