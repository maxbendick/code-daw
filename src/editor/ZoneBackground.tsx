import * as React from 'react'

/** Paler red background */
export const ZoneBackground: React.FC = () => {
  return (
    <div
      onClick={() => console.log('bg click ????? shouldnt happen')}
      style={{
        height: '100%',
        width: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        // backgroundColor: 'green',
        // backgroundColor: 'hsla(320, 60%, 70%, 0.13)',
      }}
    ></div>
  )
}
