import '@testing-library/jest-dom'
import { createServer, Server } from 'miragejs'
import { assign, interpret } from 'xstate'
import { machine } from './machine'
import { lifecycleServices } from './services'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

;(process.env as any).PUBLIC_URL =
  'file://wsl%24/Ubuntu/home/max/projects/daw/code-daw/public'

const sendShiftEnter = () => {
  ;(window as any).onkeydown({ key: 'Enter', shiftKey: true } as any)
}

const mockRuntime = () => {
  return {
    shutdown: () => Promise.resolve(true),
  }
}

const monacoMock = {
  typescript: {},
  editor: {
    ContentWidgetPositionPreference: { ABOVE: 'above', BELOW: 'below' },
  },
  languages: {
    registerDocumentSemanticTokensProvider: () => {},
    typescript: {
      typescriptDefaults: {
        addExtraLib: () => {},
        setDiagnosticsOptions: () => {},
        setCompilerOptions: () => {},
      },
      ScriptTarget: { ES2016: 'ES2016' },
      ModuleResolutionKind: { NodeJs: 'NodeJs' },
      ModuleKind: { CommonJS: 'CommonJS' },
      JsxEmit: { React: 'React' },
    },
  },
  URI: {
    file: (s: string) => s,
  },
}

let server: Server
beforeEach(() => {
  server = createServer({})
})
afterEach(() => {
  server.shutdown()
})

test('lifecycle', async () => {
  server.get('/default-files/pathlist.json', () => ['/index.tsx'])

  // const oldFetch = window.fetch
  // ;(window as any).fetch = (...args: any[]) => {
  //   console.log('attempted to fetch', ...args)
  //   return (oldFetch as any)(...args)
  // }

  const mockEditor = {
    setValue: () => {
      throw new Error('not yet')
    },
  }
  const service = interpret(
    machine.withConfig({
      actions: {
        assignRuntime: assign<any, any>({
          runtimeProcess: (context: any, event: any) => mockRuntime(),
        }),
      },
      services: {
        ...lifecycleServices,
        loadMonaco: async (context: any, event: any) => {
          return monacoMock
        },
      },
    }),
  ).start()

  // service.subscribe(state => console.log('state', state.value))

  expect(service.state.matches('preMount')).toBeTruthy()
  await wait(1)
  service.send({ type: 'REACT_MOUNTED' })
  expect(service.state.matches('loadingMonaco')).toBeTruthy()
  await wait(1)
  expect(service.state.matches('creatingEditor')).toBeTruthy()
  service.send({ type: 'EDITOR_CREATED', editor: mockEditor as any })
  await wait(1)
  expect(service.state.matches('editing')).toBeTruthy()
  sendShiftEnter()
  await wait(1)
  expect(service.state.matches('lightRuntime')).toBeTruthy()
  sendShiftEnter()
  await wait(1)
  expect(service.state.matches('editing')).toBeTruthy()
  sendShiftEnter()
  await wait(1)
  expect(service.state.matches('lightRuntime')).toBeTruthy()
  sendShiftEnter()
  await wait(1)
  expect(service.state.matches('editing')).toBeTruthy()
})
