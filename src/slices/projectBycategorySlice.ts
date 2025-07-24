import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProjectsByCategory = createAsyncThunk(
    'project/getProjectByCategory',
    async (category: string) => {
        const response = await axios.get(`/api/project/category/${category}`);

        return response.data;
    }
);

interface Project {
    id: string;
    title: string;
    description: string;
    materials: string;
    steps: string;
    image: string;
    createdAt: string;
    category: string;
    author: string;
    uploadedUserEmail: string;
}

interface CategoryProjectState {
    projects: Project[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryProjectState = {
    projects: [],
    loading: false,
    error: null,
};

const projectByCategorySlice = createSlice({
    name: 'projectsByCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectsByCategory.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjectsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Something went wrong';
            });
    },
});

export default projectByCategorySlice.reducer;