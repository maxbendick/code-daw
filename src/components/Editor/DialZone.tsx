import * as React from 'react'
import styled from 'styled-components'
import { Dial } from '../Dial'
import './Editor.css'
import { ZoneComponent, ZoneLoadingComponent } from './zone-component'

export const defaultDialZoneValue = (codeDawVar: any) => {
  console.log('defaultDialZoneValue', codeDawVar)
  return codeDawVar.config.defaultValue
}

const DialZoneContainer = styled.div`
  height: 100%;
  width: 400px;
  background-color: #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
`
const DialZoneContent = styled.div`
  height: 50px;
  display: flex;
`
const VerticalAlign = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const DialZoneZooone: ZoneComponent = ({ token, codeDawVar, send }) => {
  const config = codeDawVar.config
  const label = `${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`
  return (
    <DialZoneContainer>
      <DialZoneContent>
        <VerticalAlign>
          <Dial
            send={send}
            initialValue={config.defaultValue}
            start={config.start}
            end={config.end}
            radius={25}
          ></Dial>
        </VerticalAlign>
        <VerticalAlign>
          <div style={{ marginLeft: 10 }}>{label}</div>
        </VerticalAlign>
      </DialZoneContent>
    </DialZoneContainer>
  )
}

export const DialZoneLoading: ZoneLoadingComponent = ({ token }) => {
  return <div>loading {token.varName}</div>
}
