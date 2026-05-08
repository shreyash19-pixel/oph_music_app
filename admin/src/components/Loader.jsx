// ProfileLoader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen bg-[#f3f3f3] p-6 animate-pulse">
      {/* Personal Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="h-8 w-64 bg-[#0d4450] rounded mb-8 opacity-20"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-300 rounded mb-3"></div>

              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-4 bg-gray-100">
                <div className="h-4 w-40 bg-gray-300 rounded"></div>

                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-green-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Photo */}
        <div className="mt-8">
          <div className="h-4 w-32 bg-gray-300 rounded mb-3"></div>

          <div className="flex items-start gap-6">
            <div className="w-40 h-40 rounded-lg bg-gray-300"></div>

            <div className="w-8 h-8 rounded-full bg-green-100 mt-2"></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-8">
          <div className="h-12 w-44 rounded-lg bg-green-300"></div>

          <div className="h-12 w-52 rounded-lg bg-[#0d4450] opacity-20"></div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
        <div className="h-8 w-72 bg-[#0d4450] rounded mb-8 opacity-20"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-300 rounded mb-3"></div>

              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-4 bg-gray-100">
                <div className="h-4 w-48 bg-gray-300 rounded"></div>

                <div className="w-8 h-8 rounded-full bg-green-100"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Media Section */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div>
            <div className="h-4 w-20 bg-gray-300 rounded mb-3"></div>

            <div className="w-full h-52 rounded-lg bg-gray-300"></div>
          </div>

          <div>
            <div className="h-4 w-20 bg-gray-300 rounded mb-3"></div>

            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-24 rounded-lg bg-gray-300"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;