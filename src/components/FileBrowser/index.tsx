import * as React from 'react'
import { useState } from 'react'
import styled from 'styled-components'

const files = {
  'index.tsx': 'askdfjskdf',
  'dial.tsx': 'asdkfajsdf',
}

for (let i = 0; i < 10; i++) {
  ;(files as any)[`aksdfasd${i}.tsx`] = 'askdfjskjdf'
}

const Container = styled.div`
  background-color: #411;
  display: flex;
  flex-direction: column;
  width: 500px;
  height: 500px;
`

const FileItemContainer = styled.div<{ active: boolean }>`
  display: block;
  border: 1px solid #811;
  border-bottom: none;
  &:last-child {
    border-bottom: 1px solid #811;
  }
  height: 35px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 5px;

  ${props => (props.active ? 'background-color: #2f1111' : '')}
`

const FileItemLabel = styled.div<{ active: boolean }>`
  color: ${(props: any) => (props.active ? '#bbb' : '#777')};
`

const FileItem: React.FC<{
  fileName: string
  active: boolean
  onClick: () => void
}> = ({ fileName, active, onClick }) => {
  return (
    <FileItemContainer active={active} onClick={onClick}>
      <FileItemLabel active={active}>{fileName}</FileItemLabel>
    </FileItemContainer>
  )
}

export const FileBrowser: React.FC = () => {
  const [activeFileName, setActiveFileName] = useState('index.tsx')

  return (
    <Container>
      {Object.entries(files).map(([fileName, fileContent]) => (
        <FileItem
          key={fileName}
          fileName={fileName}
          active={fileName === activeFileName}
          onClick={() => setActiveFileName(fileName)}
        />
      ))}
    </Container>
  )
}
