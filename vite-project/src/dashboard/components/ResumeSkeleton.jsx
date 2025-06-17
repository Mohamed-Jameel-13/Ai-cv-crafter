import React from 'react';

const ResumeSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Placeholder for the top image section */}
      <div className="h-[280px] rounded-t-lg bg-gray-300 dark:bg-gray-700"></div>
      
      {/* Placeholder for the bottom title/menu section */}
      <div className="border p-3 flex justify-between rounded-b-lg shadow-lg bg-gray-400 dark:bg-gray-600 h-[50px]">
        {/* Placeholder for title */}
        <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded w-3/4"></div>
        {/* Placeholder for menu icon */}
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-500 rounded"></div>
      </div>
    </div>
  );
};

export default ResumeSkeleton; 