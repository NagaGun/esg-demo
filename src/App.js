import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConsultantLogin from './pages/ConsultantLogin';
import ConsultantDashboard from './pages/ConsultantDashboard';
import ClientPortal from './pages/ClientPortal';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientDashboard from './pages/ClientDashboard';
import QuestionnaireFlow from './pages/QuestionnaireFlow';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProtectedRoute from './components/ClientProtectedRoute';
import './index.css';

function RedirectToRegister() {
  const { accessCode } = useParams()
  return <Navigate to={`/client/register/${accessCode}`} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/consultant/login" element={<ConsultantLogin />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ConsultantDashboard />
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/client/register/:accessCode" element={<ClientRegister />} />
      <Route path="/submit/:accessCode" element={<RedirectToRegister />} />

      <Route
        path="/client/dashboard"
        element={
          <ClientProtectedRoute>
            <ClientDashboard />
          </ClientProtectedRoute>
        }
      />

      <Route
        path="/client/portal/:accessCode"
        element={
          <ClientProtectedRoute>
            <ClientPortal />
          </ClientProtectedRoute>
        }
      />

      <Route path="/questionnaire" element={<QuestionnaireFlow />} />
    </Routes>
  );
}

export default App;
