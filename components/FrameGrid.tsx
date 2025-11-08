import React from 'react';
import { FrameData } from '../types';
import FrameCard from './FrameCard';
import DownloadIcon from './icons/DownloadIcon';

interface FrameGridProps {
  frames: FrameData[];
  onReset: () => void;
  onExportZip: () => void;
  isZipping: boolean;
}

const FrameGrid: React.FC<FrameGridProps> = ({ frames, onReset, onExportZip, isZipping }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-white">Extracted Frames ({frames.length})</h2>
          <div className="flex items-center gap-4">
            <button
                onClick={onExportZip}
                disabled={isZipping || frames.length === 0}
                className="flex items-center justify-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                {isZipping ? 'Zipping...' : 'Download All (.zip)'}
            </button>
            <button
                onClick={onReset}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors"
            >
                Start Over
            </button>
          </div>
      </div>

      {frames.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400">No distinct frames were found.</p>
          <p className="text-gray-500 mt-2">Try a different video or adjust the similarity threshold.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {frames.map((frame) => (
            <FrameCard key={frame.id} frame={frame} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FrameGrid;