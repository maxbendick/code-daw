export const zzkjfkgdkjfgdf = 'asdjfksdjf'
// import * as AudioEffects from '../lib/audio-effects'
// import * as AudioSignals from '../lib/audio-signals'
// import { dial, mixer, polySine, switcher, toggle } from '../lib/interactables'
// import * as IO from '../lib/io'
// import { pipe } from '../lib/pipe'
// import * as SignalEffects from '../lib/signal-effects'
// import * as Signals from '../lib/signals'

// const x = Signals.from(123)
// const y = Signals.from(Signals.of(123))

/*

Need a way to trigger arbitrary envelopes

const triggerRise = eventButton()
const triggerFall = eventButton()

const rise = envelope()
  .linear(to 100, over 1s)
  .linear(to 200, over 0s)
  .linear(to 300, over 1s)

const fall = envelope()
  .linear(to 300, over 1s)
  .linear(to 200, over 1s)
  .linear(to 210, over 0.1s)
  .linear(to 100, over 1s)

dial({
  ...
  envelopes: [
     // requires envelope to be required before - is that a problem? no, because envelopes are inputs, not outputs to a dial
    [triggerRise, rise],
    [triggerFall, fall],
  ]
}) // smoothing can be a signal function

// what about partial updates? how would this envelope get removed? it's imperative - non starter
sendEnvelope(
  eventButton('rise the dial'),
  envelope()
    .linear(to 100, over 1s)
    .linear(to 200, over 0s)
    .linear(to 300, over 1s),
  myDial,
)

const mySynthAdsr = adsr(10, 10, 10, 10)

*/

// const droneToggle = toggle({ default: true })

// const superProcessedDrone = pipe(
//   () => AudioSignals.sine(100),
//   AudioEffects.reverb(),
//   AudioEffects.fmSwap(AudioSignals.sine(100, 10)),
//   AudioEffects.fm(Signals.sine(100)),
//   AudioEffects.reverb(Signals.triangle(100)),
//   AudioEffects.gate(droneToggle),
//   AudioEffects.mult(0.01),
// )(null as any)

// const mycoolerSIG = pipe(
//   () => Signals.sine(100),
//   a => Signals.pair(a, Signals.sine(10)),
//   SignalEffects.map(([fast, slow]) => (fast + slow) / 2),
// )(null)

// const slowFm = AudioSignals.sine(Signals.sine(100), 2)

// const pitchHz = dial({ start: 200, end: 600, default: 400 }) // dial here?
// // automation? maybe a button that records to a new Automation variable above

// const dialedUp = AudioSignals.sine(pitchHz) // dial here?

// const piano = pipe(
//   () => IO.midiIn('keyboard'),
//   polySine,
//   AudioEffects.reverb(0.5),
// )(null)

// // need to order somehow? UI here?
// const master = mixer({
//   alice: AudioSignals.sine(100),
//   bob: AudioSignals.sine(100),
//   charl: polySine(IO.midiIn('keyboard')),
//   piano,
//   superProcessedDrone,
//   dialedUp,
// })

// export const masterOut = IO.audioOut(master)

// const myXwitcherrr = switcher([
//   { label: 'first choice', type: 'xander', hype: 3 },
//   { label: '2nd choice', type: 'xavr1el' },
// ] as const)
