import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices, StagePlayer } from './FlowVisuals'
import { HardwareCanvas, curve, dot, ink, label, leader, line, rect } from './HardwareCanvas'

const STAGES = [
  { id: '0', title: loc('装入对准', 'Align'), caption: loc('定位腔约束横向位置。端子与接触件共用一条中心线，两者之间仍有间隙。', 'The socket pocket aligns the part. Each terminal shares an axis with its contact, with an air gap between them.') },
  { id: '1', title: loc('初次接触', 'First contact'), caption: loc('端子刚碰到接触件，针尾一直落在负载板焊盘上。', 'The package terminals just touch the contacts. The bottom end stays on the load-board pad.') },
  { id: '2', title: loc('压合测试', 'Compress and test'), caption: loc('压盖施力，接触件进入工作行程。青色路径从封装端子一直连到负载板铜线。', 'The lid applies load and the contacts compress into their working travel. The teal trace follows the connection from the package terminal into the board.') },
] as const

const BOARD_Y = 248

export function SocketSection({ pack, contact, focus, focusNote, stage, onStage }: {
  pack: string; contact: string; focus: string; focusNote: LText; stage: number; onStage: (stage: number) => void
}) {
  const { t } = useLocale()
  return (
    <Diagram title={loc('从装入到压合：端子如何接通负载板', 'From insertion to compression: how the terminal reaches the board')}
      caption={STAGES[stage].caption}>
      <HardwareCanvas scene="socket-section" description={STAGES[stage].caption} value={stage}
        draw={(ctx, travel, t) => {
          const lead = pack === 'lead'
          const ball = pack === 'bga'
          const elastomer = contact === 'elastomer'
          const freeTip = elastomer ? 219 : contact === 'spring' ? 194 : 183
          const compression = 12 * Math.max(0, travel - 1)
          const gap = 25 * (1 - Math.min(travel, 1))
          const tipY = freeTip + compression
          const terminalY = tipY - gap
          const packageBottom = terminalY - (ball ? 23 : lead ? 17 : 5)
          const packageTop = packageBottom - 39
          const lidBottom = packageTop - 14 * (1 - travel / 2)
          const xs = lead ? [196, 404] : [246, 300, 354]
          const active = travel > 1.12
          const selectedX = xs[0]
          const accent = (id: string, color: string) => focus === id ? ink.trace : color

          rect(ctx, 155, BOARD_Y, 290, 29, ink.board, accent('board', ink.steel), 5)
          line(ctx, [[161, 258], [437, 258]], '#518a89', 1)
          for (const [i, x] of xs.entries()) {
            rect(ctx, x - 14, BOARD_Y - 2, 28, 6, ink.copper, undefined, 2)
            if (i === 0) line(ctx, [[x, BOARD_Y], [x, 266], [173, 266]], active ? ink.trace : ink.gold, 2.4)
          }
          const shoulder = lead ? 159 : 169
          rect(ctx, shoulder, 169, 21, 78, ink.dark, accent('body', ink.steel))
          rect(ctx, 600 - shoulder - 21, 169, 21, 78, ink.dark, accent('body', ink.steel))
          if (elastomer) {
            rect(ctx, xs[0] - 15, tipY, xs[xs.length - 1] - xs[0] + 30, BOARD_Y - tipY - 2, '#365568', accent('pin', ink.steel), 5)
          }
          for (const x of xs) {
            if (gap > 1) line(ctx, [[x, terminalY + 1], [x, tipY - 1]], ink.guide, 1.2, [3, 4])
            if (elastomer) {
              line(ctx, [[x, tipY], [x, BOARD_Y - 2]], accent('pin', ink.gold), 4)
              dot(ctx, x, tipY, 2, accent('pin', ink.gold))
              continue
            }
            const barrelY = BOARD_Y - 35
            const barrelWidth = contact === 'spring' ? 12 : 19
            rect(ctx, x - barrelWidth / 2, barrelY, barrelWidth, 32, ink.dark, accent('pin', ink.steel))
            line(ctx, [[x, BOARD_Y - 2], [x, BOARD_Y]], ink.gold, 4)
            line(ctx, [[x, tipY], [x, barrelY + 7]], accent('pin', ink.gold), contact === 'spring' ? 4 : 7)
            const spring = Array.from({ length: 9 }, (_, i): readonly [number, number] => [x + (i % 2 === 0 ? -3.5 : 3.5), barrelY + 8 + i * 2.3])
            line(ctx, spring, accent('pin', ink.copper), 1.4)
            dot(ctx, x, tipY, 2, accent('pin', ink.gold))
          }

          rect(ctx, 224, packageTop, 152, 39, '#395d7e', accent('dut', ink.wafer), 7)
          rect(ctx, 267, packageTop + 11, 66, 14, '#688fb9', undefined, 3)
          line(ctx, [[233, packageBottom - 6], [367, packageBottom - 6]], '#85afcb', 1.5)
          for (const x of xs) {
            if (ball) {
              dot(ctx, x, terminalY - 12, 12, ink.copper)
              dot(ctx, x - 3, terminalY - 15, 4, ink.gold)
            } else if (lead) {
              const edge = x < 300 ? 224 : 376
              const outward = x < 300 ? -1 : 1
              curve(ctx, `M${edge} ${packageBottom - 13} H${edge + outward * 8} L${x - outward * 4} ${terminalY - 2.5} H${x + outward * 7}`, ink.gold, 5)
            } else {
              rect(ctx, x - 11, terminalY - 5, 22, 5, ink.copper, undefined, 1)
            }
          }
          rect(ctx, 207, lidBottom - 25, 186, 25, '#55778a', accent('lid', ink.steel), 6)
          for (const x of [258, 300, 342]) {
            line(ctx, [[x, lidBottom - 47], [x, lidBottom - 29]], ink.wafer, 1.7)
            line(ctx, [[x - 4, lidBottom - 34], [x, lidBottom - 29], [x + 4, lidBottom - 34]], ink.wafer, 1.7)
          }
          if (active) {
            ctx.shadowColor = ink.trace
            ctx.shadowBlur = 9
            line(ctx, [[selectedX, terminalY], [selectedX, BOARD_Y]], ink.trace, 2.3)
            dot(ctx, selectedX, terminalY, 4, ink.trace)
            ctx.shadowBlur = 0
          }

          leader(ctx, 207, lidBottom - 12, 167, 115, t(loc('压盖', 'Lid')))
          leader(ctx, 376, packageTop + 17, 425, 465, t(loc('封装', 'Package')))
          leader(ctx, shoulder + 8, 206, 142, 115, t(loc('定位腔', 'Socket body')))
          leader(ctx, xs[xs.length - 1], BOARD_Y - 12, 427, 465, t(loc('接触件', 'Contact')))
          leader(ctx, 445, 263, 453, 465, t(loc('负载板', 'Load board')))
          label(ctx, 300, 293, t(loc('截面示意 · 位移放大', 'Cross-section · motion exaggerated')), ink.label, 'center', 15)
        }} />
      <DiagramChoices label={loc('装入与压合步骤', 'Insertion and compression steps')} items={STAGES}
        value={String(stage)} onPick={(id) => onStage(Number(id))} />
      <StagePlayer count={STAGES.length} step={stage} onStep={onStage} />
      <p className="hardware-detail">{t(focusNote)}</p>
    </Diagram>
  )
}
