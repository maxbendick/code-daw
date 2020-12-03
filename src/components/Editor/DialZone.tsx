import * as React from 'react'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

const DialZone: React.FC<{ label: string; send: (a: number) => void }> = ({
  label,
  send,
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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <button onClick={() => send(200)}>dial200</button>
        <button onClick={() => send(300)}>300</button>
        <button onClick={() => send(400)}>400</button>
      </div>
    </div>
  )
}

export const defaultDialZoneValue = (codeDawVar: any) => {
  console.log('defaultDialZoneValue', codeDawVar)
  return codeDawVar.config.defaultValue
}

export const DialZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  return (
    <DialZone
      label={`${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`}
      send={send}
    ></DialZone>
  )
}

export const DialZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}
