import React from 'react'
import { BehaviorSubject, interval as rxInterval, Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { combineAudio, gain } from './audio'
import { DialBankComponent } from './dial'
import { getAudioContext } from './internal'
import { reactInteractable } from './react-interactable'
// I don't recommend changing this file within the app

// Only press start while on the /index.tsx file

interface MixerSourceConfig {
  label: string
  source: AudioNode
  scale?: number,
  initial?: number,
}
export const mixer = (ins: MixerSourceConfig[]): { out: AudioNode } => {
  const gainSubjects = ins.map(() => new BehaviorSubject(1.0))
  const dialConfigs = ins.map(({ label, scale, initial }) => {
    const safeScale = scale ?? 1.0;

    return ({
      min: 0,
      max: scale ?? 1.0,
      initial: (initial ?? 1.0) * (safeScale ?? 1.0),
      label,
    })
  })

  const gainedAudios = ins.map(({ source }, i) =>
    gain({ source, gainValue: gainSubjects[i] }),
  )
  const output = gain({ source: combineAudio(...gainedAudios), gainValue: 3})

  const onChangeAtIndex = (value: number, index: number) => {
    gainSubjects[index].next(value);
  }

  return reactInteractable({ out: output }, () => (
    <DialBankComponent
      dialConfigs={dialConfigs}
      onChangeAtIndex={onChangeAtIndex}
    />
  ))
}

export function sequence<A>(vals: A[], tick$: Observable<number>): Observable<A> {
  return tick$.pipe(map(tick => vals[tick % vals.length]))
}

export function noteToFrequency(note: number) {
  return (440 / 32) * 2 ** ((note - 9) / 12)
}

export const safetyLimiter = (source: AudioNode) => {
  const output = getAudioContext().createGain()
  output.gain.value = 0
  rxInterval(120)
    .pipe(take(10))
    .subscribe(i => {
      output.gain.value = 0.1 * i
    })
  source.connect(output)
  return output
}