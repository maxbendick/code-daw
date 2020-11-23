import * as React from 'react'
import './Editor.css'

export const TextZone: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'rgba(0,0,255, 0.3)',
        fontSize: '10px',
        paddingLeft: '10px',
      }}
    >
      <label>
        {label}
        <input
          style={{
            display: 'block',
            background: '#333',
            color: 'white',
            marginTop: '5px',
          }}
        />
      </label>
    </div>
  )
}
