import '@testing-library/jest-dom'
import { _urlEncodeJavaScript } from './bundler'

test.skip('debuggin', async () => {
  const source = `
    import { map } from 'https://cdn.skypack.dev/rxjs/operators'

    console.log('map', map)
  `

  const encoded = _urlEncodeJavaScript(source)

  expect(encoded.startsWith('data:text')).toBeTruthy()

  const mod = await import(/* webpackIgnore: true */ encoded)

  expect(mod).toEqual('sup')
})
