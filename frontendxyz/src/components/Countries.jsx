import React, { useState, useEffect } from "react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [rowsToShow, setRowsToShow] = useState(10);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        // Fetch all companies
        const res = await fetch("http://localhost:5001/api/companies");
        const companiesData = await res.json();

        // Fetch metrics for each company
        const companiesWithMetrics = await Promise.all(
          companiesData.map(async (company) => {
            const metricsRes = await fetch(
              `http://localhost:5001/api/company/${company.company_id}/metrics`
            );
            const metrics = await metricsRes.json();

            // Only keep the three ratios we care about
            const ratios = {
              ROE: metrics.find((m) => m.name === "ROE")?.value || "-",
              DebtEquity: metrics.find((m) => m.name === "Debt/Equity")?.value || "-",
              CurrentRatio: metrics.find((m) => m.name === "Current Ratio")?.value || "-",
            };

            return { ...company, ...ratios };
          })
        );

        setCompanies(companiesWithMetrics);
      } catch (err) {
        console.error("Error fetching companies or metrics:", err);
      }
    };

    loadCompanies();
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen p-8 relative">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Company Financial Ratios
      </h1>

      <div className="flex justify-center">
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-6 w-full max-w-6xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">Company Name</th>
                <th className="p-3">ROE</th>
                <th className="p-3">Debt/Equity</th>
                <th className="p-3">Current Ratio</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, rowsToShow).map((company) => (
                <tr key={company.company_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{company.name}</td>
                  <td className="p-3">{company.ROE}</td>
                  <td className="p-3">{company.DebtEquity}</td>
                  <td className="p-3">{company.CurrentRatio}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Rows selector */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white p-2 rounded shadow">
            <span>Show rows:</span>
            <select
              className="border rounded p-1"
              value={rowsToShow}
              onChange={(e) => setRowsToShow(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
