import { EdgeType } from '../priv/edge-and-node-types'
import { GraphNodeInteractableBaseType } from '../priv/graph-node-base-type'
import { GraphNodeDefinition } from '../priv/graph-node-definition'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { Signal } from '../sigs'

export const sineNodeType = 'oscillators/sine' as const

type SineSends = number
type SineReceives = number

export type SineConfig = {}

export type SineNodeEphemeral = GraphNodeInteractableBaseType<
  typeof sineNodeType,
  {},
  Signal<number>,
  SineConfig,
  SineSends,
  SineReceives
>

export const SineGraphNodeDefinition: GraphNodeDefinition<SineNodeEphemeral> = {
  nodeType: sineNodeType,
  inputs: {},
  output: EdgeType.Signal,
  interactable: true,
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
