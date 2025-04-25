import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import loginimg from "../constants/login.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const { login, isLoggingIn } = useAuthStore();
  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-gray-900 text-gray-100">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">S</span>
              </div>
              <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your account to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  className="w-full py-3 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full py-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              
              <div className="text-sm">
                <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium transition-all duration-200"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300">
                Create account
              </Link>
            </p>
          </div>
          
        </div>
      </div>

      <div className="hidden lg:block relative bg-gray-800 rounded-3xl m-5">
        <div className="absolute inset-0  from-indigo-900/30 to-cyan-900/30 rounded-3xl">
        
        </div>
        <div 
          className="h-full w-full bg-cover bg-center rounded-3xl "
          style={{ backgroundImage: `url(${loginimg})` }}
        ></div>
      </div>
    </div>
  );
};

export default LoginPage;