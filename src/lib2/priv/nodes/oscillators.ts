import { Observable } from 'rxjs'
import { EdgeType } from '../no-sig-types/edge-types'
import { ConfigValidationError, SuperDef } from '../no-sig-types/super-def'
import { makeOscillator } from '../webaudio-utils'

type AudioNodeLike = Observable<number> | AudioNode

type Config = {}

type Args = [{ frequency: AudioNodeLike; fm?: AudioNode }]

type Inputs = {
  frequency: AudioNodeLike
  fm?: AudioNode
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
    argsToInputs: (...[{ frequency, fm }]: Args): Inputs => {
      if (!frequency) {
        throw new ConfigValidationError(nodeType, { frequency, fm })
      }
      if (fm) {
        return {
          frequency,
          fm,
        }
      }
      return {
        frequency,
      }
    },
    argsToConfig: (...[{ frequency, fm }]: Args): Config => ({}),
    makeOutput: (
      audioContext: AudioContext,
      config: Config,
      { frequency, fm }: Inputs,
    ) => {
      // TODO unsubscribe
      const { output, subscription } = makeOscillator(audioContext, {
        type: oscillatorType,
        frequency: frequency as any,
        fm: fm,
      })
      return { output, subscription }
    },
    skipInputVerification: true,
  } as const)

const _proof: SuperDef = baseOsc('oscillators/sine', 'sine')

export const oscillatorDefs = [
  baseOsc('oscillators/saw', 'sawtooth'),
  baseOsc('oscillators/sine', 'sine'),
  baseOsc('oscillators/triangle', 'triangle'),
  baseOsc('oscillators/square', 'square'),
] as const
