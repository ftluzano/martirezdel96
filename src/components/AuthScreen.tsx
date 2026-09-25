import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarangayLogo } from './BarangayLogo';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, MapPin } from 'lucide-react';
import { BARANGAY_AREAS } from '../data/mockData';
import defaultHallImage from '../assets/images/martirez_barangay_hall_1790315749540.jpg';

export const AuthScreen: React.FC = () => {
  const { login, loginWithGoogle, register, forgotPassword, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>(BARANGAY_AREAS[0]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation: all fields must be filled before entering
  const isSignInValid = email.trim() !== '' && password.trim() !== '';
  const isRegisterValid = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    phone.trim() !== '' && 
    selectedArea.trim() !== '' &&
    password.trim() !== '';

  const isFormValid = mode === 'signin' ? isSignInValid : isRegisterValid;

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      await forgotPassword(email.trim());
      setSuccessMessage('Password reset email sent. Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Unable to send the password reset email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          setError('Please fill out all fields.');
          return;
        }
        await login(email.trim(), password);
      } else {
        if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
          setError('Please fill out all fields.');
          return;
        }
        await register(name.trim(), email.trim(), password, phone.trim(), selectedArea);
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('Authentication failed. Please verify your credentials and try again.');
      }
    }
  };

  const handleGoogleConnect = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('Unable to authenticate with Google. Please try again.');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-hidden bg-slate-950 selection:bg-blue-600 selection:text-white">
      
      {/* Convenient, Built-In Screen-Fitting Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Soft Ambient Glow Layer */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />

        {/* High-Resolution Civic Facade Photo (Fits any screen perfectly with object-cover) */}
        <img
          src={defaultHallImage}
          alt="Barangay Martirez del '96 Civic Hall"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.75] contrast-[1.05]"
        />

        {/* Subtle Decorative Festive Bunting (Banderitas) Garland Silhouette */}
        <svg
          className="absolute top-0 left-0 w-full h-32 opacity-35"
          preserveAspectRatio="none"
          viewBox="0 0 1000 120"
        >
          {/* Garland String 1 */}
          <path d="M 0,10 Q 250,55 500,15 Q 750,55 1000,10" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          {/* Banderitas Pennants */}
          {[
            { x: 50, y: 15, color: '#3B82F6' },
            { x: 120, y: 28, color: '#EF4444' },
            { x: 190, y: 38, color: '#EAB308' },
            { x: 260, y: 36, color: '#10B981' },
            { x: 330, y: 27, color: '#A855F7' },
            { x: 400, y: 19, color: '#3B82F6' },
            { x: 470, y: 16, color: '#F97316' },
            { x: 540, y: 20, color: '#EAB308' },
            { x: 610, y: 30, color: '#EF4444' },
            { x: 680, y: 38, color: '#10B981' },
            { x: 750, y: 37, color: '#3B82F6' },
            { x: 820, y: 28, color: '#A855F7' },
            { x: 890, y: 18, color: '#F97316' },
            { x: 960, y: 12, color: '#EAB308' },
          ].map((flag, idx) => (
            <polygon
              key={idx}
              points={`${flag.x},${flag.y} ${flag.x + 14},${flag.y + 24} ${flag.x - 14},${flag.y + 24}`}
              fill={flag.color}
              opacity="0.85"
            />
          ))}

          {/* Garland String 2 (Lower crossing) */}
          <path d="M 0,35 Q 300,85 600,45 Q 850,75 1000,30" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          {[
            { x: 80, y: 44, color: '#EAB308' },
            { x: 160, y: 62, color: '#3B82F6' },
            { x: 240, y: 72, color: '#EF4444' },
            { x: 320, y: 73, color: '#10B981' },
            { x: 400, y: 64, color: '#F97316' },
            { x: 480, y: 52, color: '#A855F7' },
            { x: 560, y: 46, color: '#3B82F6' },
            { x: 640, y: 52, color: '#EAB308' },
            { x: 720, y: 64, color: '#EF4444' },
            { x: 800, y: 71, color: '#10B981' },
            { x: 880, y: 60, color: '#3B82F6' },
          ].map((flag, idx) => (
            <polygon
              key={`g2-${idx}`}
              points={`${flag.x},${flag.y} ${flag.x + 12},${flag.y + 20} ${flag.x - 12},${flag.y + 20}`}
              fill={flag.color}
              opacity="0.75"
            />
          ))}
        </svg>

        {/* Deep Translucent Civic Gradient Scrim (Maintains high clarity and contrast) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/70 backdrop-blur-[1px]" />
      </div>

      {/* Main Centered Frosted Glass Container Card */}
      <div className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden transition-all duration-300">
        
        {/* Card Header with Translucent Dark Theme and Realistic Animated 3D BM Logo */}
        <div className="bg-slate-900/85 backdrop-blur-sm text-white p-6 sm:p-7 text-center flex flex-col items-center justify-center space-y-3 border-b border-white/10">
          <BarangayLogo size="lg" animated={true} interactive={true} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Serbisyong Martirez del '96
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Barangay Public Services Portal · Pateros
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200/70 bg-slate-100/60 backdrop-blur-xs text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-blue-600 text-blue-700 bg-white/90 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-blue-600 text-blue-700 bg-white/90 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Connect with Google Button */}
          <button
            type="button"
            onClick={handleGoogleConnect}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white/95 hover:bg-white text-slate-700 font-semibold text-xs border border-slate-200/90 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
          >
            {/* Google 'G' Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Connect with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-300/60" />
            <span className="text-[11px] text-slate-500 uppercase font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-300/60" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50/90 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-700 rounded-lg text-xs leading-relaxed">
                {successMessage}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/95"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/95"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/95"
                    >
                      {BARANGAY_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/95"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/95"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signin' && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-2.5 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-3 ${
                isFormValid && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In to Portal' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {!isFormValid && (
              <p className="text-[11px] text-center text-slate-500 mt-1">
                Please fill out all required fields before proceeding.
              </p>
            )}
          </form>

        </div>

      </div>

      {/* Transparent Bottom Credit */}
      <footer className="relative z-10 mt-6 text-center text-xs text-white/80 font-medium drop-shadow-md">
        <span>Barangay Martirez del '96 · Sangguniang Barangay · Pateros, Metro Manila</span>
      </footer>

    </div>
  );
};
