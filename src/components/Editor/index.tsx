import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as monacoPackage from 'monaco-editor'
import * as React from 'react'
import ReactDOM from 'react-dom'
import * as Config from '../../config'
import './Editor.css'
import { MyZoneContent as PlaceholderZoneContent } from './PlaceholderZoneContent'
import { ZoneBackground } from './ZoneBackground'
import { ZoneContentContainer } from './ZoneContentContainer'

type EditorT = monacoPackage.editor.IEditorOverrideServices

const setupEditor = async (editor: EditorT) => {
  const monaco = await monacoReact.init()

  console.log(editor)

  var decorations = editor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(3, 1, 3, 1),
        options: {
          isWholeLine: true,
          className: 'myContentClass',
          glyphMarginClassName: 'myGlyphMarginClass',
        },
      },
    ],
  )

  // Add a zone to make hit testing more interesting
  var viewZoneId = null
  editor.changeViewZones(function (changeAccessor: any) {
    var domNode = document.createElement('div')

    ReactDOM.render(<ZoneBackground />, domNode)

    viewZoneId = changeAccessor.addZone({
      afterLineNumber: 3,
      heightInLines: 3,
      domNode: domNode,
    })
  })

  // Add a content widget (scrolls inline with text)
  var contentWidget = {
    domNode: null,
    getId: function () {
      return 'my.content.widget'
    },
    getDomNode: function (this: { domNode: HTMLElement }) {
      if (!this.domNode) {
        this.domNode = document.createElement('div')
        ReactDOM.render(
          <ZoneContentContainer numLines={3}>
            <PlaceholderZoneContent />
          </ZoneContentContainer>,
          this.domNode,
        )
      }
      return this.domNode
    },
    getPosition: function () {
      return {
        position: {
          lineNumber: 4,
          column: 0,
        },
        preference: [
          monaco.editor.ContentWidgetPositionPreference.ABOVE,
          monaco.editor.ContentWidgetPositionPreference.BELOW,
        ],
      }
    },
  }
  editor.addContentWidget(contentWidget)
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
