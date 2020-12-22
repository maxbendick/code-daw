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
  const [lifecycleState, lifecycleSend, lifecycleService] = useMachine(
    configgedMachine,
    {
      devTools: true,
    },
  )

  useEffect(() => {
    lifecycleSend('REACT_MOUNTED')
  }, [lifecycleSend])

  useEffect(() => {
    console.log('--lifecycle state:', lifecycleState.value, lifecycleState)
  }, [lifecycleState])

  const inRuntime =
    lifecycleState.matches('runtime') || lifecycleState.matches('lightRuntime')
  const inEditing = lifecycleState.matches('editing')

  const vfsActor = lifecycleState.context.vfsActor

  const ready =
    !lifecycleState.matches('preMount') &&
    !lifecycleState.matches('preEditorSetup') &&
    vfsActor

  if (!ready) {
    return <div />
  }

  return (
    <AppContainer>
      <HeaderContainer>
        <AppHeader
          inEditing={inEditing}
          inRuntime={inRuntime}
          resetCode={() => lifecycleSend('RESET_CODE')}
        />
      </HeaderContainer>
      <FileBrowserContainer>
        <FileBrowser vfsActor={vfsActor!} />
      </FileBrowserContainer>
      <EditorContainer>
        {ready ? <Editor lifecycleService={lifecycleService} /> : 'loading...'}
      </EditorContainer>
    </AppContainer>
  )
}

export default App
