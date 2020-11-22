export type AudioSignal = { _audioSignal: true };

class _AudioSignalImpl implements AudioSignal {
  _audioSignal = true as const;
  // how do i do this lol?
  // compile at end?
  // tree?
  // updating parameters?
  // pass buffers?
}

export type AudioEffect = (input: AudioSignal) => AudioSignal;
