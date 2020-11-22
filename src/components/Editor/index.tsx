import MonacoEditor from '@monaco-editor/react'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import './Editor.css'

const anyWindow = window as any

anyWindow.MonacoEnvironment = {
  getWorkerUrl(moduleId: string, label: string) {
    if (label === 'json') {
      return './json.worker.bundle.js'
    }
    if (label === 'css') {
      return './css.worker.bundle.js'
    }
    if (label === 'html') {
      return './html.worker.bundle.js'
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js'
    }
    return './editor.worker.bundle.js'
  },
}

const setupEditor = (
  monaco: any,
  editorContainerElement: HTMLElement,
  outputElement: HTMLElement
) => {
  var jsCode = [
    '"use strict";',
    'function Person(age) {',
    '	if (age) {',
    '		this.age = age;',
    '	}',
    '}',
    'Person.prototype.getAge = function () {',
    '	return this.age;',
    '};',
  ].join('\n')

  var editor = monaco.editor.create(editorContainerElement, {
    value: jsCode,
    language: 'javascript',
    glyphMargin: true,
    contextmenu: false,
  })

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
    ]
  )

  // Add a zone to make hit testing more interesting
  var viewZoneId = null
  editor.changeViewZones(function (changeAccessor: any) {
    var domNode = document.createElement('div')
    domNode.style.background = 'lightgreen'
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
        this.domNode.innerHTML =
          '<a target="_blank" href="https://www.microsoft.com/">Microsoft</a>'
        this.domNode.style.background = 'grey'
      }
      return this.domNode
    },
    getPosition: function () {
      return {
        position: {
          lineNumber: 7,
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

  // Add an overlay widget
  var overlayWidget = {
    domNode: null,
    getId: function () {
      return 'my.overlay.widget'
    },
    getDomNode: function (this: { domNode: HTMLElement }) {
      if (!this.domNode) {
        this.domNode = document.createElement('div')
        this.domNode.innerHTML = 'My overlay widget'
        this.domNode.style.background = 'grey'
        this.domNode.style.right = '30px'
        this.domNode.style.top = '50px'
      }
      return this.domNode
    },
    getPosition: function () {
      return null
    },
  }
  editor.addOverlayWidget(overlayWidget)

  function showEvent(str: string) {
    while (outputElement.childNodes.length > 6) {
      outputElement.removeChild(
        outputElement?.firstChild?.nextSibling?.nextSibling!
      )
    }
    outputElement.appendChild(document.createTextNode(str))
    outputElement.appendChild(document.createElement('br'))
  }

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

export const Editor: React.FC = () => {
  const outputElementRef = useRef(null as any)
  const containerElementRef = useRef(null as any)

  useEffect(() => {
    // setupEditor(null as any, outputElementRef.current, containerElementRef.current);
  }, [])

  // todo one all elements mounted, run editor code
  // return (
  //   <div>
  //     <div ref={outputElementRef} id="output">
  //       Last 3 events:
  //       <br />
  //     </div>
  //     <div id="middle-div"></div>
  //     <div ref={containerElementRef} id="container"></div>
  //   </div>
  // )

  return (
    <MonacoEditor
      height="calc(100vh - 330px)"
      language="typescript"
      theme="dark"
      options={{ fontSize: 18 }}
    />
  )
}
