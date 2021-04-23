// I don't recommend changing this file within the app

// Only press start while on the /index.tsx file

import { interval } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith
} from 'rxjs/operators'
import { cleanupOnDestroy } from './internal'

const msPerBeat = 500
const msPer16th = msPerBeat / 4

// TODO use hybrid webaudio+timer based transport for sample accuracy
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
  ms$: (ms: number) => interval(ms),
}

cleanupOnDestroy(transport.beat$.subscribe())
