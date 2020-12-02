import { CoolZone } from '../editor/cool-zone'
import { TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'
import { SignalGraph } from '../lib2/priv/signal-graph'

export type LifecycleEvent =
  | { type: 'REACT_MOUNTED' }
  | { type: 'EDITOR_CREATED'; editor: EditorT }
  | { type: '__nil'; data: any }

export interface LifecycleStateSchema {
  states: {
    preMount: {}
    preEditorSetup: {}
    creatingEditor: {}
    parsingTokens: {}
    attachingCoolZones: {}
    compilingCode: {}
    evalingCode: {}
    runtime: {}
    waiting: {}
    failure: {}
  }
}

export interface LifecycleContext {
  monaco?: MonacoT
  editor?: EditorT
  compiledCode?: string
  tokens?: TokenPlaces
  codeDawVars?: any
  coolZones?: CoolZone[]
  signalGraph: SignalGraph
}

export interface LifecycleContextWithMonaco {
  monaco: MonacoT
}
export interface LifecycleContextWithEditor extends LifecycleContextWithMonaco {
  editor: EditorT
}
export interface LifecycleContextWithTokens extends LifecycleContextWithEditor {
  tokens: TokenPlaces
}
export interface LifecycleContextWithCompiledCode
  extends LifecycleContextWithTokens {
  compiledCode: string
}

export type LifecycleServices = {
  preEditorSetup: (
    context: LifecycleContext,
  ) => Promise<{
    monaco: MonacoT
  }>
  parseTokens: (context: LifecycleContext) => Promise<TokenPlaces>
  compileCode: (context: LifecycleContext) => Promise<string>
  evalCompiledUserCode: (
    context: LifecycleContext,
  ) => Promise<{ codeDawVars: any }>
  attachCoolZones: (context: LifecycleContext) => Promise<CoolZone[]>
  doRuntime: (context: LifecycleContext) => Promise<void>
}

// export type LifecycleState =
//   | { value: 'preMount'; context: LifecycleContext }
//   | { value: 'preEditorSetup'; context: LifecycleContext }
//   | {
//       value: 'creatingEditor'
//       context: LifecycleContext & LifecycleContextWithMonaco
//     }
//   | {
//       value: 'parsingTokens'
//       context: LifecycleContext & LifecycleContextWithEditor
//     }
//   | {
//       value: 'attachingCoolZones'
//       context: LifecycleContext & LifecycleContextWithTokens
//     }
//   | {
//       value: 'compilingCode'
//       context: LifecycleContext & LifecycleContextWithTokens
//     }
//   | {
//       value: 'evalingCode'
//       context: LifecycleContext & LifecycleContextWithCompiledCode
//     }
//   | {
//       value: 'waiting'
//       context: LifecycleContext & LifecycleContextWithCompiledCode
//     }
//   | { value: 'failure'; context: LifecycleContext }
