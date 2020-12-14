import MonacoEditor from '@monaco-editor/react'
import { useService } from '@xstate/react'
import { useEffect } from 'react'
import { Interpreter } from 'xstate'
import * as Config from '../../config'
import { EditorT } from '../../editor/types'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleStateSchema,
} from '../../lifecycle/types'
import { code5 } from './code'
import './Editor.css'

interface Props {
  lifecycleService: Interpreter<
    LifecycleContext,
    LifecycleStateSchema,
    LifecycleEvent,
    {
      value: any
      context: LifecycleContext
    }
  >
}

const defaultCode = code5 // .substring(1) need some padding

const codeLocalStorageKey = 'code-daw/code'

const initialCode = localStorage.getItem(codeLocalStorageKey) ?? defaultCode

export const Editor: React.FC<Props> = ({ lifecycleService }) => {
  const [state, send] = useService(lifecycleService)

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    send({
      type: 'EDITOR_CREATED',
      editor: editor,
    })
  }

  useEffect(() => {
    const editor = state.context.editor
    if (!editor) {
      return
    }
    if (state.event.type === 'RESET_CODE') {
      editor.setValue(defaultCode)
    }
    if (
      (state.matches('runtime') || state.matches('lightRuntime')) &&
      state.changed
    ) {
      localStorage.setItem(codeLocalStorageKey, editor.getValue())
    }
  }, [state])

  return (
    <MonacoEditor
      height="calc(100vh - 150px)"
      language="typescript"
      theme="dark"
      options={{
        fontSize: Config.fontSize,
        lineHeight: Config.lineHeight,
        ['semanticHighlighting.enabled' as any]: true,
      }}
      value={initialCode}
      editorDidMount={handleEditorDidMount}
    />
  )
}
