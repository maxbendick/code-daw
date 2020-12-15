import { makeLocalStorageVfs } from './index'

const localStoragePrefix = 'code-daw/vfs/files'
const defaultFilesDirectoryUrl = `${process.env.PUBLIC_URL}/default-files`

const defaultIndexContent = 'default index content'
const defaultDialContent = 'diefault dial content'

const vfsFileLocalStoragePrefix = 'code-daw/vfs/files'
const pathToLocalStorageKey = (path: string) =>
  `${vfsFileLocalStoragePrefix}${path}`

const makeFetchMock = () => async (path: string) => {
  if (path === `${defaultFilesDirectoryUrl}/pathlist.json`) {
    return {
      json: async () => {
        return JSON.stringify(['/index.tsx', '/dial.tsx'])
      },
    }
  } else if (path === `${defaultFilesDirectoryUrl}/index.tsx`) {
    return {
      text: async () => {
        return defaultIndexContent
      },
    }
  } else if (path === `${defaultFilesDirectoryUrl}/dial.tsx`) {
    return {
      text: async () => {
        return defaultDialContent
      },
    }
  }

  throw new Error(`no accepted return - ${path}`)
}

const makeLocalStorageMock = () => {
  const mockObject = {} as any

  Object.defineProperties(mockObject, {
    getItem: {
      value: jest.fn((key: string) => {
        if (typeof key !== 'string') {
          throw new Error(`key must be string - ${key}`)
        }
        if (!mockObject[key]) {
          throw new Error(`mock: couldnt find for - ${key}`)
        }
        return mockObject[key]
      }),
      writable: false,
    },
    setItem: {
      value: jest.fn((key: string, value: string) => {
        if (typeof key !== 'string') {
          throw new Error(`key must be string - ${key}`)
        }
        if (typeof value !== 'string') {
          throw new Error(`value must be string - ${value}`)
        }
        mockObject[key] = value
      }),
      writable: false,
    },
  })

  mockObject[pathToLocalStorageKey('/index.tsx')] = defaultIndexContent
  mockObject[pathToLocalStorageKey('/dial.tsx')] = defaultDialContent

  return mockObject
}

// const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('LocalStorageVfs general function', async () => {
  const storage = await makeLocalStorageMock()
  ;(window as any).fetch = (global as any).fetch = makeFetchMock()

  const vfs = await makeLocalStorageVfs(storage)

  const allPaths = await vfs.getAllPaths()
  expect(allPaths).toEqual(['/dial.tsx', '/index.tsx'])

  const dialContent = (await vfs.get('/dial.tsx')).content
  expect(dialContent).toEqual(defaultDialContent)

  const indexContent = (await vfs.get('/index.tsx')).content
  expect(indexContent).toEqual(defaultIndexContent)

  await vfs.set('/dial.tsx', 'new dial content')
  const newDialContent = (await vfs.get('/dial.tsx')).content
  expect(newDialContent).toEqual('new dial content')

  await expect(vfs.get('/fail.tsx')).rejects.toThrow()
  await expect(
    vfs.set('/fail.tsx', 'some content that will fail'),
  ).rejects.toThrow()
})