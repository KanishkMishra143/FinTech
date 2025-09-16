import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  // Fallback local state if no valid setter is provided
  const [localValue, setLocalValue] = React.useState(searchTerm ?? "");
  const externallyControlled = typeof setSearchTerm === "function";

  // Keep local in sync if parent updates `searchTerm`
  React.useEffect(() => {
    if (searchTerm !== undefined) setLocalValue(searchTerm);
  }, [searchTerm]);

  const handleChange = (e) => {
    const v = e.target.value;
    if (externallyControlled) setSearchTerm(v);
    else setLocalValue(v);
  };

  return (
    <div className="mt-6 flex gap-2">
      <input
        type="text"
        placeholder="Company name, ticker..."
        value={externallyControlled ? (searchTerm ?? "") : localValue}
        onChange={handleChange}
        className="w-80 max-w-md px-4 py-2 rounded border border-gray-300 text-sm"
      />
      <form action="" method="get">
        <button
          className="bg-red-500 text-white font-medium text-sm rounded-lg px-5 py-2.5 me-2 mb-2 border-none cursor-pointer transition-colors duration-200 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          type="button"
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
