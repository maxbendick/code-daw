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

const GateSequencer: React.FC<{
  numBeats: number
  onChange: (beatsActive: boolean[]) => void
}> = ({ numBeats, onChange }) => {
  const [beatsActive, setBeatsActive] = useState(allTrue(numBeats))

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

export const gateSequencer = (numBeats: number) => {
  const beatsActive$ = new BehaviorSubject<boolean[]>(allTrue(numBeats))

  const onBeatsChange = (beatsActive: boolean[]) => {
    beatsActive$.next(beatsActive)
  }

  const result$: Observable<boolean> = transport.beats$.pipe(
    withLatestFrom(beatsActive$),
    map(([beat, beatsActive]) => beatsActive[beat % beatsActive.length]),
  )

  return reactInteractable(result$, () => (
    <GateSequencer numBeats={numBeats} onChange={onBeatsChange} />
  ))
}
