import { EdgeType } from '../../no-sig-types/edge-types'
import { ConfigValidationError, SuperDef } from '../../no-sig-types/super-def'

const nodeType = 'interactables/dial' as const

type Config = {
  start: number
  end: number
  defaultValue: number
}

type Args = [config: Config]

export const superDialDef = {
  nodeType: nodeType,
  inputs: { frequency: EdgeType.Signal },
  output: EdgeType.AudioSignal,
  interactable: true,
  verifyConfig: (config: Config) => {
    for (const k of ['start', 'end', 'defaultValue']) {
      if (typeof (config as any)[k] !== 'number') {
        throw new ConfigValidationError(nodeType, config)
      }
    }
  },
  argsToInputs: (...[config]: Args) => ({}),
  argsToConfig: (...[config]: Args) => config,
  makeOutput: (audioContext: AudioContext, config: Config, inputs: any) => {
    throw new Error('Interactable doesnt need makeOutput')
  },
} as const

const _proof: SuperDef = superDialDef
