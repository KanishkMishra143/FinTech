import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import howtouse from "../assets/howtouse.mp4";

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
            <li>Explore Company Rankings: On the homepage and the "Ranking by companies" page, you can view a ranked list of top companies. You can sort the table by different metrics to see how companies stack up against each other.</li>
            <li>Dive into Financial Ratios: The "companies Financial ratios" page provides a detailed breakdown of key financial ratios for each company. This can help you get a deeper understanding of a company's financial health.</li>
            <li>View Company Details: Click on any company name in the tables to view a detailed page with more information about that company, including its financial metrics and historical data.</li>
            <li>Search for Companies: Use the search bar in the header to quickly find a specific company you're interested in.</li>
            <li>Provide Feedback: We'd love to hear your feedback! You can use the "UptoSkills.Support" link in the footer to send us your comments and suggestions.</li>
          </ul>

          <h3 className="text-lg font-semibold uppercase mb-4">
            Video to guide you how to use website?
          </h3>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">(Video Of HOW TO USE WEBSITE?)</p>

            {/* dashed upload box */}
            <div className="w-full max-w-2xl h-72 mx-auto mt-5 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <video src={howtouse} controls className="w-full h-full"></video>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default HowToUse;
