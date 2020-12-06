import { StringKeys } from './no-sig-types/string-keys'
import { SuperDef } from './no-sig-types/super-def'

export type Node<Def extends SuperDef> = {
  id: string
  type: Def['nodeType']
  inputIds: StringKeys<string>
  config: ReturnType<Def['argsToConfig']>
  index: number
  lastObservedCompiledLineNumber: number
}
