import { chain } from '../chain'
import { getAllTokens } from './tokens'

test('renders learn react link', () => {
  const result = getAllTokens(
    `
somethin s

asdfasdf
asdsdf

const VARNAME = dial(

const mySecondDial = dial(


dial({ hello: bob })

polySine({ kaasdf: 2 }) dial()

    switcher({aas fsdfff})

  mixer({ adaaaa })

dddsa
  `.split('\n'),
  )

  expect(result).toBeTruthy()

  console.log('result', result)
})

test('chain', () => {
  const c = chain()
    .then(() => {
      return 0
    })
    .then(prev => {
      expect(prev).toEqual(0)
      return prev + 2
    })
    .then(prev => {
      expect(prev).toEqual(2)
      return 'sup'
    })

  expect(c.value()).toEqual('sup')
})
