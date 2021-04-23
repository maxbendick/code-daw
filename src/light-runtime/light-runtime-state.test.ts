import '@testing-library/jest-dom'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'
import { assign, interpret, Machine } from 'xstate'
import { machine } from '../lifecycle/machine'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface Runtime {
  shutdown: () => Promise<void>
}

const wrapRuntime = <A>(
  context: A,
  runtimePromiseFn: (context: A, stopSignal: Promise<any>) => Promise<any>,
): Runtime => {
  const shutdown$ = new Subject()
  const runtimePromise = runtimePromiseFn(
    context,
    shutdown$.pipe(take(1)).toPromise(),
  )

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

test('light-runtime machine', async () => {
  let shutdownFinished = false

  const originalConfig = machine.config.states?.lightRuntime!
  const cleanedConfig: typeof originalConfig = {
    ...originalConfig,
    onDone: undefined,
    entry: undefined,
    exit: undefined,
  }

  const shiftEnterSignal$ = new Subject()

  const service = interpret(
    Machine(cleanedConfig)
      .withContext({})
      .withConfig({
        actions: {
          assignRuntime: assign<any, any>({
            runtimeProcess: (context: any, event: any) =>
              wrapRuntime(context, mockRuntimeFn),
          }),
        },
        services: {
          shutdownRuntime: async (context, event) => {
            await context.runtimeProcess?.shutdown()
            shutdownFinished = true
            return
          },
          waitForShiftEnter: (context, event) => {
            return shiftEnterSignal$.pipe(take(1)).toPromise()
          },
        },
      }),
  ).start()

  expect(service.state.matches('running')).toBeTruthy()
  shiftEnterSignal$.next(true)
  await wait(1)
  expect(service.state.matches('destroyed')).toBeTruthy()
  expect(service.state.done).toBeTruthy()
  expect(shutdownFinished).toBeTruthy()
})
