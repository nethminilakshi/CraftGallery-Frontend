import { useState } from 'react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    async function handleSubmit() {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`Login successful! Welcome ${email}`);
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative w-full max-w-lg">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/30">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                            <span className="text-white text-4xl font-bold">✨</span>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
                    </div>

                    {/*/!* Facebook login *!/*/}
                    {/*<button*/}
                    {/*    onClick={handleFacebookLogin}*/}
                    {/*    className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mb-8"*/}
                    {/*><span className="font-semibold text-lg">Continue with Email</span>*/}
                    {/*</button>*/}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200"></div>
                        </div>

                    </div>

                    {/* Login inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 bg-gray-50 focus:bg-white text-lg"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 bg-gray-50 focus:bg-white text-lg"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-2"
                                >
                                    {showPassword ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 text-lg">
                            Don't have an account?{' '}
                            <a href="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                                Create one now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}