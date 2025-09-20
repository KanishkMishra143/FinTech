import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import LandingPage from "./components/LandingPage";
import HowToUse from "./components/HowToUse";
import MarketCapTable from "./components/MarketCapTable";
import CompaniesPage from "./components/CompaniesPage";
import CompanyFinancialRatios from "./components/CompanyFinancialRatios";
import UnlockAccess from "./components/UnlockAccess";
import SignUpPage from "./components/SignUpPage";
import SignInPage from "./components/SignInPage";
import GoogleSignUp from "./components/GoogleSignUp";

import CHeader from "./components/CHeader";
import CFooter from "./components/CFooter";
import ChatWidget from "./components/ChatWidget";

import ProtectedRoute from "./components/ProtectedRoute"; // new component

// ---- Layout wrapper for all pages after signup ----
function ProtectedLayout({ children, setShowSignUp, setShowSignIn }) {
  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] p-6 min-h-screen">
      <CHeader setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />
      <Outlet />
      <ChatWidget />
      <CFooter />
    </div>
  );
}

function PublicLayout() {
  return <Outlet />;
}

function App() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={<UnlockAccess setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/company/:companyName" element={<MarketCapTable />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/financial-ratios" element={<CompanyFinancialRatios />} />
            <Route path="/marketcap" element={<MarketCapTable />} />
          </Route>
        </Route>

        {/* Redirect unknown routes to UnlockAccess */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Global SignUp Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowSignUp(false)}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times;
            </button>
            <SignUpPage setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} setTempToken={setTempToken} />
          </div>
        </div>
      )}

      {/* Global SignIn Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times;
            </button>
            <SignInPage setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} setTempToken={setTempToken} />
          </div>
        </div>
      )}

      {/* Google SignUp Modal */}
      {tempToken && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setTempToken(null)}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times;
            </button>
            <GoogleSignUp tempToken={tempToken} setShowSignIn={setShowSignIn} />
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
