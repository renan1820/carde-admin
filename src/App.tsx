import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleFormPage from './pages/VehicleFormPage';
import EventsPage from './pages/EventsPage';
import EventFormPage from './pages/EventFormPage';
import PageDesignPage from './pages/PageDesignPage';

function ProtectedRoute({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, saveToken, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={saveToken} />} />
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/vehicles" replace />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/new" element={<VehicleFormPage />} />
          <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/new" element={<EventFormPage />} />
          <Route path="/events/:id/edit" element={<EventFormPage />} />
          <Route path="/page-design" element={<PageDesignPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/vehicles" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
