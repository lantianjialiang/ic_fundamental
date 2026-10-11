import { type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry, type Material } from 'three'
import type { Vec3 } from '../data/layout'

export type InstanceItem = {
  p: Vec3
  r?: Vec3
  s?: Vec3 | number
  c?: string
}

type InstancedPartsProps = {
  geometry: BufferGeometry
  material: Material
  items: InstanceItem[]
  castShadow?: boolean
  receiveShadow?: boolean
  onClick?: (event: ThreeEvent<MouseEvent>) => void
}

const tmpM = new Matrix4()
const tmpP = new Vector3()
const tmpQ = new Quaternion()
const tmpE = new Euler()
const tmpS = new Vector3()
const tmpC = new Color()
const UP = new Vector3(0, 1, 0)

export function writeInstance(mesh: InstancedMesh, i: number, item: InstanceItem) {
  tmpP.set(item.p[0], item.p[1], item.p[2])
  if (item.r) tmpQ.setFromEuler(tmpE.set(item.r[0], item.r[1], item.r[2]))
  else tmpQ.identity()
  if (item.s === undefined) tmpS.set(1, 1, 1)
  else if (typeof item.s === 'number') tmpS.setScalar(item.s)
  else tmpS.set(item.s[0], item.s[1], item.s[2])
  tmpM.compose(tmpP, tmpQ, tmpS)
  mesh.setMatrixAt(i, tmpM)
  if (item.c) mesh.setColorAt(i, tmpC.set(item.c))
}

const segA = new Vector3()
const segB = new Vector3()
const segD = new Vector3()

/** 把单位圆柱（高 1、半径 1，沿 Y）摆成 a→b 的一段杆，半径 r */
export function writeSegment(mesh: InstancedMesh, i: number, a: Vec3, b: Vec3, r: number) {
  segA.set(a[0], a[1], a[2])
  segB.set(b[0], b[1], b[2])
  segD.subVectors(segB, segA)
  const len = Math.max(1e-5, segD.length())
  tmpQ.setFromUnitVectors(UP, segD.divideScalar(len))
  tmpP.addVectors(segA, segB).multiplyScalar(0.5)
  tmpS.set(r, len, r)
  tmpM.compose(tmpP, tmpQ, tmpS)
  mesh.setMatrixAt(i, tmpM)
}

/** 静态实例化部件：items 变化时一次性写入矩阵与颜色（一个 draw call） */
export function InstancedParts({ geometry, material, items, castShadow, receiveShadow, onClick }: InstancedPartsProps) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    items.forEach((item, i) => writeInstance(mesh, i, item))
    mesh.count = items.length
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
    mesh.computeBoundingBox()
  }, [items])

  return (
    <instancedMesh
      key={items.length}
      ref={meshRef}
      args={[geometry, material, Math.max(1, items.length)]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onClick={onClick}
    />
  )
}
