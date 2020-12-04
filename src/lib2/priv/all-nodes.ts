import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'
import {
  dialGraphNodeDefinition,
  DialNodeEphemeral,
  dialNodeType,
} from './nodes/interactables/dial'
import {
  sineGraphNodeDefinition,
  SineNodeEphemeral,
  sineNodeType,
} from './nodes/oscillators/sine'

export type GraphNodeEphemeral = DialNodeEphemeral | SineNodeEphemeral

// proof that all GraphNodeEphemerals are GraphNodeBaseTypes
const testValue: GraphNodeBaseType = (null as any) as GraphNodeEphemeral

export const nodeDefinitions: GraphNodeBaseType[] = [
  dialGraphNodeDefinition,
  sineGraphNodeDefinition,
]

export type NodeType = typeof dialNodeType
export const NodeType = {
  Dial: dialNodeType,
  Sine: sineNodeType,
}

export const getGraphNodeDefinition = (
  nodeType: NodeType,
): GraphNodeBaseType => {
  const result = nodeDefinitions.find(d => d.nodeType === nodeType)

  if (!result) {
    throw new Error(`could not find definition for node type ${nodeType}`)
  }

  return result
}
