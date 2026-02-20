import React from 'react';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); 
  return (
    <nav className="relative z-50 border-b border-cyan-900/20 bg-primary-dark/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center text-primary-dark font-bold text-sm">
            G
          </div>
          <span className="text-xl font-bold tracking-tight">
            GEAR<span className="text-cyan-500">-GUARD</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm">
          <a href="/equipment" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Equipment</a>
          <a href="/team" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Team</a>
          <a href="/request" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Request</a>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/login")} className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
            Login
          </button>
          <button className="px-6 py-2 bg-cyan-500 text-primary-dark font-semibold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
