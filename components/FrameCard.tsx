import React, { useState } from 'react';
import { FrameData } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import CopyIcon from './icons/CopyIcon';

interface FrameCardProps {
  frame: FrameData;
}

const FrameCard: React.FC<FrameCardProps> = ({ frame }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = frame.imageDataUrl;
    link.download = `frame_${frame.frameNumber}_${frame.timestamp.toFixed(2)}s.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    const textToCopy = `Frame: ${frame.frameNumber}, Timestamp: ${frame.timestamp.toFixed(2)}s`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
      <img src={frame.imageDataUrl} alt={`Frame ${frame.frameNumber}`} className="w-full h-auto object-cover aspect-video" />
      <div className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <p><strong>Frame:</strong> {frame.frameNumber}</p>
          <p><strong>Time:</strong> {frame.timestamp.toFixed(2)}s</p>
        </div>
        <div className="flex justify-around items-center mt-4 space-x-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <CopyIcon className="w-4 h-4 mr-2" />
            {copyStatus === 'idle' ? 'Copy Info' : 'Copied!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameCard;
