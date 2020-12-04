import { EdgeType } from './edge-types'

export interface BaseSuperDef {
  nodeType: string // `${string}/${string}`
  publicName: string
  packageName: string // `code-daw/${string}`
  publicFunction: any
  inputs: { [k: string]: EdgeType }
  output: EdgeType
  interactable: boolean
  verifyConfig: (config: any) => void
  makeOutput: (audioContext: AudioContext, config: any, inputs: any) => any
}

// export type SuperConfig<
//   Def extends { verifyConfig: any }
// > = Def['verifyConfig'] extends (config: infer ConfigT) => void
//   ? ConfigT
//   : never

export type SuperConfig<Def> = any
