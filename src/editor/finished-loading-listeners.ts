// TODO non-global architecture

const finishedLoadingListerners: (() => void)[] = []

export const registerFinishedLoadingListener = (f: () => void) => {
  finishedLoadingListerners.push(f)
}

export const alertFinishedLoadingListeners = () => {
  for (const f of finishedLoadingListerners) {
    f()
  }
}
