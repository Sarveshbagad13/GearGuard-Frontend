import React from 'react';

const Footer = () => {
  return (
    <footer className="relative border-t border-cyan-900/20 bg-primary-dark py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center text-primary-dark font-bold text-sm">
              G
            </div>
            <span className="text-xl font-bold">
              GEAR<span className="text-cyan-500">-GUARD</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Advanced asset management infrastructure for the modern enterprise. 
            Built for scale, security, and speed.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Features</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Integrations</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Security</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Roadmap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">About</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Careers</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms</a></li>
            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Security</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-cyan-900/20 text-center text-gray-500 text-xs">
        © 2026 Gear-Guard Systems, Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
