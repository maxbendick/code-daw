import { assign, Machine } from 'xstate'

interface StateSchema {
  states: {
    running: {}
    shuttingDown: {}
    destroyed: {}
  }
}

type Event = { type: 'RUNTIME_SHUTDOWN' }

interface Runtime {
  shutdown: () => Promise<void>
}

interface Context {
  runtimeProcess?: Runtime
}

export {}

const lightRuntimeMachine = Machine<Context, StateSchema, Event>({
  initial: 'running',
  context: {},
  states: {
    running: {
      entry: ['assignRuntime'],
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
})
