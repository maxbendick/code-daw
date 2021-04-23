// Press the start button above!

// Be careful, your changes won't be 
// saved and there are no docs yet

// Only tested on chrome


import { of } from 'rxjs'
import { filter, map, startWith } from 'rxjs/operators'
import {
  combineAudio,
  delayEffect as delayEffect,
  gain,
  highpassFilter,
  oscillator
} from './audio'
import {
  mixer,
  noteToFrequency,
  safetyLimiter,
  sequence
} from './demo'
import { dial, dialBank } from './dial'
import {
  SampleUrl,
  singleBufferSampler
} from './sampler'
import { transport } from './transport'

export const mainParameters = dialBank([
  { min: 0, max: 1.1, initial: 0.5, label: 'Kick Volume' },
  { min: 0, max: 0.5, initial: 0.2, label: 'Hihat Volume' },
  { min: 0, max: 1, initial: 0.5, label: 'Bass Volume' },
  { min: 10, max: 1000, initial: 10, label: 'Filter Frequency', }
])

const [kickVolume$, hihatVolume$, bassVolume$, filterFrequency$] = mainParameters;


/*** KICK ***/

const kick = singleBufferSampler(SampleUrl.kick, transport.beat$);


/*** HIHAT ***/

const offbeat$ = transport.eigth$.pipe(filter(i => i % 2 === 1));

const hihat = singleBufferSampler(SampleUrl.hhClosed, offbeat$);

const delayedHihat = delayEffect({
  source: hihat,
  dryWet: of(0.12),
  feedback: 0.5,
  delaySeconds: 0.11,
})


/*** BASS ***/

const bassline$ = sequence(
  [
    // `note` is midi note relative to root
    { note: 0, volume: 1 },
    { note: 3, volume: 1 },
    { note: 1, volume: 1 },
    { note: 12, volume: 0.7 },
  ],
  transport.eigth$,
)
const bassLower = oscillator({
  type: 'triangle',
  frequency: bassline$.pipe(map(({ note }) => noteToFrequency(note + 26))),
})

// double the bassline 1 octave above
const bassUpper = oscillator({
  type: 'triangle',
  frequency: bassline$.pipe(map(({ note }) => noteToFrequency(note + 26 + 12))),
})

// This dial alters the character of the bass
export const bassUpperGain$ = dial({
  label: 'Bass 8va',
  min: 0, 
  max: 1.6,
  initial: 0.8,
})

const bassUpperGained = gain({ source: bassUpper, gainValue: bassUpperGain$ })

// accent individual notes of bassline
const bassAccent = gain({
  source: combineAudio(bassLower, bassUpperGained),
  gainValue: bassline$.pipe(map(({ volume }) => volume * 0.8)),
})

const bass = highpassFilter({
  source: bassAccent,
  frequency: of(100),
  q: of(1),
})





/*** MIX ***/

// control volume and combine audio of instruments
export const mixed = mixer([
  { label: 'Kick', source: gain({ source: kick, gainValue: kickVolume$ }) },
  { label: 'Hihat', source: gain({ source: delayedHihat, gainValue: hihatVolume$ }) },
  { label: 'Bass', source: gain({ source: bass, gainValue: bassVolume$ }) },
])

const mixedAndFiltered = highpassFilter({
  source: mixed.out,
  frequency: filterFrequency$.pipe(startWith(1000)),
  q: of(1),
})

export default safetyLimiter(mixedAndFiltered)
