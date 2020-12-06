import { Bus } from './bus'
import { Number_ } from './utility-types'

export type InteractableType = 'dial' | 'mixer'

interface _BaseInteractable<Sends, Receives, Config> {
  _bus: Bus<Sends, Receives>
  _type: InteractableType
  _index: number
  _dial?: true
  _config: Config
  _compiledLineNumber: number
}

type DialSends = number
type DialReceives = number

export type DialConfig = {
  start: Number_
  end: Number_
  defaultValue: number
}

export type _DialInteractable = _BaseInteractable<
  DialSends,
  DialReceives,
  DialConfig
> & { _dial: true }

export type _Interactable = _DialInteractable
