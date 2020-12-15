import { useService } from '@xstate/react'
import * as React from 'react'
import styled from 'styled-components'
import { VfsService } from '../../virtual-file-system/vfs-machine'

const files = {
  'index.tsx': 'askdfjskdf',
  'dial.tsx': 'asdkfajsdf',
}

for (let i = 0; i < 10; i++) {
  ;(files as any)[`aksdfasd${i}.tsx`] = 'askdfjskjdf'
}

const Container = styled.div`
  // background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  width: 100%;
`

const borderStyle = '1px solid #333'

const FileItemContainer = styled.div<{ active: boolean }>`
  display: block;
  border: ${borderStyle};
  border-bottom: none;
  &:last-child {
    border-bottom: ${borderStyle};
  }
  height: 35px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 5px;

  user-select: none;
  cursor: pointer;

  &:hover {
    ${props => (props.active ? '' : 'background: rgba(0, 0, 0, 0.25);')}
  }

  ${props => (props.active ? 'background: rgba(0, 0, 0, 0.3);' : '')}
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

export const FileBrowser: React.FC<{ vfsService: VfsService }> = ({
  vfsService,
}) => {
  const [vfsState, vfsSend] = useService(vfsService)

  const paths = Object.keys(vfsState.context.pathToContent).sort()

  const activePath = vfsState.context.activePath

  const setActivePath = (path: string) => {
    vfsSend({ type: 'SET_ACTIVE', path })
  }

  return (
    <Container>
      {paths.map(path => (
        <FileItem
          key={path}
          fileName={path}
          active={path === activePath}
          onClick={() => setActivePath(path)}
        />
      ))}
    </Container>
  )
}
