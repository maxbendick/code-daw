export const wait = async (ms: number): Promise<void> => {
  await new Promise(resolve => setTimeout(() => resolve(true), ms))
  return
}

export const makeJsonStringifySafe = <A>(obj: A): A => {
  const seen = new Set<string>()
  ;(obj as any).toJSON = (key: string) => {
    if (seen.size > 1000 || seen.has(key)) {
      return '...'
    }
    seen.add(key)
  }
  return obj
}
