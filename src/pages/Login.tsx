import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setAuthLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 mb-4">
          <Utensils className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Personal Family Food Tracker
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to your private family food journal & restaurant ratings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-gray-200">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label
                htmlFor="family-email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
              >
                Family Account Email
              </label>

              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  id="family-email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="family-password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
              >
                Password
              </label>

              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="family-password-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-medium"
                />
              </div>
            </div>

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {authLoading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Protected with Firebase Authentication & Cloud Firestore
          </span>
        </div>
      </div>
    </div>
  );
};