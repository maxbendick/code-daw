import { StringKeys } from './string-keys'

export type GraphNodeBaseType = {
  nodeType: string
  inputs: StringKeys<any>
  output: any // usually a new empty signal?
  config: StringKeys<any>
}
