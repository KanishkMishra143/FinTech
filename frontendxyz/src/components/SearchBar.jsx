
import React from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = React.useState("");

    const handleSearch = () => {
      if (!companyName.trim()) return;
      navigate(`/company/${encodeURIComponent(companyName.trim())}`);
    };

  return (
    <div className="flex gap-2">
     <input
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch(); // ✅ trigger on Enter
        }}
        placeholder="Company name, ticker..."
        className="px-3 py-2 border rounded"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
