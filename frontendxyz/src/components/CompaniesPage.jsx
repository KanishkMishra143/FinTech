import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

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
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen flex flex-col">
      <div className="min-h-screen flex flex-col items-center py-12">
        <h1 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">
          Top Companies by Market Capitalization
        </h1>

        <div className="overflow-x-auto w-11/12 md:w-4/5 lg:w-3/4">
          <table className="w-full bg-white shadow-xl rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-800 text-left">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Comp</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Market Cap</th>
                <th className="py-3 px-4">Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {companies.map((company) => (
                <tr key={company.id} className="border-b last:border-none hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-semibold">{company.id}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <i className={`${company.symbol} text-lg text-gray-600`}></i>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/company/${encodeURIComponent(company.name)}`)}
                    >
                      {company.name}
                    </button>
                  </td>
                  <td>{company.symbol}</td>
                  <td className="py-3 px-4">{company.market_cap}</td>
                  <td className="py-3 px-4">{company.share_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
