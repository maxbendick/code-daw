import { Signal } from '../../lib/signal'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { EdgeType } from '../priv/no-sig-types/edge-types'
import { GraphNodeBaseType } from '../priv/no-sig-types/graph-node-base-type'
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
  { phase: 'signal' },
  'signal',
  SineConfig
> = {
  nodeType: sineNodeType,
  inputs: { phase: 'signal' },
  output: EdgeType.Signal,
  config: (null as any) as SineConfig,
}

export type SineNodeEphemeral = typeof SineGraphNodeDefinition

const SineRaw = makeNodeMaker<SineNodeEphemeral, [phase: Signal<any>]>(
  ({ id }, phase) => {
    return {
      type: sineNodeType,
      inputs: { phase } as any,
      config: {},
    }
  },
)

// TODO better typing
export const sine: (config: SineConfig) => Signal<number> = SineRaw as any
