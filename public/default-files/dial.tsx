// I don't recommend changing this file within the app

// Only press start while on the /index.tsx file

import * as React from 'react'
import { forwardRef, useEffect, useRef } from 'react'
import { useDrag } from 'react-use-gesture'
import { BehaviorSubject, Observable } from 'rxjs'
import {
  map,
  sampleTime,
  scan
} from 'rxjs/operators'
import { reactInteractable } from './react-interactable'
import { useObservableState } from './use-observable-state'

interface Movement {
  down: boolean
  movement: [mx: number, my: number]
}
type DialState = {
  initial?: boolean
  label?: string
  preDownValue: number
  currValue: number
  prevMovement: Movement
}

const DIAL_MIN_VALUE = -75
const DIAL_MAX_VALUE = 75
const DIAL_RANGE = DIAL_MAX_VALUE - DIAL_MIN_VALUE

const toDialRange = (start: number, end: number, value: number) => {
  const inputRange = end - start
  
  const normalized = (value - start) / inputRange
  const unsafeOutput = -1 * (normalized * 150 - 75)

  return Math.max(-75, Math.min(75, unsafeOutput))
}

const initialDialState = (start: number, end: number, initialValue: number, label?: string): DialState => {
  return {
    initial: true,
    label,
    preDownValue: toDialRange(start, end, initialValue),
    currValue: toDialRange(start, end, initialValue),
    prevMovement: { down: false, movement: [0, 0] },
  }
}


const dialReducer = (state: DialState, movement: Movement): DialState => {
  const deltaY = (movement as any)?.event?.movementY ?? 0

  const currDown = movement.down
  const prevDown = state.prevMovement.down

  const inBounds = (value: number) =>
    Math.max(DIAL_MIN_VALUE, Math.min(DIAL_MAX_VALUE, value))

  const nextValue = inBounds(state.currValue + deltaY)

  let result: DialState

  if (prevDown && !currDown) {
    // mouse up
    result = {
      ...state,
      initial: false,
      currValue: nextValue,
      preDownValue: nextValue,
      prevMovement: movement,
    }
  } else if (!prevDown && currDown) {
    // mouse down
    result = {
      ...state,
      initial: false,
      prevMovement: movement,
      currValue: nextValue,
    }
  } else if (currDown) {
    // just a move
    result = {
      ...state,
      initial: false,
      prevMovement: movement,
      currValue: nextValue,
    }
  } else {
    result = state
  }

  return result
}

const translateDialValue = (
  dialValue: number,
  start: number,
  end: number,
): number => {
  const userRange = end - start
  const dialRange = DIAL_MAX_VALUE - DIAL_MIN_VALUE

  const normalized = (-1.0 * dialValue - DIAL_MIN_VALUE) / dialRange

  const result = normalized * userRange + start

  return result
}

const movementsToDialValue = (
  start: number,
  end: number,
  initialValue: number,
  sampleRate: number,
  label: string | undefined,
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
    scan(dialReducer, initialDialState(start, end, initialValue, label)),
    // startWith(initialDialState(initialValue, label)),
    sampleTime(sampleRate),
    map(state => {
      const result = {
        value: translateDialValue(state.currValue, start, end),
        dragging: state.prevMovement.down,
      }
      return result
    }),
  )
}

const DialBase: React.FC<{
  radius: number
  ref: any
}> = forwardRef(({ radius, children, ...restProps }, ref) => (
  <div
    ref={ref as any}
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

const DialLabel: React.FC = ({ children }) => {
  const style: React.CSSProperties = {
    fontSize: 14,
    marginBottom: 2,
    padding: 1,
  }
  return <div style={style}>{children}</div>
}
const DialContainer: React.FC<{ radius?: number }> = ({ children, radius }) => {
  const style: React.CSSProperties = {
    width: 'fit-content',
    minWidth: 60,
    textAlign: 'center',
    padding: 2,
  }
  return (
    <div className="diall" style={style}>
      {children}
    </div>
  )
}

const HorizontalCenter: React.FC = ({ children }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>{children}</div>
  )
}

export const Dial: React.FC<{
  initial: number
  min: number
  max: number
  onChange: (a: number) => void
  radius: number
  sampleRate?: number // 100 by default
  label?: string
}> = ({ onChange, min, max, initial, radius, sampleRate, label }) => {
  const dialBaseElement = useRef(null)

  const [{ value, dragging }, registerMovement] = useObservableState(
    movementsToDialValue(min, max, initial, sampleRate || 100, label),
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
    <DialContainer>
      <DialLabel>{label}</DialLabel>
      <HorizontalCenter>
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
      </HorizontalCenter>
    </DialContainer>
  )
}

interface DialConfig {
  min: number
  max: number
  initial?: number
  label?: string
}

export const dial = ({
  min,
  max,
  initial = (min + max) / 2,
  label,
}: DialConfig): BehaviorSubject<number> => {
  const dialValue$ = new BehaviorSubject<number>(initial)

  const result = reactInteractable(dialValue$, () => (
    <div>
      <Dial
        min={min}
        max={max}
        initial={initial}
        onChange={value => {
          dialValue$.next(value)
        }}
        radius={20}
        label={label}
      />
    </div>
  ))

  return result
}

export const DialBankComponent: React.FC<{
  dialConfigs: DialConfig[]
  onChangeAtIndex: (value: number, index: number) => void
}> = ({ dialConfigs, onChangeAtIndex }) => {
  return (
    <div style={{ display: 'flex' }}>
      {dialConfigs.map(({ min, max, initial, label }, i) => (
        <Dial
          min={min}
          max={max}
          initial={initial}
          onChange={value => {
            onChangeAtIndex(value, i)
          }}
          radius={20}
          label={label}
        />
      ))}
    </div>
  )
}

export const dialBank = (
  dialConfigs: DialConfig[],
): BehaviorSubject<number>[] => {
  const dialValues = dialConfigs.map(
    ({ min, max, initial }) =>
      new BehaviorSubject<number>(initial ?? (min + max) / 2),
  )
  return reactInteractable(dialValues, () => (
    <DialBankComponent
      dialConfigs={dialConfigs}
      onChangeAtIndex={(value, i) => dialValues[i].next(value)}
    />
  ))
}
