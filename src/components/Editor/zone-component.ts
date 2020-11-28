import * as React from 'react'
import { TokenPlace } from '../../editor/parsing/ts-parser'
import { _Interactable } from '../../lib/interactable'

export type ZoneComponentProps<Inter extends _Interactable = _Interactable> = {
  token: TokenPlace
  interactable: Inter
}

export type ZoneComponent<
  Inter extends _Interactable = _Interactable
> = React.FC<ZoneComponentProps<Inter>>

export type ZoneLoadingComponent = React.FC<{ token: TokenPlace }>
