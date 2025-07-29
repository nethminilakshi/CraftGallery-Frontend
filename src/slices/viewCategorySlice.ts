import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { backendApi } from "../api";

// Category DTO interface
export interface CategoryDto {
    id?: string;
    category: string;
    description: string;
}

// State interface
interface CategoryState {
    categories: CategoryDto[];
    loading: boolean;
    error: string | null;
    selectedCategory: CategoryDto | null;
    isSubmitting: boolean;
}

// Initial state
const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
    selectedCategory: null,
    isSubmitting: false,
};

// Async thunks using backendApi
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await backendApi.get('/category/all');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch categories'
            );
        }
    }
);

export const addCategory = createAsyncThunk(
    'categories/addCategory',
    async (categoryData: { category: string; description: string }, { rejectWithValue }) => {
        try {
            const response = await backendApi.post('/category/save', categoryData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to add category'
            );
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, categoryData }: { id: string; categoryData: { category: string; description: string } }, { rejectWithValue }) => {
        try {
            const response = await backendApi.put(`/category/update/${id}`, categoryData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update category'
            );
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id: string, { rejectWithValue }) => {
        try {
            await backendApi.delete(`/category/delete/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete category'
            );
        }
    }
);

// Category slice
const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedCategory: (state, action: PayloadAction<CategoryDto | null>) => {
            state.selectedCategory = action.payload;
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
        resetCategoryState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch Categories
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add Category
        builder
            .addCase(addCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.categories.push(action.payload);
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });

        // Update Category
        builder
            .addCase(updateCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const index = state.categories.findIndex(cat => cat.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
                if (state.selectedCategory && state.selectedCategory.id === action.payload.id) {
                    state.selectedCategory = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });

        // Delete Category
        builder
            .addCase(deleteCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.categories = state.categories.filter(cat => cat.id !== action.payload);
                if (state.selectedCategory && state.selectedCategory.id === action.payload) {
                    state.selectedCategory = null;
                }
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    setSelectedCategory,
    clearSelectedCategory,
    resetCategoryState,
} = categorySlice.actions;

export default categorySlice.reducer;