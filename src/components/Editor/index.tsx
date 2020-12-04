import MonacoEditor from '@monaco-editor/react'
import { useService } from '@xstate/react'
import { Interpreter } from 'xstate'
import * as Config from '../../config'
import { EditorT } from '../../editor/types'
import { LifecycleContext, LifecycleEvent } from '../../lifecycle/types'
import { code4 } from './code'
import './Editor.css'

interface Props {
  lifecycleService: Interpreter<
    LifecycleContext,
    any,
    LifecycleEvent,
    {
      value: any
      context: LifecycleContext
    }
  >
}

export const Editor: React.FC<Props> = ({ lifecycleService }) => {
  const [state, send] = useService(lifecycleService)

  const editorPreSetupFinished =
    !state.matches('preMount') && !state.matches('preEditorSetup')

  if (!editorPreSetupFinished) {
    return <div>loading...</div>
  }

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    send({
      type: 'EDITOR_CREATED',
      editor: editor,
    } as any)
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
