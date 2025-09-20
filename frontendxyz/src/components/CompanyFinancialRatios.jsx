import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [rowsToShow, setRowsToShow] = useState(20);
  const [customMode, setCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5001/api/companies-with-metrics");
        const companiesData = await res.json();
        setCompanies(companiesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching companies or metrics:", err);
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">
        Company Financial Ratios (2024)
      </h1>

      <div className="overflow-x-auto w-11/12 md:w-4/5 lg:w-3/4 bg-white shadow-xl rounded-lg p-4">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Basic EPS (₹)</th>
                <th className="py-3 px-4">Diluted EPS (₹)</th>
                <th className="py-3 px-4">Cash EPS (₹)</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, rowsToShow).map((company) => (
                <tr key={company.company_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <i className={`${company.symbol} text-lg text-gray-600`}></i>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/company/${encodeURIComponent(company.name)}`)}
                    >
                      {company.name}
                    </button>
                  </td>
                  <td className="py-3 px-4">{company.Basic_eps}</td>
                  <td className="py-3 px-4">{company.Diluted_EPS}</td>
                  <td className="py-3 px-4">{company.Cash_EPS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Rows selector */}
        <div className="flex items-center gap-2 mt-4">
          <span>Show rows:</span>

          <select
            className="border rounded p-1"
            value={customMode ? "custom" : rowsToShow}
            onChange={(e) => {
              if (e.target.value === "custom") {
                setCustomMode(true);
              } else {
                setRowsToShow(Number(e.target.value));
                setCustomMode(false);
              }
            }}
          >
            {[5, 10, 15, 20, 50, companies.length].map((n) => (
              <option key={n} value={n}>
                {n === companies.length ? "All" : n}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>

          {customMode && (
            <input
              type="number"
              min="1"
              max={companies.length}
              placeholder="Enter number"
              className="border rounded p-1 w-20"
              onChange={(e) => setRowsToShow(Number(e.target.value))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;
