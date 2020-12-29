export const wait = async (ms: number): Promise<void> => {
  await new Promise(resolve => setTimeout(() => resolve(true), ms))
  return
}
