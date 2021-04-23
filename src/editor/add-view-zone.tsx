import * as React from 'react'
import ReactDOM from 'react-dom'
import { EditorT, IViewZone, IViewZoneChangeAccessor, MonacoT } from './types'

const ZoneBackground: React.FC = () => {
  return (
    <div
      onClick={() => console.log('bg click ????? shouldnt happen')}
      style={{
        height: '100%',
        width: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
      }}
    ></div>
  )
}

// note: also adds decorations
export const addViewZone = (
  monaco: MonacoT,
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

    destroy: () => {
      editor.changeViewZones(function (
        changeAccessor: IViewZoneChangeAccessor,
      ) {
        changeAccessor.removeZone(viewZoneId)
      })
    },
  }
}
