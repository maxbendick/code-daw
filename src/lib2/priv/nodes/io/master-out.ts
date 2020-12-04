import { AudioSignal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'
import { toMaster } from '../../webaudio-utils'

const masterOutNodeType = 'io/masterOut' as const

type MasterOutConfig = {}

// type MasterOutArgs = [signal: AudioSignal]

// Available for editor
// const masterOut: (...args: MasterOutArgs) => Signal<number> = (...args) => {
//   console.log('master out!!!')
//   return (masterOutRaw(...args) as any) as Signal<number>
// }
let _masterOutResult: ReturnType<typeof toMaster> = null as any

export const superMasterOutDef = {
  nodeType: masterOutNodeType,
  inputs: { audioToOutput: EdgeType.AudioSignal },
  output: 'nothing',
  interactable: false,
  verifyConfig: (config: MasterOutConfig) => {
    if (Object.keys(config).length !== 0) {
      throw new Error('bad master out config')
    }
  },
  makeOutput: (
    audioContext: AudioContext,
    config: MasterOutConfig,
    inputs: any,
  ) => {
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

  get publicName() {
    const result = this.nodeType.split('/')[1]
    if (!result) {
      throw new Error('could not get publicName')
    }
    return result
  },
  get packageName() {
    const split = this.nodeType.split('/')
    const result = `code-daw/${split[0]}`
    if (!result) {
      throw new Error('could not get publicName')
    }
    return result
  },

  argsToInputs: (signal: AudioSignal) => ({ audioToOutput: signal }),
  argsToConfig: (signal: AudioSignal): MasterOutConfig => ({}),
} as const

const _proof: SuperDef = superMasterOutDef
