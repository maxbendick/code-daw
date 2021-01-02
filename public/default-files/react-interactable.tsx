import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { interactable } from './internal'

export const reactInteractable = (value, Component) => {
  const domNode = document.createElement('div')
  ReactDOM.render(<Component />, domNode)

  const parent = document.createElement('div')

  parent.setAttribute(
    'style',
    'width: 500px; height: 71px; padding-top: 2px;', //border: 1px solid black',
  )

  parent.appendChild(domNode)

  console.log('reactInteractable parent', parent)

  return interactable({
    value,
    domNode: parent,
    onDestroy: () => {
      ReactDOM.unmountComponentAtNode(domNode)
    },
  })
}

// const SAFE_MODE_THROTTLE_TIME = 50
// const RAMP_TIME_SECONDS = 0.005

// const isAudioNode = (o: any): o is AudioNode => {
//   return o instanceof AudioNode
// }

// export const easyConnect = (
//   audioContext: AudioContext,
//   input: number | AudioNode | Observable<number>, // must emit immediately!!
//   output: AudioParam,
// ): Subscription => {
//   if (isObservable(input)) {
//     let initialValue = (null as any) as number
//     input.pipe(take(1)).subscribe(val => {
//       initialValue = val
//     })

//     if (typeof initialValue !== 'number') {
//       console.error('initialValue is', initialValue)
//       throw new Error('easy connect missing initial number value!')
//     }

//     output.setValueAtTime(initialValue, audioContext.currentTime)

//     return input
//       .pipe(skip(1), throttleTime(SAFE_MODE_THROTTLE_TIME))
//       .subscribe(currentValue => {
//         console.log('setting target', currentValue)
//         output.setTargetAtTime(
//           currentValue,
//           audioContext.currentTime + 0,
//           RAMP_TIME_SECONDS,
//         )
//       })
//   } else if (isAudioNode(input)) {
//     input.connect(output)
//     return new Subscription()
//   } else if (typeof input === 'number') {
//     output.value = input
//   } else {
//     throw new Error('failed to connect node - not AudioNode or Observable')
//   }
// }
