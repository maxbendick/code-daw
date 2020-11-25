import * as React from 'react'
import * as Config from '../config'

export const ZoneContentContainer: React.FC<{ numLines: number }> = ({
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
