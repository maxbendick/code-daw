import {
  dialGraphNodeDefinition,
  DialNodeEphemeral,
  dialNodeType,
} from '../interactables/dial'
import {
  SineGraphNodeDefinition,
  SineNodeEphemeral,
  sineNodeType,
} from '../oscillators/sine'
import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'

export type GraphNodeEphemeral = DialNodeEphemeral | SineNodeEphemeral

// proof that all GraphNodeEphemerals are GraphNodeBaseTypes
const testValue: GraphNodeBaseType<
  any,
  any,
  any,
  any
> = (null as any) as GraphNodeEphemeral

export const nodeDefinitions: GraphNodeBaseType<any, any, any, any>[] = [
  dialGraphNodeDefinition,
  SineGraphNodeDefinition,
]

export type NodeType = typeof dialNodeType
export const NodeType = {
  Dial: dialNodeType,
  Sine: sineNodeType,
}

export const getGraphNodeDefinition = (
  nodeType: NodeType,
): GraphNodeBaseType<any, any, any, any> => {
  const result = nodeDefinitions.find(d => d.nodeType === nodeType)

  if (!result) {
    throw new Error(`could not find definition for node type ${nodeType}`)
  }

  return result
}
