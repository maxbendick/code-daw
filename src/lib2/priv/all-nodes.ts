import { SuperDef } from './no-sig-types/super-def'
import { superDialDef } from './nodes/interactables/dial'
import { superMasterOutDef } from './nodes/io/master-out'
import { superSineDef } from './nodes/oscillators/sine'

type ValuesOf<T extends readonly any[]> = T[number]

const registeredSuperDefs = [
  superDialDef,
  superMasterOutDef,
  superSineDef,
] as const

type RegisteredSuperDef = ValuesOf<typeof registeredSuperDefs>

const _proof: SuperDef = (null as any) as RegisteredSuperDef

export type NodeType = RegisteredSuperDef['nodeType']
