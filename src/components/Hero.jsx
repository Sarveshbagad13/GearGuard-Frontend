import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const Hero = () => {
  const [activeMetric, setActiveMetric] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'UPTIME', value: '99.9%' },
    { label: 'ASSETS', value: '50k+' },
    { label: 'LATENCY', value: '0.02s' }
  ];

  const COLORS = [
    "url(#blueGradient)",   // Correct
    "url(#cyanGradient)",   // Repaired
    "url(#redGradient)",    // Scrapped
  ];
  const data = [
    { name: "Correct Equipment", value: 65 },
    { name: "Disposed / Repaired", value: 25 },
    { name: "Scrapped", value: 10 },
  ];

  const renderStaticLabels = () => {
  // 1. Define custom offsets/styles for each segment by name
  const customStyles = {
    "Correct Equipment": { xOffset: -170, yOffset: 50, color: "#ffffff" },
    "Disposed / Repaired": { xOffset: 200, yOffset: 220, color: "#f0f0f0" },
    "Scrapped": { xOffset: 300, yOffset: 40, color: "#ffffff" }
  };

  const outerRadius = 110; 
  const centerX = 200;
  const centerY = 50;

  return data.map((entry, index) => {
    const RADIAN = Math.PI / 180;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (data[i].value / total) * 360;
    }
    
    const angle = startAngle + ((entry.value / total) * 360) / 2;
    const midAngle = angle - 90;
    
    // 2. Get the specific settings for this entry (or use defaults)
    const settings = customStyles[entry.name] || { xOffset: 0, yOffset: -20, color: "#ffffff" };

    // 3. Apply individual offsets to the X and Y coordinates
    const x = centerX + outerRadius * Math.cos(-midAngle * RADIAN) + settings.xOffset;
    const y = centerY + outerRadius * Math.sin(-midAngle * RADIAN) + settings.yOffset;

    const text = `${entry.name} : ${entry.value}`;
    const boxWidth = text.length * 8 + 20;
    const boxHeight = 40;

    return (
        <g key={`label-${index}`}>
          <rect
            x={x - boxWidth / 2}
            y={y - boxHeight}
            width={boxWidth}
            height={boxHeight}
            fill={settings.color} // Individual color
            rx="8"
            ry="8"
            style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))' }}
          />
          <text
            x={x}
            y={y - boxHeight / 2}
            fill="#000000"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="bold"
          >
            {text}
          </text>
        </g>
      );
    });
  };

  return (
    <section className="relative pt-2 pb-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold leading-none">
            TRACK. FIX. PREVENT. REPEAT.
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
            Track every asset. Manage every maintenance request. Coordinate 
            every team. One platform that connects equipment, technicians, 
            and work orders so nothing breaks without you knowing.
          </p>

          {/*<div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase border border-cyan-500/50 tracking-wider hover:bg-cyan-400 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2">
              GET STARTED
            </button>
            <button className="px-8 py-3 border border-cyan-500/50 text-cyan-400 font-semibold uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              SEE HOW IT WORKS
            </button>
          </div> */}

          {/* Metrics */}
          <div className="flex gap-12 pt-6 border-t border-cyan-900/20">
            {metrics.map((metric, idx) => (
              <div 
                key={idx}
                className={`transition-all duration-500 ${
                  activeMetric === idx ? 'opacity-100 scale-105' : 'opacity-60 scale-100'
                }`}
              >
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-cyan-400 uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Dashboard Mockup */}
        <div className="relative animate-fadeInRight">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
          
          <div className="relative bg-linear-to-br from-primary-darker to-primary-darkest rounded-lg border h-[550px] border-cyan-500/20 p-6 shadow-2xl flex flex-col items-center space-y-8">
            
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* TOTAL REQUESTS */}
                  <div className="border border-cyan-500/20 rounded-lg p-4 bg-black/20">
                    <p className="text-xs uppercase tracking-wider text-cyan-400">
                      Total Requests
                    </p>

                    <p className="text-3xl font-bold text-white mt-2">120</p>

                    <div className="mt-3 space-y-1 text-sm text-cyan-100/80">
                      <p>New: <span className="text-white">30</span></p>
                      <p>In Progress: <span className="text-white">50</span></p>
                      <p>Repaired: <span className="text-white">40</span></p>
                    </div>
                  </div>

                  {/* DISPOSED / REPAIRED */}
                  <div className="border border-blue-500/20 rounded-lg p-4 bg-black/20">
                    <p className="text-xs uppercase tracking-wider text-blue-400">
                      Disposed / Repaired
                    </p>

                    <p className="text-3xl font-bold text-white mt-2">40</p>

                    <div className="mt-3 space-y-1 text-sm text-blue-100/80">
                      <p>Preventive: <span className="text-white">18</span></p>
                      <p>Corrective: <span className="text-white">22</span></p>
                    </div>
                  </div>

                  {/* SCRAPPED */}
                  <div className="border border-red-500/20 rounded-lg p-4 bg-black/20">
                    <p className="text-xs uppercase tracking-wider text-red-400">
                      Scrapped Equipment
                    </p>

                    <p className="text-3xl font-bold text-white mt-2">10</p>

                    <div className="mt-3 space-y-1 text-sm text-red-100/80">
                      <p>Expired Warranty: <span className="text-white">6</span></p>
                      <p>Beyond Repair: <span className="text-white">4</span></p>
                    </div>
                  </div>

                </div>
              <div className="flex justify-center items-center">
            <PieChart width={600} height={350}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00c6ff" />
                  <stop offset="100%" stopColor="#0072ff" />
                </linearGradient>

                <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22e1ff" />
                  <stop offset="100%" stopColor="#1d8cf8" />
                </linearGradient>

                <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="100%" stopColor="#c0392b" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="35%"
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
                paddingAngle={2}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                label={false}  // NO LABELS ON PIE
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
                {/* Render labels separately - they won't animate */}
                {renderStaticLabels()}
                {/*  <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid rgba(0,180,255,0.3)",
                  borderRadius: "8px",
                  color: "#e5f6ff",
                }}
              /> */}
            </PieChart>
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default Hero;
