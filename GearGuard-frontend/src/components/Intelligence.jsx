import React from 'react';

const Intelligence = () => {
  // Maintenance Statistics
  const thisMonth = 127;    // Current month completed requests
  const lastMonth = 98;     // Previous month completed requests
  const avgMonthly = 112;   // 6-month average

  // Calculate growth percentage
  const growthPercentage = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
  const isGrowing = growthPercentage > 0;

  const features = [
    'Real-time equipment health monitoring and predictive alerts',
    'Automated work order prioritization based on criticality',
    'Maintenance cost tracking and budget optimization',
  ];
  const chartHeights = [
    28, 35, 42, 38, 44, 51, 48, 55, 61, 57,
    63, 70, 66, 74, 79, 72, 68, 76, 83, 88,
    81, 77, 84, 90, 86, 78, 73, 80, 87, 92,
  ];

  return (
    <section className="relative pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Dashboard Preview */}
        <div className="relative order-2 lg:order-1">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-transparent blur-2xl" />
          
          <div className="relative bg-linear-to-br from-[#0f1729] to-[#0a0e1a] border border-cyan-500/20 p-8 rounded-lg">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs text-cyan-400 uppercase tracking-wider">
                Maintenance_Requests_30d
              </div>
              {/* Growth Indicator */}
              <div className={`text-xs px-2 py-1 rounded ${isGrowing ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isGrowing ? '↑' : '↓'} {Math.abs(growthPercentage)}%
              </div>
            </div>
            
            {/* Bar chart */}
            <div className="mb-6 h-48 flex items-end gap-1">
              {chartHeights.map((height, idx) => (
                <div 
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 opacity-70 hover:opacity-100 transition-opacity"
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${idx * 20}ms`
                  }}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-900/20">
              <div>
                <div className="text-xs text-gray-500 uppercase">This Month</div>
                <div className="text-lg font-bold text-white">{thisMonth}</div>
                <div className={`text-xs mt-1 ${isGrowing ? 'text-green-400' : 'text-red-400'}`}>
                  {isGrowing ? '+' : ''}{growthPercentage}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Last Month</div>
                <div className="text-lg font-bold text-white">{lastMonth}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Previous
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">6-Mo Avg</div>
                <div className="text-lg font-bold text-white">{avgMonthly}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Baseline
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            DATA-DRIVEN
            <br />
            <span className="text-gray-500">MAINTENANCE</span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Transform maintenance data into actionable insights. Our analytics engine tracks equipment 
            health, predicts failures, and optimizes schedules—helping you reduce downtime and cut costs.
          </p>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 group"
              >
                <div className="w-5 h-5 mt-0.5 border border-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500 transition-colors">
                  <div className="w-2 h-2 bg-cyan-400 group-hover:bg-[#0a0e1a]" />
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
