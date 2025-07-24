import {
    Camera, Heart, PaintBucket,
    Palette, Scissors, Search, Sparkles, Star,
    Upload, Users,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type {RootState} from "../../../slices/rootReducer.ts";
import {closeDropdown, getAllCategories, selectCategory, toggleDropdown} from "../../../slices/homeSlice.ts";
import type {AppDispatch} from "../../../store/store.ts";
import {useNavigate} from "react-router-dom";

export function Home() {

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Get state from Redux store
    const {
        categories,
        loading,
        error,
        isDropdownOpen,
        selectedCategory
    } = useSelector((state: RootState) => state.categories);

    // Handle dropdown toggle
    const handleToggleDropdown = () => {
        dispatch(toggleDropdown());
        // Fetch categories if dropdown is opening and categories are empty
        if (!isDropdownOpen && categories.length === 0) {
            dispatch(getAllCategories());
        }
    };

    // Handle category selection
    const handleSelectCategory = (category: { category?: string }) => {
        dispatch(selectCategory(category));
        dispatch(closeDropdown());
        navigate(`/category/${category.category}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Create, Share &
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Get Inspired
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
                            Discover thousands of creative DIY craft ideas and art projects. Share your masterpieces and inspire a community of makers!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center space-x-2">
                                <Upload className="w-5 h-5" />
                                <span>Start Creating</span>
                            </button>

                            {/* Dropdown Button */}
                            <div className="relative">
                                <button
                                    onClick={handleToggleDropdown}
                                    className="border-2 border-purple-300 text-purple-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center space-x-2"
                                >
                                    <span>Explore Projects</span>
                                    <svg
                                        className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                                        {loading && (
                                            <div className="px-4 py-3 text-gray-500 text-sm flex items-center">
                                                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading categories...
                                            </div>
                                        )}

                                        {error && (
                                            <div className="px-4 py-3 text-red-500 text-sm">
                                                Error: {error}
                                            </div>
                                        )}

                                        {!loading && !error && categories.length === 0 && (
                                            <div className="px-4 py-3 text-gray-500 text-sm">
                                                No categories found
                                            </div>
                                        )}

                                        {!loading && categories.length > 0 && categories.map((category, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectCategory(category)}
                                                className="w-full text-left px-4 py-3 hover:bg-purple-50 hover:text-purple-600 transition duration-200 text-sm border-b border-gray-100 last:border-b-0"
                                            >
                                                {category.category || 'Unknown Category'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Show selected category */}
                        {selectedCategory && (
                            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                                <p className="text-purple-700 text-sm">
                                    Selected: <strong>{selectedCategory.category}</strong>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-pink-100 rounded-xl p-4 flex flex-col items-center">
                                        <Scissors className="w-8 h-8 text-pink-600 mb-2" />
                                        <span className="text-xs font-medium text-pink-700">Paper Crafts</span>
                                    </div>
                                    <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center">
                                        <PaintBucket className="w-8 h-8 text-purple-600 mb-2" />
                                        <span className="text-xs font-medium text-purple-700">Painting</span>
                                    </div>
                                    <div className="bg-blue-100 rounded-xl p-4 flex flex-col items-center">
                                        <Heart className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="text-xs font-medium text-blue-700">DIY Gifts</span>
                                    </div>
                                    <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center">
                                        <Sparkles className="w-8 h-8 text-green-600 mb-2" />
                                        <span className="text-xs font-medium text-green-700">Decorations</span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Latest Project</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600">Rainbow Paper Butterfly</p>
                                    <p className="text-xs text-gray-500">by Sarah M.</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-green-400 rounded-full p-3 shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
                {/* Floating Craft Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 text-pink-300 animate-bounce" style={{ animationDelay: '0s' }}>
                        <Scissors className="w-8 h-8" />
                    </div>
                    <div className="absolute top-32 right-20 text-purple-300 animate-bounce" style={{ animationDelay: '1s' }}>
                        <PaintBucket className="w-10 h-10" />
                    </div>
                    <div className="absolute top-60 left-1/4 text-blue-300 animate-bounce" style={{ animationDelay: '2s' }}>
                        <Heart className="w-6 h-6" />
                    </div>
                    <div className="absolute top-40 right-1/3 text-pink-300 animate-bounce" style={{ animationDelay: '3s' }}>
                        <Sparkles className="w-7 h-7" />
                    </div>
                </div>
            </section>

            {/* Featured Projects Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Featured Projects
                </h2>
                <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                    Get inspired by amazing creations from our community
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Project 1 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Scissors className="w-16 h-16 text-purple-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-purple-700">Paper Butterfly Art</p>
                                </div>
                            </div>
                            <div className="text-purple-600 mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                Share Your Creations
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Upload your handmade treasures and show the world your creative magic! From paper crafts to paintings.
                            </p>
                        </div>
                    </div>

                    {/* Project 2 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-green-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <PaintBucket className="w-16 h-16 text-blue-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-blue-700">Watercolor Magic</p>
                                </div>
                            </div>
                            <div className="text-blue-600 mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                Explore Ideas
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Dive into thousands of amazing projects! Find tutorials, techniques, and creative inspiration for every skill level.
                            </p>
                        </div>
                    </div>

                    {/* Project 3 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Heart className="w-16 h-16 text-orange-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-orange-700">DIY Gifts</p>
                                </div>
                            </div>
                            <div className="text-orange-600 mb-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                Join Community
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Meet amazing artists and crafters! Share tips, get feedback, and celebrate creativity together.
                            </p>
                        </div>
                    </div>

                    {/* Project 4 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Sparkles className="w-16 h-16 text-purple-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-purple-700">Holiday Decorations</p>
                                </div>
                            </div>
                            <div className="text-purple-600 mb-4">
                                <Star className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                Rate & Review
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Give stars and loving comments to incredible artwork! Help others discover amazing projects.
                            </p>
                        </div>
                    </div>

                    {/* Project 5 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-green-200 to-blue-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Camera className="w-16 h-16 text-green-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-green-700">Nature Crafts</p>
                                </div>
                            </div>
                            <div className="text-green-600 mb-4">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                Save Favorites
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Bookmark amazing projects you want to try! Build your personal inspiration collection easily.
                            </p>
                        </div>
                    </div>

                    {/* Project 6 */}
                    <div className="group">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/40 h-full">
                            <div className="w-full h-48 bg-gradient-to-br from-red-200 to-pink-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <Palette className="w-16 h-16 text-red-600 mb-2 mx-auto" />
                                    <p className="text-sm font-medium text-red-700">Abstract Art</p>
                                </div>
                            </div>
                            <div className="text-red-600 mb-4">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">
                                For Everyone
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Perfect for all skill levels! From beginner tutorials to advanced techniques for every creative soul.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Start Your Creative Journey?
                    </h2>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                        Join our community of makers and discover unlimited inspiration for your next craft project!
                    </p>
                    <button className="bg-white text-purple-600 px-10 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center space-x-3 mx-auto">
                        <Palette className="w-6 h-6" />
                        <span>Join CraftGallery Today</span>
                    </button>
                </div>
            </section>
        </div>
    );
}