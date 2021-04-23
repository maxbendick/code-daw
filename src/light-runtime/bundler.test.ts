import '@testing-library/jest-dom'
import {
  bundle,
  _getSkypackModule,

  _mapImports,
  _urlDecodeJavaScript,
  _urlEncodeJavaScript
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

test('errors on circular references', async () => {
  const indexFile = {
    path: '/index.tsx',
    content: `
      import { a } from './a'

      console.log('a should equal 7')

      export const anIndexImport = 4
    `,
  }
  const fileA = {
    path: '/a.tsx',
    content: `
      import { anIndexExport } from './index'
      export const a = 5 + 2
    `,
  }

  expect(bundle([indexFile, fileA])).rejects.toMatchObject({
    message: expect.stringContaining('Circular reference!'),
  })
})

test('bundle deep', async () => {
  const indexFile = {
    path: '/index.tsx',
    content: `
      import { a } from './a'
      console.log('a should equal 7')
    `,
  }
  const fileA = {
    path: '/a.tsx',
    content: `
      import { b } from './b'
      export const a = b + 2
    `,
  }
  const fileB = {
    path: '/b.tsx',
    content: `
      export const b = 5
    `,
  }
  const bundled = await bundle([indexFile, fileA, fileB])

  const importInIndex = bundled
    .split('\n')[1]
    .slice("      import { a } from '".length, -1)

  const decodedImportInIndex = _urlDecodeJavaScript(importInIndex)

  expect(decodedImportInIndex).not.toContain('./b')
  expect(decodedImportInIndex).toContain(_urlEncodeJavaScript(fileB.content))
})

test('urlEncodeJavaScript', () => {
  const original = 'hello from a test'
  const encoded = _urlEncodeJavaScript('hello from a test')
  expect(encoded).toEqual(
    'data:text/javascript;base64,aGVsbG8gZnJvbSBhIHRlc3Q=',
  )
  expect(_urlDecodeJavaScript(encoded)).toEqual(original)
})

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

test('skypack', () => {
  expect(_getSkypackModule('react')).toEqual(`https://cdn.skypack.dev/react`)
  expect(_getSkypackModule('react-dom')).toEqual(
    `https://cdn.skypack.dev/react-dom`,
  )
  expect(_getSkypackModule('react-dom/whatever')).toEqual(
    `https://cdn.skypack.dev/react-dom/whatever`,
  )
  expect(_getSkypackModule('rxjs/operators')).toEqual(
    `https://cdn.skypack.dev/rxjs/operators`,
  )
  expect(() => _getSkypackModule('not-a-supported-lib')).toThrow()
  expect(() => _getSkypackModule('react-but-not')).toThrow()
})
