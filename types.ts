export enum AppMode {
  CHOOSING,
  TRANSCRIPTION,
  VIDEO,
  NEEDS_KEY,
}

export enum Feature {
  TRANSCRIPTION = 'TRANSCRIPTION',
  VIDEO = 'VIDEO'
}

export enum FlowState {
  IDLE,
  PROCESSING,
  SUCCESS,
  ERROR,
}
