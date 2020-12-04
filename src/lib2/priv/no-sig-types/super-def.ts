import { EdgeType } from './edge-types'

export interface SuperDef {
  nodeType: string
  publicName: string
  packageName: string
  publicFunction: any
  inputs: { [k: string]: EdgeType }
  output: EdgeType
  interactable: boolean
  verifyConfig: (config: any) => void
  makeOutput: (audioContext: AudioContext, config: any, inputs: any) => any
}

export type ConfigOf<Def extends SuperDef> = Def['verifyConfig'] extends (
  config: infer Config,
) => void
  ? Config
  : never
