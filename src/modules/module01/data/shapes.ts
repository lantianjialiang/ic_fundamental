import { ExtrudeGeometry, Path, Shape } from 'three'

/** 方框（外框 w×d，内孔 iw×id），沿 +Y 拉伸 h，底面在 y=0 */
export function frameGeometry(w: number, d: number, iw: number, id: number, h: number): ExtrudeGeometry {
  const s = new Shape()
  s.moveTo(-w / 2, -d / 2)
  s.lineTo(w / 2, -d / 2)
  s.lineTo(w / 2, d / 2)
  s.lineTo(-w / 2, d / 2)
  s.closePath()
  const hole = new Path()
  hole.moveTo(-iw / 2, -id / 2)
  hole.lineTo(-iw / 2, id / 2)
  hole.lineTo(iw / 2, id / 2)
  hole.lineTo(iw / 2, -id / 2)
  hole.closePath()
  s.holes.push(hole)
  const g = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  return g
}

/** 圆环（内半径 rIn、外半径 rOut），沿 +Y 拉伸 h，底面在 y=0 */
export function annulusGeometry(rIn: number, rOut: number, h: number, segments = 64): ExtrudeGeometry {
  const s = new Shape()
  s.absarc(0, 0, rOut, 0, Math.PI * 2, false)
  const hole = new Path()
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true)
  s.holes.push(hole)
  const g = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: segments })
  g.rotateX(-Math.PI / 2)
  return g
}

/** 外形 + 若干矩形缺口 / 圆孔的方块（Socket 壳体用），沿 +Y 拉伸 h */
export function socketHousingGeometry(outer: number, pocket: number, h: number): ExtrudeGeometry {
  const o = outer / 2
  const notch = 0.18
  const nd = 0.06
  const s = new Shape()
  s.moveTo(-o, -o)
  s.lineTo(-notch, -o)
  s.lineTo(-notch, -o + nd)
  s.lineTo(notch, -o + nd)
  s.lineTo(notch, -o)
  s.lineTo(o, -o)
  s.lineTo(o, -notch)
  s.lineTo(o - nd, -notch)
  s.lineTo(o - nd, notch)
  s.lineTo(o, notch)
  s.lineTo(o, o)
  s.lineTo(notch, o)
  s.lineTo(notch, o - nd)
  s.lineTo(-notch, o - nd)
  s.lineTo(-notch, o)
  s.lineTo(-o, o)
  s.lineTo(-o, notch)
  s.lineTo(-o + nd, notch)
  s.lineTo(-o + nd, -notch)
  s.lineTo(-o, -notch)
  s.closePath()
  const p = pocket / 2
  const ch = 0.08
  const hole = new Path()
  hole.moveTo(-p + ch, -p)
  hole.lineTo(-p, -p + ch)
  hole.lineTo(-p, p)
  hole.lineTo(p, p)
  hole.lineTo(p, -p)
  hole.closePath()
  s.holes.push(hole)
  const r = (o + p) / 2
  for (const [x, y] of [
    [-r, -r],
    [r, -r],
    [r, r],
    [-r, r],
  ]) {
    const screw = new Path()
    screw.absarc(x!, y!, 0.05, 0, Math.PI * 2, true)
    s.holes.push(screw)
  }
  const g = new ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 16,
  })
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0.012, 0)
  return g
}
