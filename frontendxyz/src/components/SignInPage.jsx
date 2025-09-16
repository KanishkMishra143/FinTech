import React, { useState } from "react";
import logo from "../assets/logo.png";

const SignInPage = ({ setShowSignUp }) => {
  // --- Sign In state ---
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  // --- Recover Password state ---
  const [showRecover, setShowRecover] = useState(false);
  const [recoverIdentifier, setRecoverIdentifier] = useState("");
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = verify email/phone, 2 = reset password

  // --- Handle input changes ---
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // --- Sign In submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/home"; // redirect after login
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // --- Recover Password submit ---
  const handleRecoverSubmit = async () => {
    if (step === 1) {
      try {
        const response = await fetch("http://localhost:5001/api/auth/verify-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: recoverIdentifier }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserId(data.userId); // backend must return userId
          setStep(2);
        } else {
          alert(data.message || "User not found");
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    } else {
      try {
        const response = await fetch("http://localhost:5001/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Password reset successful!");
          setShowRecover(false);
          setStep(1);
          setNewPassword("");
          setRecoverIdentifier("");
        } else {
          alert(data.message || "Error resetting password");
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    }
  };

  return (
    <div className="w-full max-w-5xl min-h-[60vh] mx-auto flex flex-col items-center justify-center bg-white text-black font-sans">
      <img src={logo} alt="UptoSkills Logo" className="w-40 mb-4" />
      <h2 className="text-2xl font-bold mb-4">Sign In to UpToSkills</h2>

      {/* --- Sign In Form --- */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Email or Phone</label>
          <input
            type="text"
            name="identifier"
            value={credentials.identifier}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md shadow"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md shadow"
            required
          />
        </div>

        <div className="text-right text-sm">
          <button
            type="button"
            onClick={() => setShowRecover(true)}
            className="text-blue-400 italic"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-full font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <button onClick={() => setShowSignUp(true)} className="text-blue-600 font-semibold">
            Sign Up
          </button>
        </p>
      </form>

      {/* --- Recover Password Modal --- */}
      {showRecover && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center relative">
            <button
              onClick={() => {
                setShowRecover(false);
                setStep(1);
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <img src={logo} alt="UptoSkills Logo" className="w-32 mb-2 mx-auto" />
            <h2 className="text-xl font-semibold mb-4">Recover Your Account</h2>

            {/* Step 1: Email/Phone */}
            {step === 1 && (
              <>
                <label className="block mb-2 text-sm font-medium text-left">
                  Enter Your Email or Phone
                </label>
                <input
                  type="text"
                  placeholder="Email or phone"
                  value={recoverIdentifier}
                  onChange={(e) => setRecoverIdentifier(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring focus:ring-blue-300 outline-none"
                />
              </>
            )}

            {/* Step 2: New Password */}
            {step === 2 && (
              <>
                <label className="block mb-2 text-sm font-medium text-left">
                  Enter Your New Password
                </label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring focus:ring-blue-300 outline-none"
                />
              </>
            )}

            <button
              onClick={handleRecoverSubmit}
              className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition"
            >
              {step === 1 ? "Next" : "Reset Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;
