import { interpret } from 'xstate'
import { makeFetchMock, makeLocalStorageMock } from './test-utils'
import { makeVfsMachine } from './vfs-machine'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('vfs machine general function', async () => {
  const machine = makeVfsMachine(makeLocalStorageMock(), makeFetchMock() as any)

  const service = interpret(machine).onTransition(state => {
    console.log('state.event', state.event)
    console.log(state.value)
  })

  service.start()

  await wait(10)

  service.send({ type: 'GET', path: '/index.tsx' })
  expect(service.state.context.requestRefs.length).toBe(1)

  await wait(10)
  expect(service.state.context.requestRefs.length).toBe(0)

  service.send({
    type: 'SET',
    path: '/index.tsx',
    content: 'the new index content',
  })
  expect(service.state.context.requestRefs.length).toBe(1)

  expect(service.state.context.activePath).toBeUndefined()
  service.send({ type: 'SET_ACTIVE', path: '/index.tsx' })
  await wait(10)
  expect(service.state.context.activePath).toEqual('/index.tsx')

  await wait(10)
  expect(service.state.context.requestRefs.length).toBe(0)

  expect(service.state.context.pathToContent).toEqual({
    '/index.tsx': 'the new index content',
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
