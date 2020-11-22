import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as monacoPackage from 'monaco-editor'
import * as React from 'react'
import ReactDOM from 'react-dom'
import * as Config from '../../config'
import './Editor.css'

type EditorT = monacoPackage.editor.IEditorOverrideServices

const ZoneContentContainer: React.FC<{ numLines: number }> = ({
  numLines,
  children,
}) => {
  return (
    <div
      style={{
        height: Config.lineHeight * numLines,
        width: Config.widgetZoneWidth, // full width ??
      }}
    >
      {children}
    </div>
  )
}

const MyZoneContent: React.FC = () => {
  return (
    <div
      onClick={() => console.log('content clicck')}
      style={{
        height: '100%',
        width: '100%',
        cursor: 'crosshair',
        backgroundColor: 'hsla(320, 60%, 70%, 0.3)',
      }}
    >
      ZoneContent!
    </div>
  )
}

/** Paler red background */
const ZoneBg: React.FC = () => {
  return (
    <div
      onClick={() => console.log('bg click ????? shouldnt happen')}
      style={{
        height: '100%',
        backgroundColor: 'hsla(320, 60%, 70%, 0.13)',
      }}
    ></div>
  )
}

const setupEditor = async (editor: EditorT, showEvent: (s: string) => void) => {
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

    ReactDOM.render(<ZoneBg />, domNode)

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
            <MyZoneContent />
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
  const handleEditorDidMount = (_: any, editor: any) => {
    setupEditor(editor, () => {}) // s => console.log(s))
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
