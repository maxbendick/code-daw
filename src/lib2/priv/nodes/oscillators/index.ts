import { Signal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { SuperDef } from '../../no-sig-types/super-def'
import { injectAudioContext } from '../../webaudio-utils'

type Config = {}

type Args = [frequency: Signal<number>]

const baseOsc = <NodeT extends string, Osc extends OscillatorType>(
  nodeType: NodeT,
  oscillatorType: Osc,
) =>
  ({
    nodeType: nodeType,
    inputs: { frequency: EdgeType.Signal },
    output: EdgeType.AudioSignal,
    interactable: false,
    argsToInputs: (...[frequency]: Args) => ({ frequency }),
    argsToConfig: (...[frequency]: Args): Config => ({}),
    makeOutput: (audioContext: AudioContext, config: Config, inputs: any) => {
      const { makeOscillator } = injectAudioContext(audioContext)
      const osc = makeOscillator(oscillatorType, inputs['frequency'])
      return osc
    },
  } as const)

const _proof: SuperDef = baseOsc('oscillators/sine', 'sine')

export const oscillatorDefs = [
  baseOsc('oscillators/saw', 'sawtooth'),
  baseOsc('oscillators/sine', 'sine'),
  baseOsc('oscillators/triangle', 'triangle'),
  baseOsc('oscillators/square', 'square'),
] as const
