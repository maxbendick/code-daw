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

  return mockObject
}
