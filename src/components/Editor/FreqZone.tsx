import * as React from 'react'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

const FreqZone: React.FC<{ label: string; send: (a: number) => void }> = ({
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
        <button onClick={() => send(200)}>200</button>
        <button onClick={() => send(300)}>300</button>
        <button onClick={() => send(400)}>400</button>
      </div>
      {/* <label>
        {label}
        <button>200</button>
      </label> */}
    </div>
  )
}

export const defaultFreqZoneValue = (codeDawVar: any) => {
  console.log('defaultFreqZoneValue', codeDawVar)
  return codeDawVar.config.defaultValue
}

export const FreqZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  // useEffect(() => {
  //   console.log('FreqZoneZooone', token, codeDawVar)
  //   send('sendingg from the textt zone')
  // }, [send])
  return (
    <FreqZone
      label={`${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`}
      send={send}
    ></FreqZone>
  )
}

export const FreqZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}
