import { Observable, of } from 'rxjs'
import { concatMap, delay, repeat, startWith } from 'rxjs/operators'
import { gain, oscillator } from './audio'
import { dial } from './dial'

const frequency$ = sequence([300, 310, 280, 250], 1000)
const gain$ = sequence([0.3, 0.6, 0.9], 1200)

export const detuneDial = dial({ min: -200, max: 200, initial: -100 })

function sequence<A>(vals: A[], msBetween: number): Observable<A> {
  const [firstVal, ...restVals] = vals
  return of(...restVals, firstVal).pipe(
    concatMap(freq => of(freq).pipe(delay(msBetween))),
    repeat(),
    startWith(firstVal),
  )
}

const theOsc = oscillator({
  type: 'triangle',
  frequency: 440 ?? frequency$,
  detune: detuneDial ?? sequence([1, 50, 100], 1000) ?? 0,
})
const theGain = gain({ gainValue: 0.3 ?? gain$, source: theOsc })
export default theGain
