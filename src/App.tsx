import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Loading } from './components/Loading';

// Pages
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { FoodMap } from './pages/FoodMap';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { AddRestaurant } from './pages/AddRestaurant';
import { EditRestaurant } from './pages/EditRestaurant';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Authenticating family journal..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
        <p>Family Food Tracker &bull; Personal Family Food Journal &bull; Built with React, Leaflet & Firebase</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedLayout>
                <FoodMap />
              </ProtectedLayout>
            }
          />
          <Route
            path="/restaurant/:id"
            element={
              <ProtectedLayout>
                <RestaurantDetails />
              </ProtectedLayout>
            }
          />
          <Route
            path="/add-restaurant"
            element={
              <ProtectedLayout>
                <AddRestaurant />
              </ProtectedLayout>
            }
          />
          <Route
            path="/edit-restaurant/:id"
            element={
              <ProtectedLayout>
                <EditRestaurant />
              </ProtectedLayout>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
