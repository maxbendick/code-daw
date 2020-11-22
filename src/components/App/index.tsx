import Editor from '@monaco-editor/react'
import React from 'react'
import './App.css'
import logo from './logo.svg'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <Editor
        height="calc(100vh - 330px)"
        language="typescript"
        theme="dark"
        options={{ fontSize: 18 }}
      />
    </div>
  )
}

export default App
