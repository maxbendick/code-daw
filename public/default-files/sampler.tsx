import { Observable } from 'rxjs'
import { getAudioContext, getPublicUrl } from './internal'

const audioContext = getAudioContext()

export const SampleUrl = {
  kick909: `${getPublicUrl()}/samples/909-kick.wav`,
  chirpHhClosed: `${getPublicUrl()}/samples/chirp-hh-closed.wav`,
  chirpHhOpen: `${getPublicUrl()}/samples/chirp-hh-open.wav`,
}

const getSample = async (url: string): Promise<AudioBuffer> => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return audioBuffer
}

const audioBuffers: { [url: string]: AudioBuffer } = {}

const loadSample = async (url: string) => {
  audioBuffers[url] = await getSample(url)
}

export const loadAllSamples = async () => {
  await Promise.all(
    [SampleUrl.kick909, SampleUrl.chirpHhClosed, SampleUrl.chirpHhOpen].map(s =>
      loadSample(s),
    ),
  )
}

// can preload these by moving them into app code
export const samplesLoaded = loadAllSamples()

export const playSample = (url: string) => {
  const audioBuffer = audioBuffers[url]
  if (!audioBuffer) {
    console.error('sample must be loaded to play', url)
  }

  const sampleSource = audioContext.createBufferSource()
  sampleSource.buffer = audioBuffer
  sampleSource.connect(audioContext.destination)
  sampleSource.start()
  return sampleSource
}

export const singleBufferSampler = (
  sampleUrl: string,
  trigger$: Observable<any>,
) => {
  const resultNode = audioContext.createGain()
  resultNode.gain.value = 1

  samplesLoaded.then(() => {
    const audioBuffer = audioBuffers[sampleUrl]
    if (!audioBuffer) {
      console.error('sample must be loaded to play', sampleUrl)
    }

    trigger$.subscribe(() => {
      const sampleSource = audioContext.createBufferSource()
      sampleSource.buffer = audioBuffer
      sampleSource.connect(resultNode)
      sampleSource.start()
    })
  })

  return resultNode
}
