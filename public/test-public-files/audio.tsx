import { isObservable, Observable, Subscription } from 'rxjs'
import { skip, take, throttleTime } from 'rxjs/operators'
import { getAudioContext } from './internal'

type ParamLike = number | Observable<number> | AudioNode

const SAFE_MODE_THROTTLE_TIME = 50
const RAMP_TIME_SECONDS = 0.005

const isAudioNode = (o: any): o is AudioNode => {
  return o instanceof AudioNode
}

export const easyConnect = (
  audioContext: AudioContext,
  input: number | AudioNode | Observable<number>, // must emit immediately!!
  output: AudioParam,
): Subscription => {
  if (isObservable(input)) {
    let initialValue = (null as any) as number
    input.pipe(take(1)).subscribe(val => {
      initialValue = val
    })

    if (typeof initialValue !== 'number') {
      console.error('initialValue is', initialValue)
      throw new Error('easy connect missing initial number value!')
    }

    output.setValueAtTime(initialValue, audioContext.currentTime)

    return input
      .pipe(skip(1), throttleTime(SAFE_MODE_THROTTLE_TIME))
      .subscribe(currentValue => {
        output.setTargetAtTime(
          currentValue,
          audioContext.currentTime + 0,
          RAMP_TIME_SECONDS,
        )
      })
  } else if (isAudioNode(input)) {
    input.connect(output)
    return new Subscription()
  } else if (typeof input === 'number') {
    output.value = input
  } else {
    throw new Error('failed to connect node - not AudioNode or Observable')
  }
}

export const gain = ({
  gainValue,
  source,
}: {
  gainValue: ParamLike
  source: AudioNode
}): AudioNode => {
  const audioContext = getAudioContext()
  const result = audioContext.createGain()
  easyConnect(audioContext, gainValue, result.gain)
  source.connect(result)
  return result
}

export const oscillator = ({
  type,
  frequency,
  detune,
}: {
  type: OscillatorType
  frequency: ParamLike
  detune?: ParamLike
}): OscillatorNode => {
  const audioContext = getAudioContext()
  const result: OscillatorNode = audioContext.createOscillator()
  result.type = type
  easyConnect(audioContext, frequency, result.frequency)
  if (detune) {
    easyConnect(audioContext, detune, result.detune)
  }
  result.start()
  return result
}

// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()// const audioContext = (window as any).codeDaw.audioContext as AudioContext

// const osc = audioContext.createOscillator()
// osc.start()
