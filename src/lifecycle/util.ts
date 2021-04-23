export const waitForShiftEnter = () =>
  new Promise<void>((resolve, reject) => {
    window.onkeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        window.onkeydown = null
        resolve(null as any)
      }
    }
  })
