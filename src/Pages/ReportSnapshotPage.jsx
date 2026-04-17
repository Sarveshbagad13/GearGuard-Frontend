import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, LogOut } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { clearAllAuth, getStoredUser, normalizeRole } from '../utils/auth';

const ReportSnapshotPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState('');
  const [exportingFormat, setExportingFormat] = useState('');
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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

    const fetchRoleReport = async ({ background = false } = {}) => {
      if (!background && isMounted) {
        setReportLoading(true);
      }

      try {
        setReportError('');
        const response = await dashboardAPI.getRoleReport().catch(() => null);
        if (response?.success && isMounted) {
          setReportData(response.data || null);
        } else if (isMounted) {
          setReportError('Unable to load report data right now.');
        }
      } catch (error) {
        if (isMounted) {
          setReportError(error.message || 'Unable to load report data right now.');
        }
      } finally {
        if (isMounted) {
          setReportLoading(false);
        }
      }
    };

    fetchRoleReport();

    const refreshTimer = setInterval(() => {
      fetchRoleReport({ background: true });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [user]);

  const userRole = normalizeRole(user?.role);

  const triggerReportExport = async (format) => {
    if (!['Admin', 'Manager'].includes(userRole)) {
      return;
    }

    const [yearValue, monthValue] = reportMonth.split('-');
    const month = Number(monthValue);
    const year = Number(yearValue);

    if (!month || !year) {
      alert('Please select a valid month for export.');
      return;
    }

    try {
      setExportingFormat(format);
      const blob = await dashboardAPI.downloadRoleReport({
        month,
        year,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gearguard-report-${year}-${String(month).padStart(2, '0')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report export failed:', error);
      alert(error.message || 'Failed to export report');
    } finally {
      setExportingFormat('');
    }
  };

  const handleLogout = () => {
    clearAllAuth();
    navigate('/');
  };

  const reportCards = (() => {
    const scope = reportData?.scope;
    const personal = reportData?.personal;
    const teamSummary = reportData?.team?.summary;
    const globalSummary = reportData?.global?.summary;

    if (scope === 'global' && globalSummary) {
      return [
        { label: 'Equipments Repaired (All Teams)', value: globalSummary.repairedEquipments ?? globalSummary?.requests?.repaired ?? 0, color: 'text-cyan-400' },
        { label: 'Requests Raised (All Users)', value: globalSummary.requestsRaisedByUsers ?? globalSummary?.requests?.total ?? 0, color: 'text-yellow-400' },
        { label: 'Requests Solved (All Technicians)', value: globalSummary.solvedByTechnicians ?? globalSummary?.requests?.repaired ?? 0, color: 'text-green-400' },
      ];
    }

    if (scope === 'team' && teamSummary) {
      return [
        { label: 'Equipments Repaired (My Team)', value: teamSummary.repairedEquipments ?? 0, color: 'text-cyan-400' },
        { label: 'Requests Raised (My Team Users)', value: teamSummary.requestsRaisedByUsers ?? 0, color: 'text-yellow-400' },
        { label: 'Requests Solved (My Team Technicians)', value: teamSummary.solvedByTechnicians ?? 0, color: 'text-green-400' },
      ];
    }

    if (personal?.type === 'technician') {
      return [
        { label: 'Requests Solved (Me)', value: personal.solved ?? 0, color: 'text-green-400' },
        { label: 'Verified Closed (Me)', value: personal.verifiedClosed ?? 0, color: 'text-cyan-400' },
        { label: 'My Average Rating', value: personal.avgRating ?? '0.00', color: 'text-yellow-400' },
      ];
    }

    return [
      { label: 'Requests Raised (Me)', value: personal?.raisedTotal ?? 0, color: 'text-yellow-400' },
      { label: 'Awaiting Verification (Me)', value: personal?.awaitingVerification ?? 0, color: 'text-cyan-400' },
      { label: 'Verified Closed (Me)', value: personal?.verifiedClosed ?? 0, color: 'text-green-400' },
    ];
  })();

  const reportList = (() => {
    if (reportData?.scope === 'global') {
      return (reportData?.global?.byTeam || []).slice(0, 6).map((item) => ({
        key: `team-${item.teamId}`,
        title: item.teamName,
        subtitle: `${item.repairedEquipments} equipments repaired`,
        value: `${item.repairedRequests} requests solved`,
      }));
    }

    if (reportData?.scope === 'team') {
      return (reportData?.team?.byTechnician || []).slice(0, 6).map((item) => ({
        key: `tech-${item.technicianId}`,
        title: item.name,
        subtitle: 'Technician solved requests',
        value: `${item.solvedCount}`,
      }));
    }

    return [];
  })();

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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">Report Snapshot</h1>
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">Personal, team, or global report scope based on your role.</p>
            <p className="text-xs uppercase tracking-wider text-cyan-400 mt-1">{reportData?.scope || 'personal'} scope</p>
          </div>

          {['Admin', 'Manager'].includes(userRole) && (
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="bg-primary-darkest border border-cyan-500/20 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => triggerReportExport('csv')}
                disabled={exportingFormat !== ''}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold border border-cyan-500/40 text-cyan-300 rounded hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                {exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                type="button"
                onClick={() => triggerReportExport('pdf')}
                disabled={exportingFormat !== ''}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold border border-blue-500/40 text-blue-300 rounded hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                {exportingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          )}
        </div>

        {reportLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
          </div>
        ) : reportError ? (
          <div className="bg-primary-darker border border-red-500/30 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
            <p className="text-sm text-red-300">{reportError}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {reportCards.map((card) => (
                <div key={card.label} className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {reportData?.scope === 'team' && reportData?.team?.team?.name && (
              <p className="text-sm text-gray-400 mb-4">
                Team: <span className="text-cyan-300 font-medium">{reportData.team.team.name}</span>
              </p>
            )}

            {reportList.length > 0 && (
              <div className="bg-primary-darker border border-cyan-500/20 rounded-xl p-5 shadow-lg shadow-cyan-500/5">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Breakdown</h2>
                <div className="space-y-2">
                  {reportList.map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-primary-darkest border border-cyan-500/10 rounded-lg p-3">
                      <div>
                        <p className="text-sm text-gray-100 font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <p className="text-sm text-cyan-300 font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReportSnapshotPage;
