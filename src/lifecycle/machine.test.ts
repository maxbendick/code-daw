import '@testing-library/jest-dom'
import { interpret } from 'xstate'
import { machine } from './machine'
import { lifecycleServices } from './services'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

;(process.env as any).PUBLIC_URL =
  'file://wsl%24/Ubuntu/home/max/projects/daw/code-daw/public'

const sendShiftEnter = () => {
  ;(window as any).onkeydown({ key: 'Enter', shiftKey: true } as any)
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

test('lifecycle', async () => {
  const mockEditor = {
    setValue: () => {
      throw new Error('not yet')
    },
  }
  const service = interpret(
    machine.withConfig({
      services: {
        ...lifecycleServices,
        loadMonaco: async (context: any, event: any) => {
          return monacoMock
        },
        lightRuntime: async (context: any, event: any) => {
          await new Promise(resolve => {})
        },
      },
    }),
  ).start()

  // service.subscribe(state => console.log('state.value', state.value))

  expect(service.state.matches('preMount')).toBeTruthy()
  await wait(2)
  service.send({ type: 'REACT_MOUNTED' })
  expect(service.state.matches('loadingMonaco')).toBeTruthy()
  await wait(2)
  expect(service.state.matches('creatingEditor')).toBeTruthy()
  service.send({ type: 'EDITOR_CREATED', editor: mockEditor as any })
  await wait(2)
  expect(service.state.matches('editing')).toBeTruthy()

  // sendShiftEnter()
  // await wait(2)
  // expect(service.state.matches('runtime')).toBeTruthy()
}, 10000)
