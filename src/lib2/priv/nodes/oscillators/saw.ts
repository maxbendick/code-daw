import { Signal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'
import { injectAudioContext } from '../../webaudio-utils'

const sawNodeType = 'oscillators/saw' as const

type SawConfig = {}

// type SineArgs = [frequency: Signal<number>]

// const sine: (...args: SineArgs) => Signal<number> = (...args) => {
//   return (sineRaw(...args) as any) as Signal<number>
// }

export const superSawDef = {
  nodeType: sawNodeType,
  inputs: { frequency: EdgeType.Signal },
  output: EdgeType.AudioSignal,
  interactable: false,
  verifyConfig: (config: SawConfig) => {
    if (Object.keys(config).length) {
      console.error('saw config', config)
      throw new Error('bad saw config')
    }
  },
  makeOutput: (audioContext: AudioContext, config: SawConfig, inputs: any) => {
    const { makeOscillator } = injectAudioContext(audioContext)
    const osc = makeOscillator('sawtooth', inputs['frequency'])
    return osc
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

  argsToInputs: (frequency: Signal<number>) => ({ frequency }),
  argsToConfig: (frequency: Signal<number>): SawConfig => ({}),
} as const

const _proof: SuperDef = superSawDef
