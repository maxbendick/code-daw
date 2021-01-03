import { combineLatest, Observable } from 'rxjs'
import { delay, map, scan, startWith } from 'rxjs/operators'
import { combineAudio, gain, oscillator } from './audio'
import { dial } from './dial'
import { drumMachine } from './drum-machine'
import { gateSequencer as booleanSequencer } from './sequencer'
import { transport } from './transport'

export const masterVolume = dial({ min: 0, max: 1 })

export const drumMachineAudio = drumMachine()

function sequence<A>(vals: A[], tick$: Observable<number>): Observable<A> {
  return tick$.pipe(map(tick => vals[tick % vals.length]))
}

const frequency$ = sequence([300, 310, 280, 250], transport.ms$(1000))
const gain$ = sequence([0.3, 0.6, 0.9], transport.ms$(1200))

export const detuneDial = dial({ min: -200, max: 200 })

export const seq = booleanSequencer(
  5,
  transport.eigth$.pipe(delay(200), startWith(0)),
)
export const moveUpGate = booleanSequencer(
  [true, true, false, true, false, true],
  transport.eigth$,
)

const makeSynthAudio = () => {
  // do some funky stuff wtih the frequency
  const crazyFreq$ = moveUpGate.pipe(
    scan(
      (state, gateOpen, index) => {
        if (!gateOpen) {
          return state
        }
        return {
          frequency: 200 + (index % 4) * 150,
        }
      },
      { frequency: 200 },
    ),
    map(s => s.frequency),
  )
  const theOsc = oscillator({
    type: 'triangle',
    frequency: crazyFreq$ ?? 440 ?? frequency$,
    detune: combineLatest([
      sequence([1, 50, 100, -100], transport.beat$),
      detuneDial,
    ]).pipe(map(([seqValue, dialValue]) => seqValue + dialValue)),
  })
  const theGain = gain({
    gainValue:
      (seq as Observable<boolean>).pipe(map(a => (a ? 0.3 : 0.21))) ??
      0.3 ??
      gain$,
    source: theOsc,
  })
  return theGain
}

export default gain({
  gainValue: masterVolume,
  source: combineAudio(
    gain({ source: makeSynthAudio(), gainValue: 0.5 }),
    gain({ source: drumMachineAudio, gainValue: 0.5 }),
  ),
})
