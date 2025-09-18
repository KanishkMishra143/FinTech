import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// ✅ Register Chart.js components ONCE before using <Bar>
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarketCapTable = () => {
    let mounted = true;

  const { companyName } = useParams();
  const [activeTab, setActiveTab] = useState("Basic EPS (₹)");
  const [chartData, setChartData] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [companyRealName, setCompanyRealName] = useState("");

  const mainOptions = [
    "Basic EPS (₹)", "Diluted EPS (₹)", "Cash EPS (₹)", "Book Value/Share (₹)", "Dividend/Share (₹)"
  ];

  const allOtherRatios = [
    "Revenue from Operations/Share (₹)", "PBDIT/Share (₹)", "PBIT/Share (₹)", "PBT/Share (₹)", "Net Profit/Share (₹)",
    "Gross profit margin (%)", "Effective tax rate (%)", "Return on investment (%)", "Retention ratio (%)",
    "PBDIT Margin (%)", "PBIT Margin (%)", "PBT Margin (%)", "Net Profit Margin (%)", "Operating Profit Margin (%)",
    "EBIT Margin (%)", "EBITDA Margin (%)", "Total Debt/Equity (x)", "Current Ratio (x)", "Quick Ratio (x)", "Debt Ratio",
    "Long-term Debt/Equity (x)", "Short-term Debt/Equity (x)", "Net Debt/Equity (x)", "Interest Coverage Ratio (x)",
    "Shareholder Equity Ratio (%)", "Altman Z-Score", "Cash Ratio (x)", "Operating Leverage Ratio (x)", "Asset Turnover Ratio (%)",
    "Inventory Turnover Ratio", "Receivables Turnover Ratio", "Days Sales Outstanding (DSO) (in days)",
    "Days Payable Outstanding (DPO)  (in days)", "Days Inventory Outstanding (DIO)  (in days)",
    "Cash Conversion Cycle (CCC)  (in days)", "Fixed Asset Turnover Ratio (x)", "Working Capital Turnover Ratio (x)",
    "Revenue/Employee (₹)", "PE Ratio", "PS Ratio", "PB Ratio", "P/TBV Ratio", "P/FCF Ratio", "P/OCF Ratio",
    "tangible Book Value/Share (₹)", "Net Asset Value (NAV)/Share (₹)", "Capital Employed/Share (₹)",
    "Revenue Growth (%)", "Net Income Growth (%)", "EBIT Growth (%)", "EBITDA Growth (%)", "Dividend Payout Ratio (%)",
    "Dividend Yield (%)", "Return on Equity (ROE) (%)", "Return on Capital Employed (ROCE) (%)", "Return on Assets (ROA) (%)",
    "Operating Cash Flow/EBITDA", "Free Cash Flow/Net Income", "Capex/Sales (%)", "Depreciation/Fixed Assets (%)"
  ];

  useEffect(() => {
    if (!activeTab || !companyName) return;

   fetch(`http://localhost:5001/api/company/${encodeURIComponent(companyName)}/metric/${encodeURIComponent(activeTab)}`)
  .then(res => res.json())
  .then(data => {
    // Use "data" returned from backend
    setCompanyRealName(data.companyName); // ✅ correct reference

    const rows = data.values;             // ✅ rows array from backend
    // console.log(companyName, activeTab, rows); 

    if (!Array.isArray(rows) || rows.length === 0) {
      setChartData(null);
      return;
    }

    const labels = rows.map(r => r.fiscal_year);
    const values = rows.map(r => Number(r.value));

    setChartData({
      labels,
      datasets: [
        {
          label: activeTab,
          data: values,
          backgroundColor: "rgba(54,162,235,0.5)"
        },
      ],
    });
  })
  .catch(err => {
    console.error(err);
    setChartData(null);
  });

  }, [activeTab, companyName]);

  return (
    <div className="bg-gradient-to-r from-[#FFA366] to-[#C3F0DB] min-h-screen flex flex-col">
      <div className="flex-grow max-w-6xl mx-auto px-4 py-10">

        {/* Top 5 Tabs + More Dropdown */}
        <div className="bg-white shadow-lg rounded-xl p-4 mb-6 border">
          <h3 className="text-lg font-semibold mb-3">{companyRealName}</h3>
          <h3 className="text-lg font-semibold mb-3">📊 Rank by</h3>
          <div className="flex flex-wrap gap-2">

            {mainOptions.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="px-4 py-2 rounded-full text-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                ⋮ More
              </button>

              {showMore && (
                <div className="absolute mt-2 w-72 bg-white shadow-lg rounded-lg border max-h-60 overflow-y-auto z-10">
                  {allOtherRatios.map(option => (
                    <div
                      key={option}
                      onClick={() => {
                        setActiveTab(option);
                        setShowMore(false);
                      }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
          {!chartData ? (
            <p className="text-gray-600">Loading data...</p>
          ) : (
            <Bar data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketCapTable;
