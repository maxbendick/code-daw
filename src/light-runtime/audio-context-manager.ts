// export const makeGain = (
//   audioContext: AudioContext,
//   gainValue: Observable<number> | AudioNode,
//   source: AudioNode,
// ): { output: AudioNode; subscription: Subscription } => {
//   const gainNode = audioContext.createGain()
//   // TODO unsubscribe
//   const subscription = easyConnect(audioContext, gainValue, gainNode.gain)
//   source.connect(gainNode)
//   return {
//     output: gainNode,
//     subscription,
//   }
// }

const MASTER_GAIN = 0.2

export class AudioContextManager {
  audioContext: AudioContext
  masterGain: GainNode
  userOutput?: AudioNode

  constructor() {
    this.audioContext = new AudioContext()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = MASTER_GAIN
    this.masterGain.connect(this.audioContext.destination)
  }

  attachUserOutput = (userOutput: AudioNode) => {
    if (this.userOutput) {
      throw new Error('attachUserOutput called twice')
    }
    this.userOutput = userOutput
    userOutput.connect(this.masterGain)
    console.log('attached output', userOutput)
  }

  destroy = async (): Promise<void> => {
    // this seems to make it smoother
    this.masterGain.gain.linearRampToValueAtTime(
      MASTER_GAIN,
      this.audioContext.currentTime + 0.2,
    )
    await new Promise(resolve => setTimeout(resolve, 200))
    this.masterGain.gain.linearRampToValueAtTime(
      0.0,
      this.audioContext.currentTime + 0.2,
    )

    await new Promise(resolve => setTimeout(resolve, 210))

    // TODO ease gain to 0
    this.audioContext.close()
    ;(window as any).codeDaw.audioContext = null
  }
}
