import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Radio, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  User, 
  Building2, 
  Zap, 
  Activity, 
  Layers, 
  CheckCircle2,
  Sparkles,
  Wifi
} from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  
  // Sign In state
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('adminpassword123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Executive Operations');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback & Loading
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const { login, register, loginDemo, token } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Check backend server status
  useEffect(() => {
    api.get('/health')
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    } else {
      setError(res?.message || 'Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Please fill in all registration fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await register(regName, regEmail, regPassword, regDepartment);
    setLoading(false);
    if (res?.success) {
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => navigate('/'), 800);
    } else {
      setError(res?.message || 'Registration failed');
    }
  };

  const handleQuickDemo = (role) => {
    setError('');
    loginDemo(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-gray-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Cyber Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      ></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Visual Features & System Highlights (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-4">
            {/* Live System Indicator */}
            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/40 text-xs font-mono text-indigo-300 shadow-inner">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>Cloud Telemetry Server: {backendStatus === 'online' ? 'ACTIVE & ONLINE' : 'READY / DEMO MODE'}</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Dual IoT Tracking
              </span>{' '}
              Platform
            </h1>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Industrial-grade real-time workforce monitoring powered by ESP32 microcontrollers, NEO-6M satellite GPS, and ambient Wi-Fi BSSID indoor positioning.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Sub-Meter Dual Indoor/Outdoor Verification</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Automated switching between satellite GPS coordinates outdoors and calibrated Wi-Fi triangulation indoors.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-200">3D Digital Twin & Smart Geofencing</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Interactive multi-floor 3D building designer with real-time employee avatar visualization.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Zero-Touch Automated Attendance</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Instant check-in and check-out tracking with shift analytics and emergency SOS detection.</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-800/80 font-mono text-center">
            <div className="p-2.5 rounded-xl bg-gray-900/30 border border-gray-800/50">
              <div className="text-base font-bold text-cyan-400">5 sec</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Telemetry Rate</div>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-900/30 border border-gray-800/50">
              <div className="text-base font-bold text-indigo-400">100%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Cloud Ready</div>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-900/30 border border-gray-800/50">
              <div className="text-base font-bold text-emerald-400">ESP32</div>
              <div className="text-[10px] text-gray-500 mt-0.5">IoT Hardware</div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800/80 bg-gray-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Top Glowing Edge Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"></div>

            {/* Brand Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-indigo-200 bg-clip-text text-transparent">
                Command Center
              </h2>
              <p className="text-xs text-gray-400">Sign in to access real-time employee telematics</p>
            </div>

            {/* Tab Switcher: Sign In vs Create Account */}
            <div className="flex rounded-xl bg-gray-900/80 p-1 border border-gray-800 text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setError(''); }}
                className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                  activeTab === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2 font-medium rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium animate-shake">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1.5 font-medium">Admin Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-gray-300 font-medium">Password</label>
                    <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-800 bg-gray-900 text-indigo-600 focus:ring-0"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all text-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* CREATE ACCOUNT / REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="e.g. Sarah Connor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="Executive Operations">Executive Operations</option>
                      <option value="Campus Security">Campus Security</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Engineering & IT">Engineering & IT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="sarah@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all text-xs cursor-pointer"
                >
                  <span>{loading ? 'Creating Account...' : 'Register Admin Account'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Login Shortcuts */}
            <div className="pt-4 border-t border-gray-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center space-x-1.5 font-medium text-gray-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant 1-Click Demo Access:</span>
                </span>
                <span className="text-[10px] text-gray-500 font-mono">No typing required</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('superadmin')}
                  className="px-3 py-2 rounded-xl bg-gray-900/90 hover:bg-indigo-600/20 border border-gray-800 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-semibold text-gray-200 group-hover:text-indigo-300 flex items-center justify-between">
                    <span>Chief Admin</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">admin@company.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('operator')}
                  className="px-3 py-2 rounded-xl bg-gray-900/90 hover:bg-cyan-600/20 border border-gray-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-semibold text-gray-200 group-hover:text-cyan-300 flex items-center justify-between">
                    <span>Security Officer</span>
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">security@company.com</div>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
