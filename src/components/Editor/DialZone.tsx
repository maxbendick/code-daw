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

export const defaultDialZoneValue = (codeDawVar: any) => {
  console.log('defaultDialZoneValue', codeDawVar)
  return codeDawVar.config.defaultValue
}

const DialZoneContainer = styled.div`
  height: 100%;
  width: 400px;
  background-color: #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
`
const DialZoneContent = styled.div`
  height: 50px;
  display: flex;
`
const VerticalAlign = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const DialZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  const label = `${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`
  return (
    <DialZoneContainer>
      <DialZoneContent>
        <VerticalAlign>
          <Dial
            send={send}
            initialValue={config.defaultValue}
            start={config.start}
            end={config.end}
            radius={25}
          ></Dial>
        </VerticalAlign>
        <VerticalAlign>
          <div style={{ marginLeft: 10 }}>{label}</div>
        </VerticalAlign>
      </DialZoneContent>
    </DialZoneContainer>
  )
}

export const DialZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
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
  degrees: number
  hide: boolean
  radius: number
}>`
  height: ${props => props.radius * 2}px;
  width: ${props => props.radius * 2}px;
  position: absolute;
  ${({ transitions, degrees }) =>
    transitions ? `transform: rotate(${degrees}deg);` : ''}
  transform: rotate(${props => props.degrees}deg);
  transition: transform 0.1s, filter 0.4s;
  display: flex;
  justify-content: center;

  filter: opacity(${props => (props.hide ? '0' : '1')});
`
const DialTickInner = styled.div<{ color: any; length: any }>`
  height: ${props => props.length};
  width: 2px;
  background-color: ${props => props.color};
`

interface TickProps {
  color: any
  degrees: number
  moveable: boolean
  hide: boolean
  length: any
  radius: number
}
const DialTick: React.FC<TickProps> = ({
  color,
  degrees,
  moveable,
  hide,
  length,
  radius,
}) => (
  <DialTickContainer
    degrees={degrees}
    transitions={moveable}
    hide={hide}
    radius={radius}
  >
    <DialTickInner color={color} length={length} />
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
    <DialBase radius={radius} {...bind()}>
      <DialTick
        color={'#666'}
        degrees={startDegrees}
        moveable={false}
        hide={!showMin}
        length={'20%'}
        radius={radius}
      />
      <DialTick
        color={'#666'}
        degrees={endDegrees}
        moveable={false}
        hide={!showMax}
        length={'20%'}
        radius={radius}
      />
      <DialTick
        color={'#13d' || '#11d'}
        degrees={degrees}
        moveable={true}
        hide={false}
        length={'50%'}
        radius={radius}
      />
    </DialBase>
  )
}
