import { Signal } from '../../../sigs'
import { makeNodeMaker } from '../../makeNodeMaker'
import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'
import { injectAudioContext } from '../../webaudio-utils'

const sineNodeType = 'oscillators/sine' as const

type SineConfig = {}

type SineArgs = [frequency: Signal<number>]

const sineRaw = makeNodeMaker<SineArgs>(({ id }, frequency) => {
  return {
    type: sineNodeType,
    inputs: { frequency } as any,
    config: {},
  }
})

// TODO better typing
const sine: (...args: SineArgs) => Signal<number> = (...args) => {
  return (sineRaw(...args) as any) as Signal<number>
}

export const superSineDef = {
  nodeType: sineNodeType,
  publicFunction: sine,
  inputs: { frequency: EdgeType.Signal },
  output: EdgeType.AudioSignal,
  interactable: false,
  verifyConfig: (config: SineConfig) => {
    if (Object.keys(config).length) {
      console.error('sine config', config)
      throw new Error('bad sine config')
    }
  },
  makeOutput: (audioContext: AudioContext, config: SineConfig, inputs: any) => {
    const { makeOscillator } = injectAudioContext(audioContext)
    const osc = makeOscillator(inputs['frequency'])
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
  argsToConfig: (frequency: Signal<number>): SineConfig => ({}),
} as const

const _proof: SuperDef = superSineDef
