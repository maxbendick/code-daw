import * as React from 'react'
import { Button } from './Button'

interface Props {
  playing: boolean
  disabled: boolean
  toggle: () => void
}

export const PlayButton: React.FC<Props> = ({ toggle, playing, disabled }) => {
  return (
    <Button disabled={disabled} onClick={() => toggle()}>
      {playing ? 'stop' : 'start'}
    </Button>
  )
}
