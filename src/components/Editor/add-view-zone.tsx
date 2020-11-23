import * as React from 'react'
import ReactDOM from 'react-dom'
import { EditorT, IViewZone, IViewZoneChangeAccessor, Monaco } from './types'
import { ZoneBackground } from './ZoneBackground'

// note: also adds decorations
export const addViewZone = (
  monaco: Monaco,
  editor: EditorT,
  initialAfterLineNumber: number,
  initialHeightInLines: number,
) => {
  // Add a zone to make hit testing more interesting
  let viewZoneId: string = null as any

  const domNode = document.createElement('div')
  ReactDOM.render(<ZoneBackground />, domNode)

  const viewZone: IViewZone = {
    afterLineNumber: initialAfterLineNumber,
    heightInLines: initialHeightInLines,
    domNode,
  }

  editor.changeViewZones(function (changeAccessor: IViewZoneChangeAccessor) {
    viewZoneId = changeAccessor.addZone(viewZone)
  })

  return {
    // probably won't be needed, doesn't touch decorations
    updateAfterLineNumber: (afterLineNumber: number) => {
      viewZone.afterLineNumber = afterLineNumber

      editor.changeViewZones(function (
        changeAccessor: IViewZoneChangeAccessor,
      ) {
        changeAccessor.layoutZone(viewZoneId)
      })
    },
  }
}
