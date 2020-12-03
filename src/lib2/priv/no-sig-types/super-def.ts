import { EdgeType } from './edge-types'

export interface SuperDef {
  nodeType: `${string}/${string}`
  publicName: string
  packageName: `code-daw/${string}`
  publicFunction: any
  inputs: { [k: string]: EdgeType }
  output: EdgeType
  interactable: boolean
  verifyConfig: (config: any) => void
  makeOutput: (audioContext: AudioContext, config: any, inputs: any) => any
}
