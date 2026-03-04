import React, { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';
import { User, Calendar, Clock, AlertCircle, Wrench } from 'lucide-react';

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
      'Low': 'bg-blue-100 text-blue-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'High': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.Medium;
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      'New': 'bg-blue-500',
      'In Progress': 'bg-yellow-500',
      'Repaired': 'bg-green-500',
      'Scrap': 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  // Check if overdue
  const isOverdue = (request) => {
    if (!request.scheduledDate) return false;
    return new Date(request.scheduledDate) < new Date() && request.stage !== 'Repaired';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Kanban board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
          <button 
            onClick={fetchKanbanData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maintenance Kanban Board
          </h1>
          <p className="text-gray-600">
            Drag and drop cards to update their status
          </p>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(kanbanData).map((columnName) => (
            <div
              key={columnName}
              className="bg-gray-100 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnName)}
            >
              {/* Column Header */}
              <div className={`${getStageColor(columnName)} text-white p-4 rounded-t-lg`}>
                <h2 className="font-semibold text-lg flex items-center justify-between">
                  <span>{columnName}</span>
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded text-sm">
                    {kanbanData[columnName].length}
                  </span>
                </h2>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 min-h-[500px]">
                {kanbanData[columnName].map((request) => (
                  <div
                    key={request.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, request, columnName)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1">
                        {request.subject}
                      </h3>
                      {isOverdue(request) && (
                        <span className="ml-2 text-red-500 text-xs font-semibold">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {/* Request Number */}
                    <p className="text-xs text-gray-500 mb-2">{request.requestNumber}</p>

                    {/* Equipment Info */}
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Wrench className="w-3 h-3 mr-1" />
                      <span className="truncate">{request.equipment?.name}</span>
                    </div>

                    {/* Priority Badge */}
                    <div className="mb-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>

                    {/* Assigned Technician */}
                    {request.assignedTo && (
                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          {request.assignedTo.avatar ? (
                            <img 
                              src={request.assignedTo.avatar} 
                              alt={request.assignedTo.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                              {request.assignedTo.name.charAt(0)}
                            </div>
                          )}
                          <span className="truncate">{request.assignedTo.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Scheduled Date */}
                    {request.scheduledDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(request.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Duration */}
                    {request.duration && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{request.duration} hours</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {kanbanData[columnName].length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No requests in {columnName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
