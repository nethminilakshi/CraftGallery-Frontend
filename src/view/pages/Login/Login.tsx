import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { backendApi } from "../../../api.ts";
import { getUserFromToken } from "../../../Auth/auth.ts";
import type { UserData } from "../../../model/userData.ts";
import { Palette, Scissors, Sparkles, PaintBucket, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { useState } from "react";

type FormData = {
    email: string;
    password: string;
};

export function Login() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const authenticateUser = async (data: FormData) => {
        try {
            setLoading(true);
            setError('');

            const userCredentials = {
                email: data.email,
                password: data.password
            };

            const response = await backendApi.post('/auth/login', userCredentials);
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            const user: UserData = getUserFromToken(accessToken);
            localStorage.setItem('username', user.username as string);
            localStorage.setItem('role', user.role as string);

            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 font-['Inter',_sans-serif] relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-pink-500/20 ">
                    <Scissors className="w-16 h-16" />
                </div>
                <div className="absolute top-40 right-20 text-purple-500/20 ">
                    <PaintBucket className="w-20 h-20" />
                </div>
                <div className="absolute bottom-32 left-1/4 text-blue-500/20 ">
                    <Palette className="w-14 h-14" />
                </div>
                <div className="absolute top-1/3 right-1/4 text-pink-500/20 ">
                    <Sparkles className="w-12 h-12" />
                </div>
                <div className="absolute bottom-20 right-1/3 text-purple-500/20">
                    <Scissors className="w-10 h-10" />
                </div>
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl"></div>

            <div className="relative w-full max-w-md z-10">


                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl animate-shake">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="ml-auto text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/90 backdrop-blur-lg border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                    {/* Header */}
                    <div className="p-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(to right, #1e3a8a, #0f766e, #164e63)' }}>
                        <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-3">
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl animate-bounce">
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-wide font-['Playfair_Display',_serif]">
                                Welcome Back
                            </h2>
                            <p className="text-blue-200 text-sm mt-1 font-light">
                                Sign in to continue your creative journey
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8 bg-gray-800/50">
                        <form className="space-y-5" onSubmit={handleSubmit(authenticateUser)}>
                            {/* Email Field */}
                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-purple-400" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    {...register("email", { required: true })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-500/50"
                                    placeholder="Enter your Email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Lock size={16} className="text-blue-400" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    {...register("password", { required: true })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-500/50"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300
                                    transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                                    style={{ background: 'linear-gradient(to right, #1e3a8a, #0f766e, #164e63)' }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={20} />
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center pt-6 border-t border-gray-700">
                                <p className="text-gray-400 text-sm">
                                    Don't have an account?{' '}
                                    <a href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline">
                                        Create one now
                                    </a>
                                </p>
                            </div>
                            {/* Back Button */}
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-2 transition-colors group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}