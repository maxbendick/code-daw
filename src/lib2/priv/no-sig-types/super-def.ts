import { EdgeType } from './edge-types'

/*
TODOs

Maybe later: can have a function that takes in audio 
context, args, and a resolver fn that recurses in graph
to find or create the input. Each node would resolve 
the inputs it wants. 

Example: resolve(args[0].frequency, EdgeType.Signal): AudioNode | Observable<number>

*/
export interface SuperDef {
  nodeType: string
  publicName: string
  packageName: string
  inputs: { [k: string]: EdgeType }
  output: EdgeType
  interactable: boolean
  verifyConfig: (config: any) => void
  makeOutput: (audioContext: AudioContext, config: any, inputs: any) => any
  argsToInputs: (...args: any[]) => any
  argsToConfig: (...args: any[]) => any
}

export type ConfigOf<Def extends SuperDef> = Def['verifyConfig'] extends (
  config: infer Config,
) => void
  ? Config
  : never

// type Unresolved = { __never: true }

// export type OUTTputMaker = (
//   injected: {
//     audioContext: AudioContext
//     resolveInput: (
//       value: Unresolved,
//       edgeType: EdgeType,
//     ) => number | Observable<number> | AudioNode
//   },

//   args: any[],
// ) => any
