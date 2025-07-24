import React, { useState, useEffect } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../slices/rootReducer';
import { getAllCategories } from '../../../slices/homeSlice';
import type { AppDispatch } from '../../../store/store';

const ProjectUploadForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Get categories from Redux store (same as Home component)
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError
    } = useSelector((state: RootState) => state.categories);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        materials: [''],
        steps: [''],
        imageUrl: '',
        author: ''
    });

    const [userEmail, setUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Extract user email from JWT
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.email || '');
            } catch (error: any) {
                console.error('JWT error:', error);
            }
        }

        // Fetch categories if not already loaded
        if (categories.length === 0 && !categoriesLoading) {
            dispatch(getAllCategories());
        }
    }, [dispatch, categories.length, categoriesLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
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

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const projectData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: formData.title,
            category: formData.category,
            description: formData.description,
            materials: formData.materials.filter((m: string) => m.trim()),
            steps: formData.steps.filter((s: string) => s.trim()),
            imageUrl: formData.imageUrl,
            author: formData.author,
            uploadedUserEmail: userEmail,
            createdAt: new Date().toISOString()
        };

        try {
            console.log('Project Data:', projectData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Project uploaded successfully! 🎉');

            setFormData({
                title: '', category: '', description: '',
                materials: [''], steps: [''], imageUrl: '', author: ''
            });
        } catch (error: any) {
            alert('Upload failed! Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
                        <h2 className="text-2xl font-bold text-white text-center tracking-wide">
                            ✨ Create New Project ✨
                        </h2>
                        <p className="text-purple-100 text-center text-sm mt-1 font-light">
                            Share your amazing ideas with the world
                        </p>
                        {userEmail && (
                            <div className="mt-3 text-center">
                <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                   {userEmail}
                </span>
                            </div>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-5"
                         style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                 Project Title
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-3 text-xs bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                placeholder="What's your amazing project called?"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                 Category
                                <span className="text-red-500">*</span>
                                {categoriesLoading && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                                )}
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-3 text-xs bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                required
                                disabled={categoriesLoading}
                            >
                                <option value="">
                                    {categoriesLoading
                                        ? 'Loading categories...'
                                        : categoriesError
                                            ? 'Error loading categories'
                                            : 'Choose your category...'
                                    }
                                </option>
                                {!categoriesLoading && !categoriesError && categories.map((categoryObj: any, index: number) => (
                                    <option key={index} value={categoryObj.category || categoryObj}>
                                        {categoryObj.category || categoryObj}
                                    </option>
                                ))}
                            </select>
                            {categoriesError && (
                                <p className="text-xs text-red-500 mt-1">
                                    Failed to load categories. Please refresh the page.
                                </p>
                            )}
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                 Author
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                className="w-full p-3 text-xs bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                placeholder="Who's the creative genius behind this?"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                 Description
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-3 text-xs bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300 resize-none"
                                rows={3}
                                placeholder="Tell us what makes your project special..."
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                 Image URL
                            </label>
                            <input
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                className="w-full p-3 text-xs bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                placeholder="https://your-awesome-image.jpg"
                            />
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                 Materials Needed
                                <span className="text-red-500">*</span>
                            </label>
                            {formData.materials.map((material: string, index: number) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        value={material}
                                        onChange={(e) => updateArray(index, e.target.value, 'materials')}
                                        className="flex-1 p-2 text-xs bg-white border-2 border-orange-200 rounded-lg focus:border-orange-400 transition-all duration-200"
                                        placeholder={`Material ${index + 1} (e.g., Wood, Paint, Screws...)`}
                                    />
                                    {formData.materials.length > 1 && (
                                        <button
                                            onClick={() => removeItem(index, 'materials')}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addItem('materials')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200 font-medium"
                            >
                                <Plus size={16} /> Add Another Material
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                 Step-by-Step Instructions
                                <span className="text-red-500">*</span>
                            </label>
                            {formData.steps.map((step: string, index: number) => (
                                <div key={index} className="flex gap-2 mb-3">
              <span className="mt-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full min-w-[24px] text-center font-bold shadow-sm">
                {index + 1}
              </span>
                                    <textarea
                                        value={step}
                                        onChange={(e) => updateArray(index, e.target.value, 'steps')}
                                        className="flex-1 p-2 text-xs bg-white border-2 border-green-200 rounded-lg focus:border-green-400 transition-all duration-200 resize-none"
                                        rows={2}
                                        placeholder={`Step ${index + 1}: Describe what to do...`}
                                    />
                                    {formData.steps.length > 1 && (
                                        <button
                                            onClick={() => removeItem(index, 'steps')}
                                            className="mt-2 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addItem('steps')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 font-medium"
                            >
                                <Plus size={16} /> Add Another Step
                            </button>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !userEmail || categoriesLoading}
                                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Creating magic... </span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span> Launch Your Project!</span>
                                    </>
                                )}
                            </button>

                            {!userEmail && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-sm text-center font-medium">
                                         Please log in to share your awesome project!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectUploadForm;