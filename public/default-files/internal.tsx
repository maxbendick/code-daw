export const getAudioContext = () => (window as any).codeDaw.audioContext
export const interactable = ({ value, domNode, onDestroy }) => {
  if (typeof value === 'string') {
    throw new Error('cant have string interactable')
  }
  value[(window as any).codeDaw.interactableSymbol] = {
    domNode,
    onDestroy,
  }
  return value
}
