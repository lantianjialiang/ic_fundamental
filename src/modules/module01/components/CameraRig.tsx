import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useScene, type SceneConfig, type SceneStore } from '../context/SceneContext'
import { CAMERA_LIMITS, CAMERA_PRESET, FLOOR_Y, LAYER_BOX } from '../data/layout'

type CameraRigProps = {
  /** 每次变化都回到当前流程的默认视角 */
  resetKey: number
}

type Goal = { pos: Vector3; target: Vector3 }

type OrbitLike = {
  target: Vector3
  maxPolarAngle: number
  update: () => void
  addEventListener: (type: 'start', fn: () => void) => void
  removeEventListener: (type: 'start', fn: () => void) => void
}

/** 镜头跟随的「锚点」高度：聚焦某层时跟随该层，否则跟随分解进度 */
function anchorY(store: SceneStore, cfg: SceneConfig): number {
  if (cfg.focus) return store.pose.y[cfg.focus]
  return store.explode * CAMERA_PRESET[cfg.flow].explodeShift
}

/**
 * 镜头：切 FT/CP、重置、聚焦某层时平滑过渡；分解时随叠层上移；
 * 用户一拖动就取消正在进行的过渡。
 */
export function CameraRig({ resetKey }: CameraRigProps) {
  const { store, cfg } = useScene()
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null
  const goal = useRef<Goal | null>(null)
  const lastAnchor = useRef(0)
  const initialized = useRef(false)
  const cfgRef = useRef(cfg)
  cfgRef.current = cfg

  useEffect(() => {
    const c = cfgRef.current
    if (!controls || c.focus) return
    const preset = CAMERA_PRESET[c.flow]
    const shift = store.explode * preset.explodeShift
    lastAnchor.current = shift
    const target = new Vector3(...preset.target).add(new Vector3(0, shift, 0))
    const pos = new Vector3(...preset.position).add(new Vector3(0, shift, 0))
    if (!initialized.current) {
      initialized.current = true
      controls.target.copy(target)
      camera.position.copy(pos)
      controls.update()
      return
    }
    goal.current = { pos, target }
  }, [controls, camera, cfg.flow, cfg.focus, resetKey, store])

  useEffect(() => {
    const c = cfgRef.current
    if (!controls || !c.focus) return
    const box = LAYER_BOX[c.flow][c.focus]
    if (!box) return
    lastAnchor.current = store.pose.y[c.focus]
    const center = new Vector3(box.c[0] + store.pose.x[c.focus], box.c[1] + store.pose.y[c.focus], box.c[2])
    const dir = camera.position.clone().sub(controls.target).normalize()
    const dist = Math.max(2.6, Math.max(box.s[0], box.s[2]) * 1.7)
    goal.current = { pos: center.clone().addScaledVector(dir, dist), target: center }
  }, [controls, camera, cfg.focus, cfg.flow, store])

  useEffect(() => {
    if (!controls) return
    const cancel = () => {
      goal.current = null
    }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, rawDt) => {
    if (!controls) return
    const dt = Math.min(rawDt, 0.05)
    const anchor = anchorY(store, cfg)
    const delta = anchor - lastAnchor.current
    lastAnchor.current = anchor
    if (Math.abs(delta) > 1e-6) {
      camera.position.y += delta
      controls.target.y += delta
      if (goal.current) {
        goal.current.pos.y += delta
        goal.current.target.y += delta
      }
    }
    const g = goal.current
    if (g) {
      const k = cfg.reduced ? 1 : 1 - Math.exp(-dt * 4.5)
      camera.position.lerp(g.pos, k)
      controls.target.lerp(g.target, k)
      if (camera.position.distanceTo(g.pos) < 0.005 && controls.target.distanceTo(g.target) < 0.005) goal.current = null
    }

    // 不钻到地面下：平移时目标点不低于地面；俯仰下限按「镜头高度 ≥ 地面 + floorClear」随距离收紧
    const minY = FLOOR_Y + CAMERA_LIMITS.floorClear
    let clamped = false
    if (controls.target.y < minY) {
      controls.target.y = minY
      clamped = true
    }
    const dist = Math.max(1e-3, camera.position.distanceTo(controls.target))
    const cosMax = Math.min(1, Math.max(-1, (minY - controls.target.y) / dist))
    controls.maxPolarAngle = Math.max(CAMERA_LIMITS.minPolar, Math.min(CAMERA_LIMITS.maxPolar, Math.acos(cosMax)))

    if (g || clamped || Math.abs(delta) > 1e-6) controls.update()
  })

  return null
}
