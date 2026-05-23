import { useEffect, useState } from "react";
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
  AlertCircle,
} from "lucide-react";

interface CategoryDto {
  id?: string;
  category: string;
  description: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const ViewCategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<CategoryDto>({
    category: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/category/all");
      if (!response.ok)
        throw new Error(`Failed to fetch categories: ${response.status}`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: Omit<CategoryDto, "id">) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/category/save", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to add category: ${response.status}`,
        );
      }
      const newCategory = await response.json();
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Omit<CategoryDto, "id">,
  ) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/category/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to update category: ${response.status}`,
        );
      }
      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat)),
      );
      return updatedCategory;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/category/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to delete category: ${response.status}`,
        );
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredAndSortedCategories = categories
    .filter(
      (c) =>
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const cmp =
        sortBy === "name"
          ? a.category.localeCompare(b.category)
          : (a.id || "").localeCompare(b.id || "");
      return sortOrder === "asc" ? cmp : -cmp;
    });

  const handleAddSubmit = async () => {
    if (!formData.category.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      await addCategory({
        category: formData.category.trim(),
        description: formData.description.trim(),
      });
      setShowAddModal(false);
      setFormData({ category: "", description: "" });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  const handleUpdateSubmit = async () => {
    if (
      !selectedCategory?.id ||
      !formData.category.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      await updateCategory(selectedCategory.id, {
        category: formData.category.trim(),
        description: formData.description.trim(),
      });
      setShowUpdateModal(false);
      setSelectedCategory(null);
      setFormData({ category: "", description: "" });
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory?.id) return;
    try {
      await deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  };

  return (
    <div className="w-full self-start bg-gray-50 font-['Inter',_sans-serif] text-base min-h-[36rem]">
      <div className="max-w-screen-2xl w-full mx-auto px-10 py-10 space-y-6">
        {/* Header */}
        <div className="bg-white border border-purple-100 rounded-lg shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold font-['Playfair_Display',_serif]">
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Manage
              </span>{" "}
              <span className="text-purple-700">Categories</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredAndSortedCategories.length} categories found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCategories()}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition text-xs disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => {
                setFormData({ category: "", description: "" });
                setError("");
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition text-xs shadow"
            >
              <Plus size={12} />
              Add Category
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2.5 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[160px] relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full border border-purple-100 rounded-md focus:ring-1 focus:ring-purple-400 focus:border-transparent bg-white text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "id")}
              className="px-2 py-1.5 border border-purple-100 rounded-md focus:ring-1 focus:ring-purple-400 bg-white text-xs"
            >
              <option value="name">Name</option>
              <option value="id">ID</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              {sortOrder === "asc" ? (
                <SortAsc size={13} />
              ) : (
                <SortDesc size={13} />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="p-0.5 hover:bg-red-100 rounded"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                <p className="text-gray-500 text-xs">Loading...</p>
              </div>
            </div>
          ) : filteredAndSortedCategories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="text-gray-400" size={20} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {searchTerm ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-gray-400 text-xs mb-3">
                {searchTerm
                  ? "Try different search terms"
                  : "Create your first category"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setFormData({ category: "", description: "" });
                    setShowAddModal(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md text-xs hover:opacity-90"
                >
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedCategories.map((category, index) => (
                    <tr
                      key={category.id || index}
                      className="hover:bg-purple-50/40 transition-all"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          #{category.id?.slice(-6) || "NEW"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {category.category.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            {category.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          {category.description}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                            title="View"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setFormData({
                                category: category.category,
                                description: category.description,
                              });
                              setError("");
                              setShowUpdateModal(true);
                            }}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
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

        {/* Footer count */}
        {filteredAndSortedCategories.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">
            Showing {filteredAndSortedCategories.length} of {categories.length}{" "}
            categories
          </p>
        )}
      </div>

      {/* ── SMALL ADD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl sm:max-w-7xl md:max-w-[1400px]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Add Category</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="e.g. Painting"
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Short description..."
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-400 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={
                  isSubmitting ||
                  !formData.category.trim() ||
                  !formData.description.trim()
                }
                className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMALL UPDATE MODAL ── */}
      {showUpdateModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl sm:max-w-7xl md:max-w-[1400px]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">
                Update Category
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setError("");
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-400 font-mono">
                ID: #{selectedCategory.id?.slice(-6)}
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-400 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setError("");
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={
                  isSubmitting ||
                  !formData.category.trim() ||
                  !formData.description.trim()
                }
                className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {showDetailModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl sm:max-w-7xl md:max-w-[1400px]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <h3 className="text-sm font-bold text-gray-800">
                Category Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
                  {selectedCategory.category.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  #{selectedCategory.id?.slice(-6)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Name
                </label>
                <p className="text-sm font-semibold text-gray-900 bg-purple-50 px-3 py-2 rounded-md">
                  {selectedCategory.category}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <p className="text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-md leading-relaxed">
                  {selectedCategory.description}
                </p>
              </div>
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCategory(null);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl sm:max-w-7xl md:max-w-[1400px]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-red-600">
                Delete Category
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="text-red-500" size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Confirm deletion
                  </p>
                  <p className="text-xs text-gray-400">This cannot be undone</p>
                </div>
              </div>
              <div className="bg-red-50 rounded-md p-3 text-xs space-y-1 border border-red-100">
                <p>
                  <span className="font-medium text-gray-600">ID:</span>{" "}
                  <span className="font-mono text-gray-500">
                    #{selectedCategory.id?.slice(-6)}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">Name:</span>{" "}
                  <span className="text-gray-900 font-semibold">
                    {selectedCategory.category}
                  </span>
                </p>
              </div>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCategoriesPage;
