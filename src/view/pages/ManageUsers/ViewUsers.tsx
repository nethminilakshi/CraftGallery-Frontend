import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Search,
    Eye,
    Filter,
    SortAsc,
    SortDesc,
    X,
    Trash2,
    User,
    Mail,
} from 'lucide-react';

import type { RootState, AppDispatch } from '../../../store/store';
import {
    clearError,
    clearSelectedUser,
    deleteUser,
    fetchUsers,
    setSelectedUser,
    type UserDTO
} from "../../../slices/viewUsersSlice.ts";

const ViewUsersPage = () => {

    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error, selectedUser } = useSelector((state: RootState) => state.manageUsers);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'firstName' | 'email' | 'id' | 'role' | 'username'>('firstName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const filteredAndSortedUsers = users
        .filter(user =>
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'firstName':
                    comparison = (a.firstName || '').localeCompare(b.firstName || '');
                    break;
                case 'username':
                    comparison = (a.username || '').localeCompare(b.username || '');
                    break;
                case 'email':
                    comparison = (a.email || '').localeCompare(b.email || '');
                    break;
                case 'id':
                    comparison = (a.id || 0) - (b.id || 0);
                    break;
                case 'role':
                    comparison = (a.role || '').localeCompare(b.role || '');
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleUserView = (user: UserDTO) => {
        dispatch(setSelectedUser(user));
        setShowDetailModal(true);
    };

    const handleDeleteUser = (user: UserDTO) => {
        dispatch(setSelectedUser(user));
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser?.id) return;

        setIsSubmitting(true);
        try {
            await dispatch(deleteUser(selectedUser.id)).unwrap();
            setShowDeleteModal(false);
            dispatch(clearSelectedUser());
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        dispatch(clearSelectedUser());
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        dispatch(clearSelectedUser());
    };


    const getUserAvatar = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return '??';
        const first = firstName?.charAt(0) || '';
        const last = lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || '??';
    };

    const getFullName = (firstName?: string, lastName?: string) => {
        return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
    };

    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'moderator':
                return 'bg-yellow-100 text-yellow-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-white border border-[#E9D5FF] rounded-xl shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold py-4">
                        <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                            Manage
                        </span>{' '}
                                <span className="text-purple-700">Users</span>
                            </h1>                            <p className="text-base text-gray-600 mt-1">
                                View and manage all system users ({filteredAndSortedUsers.length} found)
                            </p>
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
                                placeholder="Search users by name, username, email or role..."
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
                                    onChange={(e) => setSortBy(e.target.value as 'firstName' | 'email' | 'id' | 'role' | 'username')}
                                    className="px-3 py-2 border border-[#E9D5FF] rounded-lg focus:ring-2 focus:ring-[#8B5CF6] bg-white text-sm"                                >
                                    <option value="firstName">Sort by Name</option>
                                    <option value="username">Sort by Username</option>
                                    <option value="email">Sort by Email</option>
                                    <option value="role">Sort by Role</option>
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
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <button
                            onClick={() => dispatch(clearError())}
                            className="text-red-700 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                <p className="text-gray-500 font-medium">Loading users...</p>
                            </div>
                        </div>
                    ) : filteredAndSortedUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="text-gray-400" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {searchTerm ? 'No users found' : 'No users available'}
                                    </h3>
                                    <p className="text-gray-500">
                                        {searchTerm
                                            ? 'Try adjusting your search terms or filters'
                                            : 'Users will appear here once they are registered'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredAndSortedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {getUserAvatar(user.firstName, user.lastName)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {getFullName(user.firstName, user.lastName)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        ID: #{user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-900">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    {/*<span className="text-sm text-gray-600">@{user.username}</span>*/}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {user.role ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No role</span>
                                                )}
                                                {user.status && (
                                                    <div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUserView(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete User"
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
                {filteredAndSortedUsers.length > 0 && (
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Showing {filteredAndSortedUsers.length} of {users.length} users
                            </span>
                            <span>
                                Total Users: {users.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showDetailModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">User Details</h3>
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
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                                        {getUserAvatar(selectedUser.firstName, selectedUser.lastName)}
                                    </div>
                                    <div>
                                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            ID: #{selectedUser.id}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="p-3 bg-gray-80 rounded-lg border">
                                        <p className="text-gray-600  text-sm">
                                            {getFullName(selectedUser.firstName, selectedUser.lastName)}
                                        </p>
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            <p className="text-sm text-gray-900">
                                                {selectedUser.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <div className="p-3 bg-gray-50 rounded-lg border">
                                            {selectedUser.role ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                                                    {selectedUser.role}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">No role assigned</span>
                                            )}
                                        </div>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-red-600">Delete User</h3>
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

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">ID:</span>{' '}
                                        <span className="font-mono text-gray-600">#{selectedUser.id}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">Name:</span>{' '}
                                        <span className="text-gray-900">{getFullName(selectedUser.firstName, selectedUser.lastName)}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">Username:</span>{' '}
                                        <span className="text-gray-900">@{selectedUser.username}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">Email:</span>{' '}
                                        <span className="text-gray-900">{selectedUser.email}</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this user? This will permanently remove the user account and all associated data.
                            </p>
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
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {isSubmitting ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewUsersPage;