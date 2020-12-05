import { useObservableState } from 'observable-hooks'
import * as React from 'react'
import { useEffect } from 'react'
import { useDrag } from 'react-use-gesture'
import { Observable } from 'rxjs'
import { map, sampleTime, scan } from 'rxjs/operators'
import styled from 'styled-components'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

interface Movement {
  down: boolean
  movement: [mx: number, my: number]
}
type DialState = {
  preDownValue: number
  currValue: number
  prevMovement: Movement
}

const initialDialState = (initialValue: number): DialState => ({
  preDownValue: initialValue, // TODO inject default
  currValue: initialValue, // TODO inject default
  prevMovement: { down: false, movement: [0, 0] },
})

const DIAL_MIN_VALUE = -200
const DIAL_MAX_VALUE = 200

const dialReducer = (state: DialState, movement: Movement): DialState => {
  const {
    movement: [, my],
  } = movement

  const currDown = movement.down
  const prevDown = state.prevMovement.down

  const inBounds = (value: number) =>
    Math.max(DIAL_MIN_VALUE, Math.min(DIAL_MAX_VALUE, value))

  const nextValue = inBounds(state.preDownValue + my)

  if (prevDown && !currDown) {
    // mouse up
    return {
      ...state,
      currValue: nextValue,
      preDownValue: nextValue,
      prevMovement: movement,
    }
  }
  if (!prevDown && currDown) {
    // mouse down
    return {
      ...state,
      prevMovement: movement,
      currValue: nextValue,
    }
  }
  if (currDown) {
    // just a move
    return {
      ...state,
      prevMovement: movement,
      currValue: nextValue,
    }
  }

  return state
}

const translateDialValue = (value: number, start: number, end: number) => {
  const normalized =
    (1.0 * (-1.0 * value - DIAL_MIN_VALUE)) / (DIAL_MAX_VALUE - DIAL_MIN_VALUE)

  return normalized * (end - start) + start
}

const movementsToDialValue = (
  start: number,
  end: number,
  initialValue: number,
) => (
  event$: Observable<{ down: boolean; movement: [mx: number, my: number] }>,
): Observable<{ value: number; dragging: boolean }> => {
  return event$.pipe(
    scan(dialReducer, initialDialState(initialValue)),
    sampleTime(100),
    // tap(v => {
    //   console.log('curr dial reducer state in the tappp', v)
    // }),
    map(state => {
      return {
        value: translateDialValue(state.currValue, start, end),
        dragging: state.prevMovement.down,
      }
    }),
  )
}

const DialZone: React.FC<{
  initialValue: number
  start: number
  end: number
  label: string
  send: (a: number) => void
}> = ({ label, send, start, end, initialValue }) => {
  const [{ value, dragging }, registerMovement] = useObservableState(
    movementsToDialValue(start, end, initialValue),
    {
      value: initialValue,
      dragging: false,
    },
  )

  useEffect(() => {
    console.log('use effect value', value)
    // get ready to send it here
    try {
      send(value)
    } catch (e) {
      console.warn('sent with an error - send may be undefined')
    }
  }, [value])

  const bind = useDrag(registerMovement)

  return (
    <div
      {...bind()}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'rgba(0,0,255, 0.3)',
        fontSize: '10px',
        paddingLeft: '10px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <b>
          {label} {value}
        </b>
      </div>
    </div>
  )
}

export const defaultDialZoneValue = (codeDawVar: any) => {
  console.log('defaultDialZoneValue', codeDawVar)
  return codeDawVar.config.defaultValue
}

export const DialZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  return (
    <DialZone
      label={`${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`}
      send={send}
      initialValue={config.defaultValue}
      start={config.start}
      end={config.end}
    ></DialZone>
  )
}

export const DialZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}

const dialRadius = 25
const dialDiameter = dialRadius * 2

const DialBase = styled.div`
  height: ${dialDiameter}px;
  width: ${dialDiameter}px;
  border-radius: ${dialDiameter}px;
  background-color: #111;
  user-select: none;
`

const DialTickContainer = styled.div<{
  transitions: boolean
  degrees: number
  hide: boolean
}>`
  height: ${dialDiameter}px;
  width: ${dialDiameter}px;
  position: absolute;
  ${({ transitions, degrees }) =>
    transitions ? `transform: rotate(${degrees}deg);` : ''}
  transform: rotate(${props => props.degrees}deg);
  transition: transform 0.1s, filter 0.3s;
  display: flex;
  justify-content: center;

  filter: opacity(${props => (props.hide ? '0' : '1')});
`
const DialTickInner = styled.div<{ color: any; length: any }>`
  height: ${props => props.length};
  width: 1px;
  background-color: ${props => props.color};
`

interface TickProps {
  color: any
  degrees: number
  moveable: boolean
  hide: boolean
  length: any
}
const DialTick: React.FC<TickProps> = ({
  color,
  degrees,
  moveable,
  hide,
  length,
}) => (
  <DialTickContainer degrees={degrees} transitions={moveable} hide={hide}>
    <DialTickInner color={color} length={length} />
  </DialTickContainer>
)

const normalize = (start: number, end: number, value: number) =>
  (value - start) / (end - start)

export const Dial2: React.FC<{
  initialValue: number
  start: number
  end: number
  label: string
  send: (a: number) => void
}> = ({ label, send, start, end, initialValue }) => {
  const [{ value, dragging }, registerMovement] = useObservableState(
    movementsToDialValue(start, end, initialValue),
    {
      value: initialValue,
      dragging: false,
    },
  )

  useEffect(() => {
    console.log('use effect value', value)
    // get ready to send it here
    try {
      send(value)
    } catch (e) {
      console.warn('sent with an error - send may be undefined')
    }
  }, [value])

  const bind = useDrag(registerMovement)

  // 240 degrees of movement, centered at 0
  const span = 240
  const startDegrees = span / -2.0
  const endDegrees = span / 2.0
  const degrees = normalize(start, end, value) * span + startDegrees

  const showThreshold = 50
  const showMin = dragging && degrees - startDegrees < showThreshold
  const showMax = dragging && endDegrees - degrees < showThreshold

  return (
    <DialBase {...bind()}>
      <DialTick
        color={'#666'}
        degrees={startDegrees}
        moveable={false}
        hide={!showMin}
        length={'20%'}
      />
      <DialTick
        color={'#666'}
        degrees={endDegrees}
        moveable={false}
        hide={!showMax}
        length={'20%'}
      />
      <DialTick
        color={'#11d'}
        degrees={degrees}
        moveable={true}
        hide={false}
        length={'50%'}
      />
    </DialBase>
  )
}
