import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { StepControls, type StepPlayerState } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { Related, type PrepNote } from '../prep/common'
import { FILES, S, TREE, TREE_CAP, type FileId } from './data/pcbTools'
import { WALK, WS } from './data/pcbToolsSteps'
import { WalkFig } from './ToolsFigs'
import { ToolsMap } from './ToolsFigs5'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

export const FIRST_FILE: FileId = TREE.find((r) => r.file !== undefined)?.file ?? 'prj'

export function TreeSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [file, setFile] = useState<FileId>(FIRST_FILE)
  const f = FILES[file]
  const pick = (id: FileId) => {
    setFile(id)
    setNote({ kicker: S.kickerFile, title: FILES[id].title, text: FILES[id].inside })
  }
  return (
    <Section title={t(S.treeTitle)} note={t(S.treeNote)}>
      <div className="pcbTools-split">
        <div className="pcbTools-tree" role="group" aria-label={t(S.treeTitle)}>
          {TREE.map((row) => {
            const pad = 10 + row.depth * 16
            if (row.file) {
              const id = row.file
              return (
                <button
                  key={row.label}
                  type="button"
                  className={`pcbTools-file${file === id ? ' is-active' : ''}`}
                  style={{ paddingLeft: pad }}
                  aria-pressed={file === id}
                  onClick={() => pick(id)}
                >
                  {row.label}
                  {row.group ? <small>{` ${t(row.group)}`}</small> : null}
                </button>
              )
            }
            return (
              <div key={row.label} className="pcbTools-grp" style={{ paddingLeft: pad }}>
                {row.label}
                {row.group ? <small>{t(row.group)}</small> : null}
              </div>
            )
          })}
        </div>
        <ToolsMap file={file} onPick={pick} />
      </div>
      <p className="prep-muted">{t(TREE_CAP)}</p>
      <Callout>
        <p>
          <b>{t(f.title)}</b>
        </p>
        <dl className="pcbTools-detail">
          <dt>{t(S.inside)}</dt>
          <dd>{t(f.inside)}</dd>
          <dt>{t(S.link)}</dt>
          <dd>
            <LessonRefText text={f.link} onOpenLesson={onOpen} />
          </dd>
          <dt>{t(S.pitfall)}</dt>
          <dd>
            <LessonRefText text={f.pitfall} onOpenLesson={onOpen} />
          </dd>
        </dl>
      </Callout>
      <Related ids={['pcbFlow', 'pcbBasics', 'pcbSupply']} onOpen={onOpen} />
    </Section>
  )
}

export function WalkSection({ player, onOpen }: { player: StepPlayerState; onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const step = WALK[player.step]
  return (
    <Section title={t(S.walkTitle)} note={t(S.walkNote)}>
      <WalkFig step={step} index={player.step} />
      <StepControls player={player} stepLabels={WALK.map((s) => s.title)} />
      <Callout>
        <p>
          <b>{`${player.step + 1}. ${t(step.title)}`}</b>
        </p>
        <p>
          <LessonRefText text={step.text} onOpenLesson={onOpen} />
        </p>
        <dl className="pcbTools-detail">
          <dt>{t(S.menuPath)}</dt>
          <dd>{step.menu}</dd>
          <dt>{t(S.keys)}</dt>
          <dd>{step.keys ? <kbd className="pcbTools-keys">{step.keys}</kbd> : t(WS.noKey)}</dd>
          <dt>{t(S.checkList)}</dt>
          <dd>
            <ul className="pcbTools-checks">
              {step.checks.map((c) => (
                <li key={c.zh}>{t(c)}</li>
              ))}
            </ul>
          </dd>
          <dt>{t(S.why)}</dt>
          <dd>
            <LessonRefText text={step.why} onOpenLesson={onOpen} />
          </dd>
        </dl>
      </Callout>
      <Related ids={['pcbFlow', 'pcbStack', 'pcbLayout']} onOpen={onOpen} />
    </Section>
  )
}
