/// @ts-nocheck

export const getAudioContext = () => window.codeDaw.audioContext
export const interactable = ({ value, domNode, onDestroy }) => {
  if (typeof value === 'string') {
    throw new Error('cant have string interactable')
  }
  value[window.codeDaw.interactableSymbol] = {
    domNode,
    onDestroy,
  }
  return value
}
