import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { login, register, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [isRegisterMode, setIsRegisterMode] = useState(false);
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

    if (isRegisterMode && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    setErrorMessage(null);

    try {
      if (isRegisterMode) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign in failed.');
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

          {/* 1-Click Google Sign In */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 text-gray-700 font-medium rounded-xl text-sm border border-gray-300 shadow-2xs transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider font-medium">
              or with email
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

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
                Password {isRegisterMode && <span className="text-gray-400 font-normal lowercase">(min. 6 characters)</span>}
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="family-password-input"
                  name="password"
                  type="password"
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
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
                'Processing...'
              ) : isRegisterMode ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Create Family Account</span>
                </>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle register mode for initial setup */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <button
              id="toggle-auth-mode-btn"
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
            >
              {isRegisterMode
                ? 'Already have an account? Sign in'
                : 'Need a new account? Create Family Account'}
            </button>
          </div>
        </div>

        {/* Security badge / note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Firebase Authentication & Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
