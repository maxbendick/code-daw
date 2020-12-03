// import { Signal } from '../lib/signal'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { EdgeType } from '../priv/no-sig-types/edge-types'
import { GraphNodeBaseType } from '../priv/no-sig-types/graph-node-base-type'
import { Signal } from '../sigs'
// import { GraphNodeDefinition } from '../priv/no-sig-types/graph-node-definition'

export const sineNodeType = 'oscillators/sine' as const

export type SineConfig = {}

// export type SineNodeEphemeral = GraphNodeBaseType<
//   typeof sineNodeType,
//   { phase: 'signal' },
//   'signal',
//   SineConfig
// >

export const SineGraphNodeDefinition: GraphNodeBaseType<
  typeof sineNodeType,
  { frequency: 'signal' },
  'signal',
  SineConfig
> = {
  nodeType: sineNodeType,
  inputs: { frequency: 'signal' },
  output: EdgeType.Signal,
  config: (null as any) as SineConfig,
}

export type SineNodeEphemeral = typeof SineGraphNodeDefinition

type SineArgs = [frequency: Signal<number>, phase: Signal<number>]

const SineRaw = makeNodeMaker<SineNodeEphemeral, SineArgs>(
  ({ id }, frequency) => {
    return {
      type: sineNodeType,
      inputs: { frequency } as any,
      config: {},
    }
  },
)

// TODO better typing
const sine: (...args: SineArgs) => Signal<number> = (...args) => {
  console.log('sine!!!')
  return (SineRaw(...args) as any) as Signal<number>
}

export const _oscillators_exports = {
  packageName: 'code-daw/oscillators' as const,
  content: {
    sine,
  },
}
