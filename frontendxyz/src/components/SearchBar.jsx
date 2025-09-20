import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(storedHistory);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      fetch(`http://localhost:5001/api/search-suggestions?q=${searchTerm}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch((err) => console.error(err));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearch = (e, term) => {
    e.preventDefault();
    const searchTermToUse = term || searchTerm;
    if (searchTermToUse.trim() === "") return;

    const newHistory = [searchTermToUse, ...history.filter((item) => item !== searchTermToUse)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    const currentCompany = decodeURIComponent(location.pathname.split("/").pop());
    if (currentCompany === searchTermToUse) {
      window.location.reload();
    } else {
      navigate(`/company/${encodeURIComponent(searchTermToUse)}`);
    }

    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch({ preventDefault: () => {} }, suggestion.name);
  };

  const handleHistoryClick = (search) => {
    handleSearch({ preventDefault: () => {} }, search);
  };

  const dropdownItems = searchTerm.length === 0 && history.length > 0
    ? history
    : suggestions;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelected((prev) => (prev < dropdownItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setSelected((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selected !== -1) {
        if (searchTerm.length === 0 && history.length > 0) {
          handleHistoryClick(dropdownItems[selected]);
        } else {
          handleSuggestionClick(dropdownItems[selected]);
        }
      } else {
        handleSearch(e);
      }
    }
  };

  return (
    <div className="relative w-80">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
          onKeyDown={handleKeyDown}
          placeholder="Company name, ticker..."
          className="w-full pl-4 pr-10 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <i className="fas fa-search text-gray-500"></i>
        </button>
      </form>
      {showDropdown && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-xl border border-gray-200">
          {searchTerm.length === 0 && history.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
              <ul>
                {history.map((search, index) => (
                  <li
                    key={search}
                    onMouseDown={() => handleHistoryClick(search)}
                    className={`px-4 py-2 cursor-pointer text-sm ${selected === index ? "bg-blue-100" : "hover:bg-gray-100"}`}
                  >
                    {search}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</h3>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.symbol}
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-2 cursor-pointer text-sm ${selected === index ? "bg-blue-100" : "hover:bg-gray-100"}`}
                  >
                    {suggestion.name} ({suggestion.symbol})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
