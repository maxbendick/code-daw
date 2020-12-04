// import { assign as _assign, Machine } from 'xstate'
import { assign, Machine } from 'xstate'
import { globalSignalGraph } from '../lib2/priv/signal-graph'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleServices,
  LifecycleStateSchema,
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
  attachCoolZones: () =>
    new Promise(resolve => {
      setTimeout(() => resolve(['fake cool zone' as any]), 1000)
    }),
  compileCode: () =>
    new Promise(resolve => {
      setTimeout(() => resolve('compiled code'), 1000)
    }),
  evalCompiledUserCode: () =>
    new Promise(resolve => {
      setTimeout(() => resolve({ codeDawVars: 'fake vars' }), 1000)
    }),
  parseTokens: () =>
    new Promise(resolve => {
      setTimeout(
        () => resolve([{ fake: 'this is a fake tokenplace' } as any]),
        1000,
      )
    }),
  doRuntime: context => {
    console.log('starting fake runtime!', context)
    return new Promise(resolve => {})
  },
}

const makeJsonStringifySafe = (obj: any) => {
  const seen = new Set<string>()
  obj.toJSON = (key: string) => {
    if (seen.size > 1000 || seen.has(key)) {
      return '...'
    }
    seen.add(key)
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
    context: {
      signalGraph: globalSignalGraph,
    },
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
                makeJsonStringifySafe(event.data.monaco)
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
            target: 'editing',
            actions: assign({
              editor: (context, event) => {
                makeJsonStringifySafe(event.editor)
                return event.editor
              },
            }),
          },
        },
      },
      editing: {
        invoke: {
          id: 'editingInvoke',
          src: (context, event) =>
            new Promise<null>((resolve, reject) => {
              window.onkeydown = (event: KeyboardEvent) => {
                if (event.key === 'Enter' && event.shiftKey) {
                  window.onkeydown = null
                  resolve(null)
                }
              }
            }),
          onDone: 'parsingTokens',
        },
      },
      parsingTokens: {
        invoke: {
          id: 'parsingTokensInvoke',
          src: 'parseTokens',
          onDone: {
            target: 'compilingCode',
            actions: assign({
              tokens: (context, event) => {
                makeJsonStringifySafe(event.data)
                return event.data
              },
            }),
          },
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
          onDone: {
            target: 'attachingCoolZones',
            actions: assign({
              codeDawVars: (context, event) => {
                makeJsonStringifySafe(event.data.codeDawVars)
                return event.data.codeDawVars
              },
            }),
          },
        },
      },
      attachingCoolZones: {
        invoke: {
          id: 'attachingCoolZonesInvoke',
          src: 'attachCoolZones',
          onDone: {
            target: 'runtime',
            actions: assign({
              coolZones: (context, event) => {
                makeJsonStringifySafe(event.data)
                return event.data
              },
            }),
          },
          onError: 'failure',
        },
      },
      // TODO: runtime creates audio context, which is destroyed on exit
      runtime: {
        entry: (context, event) => {
          console.log('runtime!!!', context, event)
        },
        invoke: {
          id: 'doRuntimeInvoke',
          src: 'doRuntime',
        },
      },
      waiting: {
        entry: (context, event) => {
          console.log('waiting!!!', context, event)
        },
      },
      failure: {
        entry: (context, event) => {
          console.error(
            'sadly, the state machine has entered the failure machine state',
            context,
            event,
          )
        },
      },
    },
  },
  {
    services: defaultServices,
  },
)
