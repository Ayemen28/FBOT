
import React from 'react';

export const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
      <p className="mt-2 text-sm text-gray-600">جاري التحميل...</p>
    </div>
  );
});
