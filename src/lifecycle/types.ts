import { TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'

export type LifecycleEvent =
  | { type: 'REACT_MOUNTED' }
  | { type: 'EDITOR_CREATED'; editor: EditorT }

export interface LifecycleStateSchema {
  states: {
    preMount: {}
    preEditorSetup: {}
    creatingEditor: {}
    parsingTokens: {}
    postEditorSetup: {}
    compilingCode: {}
    evalingCode: {}
    waiting: {}
    failure: {}
  }
}

export interface LifecycleContext {
  monaco?: MonacoT
  editor?: EditorT
  compiledCode?: string
  tokens?: TokenPlaces
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

export type LifecycleState =
  | { value: 'preMount'; context: LifecycleContext }
  | { value: 'preEditorSetup'; context: LifecycleContext }
  | {
      value: 'creatingEditor'
      context: LifecycleContext & LifecycleContextWithMonaco
    }
  | {
      value: 'parsingTokens'
      context: LifecycleContext & LifecycleContextWithEditor
    }
  | {
      value: 'postEditorSetup'
      context: LifecycleContext & LifecycleContextWithTokens
    }
  | {
      value: 'compilingCode'
      context: LifecycleContext & LifecycleContextWithTokens
    }
  | {
      value: 'evalingCode'
      context: LifecycleContext & LifecycleContextWithCompiledCode
    }
  | {
      value: 'waiting'
      context: LifecycleContext & LifecycleContextWithCompiledCode
    }
  | { value: 'failure'; context: LifecycleContext }

export type LifecycleServices = {
  preEditorSetup: (
    context: LifecycleContext,
  ) => Promise<{
    monaco: MonacoT
  }>
  postEditorSetup: (context: LifecycleContextWithTokens) => Promise<void>
  compileCode: (context: LifecycleContextWithTokens) => Promise<string>
  evalCompiledUserCode: (
    context: LifecycleContextWithCompiledCode,
  ) => Promise<void>
  parseTokens: (context: LifecycleContextWithEditor) => Promise<TokenPlaces>
}
