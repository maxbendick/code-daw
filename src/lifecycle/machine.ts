// import { assign as _assign, Machine } from 'xstate'
import { assign, Machine } from 'xstate'
import { EditorT, MonacoT } from '../editor/types'

export interface LifecycleContext {
  monaco?: MonacoT
  editor?: EditorT
  compiledCode?: string
}

type LifecycleEvent =
  | { type: 'REACT_MOUNTED' }
  | { type: 'EDITOR_CREATED'; editor: EditorT }

interface LifecycleStateSchema {
  states: {
    preMount: {}
    preEditorSetup: {}
    creatingEditor: {}
    postEditorSetup: {}
    compileAndEval: {}
    evalCompiledUserCode: {}
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
            target: 'postEditorSetup',
            actions: assign({
              editor: (context, event) => {
                return event.editor
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
            target: 'compileAndEval',
            actions: assign({
              compiledCode: (context, event) => {
                return event.data
              },
            }),
          },
          onError: 'failure',
        },
      },
      compileAndEval: {
        invoke: {
          id: 'compileAndEvalInvoke',
          src: 'compileAndEval',
          onDone: {
            target: 'evalCompiledUserCode',
            actions: assign({
              compiledCode: (context, event) => event.data,
            }),
          },
          onError: 'failure',
        },
      },
      evalCompiledUserCode: {
        invoke: {
          id: 'evalCompiledUserCode',
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
      compileAndEval: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whatever'), 1000)
        }),
      evalCompiledUserCode: () =>
        new Promise(resolve => {
          setTimeout(() => resolve('whatever'), 1000)
        }),
    },
  },
)
