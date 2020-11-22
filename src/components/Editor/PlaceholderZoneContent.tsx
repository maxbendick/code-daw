import * as React from 'react'

export const MyZoneContent: React.FC = () => {
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
