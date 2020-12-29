import * as React from 'react'
import { forwardRef, useEffect, useRef } from 'react'
import { useDrag } from 'react-use-gesture'
import { Observable } from 'rxjs'
import { map, sampleTime, scan } from 'rxjs/operators'
import { useObservableState } from './use-observable-state'

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
  const deltaY = (movement as any)?.event?.movementY ?? 0

  const currDown = movement.down
  const prevDown = state.prevMovement.down

  const inBounds = (value: number) =>
    Math.max(DIAL_MIN_VALUE, Math.min(DIAL_MAX_VALUE, value))

  const nextValue = inBounds(state.currValue + deltaY)

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
  sampleRate: number,
) => (
  event$: Observable<{
    down: boolean
    movement: [mx: number, my: number]
  }>,
): Observable<{
  value: number
  dragging: boolean
}> => {
  return event$.pipe(
    scan(dialReducer, initialDialState(initialValue)),
    sampleTime(sampleRate),
    map(state => {
      return {
        value: translateDialValue(state.currValue, start, end),
        dragging: state.prevMovement.down,
      }
    }),
  )
}

const DialBase: React.FC<{
  radius: number
  ref: any
}> = forwardRef(({ radius, children, ...restProps }, ref) => (
  <div
    ref={ref as any}
    onClick={() => console.log('dial click')}
    style={{
      height: radius * 2,
      width: radius * 2,
      borderRadius: radius * 2,
      backgroundColor: '#000',
      userSelect: 'none',
    }}
    {...restProps}
  >
    {children}
  </div>
))

const DialTickContainer: React.FC<{
  radius: number
  transitions: boolean
  hide: boolean
  degrees: number
}> = ({ children, radius, hide, degrees }) => {
  const diameter = radius * 2
  return (
    <div
      style={{
        height: diameter,
        width: diameter,
        position: 'absolute',
        transition: 'transform 0.1s, filter 0.4s',
        display: 'flex',
        justifyContent: 'center',
        filter: hide ? 'opacity(0)' : undefined,
        transform: `rotate(${degrees}deg)`,
      }}
    >
      {children}
    </div>
  )
}

const DialTickInner: React.FC<{
  thickness: string
  color: string
  length: string
}> = ({ length, thickness, color }) => {
  return (
    <div
      style={{ height: length, width: thickness, backgroundColor: color }}
    ></div>
  )
}

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
    transitions={moveable}
    hide={hide}
    radius={radius}
    degrees={degrees}
  >
    <DialTickInner color={color} length={length} thickness={thickness} />
  </DialTickContainer>
)

const normalize = (start: number, end: number, value: number) =>
  (value - start) / (end - start)

export const Dial: React.FC<{
  initial: number
  min: number
  max: number
  onChange: (a: number) => void
  radius: number
  sampleRate?: number // 100 by default
}> = ({ onChange, min, max, initial, radius, sampleRate }) => {
  const dialBaseElement = useRef(null)

  const [{ value, dragging }, registerMovement] = useObservableState(
    movementsToDialValue(min, max, initial, sampleRate || 100),
    {
      value: initial,
      dragging: false,
    },
  )

  useEffect(() => {
    const element = (dialBaseElement.current as any) as HTMLElement
    if (dragging) {
      element.requestPointerLock()
    } else {
      document.exitPointerLock()
    }
  }, [dragging])

  useEffect(() => {
    if (onChange) {
      onChange(value)
    }
  }, [onChange, value])

  const bind = useDrag(registerMovement)

  // 240 degrees of movement, centered at 0
  const span = 240
  const startDegrees = span / -2.0
  const endDegrees = span / 2.0
  const degrees = normalize(min, max, value) * span + startDegrees

  const showThreshold = 50
  const showMin = dragging && degrees - startDegrees < showThreshold
  const showMax = dragging && endDegrees - degrees < showThreshold

  return (
    <DialBase radius={radius} {...bind()} ref={dialBaseElement}>
      <DialTick
        color={'#779'}
        degrees={startDegrees}
        moveable={false}
        hide={!showMin}
        length={'20%'}
        radius={radius}
        thickness={'2px'}
      />
      <DialTick
        color={'#779'}
        degrees={endDegrees}
        moveable={false}
        hide={!showMax}
        length={'20%'}
        radius={radius}
        thickness={'2px'}
      />
      <DialTick
        color={'#13d'}
        degrees={degrees}
        moveable={true}
        hide={false}
        length={'50%'}
        radius={radius}
        thickness={'3px'}
      />
    </DialBase>
  )
}
