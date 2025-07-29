import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Calendar, User, Tag, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { getUserFromToken, isTokenExpired } from '../../../Auth/auth.ts'; // Added isTokenExpired import
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
    uprloadedUserEmail: string; // Fixed typo: uploadedUserEmail
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

// Removed duplicate isTokenExpired function since we're importing it from auth.ts

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
        console.log('Authentication check started');

        const checkAuthentication = () => {
            const token = localStorage.getItem('token');
            const loginTime = localStorage.getItem('loginTime');

            console.log('Token from localStorage:', !!token);
            console.log('LoginTime from localStorage:', loginTime);

            if (!token) {
                console.log(' No token found - redirecting to login');
                alert('Please log in to view your projects');
                navigate('/login');
                return;
            }

            // Check if 24 hours have passed since login
            if (loginTime && isSessionExpired(parseInt(loginTime))) {
                console.log(' Session expired - clearing localStorage');
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

                // Using imported isTokenExpired function
                if (isTokenExpired(token)) {
                    console.log(' JWT token expired - clearing localStorage');
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
                    console.log(' Authentication successful, setting user:', userWithLoginTime);
                    setCurrentUser(userWithLoginTime);
                    setIsAuthenticated(true);
                } else {
                    console.log(' Invalid user data - no email found');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('loginTime');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                }
            } catch (error) {
                console.error(' Token parsing error:', error);
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
            console.log(' fetchMyProjects called');
            console.log('- isAuthenticated:', isAuthenticated);
            console.log('- currentUser:', currentUser);

            if (!isAuthenticated) {
                console.log(' Not authenticated, skipping fetch');
                return;
            }

            if (!currentUser) {
                console.log('No current user, skipping fetch');
                return;
            }

            console.log(' Starting to fetch projects...');
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                console.log(' Token exists:', !!token);
                console.log('User email:', currentUser.email);

                const url = `/project/user/${encodeURIComponent(currentUser.email)}`;
                console.log(' API URL:', url);
                console.log(' Full URL will be:', `${backendApi.defaults.baseURL}${url}`);

                const response = await backendApi.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log(' Raw API Response:', response);
                console.log(' Response Status:', response.status);
                console.log(' Response Data:', response.data);

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
                console.error(' API Call Failed:', error);
                console.error(' Error message:', error.message);

                if (error.response) {
                    console.error(' Response status:', error.response.status);
                    console.error(' Response data:', error.response.data);
                    console.error(' Response headers:', error.response.headers);
                } else if (error.request) {
                    console.error(' No response received:', error.request);
                } else {
                    console.error(' Request setup error:', error.message);
                }

                if (error.response?.status === 401) {
                    console.log(' Unauthorized - redirecting to login');
                    alert('Session expired. Please log in again.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    console.log('📭 No projects found (404)');
                    setProjects([]);
                    setError(null);
                } else {
                    const errorMessage = `Failed to load projects: ${error.response?.data?.error || error.message}`;
                    console.log(' Setting error:', errorMessage);
                    setError(errorMessage);
                }
            } finally {
                console.log(' Setting loading to false');
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
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/40 p-10 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-sm font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-6">

                            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                My Projects
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshProjects}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>

                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4">

                        <div>
                            <p className="font-bold text-gray-800 text-xl">{currentUser.username || 'User'}</p>
                            <p className="text-sm text-gray-600 font-medium">{currentUser.email}</p>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 border border-white/40 text-center shadow-xl">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto mb-6"></div>
                        <p className="text-gray-600 text-sm font-medium">Loading your projects...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-3xl shadow-xl mb-8">
                        <p className="font-semibold text-sm">Error: {error}</p>
                        <button
                            onClick={refreshProjects}
                            className="mt-3 text-red-100 hover:text-white underline text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && !error && (
                    <>
                        {projects.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-16 border border-white/40 text-center shadow-xl">
                                <div className="w-32 h-32 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-5xl">📝</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-700 mb-6">No Projects to View</h3>
                                <p className="text-gray-600 mb-8 text-sm max-w-md mx-auto leading-relaxed">
                                    You haven't uploaded any projects yet. Start creating and sharing your amazing ideas with the community!
                                </p>
                                <button
                                    onClick={() => navigate('/addProjects')}
                                    className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-sm"
                                >
                                    Create Your First Project
                                </button>
                                <div className="flex items-center gap-6 py-4">
                                    {/* Buttons side by side */}
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Home
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-lg">
                                    <p className="text-gray-700 font-semibold text-sm">
                                        Found <span className="font-bold text-pink-600 text-base">{projects.length}</span> project{projects.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {projects.map((project) => (
                                        <div key={project.id || project._id} className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                                            {/* Project Image */}
                                            <div className="h-52 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
                                                {project.imageUrl ? (
                                                    <img
                                                        src={project.imageUrl}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerHTML = '<div class="text-gray-400 text-6xl">🖼️</div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-6xl group-hover:scale-110 transition-transform duration-500">🖼️</div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>

                                            {/* Project Info */}
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold text-gray-800 mb-3 truncate group-hover:text-purple-600 transition-colors duration-300">
                                                    {project.title}
                                                </h3>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <Tag size={14} className="text-purple-600" />
                                                    <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold">
                                                        {project.category}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <User size={14} className="text-gray-500" />
                                                    <span className="text-xs text-gray-600 font-medium">{project.author}</span>
                                                </div>

                                                <p className="text-gray-600 text-xs mb-4 line-clamp-3 leading-relaxed">
                                                    {project.description}
                                                </p>

                                                <div className="flex items-center gap-2 mb-5">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleViewProject(project)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id || project._id!)}
                                                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Trash2 size={14} />
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/50">
                            <div className="bg-gradient-to-r from-black-100 via-white to-gray-200 p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedProject.title}</h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-600 hover:bg-gray-200/50 rounded-full p-2 transition-all duration-300 hover:scale-110"
                                    >
                                        <span className="text-xl">✕</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {selectedProject.imageUrl && (
                                    <div className="mb-8 flex justify-center">
                                        <div className="w-full max-w-2xl">
                                            <img
                                                src={selectedProject.imageUrl}
                                                alt={selectedProject.title}
                                                className="w-full h-80 object-cover rounded-3xl shadow-xl"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Project Info</h3>
                                        <div className="space-y-3 mb-6">
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Category:</span> <span className="text-purple-600 font-medium">{selectedProject.category}</span></p>
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Author:</span> <span className="text-gray-600">{selectedProject.author}</span></p>
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Created:</span> <span className="text-gray-600">{new Date(selectedProject.createdAt).toLocaleDateString()}</span></p>
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Description</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl">{selectedProject.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Materials</h4>
                                        <ul className="list-disc list-inside space-y-2 mb-8 bg-pink-50 p-4 rounded-2xl">
                                            {selectedProject.materials.map((material, index) => (
                                                <li key={index} className="text-gray-600 text-sm">{material}</li>
                                            ))}
                                        </ul>

                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Steps</h4>
                                        <ol className="list-decimal list-inside space-y-3 bg-blue-50 p-4 rounded-2xl">
                                            {selectedProject.steps.map((step, index) => (
                                                <li key={index} className="text-gray-600 text-sm leading-relaxed">{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProjects;