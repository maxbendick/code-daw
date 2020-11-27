// export const chain = <A>(value: A) => {
//   return {
//     value,
//     then: <B>(f: (a: A) => B) => chain<B>(f(value)),
//   }
// }

const _chain = <A>(f: () => A) => {
  const value = f()
  return {
    value: () => value,
    then: <B>(f: (a: A) => B) => _chain(() => f(value)),
    tap: (f: (a: A) => void) => {
      f(value)
    },
  }
}

export const chain = () => {
  return {
    then: <A>(f: () => A) => {
      return _chain(f)
    },
  }
}
