import { Observable } from 'rxjs'
import { startWith } from 'rxjs/operators'
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
  inputs: {},
  output: EdgeType.Signal,
  interactable: true,
  argsToInputs: (...[config]: Args) => ({}),
  argsToConfig: (...[config]: Args) => {
    for (const k of ['start', 'end', 'defaultValue']) {
      if (typeof (config as any)[k] !== 'number') {
        throw new ConfigValidationError(nodeType, config)
      }
    }
    return config
  },
  makeOutput: (
    audioContext: AudioContext,
    config: Config,
    inputs: any,
    send$?: Observable<any>,
  ) => {
    return send$?.pipe(startWith(config.defaultValue))
  },
} as const

const _proof: SuperDef = superDialDef
