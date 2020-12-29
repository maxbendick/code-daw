export const getAudioContext = (): AudioContext =>
  (window as any).codeDaw.audioContext

export const getPublicUrl = (): string => (window as any).codeDaw.publicUrl

interface InteractableParams {
  value: any // except for string, others? need to be able to assign a property to it
  domNode: HTMLElement
  onDestroy: () => void
}
export const interactable = ({
  value,
  domNode,
  onDestroy,
}: InteractableParams) => {
  if (typeof value === 'string') {
    throw new Error('cant have string interactable')
  }
  value[(window as any).codeDaw.interactableSymbol] = {
    domNode,
    onDestroy,
  }
  return value
}
