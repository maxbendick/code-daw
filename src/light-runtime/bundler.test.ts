import '@testing-library/jest-dom'
import {
  bundle,
  importEsmFile,
  _mapImports,
  _urlEncodeJavaScript,
} from './bundler'

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

      hello world :)
      
      testtext

      askdfjksjdk

      opoioukfhh
      `,
  }
  const helloFile = {
    path: '/hello.tsx',
    content: `
      export const zzzz = 5
    `,
  }
  const files: { path: string; content: string }[] = [indexFile, helloFile]

  const result = await bundle(files)

  // check that relative imports replaced with url-encoded content
  expect(result).toEqual(
    files[0].content.replace(
      './hello',
      _urlEncodeJavaScript(helloFile.content),
    ),
  )

  // check that everything after import lines is same
  expect(startingFromLine(result, 3)).toEqual(
    startingFromLine(indexFile.content, 3),
  )
})

test.skip('bundle and dynamic import', async () => {
  const indexFile = {
    path: '/index.tsx',
    content: `
      import * from './hello'
      import * from 'https://somewebsite.com'

      export const helloWorld = 666
      `,
  }
  const helloFile = {
    path: '/hello.tsx',
    content: `
      export const zzzz = 5
    `,
  }
  const bundled = await bundle([indexFile, helloFile])
  const createdModule = await importEsmFile(bundled)
  // const stuff = eval(bundled)
  expect(createdModule.helloWorld).toEqual(666)
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

askdfkskdf


lakssk

asldfljsdk

`

const sourceCodeConstReplaced = `
import { a, b } from "replaced1"
import * from "replaced2"
import myfile from 'replaced3'

hello from test

askdfkskdf


lakssk

asldfljsdk

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

const getLines = (source: string) => {
  const spacer = '}}||{{'
  return source
    .replaceAll('\n', '\n' + spacer)
    .split(spacer)
    .map(line => line.replace('\n', ''))
}

test('getLines idempotent', () => {
  const source = `
  asdkfjsdf

  askdfjdf

  ddddd
  
  `

  expect(getLines(source).join('\n')).toEqual(source)
})

const startingFromLine = (text: string, start: number) => {
  return getLines(text).slice(start).join('\n')
}

test('startingFromLine', () => {
  const text1 = `
    imprrot { asdf } from 'sdkjdj'
    imprrot { asdf } from 'sdkjdj'

    ksjksjas

    djdksahn

    gkjsksg
  `
  const expected = `
    ksjksjas

    djdksahn

    gkjsksg
  `

  expect(startingFromLine(text1, 3)).toEqual(expected)
})
