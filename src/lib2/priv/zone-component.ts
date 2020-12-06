import * as React from 'react'
import { TokenPlace } from '../../editor/parsing/ts-parser'

export type ZoneComponentProps<Config, Send> = {
  token: TokenPlace
  config: Config
  codeDawVar: any
  send: (a: Send) => void
}

export type ZoneComponent<Config, Send> = React.FC<
  ZoneComponentProps<Config, Send>
>

export type ZoneLoadingComponent = React.FC<{ token: TokenPlace }>
