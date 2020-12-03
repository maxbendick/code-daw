import { isObservable, Observable } from 'rxjs'
import { skip, take } from 'rxjs/operators'

// TODO handle subscription mem leak
export const easyConnect = (
  audioContext: AudioContext,
  input: AudioNode | Observable<number>, // must emit immediately!!
  output: AudioParam,
) => {
  if (isObservable(input)) {
    let initialValue = (null as any) as number
    input.pipe(take(1)).subscribe(val => {
      initialValue = val
    })

    if (typeof initialValue !== 'number') {
      throw new Error('easy connect missing initial value!')
    }

    // output.value = initialValue

    output.setValueAtTime(initialValue, audioContext.currentTime)

    input.pipe(skip(1)).subscribe(currentValue => {
      console.log('setting target', currentValue)
      output.setTargetAtTime(currentValue, audioContext.currentTime + 0.1, 0.3)
    })
  } else {
    input.connect(output)
  }
}
