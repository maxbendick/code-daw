import { isObservable, Observable, Subscription } from 'rxjs'
import { skip, take, throttleTime } from 'rxjs/operators'
import { isAudioNode } from './utils'

const SAFE_MODE_THROTTLE_TIME = 50
const RAMP_TIME_SECONDS = 0.005

// TODO handle subscription mem leak
export const easyConnect = (
  audioContext: AudioContext,
  input: AudioNode | Observable<number>, // must emit immediately!!
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
        console.log('setting target', currentValue)
        output.setTargetAtTime(
          currentValue,
          audioContext.currentTime + 0,
          RAMP_TIME_SECONDS,
        )
      })
  } else if (isAudioNode(input)) {
    input.connect(output)
    return new Subscription()
  } else {
    throw new Error('failed to connect node - not AudioNode or Observable')
  }
}
