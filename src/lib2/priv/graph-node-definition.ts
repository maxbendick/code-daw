import { GraphNodeEphemeral } from './all-nodes'
import { SigToEdgeType } from './edge-and-node-types'
import {
  InputEdgeTypesOf,
  NodeTypeOf,
  OutputOf,
} from './graph-node-ephemeral-utils'

export type GraphNodeDefinition<G extends GraphNodeEphemeral> = {
  nodeType: NodeTypeOf<G>
  inputs: InputEdgeTypesOf<G>
  output: SigToEdgeType<OutputOf<G>>
  interactable: boolean
}
