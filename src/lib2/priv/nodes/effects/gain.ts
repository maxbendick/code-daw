import { AudioSignal, Signal } from '../../../sigs'
import { EdgeType } from '../../no-sig-types/edge-types'
import { makeGain } from '../../webaudio-utils'

type Config = {}

type Args = [gainValue: Signal<number> | AudioSignal, source: AudioSignal]

type Inputs = {
  gainValue: Signal<number> | AudioSignal
  source: AudioSignal
}

const nodeType = 'effects/gain'

export const superGainDef = {
  nodeType: nodeType,
  inputs: { gainValue: EdgeType.Signal, source: EdgeType.AudioSignal },
  output: EdgeType.AudioSignal,
  interactable: false,
  argsToInputs: (...[gainValue, source]: Args): Inputs => ({
    gainValue,
    source,
  }),
  argsToConfig: (...args: Args): Config => ({}),
  makeOutput: (
    audioContext: AudioContext,
    config: Config,
    { gainValue, source }: Inputs,
  ) => {
    // TODO unsubscribe
    const { output, subscription } = makeGain(
      audioContext,
      gainValue as any,
      source as any,
    )
    return output
  },
} as const
