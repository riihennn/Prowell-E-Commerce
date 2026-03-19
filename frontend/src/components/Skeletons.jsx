import React from "react";
import "../index.css";

// ─── 1. Home Page — Horizontal scroll product section ──────────────────────────
export function ProductSectionSkeleton() {
  const skeletons = Array(5).fill(0);
  return (
    <div className="w-full bg-gray-50/50 py-6 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gray-300 inline-block skeleton-shimmer" />
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-300 skeleton-shimmer" />
        </div>
        {/* Tab */}
        <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="h-8 sm:h-9 w-24 sm:w-28 bg-gray-300 skeleton-shimmer" />
        </div>
        {/* Cards */}
        <div className="w-full overflow-hidden -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3">
            {skeletons.map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 shadow-sm flex-shrink-0
                           w-[155px] sm:w-[220px] md:w-[250px] lg:w-[280px] flex flex-col"
              >
                <div className="bg-gray-200 h-32 sm:h-36 md:h-40 w-full skeleton-shimmer" />
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="h-4 sm:h-5 bg-gray-200 w-3/4 mb-3 skeleton-shimmer" />
                  <div className="h-3 bg-gray-200 w-full mb-1.5 skeleton-shimmer" />
                  <div className="h-3 bg-gray-200 w-5/6 mb-4 sm:mb-6 skeleton-shimmer" />
                  <div className="h-5 sm:h-6 bg-gray-200 w-1/3 mb-4 mt-auto skeleton-shimmer" />
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

// ─── 2. All Products Page — Responsive grid cards ─────────────────────────────
export function AllProductsSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-white  border border-stone-100 overflow-hidden flex flex-col"
          >
            <div className="bg-gray-200 skeleton-shimmer" style={{ aspectRatio: "1 / 1" }} />
            <div className="p-4 flex flex-col flex-1 gap-2">
              <div className="h-4 bg-gray-200 skeleton-shimmer w-3/4 rounded" />
              <div className="h-3 bg-gray-200 skeleton-shimmer w-full rounded" />
              <div className="h-3 bg-gray-200 skeleton-shimmer w-5/6 rounded" />
              <div className="h-5 bg-gray-200 skeleton-shimmer w-1/3 rounded mt-2" />
              <div className="h-10 bg-gray-300 skeleton-shimmer w-full rounded-xl mt-auto" />
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── 3. Admin Products — Table row skeleton ────────────────────────────────────
export function AdminProductSkeleton() {
  return (
    <div className="divide-y divide-gray-50/80">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="skeleton-shimmer w-full sm:w-28 h-28  flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
              <div className="skeleton-shimmer h-6 w-3/4 rounded-lg" />
              <div className="skeleton-shimmer h-4 w-1/2 rounded-lg" />
            </div>
            <div className="hidden sm:flex flex-col items-end gap-4 w-48 flex-shrink-0 border-l border-gray-100 pl-6 self-stretch justify-center">
              <div className="skeleton-shimmer h-8 w-24 rounded-lg ml-auto" />
              <div className="flex gap-2 w-full justify-end">
                <div className="skeleton-shimmer h-9 w-20 rounded-xl" />
                <div className="skeleton-shimmer h-9 w-9 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 4. Admin Orders — Table row skeleton ─────────────────────────────────────
export function AdminOrderSkeleton() {
  return (
    <div className="divide-y divide-gray-50/80">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-6 md:p-8">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="skeleton-shimmer h-6 w-32 rounded-lg" />
                <div className="skeleton-shimmer h-6 w-24 rounded-full" />
                <div className="skeleton-shimmer h-5 w-36 rounded-lg ml-auto xl:ml-0" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="skeleton-shimmer h-8 w-36 rounded-xl" />
                <div className="skeleton-shimmer h-8 w-44 rounded-xl" />
                <div className="skeleton-shimmer h-8 w-24 rounded-xl" />
              </div>
              <div className="skeleton-shimmer h-9 w-40 rounded-lg" />
            </div>
            <div className="flex items-center gap-4 w-full xl:w-auto xl:border-l xl:border-gray-100 xl:pl-8">
              <div className="skeleton-shimmer h-12 flex-1 xl:w-48 xl:flex-none " />
              <div className="skeleton-shimmer h-12 w-12 " />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 5. Admin Customers — Table row skeleton ──────────────────────────────────
export function AdminCustomerSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i}>
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="skeleton-shimmer w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="skeleton-shimmer h-5 w-32 rounded-lg" />
            </div>
          </td>
          <td className="px-8 py-5">
            <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
          </td>
          <td className="px-8 py-5">
            <div className="skeleton-shimmer h-5 w-20 rounded-lg" />
          </td>
          <td className="px-8 py-5">
            <div className="skeleton-shimmer h-7 w-20 rounded-full" />
          </td>
          <td className="px-8 py-5">
            <div className="flex justify-end gap-3">
              <div className="skeleton-shimmer h-9 w-20 rounded-xl" />
              <div className="skeleton-shimmer h-9 w-9 rounded-xl" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
