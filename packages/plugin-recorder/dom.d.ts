declare interface HTMLCanvasElement {
  captureStream (framerate?: number): MediaStream
}

declare interface MediaRecorderErrorEvent extends Event {
  name: string;
}

declare interface MediaRecorderDataAvailableEvent extends Event {
  data : any;
}

interface MediaRecorderEventMap {
  'dataavailable': MediaRecorderDataAvailableEvent;
  'error': MediaRecorderErrorEvent ;
  'pause': Event;
  'resume': Event;
  'start': Event;
  'stop': Event;
  'warning': MediaRecorderErrorEvent ;
}

declare interface MediaRecorderOptions {
  mimeType?: string
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
  bitsPerSecond?: number
}

declare class MediaRecorder extends EventTarget {

  readonly mimeType: string;
  readonly state: 'inactive' | 'recording' | 'paused';
  readonly stream: MediaStream;
  ignoreMutedMedia: boolean;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;

  ondataavailable: (event : MediaRecorderDataAvailableEvent) => void;
  onerror: (event: MediaRecorderErrorEvent) => void;
  onpause: () => void;
  onresume: () => void;
  onstart: () => void;
  onstop: () => void;

  constructor(stream: MediaStream, options?: MediaRecorderOptions);

  start(timeslice?: number): void

  stop(): void

  resume(): void

  pause(): void

  isTypeSupported(type: string): boolean

  requestData(): void


  addEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  removeEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

}

declare class CanvasRecorder {
  start (timeslice?: number): void
  stop (): void
}

interface Window {
  TUKIYOMI_CANVAS_RECORDER: new (canvas: HTMLCanvasElement, options?: MediaRecorderOptions) => CanvasRecorder
  TUKIYOMI_CANVAS_RECORDER_INSTANCE?: CanvasRecorder
  TUKIYOMI_CANVAS_RECORDER_INSTANCE_ID: number
  TUKIYOMI_STREAM_PORT: number
  TUKIYOMI_START_RECORD (timeslice?: number, options?: MediaRecorderOptions): void
  TUKIYOMI_STOP_RECORD (): void
  io: SocketIOClientStatic
  Howler: any
}