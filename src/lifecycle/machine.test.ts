import '@testing-library/jest-dom'
import { createServer, Response, Server } from 'miragejs'
import { assign, interpret } from 'xstate'
import { defaultFilesPath } from '../config'
import { wait } from '../utils'
import { makeLocalStorageMock } from '../virtual-file-system/test-utils'
import { machine } from './machine'
import { lifecycleServices } from './services'

const sendShiftEnter = () => {
  ;(window as any).onkeydown({ key: 'Enter', shiftKey: true } as any)
}

;(process.env as any).PUBLIC_URL =
  'file://wsl%24/Ubuntu/home/max/projects/daw/code-daw/public'

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
  server.get(`${defaultFilesPath}/pathlist.json`, () => [
    '/index.tsx',
    '/dial.tsx',
  ])
  server.get(
    `${defaultFilesPath}/index.tsx`,
    () =>
      new Response(200, { 'content-type': 'text' }, 'default index content'),
  )
  server.get(
    `${defaultFilesPath}/dial.tsx`,
    () =>
      new Response(200, { 'content-type': 'text' }, 'default dial content'),
  )

  const storageMock = makeLocalStorageMock()
  global.sessionStorage = storageMock

  const mockEditor = {
    setValue: jest.fn(() => {}),
    getValue: jest.fn(() => 'editor value'),
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

  expect(service.state.matches('preMount')).toBeTruthy()
  await wait(1)
  service.send({ type: 'REACT_MOUNTED' })
  expect(service.state.matches('loadingMonaco')).toBeTruthy()
  await wait(1)
  expect(service.state.matches('creatingEditor')).toBeTruthy()
  service.send({ type: 'EDITOR_CREATED', editor: mockEditor as any })

  await wait(2000) // TODO figure a better way than waiting this long

  // TODO how to test loading stuff? how to test content loaded into editor?
  expect(service.state.context?.vfsActor?.state?.context).toMatchObject({
    activePath: '/index.tsx',
    pathToFile: {
      '/index.tsx': {
        content: 'default index content',
        path: '/index.tsx',
      },
      '/dial.tsx': {
        content: 'default dial content',
        path: '/dial.tsx',
      },
    },
  })

  expect(mockEditor.setValue).toHaveBeenCalledWith('default index content')

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

  service.state.context?.vfsActor?.send({
    type: 'VFS_SET_ACTIVE',
    path: '/dial.tsx',
  })

  await wait(1)
  expect(service.state.context?.vfsActor?.state?.context).toMatchObject({
    activePath: '/dial.tsx',
    pathToFile: {
      '/index.tsx': {
        content: 'default index content',
        path: '/index.tsx',
      },
      '/dial.tsx': {
        content: 'default dial content',
        path: '/dial.tsx',
      },
    },
  })
})
