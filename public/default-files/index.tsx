import { Observable, of } from 'rxjs'
import { concatMap, delay, map, repeat, startWith } from 'rxjs/operators'
import { gain, oscillator } from './audio'
import { dial } from './dial'
import { gateSequencer } from './sequencer'
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
  return transport.beats$.pipe(
    map(beat => {
      return vals[beat % vals.length]
    }),
  )
}

transport.beats$.subscribe(beat => {
  console.log('beat!', beat)
})

export const seq = gateSequencer(5)

seq.subscribe(s => {
  console.log('seqs!', s)
})

const theOsc = oscillator({
  type: 'triangle',
  frequency: 440 ?? frequency$,
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
