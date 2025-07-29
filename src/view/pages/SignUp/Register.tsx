import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

interface UserDto {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role: 'USER' ;
}

const UserRegisterForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [registeredUser, setRegisteredUser] = useState<UserDto | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        const { email, firstName, lastName, password, confirmPassword } = formData;

        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            return 'Please fill in all required fields';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }

        if (firstName.trim().length < 2) {
            return 'First name must be at least 2 characters long';
        }

        if (lastName.trim().length < 2) {
            return 'Last name must be at least 2 characters long';
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        return null;
    };

    const registerUser = async (userData: Omit<UserDto, 'id'>) => {
        try {
            console.log('Registering user with data:', userData);

            const response = await fetch('/api/user/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to server. Please check your connection.');
            }
            throw error;
        }
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userData: Omit<UserDto, 'id'> = {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password,
                role: 'USER'
            };

            const result = await registerUser(userData);

            setSuccess(true);
            setRegisteredUser(result);

            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                password: '',
                confirmPassword: ''
            });


            setTimeout(() => {
                setSuccess(false);
                setRegisteredUser(null);
            }, 5000);

        } catch (error) {
            console.error('Registration error:', error);
            setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (password.length < 12) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl"></div>


            <div className="w-full max-w-md">
                {/* Success Message */}
                {success && registeredUser && (
                    <div className="mb-6 bg-gradient-to-r from-gray-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg animate-bounce">
                        <div className="flex items-center gap-3">
                            <CheckCircle size={24} />
                            <div>
                                <h3 className="font-bold text-lg">🎉 Registration Successful!</h3>
                                <p className="text-white-100 text-sm">
                                    Welcome {registeredUser.firstName}! Your account has been created.
                                </p>
                                {registeredUser.id && (
                                    <p className="text-green-100 text-xs mt-1">
                                        User ID: {registeredUser.id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500 text-white p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={24} />
                            <div>
                                <h3 className="font-bold">Registration Failed</h3>
                                <p className="text-red-100 text-sm">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-red-100 hover:text-white underline text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="bg-gray-400/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className=" rounded  bg-gradient-to-r from-blue-500/50 via-indigo-600 to-purple-600/70 p-6">
                        <h2 className="text-2xl font-bold text-white text-center tracking-wide">
                            ✨ Create Account ✨
                        </h2>
                        <p className="text-blue-100 text-center text-sm mt-1 font-light">
                            Join our amazing community today
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Mail size={16}  />
                                    Email
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <User size={16}  />
                                        First Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="Enter your first name"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <User size={16}  />
                                        Last Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="Enter your last name"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Lock size={16}  />
                                    Password
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="Enter your password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                            <span>Password Strength</span>
                                            <span className={`font-medium ${
                                                passwordStrength.strength < 50 ? 'text-red-500' :
                                                    passwordStrength.strength < 75 ? 'text-yellow-500' :
                                                        passwordStrength.strength < 100 ? 'text-blue-500' : 'text-green-500'
                                            }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Lock size={16}  />
                                    Confirm Password
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${
                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                ? 'border-red-300 focus:border-red-400'
                                                : formData.confirmPassword && formData.password === formData.confirmPassword
                                                    ? 'border-green-300 focus:border-green-400'
                                                    : 'border-gray-200 focus:border-purple-400'
                                        }`}
                                        placeholder="Confirm your password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                                )}
                            </div>

                            {/* Role Display */}
                            {/*<div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl border border-gray-200">*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <UserPlus size={16} className="text-blue-500" />*/}
                            {/*        <span className="text-sm text-gray-600">Account Type:</span>*/}
                            {/*        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">*/}
                            {/*            USER*/}
                            {/*        </span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            <span> Create Account</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center mt-6 pt-6 border-t border-gray-700/50">
                                <p className="text-white text-sm">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                        Sign In
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegisterForm;