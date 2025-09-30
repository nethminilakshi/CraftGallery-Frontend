import { useEffect, useState } from 'react';
import {
    Search,
    Eye,
    Filter,
    SortAsc,
    SortDesc,
    X,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

interface CategoryDto {
    id?: string;
    category: string;
    description: string;
}

const ViewCategoriesPage = () => {
    // Local state instead of Redux (for now)
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'id'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState<CategoryDto>({ category: '', description: '' });

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/category/all');

            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }

            const data = await response.json();
            console.log('Categories loaded:', data);

            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err instanceof Error ? err.message : 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Add new category
    const addCategory = async (categoryData: Omit<CategoryDto, 'id'>) => {
        try {
            setIsSubmitting(true);

            const response = await fetch('/api/category/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to add category: ${response.status}`);
            }

            const newCategory = await response.json();
            setCategories(prev => [...prev, newCategory]);

            return newCategory;
        } catch (err) {
            console.error('Error adding category:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update category
    const updateCategory = async (id: string, categoryData: Omit<CategoryDto, 'id'>) => {
        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/category/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to update category: ${response.status}`);
            }

            const updatedCategory = await response.json();
            setCategories(prev =>
                prev.map(cat => cat.id === id ? updatedCategory : cat)
            );

            return updatedCategory;
        } catch (err) {
            console.error('Error updating category:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete category
    const deleteCategory = async (id: string) => {
        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/category/delete/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to delete category: ${response.status}`);
            }

            setCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (err) {
            console.error('Error deleting category:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter and sort categories
    const filteredAndSortedCategories = categories
        .filter(category =>
            category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'id':
                    comparison = (a.id || '').localeCompare(b.id || '');
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Event handlers
    const handleCategoryView = (category: CategoryDto) => {
        setSelectedCategory(category);
        setShowDetailModal(true);
    };

    const handleAddCategory = () => {
        setFormData({ category: '', description: '' });
        setError('');
        setShowAddModal(true);
    };

    const handleUpdateCategory = (category: CategoryDto) => {
        setSelectedCategory(category);
        setFormData({ category: category.category, description: category.description });
        setError('');
        setShowUpdateModal(true);
    };

    const handleDeleteCategory = (category: CategoryDto) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const handleAddSubmit = async () => {
        if (!formData.category.trim() || !formData.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await addCategory({
                category: formData.category.trim(),
                description: formData.description.trim()
            });
            setShowAddModal(false);
            setFormData({ category: '', description: '' });
            setError('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add category');
        }
    };

    const handleUpdateSubmit = async () => {
        if (!selectedCategory?.id || !formData.category.trim() || !formData.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await updateCategory(selectedCategory.id, {
                category: formData.category.trim(),
                description: formData.description.trim()
            });
            setShowUpdateModal(false);
            setSelectedCategory(null);
            setFormData({ category: '', description: '' });
            setError('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update category');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory?.id) return;

        try {
            await deleteCategory(selectedCategory.id);
            setShowDeleteModal(false);
            setSelectedCategory(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete category');
        }
    };

    // Modal close handlers
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedCategory(null);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setFormData({ category: '', description: '' });
        setError('');
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedCategory(null);
        setFormData({ category: '', description: '' });
        setError('');
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedCategory(null);
    };

    const handleRefresh = () => {
        fetchCategories();
    };

    const clearError = () => {
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif]">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-white border border-[#E9D5FF] rounded-xl shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold py-4 font-['Playfair_Display',_serif]">
                                <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                                    Manage
                                </span>{' '}
                                <span className="text-purple-700">Categories</span>
                            </h1>
                            <p className="text-base text-gray-600 mt-1">
                                View and manage all project categories ({filteredAndSortedCategories.length} found)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm disabled:opacity-50"
                                title="Refresh Categories"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                            >
                                <Plus size={16} />
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Search Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search categories by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full border border-[#E9D5FF] rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-sm placeholder:text-sm"
                            />
                        </div>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-500" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'id')}
                                    className="px-3 py-2 border border-[#E9D5FF] rounded-lg focus:ring-2 focus:ring-[#8B5CF6] bg-white text-sm"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="id">Sort by ID</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                            >
                                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-700 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                                <p className="text-gray-500 font-medium">Loading categories...</p>
                            </div>
                        </div>
                    ) : filteredAndSortedCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Search className="text-gray-400" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {searchTerm ? 'No categories found' : 'No categories available'}
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm
                                            ? 'Try adjusting your search terms or filters'
                                            : 'Categories will appear here once they are created'
                                        }
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={handleAddCategory}
                                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                                        >
                                            Create First Category
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Category Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredAndSortedCategories.map((category, index) => (
                                    <tr key={category.id || index} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                #{category.id || 'NEW'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {category.category.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {category.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 max-w-md line-clamp-2">
                                                {category.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleCategoryView(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateCategory(category)}
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Update Category"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {filteredAndSortedCategories.length > 0 && (
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Showing {filteredAndSortedCategories.length} of {categories.length} categories
                            </span>
                            <span>
                                Total Categories: {categories.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Category Detail Modal */}
            {showDetailModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <h3 className="text-xl font-bold text-gray-900 font-['Playfair_Display',_serif]">Category Details</h3>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Category Icon and ID */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {selectedCategory.category.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            ID: #{selectedCategory.id}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category Name
                                    </label>
                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                                        <p className="text-gray-900 font-medium text-lg">
                                            {selectedCategory.category}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg border min-h-[100px]">
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedCategory.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={closeDetailModal}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                            <h3 className="text-lg font-bold text-gray-900 font-['Playfair_Display',_serif]">Add New Category</h3>
                            <button
                                onClick={closeAddModal}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            <div className="space-y-4">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="Enter category name"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter category description"
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Error display in modal */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={closeAddModal}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSubmit}
                                disabled={isSubmitting || !formData.category.trim() || !formData.description.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Category Modal */}
            {showUpdateModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                            <h3 className="text-xl font-bold text-gray-900 font-['Playfair_Display',_serif]">Update Category</h3>
                            <button
                                onClick={closeUpdateModal}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Category ID
                                    </label>
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <span className="text-sm font-mono text-gray-600">#{selectedCategory.id}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="Enter category name"
                                        className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter category description"
                                        rows={4}
                                        className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Error display in modal */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={closeUpdateModal}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubmit}
                                disabled={isSubmitting || !formData.category.trim() || !formData.description.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {isSubmitting ? 'Updating...' : 'Update Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
                            <h3 className="text-xl font-bold text-red-600 font-['Playfair_Display',_serif]">Delete Category</h3>
                            <button
                                onClick={closeDeleteModal}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Confirm Deletion</h4>
                                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 mb-4 border border-red-100">
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">ID:</span>{' '}
                                        <span className="font-mono text-gray-600">#{selectedCategory.id}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">Name:</span>{' '}
                                        <span className="text-gray-900 font-semibold">{selectedCategory.category}</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this category? This will permanently remove the category and cannot be undone. Any projects associated with this category may be affected.
                            </p>

                            {/* Error display in modal */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {isSubmitting ? 'Deleting...' : 'Delete Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewCategoriesPage;