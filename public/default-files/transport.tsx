import { interval } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

const msPerBeat = 500

export const transport = {
  beats$: interval(msPerBeat).pipe(shareReplay()),
}

const subscription = transport.beats$.subscribe()

// TODO make this do something
export const onDestroy = () => {
  subscription.unsubscribe()
}
