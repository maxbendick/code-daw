import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { getAudioContext, interactable } from './internal'

for (let i = 0; i < 10; i++) {
  // do something
}

export const nodeHandler = domNode =>
  ReactDOM.render(<div>hello dddreact</div>, domNode)

const myDomNode = document.createElement('div')
nodeHandler(myDomNode)

export const another = interactable({
  value: ['asdkjfjskdfmnvn'],
  domNode: myDomNode,
  onDestroy: () => {
    ReactDOM.unmountComponentAtNode(myDomNode)
  },
})

const c = getAudioContext() as AudioContext
const masterOut = c.createOscillator()
masterOut.start()

export default masterOut

console.log('audiocontext', getAudioContext())

const reactInteractable = (value, Component) => {
  const domNode = document.createElement('div')
  ReactDOM.render(<Component />, domNode)

  const parent = document.createElement('div')

  parent.setAttribute('style', 'width: 500px; height: 71px; background: black')

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

// solution:
//  value must return synchronously
//  can have promise for node?
//  can create empty node at start, then fill it!!

export const aReactInteractable = reactInteractable({ some: 'value' }, () => (
  <div>hello asdfasdfinteractable</div>
))

console.log('value of aReactInteractable', aReactInteractable)
