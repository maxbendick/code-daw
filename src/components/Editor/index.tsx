import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as monacoPackage from 'monaco-editor'
import * as React from 'react'
import ReactDOM from 'react-dom'
import './Editor.css'

const lineHeight = 23

const ZoneContent: React.FC<{ numLines: number }> = props => {
  console.log('ZoneContent props', props)
  return (
    <div
      onClick={() => console.log('content clicck')}
      style={{
        height: lineHeight * props.numLines,
        width: '200px',
        cursor: 'help',
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

const setupEditor = async (
  editor: monacoPackage.editor.IEditorOverrideServices,
  showEvent: (s: string) => void,
) => {
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

    // domNode.style.background = 'hsla(320, 60%, 70%, 0.3)'
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
        // this.domNode.innerHTML =
        //   '<a target="_blank" href="https://www.microsoft.com/">Microsoft</a>'
        // this.domNode.style.background = 'grey'
        ReactDOM.render(<ZoneContent numLines={3} />, this.domNode)
      }
      return this.domNode
    },
    getPosition: function () {
      return {
        position: {
          lineNumber: 4,
          column: 8,
        },
        preference: [
          monaco.editor.ContentWidgetPositionPreference.ABOVE,
          monaco.editor.ContentWidgetPositionPreference.BELOW,
        ],
      }
    },
  }
  editor.addContentWidget(contentWidget)

  editor.onMouseMove(function (e: Event) {
    showEvent('mousemove - ' + e.target?.toString())
  })
  editor.onMouseDown(function (e: Event) {
    showEvent('mousedown - ' + e.target?.toString())
  })
  editor.onContextMenu(function (e: Event) {
    showEvent('contextmenu - ' + e.target?.toString())
  })
  editor.onMouseLeave(function (e: Event) {
    showEvent('mouseleave')
  })
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
      options={{ fontSize: 18, lineHeight }}
      value={jsCode}
      editorDidMount={handleEditorDidMount}
    />
  )
}
