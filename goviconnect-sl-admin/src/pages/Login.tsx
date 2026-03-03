import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sprout,
  TreePine,
} from 'lucide-react';

export default function Login() {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (loading) return null;
  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Login failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── Left branding panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex-col items-center justify-center p-12 text-white">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="login-float-1 absolute top-[10%] left-[15%] w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm" />
          <div className="login-float-2 absolute top-[60%] left-[10%] w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm" />
          <div className="login-float-3 absolute top-[25%] right-[10%] w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm" />
          <div className="login-float-1 absolute bottom-[15%] right-[20%] w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm" />
          <div className="login-float-2 absolute top-[45%] left-[45%] w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm" />

          {/* Decorative leaf icons */}
          <Leaf className="login-float-3 absolute top-[18%] right-[25%] w-8 h-8 text-white/10" />
          <Sprout className="login-float-1 absolute bottom-[25%] left-[20%] w-10 h-10 text-white/10" />
          <TreePine className="login-float-2 absolute top-[70%] right-[15%] w-9 h-9 text-white/10" />
        </div>

        {/* Main branding content */}
        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/20">
            <Leaf className="w-12 h-12 text-emerald-200" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            GoviConnect
          </h1>
          <p className="text-emerald-200/90 text-lg font-medium mb-8">
            Admin Dashboard
          </p>
          <div className="w-16 h-0.5 bg-emerald-400/40 mx-auto mb-8 rounded-full" />
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
            Empowering Sri Lankan agriculture through technology. Manage farmers,
            experts, crops, and insights — all from one place.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {['Farmers', 'Experts', 'Crops', 'Analytics'].map((label) => (
              <span
                key={label}
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-emerald-100 backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right login form panel ─── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-gray-50 p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo (hidden on large screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              GoviConnect
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 animate-[shake_0.4s_ease-in-out]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 bg-white ${
                  focusedField === 'email'
                    ? 'border-green-500 ring-4 ring-green-500/10 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail
                  className={`w-[18px] h-[18px] mr-3 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-green-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                  placeholder="admin@goviconnect.lk"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 bg-white ${
                  focusedField === 'password'
                    ? 'border-green-500 ring-4 ring-green-500/10 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lock
                  className={`w-[18px] h-[18px] mr-3 transition-colors duration-200 ${
                    focusedField === 'password'
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            GoviConnect SL &copy; {new Date().getFullYear()} &middot; Admin
            Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
