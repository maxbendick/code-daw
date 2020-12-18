import '@testing-library/jest-dom'
import { bundle, _mapImports, _urlEncodeJavaScript } from './bundler'

test('bundle without import', async () => {
  const files: { path: string; content: string }[] = [
    {
      path: '/index.tsx',
      content: 'hello world :)',
    },
  ]

  const result = await bundle(files)

  expect(result).toEqual(files[0].content)
})

test('bundle with some imports', async () => {
  const indexFile = {
    path: '/index.tsx',
    content: `
      import * from './hello'
      import * from 'https://somewebsite.com'

      hello world :)`,
  }
  const helloFile = {
    path: '/hello.tsx',
    content: `
      export const zzzz = 5
    `,
  }
  const files: { path: string; content: string }[] = [indexFile, helloFile]

  const result = await bundle(files)

  expect(result).toEqual(
    files[0].content.replace(
      './hello',
      _urlEncodeJavaScript(helloFile.content),
    ),
  )
})

test('urlEncodeJavaScript', () => {
  expect(_urlEncodeJavaScript('hello from a test')).toEqual(
    'data:text/javascript;base64,aGVsbG8gZnJvbSBhIHRlc3Q=',
  )
})

// idk how to do this right
// test('bundle throws on empty', async () => {
//   const files: { path: string; content: string }[] = []
//   await expect(async () => await bundle(files)).toThrow()
// })

test('mapImports empty', () => {
  const mapped = _mapImports('\n', originalImport => originalImport)
  expect(mapped.trim()).toEqual('')
})

const sourceCode = `
import { a, b } from "some-package"
import * from "https://fromtheweb.com"
import myfile from './myfile'

hello from test
`

const sourceCodeConstReplaced = `
import { a, b } from "replaced1"
import * from "replaced2"
import myfile from 'replaced3'

hello from test
`

test('mapImports identity', () => {
  const fn = jest.fn(originalImport => originalImport)

  const mapped = _mapImports(sourceCode, fn)
  expect(mapped.trim()).toEqual(sourceCode.trim())

  expect(fn).toBeCalledTimes(3)
  expect(fn).toHaveBeenCalledWith('some-package')
  expect(fn).toHaveBeenCalledWith('https://fromtheweb.com')
  expect(fn).toHaveBeenCalledWith('./myfile')
})

test('mapImports to const', () => {
  const fn = jest.fn(originalImport => {
    switch (originalImport) {
      case 'some-package':
        return 'replaced1'
      case 'https://fromtheweb.com':
        return 'replaced2'
      case './myfile':
        return 'replaced3'
    }
    throw new Error('unexpeced import ' + originalImport)
  })

  const mapped = _mapImports(sourceCode, fn)
  expect(mapped.trim()).toEqual(sourceCodeConstReplaced.trim())

  expect(fn).toBeCalledTimes(3)
  expect(fn).toHaveBeenCalledWith('some-package')
  expect(fn).toHaveBeenCalledWith('https://fromtheweb.com')
  expect(fn).toHaveBeenCalledWith('./myfile')
})
