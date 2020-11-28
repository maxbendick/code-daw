import * as React from 'react'
import { _DialInteractable } from '../../lib/interactable'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

const TextZone: React.FC<{ label: string }> = ({ label }) => {
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

export const TextZoneZooone: ZoneComponent<_DialInteractable> = ({
  token,
  interactable,
}) => {
  console.log('interactable from component', interactable)
  const config = interactable._config
  return (
    <TextZone
      label={`${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`}
    ></TextZone>
  )
}

export const TextZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}
