import * as React from 'react'
import { Dial } from './dial'
import { reactInteractable } from './react-interactable'

export const aReactInteractable = reactInteractable({ some: 'value' }, () => (
  <div>
    hello asdfasdfinteractable
    <br />
    <Dial min={0} max={100} initial={50} onChange={() => {}} radius={20} />
  </div>
))
