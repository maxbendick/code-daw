import { createServer, Response, Server } from 'miragejs'
import { interpret } from 'xstate'
import { defaultFilesPath } from '../config'
import { EditorT } from '../editor/types'
import { makeLocalStorageMock } from './test-utils'
import { makeVfsMachine } from './vfs-machine'

let server: Server
beforeEach(() => {
  server = createServer({})
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
})
afterEach(() => {
  server.shutdown()
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('vfs machine general function', async () => {
  const config = {
    storage: makeLocalStorageMock(),
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

  await wait(2000)

  expect(service.state.value).toEqual('ready')

  expect(service.state.context).toMatchObject({
    editor: mockEditor,
    activePath: '/index.tsx',
    pathToFile: {
      '/dial.tsx': {
        content: 'default dial content',
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
        content: 'default dial content',
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
