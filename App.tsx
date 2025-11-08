import React, { useState, useCallback, useEffect } from 'react';
import VideoUploader from './components/VideoUploader';
import Loader from './components/Loader';
import FrameGrid from './components/FrameGrid';
import { FrameData, ProcessingStatus } from './types';

// Let TypeScript know about JSZip from the CDN
declare var JSZip: any;

// --- Configuration ---
// How many times per second to check for a new frame. Higher is more accurate but slower.
const FRAMES_TO_CHECK_PER_SECOND = 10;
// Dimensions for the small comparison canvas. Smaller is faster.
const COMPARISON_CANVAS_SIZE = 64;
// Threshold for frame difference (0 to 1). Lower value means more frames will be extracted.
const SIMILARITY_THRESHOLD = 0.02;

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  const resetState = () => {
    setVideoFile(null);
    setFrames([]);
    setStatus('idle');
    setProgress(0);
    setIsZipping(false);
  };

  const handleExportZip = async () => {
    if (isZipping || frames.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const frame of frames) {
        const response = await fetch(frame.imageDataUrl);
        const blob = await response.blob();
        const filename = `frame_${frame.frameNumber}_${frame.timestamp.toFixed(2)}s.jpg`;
        zip.file(filename, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `extracted_frames.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Error creating zip file:", error);
      // You could add an error state for zipping here if desired
    } finally {
      setIsZipping(false);
    }
  };

  const compareFrames = (ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, width: number, height: number): number => {
    const imgData1 = ctx1.getImageData(0, 0, width, height).data;
    const imgData2 = ctx2.getImageData(0, 0, width, height).data;
    let diff = 0;
    for (let i = 0; i < imgData1.length; i += 4) {
      diff += Math.abs(imgData1[i] - imgData2[i]) / 255;
      diff += Math.abs(imgData1[i + 1] - imgData2[i + 1]) / 255;
      diff += Math.abs(imgData1[i + 2] - imgData2[i + 2]) / 255;
    }
    return diff / (width * height * 3);
  };

  const extractFrames = useCallback(async (file: File) => {
    if (status === 'processing') return;

    setStatus('processing');
    setProgress(0);
    setFrames([]);

    const video = document.createElement('video');
    video.style.position = 'fixed';
    video.style.top = '-10000px';
    video.style.left = '-10000px';
    video.style.opacity = '0';
    document.body.appendChild(video);

    const cleanup = () => {
        if (document.body.contains(video)) {
            document.body.removeChild(video);
        }
        URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    const captureCanvas = document.createElement('canvas');
    const captureCtx = captureCanvas.getContext('2d', { willReadFrequently: true });

    const prevCanvas = document.createElement('canvas');
    const prevCtx = prevCanvas.getContext('2d', { willReadFrequently: true });
    
    const currentCanvas = document.createElement('canvas');
    const currentCtx = currentCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!captureCtx || !prevCtx || !currentCtx) {
      console.error("Could not get canvas context");
      setStatus('error');
      cleanup();
      return;
    }

    video.onloadedmetadata = async () => {
      captureCanvas.width = video.videoWidth;
      captureCanvas.height = video.videoHeight;
      prevCanvas.width = COMPARISON_CANVAS_SIZE;
      prevCanvas.height = COMPARISON_CANVAS_SIZE;
      currentCanvas.width = COMPARISON_CANVAS_SIZE;
      currentCanvas.height = COMPARISON_CANVAS_SIZE;

      const duration = video.duration;
      const step = 1 / FRAMES_TO_CHECK_PER_SECOND;

      try {
        // Draw the first frame
        video.currentTime = 0;
        await new Promise<void>(resolve => { video.onseeked = () => resolve() });
        captureCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        prevCtx.drawImage(video, 0, 0, COMPARISON_CANVAS_SIZE, COMPARISON_CANVAS_SIZE);
        const firstFrameDataUrl = captureCanvas.toDataURL('image/jpeg');
        setFrames([{ id: crypto.randomUUID(), imageDataUrl: firstFrameDataUrl, frameNumber: 0, timestamp: 0 }]);

        let frameCounter = 1; // Start next frame number from 1

        for (let time = step; time < duration; time += step) {
          video.currentTime = time;
          await new Promise<void>(resolve => { video.onseeked = () => resolve() });
          
          currentCtx.drawImage(video, 0, 0, COMPARISON_CANVAS_SIZE, COMPARISON_CANVAS_SIZE);
          const difference = compareFrames(prevCtx, currentCtx, COMPARISON_CANVAS_SIZE, COMPARISON_CANVAS_SIZE);

          if (difference > SIMILARITY_THRESHOLD) {
            captureCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageDataUrl = captureCanvas.toDataURL('image/jpeg');
            const newFrame: FrameData = {
              id: crypto.randomUUID(),
              imageDataUrl,
              frameNumber: frameCounter,
              timestamp: time,
            };
            setFrames(prev => [...prev, newFrame]);
            
            prevCtx.drawImage(currentCanvas, 0, 0);
          }

          frameCounter++;
          setProgress((time / duration) * 100);
        }
        
        setStatus('done');
      } catch (error) {
          console.error("Error during frame extraction", error);
          setStatus('error');
      } finally {
        cleanup();
      }
    };

    video.onerror = () => {
        console.error("Error loading video.");
        setStatus('error');
        cleanup();
    }

  }, [status]);
  
  useEffect(() => {
    if (videoFile) {
      extractFrames(videoFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoFile]);

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return <VideoUploader onVideoSelect={setVideoFile} />;
      case 'processing':
        return <Loader progress={progress} />;
      case 'done':
        return <FrameGrid frames={frames} onReset={resetState} onExportZip={handleExportZip} isZipping={isZipping} />;
      case 'error':
        return (
          <div className="text-center text-white">
            <h2 className="text-2xl text-red-500 font-bold mb-4">An Error Occurred</h2>
            <p className="text-gray-300">Could not process the video file. Please try a different file.</p>
            <button
                onClick={resetState}
                className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors"
            >
                Try Again
            </button>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen w-full flex flex-col items-center justify-center p-4">
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;