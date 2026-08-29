import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Utensils,
  MapPin,
  PlusCircle,
  Users,
  LogOut,
  Menu,
  X,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FamilyMemberModal } from './FamilyMemberModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out from the family account?')) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Utensils },
    { name: 'Food Map', path: '/map', icon: MapPin },
    { name: 'Add Restaurant', path: '/add-restaurant', icon: PlusCircle, isPrimary: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" id="nav-brand-logo" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-orange-600 transition-colors">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-gray-900 leading-tight">
                  FamilyFood<span className="text-orange-500">Tracker</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Family Journal & Map
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                if (item.isPrimary) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id="nav-add-restaurant-btn"
                      className="ml-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="h-5 w-px bg-gray-200 mx-2" />

              {/* Family Members button */}
              <button
                id="nav-family-members-btn"
                type="button"
                onClick={() => setFamilyModalOpen(true)}
                className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Manage Family Members"
              >
                <Users className="w-4 h-4 text-orange-500" />
                <span>Family</span>
              </button>

              {/* User Avatar Chip */}
              {user && (
                <div
                  className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer ml-1 hover:border-orange-400 transition-colors"
                  title={`Family Account: ${user.email}`}
                >
                  FA
                </div>
              )}

              {/* Logout button */}
              {user && (
                <button
                  id="nav-logout-btn"
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title={`Logged in as ${user.email}. Click to log out.`}
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                id="mobile-family-members-btn"
                type="button"
                onClick={() => setFamilyModalOpen(true)}
                className="p-2 text-orange-600 bg-orange-50 rounded-lg"
                title="Family Members"
              >
                <Users className="w-5 h-5" />
              </button>

              <button
                id="mobile-menu-toggle-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              if (item.isPrimary) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-lg bg-orange-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                    isActive ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="truncate max-w-[200px]">{user?.email}</span>
              <button
                id="mobile-logout-btn"
                type="button"
                onClick={handleLogout}
                className="text-rose-600 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Family Members Management Modal */}
      <FamilyMemberModal
        isOpen={familyModalOpen}
        onClose={() => setFamilyModalOpen(false)}
      />
    </>
  );
};
