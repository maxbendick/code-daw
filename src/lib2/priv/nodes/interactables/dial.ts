import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'

const dialNodeType = 'interactables/dial' as const

type DialConfig = {
  start: number
  end: number
  defaultValue: number
}

// const dial: (config: DialConfig) => Signal<number> = dialRaw as any
export const superDialDef = {
  nodeType: dialNodeType,
  inputs: { frequency: EdgeType.Signal },
  output: EdgeType.AudioSignal,
  interactable: true,
  verifyConfig: (config: DialConfig) => {
    for (const k of ['start', 'end', 'defaultValue']) {
      if (typeof (config as any)[k] !== 'number') {
        throw new Error('Bad dial config')
      }
    }
  },
  makeOutput: (audioContext: AudioContext, config: DialConfig, inputs: any) => {
    // const { makeOscillator } = injectAudioContext(audioContext)
    // const osc = makeOscillator(inputs['frequency'])
    // return osc
    throw new Error('Interactable doesnt need makeOutput')
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

  argsToInputs: (config: DialConfig) => ({}),
  argsToConfig: (config: DialConfig) => config,
} as const

const _proof: SuperDef = superDialDef
