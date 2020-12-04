import { injectAudioContext } from '../../../../runtime/utils'
import { Signal } from '../../../sigs'
import { makeNodeMaker } from '../../makeNodeMaker'
import { EdgeType } from '../../no-sig-types/edge-types'
import { GraphNodeBaseType } from '../../no-sig-types/graph-node-base-type'
import { SuperDef } from '../../no-sig-types/super-def'

export const sineNodeType = 'oscillators/sine' as const

type SineConfig = {}

export const sineGraphNodeDefinition: GraphNodeBaseType = {
  nodeType: sineNodeType,
  inputs: { frequency: 'signal' },
  output: EdgeType.Signal,
  config: (null as any) as SineConfig,
}

type SineArgs = [frequency: Signal<number>, phase: Signal<number>]

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

export const superSineDef: SuperDef = {
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
}
