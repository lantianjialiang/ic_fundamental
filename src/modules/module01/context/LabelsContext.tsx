import { createContext } from 'react'

/** 3D 内 Html 标注默认关闭，避免挡模型和缩放后字号失控 */
export const LabelsContext = createContext(false)
