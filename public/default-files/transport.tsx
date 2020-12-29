import { interval } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
} from 'rxjs/operators'

const msPerBeat = 500

export const transport = {
  beats$: interval(msPerBeat).pipe(
    map(tick => tick + 1),
    startWith(0),
    distinctUntilChanged(),
    shareReplay(),
  ),
}

const subscription = transport.beats$.subscribe()

// TODO make this do something
export const onDestroy = () => {
  subscription.unsubscribe()
}
