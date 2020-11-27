export declare type AudioSignal = {
    _audioSignal: true;
};
export declare type AudioEffect = (input: AudioSignal) => AudioSignal;
