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
  // .onTransition(state => {
  //   // console.log('state.event', state.event)
  //   // console.log(state.value)
  // })

  service.start()

  await wait(10)

  expect(service.state.matches('preSetup')).toBeTruthy()

  const mockEditor = {
    getValue: () => 'editor value',
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

  service.stop()

  // const storage = await makeLocalStorageMock()
  // ;(window as any).fetch = (global as any).fetch = makeFetchMock()

  // const vfs = await makeLocalStorageVfs(storage)

  // const allPaths = await vfs.getAllPaths()
  // expect(allPaths).toEqual(['/dial.tsx', '/index.tsx'])

  // const dialContent = (await vfs.get('/dial.tsx')).content
  // expect(dialContent).toEqual(defaultDialContent)

  // const indexContent = (await vfs.get('/index.tsx')).content
  // expect(indexContent).toEqual(defaultIndexContent)

  // await vfs.set('/dial.tsx', 'new dial content')
  // const newDialContent = (await vfs.get('/dial.tsx')).content
  // expect(newDialContent).toEqual('new dial content')

  // await expect(vfs.get('/fail.tsx')).rejects.toThrow()
  // await expect(
  //   vfs.set('/fail.tsx', 'some content that will fail'),
  // ).rejects.toThrow()
})
