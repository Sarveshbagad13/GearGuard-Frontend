import React from 'react';

const Intelligence = () => {
  const features = [
    'Automated procurement triggers based on inventory levels',
    'Ghost asset detection and reconciliation',
    'Compliance reporting for ISO 27001 & SOC 2'
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Dashboard Preview */}
        <div className="relative order-2 lg:order-1">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-transparent blur-2xl" />
          
          <div className="relative bg-linear-to-br from-primary-darker to-primary-dark border border-cyan-500/20 p-8 rounded-lg">
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-6">Demand_Stack_60d</div>
            
            {/* Bar chart */}
            <div className="mb-6 h-48 flex items-end gap-1">
              {Array.from({ length: 30 }).map((_, idx) => (
                <div 
                  key={idx}
                  className="flex-1 bg-linear-to-t from-cyan-500 to-blue-500 opacity-70 hover:opacity-100 transition-opacity"
                  style={{ 
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${idx * 20}ms`
                  }}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-900/20">
              <div>
                <div className="text-xs text-gray-500 uppercase">Peak</div>
                <div className="text-lg font-bold text-white">847</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Avg</div>
                <div className="text-lg font-bold text-white">623</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Low</div>
                <div className="text-lg font-bold text-white">401</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            INTELLIGENCE
            <br />
            <span className="text-gray-500">FROM CHAOS</span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Raw data is useless without context. Nexus aggregates millions of data points 
            into actionable insights, helping you optimize utilization and reduce capital waste.
          </p>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 group"
              >
                <div className="w-5 h-5 mt-0.5 border border-cyan-500 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 transition-colors">
                  <div className="w-2 h-2 bg-cyan-400 group-hover:bg-primary-dark" />
                </div>
                <p className="text-gray-300 group-hover:text-white transition-colors">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intelligence;
