import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {backendApi} from "../api.ts";

// Define Category interface
interface Category {
    category?: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    isDropdownOpen: boolean;
    selectedCategory: Category | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
    isDropdownOpen: false,
    selectedCategory: null
};

// Async thunk for getting all categories
export const getAllCategories = createAsyncThunk(
    'categories/getAllCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await backendApi.get<Category[]>('/category/all');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch categories';
            return rejectWithValue(errorMessage);
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        toggleDropdown: (state) => {
            state.isDropdownOpen = !state.isDropdownOpen;
        },
        selectCategory: (state, action: PayloadAction<Category>) => {
            state.selectedCategory = action.payload;
            state.isDropdownOpen = false;
            console.log('Selected category:', action.payload);
        },
        closeDropdown: (state) => {
            state.isDropdownOpen = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.categories = action.payload;
                state.error = null;
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.error('Error fetching categories:', action.payload);
            });
    }
});

export const { toggleDropdown, selectCategory, closeDropdown, clearError } = categorySlice.actions;
export default categorySlice.reducer;