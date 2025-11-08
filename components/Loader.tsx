import React from 'react';

interface LoaderProps {
  progress: number;
}

const Loader: React.FC<LoaderProps> = ({ progress }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Extracting Frames...</h2>
        <div className="relative pt-1">
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-700">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
            ></div>
          </div>
        </div>
        <p className="text-center text-lg font-semibold text-indigo-300">{Math.round(progress)}%</p>
        <p className="text-center text-sm text-gray-400 mt-2">Please wait, this may take a few moments.</p>
      </div>
    </div>
  );
};

export default Loader;
