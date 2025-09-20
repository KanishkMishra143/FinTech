import React, { useState } from "react";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import HowToUse from "./components/HowToUse";
import MarketCapTable from "./components/MarketCapTable";
import CompaniesPage from "./components/CompaniesPage";
import CompanyFinancialRatios from "./components/CompanyFinancialRatios";
import UnlockAccess from "./components/UnlockAccess";
import SignUpPage from "./components/SignUpPage";
import SignInPage from "./components/SignInPage";

import CHeader from "./components/CHeader";
import CFooter from "./components/CFooter";
import ChatWidget from "./components/ChatWidget";

import ProtectedRoute from "./components/ProtectedRoute"; // new component

// ---- Layout wrapper for all pages after signup ----
function MainLayout({ children, setShowSignUp, setShowSignIn }) {
  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] p-6 min-h-screen">
      <CHeader setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />
      {children}
      <ChatWidget />
      <CFooter />
    </div>
  );
}

function App() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Routes>
        {/* Public Unlock Page */}
        <Route
          path="/"
          element={<UnlockAccess setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/home"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <LandingPage />
              </MainLayout>
            }
          />
          <Route
            path="/how-to-use"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <HowToUse />
              </MainLayout>
            }
          />
          <Route
            path="/company/:companyName"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <MarketCapTable />
              </MainLayout>
            }
          />
          <Route
            path="/companies"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <CompaniesPage />
              </MainLayout>
            }
          />
          <Route
            path="/financial-ratios"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <CompanyFinancialRatios />
              </MainLayout>
            }
          />
          <Route
            path="/marketcap"
            element={
              <MainLayout setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn}>
                <MarketCapTable />
              </MainLayout>
            }
          />
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
            <SignUpPage setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
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
            <SignInPage setShowSignUp={setShowSignUp} setShowSignIn={setShowSignIn} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
