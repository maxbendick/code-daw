import { interval, Subscription } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { EdgeType } from '../no-sig-types/edge-types'
import { SuperDef } from '../no-sig-types/super-def'

type Config = {
  rate: number
  values: number[]
}

type Args = [Config]

type Inputs = {}

const nodeType = 'sequencers/simpleSequencer'

export const superSequencerDef = {
  nodeType: nodeType,
  inputs: {},
  output: EdgeType.Signal,
  interactable: false,
  argsToInputs: (...args: Args): Inputs => ({}),
  argsToConfig: (...[{ rate, values }]: Args): Config => ({ rate, values }),
  makeOutput: (audioContext: AudioContext, config: Config, inputs: Inputs) => {
    const { rate, values } = config

    const output = interval(rate).pipe(
      map(count => values[(count + 1) % values.length]),
      startWith(values[0]),
    )

    return { output, subscription: new Subscription() }
  },
} as const

const _proof: SuperDef = superSequencerDef
