import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectsByCategory } from '../../../slices/projectBycategorySlice';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { Link } from 'react-router-dom';

const ViewProjects = () => {
    const { category } = useParams<{ category: string }>();
    const dispatch: AppDispatch = useDispatch();

    const { projects, loading, error } = useSelector(
        (state: RootState) => state.projects
    );

    useEffect(() => {
        if (category) {
            dispatch(fetchProjectsByCategory(category));
        }
    }, [category, dispatch]);

    // Handle loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading projects...</div>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    onClick={() => category && dispatch(fetchProjectsByCategory(category))}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
                {/*<h1 className="text-3xl font-bold text-gray-800 mb-2">*/}
                {/*    Projects in Category: {category || 'All'}*/}
                {/*</h1>*/}
                {/*<p className="text-gray-600">*/}
                {/*    {projects && Array.isArray(projects) ? projects.length : 0} projects found*/}
                {/*</p>*/}
            </div>

            {/* Projects Grid */}
            {projects && Array.isArray(projects) && projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                        >
                            {/* Project Image */}
                            {project.image && (
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Project Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {project.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                    {project.description}
                                </p>

                                {/* Project Meta */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {project.category}
                                    </span>
                                </div>

                                {/* Author and Date */}
                                <div className="text-xs text-gray-500 mb-3">
                                    <p>By: {project.author}</p>
                                    <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                                </div>

                                {/* Action Button */}
                                {/*<button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200">*/}
                                {/*    View Details*/}
                                {/*</button>*/}
                                <Link to={`/project/${project.id}`} className="block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200" > View Details </Link>

                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Empty State
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No projects found
                    </h3>
                    <p className="text-gray-500 mb-4">
                        There are no projects in the "{category}" category yet.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewProjects;