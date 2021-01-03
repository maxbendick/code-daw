import * as React from 'react'
import { BehaviorSubject, Observable } from 'rxjs'
import { debounceTime, filter, withLatestFrom } from 'rxjs/operators'
import { combineAudio } from './audio'
import { reactInteractable } from './react-interactable'
import { SampleUrl, singleBufferSampler } from './sampler'
import { transport } from './transport'
import { useObservableState } from './use-observable-state'

export interface DrumMachineConfig {
  numCycles?: number
  tick$?: Observable<number>
}

const addStaticCss = (id: string, css: string) => {
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = 'drum-machine/cell-hover-style'
    style.appendChild(document.createTextNode(css))
    document.getElementsByTagName('head')[0].appendChild(style)
  }
}

addStaticCss(
  'drum-machine/cell-hover-style',
  `
    .drum-machine-cell:hover:not(.active) {
      background-color: rgba(255, 255, 2555, 0.2);
    }
  `,
)

const Cell: React.FC<{
  active: boolean
  setActive: (active: boolean) => void
}> = ({ active, setActive }) => {
  return (
    <div
      className={`drum-machine-cell ${active ? 'active' : null}`}
      onClick={() => setActive(!active)}
      style={{
        width: 18,
        height: 18,
        backgroundColor: active ? 'white' : undefined,
        border: '1px solid rgba(1, 1, 1, 0.5)',
        cursor: 'pointer',
      }}
    ></div>
  )
}

const CellRow: React.FC<{
  ticks: boolean[]
  setActive: (index: number, active: boolean) => void
}> = ({ ticks, setActive }) => {
  return (
    <div style={{ display: 'flex' }}>
      {ticks.map((tick, tickIndex) => {
        return (
          <Cell
            active={tick}
            setActive={active => setActive(tickIndex, active)}
          />
        )
      })}
    </div>
  )
}

function repeat<A>(value: A, times: number) {
  const result = []
  for (let i = 0; i < times; i++) {
    result.push(value)
  }
  return result
}

function setIndex<A>(xs: A[], index: number, value: A) {
  const result = [...xs]
  result[index] = value
  return result
}

function setInnerIndex<A>(
  xs: A[][],
  outerIndex: number,
  innerIndex: number,
  value: A,
) {
  return setIndex(xs, outerIndex, setIndex(xs[outerIndex], innerIndex, value))
}

const chance = (numerator: number, denominator: number): boolean => {
  return Math.random() < numerator / denominator
}

const makeRandomRows = (numRows: number, numCols: number): boolean[][] => {
  const initialRows: boolean[][] = []
  for (let i = 0; i < numRows; i++) {
    initialRows[i] = []
    for (let j = 0; j < numCols; j++) {
      initialRows[i][j] = chance(1, 2)
    }
  }
  return initialRows
}

const makeAllTrueRows = (numRows: number, numCols: number): boolean[][] => {
  return repeat(
    repeat(true, numCols).map(() => Math.random() > 0.5),
    numRows,
  )
}

export const drumMachine = (config?: DrumMachineConfig) => {
  const { numCycles = 16, tick$ = transport.sixteenth$ } = config ?? {}
  const sampleUrls = [
    SampleUrl.kick909,
    SampleUrl.chirpHhClosed,
    SampleUrl.chirpHhOpen,
  ].reverse()

  const initialRows = makeRandomRows(sampleUrls.length, numCycles)

  const rows$ = new BehaviorSubject<boolean[][]>(initialRows)

  const audios = sampleUrls.map((sampleUrl, sampleIndex) =>
    singleBufferSampler(
      sampleUrl,
      tick$.pipe(withLatestFrom(rows$)).pipe(
        filter(([tick, rows]) => {
          return rows[sampleIndex][tick % numCycles]
        }),
        debounceTime(1), // TODO maybe cleanup - without this debounce, the source emits twice after restarting runtime
      ),
    ),
  )

  const output = combineAudio(...audios)

  return reactInteractable(output, () => {
    const [rows, _] = useObservableState<never, boolean[][]>(
      () => rows$,
      rows$.value,
    )
    return (
      <div>
        {sampleUrls.map((sampleUrl, sampleIndex) => {
          return (
            <CellRow
              ticks={rows[sampleIndex]}
              setActive={(tickIndex, active) => {
                rows$.next(
                  setInnerIndex(rows$.value, sampleIndex, tickIndex, active),
                )
              }}
            />
          )
        })}
      </div>
    )
  }) as AudioNode
}
