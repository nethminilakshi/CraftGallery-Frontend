import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Calendar, User, Tag, ArrowLeft, RefreshCw, LogOut, Edit, Save, X } from 'lucide-react';
import { getUserFromToken, isTokenExpired } from '../../../Auth/auth.ts';
import type { UserData } from '../../../model/userData.ts';
import { backendApi } from '../../../api.ts';

interface ExtendedUserData extends UserData {
    email: string;
    exp?: number;
    iat?: number;
}

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

const SESSION_DURATION_HOURS = 24;
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;

const isSessionExpired = (loginTime?: number): boolean => {
    if (!loginTime) return false;
    const currentTime = Date.now();
    const sessionDuration = currentTime - loginTime;
    return sessionDuration >= SESSION_DURATION_MS;
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

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {

        const checkAuthentication = () => {
            const token = localStorage.getItem('token');
            const loginTime = localStorage.getItem('loginTime');



            if (!token) {
                alert('Please log in to view your projects');
                navigate('/login');
                return;
            }

            if (loginTime && isSessionExpired(parseInt(loginTime))) {
                console.log('Session expired - clearing localStorage');
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

                if (isTokenExpired(token)) {
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
                    setCurrentUser(userWithLoginTime);
                    setIsAuthenticated(true);
                } else {
                    console.log('Invalid user data - no email found');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('loginTime');
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error parsing token or user data:', error);
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
            if (!isAuthenticated) {
                console.log('Not authenticated, skipping fetch');
                return;
            }

            if (!currentUser) {
                console.log('No current user, skipping fetch');
                return;
            }

            console.log('Starting to fetch projects...');
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                const url = `/project/user/${encodeURIComponent(currentUser.email)}`;

                const response = await backendApi.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data && response.data.success) {
                    const projectsData = response.data.projects || [];

                    setProjects(projectsData);
                } else {
                    setError('Failed to fetch projects - API returned success: false');
                }
            } catch (error: any) {

                if (error.response?.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    setProjects([]);
                    setError(null);
                } else {
                    const errorMessage = `Failed to load projects: ${error.response?.data?.error || error.message}`;
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMyProjects();
    }, [isAuthenticated, currentUser, navigate]);

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setEditingProject({ ...project });
        setIsEditMode(false);
        setShowModal(true);
    };

    const handleEditProject = () => {
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingProject(selectedProject ? { ...selectedProject } : null);
    };

    const handleUpdateProject = async () => {
        if (!editingProject || !selectedProject) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const projectId = editingProject.id || editingProject._id;

            const updateData = {
                title: editingProject.title,
                category: editingProject.category,
                description: editingProject.description,
                materials: editingProject.materials,
                steps: editingProject.steps,
                author: editingProject.author
            };

            console.log('Updating project:', projectId, updateData);

            const response = await backendApi.put(`/project/update/${projectId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Update response:', response.data);

            if (response.data && response.data.success) {
                const updatedProjects = projects.map(p =>
                    (p.id === projectId || p._id === projectId)
                        ? { ...p, ...updateData, updatedAt: new Date().toISOString() }
                        : p
                );
                setProjects(updatedProjects);

                const updatedProject = { ...editingProject, updatedAt: new Date().toISOString() };
                setSelectedProject(updatedProject);
                setEditingProject(updatedProject);
                setIsEditMode(false);

                alert('Project updated successfully!');
            } else {
                throw new Error(response.data?.message || 'Update failed');
            }
        } catch (error: any) {
            console.error('Error updating project:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            } else {
                alert(`Failed to update project: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            await backendApi.delete(`/project/delete/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProjects(projects.filter(p => p.id !== projectId && p._id !== projectId));

            if (selectedProject && (selectedProject.id === projectId || selectedProject._id === projectId)) {
                setShowModal(false);
                setSelectedProject(null);
                setEditingProject(null);
                setIsEditMode(false);
            }

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

    const handleInputChange = (field: keyof Project, value: string | string[]) => {
        if (!editingProject) return;
        setEditingProject({ ...editingProject, [field]: value });
    };

    const handleArrayFieldChange = (field: 'materials' | 'steps', index: number, value: string) => {
        if (!editingProject) return;
        const newArray = [...editingProject[field]];
        newArray[index] = value;
        setEditingProject({ ...editingProject, [field]: newArray });
    };

    const addArrayItem = (field: 'materials' | 'steps') => {
        if (!editingProject) return;
        const newArray = [...editingProject[field], ''];
        setEditingProject({ ...editingProject, [field]: newArray });
    };

    const removeArrayItem = (field: 'materials' | 'steps', index: number) => {
        if (!editingProject) return;
        const newArray = editingProject[field].filter((_, i) => i !== index);
        setEditingProject({ ...editingProject, [field]: newArray });
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

                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                                    {project.description}
                                                </p>

                                                <div className="flex items-center gap-2 mb-5">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewProject(project)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id || project._id!)}
                                                        className="px-3 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

                {/* Project Detail/Edit Modal */}
                {showModal && selectedProject && editingProject && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/50">
                            <div className="bg-gradient-to-r from-gray-100 via-white to-gray-200 p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {isEditMode ? 'Edit Project' : selectedProject.title}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {!isEditMode ? (
                                            <button
                                                onClick={handleEditProject}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-semibold transition-all duration-300"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleUpdateProject}
                                                    disabled={updating}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800 to-emerald-300 hover:from-pink-600 hover:to-white-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                                                >
                                                    <Save size={16} />
                                                    {updating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-300"
                                                >
                                                    <X size={16} />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setIsEditMode(false);
                                                setEditingProject(null);
                                            }}
                                            className="text-gray-600 hover:bg-gray-200/50 rounded-full p-2 transition-all duration-300 hover:scale-110"
                                        >
                                            <span className="text-xl">✕</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {selectedProject.imageUrl && (
                                    <div className="mb-8 flex justify-center">
                                        <div className="pb-6 flex justify-center w-full max-w-2xl">
                                            <img
                                                src={selectedProject.imageUrl}
                                                alt={selectedProject.title}
                                                className="w-80 h-80 object-cover rounded-3xl shadow-xl"
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

                                        {isEditMode ? (
                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-base font-semibold text-gray-700 mb-2">Title</label>
                                                    <input
                                                        type="text"
                                                        value={editingProject.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        className=" text-sm w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-base font-semibold text-gray-700 mb-2">Category</label>
                                                    <input
                                                        type="text"
                                                        value={editingProject.category}
                                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                                        className="text-sm w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-base font-semibold text-gray-700 mb-2">Author</label>
                                                    <input
                                                        type="text"
                                                        value={editingProject.author}
                                                        onChange={(e) => handleInputChange('author', e.target.value)}
                                                        className="text-sm w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 mb-6">
                                                <p className="text-sm"><span className="font-semibold text-gray-700">Category:</span> <span className="text-purple-600 font-medium">{selectedProject.category}</span></p>
                                                <p className="text-sm"><span className="font-semibold text-gray-700">Author:</span> <span className="text-gray-600">{selectedProject.author}</span></p>
                                                <p className="text-sm"><span className="font-semibold text-gray-700">Created:</span> <span className="text-gray-600">{new Date(selectedProject.createdAt).toLocaleDateString()}</span></p>
                                                {selectedProject.updatedAt && (
                                                    <p className="text-sm"><span className="font-semibold text-gray-700">Last Updated:</span> <span className="text-gray-600">{new Date(selectedProject.updatedAt).toLocaleDateString()}</span></p>
                                                )}
                                            </div>
                                        )}

                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Description</h4>
                                        {isEditMode ? (
                                            <textarea
                                                value={editingProject.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                rows={4}
                                                className="text-sm w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            />
                                        ) : (
                                            <p className="text-gray-600 text-base leading-relaxed bg-gray-50 p-4 rounded-2xl">{selectedProject.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Materials</h4>
                                        {isEditMode ? (
                                            <div className="bg-pink-50 p-4 rounded-2xl mb-8">
                                                {editingProject.materials.map((material, index) => (
                                                    <div key={index} className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={material}
                                                            onChange={(e) => handleArrayFieldChange('materials', index, e.target.value)}
                                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                            placeholder="Enter material"
                                                        />
                                                        <button
                                                            onClick={() => removeArrayItem('materials', index)}
                                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addArrayItem('materials')}
                                                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors text-sm"
                                                >
                                                    + Add Material
                                                </button>
                                            </div>
                                        ) : (
                                            <ul className="list-disc list-inside space-y-2 mb-8 bg-pink-50 p-4 rounded-2xl">
                                                {selectedProject.materials.map((material, index) => (
                                                    <li key={index} className="text-gray-600 text-sm">{material}</li>
                                                ))}
                                            </ul>
                                        )}

                                        <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Steps</h4>
                                        {isEditMode ? (
                                            <div className="bg-blue-50 p-4 rounded-2xl">
                                                {editingProject.steps.map((step, index) => (
                                                    <div key={index} className="flex gap-2 mb-3">
                                                        <span className="text-sm font-semibold text-gray-600 mt-2 min-w-[20px]">{index + 1}.</span>
                                                        <textarea
                                                            value={step}
                                                            onChange={(e) => handleArrayFieldChange('steps', index, e.target.value)}
                                                            rows={2}
                                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                                                            placeholder="Enter step description"
                                                        />
                                                        <button
                                                            onClick={() => removeArrayItem('steps', index)}
                                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors self-start"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addArrayItem('steps')}
                                                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors text-sm"
                                                >
                                                    + Add Step
                                                </button>
                                            </div>
                                        ) : (
                                            <ol className="list-decimal list-inside space-y-3 bg-blue-50 p-4 rounded-2xl">
                                                {selectedProject.steps.map((step, index) => (
                                                    <li key={index} className="text-gray-600 text-sm leading-relaxed">{step}</li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                </div>

                                {/* Delete button in modal */}
                                {!isEditMode && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                        <button
                                            onClick={() => handleDeleteProject(selectedProject.id || selectedProject._id!)}
                                            className="px-8 py- text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            <Trash2 size={14} className="inline mr-1 mb-0.5" />
                                            Delete
                                        </button>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProjects;