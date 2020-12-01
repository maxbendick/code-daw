import {
  dialGraphNodeDefinition,
  DialNodeEphemeral,
  dialNodeType,
} from './dial'
import { GraphNodeDefinition } from './graph-node-definition'

export type GraphNodeEphemeral = DialNodeEphemeral

export const nodeDefinitions: GraphNodeDefinition<any>[] = [
  dialGraphNodeDefinition,
]

export type NodeType = typeof dialNodeType
export const NodeType = {
  Dial: dialNodeType,
}

export const getGraphNodeDefinition = (
  nodeType: NodeType,
): GraphNodeDefinition<any> => {
  const result = nodeDefinitions.find(d => d.nodeType === nodeType)

  if (!result) {
    throw new Error(`could not find definition for node type ${nodeType}`)
  }

  return result
}
