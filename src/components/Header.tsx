import React from 'react'
import { BehaviorSubject } from 'rxjs'
import styled from 'styled-components'
import { PlayButton } from './PlayButton'

const MASTER_VOLUME$ = new BehaviorSubject(0.5)

const headerBackgroundColor = '#282c34'

const Header = styled.header`
  background-color: ${headerBackgroundColor};
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(20px);
  color: white;
`

const VerticallyCenter = styled.div`
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const AppHeader: React.FC<{
  inRuntime: boolean
  inEditing: boolean
  resetCode: () => void
}> = ({ inRuntime, inEditing, resetCode }) => {
  return (
    <Header>
      <div style={{ display: 'flex' }}>
        <VerticallyCenter>
          <PlayButton
            disabled={!inRuntime && !inEditing}
            playing={inRuntime}
            toggle={() => {
              ;(window.onkeydown as any)({ key: 'Enter', shiftKey: true })
            }}
          />
        </VerticallyCenter>
      </div>
    </Header>
  )
}
