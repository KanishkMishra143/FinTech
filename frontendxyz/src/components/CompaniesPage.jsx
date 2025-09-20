import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [rowsToShow, setRowsToShow] = useState(20);
  const [customMode, setCustomMode] = useState(false);
  const [year, setYear] = useState(""); // Selected year
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCompanies = (selectedYear) => {
    setLoading(true);
    const url = selectedYear
      ? `http://localhost:5001/api/companies1?year=${selectedYear}`
      : `http://localhost:5001/api/companies1`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanies(data);
        else setCompanies([]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setCompanies([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies(year);
  }, [year]);

  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen flex flex-col">
      <div className="min-h-screen flex flex-col items-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Top Companies
        </h1>

        {/* Year selector */}
        <div className="mb-4">
          <label className="text-white mr-2 font-semibold">Select Year:</label>
          <select
            className="border rounded p-1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>

        <div className="overflow-x-auto w-11/12 md:w-4/5 lg:w-3/4">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <table className="w-full bg-white shadow-xl rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-800 text-left">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Market Cap</th>
                  <th className="py-3 px-4">Price</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {companies.slice(0, rowsToShow).map((company) => (
                  <tr
                    key={company.name} // Use name as key
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-semibold">{company.rank}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <i className={`${company.symbol} text-lg text-gray-600`}></i>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() =>
                          navigate(`/company/${encodeURIComponent(company.name)}`)
                        }
                      >
                        {company.name}
                      </button>
                    </td>
                    <td>{company.symbol}</td>
                    <td className="py-3 px-4">{company.market_cap || "N/A"}</td>
                    <td className="py-3 px-4">{company.share_price || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center gap-2 mt-4">
            <span>Show rows:</span>
            <select
              className="border rounded p-1"
              value={customMode ? "custom" : rowsToShow}
              onChange={(e) => {
                if (e.target.value === "custom") setCustomMode(true);
                else {
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
    </div>
  );
};

export default CompaniesPage;
