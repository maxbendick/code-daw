import { EdgeType } from '../priv/edge-and-node-types'
import { GraphNodeBaseType } from '../priv/graph-node-base-type'
import { GraphNodeDefinition } from '../priv/graph-node-definition'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { Signal } from '../sigs'

export const sineNodeType = 'oscillators/sine' as const

export type SineConfig = {}

export type SineNodeEphemeral = GraphNodeBaseType<
  typeof sineNodeType,
  {},
  Signal<any>,
  SineConfig
>

export const SineGraphNodeDefinition: GraphNodeDefinition<SineNodeEphemeral> = {
  nodeType: sineNodeType,
  inputs: {},
  output: EdgeType.Signal,
}

const SineRaw = makeNodeMaker<SineNodeEphemeral, [config: SineConfig]>(
  null as any,
  ({ id }, config) => {
    return {
      type: sineNodeType,
      inputs: {},
      config,
    }
  },
)

// TODO better typing
export const sine: (config: SineConfig) => Signal<number> = SineRaw as any
