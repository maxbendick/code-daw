export const waitForShiftEnter = () =>
  new Promise<void>((resolve, reject) => {
    window.onkeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        window.onkeydown = null
        resolve(null as any)
      }
    }
  })

export const makeJsonStringifySafe = (obj: any) => {
  const seen = new Set<string>()
  obj.toJSON = (key: string) => {
    if (seen.size > 1000 || seen.has(key)) {
      return '...'
    }
    seen.add(key)
  }
}