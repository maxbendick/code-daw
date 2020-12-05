import { useMachine } from '@xstate/react'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { machine } from '../../lifecycle/machine'
import { lifecycleServices } from '../../lifecycle/services'
import { Button } from '../Button'
import { Editor } from '../Editor'
import { Dial2 } from '../Editor/DialZone'
import { PlayButton } from '../PlayButton'
import './App.css'
import logo from './logo.svg'

const configgedMachine = machine.withConfig({
  services: lifecycleServices,
})

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

const Logo = styled.img`
  height: 50px;
  pointer-events: none;
`

function App() {
  const [state, send, service] = useMachine(configgedMachine, {
    devTools: true,
  })

  useEffect(() => {
    send('REACT_MOUNTED')
  }, [send])

  useEffect(() => {
    console.log('--state:', state.value, state)
  }, [state])

  const inRuntime = state.matches('runtime')
  const inEditing = state.matches('editing')

  const showEditor =
    !state.matches('preMount') && !state.matches('preEditorSetup')

  return (
    <div>
      <Header>
        <div style={{ display: 'flex' }}>
          <VerticallyCenter>
            <Logo
              src={logo}
              className={inRuntime ? 'App-spinning' : ''}
              alt="logo"
            />
          </VerticallyCenter>
          <VerticallyCenter>
            <PlayButton
              disabled={!inRuntime && !inEditing}
              playing={inRuntime}
              toggle={() => {
                ;(window.onkeydown as any)({ key: 'Enter', shiftKey: true })
              }}
            />
          </VerticallyCenter>
          <VerticallyCenter style={{ marginLeft: 5 }}>
            <Button onClick={() => send('RESET_CODE')} disabled={!inEditing}>
              reset
            </Button>
          </VerticallyCenter>
          <VerticallyCenter style={{ marginLeft: 5 }}>
            <Dial2
              label={'my label'}
              send={s => console.log('send', s)}
              start={200}
              end={300}
              initialValue={230}
            />
          </VerticallyCenter>
        </div>
      </Header>

      {showEditor ? <Editor lifecycleService={service} /> : 'loading...'}
    </div>
  )
}

export default App
