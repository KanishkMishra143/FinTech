import React, { useState } from "react";
import logo from "../assets/logo.png"; // adjust path if needed
import { FaStar } from "react-icons/fa";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center border border-gray-300">
        {/* Logo */}
        <img src={logo} alt="UptoSkills Logo" className="w-28 mx-auto mb-4" />

        {/* Title */}
        <h2 className="text-2xl font-bold text-black mb-1">
          We Value Your Opinion
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Share your experience in scaling
        </p>

        {/* Stars */}
        <div className="flex justify-center space-x-3 mb-6">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <FaStar
                key={starValue}
                size={32}
                className={`cursor-pointer transition ${
                  starValue <= (hover || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          className="w-full border border-gray-400 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="4"
          placeholder="Submit your experience"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>

        {/* Submit button */}
        <button className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition mb-3">
          Submit
        </button>

        {/* No Thanks link */}
        <button className="text-gray-600 hover:underline text-sm">
          No, Thanks!
        </button>
      </div>
    </div>
  );
};

export default Feedback;
