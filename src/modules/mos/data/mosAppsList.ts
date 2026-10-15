import { type CircuitDef } from './mosApps'
import { GPIO_CIRCUIT } from './mosAppsGpio'
import { HBRIDGE_CIRCUIT } from './mosAppsHb'
import { I2C_CIRCUIT } from './mosAppsI2c'
import { LOADSW_CIRCUIT } from './mosAppsLoadSw'
import { OD_CIRCUIT } from './mosAppsOd'
import { REVPOL_CIRCUIT } from './mosAppsRevPol'
import { SOFT_CIRCUIT } from './mosAppsSoft'

/** 显示顺序就是选择器顺序，默认选第一个 */
export const CIRCUITS: CircuitDef[] = [GPIO_CIRCUIT, LOADSW_CIRCUIT, REVPOL_CIRCUIT, I2C_CIRCUIT, OD_CIRCUIT, HBRIDGE_CIRCUIT, SOFT_CIRCUIT]
