import { interpret } from 'xstate'
import { EditorT } from '../editor/types'
import { makeFetchMock, makeLocalStorageMock } from './test-utils'
import { makeVfsMachine } from './vfs-machine'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('vfs machine general function', async () => {
  const config = {
    storage: makeLocalStorageMock(),
    fetchFn: makeFetchMock() as any,
  }

  const machine = makeVfsMachine(config)

  const service = interpret(machine)

  service.start()

  await wait(10)

  expect(service.state.matches('preSetup')).toBeTruthy()

  const contentFromEditor = 'fake editor content'

  const mockEditor = {
    getValue: () => contentFromEditor,
    setValue: () => {},
  }

  service.send({
    type: 'VFS_SET_EDITOR',
    editor: (mockEditor as any) as EditorT,
  })

  expect(service.state.matches('setup')).toBeTruthy()

  await wait(10)

  expect(service.state.context).toMatchObject({
    editor: mockEditor,
    activePath: '/index.tsx',
    pathToFile: {
      '/dial.tsx': {
        content: 'diefault dial content',
        path: '/dial.tsx',
      },
      '/index.tsx': {
        content: 'default index content',
        path: '/index.tsx',
      },
    },
  })

  service.send({ type: 'VFS_SET_ACTIVE', path: '/dial.tsx' })

  expect(service.state.context).toMatchObject({
    editor: mockEditor,
    activePath: '/dial.tsx',
    pathToFile: {
      '/dial.tsx': {
        content: 'diefault dial content',
        path: '/dial.tsx',
      },
      '/index.tsx': {
        content: 'default index content',
        path: '/index.tsx',
      },
    },
  })

  service.send({ type: 'VFS_SAVE_ACTIVE' })

  await wait(10)

  expect(service.state.context).toMatchObject({
    editor: mockEditor,
    activePath: '/dial.tsx',
    pathToFile: {
      '/dial.tsx': {
        content: contentFromEditor,
        path: '/dial.tsx',
      },
      '/index.tsx': {
        content: 'default index content',
        path: '/index.tsx',
      },
    },
  })

  service.stop()
})
