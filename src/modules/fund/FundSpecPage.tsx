import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  CONDS,
  FILL,
  GRADES,
  KINDS,
  LEVELS,
  LEVEL_NOTE,
  QUIZ,
  SHEET,
  SHEET_HEAD,
  SHEET_TABS,
  TAKEAWAY,
  WHY,
  WORDS,
  type Grade,
  type SheetTab,
} from './data/spec'
import { Callout, Cards, Explain, Readout, Seg, type Note } from './parts'
import { SpecFlowFig } from './SpecFlowFig'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  whyTitle: loc('为什么先读规格'),
  kindTitle: loc('三份规格，各写给谁'),
  kindNote: loc('点一张卡，图里对应的框会亮。'),
  wordTitle: loc('三个先要会的词'),
  condTitle: loc('测试条件 + 测试极限 = 一条测试'),
  condNote: loc('条件是你施加给芯片的；极限是你拿来判 Pass / Fail 的。'),
  colKind: loc('类别'),
  colCond: loc('测试条件'),
  colLimit: loc('测试极限'),
  sheetTitle: loc('读一份真实格式的规格书：256×4 SRAM'),
  sheetNote: loc('切换等级和章节，点任意一行看它在说什么、该怎么测。'),
  sheetHint: loc('点表格里的一行。'),
  testerTitle: loc('先核对测试机够不够'),
  testerNote: loc('tRC = 15 ns，所以芯片全速读是 1 / 15 ns ≈ 66.7 MHz。信号脚：8 根地址 + 4 根数据 + 4 根控制 = 16。'),
  testerFreq: loc('测试机最高频率'),
  testerCh: loc('测试机数字通道'),
  dutF: loc('芯片 fMAX'),
  okF: loc('能全速跑功能和 AC。'),
  badF: loc('不能全速。功能可以降频测；速度相关项要换机台、用多路复用（M22），或者靠表征保证。'),
  okCh: loc('通道够，每个信号脚一路。'),
  badCh: loc('通道不够，要分两次插测或换机台。'),
  levelTitle: loc('标准逻辑电平'),
  fillTitle: loc('填空：把规格翻译成测试条件'),
  fillNote: loc('按 256×4 SRAM 商业级回答。'),
  kicker: loc('规格书'),
  later: loc('下一课从第一项测试开始：开短路。'),
}

export function FundSpecPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [kind, setKind] = useState('device')
  const [word, setWord] = useState('pre')
  const [grade, setGrade] = useState<Grade>('com')
  const [tab, setTab] = useState<SheetTab>('dc')
  const [rowId, setRowId] = useState<string>('voh')
  const [freq, setFreq] = useState('50')
  const [ch, setCh] = useState('32')
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: KINDS[2].title, text: KINDS[2].text })

  const g = GRADES[grade]
  const rows = SHEET[tab]
  const row = rows.find((item) => item.id === rowId)
  const wordItem = WORDS.find((item) => item.id === word)
  const kindItem = KINDS.find((item) => item.id === kind)
  const fOk = Number(freq) >= 66.7
  const chOk = Number(ch) >= 16

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m18.title)}
      goal={t(ui.m18.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fOpens"
      nextLabel={t(ui.fund.next) + t(ui.m19.title)}
    >
      <Section title={t(S.whyTitle)}>
        {WHY.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      <Section title={t(S.kindTitle)} note={t(S.kindNote)}>
        <Cards
          items={KINDS}
          activeId={kind}
          onPick={(item) => {
            setKind(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <SpecFlowFig active={kind} />
        <Explain paras={kindItem?.explain} />
      </Section>

      <Section title={t(S.wordTitle)}>
        <Cards
          items={WORDS}
          activeId={word}
          onPick={(item) => {
            setWord(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={wordItem?.explain} />
      </Section>

      <Section title={t(S.condTitle)} note={t(S.condNote)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colKind)}</th>
              <th>{t(S.colCond)}</th>
              <th>{t(S.colLimit)}</th>
            </tr>
          </thead>
          <tbody>
            {CONDS.map((item) => (
              <tr key={item.kind.zh}>
                <td>{t(item.kind)}</td>
                <td>{t(item.cond)}</td>
                <td>{t(item.limit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={t(S.sheetTitle)} note={t(S.sheetNote)}>
        <Seg
          options={(['com', 'mil'] as Grade[]).map((id) => ({ id, label: GRADES[id].name }))}
          value={grade}
          onChange={setGrade}
        />{' '}
        <Seg
          options={SHEET_TABS}
          value={tab}
          onChange={(id) => {
            setTab(id)
            setRowId(SHEET[id][0].id)
          }}
        />
        <table className="dtable">
          <thead>
            <tr>
              {SHEET_HEAD[tab].map((head) => (
                <th key={head.zh}>{t(head)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr
                key={item.id}
                className={`is-click${item.id === rowId ? ' is-active' : ''}`}
                onClick={() => {
                  setRowId(item.id)
                  const cells = item.cells(g)
                  setNote({ kicker: S.kicker, title: t(cells[0]), text: item.explain[0] })
                }}
              >
                {item.cells(g).map((cell, index) => (
                  <td key={index} className={index === 0 ? 'mono-cell' : undefined}>
                    {t(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {row ? <Explain paras={row.explain} /> : <p className="intro__note">{t(S.sheetHint)}</p>}
      </Section>

      <Section title={t(S.testerTitle)} note={t(S.testerNote)}>
        <div className="knob-row">
          <div>
            <p className="intro__note">{t(S.testerFreq)}</p>
            <Seg
              options={['20', '50', '100'].map((id) => ({ id, label: `${id} MHz` }))}
              value={freq}
              onChange={setFreq}
            />
          </div>
          <div>
            <p className="intro__note">{t(S.testerCh)}</p>
            <Seg
              options={['8', '16', '32'].map((id) => ({ id, label: `${id} ch` }))}
              value={ch}
              onChange={setCh}
            />
          </div>
        </div>
        <Readout
          items={[
            { label: S.dutF, value: '66.7 MHz' },
            { label: S.testerFreq, value: `${freq} MHz`, state: fOk ? 'pass' : 'fail' },
            { label: S.testerCh, value: `${ch} / 16`, state: chOk ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={fOk ? 'ok' : 'warn'}>{t(fOk ? S.okF : S.badF)}</Callout>
        <Callout tone={chOk ? 'ok' : 'bad'}>{t(chOk ? S.okCh : S.badCh)}</Callout>
      </Section>

      <Section title={t(S.levelTitle)}>
        <table className="dtable">
          <thead>
            <tr>
              <th />
              <th>VIL max</th>
              <th>VIH min</th>
              <th>VOL max</th>
              <th>VOH min</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td className="mono-cell">{item.vil}</td>
                <td className="mono-cell">{item.vih}</td>
                <td className="mono-cell">{item.vol}</td>
                <td className="mono-cell">{item.voh}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="intro__note">{t(LEVEL_NOTE)}</p>
      </Section>

      <Section title={t(S.fillTitle)} note={t(S.fillNote)}>
        <QuizList questions={FILL} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>

      <Section title={t(ui.fund.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.fund.quizTitle)} note={t(ui.fund.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
