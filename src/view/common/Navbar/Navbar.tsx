import { Palette, Menu } from 'lucide-react';
import { useState } from 'react';
import {Link} from "react-router-dom";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              CraftGallery
            </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            Home
                        </a>
                        {/*<a href="/viewProjects" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">*/}
                        {/*    Browse Projects*/}
                        {/*</a>*/}
                        <a href="/addProjects" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            Upload
                        </a>
                        <Link to="/my-projects" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            My Projects
                        </Link>
                        <a href="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            Contact
                        </a>
                        <div>
                            <Link className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" to="/login">
                                <button className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-purple-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div id="mobile-menu" className={`md:hidden bg-white/90 backdrop-blur-md rounded-b-2xl shadow-lg transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a href="/" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            Home
                        </a>
                        <a href="/viewProjects" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium">
                            Browse Projects
                        </a>
                        <a href="/addProjects" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium">
                            Upload
                        </a>
                        <Link to="/my-projects" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium">
                            My Projects
                        </Link>
                        <a href="/contact" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium">
                            Contact
                        </a>
                        <div>
                            <Link className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" to="/login">
                                <button className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};