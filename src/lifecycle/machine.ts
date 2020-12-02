// import { assign as _assign, Machine } from 'xstate'
import { assign, createMachine } from 'xstate'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleServices,
  LifecycleState,
} from './types'

const defaultServices: LifecycleServices = {
  preEditorSetup: () =>
    new Promise(resolve => {
      setTimeout(
        () =>
          resolve({
            monaco: 'maocnaooooo' as any,
          }),
        1000,
      )
    }),
  postEditorSetup: () =>
    new Promise(resolve => {
      setTimeout(() => resolve(), 1000)
    }),
  compileCode: () =>
    new Promise(resolve => {
      setTimeout(() => resolve('compiled code'), 1000)
    }),
  evalCompiledUserCode: () =>
    new Promise(resolve => {
      setTimeout(() => resolve(), 1000)
    }),
  parseTokens: () =>
    new Promise(resolve => {
      setTimeout(
        () => resolve([{ fake: 'this is a fake tokenplace' } as any]),
        1000,
      )
    }),
}

export const machine = createMachine<
  LifecycleContext,
  LifecycleEvent,
  LifecycleState
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
    services: defaultServices as any,
  },
)
