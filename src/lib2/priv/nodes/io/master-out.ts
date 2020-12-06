import { AudioSignal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { ConfigValidationError, SuperDef } from '../../no-sig-types/super-def'
import { toMaster } from '../../webaudio-utils'

const nodeType = 'io/masterOut' as const

type Config = {}

type Args = [signal: AudioSignal]

// Available for editor
// const masterOut: (...args: MasterOutArgs) => Signal<number> = (...args) => {
//   console.log('master out!!!')
//   return (masterOutRaw(...args) as any) as Signal<number>
// }
let _masterOutResult: ReturnType<typeof toMaster> = null as any

// This is a special def. One of a kind
export const superMasterOutDef = {
  nodeType: nodeType,
  inputs: { audioToOutput: EdgeType.AudioSignal },
  output: 'nothing',
  interactable: false,
  verifyConfig: (config: Config) => {
    if (Object.keys(config).length !== 0) {
      throw new ConfigValidationError(nodeType, config)
    }
  },
  argsToInputs: (...[signal]: Args) => ({ audioToOutput: signal }),
  argsToConfig: (...[signal]: Args): Config => ({}),
  makeOutput: (audioContext: AudioContext, config: Config, inputs: any) => {
    if (_masterOutResult) {
      throw new Error('cannot have two master outs')
    }
    _masterOutResult = toMaster(
      audioContext,
      inputs['audioToOutput'] as AudioNode,
    )
    return 'nothing'
  },
  destroy: () => {
    _masterOutResult.destroy()
    _masterOutResult = null as any
  },
} as const

const _proof: SuperDef = superMasterOutDef
