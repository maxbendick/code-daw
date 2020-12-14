import { useMachine } from '@xstate/react'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { machine } from '../../lifecycle/machine'
import { lifecycleServices } from '../../lifecycle/services'
import { Editor } from '../Editor'
import { FileBrowser } from '../FileBrowser'
import { AppHeader } from '../Header'
import './App.css'

const configgedMachine = machine.withConfig({
  services: lifecycleServices,
})

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'header header'
    'filebrowser editor';
`
const HeaderContainer = styled.div`
  grid-area: header;
  width: 100%;
  height: 100%;
`
const FileBrowserContainer = styled.div`
  grid-area: filebrowser;
  width: 100%;
  height: 100%;
`
const EditorContainer = styled.div`
  grid-area: editor;
  width: 100%;
  height: 100%;
  padding-top: 5px;
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

  const inRuntime = state.matches('runtime') || state.matches('lightRuntime')
  const inEditing = state.matches('editing')

  const showEditor =
    !state.matches('preMount') && !state.matches('preEditorSetup')

  return (
    <AppContainer>
      <HeaderContainer>
        <AppHeader
          inEditing={inEditing}
          inRuntime={inRuntime}
          resetCode={() => send('RESET_CODE')}
        />
      </HeaderContainer>
      <FileBrowserContainer>
        <FileBrowser />
      </FileBrowserContainer>
      <EditorContainer>
        {showEditor ? <Editor lifecycleService={service} /> : 'loading...'}
      </EditorContainer>
    </AppContainer>
  )
}

export default App
