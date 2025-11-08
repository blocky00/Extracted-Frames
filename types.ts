export interface FrameData {
  id: string;
  imageDataUrl: string;
  frameNumber: number;
  timestamp: number; // in seconds
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';
