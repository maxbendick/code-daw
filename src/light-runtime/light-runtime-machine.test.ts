import '@testing-library/jest-dom'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'
import { assign, interpret } from 'xstate'
import { lightRuntimeMachine } from './light-runtime-machine'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface Runtime {
  shutdown: () => Promise<void>
}

const wrapRuntime = (
  runtimePromiseFn: (stopSignal: Promise<any>) => Promise<any>,
): Runtime => {
  const shutdown$ = new Subject()
  const runtimePromise = runtimePromiseFn(shutdown$.pipe(take(1)).toPromise())

  return {
    shutdown: async () => {
      shutdown$.next(true)
      await runtimePromise
    },
  }
}

const mockRuntimeFn = async (stopSignal: Promise<any>) => {
  await stopSignal
}

test.only('light-runtime machine', async () => {
  const service = interpret(
    lightRuntimeMachine.withConfig({
      actions: {
        assignRuntime: assign<any, any>({
          runtimeProcess: wrapRuntime(mockRuntimeFn),
        }),
      },
      services: {
        shutdownRuntime: async (context, event) => {
          await context.runtimeProcess?.shutdown()
          return
        },
      },
    }),
  ).start()

  expect(service.state.matches('running')).toBeTruthy()
  service.send({ type: 'RUNTIME_SHUTDOWN' })
  expect(service.state.matches('shuttingDown')).toBeTruthy()
  await wait(1)
  expect(service.state.matches('destroyed')).toBeTruthy()
  expect(service.state.done).toBeTruthy()
  await wait(1)
})
