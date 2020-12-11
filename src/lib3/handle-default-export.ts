import { Node, ResolveFn } from './types'

const resolve: ResolveFn = null as any

export const handleDefaultExport = async (node: Node<AudioNode>) => {
  const output = await node.output
  if (!(output instanceof AudioNode)) {
    throw new Error('cant handle default export that is not audio')
  }

  // given the default export of the running file,
  // unwrap, verify, connect to master, and start oscs?
}
