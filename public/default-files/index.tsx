import { Observable, of } from 'rxjs'
import { concatMap, delay, map, repeat, scan, startWith } from 'rxjs/operators'
import { combineAudio, gain, oscillator } from './audio'
import { dial } from './dial'
import { drumMachine } from './drum-machine'
import { SampleUrl, singleBufferSampler } from './sampler'
import { gateSequencer as booleanSequencer } from './sequencer'
import { transport } from './transport'

export const masterVolume = dial({ min: 0, max: 3 })

export const drumMachineAudio = drumMachine()

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

const makeDrumAudio = () => {
  const kickAudio = singleBufferSampler(SampleUrl.kick909, transport.beat$)
  const openHatAudio = singleBufferSampler(
    SampleUrl.chirpHhOpen,
    transport.eigth$,
  )
  const closedHatAudio = singleBufferSampler(
    SampleUrl.chirpHhClosed,
    transport.eigth$.pipe(delay(120)),
  )
  const drumsAudio = gain({
    gainValue: 1,
    source: combineAudio(kickAudio, openHatAudio, closedHatAudio),
  })
  return drumsAudio
}

export const seq = booleanSequencer(
  5,
  transport.eigth$.pipe(delay(200), startWith(0)),
)
export const moveUpGate = booleanSequencer(
  [true, true, false, true, false, true],
  transport.eigth$,
)
const makeSynthAudio = () => {
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
  return theGain
}

export default gain({
  gainValue: masterVolume,
  source: combineAudio(
    // makeDrumAudio(),
    gain({ source: makeSynthAudio(), gainValue: 0.5 }),
    gain({ source: drumMachineAudio, gainValue: 0.5 }),
  ),
})
