import MonacoEditor from '@monaco-editor/react'
import { useMachine } from '@xstate/react'
import { useEffect } from 'react'
import * as Config from '../../config'
import { EditorT } from '../../editor/types'
import { machine } from '../../lifecycle/machine'
import { lifecycleServices } from '../../lifecycle/services'
import { code4 } from './code'
import './Editor.css'

const configgedMachine = machine.withConfig({
  services: lifecycleServices,
})

export const Editor: React.FC = () => {
  const [state, send] = useMachine(configgedMachine, { devTools: true })

  const editorPreSetupFinished =
    !state.matches('preMount') && !state.matches('preEditorSetup')

  useEffect(() => {
    send('REACT_MOUNTED')
  }, [send])

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    send({
      type: 'EDITOR_CREATED',
      editor,
    })
  }

  if (!editorPreSetupFinished) {
    return <div>loading...</div>
  }

  const extraOptions: { [k: string]: boolean } = {
    'semanticHighlighting.enabled': true,
  }

  return (
    <MonacoEditor
      height="calc(100vh - 100px)"
      language="typescript"
      theme="dark"
      options={{
        fontSize: Config.fontSize,
        lineHeight: Config.lineHeight,
        ...extraOptions,
      }}
      value={code4}
      editorDidMount={handleEditorDidMount}
    />
  )
}
