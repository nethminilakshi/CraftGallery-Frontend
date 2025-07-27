import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Calendar, User, Tag, ArrowLeft, RefreshCw } from 'lucide-react';
import { getUserFromToken } from '../../../Auth/auth.ts';
import type { UserData } from '../../../model/userData.ts';
import { backendApi } from '../../../api.ts';

// Extended UserData interface to include email and JWT properties
interface ExtendedUserData extends UserData {
    email: string;
    exp?: number; // JWT expiration timestamp
    iat?: number; // JWT issued at timestamp (optional)
}

// Project interface
interface Project {
    _id?: string;
    id: string;
    title: string;
    category: string;
    description: string;
    materials: string[];
    steps: string[];
    imageUrl?: string;
    author: string;
    uprloadedUserEmail: string;
    createdAt: string;
    updatedAt?: string;
}

// Constants
const SESSION_DURATION_HOURS = 24;
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;

// Helper functions
const isSessionExpired = (loginTime?: number): boolean => {
    if (!loginTime) return false;
    const currentTime = Date.now();
    const sessionDuration = currentTime - loginTime;
    return sessionDuration >= SESSION_DURATION_MS;
};

const isTokenExpired = (exp?: number): boolean => {
    if (!exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= exp;
};

const MyProjects = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<ExtendedUserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Check authentication
    useEffect(() => {
        console.log('🔐 Authentication check started');

        const checkAuthentication = () => {
            const token = localStorage.getItem('token');
            const loginTime = localStorage.getItem('loginTime');

            console.log('🔑 Token from localStorage:', !!token);
            console.log('⏰ LoginTime from localStorage:', loginTime);

            if (!token) {
                console.log('❌ No token found - redirecting to login');
                alert('Please log in to view your projects');
                navigate('/login');
                return;
            }

            // Check if 24 hours have passed since login
            if (loginTime && isSessionExpired(parseInt(loginTime))) {
                console.log('⏰ Session expired - clearing localStorage');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                localStorage.removeItem('loginTime');
                alert(`Your session has expired after ${SESSION_DURATION_HOURS} hours. Please log in again.`);
                navigate('/login');
                return;
            }

            try {
                const userData = getUserFromToken(token) as ExtendedUserData;
                console.log('👤 Decoded user data:', userData);

                if (isTokenExpired(userData.exp)) {
                    console.log('🕐 JWT token expired - clearing localStorage');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('loginTime');
                    alert('Your session token has expired. Please log in again.');
                    navigate('/login');
                    return;
                }

                if (userData && userData.email) {
                    const userWithLoginTime = {
                        ...userData,
                        loginTime: loginTime ? parseInt(loginTime) : Date.now()
                    };
                    console.log('✅ Authentication successful, setting user:', userWithLoginTime);
                    setCurrentUser(userWithLoginTime);
                    setIsAuthenticated(true);
                } else {
                    console.log('❌ Invalid user data - no email found');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('loginTime');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                }
            } catch (error) {
                console.error('❌ Token parsing error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                localStorage.removeItem('loginTime');
                alert('Invalid session. Please log in again.');
                navigate('/login');
            }
        };

        checkAuthentication();
    }, [navigate]);

    // Fetch user's projects
    useEffect(() => {
        const fetchMyProjects = async () => {
            console.log('🚀 fetchMyProjects called');
            console.log('- isAuthenticated:', isAuthenticated);
            console.log('- currentUser:', currentUser);

            if (!isAuthenticated) {
                console.log('❌ Not authenticated, skipping fetch');
                return;
            }

            if (!currentUser) {
                console.log('❌ No current user, skipping fetch');
                return;
            }

            console.log('✅ Starting to fetch projects...');
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                console.log('🔑 Token exists:', !!token);
                console.log('📧 User email:', currentUser.email);

                const url = `/project/user/${encodeURIComponent(currentUser.email)}`;
                console.log('🌐 API URL:', url);
                console.log('🌐 Full URL will be:', `${backendApi.defaults.baseURL}${url}`);

                const response = await backendApi.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('✅ Raw API Response:', response);
                console.log('✅ Response Status:', response.status);
                console.log('✅ Response Data:', response.data);

                if (response.data && response.data.success) {
                    const projectsData = response.data.projects || [];
                    console.log('📊 Projects array:', projectsData);
                    console.log('📊 Projects count:', projectsData.length);
                    setProjects(projectsData);
                } else {
                    console.log('⚠️ API returned success: false or no data');
                    setError('Failed to fetch projects - API returned success: false');
                }
            } catch (error: any) {
                console.error('❌ API Call Failed:', error);
                console.error('❌ Error message:', error.message);

                if (error.response) {
                    console.error('❌ Response status:', error.response.status);
                    console.error('❌ Response data:', error.response.data);
                    console.error('❌ Response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('❌ No response received:', error.request);
                } else {
                    console.error('❌ Request setup error:', error.message);
                }

                if (error.response?.status === 401) {
                    console.log('🔒 Unauthorized - redirecting to login');
                    alert('Session expired. Please log in again.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    console.log('📭 No projects found (404)');
                    setProjects([]);
                    setError(null);
                } else {
                    const errorMessage = `Failed to load projects: ${error.response?.data?.error || error.message}`;
                    console.log('💥 Setting error:', errorMessage);
                    setError(errorMessage);
                }
            } finally {
                console.log('🏁 Setting loading to false');
                setLoading(false);
            }
        };

        fetchMyProjects();
    }, [isAuthenticated, currentUser, navigate]);

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // ✅ Updated delete endpoint to match your backend route structure
            await backendApi.delete(`/project/delete/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove project from local state
            setProjects(projects.filter(p => p.id !== projectId && p._id !== projectId));
            alert('Project deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting project:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            } else {
                alert('Failed to delete project. Please try again.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('loginTime');
        alert('Successfully logged out!');
        navigate('/login');
    };

    const refreshProjects = () => {
        window.location.reload();
    };

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Home
                            </button>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                My Projects
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshProjects}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                                {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-lg">{currentUser.username || 'User'}</p>
                            <p className="text-sm text-gray-600">{currentUser.email}</p>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your projects...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-2xl shadow-lg mb-6">
                        <p className="font-semibold">Error: {error}</p>
                        <button
                            onClick={refreshProjects}
                            className="mt-2 text-red-100 hover:text-white underline text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && !error && (
                    <>
                        {projects.length === 0 ? (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <span className="text-white text-3xl">📝</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-4">No Projects to View</h3>
                                <p className="text-gray-600 mb-6">
                                    You haven't uploaded any projects yet. Start creating and sharing your amazing ideas!
                                </p>
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Create Your First Project
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <p className="text-gray-700 font-medium">
                                        Found <span className="font-bold text-purple-600">{projects.length}</span> project{projects.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project) => (
                                        <div key={project.id || project._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            {/* Project Image */}
                                            <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                                                {project.imageUrl ? (
                                                    <img
                                                        src={project.imageUrl}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerHTML = '<div class="text-gray-400 text-6xl">🖼️</div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-6xl">🖼️</div>
                                                )}
                                            </div>

                                            {/* Project Info */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                                                    {project.title}
                                                </h3>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <Tag size={16} className="text-purple-600" />
                                                    <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                                        {project.category}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <User size={16} className="text-gray-500" />
                                                    <span className="text-sm text-gray-600">{project.author}</span>
                                                </div>

                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                    {project.description}
                                                </p>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <Calendar size={16} className="text-gray-500" />
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewProject(project)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id || project._id!)}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Project Detail Modal */}
                {showModal && selectedProject && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                {selectedProject.imageUrl && (
                                    <div className="mb-6">
                                        <img
                                            src={selectedProject.imageUrl}
                                            alt={selectedProject.title}
                                            className="w-full h-64 object-cover rounded-2xl"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Info</h3>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Category:</span> {selectedProject.category}</p>
                                            <p><span className="font-medium">Author:</span> {selectedProject.author}</p>
                                            <p><span className="font-medium">Created:</span> {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Description</h4>
                                        <p className="text-gray-600">{selectedProject.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Materials</h4>
                                        <ul className="list-disc list-inside space-y-1 mb-6">
                                            {selectedProject.materials.map((material, index) => (
                                                <li key={index} className="text-gray-600">{material}</li>
                                            ))}
                                        </ul>

                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Steps</h4>
                                        <ol className="list-decimal list-inside space-y-2">
                                            {selectedProject.steps.map((step, index) => (
                                                <li key={index} className="text-gray-600">{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProjects;