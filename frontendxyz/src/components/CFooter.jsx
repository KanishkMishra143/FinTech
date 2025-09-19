import React, { useState } from "react";
import logo from "../assets/logo.png";
import { FaStar } from "react-icons/fa";

const CFooter = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  // Feedback component content inside CFooter
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
        const response = await fetch("http://localhost:5001/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, feedback }),
        });

        if (response.ok) {
          alert("Thank you for your feedback!");
          setIsSubmitted(true);
        } else {
          const errorData = await response.json();
          alert("Submission failed: " + errorData.error);
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
        setShowFeedback(false); // Close modal on submission
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center border border-gray-300 relative">
          {isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-black">Thank You!</h2>
              <p className="text-sm text-gray-600 mt-2">
                Your feedback has been successfully submitted.
              </p>
              <button
                onClick={() => setShowFeedback(false)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-full font-semibold hover:bg-blue-600"
              >
                Close
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-lg font-bold"
                aria-label="Close feedback form"
              >
                &times;
              </button>

              <img src={logo} alt="UptoSkills Logo" className="w-28 mx-auto mb-4" />

              <h2 className="text-2xl font-bold text-black mb-1">We Value Your Opinion</h2>
              <p className="text-sm text-gray-600 mb-6">Share your experience in scaling</p>

              <div className="flex justify-center space-x-3 mb-6">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <FaStar
                      key={starValue}
                      size={32}
                      className={`cursor-pointer transition ${
                        starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHover(starValue)}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </div>

              <textarea
                className="w-full border border-gray-400 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="4"
                placeholder="Submit your experience"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition mb-3 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              <button
                type="button"
                onClick={() => setShowFeedback(false)}
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

  return (
    <>
      <footer className="mt-auto px-16 py-10">
        <div className="flex flex-wrap gap-10 justify-between">
          {/* Column 1 */}
          <div className="flex-1 min-w-[280px]">
            <h4 className="font-semibold mb-3">What is the market capitalization of a company?</h4>
            <p className="text-sm text-gray-800">
              The market capitalization sometimes referred as Marketcap, is the value of a publicly listed company. <br />
              In most cases it can be easily calculated by multiplying the share price with the amount of outstanding shares.
            </p>
            <p className="text-sm mt-4 text-gray-800">
              <strong>DISCLAIMER</strong>
              <br />
              UpToSkills is not associated in any way with __WebsiteName.com <br />
              Stock prices are delayed, the delay can range from a few minutes to several hours.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex-1 min-w-[280px]">
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-sm">
              For inquiries or if you want to report a problem write to us at{" "}
              <button
                onClick={() => setShowFeedback(true)}
                className="text-blue-500 ml-1 underline"
                type="button"
              >
                UptoSkills.Support
              </button>
            </p>

            <h4 className="font-semibold mt-5 mb-2">Links</h4>
            <div className="space-y-1">
              <a href="#" className="text-gray-800 underline font-medium block">Privacy Policy</a>
              <a href="#" className="text-gray-800 underline font-medium block">Terms & Conditions</a>
            </div>

            <div className="space-y-1">
              <a href="#" className="hover:text-blue-500 text-3xl"><i className="fab fa-facebook"></i></a>
              <a href="#" className="hover:text-blue-500 text-3xl"><i className="fab fa-x-twitter"></i></a>
              <a href="#" className="hover:text-blue-500 text-3xl"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-blue-500 text-3xl"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-6 pt-3 flex justify-center">
          <img src={logo} alt="UptoSkills Logo" className="w-40 mb-4" />
        </div>
      </footer>

      {/* Render Feedback modal when toggled */}
      {showFeedback && <Feedback />}
    </>
  );
};

export default CFooter;
