// import { assign as _assign, Machine } from 'xstate'
import { assign, Machine } from 'xstate'
import { TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'

export interface LifecycleContext {
  monaco?: MonacoT
  editor?: EditorT
  compiledCode?: string
  tokens?: TokenPlaces
}

type LifecycleEvent =
  | { type: 'REACT_MOUNTED' }
  | { type: 'EDITOR_CREATED'; editor: EditorT }

interface LifecycleStateSchema {
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

export const machine = Machine<
  LifecycleContext,
  LifecycleStateSchema,
  LifecycleEvent
>(
  {
    id: 'lifecycle',
    initial: 'preMount',
    context: {},
    states: {
      preMount: {
        on: {
          REACT_MOUNTED: 'preEditorSetup',
        },
      },
      preEditorSetup: {
        invoke: {
          id: 'preEditorSetupInvoke',
          src: 'preEditorSetup',
          onDone: {
            target: 'creatingEditor',
            actions: assign({
              monaco: (context, event) => {
                return event.data.monaco
              },
            }),
          },
          onError: 'failure',
        },
      },
      creatingEditor: {
        on: {
          EDITOR_CREATED: {
            target: 'parsingTokens',
            actions: assign({
              editor: (context, event) => {
                return event.editor
              },
            }),
          },
        },
      },
      parsingTokens: {
        invoke: {
          id: 'parsingTokensInvoke',
          src: 'parseTokens',
          onDone: {
            target: 'postEditorSetup',
            actions: assign({
              tokens: (context, event) => {
                console.log('invoke!!', event.data)
                return event.data
              },
            }),
          },
        },
      },
      postEditorSetup: {
        invoke: {
          id: 'postEditorSetupInvoke',
          src: 'postEditorSetup',
          onDone: {
            target: 'compilingCode',
            actions: assign({
              compiledCode: (context, event) => {
                return event.data
              },
            }),
          },
          onError: 'failure',
        },
      },
      compilingCode: {
        invoke: {
          id: 'compileCodeInvoke',
          src: 'compileCode',
          onDone: {
            target: 'evalingCode',
            actions: assign({
              compiledCode: (context, event) => event.data,
            }),
          },
          onError: 'failure',
        },
      },
      evalingCode: {
        invoke: {
          id: 'evalingCodeInvoke',
          src: 'evalCompiledUserCode',
          onDone: 'waiting',
        },
      },
      waiting: {
        entry: (context, event) => {
          console.log('waiting!!!', context, event)
        },
      },
      failure: {},
    },
  },
  {
    services: {
      preEditorSetup: () =>
        new Promise(resolve => {
          setTimeout(
            () =>
              resolve({
                monaco: 'maocnaooooo',
              }),
            1000,
          )
        }),
      postEditorSetup: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whatever'), 1000)
        }),
      compileCode: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whatever'), 1000)
        }),
      evalCompiledUserCode: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whatever'), 1000)
        }),
      parseTokens: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whataever tokens....'), 1000)
        }),
    },
  },
)
