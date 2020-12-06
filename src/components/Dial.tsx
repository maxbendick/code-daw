import { useObservableState } from 'observable-hooks'
import * as React from 'react'
import { useEffect } from 'react'
import { useDrag } from 'react-use-gesture'
import { Observable } from 'rxjs'
import { map, sampleTime, scan } from 'rxjs/operators'
import styled from 'styled-components'

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

const DIAL_MIN_VALUE = -75
const DIAL_MAX_VALUE = 75

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
    map(state => {
      return {
        value: translateDialValue(state.currValue, start, end),
        dragging: state.prevMovement.down,
      }
    }),
  )
}

const DialBase = styled.div<{ radius: number }>`
  height: ${props => props.radius * 2}px;
  width: ${props => props.radius * 2}px;
  border-radius: ${props => props.radius * 2}px;
  background-color: #000;
  user-select: none;
`

const DialTickContainer = styled.div<{
  transitions: boolean
  hide: boolean
  radius: number
}>`
  height: ${props => props.radius * 2}px;
  width: ${props => props.radius * 2}px;
  position: absolute;
  transition: transform 0.1s, filter 0.4s;
  display: flex;
  justify-content: center;
  filter: opacity(${props => (props.hide ? '0' : '1')});
`
const DialTickInner = styled.div<{
  thickness: string
  color: string
  length: string
}>`
  height: ${props => props.length};
  width: ${props => props.thickness};
  background-color: ${props => props.color};
`

interface TickProps {
  color: any
  degrees: number
  moveable: boolean
  hide: boolean
  length: any
  radius: number
  thickness: string
}
const DialTick: React.FC<TickProps> = ({
  color,
  degrees,
  moveable,
  hide,
  length,
  radius,
  thickness,
}) => (
  <DialTickContainer
    style={{ transform: `rotate(${degrees}deg)` }}
    transitions={moveable}
    hide={hide}
    radius={radius}
  >
    <DialTickInner color={color} length={length} thickness={thickness} />
  </DialTickContainer>
)

const normalize = (start: number, end: number, value: number) =>
  (value - start) / (end - start)

export const Dial: React.FC<{
  initialValue: number
  start: number
  end: number
  send: (a: number) => void
  radius: number
}> = ({ send, start, end, initialValue, radius }) => {
  const [{ value, dragging }, registerMovement] = useObservableState(
    movementsToDialValue(start, end, initialValue),
    {
      value: initialValue,
      dragging: false,
    },
  )

  useEffect(() => {
    try {
      send(value)
    } catch (e) {
      console.warn('sent with an error - send may be undefined')
    }
  }, [send, value])

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
    <DialBase radius={radius} {...bind()}>
      <DialTick
        color={'#777'}
        degrees={startDegrees}
        moveable={false}
        hide={!showMin}
        length={'20%'}
        radius={radius}
        thickness={'1px'}
      />
      <DialTick
        color={'#777'}
        degrees={endDegrees}
        moveable={false}
        hide={!showMax}
        length={'20%'}
        radius={radius}
        thickness={'1px'}
      />
      <DialTick
        color={'#13d'}
        degrees={degrees}
        moveable={true}
        hide={false}
        length={'50%'}
        radius={radius}
        thickness={'2px'}
      />
    </DialBase>
  )
}
