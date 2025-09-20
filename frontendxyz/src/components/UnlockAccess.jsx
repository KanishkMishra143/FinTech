import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import CFooter from "./CFooter";

const UnlockAccess = ({ setShowSignUp, setShowSignIn }) => {
  const [showVideo, setShowVideo] = useState(false);

  const videoContent = (
    <div>
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-12">
        <img src={logo} alt="UptoSkills Logo" className="w-40 mb-6" />

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Unlock to Access Global Company Rankings
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Discover the market leaders by capitalization worldwide.
          Stay updated with rankings, insights, and updates.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowSignUp(true)}
            className="px-6 py-3 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign Up
          </button>
          <button
            onClick={() => setShowSignIn(true)}
            className="px-6 py-3 rounded-full font-bold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>

        <section className="mt-12 bg-white p-8 rounded-lg shadow-md max-w-3xl text-left">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Offer</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>📊 Global company ranking by market capitalization</li>
            <li>🌍 Country-specific ranking tables</li>
            <li>📈 Insights into company performance and growth</li>
            <li>💡 Easy-to-use dashboards and filtering tools</li>
            <li>🔔 Regular updates and trends</li>
          </ul>
          <div className="text-center mt-6 flex gap-4 justify-center">
            <button
              onClick={() => setShowSignUp(true)}
              className="px-6 py-3 rounded-full shadow font-semibold transition-colors duration-300 bg-orange-500 hover:bg-orange-600 text-white"
            >
              🔒 Unlock these Perks after Signing Up!
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="px-6 py-3 rounded-full shadow font-semibold transition-colors duration-300 bg-gray-500 hover:bg-gray-600 text-white"
            >
              Watch How to Use Video
            </button>
          </div>
        </section>
      </main>

      <CFooter />
      {showVideo && <Modal title="How to Use FinTech" content={videoContent} onClose={() => setShowVideo(false)} />}
    </div>
  );
};

export default UnlockAccess;