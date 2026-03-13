import React from "react";
import "../index.css"; // Ensure global CSS (including custom shimmer) is applied

export default function ProductSectionSkeleton() {
  // Array to map 5 skeleton cards
  const skeletons = Array(5).fill(0);

  return (
    <div className="w-full bg-gray-50/50 py-6 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gray-300 inline-block skeleton-shimmer" />
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-300 skeleton-shimmer" />
        </div>

        {/* Tab/Action Skeleton */}
        <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="h-8 sm:h-9 w-24 sm:w-28 bg-gray-300 skeleton-shimmer" />
        </div>

        {/* Horizontal Scroll Skeleton */}
        <div className="w-full overflow-hidden -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3">
            {skeletons.map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 shadow-sm flex-shrink-0
                           w-[155px] sm:w-[220px] md:w-[250px] lg:w-[280px]
                           flex flex-col"
              >
                {/* Image Placeholder */}
                <div className="bg-gray-200 h-32 sm:h-36 md:h-40 w-full skeleton-shimmer" />

                {/* Info Placeholder */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  {/* Title */}
                  <div className="h-4 sm:h-5 bg-gray-200 w-3/4 mb-3 skeleton-shimmer" />
                  
                  {/* Description */}
                  <div className="h-3 bg-gray-200 w-full mb-1.5 skeleton-shimmer" />
                  <div className="h-3 bg-gray-200 w-5/6 mb-4 sm:mb-6 skeleton-shimmer" />

                  {/* Price */}
                  <div className="h-5 sm:h-6 bg-gray-200 w-1/3 mb-4 mt-auto skeleton-shimmer" />

                  {/* Button */}
                  <div className="h-8 sm:h-10 bg-gray-300 w-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
