import React, { useState, useEffect } from 'react';
import {Upload, Plus, X, CheckCircle, AlertCircle, Sparkles, Heart, Mail, Send} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../slices/rootReducer';
import { getAllCategories } from '../../../slices/homeSlice';
import { uploadProject, clearUploadState, clearError, testEmail } from '../../../slices/projectUploadSlice';
import type { AppDispatch } from '../../../store/store';
import { getUserFromToken } from '../../../Auth/auth.ts';
import type { UserData } from '../../../model/userData.ts';

// Extended UserData interface to include email and expiration
interface ExtendedUserData extends UserData {
    email: string;
    exp?: number; // JWT expiration timestamp
}

// Interface for category data
interface CategoryData {
    category: string;
}

// Type for categories array
type CategoriesArray = (CategoryData | string)[];

// Helper function to check if token is expired
const isTokenExpired = (exp?: number): boolean => {
    if (!exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= exp;
};

const ProjectUploadForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Check if user is logged in and get user data
    const [currentUser, setCurrentUser] = useState<ExtendedUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Get categories from Redux store
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError
    } = useSelector((state: RootState) => state.categories || state.projectUpload || {}) as {
        categories?: CategoriesArray;
        loading?: boolean;
        error?: string;
    };

    // Get upload state from Redux store - Updated to include email fields
    const {
        loading: uploadLoading,
        error: uploadError,
        success: uploadSuccess,
        uploadedProject,
        emailSent,
        successMessage
    } = useSelector((state: RootState) => state.projectUpload);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        materials: [''],
        steps: [''],
        imageUrl: '',
        author: ''
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [showEmailTest, setShowEmailTest] = useState(false);

    // Check authentication and token expiration on component mount
    useEffect(() => {
        const checkAuthentication = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Please log in to upload projects');
                navigate('/login');
                return;
            }

            try {
                const userData = getUserFromToken(token) as ExtendedUserData;

                if (isTokenExpired(userData.exp)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    alert('Your session has expired after 24 hours. Please log in again.');
                    navigate('/login');
                    return;
                }

                if (userData && userData.email) {
                    setCurrentUser(userData);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Token parsing error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                alert('Invalid session. Please log in again.');
                navigate('/login');
            }
        };

        checkAuthentication();

        const tokenCheckInterval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = getUserFromToken(token) as ExtendedUserData;
                    if (isTokenExpired(userData.exp)) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('username');
                        localStorage.removeItem('role');
                        alert('Your session has expired after 24 hours. Please log in again.');
                        navigate('/login');
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    navigate('/login');
                }
            }
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(tokenCheckInterval);
        };
    }, [navigate]);

    useEffect(() => {
        if (isAuthenticated && (!categories || categories.length === 0) && !categoriesLoading) {
            dispatch(getAllCategories());
        }
    }, [dispatch, categories, categoriesLoading, isAuthenticated]);

    // Handle upload success - Updated to show email confirmation
    useEffect(() => {
        if (uploadSuccess && uploadedProject) {
            setShowSuccessMessage(true);
            // Reset form
            setFormData({
                title: '',
                category: '',
                description: '',
                materials: [''],
                steps: [''],
                imageUrl: '',
                author: ''
            });

            // Hide success message after 8 seconds (longer to show email status)
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
                dispatch(clearUploadState());
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [uploadSuccess, uploadedProject, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        if (uploadError) {
            dispatch(clearError());
        }
    };

    const updateArray = (index: number, value: string, field: 'materials' | 'steps') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({...formData, [field]: newArray});
    };

    const addItem = (field: 'materials' | 'steps') => {
        setFormData({...formData, [field]: [...formData[field], '']});
    };

    const removeItem = (index: number, field: 'materials' | 'steps') => {
        if (formData[field].length > 1) {
            const newArray = formData[field].filter((_: string, i: number) => i !== index);
            setFormData({...formData, [field]: newArray});
        }
    };

    const validateForm = () => {
        const requiredFields = ['title', 'category', 'description', 'author'];
        const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

        if (emptyFields.length > 0) {
            return `Please fill in: ${emptyFields.join(', ')}`;
        }

        const validMaterials = formData.materials.filter(m => m.trim());
        const validSteps = formData.steps.filter(s => s.trim());

        if (validMaterials.length === 0) {
            return 'Please add at least one material';
        }

        if (validSteps.length === 0) {
            return 'Please add at least one step';
        }

        return null;
    };

    const handleSubmit = async () => {
        if (!isAuthenticated || !currentUser) {
            alert('Please log in to upload projects');
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = getUserFromToken(token) as ExtendedUserData;
                if (isTokenExpired(userData.exp)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                    return;
                }
            } catch (error) {
                console.error('Token validation error:', error);
                alert('Session validation failed. Please log in again.');
                navigate('/login');
                return;
            }
        }

        const validationError = validateForm();
        if (validationError) {
            alert(validationError);
            return;
        }

        // Sanitize imageUrl
        const sanitizedImageUrl = formData.imageUrl.trim().replace(/['"]/g, '');

        const projectData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: formData.title,
            category: formData.category,
            description: formData.description,
            materials: formData.materials.filter((m: string) => m.trim()),
            steps: formData.steps.filter((s: string) => s.trim()),
            imageUrl: sanitizedImageUrl,
            author: formData.author,
            uploadedUserEmail: currentUser.email
        };

        try {
            await dispatch(uploadProject(projectData));
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    // Test email functionality
    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            alert('Please enter an email address');
            return;
        }

        try {
            await dispatch(testEmail(testEmailAddress));
            setTestEmailAddress('');
            alert('Test email sent! Check your inbox.');
        } catch (error) {
            console.error('Test email error:', error);
            alert('Failed to send test email');
        }
    };

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/30 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-purple-100 to-blue-200 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Enhanced Success Message with Email Status */}
                {showSuccessMessage && uploadedProject && (
                    <div className="mb-8 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-6 rounded-3xl shadow-2xl animate-bounce">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-full">
                                <CheckCircle size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <Sparkles size={20} />
                                    Project Created Successfully!
                                    <Heart size={20} className="text-pink-200" />
                                </h3>
                                <p className="text-green-100 text-sm font-medium mb-2">
                                    "{uploadedProject.title}" has been shared with the community!
                                </p>
                                {/* Email Status Indicator */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail size={16} />
                                    <span className={emailSent ? "text-green-100" : "text-yellow-200"}>
                                        {emailSent
                                            ? "📧 Confirmation email sent to your inbox!"
                                            : "📤 Sending confirmation email..."}
                                    </span>
                                </div>
                                {successMessage && (
                                    <p className="text-xs text-green-200 mt-1">{successMessage}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div className="mb-8 bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-3xl shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Upload Failed</h3>
                                    <p className="text-red-100 text-sm">{uploadError}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => dispatch(clearError())}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Form Container */}
                <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 overflow-hidden">

                    {/* Header with User Info and Email Test */}
                    <div className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-blue-600 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-4 left-8 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="absolute top-12 right-12 w-16 h-16 bg-fuchsia-300/20 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-4 left-1/3 w-12 h-12 bg-purple-300/20 rounded-full animate-pulse"></div>
                        </div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                    <Sparkles className="text-yellow-300" size={32} />
                                    Create New Project
                                    <Heart className="text-pink-300" size={28} />
                                </h1>
                                <p className="text-purple-100 text-lg font-medium">
                                    Share your amazing ideas with the world
                                </p>
                            </div>

                            {/* User Info & Email Test */}
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <p className="font-bold text-white text-lg">Welcome, {currentUser.username || 'Creator'}!</p>
                                            <p className="text-purple-200 text-sm">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    {currentUser.exp && (
                                        <p className="text-xs text-purple-300">
                                            Session expires: {new Date(currentUser.exp * 1000).toLocaleString()}
                                        </p>
                                    )}

                                    {/* Email Test Button (Development) */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={() => setShowEmailTest(!showEmailTest)}
                                            className="mt-2 text-xs text-purple-200 hover:text-white underline"
                                        >
                                            Test Email 📧
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Email Test Section (Development Only) */}
                        {showEmailTest && process.env.NODE_ENV === 'development' && (
                            <div className="mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <h4 className="text-white font-medium mb-2">Test Email Functionality</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={testEmailAddress}
                                        onChange={(e) => setTestEmailAddress(e.target.value)}
                                        placeholder="Enter email to test"
                                        className="flex-1 px-3 py-2 rounded-lg text-gray-800 text-sm"
                                    />
                                    <button
                                        onClick={handleTestEmail}
                                        disabled={uploadLoading}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Send size={14} />
                                        Send Test
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Content - Keep all your existing form fields */}
                    <div className="p-8 space-y-8" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

                        {/* Project Title */}
                        <div className="group">
                            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Project Title
                                <span className="text-red-500 text-xl">*</span>
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-4 text-base bg-gradient-to-r from-white to-purple-50 border-3 border-purple-200 rounded-2xl focus:border-fuchsia-400 focus:shadow-lg focus:shadow-fuchsia-200/50 transition-all duration-300 hover:border-purple-300 hover:shadow-md"
                                placeholder="What's your amazing project called? "
                                disabled={uploadLoading}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="group">
                            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Category
                                <span className="text-red-500 text-xl">*</span>
                                {categoriesLoading && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-fuchsia-600"></div>
                                )}
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-4 text-base bg-gradient-to-r from-white to-blue-50 border-3 border-blue-200 rounded-2xl focus:border-purple-400 focus:shadow-lg focus:shadow-purple-200/50 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                                disabled={categoriesLoading || uploadLoading}
                                required
                            >
                                <option value="">
                                    {categoriesLoading
                                        ? 'Loading categories...'
                                        : categoriesError
                                            ? 'Error loading categories'
                                            : 'Choose your category... '
                                    }
                                </option>
                                {!categoriesLoading && !categoriesError && categories && categories.map((categoryObj: CategoryData | string, index: number) => (
                                    <option key={index} value={typeof categoryObj === 'string' ? categoryObj : categoryObj.category}>
                                        {typeof categoryObj === 'string' ? categoryObj : categoryObj.category}
                                    </option>
                                ))}
                            </select>
                            {categoriesError && (
                                <p className="text-sm text-red-500 mt-2">
                                    Failed to load categories. Please refresh the page.
                                </p>
                            )}
                        </div>

                        {/* Author */}
                        <div className="group">
                            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Author
                                <span className="text-red-500 text-xl">*</span>
                            </label>
                            <input
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                className="w-full p-4 text-base bg-gradient-to-r from-white to-fuchsia-50 border-3 border-fuchsia-200 rounded-2xl focus:border-purple-400 focus:shadow-lg focus:shadow-purple-200/50 transition-all duration-300 hover:border-fuchsia-300 hover:shadow-md"
                                placeholder="Who's the creative genius behind this? "
                                disabled={uploadLoading}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="group">
                            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Description
                                <span className="text-red-500 text-xl">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-4 text-base bg-gradient-to-r from-white to-purple-50 border-3 border-purple-200 rounded-2xl focus:border-fuchsia-400 focus:shadow-lg focus:shadow-fuchsia-200/50 transition-all duration-300 hover:border-purple-300 hover:shadow-md resize-none"
                                rows={4}
                                placeholder="Tell us what makes your project special... "
                                disabled={uploadLoading}
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div className="group">
                            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Image URL
                            </label>
                            <input
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                className="w-full p-4 text-base bg-gradient-to-r from-white to-blue-50 border-3 border-blue-200 rounded-2xl focus:border-purple-400 focus:shadow-lg focus:shadow-purple-200/50 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                                placeholder="https://your-awesome-image.jpg "
                                disabled={uploadLoading}
                            />
                        </div>

                        {/* Materials Section */}
                        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 p-6 rounded-3xl border-3 border-orange-200 shadow-lg">
                            <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Materials Needed
                                <span className="text-red-500 text-xl">*</span>
                            </label>
                            {formData.materials.map((material: string, index: number) => (
                                <div key={index} className="flex gap-3 mb-3">
                                    <input
                                        value={material}
                                        onChange={(e) => updateArray(index, e.target.value, 'materials')}
                                        className="flex-1 p-3 text-base bg-white border-2 border-orange-300 rounded-xl focus:border-pink-400 focus:shadow-lg focus:shadow-pink-200/30 transition-all duration-200"
                                        placeholder={`Material ${index + 1} (e.g., Wood, Paint, Screws...) 🔨`}
                                        disabled={uploadLoading}
                                    />
                                    {formData.materials.length > 1 && (
                                        <button
                                            onClick={() => removeItem(index, 'materials')}
                                            className="p-3 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-300"
                                            disabled={uploadLoading}
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addItem('materials')}
                                className="flex items-center gap-2 px-6 py-3 text-base text-orange-600 bg-white hover:bg-orange-50 rounded-xl transition-all duration-200 font-bold border-2 border-orange-200 hover:border-orange-300 shadow-md hover:shadow-lg disabled:opacity-50"
                                disabled={uploadLoading}
                            >
                                <Plus size={18} /> Add Another Material
                            </button>
                        </div>

                        {/* Steps Section */}
                        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-3xl border-3 border-green-200 shadow-lg">
                            <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <span className="text-2xl"></span>
                                Step-by-Step Instructions
                                <span className="text-red-500 text-xl">*</span>
                            </label>
                            {formData.steps.map((step: string, index: number) => (
                                <div key={index} className="flex gap-3 mb-4">
                                    <div className="mt-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-full min-w-[36px] text-center font-bold shadow-lg">
                                        {index + 1}
                                    </div>
                                    <textarea
                                        value={step}
                                        onChange={(e) => updateArray(index, e.target.value, 'steps')}
                                        className="flex-1 p-3 text-base bg-white border-2 border-green-300 rounded-xl focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-200/30 transition-all duration-200 resize-none"
                                        rows={3}
                                        placeholder={`Step ${index + 1}: Describe what to do... `}
                                        disabled={uploadLoading}
                                    />
                                    {formData.steps.length > 1 && (
                                        <button
                                            onClick={() => removeItem(index, 'steps')}
                                            className="mt-2 p-3 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-300"
                                            disabled={uploadLoading}
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addItem('steps')}
                                className="flex items-center gap-2 px-6 py-3 text-base text-green-600 bg-white hover:bg-green-50 rounded-xl transition-all duration-200 font-bold border-2 border-green-200 hover:border-green-300 shadow-md hover:shadow-lg disabled:opacity-50"
                                disabled={uploadLoading}
                            >
                                <Plus size={18} /> Add Another Step
                            </button>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex flex-col items-center">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={uploadLoading || categoriesLoading}
                                className="w-[250px] bg-gradient-to-r from-fuchsia-600 via-purple-700 to-blue-600 hover:from-fuchsia-700 hover:via-purple-800 hover:to-blue-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 rounded-3xl transition-all duration-300 flex items-center justify-center gap-4 text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none border border-white/20"
                            >
                                {uploadLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        <span>Creating magic... ✨</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        <span>Launch Your Project!</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectUploadForm;