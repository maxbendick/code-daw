export type MidiSignal = { _midiSignal: true }

// This can wait
class _MidiSignalImpl implements MidiSignal {
  _midiSignal = true as const
}
