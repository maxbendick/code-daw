import { assign, Machine, send, spawn } from 'xstate'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { createLightRuntime } from '../light-runtime/light-runtime'
import { makeVfsMachine } from '../virtual-file-system/vfs-machine'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleServices,
  LifecycleStateSchema,
} from './types'
import { makeJsonStringifySafe, waitForShiftEnter } from './util'

const defaultServices: LifecycleServices = {
  startLightRuntime: async context => {
    return
  },
  loadMonaco: () =>
    new Promise(resolve => {
      setTimeout(() => resolve('maocnaooooo' as any), 1000)
    }),
  monacoSetup: () =>
    new Promise(resolve => {
      setTimeout(() => resolve(), 1000)
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

class DevStorage {
  getItem(key: string): string {
    console.log('InMemStorage: get', key, this)
    if (typeof key !== 'string') {
      throw new Error(`key must be string - ${key}`)
    }
    const result = (this as any)[key]

    if (!result) {
      throw new Error(`couldnt find for - ${key}`)
    }

    return result
  }
  setItem(key: string, value: string) {
    console.log('InMemStorage: set', key, value.substring(0, 20), this)
    if (typeof key !== 'string') {
      throw new Error(`key must be string - ${key}`)
    }
    if (typeof value !== 'string') {
      throw new Error(`value must be string - ${value}`)
    }
    ;(this as any)[key] = value
  }
}

const vfsStorage =
  process.env.NODE_ENV === 'development' ? new DevStorage() : localStorage

// TODO test
// TODO remove cruft
// TODO parallel editor+vfs setup
// TODO refactor to use runtime and editor as actors
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
        entry: assign({
          vfsActor: (context, event) =>
            spawn(
              makeVfsMachine({
                storage: vfsStorage,
                fetchFn: fetch,
              }),
              {
                name: 'vfsActor',
                sync: true,
              },
            ),
        }),
        on: {
          REACT_MOUNTED: {
            target: 'loadingMonaco',
          },
        },
      },
      loadingMonaco: {
        invoke: {
          src: 'loadMonaco',
          onDone: {
            target: 'monacoSetup',
            actions: assign({
              monaco: (context, event) => {
                return event.data as any
              },
            }),
          },
          onError: 'failure',
        },
      },
      monacoSetup: {
        invoke: {
          id: 'preEditorSetupInvoke',
          src: 'monacoSetup',
          onDone: {
            target: 'creatingEditor',
            // actions: assign({
            //   monaco: (context, event) => {
            //     makeJsonStringifySafe(event.data.monaco)
            //     return event.data.monaco
            //   },
            // }),
          },
          onError: 'failure',
        },
      },
      creatingEditor: {
        on: {
          EDITOR_CREATED: {
            target: 'editing',
            actions: [
              assign({
                editor: (context, event) => {
                  makeJsonStringifySafe(event.editor)
                  return event.editor
                },
              }),
              send(
                (context, event) => ({
                  type: 'VFS_SET_EDITOR',
                  editor: event.editor,
                }),
                { to: 'vfsActor' },
              ),
            ],
          },
        },
      },
      editing: {
        invoke: {
          id: 'editingInvoke',
          src: 'waitForShiftEnter',
          onDone: 'lightRuntime',
          onError: 'failure',
        },
      },
      lightRuntime: {
        // invoke: {
        //   src: 'startLightRuntime',
        //   onDone: 'editing',
        //   onError: 'failure',
        // },
        initial: 'running',
        onDone: 'editing',
        // wait for shift-enter here, then send RUNTIME_SHUTDOWN
        states: {
          running: {
            entry: ['assignRuntime'],
            invoke: {
              src: 'waitForShiftEnter',
              onDone: { actions: send({ type: 'RUNTIME_SHUTDOWN' }) },
            },
            on: {
              RUNTIME_SHUTDOWN: {
                target: 'shuttingDown',
              },
            },
          },
          shuttingDown: {
            invoke: {
              src: 'shutdownRuntime',
              onDone: {
                target: 'destroyed',
                actions: assign({
                  runtimeProcess: (context, event) => undefined,
                }),
              },
            },
          },
          destroyed: {
            type: 'final',
          },
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
                console.log('event.data', event.data.codeDawVars)
                // makeJsonStringifySafe(event.data.codeDawVars)
                // return event.data.codeDawVars
                // makeJsonStringifySafe(event.data.codeDawVars)
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
        // entry: ['createAudioContext', 'setReadonly'],
        // // invoke: {
        // //   id: 'doRuntimeInvoke',
        // //   src: 'doRuntime',
        // //   onDone: 'editing',
        // //   onError: 'failure',
        // // },
        // exit: [
        //   'destroyAudioContext',
        //   'destroySignalGraph',
        //   'destroyCoolZones',
        //   'clearReadonly',
        // ],
        // initial: 'running' as any,
        // onDone: 'editing',
        // states: {
        //   running: {
        //     entry: ['assignRuntime'],
        //     on: {
        //       RUNTIME_SHUTDOWN: {
        //         target: 'shuttingDown',
        //       },
        //     },
        //   },
        //   shuttingDown: {
        //     invoke: {
        //       src: 'shutdownRuntime',
        //       onDone: {
        //         target: 'destroyed',
        //         actions: assign({
        //           runtimeProcess: (context, event) => undefined,
        //         }),
        //       },
        //     },
        //   },
        //   destroyed: {
        //     type: 'final',
        //   },
        // },
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
    services: {
      ...defaultServices,
      shutdownRuntime: async (context, event) => {
        await context.runtimeProcess?.shutdown()
        return
      },
      waitForShiftEnter: (context, event) => waitForShiftEnter(),
    },
    actions: {
      assignRuntime: assign({
        runtimeProcess: (context, event) => {
          console.warn('assigning runtime')
          return createLightRuntime(context)
        },
      }),
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
