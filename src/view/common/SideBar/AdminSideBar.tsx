import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/admin/main', label: 'Dashboard', icon: '📊' },
        { path: '/admin/projects', label: 'Projects', icon: '📖' },
        { path: '/admin/categories', label: 'Categories', icon: '⚙️' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

    return (
        <nav className="h-full p-4">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            </div>

            <ul className="space-y-2">
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                location.pathname === item.path
                                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}