import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import logo from "../assets/logo.png"; // adjust path if needed

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    if (rating === 0) {
      alert("Please provide a rating!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback }),
      });

      if (response.ok) {
        alert("Thank you for your feedback!");
        setIsSubmitted(true);
        setRating(0);
        setFeedback("");
      } else {
        const errorData = await response.json();
        alert("Submission failed: " + errorData.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center border border-gray-300">
        {isSubmitted ? (
          <>
            <h2 className="text-2xl font-bold text-black">Thank You!</h2>
            <p className="text-sm text-gray-600 mt-2">
              Your feedback has been successfully submitted.
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
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
              id="feedback"
              name="feedback"
              className="w-full border border-gray-400 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
              placeholder="Submit your experience"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            ></textarea>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
                onClick={() => setIsSubmitted(true)}
              className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition mb-3 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {/* No Thanks button */}
            <button
              type="button"
              onClick={() => setIsSubmitted(true)}
              className="text-gray-600 hover:underline text-sm"
            >
              No, Thanks!
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
