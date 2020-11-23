import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as React from 'react'
import * as Config from '../../config'
import { CoolZone } from '../../lib/editor/cool-zone'
import { setAllInstances } from '../../lib/editor/instances'
import { EditorT, MonacoT } from '../../lib/editor/types'
import './Editor.css'

const setupEditor = async (editor: EditorT) => {
  const monaco: MonacoT = await monacoReact.init()

  setAllInstances({ editor, monaco })

  console.log(editor)
  const coolZone = new CoolZone(3, 3, <div>hello</div>)
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
