import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { dashboardAPI, equipmentAPI } from '../services/api';
import { clearAllAuth, getStoredUser } from '../utils/auth';

const EquipmentAnalysisPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [equipmentAnalysis, setEquipmentAnalysis] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [equipmentAnalysisLoading, setEquipmentAnalysisLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      return;
    }

    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchEquipmentOptions = async () => {
      try {
        setPageLoading(true);
        setPageError('');
        const response = await equipmentAPI.getAll();
        if (response?.success && isMounted) {
          const items = Array.isArray(response.data) ? response.data : [];
          setEquipmentOptions(items);
          setSelectedEquipmentId((prevSelected) => {
            if (items.length === 0) return '';
            const hasPrevious = items.some((item) => String(item.id) === String(prevSelected));
            return hasPrevious ? String(prevSelected) : String(items[0].id);
          });
          if (items.length === 0) {
            setEquipmentAnalysis(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch equipment options:', error);
        if (isMounted) {
          setEquipmentOptions([]);
          setSelectedEquipmentId('');
          setEquipmentAnalysis(null);
          setPageError(error.message || 'Failed to load equipment list.');
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    fetchEquipmentOptions();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!selectedEquipmentId) {
      setEquipmentAnalysis(null);
      return undefined;
    }

    let isMounted = true;

    const fetchEquipmentAnalysis = async () => {
      try {
        setEquipmentAnalysisLoading(true);
        setAnalysisError('');
        const response = await dashboardAPI.getEquipmentAnalysis({ equipmentId: selectedEquipmentId });
        if (response?.success && isMounted) {
          setEquipmentAnalysis(response.data || null);
        }
      } catch (error) {
        console.error('Failed to fetch equipment analysis:', error);
        if (isMounted) {
          setEquipmentAnalysis(null);
          setAnalysisError(error.message || 'Failed to load analysis data.');
        }
      } finally {
        if (isMounted) {
          setEquipmentAnalysisLoading(false);
        }
      }
    };

    fetchEquipmentAnalysis();

    return () => {
      isMounted = false;
    };
  }, [selectedEquipmentId]);

  const handleLogout = () => {
    clearAllAuth();
    navigate('/');
  };

  const formatDuration = (hours) => {
    if (hours === null || hours === undefined || Number.isNaN(Number(hours))) {
      return 'N/A';
    }

    const totalHours = Number(hours);
    if (totalHours < 24) {
      return `${totalHours.toFixed(1)} hrs`;
    }

    return `${(totalHours / 24).toFixed(1)} days`;
  };

  const formatDays = (days) => {
    if (days === null || days === undefined || Number.isNaN(Number(days))) {
      return 'N/A';
    }

    return `${Number(days).toFixed(1)} days`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark relative">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <header className="relative bg-primary-darker border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">Equipment Analysis</h1>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Repair Timing Overview</h2>
              <p className="text-sm text-gray-400">Review repair duration and average time between repairs for each equipment.</p>
            </div>

            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="gearguard-dark-select bg-primary-darkest border border-cyan-500/20 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400 min-w-0 md:min-w-80"
            >
              <option value="">Select equipment</option>
              {equipmentOptions.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.serialNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {pageLoading || equipmentAnalysisLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
          </div>
        ) : pageError ? (
          <div className="bg-primary-darker border border-red-500/30 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
            <p className="text-sm text-red-300">{pageError}</p>
          </div>
        ) : analysisError ? (
          <div className="bg-primary-darker border border-red-500/30 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
            <p className="text-sm text-red-300">{analysisError}</p>
          </div>
        ) : equipmentAnalysis?.equipment ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Repair Count</p>
                <p className="text-2xl font-bold text-cyan-400">{equipmentAnalysis.summary?.repairCount ?? 0}</p>
              </div>
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Avg Repair Time</p>
                <p className="text-2xl font-bold text-green-400">{formatDuration(equipmentAnalysis.summary?.avgRepairDurationHours)}</p>
              </div>
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Avg Time Between Repairs</p>
                <p className="text-2xl font-bold text-yellow-400">{formatDays(equipmentAnalysis.summary?.avgDaysBetweenRepairs)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Equipment Details</p>
                <p className="text-gray-100 font-medium">{equipmentAnalysis.equipment.name}</p>
                <p className="text-sm text-gray-400">Serial: {equipmentAnalysis.equipment.serialNumber}</p>
                <p className="text-sm text-gray-400">Team: {equipmentAnalysis.equipment.maintenanceTeam?.name || 'Unassigned'}</p>
                <p className="text-sm text-gray-400">Location: {equipmentAnalysis.equipment.location}</p>
              </div>
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Repair Timing</p>
                <p className="text-sm text-gray-300">Total repair time: <span className="text-cyan-300 font-medium">{formatDuration(equipmentAnalysis.summary?.totalRepairDurationHours)}</span></p>
                <p className="text-sm text-gray-300">Days since last repair: <span className="text-cyan-300 font-medium">{formatDays(equipmentAnalysis.summary?.daysSinceLastRepair)}</span></p>
                <p className="text-sm text-gray-300">Last repaired on: <span className="text-cyan-300 font-medium">{equipmentAnalysis.summary?.lastCompletedDate ? new Date(equipmentAnalysis.summary.lastCompletedDate).toLocaleDateString() : 'N/A'}</span></p>
                <p className="text-sm text-gray-300">First repaired on: <span className="text-cyan-300 font-medium">{equipmentAnalysis.summary?.firstCompletedDate ? new Date(equipmentAnalysis.summary.firstCompletedDate).toLocaleDateString() : 'N/A'}</span></p>
              </div>
            </div>

            <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
              <p className="text-sm font-semibold text-gray-100 mb-3">Recent Repair History</p>
              {!Array.isArray(equipmentAnalysis.history) || equipmentAnalysis.history.length === 0 ? (
                <p className="text-sm text-gray-500">No completed repair history found for this equipment.</p>
              ) : (
                <div className="space-y-2">
                  {equipmentAnalysis.history.slice(-6).reverse().map((item) => (
                    <div key={item.requestId || item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-primary-darkest border border-cyan-500/10 rounded-lg p-3">
                      <div>
                        <p className="text-sm text-gray-100 font-medium">{item.requestNumber}</p>
                        <p className="text-xs text-gray-500">Completed {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : 'N/A'} by {item.technicianName}</p>
                      </div>
                      <div className="text-sm text-gray-300">
                        Repair duration: <span className="text-cyan-300 font-medium">{formatDuration(item.repairDurationHours)}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Rating: <span className="text-green-300 font-medium">{item.rating ?? 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
            <p className="text-sm text-gray-500">Choose equipment to see repair timing analysis.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EquipmentAnalysisPage;
