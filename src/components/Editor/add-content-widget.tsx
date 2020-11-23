import React from 'react'
import ReactDOM from 'react-dom'
import { MyZoneContent as PlaceholderZoneContent } from './PlaceholderZoneContent'
import {
  EditorT,
  IContentWidget,
  IContentWidgetPosition,
  Monaco,
} from './types'
import { ZoneContentContainer } from './ZoneContentContainer'

export const addContentWidget = (
  editor: EditorT,
  monaco: Monaco,
  initialLineNumber: number,
) => {
  // Add a content widget (scrolls inline with text)
  let domNode = null as any

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
          <ZoneContentContainer numLines={3}>
            <PlaceholderZoneContent />
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
  }
}
