// I don't recommend changing this file within the app

// Only press start while on the /index.tsx file

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { interactable } from './internal'

export const reactInteractable = (value, Component) => {
  const domNode = document.createElement('div')
  ReactDOM.render(<Component />, domNode)

  const parent = document.createElement('div')

  parent.setAttribute(
    'style',
    'width: 800px; height: 71px; padding-top: 2px; background-color: #333;', //border: 1px solid black',
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
