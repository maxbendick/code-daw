import * as React from 'react'
import { useEffect } from 'react'
// import { _DialInteractable } from '../../lib/interactable'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

const TextZone: React.FC<{ label: string; onChange: (a: string) => void }> = ({
  label,
  onChange,
}) => {
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
          onChange={e => onChange((e as any).nativeEvent.data)}
        />
      </label>
    </div>
  )
}

export const TextZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  useEffect(() => {
    console.log('TextZoneZooone', token, codeDawVar)

    send('sendingg from the textt zone')
  }, [send])
  return (
    <TextZone
      label={`${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`}
      onChange={send}
    ></TextZone>
  )
}

export const TextZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}
