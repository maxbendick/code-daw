import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as React from 'react'
import * as Config from '../../config'
import { CoolZone } from './cool-zone'
import './Editor.css'
import { EditorT, Monaco } from './types'

const setupEditor = async (editor: EditorT) => {
  const monaco: Monaco = await monacoReact.init()
  console.log(editor)
  const coolZone = new CoolZone(monaco, editor, 3, 3)
  ;(window as any).coolZone = coolZone
}

var jsCode = [
  'function Person(age) {',
  '  if (age) {',
  '    this.age = age;',
  '  }',
  '}',
  'Person.prototype.getAge = function () {',
  '  return this.age;',
  '};\n',
].join('\n')

export const Editor: React.FC = () => {
  const handleEditorDidMount = (_: any, editor: EditorT) => {
    setupEditor(editor) // s => console.log(s))
  }

  return (
    <MonacoEditor
      height="calc(100vh - 330px)"
      language="typescript"
      theme="dark"
      options={{ fontSize: Config.fontSize, lineHeight: Config.lineHeight }}
      value={jsCode}
      editorDidMount={handleEditorDidMount}
    />
  )
}
