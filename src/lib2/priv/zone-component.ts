import * as React from 'react'
import { TokenPlace } from '../../editor/parsing/ts-parser'

export type ZoneComponentProps<Config> = {
  token: TokenPlace
  config: Config
  codeDawVar: any
  send: (a: any) => void
}

export type ZoneComponent<Config> = React.FC<ZoneComponentProps<Config>>

export type ZoneLoadingComponent = React.FC<{ token: TokenPlace }>
