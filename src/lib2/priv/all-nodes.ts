import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'
import { BaseSuperDef } from './no-sig-types/super-def'
import {
  dialGraphNodeDefinition,
  DialNodeEphemeral,
  dialNodeType,
} from './nodes/interactables/dial'
import {
  sineGraphNodeDefinition,
  SineNodeEphemeral,
  superSineDef,
} from './nodes/oscillators/sine'

type ValuesOf<T extends readonly any[]> = T[number]

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
  sineGraphNodeDefinition,
]

// Add em here!
export const superDefs = [superSineDef] as const
const _proof: readonly BaseSuperDef[] = superDefs

type SuperDef = ValuesOf<typeof superDefs>
type SuperDefNodeType = SuperDef['nodeType']

export const getSuperDef = (type: SuperDefNodeType) => {
  for (const def of superDefs) {
    if (def.nodeType === type) {
      return def
    }
  }
  throw new Error('could not find superdef')
}

export type NodeType = typeof dialNodeType | SuperDefNodeType

const getGraphNodeDefinition = (
  nodeType: NodeType,
): GraphNodeBaseType<any, any, any, any> => {
  const result = nodeDefinitions.find(d => d.nodeType === nodeType)

  if (!result) {
    throw new Error(`could not find definition for node type ${nodeType}`)
  }

  return result
}

export const getNodeInputDef = (nodeType: NodeType) => {
  for (const def of superDefs) {
    if (def.nodeType === nodeType) {
      return def.inputs
    }
  }
  return getGraphNodeDefinition(nodeType).inputs
}
