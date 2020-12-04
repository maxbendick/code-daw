import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'
import { BaseSuperDef } from './no-sig-types/super-def'
import {
  dialGraphNodeDefinition,
  DialNodeEphemeral,
} from './nodes/interactables/dial'
import {
  sineGraphNodeDefinition,
  SineNodeEphemeral,
  superSineDef,
} from './nodes/oscillators/sine'

// type ValuesOf<T extends readonly any[]> = T[number]

export type GraphNodeEphemeral = DialNodeEphemeral | SineNodeEphemeral

const nodeDefinitions: GraphNodeBaseType[] = [
  dialGraphNodeDefinition,
  sineGraphNodeDefinition,
]

// Add em here!
export const superDefs = [superSineDef] as const
const _proof: readonly BaseSuperDef[] = superDefs

type SuperDef = BaseSuperDef // ValuesOf<typeof superDefs>
type SuperDefNodeType = string // SuperDef['nodeType']

export const getSuperDef = (type: string) => {
  for (const def of superDefs) {
    if (def.nodeType === type) {
      return def
    }
  }
  throw new Error('could not find superdef')
}

export type NodeType = string // typeof dialNodeType | SuperDefNodeType

const getGraphNodeDefinition = (nodeType: NodeType): GraphNodeBaseType => {
  const result = nodeDefinitions.find(d => (d as any).nodeType === nodeType)

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
  return (getGraphNodeDefinition(nodeType) as any).inputs
}
