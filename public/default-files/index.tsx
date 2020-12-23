import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { concatMap, delay, repeat, startWith } from 'rxjs/operators'
import { Dial } from './dial'
import { getAudioContext, interactable } from './internal'
import { easyConnect, reactInteractable } from './react-interactable'

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

type ParamLike = number | Observable<number> | AudioNode

const makeOsc = ({
  type,
  frequency,
  detune,
}: {
  type: OscillatorType
  frequency: ParamLike
  detune?: ParamLike
}): OscillatorNode => {
  const result: OscillatorNode = audioContext.createOscillator()
  result.type = type
  easyConnect(audioContext, frequency, result.frequency)
  if (detune) {
    easyConnect(audioContext, detune, result.detune)
  }
  result.start()
  return result
}

const makeGain = ({
  gainValue,
  source,
}: {
  gainValue: ParamLike
  source: AudioNode
}): AudioNode => {
  const result = audioContext.createGain()
  easyConnect(audioContext, gainValue, result.gain)
  source.connect(result)
  return result
}

const makeDial = (): BehaviorSubject<number> => {
  throw new Error('todo')
}

const frequency$ = of(300, 310, 280, 250).pipe(
  concatMap(freq => of(freq).pipe(delay(1000))),
  repeat(10),
  startWith(301),
)

const detune$ = of(0, 10, -20, 20, 50, -74).pipe(
  concatMap(freq => of(freq).pipe(delay(378))),
  repeat(100),
  startWith(301),
)

const gain$ = of(0.3, 0.6, 0.9).pipe(
  concatMap(freq => of(freq).pipe(delay(1200))),
  repeat(10),
  startWith(0.2),
)

const theOsc = makeOsc({
  type: 'triangle',
  frequency: frequency$,
  detune: detune$,
})
const theGain = makeGain({ gainValue: gain$, source: theOsc })
export default theGain

export const aReactInteractable = reactInteractable({ some: 'value' }, () => (
  <div>
    hello asdfasdfinteractable
    <br />
    <Dial min={0} max={100} initial={50} onChange={() => {}} radius={20} />
  </div>
))

console.log('value of aReactInteractable', aReactInteractable)
