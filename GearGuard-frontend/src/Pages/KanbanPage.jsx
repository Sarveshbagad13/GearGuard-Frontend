import React, { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  GripVertical,
  MoveRight,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';

const KanbanBoard = () => {
  const [kanbanData, setKanbanData] = useState({
    New: [],
    'In Progress': [],
    Repaired: [],
    Scrap: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);

  // Fetch Kanban data from API
  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await maintenanceRequestAPI.getKanbanView();
      
      if (response.success) {
        setKanbanData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch Kanban data:', err);
      setError('Failed to load Kanban board');
    } finally {
      setLoading(false);
    }
  };

  // Handle drag start
  const handleDragStart = (e, card, fromColumn) => {
    setDraggedCard({ card, fromColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e, toColumn) => {
    e.preventDefault();
    
    if (!draggedCard) return;
    
    const { card, fromColumn } = draggedCard;
    
    // Don't do anything if dropped in same column
    if (fromColumn === toColumn) {
      setDraggedCard(null);
      return;
    }

    try {
      // Optimistically update UI
      const newKanbanData = { ...kanbanData };
      newKanbanData[fromColumn] = newKanbanData[fromColumn].filter(c => c.id !== card.id);
      newKanbanData[toColumn] = [...newKanbanData[toColumn], card];
      setKanbanData(newKanbanData);

      // Update backend
      await maintenanceRequestAPI.updateStage(card.id, toColumn);
      
      // Refresh data to ensure consistency
      await fetchKanbanData();
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('Failed to move card. Refreshing...');
      fetchKanbanData();
    }
    
    setDraggedCard(null);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      'Medium': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      'High': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      'Critical': 'bg-red-500/15 text-red-300 border-red-500/30'
    };
    return colors[priority] || colors.Medium;
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      'New': {
        accent: 'bg-cyan-400',
        glow: 'shadow-cyan-500/20',
        border: 'border-cyan-500/30',
        text: 'text-cyan-300',
        bg: 'from-cyan-500/10 to-cyan-400/5',
        icon: AlertCircle,
      },
      'In Progress': {
        accent: 'bg-yellow-400',
        glow: 'shadow-yellow-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-300',
        bg: 'from-yellow-500/10 to-yellow-400/5',
        icon: Clock,
      },
      'Repaired': {
        accent: 'bg-green-400',
        glow: 'shadow-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-300',
        bg: 'from-green-500/10 to-green-400/5',
        icon: CheckCircle2,
      },
      'Scrap': {
        accent: 'bg-red-400',
        glow: 'shadow-red-500/20',
        border: 'border-red-500/30',
        text: 'text-red-300',
        bg: 'from-red-500/10 to-red-400/5',
        icon: XCircle,
      }
    };
    return colors[stage] || colors.New;
  };

  // Check if overdue
  const isOverdue = (request) => {
    if (!request.scheduledDate) return false;
    return new Date(request.scheduledDate) < new Date() && request.stage !== 'Repaired';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading Kanban board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-4 text-gray-300">{error}</p>
          <button 
            onClick={fetchKanbanData}
            className="mt-4 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 relative">
          <h1 className="text-4xl font-bold mb-2">
            MAINTENANCE <span className="text-cyan-400">KANBAN</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Visualize every request from intake to closure. Drag cards across stages to keep the workflow moving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(kanbanData).map(([stage, items]) => {
              const stageConfig = getStageColor(stage);
              const Icon = stageConfig.icon;

              return (
                <div key={stage} className="bg-[#0f1729] border border-cyan-900/20 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stageConfig.bg} border ${stageConfig.border} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stageConfig.text}`} />
                    </div>
                    <div className={`text-3xl font-bold ${stageConfig.text}`}>{items.length}</div>
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 relative">
          {Object.keys(kanbanData).map((columnName) => (
            <div key={columnName} className="relative">
              <div
                className={`bg-[#0f1729]/95 border rounded-2xl backdrop-blur-sm transition-colors ${draggedCard ? 'border-cyan-500/30' : 'border-cyan-900/20'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnName)}
              >
                {/* Column Header */}
                {(() => {
                  const stageConfig = getStageColor(columnName);
                  const Icon = stageConfig.icon;

                  return (
                    <div className={`p-4 rounded-t-2xl border-b ${stageConfig.border} bg-gradient-to-r ${stageConfig.bg}`}>
                      <h2 className="font-semibold text-lg flex items-center justify-between gap-3">
                        <span className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-xl ${stageConfig.accent} ${stageConfig.glow} shadow-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-[#0a0e1a]" />
                          </span>
                          <span>
                            <span className="block text-gray-100">{columnName}</span>
                            <span className="block text-xs text-gray-400 uppercase tracking-[0.2em]">
                              Workflow Stage
                            </span>
                          </span>
                        </span>
                        <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${stageConfig.border} ${stageConfig.text} bg-black/20`}>
                          {kanbanData[columnName].length}
                        </span>
                      </h2>
                    </div>
                  );
                })()}

                {/* Cards Container */}
                <div className="p-4 space-y-4 min-h-[520px]">
                  {kanbanData[columnName].map((request) => (
                    <div
                      key={request.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, request, columnName)}
                      className={`group rounded-2xl border p-4 cursor-move transition-all duration-200 ${
                        draggedCard?.card?.id === request.id
                          ? 'border-cyan-400/60 bg-cyan-500/10 scale-[0.98]'
                          : 'border-cyan-900/20 bg-[#111a2d] hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/40'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                              {request.requestNumber}
                            </span>
                            {isOverdue(request) && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                                Overdue
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-100 text-sm leading-6">
                            {request.subject}
                          </h3>
                        </div>
                        <MoveRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
                      </div>

                      {/* Equipment Info */}
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        <Wrench className="w-3 h-3 mr-2 text-cyan-400" />
                        <span className="truncate">{request.equipment?.name || 'Unknown equipment'}</span>
                      </div>

                      {/* Priority Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>

                      {/* Assigned Technician */}
                      <div className="space-y-2 text-xs text-gray-400">
                        {request.assignedTo && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center min-w-0">
                              {request.assignedTo.avatar ? (
                                <img 
                                  src={request.assignedTo.avatar} 
                                  alt={request.assignedTo.name}
                                  className="w-7 h-7 rounded-full mr-2 border border-cyan-500/20"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs mr-2 flex-shrink-0">
                                  {request.assignedTo.name.charAt(0)}
                                </div>
                              )}
                              <span className="truncate flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {request.assignedTo.name}
                              </span>
                            </div>
                          </div>
                        )}

                        {request.scheduledDate && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              {new Date(request.scheduledDate).toLocaleDateString()}
                            </span>
                            {request.duration && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                {request.duration}h
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {kanbanData[columnName].length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-12 border border-dashed border-cyan-900/30 rounded-2xl bg-[#0b1220]">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-5 h-5 text-cyan-400" />
                      </div>
                      No requests in {columnName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
