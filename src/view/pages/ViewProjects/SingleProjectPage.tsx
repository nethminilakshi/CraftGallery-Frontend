import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchProjectById } from '../../../slices/singleProjectSlice';

const SingleProjectPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch: AppDispatch = useDispatch();

    const { project, loading, error } = useSelector((state: RootState) => state.singleProject);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id));
        }
    }, [id, dispatch]);

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
        <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

            {project.image && (
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto rounded mb-4"
                />
            )}

            <p className="text-gray-700 mb-2">
                <strong>Category:</strong> {project.category}
            </p>

            <p className="text-gray-600 mb-4">
                <strong>Description:</strong> {project.description}
            </p>

            <div className="mb-4">
                <h3 className="text-lg font-semibold">Materials:</h3>
                <p className="text-gray-600 whitespace-pre-line">{project.materials}</p>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold">Steps:</h3>
                <p className="text-gray-600 whitespace-pre-line">{project.steps}</p>
            </div>

            <div className="text-sm text-gray-500 mt-6">
                <p>By: {project.author}</p>
                <p>Uploaded by: {project.uploadedUserEmail}</p>
                <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default SingleProjectPage;
