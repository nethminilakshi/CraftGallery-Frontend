// categoriesSlice.ts
import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';

// Category DTO interface
export interface CategoryDTO {
    id?: number;
    category: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

// State interface
interface CategoriesState {
    categories: CategoryDTO[];
    loading: boolean;
    error: string | null;
    selectedCategory: CategoryDTO | null;
}

// Initial state
const initialState: CategoriesState = {
    categories: [],
    loading: false,
    error: null,
    selectedCategory: null,
};

// Async thunks for API calls
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/category/all');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (categoryData: Omit<CategoryDTO, 'id'>, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/category/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) {
                throw new Error('Failed to create category');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, ...categoryData }: CategoryDTO, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/category/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) {
                throw new Error('Failed to update category');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/category/delete/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete category');
            }
            return id;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

// Categories slice
const viewCategorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedCategory: (state, action: PayloadAction<CategoryDTO | null>) => {
            state.selectedCategory = action.payload;
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
        resetCategoriesState: (state) => {
            state.categories = [];
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

        // Create Category
        builder
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Category
        builder
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(cat => cat.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
                // Update selected category if it's the same one being updated
                if (state.selectedCategory && state.selectedCategory.id === action.payload.id) {
                    state.selectedCategory = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Category
        builder
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter(cat => cat.id !== action.payload);
                // Clear selected category if it was the deleted one
                if (state.selectedCategory && state.selectedCategory.id === action.payload) {
                    state.selectedCategory = null;
                }
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    setSelectedCategory,
    clearSelectedCategory,
    resetCategoriesState
} = viewCategorySlice.actions;

export default viewCategorySlice.reducer;