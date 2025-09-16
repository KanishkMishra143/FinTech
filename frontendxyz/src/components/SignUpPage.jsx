import React, { useState } from "react";
import logo from "../assets/logo.png";

const SignUpPage = ({ setShowSignIn }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please log in.");
        setShowSignIn(true); // Show SignIn modal after signup
      } else {
        alert(data.message || "Sign up failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl min-h-[60vh] mx-auto flex flex-col items-center justify-center bg-white text-black font-sans">
      <img src={logo} alt="UptoSkills Logo" className="w-40 mb-4" />
      <h2 className="text-2xl font-bold mb-4">Sign Up to UpToSkills</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-full font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => alert("Google Sign-Up")}
          className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition"
        >
          <i className="fab fa-google text-white text-lg"></i> Sign Up with Google
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <button onClick={() => setShowSignIn(true)} className="text-blue-600 font-semibold">
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
