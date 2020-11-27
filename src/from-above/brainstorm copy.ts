// import * as AudioEffects from '../lib/audio-effects'
// import * as AudioSignals from '../lib/audio-signals'
// import { dial, mixer, polySine, switcher, toggle } from '../lib/interactables'
// import * as IO from '../lib/io'
// import { pipe } from '../lib/pipe'
// import * as SignalEffects from '../lib/signal-effects'
// import * as Signals from '../lib/signals'

const AudioEffects = null as any
const AudioSignals = null as any
const [dial, mixer, polySine, switcher, toggle] = [] as any
const IO = null as any
const pipe = null as any
const SignalEffects = null as any
const Signals = null as any

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

export const masterOut = IO.audioOut(master)

const myXwitcherrr = switcher([
  { label: 'first choice', type: 'xander', hype: 3 },
  { label: '2nd choice', type: 'xavr1el' },
] as const)
