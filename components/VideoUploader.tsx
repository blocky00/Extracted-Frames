import React, { useCallback } from 'react';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onVideoSelect(event.target.files[0]);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onVideoSelect(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [onVideoSelect]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Video Frame Extractor</h1>
      <p className="max-w-2xl text-lg text-gray-300 mb-8">
        Upload a video to automatically extract its unique frames. Perfect for finding keyframes to use in AI video generation tools.
      </p>
      <div 
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full max-w-lg p-10 border-4 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-all duration-300"
      >
        <label htmlFor="video-upload" className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-xl font-semibold text-gray-300">Drag & drop your video here</p>
            <p className="text-gray-400">or</p>
            <span className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors">
                Browse File
            </span>
        </label>
        <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
        />
      </div>
      <p className="mt-6 text-sm text-gray-500">All processing is done locally in your browser. Your files are never uploaded.</p>
    </div>
  );
};

export default VideoUploader;
