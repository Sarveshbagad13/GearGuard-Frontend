import React from 'react';
import { Target, Activity, Link2, TrendingDown, Smartphone, Database } from 'lucide-react';

const Modules = () => {
  const modules = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Complete Asset Registry',
      description: 'Centralized database for all equipment—machines, vehicles, computers, and tools. Track serial numbers, locations, specifications, purchase dates, and warranty information in one place.'
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Smart Request Handling',
      description: 'Submit, route, and track maintenance requests from creation to completion. Set priorities, assign deadlines, and monitor progress with real-time status updates.'
    },
    {
      icon: <Link2 className="w-6 h-6" />,
      title: 'Intelligent Team Dispatch',
      description: 'Assign work orders based on technician skills, availability, and workload. Track team performance, certifications, and ensure the right person handles each job.'
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: 'Automated Maintenance Scheduling',
      description: 'Schedule preventive maintenance based on time intervals, usage hours, or equipment condition. Reduce breakdowns and extend asset lifespan with proactive servicing.'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'End-to-End Work Orders',
      description: 'Track every repair from request submission to job completion. Log parts used, time spent, and resolution details for complete maintenance history.'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Maintenance Cost Control',
      description: 'Track labor costs, parts expenses, and total cost of ownership. Set budgets, monitor spending, and identify cost-saving opportunities.'
    }
  ];

  return (
    <section id="modules" className="relative py-1 px-6 bg-linear-to-b from-transparent to-primary-darker/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            SYSTEM <span className="text-gray-500">MODULES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl">
            From asset tracking to team coordination everything in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <div
              key={idx}
              className="group p-6 border border-cyan-900/20 bg-primary-dark/50 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-primary-darker transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 mb-4 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500 transition-all">
                {module.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                {module.title}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                {module.description}
              </p>

              <div className="mt-4 h-px bg-linear-to-r from-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modules;
