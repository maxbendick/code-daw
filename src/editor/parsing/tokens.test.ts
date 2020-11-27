import { getAllTokens } from './tokens'

test('renders learn react link', () => {
  const result = getAllTokens(`
somethin s

asdfasdf
asdsdf

dial({ hello: bob })

polySine({ kaasdf: 2 }) dial()

    switcher({aas fsdfff})

  mixer({ adaaaa })

dddsa
  `)

  console.log('result', result)
})
