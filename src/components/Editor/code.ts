export const code = [
  'function Person(age) {',
  '  if (age) {',
  '    this.age = age;',
  '  }',
  '}',
  'Person.prototype.getAge = function () {',
  '  return this.age;',
  '};\n',
].join('\n')

export const code2 = `
import * as AudioEffects from '../lib/audio-effects'
import * as AudioSignals from '../lib/audio-signals'
import { dial, mixer, polySine, switcher, toggle } from '../lib/interactables'
import * as IO from '../lib/io'
import { pipe } from '../lib/pipe'
import * as SignalEffects from '../lib/signal-effects'
import * as Signals from '../lib/signals'

const x = Signals.from(123)
const y = Signals.from(Signals.of(123))

const droneToggle = toggle({ default: true })

const superProcessedDrone = pipe(
  () => AudioSignals.sine(100),
  AudioEffects.reverb(),
  AudioEffects.fmSwap(AudioSignals.sine(100, 10)),
  AudioEffects.fm(Signals.sine(100)),
  AudioEffects.reverb(Signals.triangle(100)),
  AudioEffects.gate(droneToggle),
  AudioEffects.mult(0.01),
)(null as any)

const mycoolerSIG = pipe(
  () => Signals.sine(100),
  a => Signals.pair(a, Signals.sine(10)),
  SignalEffects.map(([fast, slow]) => (fast + slow) / 2),
)(null)

const slowFm = AudioSignals.sine(Signals.sine(100), 2)

const pitchHz = dial({ start: 200, end: 600, default: 400 }) // dial here?
// automation? maybe a button that records to a new Automation variable above

const dialedUp = AudioSignals.sine(pitchHz) // dial here?

const piano = pipe(
  () => IO.midiIn('keyboard'),
  polySine,
  AudioEffects.reverb(0.5),
)(null)

// need to order somehow? UI here?
const master = mixer({
  alice: AudioSignals.sine(100),
  bob: AudioSignals.sine(100),
  charl: polySine(IO.midiIn('keyboard')),
  piano,
  superProcessedDrone,
  dialedUp,
})

export const masterOut = IO.audioOut(master)

const myXwitcherrr = switcher([
  { label: 'first choice', type: 'xander', hype: 3 },
  { label: '2nd choice', type: 'xavr1el' },
] as const)
`

export const code3 = `
import { reverb } from 'code-daw/audio-effects'
import * as AudioEffects from 'code-daw/audio-effects'
import * as AudioSignals from 'code-daw/audio-signals'
import * as IO from 'code-daw/io'
import * as SignalEffects from 'code-daw/signal-effects'
import * as Signals from 'code-daw/signals'
import { pipe } from 'code-daw/pipe'

import { dial, mixer, polySine, switcher, toggle } from 'code-daw/interactables'
// const [dial, mixer, polySine, switcher, toggle] = [] as any

const x = Signals.from(123)
const y = Signals.from(Signals.of(123))

const droneToggle = toggle({ default: true })

reverb()

const firstDial = dial({ start: 200, end: 600, default: 400 }) // dial here?

const superProcessedDrone = pipe(
  () => AudioSignals.sine(100),
  AudioEffects.reverb(),
  AudioEffects.fmSwap(AudioSignals.sine(100, 10)),
  AudioEffects.fm(Signals.sine(100)),
  AudioEffects.reverb(Signals.triangle(100)),
  AudioEffects.gate(droneToggle),
  AudioEffects.mult(0.01),
)(null as any)

import { Test } from 'test/file2'

const myTest: Test<number> = { x: 1 }

const mycoolerSIG = pipe(
  () => Signals.sine(100),
  (a: any) => Signals.pair(a, Signals.sine(10)),
  SignalEffects.map(([fast, slow]: [any, any]) => (fast + slow) / 2),
)(null)

const slowFm = AudioSignals.sine(Signals.sine(100), 2)

const pitchHz = dial({ start: 200, end: 600, default: 400 }) // dial here?
// automation? maybe a button that records to a new Automation variable above

const dialedUp = AudioSignals.sine(pitchHz) // dial here?

const piano = pipe(
  () => IO.midiIn('keyboard'),
  polySine,
  AudioEffects.reverb(0.5),
)(null)

// need to order somehow? UI here?
const master = mixer({
  alice: AudioSignals.sine(100),
  bob: AudioSignals.sine(100),
  charl: polySine(IO.midiIn('keyboard')),
  piano,
  superProcessedDrone,
  dialedUp,
})

// use thing from IO instead
// export const masterOut = IO.audioOut(master)

const myXwitcherrr = switcher([
  { label: 'first choice', type: 'xander', hype: 3 },
  { label: '2nd choice', type: 'xavr1el' },
] as const)

`

export const code4 = `

import { dial } from 'code-daw/interactables'
import { sine, saw, triangle, square } from 'code-daw/oscillators'
import { masterOut } from 'code-daw/io'
import { gain } from 'code-daw/effects'
import { analyser } from 'code-daw/testing'

const firstDial = dial({
  start: 200,
  end: 561,
  defaultValue: 207,
})

const secondDial = dial({
  start: 250,
  end: 350,
  defaultValue: 300,
})

const gainDial = dial({
  start: 0.98,
  end: 1,
  defaultValue: 0.99,
})



const modulatorFrequency = dial({
  start: 0.5,
  end: 10,
  defaultValue: 1,
})
const modulatorGain = dial({
  start: 1,
  end: 10,
  defaultValue: 1,
})
const modulatorOsc = sine({ frequency: modulatorFrequency })
const modulator = gain(modulatorGain, modulatorOsc)

const mySine = sine({
  frequency: firstDial,
  fm: modulator,
})

const gainSine = gain(gainDial, mySine)

analyser(gainSine)

masterOut(gainSine)

console.log('dial1', firstDial)
console.log('dial2', secondDial)
console.log('sinee', sine)

`
