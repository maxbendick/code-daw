import React from 'react'
import ReactDOM from 'react-dom'
import { Instances } from './instances'
import { IContentWidget, IContentWidgetPosition } from './types'
import { ZoneContentContainer } from './ZoneContentContainer'

export const addContentWidget = (
  initialLineNumber: number,
  numLines: number,
  content: ReturnType<React.FC>,
) => {
  const id = Math.random().toString(36).substring(7)

  let domNode = null as any
  const { monaco, editor } = Instances

  const position: IContentWidgetPosition = {
    position: {
      lineNumber: initialLineNumber,
      column: 0,
    },
    preference: [
      monaco.editor.ContentWidgetPositionPreference.ABOVE,
      monaco.editor.ContentWidgetPositionPreference.BELOW,
    ],
  }

  var contentWidget: IContentWidget = {
    getId: function () {
      return id
    },
    getDomNode: function () {
      if (!domNode) {
        domNode = document.createElement('div')
        ReactDOM.render(
          <ZoneContentContainer numLines={numLines}>
            {content}
          </ZoneContentContainer>,
          domNode,
        )
      }
      return domNode
    },
    getPosition: function () {
      return position
    },
  }
  editor.addContentWidget(contentWidget)

  return {
    updateLineNumber: (lineNumber: number) => {
      ;(position.position as any).lineNumber = lineNumber
      editor.layoutContentWidget(contentWidget)
    },
    updateContent: (content: ReturnType<React.FC>) => {
      ReactDOM.unmountComponentAtNode(domNode)
      ReactDOM.render(
        <ZoneContentContainer numLines={numLines}>
          {content}
        </ZoneContentContainer>,
        domNode,
      )
    },
    destroy: () => {
      ReactDOM.unmountComponentAtNode(domNode)
      editor.removeContentWidget(contentWidget)
    },
  }
}
