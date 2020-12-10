import { ResolveFn } from './types'

const resolve: ResolveFn = null as any

export const handleDefaultExport = async (valueP: Promise<AudioNode>) => {
  const value = await valueP
  if (!(value instanceof AudioNode)) {
    throw new Error('cant handle default export that is not audio')
  }

  // given the default export of the running file,
  // unwrap, verify, connect to master, and start oscs?
}
