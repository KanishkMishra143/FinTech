import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import logo from "../assets/logo.png";
import SearchBar from "./SearchBar";

const CHeader = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md">
      {/* Logo - clickable */}
      <div className="text-2xl font-bold">
        <Link to="/home">
          <img
            src={logo}
            alt="UptoSkills Logo"
            className="w-32 mb-2 cursor-pointer"
          />
        </Link>
      </div>

      {/* Nav links + Search */}
      <div className="flex items-center gap-6 font-medium flex-1 justify-center">
        <ul className="flex gap-6">
          <li className="cursor-pointer hover:text-blue-500">
            <Link to="/companies">Ranking by Companies</Link>
          </li>

          <li className="cursor-pointer hover:text-blue-500">
            <Link to="/financial-ratios">Company's financial ratios</Link>
          </li>

          <li className="cursor-pointer hover:text-blue-500">
            <Link to="/how-to-use">How to Use</Link>
          </li>
        </ul>
      </div>

      {/* SearchBar on far right */}
      <div className="flex items-center ml-8">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default CHeader;