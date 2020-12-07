import { Signal } from '../../sigs'
import { EdgeType } from '../no-sig-types/edge-types'
import { SuperDef } from '../no-sig-types/super-def'
import { makeOscillator } from '../webaudio-utils'

type Config = {}

type Args = [{ frequency: Signal<number> }]

type Inputs = {
  frequency: Signal<number>
}

const baseOsc = <NodeT extends string, Osc extends OscillatorType>(
  nodeType: NodeT,
  oscillatorType: Osc,
) =>
  ({
    nodeType: nodeType,
    inputs: { frequency: EdgeType.Signal },
    output: EdgeType.AudioSignal,
    interactable: false,
    argsToInputs: (...[{ frequency }]: Args): Inputs => ({
      frequency,
    }),
    argsToConfig: (...args: Args): Config => ({}),
    makeOutput: (
      audioContext: AudioContext,
      config: Config,
      { frequency }: Inputs,
    ) => {
      // TODO unsubscribe
      const { output, subscription } = makeOscillator(audioContext, {
        type: oscillatorType,
        frequency: frequency as any,
      })
      return { output, subscription }
    },
  } as const)

const _proof: SuperDef = baseOsc('oscillators/sine', 'sine')

export const oscillatorDefs = [
  baseOsc('oscillators/saw', 'sawtooth'),
  baseOsc('oscillators/sine', 'sine'),
  baseOsc('oscillators/triangle', 'triangle'),
  baseOsc('oscillators/square', 'square'),
] as const
