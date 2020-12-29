import { interval } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
} from 'rxjs/operators'

const msPerBeat = 500
const msPer16th = msPerBeat / 4

const sixteenth$ = interval(msPer16th).pipe(
  map(tick => tick + 1),
  startWith(0),
  distinctUntilChanged(),
  shareReplay(),
)

const beat$ = sixteenth$.pipe(
  filter(tick => tick % 4 === 0),
  map(tick => tick / 4),
)

export const transport = {
  beat$: beat$,
  quarter$: beat$,
  sixteenth$: sixteenth$,
  eigth$: sixteenth$.pipe(
    filter(tick => tick % 2 === 0),
    map(tick => tick / 2),
  ),
}

const subscription = transport.beat$.subscribe()

// TODO make this do something
export const onDestroy = () => {
  subscription.unsubscribe()
}
