import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 text-orange-500 shadow-xs border border-orange-100">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-gray-700 font-medium tracking-tight text-base">{message}</p>
        <p className="text-gray-400 text-xs mt-1">Family Food Tracker</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-7 h-7 animate-spin text-orange-500 mb-3" />
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};
