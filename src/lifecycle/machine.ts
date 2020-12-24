import { assign, Machine, send, spawn } from 'xstate'
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

// TODO test vfs-lifecycle interaction
// TODO parallel editor+vfs setup
// TODO refactor to editor as actor
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
        initial: 'running',
        onDone: 'editing',
        states: {
          running: {
            entry: ['assignRuntime'],
            invoke: {
              src: 'waitForShiftEnter',
              onDone: 'shuttingDown',
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
    },
  },
)
