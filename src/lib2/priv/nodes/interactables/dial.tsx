import * as React from 'react'
import { Observable } from 'rxjs'
import { startWith } from 'rxjs/operators'
import styled from 'styled-components'
import { Dial } from '../../../../components/Dial'
import { EdgeType } from '../../no-sig-types/edge-types'
import { ConfigValidationError, SuperDef } from '../../no-sig-types/super-def'
import { ZoneComponent, ZoneLoadingComponent } from '../../zone-component'

const nodeType = 'interactables/dial' as const

type Config = {
  start: number
  end: number
  defaultValue: number
}

type Args = [config: Config]

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

export const DialZoneZooone: ZoneComponent<Config> = ({
  token,
  config,
  codeDawVar,
  send,
}) => {
  const label = `${token.varName}: { ${config.start} ${config.end} ${config.defaultValue} }`
  console.log('dial zone', { token, codeDawVar, send })
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

export const superDialDef = {
  nodeType: nodeType,
  inputs: {},
  output: EdgeType.Signal,
  interactable: true,
  argsToInputs: (...[config]: Args) => ({}),
  argsToConfig: (...[config]: Args) => {
    for (const k of ['start', 'end', 'defaultValue']) {
      if (typeof (config as any)[k] !== 'number') {
        throw new ConfigValidationError(nodeType, config)
      }
    }
    return config
  },
  makeOutput: (
    audioContext: AudioContext,
    config: Config,
    inputs: any,
    send$?: Observable<any>,
  ) => {
    return send$?.pipe(startWith(config.defaultValue))
  },
  zoneComponent: DialZoneZooone,
  zoneLoadingComponent: DialZoneLoading,
} as const

const _proof: SuperDef = superDialDef
