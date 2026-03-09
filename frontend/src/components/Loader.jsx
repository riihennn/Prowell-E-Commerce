import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = true }) => {
  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen bg-white"
    : "flex items-center justify-center py-10";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[#ffbe00] animate-spin" />
        <span className="text-gray-500 font-medium tracking-wide">
          loading...
        </span>
      </div>
    </div>
  );
};

export default Loader;
