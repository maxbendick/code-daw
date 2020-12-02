import * as React from 'react'
import { TokenPlace } from '../../editor/parsing/ts-parser'
// import { _Interactable } from '../../lib/interactable'

// export type ZoneComponentProps<
//   Inter // extends _Interactable
// > = {
//   token: TokenPlace
//   // interactable: Inter
// }

export type ZoneComponentProps = {
  token: TokenPlace
  codeDawVar: any
  send: (a: any) => void
}

export type ZoneComponent = React.FC<ZoneComponentProps>

export type ZoneLoadingComponent = React.FC<{ token: TokenPlace }>
