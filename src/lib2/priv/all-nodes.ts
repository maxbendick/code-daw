import { SuperDef } from './no-sig-types/super-def'
import { superGainDef } from './nodes/effects/gain'
import { superDialDef } from './nodes/interactables/dial'
import { superMasterOutDef } from './nodes/io/master-out'
import { oscillatorDefs } from './nodes/oscillators'

type ValuesOf<T extends readonly any[]> = T[number]

export const registeredSuperDefs = [
  superDialDef,
  superMasterOutDef,
  ...oscillatorDefs,
  superGainDef,
] as const

type RegisteredSuperDef = ValuesOf<typeof registeredSuperDefs>

const _proof: SuperDef = (null as any) as RegisteredSuperDef

export type NodeType = RegisteredSuperDef['nodeType']

export const getSuperDef = (nodeType: NodeType): SuperDef => {
  const result = registeredSuperDefs.find(def => def.nodeType === nodeType)
  if (!result) {
    console.error('node type', nodeType)
    throw new Error(`unexpected node type ${nodeType}`)
  }
  return result
}
