import { defaultFilesPath } from "../config"

const localStoragePrefix = 'code-daw/vfs/files'
// const defaultFilesDirectoryUrl = `${process.env.PUBLIC_URL}/default-files`

export const defaultIndexContent = 'default index content'
export const defaultDialContent = 'diefault dial content'

const vfsFileLocalStoragePrefix = 'code-daw/vfs/files'
const pathToLocalStorageKey = (path: string) =>
  `${vfsFileLocalStoragePrefix}${path}`

export const makeFetchMock = () => async (path: string) => {
  if (path === `${defaultFilesPath}/pathlist.json`) {
    return {
      json: async () => {
        return JSON.stringify(['/index.tsx', '/dial.tsx'])
      },
    }
  } else if (path === `${defaultFilesPath}/index.tsx`) {
    return {
      text: async () => {
        return defaultIndexContent
      },
    }
  } else if (path === `${defaultFilesPath}/dial.tsx`) {
    return {
      text: async () => {
        return defaultDialContent
      },
    }
  }

  throw new Error(`no accepted return - ${path}`)
}

export const makeLocalStorageMock = () => {
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
