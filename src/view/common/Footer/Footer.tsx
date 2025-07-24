import { Palette } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">CraftGallery</span>
                    </div>
                    <div className="flex space-x-6 text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 CraftGallery. Made with love for creative minds everywhere.</p>
                </div>
            </div>
        </footer>
    );
};
