import { Signal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'
import { injectAudioContext } from '../../webaudio-utils'

const nodeType = 'oscillators/saw' as const

type Config = {}

type Args = [frequency: Signal<number>]

export const superSawDef = {
  nodeType: nodeType,
  inputs: { frequency: EdgeType.Signal },
  output: EdgeType.AudioSignal,
  interactable: false,
  argsToInputs: (...[frequency]: Args) => ({ frequency }),
  argsToConfig: (...[frequency]: Args): Config => ({}),
  makeOutput: (audioContext: AudioContext, config: Config, inputs: any) => {
    const { makeOscillator } = injectAudioContext(audioContext)
    const osc = makeOscillator('sawtooth', inputs['frequency'])
    return osc
  },
} as const

const _proof: SuperDef = superSawDef
