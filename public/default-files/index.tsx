import { Observable, of } from 'rxjs'
import { concatMap, delay, map, repeat, scan, startWith } from 'rxjs/operators'
import { gain, oscillator } from './audio'
import { dial } from './dial'
import { gateSequencer as booleanSequencer } from './sequencer'
import { transport } from './transport'

const frequency$ = sequenceMs([300, 310, 280, 250], 1000)
const gain$ = sequenceMs([0.3, 0.6, 0.9], 1200)

export const detuneDial = dial({ min: -200, max: 200, initial: -100 })

function sequenceMs<A>(vals: A[], msBetween: number): Observable<A> {
  const [firstVal, ...restVals] = vals
  return of(...restVals, firstVal).pipe(
    concatMap(freq => of(freq).pipe(delay(msBetween))),
    repeat(),
    startWith(firstVal),
  )
}

function sequenceBeats<A>(vals: A[]): Observable<A> {
  return transport.beat$.pipe(
    map(beat => {
      return vals[beat % vals.length]
    }),
  )
}

transport.beat$.subscribe(beat => {
  console.log('beat!', beat)
})

export const seq = booleanSequencer(
  5,
  transport.eigth$.pipe(delay(200), startWith(0)),
)

seq.subscribe(s => {
  console.log('seqs!', s)
})

export const devilSeq = booleanSequencer(
  [true, true, false, true, false, true],
  transport.quarter$,
) as Observable<boolean>

// TODO make sure this can start with index 0
const devilFreq$ = devilSeq.pipe(
  scan(
    (state, gateOpen, absIndex) => {
      if (!gateOpen) {
        return state
      }
      return {
        frequency: 200 + (absIndex % 4) * 150,
      }
    },
    { frequency: 200 },
  ),
  map(s => s.frequency),
)

const theOsc = oscillator({
  type: 'triangle',
  frequency: devilFreq$ ?? 440 ?? frequency$,
  detune:
    sequenceBeats([1, 50, 100, -100]) ??
    detuneDial ??
    sequenceMs([1, 50, 100], 1000) ??
    0,
})
const theGain = gain({
  gainValue:
    (seq as Observable<boolean>).pipe(map(a => (a ? 0.3 : 0.21))) ??
    0.3 ??
    gain$,
  source: theOsc,
})
export default theGain
