import React, { useState, useEffect } from 'react';
import { Upload, Plus, X,} from 'lucide-react';

const ProjectUploadForm = () => {
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

    // Categories for dropdown
    const categories = [
        'Arts & Crafts',
        'Home Improvement',
        'Electronics',
        'Cooking & Baking',
        'Gardening',
        'Fashion & Beauty',
        'Automotive',
        'Technology',
        'Health & Fitness',
        'Education',
        'Other'
    ];

    // Extract email from JWT token
    useEffect(() => {
        const extractEmailFromJWT = () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserEmail(payload.email || payload.sub || '');
                }
            } catch (error) {
                console.error('Error extracting email from JWT:', error);
            }
        };

        extractEmailFromJWT();
    }, []);

    // Generate unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayInputChange = (index, value, arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], '']
        }));
    };

    const removeArrayItem = (index, arrayName) => {
        if (formData[arrayName].length > 1) {
            setFormData(prev => ({
                ...prev,
                [arrayName]: prev[arrayName].filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Create the project object according to ProjectDto
        const projectData = {
            id: generateId(),
            title: formData.title,
            category: formData.category,
            description: formData.description,
            materials: formData.materials.filter(material => material.trim() !== ''),
            steps: formData.steps.filter(step => step.trim() !== ''),
            imageUrl: formData.imageUrl,
            author: formData.author,
            uploadedUserEmail: userEmail,
            createdAt: new Date().toISOString()
        };

        try {
            // Here you would typically send the data to your API
            console.log('Project Data:', projectData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Project uploaded successfully!');

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
        } catch (error) {
            console.error('Error uploading project:', error);
            alert('Error uploading project. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload New Project</h2>
                <p className="text-gray-600">Share your creative project with the community</p>
                {userEmail && (
                    <p className="text-sm text-blue-600 mt-2">Uploading as: {userEmail}</p>
                )}
            </div>

            <div className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your project title"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Author */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Author Name *
                    </label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your name"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your project..."
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Image URL
                    </label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                {/* Materials */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Materials Needed *
                    </label>
                    {formData.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={material}
                                onChange={(e) => handleArrayInputChange(index, e.target.value, 'materials')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Material ${index + 1}`}
                                required={index === 0}
                            />
                            {formData.materials.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(index, 'materials')}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('materials')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Material
                    </button>
                </div>

                {/* Steps */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Steps *
                    </label>
                    {formData.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 mb-2">
              <span className="mt-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full min-w-[24px] text-center">
                {index + 1}
              </span>
                            <textarea
                                value={step}
                                onChange={(e) => handleArrayInputChange(index, e.target.value, 'steps')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Step ${index + 1} description`}
                                rows={2}
                                required={index === 0}
                            />
                            {formData.steps.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(index, 'steps')}
                                    className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('steps')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Step
                    </button>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !userEmail}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Upload Project
                            </>
                        )}
                    </button>
                    {!userEmail && (
                        <p className="text-red-500 text-sm mt-2 text-center">
                            Please log in to upload a project
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectUploadForm;