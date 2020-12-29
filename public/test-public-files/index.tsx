import * as React from 'react'
import { oscillator } from './audio'
import { Dial } from './dial'
import { getAudioContext } from './internal'

console.log('Dial', Dial)

const audioContext = getAudioContext()

/// @ts444-expect-error
// import * as Operators from 'https://cdn.skypack.dev/rxjs/operators'

const Comp = <div />

// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()

export default oscillator({ type: 'sine', frequency: 400 })
