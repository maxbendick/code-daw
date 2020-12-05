// import { assign as _assign, Machine } from 'xstate'
import { assign, Machine } from 'xstate'
import { SignalGraph } from '../lib2/priv/signal-graph'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleServices,
  LifecycleStateSchema,
} from './types'
import { makeJsonStringifySafe, waitForShiftEnter } from './util'

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
    return waitForShiftEnter()
  },
}

const makeAudioContext = () => {
  const result = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()
  makeJsonStringifySafe(result)
  return result
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
          src: (context, event) => waitForShiftEnter(),
          onDone: 'parsingTokens',
          onError: 'failure',
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
          onError: 'failure',
        },
      },
      compilingCode: {
        entry: 'createSignalGraph',
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
          onError: 'failure',
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
      runtime: {
        entry: ['createAudioContext', 'setReadonly'],
        invoke: {
          id: 'doRuntimeInvoke',
          src: 'doRuntime',
          onDone: 'editing',
          onError: 'failure',
        },
        exit: [
          'destroyAudioContext',
          'destroySignalGraph',
          'destroyCoolZones',
          'clearReadonly',
        ],
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
    actions: {
      setReadonly: (context, event) => {
        if (!context.editor) {
          throw new Error('cant be in setReadonly without editor')
        }
        context.editor.updateOptions({ readOnly: true })
      },
      clearReadonly: (context, event) => {
        if (!context.editor) {
          throw new Error('cant be in setReadonly without editor')
        }
        context.editor.updateOptions({ readOnly: false })
      },
      createSignalGraph: assign({
        signalGraph: (context, event) => {
          return new SignalGraph()
        },
      }),
      destroySignalGraph: assign({
        signalGraph: (context, event) => {
          if (!context.signalGraph) {
            throw new Error('tried to destroy nonexistent signalGraph')
          }
          return undefined
        },
      }),
      destroyCoolZones: assign({
        coolZones: (context, event) => {
          if (!context.coolZones) {
            throw new Error('tried to destroy nonexistent coolZones')
          }
          for (const coolZone of context.coolZones) {
            coolZone.destroy()
          }
          return undefined
        },
      }),

      createAudioContext: assign({
        audioContext: (context, event) => makeAudioContext(),
      }),
      destroyAudioContext: assign({
        audioContext: (context, event) => {
          if (!context.audioContext) {
            throw new Error('tried to close nonexistent audio context')
          }
          context.audioContext.close()
          return undefined
        },
      }),
    },
  },
)
