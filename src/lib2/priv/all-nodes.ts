import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'
import {
  dialGraphNodeDefinition,
  dialNodeType,
} from './nodes/interactables/dial'
import { sineGraphNodeDefinition, sineNodeType } from './nodes/oscillators/sine'

export const nodeDefinitions: GraphNodeBaseType[] = [
  dialGraphNodeDefinition,
  sineGraphNodeDefinition,
]

export type NodeType = typeof dialNodeType
export const NodeType = {
  Dial: dialNodeType,
  Sine: sineNodeType,
}
