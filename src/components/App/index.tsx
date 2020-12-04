import { useMachine } from '@xstate/react'
import React, { useEffect } from 'react'
import { machine } from '../../lifecycle/machine'
import { lifecycleServices } from '../../lifecycle/services'
import { Editor } from '../Editor'
import './App.css'
import logo from './logo.svg'

const configgedMachine = machine.withConfig({
  services: lifecycleServices,
})

function App() {
  const [state, send, service] = useMachine(configgedMachine, {
    devTools: true,
  })

  useEffect(() => {
    send('REACT_MOUNTED')
  }, [send])

  useEffect(() => {
    console.log('--state:', state.value)
  }, [state])

  const spinning = state.matches('runtime')

  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className={`App-logo ${spinning ? 'App-spinning' : ''}`}
          alt="logo"
        />
        {/* <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>

      <Editor lifecycleService={service} />
    </div>
  )
}

export default App
