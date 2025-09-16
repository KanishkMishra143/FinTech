import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function HowToUse() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#FFA366] to-[#C3F0DB]">

      {/* Main */}
      <main className="flex-1 px-6 md:px-16 py-12">
        {/* White card to contain content while page bg stays gradient */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-6">
            How to use the website ?
          </h2>

          <ul className="mb-10 space-y-3 list-disc list-inside text-gray-700">
            <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</li>
            <li>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</li>
            <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</li>
            <li>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</li>
            <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</li>
            <li>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</li>
          </ul>

          <h3 className="text-lg font-semibold uppercase mb-4">
            Video to guide you how to use website?
          </h3>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">(Video Of HOW TO USE WEBSITE?)</p>

            {/* dashed upload box */}
            <div className="w-full max-w-2xl h-72 mx-auto mt-5 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="mb-3 text-gray-600">Click here to upload a video</p>
              <div className="text-3xl">🎥</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default HowToUse;
