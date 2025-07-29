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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                            Craft Gallery
                        </h1>
                        <p className="text-gray-600 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full text-white text-xs font-semibold">
                        {projects && Array.isArray(projects) ? projects.length : 0}
                    </span>
                            amazing projects discovered
                        </p>
                    </div>
                </div>

                {/* Projects Grid */}
                {projects && Array.isArray(projects) && projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20  "
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                {/* Project Image */}
                                {project.image && (
                                    <div className="relative overflow-hidden rounded-t-3xl">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                )}

                                {/* Project Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                        {project.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {project.description}
                                    </p>

                                    {/* Project Meta */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs px-3 py-1.5 rounded-full font-medium border border-pink-200/50">
                                    {project.category}
                                </span>
                                    </div>

                                    {/* Author and Date */}
                                    <div className="text-xs text-gray-500 mb-5 space-y-1 bg-gray-50/50 p-3 rounded-xl">
                                        <p className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-gradient-to-r from-black-400 to-purple-400 rounded-full"></span>
                                            <strong>By:</strong> {project.author}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-gradient-to-r from-black-400 to-cyan-400 rounded-full"></span>
                                            <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        to={`/project/${project.id}`}
                                        className="block text-center bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500 text-white py-2 px-4 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 hover:shadow-purple-500/25 text-sm"
                                    >
                                <span className="flex items-center justify-center gap-1.5">
                                    View Details
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <svg
                                        className="h-10 w-10 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 00-2-2M5 11V9a2 2 012-2m0 0V5a2 2 012-2h6a2 2 012 2v2M7 7h10"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
                                No projects found
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                There are no projects in the <span className="font-semibold text-purple-600">"{category}"</span> category yet.
                                <br />Start creating something amazing!
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Go Back
                        </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>    );
};

export default ViewProjects;