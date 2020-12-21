import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Dial } from './dial'
import { getAudioContext, interactable } from './internal'

for (let i = 0; i < 10; i++) {
  // do something
}

console.log('the dial component fn', Dial)

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

export default getAudioContext().createOscillator()

console.log('audiocontext', getAudioContext())

const reactInteractable = (value, Component) => {
  const domNode = document.createElement('div')
  ReactDOM.render(<Component />, domNode)

  const parent = document.createElement('div')

  parent.setAttribute(
    'style',
    'width: 500px; height: 71px; border: 1px solid black',
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

// solution:
//  value must return synchronously
//  can have promise for node?
//  can create empty node at start, then fill it!!

export const aReactInteractable = reactInteractable({ some: 'value' }, () => (
  <div>
    hello asdfasdfinteractable
    <br />
    <Dial start={0} end={100} initialValue={50} send={() => {}} radius={20} />
  </div>
))

console.log('value of aReactInteractable', aReactInteractable)
