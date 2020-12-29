// prettier-ignore
import * as React from 'react'
// prettier-ignore
import * as ReactDOM from 'react-dom'
// prettier-ignore
import { BehaviorSubject, Observable, of } from 'rxjs'
// prettier-ignore
import { concatMap, delay, repeat, startWith } from 'rxjs/operators'
import { gain, oscillator } from './audio'
// prettier-ignore
import { Dial } from './dial'
// prettier-ignore
import { getAudioContext, interactable } from './internal'
// prettier-ignore
import { reactInteractable } from './react-interactable'

const audioContext: AudioContext = getAudioContext()

console.log('the dial component fn', Dial)

export const nodeHandler = domNode =>
  ReactDOM.render(<div>hello dddreact</div>, domNode)

const myDomNode = document.createElement('div')
nodeHandler(myDomNode)

export const another = interactable({
  value: ['asdkjfjskdfmnvn'],
  domNode: myDomNode,
  onDestroy: () => {
    ReactDOM.unmountComponentAtNode(myDomNode)
  },
})

const makeDial = ({
  min,
  max,
  initial,
}: {
  min: number
  max: number
  initial: number
}): BehaviorSubject<number> => {
  const dialValues$ = new BehaviorSubject<number>(initial)

  const result = reactInteractable(dialValues$, () => (
    <div>
      hello asdfasdfinteractable
      <br />
      <Dial
        min={min}
        max={max}
        initial={initial}
        onChange={value => {
          dialValues$.next(value)
        }}
        radius={20}
      />
    </div>
  ))

  return result
}

const frequency$ = sequence([300, 310, 280, 250], 1000)
const detune$ = sequence([0, 10, -20, 20, 50, -74], 378)
const gain$ = sequence([0.3, 0.6, 0.9], 1200)

export const detuneDial = makeDial({ min: -200, max: 200, initial: 0 })

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

export const aReactInteractable = reactInteractable({ some: 'value' }, () => (
  <div>
    hello asdfasdfinteractable
    <br />
    <Dial min={0} max={100} initial={50} onChange={() => {}} radius={20} />
  </div>
))

console.log('value of aReactInteractable', aReactInteractable)
