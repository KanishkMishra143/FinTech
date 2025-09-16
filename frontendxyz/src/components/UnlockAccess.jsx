import React, {useState} from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const UnlockAccess = ({ setShowSignUp, setShowSignIn }) => {
    const [unlocked, setUnlocked] = useState(false);

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

                {/* Dummy Homepage Content Preview */}
                <section className="mt-12 bg-white p-8 rounded-lg shadow-md max-w-3xl text-left">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Offer</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>📊 Global company ranking by market capitalization</li>
                        <li>🌍 Country-specific ranking tables</li>
                        <li>📈 Insights into company performance and growth</li>
                        <li>💡 Easy-to-use dashboards and filtering tools</li>
                        <li>🔔 Regular updates and trends</li>
                    </ul>
                    <div className="text-center mt-6">
                        <button
                            onClick={() => {
                                if (!unlocked) {
                                    setShowSignUp(true);
                                }
                            }}
                            className={`px-6 py-3 rounded-full shadow font-semibold transition-colors duration-300 ${unlocked
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
                        >
                            {unlocked ? "Unlocked!" : "🔒 Unlock these Perks after Signing Up!"}
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer (Only Column 1) */}
            <footer className="mt-auto px-16 py-10">
                <div className="flex flex-wrap gap-10 justify-between">
                    {/* Column 1 - Market Cap Explanation */}
                    <div className="flex-1 min-w-[280px]">
                        <h4 className="font-semibold mb-3">
                            What is the market capitalization of a company?
                        </h4>
                        <p className="text-sm text-gray-800">
                            The market capitalization, sometimes referred as Marketcap, is the
                            value of a publicly listed company. <br />
                            In most cases, it can be easily calculated by multiplying the share
                            price with the amount of outstanding shares.
                        </p>
                        <p className="text-sm mt-4 text-gray-800">
                            <strong>DISCLAIMER</strong>
                            <br />
                            UpToSkills is not associated in any way with __WebsiteName.com <br />
                            Stock prices are delayed, the delay can range from a few minutes
                            to several hours.
                        </p>
                    </div>
                </div>
                <div className="border-t border-gray-300 mt-6 pt-3 flex justify-center">
                    <img src={logo} alt="UptoSkills Logo" className="w-40 mb-4" />
                </div>
            </footer>
        </div>
    );
};

export default UnlockAccess;