// export const chain = <A>(value: A) => {
//   return {
//     value,
//     then: <B>(f: (a: A) => B) => chain<B>(f(value)),
//   }
// }

const _chain = <A>(f: () => A) => {
  const value = f()
  const self = {
    value: () => value,
    then: <B>(f: (a: A) => B) => _chain(() => f(value)),
    tap: (f: (a: A) => void) => {
      f(value)
      return self
    },
  }

  return self
}

export const chain = () => {
  return {
    then: <A>(f: () => A) => {
      return _chain(f)
    },
  }
}

export const last = <A>(as?: A[]): A | undefined => {
  const length = as?.length
  if (typeof length === 'undefined' || length === 0) {
    return undefined
  }
  return as?.[length - 1]
}
