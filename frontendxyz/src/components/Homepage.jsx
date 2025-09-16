import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import chartImg from "../assets/chart.png";
import { authFetch } from "../utils/authFetch";

const Homepage = ({ setShowSignUp }) => {
  // --- Fallback company data ---
  const defaultCompanies = [
    { rank: 1, name: "Apple", cap: "₹285,216 T", price: "₹18,986", country: "USA", icon: "fab fa-apple" },
    { rank: 2, name: "Microsoft", cap: "₹248,464 T", price: "₹23,423", country: "USA", icon: "fab fa-microsoft" },
    { rank: 3, name: "Amazon", cap: "₹182,683 T", price: "₹12,238", country: "USA", icon: "fab fa-amazon" },
    { rank: 4, name: "Google", cap: "₹173,427 T", price: "₹14,345", country: "USA", icon: "fab fa-google" },
    { rank: 5, name: "Meta", cap: "₹132,674 T", price: "₹25,365", country: "USA", icon: "fab fa-facebook" },
    { rank: 6, name: "Berkshire Hathaway", cap: "₹198,648 T", price: "₹4,659", country: "USA", icon: "fas fa-building" },
    { rank: 7, name: "JPMorgan Chase", cap: "₹344,758 T", price: "₹20,995", country: "USA", icon: "fas fa-university" },
    { rank: 8, name: "Exxon Mobil", cap: "₹270,680 T", price: "₹10,136", country: "USA", icon: "fas fa-gas-pump" },
    { rank: 9, name: "Toyota", cap: "₹234,768 T", price: "₹15,144", country: "Japan", icon: "fas fa-car" },
    { rank: 10, name: "Samsung", cap: "₹274,080 T", price: "₹8,378", country: "S. Korea", icon: "fas fa-mobile" },
  ];

  // --- State for companies ---
  const [companies, setCompanies] = useState(defaultCompanies);

  // --- Fetch real companies from backend ---
  useEffect(() => {
   fetch("http://localhost:5001/api/companies")
     .then((res) => res.json())
     
     .then((data) => {
       if (Array.isArray(data)) {
         setCompanies(data);
         
       } else {
         console.error("Expected array but got:", data);
         setCompanies([]);
       }
     })
     .catch((err) => {
       console.error(err);
       setCompanies([]);
     });
 }, []);
 

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <p className="mt-12 text-base md:text-lg text-center mb-12 leading-relaxed text-gray-700 max-w-4xl mx-auto px-6">
        Explore in-depth insights of the world’s top companies, powered by real financial
        and technical data. From market capitalization to earnings ratios, we bring you
        the numbers that matter most. Compare companies side by side and make informed
        decisions with clarity and confidence.
      </p>

      {/* Main Section */}
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-8 py-16">
        {/* Left Content */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Explore Company Insights & <br /> Make Smarter Investments
          </h1>
          <p className="text-lg text-gray-600">
            Explore market cap, revenue, earnings, ratios and more with beautifully
            structured visual reports. Compare companies and stay ahead in the stock
            market game.
          </p>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img src={chartImg} alt="Analytics Chart" className="w-[90%] md:w-[80%] max-w-lg object-contain" />
        </div>
      </section>

      {/* Companies Table */}
      <section className="py-12 px-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Explore Top Companies</h2>

        <div className="flex justify-center">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-6 w-full max-w-6xl">
             <table className="w-full bg-white shadow-xl rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-800 text-left">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Company</th>
               
                <th className="py-3 px-4">Share Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {companies.map((company) => (
                <tr key={company.id} className="border-b last:border-none hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-semibold">{company.id}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <i className={`${company.symbol} text-lg text-gray-600`}></i>
                    {company.name}
                  </td>
                 
                  <td className="py-3 px-4">{company.share_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
