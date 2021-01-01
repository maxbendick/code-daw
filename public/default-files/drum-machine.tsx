import * as React from 'react'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { combineAudio } from './audio'
import { reactInteractable } from './react-interactable'
import { SampleUrl, singleBufferSampler } from './sampler'
import { _gateSequencerUnwrapped } from './sequencer'
import { transport } from './transport'

export interface DrumMachineConfig {
  numCycles?: number
  tick$?: Observable<any>
}

const TickRow: React.FC<{ ticks: boolean[] }> = () => {
  return <div></div>
}

const Tick: React.FC<{
  active: boolean
  setActive: (active: boolean) => void
}> = ({ active, setActive }) => {
  return (
    <div
      onClick={() => setActive(!active)}
      style={{ width: 10, height: 10, border: '1px solid rgba(1, 1, 1, 0.5)' }}
    ></div>
  )
}

export const drumMachine = (config?: DrumMachineConfig) => {
  const { numCycles = 16, tick$ = transport.sixteenth$ } = config ?? {}
  const sampleUrls = [
    SampleUrl.kick909,
    SampleUrl.chirpHhClosed,
    SampleUrl.chirpHhOpen,
  ].reverse()
  const rows = sampleUrls.map(sampleUrl => {
    const { value: gateOpen$, Component } = _gateSequencerUnwrapped(
      numCycles,
      tick$,
    )
    const audio = singleBufferSampler(
      sampleUrl,
      gateOpen$.pipe(filter(a => !!a)),
    )

    return {
      sampleUrl,
      audio,
      Component,
    }
  })

  const allAudio = rows.map(({ audio }) => audio)
  const output = combineAudio(...allAudio)

  return reactInteractable(output, () => (
    <div>
      {rows.map(({ sampleUrl, Component }) => {
        return (
          <div>
            <div>{sampleUrl}</div>
            <br />
            <Component />
          </div>
        )
      })}
    </div>
  )) as AudioNode
}
