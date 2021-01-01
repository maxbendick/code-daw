import * as React from 'react'
import { useState } from 'react'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, withLatestFrom } from 'rxjs/operators'
import { reactInteractable } from './react-interactable'
import { transport } from './transport'

const allTrue = (length: number) => {
  const result: boolean[] = []
  for (let i = 0; i < length; i++) {
    result[i] = true
  }
  return result
}

const Beat: React.FC<{ active: boolean; setActive: (a: boolean) => void }> = ({
  active,
  setActive,
}) => {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        backgroundColor: active ? 'rgba(0, 0, 255, 0.5)' : 'transparent',
        marginRight: 2,
        border: '1px solid #ccc',
        cursor: 'pointer',
      }}
      onClick={() => setActive(!active)}
    ></div>
  )
}

export const _GateSequencer: React.FC<{
  initialBeatsActive: boolean[]
  onChange: (beatsActive: boolean[]) => void
}> = ({ initialBeatsActive, onChange }) => {
  const [beatsActive, setBeatsActive] = useState(initialBeatsActive)

  const setBeat = (beat: number, active: boolean) => {
    const nextBeatsActive = [...beatsActive]
    nextBeatsActive[beat] = active
    setBeatsActive(nextBeatsActive)
    onChange(nextBeatsActive)
  }
  return (
    <div style={{ display: 'flex' }}>
      {beatsActive.map((beat, index) => {
        return (
          <Beat active={beat} setActive={active => setBeat(index, !beat)} />
        )
      })}
    </div>
  )
}

export const _gateSequencerUnwrapped = (
  beats: number | boolean[],
  tick$: Observable<number> = transport.beat$,
): { value: Observable<boolean>; Component: React.FC } => {
  const initialBeatsActive = typeof beats === 'number' ? allTrue(beats) : beats

  const beatsActive$ = new BehaviorSubject<boolean[]>(initialBeatsActive)

  const onBeatsChange = (beatsActive: boolean[]) => {
    beatsActive$.next(beatsActive)
  }

  const result$: Observable<boolean> = tick$.pipe(
    withLatestFrom(beatsActive$),
    map(([beat, beatsActive]) => beatsActive[beat % beatsActive.length]),
  )

  return {
    value: result$,
    Component: () => (
      <_GateSequencer
        initialBeatsActive={beatsActive$.value}
        onChange={onBeatsChange}
      />
    ),
  }
}

export const gateSequencer = (
  beats: number | boolean[],
  tick$: Observable<number> = transport.beat$,
): Observable<boolean> => {
  const { value, Component: component } = _gateSequencerUnwrapped(beats, tick$)
  return reactInteractable(value, component)
}
