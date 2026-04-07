import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login_SignupPage from './Pages/Login_SignupPage';
import Dashboard from './Pages/Dashboard';
import EquipmentPage from './Pages/EquipmentPage';
import RequestPage from './Pages/RequestPage';
import KanbanPage from './Pages/KanbanPage';
import CalendarPage from './Pages/CalendarPage';
import TeamPage from './Pages/TeamPage';
import UserManagementPage from './Pages/UserManagementPage';
import { getStoredUser } from './utils/auth';
import { hasPermission } from './utils/rolePermissions';

// Landing Page Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modules from './components/Modules';
import Intelligence from './components/Intelligence';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

// Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <Modules />
      <Intelligence />
      <CTA />
      <Footer />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, permission }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login_SignupPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/equipment" 
          element={
            <ProtectedRoute>
              <EquipmentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute>
              <RequestPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kanban" 
          element={
            <ProtectedRoute>
              <KanbanPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teams" 
          element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission="MANAGE_USERS">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
