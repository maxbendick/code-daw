import { SuperDef } from './no-sig-types/super-def'
import { superDialDef } from './nodes/interactables/dial'
import { superMasterOutDef } from './nodes/io/master-out'
import { superSawDef } from './nodes/oscillators/saw'
import { superSineDef } from './nodes/oscillators/sine'

type ValuesOf<T extends readonly any[]> = T[number]

export const registeredSuperDefs = [
  superDialDef,
  superMasterOutDef,
  superSineDef,
  superSawDef,
] as const

type RegisteredSuperDef = ValuesOf<typeof registeredSuperDefs>

const _proof: SuperDef = (null as any) as RegisteredSuperDef

export type NodeType = RegisteredSuperDef['nodeType']

export const getSuperDef = (nodeType: NodeType): SuperDef => {
  const result = registeredSuperDefs.find(def => def.nodeType === nodeType)
  if (!result) {
    throw new Error(`unexpected node type ${nodeType}`)
  }
  return result
}
