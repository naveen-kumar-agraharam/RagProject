/**
 * Login / Register Page
 * Clean, professional authentication portal for Intellica.
 * Supports Student Sign In, Registration, and 1-click Guest Demo.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Layers,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: 'Computer Science',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      const user = {
        name: isRegister ? formData.name : (formData.email.split('@')[0] || 'Student'),
        email: formData.email,
        rollNo: formData.rollNo || '21CS042',
        department: formData.department,
        token: 'intellica_jwt_' + Date.now(),
      }
      localStorage.setItem('collegegpt_user', JSON.stringify(user))
      toast.success(isRegister ? 'Account created! Welcome to Intellica.' : 'Signed in successfully!')
      navigate('/')
    }, 450)
  }

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest User',
      email: 'guest@intellica.ai',
      rollNo: 'INT-GUEST',
      department: 'Computer Science',
      token: 'guest_token_' + Date.now(),
    }
    localStorage.setItem('collegegpt_user', JSON.stringify(guestUser))
    toast.success('Signed in as Guest User')
    navigate('/')
  }

  return (
    <div className="min-h-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white shadow-sm mb-3">
            <Layers className="w-7 h-7 text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Intellica
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Intelligent Document Assistant
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 p-1 bg-slate-100 border border-slate-200 rounded-lg inline-flex w-full">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="clean-card p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      name="name"
                      type="text"
                      required={isRegister}
                      placeholder="Alex Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Roll Number
                    </label>
                    <input
                      name="rollNo"
                      type="text"
                      required={isRegister}
                      placeholder="21CS042"
                      value={formData.rollNo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary-900 shadow-sm"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Tech">Information Tech</option>
                      <option value="Electronics & Comm">Electronics & Comm</option>
                      <option value="Mechanical Eng">Mechanical Eng</option>
                      <option value="Civil Eng">Civil Eng</option>
                      <option value="Management Studies">Management Studies</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-900 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-900 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Register & Continue' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-2 bg-white text-slate-400 font-medium">Or demo instantly</span>
            </div>
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Continue as Guest</span>
          </button>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Grounded document retrieval with Gemini RAG</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
