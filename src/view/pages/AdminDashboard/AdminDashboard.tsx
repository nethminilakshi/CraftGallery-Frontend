export const AdminDashboardContent = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here's what's happening.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">1,234</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <span className="text-2xl">👥</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-green-600 text-sm font-medium">+12% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Stories</p>
                            <p className="text-3xl font-bold text-gray-900">567</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <span className="text-2xl">📖</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-green-600 text-sm font-medium">+8% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                        <p className="text-3xl font-bold text-gray-900">89</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-red-600 text-sm font-medium">-3% from last hour</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">$12,345</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-green-600 text-sm font-medium">+15% from last month</span>
                    </div>
                </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <span>👤</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">New user registered</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <span>📖</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">New story published</p>
                            <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};