import React from 'react';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); 
  return (
    <nav className="relative z-50 border-b border-cyan-900/20 bg-primary-dark/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/gearguard-logo.png"
            alt="GearGuard Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm">
          <a href="/equipment" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Equipment</a>
          <a href="/teams" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Team</a>
          <a href="/requests" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Request</a>
          <a href="/calendar" className="text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">Calendar</a>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-cyan-500 text-primary-dark font-semibold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-colors">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
