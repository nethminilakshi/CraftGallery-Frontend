import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchProjectById, deleteProjectById, clearDeleteState } from '../../../slices/singleProjectSlice';
import {Calendar, Tag, Trash2, User} from "lucide-react";

const SingleProjectPage = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setUserRole(storedRole); // "USER" or "ADMIN"
    }, []);

    const { id } = useParams<{ id: string }>();
    const dispatch: AppDispatch = useDispatch();

    const {
        project,
        loading,
        error,
        deleteLoading,
        deleteError,
        isDeleted
    } = useSelector((state: RootState) => state.singleProject);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id));
        }
    }, [id, dispatch]);

    // Handle successful deletion
    useEffect(() => {
        if (isDeleted) {
            // Clear delete state
            dispatch(clearDeleteState());
            // Navigate to projects list or home page
            navigate('/projects'); // Update this path according to your routing
        }
    }, [isDeleted, dispatch, navigate]);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (id) {
            dispatch(deleteProjectById(id));
        }
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    if (loading) {
        return <div className="text-center mt-10">Loading project...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
    }

    if (!project) {
        return <div className="text-center mt-10">Project not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">{project.title}</h1>
            <div className="mb-8">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{project.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{project.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            {project.imageUrl && (
                <div className="mb-8">
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full max-w-2xl h-64 object-cover rounded-xl shadow-md mx-auto"
                    />
                </div>
            )}

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Description */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                </div>


                {/* Materials */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Materials Needed</h3>
                        <ul className="bg-gray-50 p-4 rounded-lg list-disc list-inside space-y-1 text-sm text-gray-700">
                            {Array.isArray(project.materials) ? (
                                project.materials.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))
                            ) : typeof project.materials === 'string' ? (
                                project.materials
                                    .split('\n')
                                    .filter((item) => item.trim() !== '')
                                    .map((item, index) => <li key={index}>{item.trim()}</li>)
                            ) : null}
                        </ul>

                    </div>
                </div>

            </div>

            {/* Instructions Section */}

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Instructions</h3>
                <ul className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                    {Array.isArray(project.steps) ? (
                        project.steps.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                        ))
                    ) : typeof project.steps === 'string' ? (
                        project.steps
                            .split('\n')
                            .filter((step) => step.trim() !== '')
                            .map((step, index) => <li key={index}>{step.trim()}</li>)
                    ) : null}
                </ul>

            </div>


            <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                    <p>Uploaded by: <span className="font-medium">{project.uploadedUserEmail}</span></p>
                </div>
                {/* Delete Button - Aligned to right */}
                {userRole === "ADMIN" && (
                    <button
                        onClick={handleDeleteClick}
                        disabled={deleteLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            deleteLoading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 hover:border-red-300'
                        }`}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Project'}
                    </button>
                )}
            </div>

            {/* Delete error display */}
            {deleteError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <strong>Error:</strong> {deleteError}
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-shrink-0">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Project</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Are you sure you want to delete "<span className="font-medium">{project.title}</span>"?
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                                className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors ${
                                    deleteLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleProjectPage;