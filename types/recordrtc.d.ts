declare module 'recordrtc' {
  export default class RecordRTC {
    static StereoAudioRecorder: any;
    constructor(stream: MediaStream, options: any);
    startRecording(): void;
    pauseRecording(): void;
    stopRecording(callback?: (blob: Blob) => void): void;
  }
} 