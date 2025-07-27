import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

interface UserDto {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role: 'ADMIN' ;
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
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        const { email, firstName, lastName, password, confirmPassword } = formData;

        // Check required fields
        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            return 'Please fill in all required fields';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }

        // Name validation
        if (firstName.trim().length < 2) {
            return 'First name must be at least 2 characters long';
        }

        if (lastName.trim().length < 2) {
            return 'Last name must be at least 2 characters long';
        }

        // Password validation
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }

        // Password confirmation
        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        return null;
    };

    const registerUser = async (userData: Omit<UserDto, 'id'>) => {
        try {
            console.log('Registering user with data:', userData);

            // Actual API call to backend
            const response = await fetch('/api/user/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed: ${response.status} ${response.statusText}`);
            }

            // Return the created user data
            const result = await response.json();
            return result;

        } catch (error) {
            // Handle network errors or other issues
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
            // Prepare user data according to UserDto interface
            const userData: Omit<UserDto, 'id'> = {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password,
                role: 'ADMIN'
            };

            const result = await registerUser(userData);

            setSuccess(true);
            setRegisteredUser(result);

            // Reset form
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Success Message */}
                {success && registeredUser && (
                    <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg animate-bounce">
                        <div className="flex items-center gap-3">
                            <CheckCircle size={24} />
                            <div>
                                <h3 className="font-bold text-lg">🎉 Registration Successful!</h3>
                                <p className="text-green-100 text-sm">
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

                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
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
                            {/* Email Field */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    Email Address
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 text-sm bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                    placeholder="your.email@example.com"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-indigo-500" />
                                        First Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 text-sm bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="John"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-indigo-500" />
                                        Last Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 text-sm bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="Doe"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock size={16} className="text-purple-500" />
                                    Password
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-3 pr-12 text-sm bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="Enter secure password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
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

                            {/* Confirm Password Field */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock size={16} className="text-purple-500" />
                                    Confirm Password
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 pr-12 text-sm bg-gray-50/50 border-2 rounded-xl focus:bg-white transition-all duration-300 hover:border-gray-300 ${
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <UserPlus size={16} className="text-blue-500" />
                                    <span className="text-sm text-gray-600">Account Type:</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        USER
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
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

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors hover:underline">
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