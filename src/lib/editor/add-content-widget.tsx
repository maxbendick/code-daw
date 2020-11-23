import React from 'react'
import ReactDOM from 'react-dom'
import { Instances } from './instances'
import { IContentWidget, IContentWidgetPosition } from './types'
import { ZoneContentContainer } from './ZoneContentContainer'

export const addContentWidget = (
  initialLineNumber: number,
  content: ReturnType<React.FC>,
) => {
  // Add a content widget (scrolls inline with text)
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
    // domNode: null as any,
    getId: function () {
      return 'my.content.widget'
    },
    getDomNode: function () {
      if (!domNode) {
        domNode = document.createElement('div')
        ReactDOM.render(
          <ZoneContentContainer numLines={3}>{content}</ZoneContentContainer>,
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
  }
}
